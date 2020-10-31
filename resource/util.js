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

const moment = require("moment");

class Util {

  constructor() {
    this.timeLogSuccessMsg = "**Time logged! You are awesome :sunglasses: **\n To view time logged try `/op`";
    this.timeLogForbiddenMsg = "**It seems that you don't have permission to log time for this project :confused: **"
    this.timeLogFailMsg = "**That didn't work :pensive: An internal error occurred!**";
    this.dateErrMsg = "**It seems that date was incorrect :thinking: Please enter a date within last one year and in YYYY-MM-DD format. **";
    this.billableHoursErrMsg = "**It seems that billable hours was incorrect :thinking: Please note billable hours should be less than or equal to logged hours. **";
    this.dlgCreateErrMsg = "**It's an internal problem. Dialog creation failed :pensive: Can you please try `/op` again?**";
    this.wpDtlEmptyMsg = "**Work package details not entered :( Let's try again...**\n `/op`";
    this.saveWPSuccessMsg = "**Work package created! You are awesome :sunglasses: **\n To log time for a work package try `/op`";
    this.wpFetchErrMsg = "**That didn't work :pensive: Couldn't fetch work packages from OP**";
    this.activityFetchErrMsg = "**That didn't work :pensive: Couldn't fetch activities from OP**";
    this.typeFetchErrMsg = "**That didn't work :pensive: Couldn't to fetch types from OP**";
    this.dlgCancelMsg = "** If you would like to try again then, `/op` **";
    this.genericErrMsg = "** Unknown error occurred :pensive: Can you please try again? **";
  }

  checkHours(hoursLog, hours) {
    if (isNaN(hours) || hours < 0.0 || hours > 99.9) {
      return false;
    }
    else {
      /*Check for billable hours to be less than hours log*/
      return hours <= hoursLog;
    }
  }

  checkDate(moment, dateTxt) {
    /*Valid dates within last one year*/
    let dateDiff = moment().diff(moment(dateTxt, 'YYYY-MM-DD', true), 'days');
    let daysUpperBound = 365;
    if (moment().isLeapYear()) {
      daysUpperBound = 366;
    }
    return dateDiff >= 0 && dateDiff <= daysUpperBound;


  }

  getLogTimeDlgObj(triggerId, url, activityOptArray) {
    return {
      "trigger_id": triggerId,
      "url": url + 'logTime',
      "dialog": {
        "callback_id": "log_time_dlg",
        "title": "Log time for work package",
        "icon_url": url + 'getLogo',
        "elements": [
          {
            "display_name": "Date",
            "name": "spent_on",
            "type": "text",
            "placeholder": "YYYY-MM-DD",
            "help_text": "Please enter date within last one year and in YYYY-MM-DD format",
            "default": moment().format('YYYY-MM-DD')
          },
          {
            "display_name": "Comment",
            "name": "comments",
            "type": "textarea",
            "placeholder": "Please mention comments if any",
            "optional": true
          },
          {
            "display_name": "Select Activity",
            "name": "activity",
            "type": "select",
            "placeholder": "Type to search for activity",
            "options": activityOptArray,
            "default": activityOptArray[0].value
          },
          {
            "display_name": "Spent hours",
            "name": "spent_hours",
            "type": "text",
            "placeholder": "hours like 0.5, 1, 3 ...",
            "help_text": "Please enter spent hours to be logged"
          },
          {
            "display_name": "Billable hours",
            "name": "billable_hours",
            "type": "text",
            "placeholder": "hours like 0.5, 1, 3 ...",
            "default": "0.0",
            "help_text": "Please ensure billable hours is less than or equal to spent hours"
          }],
        "submit_label": "Log time",
        "notify_on_cancel": true
      }
    };
  }

