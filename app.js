var scene = new Scene();
Array(8).join(0).split(0).map(function() {
  var x = Math.random() * 10;
  var z = Math.random() * -10;
  var cube = new Obstruction("cylinder", x, 0.2, z, [1, 1, 1]);
  scene.add(cube);
});
scene.add(new Obstruction("rectangle", 5, 0, -5, [20, 0.2, 20]));
scene.camera.position.z = 1;
var action = function() {
};
scene.render(action);

