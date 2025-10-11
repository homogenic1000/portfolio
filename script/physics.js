// physics.js - Fichier principal pour l'initialisation du moteur Matter.js et les fonctions de rendu

// Variables globales du moteur Matter.js
let engine, render, runner;

// Configuration du moteur
const ENGINE_CONFIG = {
    gravity: {
        x: 0,
        y: 0.5 // Valeur par défaut: 1
    }
};

// Configuration du rendu
const RENDER_CONFIG = {
    wireframes: false,
    background: 'transparent',
    showAngleIndicator: false,
    showVelocity: false
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
            showVelocity: RENDER_CONFIG.showVelocity
        }
    });
    
    return render;
}

/**
 * Configurer le style du canvas
 */
function configureCanvas() {
    render.canvas.style.position = 'absolute';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.pointerEvents = 'none';
    render.canvas.style.zIndex = '2';
}


/**
 * Démarrer le rendu et la simulation
 */
function startSimulation() {
    // Lancer le rendu
    Matter.Render.run(render);
    
    // Configurer le canvas
    configureCanvas();
    
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
    
    // Créer les objets
    const objects = createObjects();
    
    // Ajouter tous les corps au monde
    addToWorld([...boundaries, ...objects]);
    
    // Démarrer la simulation
    startSimulation();
    
    // Gérer le redimensionnement
    window.addEventListener('resize', handleResize);
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