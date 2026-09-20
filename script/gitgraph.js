/* gitgraph.js — full network graph for git.html
   Reads assets/git/commits.json (exported by CI in .github/workflows),
   lays out a fork/merge lane graph, renders it as SVG + an HTML text
   column, polls GitHub for brand-new commits, and renders README.md in
   the sidebar. Vanilla JS, no deps. */

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const REPO = "homogenic1000/portfolio";
  const ROW = 24;
  const COL = 26;
  const DOT = 4.5;
  const API = "https://api.github.com/repos/" + REPO + "/commits?per_page=1";

  const el = (id) => document.getElementById(id);
  const fmtDate = (iso) => {
    if (!iso) return "";
    return iso.slice(0, 10);
  };
  const fmtDateTime = (iso) => {
    if (!iso) return "";
    return iso.replace("T", " ").slice(0, 16);
  };

  /* ------------------------------------------------------------------
     Layout — free-lane reuse ("railroad") algorithm.
     Each column holds the sha a bar is currently heading toward
     (`null` = free). A commit takes the leftmost lane waiting for it,
     other waiting lanes converge and free their columns, the first
     parent continues the node's column, and merge parents claim the
     leftmost free column (or join one already running). Columns are
     reused, so the graph stays tight. `mainTip` (refs.main) is pinned
     to column 0 so the trunk line is always on the left.
  ------------------------------------------------------------------ */
  function layout(commits, mainTip) {
    const bySha = new Map(commits.map((c) => [c.sha, c]));
    const pinSha = mainTip && bySha.has(mainTip) ? mainTip : commits[0] && commits[0].sha;

    const lanes = []; // target sha per column, null = free
    const colOpen = []; // a bar is currently running in this column
    const colStart = []; // row where the open bar started
    const colOf = new Map();
    const bars = []; // { col, segments: [[start,end], ...] }
    const runs = []; // { row, col, pcol } horizontal fork/merge connector
    let maxCol = 0;

    const touch = (col) => { if (col > maxCol) maxCol = col; };
    const freeSlot = () => {
      const i = lanes.indexOf(null);
      if (i !== -1) return i;
      lanes.push(null); colOpen.push(false); colStart.push(0);
      return lanes.length - 1;
    };
    const openBar = (col, row) => {
      if (!colOpen[col]) { colOpen[col] = true; colStart[col] = row; }
    };
    const closeBar = (col, row) => {
      if (colOpen[col]) {
        colOpen[col] = false;
        bars.push({ col, segments: [[colStart[col], row]] });
      }
    };
    const wait = (col, sha, row) => {
      lanes[col] = sha;
      openBar(col, row);
    };

    if (pinSha) { lanes[0] = pinSha; }

    for (let i = 0; i < commits.length; i++) {
      const c = commits[i];

      // leftmost lane waiting for this commit = its node column
      let nodeCol = -1;
      const waiting = [];
      for (let j = 0; j < lanes.length; j++) {
        if (lanes[j] === c.sha) {
          if (nodeCol === -1) nodeCol = j;
          waiting.push(j);
        }
      }
      if (nodeCol === -1) nodeCol = freeSlot();
      touch(nodeCol);
      colOf.set(c.sha, nodeCol);

      // convergence — other lanes waiting for this commit join at this row
      for (const j of waiting) {
        if (j !== nodeCol) {
          lanes[j] = null;
          closeBar(j, i);
          runs.push({ row: i, col: j, pcol: nodeCol });
        }
      }

      const p0 = c.parents[0];
      if (!p0) {
        lanes[nodeCol] = null;
        closeBar(nodeCol, i);
      } else {
        wait(nodeCol, p0, i); // first parent continues the node's column
      }

      // merge parents — each extra parent gets its own column (or joins one already running)
      for (const p of c.parents.slice(1)) {
        const e = lanes.indexOf(p);
        if (e !== -1) {
          if (e !== nodeCol) { touch(e); runs.push({ row: i, col: nodeCol, pcol: e }); }
          continue;
        }
        const s = freeSlot();
        touch(s);
        wait(s, p, i);
        runs.push({ row: i, col: nodeCol, pcol: s });
      }

      // trim free trailing columns so the lane count stays tight
      while (lanes.length && lanes[lanes.length - 1] === null) {
        lanes.pop(); colOpen.pop(); colStart.pop();
      }
    }

    // close any bars still running to the graph's bottom edge
    const last = commits.length - 1;
    for (let j = 0; j < colOpen.length; j++) if (colOpen[j]) closeBar(j, last);

    const enriched = commits.map((c, i) => ({ ...c, row: i, col: colOf.get(c.sha) ?? 0 }));
    return {
      bySha: new Map(enriched.map((c) => [c.sha, c])),
      colOf,
      bars,
      runs,
      maxCol,
      commits: enriched,
    };
  }

  /* ------------------------------------------------------------------
     Render — SVG lanes + HTML message/date columns
  ------------------------------------------------------------------ */
  function render(graph, data) {
    const out = el("git-graph");
    const lanesArea = el("lanes");
    if (!out) return;

    const n = graph.commits.length;
    const lanesW = (graph.maxCol + 1) * COL || COL;
    const H = n * ROW;

    out.style.gridTemplateColumns = lanesW + "px minmax(0,1fr) auto auto auto";
    out.style.gridAutoRows = ROW + "px";

    // main-branch lane = lane of the ref tip for `main` / newest commit
    const mainSha = (data.refs && data.refs.main) || data.newest.sha;
    const mainCol = graph.colOf.get(mainSha) ?? 0;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("id", "lanes-svg");
    svg.setAttribute("width", lanesW);
    svg.setAttribute("height", H);
    svg.setAttribute("xmlns", SVG_NS);

    const X = (col) => col * COL + COL / 2;
    const Y = (row) => row * ROW + ROW / 2;

    // lane bars — vertical runs per column (columns are reused, so a
    // bar can hold many segments)
    for (const b of graph.bars) {
      const color = b.col === mainCol ? "#0000ff" : "#d9d9d9";
      for (const [s, e] of b.segments) {
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", X(b.col));
        line.setAttribute("x2", X(b.col));
        line.setAttribute("y1", Y(s));
        line.setAttribute("y2", Y(e));
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", s === e ? 0 : 2);
        svg.appendChild(line);
      }
    }

    // orthogonal connectors — horizontal runs drawn at the exact fork
    // (convergence of a branch into its shared parent) and merge
    // (divergence of an extra parent) rows, bridging the columns
    for (const r of graph.runs) {
      if (r.col === r.pcol) continue;
      const run = document.createElementNS(SVG_NS, "line");
      run.setAttribute("x1", X(r.col));
      run.setAttribute("x2", X(r.pcol));
      run.setAttribute("y1", Y(r.row));
      run.setAttribute("y2", Y(r.row));
      run.setAttribute("stroke", "#d9d9d9");
      run.setAttribute("stroke-width", 2);
      run.setAttribute("data-kind", "run");
      run.setAttribute("data-row", r.row);
      run.setAttribute("data-col", r.col);
      run.setAttribute("data-pcol", r.pcol);
      svg.appendChild(run);
    }

    // commit dots
    const dotG = document.createElementNS(SVG_NS, "g");
    for (const c of graph.commits) {
      const isMain = c.col === mainCol;
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", X(c.col));
      circle.setAttribute("cy", Y(c.row));
      circle.setAttribute("r", isMain ? DOT + 1 : DOT);
      circle.setAttribute("fill", isMain ? "#0000ff" : "#000000");
      circle.setAttribute("data-sha", c.short);
      circle.setAttribute("data-subject", c.subject);
      circle.setAttribute("style", "cursor:pointer");
      circle.addEventListener("click", () => {
        window.open("https://github.com/" + REPO + "/commit/" + c.sha, "_blank");
      });
      dotG.appendChild(circle);
    }
    svg.appendChild(dotG);

    lanesArea.appendChild(svg);

    // text columns — one grid cell per column, all on row c.row+1
    const rowProps = (c, n) => {
      const el2 = document.createElement("div");
      el2.className = "gc";
      el2.style.gridColumn = n;
      el2.style.gridRow = c.row + 1;
      return el2;
    };

    for (const c of graph.commits) {
      const fullTitle = c.subject + "\n" + c.short + " · " + (c.author || "") + " · " + fmtDateTime(c.date);

      const subjCell = rowProps(c, 2);
      subjCell.classList.add("gc-subject");
      subjCell.title = fullTitle;
      const refs = (c.refs || []).filter((v, i, a) => a.indexOf(v) === i);
      for (const r of refs.slice(0, 3)) {
        const tag = document.createElement("span");
        tag.className = "ref-tag";
        tag.textContent = r;
        subjCell.appendChild(tag);
      }
      if (refs.length > 3) {
        const more = document.createElement("span");
        more.className = "ref-tag ref-more";
        more.textContent = "+" + (refs.length - 3);
        subjCell.appendChild(more);
      }
      const subject = document.createElement("span");
      subject.className = "subject";
      subject.textContent = c.subject;
      subjCell.appendChild(subject);
      out.appendChild(subjCell);

      const authorCell = rowProps(c, 3);
      authorCell.classList.add("gc-author");
      authorCell.textContent = c.author || "unknown";
      authorCell.title = fullTitle;
      out.appendChild(authorCell);

      const dateCell = rowProps(c, 4);
      dateCell.classList.add("gc-date");
      dateCell.textContent = fmtDate(c.date);
      dateCell.title = fmtDateTime(c.date);
      out.appendChild(dateCell);

      const hashCell = rowProps(c, 5);
      hashCell.classList.add("gc-hash");
      const link = document.createElement("a");
      link.href = "https://github.com/" + REPO + "/commit/" + c.sha;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = c.short;
      link.title = fullTitle;
      hashCell.appendChild(link);
      out.appendChild(hashCell);
    }

    // meta line
    const meta = el("graph-meta");
    if (meta) {
      meta.innerHTML = "";
      const mainCommit = data.refs && data.refs.main && graph.bySha.get(data.refs.main);
      const rb = (t, n) => {
        const s = document.createElement("span");
        s.innerHTML = "<b>" + n + "</b> " + t;
        meta.appendChild(s);
      };
      rb("commits", n);
      rb("branches", Object.keys(data.refs || {}).length);
      rb("main @ " + (mainCommit ? mainCommit.short : "—"), "");
    }

    return { svg, n };
  }

  /* ------------------------------------------------------------------
     README.md → minimal HTML (only constructs the README uses)
  ------------------------------------------------------------------ */
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(s) {
    let out = s;
    // inline images ![alt](src)
    out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="md-img" alt="$1" loading="lazy" src="$2">');
    // links [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="md-link" href="$2" target="_blank" rel="noopener">$1</a>');
    // bold
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return out;
  }

  function mdToHtml(md) {
    const lines = md.replace(/\r/g, "").split("\n");
    const html = [];
    let buf = [];
    const flush = () => {
      if (buf.length) {
        html.push("<p>" + buf.map(inline).join("<br>") + "</p>");
        buf = [];
      }
    };
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) { flush(); continue; }
      if (/^#\s+/.test(line)) {
        flush();
        html.push("<h1>" + inline(line.replace(/^#\s+/, "")) + "</h1>");
      } else if (/^##\s+/.test(line)) {
        flush();
        html.push("<h2>" + inline(line.replace(/^##\s+/, "")) + "</h2>");
      } else if (/^>\s?/.test(line)) {
        flush();
        html.push("<blockquote>" + inline(line.replace(/^>\s?/, "")) + "</blockquote>");
      } else if (/^[-*]\s+/.test(line)) {
        flush();
        html.push("<li>" + inline(line.replace(/^[-*]\s+/, "")) + "</li>");
      } else {
        buf.push(raw);
      }
    }
    flush();
    return html.join("\n");
  }

  /* ------------------------------------------------------------------
     Real-time refresh — poll GitHub for commits newer than the snapshot
     and auto-reload once per new tip so the graph stays live
     (no footer chip). Reloads are tracked in sessionStorage by sha so
     we never loop while the deployed snapshot lags a push.
  ------------------------------------------------------------------ */
  function initRefresh(newest) {
    const latest = newest || null;
    let done = false;

    const reloadKey = "git-auto-reload-sha";
    const lastReloadedSha = () => {
      try { return sessionStorage.getItem(reloadKey) || null; } catch (e) { return null; }
    };
    const markReloaded = (sha) => {
      try { sessionStorage.setItem(reloadKey, sha); } catch (e) { /* ignore */ }
    };

    async function check() {
      if (done || document.hidden) return;
      try {
        const r = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
        if (!r.ok) return;
        const list = await r.json();
        const sha = list && list[0] && list[0].sha;
        if (sha && latest && sha !== latest.sha && sha !== lastReloadedSha()) {
          done = true;
          markReloaded(sha);
          location.reload();
        }
      } catch (e) {
        /* offline — ignore */
      }
    }
    check();
    setInterval(check, 60000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) check();
    });
  }

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  async function boot() {
    const root = el("git-graph");
    const errBox = el("graph-error");
    if (!root) return;

    try {
      const res = await fetch("assets/git/commits.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      window.__GIT_DATA = data;

      const commits = data.commits || [];
      if (!commits.length) throw new Error("empty history");

      const graph = layout(commits, data.refs && data.refs.main);
      render(graph, data);

      initRefresh(data.newest || null);

      const readme = el("readme-content");
      if (readme) {
        try {
          const r = await fetch("README.md", { cache: "no-store" });
          if (r.ok) readme.innerHTML = mdToHtml(await r.text());
          else readme.innerHTML = '<p class="muted">readme.md unavailable (HTTP ' + r.status + ")</p>";
        } catch (e) {
          readme.innerHTML = '<p class="muted">readme.md unavailable</p>';
        }
      }
    } catch (e) {
      errBox.hidden = false;
      root.hidden = true;
      const msg = el("graph-error-detail");
      if (msg)
        msg.textContent =
          "could not load git history — run `node tools/export-git.js` locally or push to deploy (" +
          e.message +
          ")";
    }
  }

  boot();
})();