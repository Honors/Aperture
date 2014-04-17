function construct(constructor, args) {
  return new (constructor.bind.apply(constructor, [null].concat(args)));
}
var Obstruction = function(Geometry, options) { 
  var position = options.position,
      parameters = options.parameters,
      gray = options.gray,
      rotation = options.rotation,
      incline = options.incline;
  var x = position.x, y = position.y, z = position.z;
  var isRectangle = Geometry == THREE.CubeGeometry;
  var isSphere = Geometry == THREE.SphereGeometry;
  var isSurface = Geometry == THREE.ParametricGeometry;
  var precision = isRectangle ? 1 : (isSurface ? 50 : 50);
  var geometry = construct(Geometry, parameters.concat([precision, precision]));
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
  cube.rotation.x = frame.rotation.x = (rotation || 0) * Math.PI/180;
  cube.rotation.z = frame.rotation.z = (incline || 0) * Math.PI/180;
  console.log(cube.rotation);
  cube.rotation.y = frame.rotation.y = 0;
  this.shape = cube;
  this.frame = frame;
};
var ShapeData = function(position, size) {
  this.posCoords = [position.x, position.y, position.z];
  this.sizeCoords = [size.x, size.y, size.z];
  this.position = position;
  this.size = size;
};
var Rectangle = function(position, size, gray) {
  this.gray = gray;
  ShapeData.call(this, position, size);
};
Rectangle.prototype.addTo = function(scene) {
  var cube = new Obstruction(THREE.CubeGeometry, {
    position: this.position,
    parameters: [this.size.x, this.size.y, this.size.z],
    gray: this.gray
  });
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
  var cube = new Obstruction(THREE.CylinderGeometry, {
    position: this.position,
    parameters: [this.traits.radius, this.traits.radius, this.size.x],
    incline: this.traits.incline,
    rotation: this.traits.rotation
  });
  scene.add(cube.shape);
};
var Cloud = function(position, size) {
  ShapeData.call(this, position, size);
};
Cloud.prototype.addTo = function(scene) {
  var cube = new Obstruction(THREE.SphereGeometry, {
    position: this.position,
    parameters: [this.size.x]
  });
  scene.add(cube.shape);
};
var Surface = function(position, fun) {
  ShapeData.call(this, position, []);
  this.fun = fun;
  this.traitsCoords = [fun];
};
Surface.prototype.addTo = function(scene) {
  var cube = new Obstruction(THREE.ParametricGeometry, {
    position: this.position,
    parameters: [this.fun]
  });
  scene.add(cube.shape);
};
var FireDetector = function(pos) {
  return new Surface(
    pos,
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
    });
};

