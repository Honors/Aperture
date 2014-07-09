var MeshIntersector = function(mesh, plane) {
  this.mesh = mesh;
  this.plane = plane;
};
MeshIntersector.prototype.intersectSide = function(a, b) {
  var sideDirection = b.clone().sub(a),
      zToTravel = this.plane - a.z;
  return sideDirection.clone().multiplyScalar(zToTravel/sideDirection.z).add(a);
};
MeshIntersector.prototype.intersectTriangle = function(t) {
  var beneaths = t.vertices.filter(function(v) {
    return v.z < this.plane;
  }.bind(this));
  var aboves = t.vertices.filter(function(v) {
    return v.z > this.plane;
  }.bind(this));
  var intersectors = t.vertices.filter(function(v) {
    return v.z == this.plane;
  }.bind(this));
  if( beneaths.length == 1 ) {
    if( intersectors.length == 2 ) {
      return intersectors;
    } else if( aboves.length == 2 ) {
      return aboves.map(this.intersectSide.bind(this, beneaths[0]));
    } else {
      return intersectors.concat(this.intersectSide(aboves[0], beneaths[0]));
    }
  } else if( beneaths == 2 ) {
    if( intersectors.length == 1 ) {
      return intersectors;
    } else {
      return beneaths.map(this.intersectSide.bind(this, aboves[0]));
    }
  } else {
    return [];
  }
};
MeshIntersector.prototype.fuzzyEqual = function(a, b) {
  return a.clone().sub(b).length() <= 0.01;
};
MeshIntersector.prototype.sortPath = function(path, seed, accum) {
  if( !seed ) {
    accum = [path[0][0]];
    seed = path[0][1];
    path = path.slice(1);
  }
  var deltas = path.map(function(n) {
    return {
      node: n,
      delta: [n[0].clone().sub(seed).length(), n[1].clone().sub(seed).length()]
    };
  }).reduce(function(a, x) {
    return a.concat([
      {node: x.node, p: x.node[0], delta: x.delta[0]},
      {node: x.node, p: x.node[1], delta: x.delta[1]}]);
  }, []).sort(function(a, b) {
    return a.delta - b.delta;
  });

  var winnerNode = deltas[0].node,
      sortedWinner = this.fuzzyEqual(winnerNode[0], deltas[0].p) ?
        winnerNode :
	[winnerNode[1], winnerNode[0]];

  if( path.length == 1 ) {
    return accum.concat([sortedWinner[1]]);
  } else {
    return this.sortPath(
      path.filter(function(n) { return n != winnerNode; }),
      sortedWinner[1],
      accum.concat([sortedWinner[0]]));
  }
};
MeshIntersector.prototype.intersect = function() {
  var intersectingTriangles = this.mesh.ts.filter(function(t) {
    var zs = t.vertices.map(function(v) {
      return v.z;
    });
    var zMax = Math.max.apply({}, zs),
        zMin = Math.min.apply({}, zs);
    return zMax >= this.plane && zMin <= this.plane;
  }.bind(this));
  var path = intersectingTriangles.map(
    this.intersectTriangle.bind(this)).filter(
    function(x) { return x.length != 0 });
  return this.sortPath(path);
};
var renderer = new THREE.WebGLRenderer();
renderer.setSize(500, 500);
document.body.appendChild(renderer.domElement);
var camera = new THREE.PerspectiveCamera(45, renderer.domElement.offsetWidth/renderer.domElement.offsetHeight, 1, 6000);
var scene = new THREE.Scene();
var controls = new Controls(renderer.render.bind(renderer), camera, scene, renderer.domElement);
controls.rotationVector = new THREE.Vector3(0, 0, 1);
controls._position = new THREE.Vector3(0, 0, -500);

var cvs = document.querySelector("#cvs"),
    ctx = cvs.getContext("2d");
var clear = function() {
  cvs.width = cvs.width;
  ctx.translate(250, 250);
  ctx.rotate(-Math.PI/2);
  ctx.translate(-250, -250);
};
var render = function() {
  var obs = new SoundDetector(100),
      basis = formBasis(new THREE.Vector3(1, 1, 1)),
      pos = new THREE.Vector3(0, 0, -1);
  obs.position = pos;
  obs.basis = basis;

  var ps = new MeshIntersector(
    obs.STL(100, pos, basis), 0).intersect();
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

  ObjectManipulator.renderSTL(
    obs.STL(20, obs.position, obs.basis),
    "FD", "FD");
  ObjectManipulator.renderSTL(
    new Rectangle(300, 300, 0.2).STL(20, new THREE.Vector3(0, 0, 0), formBasis(new THREE.Vector3(0, 0, 1))),
    "Floor", "Floor");
};
clear();
render();

