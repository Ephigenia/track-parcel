'use strict';

const chalk = require('ansi-colors');
const terminalLink = require('terminal-link');

const { isToday, dateFormat } = require('./helpers');

function showNormalizedParcel(parcel) {
  const {
    destination,
    events = [],
    label,
    origin,
    service,
    trackingNumber,
    weight = {},
    url,
  } = parcel;

  const parts = {
    shipment: chalk.bold.yellow(trackingNumber),
    weight: [weight.value, weight.unit].filter(v => v).join(''),
    label: chalk.bold.white(label),
    from: chalk.bold(origin),
    to: chalk.bold(destination),
    service: chalk.bold(service),
    url: terminalLink(url),
  };
  Object.entries(parts).forEach(([label, value]) => {
    if (value.length !== 0) {
      const paddedLabel = label.padStart(19, ' ');
      console.log(`${paddedLabel}: ${value}`);
    }
  });
  console.log('');

  events
    // sort by date descending
    .sort((a, b) => b.when - a.when)
    .forEach(showNormalizedParcelEvent);
}

/**
 * @param {object} event
 * @param {Date} event.when - Date
 * @param {string} event.label - label
 * @param {string} event.location - location
 * @param {string} event.status - status
 */
function showNormalizedParcelEvent(event) {
  const { when, where, label, status } = event;
  const dateColor = isToday(when) ? chalk.white : chalk.grey;
  let statusColor = chalk.white;
  if (/delivered/i.test(String(status))) {
    statusColor = chalk.green;
  }
  if (/error/i.test(String(status))) {
    statusColor = chalk.red;
  }
  const parts = [
    dateColor(dateFormat(when)),
    chalk.bold(where),
    statusColor(label)
  ].filter(v => v);
  console.log(parts.join(' '));
  return;
}

module.exports = {
  showNormalizedParcel,
  showNormalizedParcelEvent,
};
