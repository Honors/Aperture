var scene = new Scene();
scene.makeRoom(44, 45, 15);
var obstructions = [
  new Rectangle([36.125, 38.25, 2], [5.25, 1.5, 4]),
  new Rectangle([36.25, 5.875, 1.75], [6.5, 1.75, 3.5]),
  new Cylinder([15.25, 37.5, 7], [15.5, 0, 0], [0, 0, 2.5]),
  new Cylinder([12, 6, 5], [10, 0, 0], [0, 0, 1.75])
];
obstructions.map(function(obstruction) {
 (obstruction instanceof Rectangle ? 
  scene.addRectangle :
  scene.addCylinder).bind(scene)(
    obstruction.posCoords,
    obstruction.sizeCoords,
    obstruction instanceof Cylinder ? 
      obstruction.cylTraits :
      undefined);
});
var origin = scene.fitToRoom([10, 10, 10]);
scene.camera.position.x = origin[0];
scene.camera.position.y = origin[1];
scene.camera.position.z = origin[2];
var action = function() {
};
scene.render(action);

