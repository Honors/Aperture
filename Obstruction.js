function construct(constructor, args) {
  return new (constructor.bind.apply(constructor, [null].concat(args)));
}
var Obstruction = function(type, x, y, z, options) { 
  var geometries = {cylinder: THREE.CylinderGeometry, rectangle: THREE.CubeGeometry};
  var precision = 50;
  var geometry = construct(geometries[type], options.concat([precision, precision]));
  var material = new THREE.MeshBasicMaterial({ color: Math.random()*0x1000000 });
  var cube = new THREE.Mesh(geometry, material);
  cube.overdraw = true;
  cube.position.x = x;
  cube.position.z = z;
  cube.position.y = y;
  return cube;
};

