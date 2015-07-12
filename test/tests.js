var map = new MeatMap({
  el: 'map',
  width: 625,
  height: 517
});

map.once('ready', function () {
  QUnit.test('create map', function (assert) {
    assert.ok(map.el instanceof Raphael._Paper);
    assert.ok(map.el.canvas === document.getElementsByTagName('svg')[0]);
  });

  QUnit.test('change color', function (assert) {

  });

  QUnit.test('zoom in area', function (assert) {

  });
});


