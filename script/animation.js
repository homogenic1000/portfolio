let frame = 1;
const totalFrames = 15;
let intervalId = null;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

window.addEventListener("DOMContentLoaded", () => {
  const img = document.getElementById("animation-bag");
  const sandwich = document.getElementById("sandwich");

  // Skip the frame-by-frame sequence and drop straight into the physics world.
  // Used for prefers-reduced-motion; the engine guard keeps a re-click from
  // re-spawning the whole world.
  function revealBag() {
    img.src = "assets/animation/frame15.webp";
    if (sandwich) sandwich.style.display = "block";
    if (typeof engine === "undefined" || !engine) startPhysics();
  }

  function animate() {
    if (intervalId) return;

    if (prefersReducedMotion.matches) {
      revealBag();
      return;
    }

    intervalId = setInterval(() => {
      const newSrc = `assets/animation/frame${frame}.webp `;
      

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
        startPhysics();
        intervalId = null;
        if (sandwich) sandwich.style.display = "block";
      } else {
        frame++;
      }
    }, 100);
  }


  img.addEventListener("click", animate);

  // Keyboard parity for the bag (role="button" in index.html)
  img.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      animate();
    }
  });

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

function resetAnimation() {
  const ResetFrame = "assets/animation/frame1.webp";
  const img = document.getElementById("animation-bag");
  img.src = ResetFrame;
  frame = 1;
  
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/* Full-page intro disclaimer — offers a bypass to the index (a11y) or lets
   the visitor enter the site. Dismissed with "Start the intro" or Escape. */
window.addEventListener("DOMContentLoaded", () => {
  const disclaimer = document.getElementById("intro-disclaimer");
  if (!disclaimer || getComputedStyle(disclaimer).display === "none") return;

  const mediaQuery = document.getElementById("media-query");
  const bag = document.getElementById("animation-bag");

  // Keep the mouse-only, animated hero out of the tab/AT order while open.
  if (mediaQuery) mediaQuery.setAttribute("inert", "");
  disclaimer.focus();

  const dismiss = () => {
    disclaimer.classList.add("is-hidden");
    if (mediaQuery) mediaQuery.removeAttribute("inert");
    if (bag) bag.focus();
  };

  const enter = disclaimer.querySelector(".disclaimer-enter");
  if (enter) enter.addEventListener("click", dismiss);
  disclaimer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismiss();
  });
});

