var scene = new Scene(document.getElementById('map'));
scene.makeRoom(44, 45, 15);
var obstructions = [
  new Rectangle([36.125, 38.25, 2], [5.25, 1.5, 4]),
  new Rectangle([36.25, 5.875, 1.75], [6.5, 1.75, 3.5]),
  new Cylinder([15.25, 37.5, 7], [15.5, 0, 0], [0, 0, 2.5]),
  new Cloud([12, 12, 12], [10, 0, 0]),
  new Cylinder([12, 6, 5], [10, 0, 0], [0, 0, 1.75]),
  new Surface([12, 6, 5], function(u,v) {
    var t = 2 * Math.PI * u,
        s = v;
    var r = 10;
    if( s >= 0.5 ) {
      return new THREE.Vector3(cos(t) * (1 - s) * r, sin(t) * (1 - s) * r, 0.5 * r);
    } else {
      return new THREE.Vector3(cos(t) * s * r, sin(t) * s * r, s * r);
    }
  })
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

