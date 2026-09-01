const TRACE = {
  SAMPLE: 220,
  ALPHA_THRESHOLD: 32,
  EPSILON: 0.6,
  MAX_POINTS: 120,
};

function traceSpriteVertices(src, opts) {
  const opt = Object.assign({}, TRACE, opts || {});
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, opt.SAMPLE / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d", { willReadFrequently: true });
        g.drawImage(img, 0, 0, w, h);
        const px = g.getImageData(0, 0, w, h).data;
        const mask = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i += 1) {
          mask[i] = px[i * 4 + 3] > opt.ALPHA_THRESHOLD ? 1 : 0;
        }
        const k = 1 / scale;
        const islands = [];
        for (const chain of extractOutlines(mask, w, h)) {
          const simplified = simplifyChain(chain, opt.EPSILON);
          const pts = [];
          for (const p of simplified) {
            const prev = pts.length ? pts[pts.length - 1] : null;
            if (prev && Math.hypot(p.x - prev.x, p.y - prev.y) < 1e-6) continue;
            pts.push({ x: (p.x + 0.5) * k, y: (p.y + 0.5) * k });
          }
          while (pts.length > 3 && Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 1e-6) {
            pts.pop();
          }
          if (pts.length >= 3 && polygonArea(pts) > 1) islands.push(pts);
        }
        resolve(islands.length ? { img, islands } : null);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function extractOutlines(mask, w, h) {
  const pw = w + 2;
  const ph = h + 2;
  const pm = new Uint8Array(pw * ph);
  const pl = new Int32Array(pw * ph);
  for (let y = 0; y < h; y += 1) {
    const sy = (y + 1) * pw + 1;
    const dy = y * w;
    for (let x = 0; x < w; x += 1) pm[sy + x] = mask[dy + x];
  }
  const islands = connectedIslands(pm, pl, pw, ph);
  const chains = [];
  for (let cid = 1; cid <= islands; cid += 1) {
    const start = findStart(pm, pl, cid, pw, ph);
    if (!start) continue;
    const chain = mooreTrace(pm, pl, cid, start.x, start.y, pw, ph);
    if (chain.length < 3) continue;
    const out = [];
    for (const p of chain) out.push({ x: p.x - 1, y: p.y - 1 });
    chains.push(out);
  }
  return chains;
}

function connectedIslands(mask, label, w, h) {
  let next = 0;
  const queue = new Int32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (mask[i] !== 1 || label[i] !== 0) continue;
      next += 1;
      let qs = 0;
      let qe = 1;
      queue[0] = i;
      label[i] = next;
      while (qs < qe) {
        const cur = queue[qs];
        qs += 1;
        const cx = cur % w;
        const cy = (cur / w) | 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const ni = ny * w + nx;
            if (mask[ni] === 1 && label[ni] === 0) {
              label[ni] = next;
              queue[qe] = ni;
              qe += 1;
            }
          }
        }
      }
    }
  }
  return next;
}

function findStart(mask, label, cid, w, h) {
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (mask[i] === 1 && label[i] === cid && isBoundary(mask, label, cid, x, y, w, h)) {
        return { x, y };
      }
    }
  }
  return null;
}

function isBoundary(mask, label, cid, x, y, w, h) {
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      if (mask[(y + dy) * w + (x + dx)] !== 1 || label[(y + dy) * w + (x + dx)] !== cid) return true;
    }
  }
  return false;
}

const MOORE_DX = [1, 1, 0, -1, -1, -1, 0, 1];
const MOORE_DY = [0, 1, 1, 1, 0, -1, -1, -1];

function mooreTrace(mask, label, cid, sx, sy, w, h) {
  let bx = sx;
  let by = sy;
  let cx = sx - 1;
  let cy = sy;
  const initCx = cx;
  const initCy = cy;
  const chain = [];
  let guard = 0;
  const guardMax = w * h * 16;
  while (guard < guardMax) {
    guard += 1;
    chain.push({ x: bx, y: by });
    let d = 0;
    for (let i = 0; i < 8; i += 1) {
      if (MOORE_DX[i] === cx - bx && MOORE_DY[i] === cy - by) {
        d = i;
        break;
      }
    }
    let found = null;
    for (let k = 0; k < 8; k += 1) {
      const nd = (d + k) & 7;
      const nx = bx + MOORE_DX[nd];
      const ny = by + MOORE_DY[nd];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const ni = ny * w + nx;
      if (mask[ni] === 1 && label[ni] === cid) {
        found = { x: nx, y: ny };
        const pd = (d + k - 1 + 8) & 7;
        cx = bx + MOORE_DX[pd];
        cy = by + MOORE_DY[pd];
        break;
      }
    }
    if (!found) break;
    bx = found.x;
    by = found.y;
    if (bx === sx && by === sy && cx === initCx && cy === initCy) break;
  }
  return chain;
}

function simplifyChain(chain, eps) {
  if (chain.length < 4) return chain.slice();
  const stack = [[0, chain.length - 1]];
  const keep = new Array(chain.length).fill(false);
  keep[0] = true;
  keep[chain.length - 1] = true;
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    let dmax = 0;
    let imax = -1;
    for (let i = a + 1; i < b; i += 1) {
      const d = pointSegDist(chain[i], chain[a], chain[b]);
      if (d > dmax) {
        dmax = d;
        imax = i;
      }
    }
    if (imax > 0 && dmax > eps) {
      keep[imax] = true;
      stack.push([a, imax], [imax, b]);
    }
  }
  const out = [];
  for (let i = 0; i < chain.length; i += 1) {
    if (keep[i]) out.push(chain[i]);
  }
  if (out.length > TRACE.MAX_POINTS) {
    const stride = Math.ceil(out.length / TRACE.MAX_POINTS);
    const reduced = [];
    for (let i = 0; i < out.length; i += stride) reduced.push(out[i]);
    reduced.push(out[out.length - 1]);
    return reduced;
  }
  return out;
}

function pointSegDist(p, a, b) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
}

function polygonArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}