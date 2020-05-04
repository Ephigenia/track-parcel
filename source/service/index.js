'use strict';

const dhl = require('./dhl');
const ups = require('./ups');
const dpd = require('./dpd');

exports = module.exports = {
  get: (name) => {
    switch(String(name).toLowerCase()) {
      case 'dhl':
        return dhl;
      case 'dpd':
        return dpd;
      case 'ups':
        return ups;
      default:
        throw new Error(
          `Unable to find service library "${String(name)}"`
        );
    }
  }
}