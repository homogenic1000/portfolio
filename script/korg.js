const titleD = document.getElementById("title-d");
const korgText = document.getElementById("korg-text");
const animation = document.getElementById("animation-bag");
const korgbody = document.getElementById("korg-body");
const hero = document.getElementById("hero-section");

// add a variable of image of the cd
// maybe using three.js ? :)
// put the korgText at the top of the page


function onKorgClick() {
  document.body.style.backgroundColor = "black";
  document.body.style.color = "white";
  titleD.style.display = "none";
  Matter.Composite.remove(engine.world, ground);
  sandwich.style.display = "none";
  animation.style.display = "none";
  korgbody.style.display = "flex";
  korgText.style.display = "flex";
  hero.style.position = "static";
  hero.style.textAlign = "left";
  hero.style.justifyContent = "flex-start";
}
