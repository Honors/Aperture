function construct(constructor, args) {
  console.log(args);
  return new (constructor.bind.apply(constructor, [null].concat(args)));
}
var Obstruction = function(Geometry, position, options) { 
  var x = position.x, y = position.y, z = position.z;
  var isCylinder = Geometry == THREE.CylinderGeometry;
  var precision = isCylinder ? 50 : 1;
  var geometry = construct(Geometry, options.concat([precision, precision]));
  var material = new THREE.MeshBasicMaterial({ wireframe: true, color: Math.random()*0x1000000 });
  var frame = new THREE.Mesh(geometry, material);
  material = new THREE.MeshBasicMaterial({ wireframe: false, color: Math.random()*0x1000000 });
  var cube = new THREE.Mesh(geometry, material);
  cube.overdraw = true;
  cube.position.x = frame.position.x = x;
  cube.position.z = frame.position.z = z;
  cube.position.y = frame.position.y = y;
  this.shape = cube;
  this.frame = frame;
};
var Rectangle = function(position, size) {
  this.posCoords = position;
  this.sizeCoords = size;
  this.position = {};
  this.position.x = position[0];
  this.position.y = position[1];
  this.position.z = position[2];
  this.size = {};
  this.size.x = size[0];
  this.size.y = size[1];
  this.size.z = size[2];
};
Rectangle.prototype.addTo = function(scene) {
  var cube = new Obstruction(THREE.CubeGeometry,
    this.position,
    [this.size.x, this.size.y, this.size.z]);
  scene.add(cube.shape);
};
var Cylinder = function(position, size, traits) {
  this.posCoords = position;
  this.sizeCoords = size;
  this.cylTraits = traits;
  this.position = {};
  this.position.x = position[0];
  this.position.y = position[1];
  this.position.z = position[2];
  this.size = {};
  this.size.x = size[0];
  this.size.y = size[1];
  this.size.z = size[2];
  this.traits = {};
  this.traits.rotation = traits[0];
  this.traits.incline = traits[1];
  this.traits.radius = traits[2];
};
Cylinder.prototype.addTo = function(scene) {
  var cube = new Obstruction(THREE.CylinderGeometry,
    this.position,
    [this.traits.radius, this.traits.radius, this.size.x]);
  scene.add(cube.shape);
};

