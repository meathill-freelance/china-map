'use strict';
(function ($) {
  var root = this
    , slice = Array.prototype.slice;

  function Tip() {
    this.$el = $('<div class="meat-map-tip"></div>');
  }

  Tip.prototype = {
    remove: function () {
      this.$el.remove();
    },
    setContent: function (content) {
      this.$el.html(content);
      return this;
    },
    setPosition: function (event) {
      this.$el.css({
        left: event.clientX - this.$el.outerWidth() / 2,
        top: event.clientY - this.$el.outerHeight() - 5
      });
      return this;
    },
    show: function (event) {
      this.$el.appendTo('body');
      return this.setPosition(event);
    }
  };

  var Map = function (options) {
    this.width = options.width;
    this.height = options.height;
    this.el = Raphael(options.el, this.width, this.height);
    this.config = _.clone(Map.config);

    this.loadMapSource();
    this.delegateEvents();
  };

  Map.VERSION = '{{version}}';

  Map.prototype = $.extend({
    areas: null,
    groups: [],
    render: function () {
      var self = this
        , provinces = {}
        , area;
      this.areas = this.el.set();
      if (this.config.has_label) {
        this.labels = this.el.set();
      }
      this.src.find('path').each(function (i) {
        var obj = self.config.provinces[i];
        area = self.el.path(this.getAttribute('d'));
        area.attr({
          'stroke': '#FFF',
          'fill': '#AAD5FF'
        });
        self.areas.push(area);
        if (self.config.has_tip) {
          self.tipTemplate = Handlebars.compile(self.config.tip_template);
          area.mousemove(_.bind(self.area_mouseMoveHandler, self));
          area.mouseover(_.bind(self.area_mouseOverHandler, self));
          area.mouseout(_.bind(self.area_mouseOutHandler, self));
        }

        if (self.config.has_label) {
          var box = area.getBBox()
            , label = self.el.text(0, 0, obj.label);
          label.attr({
            x: box.x + (box.width >> 1),
            y: box.y + (box.height >> 1)
          });
          self.labels.push(label);
        }

        area.node.setAttribute('class', [obj.id, 'province', 'area'].join(' '));
        obj.eid = area.id;
        provinces[obj.id] = obj;
      });
      if (this.config.has_label) {
        this.labels.toFront();
      }
      this.config.provinces = provinces;
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
    createTip: function () {
      return new Tip();
    },
    delegateEvents: function () {
      $(this.el.node).on('click', function (event) {
        console.log(event.target, event.originalEvent.target);
      });
    },
    getBetweenColor: function (a, b, percent) {
      return (a - b) * percent + b >> 0;
    },
    loadMapSource: function () {
      $.get(this.config.asset, $.proxy(this.mapSource_fetchedHandler, this), 'html');
    },
    setGradient: function (colors, provinces, has_bar) {
      var max = _.max(provinces)
        , min = _.min(provinces)
        , range =  max - min
        , colorNum = colors.length
        , parts = 1 / (colorNum - 1);
      if (colorNum < 2) {
        return;
      }
      colors.reverse();
      if (has_bar) {
        this.el.setStart();
        var bar = this.el.rect(this.width - 20, this.height - 180, 20, 160);
        bar.attr({
          fill: '90-' + colors.join('-'),
          stroke: 0
        });
        this.el.text(this.width, this.height - 190, max)
        this.el.text(this.width, this.height - 10, min);
        this.colorBar = this.el.setFinish();
        this.colorBar.attr('text-anchor', 'end');
      }
      colors = _.map(colors, function (color) {
        return Raphael.color(color);
      });
      this.areas.attr('fill', this.config.colors.muted);
      _.each(provinces, function (value, key) {
        var diff = value - min
          , percent = diff / range
          , index = percent / parts >> 0
          , color1 = colors[index]
          , color2 = colors[index + 1]
          , color  = {};
        if (!color2) {
          color = color1;
        } else {
          percent = percent % parts / parts;
          color.r = this.getBetweenColor(color2.r, color1.r, percent);
          color.g = this.getBetweenColor(color2.g, color1.g, percent);
          color.b = this.getBetweenColor(color2.b, color1.b, percent);
        }
        this.config.provinces[key].num = value;
        this.el.getById(this.config.provinces[key].eid).attr('fill', Raphael.rgb(color.r, color.g, color.b));
      }, this);
    },
    area_mouseMoveHandler: function (event) {
      this.tip.setPosition(event);
    },
    area_mouseOverHandler: function (event) {
      var province = event.target.classList[0]
        , data = this.config.provinces[province];
      this.tip = this.tip || this.createTip();
      this.tip
        .setContent(this.tipTemplate(data))
        .show(event);
    },
    area_mouseOutHandler: function () {
      this.tip.remove();
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