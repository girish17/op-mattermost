class UIactions {

  constructor(opURL, mmURL, intURL) {
    const Util = require('./util');
    const Message = require('./message');
    this.moment = require('moment');
    this.util = new Util();
    this.message = new Message(mmURL);
    this.opURL = opURL;
    this.mmURL = mmURL;
    this.intURL = intURL;
    this.projectId = '';
    this.optLen = 3;
    this.timeLogSuccessMsg = "**Time logged! You are awesome :sunglasses: **";
    this.timeLogFailMsg = "**That didn't work :pensive: Seems like OP server is down!**";
    this.dateTimeIPErrMsg = "**It seems that date or billable hours was incorrect :thinking: **";
    this.dlgCreateErrMsg =  "**It's an internal problem. Dialog creation failed :pensive: **";
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

      let wpOptJSON = this.util.getWpOptJSON(this.intURL, optArray);
      console.log("optArray for projects", wpOptJSON);

      if (req.body.token === process.env.MATTERMOST_SLASH_TOKEN) {
        res.set('Content-Type', 'application/json').send(JSON.stringify(wpOptJSON)).status(200);
      }
      else {
        res.send("Invalid request").status(400);
        return false;
      }
    }).catch(error => {
      console.log("Error in getting projects from OP", error);
      res.send("Open Project server down!!").status(500);
      return false;
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

        let logTimeDlgJSON = JSON.stringify(this.util.getlogTimeDlgObj(req.body.trigger_id, this.intURL, optArray));

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
          this.message.showFailMsg(req, res, axios, this.dlgCreateErrMsg);
        })
      }, (reason) => {
        console.log("Request failed for /work_packages: %o", reason);
        return false;
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
          console.log("Time logged. Save response: %o", response);
          this.message.showSuccessMsg(req, res, axios, this.timeLogSuccessMsg);
          return true;
        }).catch((error) => {
          console.log("OP time entries create error: %o", error);
          this.message.showFailMsg(req, res, axios, this.timeLogFailMsg);
          return false;
        });
      }
      else {
        console.log("Date or billable hours incorrect");
        this.message.showFailMsg(req, res, axios, this.dateTimeIPErrMsg);
        return false;
      }
    }
    else {
      console.log("empty submission");
      return false;
    }
  }

};

module.exports = UIactions;
