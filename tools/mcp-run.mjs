// tools/mcp-run.mjs — generic Chrome DevTools MCP driver (stdio)
//
// Sequence-driven helper that spawns the chrome-devtools-mcp server, drives
// it over stdio, and runs a list of tool calls described by a JSON "steps"
// file. The browser is launched fresh on every run (Helium here).
//
// Step files live in tools/mcp-steps/ (plain JSON arrays). Steps run in order:
//
//   { "name": "new_page",  "arguments": { "url": "..." } }
//   { "name": "lighthouse_audit", "arguments": { ... } }
//   { "name": "evaluate_script", "arguments": { ... } }
//
// Because every phone starts blank, page ids come from the new_page response:
// put the placeholder `$PAGEID` and it is replaced with the id reported by
// the previous new_page call (or `1` for the pristine about:blank page).
//
// Usage:
//   node tools/mcp-run.mjs [steps.json]           # default tools/mcp-steps/example.json
//
// Env:
//   CHROME_EXEC   browser binary (default /Applications/Helium.app/.../Helium)
//   MCP_STEPS     steps file, alternative to positional arg

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const execPath =
  process.env.CHROME_EXEC ||
  "/Applications/Helium.app/Contents/MacOS/Helium";

const stepsArg =
  process.argv[2] ||
  process.env.MCP_STEPS ||
  resolve(import.meta.dirname, "mcp-steps/example.json");

const steps = JSON.parse(readFileSync(stepsArg, "utf8"));

const mcp = spawn(
  "npx",
  ["-y", "chrome-devtools-mcp@latest", `--executable-path=${execPath}`, "--filesystem-root=/tmp"],
  { stdio: ["pipe", "pipe", "inherit"] }
);

let buf = "";
let id = 0;
const pending = new Map();
let lastNewPageId = 1;

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
  clientInfo: { name: "mcp-run", version: "1" },
});

for (const step of steps) {
  const args = { ...(step.arguments ?? {}) };

  // Resolve $PAGEID placeholders so step files don't hardcode browser ids.
  for (const key of Object.keys(args)) {
    if (typeof args[key] === "string") {
      args[key] = args[key].replaceAll("$PAGEID", String(lastNewPageId));
    }
    // The MCP schema expects a numeric pageId, not the string placeholder.
    if (key === "pageId") args[key] = Number(args[key]);
  }

  const res = await send("tools/call", { name: step.name, arguments: args });
  const text = res?.result?.content?.find((c) => c.type === "text")?.text ?? "";
  const other = res?.result?.content?.filter((c) => c.type !== "text") ?? [];

  console.log(`\n=== ${step.name} ${JSON.stringify(step.arguments ?? {})} ===`);
  if (text) console.log(text);
  for (const o of other) {
    if (o.type === "image") console.log(`[image ${o.mimeType} ${o.data.length} chars]`);
    else console.log(JSON.stringify(o).slice(0, 2000));
  }
  if (res?.error) console.log("ERROR:", JSON.stringify(res.error));

  // Remember the id created by new_page. Response looks like:
  //   ## Pages
  //   1: about:blank
  //   2: Index — Mathéo Delessert (http://...) [selected]
  if (step.name === "new_page") {
    const ids = [...text.matchAll(/^\s*(\d+):/gm)].map((m) => Number(m[1]));
    if (ids.length) lastNewPageId = Math.max(...ids);
  }
}

mcp.kill();
process.exit(0);
