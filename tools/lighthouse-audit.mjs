// tools/lighthouse-audit.mjs — run Lighthouse against one or more URLs
// and summarize the results (category scores + failing audits).
//
// Reuses the same Chrome DevTools MCP stdio driver as mcp-run.mjs, but
// exposes a simple "give it URLs, get a table" interface:
//
//   node tools/lighthouse-audit.mjs http://localhost:5173/archive.html \
//       "http://localhost:5173/index.html?project=korg"
//
//   node tools/lighthouse-audit.mjs --all        # audits every page + state
//
// Options:
//   --device desktop|mobile   (default desktop)
//   --out <dir>               report output dir (default /tmp/lh-out)
//   --keep                    don't clean the output dir between runs
//
// Env: CHROME_EXEC (browser binary), default = Helium.

import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const execPath =
  process.env.CHROME_EXEC ||
  "/Applications/Helium.app/Contents/MacOS/Helium";

const port = process.env.PORT || "5173";
const base = `http://localhost:${port}`;

const PAGES = {
  index: `${base}/index.html`,
  archive: `${base}/archive.html`,
  lab: `${base}/lab.html`,
  git: `${base}/git.html`,
  korg: `${base}/index.html?project=korg`,
  rondpoint: `${base}/index.html?project=rondpoint`,
  vroomvroom: `${base}/index.html?project=vroomvroom`,
  betweenworlds: `${base}/index.html?project=betweenworlds`,
  eracom: `${base}/index.html?project=eracom`,
  premierjour: `${base}/index.html?project=premierjour`,
};

const argv = process.argv.slice(2);
const device = argv.includes("--device") ? argv[argv.indexOf("--device") + 1] : "desktop";
const outDir =
  (argv.includes("--out") ? argv[argv.indexOf("--out") + 1] : "/tmp/lh-out") ||
  "/tmp/lh-out";
const urlArgs = argv.filter((a) => a.startsWith("http"));

let targets;
if (argv.includes("--all")) {
  targets = Object.entries(PAGES);
} else if (urlArgs.length) {
  targets = urlArgs.map((u) => [url(u), u]);
} else {
  console.log("No URLs given. Usage:");
  console.log("  node tools/lighthouse-audit.mjs <url> [url...]");
  console.log("  node tools/lighthouse-audit.mjs --all");
  process.exit(1);
}

function url(u) {
  try {
    return new URL(u).pathname.split("/").pop().replace(/\..*/, "") +
      (u.includes("?project=") ? "/" + new URL(u).searchParams.get("project") : "");
  } catch {
    return u;
  }
}

if (!argv.includes("--keep")) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// --- MCP driver (same protocol as mcp-run.mjs) -----------------------------

const mcp = spawn(
  "npx",
  ["-y", "chrome-devtools-mcp@latest", `--executable-path=${execPath}`, `--filesystem-root=${outDir}`],
  { stdio: ["pipe", "pipe", "inherit"] }
);

let buf = "";
let id = 0;
const pending = new Map();

function send(method, params = {}) {
  const i = ++id;
  mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: i, method, params }) + "\n");
  return new Promise((res) => pending.set(i, res));
}

mcp.stdout.on("data", (d) => {
  buf += d.toString();
  let idx;
  while ((idx = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    } catch {}
  }
});

await send("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "lighthouse-audit", version: "1" },
});

// --- Audit each target ------------------------------------------------------

let pageId = 1;
const results = [];

for (const [label, targetUrl] of targets) {
  const newPage = await send("tools/call", {
    name: "new_page",
    arguments: { url: targetUrl, background: true },
  });
  const pageText =
    newPage?.result?.content?.find((c) => c.type === "text")?.text ?? "";
  const ids = [...pageText.matchAll(/^\s*(\d+):/gm)].map((m) => Number(m[1]));
  pageId = ids.length ? Math.max(...ids) : pageId + 1;

  const dir = `${outDir}/${label}`;
  const audit = await send("tools/call", {
    name: "lighthouse_audit",
    arguments: {
      pageId,
      mode: "navigation",
      device,
      outputDirPath: dir,
    },
  });
  const auditText =
    audit?.result?.content?.find((c) => c.type === "text")?.text ?? "";

  // Parse the report.json that lighthouse_audit writes.
  let report = null;
  try {
    report = JSON.parse(readFileSync(`${dir}/report.json`, "utf8"));
  } catch {}

  results.push({ label, targetUrl, auditText, report });
}

// --- Summarize ---------------------------------------------------------------

const widths = [12, 8, 8, 8, 8, 16];
const headers = ["page/state", "a11y", "bp", "seo", "agentic", "failures"];
const pad = (s, w) => String(s).padEnd(w);

console.log("\n" + headers.map((h, i) => pad(h, widths[i])).join("|"));
console.log(["-".repeat(12), "-".repeat(7), "-".repeat(7), "-".repeat(7), "-".repeat(9), "-".repeat(16)].join("+"));

for (const r of results) {
  const cats = r.report?.categories ?? {};
  const score = (k) =>
    cats[k] ? String(Math.round(cats[k].score * 100)) + "%" : "-";
  const failed = r.report
    ? Object.values(r.report.audits).filter(
        (a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== "notApplicable" && a.scoreDisplayMode !== "manual" && a.scoreDisplayMode !== "informative"
      )
    : [];
  const cls = r.report?.audits?.["cumulative-layout-shift"];
  const failStr = failed.length
    ? failed.map((f) => f.title).join("; ").slice(0, 60)
    : "OK";
  console.log(
    [pad(r.label, widths[0]), pad(score("accessibility"), widths[1]), pad(score("best-practices"), widths[2]), pad(score("seo"), widths[3]), pad(score("agentic-browsing"), widths[4]), pad(failStr === "OK" ? (cls ? `OK (CLS ${cls.displayValue})` : "OK") : failStr, widths[5])].join(" | ")
  );
}

console.log("\nReports in " + outDir + "/");
mcp.kill();
process.exit(0);
