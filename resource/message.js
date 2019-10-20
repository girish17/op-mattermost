class Message{
  
  showSuccessMsg(req, res, axios) {
    let successMsg = {
      "channel": req.body.channel_id,
      "message": "**You are awesome :sunglasses: **",
      "props": {
        "attachments": [{
          "text": "Time log saved succesfully",
          "color": "#3AA3E3"
        }]
      }
    };
    axios.post(mmURL + 'posts',
      successMsg).then((result) => {
        console.log('message posted: %o', result);
        if (result.data.status === "OK") {
          res.send().status(200);
          return;
        }
        else {
          console.log('Show success message post failed!');
          res.send().status(400);
          return;
        }
      }).catch((err) => {
        console.log('Show success message post failed: %o', err);
        res.type("application/json").send(JSON.stringify({
          "response_type": "ephemeral",
          "replace_original": false,
          "text": "Sorry, that didn't work. Please try again."
        })).status(500);
      });
  }

  showFailMsg(req, res, axios) {
    let failMsg = {
      "channel": req.body.channel_id,
      "message": "**That didn't work :pensive: Seems like OP server is down!**",
      "props": {
        "attachments": [{
          "text": "Time log saved succesfully",
          "color": "#3AA3E3"
        }]
      }
    };
    axios.post(mmURL + 'posts',
      failMsg).then((result) => {
        console.log('message posted: %o', result);
        if (result.data.status === "OK") {
          res.send().status(200);
          return;
        }
        else {
          console.log('Show fail message failed!');
          res.send().status(400);
          return;
        }
      }).catch((err) => {
        console.log('Show fail message post failed: %o', err);
        res.type("application/json").send(JSON.stringify({
          "response_type": "ephemeral",
          "replace_original": false,
          "text": "Sorry, that didn't work. Please try again."
        })).status(500);
      });
  }
};

module.exports = Message;