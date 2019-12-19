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
  }

  showSelProject(req, res, axios) {
    //("Request from mattermost: ", req);
    //("Response from mattermost: ", res);
    axios({
      url: 'projects',
      method: 'get',
      baseURL: this.opURL,
      auth: {
        username: 'apikey',
        password: process.env.OP_ACCESS_TOKEN
      }
    }).then((response) => {
      //("Projects obtained from OP: %o", response);
      var optArray = [];
      response.data._embedded.elements.forEach(element => {
        optArray.push({
          "text": element.name,
          "value": "opt" + element.id
        });
      });

      let wpOptJSON = this.util.getWpOptJSON(this.intURL, optArray);
      //("optArray for projects", wpOptJSON);

      if (req.body.token === process.env.MATTERMOST_SLASH_TOKEN) {
        res.set('Content-Type', 'application/json').send(JSON.stringify(wpOptJSON)).status(200);
      }
      else {
        res.send("Invalid request").status(400);
        return false;
      }
    }).catch(error => {
      //("Error in getting projects from OP", error);
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
        //("WP obtained from OP: %o", response);
        response.data._embedded.elements.forEach(element => {
          optArray.push({
            "text": element.subject,
            "value": "opt" + element.id
          });
        });

        let logTimeDlgJSON = JSON.stringify(this.util.getlogTimeDlgObj(req.body.trigger_id, this.intURL, optArray));

        //("logTimeDlgJSON: " + logTimeDlgJSON);

        axios.post(this.mmURL + 'actions/dialogs/open', logTimeDlgJSON).then(response => {
          //("Response from projects dialog: ", response);
          let updateMsg = JSON.stringify({
            "update": {
              "message": "Updated!"
            },
            "ephemeral_text": "Opening time log dialog..."
          });
          res.type('application/json').send(updateMsg).status(200);
        }).catch(error => {
          //("Error while creating projects dialog", error);
          this.message.showFailMsg(req, res, axios, this.util.dlgCreateErrMsg);
        })
      }, (reason) => {
        //("Request failed for /work_packages: %o", reason);
        return false;
      });
    }
  }

  handleSubmission(req, res, axios, hoursLog) {
    if (req.body.submission) {
      const { spent_on, comments, billable_hours, activity, work_package } = req.body.submission;
      //("Submission data: ");
      //("spent_on: ", spent_on, " comments: ", comments);
      //(" billable_hours: ", billable_hours, " activity: ", activity, " work_package: ", work_package);
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
          //("Time logged. Save response: %o", response);
          this.message.showSuccessMsg(req, res, axios, this.util.timeLogSuccessMsg);
          return true;
        }).catch((error) => {
          //("OP time entries create error: %o", error);
          this.message.showFailMsg(req, res, axios, this.util.timeLogFailMsg);
          return false;
        });
      }
      else {
        //("Date or billable hours incorrect");
        this.message.showFailMsg(req, res, axios, this.util.dateTimeIPErrMsg);
        return false;
      }
    }
    else {
      //("empty submission");
      this.message.showFailMsg(req, res, axios, this.util.wpDtlEmptyMsg);
      return false;
    }
  }

};

module.exports = UIactions;
