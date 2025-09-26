// objects.js - Gestion des objets qui tombent

const OBJECT_CONFIG = {
    tabac: {
        width: 160,
        height: 93,
        x: 400,
        y: 50,
        restitution: 0.3,
        friction: 0.7,
        frictionAir: 0.01,
        isStatic: true, // Change à false pour activer la physique
        sprite: {
            texture: 'assets/2d/tabac.png',
            xScale: 0.5,
            yScale: 0.5
        }
    },
    filtre: {
        width: 80,
        height: 53,
        x: 400,
        y: 200,
        restitution: 0.3,
        friction: 0.7,
        frictionAir: 0.01,
        isStatic: false, // Change à false pour activer la physique
        sprite: {
            texture: 'assets/2d/filtre.png',
            xScale: 0.5,
            yScale: 0.5
        }
    }
};

// Variables globales pour les objets
let tabac, filtre;

/**
 * Créer l'objet tabac
 */
function createTabac() {
    const config = OBJECT_CONFIG.tabac;
    
    tabac = Matter.Bodies.rectangle(
        config.x,
        config.y,
        config.width,
        config.height,
        {
            isStatic: config.isStatic,
            restitution: config.restitution,
            friction: config.friction,
            frictionAir: config.frictionAir,
            render: {
                sprite: {
                    texture: config.sprite.texture,
                    xScale: config.sprite.xScale,
                    yScale: config.sprite.yScale
                }
            }
        }
    );
    
    return tabac;
}

/**
 * Créer l'objet filtre
 */
function createFiltre() {
    const config = OBJECT_CONFIG.filtre;
    
    filtre = Matter.Bodies.rectangle(
        config.x,
        config.y,
        config.width,
        config.height,
        {
            isStatic: config.isStatic,
            restitution: config.restitution,
            friction: config.friction,
            frictionAir: config.frictionAir,
            render: {
                sprite: {
                    texture: config.sprite.texture,
                    xScale: config.sprite.xScale,
                    yScale: config.sprite.yScale
                }
            }
        }
    );
    
    return filtre;
}

/**
 * Créer tous les objets
 */
function createObjects() {
    return [
        createTabac(),
        createFiltre()
    ];
}

/**
 * Obtenir tous les objets
 */
function getObjects() {
    return [tabac, filtre];
}

/**
 * Activer/désactiver la physique pour un objet
 */
function toggleObjectPhysics(object, isStatic) {
    Matter.Body.setStatic(object, isStatic);
}

/**
 * Activer/désactiver la physique pour le tabac
 */
function toggleTabacPhysics(isStatic = false) {
    if (tabac) {
        toggleObjectPhysics(tabac, isStatic);
    }
}

/**
 * Activer/désactiver la physique pour le filtre
 */
function toggleFiltrePhysics(isStatic = false) {
    if (filtre) {
        toggleObjectPhysics(filtre, isStatic);
    }
}