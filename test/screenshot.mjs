// test/screenshot.mjs
// Headless-browser saut test for the portfolio.
// Usage:
//   npm test                       # runs the default viewport suite
//   npm test -- --url http://...   # use a custom URL (otherwise vite dev server)
//   npm test -- --port 5173
//
// Defaults to testing 3 viewports and capturing: a full-page screenshot, the
// console errors, and whether the hero/bag is present. Screenshots are written
// to test/screenshots/<name>.png. On failure it exits non-zero.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const port = argValue(args, "--port") || "5173";
let url = argValue(args, "--url");
let vite = null;

const VIEWPORTS = [
  { name: "14inch", width: 1512, height: 982 },
  { name: "27inch", width: 2560, height: 1440 },
  { name: "medium", width: 1024, height: 768 },
];

function argValue(argv, flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

// Wait for the bag to be interactable (animation + physics init may be async).
async function settle(page) {
  await page.waitForSelector("#animation-bag", { timeout: 15000 });
}

async function main() {
  if (!url) {
    vite = spawn("npx", ["vite", "--port", port], {
      cwd: process.cwd(),
      stdio: "ignore",
    });
    // Give vite a moment to boot, then poll until reachable
    url = `http://localhost:${port}`;
    await waitForUrl(url);
  }

  mkdirSync("test/screenshots", { recursive: true });
  const browser = await chromium.launch();
  let failed = false;

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

    await page.goto(url, { waitUntil: "networkidle" });
    await settle(page);

    const bag = await page.locator("#animation-bag").boundingBox();
    const hasBag = !!bag;

    // Trigger the bag animation so physics objects spawn, then capture.
    let spawned = false;
    let sandwichVisible = false;
    if (hasBag) {
      await page.locator("#animation-bag").click();
      // Objects spawn staggered (one every 500ms after physics starts), so wait
      // for all 8 logged creation positions before verifying them.
      await page
        .waitForFunction(() => (window.spawnLog || []).length >= 8, null, { timeout: 12000 })
        .catch(() => {});
      const canvasCount = await page.locator("canvas").count();
      spawned = canvasCount > 0;
      sandwichVisible = await page.locator("#sandwich").isVisible();
    }

    // Report computed layout so agents can verify alignment without reading pixels.
    const bagPos = await page.locator("#animation-bag").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    });
    const sandwichPos = await page
      .locator("#sandwich")
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
      })
      .catch(() => null);

    // Verify objects spawn inside the bag's mouth (the #sandwich overlay) by
    // checking the cached spawnPoint / computeSpawnPoint() against the sandwich
    // box, plus every logged body creation position against that same box.
    const spawn = await page
      .evaluate(() => {
        const sb = document.getElementById("sandwich")?.getBoundingClientRect();
        const box = sb
          ? { left: sb.left, top: sb.top, right: sb.right, bottom: sb.bottom }
          : null;
        const p = typeof computeSpawnPoint === "function" ? computeSpawnPoint() : null;
        const inBox = (x, y) =>
          !!box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
        const log = (window.spawnLog || []).filter((e) => e && typeof e.x === "number");
        const cached = typeof spawnPoint === "object" && spawnPoint ? spawnPoint : null;
        return {
          spawnPoint: cached
            ? { x: Math.round(cached.x), y: Math.round(cached.y) }
            : null,
          computed: p ? { x: Math.round(p.x), y: Math.round(p.y) } : null,
          sandwich: box
            ? { left: Math.round(box.left), top: Math.round(box.top), right: Math.round(box.right), bottom: Math.round(box.bottom) }
            : null,
          spawnInSandwich: !!p && inBox(p.x, p.y),
          logCount: log.length,
          logAllInSandwich: log.length > 0 && log.every((e) => inBox(e.x, e.y)),
        };
      })
      .catch(() => null);

    const shot = `test/screenshots/${vp.name}.png`;
    await page.screenshot({ path: shot, fullPage: true });

    const titlePos = await page
      .locator("#title-d")
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
      })
      .catch(() => null);

    const status = {
      viewport: `${vp.width}x${vp.height}`,
      bagVisible: hasBag,
      physicsCanvasPresent: spawned,
      sandwichVisible,
      bag: bagPos,
      sandwich: sandwichPos,
      spawn,
      title: { ...titlePos, vh: vp.height },
      errors,
    };
    console.log(JSON.stringify(status));

    if (
      !hasBag ||
      !spawned ||
      errors.length ||
      !spawn ||
      !spawn.spawnInSandwich ||
      !spawn.logAllInSandwich
    ) {
      failed = true;
    }
    await page.close();
  }

  // ---- lab.html pass: floating WIP world + fullscreen click -----------------
  // Separate loop: navs to /lab.html and verifies the world spawned bodies and
  // that clicking a piece opens the fullscreen overlay, with no console errors.
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

    await page.goto(url + "/lab.html", { waitUntil: "load" });
    await page.waitForSelector("#lab-world canvas", { timeout: 15000 });
    await page.waitForTimeout(600);

    const world = await page.evaluate(() => {
      const bodies = window.labEngine
        ? labEngine.world.bodies.filter((b) => window.labInfo && labInfo.has(b))
        : [];
      return { spawned: bodies.length, pieces: (window.labInfo || {}).size || 0 };
    });

    const clickable = await page.evaluate(() => {
      const canvas = document.querySelector("#lab-world canvas");
      if (!canvas || !window.labEngine) return false;
      const rect = canvas.getBoundingClientRect();
      const b = labEngine.world.bodies.find((x) => window.labInfo.has(x));
      if (!b) return false;
      const x = rect.left + b.position.x;
      const y = rect.top + b.position.y;
      canvas.dispatchEvent(new MouseEvent("mousedown", { clientX: x, clientY: y, bubbles: true }));
      canvas.dispatchEvent(new MouseEvent("mouseup", { clientX: x, clientY: y, bubbles: true }));
      return true;
    });
    await page.waitForTimeout(150);
    const fs = await page
      .evaluate(() => ({
        visible: !document.getElementById("lab-fullscreen").hidden,
        hasMedia: document.getElementById("lab-fs-media").children.length > 0,
      }))
      .catch(() => ({ visible: false, hasMedia: false }));

    const shot = `test/screenshots/lab-${vp.name}.png`;
    await page.screenshot({ path: shot, fullPage: true });

    const status = {
      viewport: `lab ${vp.width}x${vp.height}`,
      worldSpawned: world.spawned,
      pieces: world.pieces,
      clickDispatched: clickable,
      fullscreen: fs,
      errors,
    };
    console.log(JSON.stringify(status));

    if (errors.length || world.spawned < 1 || !clickable || !fs.visible || !fs.hasMedia) {
      failed = true;
    }
    await page.close();
  }

  await browser.close();
  if (vite) vite.kill();
  process.exit(failed ? 1 : 0);
}

async function waitForUrl(u, retries = 40) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(u);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("vite dev server did not start in time");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
