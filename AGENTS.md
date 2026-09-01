# AGENTS.md — Portfolio Project Guide

> This file provides all the context needed for AI agents to work on Mathéo Delessert's portfolio.
> Read this file before making any changes to the codebase.
> If you're making changes, make sure to update this file accordingly.

---

## Project Overview

An **interactive, physics-driven creative portfolio** for Mathéo Delessert (`matheodelessert.ch`).
Built entirely with **vanilla HTML, CSS, and JavaScript** — no frameworks, no React, no build-time bundling.

The core experience: user clicks a bag → frame-by-frame animation plays → Matter.js physics objects (representing projects) fall from the bag → user clicks an object → project detail view opens with media (3D model, video, or image carousel).

**Live site:** https://matheodelessert.ch
**GitHub repo:** `homogenic1000/portfolio`
**Deployment:** GitHub Pages via GitHub Actions

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Single-page structure (`index.html`) |
| **Vanilla CSS** (3 files) | Styling, layout, responsive gate |
| **Vanilla JavaScript** | All application logic (ES modules + classic scripts) |
| **Matter.js** | 2D physics engine (falling objects, mini worlds) |
| **Three.js** | WebGL 3D rendering (CD model viewer) |
| **Typewriter Effect** | Text animation (loaded via CDN) |
| **Vite** | Local dev server (`npx vite`) |
| **esbuild** | CI-only minification (in GitHub Actions) |

### Libraries Loaded via CDN (not npm)
- Matter.js `0.19.0` (script tag) — npm has `0.20.0` but it's not used at runtime
- poly-decomp `0.3.0` (script tag, jsdelivr) — enables concave decomposition in `Bodies.fromVertices`; exposes the `decomp` global that Matter's `Common.getDecomp` reads
- Three.js `0.182.0` (import map → jsdelivr CDN)
- Typewriter Effect (unpkg CDN)

### Fonts
- **JetBrains Mono** — Google Fonts (body/default)
- **IBM Plex Serif** — Google Fonts (headings/hero, italic)
- **Overused Grotesk** — Local variable font (`assets/OverusedGroteskRoman-VF.woff2`, project body text)

---

## Directory Structure

```
portfolio/
├── index.html                    # Main single-page entry point (the only real page)
├── aboutme.html                  # Empty stub — not implemented
├── CNAME                         # GitHub Pages custom domain: matheodelessert.ch
├── favico.png                    # Favicon
├── preview.webp                  # Preview image for README
│
├── assets/
│   ├── OverusedGroteskRoman-VF.woff2   # Custom variable font
│   ├── 2d/                       # 2D sprites & project images (.webp, .png)
│   ├── animation/                # 15 frame-by-frame bag animation .webp files
│   ├── model/
│   │   └── cd.glb                # 3D GLTF model (Korg CD jewel case)
│   └── video/                    # Video assets (.webm, .mp4)
│
├── css/
│   ├── style.css                 # Global styles, hero layout, physics canvas
│   ├── media.css                 # Mobile gate (hides everything below 600px)
│   └── korg.css                  # Project detail view, carousel, typography
│
├── script/
│   ├── animation.js              # Frame-by-frame bag sprite animation
│   ├── boundaries.js             # Matter.js invisible walls
│   ├── handlers.js               # Click handlers for special objects
│   ├── objects.js                # Matter.js body definitions (6 objects)
│   ├── physics.js                # Matter.js engine init & orchestrator
│   ├── projects.js               # PROJECTS data config dictionary
│   ├── silhouette.js             # Sprite → silhouette polygon tracing (mini-world hitboxes)
│   ├── turbulance.js             # SVG turbulence filter animation
│   └── korg-script/
│       ├── main.js               # Three.js lazy-init 3D viewer (ES module)
│       └── projects-controller.js # State machine: enter/exit projects
│
├── docs/
│   └── dynamic-rendering.svg     # Architecture diagram
│
├── .github/workflows/
│   └── deploy-prod.yml           # CI/CD: minify + deploy to GitHub Pages
│
├── package.json                  # npm manifest (minimal scripts)
├── jsconfig.json                 # Editor IntelliSense config
├── opencode.json                 # OpenCode AI config (Figma MCP, gitignored)
└── .gitignore
```

---

## Architecture & Module System

### Script Load Order (in `index.html`)
Scripts are loaded as **classic `<script>` tags** (global scope, no bundling). Order matters:

