/*
    op-mattermost provides an integration for Mattermost and Open Project.
    Copyright (C) 2020 to present , Girish M

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>

*/

const chai = require('chai');
let assert = chai.assert;

describe('Tests for util class', () => {

    const Util = require('../resource/util');
    let util = new Util();

    describe('Tests for checkHours function', () => {

        it('true when billable hours is less than logged hours', () => {
            assert.equal(util.checkHours(3, 0.25), true);
        });

        it('false when billable hours is greater than logged hours', () => {
            assert.equal(util.checkHours(0.25, 3), false);
        });

        it('false when invalid hours are passed', () => {
            assert.equal(util.checkHours('abc123', 0.25), false);
        });

        it('false when billable hours is greater than 99.9', () => {
            assert.equal(util.checkHours(12.5, 100), false);
        });

        it('true when both billable and logged hours are zero', () => {
            assert.equal(util.checkHours(0, 0), true);
        });

    });

    describe('Tests for checkDate function', () => {

        let moment = require('moment');

        it('true when date within last one year i.e. 365 days', () => {
            let dateWithinOneYear = moment().subtract(365, 'day').format('YYYY-MM-DD').toString();
            assert.equal(util.checkDate(moment, dateWithinOneYear), true);
        });

        it('false when date greater is than a day', () => {
            let dateGreaterThanDay = moment().add(2, 'days').format('YYYY-MM-DD').toString();
            assert.equal(util.checkDate(moment, dateGreaterThanDay), false);
        });

        it('false when date diff greater than one year', () => {
            let diffGreaterThanOneYear = moment().subtract(2, 'years').format('YYYY-MM-DD').toString();
            assert.equal(util.checkDate(moment, diffGreaterThanOneYear), false);
        });

        it('true when date is today', () => {
            let today = moment().format('YYYY-MM-DD').toString();
            assert.equal(util.checkDate(moment, today), true);
        });

    });

});