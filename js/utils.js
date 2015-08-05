/**
 * Created by meathill on 15/8/5.
 */
var slice = Array.prototype.slice;

function getBetweenColor(a, b, percent) {
  return (a - b) * percent + b >> 0;
}

function getNum(value) {
  return isNaN(value) ? value.num : value;
}