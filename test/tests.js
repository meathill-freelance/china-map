QUnit.config.reorder = false;

var map = new MeatMap({
  el: 'map',
  width: 625,
  height: 517
});

function callback(target) {
  console.log(target);
}

map.once('ready', function () {
  QUnit.test('create map', function (assert) {
    assert.ok(map.el instanceof Raphael._Paper);
    assert.ok(map.el.canvas === document.getElementsByTagName('svg')[0]);
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