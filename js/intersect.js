var Intersector = function(origin, surface, plane) {
  this.origin = origin;
  this.surface = surface;
  this.plane = plane;
  this.Epsilon = 0.01;
};
Intersector.prototype.fuzzyEqual = function(a, b) {
  return Math.abs(a - b) <= this.Epsilon;
};
Intersector.prototype.pointInRange = function(x, a, b) {
  return (x < a && x > b) || (x > a && x < b);
};
Intersector.prototype.findPointIntersection = function(surfaceSlice, elevation, min, max) {
  var mid = (max + min)/2;
  var minE = surfaceSlice(min).z, maxE = surfaceSlice(max).z, midE = surfaceSlice(mid).z;
  if( this.fuzzyEqual(elevation, midE) || this.fuzzyEqual(mid, max) ) {
    return surfaceSlice(mid);
  }
  if( this.pointInRange(elevation, minE, midE) ) {
    return this.findPointIntersection(surfaceSlice, elevation, min, mid);
  } else if( this.pointInRange(elevation, midE, maxE) ) {
    return this.findPointIntersection(surfaceSlice, elevation, mid, max);
  } else {
    console.log(minE, maxE);
    throw new Error("Could not intersect.");
  }
};
Intersector.prototype.intersect = function() {
  var precision = 100;
  var intersections = [];
  for(var theta = 0; theta <= 1; theta += 1/precision) {
    var slice = function(h) { return this.surface(h, theta).add(this.origin); }.bind(this);
    try {
      var intersection = this.findPointIntersection(slice, this.plane, 0, 1);
      intersections.push(intersection);
    } catch(e) {}
  }
  return intersections;
};
var intersect = function(normal, position) {
  var fireDetector = new FireDetector(100);
  var f = function(h, theta) {
    var p = fireDetector.f(h, theta);
    var basis = formBasis(normal);
    fireDetector.position = position;
    fireDetector.basis = basis;
    return basis.map(function(v, i) {
      return v.clone().multiplyScalar(p[["x", "y", "z"][i]]);
    }).reduce(function(a, x) { return a.clone().add(x); });
  };
  var cvs = document.querySelector("#cvs"),
      ctx = cvs.getContext("2d");
  var clear = function() {
    cvs.width = cvs.width;
    ctx.translate(250, 250);
    ctx.rotate(-Math.PI/2);
    ctx.translate(-250, -250);
  };
  var render = function() {
    var ps = new Intersector(position, f, -1).intersect();
    ps.forEach(function(p) {
      p.add(new THREE.Vector3(250, 250, 0));
    });
    ctx.lineWidth = "1";
    ctx.strokeStyle = "#000";
    ctx.beginPath(); 
    ctx.moveTo(ps[0].x, ps[0].y);
    ps.slice(1).forEach(function(p, i) {
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.beginPath(); 
      ctx.moveTo(p.x, p.y);
    });
    ctx.lineTo(ps[0].x, ps[0].y);
    ctx.stroke();
  };
  clear();
  render();

  var o = fireDetector;
  scene.children.forEach(function(c) {
    scene.remove(c);
  });
  ObjectManipulator.renderSTL(
    o.STL(20, o.position, o.basis, true),
    "FD", "FD");
  ObjectManipulator.renderSTL(
    new Rectangle(300, 300, 0.2).STL(20, new THREE.Vector3(0, 0, -1), formBasis(new THREE.Vector3(0, 0, 1))),
    "Floor", "Floor");
};

var renderer = new THREE.WebGLRenderer();
renderer.setSize(500, 500);
document.body.appendChild(renderer.domElement);
var camera = new THREE.PerspectiveCamera(45, renderer.domElement.offsetWidth/renderer.domElement.offsetHeight, 1, 6000);
var scene = new THREE.Scene();
var controls = new Controls(renderer.render.bind(renderer), camera, scene, renderer.domElement);
controls.rotationVector = new THREE.Vector3(0, 0, 1);
controls._position = new THREE.Vector3(0, 0, -500);

var normal = new THREE.Vector3(1, 0, 1),
    position = new THREE.Vector3(0, 0, -5);
intersect(normal, position);


