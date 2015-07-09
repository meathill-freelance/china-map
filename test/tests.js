QUnit.test('hello test', function (assert) {
  assert.ok('1' == 1, 'passed!');
});

QUnit.test('create map', function (assert) {
  var map = new MeatMap({
      el: 'map'
    })
    , done = assert.async();
  map.once('ready', function () {
    assert.ok(map.el === document.getElementsByTagName('svg')[0]);
    done();
  });
});

QUnit.test('change color', function (assert) {

});

QUnit.test('zoom in area', function (assert) {

});