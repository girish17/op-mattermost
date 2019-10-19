module.exports = (axios) => {

const dotenv = require('dotenv');
dotenv.config();

const opURL = process.env.OP_URL;
const mmURL = process.env.MM_URL;
const intURL = process.env.INT_URL;


function showSelProject(req, res) {
    console.log("Request from mattermost: ", req);
    console.log("Response from mattermost: ", res);
    axios({
      url: 'projects',
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
        "url": intURL + 'projSel',
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
      axios.post(mmURL + 'actions/dialogs/open', optJSON).then(response => {
        console.log("Response from projects dialog: ", response);
        res.send().status(201);
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
        url: 'work_packages',
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
            "value": "opt" + element.id
          });
        });
        /* 
              var dlgJSON = JSON.stringify({
                "trigger_id": req.body.trigger_id,
                "url": intURL + 'logTime',
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
                    "url": intURL + 'logTime',
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
        axios.post(mmURL + 'posts', {
          "channel_id": req.body.channel_id,
          "message": "Select a work package"
        }/* ,
          "props": wpMsgMenu */
        ).then(response => {
          console.log("Response from log time dialog: ", response);
          res.send().status(201);
          return;
        }).catch(error => {
          console.log("Error while creating log time dialog", error);
          res.send("**Dialog creation failed**").status(500);
        })
      }, (reason) => {
        console.log("Request failed for /work_packages: %o", reason);
        require("./message.js")(axios);
        showFailMsg(req, res);
      });
    }
  }

};

