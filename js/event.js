/**
 * Created by meathill on 15/8/4.
 */
var eve = Raphael.eve;
Map.prototype = _.extend(Map.prototype, {
  off: function (event, handler) {
    eve.off(event, handler);
  },
  on: function (event, handler) {
    eve.on(event, handler);
  },
  once: function (event, handler) {
    eve.on(event, handler);
  },
  mouseover: function (handler) {
    eve.on('mouseover', handler);
  },
  mouseout: function (handler) {
    eve.on('mouseout', handler);
  }
});