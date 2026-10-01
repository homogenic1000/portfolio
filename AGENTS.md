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
| **Vite** | Local dev server (`npx vite`) |
| **esbuild** | CI-only minification (in GitHub Actions) |
| **Playwright + Chromium** | Headless-browser smoke tests (`npm test`) |

### Libraries Loaded via CDN (not npm)
- Matter.js `0.19.0` (script tag) — npm has `0.20.0` but it's not used at runtime
- poly-decomp `0.3.0` (script tag, jsdelivr) — enables concave decomposition in `Bodies.fromVertices`; exposes the `decomp` global that Matter's `Common.getDecomp` reads
- Three.js `0.182.0` (import map → jsdelivr CDN)

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
├── archive.html                  # Projects "Index" page (archive list, deep-links into index.html)
├── lab.html                      # "lab/" page: unfinished/WIP projects floating in a zero-gravity world
├── git.html                      # Full git network graph + readme.md sidebar (from assets/git/commits.json)
├── CNAME                         # GitHub Pages custom domain: matheodelessert.ch
├── LICENSE                       # GPL-3.0 (code only); creative content = All Rights Reserved
├── robots.txt                    # Crawlers may read text; all media (/assets/ + extensions) disallowed
├── favico.png                    # Favicon
├── preview.webp                  # Preview image for README
│
├── assets/
│   ├── OverusedGroteskRoman-VF.woff2   # Custom variable font
│   ├── 2d/                       # 2D sprites & project images (.webp, .png)
│   ├── animation/                # 15 frame-by-frame bag animation .webp files
│   ├── git/                      # commits.json — git history snapshot for git.html (CI-generated)
│   ├── model/
│   │   └── cd.glb                # 3D GLTF model (Korg CD jewel case)
│   └── video/                    # Video assets (.webm, .mp4)
│
├── css/
│   ├── font.css                  # Typography guidelines + tokens (single source for families/weights/sizes)
│   ├── style.css                 # Global styles, hero layout, physics canvas
│   ├── media.css                 # Mobile gate (hides everything below 600px)
│   ├── archive.css               # Index/archive page styles (IBM Plex Serif header + Overused Grotesk rows)
│   ├── lab.css                   # "lab/" page (floating WIP world + fullscreen overlay)
│   ├── git.css                   # git.html network graph + readme.md sidebar
│   └── korg.css                  # Project detail view, carousel, typography
│
├── script/
│   ├── animation.js              # Frame-by-frame bag sprite animation
│   ├── archive.js                # Renders archive.html rows from PROJECTS (names, types, dates)
│   ├── boundaries.js             # Matter.js invisible walls
│   ├── cursor.js                 # Custom dot cursor → "en savoir plus" pill over project rows (archive)
│   ├── gitgraph.js               # git.html: lane layout, SVG render, refresh polling, README renderer
│   ├── loves.js                  # Archive "things i love" Matter world (zero gravity, drag, hover card)
│   ├── lab.js                    # "lab/" page: LAB config + floating image/video world + fullscreen view
│   ├── objects.js                # Matter.js body definitions (6 objects)
│   ├── physics.js                # Matter.js engine init & orchestrator
│   ├── projects.js               # PROJECTS data config dictionary
│   ├── silhouette.js             # Sprite → silhouette polygon tracing (mini-world hitboxes)
│   ├── turbulance.js             # DEAD CODE — not loaded by any page, see Known Quirks
│   └── korg-script/
│       ├── main.js               # Three.js lazy-init 3D viewer (ES module)
│       └── projects-controller.js # State machine: enter/exit projects
│
├── tools/
│   ├── export-git.js             # CI-only Node script → writes assets/git/commits.json (not deployed)
│   ├── mcp-run.mjs               # Generic Chrome DevTools MCP step driver (stdio, local dev)
│   ├── lighthouse-audit.mjs      # Run Lighthouse over one or more URLs / --all (stdio MCP)
│   └── mcp-steps/                # Step files for mcp-run.mjs (example, cls-observer, cls-provider)
│
├── docs/
│   └── dynamic-rendering.svg     # Architecture diagram
│
├── test/
│   └── smoke.mjs                  # Headless-browser smoke test (Playwright, JSON only)
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

1. `boundaries.js` — depends on Matter.js global
2. `objects.js` — depends on Matter.js global
3. `projects.js` — no dependencies, defines `PROJECTS` data object
4. `physics.js` — depends on: boundaries, objects, projects
5. `silhouette.js` — no dependencies; defines `traceSpriteVertices()` (sprite → silhouette polygons for mini-world hitboxes)
6. `animation.js` — depends on physics (calls `startPhysics()`)
7. `main.js` is loaded as a module (see 9) — **no `handlers.js` and no `turbulance.js` are loaded any more**

Then as `type="module"`:
8. `korg-script/main.js` — ES module; **Three.js is loaded with a dynamic `import()` on the first 3D project**, not statically (see `main.js` below)
9. `korg-script/projects-controller.js` — depends on physics, projects, silhouette, and `window.CDViewer` from main.js

