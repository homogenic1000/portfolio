// mouseConstraint.js - Gestion des interactions souris avec les objets Matter.js

let mouseConstraint;

/**
 * Initialiser la contrainte de souris
 */
function initMouseConstraint(engine, render) {
    // Ajouter la souris
    const mouse = Matter.Mouse.create(render.canvas);
    
    // Ajuster l'échelle de la souris pour correspondre au zoom du canvas
    mouse.pixelRatio = window.devicePixelRatio;
    
    // Créer la contrainte de souris
    mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

    // Ajouter la contrainte au monde
    Matter.Composite.add(engine.world, mouseConstraint);

    // Désactiver le scroll sur le canvas lors du drag
    render.canvas.addEventListener('mousewheel', function(event) {
        event.preventDefault();
    });

    // Événement click sur les objets
    Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
        const mousePosition = event.mouse.position;
        const bodies = Matter.Composite.allBodies(engine.world);
        
        // Vérifier chaque objet
        bodies.forEach(function(body) {
            if (Matter.Bounds.contains(body.bounds, mousePosition) &&
                Matter.Vertices.contains(body.vertices, mousePosition)) {
                
                // Vérifier le type d'objet et déclencher l'action appropriée
                switch (body) {
                    case tabac:
                        console.log('Click sur tabac');
                        // Ajoutez votre action pour tabac ici
                        break;
                    case filtre:
                        console.log('Click sur filtre');
                        // Ajoutez votre action pour filtre ici
                        break;
                    case pamplemousse:
                        console.log('Click sur pamplemousse');
                        // Ajoutez votre action pour pamplemousse ici
                        break;
                    case rondpoint:
                        console.log('Click sur rondpoint');
                        // Ajoutez votre action pour rondpoint ici
                        break;
                }
            }
        });
    });
}

/**
 * Obtenir la contrainte de souris
 */
function getMouseConstraint() {
    return mouseConstraint;
}
