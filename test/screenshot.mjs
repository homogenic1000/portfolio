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
      await page.waitForTimeout(2600);
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

    // Report the expected spawn point (bag center / opening), matching what
    // the app's computeSpawnPoint() returns, so agents can verify objects
    // spawn inside the bag.
    const spawnPos = await page
      .evaluate(() => {
        const bag = document.getElementById("animation-bag");
        if (!bag) return null;
        const r = bag.getBoundingClientRect();
        return {
          x: Math.round(r.left + r.width / 2),
          y: Math.round(r.top + r.height * 0.5),
          bagLeft: Math.round(r.left),
          bagTop: Math.round(r.top),
          bagRight: Math.round(r.right),
          bagBottom: Math.round(r.bottom),
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
      spawn: spawnPos,
      title: { ...titlePos, vh: vp.height },
      errors,
    };
    console.log(JSON.stringify(status));

    if (!hasBag || !spawned || errors.length) {
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
