var Scene = function(map) {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  this.scene = scene;
  this.map = map;
  this.camera = camera;
  this.init();
};
Scene.prototype.init = function() {
  var renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.className += "three-js";
  document.body.insertBefore(
    renderer.domElement,
    document.body.firstChild);
  this.renderer = renderer;
  new Controls(this.render.bind(this), this.camera, this);
};
Scene.prototype.render = function() {
  requestAnimationFrame(arguments.callee.bind(this));
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
      z: position.z - room.z/2,
    };
  };
  this.extractFromRoom = function(position) {
    return {
      x: position.x + room.x/2,
      y: position.y + room.y/2,
      z: position.z + room.z/2,
    };
  };
  this.renderMap = function(i, j) {
    var ij = this.extractFromRoom([i, j]),
        i = ij[0], j = ij[1];
    this.map.width = this.map.width;
    var ctx = this.map.getContext('2d');
    ctx.rect(20, 20, 58, 58);
    ctx.stroke();
    ctx.fillRect(i/x * 58 + 20, 100 - ((j/y * 58) + 20), 4, 4);
  };
  pads.map(function(pad) {
    pad.addTo(this.scene);
  }.bind(this));
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
  (new Surface(this.fitToRoom(position), traits[0])).addTo(this.scene);
};
Scene.prototype.add = function(elm) {
  this.scene.add(elm);
};

