// objects.js - Gestion des objets qui tombent

const resitutionValue = 0.9;
const frictionValueAir = 0.02;
const frictionValue = 0.05;

/**
 * Spawn point = center of the #sandwich overlay, which sits on the bag's mouth.
 * Measured once when the DOM/images/fonts are ready and cached in `spawnPoint`.
 */
let spawnPoint = null;

/**
 * Measure the sandwich real box without a visual flash: layout it, hide the
 * paint, read the rect and restore in the same task (no repaint in between).
 */
function initSpawnPoint() {
  const sandwich = document.getElementById("sandwich");
  if (!sandwich) return;

  const prevDisplay = sandwich.style.display;
  sandwich.style.display = "block";
  sandwich.style.visibility = "hidden";
  const rect = sandwich.getBoundingClientRect();
  sandwich.style.visibility = "";
  sandwich.style.display = prevDisplay;

  if (rect.width > 0 && rect.height > 0) {
    spawnPoint = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
}

// "load" (not DOMContentLoaded) guarantees the bag/sandwich images' intrinsic
// sizes are resolved, so `height: auto` produces the final layout. fonts.ready
// avoids the hero shifting after the webfonts arrive.
window.addEventListener("load", () => {
  Promise.all([document.fonts.ready]).then(initSpawnPoint);
});

// Keep the cached midpoint in sync with the viewport.
window.addEventListener("resize", () => {
  spawnPoint = null;
  initSpawnPoint();
});

/**
 * Compute the spawn coordinates. Returns { x, y } in viewport pixels.
 */
function computeSpawnPoint() {
  if (spawnPoint) return spawnPoint;

  // Fallback before images/fonts resolve: approximate the bag mouth from the
  // bag box and the sandwich/bag aspect ratio (338 / 282).
  const bag = document.getElementById("animation-bag");
  if (!bag) return { x: 0, y: 0 };
  const rect = bag.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + (rect.width * (338 / 282)) / 2,
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
  eracom: {
    width: 160,
    height: 93,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false, // Change à false pour activer la physique
    sprite: {
      texture: "assets/2d/eracom-projects/poster.jpg",
      xScale: 0.11,
      yScale: 0.113,
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
      texture: "assets/2d/vroomvroom.webp",
      xScale: 0.2,
      yScale: 0.2,
    },
  },
  premierjour: {
    radius: 40,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false,
    sprite: {
      texture: "assets/2d/pamplemousse.webp",
      xScale: 0.2,
      yScale: 0.2,
    },
  },
  betweenworlds: {
    width: 160,
    height: 90,
    angle: (3 * Math.PI) / 180,
    restitution: resitutionValue,
    friction: frictionValue,
    frictionAir: frictionValueAir,
    isStatic: false,
    sprite: {
      texture: "assets/2d/betweenworlds.webp",
      xScale: 1.5,
      yScale: 1.5,
    },
  }
};

// Variables globales pour les objets
let tabac, eracom, rondpoint, aboutme, korg, vroomvroom, premierjour, betweenworlds;

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
 * Créer l'objet eracom
 */
function createEracom(x, y) {
  const config = OBJECT_CONFIG.eracom;

  eracom = Matter.Bodies.rectangle(
    x,
    y,
    config.width,
    config.height,
    {
      angle: config.angle,
      label: "eracom",
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

  return eracom;
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

function createPremierjour(x, y) {
  const config = OBJECT_CONFIG.premierjour;

  premierjour = Matter.Bodies.circle(x, y, config.radius, {
    angle: config.angle,
    label: "premierjour",
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

  return premierjour;
}

function createBetweenworlds(x, y) {
  const config = OBJECT_CONFIG.betweenworlds;

  betweenworlds = Matter.Bodies.rectangle(
    x,
    y,
    config.width,
    config.height,
    {
      angle: config.angle,
      label: "betweenworlds",
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

  return betweenworlds;
}

const objects = [];

/**
 * Créer tous les objets
 */
function createObjects() {
  const p = computeSpawnPoint();
  return [
    createTabac(p.x, p.y),
    createEracom(p.x, p.y),
    createRondpoint(p.x, p.y),
    createAboutMe(p.x, p.y),
    createKorg(p.x, p.y),
    createVroomvroom(p.x, p.y),
    createPremierjour(p.x, p.y),
    createBetweenworlds(p.x, p.y),
  ];
}

/**
 * Obtenir tous les objets
 */
function getObjects() {
  return [tabac, eracom, rondpoint, aboutme, korg, vroomvroom, premierjour, betweenworlds];
}