  getProjectOptJSON(url, optArray, action, mode) {
    let projectOptObj = {
      "response_type": "in_channel",
      "message": "*Please select a project*",
      "props": {
        "attachments": [
          {
            "actions": [
              {
                "name": "Type to search for a project...",
                "integration": {
                  "url": url + "projSel",
                  "context": {
                    "action": action
                  }
                },
                "type": "select",
                "options": optArray
              }]
          }
        ]
      }
    };
    if (mode === 'update') {
      return {
        "update": projectOptObj
      };
    }
    else {
      return projectOptObj;
    }
  }

  getWpOptJSON(url, optArray, action) {
    return {
      "update": {
        "response_type": "in_channel",
        "message": "*Please select a work package*",
        "props": {
          "attachments": [
            {
              "actions": [
                {
                  "name": "Type to search for a work package...",
                  "integration": {
                    "url": url + "wpSel",
                    "context": {
                      "action": action
                    }
                  },
                  "type": "select",
                  "options": optArray
                }]
            }
          ]
        }
      }
    };
  }

  getTimeLogJSON(timeLogArray) {
    let tableTxt = '';
    if (timeLogArray.length !== 0) {
      tableTxt = "#### Time entries logged by you\n";
      tableTxt += "| Spent On | Project | Work Package | Activity | Logged Time | Billed Time | Comment |\n";
      tableTxt += "|:---------|:--------|:-------------|:---------|:------------|:------------|:--------|\n";
      timeLogArray.forEach(element => {
        if (element.comment === null) {
          element.comment = "";
        }
        tableTxt += "| " + element.spentOn + " | " + element.project + " | " + element.workPackage + " | " + element.activity + " | " + element.loggedHours + " | " + element.billableHours + " | " + element.comment + " |\n";
      });

      return {
        "update": {
          "message": tableTxt,
          "props": {}
        }
      };
    }
    else {
      return {
        "update": {
          "message": tableTxt,
          "props": {}
        }
      }
    }
  }

  getWpCreateJSON(triggerId, url, typeArray, assigneeArray) {
    return {
      "trigger_id": triggerId,
      "url": url + 'saveWP',
      "dialog": {
        "callback_id": "create_wp_dlg",
        "title": "Create a work package",
        "icon_url": url + 'getLogo',
        "elements": [{
          "display_name": "Subject",
          "name": "subject",
          "type": "text",
          "placeholder": "Name of work package"
        },
          {
            "display_name": "Select Type",
            "name": "type",
            "type": "select",
            "placeholder": "Type to search for type",
            "options": typeArray,
            "default": "opt1"
          },
          {
            "display_name": "Assignee",
            "name": "assignee",
            "type": "select",
            "placeholder": "Type to search for users",
            "options": assigneeArray,
            "optional": true
          },
          {
            "display_name": "Notify interested users?",
            "placeholder": "Send email.",
            "name": "notify",
            "type": "bool",
            "optional": true,
            "help_text": "Note that this controls notifications for all users interested in changes to the work package (e.g. current user, watchers, author and assignee)"
          }],
        "submit_label": "Create Work Package",
        "notify_on_cancel": true
      }
    };
  }

  getMenuButtonJSON(url) {
    return {
      "response_type": "in_channel",
      "props": {
        "attachments": [
          {
            "pretext": "Hello :)",
            "text": "What would you like me to do?",
            "actions": [
              {
                "name": "Log time",
                "integration": {
                  "url": url + "createTimeLog",
                  "context": {
                    "action": "showSelWP"
                  }
                }
              },
              {
                "name": "Create Work Package",
                "integration": {
                  "url": url + "createWP",
                  "context": {
                    "action": "createWP"
                  }
                }
              },
              {
                "name": "View time logs",
                "integration": {
                  "url": url + "getTimeLog",
                  "context": {
                    "action": "getTimeLog"
                  }
                }
              },
              {
                "name": "Bye :wave:",
                "integration": {
                  "url": url + "bye",
                  "context": {
                    "action": "bye"
                  }
                }
              }
            ]
          }
        ]
      }
    };
  }
}
module.exports = Util;