### State Machine Pattern
The app has **two states** managed by DOM manipulation:
- **Home state**: Hero section visible, physics canvas active, objects falling
- **Project state**: Hero hidden, `#layout` shown with project content

`projects-controller.js` handles transitions via `enterProject(id)` and the "index" breadcrumb does a **full page reload** to return home.

### Navigation & Deep-linking
- **`archive.html`** is a standalone "Index" page: a plain list of all projects (rows deep-link into `index.html?project=<label>`). Rows are generated at runtime by `script/archive.js` from live `PROJECTS` data (title/label, type, date); rows without a `PROJECTS` entry live in `archive.js`'s `ROWS` list (clickable or `disabled`). The "the portfolio" extra row (webdesign/dev, 2025 → 2026, GitHub-blue) links to `git.html` and also carries a cursor `sprite` (`assets/2d/portfolio.webp`). Each clickable row's title is permanently colored by the project's `color` (e.g., Frip'O'Point green), no hover. The interactive CTA is the custom cursor (`cursor.js`): a white dot (mix-blend exclusion) that becomes the row's sprite image over clickable rows (from `data-sprite`). No description text exists. The page also loads Matter.js + `loves.js` for the zero-gravity "things i love" mini-world (portrait `aboutme.webp` + album + placeholders, draggable, hover cards) where the canvas spans the **full page width** beneath the links row, and `silhouette.js` for its hitboxes. It does **not** load the home physics/controller scripts. The bottom `.about-links` row (Serif italic: repo · instagram · home · soundcloud · lab) has 5 auto columns: column 3 is `.link-home` → `https://matheodelessert.ch` (replaced the `github` link; it leads back to the hero/bag home page, which is what the domain root serves) and column 5 is `.link-lab` → `lab.html`. **The old absolutely-positioned `.header-lab` anchor in the header row was removed (Sept 2026)** so `lab` appears exactly once on the page; the `.header-lab` CSS block was deleted with it. The page is designed to fit **exactly one viewport, with no scroll**: `.archive` is `height: 100dvh; overflow: hidden`, the header row hugs its text (`min-height: 0`, 4px bottom padding, small Serif wordmarks at weight 400 / `0.92em` — the same optical size as the grotesk project rows and the bottom links row, so only the typeface changes between them, never the size), and `#loves-world` has no `min-height` so the zero-gravity world absorbs whatever vertical space is left over (it shrinks on short screens instead of pushing the links row below the fold).
- **`git.html`** is the "git/" page: a **full network graph** of the repo's commit history + a `readme.md` sidebar. Data comes from `assets/git/commits.json`, generated at deploy time by the CI-only Node script `tools/export-git.js` (runs `git log --all --date-order` + `git for-each-ref`, writes `{ exported_at, count, newest, commits[{sha, parents, subject, author, date, refs}], refs }`). `script/gitgraph.js` lays out fork/merge **lanes** with a free-lane-reuse ("railroad") algorithm (rows = commits newest→oldest, 24px; columns = parallel branch arms, 26px, **reused** so the graph stays compact — `refs.main` is pinned to column 0; a commit takes the leftmost waiting lane, other waiting lanes converge/free their columns, the first parent continues the node's column, merge parents claim the leftmost free column) and renders Zed-style: a single grid table where the **graph is its own column** (SVG `#lanes-svg`: blue main-branch lane/dots, black dots, grey bars + horizontal orthogonal `data-kind="run"` connectors drawn at the exact fork/merge rows — short, since lanes are reused) and every piece of info gets **its own column** — `subject` (with black ref badges inline, +N overflow), `author`, `date`, `short sha` link — with 1px lightgrey column separators and a `#f7f7f7` row hover. Rows are 24px, one per commit; dots/rows are vertically pixel-aligned, and subjects ellipsize (`minmax(0,1fr)` column, `width:100%` grid — never `max-content`, so long messages can't blow out the width). The layout is pure-function (`layout(commits, mainTip)` → `{ bySha, colOf, bars, runs, maxCol, commits }`) so the current repo (161 commits, ≈5 concurrent branches) fits in ~4 columns instead of one-per-branch. It also polls `GET api.github.com/repos/.../commits?per_page=1` every 60s (paused when tab hidden) and **auto-reloads once per new tip** when GitHub reports a commit newer than the snapshot (guard: reload sha stored in `sessionStorage["git-auto-reload-sha"]` so it never loops while the deployed snapshot lags a push — there is no "new commits" chip). The sidebar fetches `README.md` (kept in the deploy artifact) and renders it with a tiny built-in markdown parser (`mdToHtml`). The CI workflow runs `node tools/export-git.js` after checkout, keeps `README.md`, and removes `tools/` from the artifact. Top of the page is just the `index/portfolio` breadcrumb (no header row; the page displays as "portfolio", though the file stays `git.html`); it uses the shared page-header treatment (`IBM Plex Serif` italic **400** at `calc(var(--fs-index) * 0.92)`, i.e. 22.55px @1512 — it used to be weight 200 at 33px, the only oversized header on the site). The graph/columns scroll together as one unit (lanes are **not** sticky). The two section headers are **one shared box model** (`#graph-meta, .readme-header` in `git.css`: `flex: none` + `display: flex; align-items: center` + a height derived from the readme header's fluid font-size, `calc(clamp(1rem, 1.3vw, 1.3rem) * 1.33 + 20px)`), so the divider rule and the content below start on the same line in both columns — only the typeface differs (Mono meta vs Serif italic "readme.md"). Never give one of them its own padding/height.
- **`lab.html`** is the "lab/" page: a **full-page** zero-gravity Matter.js world (pattern mirror of `loves.js`) where unfinished/WIP projects float as images and **live videos** (muted, looping). Hovering a piece shows a small description card (reuses `#loves-card`); clicking opens the dark **fullscreen overlay** (`#lab-fullscreen`) with the large media + title/desc (dismiss: `close` button, `Escape`, or backdrop click). Images and video posters get silhouette hitboxes via `silhouette.js`; videos with no `poster` stay rectangular. Loads Matter.js, poly-decomp, `silhouette.js`, `lab.js` and `cursor.js` (the custom dot, like every other page; `#lab-world canvas` sets `cursor: none !important` so the world keeps its grab cursor underneath). It is linked from the archive bottom `.about-links` row (`lab`, column 3). **Header: only two children** — the blue `.lab-title` (`lab/`) and a single `.lab-back` text link `index/` → `archive.html`, right-aligned on the header's `space-between` + `align-items: baseline` (10px gutters both sides, `border-bottom: 1px solid lightgrey` above the full-bleed world). `.lab-back` styles only `color` / `text-decoration` / hover `#0008ff` and **inherits** family/style/weight/size from `.lab-header` — that inheritance is what keeps it on the site-wide page-header size, so never hardcode a font on it. (The `<nav class="lab-nav">` with `index/` + `home↗` was removed in Oct 2026: two right-aligned links floating with no column to align to were the one non-conforming spot on the page. The home/bag page is still one click away via `home` in archive.html's `.about-links`.)
- **`index.html?project=<id>`** opens a project directly on load. `projects-controller.js` ends with an `initDeepLink()` IIFE that reads `?project=` and calls `enterProject(id)` on the `window "load"` event (guarantees the `main.js` module has exposed `window.CDViewer` for 3D media).
- In deep-link mode physics never started, so `enterProject()` guards its boundary-removal with `typeof engine !== "undefined" && engine`.
- The project-view `index` breadcrumb points to `archive.html`. The hero has **no** index shortcut — the `index↗` link (and its `h2`/tooltip CSS) was removed; the intro disclaimer's skip link is the bypass.

