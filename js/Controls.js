var mode = { rotate: false };
var Controls = function(render, camera, scene) {
  this.angleLR = Math.PI/2;
  this.angleUD = 0;
  this.position = {x: 0, y: -50, z: 0};
  this.camera = camera;
  this.scene = scene;
  this.rotate = function(right, left, up, down) {
    this.angleLR += (right ? 1 : (left ? -1 : 0)) * Math.PI/50;
    this.angleUD += (up ? 1 : (down ? -1 : 0)) * Math.PI/50;
  };
  this.move = function(left, right, up, down) {
      this.position.x += (left ? 1 : (right ? -1 : 0)) * 10;
      this.position.y += (up ? 1 : (down ? -1 : 0)) * 10;
  };
  document.addEventListener('keydown', function(evt) {
    if( [65, 68, 87, 83].indexOf(evt.keyCode) != -1) {
      evt.preventDefault();
      this.rotate(
        evt.keyCode == 65, evt.keyCode == 68,
        evt.keyCode == 87, evt.keyCode == 83);
      render();
    } else if( [37, 38, 39, 40].indexOf(evt.keyCode) != -1 ) {
      evt.preventDefault();
      this.move(
        evt.keyCode == 39, evt.keyCode == 37,
        evt.keyCode == 38, evt.keyCode == 40);
    }
  }.bind(this));
  var start;
  document.addEventListener('mousedown', function(evt) {
    start = [evt.x, evt.y];
  });
  document.addEventListener('mouseup', function(evt) {
    start = undefined;
  });
  document.addEventListener('mousemove', function(evt) {
    if( !start ) return;
    var end = [evt.x, evt.y],
	delta = end.map(function(x, i) { return x - start[i]; }),
	x = delta[0], y = delta[1];
    start = end;
    if( mode.rotate ) {
      this.angleLR += -1 * x/10 * Math.PI/50;
      this.angleUD += -1 * y/10 * Math.PI/50;
    } else {
      var arrow = [Math.cos(this.angleLR),
        Math.sin(this.angleLR),
	Math.tan(this.angleUD)];
      var normal = [1, 1,
        (arrow[0] + arrow[1])/(-arrow[2])];
      this.position.x += -1 * x / normal[0];
      this.position.z += -1 * y / normal[1];
      this.position.y += -1 * y / normal[2];
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

