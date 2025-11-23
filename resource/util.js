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

const moment = require("moment");

class Util {

  constructor() {
    this.timeLogSuccessMsg = "\n**Time logged! You are awesome :sunglasses: **\n To view time logged try `/op tl`";
    this.timeLogForbiddenMsg = "**It seems that you don't have permission to log time for this project :confused: **"
    this.timeLogFailMsg = "**That didn't work :pensive: An internal error occurred!**";
    this.timeLogDelMsg = "**Time log deleted!**";
    this.timeLogDelErrMsg = "**That didn't work :pensive: Couldn't delete time log\n Please try again...`/op dtl`**";
    this.cnfDelTimeLogMsg = "**Confirm time log deletion?**";
    this.subscribeMsg = "**Subscribed to OpenProject notifications :sunglasses: **";

    this.wpDtlEmptyMsg = "**Work package details not entered :( Let's try again...**\n `/op`";
    this.saveWPSuccessMsg = "\n**Work package created! You are awesome :sunglasses: **\n To log time for a work package try `/op lt`";
    this.wpFetchErrMsg = "**That didn't work :pensive: Couldn't fetch work packages from OP**";
    this.cnfDelWPMsg = "**Confirm work package deletion?** This will delete all associated time entries and child work packages";
    this.wpDelErrMsg = "**That didn't work :pensive: Couldn't delete work package\n Please try again... `/op dwp`**";
    this.wpForbiddenMsg = "**Couldn't delete work package :confused: You are not authorized to do so.**";
    this.wpDelMsg = "**Work package deleted successfully!**";
    this.wpTypeErrMsg = "**Work package type is not set to one of the allowed values. Couldn't create work package :pensive: **";
    this.wpCreateForbiddenMsg = "**It seems that you don't have permission to create work package for this project :confused: **"

    this.dateErrMsg = "**It seems that date was incorrect :thinking: Please enter a date within last one year and in YYYY-MM-DD format. **";
    this.billableHoursErrMsg = "**It seems that billable hours was incorrect :thinking: Please note billable hours should be less than or equal to logged hours. **";
    this.dlgCreateErrMsg = "**It's an internal problem. Dialog creation failed :pensive: Can you please try `/op lt` again?**";
    this.activityFetchErrMsg = "**Couldn't fetch activities from OP :confused: You are not authorized to log time for this work package.**";
    this.typeFetchErrMsg = "**That didn't work :pensive: Couldn't to fetch types from OP**";
    this.dlgCancelMsg = "** If you would like to try again then, `/op cwp` **";
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

  getLogTimeDlgObj(triggerId, url, activityOptArray, defaultActivity = null) {
    return {
      "trigger_id": triggerId,
      "url": url + 'logTime',
      "dialog": {
        "callback_id": "log_time_dlg",
        "title": "Log time for work package",
        "icon_url": process.env.LOGO_URL,
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
            "default": defaultActivity || activityOptArray[0].value
          },
          {
            "display_name": "Spent hours",
            "name": "spent_hours",
            "type": "text",
            "placeholder": "hours like 0.5, 1, 3 ...",
            "default": "0.5",
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

  getProjectOptJSON(url, optArray, action, mode = '', defaultVal = null) {

    let selectAction = {
      "name": "Type to search for a project...",
      "integration": {
        "url": url + "projSel",
        "context": {
          "action": action
        }
      },
      "type": "select",
      "options": optArray
    };

    let actions = [selectAction];
    if (defaultVal && optArray.some(opt => opt.value === defaultVal)) {
      console.log(`[getProjectOptJSON] Setting default_option to ${defaultVal}`);
      selectAction.default_option = defaultVal;
      actions.push({
        "name": "Next",
        "integration": {
          "url": url + "projSel",
          "context": {
            "action": action,
            "selected_option": defaultVal
          }
        }
      });
    } else {
        console.log(`[getProjectOptJSON] Default value ${defaultVal} not found in options`);
    }

    actions.push({
      "name": "Cancel Project search",
      "integration": {
        "url": url + "bye"
      }
    });

    let projectOptObj = {
      "response_type": "in_channel",
      "message": "*Please select a project*",
      "props": {
        "attachments": [
          {
            "actions": actions
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

  getWpOptJSON(url, optArray, action, mode = '', defaultVal = null) {
    let selectAction = {
      "name": "Type to search for a work package...",
      "integration": {
        "url": url + "wpSel",
        "context": {
          "action": action
        }
      },
      "type": "select",
      "options": optArray
    };

    let actions = [selectAction];
    if (defaultVal && optArray.some(opt => opt.value === defaultVal)) {
      console.log(`[getWpOptJSON] Setting default_option to ${defaultVal}`);
      selectAction.default_option = defaultVal;
      actions.push({
        "name": "Next",
        "integration": {
          "url": url + "wpSel",
          "context": {
            "action": action,
            "selected_option": defaultVal
          }
        }
      });
    }

    actions.push({
      "name": "Cancel WP search",
      "integration": {
        "url": url + "createTimeLog"
      }
    });

    let wpOptJSON = {
      "response_type": "in_channel",
      "message": "*Please select a work package*",
      "props": {
        "attachments": [
          {
            "actions": actions
          }
        ]
      }
    };

    if(mode === 'update') {
      wpOptJSON = {
        "update": wpOptJSON
      }
    }

    return wpOptJSON;
  }

  getTimeLogOptJSON(url, optArray, action, mode = '') {
    let timeLogOptJSON = {
      "response_type": "in_channel",
      "props": {}
    }
    if(optArray.length !== 0) {
      timeLogOptJSON.props =  {
        "attachments": [
          {
            "actions": [
              {
                "name": "Type to search for a time log...",
                "integration": {
                  "url": url + "delTimeLog",
                  "context": {
                    "action": action
                  }
                },
                "type": "select",
                "options": optArray
              },
              {
                "name": "Cancel search",
                "integration": {
                  "url": url + "bye"
                }
              }]
          }
        ]
      }
    }
    else {
      timeLogOptJSON.text = "Couldn't find time entries to delete :confused: Try logging time using `/op`";
    }

    if(mode === 'update') {
      return {
        "update": timeLogOptJSON
      };
    }
    else {
      return timeLogOptJSON;
    }
  }

  getTimeLogDelMsgJSON(msg, url) {
    return {
      "update": {
        "response_type": "in_channel",
        "props": {
          "attachments": [
            {
              "text": msg,
              "actions": [
                {
                  "name": "View time logs",
                  "integration": {
                    "url": url + "getTimeLog",
                    "context": {
                      "action": "getTimeLog"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    };
  }

  getTimeLogJSON(timeLogArray, mode = '') {
    let tableTxt = '';
    let timeLogObj = {
        "response_type": "in_channel",
        "props": {}
    };

    if (timeLogArray.length !== 0) {
      tableTxt = "#### Time entries logged by you\n";
      tableTxt += "| Spent On | Project | Work Package | Activity | Logged Time | Billed Time | Comment |\n";
      tableTxt += "|:---------|:--------|:-------------|:---------|:------------|:------------|:--------|\n";
      timeLogArray.forEach(element => {
        if (element.comment === null) {
          element.comment = "";
        }
        tableTxt += "| " + element.spentOn + " | " + element.project + " | " + element.workPackage + " | " + element.activity + " | " + element.loggedHours + " | " + element.billableHours + " | " + element.comment.replace(/\n/g, " ") + " |\n";
      });
    }
    else {
      tableTxt = "Couldn't find time entries logged by you :confused: Try logging time using `/op`";
    }

    if(mode === 'update') {
      timeLogObj = {
        "update": timeLogObj
      };
      timeLogObj.update.message = tableTxt;
    }
    else {
      timeLogObj.text = tableTxt;
    }
    return timeLogObj;
  }

  getWPDelMsgJSON(msg) {
    return {
      "update": {
        "response_type": "in_channel",
        "props": {
          "attachments": [
            {
              "text": msg,
              "actions": []
            }
          ]
        }
      }
    };
  }

  getWpCreateJSON(triggerId, url, typeArray, assigneeArray) {
    return {
      "trigger_id": triggerId,
      "url": url + 'saveWP',
      "dialog": {
        "callback_id": "create_wp_dlg",
        "title": "Create a work package",
	"introduction_text": "Create a work package by providing following details",
        "icon_url": process.env.LOGO_URL,
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
        "notify_on_cancel": true,
        "state":"wpCreateState"
      }
    };
  }

  getMenuBtnJSON(url, firstName) {
    return {
      "response_type": "in_channel",
      "props": {
        "attachments": [
          {
            "pretext": "Hello " + firstName + " :)",
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
                "name": "Delete time log",
                "integration": {
                  "url": url + "delTimeLog",
                  "context": {
                    "action": "delTimeLog"
                  }
                }
              },
              {
                "name": "Delete Work Package",
                "integration": {
                  "url": url + "delWP",
                  "context": {
                    "action": ""
                  }
                }
              },
              {
                "name": "Subscribe to notifications",
                "integration": {
                  "url": url + "subscribe",
                  "context": {
                    "action": ""
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

  getCnfDelBtnJSON(url, msg, action) {
    return {
      "update": {
        "response_type": "in_channel",
        "props": {
          "attachments": [
            {
              "text": msg,
              "actions": [
                {
                  "name": "Yes, Delete!",
                  "integration": {
                    "url": url,
                    "context": {
                      "action": action
                    }
                  }
                },
                {
                  "name": "No, go back.",
                  "integration": {
                    "url": url,
                    "context": {
                      "action": ""
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    };
  }
}
module.exports = Util;
