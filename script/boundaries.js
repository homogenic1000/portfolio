// boundaries.js - Gestion des murs et du sol

const BOUNDARY_CONFIG = {
    groundHeight: 10,
    wallWidth: 10,
    restitution: 1,
    friction: 0,
    ceilingWidth: 10,

};

// Variables globales pour les boundaries
let ground, leftWall, rightWall, ceiling;

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

    ceiling = Matter.Bodies.rectangle(
        window.innerWidth / 2,
        BOUNDARY_CONFIG.ceilingWidth / 2,
        window.innerWidth,
        BOUNDARY_CONFIG.ceilingWidth,
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
    
    return [ground, leftWall, rightWall, ceiling];
}

/**
 * Repositionner les boundaries lors du redimensionnement
 */
function updateBoundariesOnResize() {
    // Mettre à l'échelle les boundaries pour correspondre à la taille de la fenêtre
    // On calcule le facteur de scale en comparant la taille cible (fenêtre) à la taille actuelle (bounds)
    if (ground) {
        const currentGroundWidth = ground.bounds.max.x - ground.bounds.min.x || 1;
        const targetGroundWidth = window.innerWidth;
        const scaleGroundX = targetGroundWidth / currentGroundWidth;
        if (isFinite(scaleGroundX) && scaleGroundX > 0) {
            Matter.Body.scale(ground, scaleGroundX, 1);
        }
        Matter.Body.setPosition(ground, {
            x: targetGroundWidth / 2,
            y: window.innerHeight - BOUNDARY_CONFIG.groundHeight / 2
        });
    }

    if (ceiling) {
        const currentCeilingWidth = ceiling.bounds.max.x - ceiling.bounds.min.x || 1;
        const targetCeilingWidth = window.innerWidth;
        const scaleCeilingX = targetCeilingWidth / currentCeilingWidth;
        if (isFinite(scaleCeilingX) && scaleCeilingX > 0) {
            Matter.Body.scale(ceiling, scaleCeilingX, 1);
        }
        Matter.Body.setPosition(ceiling, {
            x: targetCeilingWidth / 2,
            y: BOUNDARY_CONFIG.ceilingWidth / 2
        });
    }

    if (leftWall) {
        const currentLeftHeight = leftWall.bounds.max.y - leftWall.bounds.min.y || 1;
        const targetWallHeight = window.innerHeight;
        const scaleLeftY = targetWallHeight / currentLeftHeight;
        if (isFinite(scaleLeftY) && scaleLeftY > 0) {
            Matter.Body.scale(leftWall, 1, scaleLeftY);
        }
        Matter.Body.setPosition(leftWall, {
            x: BOUNDARY_CONFIG.wallWidth / 2,
            y: targetWallHeight / 2
        });
    }

    if (rightWall) {
        const currentRightHeight = rightWall.bounds.max.y - rightWall.bounds.min.y || 1;
        const targetWallHeight = window.innerHeight;
        const scaleRightY = targetWallHeight / currentRightHeight;
        if (isFinite(scaleRightY) && scaleRightY > 0) {
            Matter.Body.scale(rightWall, 1, scaleRightY);
        }
        Matter.Body.setPosition(rightWall, {
            x: window.innerWidth - BOUNDARY_CONFIG.wallWidth / 2,
            y: targetWallHeight / 2
        });
    }
}

/**
 * Obtenir toutes les boundaries
 */
function getBoundaries() {
    return [ground, leftWall, rightWall, ceiling];
}