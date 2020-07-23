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
let supertest = require('supertest');
let should = require("should");
const dotenv = require('dotenv');
dotenv.config();
let server = supertest.agent(process.env.INT_URL);

describe("Test GET /", () => {
    it("should return a message", (done) => {
        let msg = "Hello there! Good to see you here :) We don't know what to show here yet!";
        server.get("")
              .expect("Content-type", /text/)
              .expect(200)
              .end((err, res) => {
                    res.status.should.equal(200);
                    res.text.should.equal(msg);
                    done();
              });
    });
});

describe("Test POST / without token", () => {
    it("should return invalid request", (done) => {
        let msg = "Invalid request";
        server.post("")
              .send()
              .expect("Content-type", /text/)
              .expect(400)
              .end((err, res) => {
                    res.text.should.equal(msg);
                    done();
              });
    });
});

describe("Test POST / with token", () => {
    it("should return appropriate usage help", (done) => {
        let msg = "*0.1 hour to 99.9 hours works well here :) Let's try again...* \n `/logtime [hours]`";
        server.post("")
              .send({text: '100', token: process.env.MATTERMOST_SLASH_TOKEN})
              .expect("Content-type", /text/)
              .expect(500)
              .end((err, res) => {
                    res.text.should.equal(msg);
                    done();
              });
    });
});
