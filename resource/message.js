/*
Copyright (C) 2020, Girish M
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
