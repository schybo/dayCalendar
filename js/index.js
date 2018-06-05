const START_HOUR = 9;
const START_MIN = 0;
const END_TIME = 21;
const HALF_HOUR = 30;
const MID_DAY = 12;
const US_DATE_FORMAT = 'us';
const START_INTERVAL_TYPE = 1;
const END_INTERVAL_TYPE = 0;
const EVENT_BORDER_WIDTH = 5;
const EVENT_PADDING_TOP_BOTTOM = 10;
const EVENT_PADDING_LEFT_RIGHT = 5;
const BASE_CALENDAR_PADDING = 10;
const BASE_CALENDAR_WIDTH = 600;
const BASE_CALENDAR_HEIGHT = 720;
const FORMATTED_MINUTES = 10;
const EVENT_LENGTH_BORDER = 2;
const EMPTY_LEVEL = 'empty';

// CalendarEvent class holds information used for formatting
class CalendarEvent {
  constructor(start, end, insetLevel) {
    this.start = start;
    this.end = end;
    this.insetLevel = insetLevel;
    this.conflicts = 1;
  }

  get height() {
    return this.calcHeight() - (EVENT_PADDING_TOP_BOTTOM * 2) - EVENT_LENGTH_BORDER;
  }

  get width() {
    return this.calcWidth() - EVENT_BORDER_WIDTH - (EVENT_PADDING_LEFT_RIGHT * 2);
  }

  get top() {
    return this.start;
  }

  get left() {
    return this.calcLeft();
  }

  // How to set this
  setConflicts(currentOverlappingEvents) {
    this.conflicts = Math.max(currentOverlappingEvents, this.conflicts);
  }

  calcLeft() {
    return (this.calcWidth() * this.insetLevel) + BASE_CALENDAR_PADDING;
  }

  calcWidth() {
    // ToDo: What if it's not divisible by the number
    // Plus make sure it's not zero
    return (BASE_CALENDAR_WIDTH / this.conflicts);
  }

  calcHeight() {
    return this.end - this.start;
  }
}

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

// Creates a pseudo unique identifier
// If this was going into production I would use a different method
function createPseudoGuid () {
  return Math.random().toString(36).substr(2, 9);
};

// TODO: Might want to make this a class
// Used to aid in the sorting of the events
// Example output: [{id: 'jsdfhjks', value: 30, type="end", interval={start: 30, end: 150}}]
function createEventDataStructure(events) {
  let eventDataStructure = [];
  events.map(function(event) {
     let pseudoGuid = createPseudoGuid();
     eventDataStructure.push({
       id: pseudoGuid,
       value: event.start,
       type: START_INTERVAL_TYPE, //(1) start points we want sorted later than end points
       interval: event
     })
     eventDataStructure.push({
       id: pseudoGuid,
       value: event.end,
       type: END_INTERVAL_TYPE, //(0) end points we want sorted earlier than end points
       interval: event
     })
  })
  return eventDataStructure;
}

// Comparison function used in sorting the events
function compareEvents(eventA, eventB) {
  valueA = eventA.value;
  valueB = eventB.value;
  typeA = eventA.type;
  typeB = eventB.type;

  if (valueA < valueB || (valueA === valueB && typeA < typeB)) {
    return -1; //eventA is greater than eventB
  }
  if (valueA > valueB || (valueA === valueB && typeA > typeB)) {
    return 1; //eventB is greater than eventA
  }

  return 0;
}

// Finds the earliest column/level on which we can put an event
function findEarliestLevel(currentEvents, id) {
  for (let i = 0; i < currentEvents.length; i++) {
    if (currentEvents[i] === EMPTY_LEVEL) {
      // Found an empty column/level, let's add to it and return the column/level
      currentEvents[i] = id;
      return i;
    }
  }

  // No empty spots earlier, let's add to the column/level list
  currentEvents.push(id);
  return currentEvents.length - 1;
}

// Remove an event from the column list, to indicate there is now space available there
function removeEventFromCurrentEvents(currentEvents, id) {
  for (let i = 0; i < currentEvents.length - 1; i++) {
    if (currentEvents[i] === id) {
       // Set to an empty level
       currentEvents[i] = EMPTY_LEVEL;
       return currentEvents;
    }
  }

  return currentEvents.slice(0, -1)
}

// If there's another conflict group, update all the events in that conflict group
function updateEventConflicts(conflictGroup, events, currentOverlappingEvents) {
  for (let i = 0; i < conflictGroup.length; i++) {
    events[conflictGroup[i]].setConflicts(currentOverlappingEvents);
  }
}

// Input: A list of events
// Output: A list of CalendarEvent objects
function adjustEventsForOverlappingIntervals(events) {
  // Prepare the event data structure for sorting
  structuredEvents = createEventDataStructure(events);
  // Sorts the events O(nlogn) to find the overlapping events
  structuredEvents.sort(compareEvents);

  let currentOverlappingEvents = 0;
  let eventsDict = {};
  let conflictGroup = [];
  let currentEvents = [];

  structuredEvents.map(function(event) {
    if (event.type === START_INTERVAL_TYPE) {
      eventsDict[event.id] = new CalendarEvent(
        event.interval.start, 
        event.interval.end, 
        findEarliestLevel(currentEvents, event.id)
      );
      conflictGroup.push(event.id);
      currentOverlappingEvents++;

      // Update event conflicts as necessary
      updateEventConflicts(conflictGroup, eventsDict, currentOverlappingEvents);
    } else {
      currentOverlappingEvents--;

      // The conflict group of overlapping events is completely clear
      if (currentOverlappingEvents === 0) {
        conflictGroup = [];
      }
      currentEvents = removeEventFromCurrentEvents(currentEvents, event.id);
    }
  })

  // return events in some form
  return eventsDict;
}

function confirmUserInput(events) {
  events.map(function(event) {
    if (event.start < 0 || event.start > BASE_CALENDAR_HEIGHT) {
      throw "Error: Event start must be within bounds of the calendar (0, 720)";
    } else if (event.end < 0 || event.end > BASE_CALENDAR_HEIGHT) {
      throw "Error: Event end must be within bounds of the calendar (0, 720)";
    } else if (event.end <= event.start) {
      throw "Error: Event must be at least 1 minute long";
    }
  });
}

// Input: [ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ]
// Lays out the calendar events on the calendar
window.layOutDay = function layOutDay (events) {
  // Make sure there are no input errors
  confirmUserInput(events);

  const eventElement = '<div class="event"></div>';
  const eventInnerElements = `
    <div class="header">Sample Item</div>
    <div class="subheader">Sample Location</div>
  `;
  const calendar = $('#calendar');

  // Clear old events
  calendar.empty();

  events = adjustEventsForOverlappingIntervals(events);

  for (var key in events) {
     let event = events[key];
     let domEventElement = $(eventElement).css({
       'width': event.width,
       'height': event.height,
       'top': event.top,
       'left': event.left
     }).append(eventInnerElements);
     calendar.append(domEventElement);
  }
}

// testCase do exactly equals with start + end
let testInput =  [ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ];
let testInput2 = [ {start: 30, end: 150}, {start: 540, end: 600} ];
let testInput3 = [ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}];
let testInput4 =  [ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 720}, {start: 610, end: 720}, {start: 610, end: 690}, {start: 630, end: 650} ];
let testInput5 =  [ {start: 30, end: 150}, {start: 160, end: 500}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 720}, {start: 610, end: 720}, {start: 610, end: 690}, {start: 630, end: 650} ];

initTimeSidebar();
window.layOutDay(testInput5);