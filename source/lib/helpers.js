'use strict';

function isSameDay(date1, date2) {
  return date1.toISOString().substr(0, 10) === date2.toISOString().substr(0, 10);
}

function isToday(date) {
  const now = new Date();
  return isSameDay(now, new Date(date));
}

function dateFormat(timestamp) {
  const date = new Date(timestamp);
  return [
    date.toJSON().substr(0, 10),
    date.toJSON().substr(11, 5)
  ].join(' ');
}

module.exports = {
  dateFormat,
  isSameDay,
  isToday,
};
