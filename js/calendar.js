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

  // TODO: Make this a setter
  setConflicts(conflictMax) {
    this.conflicts = conflictMax;
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