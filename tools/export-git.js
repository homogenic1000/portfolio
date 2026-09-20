// export-git.js — CI-only exporter for git.html (never shipped).
// Walks the full history of every branch and writes a compact JSON snapshot
// that script/gitgraph.js renders as a network graph.
//
// Run: node tools/export-git.js  (in the repo root, after git checkout)
// Output: assets/git/commits.json

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function run(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  }).trim();
}

const RS = "\x1e"; // record separator
const US = "\x1f"; // field separator

// %H full sha | %P parents (space-separated, first = first parent) | %s subject
// %an author name | %aI author ISO date | %D ref names (tips only)
const raw = run([
  "log",
  "--all",
  "--date-order",
  "--pretty=format:%x1e%H%x1f%P%x1f%s%x1f%an%x1f%aI%x1f%D",
  "--no-color",
]);

const commits = raw
  .split(RS)
  .map((rec) => rec.trim())
  .filter(Boolean)
  .map((rec) => {
    const [sha, parents, subject, author, dateIso, refs] = rec.split(US);
    return {
      sha,
      short: sha.slice(0, 7),
      parents: parents ? parents.split(" ") : [],
      subject: subject || "",
      author: author || "",
      date: dateIso || "",
      refs: refs
        ? refs
            .split(", ")
            .map((r) => r.replace(/^HEAD -> /, ""))
            .map((r) => r.replace(/^origin\//, ""))
            .filter((r) => !r.startsWith("tag: ") && !r.startsWith("refs/"))
        : [],
    };
  });

// Branch tips (for lane coloring / "on branch" tooltips), from the most recent
// commit reachable by each local branch.
const branchLines = run([
  "for-each-ref",
  "--format=%(refname:short)%00%(objectname)",
  "refs/heads",
])
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => {
    const [name, sha] = l.split("\0");
    return { name, sha };
  });

const refs = {};
for (const b of branchLines) {
  refs[b.name] = b.sha;
}

// Newest commit overall (for the real-time "new commits" check on the client).
const newest = commits.reduce(
  (acc, c) => (c.date > acc.date ? c : acc),
  { date: "" }
);

const out = {
  exported_at: new Date().toISOString(),
  count: commits.length,
  repo: "homogenic1000/portfolio",
  newest: { sha: newest.sha, short: newest.short, date: newest.date },
  commits,
  refs,
};

const dir = path.join(__dirname, "..", "assets", "git");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "commits.json"), JSON.stringify(out), "utf8");
console.log("wrote assets/git/commits.json —", commits.length, "commits,", Object.keys(refs).length, "refs");