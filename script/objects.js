// objects.js - Gestion des objets qui tombent

const resitutionValue = 0.9;
const frictionValueAir = 0.02;
const frictionValue = 0.05;

/**
 * Compute spawn coordinates (bag center / opening) from the bag's actual
 * rendered position. Pure function: returns { x, y } in viewport pixels.
 */
function computeSpawnPoint() {
  const bag = document.getElementById("animation-bag");
  if (!bag) return { x: 0, y: 0 };
  const rect = bag.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height * 0.5,
  };
}

const OBJECT_CONFIG = {
  tabac: {
    width: 160,
    height: 93,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/tabac.webp",
      xScale: 0.5,
      yScale: 0.5,
    },
  },
  filtre: {
    width: 160,
    height: 93,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/filtre.webp",
      xScale: 0.5,
      yScale: 0.5,
    },
  },
  pamplemousse: {
    radius: 40,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/pamplemousse.webp",
      xScale: 0.2,
      yScale: 0.2,
    },
  },
  rondpoint: {
    radius: 80,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/rondpoint-projects/rondpoint.webp",
      xScale: 0.1,
      yScale: 0.1,
    },
  },
  aboutme: {
    width: 140,
    height:100,
    angle: 2,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false,
    sprite: {
      texture: "assets/2d/aboutme.webp",
      xScale: 0.2,
      yScale: 0.2,
    },
  },
  korg:{
    width: 100,
    height:100,
    angle: 2,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false,
    sprite: {
      texture: "assets/2d/korg-cd.webp",
      xScale: 0.2,
      yScale: 0.2,
    },
  },
  vroomvroom: {
    width: 100,
    height: 100,
    angle: 2,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false,
    sprite: {
      texture: "assets/2d/tabac.webp",
      xScale: 0.2,
      yScale: 0.2,
    },
  }
};

// Variables globales pour les objets
let tabac, filtre, pamplemousse, rondpoint, aboutme, korg, vroomvroom;

/**
 * Créer l'objet tabac
 */
function createTabac(x, y) {
  const config = OBJECT_CONFIG.tabac;

  tabac = Matter.Bodies.rectangle(
    x,
    y,
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
function createFiltre(x, y) {
  const config = OBJECT_CONFIG.filtre;

  filtre = Matter.Bodies.rectangle(
    x,
    y,
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

function createPamplemousse(x, y) {
  const config = OBJECT_CONFIG.pamplemousse;

  pamplemousse = Matter.Bodies.circle(x, y, config.radius, {
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

function createRondpoint(x, y) {
  const config = OBJECT_CONFIG.rondpoint;
  rondpoint = Matter.Bodies.circle(x, y, config.radius, {
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

function createAboutMe(x, y) {
  const config = OBJECT_CONFIG.aboutme;

  aboutme = Matter.Bodies.rectangle(
    x,
    y,
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

function createKorg(x, y) {
  const config = OBJECT_CONFIG.korg;

  korg = Matter.Bodies.rectangle(
    x,
    y,
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

function createVroomvroom(x, y) {
  const config = OBJECT_CONFIG.vroomvroom;

  vroomvroom = Matter.Bodies.rectangle(
    x,
    y,
    config.width,
    config.height,
    {
      angle: config.angle,
      label: "vroomvroom",
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
  return vroomvroom;
}

const objects = [];

/**
 * Créer tous les objets
 */
function createObjects() {
  const p = computeSpawnPoint();
  return [
    createTabac(p.x, p.y),
    createFiltre(p.x, p.y),
    createPamplemousse(p.x, p.y),
    createRondpoint(p.x, p.y),
    createAboutMe(p.x, p.y),
    createKorg(p.x, p.y),
    createVroomvroom(p.x, p.y),
  ];
}

/**
 * Obtenir tous les objets
 */
function getObjects() {
  return [tabac, filtre, pamplemousse, rondpoint, aboutme, korg, vroomvroom];
}
