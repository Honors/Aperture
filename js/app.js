// renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.className = "three-js";
renderer.domElement.style.width = window.innerWidth - 400;
document.querySelector("#content").appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, renderer.domElement.offsetWidth/renderer.domElement.offsetHeight, 1, 6000);

var scene = new THREE.Scene();
var controls = new Controls(renderer.render.bind(renderer), camera, scene, renderer.domElement);

var listenForObjectSelect = function(objects) {
  [].forEach.call(
    document.querySelectorAll("#objects a"),
    function(a) {
      a.addEventListener("click", function(evt) {
        evt.preventDefault();
	renderFocus(a.href.split('#')[1]);
      });
    });
};
var renderObjects = function(objects) {
  var wrapper = document.getElementById("objects");
  wrapper.innerHTML = "";
  var ul = document.createElement("ul");
  var span = document.createElement("span");
  span.innerText = "Select an object";
  wrapper.appendChild(span);
  objects.filter(function(o) {
    return o.visible;
  }).concat([{name:"*", type:""}]).map(function(o) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.innerHTML = o.name + "<span class=\"details\">" + (o.type ? " ["+o.type+"]" : "") + "</span>";
    a.href = "#"+o.name;
    a.className = o.active ? "active" : "";
    li.appendChild(a);
    return li;
  }).forEach(function(li) {
    ul.appendChild(li);
  });
  wrapper.appendChild(ul);
  listenForObjectSelect(objects);
};

var mutators = (function() {
  var objects = [];
  var focus = "*";
  var ranges = [[6000, -6000], [6000, -6000], [6000, -6000]];
  var withinBounds = function(object) {
    var inputs = [].map.call(
      document.querySelectorAll("#visibleRange input"),
      function(range, i) {
	var maxmin = ranges[Math.floor(i/2)];
	return range.value/100 * (maxmin[1] - maxmin[0]) + maxmin[0];
      });
    var p = object.position, x = p.x, y = p.y, z = p.z;
    return segment(inputs, 2).map(function(range, i) {
      return inRange(range, [x,y,z][i]);
    }).reduce(function(a, x) { return a && x; }, true);
  };
  var renderFocusAndVisibilityOfObjects = function(f) {
    focus = typeof f == 'string' ? f : focus;
    objects.forEach(function(object) {
      var name = object.name;
      if( !withinBounds(object) ) {
	object.visible = false;
	object.active = false;
	scene.getObjectByName(name).visible = false;
      } else if( object.deleted ) {
	scene.getObjectByName(name).visible = false;
	// TODO: a way of undoing the delete
	objects = objects.filter(function(x) { return x.name != name });
      } else if( name == focus || focus == "*" ) {
	object.visible = true;
	object.active = true;
	scene.getObjectByName(name).visible = true;
	scene.getObjectByName(name).material = object.material;
      } else {
	object.visible = true;
	object.active = false;
	scene.getObjectByName(name).visible = true;
	scene.getObjectByName(name).material = new THREE.MeshBasicMaterial({
	  color: 0xc4c4c4, wireframe: true, wireframe_linewidth: 10
	});
      }
    });
    renderObjects(objects);
  };
  var renderSTL = function(object, name, type) {
    var mesh = object.mesh(name);
    scene.add(mesh);

    var allVs = mesh.geometry.vertices;
    var center = allVs.reduce(function(a, x) {
      return a.add(x);
    }, new THREE.Vector3(0,0,0)).multiplyScalar(1/allVs.length);

    // update max and min
    ranges = allVs.length ? ranges.map(function(range, i) {
      var p = [center.x, center.y, center.z][i];
      return [Math.min(p, range[0]), Math.max(p, range[1])];
    }) : ranges;

    // update and render object list
    objects.push({ name: name,
      position: center,
      type: type || recognizePrimitiveShape(object.ts),
      active: focus == "*",
      visible: true,
      material: object.material });
    var focalPoint = objects.map(
      function(x) {
        return x.position.clone();
	}).reduce(
	  function(a, x) {
	    return a.add(x);
	    }).multiplyScalar(1/objects.length);
    controls.focalPoint = focalPoint;
    renderObjects(objects);
  };
  var enterSelectMode = function(x, pos) {
    var selection = x?"~":"*";

    var objs = objects.filter(function(o) {
      return o.visible;
    }).map(function(o) {
      return scene.getObjectByName(o.name); 
    });
    var vector = new THREE.Vector3(pos[0]*2-1, -pos[1]*2+1 , 0.5);
    var projector = new THREE.Projector();
    projector.unprojectVector(vector, camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(objs);
    if( intersects.length ) {
      selection = intersects[0].object.name;
    }

    renderFocusAndVisibilityOfObjects(selection);
  };
  var deleteSelection = function() {
    var all = objects.length;
    objects.forEach(function(x) {
      if(x.name == focus) {
        x.deleted = true;
      }
    });
    renderFocusAndVisibilityOfObjects();
  };
  return { renderSTL: renderSTL,
    withinBounds: withinBounds,
    renderFocus: renderFocusAndVisibilityOfObjects,
    enterSelectMode: enterSelectMode,
    deleteSelection: deleteSelection };
}());
var renderSTL = mutators.renderSTL,
    withinBounds = mutators.withinBounds,
    renderFocus = mutators.renderFocus,
    enterSelectMode = mutators.enterSelectMode,
    deleteSelection = mutators.deleteSelection;

[].forEach.call(
  document.querySelectorAll("#visibleRange input"),
  function(range) {
    range.addEventListener("input", renderFocus);
    range.addEventListener("change", renderFocus);
  });
var toggleClass = function(elm, cls) {
  if( elm.className.indexOf(cls) == -1 ) {
    elm.className += " " + cls;
  } else {
    elm.className = elm.className.replace(" " + cls, "");
  }
};
document.querySelector("#collapse").addEventListener("click", function(evt) {
  evt.preventDefault();
  toggleClass(document.querySelector("#tools"), "collapsed");
});

controls.render();

var names = {};
var suffix = function(name) {
  names[name] = (names[name]||0) + 1;
  return "" + names[name];
};
var setup = function() {
  var roomDimensions = document.querySelector(
    "[data-identifier='3dRoom']").innerText.match(
      /\[([^\]]+)\]/)[1].split(" ").map(
        function(x) { 
	  return parseFloat(x)
	  });
  var obstructions = parseObstructions(document.querySelector("[data-identifier='3dData']").innerText);
  var img = document.querySelector("[data-identifier='3dImage']"),
      floor = new Floor(roomDimensions[0], roomDimensions[1], 0.2, img); 
  scene.add(renderSTL(floor, "Floor", "Rectangle"));
  obstructions.forEach(function(o, i) {
    scene.add(renderSTL(o.STL(20, o.position, o.normal), o.name + suffix(o.name), o.desc));
  });
};
window.onload = setup;

