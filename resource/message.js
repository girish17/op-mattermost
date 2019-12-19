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
class Message {

    constructor(mmURL) {
        this.config = {
            headers: { 'Authorization': 'Bearer ' + process.env.MATTERMOST_ACCESS_TOKEN }
        };
        this.mmURL = mmURL;
    }

    showSuccessMsg(req, res, axios, msg) {
        let successMsg = {
            "user_id": req.body.user_id,
            "post": {
                "channel_id": req.body.channel_id,
                "message": msg
            }
        };
        axios.post(this.mmURL + 'posts/ephemeral',
            successMsg, this.config).then((result) => {
                //('message posted: %o', result);
                if (result.data.status === "OK") {
                    res.send('Show success message post succeeded!').status(200);
                    return;
                }
                else {
                    //('Show success message post failed!');
                    res.send().status(400);
                    return;
                }
            }).catch((err) => {
                //('Show success message post failed: %o', err);
                res.send().status(500);
            });
    }

    showFailMsg(req, res, axios, msg) {
        let failMsg = {
            "user_id": req.body.user_id,
            "post": {
                "channel_id": req.body.channel_id,
                "message": msg
            }
        };
        axios.post(this.mmURL + 'posts/ephemeral',
            failMsg, this.config).then((result) => {
                //('message posted: %o', result);
                if (result.data.status === "OK") {
                    res.send('Show fail message post succeeded!').status(200);
                    return;
                }
                else {
                    //('Show fail message failed!');
                    res.send().status(400);
                    return;
                }
            }).catch((err) => {
                //('Show fail message post failed: %o', err);
                res.send().status(500);
            });
    }
}

module.exports = Message;