'use strict';

var Map = function (options) {
  this.width = options.width;
  this.height = options.height;
  this.el = Raphael(options.el, this.width, this.height);
  this.config = _.clone(Map.config);
  document.getElementById(options.el).classList.add(this.config.className);

  this.loadMapSource();
  this.delegateEvents();
};

Map.prototype = {
  areas: null,
  colors: null,
  groups: null,
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
    this.groups = [this.areas];
    this.fit();
  },
  addGroup: function (options) {
    var province_ids = _.flatten(slice.call(arguments, 1))
      , provinces = this.el.set();
    _.map(province_ids, function (id) {
      provinces.push(this.el.getById(this.provinces[id].eid));
    }, this);
    if (!options.parent || options.parent === this.areas) {
      provinces.attr(options);
    }
    if (options.not_really) { // 不是真的要创建新的组
      return;
    }
    provinces.options = options;
    this.groups.push(provinces);
    return provinces;
  },
  createColorBar: function (colors, max, min) {
    return new ColorBar(colors, max, min, this.el, this.areas.getBBox());
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
    return _.find(this.groups, function (group, index) {
      if (this.group === group || index === 0) {
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
  highlight: function (province) {
    if (province in this.provinces) {
      province = this.el.getById(this.provinces[province].eid);
      if (this.mask && $(province.node).index() < $(this.mask.node).index()) {
        return;
      }
      province.toFront();
      province.node.classList.add('active');
    } else {
      province = _.isString(province) ? _.find(this.groups, function (group) {
        return group.options.label === province;
      }) :  province;
      province.forEach(function (item) {
        item.node.classList.add('active');
      });
    }
    this.highlightArea = province;
    return this.highlightArea;
  },
  highlightOff: function () {
    if (this.highlightArea.node) {
      this.highlightArea.node.classList.remove('active');
    } else {
      this.highlightArea.forEach(function (item) {
        item.node.classList.remove('active');
      });
    }
  },
  loadMapSource: function () {
    $.get(this.config.asset, $.proxy(this.mapSource_fetchedHandler, this), 'html');
  },
  setGradient: function (colors, provinces, parent, has_bar) {
    if (colors.length < 2 || provinces.length < 2) {
      return;
    }
    this.colors = colors;
    var range = getGradientRange(provinces);
    if (has_bar) {
      this.colorBar = this.createColorBar(colors, range.max, range.min);
    }
    this.areas.attr('fill', this.config.colors.muted);
    colors = createGradientColors(colors, provinces, range);
    parent = parent || this.areas;
    _.each(provinces, function (value, key) {
      if (isNaN(value)) {
        value.fill = colors[key];
        value.label = key;
        value.parent = parent;
        this.addGroup(value, _.keys(value.provinces));
        if (parent === this.areas) {
          this.areas.options = {provinces: provinces};
        }
      } else {
        this.provinces[key].num = value;
        this.provinces[key].color = colors[key];
        this.el.getById(this.provinces[key].eid).attr('fill', colors[key]);
      }
    }, this);
    return colors;
  },
  area_clickHandler: function (event) {
    var box;
    // 点击了黑色蒙版
    if (this.mask && event.target === this.mask.node && this.group) {
      var parent = this.group.options.parent;
      if (parent === this.areas) {
        this.fit();
        this.mask.hide();
        this.group = null;
      } else {
        box = parent.getBBox();
        this.el.setViewBox(box.x, box.y, box.width, box.height);
        parent.toFront();
        this.group = parent;
      }
      this.setGradient(this.colors, parent.options.provinces, parent);
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
      if (group.options.provinces) {
        if (this.colorBar) {
          this.colorBar.toFront();
        }
        this.setGradient(this.colors, group.options.provinces, group);
      } else {
        _.chain(this.groups)
          .filter(function (item) {
            return item.options.parent === group
          })
          .each(function (group) {
            group.attr(group.options);
          });
      }

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
      this.highlight(group);
    } else {
      var province = target.classList[0];
      data = this.provinces[province];
    }
    this.tip = this.tip || this.createTip();
    this.tip
      .setContent(Raphael.fullfill(this.config.tip_template, data))
      .show(event);
    eve('mouseover', this, data);
  },
  area_mouseOutHandler: function () {
    this.tip.remove();
    this.highlightOff();
    eve('mouseout', this);
  },
  mapSource_fetchedHandler: function (svg) {
    var doc = $.parseXML(svg);
    this.src = $(doc);
    this.render();
    eve('ready', this);
  }
};