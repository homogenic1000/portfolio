/* lab.js — the "lab/" page: unfinished projects floating in zero gravity.
   Same pattern as loves.js (archive.html): drag, hover card, kept separate
   because pieces are videos AND images, and clicking opens a fullscreen view.

   Adding a piece = add an entry to LAB.objects below. No other change needed.
   - media.type "image"  → an <img> floats in the world
   - media.type "video"  → a live <video> frame floats (muted, looping)
   - trace (optional)    → an image whose silhouette becomes the hitbox
                          (for a video, usually its poster frame) */

const LAB = {
  gravity: 0,
  objects: [

    {
      label: "bjork",
      title: "Opening bjork — unfinished",
      desc: "A half-finished opening sequence for an imaginary opening for a documentary on Björk. I did it during my first year and my first motion design classes so i'm kind of ashamed of this work but i still think it deserved a little show time.",
      media: { type: "video", src: "assets/video/bjork.webm" },
      trace: "assets/2d/inside.webp",
      color: "#FFB500",
      size: 0.3,
    },
  ],
};

const LAB_STYLE = {
  restitution: 0.6,
  friction: 0,
  frictionAir: 0,
};

let labEngine = null;
let labRender = null;
let labRunner = null;
let labWalls = [];
let labResizeObserver = null;
let labHovered = null;
let labDragging = null;
const labInfo = new Map();
const labOverlays = [];

