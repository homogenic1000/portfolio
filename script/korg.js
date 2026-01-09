const titleD = document.getElementById("title-d");
const korgText = document.getElementById("korg-text");
const animation = document.getElementById("animation-bag");
const korgbody = document.getElementById("korg-body");
const hero = document.getElementById("hero-section");

// add a variable of image of the cd
// maybe using three.js ? :)
// put the korgText at the top of the page



function onKorgClick() {
  document.body.style.backgroundColor = "black";
  document.body.style.color = "white";
  titleD.style.display = "none";
  Matter.Composite.remove(engine.world, ground);
  sandwich.style.display = "none";
  animation.style.display = "none";
  korgbody.style.display = "flex";
  korgText.style.display = "flex";
  hero.style.position = "static";
  hero.style.textAlign = "left";
  hero.style.justifyContent = "flex-start";
}

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( korgbody.clientWidth, korgbody.clientHeight );
korgbody.appendChild(renderer.domElement);

const loader = new GLTFLoader();

loader.load( '/assets/cd.glb', function ( gltf ) {

  scene.add( gltf.scene );

}, undefined, function ( error ) {

  console.error( error );

} );