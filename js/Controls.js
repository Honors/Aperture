var mode = { rotate: true };
var Controls = function(render, camera, scene, elm, axisScene, immutable) {
  this.sceneRender = render;
  this.axisScene = axisScene;
  this.focalPoint = new THREE.Vector3(0,0,0);
  this.rotationVector = new THREE.Vector3(1, 0, 0);
  this.basis = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1)
  ];
  var addEventListener = function(elm, evt, f) {
    if( !immutable ) {
      document.addEventListener.call(elm, evt, f);
    }
  };
  this.upVector = function() { return this.basis[2].clone(); };
  this.lookingVector = function(update) {
    if( update ) {
      this.rotationVector = update;
    }
    return this.rotationVector.clone();
  };
  this._position = new THREE.Vector3(-100, 0, 0);
  this.position = function() {
    var v = this.focalPoint.clone().add(this._position),
        basis = this.basis;
    return basis[0].clone().multiplyScalar(v.x).add(
	    basis[1].clone().multiplyScalar(v.y).add(
	      basis[2].clone().multiplyScalar(v.z)));
  };
  this.hypZ = function() {
    return Math.sqrt(_2(this._position.x) + _2(this._position.y) + _2(this._position.z));
  };
  this.camera = camera;
  this.scene = scene;
  this.panning = false;
  this.face = function(key) {
    this.lookingVector([
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, -1)][key - 1]);
    this._position = this.lookingVector().clone().normalize().multiplyScalar(-this.hypZ());
  };
  var start, isSelectMode = false;
  var selectMode = function(mode, evt) {
    isSelectMode = mode;
    var rect = elm.getBoundingClientRect(),
        x = evt.clientX - rect.left,
	y = evt.clientY - rect.top;
    ObjectManipulator.enterSelectMode(isSelectMode,
      [x/elm.offsetWidth, y/elm.offsetHeight]);
  };
  addEventListener(document, 'keydown', function(evt) {
    if( evt.keyCode == 46 ) {
      ObjectManipulator.deleteSelection();
    }
  });
  addEventListener(elm, 'mousedown', function(evt) {
    if( evt.which == 3 ) selectMode(true, evt);
    else {
      start = [evt.x, evt.y];
      this.panning = mode.pan;
    }
  }.bind(this));
  addEventListener(elm, 'mouseup', function(evt) {
    if( evt.which == 3 ) selectMode(false, evt);
    else start = undefined;
    this.panning = false;
  }.bind(this));
  addEventListener(elm, 'contextmenu', function(evt) {
    evt.preventDefault();
  }.bind(this));
 
  this.zoom = function(delta) {
    this._position.add(this.lookingVector().clone().multiplyScalar(-delta));
  };
  addEventListener(elm, 'mousewheel', function(evt) {
    evt.preventDefault();
    this.zoom(evt.wheelDelta/5);
  }.bind(this));
  addEventListener(elm, 'mousemove', function(evt) {
    if( evt.which == 3 ) selectMode(isSelectMode, evt);

    if( !start ) return;
    var end = [evt.x, evt.y],
	delta = end.map(function(x, i) { return x - start[i]; }),
	x = delta[0], y = delta[1];
    start = end;
    if( mode.rotate ) {
      var dxy = -x/10 * Math.PI/50,
	  dz = y/10 * Math.PI/50;
      var xy = Math.atan2(this._position.y, this._position.x) + dxy,
          z  = Math.atan2(this._position.z, sqrt(_2(this._position.x) + _2(this._position.y))) + dz;
      var zpos = Math.sin(z) * this.hypZ(),
          r = Math.cos(z) * this.hypZ();
      this._position = new THREE.Vector3(r * Math.cos(xy), r * Math.sin(xy), zpos);
      this.lookingVector(this._position.clone().normalize().multiplyScalar(-1));
    } else if( mode.zoom ) {
      this.zoom(y);
    } else {
      // panning
      var lv = this.lookingVector();
      var sx = lv.x > 0 ? 1 : -1;
      var sy = lv.y > 0 ? 1 : -1;
      if( abs(lv.x) > abs(lv.y) ) {
        var z = x; x = y; y = z;
      }
      this.focalPoint.add(new THREE.Vector3(sx * x/6, sy * y/6, 0));
    }
  }.bind(this));
  [].map.call(
    document.querySelectorAll("#modes li a"), 
    function(elm, i, coll) {
      addEventListener(elm, 'click', function(evt) {
	evt.preventDefault();
	mode.rotate = elm.id == "rotate_mode";
	mode.pan = elm.id == "pan_mode";
	mode.zoom = elm.id == "zoom_mode";
	[].map.call(
	  coll, 
	  function(elm) { elm.className = ''; });
	elm.className = 'active';
      });
  });
  [].map.call(
    document.querySelectorAll("#views li a"), 
    function(elm) {
      addEventListener(elm, 'click', function(evt) {
	evt.preventDefault();
	var face = parseInt(elm.id.split('').pop(), 10);
	this.face(face);
      }.bind(this));
  }.bind(this));
  this.render();
};
Controls.prototype.render = function() {
  var xs = this.scene.children.filter(function(x) { return x.name == "motion_axes" });
  if( xs.length ) {
    var x = xs[0];
    x.position = this.focalPoint.clone();
    x.visible = this.panning;
  } else if( this.scene.children.length > 0 ) {
    var x = drawVector(new THREE.Vector3(0, 0, -5000), new THREE.Vector3(0, 0, 10000));
    x.position = this.focalPoint.clone();
    this.scene.add(x);
    x.name = "motion_axes";
    x.visible = this.panning;
  }

  this.camera.position = this.position();
  this.camera.up = this.upVector();
  this.camera.lookAt(this.position().clone().add(this.lookingVector().clone().multiplyScalar(10)));
  this.sceneRender(this.scene, this.camera);
  requestAnimationFrame(this.render.bind(this));
  if( this.axisScene ) {
    var lv = this.lookingVector();
    this.axisScene.children.forEach(function(o) {
      axisScene.remove(o);
    });
    var circle = function() {
      var mesh = new THREE.Line(
	new THREE.CircleGeometry(30, 30),
	new THREE.LineDashedMaterial({
	  color: 0xffffff, dashSize: 3, gapSize: 7
	}));
      mesh.geometry.computeLineDistances();
      return mesh;
    };
    var x = new THREE.Vector3(1, 0, 0);
    this.axisScene.controls.rotationVector = this.lookingVector();
    this.axisScene.controls._position = this.lookingVector().normalize().multiplyScalar(-100);
    formBasis(x).forEach(function(v, i) {
      this.axisScene.add(drawLine(
	i, v.clone().multiplyScalar(30)));
    });
  }
};
