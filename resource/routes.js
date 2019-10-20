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
    const { text, channel_id, user_id, command, trigger_id } = req.body;
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
  });


  app.post('/projSel', (req, res) => {
    console.log("Project dialog submit request: ", req);
    let txtMsg = {
      "channel_id": req.body.channel_id,
      "message": "Test message #testing",
      "props": {
        "attachments": [
          {
            "pretext": "This is the attachment pretext.",
            "text": "This is the attachment text."
          }]
      }
    };
    axios({
      url: 'posts',
      method: 'post',
      baseURL: mmURL,
      headers: {
        'Authorization': 'Bearer ' + process.env.MATTERMOST_ACCESS_TOKEN
      },
      data: txtMsg
    }).then((result) => {
      console.log("response from submit: ", result);
      res.send().status(200);
    }).catch((err) => {
      console.log("error during creating interactive message ", err);
    });
    res.send().status(201);
    //uiActions.loadTimeLogDlg(req, res);
  });
}