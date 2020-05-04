'use strict';

const fetch = require('node-fetch').default;

const pkg = require('../../../package.json');
const log = require('debug')(pkg.name).extend('ups');

function transform(data) {
  return (data.trackDetails || []).map(transformShipment);
}

function transformShipment(shipment) {
  // packageStatus = "Delivered"
  const {
    shipToAddress,
    additionalInformation,
    shipmentProgressActivities,
    trackingNumber,
  } = shipment;
  const to = shipToAddress.city + ' ' + shipToAddress.country;
  const weight = {};
  if (additionalInformation.weight) {
    weight.value = additionalInformation.weight;
    weight.unit = additionalInformation.weightUnit;
  }
  return {
    destination: to,
    events: (shipmentProgressActivities || []).map(transformEvent),
    label: null,
    origin: null,
    service: 'ups',
    trackingNumber,
    weight,
  };
}

function transformEvent(event) {
  // activityScan = DELIVERED, Out for Delivery, Arrival Scan, Departure Scan, Origin Scan, 
  const { activityScan, date, time, location } = event;
  return {
    when: new Date([date, time].join(' ')),
    where: location,
    label: activityScan,
    status: activityScan,
  };
}

async function track(trackingNumber) {
  const url = new URL('https://wwwapps.ups.com/track/api/Track/GetStatus');
  url.searchParams.append('loc', 'en_KR');

  const body = JSON.stringify({
    Locale: 'en_KR',
    Requester: 'UPSHome',
    TrackingNumber: [trackingNumber],
  })
  const opts = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': [pkg.name, pkg.version].join('/'),
    },
    method: 'POST',
    body,
  };

  log(opts.method, url.toString(), opts);  

  return fetch(url.toString(), opts)
    .then(response => {
      log(
        'response %s %s "%s"',
        response.statusText,
        response.status,
        response.headers.get('content-type')
        );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(data => {
      // in case of invalid codes ups returns a HTTP Status 200 and 
      // the error as json in the response
      if (data.statusCode !== '200') {
        throw new Error(data.statusText);
      }
      return data;
    });
}

exports = module.exports = {
  track,
  transform,
}