/* "things i love" — Matter.js mini-world on archive.html
   Zero-gravity floating objects, draggable, with a hover description card.
   Pattern mirror of buildMinWorld() in projects-controller.js. */

const LOVES = {
  gravity: 0,
  objects: [
{
      label: "aboutme",
      title: "Mathéo Delessert",
      desc: "Hello, so you already know my name, but I'm gonna tell a little bit more about me. I'm in my 3rd year of Interactive media design at eracom. I love webdesign and development, branding and motion design. I grew up on the internet when I could borrow my mom's computer, and since then the internet was always my second home.",
      sprite: "/assets/2d/matheo.webp",
      color: "#000000",
      size: 0.45,
    },
    {
      label: "homogenic",
      title: "Homogenic",
      desc: "My album and my favourite artisit of all time. Homogenic and Björk vision really transformed the way i see the world and produced art. ",
      sprite: "/assets/2d/loves/homogenic.webp",
      color: "#8a3b2f",
      size: 0.32,
    },
    {
      label: "todo1",
      title: "…",
      desc: "drop a thing you love here (and add it to LOVES in script/loves.js)",
      color: "#1a1a1a",
      size: 0.18,
    },
    {
      label: "todo2",
      title: "…",
      desc: "drop a thing you love here (and add it to LOVES in script/loves.js)",
      color: "#6e6e6e",
      size: 0.2,
    },
  ],
};

const LOVES_STYLE = {
  restitution: 0.6,
  friction: 0.25,
  frictionAir: 0.02,
};

let lovesEngine = null;
let lovesRender = null;
let lovesRunner = null;
let lovesWalls = [];
let lovesResizeObserver = null;
let lovesHovered = null;
const lovesInfo = new Map();
const lovesOverlays = [];

