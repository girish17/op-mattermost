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

class Message {

    constructor(mmURL) {
        this.config = {
            headers: { 'Authorization': 'Bearer ' + process.env.MATTERMOST_BOT_TOKEN }
        };
        this.mmURL = mmURL;
    }

    showMsg(req, res, axios, msg) {
        this.channel_id = req.body.channel_id;
        this.user_id = req.body.user_id;
        this.msgObj = {
            "user_id": this.user_id,
            "post": {
                "channel_id": this.channel_id,
                "message": msg
            }
        };
        axios.post(this.mmURL + 'posts/ephemeral',
            this.msgObj, this.config).then((result) => {
                if (result.data) {
                    res.status(200).send('Show message post succeeded!');
                }
                else {
                    console.log('Show message post failed!');
                    res.status(400).send();
                }
            }).catch((err) => {
                console.log('Show message post failed: %o', err);
                res.status(500).send();
            });
    }

    showNotification(res, axios, msg) {
        console.log("Creating notification for ChannelID: ", this.channel_id);
        if (this.msgObj && this.msgObj.post) {
            this.msgObj.post.message = msg;
            console.log("Notification post message: ", this.msgObj);
            axios.post(this.mmURL + 'posts/ephemeral',
                this.msgObj, this.config).then((result) => {
                    if (result.data) {
                        res.status(200).send('Show notification post succeeded!');
                    }
                    else {
                        console.log('Show notification post failed!');
                        res.status(400).send();
                    }
                }).catch((err) => {
                    console.log('Show notification post failed! %o', err);
                    res.status(500).send();
                });
        } else {
             console.log('msgObj not initialized');
             res.status(500).send('Internal Error');
        }
    }
}
module.exports = Message;
