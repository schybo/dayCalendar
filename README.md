Day Calendar
==============

* What would I do next? *

- Use React. Make the event, hour time, and half hour time into functional React components. jQuery code elements are messy and slow.
- Write some test cases in Mocha and Chai
- Probably use Moment.js instead of my date additions. But I didn't know if that was allowed and wanted to reduce dependencies.
- Set up build pipeline

* How did I go about building this? *

In an iterative fashion I first built out the UI, then split up the larger problem of event layouts into first finding the overlapping intervals and then progressing from there. I realized there were two subproblems, where to place a event in terms of conflicts + how many events were in a conflict group which would dictate the UI. I tested each function as they were built so I could isolate any errors that did occur quickly.

*Any Notes/Assumptions*

- I used a color picker to try and match the colors of the UI elements the best I could but they're not quite perfect it looks like.
- I believe the border on your image was a slight parallelogram, so I replicated that assumption.
- I assumed the user may want to alter their start/end time of the calendar which is why I created the divs with javascript.