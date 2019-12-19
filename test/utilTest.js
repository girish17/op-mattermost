/*
 * Created on Thu Dec 19 2019
 *
 * Copyright 2019 Girish M
 *Licensed under the Apache License, Version 2.0 (the "License");
 *you may not use this file except in compliance with the License.
 *You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *Unless required by applicable law or agreed to in writing, software
 *distributed under the License is distributed on an "AS IS" BASIS,
 *WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *See the License for the specific language governing permissions and
 *limitations under the License.
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

        it('true when date within last one year', () => {
            let dateWithinOneYear = moment().subtract(1, 'year').format('YYYY-MM-DD').toString();
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