// renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.className = "three-js";
renderer.domElement.style.width = window.innerWidth - 400;
document.querySelector(".sceneWrapper").insertBefore(
  renderer.domElement,
  document.querySelector(".statusBar"));

var axisRenderer = new THREE.WebGLRenderer();
axisRenderer.setSize(100, 100);
axisRenderer.domElement.className = "axis-canvas";
document.querySelector(".sceneWrapper").insertBefore(
  axisRenderer.domElement,
  document.querySelector(".statusBar"));
var axisScene = new THREE.Scene();
var axisCamera = new THREE.PerspectiveCamera(45, axisRenderer.domElement.offsetWidth/axisRenderer.domElement.offsetHeight, 1, 6000);
axisScene.camera = axisCamera;
var axisControls = new Controls(axisRenderer.render.bind(axisRenderer), axisCamera, axisScene, axisRenderer.domElement, null, true);
axisControls._position = new THREE.Vector3(-100, -50, 25);
axisControls.rotationVector = new THREE.Vector3(1, 0.5, -0.25).normalize();
axisControls.render();

var camera = new THREE.PerspectiveCamera(45, renderer.domElement.offsetWidth/renderer.domElement.offsetHeight, 1, 6000);

var scene = new THREE.Scene();
var controls = new Controls(renderer.render.bind(renderer), camera, scene, renderer.domElement, axisScene);

[].forEach.call(
  document.querySelectorAll("#visibleRange input"),
  function(range) {
    range.addEventListener("input", ObjectManipulator.renderFocus);
    range.addEventListener("change", ObjectManipulator.renderFocus);
  });
document.querySelector("#collapse").addEventListener("click", function(evt) {
  evt.preventDefault();
  toggleClass(document.querySelector("#tools"), "collapsed");
});

controls.render();

var names = {};
var suffix = function(name) {
  names[name] = (names[name]||0) + 1;
  return names[name] == 1 ? "" : " " + names[name];
};
var setup = function() {
  var mapSelect = document.querySelector("#mapSelect");
  ["Fire Geo", "Gas Geo", "Fire Geo Risk", "Fire Res Risk", "Gas Geo Risk", "Gas Res Risk"].forEach(function(x) {
    var option = document.createElement("option");
    option.innerText = x;
    mapSelect.appendChild(option);
  });
  mapSelect.addEventListener("change", function(evt) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var floor = scene.children.filter(function(x) {
        return x.name == "Floor"
	})[0];
      var loaded = false;
      img.onload = function() {
        if( loaded ) return;
	loaded = true;
	floor.material = new THREE.MeshBasicMaterial({ map: new THREE.Texture(img) });
	floor.material.map.needsUpdate = true;
      };
      img.src = img.src.split("?")[0] + "?random=" + Math.floor(Math.random()*1e6);
      controls.render();
    };
    xhr.open("POST", "/Effigy/View.aspx");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("mapType=" + this.value.replace(/\s/g, "%20"));
  });

  var roomDimensions = document.querySelector(
    "[data-identifier='3dRoom']").innerText.match(
      /\[([^\]]+)\]/)[1].split(" ").map(
        function(x) { 
	  return parseFloat(x)
	  });
  var obstructions = ObstructionParser.parse(document.querySelector("[data-identifier='3dData']").innerText),
      fds = ObstructionParser.parseFDs(document.querySelector("[data-identifier='3dFDs']").innerText),
      gases = ObstructionParser.parseGases(document.querySelector("[data-identifier='3dGas']").innerText);
  var img = document.querySelector("[data-identifier='3dImage']"),
      floor = new Floor(roomDimensions[0], roomDimensions[1], 0.1, img); 
  floor.elevation = roomDimensions[3];
  scene.add(ObjectManipulator.renderSTL(floor, "Floor", "Rectangle"));
  var walls = new Walls(roomDimensions[0], roomDimensions[1], roomDimensions[2]);
  var wallMesh = ObjectManipulator.renderSTL(walls.STL(), "Walls", "Rectangle"); 
  obstructions.concat(fds).concat(gases).forEach(function(o, i) {
    ObjectManipulator.renderSTL(
      o.STL(20, o.position, o.basis, o.type == "FireDetector"),
      o.name + suffix(o.name), o.desc);
  });
};
window.onload = setup;

