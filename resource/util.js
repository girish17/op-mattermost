class Util {

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
        if (dateDiff >= 0 && dateDiff < 366)
          return true;
      
        return false;
    }
}

module.exports = Util;