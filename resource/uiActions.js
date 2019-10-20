class UIactions {

  constructor(opURL, mmURL, intURL) {
    const Message = require('./message');
    this.message = new Message();
    this.opURL = opURL;
    this.mmURL = mmURL;
    this.intURL = intURL;
  }

  showSelProject(req, res, axios) {
    console.log("Request from mattermost: ", req);
    console.log("Response from mattermost: ", res);
    axios({
      url: 'projects',
      method: 'get',
      baseURL: this.opURL,
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
        "url": this.intURL + 'projSel',
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
      axios.post(this.mmURL + 'actions/dialogs/open', optJSON).then(response => {
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

  loadTimeLogDlg(req, res, axios) {
    if (req.body.callback_id === "project_selection") {
      let optArray = [];
      axios({
        url: 'work_packages',
        method: 'get',
        baseURL: this.opURL,
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
                "url": this.intURL + 'logTime',
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
                    "url": this.intURL + 'logTime',
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
        axios.post(this.mmURL + 'posts', {
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
        this.message.showFailMsg(req, res, axios);
      });
    }
  }

};

module.exports = UIactions;
