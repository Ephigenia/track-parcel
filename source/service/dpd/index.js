'use strict';

const fetch = require('node-fetch').default;

const pkg = require('../../../package.json');
const log = require('debug')(pkg.name).extend('ups');

function transform(data) {
  const parcelLifeCycleData = [data.parcellifecycleResponse.parcelLifeCycleData];
  return parcelLifeCycleData.map(transformShipment);
}

/**
 * @param {object} shipment
 * @returns {object} resulting parcel
 */
function transformShipment(shipment) {
  const { shipmentInfo, scanInfo } = shipment;
  const trackingNumber = shipmentInfo.parcelLabelNumber;
  const to = shipmentInfo.receiverCountryIsoCode;
  return {
    destination: to,
    events: (scanInfo.scan || []).map(transformEvent),
    label: null,
    origin: null,
    url: `https://tracking.dpd.de/status/de_DE/parcel/${trackingNumber}`,
    service: 'DPD',
    trackingNumber,
  };
}

function transformEvent(event) {
  const when = new Date(event.date)

  const { location, country } = event.scanData;
  const where = [location, country].filter(v => v).join(' ');
  const label = event.scanDescription.content.join(' ');

  // TODO find out how to detect delivered status, maybe
  // scanDescription.label=5 = in Transit
  // scanDescription.label=18 = order information has been trasnmitted to dpd
  const status = label;

  return {
    when,
    where,
    label,
    status,
  };
}

function normalizeTrackingNumber(trackingNumber) {
  return String(trackingNumber || '').replace(/[^\d]/g, '');
}

async function track(trackingNumber) {
  const url = new URL(`https://tracking.dpd.de/rest/plc/en_US/${normalizeTrackingNumber(trackingNumber)}`);
  const opts = {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Host': 'tracking.dpd.de',
      'Pragma': 'no-cache',
      'User-Agent': [pkg.name, pkg.version].join('/'),
    },
    method: 'GET',
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
    });
}

exports = module.exports = {
  track,
  transform,
  normalizeTrackingNumber,
};
