'use strict';

const commander = require('commander');
const debug = require('debug');

const pkg = require('../package.json');
const log = debug(pkg.name);
const services = require('./service');
const output = require('./lib/output');

const program = commander.program
  .version(pkg.version)
  .description(`Parcel tracking for DHL, DHL Express`, {
    service: 'name of shipping service, f.e. dhl',
    code: 'tracking code',
    label: 'optional label which is shown next to the tracking number'
  })
  .arguments('<service> <code> [label]')
  .action((serviceName, code, label = null) => {
    let service;
    try {
      service = services.get(serviceName);
    } catch (err) {
      console.error(process.env.NODE_ENV === 'development' ? err : err.message);
      process.exit(2);
    }
    log('requesting information from %s for tracking-code %s', service, code);
    return service.track(code)
      .then(data => {
        log(JSON.stringify(data, null, 2));
        const parcels = service.transform(data);
        if (label) parcels.forEach(parcel => parcel.label = label);
        parcels.forEach(output.showNormalizedParcel);
        process.exit(0);
      })
      .catch(err => {
        console.error(err.message || err);
        process.exit(1);
      });
  });

program.parse(process.argv);