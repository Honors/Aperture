var cos = Math.cos.bind(Math);
var sin = Math.sin.bind(Math);
var tan = Math.tan.bind(Math);
var normalize = function(vec) {
  return vec.map(divideBy(sqrt(vec.map(square).reduce(sum, 0))));
};
var divideBy = function(x) {
  return function(y) {
    return y/x;
  };
};
var sqrt = Math.sqrt.bind(Math);
var square = function(x) {
  return x*x;
};
var sum = function(a, b) {
  return a + b;
};
var match = function(maps, elm) {
  return maps.reduce(function(fn, map) {
    return fn || 
      (elm instanceof map[0] ? 
       map[1] : 
       undefined);
  }, undefined);
};
var Vector = function(x, y) {
  this.x = x;
  this.y = y;
};
Vector.prototype = {
  add: function(v2) {
    return new Vector(v2.x+this.x, v2.y+this.y);
  },
  mult: function(x) {
    return new Vector(x*this.x, x*this.y);
  }
};
var bezier = function(p0, p1, p2, p3) {
  return function(t) {
    var _2 = function(x) { return x*x; },
	_3 = function(x) { return _2(x)*x; };
    return p0.mult(_3(1-t)).add(
           p1.mult(_2(1-t)*t*3)).add(
	   p2.mult((1-t)*_2(t)*3)).add(
	   p3.mult(_3(t)));
  };
};
var piecewise = function(fns) {
  return function(x) {
    var fn = fns.filter(function(fn) {
      return x >= fn.range[0] && x <= fn.range[1];
    }).pop();
    return fn.fn((x-fn.range[0])/(fn.range[1]-fn.range[0]));
  };
};

