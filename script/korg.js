

const titleD = document.getElementById("title-d");
const korgText = document.getElementById("korg-text");
const animation = document.getElementById("animation-bag");
const korgbody = document.getElementById("korg-body");
const hero = document.getElementById("hero-section");
const backButton = document.getElementById("KorgBack");






// add a variable of image of the cd
// maybe using three.js ? :)
// put the korgText at the top of the page

const sandwich = document.getElementById("sandwich");

window.onKorgClick = function(body) {
  document.body.style.backgroundColor = "black";
  document.body.style.color = "white";
  titleD.style.display = "none";
  Matter.Composite.remove(engine.world, ground);
    setTimeout(() => {
    Matter.Composite.remove(engine.world, [korg, filtre, tabac, pamplemousse, aboutme]);
  }, 2000); // délai de 500ms avant d'exécuter la fonction

  sandwich.style.display = "none";
  animation.style.display = "none";
  korgbody.style.display = "flex";
  korgText.style.display = "flex";
  hero.style.position = "static";
  hero.style.textAlign = "left";
  hero.style.justifyContent = "flex-start";
}

function addToWorld(bodies) {
  Matter.Composite.add(engine.world, bodies);
}

function resetAll() {
  resetState();
  startSimulation();
  addToWorld(bodies);
}
KorgBack.addEventListener("click", resetAll);




function resetState() {
  document.body.style.backgroundColor = "white";
  document.body.style.color = "black";
  titleD.style.display = "block";

  if (typeof engine !== "undefined" && typeof ground !== "undefined") {
    Matter.Composite.add(engine.world, ground);
  }

  sandwich.style.display = "none";
  animation.style.display = "block";
  korgbody.style.display = "none";
  korgText.style.display = "none";

  hero.style.position = "";
  hero.style.textAlign = "";
  hero.style.justifyContent = "space-between";
}


const container = document.getElementById('threejs');

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.z = 3;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);

// On injecte le canvas DANS la div
container.appendChild(renderer.domElement);

// Exemple d’objet
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Animation
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// Gestion du resize de la div
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
