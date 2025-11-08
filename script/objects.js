// objects.js - Gestion des objets qui tombent

spawnX = 150;
spawnY = 240;
const resitutionValue = 0.9;
const frictionValueAir = 0.02;
const frictionValue = 0.05;

const OBJECT_CONFIG = {
  tabac: {
    width: 160,
    height: 93,
    x: spawnX,
    y: spawnY,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/tabac.png",
      xScale: 0.5,
      yScale: 0.5,
    },
  },
  filtre: {
    width: 160,
    height: 93,
    x: spawnX,
    y: spawnY,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/filtre.png",
      xScale: 0.5,
      yScale: 0.5,
    },
  },
  pamplemousse: {
    radius: 40,
    x: spawnX,
    y: spawnY,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/pamplemousse.png",
      xScale: 0.2,
      yScale: 0.2,
    },
  },
  rondpoint: {
    radius: 80,
    x: spawnX,
    y: spawnY,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/rondpoint.png",
      xScale: 0.1,
      yScale: 0.1,
    },
  },
  aboutme: {
    width: 140,
    height:100,
    x: spawnX,
    y: spawnY,
    angle: 2,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false,
    sprite: {
      texture: "assets/2d/aboutme.png",
      xScale: 0.2,
      yScale: 0.2,
    },
  },
  korg:{
    width: 100,
    height:100,
    x: spawnX,
    y: spawnY,
    angle: 2,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false,
    sprite: {
      texture: "assets/2d/korg.png",
      xScale: 0.2,
      yScale: 0.2,
    },
  }
};

// Variables globales pour les objets
let tabac, filtre, pamplemousse, rondpoint, aboutme;

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
      angle: config.angle,
      label: "tabac",
      isStatic: config.isStatic,
      restitution: config.restitution,
      friction: config.friction,
      frictionAir: config.frictionAir,
      render: {
        sprite: {
          texture: config.sprite.texture,
          xScale: config.sprite.xScale,
          yScale: config.sprite.yScale,
        },
      },
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
      angle: config.angle,
      label: "filtre",
      isStatic: config.isStatic,
      restitution: config.restitution,
      friction: config.friction,
      frictionAir: config.frictionAir,
      render: {
        sprite: {
          texture: config.sprite.texture,
          xScale: config.sprite.xScale,
          yScale: config.sprite.yScale,
        },
      },
    }
  );

  return filtre;
}

function createPamplemousse() {
  const config = OBJECT_CONFIG.pamplemousse;

  pamplemousse = Matter.Bodies.circle(config.x, config.y, config.radius, {
    angle: config.angle,
    label: "pamplemousse",
    isStatic: config.isStatic,
    restitution: config.restitution,
    friction: config.friction,
    frictionAir: config.frictionAir,
    render: {
      sprite: {
        texture: config.sprite.texture,
        xScale: config.sprite.xScale,
        yScale: config.sprite.yScale,
      },
    },
  });

  return pamplemousse;
}

function createRondpoint() {
  const config = OBJECT_CONFIG.rondpoint;
  rondpoint = Matter.Bodies.circle(config.x, config.y, config.radius, {
    angle: config.angle,
    label: "rondpoint",
    isStatic: config.isStatic,
    restitution: config.restitution,
    friction: config.friction,
    frictionAir: config.frictionAir,
    render: {
      sprite: {
        texture: config.sprite.texture,
        xScale: config.sprite.xScale,
        yScale: config.sprite.yScale,
      },
    },
  });

  return rondpoint;
}

function createAboutMe() {
  const config = OBJECT_CONFIG.aboutme;

  aboutme = Matter.Bodies.rectangle(
    config.x,
    config.y,
    config.width,
    config.height,
    {
      angle: config.angle,
      label: "aboutme",
      isStatic: config.isStatic,
      restitution: config.restitution,
      friction: config.friction,
      frictionAir: config.frictionAir,
      render: {
        sprite: {
          texture: config.sprite.texture,
          xScale: config.sprite.xScale,
          yScale: config.sprite.yScale,
        },
      },
    }
  );
  return aboutme;
}

createKorg = () => {
  const config = OBJECT_CONFIG.korg;

  korg = Matter.Bodies.rectangle(
    config.x,
    config.y,
    config.width,
    config.height,
    {
      angle: config.angle,
      label: "korg",
      isStatic: config.isStatic,
      restitution: config.restitution,
      friction: config.friction,
      frictionAir: config.frictionAir,
      render: {
        sprite: {
          texture: config.sprite.texture,
          xScale: config.sprite.xScale,
          yScale: config.sprite.yScale,
        },
      },
    }
  );
  return korg;
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
    createAboutMe(),
    createKorg(),
  ];
}

/**
 * Obtenir tous les objets
 */
function getObjects() {
  return [tabac, filtre, pamplemousse, rondpoint, aboutme, korg];
}
