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
class Util {

  constructor() {
    this.timeLogSuccessMsg = "**Time logged! You are awesome :sunglasses: **";
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
}

module.exports = Util;