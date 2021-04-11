/*
    op-mattermost provides an integration for Mattermost and Open Project.
    Copyright (C) 2020  Girish M

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>

*/
// noinspection JSUnresolvedVariable
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
    this.timeLogId = '';
    this.wpId = '';
    this.optLen = 3;
    this.opAuth = {
      username: 'apikey',
      password: process.env.OP_ACCESS_TOKEN
    }
  }

  showSelProject(req, res, axios, action) {
    console.log("Request in showSelProject: ", req);
    axios({
      url: 'projects?sortBy=[["created_at","desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Projects obtained from OP: %o", response);
      let projectOptArray = [];
      response.data._embedded.elements.forEach(element => {
        projectOptArray.push({
          "text": element.name,
          "value": "opt" + element.id
        });
      });
      let projectOptJSON;
      if (req.body.text) {
        projectOptJSON = this.util.getProjectOptJSON(this.intURL, projectOptArray, action, '');
      }
      else {
        projectOptJSON = this.util.getProjectOptJSON(this.intURL, projectOptArray, action, 'update');
      }
      console.log("optArray for projects", projectOptJSON);
      res.set('Content-Type', 'application/json').send(JSON.stringify(projectOptJSON)).status(200);
    }).catch(error => {
      console.log("Error in getting projects from OP", error);
      res.send("Open Project server down!!").status(500);
      return false;
    });
  }

  showSelWP(req, res, axios, action) {
    console.log("Request in showSelWP: ", req);
    // noinspection JSUnresolvedVariable
    this.projectId = req.body.context.selected_option.slice(this.optLen);
    axios({
      url: 'projects/' + this.projectId + '/work_packages?sortBy=[["created_at","desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("WP obtained from OP: %o", response);
      let wpOptArray = [];
      response.data._embedded.elements.forEach(element => {
        wpOptArray.push({
          "text": element.subject,
          "value": "opt" + element.id
        });
      });
      let wpOptJSON = this.util.getWpOptJSON(this.intURL, wpOptArray, action);
      console.log("opt Array for WP: ", wpOptJSON);
      res.set('Content-Type', 'application/json').send(JSON.stringify(wpOptJSON)).status(200);
    }, (reason) => {
      console.log("Request failed for /work_packages: %o", reason);
      this.message.showMsg(req, res, axios, this.util.wpFetchErrMsg);
      return false;
    });
  }

  loadTimeLogDlg(req, res, axios) {
    this.wpId = req.body.context.selected_option.slice(this.optLen);
    axios({
      url: 'time_entries/form',
      method: 'post',
      baseURL: this.opURL,
      auth: this.opAuth,
      data: {
        "_links": {
          "workPackage": {
            "href": "/api/v3/work_packages/" + this.wpId
          }
        }
      }
    }).then((response) => {
      console.log("Activities obtained from OP: %o", response);
      let activityOptArray = [];
      response.data._embedded.schema.activity._embedded.allowedValues.forEach(element => {
        activityOptArray.push({
          "text": element.name,
          "value": "opt" + element.id
        });
      });
      let logTimeDlgJSON = JSON.stringify(this.util.getLogTimeDlgObj(req.body.trigger_id, this.intURL, activityOptArray));
      console.log("logTimeDlgJSON: " + logTimeDlgJSON);
      axios.post(this.mmURL + 'actions/dialogs/open', logTimeDlgJSON).then(response => {
        console.log("Response from projects dialog: ", response);
        let updateMsg = JSON.stringify({
          "update": {
            "message": "Updated!",
            "props": {}
          },
          "ephemeral_text": "Opening time log dialog..."
        });
        res.type('application/json').send(updateMsg).status(200);
      }).catch(error => {
        console.log("Error while creating projects dialog", error);
        this.message.showMsg(req, res, axios, this.util.dlgCreateErrMsg);
        return false;
      });
    }).catch((error) => {
      console.log("Error in fetching activities: ", error);
      this.message.showMsg(req, res, axios, this.util.activityFetchErrMsg);
      return false;
    });
  }

  handleSubmission(req, res, axios) {
    if (req.body.submission) {
      const { spent_on, comments, spent_hours, billable_hours, activity} = req.body.submission;
      console.log("Submission data: ");
      console.log("spent_on: ", spent_on, " comments: ", comments, " spent_hours: ", spent_hours);
      console.log(" billable_hours: ", billable_hours, " activity: ", activity);
      if (this.util.checkDate(this.moment, spent_on)) {
        if (this.util.checkHours(spent_hours, parseFloat(billable_hours))) {
          /*log time log data to open project*/
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
                  "href": "/api/v3/work_packages/" + this.wpId
                }
              },
              "hours": this.moment.duration(spent_hours*60, "m"),
              "comment": {
                "raw": comments
              },
              "spentOn": spent_on,
              "customField2": billable_hours
            },
            auth: this.opAuth
          }).then((response) => {
            console.log("Time logged. Save response: %o", response);
            this.message.showMsg(req, res, axios, "Time entry ID - " + response.data.id + this.util.timeLogSuccessMsg);
            return true;
          }).catch((error) => {
            console.log("OP time entries create error: %o", error);
            if (error.response.status === 403) {
              this.message.showMsg(req, res, axios, this.util.timeLogForbiddenMsg);
            }
            else {
              this.message.showMsg(req, res, axios, this.util.timeLogFailMsg);
            }
            return false;
          });
        }
        else {
          console.log("Billable hours incorrect: ", billable_hours);
          this.message.showMsg(req, res, axios, this.util.billableHoursErrMsg);
          return false;
        }
      }
      else {
        console.log("Date incorrect: ", spent_on);
        this.message.showMsg(req, res, axios, this.util.dateErrMsg);
        return false;
      }
    }
    else {
      console.log("empty submission");
      this.message.showMsg(req, res, axios, this.util.wpDtlEmptyMsg);
      return false;
    }
  }

  getTimeLog(req, res, axios) {
    console.log("Request to getTimeLog handler: ", req);
    axios({
      url: 'time_entries?sortBy=[["createdAt", "desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Time entries obtained from OP: %o", response);
      let timeLogArray = [];
      response.data._embedded.elements.forEach(element => {
        timeLogArray.push({
          "spentOn": element.spentOn,
          "project": element._links.project.title,
          "workPackage": element._links.workPackage.title,
          "activity": element._links.activity.title,
          "loggedHours": this.moment.duration(element.hours, "h").humanize(),
          "billableHours": element.customField2 + ' hours',
          "comment": element.comment.raw
        });
      });
      res.set('Content-Type', 'application/json').send(this.util.getTimeLogJSON(timeLogArray)).status(200);
    }).catch((error) => {
      console.log("Error in getting time logs: ", error);
      this.message.showMsg(req, res, axios, this.util.timeLogFetchErrMsg);
    });
  };

  showTimeLogSel(req, res, axios) {
    console.log("Request to showTimeLogSel handler: ", req);
    axios({
      url: 'time_entries?sortBy=[["createdAt", "desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Time entries obtained from OP: %o", response);
      let timeLogArray = [];
      response.data._embedded.elements.forEach(element => {
        timeLogArray.push({
          "value": "opt" + element.id,
          "text":  element.comment.raw + '-' + element.spentOn + '-' + this.moment.duration(element.hours, "h").humanize()
        });
      });
      res.set('Content-Type', 'application/json').send(this.util.getTimeLogOptJSON(this.intURL, timeLogArray, "delSelTimeLog")).status(200);
    }).catch((error) => {
      console.log("Error in getting time logs: ", error);
      this.message.showMsg(req, res, axios, this.util.timeLogFetchErrMsg);
    });
  };

  delTimeLog(req, res, axios) {
    console.log("Request to delTimeLog handler: ", req);
    this.timeLogId = req.body.context.selected_option.slice(this.optLen);
    axios({
      url: 'time_entries/' + this.timeLogId,
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Time entry deleted. Response %o", response);
      res.set('Content-Type', 'application/json').send(this.util.getTimeLogDelMsgJSON(this.util.timeLogDelMsg)).status(200);
    }).catch((error) => {
      console.log("Error in time entry deletion: ", error);
      this.message.showMsg(req, res, axios, this.util.timeLogDelErrMsg);
      return false;
    });
  };

  createWP(req, res, axios) {
    console.log("Request to createWP handler: ", req);
    this.projectId = req.body.context.selected_option.slice(this.optLen);
    axios({
      url: 'types',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Response from get types: ", response);
      let typeArray = [];
      response.data._embedded.elements.forEach(element => {
        typeArray.push({
          "text": element.name,
          "value": "opt" + element.id
        });
      });
      axios({
        url: 'projects/' + this.projectId + '/available_assignees',
        method: 'get',
        baseURL: this.opURL,
        auth: this.opAuth
      }).then((response) => {
        console.log("Response from get available assignees: ", response);
        let assigneeArray = [];
        response.data._embedded.elements.forEach(element => {
          assigneeArray.push({
            "text": element.name,
            "value": "opt" + element.id
          });
        });
        let wpCreateDlgJSON = this.util.getWpCreateJSON(req.body.trigger_id, this.intURL, typeArray, assigneeArray);
        axios.post(this.mmURL + 'actions/dialogs/open', wpCreateDlgJSON).then(response => {
          console.log("Response from wp create dialog: ", response);
          let updateMsg = JSON.stringify({
            "update": {
              "message": "Updated!",
              "props": {}
            },
            "ephemeral_text": "Opening work package create dialog..."
          });
          res.type('application/json').send(updateMsg).status(200);
        }).catch(error => {
          console.log("Error while creating work package dialog", error);
          this.message.showMsg(req, res, axios, this.util.dlgCreateErrMsg);
        });
      });
    }).catch((error) => {
      console.log("Error in fetching types: ", error);
      this.message.showMsg(req, res, axios, this.util.typeFetchErrMsg);
      return false;
    });
  };

  saveWP(req, res, axios) {
    console.log("Request to saveWP handler: ", req);
    if (req.body.submission) {
      const { subject, type, assignee, notify } = req.body.submission;
      console.log("Submission data: ");
      console.log("subject: ", subject, " type: ", type, " assignee: ", assignee, " notify: ", notify);
      let postWpData = {
        "subject": subject,
        "_links": {
          "project": {
            "href": "/api/v3/projects/" + this.projectId
          },
          "type": {
            "href": "/api/v3/types/" + type.slice(this.optLen)
          }
        }
      };
      if (assignee !== null) {
        postWpData.assignee = {
          "href": "/api/v3/users/" + assignee.slice(this.optLen)
        }
      }
      /*save work-package to OpenProject*/
      axios({
        url: 'work_packages?notify=' + notify,
        method: 'post',
        baseURL: this.opURL,
        data: postWpData,
        auth: this.opAuth
      }).then(response => {
        console.log("Work package saved. Save response: %o", response);
        this.message.showMsg(req, res, axios, "Work package ID - " + response.data.id + this.util.saveWPSuccessMsg);
        return true;
      }).catch((error) => {
        console.log("OP WP entries create error: %o", error);
        if (error.response.status === 403) {
          this.message.showMsg(req, res, axios, this.util.timeLogForbiddenMsg);
        }
        else {
          this.message.showMsg(req, res, axios, this.util.timeLogFailMsg);
        }
        return false;
      });
    }
    else if (req.body.cancelled) {
      console.log("Dialog cancelled.");
      this.message.showMsg(req, res, axios, this.util.dlgCancelMsg);
    }
    else {
      console.log("Empty request body.");
      this.message.showMsg(req, res, axios, this.util.genericErrMsg);
    }
  };

  showMenuButtons(req, res) {
    console.log("Request to showMenuButtons handler: ", req);
    res.set('Content-Type', 'application/json').send(JSON.stringify(this.util.getMenuButtonJSON(this.intURL))).status(200);
  }
}
module.exports = UIactions;