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
    this.timeLogSuccessMsg = "**Time logged! You are awesome :sunglasses: **";
    this.timeLogForbiddenMsg = "**It seems that you don't have permission to log time for this project :confused: **"
    this.timeLogFailMsg = "**That didn't work :pensive: Seems like OP server is down!**";
    this.dateErrMsg = "**It seems that date was incorrect :thinking: Please enter a date within last one year and in YYYY-MM-DD format. **";
    this.billableHoursErrMsg = "**It seems that billable hours was incorrect :thinking: Please note billable hours should be less than or equal to logged hours. **";
    this.dlgCreateErrMsg = "**It's an internal problem. Dialog creation failed :pensive: Can you please try again?**";
    this.wpDtlEmptyMsg = "**Work package details not entered :( Let's try again...**\n `/op [hours]`";
    this.saveWPSuccessMsg = "**Work package created! You are awesome :sunglasses: **\n To log time for a work package try `/op [hours]`";
    this.dlgCancelMsg = "** If you would like to try again then, `/op` **";
    this.genericErrMsg = "** Unknown error occurred :pensive: Can you please try again? **";
  }

  checkHours(hoursLog, hours) {
    if (isNaN(hours) || hours < 0.0 || hours > 99.9) {
      return false;
    }
    else {
      /*Check for billable hours to be less than hours log*/
      if (hours <= hoursLog) {
        return true;
      }
      else
        return false;
    }
  }

  checkDate(moment, dateTxt) {
    /*Valid dates within last one year*/
    let dateDiff = moment().diff(moment(dateTxt, 'YYYY-MM-DD', true), 'days');
    let daysUpperBound = 365;
    if (moment().isLeapYear()) {
      daysUpperBound = 366;
    }
    if (dateDiff >= 0 && dateDiff <= daysUpperBound)
      return true;

    return false;
  }

  getlogTimeDlgObj(triggerId, url, optArray, hoursLog) {
    let logTimeDlgObj = {
      "trigger_id": triggerId,
      "url": url + 'logTime',
      "dialog": {
        "callback_id": "log_time_dlg",
        "title": "Log time for work package",
        "icon_url": url + 'getLogo',
        "elements": [{
          "display_name": "Work package",
          "name": "work_package",
          "type": "select",
          "placeholder": "Type to search for a work package",
          "options": optArray,
          "default": optArray[0].value
        },
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
          ],
          "default": "opt3"
        },
        {
          "display_name": "Billable hours",
          "name": "billable_hours",
          "type": "text",
          "placeholder": "hours like 0.5, 1, 3 ...",
          "default": "0.0",
          "help_text": "Please enter billable hours less than or equal to " + hoursLog
        }],
        "submit_label": "Log time",
        "notify_on_cancel": true
      }
    }

    return logTimeDlgObj;
  }

  getWpOptJSON(url, optArray, action, mode) {
    let wpOptObj = {
      "response_type": "in_channel",
      "message": "Type to search for a project...",
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
      let optJSON = {
        "update": wpOptObj
      };
      return optJSON;
    }
    else {
      return wpOptObj;
    }
  }

  getTimeLogJSON(timeLogArray) {
    if (timeLogArray.length != 0) {
      let tableTxt = "#### Time entries logged by you\n";
      tableTxt += "| Spent On | Project | Work Package | Activity | Logged Time | Billed Time | Comment |\n";
      tableTxt += "|:---------|:--------|:-------------|:---------|:------------|:------------|:--------|\n";
      timeLogArray.forEach(element => {
        if (element.comment === null) {
          element.comment = "";
        }
        tableTxt += "| " + element.spentOn + " | " + element.project + " | " + element.workPackage + " | " + element.activity + " | " + element.loggedHours + " | " + element.billableHours + " | " + element.comment + " |\n";
      });

      let timeLogJSON = {
        "update": {
          "message": tableTxt,
          "props": {}
        }
      };
      return timeLogJSON;
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
    let createWpDlgObj = {
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
    }
    return createWpDlgObj;
  }

  getMenuButtonJSON(url) {
    let menuButtonJSON = {
      "response_type": "in_channel",
      "props": {
        "attachments": [
          {
            "pretext": "Hello :) What would you like to do?",
            "text": "For *logging time*, try `/op` followed by hours e.g. `/op 1`",
            "actions": [
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
    }
    return menuButtonJSON;
  }
}
module.exports = Util;