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
const sinon = require('sinon');
const dotenv = require('dotenv');
const message = require('../resource/message');
const axios = require('axios');

dotenv.config();

describe('Test messages in op-mattermost', () => {
    before(() => {
        let msg = 'Show success message post succeeded!';
        let server = sinon.fakeServer.create();
        server.respondWith("POST",
            process.env.mmURL,
            [200, { "Content-Type": "text/html" }, msg]
        )
    });

    it('should show success message', () => {
        let Message = new message();
        let req = {
            body: {
                user_id: 'ac956usm4pyb5kgxc651u8m1ic',
                channel_id: '7a9gsdm6ep85xyz313yi83eaxr'
            }
        }
        let res = {

        }
        Message.showSuccessMsg(req, res, axios, msg);
    });
})