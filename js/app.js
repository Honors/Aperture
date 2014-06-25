// renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.className = "three-js";
renderer.domElement.style.width = window.innerWidth - 400;
document.querySelector("#content").appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, renderer.domElement.offsetWidth/renderer.domElement.offsetHeight, 1, 6000);

var scene = new THREE.Scene();
var controls = new Controls(renderer.render.bind(renderer), camera, scene, renderer.domElement);

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
  return " " + names[name];
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

