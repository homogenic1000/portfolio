// mouseConstraint.js - Gestion des interactions souris avec les objets Matter.js

let mouseConstraint;

/**
 * Initialiser la contrainte de souris
 */
function initMouseConstraint(engine, render) {
  console.log("[mouseConstraint] initMouseConstraint called");

  // Ajouter la souris avec les options de rendu
  const mouse = Matter.Mouse.create(render.canvas);

  // Attacher la souris au render (permet l'affichage et certaines interactions)
  render.mouse = mouse;

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
      mask: 0xffffffff, // Permettre l'interaction avec tous les objets
    },
  });

  // Ajouter la contrainte au monde
  Matter.Composite.add(engine.world, mouseConstraint);

  // Désactiver le scroll sur le canvas lors du drag
  render.canvas.addEventListener("mousewheel", function (event) {
    event.preventDefault();
  });

  // Événements de la souris
  // Handlers spécifiques aux objets (accèdent à engine via closure)
  function onPamplemousseClick(body) {
    console.log("Pamplemousse clicked");
    // Petite explosion vers le haut et augmentation de la rotation
    Matter.Body.applyForce(body, body.position, { x: 0, y: -0.02 });
    Matter.Body.setAngularVelocity(body, 0.3);

    // effet visuel simple sur le sprite: augmenter temporairement l'échelle
    if (body.render && body.render.sprite) {
      const sx = body.render.sprite.xScale || 1;
      const sy = body.render.sprite.yScale || 1;
      body.render.sprite.xScale = sx * 1.25;
      body.render.sprite.yScale = sy * 1.25;
      setTimeout(() => {
        if (body.render && body.render.sprite) {
          body.render.sprite.xScale = sx;
          body.render.sprite.yScale = sy;
        }
      }, 300);
    }
  }

  function onRondpointClick(body) {
    console.log("Rondpoint clicked");
    // Appliquer une force radiale qui repousse les autres corps
    const others = Matter.Composite.allBodies(engine.world);
    const strength = 0.0006;
    others.forEach((other) => {
      if (other === body) return;
      const dx = other.position.x - body.position.x;
      const dy = other.position.y - body.position.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 20);
      const force = strength / (dist * dist);
      Matter.Body.applyForce(other, other.position, {
        x: (dx / dist) * force,
        y: (dy / dist) * force - 0.0005,
      });
    });

    // Faire tourner le rondpoint
    Matter.Body.setAngularVelocity(body, -0.6);
  }

  Matter.Events.on(mouseConstraint, "mousedown", function (event) {
    // logger pour debug
    console.log("[mouseConstraint] mousedown event", event);
    const mousePosition = event.mouse.position;
    const bodies = Matter.Composite.allBodies(engine.world);

    bodies.forEach(function (body) {
      if (
        Matter.Bounds.contains(body.bounds, mousePosition) &&
        Matter.Vertices.contains(body.vertices, mousePosition)
      ) {
        const label = body.label || "";
        // Déclencher les actions spécifiques selon le label
        if (label === "pamplemousse") {
          onPamplemousseClick(body);
          return;
        }
        if (label === "rondpoint") {
          onRondpointClick(body);
          return;
        }

        // comportement par défaut pour les autres objets
        Matter.Body.setAngularVelocity(body, 0.05);
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.001,
          y: -0.01,
        });
      }
    });
  });

  // Événements pour startdrag / enddrag
  Matter.Events.on(mouseConstraint, "startdrag", function (event) {
    // console.log("Start dragging object");
    const body = event.body;
    if (body) {
      body.frictionAir = 0.1;
      // léger effet visuel quand on commence le drag
      if (body.render && body.render.sprite) {
        body.render.sprite.opacity = 0.8;
      }
    }
  });

  Matter.Events.on(mouseConstraint, "enddrag", function (event) {
    // console.log("End dragging object");
    const body = event.body;
    if (body) {
      body.frictionAir = 0.01;
      if (body.render && body.render.sprite) {
        body.render.sprite.opacity = 1;
      }
    }
  });
}

// Événement pour le déplacement des objets
// (Les handlers startdrag / enddrag sont maintenant attachés dans initMouseConstraint
//  afin d'avoir bien accès à la contrainte après sa création.)

/**
 * Obtenir la contrainte de souris
 */
function getMouseConstraint() {
  return mouseConstraint;
}
