var scene = new Scene(document.getElementById('map'));
scene.makeRoom(44, 45, 15);
var obstructions = [
  new Rectangle([36.125, 38.25, 2], [5.25, 1.5, 4]),
  new Rectangle([36.25, 5.875, 1.75], [6.5, 1.75, 3.5]),
  new Cylinder([15.25, 37.5, 7], [15.5, 0, 0], [0, 0, 2.5]),
  new Cylinder([12, 6, 5], [10, 0, 0], [0, 0, 1.75]),
  new Surface([12, 6, 5], function(u,v) {
    // TODO: convert from sphere to realistic surface
    var theta = 360 * u/50, 
        phi = 360 * v/50;
    var R = 4,
        r = R * cos(phi);
    return new THREE.Vector3(
      sqrt(R*R - r*r) * cos(theta),
      sqrt(R*R - r*r) * sin(theta),
      r);
  }),
  new Cloud([12, 12, 12], [10, 0, 0])
];
obstructions.map(function(obstruction) {
  match(
    [[Rectangle, scene.addRectangle],
     [Cylinder, scene.addCylinder],
     [Cloud, scene.addCloud],
     [Surface, scene.addSurface]],
    obstruction).bind(scene)(
      obstruction.posCoords,
      obstruction.sizeCoords,
      obstruction.traitsCoords);
});
scene.render();

