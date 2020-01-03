/**
 * Adding counterup plugin to animate numbers while scrolling
 */

import counterUp from "counterup2";
import "waypoints/lib/noframework.waypoints.min";

const counters = document.querySelectorAll(".counter");

if (counters.length) {
  counters.forEach(el => {
    let wp = new Waypoint({
      element: el,
      handler: () => {
        counterUp(el);
        //this.destroy();
      },
      offset: "bottom-in-view"
    });
  });
}
