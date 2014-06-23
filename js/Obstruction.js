var equal = function(uv) {
  var u = uv[0], v = uv[1];
  return u.clone().sub(v).length() < 0.0001;
};
var notEquals = function(/* ps... */) {
  var ps = [].slice.call(arguments);
  return none(ps.map(equal));
};
var none = function(xs) {
  return !xs.reduce(function(a, x) {
    return a || x;
  }, false);
};

var Tri = function(a, b, c) {
  this.vertices = [a, b, c];
  this.normal = b.clone().sub(a).cross(b.clone().sub(c)).normalize();
};

var STL = function(ts) {
  this.ts = ts;
};
STL.prototype.mesh = function(name) {
  var geo = new THREE.Geometry();
  this.ts.forEach(function(t, i) {
    [].push.apply(geo.vertices, t.vertices);
    geo.faces.push(
      new THREE.Face3(i*3, i*3+1, i*3+2,
        t.normal));
  });
  var object = new THREE.Mesh(
    geo, new THREE.MeshNormalMaterial());
  object.name = name;
  object.overdraw = true;
  object.position.x = 0;
  object.position.y = 0;
  object.position.z = 0;
  return object;
};
STL.prototype.floorMesh = function(name, image) {
  var geo = new THREE.Geometry();
  this.ts.forEach(function(t, i) {
    [].push.apply(geo.vertices, t.vertices);
    geo.faces.push(
      new THREE.Face3(i*3, i*3+1, i*3+2,
        t.normal));
  });
  var texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  // TODO: an image map cannot be applied to a custom shape without
  // defining UVs. Check the PLaneGeometry source.
  // var material = new THREE.MeshBasicMaterial( { map : texture } ); 
  var material = new THREE.MeshNormalMaterial(); 
  var object = new THREE.Mesh(geo, material);
  object.name = name;
  object.overdraw = true;
  object.position.x = 0;
  object.position.y = 0;
  object.position.z = 0;
  return object;
};

var FloorSTL = function(stl, img) {
  this.ts = stl.ts;
  this.img = img;
};
FloorSTL.prototype.mesh = function(name) {
  return STL.prototype.floorMesh.call(this, name, this.img);
};

var Obstruction = function(f) {
  this.f = f;
};
Obstruction.prototype.STL = function(p, pos, normal) {
  var fp = function(h, t) {
    var f = surfaceBasisTransformer(
      formBasis(normal))(this.f);
    return f(h, t).add(pos);
  }.bind(this);
  var ps = [];
  for( var i = 0; i <= p; i++ ) {
    ps[i] = [];
    for( var j = 0; j <= p; j++ ) {
      ps[i][j] = fp(i/p, j/p);
    }
  }

  var ts = [];
  for( var i = 1; i <= p; i++ ) {
    for( var j = 1; j <= p; j++ ) {
      var bb = ps[i][j],
          ba = ps[i][j-1],
	  aa = ps[i-1][j-1];
      if( notEquals([aa, ba], [ba, bb], [aa, bb]) ) {
	ts.push(new Tri(ba, aa, bb));
      }
    }
  }
  for( var i = 0; i <= p-1; i++ ) {
    for( var j = 0; j <= p-1; j++ ) {
      var aa = ps[i][j],
          ab = ps[i][j+1],
	  bb = ps[i+1][j+1];
      if( notEquals([aa, ab], [ab, bb], [aa, bb]) ) {
	ts.push(new Tri(bb, aa, ab));
      }
    }
  }

  return new STL(ts);
};

var Sphere = function(radius) {
  this.type = "Sphere";
  this.f = function(h, t) {
    var theta = Math.PI * 2 * t,
        h = (h - 0.5) * 2 * radius;
    return new THREE.Vector3(
      Math.cos(theta) * sqrt(_2(radius) - _2(h)),
      Math.sin(theta) * sqrt(_2(radius) - _2(h)),
      h);
  };
};
Sphere.prototype = Obstruction.prototype;

var Cylinder = function(radius, height) {
  this.type = "Cylinder";
  this.f = revolvingParametric(
    piecewise([
      { range: [0, 0.25],
	fn: function(h) {
	  return new THREE.Vector2(h*radius, 0);
	} },
      { range: [0.25, 0.75],
	fn: function(h) {
	  h *= height;
	  return new THREE.Vector2(radius, h);
	} },
      { range: [0.75, 1],
	fn: function(h) {
	  return new THREE.Vector2((1-h)*radius, height);
	} }
    ]));
};
Cylinder.prototype = Obstruction.prototype;

var vSum = function(/* vs... */) {
  var vs = [].slice.call(arguments);
  return vs.reduce(function(a, x) {
    return a.add(x);
  }, new THREE.Vector3(0, 0, 0));
};
var neg = function(x) {
  return x.clone().multiplyScalar(-1);
};
var Rectangle = function(length, width, height) {
  this.type = "Rectangle";
  this.f = function(h, t) {
    var hv = new THREE.Vector3(0, 0, height),
	wv = new THREE.Vector3(0, width, 0),
	lv = new THREE.Vector3(length, 0, 0);
    if( h >= 0 && h <= 0.3 ) {
      return vSum(lv.multiplyScalar(Math.round(h)),
        wv.multiplyScalar(Math.round(t)));
    } else if( h > 0.3 && h <= 0.7 ) {
      var hp = (h - 0.3)/0.4;
      if( t >= 0 && t <= 0.25 ) {
	var tp = t * 4;
        return vSum(
	  hv.multiplyScalar(Math.round(hp)),
	  wv.multiplyScalar(Math.round(tp)),
	  lv);
      } else if( t > 0.25 && t <= 0.5 ) {
	var tp = (t - 0.25) * 4;
        return vSum(
	  hv.multiplyScalar(Math.round(hp)),
	  neg(lv).multiplyScalar(Math.round(tp)),
	  lv, wv);
      } else if( t > 0.5 && t <= 0.75 ) {
	var tp = (t - 0.5) * 4;
        return vSum(
	  hv.multiplyScalar(Math.round(hp)),
	  neg(wv).multiplyScalar(Math.round(tp)),
	  wv);
      } else {
	var tp = (t - 0.75) * 4;
        return vSum(
	  hv.multiplyScalar(Math.round(hp)),
	  lv.multiplyScalar(Math.round(tp)));
      }
    } else {
        return vSum(
	  lv.multiplyScalar(Math.round(h)),
	  wv.multiplyScalar(Math.round(t)),
	  hv);
    }
  };
};
Rectangle.prototype = Obstruction.prototype;

