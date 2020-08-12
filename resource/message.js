/*
    op-mattermost provides an integration for Mattermost and Open Project.
    Copyright (C) 2020  Girish M

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
                console.log('message posted: %o', result);
                if (result.data) {
                    res.send('Show success message post succeeded!').status(200);
                    return;
                }
                else {
                    console.log('Show success message post failed!');
                    res.send().status(400);
                    return;
                }
            }).catch((err) => {
                console.log('Show success message post failed: %o', err);
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
                console.log('message posted: %o', result);
                if (result.data) {
                    res.send('Show fail message post succeeded!').status(200);
                    return;
                }
                else {
                    console.log('Show fail message failed!');
                    res.send().status(400);
                    return;
                }
            }).catch((err) => {
                console.log('Show fail message post failed: %o', err);
                res.send().status(500);
            });
    }
}

module.exports = Message;
