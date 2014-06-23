var scene = new Scene();
scene.makeRoom(44, 45, 15);
var parseObstruction = function(line) {
  var cols = line.split(/\s+/),
      pos = cols.slice(1, 4).map(function(x) { return parseFloat(x); }),
      size = cols.slice(4, 7).map(function(x) { return parseFloat(x); }),
      traits = cols.slice(7, 10).map(function(x) { return parseFloat(x); });
  return new ({
    "6a32ada42": FireDetector,
    "Rectangle": Rectangle,
    "PressureV": Cylinder,
    "PressureVesselH": Cylinder
  }[cols[0]])(
    { x: pos[0], y: pos[1], z: pos[2] },
    { x: size[0], y: size[1], z: size[2] },
    traits);
};
var parse = function(x) {
  var lines = x.split("\n");
  return lines.filter(function(x) {
    return !x.match(/^\s*?$/);
  }).map(function(x) {
    return parseObstruction(x.replace(/^\s+/, ''));
  });
};
var setup = function() {
  var obstructions = parse(document.querySelector("[data-identifier='3dData']").innerText);
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
};
window.onload = setup;

