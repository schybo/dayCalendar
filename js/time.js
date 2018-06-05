// Adds half an hour to a date object
// Input: Date, Output: Date
function addHalfHour(date) {
  minutes = date.getMinutes();
  if (minutes >= HALF_HOUR) {
    date.setMinutes(minutes - HALF_HOUR);
    date.setHours(date.getHours() + 1);
  } else {
    date.setMinutes(minutes + HALF_HOUR);
  }
  return date;
}

// Formats the date to a string according to a passed in format
// Default case is US format with AM/PM
// Input: Date, String, Output: String
function getFormattedHourAndMinutes(date, format = US_DATE_FORMAT) {
  hours = date.getHours();
  minutes = date.getMinutes();

  hoursStr = String(hours);
  if (format.toLowerCase() === US_DATE_FORMAT && hours > MID_DAY) {
    hoursStr = String(hours - MID_DAY);
  }
  minutesStr = (minutes < FORMATTED_MINUTES ? '0' : '') + minutes;

  return hoursStr + ':' + minutesStr;
}

// Gets the period (AM/PM) base on the current hour of the date passed in
// Input: Date, Output: String
function getPeriod(date) {
  return date.getHours() >= MID_DAY ? 'PM' : 'AM';
}

// Setups the time sidebar given constants at the top of the file
function initTimeSidebar() {
  let date = new Date();
  date.setHours(START_HOUR);
  date.setMinutes(START_MIN);
  while (date.getHours() < END_TIME) {
    $('#time-sidebar').append(`
      <div class="time-large">
        <span class="hour">${getFormattedHourAndMinutes(date)}</span>
        <span class="period">${getPeriod(date)}</span
      </div>
    `);
    date = addHalfHour(date);
    $('#time-sidebar').append(`
      <div class="time-small">
        <span class="half-hour">${getFormattedHourAndMinutes(date)}</span>
      </div>
    `);
    date = addHalfHour(date);
  }
}

initTimeSidebar();