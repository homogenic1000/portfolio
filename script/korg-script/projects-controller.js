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

// Mini-monde Matter.js (#show-min)
let minEngine = null, minRender = null, minRunner = null;

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
  projectTitleEl.style.color = cfg.color || "blue";
  projectTextEl.textContent = cfg.text;
  layoutEl.style.backgroundColor = cfg.bg || "#ffffff";
  bodyEl.style.backgroundColor = cfg.bg || "#ffffff";

  // ④ Routage des médias
  applyMedia(cfg.media);

  // ⑤ Zone secondaire (#show-min) : mini-monde Matter.js OU carrousel
  if (cfg.minWorld) {
    buildMinWorld(cfg.minWorld);
  } else {
    buildCarousel(cfg.images);
  }
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
  destroyMinWorld();
  destroyCarousel();
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

/* ---------------- Mini-monde Matter.js (#show-min) ---------------- */

const MIN_STYLE = {
  gravity: 0.09,
  restitution: 0.2,
  friction: 0,
  frictionAir: 0,
};

let letterOverlays = [];

function minSpawn(i, width, height, total) {
  const pad = 24;
  const span = Math.max(1, total - 1);
  const ratio = total <= 1 ? 0.5 : i / span;
  return {
    x: pad + ratio * (width - pad * 2) + (Math.random() * 12 - 6),
    y: 30 + Math.random() * 30,
    angle: (Math.random() - 0.5) * 0.4,
  };
}

function drawLetterOverlays() {
  if (!minRender) return;
  const c = minRender.context;
  for (const it of letterOverlays) {
    const b = it.body;
    if (!b) continue;
    c.save();
    c.translate(b.position.x, b.position.y);
    c.rotate(b.angle);
    const w = it.img.naturalWidth * it.scale;
    const h = it.img.naturalHeight * it.scale;
    c.drawImage(it.img, -w / 2, -h / 2, w, h);
    c.restore();
  }
}

/**
 * Créer un mini monde Matter.js dans #show-min avec des objets dragguables
 * (pas de click handler, uniquement du drag via MouseConstraint)
 */
function buildMinWorld(config) {
  destroyMinWorld();

  const host = document.getElementById("show-min");
  if (!host || typeof Matter === "undefined") return;

  const width = host.clientWidth || 400;
  const height = host.clientHeight || 300;

  minEngine = Matter.Engine.create();
  minEngine.world.gravity.y = config.gravity !== undefined ? config.gravity : MIN_STYLE.gravity;

  minRender = Matter.Render.create({
    element: host,
    engine: minEngine,
    options: {
      width,
      height,
      wireframes: false,
      background: "transparent",
    },
  });
  Matter.Render.run(minRender);

  minRunner = Matter.Runner.create();
  Matter.Runner.run(minRunner, minEngine);

  // Boundaries internes pour garder les objets dans le canvas
  // collisionFilter.group -1 = ne collide jamais avec les corps normaux,
  // et le MouseConstraint les ignorera (pas de drag des murs)
  const thickness = 120;
  const wallOpts = { isStatic: true, render: { visible: false }, collisionFilter: { group: -1 } };
  const walls = [
    Matter.Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, wallOpts),
    Matter.Bodies.rectangle(width / 2, -thickness / 2, width + thickness * 2, thickness, wallOpts),
    Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height + thickness * 2, wallOpts),
    Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height + thickness * 2, wallOpts),
  ];
  Matter.Composite.add(minEngine.world, walls);

  // Objets : placeholders rectangulaires immédiats, remplacés par des
  // hitboxes polygonales (véritables silhouettes) dès que le trace finit.
  const allObjects = config.objects || [];
  const spawns = allObjects.map((o, i) => minSpawn(i, width, height, allObjects.length));
  const placeholders = allObjects.map((o, i) => {
    const renderOpts = {};
    if (o.sprite) {
      renderOpts.sprite = { texture: o.sprite, xScale: o.scale || 1, yScale: o.scale || 1 };
    } else {
      renderOpts.fillStyle = o.color || "rgba(0,0,0,0.4)";
    }
    const basis = {
      label: o.label || "minObj" + i,
      restitution: MIN_STYLE.restitution,
      friction: MIN_STYLE.friction,
      frictionAir: MIN_STYLE.frictionAir,
      render: renderOpts,
    };
    const x = spawns[i].x;
    const y = spawns[i].y;
    let body;
    if (o.type === "circle") {
      body = Matter.Bodies.circle(x, y, o.r, basis);
    } else {
      body = Matter.Bodies.rectangle(x, y, o.w, o.h, basis);
    }
    Matter.Body.setAngle(body, spawns[i].angle);
    return body;
  });
  Matter.Composite.add(minEngine.world, placeholders);

  allObjects.forEach((o, i) => {
    if (!o.sprite || typeof traceSpriteVertices !== "function") return;
    const engineRef = minEngine;
    traceSpriteVertices(o.sprite).then((res) => {
      if (!res) return;
      if (engineRef !== minEngine || !minWorldAlive()) return;
      const placeholder = placeholders[i];
      if (placeholder) Matter.Composite.remove(minEngine.world, placeholder);
      const k = o.scale || 0.05;
      const scaledSets = res.islands.map((verts) => verts.map((v) => ({ x: v.x * k, y: v.y * k })));
      const body = Matter.Bodies.fromVertices(
        spawns[i].x,
        spawns[i].y,
        scaledSets,
        {
          label: o.label || "minObj" + i,
          restitution: MIN_STYLE.restitution,
          friction: MIN_STYLE.friction,
          frictionAir: MIN_STYLE.frictionAir,
          render: { visible: false },
        },
        false,
        0.01,
        0.01
      );
      Matter.Body.setAngle(body, spawns[i].angle);
      Matter.Composite.add(minEngine.world, body);
      letterOverlays.push({ body, img: res.img, scale: k });
    });
  });

  function minWorldAlive() {
    return minEngine && minEngine.world;
  }

  Matter.Events.on(minRender, "afterRender", drawLetterOverlays);

  // Drag (MouseConstraint sur le canvas mini) — pas de click handler
  const mouse = Matter.Mouse.create(minRender.canvas);
  const mouseConstraint = Matter.MouseConstraint.create(minEngine, {
    mouse,
    constraint: { stiffness: 0.08, render: { visible: false } },
  });
  Matter.Composite.add(minEngine.world, mouseConstraint);
  minRender.mouse = mouse;
}

/**
 * Détruire le mini-monde Matter.js (#show-min)
 */
function destroyMinWorld() {
  if (minRender) {
    Matter.Events.off(minRender, "afterRender", drawLetterOverlays);
    Matter.Render.stop(minRender);
  }
  letterOverlays = [];
  if (minRunner) Matter.Runner.stop(minRunner);
  if (minRender && minRender.canvas && minRender.canvas.parentNode) {
    minRender.canvas.parentNode.removeChild(minRender.canvas);
  }
  minEngine = null;
  minRender = null;
  minRunner = null;
}
