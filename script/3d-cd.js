import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";



// the DIV from the page

var container = document.getElementById( 'container-cd' );

// Function to initialize Three.js with proper size
function initThreeJS() {
    const width = container.clientWidth;
    const height = container.clientHeight; 
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
}

// a scene

var scene = new THREE.Scene({ alpha: true });



// camera that uses the container's size

var camera = new THREE.PerspectiveCamera( 30, 1 );
    camera.position.set( 2, 5, 10 );
    camera.lookAt( scene.position );


// renderer that uses the container's size and is inserted in it

var renderer = new THREE.WebGLRenderer( {antialias: true} );
    container.appendChild( renderer.domElement );
    
// Initialize size
initThreeJS();

// Listen for when container becomes visible
const observer = new ResizeObserver(() => {
    if (container.clientWidth > 0 && container.clientHeight > 0) {
        initThreeJS();
    }
});
observer.observe(container);

renderer.setAnimationLoop( animationLoop );


// various stuff, not interesting

var controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;

var ambientLight = new THREE.AmbientLight( 'white', 1 );
    scene.add( ambientLight );

var light = new THREE.DirectionalLight( 'white', 1 );
    light.position.set( 1, 1, 4 );
    scene.add( light );

const loader = new GLTFLoader();

loader.load( 'assets/model/cd.glb', function ( gltf ) {

  scene.add( gltf.scene );
  gltf.scene.rotation.set(0,90,0)



}, undefined, function ( error ) {

  console.error( error );

} );


function animationLoop() {
    renderer.render( scene, camera );
} renderer.setAnimationLoop( animationLoop );