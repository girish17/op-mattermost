class UIactions {

  constructor(opURL, mmURL, intURL) {
    const Message = require('./message');
    const Util = require('./util');
    this.moment = require('moment');
    this.util = new Util();
    this.message = new Message();
    this.opURL = opURL;
    this.mmURL = mmURL;
    this.intURL = intURL;
    this.projectId = '';
    this.optLen = 3;
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
      if (req.body.token === process.env.MATTERMOST_SLASH_TOKEN) {
        res.set('Content-Type', 'application/json').send(JSON.stringify(optJSON)).status(200);
      }
      else {
        res.send("Invalid request").status(400);
      }
    }).catch(error => {
      console.log("Error in getting projects from OP", error);
      res.send("Open Project server down!!");
    });
  }

  loadTimeLogDlg(req, res, axios) {
    if (req.body.context.action === "showTimeLogDlg") {
      let optArray = [];
      this.projectId = req.body.context.selected_option.slice(this.optLen);
      axios({
        url: 'projects/' + this.projectId + '/work_packages',
        method: 'get',
        baseURL: this.opURL,
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
              "name": "work_package",
              "type": "select",
              "options": optArray
            },
            {
              "display_name": "Date",
              "name": "spent_on",
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
              "name": "activity",
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
              "name": "billable_hours",
              "type": "text",
              "placeholder": "hours like 0.5, 1, 3 ..."
            }
            ],
            "submit_label": "Log time",
            "notify_on_cancel": true
          }
        });

        console.log("logTimeDlgJSON: " + logTimeDlgJSON);

        axios.post(this.mmURL + 'actions/dialogs/open', logTimeDlgJSON).then(response => {
          console.log("Response from projects dialog: ", response);
          let updateMsg = JSON.stringify({
            "update": {
              "message": "Updated!"
            },
            "ephemeral_text": "Opening time log dialog..."
          });
          res.type('application/json').send(updateMsg).status(200);
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

  handleSubmission(req, res, axios, hoursLog) {
    if (req.body.submission) {
      const { spent_on, comments, billable_hours, activity, work_package } = req.body.submission;
      console.log("Submission data: ");
      console.log("spent_on: ", spent_on, " comments: ", comments);
      console.log(" billable_hours: ", billable_hours, " activity: ", activity, " work_package: ", work_package);
      if (this.util.checkDate(this.moment, spent_on) && this.util.checkHours(hoursLog, parseFloat(billable_hours))) {
        /*log time data to open project*/
        axios({
          url: 'time_entries',
          method: 'post',
          baseURL: this.opURL,
          data: {
            "_links": {
              "project": {
                "href": "/api/v3/projects/" + this.projectId
              },
              "activity": {
                "href": "/api/v3/time_entries/activities/" + activity.slice(this.optLen)
              },
              "workPackage": {
                "href": "/api/v3/work_packages/" + work_package.slice(this.optLen)
              }
            },
            "hours": this.moment.duration(hoursLog, 'h').toISOString(),
            "comment": {
              "raw": comments
            },
            "spentOn": spent_on,
            "customField2": billable_hours
          },
          auth: {
            username: 'apikey',
            password: process.env.OP_ACCESS_TOKEN
          }
        }).then((response) => {
          console.log("Time entry save response: %o", response);
          res.send("Time logged successfully :)").status(200);
          //this.message.showSuccessMsg(req, res);
          return true;
        }).catch((error) => {
          console.log("OP time entries create error: %o", error);
          res.send("Time logging failed :(").status(400);
          //this.message.showFailMsg(req, res);
          return false;
        });
      }
      else {
        console.log("Date or billable hours incorrect");
        let updateMsg = JSON.stringify({
          "update": {
            "message": "Please try again!"
          },
          "ephemeral_text": "It seems that date or billable hours was incorrect :thinking_face:"
        });
        res.type('application/json').send(updateMsg).status(200);
        return false;
      }
    }
    else
      console.log("empty submission");

  }

};

module.exports = UIactions;
