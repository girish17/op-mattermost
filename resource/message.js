class Message {

    constructor(mmURL) {
        this.config = {
            headers: { 'Authorization': 'Bearer ' + process.env.MATTERMOST_ACCESS_TOKEN }
        },
            this.mmURL = mmURL;
    }

    showSuccessMsg(req, res, axios, msg) {
        let successMsg = {
            "channel_id": req.body.channel_id,
            "message": msg
        };
        axios.post(this.mmURL + 'posts',
            successMsg, this.config).then((result) => {
                console.log('message posted: %o', result);
                if (result.data.status === "OK") {
                    res.send().status(200);
                    return;
                }
                else {
                    console.log('Show success message post succeeded!');
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
            "channel_id": req.body.channel_id,
            "message": msg
        };
        axios.post(this.mmURL + 'posts',
            failMsg, this.config).then((result) => {
                console.log('message posted: %o', result);
                if (result.data.status === "OK") {
                    res.send().status(200);
                    return;
                }
                else {
                    console.log('Show fail message succeeded!');
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