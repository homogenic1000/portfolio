

const titleD = document.getElementById("title-d");
const korgText = document.getElementById("korg-text");
const animation = document.getElementById("animation-bag");
const korgbody = document.getElementById("korg-body");
const hero = document.getElementById("hero-section");
const backButton = document.getElementById("KorgBack");






// add a variable of image of the cd
// maybe using three.js ? :)
// put the korgText at the top of the page

const sandwich = document.getElementById("sandwich");

window.onKorgClick = function(body) {
  document.body.style.backgroundColor = "black";
  document.body.style.color = "white";
  titleD.style.display = "none";
  Matter.Composite.remove(engine.world, ground);
    setTimeout(() => {
    Matter.Composite.remove(engine.world, [korg, filtre, tabac, pamplemousse, aboutme]);
  }, 2000); // délai de 500ms avant d'exécuter la fonction

  sandwich.style.display = "none";
  animation.style.display = "none";
  korgbody.style.display = "flex";
  korgText.style.display = "flex";
  hero.style.position = "static";
  hero.style.textAlign = "left";
  hero.style.justifyContent = "flex-start";
}

function addToWorld(bodies) {
  Matter.Composite.add(engine.world, bodies);
}

function resetAll() {
  resetState();
  startSimulation();
  addToWorld(bodies);
}
KorgBack.addEventListener("click", resetAll);




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


