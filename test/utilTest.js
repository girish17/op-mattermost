/*
Copyright (C) Girish M , 2020
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>

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
