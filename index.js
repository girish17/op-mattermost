'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios');
const qs = require('querystring');

let hoursLog = 0;
var msg_ts = '';
var project_sel = require('./UI_Element_json/selectProject.json');

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
  const { text, channel_id, user_id, command, trigger_id } = req.body;
  console.log("Request Body to / ", JSON.stringify(req.body, null, 2));
  if (text != undefined) {
    hoursLog = parseFloat(text);
  }
  if ((isNaN(hoursLog) || hoursLog < 0.0 || hoursLog > 99.9) && command == "/logtime") {
    res.send("*0.1 hour to 99.9 hours works well here :) Let's try again...* \n `/logtime [hours]`").status(400);
  }
  else {
    showSelProject(req, res, channel_id);
  }
});

app.post('/projSel', (req, res) => {
   res.send("**Work under progress...**").status(202);
});

function showSuccessMsg(req, res) {
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
  axios.post('https://localhost:8065/posts',
    qs.stringify(successMsg)).then((result) => {
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

function showFailMsg(req, res) {
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
  axios.post('https://localhost:8065/posts',
    qs.stringify(failMsg)).then((result) => {
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

function showSelProject(req, res, channel_id) {
  console.log("Response from mattermost: ", res);
  axios({
    url: '/projects',
    method: 'get',
    baseURL: 'http://localhost:8080/api/v3',
    auth: {
      username: 'apikey',
      password: process.env.OP_ACCESS_TOKEN
    }
  }).then((response) => {
    console.log("Projects obtained from OP: %o", response);
    let optArray = [];
    response.data._embedded.elements.forEach(element => {
      optArray.push({
        "text": element.name,
        "value": element.id
      });
    });
    console.log("optArray for projects", optArray);
    project_sel.attachments[0].actions[0].options.push(optArray);
    // res.type("application/json").send(JSON.stringify(project_sel)).status(200);
    axios.post('http://localhost:8065/api/v4/actions/dialogs/open',
      {
        "trigger_id": req.body.trigger_id,
        "url": "http://localhost:8065",
        "dialog": {
          "callback_id": "project_selection",
          "title": "Select project",
          "elements": [project_sel],
          "submit_label": "Confirm project",
          "notify_on_cancel": false,
          "state": "submitted"
        }
      }
    ).then((result) => {

    })
  });
}