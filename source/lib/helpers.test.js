'use strict';

const helpers = require('./helpers');
const expect = require('chai').expect;

describe('test', () => {
  describe('dateFormat', () => {
    it('returns a english formatted date string by default', () => {
      const date = new Date('2020-12-24T10:00:00.000Z');
      expect(helpers.dateFormat(date)).to.match(/^2020-12-24 10:00/);
    });
    it('uses the locale to format the date', () => {
      const date = new Date('2020-12-24T10:00:00.000Z');
      expect(helpers.dateFormat(date, 'de')).to.match(/^2020-12-24 10:00/);
    });
  }); // #dateFormat

  describe('#isToday', () => {
    it('returns true when the given date is "today"', () => {
      expect(helpers.isToday(new Date())).to.equal(true);
    });
    it('returns true when the given date is in the past', () => {
      expect(helpers.isToday(new Date(2019, 1, 2))).to.equal(false);
    });
  }); // #isToday

  describe('isSameDay', () => {
    it('throws an exception when second date is missing', () => {
      expect(() => helpers.isSameDay(new Date())).to.throw(Error);
    });
    it('returns true for "now"', () => {
      expect(helpers.isSameDay(new Date(), new Date())).to.equal(true);
    });
  }); // #isSameDay
}); // test
