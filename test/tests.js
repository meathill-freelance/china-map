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
    map.setGradient(['#CC0000', '#FF9999'], {
      beijing: 10000,
      tianjin: 9000,
      henan: 8000,
      hebei: 7000,
      hubei: 6000,
      hunan: 5000,
      guangdong: 4000,
      fujian: 3000,
      anhui: 2000,
      taiwan: 1000,
      shanghai: 500
    });
    assert.ok(true);
  });

  QUnit.test('set group', function (assert) {
    map.addGroup({
      label: '东三省',
      className: 'color-2'
    }, 'heilongjiang', 'liaoning', 'shenyang');
  });

  QUnit.test('zoom in area', function (assert) {

  });
});