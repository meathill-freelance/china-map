'use strict';
(function ($) {
  var root = this
    , slice = Array.prototype.slice
    , eve = Raphael.eve;

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
    document.getElementById(options.el).classList.add(this.config.className);

    this.loadMapSource();
    this.delegateEvents();
  };

  Map.VERSION = '{{version}}';

  Map.prototype = {
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
      this.provinces = provinces;
      this.fit();
    },
    addGroup: function (options) {
      var province_ids = slice.call(arguments, 1)
        , provinces = this.el.set();
      _.map(province_ids, function (id) {
        provinces.push(this.el.getById(this.provinces[id].eid));
      }, this);
      if (!options.parent) {
        provinces.attr(options);
      }
      provinces.options = options;
      this.groups.push(provinces);
      return provinces;
    },
    createMask: function () {
      var mask = this.el.rect(0, 0, this.width, this.height);
      mask.attr({
        fill: '#000',
        opacity: 0.8
      });
      return mask;
    },
    createTip: function () {
      return new Tip();
    },
    delegateEvents: function () {
      if (this.config.has_tip) {
        $(this.el.canvas)
          .on('click', 'path,rect', _.bind(this.area_clickHandler, this))
          .on('mousemove', 'path', _.bind(this.area_mouseMoveHandler, this))
          .on('mouseover', 'path', _.bind(this.area_mouseOverHandler, this))
          .on('mouseout', 'path', _.bind(this.area_mouseOutHandler, this));
      }
    },
    findGroup: function (target) {
      return _.find(this.groups, function (group) {
        if (this.group === group) {
          return false;
        }
        for (var i = 0, len = group.length; i < len; i++) {
          if (group[i].node === target) {
            return true;
          }
        }
        return false;
      }, this);
    },
    fit: function () {
      var box = this.areas.getBBox();
      this.el.setViewBox(0, 0, box.width, box.height);
    },
    getBetweenColor: function (a, b, percent) {
      return (a - b) * percent + b >> 0;
    },
    highlight: function (province) {
      province = this.el.getById(this.provinces[province].eid);
      province.toFront();
      return province.glow({
        color: '#FFF',
        width: 16,
        opacity: 0.75
      });
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
        var box = this.areas.getBBox()
          , bar = this.el.rect(box.width - 20, box.height - 180, 20, 160);
        bar.attr({
          fill: '90-' + colors.join('-'),
          stroke: 0
        });
        this.el.text(box.width, box.height - 190, max);
        this.el.text(box.width, box.height - 10, min);
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
        this.provinces[key].num = value;
        this.provinces[key].color = Raphael.rgb(color.r, color.g, color.b);
        this.el.getById(this.provinces[key].eid).attr('fill', Raphael.rgb(color.r, color.g, color.b));
      }, this);
    },
    off: function (event, handler) {
      eve.off(event, handler);
    },
    on: function (event, handler) {
      eve.on(event, handler);
    },
    once: function (event, handler) {
      eve.on(event, handler);
    },
    area_clickHandler: function (event) {
      var box;
      // 点击了黑色蒙版
      if (this.mask && event.target === this.mask.node && this.group) {
        var parent = this.group.options.parent;
        if (parent) {
          box = parent.getBBox();
          this.el.setViewBox(box.x, box.y, box.width, box.height);
          parent.toFront();
          this.group = parent;
        } else {
          this.fit();
          this.mask.hide();
          this.group = null;
        }
        return true;
      }

      // 点击了某个大组
      var group = this.group = this.findGroup(event.target);
      if (group) {
        box = group.getBBox();
        this.el.setViewBox(box.x, box.y, box.width, box.height, true);
        this.mask = this.mask || this.createMask();
        this.mask.show();
        this.mask.toFront();
        group.toFront();
        _.chain(this.groups)
          .filter(function (item) {
            return item.options.parent === group
          })
          .each(function (group) {
            group.attr(group.options);
          });
        return true;
      }

      // 都不是，点击了某个省份
      var province = event.target.classList[0]
        , href = this.provinces[province].href;
      if (href) {
        window.open(href);
      }
    },
    area_mouseMoveHandler: function (event) {
      this.tip.setPosition(event);
    },
    area_mouseOverHandler: function (event) {
      // 先判断是不是在区域里
      var target = event.target
        , data
        , group = this.findGroup(target);
      if (group) {
        data = group.options;
      } else {
        var province = target.classList[0];
        data = this.provinces[province];
      }
      this.tip = this.tip || this.createTip();
      this.tip
        .setContent(Raphael.fullfill(this.config.tip_template, data))
        .show(event);
    },
    area_mouseOutHandler: function () {
      this.tip.remove();
    },
    mapSource_fetchedHandler: function (svg) {
      var doc = $.parseXML(svg);
      this.src = $(doc);
      this.render();
      eve('ready', this);
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
}.call(this, jQuery));