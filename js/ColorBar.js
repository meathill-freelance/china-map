/**
 * Created by meathill on 15/8/7.
 */
var ColorBar = function (colors, max, min, paper, box) {
  paper.setStart();
  var bar = paper.rect(box.width - 20, box.height - 180, 20, 160);
  bar.attr({
    fill: '270-' + colors.join('-'),
    stroke: 0
  });
  paper.text(box.width, box.height - 190, max);
  paper.text(box.width, box.height - 10, min);
  this.el = paper.setFinish();
  this.el.attr('text-anchor', 'end');
};

ColorBar.prototype = {
  toFront: function () {
    this.el.toFront();
  }
};