function initLabWorld() {
  const host = document.getElementById("lab-world");
  const card = document.getElementById("loves-card");
  if (!host || typeof Matter === "undefined" || labEngine) return;

  const width = host.clientWidth || window.innerWidth;
  const height = host.clientHeight || 640;

  labEngine = Matter.Engine.create();
  labEngine.world.gravity.y = LAB.gravity;
  Matter.Common.setDecomp(typeof decomp !== "undefined" ? decomp : undefined);

  // Test handles
  window.labEngine = labEngine;
  window.labInfo = labInfo;
  window.labOverlays = labOverlays;

  labRender = Matter.Render.create({
    element: host,
    engine: labEngine,
    options: {
      width,
      height,
      wireframes: false,
      background: "transparent",
    },
  });
  Matter.Render.run(labRender);

  labRunner = Matter.Runner.create();
  Matter.Runner.run(labRunner, labEngine);

  const thickness = 120;
  const wallOpts = { isStatic: true, render: { visible: false }, collisionFilter: { group: -1 } };
  labWalls = [
    Matter.Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, wallOpts),
    Matter.Bodies.rectangle(width / 2, -thickness / 2, width + thickness * 2, thickness, wallOpts),
    Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height + thickness * 2, wallOpts),
    Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height + thickness * 2, wallOpts),
  ];
  Matter.Composite.add(labEngine.world, labWalls);

  const all = LAB.objects || [];
  const minDim = Math.min(width, height);
  const scales = all.map((o) => (minDim * (o.size || 0.22) * (0.9 + Math.random() * 0.2)) / 2048);
  const spawns = all.map((o, i) => labSpawn(i, width, height, all.length));

  all.forEach((o, i) => {
    const k = scales[i];
    const size = 2048 * k;
    const body = Matter.Bodies.rectangle(spawns[i].x, spawns[i].y, size, size, {
      label: o.label || "lab" + i,
      restitution: LAB_STYLE.restitution,
      friction: LAB_STYLE.friction,
      frictionAir: LAB_STYLE.frictionAir,
      render: { fillStyle: o.color || "rgba(0,0,0,0.4)" },
    });
    Matter.Body.setVelocity(body, spawns[i].velocity);
    Matter.Body.setAngle(body, spawns[i].angle);
    labInfo.set(body, o);
    Matter.Composite.add(labEngine.world, body);

    const media = makeLabMedia(o.media, o.trace);
    let bodyRef = body;
    media.once("ready", () => {
      let poster = null;
      if (o.trace) {
        poster = new Image();
        poster.src = o.trace;
      }
      labOverlays.push({ body: bodyRef, media, poster, scale: k });
      bodyRef.render.visible = false;

      if (!o.trace || typeof traceSpriteVertices !== "function") return;
      const engineRef = labEngine;
      traceSpriteVertices(o.trace).then((res) => {
        if (!res || engineRef !== labEngine || !labWorldAlive()) return;
        const old = bodyRef;
        Matter.Composite.remove(labEngine.world, old);
        const scaledSets = res.islands.map((vs) => vs.map((v) => ({ x: v.x * k, y: v.y * k })));
        const nb = Matter.Bodies.fromVertices(
          spawns[i].x,
          spawns[i].y,
          scaledSets,
          {
            label: o.label || "lab" + i,
            restitution: LAB_STYLE.restitution,
            friction: LAB_STYLE.friction,
            frictionAir: LAB_STYLE.frictionAir,
            render: { visible: false },
          },
          false,
          0.01,
          0.01
        );
        Matter.Body.setVelocity(nb, spawns[i].velocity);
        Matter.Body.setAngle(nb, spawns[i].angle);
        Matter.Composite.add(labEngine.world, nb);
        if (labInfo.has(old)) labInfo.delete(old);
        labInfo.set(nb, o);
        for (const ent of labOverlays) if (ent.body === old) ent.body = nb;
      });
    });
  });

  Matter.Events.on(labRender, "afterRender", drawLabOverlays);

  if (typeof ResizeObserver !== "undefined") {
    labResizeObserver = new ResizeObserver(() => {
      if (!labRender || !labEngine) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      labRender.canvas.width = w;
      labRender.canvas.height = h;
      labRender.options.width = w;
      labRender.options.height = h;
      Matter.Body.setPosition(labWalls[0], { x: w / 2, y: h + thickness / 2 });
      Matter.Body.setPosition(labWalls[1], { x: w / 2, y: -thickness / 2 });
      Matter.Body.setPosition(labWalls[2], { x: -thickness / 2, y: h / 2 });
      Matter.Body.setPosition(labWalls[3], { x: w + thickness / 2, y: h / 2 });
    });
    labResizeObserver.observe(host);
  }

  const mouse = Matter.Mouse.create(labRender.canvas);
  const mouseConstraint = Matter.MouseConstraint.create(labEngine, {
    mouse,
    constraint: { stiffness: 0.08, render: { visible: false } },
  });
  Matter.Composite.add(labEngine.world, mouseConstraint);
  labRender.mouse = mouse;

  labRender.canvas.addEventListener("mousedown", (e) => {
    const hit = Matter.Query.point(labEngine.world.bodies, canvasPos(e)).find((b) => labInfo.has(b));
    labDragging = hit ? { body: hit, x: e.clientX, y: e.clientY } : null;
  });

  labRender.canvas.addEventListener("mouseup", (e) => {
    if (!labDragging) return;
    const dist = Math.hypot(e.clientX - labDragging.x, e.clientY - labDragging.y);
    const entry = labInfo.get(labDragging.body);
    labDragging = null;
    if (dist <= 6 && entry) openLabMedia(entry);
  });

  labRender.canvas.addEventListener("mousemove", (e) => {
    if (!labInfo.size || !card) return;
    const rect = labRender.canvas.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const hit = Matter.Query.point(labEngine.world.bodies, pos).find((b) => labInfo.has(b));
    if (hit) {
      if (labHovered !== hit) {
        labHovered = hit;
        const info = labInfo.get(hit);
        card.innerHTML =
          '<span class="loves-card-title">' + info.title + "</span>" +
          '<span class="loves-card-desc">' + info.desc + "</span>";
        card.hidden = false;
        positionLabCard(card, e.clientX, e.clientY, rect);
      } else if (!card.hidden) {
        positionLabCard(card, e.clientX, e.clientY, rect);
      }
      labRender.canvas.style.cursor = "grab";
    } else if (labHovered) {
      labHovered = null;
      card.hidden = true;
      labRender.canvas.style.cursor = "default";
    }
  });

  labRender.canvas.addEventListener("mouseleave", () => {
    labHovered = null;
    if (card) card.hidden = true;
    labRender.canvas.style.cursor = "default";
  });
}

function labWorldAlive() {
  return labEngine && labEngine.world;
}

function canvasPos(e) {
  const rect = labRender.canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function labSpawn(i, width, height, total) {
  const areaW = width * 0.78;
  const areaH = height * 0.7;
  const left = width * 0.11 + (areaW * (i + 0.5)) / Math.max(1, total);
  const top = height * 0.16;
  return {
    x: left + (Math.random() - 0.5) * areaW * 0.12,
    y: top + Math.random() * areaH,
    velocity: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 },
    angle: (Math.random() - 0.5) * 0.4,
  };
}

