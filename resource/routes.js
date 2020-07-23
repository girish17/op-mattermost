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
      if ((isNaN(hoursLog) || hoursLog < 0.0 || hoursLog > 99.9) || command != "/logtime") {
        res.send("*0.1 hour to 99.9 hours works well here :) Let's try again...* \n `/logtime [hours]`").status(500);
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