### Module Note
`main.js` is the only true ES module (uses `import` with import map for Three.js). All other scripts use global scope — functions call each other directly across files.

### Accessibility
- **Full-page intro disclaimer:** `index.html` opens with `#intro-disclaimer`, a full-viewport `role="dialog"` (`aria-modal`, `tabindex="-1"`, labelled/described) that offers the choice up front: **Skip the intro — go to the index** (`<a href="archive.html">`, the accessibility bypass for the loud, mouse-only bag intro, WCAG 2.4.1) or **Start the intro** (button). It also dismisses on Escape. While open, `#media-query` is `inert` so the animated hero stays out of the tab/AT order; on dismiss focus moves to `#animation-bag`. The choice (**either** button) is remembered in `localStorage["intro-seen-v1"] = "1"` (`animation.js`, guarded by `try/catch` for Safari private mode) so returning visitors never see it again; the `<head>` script reads it *before first paint* and adds `.intro-dismissed` to `<html>` (no flash, and the `inert` is never applied since the block bails out early). It is also hidden on `?project=` deep-links (the same `<head>` script adds `.deep-link`) and on the < 600px mobile gate. There is no reset UI — clear the key in devtools to see it again.
- **Bag keyboard parity:** `#animation-bag` is `role="button" tabindex="0"` with an `aria-label`; `animation.js` listens for Enter/Space and triggers the same `animate()` path as a click.
- **`prefers-reduced-motion: reduce`:** `animation.js` skips the 15-frame sequence entirely on activation — it jumps to the final frame and calls `startPhysics()` straight away (guarded so a re-click can't re-spawn the engine).

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
  premierjour: {
    title: "Premier jour d'été",
    text: "...",
    bg: "#ffffff",
    media: { type: "image", images: ["assets/2d/nature.webp", "..."] }, // Carousel in #show
    images: ["assets/2d/img_3877.webp", "..."],  // Secondary carousel in #show-min
  },
};
```

Media dispatch: `{ type: "3d" }` → Three.js viewer in `#show`; `{ type: "video" }` → `<video>` in `#show`; `{ type: "image" }` → carousel in `#show` (primary photo showcase).

