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

module.exports = (app, axios) => {

  let hoursLog = 0;

  const opURL = process.env.OP_URL;
  const mmURL = process.env.MM_URL;
  const intURL = process.env.INT_URL;

  const UIActions = require('./uiActions');
  const uiActions = new UIActions(opURL, mmURL, intURL);

  app.get('/', (req, res) => {
    res.send("Hello there! Good to see you here :) We don't know what to show here yet!").status(200);
  });

  app.post('/', (req, res) => {
    const { text, command, token} = req.body;
    if(token === process.env.MATTERMOST_LOG_TIME_TOKEN) {
      console.log("Request Body to / ", JSON.stringify(req.body, null, 2));
      if (text != undefined) {
        hoursLog = parseFloat(text);
      }
      if ((isNaN(hoursLog) || hoursLog < 0.0 || hoursLog > 99.9) || command != "/logtime") {
        res.send("*0.1 hour to 99.9 hours works well here :) Let's try again...* \n `/logtime [hours]`").status(500);
      }
      else {
        uiActions.showSelProject(req, res, axios);
      }
    }
    else {
      res.send("Invalid request").status(400);
    }
  });

  app.post('/projSel', (req, res) => {
    console.log("Project dialog submit request: ", req);
    uiActions.loadTimeLogDlg(req, res, axios);
  });

  app.post('/logTime', (req, res) => {
    console.log("Work package submit request: ", req);
    uiActions.handleSubmission(req, res, axios, hoursLog);
  });

  app.get('/getLogo', (req, res) => {
    console.log("Logo image request: ", req);
    res.sendFile(__dirname + '/op_logo.png');
  });

  app.get('/getTimeLog', (req, res) => {
    console.log("Request to getTimeLog: ", req);
    const command = req.query.command;
    const token = req.headers.authorization.split('Token ')[1];
    if(token === process.env.MATTERMOST_GET_TIME_LOG_TOKEN) {
      if (command != "/gettimelog") {
        res.send("*Let's try again...* \n `/getTimeLog`").status(500);
      }
      else {
        uiActions.getTimeLog(req, res, axios);
      }
    }
    else {
      res.send("Invalid request").status(400);
    }
  });
}