function initLovesWorld() {
  const host = document.getElementById("loves-world");
  const card = document.getElementById("loves-card");
  if (!host || typeof Matter === "undefined" || lovesEngine) return;

  const width = host.clientWidth || window.innerWidth;
  const height = host.clientHeight || 480;

  lovesEngine = Matter.Engine.create();
  lovesEngine.world.gravity.y = LOVES.gravity;
  Matter.Common.setDecomp(typeof decomp !== "undefined" ? decomp : undefined);

  // Debug/test handles (Playwright smoke tests)
  window.lovesEngine = lovesEngine;
  window.lovesInfo = lovesInfo;

  lovesRender = Matter.Render.create({
    element: host,
    engine: lovesEngine,
    options: {
      width,
      height,
      wireframes: false,
      background: "transparent",
    },
  });
  Matter.Render.run(lovesRender);

  lovesRunner = Matter.Runner.create();
  Matter.Runner.run(lovesRunner, lovesEngine);

  const thickness = 120;
  const wallOpts = { isStatic: true, render: { visible: false }, collisionFilter: { group: -1 } };
  lovesWalls = [
    Matter.Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, wallOpts),
    Matter.Bodies.rectangle(width / 2, -thickness / 2, width + thickness * 2, thickness, wallOpts),
    Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height + thickness * 2, wallOpts),
    Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height + thickness * 2, wallOpts),
  ];
  Matter.Composite.add(lovesEngine.world, lovesWalls);

  const allObjects = LOVES.objects || [];
  const minDim = Math.min(width, height);
  const scales = allObjects.map((o) => (minDim * (o.size || 0.22) * (0.9 + Math.random() * 0.2)) / 2048);
  const spawns = allObjects.map((o, i) => lovesSpawn(i, width, height, allObjects.length));
  const placeholders = allObjects.map((o, i) => {
    const k = scales[i];
    const basis = {
      label: o.label || "loves" + i,
      restitution: LOVES_STYLE.restitution,
      friction: LOVES_STYLE.friction,
      frictionAir: LOVES_STYLE.frictionAir,
      render: { fillStyle: o.color || "rgba(0,0,0,0.4)" },
    };
    const x = spawns[i].x;
    const y = spawns[i].y;
    const size = 2048 * k;
    const body = Matter.Bodies.rectangle(x, y, size, size, basis);
    Matter.Body.setVelocity(body, spawns[i].velocity);
    Matter.Body.setAngle(body, spawns[i].angle);
    lovesInfo.set(body, o);
    return body;
  });
  Matter.Composite.add(lovesEngine.world, placeholders);

  allObjects.forEach((o, i) => {
    if (!o.sprite || typeof traceSpriteVertices !== "function") return;
    const engineRef = lovesEngine;
    traceSpriteVertices(o.sprite).then((res) => {
      if (!res || engineRef !== lovesEngine || !lovesWorldAlive()) return;
      const placeholder = placeholders[i];
      if (placeholder) Matter.Composite.remove(lovesEngine.world, placeholder);
      const k = scales[i];
      const scaledSets = res.islands.map((verts) => verts.map((v) => ({ x: v.x * k, y: v.y * k })));
      const body = Matter.Bodies.fromVertices(
        spawns[i].x,
        spawns[i].y,
        scaledSets,
        {
          label: o.label || "loves" + i,
          restitution: LOVES_STYLE.restitution,
          friction: LOVES_STYLE.friction,
          frictionAir: LOVES_STYLE.frictionAir,
          render: { visible: false },
        },
        false,
        0.01,
        0.01
      );
      Matter.Body.setVelocity(body, spawns[i].velocity);
      Matter.Body.setAngle(body, spawns[i].angle);
      Matter.Composite.add(lovesEngine.world, body);
      if (lovesInfo.has(placeholders[i])) lovesInfo.delete(placeholders[i]);
      lovesInfo.set(body, o);
      lovesOverlays.push({ body, img: res.img, scale: k });
    });
  });

  function lovesWorldAlive() {
    return lovesEngine && lovesEngine.world;
  }

  Matter.Events.on(lovesRender, "afterRender", drawLovesOverlays);

  if (typeof ResizeObserver !== "undefined") {
    lovesResizeObserver = new ResizeObserver(() => {
      if (!lovesRender || !lovesEngine) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      lovesRender.canvas.width = w;
      lovesRender.canvas.height = h;
      lovesRender.options.width = w;
      lovesRender.options.height = h;
      Matter.Body.setPosition(lovesWalls[0], { x: w / 2, y: h + thickness / 2 });
      Matter.Body.setPosition(lovesWalls[1], { x: w / 2, y: -thickness / 2 });
      Matter.Body.setPosition(lovesWalls[2], { x: -thickness / 2, y: h / 2 });
      Matter.Body.setPosition(lovesWalls[3], { x: w + thickness / 2, y: h / 2 });
    });
    lovesResizeObserver.observe(host);
  }

  const mouse = Matter.Mouse.create(lovesRender.canvas);
  const mouseConstraint = Matter.MouseConstraint.create(lovesEngine, {
    mouse,
    constraint: { stiffness: 0.08, render: { visible: false } },
  });
  Matter.Composite.add(lovesEngine.world, mouseConstraint);
  lovesRender.mouse = mouse;

  lovesRender.canvas.addEventListener("mousemove", (e) => {
    if (!lovesInfo.size || !card) return;
    const rect = lovesRender.canvas.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const hit = Matter.Query.point(lovesEngine.world.bodies, pos).find((b) => lovesInfo.has(b));
    if (hit) {
      if (lovesHovered !== hit) {
        lovesHovered = hit;
        const info = lovesInfo.get(hit);
        card.innerHTML =
          '<span class="loves-card-title">' + info.title + "</span>" +
          '<span class="loves-card-desc">' + info.desc + "</span>";
        card.hidden = false;
        positionLovesCard(card, e.clientX, e.clientY, rect);
      } else if (!card.hidden) {
        positionLovesCard(card, e.clientX, e.clientY, rect);
      }
      lovesRender.canvas.style.cursor = "grab";
    } else if (lovesHovered) {
      lovesHovered = null;
      card.hidden = true;
      lovesRender.canvas.style.cursor = "default";
    }
  });

  lovesRender.canvas.addEventListener("mouseleave", () => {
    lovesHovered = null;
    if (card) card.hidden = true;
    lovesRender.canvas.style.cursor = "default";
  });
}

function lovesSpawn(i, width, height, total) {
  const areaW = width * 0.8;
  const areaH = height * 0.45;
  const left = width * 0.1 + (areaW * (i + 0.5)) / Math.max(1, total);
  const top = height * 0.3;
  return {
    x: left + (Math.random() - 0.5) * areaW * 0.12,
    y: top + Math.random() * areaH,
    velocity: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 },
    angle: (Math.random() - 0.5) * 0.4,
  };
}

function drawLovesOverlays() {
  const ctx = lovesRender && lovesRender.context;
  if (!ctx) return;
  for (const ent of lovesOverlays) {
    const { body, img, scale } = ent;
    if (!img) continue;
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  if (lovesHovered) {
    const b = lovesHovered;
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

function positionLovesCard(card, clientX, clientY, rect) {
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

initLovesWorld();