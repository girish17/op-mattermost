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

  const ClientOAuth2 = require('client-oauth2');
  const opOAuth = new ClientOAuth2({
    clientId: 'OMSFC4LSqpNevjDFV3r7Wcp74vpP_ma-9M3BOg59ELA',
    clientSecret: ' dklOlISMiZvhCXjIPZf-r8XQYWVAiWSHaDHsS3pHPOg ',
    accessTokenUri: 'http://localhost:8080/oauth/token',
    authorizationUri: 'http://localhost:8080/oauth/authorize',
    redirectUri: 'https://localhost:3000/auth/op/callback'
  })

  app.get('/', (req, res) => {
    res.send("Hello there! Good to see you here :) We don't know what to show here yet!").status(200);
  });

  app.get('/auth/op', function (req, res) {
    let uri = opOAuth.code.getUri();

    res.redirect(uri);
  });

  app.get('/auth/op/callback', function (req, res) {
    opOAuth.code.getToken(req.originalUrl)
        .then(function (user) {
          console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }

          // Refresh the current users access token.
          user.refresh().then(function (updatedUser) {
            console.log(updatedUser !== user) //=> true
            console.log(updatedUser.accessToken);
          });

          // Sign API requests on behalf of the current user.
          user.sign({
            method: 'get',
            url: 'http://10.42.0.93:8080'
          });

          // We should store the token into a database.
          return res.send(user.accessToken);
        });
  });

  app.post('/', (req, res) => {
    const {command, token, text} = req.body;
    if(token === process.env.MATTERMOST_SLASH_TOKEN) {
      console.log("Request Body to / ", JSON.stringify(req.body, null, 2));
      if(command === "/op") {
        switch (text) {
          case 'lt':
            uiActions.showSelProject(req, res, axios, "showSelWP");
            break;
          case 'cwp':
            uiActions.showSelProject(req, res, axios, "createWP");
            break;
          case 'tl':
            uiActions.getTimeLog(req, res, axios, '');
            break;
          case 'dtl':
            uiActions.showTimeLogSel(req, res, axios, '');
            break;
          case 'dwp':
            uiActions.showDelWPSel(req, res, axios, '');
            break;
          case 'bye':
            uiActions.showByeMsg(req, res, '');
            break;
          default:
            uiActions.showMenuBtn(req, res, axios);
            break;
        }
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
    console.log("Create time log request: ", JSON.stringify(req.body, null, 2));
    uiActions.showSelProject(req, res, axios, "showSelWP");
  });

  app.post('/projSel', (req, res) => {
    console.log("Project submit request: ", JSON.stringify(req.body, null, 2));
    switch (req.body.context.action) {
      case 'showSelWP':
        uiActions.showSelWP(req, res, axios, "showTimeLogDlg", 'update');
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
    console.log("Work package submit request: ", JSON.stringify(req.body, null, 2));
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
    console.log("Time log submit request: ", JSON.stringify(req.body, null, 2));
    uiActions.handleSubmission(req, res, axios);
  });

  app.get('/getLogo', (req, res) => {
    console.log("Logo image request: ", JSON.stringify(req.body, null, 2));
    res.sendFile(__dirname + '/op_logo.png');
  });

  app.post('/getTimeLog', (req, res) => {
    console.log("Request to getTimeLog: ", JSON.stringify(req.body, null, 2));
    uiActions.getTimeLog(req, res, axios, 'update');
  });

  app.post('/delTimeLog', (req, res) => {
    console.log("Request to delTimeLog: ", JSON.stringify(req.body, null, 2));
    switch (req.body.context.action) {
      case "delSelTimeLog":
        uiActions.delTimeLog(req, res, axios);
        break;
      case "cnfDelTimeLog":
        uiActions.cnfDelTimeLog(req, res);
        break;
      default:
        uiActions.showTimeLogSel(req, res, axios, 'update');
        break;
    }
  });

  app.post('/createWP', (req, res) => {
    console.log("Request to createWP: ", JSON.stringify(req.body, null, 2));
    uiActions.showSelProject(req, res, axios, "createWP");
  });

  app.post('/saveWP', (req, res) => {
    console.log("Work package save request: ", JSON.stringify(req.body, null, 2));
    uiActions.saveWP(req, res, axios);
  })

  app.post('/delWP', (req, res) => {
    console.log("Work package delete request: ", JSON.stringify(req.body, null, 2));
    switch (req.body.context.action) {
      case 'delWP':
        uiActions.delWP(req, res, axios);
        break;
      default:
        uiActions.showDelWPSel(req, res, axios, 'update');
        break;
    }
  });

  app.post('/bye', (req, res) => {
    console.log("Request to showBye handler: ", JSON.stringify(req.body, null, 2));
    uiActions.showByeMsg(req, res, 'update');
  });
}