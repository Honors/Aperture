var Controls = function(render, camera, scene) {
  this.angleLR = Math.PI/2;
  this.angleUD = 0;
  this.position = {x: 0, y: -50, z: 0};
  this.camera = camera;
  this.scene = scene;
  document.addEventListener('keydown', function(evt) {
    if( [65, 68, 87, 83].indexOf(evt.keyCode) != -1) {
      evt.preventDefault();
      this.angleLR += (evt.keyCode == 65 ? 1 : (evt.keyCode == 68 ? -1 : 0)) * Math.PI/50;
      this.angleUD += (evt.keyCode == 87 ? 1 : (evt.keyCode == 83 ? -1 : 0)) * Math.PI/50;
      render();
    } else if( [37, 38, 39, 40].indexOf(evt.keyCode) != -1 ) {
      evt.preventDefault();
      this.position.x += (evt.keyCode == 39 ? 1 : (evt.keyCode == 37 ? -1 : 0)) * 10;
      this.position.y += (evt.keyCode == 38 ? 1 : (evt.keyCode == 40 ? -1 : 0)) * 10;
    }
  }.bind(this));
  this.render();
};
Controls.prototype.render = function() {
  this.camera.position = this.position;
  this.camera.up = new THREE.Vector3(0,0,1);
  this.camera.lookAt(
    new THREE.Vector3(Math.cos(this.angleLR) * 200, 
      Math.sin(this.angleLR) * 200, 
      Math.tan(this.angleUD) * 200));
  (this.scene.renderMap || function(){}).bind(this.scene)(this.position.x, this.position.y);
  requestAnimationFrame(this.render.bind(this));
};

