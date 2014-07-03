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

function calculateUVs(geometry) {
  for(var i = 0; i < Math.floor(geometry.faces.length / 2); i++) {
    geometry.faceVertexUvs[ 0 ].push(
      [
	new THREE.Vector2( 0, 0 ),
	new THREE.Vector2( 0, 1 ),
	new THREE.Vector2( 1, 0 ),    
      ] );
    geometry.faces[ 2 * i ].materialIndex = i;
    geometry.faceVertexUvs[ 0 ].push(
      [
	new THREE.Vector2( 0, 1 ),
	new THREE.Vector2( 1, 1 ),
	new THREE.Vector2( 1, 0 ),    
      ] );
    geometry.faces[ 2 * i + 1 ].materialIndex = i;
  }
  return geometry;
}

var STL = function(ts, pos, basis, input) {
  this.pos = pos;
  this.normal = basis[0];
  this.input = input;
  this.ts = ts;
  this.material = new THREE.MeshNormalMaterial();
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
    geo, this.material);
  object.name = name;
  object.overdraw = true;
  object.position.x = 0;
  object.position.y = 0;
  object.position.z = 0;
  object.notes = { pos: this.pos, normal: this.normal, input: this.input };
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
  geo = calculateUVs(geo, 6);
  var material = new THREE.MeshBasicMaterial( { map : texture } ); 
  var object = new THREE.Mesh(geo, material);
  object.name = name;
  object.overdraw = true;
  object.position.x = 0;
  object.position.y = 0;
  object.position.z = 0;
  return object;
};

var Floor = function(l, w, h, img) {
  this.center = new THREE.Vector3(l/2, w/2, 0);
  this.geo = new THREE.CubeGeometry(l, w, h);
  this.material = new THREE.MeshBasicMaterial({ map: new THREE.Texture(img) })
  this.material.map.needsUpdate = true;
  this.elevation = 0;
};
Floor.prototype.mesh = function(name) {
  var mesh = new THREE.Mesh(this.geo, this.material);
  mesh.position = this.center.clone().add(
    new THREE.Vector3(0, 0, this.elevation - 0.1));
  mesh.name = name;
  return mesh;
};

var Obstruction = function(f) {
  this.f = f;
};
Obstruction.prototype.STL = function(p, pos, basis, hasAbsolutePosition) {
  var fp = function(h, t) {
    var f = surfaceBasisTransformer(basis)(this.f);
    return f(h, t);
  }.bind(this);
  var ps = [];
  for( var i = 0; i <= p; i++ ) {
    ps[i] = [];
    for( var j = 0; j <= p; j++ ) {
      ps[i][j] = fp(i/p, j/p);
    }
  }

  var ts = [], psp = [];
  for( var i = 1; i <= p; i++ ) {
    for( var j = 1; j <= p; j++ ) {
      var bb = ps[i][j],
          ba = ps[i][j-1],
	  aa = ps[i-1][j-1];
      [].push.apply(psp, [aa, ba, bb]);
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
      [].push.apply(psp, [aa, ab, bb]);
      if( notEquals([aa, ab], [ab, bb], [aa, bb]) ) {
	ts.push(new Tri(bb, aa, ab));
      }
    }
  }

  var center = psp.reduce(function(a, x) {
    return a.clone().add(x)
  }).multiplyScalar(1/psp.length);
  ts = ts.map(function(t) {
    t.vertices = t.vertices.map(function(v) {
      if( hasAbsolutePosition ) return v.clone().add(pos);
      return v.clone().add(pos.clone().sub(center));
    });
    return t;
  });
  return new STL(ts, pos, basis, this.input);
};

var Sphere = function(radius) {
  this.type = "Sphere";
  this.desc = "Sph @"+radius;
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
  this.desc = "Cyl "+height+"@"+radius;
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

var Vessel = function(radius, height) {
  this.type = "Vessel";
  this.desc = "Ves "+height+"@"+radius;
  this.f = revolvingParametric(
    piecewise([
      { range: [0, 0.25],
	fn: function(h) {
	  var r = radius * sqrt(1 - _2(1-h));
	  return new THREE.Vector2(r, -radius*(1-h));
	} },
      { range: [0.25, 0.75],
	fn: function(h) {
	  h *= height;
	  return new THREE.Vector2(radius, h);
	} },
      { range: [0.75, 1],
	fn: function(h) {
	  var r = radius * sqrt(1 - _2(h));
	  return new THREE.Vector2(r, height+radius*h);
	} }
    ]));
};
Vessel.prototype = Obstruction.prototype;

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
  this.desc = "Rect "+length+"x"+width+"x"+height;
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

var Walls = function() {
  Rectangle.apply(this, arguments);
  this.material = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.BackSide });
};
Walls.prototype.STL = function() {
  var stl = Rectangle.prototype.STL.call(
    this, 20,
    new THREE.Vector3(0, 0, 0),
    formBasis(new THREE.Vector3(0, 0, 1)),
    true);
  stl.ts = stl.ts.filter(function(t) {
    return t.normal.dot(new THREE.Vector3(0, 0, 1)) != 1 ||
      t.vertices[0].z == 0;
  });
  stl.material = this.material;
  stl.wireframe = true;
  return stl;
};

var FireDetector = function(height) {
  this.type = "FireDetector";
  this.desc = "FD";
  this.f = function(h, theta) {
    return piecewise([
      { range: [0, 0.5], 
	fn: function(h) {
	  return revolvingParametric(
	    vectorLine(0, 0, 105/210*height, 105/210*height))(h, theta);
	} },
      { range: [0.5, 1], 
	fn: function(h) {
	  var b = bezier([105/210*height, 105/210*height],
	      [178/210*height, 153/210*height],
	      [97/210*height, 210/210*height],
	      [0/210*height, 207/210*height]);
	  return revolvingParametric(b)(h, theta);
        } }
    ])(h);
  };
};
FireDetector.prototype.STL = function() {
  var stl = Obstruction.prototype.STL.apply(this, arguments);
  stl.material = new THREE.MeshBasicMaterial({
    color: 0xff0000, transparent: true, opacity: 0.3
  });
  return stl;
};

var GasDetector = function() {
  Sphere.apply(this, arguments)
};
GasDetector.prototype.STL = function() {
  var stl = Obstruction.prototype.STL.apply(this, arguments);
  stl.material = new THREE.MeshBasicMaterial({
    color: 0xbada55, transparent: true, opacity: 0.3
  });
  return stl;
};

