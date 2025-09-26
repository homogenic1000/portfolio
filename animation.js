console.log("Hello World!");

let frame = 1;
const totalFrames = 29;
let intervalId = null;

window.addEventListener("DOMContentLoaded", () => {
    const img = document.getElementById("animation-bag");

    function animate() {
        if (intervalId) return;

        intervalId = setInterval(() => {
            const newSrc = `assets/animation/frame${frame}.png`;

            const testImg = new Image();
            testImg.src = newSrc;
            testImg.onload = () => {
                img.src = newSrc;
            };
            testImg.onerror = () => {
                console.error(`Image manquante : ${newSrc}`);
                clearInterval(intervalId);
            };

            if (frame === totalFrames) {
                clearInterval(intervalId); // arrêt à la dernière frame
            } else {
                frame++;
            }
        }, 140); // ~16 FPS
        setTimeout(startPhysics, 1900);
    }

    img.addEventListener("click", animate);

    // Secousse au clic si animation terminée
    img.addEventListener("click", () => {
        if (frame === totalFrames) {
            const X = (Math.random() - 1.5) * 10;
            const Y = (Math.random() - 1.5) * 10;
            img.style.transform = `translate(${X}px, ${Y}px)`;

            setTimeout(() => {
                img.style.transform = "translate(0, 0)";
            }, 150);
        }
    });
});
