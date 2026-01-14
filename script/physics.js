// physics.js - Fichier principal pour l'initialisation du moteur Matter.js et les fonctions de rendu

// Variables globales du moteur Matter.js
let engine, render, runner;

// Configuration du moteur
const ENGINE_CONFIG = {
  gravity: {
    x: 0,
    y: 0.8, // Augmenté pour une chute plus rapide
  },
};

// Configuration du rendu
const RENDER_CONFIG = {
  wireframes: false,
  background: "transparent",
  showAngleIndicator: false,
  showVelocity: true,
};

/**
 * Initialiser le moteur Matter.js
 */
function initEngine() {
  // Créer le moteur
  engine = Matter.Engine.create();

  // Configurer la gravité
  engine.world.gravity.x = ENGINE_CONFIG.gravity.x;
  engine.world.gravity.y = ENGINE_CONFIG.gravity.y;

  return engine;
}

/**
 * Initialiser le rendu
 */
function initRender() {
  render = Matter.Render.create({
    element: document.getElementById("physic"),
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: RENDER_CONFIG.wireframes,
      background: RENDER_CONFIG.background,
      showAngleIndicator: RENDER_CONFIG.showAngleIndicator,
      showVelocity: RENDER_CONFIG.showVelocity,
    },
  });

  return render;
}

/**
 * Configurer le style du canvas
 */
function configureCanvas() {
  // Fix the canvas so it doesn't change document size and create scrollbars
  render.canvas.style.position = "fixed";
  render.canvas.style.top = "0";
  render.canvas.style.left = "0";
  render.canvas.style.width = "100vw";
  render.canvas.style.height = "100vh";
  render.canvas.style.display = "block";
  render.canvas.style.pointerEvents = "auto"; // Changé de "none" à "auto" pour permettre les interactions
  render.canvas.style.zIndex = "3";
}

/**
 * Démarrer le rendu et la simulation
 */
function startSimulation() {
  // Lancer le rendu
  Matter.Render.run(render);

  // Configurer le canvas
  configureCanvas();

  // Ajouter la gestion des clics
  setupClickHandlers();

  // Créer et démarrer le runner
  runner = Matter.Runner.create();
  Matter.Runner.run(runner, engine);
}

/**
 * Ajouter des corps au monde
 */
function addToWorld(bodies) {
  Matter.Composite.add(engine.world, bodies);
}

/**
 * Gérer le redimensionnement de la fenêtre
 */
function handleResize() {
  // Mettre à jour la taille du canvas
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;

  // Mettre à jour les boundaries
  updateBoundariesOnResize();
}

/**
 * Fonction principale pour démarrer la physique
 */
function startPhysics() {
  // Initialiser le moteur
  initEngine();

  // Initialiser le rendu
  initRender();

  // Créer les boundaries (murs et sol)
  const boundaries = createBoundaries();

  // Ajouter les boundaries au monde
  addToWorld(boundaries);

  // Ajouter les objets avec délai
  const objectFunctions = [
    createTabac,
    createFiltre,
    createPamplemousse,
    createRondpoint,
    createAboutMe,
    createKorg,
  ];
  objectFunctions.forEach((createFn, index) => {
    setTimeout(() => {
      const obj = createFn();
      addToWorld([obj]);
    }, index * 500);
  });

  // Démarrer la simulation
  startSimulation();

  // Appliquer une première fois le redimensionnement pour que canvas et boundaries soient corrects
  handleResize();

  // Gérer le redimensionnement (une seule fois)
  window.addEventListener("resize", handleResize);
}

/**
 * Obtenir le moteur
 */
function getEngine() {
  return engine;
}

/**
 * Obtenir le rendu
 */
function getRender() {
  return render;
}

/**
 * Obtenir le runner
 */
function getRunner() {
  return runner;
}

/**
 * Configurer les gestionnaires de clics pour les objets
 */
function setupClickHandlers() {
  const canvas = render.canvas;
  
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Convertir les coordonnées canvas en coordonnées Matter.js
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = mouseX * scaleX;
    const clickY = mouseY * scaleY;
    
    // Vérifier quel objet a été cliqué
    const bodies = Matter.Composite.allBodies(engine.world);
    
    for (let body of bodies) {
      if (Matter.Bounds.contains(body.bounds, { x: clickX, y: clickY })) {
        // Vérification plus précise pour les cercles et rectangles
        if (Matter.Vertices.contains(body.vertices, { x: clickX, y: clickY })) {
          handleObjectClick(body);
          break;
        }
      }
    }
  });
}

/**
 * Gérer le clic sur un objet en fonction de son label
 */
function handleObjectClick(body) {
  switch(body.label) {
    case 'aboutme':
      onAboutMeClick(body);
      break;
    case 'pamplemousse':
      onPamplemousseCick(body);
      break;
    case 'korg':
      onKorgClick(body);
      break;
    default:
      console.log('Objet cliqué:', body.label);
  }
}
