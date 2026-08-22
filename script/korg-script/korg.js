const titleD = document.getElementById("title-d");
const animation = document.getElementById("animation-bag");
const korgbody = document.getElementById("layout");
const hero = document.getElementById("hero-section");
const backButton = document.getElementById("index");
const body = document.body;
const sandwich = document.getElementById("sandwich");

window.onKorgClick = function () {
  titleD.style.display = "none";
  Matter.Composite.remove(engine.world, ground);
  setTimeout(() => {
    Matter.Composite.remove(engine.world, [korg, filtre, tabac, pamplemousse, aboutme]);
  }, 2000); // délai de 500ms avant d'exécuter la fonction

  sandwich.style.display = "none";
  animation.style.display = "none";
  korgbody.style.display = "flex";
  korgbody.style.backgroundColor = "white";
  body.style.backgroundColor = "white";
  hero.style.position = "static";
  hero.style.textAlign = "left";
  hero.style.justifyContent = "flex-start";
  const canvas = window.matterCanvas || document.querySelector("canvas");
  if (canvas) canvas.style.display = "none";
  hero.style.display = "none";
}