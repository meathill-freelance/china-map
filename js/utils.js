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

function getGradientRange(provinces) {
  var max = 0
    , min = 0;
  for (var key in provinces) {
    if (!provinces.hasOwnProperty(key)) {
      return;
    }
    var value = getNum(provinces[key]);
    max = max > value ? max : value;
    min = min < value ? min : value;
  }
  return {
    max: max,
    min: min,
    range: max - min
  };
}

function createGradientColors(colors, provinces, range) {
  var colorNum = colors.length
    , parts = 1 / (colorNum - 1);
  colors.reverse();
  return _.mapObject(provinces, function (value) {
    var num = getNum(value)
      , diff = num - range.min
      , percent = diff / range.range
      , index = percent / parts >> 0
      , color1 = colors[index]
      , color2 = colors[index + 1]
      , color  = {};
    if (!color2) {
      return color1;
    }

    color1 = Raphael.getRGB(color1);
    color2 = Raphael.getRGB(color2);
    percent = percent % parts / parts;
    color.r = getBetweenColor(color2.r, color1.r, percent);
    color.g = getBetweenColor(color2.g, color1.g, percent);
    color.b = getBetweenColor(color2.b, color1.b, percent);
    return Raphael.rgb(color.r, color.g, color.b);
  });
}