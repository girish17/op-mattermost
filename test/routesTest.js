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