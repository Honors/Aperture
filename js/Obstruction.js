function construct(constructor, args) {
  return new (constructor.bind.apply(constructor, [null].concat(args)));
}
var Obstruction = function(Geometry, position, options, gray) { 
  var x = position.x, y = position.y, z = position.z;
  var isRectangle = Geometry == THREE.CubeGeometry;
  var isSphere = Geometry == THREE.SphereGeometry;
  var precision = isRectangle ? 1 : 50;
  var geometry = construct(Geometry, options.concat([precision, precision]));
  var material = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: Math.random()*0x1000000
  });
  var frame = new THREE.Mesh(geometry, material);
  material = new THREE.MeshBasicMaterial({
    wireframe: false,
    transparent: isSphere,
    opacity: isSphere ? 0.7 : 1,
    color: gray ? 
      0x444444 :
      (isSphere ?
       0xbada55 :
       Math.floor(Math.random()*0x40+0x60)*0x10101)
  });
  var cube = new THREE.Mesh(geometry, material);
  cube.overdraw = true;
  cube.position.x = frame.position.x = x;
  cube.position.z = frame.position.z = z;
  cube.position.y = frame.position.y = y;
  this.shape = cube;
  this.frame = frame;
};
var ShapeData = function(position, size) {
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
var Rectangle = function(position, size, gray) {
  this.gray = gray;
  ShapeData.call(this, position, size);
};
Rectangle.prototype.addTo = function(scene) {
  var cube = new Obstruction(THREE.CubeGeometry,
    this.position,
    [this.size.x, this.size.y, this.size.z],
    this.gray);
  scene.add(cube.shape);
};
var Cylinder = function(position, size, traits) {
  ShapeData.call(this, position, size);
  this.traitsCoords = traits;
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
var Cloud = function(position, size) {
  ShapeData.call(this, position, size);
};
Cloud.prototype.addTo = function(scene) {
  var cube = new Obstruction(THREE.SphereGeometry,
    this.position,
    [this.size.x]);
  scene.add(cube.shape);
};
var Surface = function(position, fun) {
  ShapeData.call(this, position, []);
  this.fun = fun;
  this.traitsCoords = [fun];
};
Surface.prototype.addTo = function(scene) {
  var cube = new Obstruction(THREE.ParametricGeometry,
    this.position,
    [this.fun]);
  scene.add(cube.shape);
};

