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
Scene.prototype.add = function(elm) {
  this.scene.add(elm);
};

