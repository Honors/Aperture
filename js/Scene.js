var layers = function() {
  return {
    fire: document.getElementById('fireOn').checked,
    smoke: document.getElementById('smokeOn').checked
  };
};
var Scene = function(map) {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  this.scene = scene;
  this.camera = camera;
  this.benched = [];
  this.init();
};
Scene.prototype.init = function() {
  var renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.className += "three-js";
  document.getElementById("content").insertBefore(
    renderer.domElement,
    document.getElementById("content").firstChild);
  this.renderer = renderer;
  this.controls = new Controls(this.render.bind(this), this.camera, this);
};
Scene.prototype.render = function() {
  requestAnimationFrame(arguments.callee.bind(this));
  this.scene.children.forEach(function(child) {
    if( (child.userData.fire && !layers().fire) ||
        (child.userData.smoke && !layers().smoke) ) {
      this.benched.push(child);
      this.scene.remove(child);
    }
  }.bind(this));
  this.benched.map(function(x){return x;}).forEach(function(benched) {
    if( (benched.userData.fire && layers().fire) ||
        (benched.userData.smoke && layers().smoke) ) {
      this.scene.add(benched);
      this.benched.splice(this.benched.indexOf(benched), 1);
    }
  }.bind(this));
  this.renderer.render(this.scene, this.camera);
};
Scene.prototype.makeRoom = function(x, y, z) {
  var room = {x:x, y:y, z:z};
  var hX = x/2, hY = y/2, hZ = z/2;
  var pads = [
    new Rectangle({
      x: 0, y: 0, z: -hZ
    }, {
      x: x, y: y, z: 1
    }, true)
  ];
  this.fitToRoom = function(position) {
    return {
      x: position.x - room.x/2,
      y: position.y - room.y/2,
      z: position.z - room.z/2
    };
  };
  pads.map(function(pad) {
    pad.addTo(this.scene);
  }.bind(this));

  var img = new THREE.MeshBasicMaterial({
    map: new THREE.Texture(document.querySelector("[data-identifier='3dImage']"))
  });
  img.map.needsUpdate = true;
  // plane
  var map = new THREE.CubeGeometry(x, y, 0.2);
  var plane = new THREE.Mesh(map, img);
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0.7 - hZ;
  plane.overdraw = true;
  this.scene.add(plane);
};
Scene.prototype.addRectangle = function(position, size) {
  (new Rectangle(this.fitToRoom(position), size)).addTo(this.scene);
};
Scene.prototype.addCylinder = function(position, size, cylTraits) {
  (new Cylinder(this.fitToRoom(position), size, cylTraits)).addTo(this.scene);
};
Scene.prototype.addCloud = function(position, size) {
  (new Cloud(this.fitToRoom(position), size)).addTo(this.scene);
};
Scene.prototype.addSurface = function(position, size, traits) {
  (new Surface(this.fitToRoom(position), traits, traits[3])).addTo(this.scene);
};
Scene.prototype.add = function(elm) {
  this.scene.add(elm);
};

