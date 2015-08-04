/**
 * Created by meathill on 15/8/4.
 */
'use strict';
(function ($) {
  /* -- js content here -- */

  Map.VERSION = '{{version}}';
  // 兼容CMD的导出
  var root = this;
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Map;
    }
    exports.MeatMap = Map;
  } else {
    root.MeatMap = Map;
  }
}.call(this, jQuery));