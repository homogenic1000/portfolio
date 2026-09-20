// archive.js - Rend la page Index (archive.html) depuis PROJECTS :
// noms, types, dates et couleurs de survol sont générés depuis la config.
// La seule source de vérité pour les projets "réels" est script/projects.js.

(function renderArchive() {
  const mount = document.getElementById("archive-index");
  if (!mount || typeof PROJECTS === "undefined") return;

  // Ordre d'affichage (défini par le design).
  // Entrée avec `id`         → projet réel lu depuis PROJECTS.
  // Entrée sans `id`         → rangée "extra" (pas encore de projet) :
  //    avec `href`/`color`   → lien cliquable (survol teinté),
  //    avec `disabled`       → rangée inerte grisée.
  const ROWS = [
    { id: "rondpoint" },
    { id: "vroomvroom" },
    { id: "betweenworlds" },
    { id: "eracom" },
    {
      id: "premierjour",
      type: "photographie",
      date: "2025",
    },
    {
      name: "the portfolio ",
      type: "webdesign/dev",
      date: "2025 → 2026",
      href: "git.html",
      color: "#0969da",
      sprite: "assets/2d/portfolio.webp",
    },
    { id: "korg" },
  ];

  const mk = (cls, text) => {
    const s = document.createElement("span");
    if (cls) s.className = cls;
    s.textContent = text;
    return s;
  };

  const num = (i) => String(i + 1).padStart(2, "0");

  ROWS.forEach((rowDef, i) => {
    const cfg = rowDef.id ? PROJECTS[rowDef.id] : null;

    const isDisabled = rowDef.disabled || (rowDef.id && !cfg);
    const row = document.createElement(isDisabled ? "div" : "a");
    row.className = "row" + (isDisabled ? " disabled" : "");

    if (!isDisabled) {
      const href = rowDef.href ||
        "index.html?project=" + encodeURIComponent(rowDef.id);
      row.href = href;
      const color = rowDef.color || (cfg && cfg.color);
      if (color) row.style.setProperty("--project-color", color);
      const sprite = (cfg && cfg.sprite) || rowDef.sprite;
      if (sprite) row.dataset.sprite = sprite;
    }

    row.appendChild(mk(null, num(i)));
    row.appendChild(mk("row-name", (cfg && (cfg.label || cfg.title)) || rowDef.name));
    row.appendChild(mk("row-type", (cfg && cfg.type) || rowDef.type));
    row.appendChild(mk("row-date", (cfg && cfg.date) || rowDef.date));

    mount.appendChild(row);
  });
})();