QUnit.config.reorder = false;

var map = new MeatMap({
  el: 'map',
  width: 600,
  height: 500
});

function callback(target) {
  console.log(target);
}

map.once('ready', function () {
  QUnit.test('create map', function (assert) {
    assert.ok(map.el instanceof Raphael._Paper);
    assert.ok(map.el.canvas === document.getElementsByTagName('svg')[0]);
  });

  QUnit.test('set color gradient', function (assert) {
    map.setGradient(['#CC0000', '#FF9999', '#FFDC00'], {
      beijing: 10500,
      tianjin: 9000,
      henan: 8000,
      hebei: 7000,
      hubei: 6000,
      jiangxi: 5500,
      hunan: 5000,
      guangdong: 4000,
      fujian: 3000,
      anhui: 2000,
      taiwan: 1000,
      shanghai: 500
    }, true);
    assert.ok(map.el.getById(0).attr('fill') === '#DDD');
    assert.ok(map.el.getById(map.config.provinces['beijing'].eid).attr('fill') === '#cc0000');
    assert.ok(map.el.getById(map.config.provinces['jiangxi'].eid).attr('fill') === '#ff9999');
    assert.ok(map.el.getById(map.config.provinces['shanghai'].eid).attr('fill') === '#ffdc00');
  });

  QUnit.test('set group', function (assert) {
    map.addGroup({
      label: '东三省',
      className: 'dongbei',
      color: '#85144B'
    }, 'heilongjiang', 'liaoning', 'jilin');
    assert.ok(map.el.getById(map.config.provinces['heilongjiang'].eid).attr('fill') === '#85144B');
    assert.ok(map.el.getById(map.config.provinces['liaoning'].eid).attr('fill') === '#85144B');
    assert.ok(map.el.getById(map.config.provinces['jilin'].eid).attr('fill') === '#85144B');
  });

  QUnit.test('show label', function (assert) {
    assert.ok($('.meat-map-tip').length === 0);
  });
});