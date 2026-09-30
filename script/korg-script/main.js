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

// Vue par défaut : trois-quarts, presque isométrique. Le boîtier CD est un
// objet plat posé sur le plan XZ (2.11 x 0.16 x 2.32), donc une caméra sur
// l'axe Z ne le verrait que par la tranche : cette direction la surélève et
// la décale pour regarder le dessus et la tranche du même coup.
const DEFAULT_DIRECTION = new THREE.Vector3(1, 0.85, 1).normalize();
const FRAME_MARGIN = 1.12;

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

/**
 * Cadrer le modèle dans la vue par défaut : viser le centre de sa bounding box
 * et reculer juste assez pour que ses 8 coins restent dans le frustum (les coins
 * sont projetés sur les axes de la caméra, pas sur son englobant, sinon un
 * objet plat serait cadré comme une sphère et paraîtrait tout petit).
 */
function frameModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;

  const center = box.getCenter(new THREE.Vector3());
  const dir = DEFAULT_DIRECTION.clone();
  const forward = dir.clone().negate();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
  const up = new THREE.Vector3().crossVectors(forward, right).normalize();
  const halfV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const halfH = halfV * camera.aspect;

  let distance = 0;
  for (let i = 0; i < 8; i++) {
    const corner = new THREE.Vector3(
      i & 1 ? box.max.x : box.min.x,
      i & 2 ? box.max.y : box.min.y,
      i & 4 ? box.max.z : box.min.z
    ).sub(center);
    const depth = corner.dot(dir);
    distance = Math.max(
      distance,
      Math.abs(corner.dot(right)) / halfH + depth,
      Math.abs(corner.dot(up)) / halfV + depth
    );
  }
  distance *= FRAME_MARGIN;

  controls.target.copy(center);
  camera.position.copy(center).addScaledVector(dir, distance);
  // plans near/far serrés sur le modèle : évite le z-fighting du canvas
  // transparent sans casser le zoom d'OrbitControls.
  camera.near = Math.max(0.01, distance * 0.05);
  camera.far = distance * 10;
  camera.updateProjectionMatrix();
  controls.minDistance = distance * 0.4;
  controls.maxDistance = distance * 3;
  controls.update();
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
      frameModel(cached);
    } else {
      loader.load(modelPath, (gltf) => {
        modelCache.set(modelPath, gltf.scene);
        if (currentModelPath === modelPath) {
          modelRoot.add(gltf.scene);
          frameModel(gltf.scene);
        }
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
