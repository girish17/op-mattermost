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

require('./message');

module.exports = (app, axios) => {

  const opURL = process.env.OP_URL;
  const mmURL = process.env.MM_URL;
  const intURL = process.env.INT_URL;

  const UIActions = require('./uiActions');
  const uiActions = new UIActions(opURL, mmURL, intURL);

  app.get('/', (req, res) => {
    res.send("Hello there! Good to see you here :) We don't know what to show here yet!").status(200);
  });

  app.post('/', (req, res) => {
    const {command, token} = req.body;
    if(token === process.env.MATTERMOST_SLASH_TOKEN) {
      console.log("Request Body to / ", JSON.stringify(req.body, null, 2));
      if(command === "/op") {
        uiActions.showMenuBtn(req, res, axios);
      }
      else {
        res.send("*I don't understand ", command, ". Let's try again...* \n `/op`").status(500);
      }
    }
    else {
      res.send("Invalid slash token").status(400);
    }
  });

  app.post('/createTimeLog', (req, res) => {
    console.log("Create time log request: ", req);
    uiActions.showSelProject(req, res, axios, "showSelWP");
  });

  app.post('/projSel', (req, res) => {
    console.log("Project submit request: ", req);
    switch (req.body.context.action) {
      case 'showSelWP':
        uiActions.showSelWP(req, res, axios, "showTimeLogDlg");
        break;
      case 'createWP':
        uiActions.createWP(req, res, axios);
        break;
      default:
        res.send("Invalid action type").status(400);
        break;
    }
  });

  app.post('/wpSel', (req, res) => {
    console.log("Work package submit request: ", req);
    switch (req.body.context.action) {
      case 'showTimeLogDlg':
        uiActions.loadTimeLogDlg(req, res, axios);
        break;
      case 'cnfDelWP':
        uiActions.showCnfDelWP(req, res, axios);
        break;
      default:
        res.send("Invalid action type").status(400);
        break;  
    }
  });

  app.post('/logTime', (req, res) => {
    console.log("Time log submit request: ", req);
    uiActions.handleSubmission(req, res, axios);
  });

  app.get('/getLogo', (req, res) => {
    console.log("Logo image request: ", req);
    res.sendFile(__dirname + '/op_logo.png');
  });

  app.post('/getTimeLog', (req, res) => {
    console.log("Request to getTimeLog: ", req);
    uiActions.getTimeLog(req, res, axios);
  });

  app.post('/delTimeLog', (req, res) => {
    console.log("Request to delTimeLog: ", req);
    switch (req.body.context.action) {
      case "delSelTimeLog":
        uiActions.delTimeLog(req, res, axios);
        break;
      case "cnfDelTimeLog":
        uiActions.cnfDelTimeLog(req, res);
        break;
      default:
        uiActions.showTimeLogSel(req, res, axios);
    }
  });

  app.post('/createWP', (req, res) => {
    console.log("Request to createWP: ", req);
    uiActions.showSelProject(req, res, axios, "createWP");
  });

  app.post('/saveWP', (req, res) => {
    console.log("Work package save request: ", req);
    uiActions.saveWP(req, res, axios);
  })

  app.post('/delWP', (req, res) => {
    console.log("Work package delete request: ", req);
    switch (req.body.context.action) {
      case 'delWP':
        uiActions.delWP(req, res, axios);
        break;
      default:
        uiActions.showDelWPSel(req, res, axios);
        break;
    }
  });

  app.post('/bye', (req, res) => {
    console.log("Request to showBye handler: ", req);
    let byeMsg = JSON.stringify({
      "update": {
        "message": ":wave:",
        "props": {}
      },
    });
    res.type('application/json').send(byeMsg).status(200);
  });
}