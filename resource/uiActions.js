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

        var optJSON = {
          "response_type": "in_channel",
          "message": "Select a project",
          "props": {
            "attachments": [
              {
                "actions": [
                  {
                    "name": "Select a project...",
                    "integration": {
                      "url": this.intURL + "projSel",
                      "context": {
                        "action": "showTimeLogDlg"
                      }
                    },
                    "type": "select",
                    "options": optArray
                  }]
              }
            ]
          }
        };

        console.log("optArray for projects", optJSON);
        if(req.body.token === process.env.MATTERMOST_SLASH_TOKEN)
        {
          res.set('Content-Type','application/json').send(JSON.stringify(optJSON)).status(200);
        }
        else
        {
          res.send("Invalid request").status(400);
        }
        // axios({
        //   url: '/posts',
        //   method: 'post',
        //   baseURL: this.mmURL,
        //   headers: {
        //     'Authorization': 'Bearer: '+process.env.MATTERMOST_ACCESS_TOKEN
        //   },
        //   data: optJSON
        // }).then((response) => {
        //   console.log("Response from projects select: ", response);
        //   res.send().status(201);
        // }).catch(error => {
        //   console.log("Error while creating projects dialog", error);
        //   res.send("Select message menu creation failed!").status(500);
        // })
      }).catch(error => {
        console.log("Error in getting projects from OP", error);
        res.send("Open Project server down!!");
    });
  }

  loadTimeLogDlg(req, res, axios) {
    if (req.body.context.action === "showTimeLogDlg") {
      let optArray = [];
      axios({
        url: 'work_packages',
        method: 'get',
        baseURL: this.opURL,
        params: {
          id: req.body.context.selected_option.slice(-1)
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

        var logTimeDlgJSON = JSON.stringify({
          "trigger_id": req.body.trigger_id,
          "url": this.intURL + 'logTime',
          "dialog": {
            "callback_id": "log_time_dlg",
            "title": "Log time for work package",
            "elements": [{
              "display_name": "Work package",
              "name": "options",
              "type": "select",
              "options": optArray
            },
            {
                "display_name": "Date",
                "name": "log_date",
                "type": "text",
                "placeholder": "YYYY-MM-DD"
            },
            {
              "display_name": "Comment",
              "name": "comments",
              "type": "textarea",
              "help_text": "Please mention comments if any",
              "optional": true
            },
            {
                "display_name": "Select Activity",
                "name": "options",
                "type": "select",
                "options": [
                  {
                    "text": "Development",
                    "value": "opt3"
                  },
                  {
                    "text": "Management",
                    "value": "opt1"
                  },
                  {
                    "text": "Specification",
                    "value": "opt2"
                  },
                  {
                    "text": "Testing",
                    "value": "opt4"
                  },
                  {
                    "text": "Support",
                    "value": "opt5"
                  },
                  {
                    "text": "Other",
                    "value": "opt6"
                  },
                ]
            },
            {
              "display_name": "Billable hours",
              "type": "text",
              "subtype": "number"
            }
          ],
            "submit_label": "Log time",
            "notify_on_cancel": true
          }
        });

        console.log("logTimeDlgJSON: "+logTimeDlgJSON);

        axios.post(this.mmURL + 'actions/dialogs/open', logTimeDlgJSON).then(response => {
          console.log("Response from projects dialog: ", response);
          res.send().status(201);
        }).catch(error => {
          console.log("Error while creating projects dialog", error);
          res.send("**Dialog creation failed**").status(500);
        })
      }, (reason) => {
        console.log("Request failed for /work_packages: %o", reason);
        //this.message.showFailMsg(req, res, axios);
      });
    }
  }

};

module.exports = UIactions;
