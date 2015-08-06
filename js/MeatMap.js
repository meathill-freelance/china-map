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
    var province_ids = _.flatten(slice.call(arguments, 1))
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
  createColorBar: function (colors, max, min) {
    this.el.setStart();
    var box = this.areas.getBBox()
      , bar = this.el.rect(box.width - 20, box.height - 180, 20, 160);
    bar.attr({
      fill: '270-' + colors.join('-'),
      stroke: 0
    });
    this.el.text(box.width, box.height - 190, max);
    this.el.text(box.width, box.height - 10, min);
    this.colorBar = this.el.setFinish();
    this.colorBar.attr('text-anchor', 'end');
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
    if (colors.length < 2 || provinces.length < 2) {
      return;
    }
    var range = getGradientRange(provinces);
    if (has_bar) {
      this.createColorBar(colors, range.max, range.min);
    }
    this.areas.attr('fill', this.config.colors.muted);
    colors = createGradientColors(colors, provinces, range);
    _.each(provinces, function (value, key) {
      if (isNaN(value)) {
        var options = _.omit(value, 'provinces');
        options.fill = colors[key];
        options.label = key;
        this.addGroup(options, _.keys(value.provinces));
      } else {
        this.provinces[key].num = value;
        this.provinces[key].color = colors[key];
        this.el.getById(this.provinces[key].eid).attr('fill', colors[key]);
      }
    }, this);
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
    eve('mouseover', this, data);
  },
  area_mouseOutHandler: function () {
    this.tip.remove();
    eve('mouseout', this);
  },
  mapSource_fetchedHandler: function (svg) {
    var doc = $.parseXML(svg);
    this.src = $(doc);
    this.render();
    eve('ready', this);
  }
};