1. `handlers.js` — no dependencies, defines click handler functions
2. `boundaries.js` — depends on Matter.js global
3. `objects.js` — depends on Matter.js global
4. `projects.js` — no dependencies, defines `PROJECTS` data object
5. `physics.js` — depends on: boundaries, objects, handlers, projects
6. `silhouette.js` — no dependencies; defines `traceSpriteVertices()` (sprite → silhouette polygons for mini-world hitboxes)
7. `animation.js` — depends on physics (calls `startPhysics()`)
8. `turbulance.js` — independent SVG filter animation

Then as `type="module"`:
9. `korg-script/main.js` — ES module, imports Three.js via import map
10. `korg-script/projects-controller.js` — depends on physics, projects, handlers, silhouette, and `window.CDViewer` from main.js

### State Machine Pattern
The app has **two states** managed by DOM manipulation:
- **Home state**: Hero section visible, physics canvas active, objects falling
- **Project state**: Hero hidden, `#layout` shown with project content

`projects-controller.js` handles transitions via `enterProject(id)` and the "index" breadcrumb does a **full page reload** to return home.

### Module Note
`main.js` is the only true ES module (uses `import` with import map for Three.js). All other scripts use global scope — functions call each other directly across files.

---

## Key Files & Responsibilities

### `script/projects.js` — Content Data
The **single source of truth** for all project content. Contains a `PROJECTS` object with entries like:
```js
const PROJECTS = {
  korg: {
    title: "Korg e-LIVEsEx jewel case",
    text: "Description text...",
    bg: "#ffffff",                    // Background color applied on enter
    media: { type: "3d", modelPath: "assets/model/cd.glb" },
    images: ["assets/2d/korg1.webp", "..."],
  },
  rondpoint: {
    title: "Frip'O'Point motion design",
    text: "...",
    bg: "#ffffff",
    media: { type: "video", src: "assets/video/rondpoint.webm" },
    images: [],
    minWorld: { gravity: 0.8, objects: [...] },  // Optional mini physics world
  },
};
```

**To add a new project:** Add an entry to `PROJECTS` + add a matching falling object in `objects.js`. The controller auto-handles rendering.

### `script/objects.js` — Physics Object Factory
Defines `OBJECT_CONFIG` for 6 interactive objects (tabac, filtre, pamplemousse, rondpoint, aboutme, korg). Each has Matter.js body properties (size, restitution, friction, sprite texture). The object `label` links to a `PROJECTS` entry.

### `script/physics.js` — Physics Engine Orchestrator
Initializes Matter.js engine, creates the renderer in `#physic`, manages boundaries, spawns objects with staggered delays, handles click detection on physics bodies, and provides `pausePhysics()`/`resumePhysics()`.

### `script/silhouette.js` — Sprite → Polygon Hitbox Tracing
Traces the exact silhouette of any sprite alpha channel. `traceSpriteVertices(src)` loads the image, samples its alpha onto a small grid (`TRACE.SAMPLE`), labels 8-connected islands, traces each island's outer contour with a Moore-neighbor boundary walk (holes are automatically filled), and simplifies with Douglas–Peucker. Resolves `{ img, islands }` — the loaded image plus one vertex set **per island** — or `null` on failure. Tuning constants live in the `TRACE` object: `SAMPLE`, `ALPHA_THRESHOLD`, `EPSILON`, `MAX_POINTS`.

### `script/korg-script/projects-controller.js` — Central Controller
The main routing/transition system. `enterProject(id)` reads from `PROJECTS`, hides hero, pauses physics, injects content, dispatches media (3D or video), and builds secondary panels (carousel or mini physics world).

**Mini-world hitboxes (auto-shaped):** in `buildMinWorld`, every config object with a `sprite` gets an immediate rectangular placeholder, then its traced polygons arrive asynchronously and **replace** the placeholder. Traced vertices are in source-image pixels (2048), so they're scaled by the object's `o.scale` before `Bodies.fromVertices` so the physics hugging the rendered sprite stays exact. Concave decomposition is provided by the `poly-decomp` CDN global. If the trace fails, the rectangle placeholder remains as a fallback. Each trace is bound to its engine instance to avoid stale re-injection after `destroyMinWorld`/re-entry.

**Single-sprite rendering:** Matter cannot draw a sprite once on a compound (multi-part) body — `Bodies.fromVertices` copies any `render.sprite` onto every convex part, drawing the full texture N times (overlapping copies). So letter bodies are created with `render: { visible: false }` (physics only) and each letter's texture is drawn exactly once via an `afterRender` overlay (`drawLetterOverlays`), anchored to the body's position/angle. Spawn points are scattered across the mini-world width with slight y/angle jitter (`minSpawn`).

