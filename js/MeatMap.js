'use strict';
(function () {
  var root = this;

  var config = {
    'asset': 'img/china.svg'
  };

  var Map = function (options) {
    this.width = options.width;
    this.height = options.height;
    this.el = Raphael(options.el, this.width, this.height);

    this.loadMapSource();
  };

  Map.VERSION = '{{version}}';

  Map.prototype = {
    render: function () {

    },
    loadMapSource: function () {
      var xhr = new XMLHttpRequest();
      xhr.onload = this.mapSource_fetchedHandler;
      xhr.open('get', config.asset, true);
      xhr.send();
    },
    mapSource_fetchedHandler: function () {
      this.render();
      this.trigger('ready', this);
    }
  };

  // 兼容CMD的导出
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Map;
    }
    exports.MeatMap = Map;
  } else {
    root.MeatMap = Map;
  }
}.call(this));