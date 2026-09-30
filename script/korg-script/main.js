// Visionneuse 3D paresseuse : three.js n'est téléchargé que lorsqu'un projet de
// type "3d" est ouvert (via window.CDViewer.show), pas au chargement de la page.
// Les imports sont dynamiques — des imports statiques en haut de module
// downloaded ~1.8 Mo de Three.js sur TOUTES les pages, y compris celles qui
// n'affichent que de la vidéo ou des images.

let container;
let renderer, scene, camera, controls, modelRoot;
let initialized = false;
let currentModelPath = null;
let resizeRef = null;

// Remplis à la première ouverture d'un projet 3D (voir ensureThree).
let THREE, OrbitControls, GLTFLoader;

const modelCache = new Map();
let loader = null;
let threePromise = null;

/**
 * Charger three.js + ses deux addons une seule fois, à la demande.
 * Le module est mis en cache par le navigateur, donc les appels suivants
 * résolvent immédiatement.
 */
function ensureThree() {
  if (threePromise) return threePromise;
  threePromise = Promise.all([
    import('three'),
    import('three/addons/controls/OrbitControls.js'),
    import('three/addons/loaders/GLTFLoader.js'),
  ]).then(([three, orbit, gltf]) => {
    THREE = three;
    OrbitControls = orbit.OrbitControls;
    GLTFLoader = gltf.GLTFLoader;
    loader = new GLTFLoader();
  });
  return threePromise;
}

// Vue par défaut : trois-quarts, presque isométrique. Le boîtier CD est un
// objet plat posé sur le plan XZ (2.11 x 0.16 x 2.32), donc une caméra sur
// l'axe Z ne le verrait que par la tranche : cette direction la surélève et
// la décale pour regarder le dessus et la tranche du même coup.
const DEFAULT_DIRECTION = [1, 0.85, 1];
const FRAME_MARGIN = 1.12;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  // Un <canvas> sans nom accessible est invisible pour un lecteur d'écran :
  // on le déclare comme une image et on décrit l'interaction disponible.
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute(
    'aria-label',
    'Interactive 3D model — drag to orbit, scroll to zoom'
  );
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
  const dir = new THREE.Vector3(...DEFAULT_DIRECTION).normalize();
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

  // three.js n'est chargé qu'ici, une fois qu'un projet 3D est réellement ouvert.
  return ensureThree().then(() => {
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
  });
}

function hide() {
  if (!initialized) return;
  container.style.display = 'none';
  renderer.setAnimationLoop(null); // stoppe la boucle de rendu tant que caché
}

window.CDViewer = { show, hide };
