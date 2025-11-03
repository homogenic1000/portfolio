// mouseConstraint.js - Gestion des interactions souris avec les objets Matter.js

let mouseConstraint;

/**
 * Initialiser la contrainte de souris
 */
function initMouseConstraint(engine, render) {
  // Ajouter la souris avec les options de rendu
  const mouse = Matter.Mouse.create(render.canvas);

  // Ajuster l'échelle de la souris pour correspondre au zoom du canvas
  mouse.pixelRatio = window.devicePixelRatio;

  // Créer la contrainte de souris avec plus de contrôle
  mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: true,
        lineWidth: 1,
        strokeStyle: "#ffffff",
      },
    },
    collisionFilter: {
      mask: 0x0001, // Permettre l'interaction avec tous les objets
    },
  });

  // Ajouter la contrainte au monde
  Matter.Composite.add(engine.world, mouseConstraint);

  // Désactiver le scroll sur le canvas lors du drag
  render.canvas.addEventListener("mousewheel", function (event) {
    event.preventDefault();
  });

  // Événements de la souris
  Matter.Events.on(mouseConstraint, "mousedown", function (event) {
    console.log("Mouse down event triggered");
    const mousePosition = event.mouse.position;
    const bodies = Matter.Composite.allBodies(engine.world);

    bodies.forEach(function (body) {
      if (
        Matter.Bounds.contains(body.bounds, mousePosition) &&
        Matter.Vertices.contains(body.vertices, mousePosition)
      ) {
        console.log("Object clicked:", body.label || "Unknown object");

        // Appliquer une force pour rendre l'interaction plus dynamique
        Matter.Body.setAngularVelocity(body, 0.05);
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.001,
          y: -0.01,
        });
      }
    });
  });

  // Événement pour le déplacement des objets
  Matter.Events.on(mouseConstraint, "startdrag", function (event) {
    console.log("Start dragging object");
    const body = event.body;
    if (body) {
      // Rendre l'objet plus léger pendant le déplacement
      body.frictionAir = 0.1;
    }
  });

  Matter.Events.on(mouseConstraint, "enddrag", function (event) {
    console.log("End dragging object");
    const body = event.body;
    if (body) {
      // Restaurer les propriétés normales
      body.frictionAir = 0.01;
    }
  });
}

/**
 * Obtenir la contrainte de souris
 */
function getMouseConstraint() {
  return mouseConstraint;
}
