import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Visionneuse 3D paresseuse : three.js ne démarre que lorsqu'un projet
// de type "3d" est ouvert (via window.CDViewer.show), pas au chargement.

let container;
let renderer, scene, camera, controls, modelRoot;
let initialized = false;
let currentModelPath = null;
let resizeRef = null;

const loader = new GLTFLoader();
const modelCache = new Map();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.AmbientLight(0xffffff, 2);
  scene.add(light);

  modelRoot = new THREE.Group();
  scene.add(modelRoot);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resizeRef = resize;
  new ResizeObserver(resize).observe(container);

  initialized = true;
}

function tick() {
  controls.update();
  renderer.render(scene, camera);
}

function show(modelPath) {
  container = document.getElementById('container-cd');
  if (!container) return;

  if (!initialized) init();

  container.style.display = 'block';
  if (resizeRef) resizeRef();
  renderer.setAnimationLoop(tick);

  if (modelPath !== currentModelPath) {
    currentModelPath = modelPath;
    modelRoot.clear();
    const cached = modelCache.get(modelPath);
    if (cached) {
      modelRoot.add(cached);
    } else {
      loader.load(modelPath, (gltf) => {
        modelCache.set(modelPath, gltf.scene);
        if (currentModelPath === modelPath) modelRoot.add(gltf.scene);
      });
    }
  }
}

function hide() {
  if (!initialized) return;
  container.style.display = 'none';
  renderer.setAnimationLoop(null); // stoppe la boucle de rendu tant que caché
}

window.CDViewer = { show, hide };
