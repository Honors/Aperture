var Controls = function(render, camera) {
  this.angleLR = 0;
  this.angleUD = 0;
  this.position = {x: 0, y: 0, z: 0};
  this.camera = camera;
  document.addEventListener('keydown', function(evt) {
    if( [65, 68, 87, 83].indexOf(evt.keyCode) != -1) {
      evt.preventDefault();
      this.angleLR += (evt.keyCode == 65 ? 1 : (evt.keyCode == 68 ? -1 : 0)) * Math.PI/50;
      this.angleUD += (evt.keyCode == 87 ? 1 : (evt.keyCode == 83 ? -1 : 0)) * Math.PI/50;
      render();
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
  requestAnimationFrame(this.render.bind(this));
};

