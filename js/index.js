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
function updateEventConflicts(conflictGroup, events, conflictMax) {
  for (let i = 0; i < conflictGroup.length; i++) {
    events[conflictGroup[i]].setConflicts(conflictMax);
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
  let conflictMax = 0;
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

      // See if we've reached a new high of conflicts
      conflictMax = Math.max(conflictMax, currentOverlappingEvents);
    } else {
      // Update event conflicts as necessary
      updateEventConflicts(conflictGroup, eventsDict, conflictMax);
      currentOverlappingEvents--;

      // The conflict group of overlapping events is completely clear
      if (currentOverlappingEvents === 0) {
        conflictGroup = [];
        conflictMax = 0;
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

// let testInput =  [ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ];
// let testInput = [ {start: 30, end: 150}, {start: 540, end: 600} ];
// let testInput = [ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}];
// let testInput =  [ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 720}, {start: 610, end: 720}, {start: 610, end: 690}, {start: 630, end: 650} ];
// let testInput =  [ {start: 30, end: 150}, {start: 160, end: 500}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 720}, {start: 610, end: 720}, {start: 610, end: 690}, {start: 630, end: 650} ];
// let testInput = [ {start: 140, end: 160}, {start: 30, end: 150}, {start: 30, end: 150}, {start: 30, end: 180}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 100, end: 640}, {start: 650, end: 700}];
// let testInput = [ {start: 140, end: 160}, {start: 30, end: 150}, {start: 30, end: 150}, {start: 310, end: 400}, {start: 310, end: 400}, {start: 310, end: 400}, {start: 310, end: 400}, {start: 310, end: 400}, {start: 30, end: 180}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 100, end: 640}, {start: 650, end: 700}];

// window.layOutDay(testInput);