function makeLabMedia(cfg, posterSrc) {
  const em = new EventTarget();
  em.once = (name, cb) => em.addEventListener(name, cb, { once: true });

  if (cfg.type === "video") {
    let poster = null;
    if (cfg.poster || posterSrc) {
      poster = new Image();
      poster.src = cfg.poster || posterSrc;
    }
    const v = document.createElement("video");
    v.src = cfg.src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.addEventListener(
      "loadeddata",
      () => {
        em.element = v;
        em.dispatchEvent(new Event("ready"));
        v.play().catch(() => {});
      },
      { once: true }
    );
    v.addEventListener(
      "error",
      () => {
        if (poster) {
          em.element = poster;
          em.dispatchEvent(new Event("ready"));
        }
      },
      { once: true }
    );
    v.load();
    return em;
  }

  const img = new Image();
  img.src = cfg.src;
  img.addEventListener(
    "load",
    () => {
      em.element = img;
      em.dispatchEvent(new Event("ready"));
    },
    { once: true }
  );
  return em;
}

function drawLabOverlays() {
  const ctx = labRender && labRender.context;
  if (!ctx) return;
  for (const ent of labOverlays) {
    const { body, media, poster, scale } = ent;
    if (!body || !media) continue;
    let el = media.element || media;
    if (el instanceof HTMLVideoElement) {
      el = el.readyState >= 2 && el.currentTime > 0 ? el : poster;
    }
    if (!el) continue;
    const w = el.videoWidth || el.naturalWidth || el.width || 0;
    const h = el.videoHeight || el.naturalHeight || el.height || 0;
    if (!w || !h) continue;
    const ww = w * scale;
    const hh = h * scale;
    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);
    ctx.drawImage(el, -ww / 2, -hh / 2, ww, hh);
    ctx.restore();
  }
  if (labHovered) {
    const b = labHovered;
    const pad = 8;
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(
      b.bounds.min.x - pad,
      b.bounds.min.y - pad,
      b.bounds.max.x - b.bounds.min.x + pad * 2,
      b.bounds.max.y - b.bounds.min.y + pad * 2
    );
    ctx.restore();
  }
}

function positionLabCard(card, clientX, clientY, rect) {
  const padX = 18;
  const padY = 18;
  let x = clientX - rect.left + padX;
  let y = clientY - rect.top + padY;
  const cardW = card.offsetWidth || 180;
  const cardH = card.offsetHeight || 60;
  const maxX = rect.width - cardW - padX;
  const maxY = rect.height - cardH - padY;
  card.style.left = Math.min(Math.max(0, x), Math.max(0, maxX)) + "px";
  card.style.top = Math.min(Math.max(0, y), Math.max(0, maxY)) + "px";
}

/* ------------------------------------------------------------------
   Fullscreen media view
   ------------------------------------------------------------------ */
const fsEl = document.getElementById("lab-fullscreen");
const fsMedia = document.getElementById("lab-fs-media");
const fsTitle = document.getElementById("lab-fs-title");
const fsDesc = document.getElementById("lab-fs-desc");
const fsClose = document.getElementById("lab-fs-close");
let activeFsMedia = null;

function openLabMedia(entry) {
  if (!fsEl) return;
  fsMedia.innerHTML = "";
  const cfg = entry.media;
  if (cfg.type === "video") {
    const v = document.createElement("video");
    v.src = cfg.src;
    v.controls = true;
    v.loop = true;
    v.playsInline = true;
    v.autoplay = true;
    v.setAttribute("playsinline", "");
    if (cfg.poster) v.poster = cfg.poster;
    fsMedia.appendChild(v);
    activeFsMedia = v;
  } else {
    const img = document.createElement("img");
    img.src = cfg.src;
    fsMedia.appendChild(img);
  }
  fsTitle.textContent = entry.title || "";
  fsDesc.textContent = entry.desc || "";
  fsEl.hidden = false;
}

function closeLabMedia() {
  if (!fsEl || fsEl.hidden) return;
  fsEl.hidden = true;
  if (activeFsMedia) {
    activeFsMedia.pause();
    activeFsMedia.src = "";
    activeFsMedia = null;
  }
  fsMedia.innerHTML = "";
}

if (fsClose) fsClose.addEventListener("click", closeLabMedia);
if (fsEl) {
  fsEl.addEventListener("click", (e) => {
    if (e.target === fsEl) closeLabMedia();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLabMedia();
});

initLabWorld();