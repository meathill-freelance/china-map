'use strict';
(function ($) {
  var root = this;

  var config = {
    'asset': '../img/china.svg'
  };

  var Map = function (options) {
    this.width = options.width;
    this.height = options.height;
    this.el = Raphael(options.el, this.width, this.height);

    this.loadMapSource();
  };

  Map.VERSION = '{{version}}';

  Map.prototype = $.extend({
    areas: [],
    render: function () {
      var self = this;
      this.src.find('path').each(function (i) {
        var area = self.el.path(this.getAttribute('d'));
        area.attr('fill', '#369');
        self.areas.push(area);
      });
    },
    loadMapSource: function () {
      $.get(config.asset, $.proxy(this.mapSource_fetchedHandler, this), 'html');
    },
    mapSource_fetchedHandler: function (svg) {
      var doc = $.parseXML(svg);
      this.src = $(doc);
      this.render();
      this.emit('ready', this);
    }
  }, EventEmitter.prototype);

  // 兼容CMD的导出
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Map;
    }
    exports.MeatMap = Map;
  } else {
    root.MeatMap = Map;
  }
}.call(this, jQuery));