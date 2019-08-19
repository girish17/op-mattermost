'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios');
const qs = require('querystring');

const opURL = 'http://localhost:8080/api/v3';
const mmURL = 'http://localhost:8065/';
const intURL = 'http://b96c8265.ngrok.io';

let hoursLog = 0;

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
    showSelProject(req, res);
  }
});

app.post('/projSel', (req, res) => {
  console.log("Project dialog submit request: ", req);
  loadTimeLogDlg(req, res);
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
  axios.post(mmURL + 'posts',
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
  axios.post(mmURL + 'posts',
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

function showSelProject(req, res) {
  console.log("Request from mattermost: ", req);
  console.log("Response from mattermost: ", res);
  axios({
    url: '/projects',
    method: 'get',
    baseURL: opURL,
    auth: {
      username: 'apikey',
      password: process.env.OP_ACCESS_TOKEN
    }
  }).then((response) => {
    console.log("Projects obtained from OP: %o", response);
    var optArray = [];
    response.data._embedded.elements.forEach(element => {
      optArray.push({
        "text": element.name,
        "value": "opt" + element.id
      });
    });

    var optJSON = JSON.stringify({
      "trigger_id": req.body.trigger_id,
      "url": intURL + '/projSel',
      "dialog": {
        "callback_id": "project_selection",
        "title": "Select project",
        "elements": [{
          "display_name": "Project Selector",
          "name": "options",
          "type": "select",
          "options": optArray
        }],
        "submit_label": "Confirm project"
      }
    });

    console.log("optArray for projects", optJSON);
    axios.post(mmURL + 'api/v4/actions/dialogs/open', optJSON).then(response => {
      console.log("Response from projects dialog: ", response);
      res.send().status(200);
      return;
    }).catch(error => {
      console.log("Error while creating projects dialog", error);
      res.send("**Dialog creation failed**").status(500);
    })
  }).catch(error => {
    console.log("Error in getting projects from OP", error);
    res.send("**Open Project server down!");
  });
}

function loadTimeLogDlg(req, res) {
  if (req.body.callback_id === "project_selection") {
    let optArray = [];
    axios({
      url: '/work_packages',
      method: 'get',
      baseURL: opURL,
      params: {
        id: req.body.submission.options.slice(-1)
      },
      auth: {
        username: 'apikey',
        password: process.env.OP_ACCESS_TOKEN
      }
    }).then((response) => {
      console.log("WP obtained from OP: %o", response);
      response.data._embedded.elements.forEach(element => {
          optArray.push({
            "text": element.subject,
            "value": "opt"+element.id
          });
      });
/* 
      var dlgJSON = JSON.stringify({
        "trigger_id": req.body.trigger_id,
        "url": intURL + '/logTime',
        "dialog": {
          "callback_id": "logTimeDlg",
          "title": "Log time for work package",
          "elements": [{
            "display_name": "Work package selector",
            "name": "options",
            "type": "select",
            "options": optArray
          }],
          "submit_label": "Log Time"
        }
      }); */

      var wpMsgMenu = {
        "attachments": [
          {
            "pretext": "Work Package Selector",
            "text": "Select a work package",
            "actions": [
              {
                "name": "Select an option...",
                "integration": {
                  "url": intURL+'/logTime',
                  "context": {
                    "action": "showTimeLogDlg"
                  }
                },
                "type": "select",
                "options": optArray
              }
            ]
          }
        ]
      }

      console.log("optArray for wp", wpMsgMenu);
      axios.post(mmURL + '/posts', {
        "channel_id": req.body.channel_id,
        "message": "Select a work package",
        "props": wpMsgMenu
      }).then(response => {
        console.log("Response from log time dialog: ", response);
        res.send().status(200);
        return;
      }).catch(error => {
        console.log("Error while creating log time dialog", error);
        res.send("**Dialog creation failed**").status(500);
      })

      res.send().status(200);
      return;
    }, (reason) => {
      console.log("Request failed for /work_packages: %o", reason);
      showFailMsg(req, res);
    });
  }
}