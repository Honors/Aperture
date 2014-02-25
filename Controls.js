var Controls = function(render, camera) {
  controls = new THREE.OrbitControls( camera );
  controls.addEventListener( 'change', render );
};

