const titleD = document.getElementById("title-d");
const korgText = document.getElementById("korg-text");
const animation = document.getElementById("animation-bag");
const korgbody = document.getElementById("korg-body");
const hero = document.getElementById("hero-section");
const backButton = document.getElementById("KorgBack");
const body = document.body;






// add a variable of image of the cd
// maybe using three.js ? :)
// put the korgText at the top of the page

const sandwich = document.getElementById("sandwich");

window.onKorgClick = function() {
  titleD.style.display = "none";
  Matter.Composite.remove(engine.world, ground);
    setTimeout(() => {
    Matter.Composite.remove(engine.world, [korg, filtre, tabac, pamplemousse, aboutme]);
  }, 2000); // délai de 500ms avant d'exécuter la fonction

  sandwich.style.display = "none";
  animation.style.display = "none";
  korgbody.style.display = "flex";
  korgbody.style.backgroundColor = "black";
  body.style.backgroundColor = "black";
  hero.style.position = "static";
  hero.style.textAlign = "left";
  hero.style.justifyContent = "flex-start";

  





var korgtext = document.getElementById('korg-text');

var typewriter = new Typewriter(korgtext, {
    loop: false,
    delay: 10,
    cursor: '▮',
});



  typewriter
    .pauseFor(2500)
    .typeString('This project is one of my favorite, i had so much fun designing it and manufacturing it. I made a CD of a track’s􀫀 friends that’s called “Korg e-LIVEsEx”, it’s an homage to this song because thanks to it i have met Nelson the compositer of this song.')
    .start();


}



function addToWorld(bodies) {
  Matter.Composite.add(engine.world, bodies);
}

function resetAll() {
  resetState();

  // Get the physics objects and add them back to the world
  if (typeof getObjects === "function") {
    const currentBodies = getObjects();
    // Filter out undefined objects and add them back
    addToWorld(currentBodies.filter(b => b));
  }

  resetAnimation();
}
backButton.addEventListener("click", resetAll);




function resetState() {
  document.body.style.backgroundColor = "white";
  document.body.style.color = "black";
  titleD.style.display = "block";

  if (typeof engine !== "undefined" && typeof ground !== "undefined") {
    Matter.Composite.add(engine.world, ground);
  }

  sandwich.style.display = "none";
  animation.style.display = "block";
  korgbody.style.display = "none";
  korgText.style.display = "none";

  hero.style.position = "";
  hero.style.textAlign = "";
  hero.style.justifyContent = "space-between";
}
