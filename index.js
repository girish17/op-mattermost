'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios');
const qs = require('querystring');

let hoursLog = 0;
let selProject = require('./UI_Element_json/selectProject.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

const server = app.listen(3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/', (req, res) => {
    res.send("Hello there! Good to see you here :) We don't know what to show here yet!").status(200);
});

app.post('/', (req, res) => {
  const { text, channel_id, user_id, command } = req.body;
  console.log("Request Body to / ", JSON.stringify(req.body, null, 2));
  if (text != undefined) {
    hoursLog = parseFloat(text);
  }
  if((isNaN(hoursLog) || hoursLog < 0.0 || hoursLog > 99.9) && command == "/logtime") {
    res.send("*0.1 hour to 99.9 hours works well here :) Let's try again...* \n `/logtime [hours]`").status(400);
  }
  else {
    showSelProject(res, channel_id, user_id);
  }
});

function showSelProject(res, channel_id, user_id) {
  let selectProjectMsg = {
    token: process.env.MATTERMOST_ACCESS_TOKEN,
    channel_id: channel_id,
    message: selProject.text,
    props: JSON.stringify(selProject.attachments)
  };

  axios.post('https://localhost:8065/api/v4/actions/dialogs/open',
    qs.stringify(selectProjectMsg)).then((result) => {
      console.log('select project message posted: %o', result);
      if (result.data.ok) {
        console.log("setting global var msg_ts for use in show success/fail msg");
        msg_ts = result.data.ts;
        res.send().status(201);
        return;
      }
      else {
        console.log('select project post failed!');
        res.send().status(400);
        return;
      }
    }).catch((err) => {
      console.log('message post failed: %o', err);
      res.type("application/json").send(JSON.stringify({
        "response_type": "ephemeral",
        "replace_original": false,
        "text": "Sorry, that didn't work. Please try again."
      })).status(500);
    });
}