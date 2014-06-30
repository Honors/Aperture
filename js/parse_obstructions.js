var ObstructionParser = {};

(function() {

var parseObstruction = function(line) {
  var cols = line.split(/\s+/),
      rest = cols.slice(2),
      pos = rest.slice(0,3).map(function(x) { return parseFloat(x); }),
      size = rest.slice(3, 6).map(function(x) { return parseFloat(x); }),
      traits = rest.slice(6, 9).map(function(x) { return parseFloat(x) * Math.PI/180; });
  var obs = new ({
    "Rectangle": Rectangle,
    "PressureVesselV": Vessel,
    "PressureVesselH": Vessel,
    "CylinderH": Cylinder,
    "CylinderV": Cylinder
  }[cols[0]])(size[0], size[1], size[2]);
  obs.position = new THREE.Vector3(pos[0], pos[1], pos[2]);
  obs.name = cols[1];
  if( cols[0].match(/H$/) ) {
    obs.normal = new THREE.Vector3(1, 0, 0);
    obs.type += "H";
  } else {
    obs.normal = new THREE.Vector3(0, 0, 1);
  }
  var z = new THREE.Vector3(0, 0, 1);
  var rotation = new THREE.Matrix4().makeRotationAxis( z, traits[1] );
  var y = new THREE.Vector3(0, 1, 0);
  var incline = new THREE.Matrix4().makeRotationAxis( y, traits[0] );
  obs.normal.applyMatrix4(rotation).applyMatrix4(incline);
  obs.input = { pos: pos, size: size, traits: traits, shape: cols[0] };
  return obs;
};
var parseFireDetector = function(line) {
  var cols = line.split(/\s+/g),
      name = cols[0],
      rest = cols.slice(1),
      pos = rest.slice(0, 3).map(function(x) { return parseFloat(x); }),
      traits = rest.slice(3, 5).map(function(x) { return parseFloat(x) * Math.PI/180; });
  var obs = new FireDetector(100);
  obs.normal = new THREE.Vector3(1, 0, 0);
  obs.position = new THREE.Vector3(pos[0], pos[1], pos[2]);
  obs.name = name;

  var z = new THREE.Vector3(0, 0, 1);
  var rotation = new THREE.Matrix4().makeRotationAxis( z, traits[0] );
  var y = new THREE.Vector3(0, 1, 0);
  var incline = new THREE.Matrix4().makeRotationAxis( y, -traits[1] );
  obs.normal.applyMatrix4(incline).applyMatrix4(rotation);
  obs.input = { pos: pos, traits: traits };

  return obs;
};
var parseGasDetector = function(line) {
  var cols = line.split(/\s+/g),
      pos = cols.slice(0, 3).map(function(x) { return parseFloat(x); }),
      radius = parseFloat(cols[3]);
  var obs = new GasDetector(radius);
  obs.normal = new THREE.Vector3(1, 0, 0);
  obs.position = new THREE.Vector3(pos[0], pos[1], pos[2]);
  obs.name = "GasD";
  return obs;
};
var parseList = function(parseItem) {
  return function(x) {
    var lines = x.split("||");
    return lines.filter(function(x) {
      return !x.match(/^\s*?$/);
    }).map(function(x) {
      return parseItem(x.replace(/^\s+/, ''));
    });
  };
};
var parseGases = ObstructionParser.parseGases = parseList(parseGasDetector);
var parseFDs = ObstructionParser.parseFDs = parseList(parseFireDetector);
var parseObstructions = ObstructionParser.parse = parseList(parseObstruction);

}());

