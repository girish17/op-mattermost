const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const moment = require('moment');

// Mock environment variables
process.env.OP_URL = 'http://mock-op-url/';
process.env.MM_URL = 'http://mock-mm-url/';
process.env.INT_URL = 'http://mock-int-url/';
process.env.MATTERMOST_SLASH_TOKEN = 'mock-token';
process.env.OP_ACCESS_TOKEN = 'mock-op-token';

describe('Integration Tests', () => {
    let app;
    let axiosStub;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // Mock axios
        axiosStub = sinon.stub();
        axiosStub.post = sinon.stub();
        axiosStub.get = sinon.stub();
        
        require('../resource/routes')(app, axiosStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('GET / should return health check message', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .expect((res) => {
                expect(res.text).to.include("Hello there! Good to see you here");
            })
            .end(done);
    });

    it('POST / should return 400 for invalid token', (done) => {
        request(app)
            .post('/')
            .send({ token: 'invalid-token' })
            .expect(400)
            .expect('Invalid slash token', done);
    });

    it('POST / should handle /op lt command', (done) => {
        // Mock axios response for showSelProject
        axiosStub.resolves({
            data: {
                _embedded: {
                    elements: [
                        { name: 'Project 1', id: 1 },
                        { name: 'Project 2', id: 2 }
                    ]
                }
            }
        });

        request(app)
            .post('/')
            .send({ 
                token: 'mock-token',
                command: '/op',
                text: 'lt'
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(axiosStub.calledOnce).to.be.true;
                expect(axiosStub.firstCall.args[0].url).to.include('projects');
                done();
            });
    });

    it('POST /projSel should handle showSelWP action', (done) => {
        // Mock axios response for showSelWP
        axiosStub.resolves({
            data: {
                _embedded: {
                    elements: [
                        { subject: 'WP 1', id: 1 },
                        { subject: 'WP 2', id: 2 }
                    ]
                }
            }
        });

        request(app)
            .post('/projSel')
            .send({
                context: {
                    action: 'showSelWP',
                    selected_option: 'opt1' // projectId = 1
                }
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(axiosStub.calledOnce).to.be.true;
                expect(axiosStub.firstCall.args[0].url).to.include('projects/1/work_packages');
                done();
            });
    });

    it('POST /logTime should handle time logging submission', (done) => {
        // Mock axios response for handleSubmission
        axiosStub.resolves({
            data: {
                id: 123
            }
        });
        
        // Mock axios.post response for showMsg (Mattermost)
        axiosStub.post.resolves({
            data: true
        });

        const today = moment().format('YYYY-MM-DD');

        request(app)
            .post('/logTime')
            .send({
                submission: {
                    spent_on: today,
                    comments: 'Test comment',
                    spent_hours: '1',
                    billable_hours: '1',
                    activity: 'opt1'
                }
            })
            .expect(200) // uiActions.message.showMsg sends a response, likely 200
            .end((err, res) => {
                if (err) return done(err);
                expect(axiosStub.calledOnce).to.be.true;
                expect(axiosStub.firstCall.args[0].url).to.equal('time_entries');
                expect(axiosStub.firstCall.args[0].method).to.equal('post');
                
                expect(axiosStub.post.calledOnce).to.be.true;
                expect(axiosStub.post.firstCall.args[0]).to.include('posts/ephemeral');
                
                done();
            });
    });

    it('GET /getLogo should return the logo image', (done) => {
        request(app)
            .get('/getLogo')
            .expect(200)
            .expect('Content-Type', /image\/png/) // Assuming it's a png
            .end(done);
    });
});
