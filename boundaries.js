// boundaries.js - Gestion des murs et du sol

const BOUNDARY_CONFIG = {
    groundHeight: 60,
    wallWidth: 60,
    restitution: 0.2,
    friction: 0.8
};

// Variables globales pour les boundaries
let ground, leftWall, rightWall;

/**
 * Créer les boundaries (sol et murs)
 */
function createBoundaries() {
    // Sol invisible en bas
    ground = Matter.Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight - BOUNDARY_CONFIG.groundHeight / 2,
        window.innerWidth,
        BOUNDARY_CONFIG.groundHeight,
        {
            isStatic: true,
            restitution: BOUNDARY_CONFIG.restitution,
            friction: BOUNDARY_CONFIG.friction,
            render: {
                visible: false,
                fillStyle: '#444'
            }
        }
    );
    
    // Mur de gauche
    leftWall = Matter.Bodies.rectangle(
        BOUNDARY_CONFIG.wallWidth / 2,
        window.innerHeight / 2,
        BOUNDARY_CONFIG.wallWidth,
        window.innerHeight,
        {
            isStatic: true,
            restitution: BOUNDARY_CONFIG.restitution,
            friction: BOUNDARY_CONFIG.friction,
            render: {
                visible: false,
                fillStyle: '#444'
            }
        }
    );
    
    // Mur de droite
    rightWall = Matter.Bodies.rectangle(
        window.innerWidth - BOUNDARY_CONFIG.wallWidth / 2,
        window.innerHeight / 2,
        BOUNDARY_CONFIG.wallWidth,
        window.innerHeight,
        {
            isStatic: true,
            restitution: BOUNDARY_CONFIG.restitution,
            friction: BOUNDARY_CONFIG.friction,
            render: {
                visible: false,
                fillStyle: '#444'
            }
        }
    );
    
    return [ground, leftWall, rightWall];
}

/**
 * Repositionner les boundaries lors du redimensionnement
 */
function updateBoundariesOnResize() {
    // Repositionner le sol
    Matter.Body.setPosition(ground, {
        x: window.innerWidth / 2,
        y: window.innerHeight - BOUNDARY_CONFIG.groundHeight / 2
    });
    
    // Repositionner le mur de droite
    Matter.Body.setPosition(rightWall, {
        x: window.innerWidth - BOUNDARY_CONFIG.wallWidth / 2,
        y: window.innerHeight / 2
    });
    
    // Repositionner le mur de gauche
    Matter.Body.setPosition(leftWall, {
        x: BOUNDARY_CONFIG.wallWidth / 2,
        y: window.innerHeight / 2
    });
}

/**
 * Obtenir toutes les boundaries
 */
function getBoundaries() {
    return [ground, leftWall, rightWall];
}