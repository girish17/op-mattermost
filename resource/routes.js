/*
 * Created on Thu Dec 19 2019
 *
 * Copyright 2019 Girish M
 *Licensed under the Apache License, Version 2.0 (the "License");
 *you may not use this file except in compliance with the License.
 *You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *Unless required by applicable law or agreed to in writing, software
 *distributed under the License is distributed on an "AS IS" BASIS,
 *WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *See the License for the specific language governing permissions and
 *limitations under the License.
 */
module.exports = (app, axios) => {

  let hoursLog = 0;

  const dotenv = require('dotenv');
  dotenv.config();

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
    if(token === process.env.MATTERMOST_SLASH_TOKEN)
    {
      //("Request Body to / ", JSON.stringify(req.body, null, 2));
      if (text != undefined) {
        hoursLog = parseFloat(text);
      }
      if ((isNaN(hoursLog) || hoursLog < 0.0 || hoursLog > 99.9) && command == "/logtime") {
        res.send("*0.1 hour to 99.9 hours works well here :) Let's try again...* \n `/logtime [hours]`").status(400);
      }
      else {
        uiActions.showSelProject(req, res, axios);
      }
    }
    else
    {
      res.send("Invalid request").status(400);
    }
  });

  app.post('/projSel', (req, res) => {
    //("Project dialog submit request: ", req);
    uiActions.loadTimeLogDlg(req, res, axios);
  });

  app.post('/logTime', (req, res) => {
    //("Work package submit request: ", req);
    uiActions.handleSubmission(req, res, axios, hoursLog);
  });

  app.get('/getLogo', (req, res) => {
    //("Logo image request: ", req);
    res.sendFile(__dirname + '/op_logo.png');
  });
}