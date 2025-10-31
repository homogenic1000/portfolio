// objects.js - Gestion des objets qui tombent

spawnX = 50
spawnY = 100
resitutionValue = 0.9
frictionValueAir = 0.01
frictionValue = 0.01



const OBJECT_CONFIG = {
    tabac: {
        width: 160,
        height: 93,
        x: spawnX,
        y: spawnY,
        restitution: resitutionValue ,
        friction: frictionValue,
        frictionAir: frictionValueAir,
        isStatic: false, // Change à false pour activer la physique
        sprite: {
            texture: 'assets/2d/tabac.png',
            xScale: 0.5,
            yScale: 0.5
        }
    },
    filtre: {
        width: 160,
        height: 93,
        x: spawnX,
        y: spawnY,
        restitution: resitutionValue,
        friction: frictionValue,
        frictionAir: frictionValueAir,
        isStatic: false, // Change à false pour activer la physique
        sprite: {
            texture: 'assets/2d/filtre.png',
            xScale: 0.5,
            yScale: 0.5
        }
    },
    pamplemousse: {
        radius: 40,
        x: spawnX,
        y: spawnY,
        restitution: resitutionValue
        ,
        friction: frictionValue,
        frictionAir: frictionValueAir,
        isStatic: false, // Change à false pour activer la physique
        sprite: {
            texture: 'assets/2d/pamplemousse.png',
            xScale: 0.2,
            yScale: 0.2,
        }

    },
    rondpoint: {
        radius: 80,
        x: spawnX,
        y: spawnY,
        restitution: resitutionValue,
        friction: frictionValue,
        frictionAir: frictionValueAir,
        isStatic: false, // Change à false pour activer la physique
        sprite: {
            texture: 'assets/2d/rondpoint.png',
            xScale: 0.1,
            yScale: 0.1
        }

    },
};


// Variables globales pour les objets
let tabac, filtre, pamplemousse, rondpoint;





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

function createPamplemousse() {
    const config = OBJECT_CONFIG.pamplemousse;

    pamplemousse = Matter.Bodies.circle(
        config.x,
        config.y,
        config.radius,
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

    return pamplemousse;
}

function createRondpoint() {
    const config = OBJECT_CONFIG.rondpoint;
    rondpoint = Matter.Bodies.circle(
        config.x,
        config.y,
        config.radius,
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

    return rondpoint;

}


const objects = [];

    /**
     * Créer tous les objets
     */
    function createObjects() {
        return [
            createTabac(),
            createFiltre(),
            createPamplemousse(),
            createRondpoint(),

        ];
    }

    /**
     * Obtenir tous les objets
     */
    function getObjects() {
        return [tabac, filtre, pamplemousse, rondpoint];
    }


console.log(tabac.restitution)