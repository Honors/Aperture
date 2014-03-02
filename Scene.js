var Scene = function() {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  this.scene = scene;
  this.camera = camera;
  this.init();
};
Scene.prototype.init = function() {
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  this.renderer = renderer;
  new Controls(this.render.bind(this), this.camera);
};
Scene.prototype.render = function(action) {
  action = typeof action == 'function' ? action : function(){};
  var render = arguments.callee.bind(this, action);
  requestAnimationFrame(render);
  action.call(this);
  this.renderer.render(this.scene, this.camera);
};
Scene.prototype.makeRoom = function(x, y, z) {
  var room = [x, y, z];
  var hX = x/2, hY = y/2, hZ = z/2;
  var pads = [
    new Rectangle([0, 0, -hZ], [x, y, 1]),
    new Rectangle([0, 0, hZ], [x, y, 1]),
    new Rectangle([-hX, 0, 0], [1, y, z]),
    new Rectangle([hX, 0, 0], [1, y, z]),
    new Rectangle([0, -hY, 0], [x, 1, z]),
    new Rectangle([0, hY, 0], [x, 1, z]),
    new Rectangle([0, 0, 0], [44, 45, 15])
  ];
  this.fitToRoom = function(position) {
    return position.map(function(x, i) {
      return x - (room[i]/2); 
    });
  };
  pads.map(function(pad) {
    pad.addTo(this.scene);
  }.bind(this));
};
Scene.prototype.addRectangle = function(position, size) {
  (new Rectangle(this.fitToRoom(position), size)).addTo(this.scene);
};
Scene.prototype.addCylinder = function(position, size, cylTraits) {
  console.log(cylTraits);
  (new Cylinder(this.fitToRoom(position), size, cylTraits)).addTo(this.scene);
};
Scene.prototype.add = function(elm) {
  this.scene.add(elm);
};

