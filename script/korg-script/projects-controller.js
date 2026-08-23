// projects-controller.js - Machine à états générique pour tous les projets
// Remplace l'ancien korg.js : une seule fonction enterProject(id) pilotée par PROJECTS.

const heroSection = document.getElementById("hero-section");
const titleD = document.getElementById("title-d");
const animationBag = document.getElementById("animation-bag");
const sandwich = document.getElementById("sandwich");
const layoutEl = document.getElementById("layout");
const bodyEl = document.body;
const projectTitleEl = document.getElementById("project-title");
const projectTextEl = document.getElementById("project-text");
const videoEl = document.getElementById("project-video");

let currentProjectId = null;
let hideCanvasTimer = null;

/**
 * Entrer dans un projet : UI + transition + pause physique + contenu + média
 * Pas de code de sortie : le bouton "index" recharge la page, le navigateur
 * remet tout l'état à zéro tout seul.
 */
function enterProject(id) {
  const cfg = PROJECTS[id];
  if (!cfg || currentProjectId) return;
  currentProjectId = id;

  // ① État de l'interface
  titleD.style.display = "none";
  sandwich.style.display = "none";
  animationBag.style.display = "none";
  layoutEl.style.display = "flex";

  // ② Transition : retrait des boundaries (les objets tombent dans le vide),
  // puis après 600ms on endort la physique et on cache le canvas
  // → le texte redevient sélectionnable
  if (typeof getBoundaries === "function") {
    Matter.Composite.remove(engine.world, getBoundaries().filter(Boolean));
  }
  hideCanvasTimer = setTimeout(() => {
    heroSection.style.display = "none";
    if (typeof pausePhysics === "function") pausePhysics();
  }, 600);

  // ③ Injection du contenu depuis la config
  projectTitleEl.textContent = cfg.title;
  projectTextEl.textContent = cfg.text;
  layoutEl.style.backgroundColor = cfg.bg || "#ffffff";
  bodyEl.style.backgroundColor = cfg.bg || "#ffffff";

  // ④ Routage des médias
  applyMedia(cfg.media);
  buildCarousel(cfg.images);
}

/**
 * Afficher le bon média dans #show selon cfg.media.type
 */
function applyMedia(media) {
  hideMedia();
  if (!media) return;

  if (media.type === "3d") {
    if (window.CDViewer) window.CDViewer.show(media.modelPath);
  } else if (media.type === "video") {
    videoEl.src = media.src;
    videoEl.style.display = "block";
    const p = videoEl.play();
    if (p && p.catch) p.catch(() => {});
  }
}

/**
 * Cacher / libérer tous les médias
 */
function hideMedia() {
  if (window.CDViewer) window.CDViewer.hide();
  videoEl.pause();
  videoEl.removeAttribute("src");
  videoEl.load();
  videoEl.style.display = "none";
}

/* ---------------- Carrousel (#show-min) ---------------- */

let carouselRoot = null;

function buildCarousel(images) {
  destroyCarousel();
  if (!images || !images.length) return;

  carouselRoot = document.createElement("div");
  carouselRoot.className = "carousel";

  const track = document.createElement("div");
  track.className = "carousel-track";

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "carousel-dots";

  images.forEach((src, i) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    slide.appendChild(img);
    track.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => {
      track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    });
    dotsWrap.appendChild(dot);
  });

  function step(dir) {
    track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" });
  }

  const prev = document.createElement("button");
  prev.className = "carousel-btn carousel-prev";
  prev.textContent = "‹";
  prev.addEventListener("click", () => step(-1));

  const next = document.createElement("button");
  next.className = "carousel-btn carousel-next";
  next.textContent = "›";
  next.addEventListener("click", () => step(1));

  track.addEventListener("scroll", () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    dotsWrap.querySelectorAll(".carousel-dot").forEach((d, di) => {
      d.classList.toggle("active", di === i);
    });
  });

  carouselRoot.appendChild(track);
  carouselRoot.appendChild(prev);
  carouselRoot.appendChild(next);
  carouselRoot.appendChild(dotsWrap);
  document.getElementById("show-min").appendChild(carouselRoot);
}

function destroyCarousel() {
  if (carouselRoot) {
    carouselRoot.remove();
    carouselRoot = null;
  }
}
