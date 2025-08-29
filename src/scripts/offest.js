document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.image-with-label');

    elements.forEach(el => {
        // Position initiale aléatoire
        let     posX = Math.random() * 20 - 10;
        let posY = Math.random() * 20 - 10;

        // Vitesse de déplacement
        let speedX = (Math.random() * 2 - 1) * 0.5;
        let speedY = (Math.random() * 2 - 1) * 0.5;

        // Animation continue
        function animate() {
            // Mise à jour des positions
            posX += speedX;
            posY += speedY;

            // Inversion de la direction si les limites sont atteintes
            if (Math.abs(posX) > 20) speedX *= -1;
            if (Math.abs(posY) > 20) speedY *= -1;

            // Application de la transformation
            el.style.transform = `translate(${posX}px, ${posY}px)`;
            el.style.transition = 'transform 0.5s ease-out';

            requestAnimationFrame(animate);
        }

        animate();

        // Arrêt de l'animation au survol
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'translate(0, 0)';
        });

        // Reprise de l'animation quand la souris quitte
        el.addEventListener('mouseleave', () => {
            posX = Math.random() * 20 - 10;
            posY = Math.random() * 20 - 10;
        });
    });
});

