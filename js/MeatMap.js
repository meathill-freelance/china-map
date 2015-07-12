'use strict';
(function ($) {
  var root = this;

  var config = {
    'asset': '../img/china.svg',
    'provinces': [
      "海南",
      "广东",
      "云南",
      "广西",
      "台湾",
      "福建",
      "贵州",
      "江西",
      "湖南",
      "四川",
      "西藏",
      "浙江",
      "重庆",
      "湖北",
      "安徽",
      "江苏",
      "河南",
      "陕西",
      "青海",
      "山西",
      "山东",
      "宁夏",
      "河北",
      "新疆",
      "内蒙古",
      "北京&天津",
      "辽宁",
      "吉林",
      "黑龙江",
      "甘肃",
      "上海",
      "香港",
      "澳门"
    ]
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
      var self = this
        , area;
      this.labels = this.el.set();
      this.src.find('path').each(function (i) {
        area = self.el.path(this.getAttribute('d'));
        area.attr('stroke-width', 0);
        area.node.setAttribute('class', 'color-4' + (i < 3 ? ' bg' : ''));
        self.areas.push(area);

        if (i < 3) { // 前面三层是边框
          return true;
        }
        var box = area.getBBox()
          , label = self.el.text(0, 0, config.provinces[i - 3])
          , lbox = label.getBBox();
        label.attr({
          x: box.x + (box.width >> 1),
          y: box.y + (box.height >> 1)
        });
        self.labels.push(label);
      });
      this.labels.toFront();
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