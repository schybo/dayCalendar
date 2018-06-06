Day Calendar
==============

*Steps to run*

- Open the `index.html` file
- In the console in the dev tools run layOutDay(events) with your specified input of events
- e.g. layOutDay([{start: 30, end: 150}, {start: 540, end: 600}])

*What would I do next?*

- Use React. Make the event, hour time, and half hour time into functional React components. jQuery code elements are messy and slow.
- Write some test cases in Mocha and Chai
- Implement a solution for the cutoff text on small events
- Probably use Moment.js instead of my date additions. But I didn't know if that was allowed and wanted to reduce dependencies.
- Set up build pipeline
- If were continually adding to our calendar I'd use an interval tree for better analysis/time/memory: https://en.wikipedia.org/wiki/Interval_tree

*How did I go about building this?*

In an iterative fashion I first built out the UI, then split up the larger problem of event layouts into first finding the overlapping intervals and then progressing from there. I realized there were two subproblems, where to place a event in terms of conflicts + how many events were in a conflict group which would dictate the UI. I tested each function as they were built so I could isolate any errors that did occur quickly.

*Any Notes/Assumptions*

- Events < 22 minutes will not be the right size given padding etc. But at least you can still see the event which is nice
- I used a color picker to try and match the colors of the UI elements the best I could but they're not quite perfect it looks like.
- I believe the border on your image was a slight parallelogram, so I replicated that assumption.
- I assumed the user may want to alter their start/end time of the calendar which is why I created the divs with javascript.