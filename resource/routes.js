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
      console.log("Request Body to / ", JSON.stringify(req.body, null, 2));
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
}