**Where descriptions live (three different keys — don't confuse them):**
| File | Key | Rendered where |
|---|---|---|
| `script/projects.js` | `text` | project body, inside `#project-text` (accepts a `<span class="copyright">` block) |
| `script/loves.js` (`LOVES.objects`) | `desc` | hover card `#loves-card` on archive.html ("things i love") |
| `script/lab.js` (`LAB.objects`) | `desc` | hover card + `#lab-fs-desc` in the lab.html fullscreen view |

A project also carries `label` / `title` / `type` / `date` (the fields `archive.js` reads for the index rows) and `color` (permanently tints the row title, and is the project accent). `premierjour` is the one entry with no `label`/`type`/`date` — `archive.js`'s `ROWS` supplies the fallbacks (`"photographie"`, `"2025"`) and the row falls back to `title` for its name.

**English copy conventions** (all prose on the site is English except the French `premierjour` title): American `-ize` spellings (`organized`), `favorite` (not `favourite`), `web design` (two words) in running text, the pronoun `I` always capitalized, proper nouns capitalized (`Björk`, `Nelson`, `Korg`, `Cordon bleu`, `Play-Doh`), and a terminal period on every description. Keep the casual register and the `:) ` emoticons in the `loves.js`/`lab.js` descriptions — they're part of the voice, not errors to be formalised.

**Copyright mentions:** a project with third-party music closes its `text` with a `<span class="copyright">` block (tiny grey grotesk caption, `--fs-caption`) after a `\n\n`. Two phrasings exist, pick the one that fits:
- *artist credited, label known* (rondpoint): `All rights to the musical composition and sound recording of "TITLE" are owned by LABEL (℗ © YEAR). This mention is made for commentary, criticism, or reference purposes under Fair Use guidelines, and no copyright infringement is intended.`
- *artist credited, holders unknown* (betweenworlds, vroomvroom): `Music: "TITLE" by ARTIST. All rights to the composition and recording belong to their respective owners. This mention is made for reference purposes under Fair Use guidelines, and no copyright infringement is intended.`

Keep the track title verbatim (its odd spacing included) — it's someone else's title, don't restyle it. Every project with borrowed audio needs one; `korg`, `premierjour` and `eracom` have no music and therefore none.

**`layout: "stack"` (optional, per project):** projects with no `minWorld` and no `images` need a single full-width panel, so they set `layout: "stack"` (eracom, betweenworlds). `projects-controller.js` mirrors it to `#layout[data-layout]`; `css/korg.css` then flips `#layout` to `flex-direction: column` (text on top, media full-width below), hides `#show-min` (nothing to show anyway) and lets `#show` take the leftover height. Since the stack layout is vertical, its two sections (text → media) are separated by **one single full-width line** — `border-bottom: 1px solid lightgrey` on `.column` — so both `#content` and `#show` get `outline: none` (they keep no `.box` frame, unlike the two-column layout). The text block is also **measure-limited** so it never spans the whole page: `#content` gets `width: fit-content` (it hugs the measure and sits left instead of being stretched) and `#project-text` gets `max-width: 30em` — 30em of the paragraph itself, whose font-size is the fluid `clamp(0.95rem, 1.15vw, 1.4rem)`, so the ~68 characters/line stay constant from a 1024px to a 2560px viewport (a `ch`/`em` cap on `#content` would not scale and collapses to ~51 chars on a 27"). Rule of thumb: **30em ≈ 68 chars** (26em ≈ 59, 34em ≈ 77). Keep the cap on the paragraph, not on the box, and keep it in `em` of the paragraph. That cap is now on `#project-text` **globally** (it moved out of the stack-only rule in Sept 2026): the two-column layout had no cap and reached 1260px / ~119 chars at 2560. The stack `#show` also uses `padding: 10px` (was `10px 0`, so the full-bleed media touched the page edges) and its media is sized `width/height: 100%` + `object-fit: contain` — `max-width/max-height: 100%` only *shrinks*, so a 1280×720 video sat untouched in a 2560×1206 panel (29.9 % fill). `contain` scales it up to the largest size that fits (99 % fill) without ever overflowing or distorting. Carousels are legitimately height-constrained (`#show img { max-height: 85% }`), so a portrait photo filling ~50 % of a wide panel's *width* is correct, not a bug.

**To add a new project:** Add an entry to `PROJECTS` + add a matching falling object in `objects.js`. The controller auto-handles rendering.

### `script/objects.js` — Physics Object Factory
Defines `OBJECT_CONFIG` for **6** interactive objects (eracom, rondpoint, korg, vroomvroom, premierjour, betweenworlds). Each has Matter.js body properties (size, restitution, friction, sprite texture). The object `label` links to a `PROJECTS` entry. `premierjour` reuses the circle physics of the former `pamplemousse` object (radius 40, `pamplemousse.webp` sprite placeholder). Since Matter draws a sprite at `texture.naturalSize * xScale`, each config's `xScale`/`yScale` must match its body size. **The old 8th objects `tabac` and `aboutme` were removed (Sept 2026): both were dead features** — `tabac` had no `PROJECTS` entry and no handler (its click fell through to `console.log`), and `aboutme` called `onAboutMeClick()` in the now-deleted `handlers.js`, targeting a `#aboutme-inactive` element that no longer exists in `index.html`. Their factories, `createTabac()`/`createAboutMe()` calls in `physics.js`, the `aboutme` case in `handleObjectClick`, and the `aboutme-inactive` handler are all gone; `assets/2d/tabac.webp` and `assets/2d/aboutme.webp` remain on disk but are unreferenced. `npm test` now expects **6** spawns. `angle` is in **radians**: most objects use `(3 * Math.PI) / 180`, while `korg` and `vroomvroom` intentionally keep `angle: 2` (~114°, deliberately tilted). Adding an `OBJECT_CONFIG` entry is mandatory for any new `create*()` factory — a missing entry makes `config` `undefined` and the spawn `setTimeout` throws, which shows up as a `PAGEERROR` in `npm test`.

**Spawn point (sandwich midpoint):** Objects spawn at the center of the `#sandwich` overlay, which sits on the bag's mouth. `initSpawnPoint()` is called once the DOM/images/fonts are ready (`window "load"` + `document.fonts.ready`): it temporarily measures the sandwich's real bounding box without a visual flash (sets `display: block` + `visibility: hidden`, reads the rect, restores everything in the same task) and caches its midpoint in the global `spawnPoint`. `computeSpawnPoint()` returns the cached `spawnPoint` (with a bag-aspect-ratio fallback before images resolve). `spawnPoint` is also re-measured on `resize`. In `physics.js`, `computeSpawnPoint()` is called just before each object is created (inside its 500ms `setTimeout`) and its result is passed directly into each `create*(x, y)` factory. Each actual creation position is pushed to `window.spawnLog` (`{ label, x, y }`) so the Playwright test can assert objects land inside the sandwich.

### `script/physics.js` — Physics Engine Orchestrator
Initializes Matter.js engine, creates the renderer in `#physic`, manages boundaries, spawns objects with staggered delays, handles click detection on physics bodies, and provides `pausePhysics()`/`resumePhysics()`. Each staggered spawn calls `computeSpawnPoint()` right before creating the body so the spawn tracks the settled bag position.

### `script/silhouette.js` — Sprite → Polygon Hitbox Tracing
Traces the exact silhouette of any sprite alpha channel. `traceSpriteVertices(src)` loads the image, samples its alpha onto a small grid (`TRACE.SAMPLE`), labels 8-connected islands, traces each island's outer contour with a Moore-neighbor boundary walk (holes are automatically filled), and simplifies with Douglas–Peucker. Resolves `{ img, islands }` — the loaded image plus one vertex set **per island** — or `null` on failure. Tuning constants live in the `TRACE` object: `SAMPLE`, `ALPHA_THRESHOLD`, `EPSILON`, `MAX_POINTS`.

### `script/korg-script/projects-controller.js` — Central Controller
The main routing/transition system. `enterProject(id)` reads from `PROJECTS`, hides hero, pauses physics, injects content, dispatches media (3D, video, or image), and builds secondary panels (carousel or mini physics world).

**Carousel with mixed media:** `buildCarousel(images, target)` renders `.webm`/`.mp4` sources in the `images` array as `<video autoplay muted loop playsinline>` elements instead of `<img>` for those slides — so a project's `#show-min` can mix screenshots and looping videos. The optional `target` defines the host element (defaults to `#show-min`); an `image` media type appends its carousel into `#show`. Multiple carousels can coexist — roots are tracked in the `carouselRoots` array and `destroyCarousel(target)` only removes carousels inside the given host (or all when no host), so the `#show` primary carousel survives the `#show-min` build. Because `buildCarousel` preloads image dimensions asynchronously, stale builds are cancelled by a **per-host token** (`carouselTokens` WeakMap, keyed by host) — never a single global counter, which would make the second `buildCarousel` call (e.g. `#show-min`) cancel the first (`#show`) for projects that use both an `image` media type and an `images` carousel (premierjour).

**Mini-world hitboxes (auto-shaped):** in `buildMinWorld`, every config object with a `sprite` gets an immediate rectangular placeholder, then its traced polygons arrive asynchronously and **replace** the placeholder. Traced vertices are in source-image pixels (2048), so they're scaled by the object's `o.scale` before `Bodies.fromVertices` so the physics hugging the rendered sprite stays exact. Concave decomposition is provided by the `poly-decomp` CDN global. If the trace fails, the rectangle placeholder remains as a fallback. Each trace is bound to its engine instance to avoid stale re-injection after `destroyMinWorld`/re-entry.

**Single-sprite rendering:** Matter cannot draw a sprite once on a compound (multi-part) body — `Bodies.fromVertices` copies any `render.sprite` onto every convex part, drawing the full texture N times (overlapping copies). So letter bodies are created with `render: { visible: false }` (physics only) and each letter's texture is drawn exactly once via an `afterRender` overlay (`drawLetterOverlays`), anchored to the body's position/angle. Spawn points are scattered across the mini-world width with slight y/angle jitter (`minSpawn`).

**Responsive mini-world letters:** Letter scale is proportional to the `#show-min` container (`Math.min(w,h) / 960 * 0.07 * r`, ~12% of container) instead of a fixed pixel size, so letters adapt to any screen. The canvas + boundary walls resize on container change via a `ResizeObserver` (mirrors the Three.js pattern), and each object gets small random initial velocity (`Matter.Body.setVelocity`, ±3) so they drift with inertia on spawn in the zero-gravity world.

### `script/korg-script/main.js` — 3D Viewer
**Three.js is genuinely lazy (Sept 2026).** `index.html` loads `main.js` on every page, but its imports are **dynamic**: `ensureThree()` does `Promise.all([import('three'), import('three/addons/controls/OrbitControls.js'), import('three/addons/loaders/GLTFLoader.js')])` and caches the promise. `show()` calls it before `init()`. With static top-level imports this file alone pulled ~1.8 MB of Three.js (69 % of a project page's weight) on *every* page including video-only ones. The import map in `index.html` must stay for those specifiers to resolve. `window.CDViewer` is still set synchronously at module evaluation, so `initDeepLink()`'s wait for `window "load"` still guarantees it exists. `DEFAULT_DIRECTION` is a plain array (normalized lazily inside `frameModel()`) because it needs `THREE`.

Loads `.glb` models via GLTFLoader, sets up OrbitControls and lighting. The canvas gets `role="img"` + an `aria-label` (a bare `<canvas>` is invisible to screen readers). Exposes `window.CDViewer` with `show(modelPath)` and `hide()`. `show()` returns a promise; callers don't await it.

**Default view is a three-quarter (near-isometric) angle, auto-framed:** `DEFAULT_DIRECTION` is `(1, 0.85, 1).normalize()` → **elevation 31°, azimuth 45°**. This matters because `cd.glb` is a **flat object lying on the XZ plane** (bbox 2.11 × 0.16 × 2.32) — the old hardcoded `camera.position.z = 5` looked at it dead-on and level with it, so it only showed the 0.16-unit edge. `frameModel(object)` runs on every model load (and on the cache-hit path) and: aims `controls.target` at the bbox centre, projects the **8 bbox corners onto the camera basis** (not the bounding sphere — a flat object framed as a sphere would render tiny), backs off by `FRAME_MARGIN = 1.12`, then tightens `camera.near/far` to the computed distance (avoids z-fighting on the transparent canvas) and clamps `controls.min/maxDistance` to `[0.4d, 3d]` so the model can't be lost. Distance is aspect-dependent (5.0 in the tall 756×982 `#show`, 3.56 in a wide one).

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
- **Typography centralized** — `css/font.css` is the single source: it loads all 3 families (IBM Plex Serif, JetBrains Mono, Overused Grotesk) and defines the fluid size/weight/line-height tokens (`--fs-*`, `--w-*`, `--lh-*`) with a role→selector map. Prefer these tokens over new hardcoded font values.
- **One page-header size, site-wide** — every page header (`#layout h1` on the project view, `.header-row` on archive.html, `.lab-header` on lab.html, `.breadcrumb` on git.html) is `IBM Plex Serif` italic **400** at `calc(var(--fs-index) * 0.92)` (22.55px @1512). Never let one of them drift: on the index page the header, the project rows and the links row share that single optical size, so only the typeface/colour changes between them. Write it as `calc(...)`, not `0.92em` — `body` is 14px on git.html and `--fs-index` is inherited differently per page, so a bare `em` compounds or collapses.
- **No design tokens/CSS variables for colors & spacing** — colors and spacing are hardcoded. (Fonts are the one exception, tokenized in `font.css`.)
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

### Important: Only a `test` Script Defined
`package.json` defines a `test` script (`node test/smoke.mjs`, headless-browser smoke test). There is **no `dev`, `build`, `start`, or `lint` script**. Use `npx vite` directly to run the dev server.

### Linting / Formatting
**None configured.** No ESLint, no Prettier, no editorconfig.

---

## Deployment

### GitHub Pages (CI/CD)
- **Workflow:** `.github/workflows/deploy-prod.yml`
- **Trigger:** Push to `main` branch or manual dispatch
- **Process:**
  1. Run `node tools/export-git.js` (write `assets/git/commits.json` for `git.html`)
  2. Minify all `script/*.js` and `css/*.css` with esbuild
  3. Strip non-site files (node_modules, configs, docs, tools, etc.) — **`README.md` is kept** (serves `git.html`'s sidebar)
  4. Deploy to GitHub Pages
- **Custom domain:** `matheodelessert.ch` (via CNAME)

### No Other Deployment Configs
No Vercel, Netlify, Docker, or other deployment tooling.

---

## Environment Variables & Secrets

**None used.** No `.env` files, no `process.env`, no API keys. The site is entirely static.

---

## Testing

Two complementary tools: an automated **JSON smoke test** (Playwright) for regressions, and the **Chrome DevTools MCP** for anything interactive or visual. **No test ever writes screenshots** — the smoke test prints JSON only, and visual checks are done by hand through the MCP (whose `take_screenshot` you can call when a human/LLM *can* read images; never rely on it, most models cannot).

### Headless-Browser Smoke Test (Playwright + Chromium)
We use **Playwright** driving a **headless Chromium** to load the real site, click the bag to trigger the physics animation, and report computed layout + console errors at multiple viewports. This is the fastest way to verify browser-rendering behavior (stacking order, flex layout, canvas layering, responsive scaling) that static code review cannot reliably predict.

**Run it:**
```bash
npm test                 # boots a vite dev server, tests 3 viewports, prints JSON
npm test -- --url http://localhost:5173   # test an already-running server
npm test -- --port 5173  # pick the dev-server port (default 5173)
```

> **Don't leave a dev server on the test's port.** If something is already bound to 5173 (e.g. a `npx vite` you started for MCP work), the test's own vite silently fails to bind (`stdio: "ignore"` hides it) and it silently tests against the stray server — which is also a file-watcher, so a Vite full-reload mid-run wipes `window.spawnLog` and the run fails with `physicsCanvasPresent: false, logCount: 0` and **no** console error. Kill the stray server, or pass `--port 5199`.

> **Before merging:** the required verification is `npm test` — run it and confirm it passes (0 console errors, physics spawns, **6** logged objects, spawn points inside the sandwich, exit 0).

**What it does** (`test/smoke.mjs`):
1. Starts `npx vite` (unless `--url` is passed) and waits for it to be reachable.
2. For each viewport (1024, 1512/14", 2560/27") opens a headless Chromium page, captures console errors and page errors, loads the site, records the intro disclaimer (visible + its `archive.html` skip link) and dismisses it via **Start the intro**, clicks `#animation-bag`, waits for all 8 physics objects to spawn (one every 500ms).
3. Prints structured JSON per viewport on stdout: bag visibility/size/position, sandwich visibility/size, title-D position, whether physics spawned, `spawnLog` count, and any console errors.
4. Second loop on `lab.html`: the WIP world spawned bodies, a synthetic click opened the fullscreen overlay, and its console errors.
5. Exits non-zero if the disclaimer isn't shown, the bag is missing, physics didn't spawn, or any console error occurred.

**Reading the output:** the JSON gives exact pixel values to check centering, alignment and scaling. Two healthy lines look like `"spawn":{"logCount":8,"logAllInSandwich":true}` and `"errors":[]`.

**Installing the browser binary** (only needed once, already done but here for reference):
```bash
npx playwright install chromium
```

### Interactive & Visual Verification via Chrome DevTools MCP
Anything the smoke test can't assert — hovering a card, opening a fullscreen overlay, a deep-linked `?project=`, reading what a description actually renders as, a Lighthouse score — is checked by driving the **Chrome DevTools MCP** tools directly (`new_page`, `evaluate_script`, `click`, `hover`, `list_console_messages`, `lighthouse_audit`, …) against a running dev server:

```bash
npx vite &   # then drive http://localhost:5173 through the MCP tools
```

`page.evaluate` is the workhorse: it returns JSON-serialisable data (computed rects, `window.spawnLog`, `PROJECTS`/`LOVES`/`LAB` contents, `getEngine().world.bodies.length`), which is far more reliable to assert on than a picture. When a script exposes data only through a lexical `const` (e.g. `LOVES`, `LAB`, `PROJECTS` — they are **not** on `window`), read it as `typeof LOVES !== "undefined" ? LOVES : null` inside `page.evaluate` (it shares the page's global scope).

For scripted/repeatable CDP work, `tools/mcp-run.mjs` + `tools/mcp-steps/*.json` and `tools/lighthouse-audit.mjs` drive the same MCP server over stdio from the shell.

### Lighthouse Audits via Chrome DevTools MCP (`tools/`)
These tools drive the **Chrome DevTools MCP** server over stdio to run Lighthouse (and arbitrary CDP/page JS) against the live dev server. They generalize the manual MCP session used for the audit-fixes work (CLS, color-contrast, landmarks, carousel a11y). The browser binary default is Helium (`/Applications/Helium.app/Contents/MacOS/Helium`) — override with `CHROME_EXEC`.

```bash
# Start vite first (npx vite), then:
node tools/lighthouse-audit.mjs --all                  # every page + project state
node tools/lighthouse-audit.mjs http://localhost:5173/archive.html
node tools/lighthouse-audit.mjs "http://localhost:5173/index.html?project=korg"
node tools/lighthouse-audit.mjs --all --device mobile  # (not fully supported — site is desktop-only)
```

Prints a table of category scores (a11y / best-practices / seo / agentic-browsing), CLS, and failing audit titles; reports land in `/tmp/lh-out/<label>/`. The audit targets live in the `PAGES` map at the top of `tools/lighthouse-audit.mjs` — add a new project state there when adding a project.

**Generic MCP step driver** (`tools/mcp-run.mjs`): runs an ordered list of MCP tool calls from a JSON file (`tools/mcp-steps/*.json`). Useful for one-off page JS / traces that aren't Lighthouse:

```bash
node tools/mcp-run.mjs tools/mcp-steps/example.json    # new_page + evaluate_script
node tools/mcp-run.mjs tools/mcp-steps/cls-observer.json      # layout-shift observer on archive.html
node tools/mcp-run.mjs tools/mcp-steps/cls-provider.json      # layout-shift observer on ?project=rondpoint
```

Step files use the `$PAGEID` placeholder (auto-filled from the previous `new_page` call), so they never hardcode browser page ids. Every run launches a fresh browser instance; the driver only works when a *different* process spawns it (the current opencode session does not have `chrome-devtools_*` tools injected, so this stdio route is the reliable path).

> **Whitelist note:** a "controlled by automated software" banner + known-good Helium: these tools are dev-only and not part of `npm test`/CI.

---

## Git Workflow

- **Main branch:** `main` (deployment branch)
- **Feature branches:** Active branching (e.g., `dynamic-projects`, `threejs`, `feature/mini-matter-world`)
- **No git hooks** (no husky, no lint-staged)
- **`.gitignore`:** `.idea/`, `node_modules/`, `.DS_Store`, `opencode.json`, `session-ses_fd59.md`

---

## SEO & Metadata

**Minimal.** Only a `<title>` tag and favicon, plus a `robots.txt` (crawl text freely; `/assets/` + media extensions disallowed — the artwork/video is All Rights Reserved). No meta description, no Open Graph tags, no Twitter Cards, no structured data, no sitemap.

---

## Known Quirks & Things to Watch

1. **Dual Matter.js versions:** npm has `0.20.0`, CDN loads `0.19.0`. The runtime uses CDN. The npm copy is for IDE tooling only.
2. **`jsconfig.json` has `"jsx": "react-jsx"`** but this is NOT a React project — it's just an editor hint.
3. **Typewriter effect was removed (Sept 2026).** It was a render-blocking, unused CDN `<script>` in `<head>` (plus a 302 redirect on every load).
4. **`aboutme.html` is empty** — stub page with no content.
5. **`opencode.json` is gitignored** — contains local Figma MCP server config.
6. **Global scope coupling** — scripts depend on each other via global functions. Changing function names requires updating all callers.
7. **`#physic` canvas** uses `position: fixed` with `z-index: 3` — can overlay other content.
8. **Project views** use inline style manipulation extensively (background colors, display toggling).
9. **`assets/video/timeline1.webm` is 97 MB** (Between Worlds). It is `Range`-requested so it is *not* in the initial page weight, but playback pulls the whole file. It should be re-encoded (VP9 `libvpx-vp9 -crf 34 -b:v 0 -row-mt 1`) — note `ffmpeg` is currently broken on this machine (`libx265.216.dylib` missing), which is why it hasn't been done.
10. **`favico.png` was 3.96 MB** (1473×1925 PNG) and is the icon every page requests. Resized to 73×96 / 15.9 KB in Sept 2026 — keep favicons small.
11. **A pre-existing WebGL warning** fires on the Korg 3D viewer: `GL_INVALID_OPERATION: glDrawElements: Feedback loop formed between Framebuffer and active Texture` (256×/load). Verified it also happens on `HEAD`'s `main.js` and only under headless SwiftShader, so it is most likely a software-GL artifact — confirm on real hardware before chasing it.
12. **Unreferenced assets left on disk** (delete once you're sure): `assets/2d/tabac.webp`, `assets/2d/aboutme.webp` (their objects are gone), `assets/2d/loves/zed.icns`, `assets/2d/portfolio.png`, `assets/2d/image.png`, `assets/2d/archive-mockup.svg`, `assets/2d/project-korg-mockup.svg`. `.git/` is 361 MB and `assets/` 122 MB.
13. **`loves.js` / `lab.js` sprite scaling assumes 2048×2048 sources** but the real files are 601×262 → 1068×534, so the drawn media and its traced hitbox don't match. Deliberately left alone for now.
14. **Every page is `lang="en"`** and all prose is English (except the French `premierjour` title); `lang` was wrong (`fr`) until Sept 2026.

---

## Quick Reference: Adding a New Project

1. Add entry to `PROJECTS` in `script/projects.js` (with title, text, bg, media, images)
2. Add matching object config to `OBJECT_CONFIG` in `script/objects.js` (with Matter.js body + sprite)
3. Add sprite image to `assets/2d/`
4. Add media assets to appropriate `assets/` subfolder
5. The controller (`projects-controller.js`) will automatically handle rendering, media dispatch, and transitions

## Quick Reference: Adding a WIP Piece to lab/

Add one entry to `LAB.objects` in `script/lab.js` (title, desc, `media: { type: "image"|"video", src }`, optional `trace` image for the silhouette hitbox, optional `poster` for a video, `color` for the placeholder tile, `size` for relative scale). No other file needs to change — the world, hover card, and fullscreen view pick it up automatically.

---

*Last updated: September 2026*
