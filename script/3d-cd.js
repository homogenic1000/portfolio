import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('threejs');
let isInitialized = false;

function initThreeJS() {
  if (isInitialized) return;
  isInitialized = true;
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  // SCENE
  const scene = new THREE.Scene();

  // CAMERA
  const camera = new THREE.PerspectiveCamera(
    60,
    width / height,
    0.1,
    1000
  );
  camera.position.set(0, 0, 2);
  camera.rotation.set(0, 0, -90);

  // RENDERER dans la div
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // CONTROLS - permet de tourner le modèle avec la souris
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = false;

  

  // LUMIÈRE
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2, 5, 2);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // CHARGEMENT GLB
  const loader = new GLTFLoader();

  loader.load(
    'assets/model/cd.glb',
    function (gltf) {
      const model = gltf.scene;
      scene.add(model);

      // recentrer / mise à l'échelle auto
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);
      model.scale.setScalar(1.5 / size);
      model.rotation.set(0, 0, 180);
    },
    undefined,
    function (error) {
      console.error("Erreur GLB:", error);
    }
   
  );

  // ANIMATION 
  // it does not aniamte but if you delte this function the modle just won't show witouht any errors
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();



  // RESIZE propre à la div
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth || 800;
    const newHeight = container.clientHeight || 600;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}



// Initialiser quand le conteneur est visible
if (container.clientWidth > 0 && container.clientHeight > 0) {
  initThreeJS();
} else {
  // Attendre que le conteneur devienne visible
  const observer = new MutationObserver(() => {
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      initThreeJS();
      observer.disconnect();
    }
  });
  observer.observe(container.parentElement, { attributes: true, childList: true, subtree: true });
}
