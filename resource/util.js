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
    this.dateTimeIPErrMsg = "**It seems that date or billable hours was incorrect :thinking: **";
    this.dlgCreateErrMsg = "**It's an internal problem. Dialog creation failed :pensive: **";
    this.wpDtlEmptyMsg = "**Work package details not entered :( Let's try again...**\n `/logtime [hours]`";
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
    if(moment().isLeapYear()) {
      daysUpperBound = 366;
    }
    if (dateDiff >= 0 && dateDiff <= daysUpperBound)
      return true;

    return false;
  }

  getlogTimeDlgObj(triggerId, url, optArray) {
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
          "options": optArray,
          "default": optArray[0].value
        },
        {
          "display_name": "Date",
          "name": "spent_on",
          "type": "text",
          "placeholder": "YYYY-MM-DD",
          "default": moment().format('YYYY-MM-DD')
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
          ],
          "default": "opt3"
        },
        {
          "display_name": "Billable hours",
          "name": "billable_hours",
          "type": "text",
          "placeholder": "hours like 0.5, 1, 3 ...",
          "default": "0.0"
        }],
        "submit_label": "Log time",
        "notify_on_cancel": true
      }
    }

    return logTimeDlgObj;
  }

  getWpOptJSON(url, optArray) {
    let optJSON = {
      "response_type": "in_channel",
      "message": "Select a project",
      "props": {
        "attachments": [
          {
            "actions": [
              {
                "name": "Select a project...",
                "integration": {
                  "url": url + "projSel",
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
    return optJSON;
  }

  getTimeLogJSON(timeLogArray) {
    if(timeLogArray.length != 0) {
      let tableTxt = "#### Time entries logged by you\n";
      tableTxt += "| Spent On | Project | Work Package | Activity | Logged Time | Billed Time | Comment |\n";
      tableTxt += "|:---------|:--------|:-------------|:---------|:------------|:------------|:--------|\n";
      timeLogArray.forEach(element => {
        if(element.comment === null)
        {
          element.comment = "";
        }
        tableTxt += "| " + element.spentOn + " | " + element.project + " | " + element.workPackage + " | " + element.activity + " | " + element.loggedHours + " | " + element.billableHours + " | " + element.comment + " |\n"; 
      });
  
      let timeLogJSON = {
        "response_type": "in_channel",
        "text": tableTxt
      };
      return timeLogJSON;
    }
    else {
      return {
        "response_type": "in_channel",
        "text": "**No time entries to show :(. Log time using `/logtime` and then try.**"
      }
    }
  }
}

module.exports = Util;