### `script/korg-script/main.js` — 3D Viewer
Lazy-initializes Three.js scene when a 3D project is opened. Loads `.glb` models via GLTFLoader, sets up OrbitControls and lighting. Exposes `window.CDViewer` with `show(modelPath)` and `hide()`.

### `script/animation.js` — Bag Animation
Drives a click-triggered 15-frame WebP sprite animation at 100ms intervals. On completion calls `startPhysics()`. Includes shake effect on re-click.

---

## Styling

### CSS Files
- **`css/style.css`** — Global reset, hero layout, physics canvas positioning, base typography
- **`css/media.css`** — Single breakpoint (600px): hides desktop experience, shows "mobile not supported" message
- **`css/korg.css`** — Project detail view layout, carousel system, custom font-face, typography

### Key Design Decisions
- **No CSS framework** — all hand-written vanilla CSS
- **No design tokens/CSS variables** — colors and spacing are hardcoded
- **Desktop only** — mobile is explicitly blocked with a gate at 600px
- **Dynamic theming** — background colors are set via JS from `PROJECTS.bg`
- **Two-column layout** for project views (left: content + secondary media, right: primary media)

### Animations
- **Matter.js** — 2D physics simulation (gravity, collisions, restitution)
- **Frame-by-frame sprites** — Bag animation (15 frames at 100ms)
- **SVG displacement filters** — Pulsing text distortion (turbulence oscillation)
- **Three.js** — 3D model with OrbitControls
- **CSS transitions** — Background color (0.6s), text color (0.4s), hover scale (0.3s)
- **No animation libraries** (no GSAP, Framer Motion, Anime.js)

---

## Development

### Getting Started
```bash
npm install
npx vite          # Start dev server
```
Or use `live-server` (also installed as dependency).

### Important: No npm Scripts Defined
`package.json` only has a placeholder `test` script. There is **no `dev`, `build`, `start`, or `lint` script**. Use `npx vite` directly.

### Linting / Formatting
**None configured.** No ESLint, no Prettier, no editorconfig.

---

## Deployment

### GitHub Pages (CI/CD)
- **Workflow:** `.github/workflows/deploy-prod.yml`
- **Trigger:** Push to `main` branch or manual dispatch
- **Process:**
  1. Minify all `script/*.js` and `css/*.css` with esbuild
  2. Strip non-site files (node_modules, configs, docs, etc.)
  3. Deploy to GitHub Pages
- **Custom domain:** `matheodelessert.ch` (via CNAME)

### No Other Deployment Configs
No Vercel, Netlify, Docker, or other deployment tooling.

---

## Environment Variables & Secrets

**None used.** No `.env` files, no `process.env`, no API keys. The site is entirely static.

---

## Testing

**None.** No test framework, no test files, no test scripts.

---

## Git Workflow

- **Main branch:** `main` (deployment branch)
- **Feature branches:** Active branching (e.g., `dynamic-projects`, `threejs`, `feature/mini-matter-world`)
- **No git hooks** (no husky, no lint-staged)
- **`.gitignore`:** `.idea/`, `node_modules/`, `.DS_Store`, `opencode.json`, `session-ses_fd59.md`

---

## SEO & Metadata

**Minimal.** Only a `<title>` tag and favicon. No meta description, no Open Graph tags, no Twitter Cards, no structured data, no sitemap, no robots.txt.

---

## Known Quirks & Things to Watch

1. **Dual Matter.js versions:** npm has `0.20.0`, CDN loads `0.19.0`. The runtime uses CDN. The npm copy is for IDE tooling only.
2. **`jsconfig.json` has `"jsx": "react-jsx"`** but this is NOT a React project — it's just an editor hint.
3. **Typewriter effect is loaded** via CDN but doesn't appear to be actively used in current scripts.
4. **`aboutme.html` is empty** — stub page with no content.
5. **`opencode.json` is gitignored** — contains local Figma MCP server config.
6. **Global scope coupling** — scripts depend on each other via global functions. Changing function names requires updating all callers.
7. **`#physic` canvas** uses `position: fixed` with `z-index: 3` — can overlay other content.
8. **Project views** use inline style manipulation extensively (background colors, display toggling).

---

## Quick Reference: Adding a New Project

1. Add entry to `PROJECTS` in `script/projects.js` (with title, text, bg, media, images)
2. Add matching object config to `OBJECT_CONFIG` in `script/objects.js` (with Matter.js body + sprite)
3. Add sprite image to `assets/2d/`
4. Add media assets to appropriate `assets/` subfolder
5. The controller (`projects-controller.js`) will automatically handle rendering, media dispatch, and transitions

---

*Last updated: September 2026*
