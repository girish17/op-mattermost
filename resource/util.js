/*
Copyright (C) 2020, Girish M
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>

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
