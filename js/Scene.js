var Scene = function(map) {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  this.scene = scene;
  this.map = map;
  this.camera = camera;
  this.init();
};
Scene.prototype.init = function() {
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.className += "three-js";
  document.body.appendChild(renderer.domElement);
  this.renderer = renderer;
  new Controls(this.render.bind(this), this.camera, this);
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
    new Rectangle([0, 0, -hZ], [x, y, 1], true)
  ];
  this.fitToRoom = function(position) {
    return position.map(function(x, i) {
      return x - (room[i]/2); 
    });
  };
  this.extractFromRoom = function(position) {
    return position.map(function(x, i) {
      return x + (room[i]/2);
    });
  };
  this.renderMap = function(i, j) {
    var ij = this.extractFromRoom([i, j]),
        i = ij[0], j = ij[1];
    this.map.width = this.map.width;
    this.map.getContext('2d').fillRect(i/x * 100 + 4, 104 - (j/y * 100), 4, 4);
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
Scene.prototype.add = function(elm) {
  this.scene.add(elm);
};

