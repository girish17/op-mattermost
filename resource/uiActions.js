/*
    op-mattermost provides an integration for Mattermost and Open Project.
    Copyright (C) 2020 to present , Girish M

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
    this.currentUser = '';
    this.customFieldForBillableHours = 'customField1';
  }

  showSelProject(req, res, axios, action) {
    axios({
      url: 'projects?sortBy=[["created_at","desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Projects obtained from OP: %o", response.data);
      let projectOptArray = [];
      response.data._embedded.elements.forEach(element => {
        projectOptArray.push({
          "text": element.name,
          "value": "opt" + element.id
        });
      });
      let projectOptJSON;
      if (req.body.text) {
        projectOptJSON = this.util.getProjectOptJSON(this.intURL, projectOptArray, action);
      }
      else {
        projectOptJSON = this.util.getProjectOptJSON(this.intURL, projectOptArray, action, 'update');
      }
      console.log("optArray for projects", projectOptJSON);
      res.status(200).set('Content-Type', 'application/json').send(JSON.stringify(projectOptJSON));
    }).catch(error => {
      if(error.response.status === 401) {
        console.log("Unauthorized: ", error.response.data.message);
        res.status(401).send("**Unauthorized. Invalid OpenProject access token**");
      }
      else {
        console.log("Error in getting projects from OP", error.response.data.message);
        res.status(500).send("**Open Project server down!!**");
      }
      return false;
    });
  }

  showSelWP(req, res, axios, action, mode = '') {
    // noinspection JSUnresolvedVariable
    this.projectId = req.body.context.selected_option.slice(this.optLen);
    axios({
      url: 'projects/' + this.projectId + '/work_packages?sortBy=[["created_at","desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("WP obtained from OP: %o", response.data);
      let wpOptArray = [];
      response.data._embedded.elements.forEach(element => {
        wpOptArray.push({
          "text": element.subject,
          "value": "opt" + element.id
        });
      });
      let wpOptJSON = this.util.getWpOptJSON(this.intURL, wpOptArray, action, mode);
      console.log("opt Array for WP: ", wpOptJSON);
      res.status(200).set('Content-Type', 'application/json').send(JSON.stringify(wpOptJSON));
    }, (error) => {
      console.log("Request failed for /work_packages: %o", error.response.data.message);
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
      console.log("Activities obtained from OP: %o", response.data);
      this.customFieldForBillableHours = this.getCustomFieldForBillableHours(response.data._embedded.schema, 'billable');
      console.log("Custom field for billable hours is: ", this.customFieldForBillableHours);
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
        res.status(200).type('application/json').send(updateMsg);
      }).catch(error => {
        console.log("Error while creating projects dialog", error.response.data.message);
        this.message.showMsg(req, res, axios, this.util.dlgCreateErrMsg);
        return false;
      });
    }).catch((error) => {
      console.log("Error in fetching activities: ", error);
      if(error.response.status === 403) {
        this.message.showMsg(req, res, axios, this.util.activityFetchErrMsg);
      }
      else {
        this.message.showMsg(req, res, axios, this.util.genericErrMsg);
      }
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

          let axiosData = {
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
              [this.customFieldForBillableHours]: billable_hours
          }
          /*log time log data to open project*/
          axios({
            url: 'time_entries',
            method: 'post',
            baseURL: this.opURL,
            data: axiosData,
            auth: this.opAuth
          }).then((response) => {
            console.log("Time logged. Save response: %o", response.data);
            this.message.showMsg(req, res, axios, "Time entry ID - " + response.data.id + this.util.timeLogSuccessMsg);
            return true;
          }).catch((error) => {
            console.log("OP time entries create error: %o", error.response.data.message);
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

  getCustomFieldForBillableHours(schema, targetValue, parentKey = '') {
    for (let key in schema) {
      if (schema.hasOwnProperty(key)) {
        const value = schema[key];
        if (typeof value === 'string' && value.toLowerCase().includes(targetValue.toLowerCase())) {
          const words = value.toLowerCase().split(' ');
          if (words.includes(targetValue.toLowerCase())) {
            return parentKey;
          }
        }

        if (typeof value === 'object') {
          const nestedKey = this.getCustomFieldForBillableHours(value, targetValue, key);
          if (nestedKey !== null) {
            return nestedKey;
          }
        }
      }
    }
    return 'customField1';
  }
  getTimeLog(req, res, axios, mode = '') {
    axios({
      url: 'time_entries?sortBy=[["createdAt", "desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Time entries obtained from OP: %o", response.data);
      let timeLogArray = [];
      response.data._embedded.elements.forEach(element => {
        timeLogArray.push({
          "spentOn": element.spentOn,
          "project": element._links.project.title,
          "workPackage": element._links.workPackage.title,
          "activity": element._links.activity.title,
          "loggedHours": this.moment.utc(this.moment.duration(element.hours, "hours").asMilliseconds()).format("H [hours] m [minutes]"),
          "billableHours": this.moment.utc(this.moment.duration(element[this.customFieldForBillableHours], "hours").asMilliseconds()).format("H [hours] m [minutes]"),
          "comment": element.comment.raw
        });
      });
      res.status(200).set('Content-Type', 'application/json').send(this.util.getTimeLogJSON(timeLogArray, mode));
    }).catch((error) => {
      console.log("Error in getting time logs: ", error.response.data.message);
      this.message.showMsg(req, res, axios, this.util.timeLogFetchErrMsg);
    });
  };

  showTimeLogSel(req, res, axios, mode = '') {
    axios({
      url: 'time_entries?sortBy=[["createdAt", "desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Time entries obtained from OP: %o", response.data);
      let timeLogArray = [];
      response.data._embedded.elements.forEach(element => {
        timeLogArray.push({
          "value": "opt" + element.id,
          "text":  element.comment.raw + '-' + element.spentOn + '-' + this.moment.utc(this.moment.duration(element.hours, "hours").asMilliseconds()).format("H [hours] m [minutes]") + '-' + element._links.workPackage.title + '-' + element._links.activity.title + '-' + element._links.project.title
        });
      });
      res.status(200).set('Content-Type', 'application/json').send(this.util.getTimeLogOptJSON(this.intURL, timeLogArray, "cnfDelTimeLog", mode));
    }).catch((error) => {
      console.log("Error in getting time logs: ", error.response.data.message);
      this.message.showMsg(req, res, axios, this.util.timeLogFetchErrMsg);
    });
  };

  cnfDelTimeLog(req, res) {
    this.timeLogId = req.body.context.selected_option.slice(this.optLen);
    res.status(200).set('Content-Type', 'application/json').send(JSON.stringify(this.util.getCnfDelBtnJSON(this.intURL + "delTimeLog", this.util.cnfDelTimeLogMsg, "delSelTimeLog")));
  }

  delTimeLog(req, res, axios) {
    axios({
      url: 'time_entries/' + this.timeLogId,
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Time entry deleted. Response %o", response.data);
      res.status(200).set('Content-Type', 'application/json').send(JSON.stringify(this.util.getTimeLogDelMsgJSON(this.util.timeLogDelMsg, this.intURL)));
    }).catch((error) => {
      console.log("Error in time entry deletion: ", error.response.data.message);
      this.message.showMsg(req, res, axios, this.util.timeLogDelErrMsg);
      return false;
    });
  };

  createWP(req, res, axios) {
    this.projectId = req.body.context.selected_option.slice(this.optLen);
    axios({
      url: 'types',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("Response from get types: ", response.data);
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
        console.log("Response from get available assignees: ", response.data);
        let assigneeArray = [];
        response.data._embedded.elements.forEach(element => {
          assigneeArray.push({
            "text": element.name,
            "value": "opt" + element.id
          });
        });
        let wpCreateDlgJSON = this.util.getWpCreateJSON(req.body.trigger_id, this.intURL, typeArray, assigneeArray);
        console.log("WpCreateDlgJSON: ", wpCreateDlgJSON);
        axios.post(this.mmURL + 'actions/dialogs/open', wpCreateDlgJSON).then(response => {
          console.log("Response from wp create dialog: ", response.data);
          let updateMsg = JSON.stringify({
            "update": {
              "message": "Updated!",
              "props": {}
            },
            "ephemeral_text": "Opening work package create dialog..."
          });
          res.status(200).type('application/json').send(updateMsg);
        }).catch(error => {
          console.log("Error while creating work package dialog", error);
          this.message.showMsg(req, res, axios, this.util.dlgCreateErrMsg);
        });
      });
    }).catch((error) => {
      console.log("Error in fetching types: ", error.response.data.message);
      this.message.showMsg(req, res, axios, this.util.typeFetchErrMsg);
      return false;
    });
  };

  saveWP(req, res, axios) {
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
      if (assignee !== undefined) {
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
        console.log("Work package saved. Save response: %o", response.data);
        this.message.showMsg(req, res, axios, "Work package ID - " + response.data.id + this.util.saveWPSuccessMsg);
        return true;
      }).catch((error) => {
        console.log("OP WP entries create error: %o", error.response.data.message);
        if (error.response.status === 403) {
          this.message.showMsg(req, res, axios, this.util.wpCreateForbiddenMsg);
        }
        else if (error.response.status === 422) {
          this.message.showMsg(req, res, axios, this.util.wpTypeErrMsg);
        }
        else {
          this.message.showMsg(req, res, axios, this.util.genericErrMsg);
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

  showDelWPSel(req, res, axios, mode = '') {
    axios({
      url: '/work_packages?sortBy=[["created_at","desc"]]',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("WP obtained from OP: %o", response.data);
      let wpOptArray = [];
      response.data._embedded.elements.forEach(element => {
        wpOptArray.push({
          "text": element.subject,
          "value": "opt" + element.id
        });
      });
      let wpOptJSON = this.util.getWpOptJSON(this.intURL, wpOptArray, "cnfDelWP", mode);
      console.log("opt Array for WP: ", wpOptJSON);
      res.set('Content-Type', 'application/json').send(JSON.stringify(wpOptJSON)).status(200);
    }).catch((error) => {
      console.log("Error is show work package selection: ", error.response.data.message);
      this.message.showMsg(req, res, axios, this.util.wpFetchErrMsg);
    });
  }

  showCnfDelWP(req, res, axios) {
    this.wpId = req.body.context.selected_option.slice(this.optLen);
    res.set('Content-Type', 'application/json').send(JSON.stringify(this.util.getCnfDelBtnJSON(this.intURL+ "delWP", this.util.cnfDelWPMsg, "delWP"))).status(200);
  }

  delWP(req, res, axios) {
    axios({
      url: 'work_packages/' + this.wpId,
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      console.log("WP deleted. Response %o", response.data);
      res.set('Content-Type', 'application/json').send(JSON.stringify(this.util.getWPDelMsgJSON(this.util.wpDelMsg))).status(200);
    }).catch((error) => {
      console.log("Error in work package deletion: ", error.response.data.message);
      if(error.response.status === 403) {
        this.message.showMsg(req, res, axios, this.util.wpForbiddenMsg);
      }
      else {
        this.message.showMsg(req, res, axios, this.util.wpDelErrMsg);
      }
      return false;
    });
  }

  showMenuBtn(req, res, axios) {
    axios({
      url: '/users/me',
      method: 'get',
      baseURL: this.opURL,
      auth: this.opAuth
    }).then((response) => {
      this.currentUser = response.data.firstName;
      res.set('Content-Type', 'application/json').send(JSON.stringify(this.util.getMenuBtnJSON(this.intURL, this.currentUser))).status(200);
    });
  }

  notifyChannel(req, res, axios) {
    let action = req.body.action;
    let notificationType = action.split(':')[0];
    const {createdAt, updatedAt, _embedded, description, comment, fileName, identifier} = req.body[notificationType];
    let msg = "unknown notification";
    switch(notificationType) {
      case "project":
        msg = action + "-" + identifier + " at " + updatedAt;
        break;
      case "work_package":
        msg = action + "-" + description.raw + " for " + _embedded.project.name + " at " + updatedAt + " by " + _embedded.user.name;
        break;
      case "time_entry":
        msg = action + "-" + comment.raw + " for " + _embedded.project.name + " at " + updatedAt + " by " + _embedded.user.name;
        break;
      case "attachment":
        msg = action + "-" + fileName + "-" + description.raw + " for " + " at " + createdAt + " by " + _embedded.author.name;
        break;
      default:
        msg = "default notification";
        break;
    }
    console.log("Notification message: ", msg);
    this.message.showNotification(res, axios, msg);
  }

  showByeMsg(req, res, mode) {
    let byeMsg = {
      "message": "Logged out.  :wave:",
      "props": {}
    };
    if(mode === 'update') {
      byeMsg = {
        "update": byeMsg
      };
    }
    else {
      byeMsg.text = byeMsg.message;
    }
    res.type('application/json').send(JSON.stringify(byeMsg)).status(200);
  }

  notificationSubscribe(req, res, axios) {
    this.message.showMsg(req, res, axios, this.util.subscribeMsg);
  }
}
module.exports = UIactions;
