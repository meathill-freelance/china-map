'use strict';
(function ($) {
  var root = this
    , slice = Array.prototype.slice;

  var Map = function (options) {
    this.width = options.width;
    this.height = options.height;
    this.el = Raphael(options.el, this.width, this.height);

    this.loadMapSource();
  };

  Map.VERSION = '{{version}}';

  Map.prototype = $.extend({
    areas: [],
    groups: [],
    render: function () {
      var self = this
        , area;
      this.labels = this.el.set();
      this.src.find('path').each(function (i) {
        var obj = Map.config.provinces[i];
        area = self.el.path(this.getAttribute('d'));
        area.attr({
          'stroke': '#FFF',
          'fill': '#AAD5FF'
        });
        self.areas.push(area);

        if (Map.config.has_label) {
          var box = area.getBBox()
            , label = self.el.text(0, 0, obj.label);
          label.attr({
            x: box.x + (box.width >> 1),
            y: box.y + (box.height >> 1)
          });
          self.labels.push(label);
        }

        obj.className = obj.className || 'province';
        area.node.setAttribute('class', obj.className);
        obj.eid = area.id;
      });
      this.labels.toFront();
    },
    addGroup: function (options) {
      var province_ids = slice.call(arguments, 1)
        , provinces = [];
      options.id = this.groups.length;
      for (var i = 0, len = province_ids.length; i < len; i++) {
        provinces.push(this.src.find('province.' + province_ids[i]));
      }
      options.provinces = provinces;
      this.groups.push(options);
    },
    setGradient: function (top, bottom, param3) {

    },
    loadMapSource: function () {
      $.get(Map.config.asset, $.proxy(this.mapSource_fetchedHandler, this), 'html');
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