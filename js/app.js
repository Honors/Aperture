var scene = new Scene(document.getElementById('map'));
scene.makeRoom(44, 45, 15);
var obstructions = [
  new Rectangle(
    {x: 36.125, y: 38.25, z: 2},
    {x: 5.25, y: 1.5, z: 4}),
  new Rectangle(
    {x: 36.25, y: 5.875, z: 1.75},
    {x: 6.5, y: 1.75, z: 3.5}),
  new Cylinder(
    {x: 15.25, y: 37.5, z: 7},
    {x: 15.5, y: 0, z: 0},
    [0, Math.PI/2, 2.5]),
  new Cylinder(
    {x: 12, y: 6, z: 5},
    {x: 10, y: 0, z: 0},
    [0, Math.PI/2, 1.75]),
  /*
  new Cloud(
    {x: 12, y: 12, z: 12},
    {x: 10, y: 0, z: 0}),
  new Surface(
    {x: 12, y: 6, z: 5},
    function(u, v) {
      // A surface of revolution from a two-piece function
      var r = 5,
	  t = 2 * Math.PI * u,
	  s = v;
      if( s >= 0.5 ) {
	s = 2 * (s - 0.5);
	// s = 0..1
	return new THREE.Vector3(
	  cos(t) * (1 - s) * r,
	  sin(t) * (1 - s) * r,
	  r + 2 * Math.sqrt(s));
      } else {
	s = 2 * s;
	// s = 0..1
	return new THREE.Vector3(
	  cos(t) * s * r,
	  sin(t) * s * r,
	  s * r);
      }
    })*/
];
obstructions.map(function(obstruction) {
  match(
    [[Rectangle, scene.addRectangle],
     [Cylinder, scene.addCylinder],
     [Cloud, scene.addCloud],
     [Surface, scene.addSurface]],
    obstruction).bind(scene)(
      obstruction.position,
      obstruction.size,
      obstruction.traitsCoords);
});
scene.render();

