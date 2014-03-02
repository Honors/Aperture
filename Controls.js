var Controls = function(render, camera) {
  this.angle = 0;
  this.camera = camera;
  document.addEventListener('keydown', function(evt) {
    if( evt.keyCode == 65 || evt.keyCode == 68 ) {
      evt.preventDefault();
      this.angle += (evt.keyCode == 65 ? 1 : -1) * Math.PI/50;
      render();
    }
  }.bind(this));
  this.render();
};
Controls.prototype.render = function() {
  this.camera.up = new THREE.Vector3(0,0,1);
  this.camera.lookAt(
    new THREE.Vector3(Math.cos(this.angle) * 200, 
      Math.sin(this.angle) * 200, 
      0));
  requestAnimationFrame(this.render.bind(this));
};

