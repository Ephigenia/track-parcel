
'use strict';

const fetch = require('node-fetch').default;

const pkg = require('../../../package.json');
const log = require('debug')(pkg.name).extend('dhl');

function transform(data) {
  return (data.shipments || []).map(transformShipment);
}

function transformShipment(shipment) {
  const { events, details, origin, destination, status, id, service } = shipment;

  // TODO const weight = details.weight.value}${details.weight.unitText;
  const from = origin.address.countryCode || origin.address.addressLocality;
  const to = destination.address.countryCode || destination.address.addressLocality;
  const label = (details.product || {}).productName;
  return {
    destination: to,
    events: events.map(transformEvent),
    label,
    origin: from,
    service: service,
    trackingNumber: id,
  };
}

function transformEvent(event) {
  const status = event.statusCode;
  const where = ((event.location || {}).address || {}).addressLocality;
  return {
    when: new Date(event.timestamp),
    where,
    label: event.description || event.status,
    status,
  };
}

async function track(trackingNumber, language = 'en', requesterCountryCode = 'US') {
  const url = new URL('https://www.dhl.com/utapi');
  url.searchParams.append('trackingNumber', trackingNumber);
  url.searchParams.append('language', language);
  url.searchParams.append('requesterCountryCode', requesterCountryCode);
  
  const opts = {
    headers: {
      'Host': url.host,
      'User-Agent': [pkg.name, pkg.version].join('/'),
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
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
}