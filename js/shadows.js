var Triangle = function(a, b, c) {
  this.points = [a, b, c];
};
var ShadowCaster = function(triangle, plane, camera) {
  this.points = triangle.points;
  this.plane = plane;
  this.cameraOrigin = camera;
};
ShadowCaster.prototype.shootThrough = function(point) {
  var direction = point.clone().sub(this.cameraOrigin),
      extended = direction.clone().multiplyScalar((this.plane - this.cameraOrigin.z)/direction.z);
  return extended.add(this.cameraOrigin);
};
ShadowCaster.prototype.intersectSide = function(a, b) {
  var sideDirection = b.clone().sub(a),
      zToTravel = this.plane - a.z;
  return sideDirection.clone().multiplyScalar(zToTravel/sideDirection.z).add(a);
};
ShadowCaster.prototype.cast = function() {
  var intersections = this.points.filter(function(p) {
    return p.z == this.plane;
  }.bind(this));
  var nonIntersections = this.points.filter(function(p) {
    return intersections.indexOf(p) == -1;
  });
  var beneaths = this.points.filter(function(p) {
    return p.z < this.plane;
  }.bind(this));
  var aboves = this.points.filter(function(p) {
    return p.z > this.plane;
  }.bind(this));
  if( beneaths.length > 0 ) {
    if( beneaths.length == 3 ) {
      return [];
    } else if( intersections.length == 1 && beneaths.length == 2 ) {
      return intersections[0];
    } else if( intersections.length == 2 && beneaths.length == 1 ) {
      return intersections;
    } else if( intersections.length == 1 && beneaths.length == 1 ) {
      var sideIntersection = this.intersectSide(aboves[0], beneaths[0]);
      var tri = new Triangle(intersections[0], aboves[0], sideIntersection);
      renderPath(tri.points);
      return new ShadowCaster(tri, this.plane, this.cameraOrigin).cast();
    } else if( beneaths.length == 2 ) {
      var sideIntersection1 = this.intersectSide(aboves[0], beneaths[0]);
      var sideIntersection2 = this.intersectSide(aboves[0], beneaths[1]);
      return new ShadowCaster(
        new Triangle(aboves[0], sideIntersection1, sideIntersection2),
	this.plane,
	this.cameraOrigin).cast();
    } else if( beneaths.length == 1 ) {
      var sideIntersection1 = this.intersectSide(aboves[0], beneaths[0]);
      var sideIntersection2 = this.intersectSide(aboves[1], beneaths[0]);
      var tri1 = new ShadowCaster(
        new Triangle(sideIntersection1, aboves[0], sideIntersection2),
	this.plane,
	this.cameraOrigin).cast();
      var tri2 = new ShadowCaster(
        new Triangle(sideIntersection1, aboves[1], sideIntersection2),
	this.plane,
	this.cameraOrigin).cast();
      return tri1.concat(tri2);
    }
  } else {
    return this.points.map(function(p) {
      return this.shootThrough(p);
    }.bind(this));
  }
};
var renderPath = function(ps) {
  ps.forEach(function(p, i) {
    var next = (i+1)%ps.length,
        nnext = (i+2)%ps.length;
    var geo = new THREE.Geometry();
    [].push.apply(geo.vertices, [p, ps[next], ps[nnext]]);
    geo.faces.push(new THREE.Face3(0, 1, 2, new THREE.Vector3(0, -1, 0)));
    var object = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0xc4c4c4, wireframe: true, wireframe_linewidth: 10
    }));
    object.overdraw = true;
    scene.add(object);
  });
};
var cameraOrigin = new THREE.Vector3(0, 0, 30);
var renderShadow = function(triangle) {
  var caster = new ShadowCaster(
    triangle, 0, cameraOrigin);
  var ps = caster.cast();
  renderPath(triangle.points);
  renderPath(ps);
};

var renderer = new THREE.WebGLRenderer();
renderer.setSize(500, 500);
document.body.appendChild(renderer.domElement);
var camera = new THREE.PerspectiveCamera(45, renderer.domElement.offsetWidth/renderer.domElement.offsetHeight, 1, 6000);
var scene = new THREE.Scene();
var controls = new Controls(renderer.render.bind(renderer), camera, scene, renderer.domElement);
controls.rotationVector = new THREE.Vector3(0, 1, -1);
controls._position = new THREE.Vector3(0, -500, 500);

ObjectManipulator.renderSTL(
  new Rectangle(300, 300, 0.2).STL(20, new THREE.Vector3(0, 0, -1), formBasis(new THREE.Vector3(0, 0, 1))),
  "Floor", "Floor");

/*renderShadow(new Triangle(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(100, 0, 0),
  new THREE.Vector3(50, 0, 100)));*/
renderShadow(new Triangle(
  new THREE.Vector3(0, -100, -50),
  new THREE.Vector3(100, 0, 0),
  new THREE.Vector3(50, 0, 100)));


