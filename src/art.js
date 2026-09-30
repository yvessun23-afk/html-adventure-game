/* =====================================================================
   PIXEL-ART-SCHICHT: Ressourcen, Sprites, Hintergründe, Figuren, Text
   Logische Welt 480×270, dargestellt mit Faktor 2 auf der 960×540-Leinwand.
   spr()/drawChar() arbeiten in Leinwand-Koordinaten (x Mitte, y Unterkante),
   px()/pxEll() in logischen Pixeln.
   ===================================================================== */
const IMG = { chars: {}, bg: {}, tiles: {} };
let ASSETS_READY = false;
function loadImg(src) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(i); i.src = src; }); }
(async function loadAssets() {
  IMG.atlas = await loadImg(ASSETS.atlas); IMG.map = await loadImg(ASSETS.map); IMG.icons = await loadImg(ASSETS.icons);
  for (const k of Object.keys(ASSETS.chars)) IMG.chars[k] = await loadImg(ASSETS.chars[k]);
  for (const k of ['so', 'he', 'wi']) { IMG.bg[k] = { layers: [] }; for (const l of ASSETS.bg[k].layers) IMG.bg[k].layers.push(await loadImg(l)); IMG.bg[k].castle = await loadImg(ASSETS.bg[k].castle); }
  for (const k of Object.keys(ASSETS.tiles)) IMG.tiles[k] = await loadImg(ASSETS.tiles[k]);
  ASSETS_READY = true;
})();
ctx.imageSmoothingEnabled = false;

/* ---------- Sprites ---------- */
const SPOS = ASSETS.pos;
function sprSize(name) { const p = SPOS[name]; return p ? [p[2] * 2, p[3] * 2] : [0, 0]; }
function spr(c, name, x, y, o = {}) {
  const p = SPOS[name]; if (!p) return; const s = o.s || 2, w = p[2] * s, h = p[3] * s;
  let dx = Math.round(x - (o.ax === 'l' ? 0 : w / 2)), dy = Math.round(y - (o.ay === 't' ? 0 : h));
  c.imageSmoothingEnabled = false; if (o.a != null) c.globalAlpha = o.a;
  if (o.flip || o.rot) { c.save(); c.translate(dx + w / 2, dy + h / 2); if (o.rot) c.rotate(o.rot); if (o.flip) c.scale(-1, 1); c.drawImage(IMG.atlas, p[0], p[1], p[2], p[3], -w / 2, -h / 2, w, h); c.restore(); }
  else c.drawImage(IMG.atlas, p[0], p[1], p[2], p[3], dx, dy, w, h);
  if (o.a != null) c.globalAlpha = 1;
}
function sprR(name, x, y, pad = 0) { const [w, h] = sprSize(name); return [Math.round(x - w / 2) - pad, Math.round(y - h) - pad, w + pad * 2, h + pad * 2]; }
const sv = (base, se) => SPOS[base + '_' + se] ? base + '_' + se : base + '_so';       // jahreszeitliche Variante
const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x * 2), Math.round(y * 2), w * 2, h * 2); };
function pxEll(c, cx, cy, rx, ry, col) { for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(1 - (y * y) / (ry * ry)) + .5); px(c, cx - w, cy + y, w * 2 + 1, 1, col); } }
const PX = { wood: '#6a4422', wood2: '#8a5a30', wood3: '#a87444', ink: '#2a1810', dark: '#1a1018', stone: '#8a8a96', stone2: '#aaaab6', gold: '#e2b060' };

/* ---------- Hintergründe ---------- */
function drawBG(c, se, o = {}) {
  const b = IMG.bg[se === 'fr' ? 'so' : se]; if (!b) return; const ox = o.ox || 0, sy = o.sy == null ? 76 : o.sy;
  curBGMeta = { se, ox, sy, noClouds: o.noClouds }; c.imageSmoothingEnabled = false;
  (o.layers || [1, 2, 3, 4]).forEach(i => { c.drawImage(b.layers[i], ox, sy, 480, 270, 0, 0, W, H); if (i === 1 && o.castle) c.drawImage(b.castle, ox, sy, 480, 270, 0, 0, W, H); });
  const tint = o.tint || { fr: 'rgba(255,170,215,.07)', so: 'rgba(255,225,110,.05)' }[se]; if (tint) { c.fillStyle = tint; c.fillRect(0, 0, W, H); }
}
function drawGround(c, se, top = 231, soil) {
  const t = IMG.tiles[se]; if (!t) return; c.imageSmoothingEnabled = false;
  const g = c.createImageData(1, 1); void g;
  for (let x = 0; x < W; x += 64) c.drawImage(t, 0, 0, 32, 32, x, top * 2, 64, 64);
  c.fillStyle = soil || { so: '#1f1a14', fr: '#1f1a14', he: '#231c12', wi: '#22202a' }[se]; c.fillRect(0, top * 2 + 64, W, H - top * 2 - 64);
  const r = R(17); c.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 60; i++) c.fillRect(Math.round(r() * 240) * 4, (top * 2 + 70 + Math.floor(r() * 50) * 2) & ~1, 4, 2);
}
const CLOUDS = [[0, 34, 6, 'cloud6'], [200, 58, 4, 'cloud5'], [420, 30, 7, 'cloud4'], [620, 80, 5, 'cloud3'], [780, 44, 3, 'cloud5'], [90, 100, 4, 'cloud2']];
function drawClouds(c, t, se, n = 6) {
  CLOUDS.slice(0, n).forEach(([x0, y, sp, nm]) => { const w = sprSize(nm)[0], x = ((x0 + t * sp * 2) % (W + 2 * w)) - w; spr(c, nm, x + w / 2, y + sprSize(nm)[1], { a: se === 'wi' ? .8 : .95 }); });
  if (se !== 'he') spr(c, 'sun', 150, 100, { a: se === 'wi' ? .6 : 1 });
}
const hsh = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const parts = Array.from({ length: 90 }, (_, i) => ({ x: hsh(i + 1) * W, y: hsh(i + 91) * H, s: .5 + hsh(i + 191) * 1.3, p: hsh(i + 291) * 6 }));
function drawParticles(c, t, se) {
  if (se === 'wi') { c.fillStyle = '#fff'; parts.forEach(p => { const y = (p.y + t * 34 * p.s) % H, x = p.x + Math.sin(t + p.p) * 16; c.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, p.s > 1 ? 4 : 2, p.s > 1 ? 4 : 2); }); }
  else if (se === 'he') { parts.slice(0, 26).forEach(p => { const y = (p.y + t * 28 * p.s) % H, x = p.x + Math.sin(t * 1.2 + p.p) * 28; c.fillStyle = p.s > 1 ? '#e77b26' : '#b8481c'; c.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 6, 4); c.fillStyle = '#7a2a10'; c.fillRect(Math.round(x / 2) * 2 + 4, Math.round(y / 2) * 2, 2, 2); }); }
  else if (se === 'fr') { parts.slice(0, 26).forEach(p => { const y = (p.y + t * 22 * p.s) % H, x = p.x + Math.sin(t + p.p) * 24; c.fillStyle = '#ffc0d8'; c.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 4, 4); }); }
  else { parts.slice(0, 14).forEach(p => { const x = (p.x + t * 6 * p.s) % W, y = 300 + Math.sin(t * .8 + p.p) * 60 + p.s * 30; c.fillStyle = 'rgba(255,255,200,.8)'; c.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 2, 2); }); }
}
/* animierte Sprite-Folge: frames 'name0'..'nameN-1', fps */
const anim = (name, n, t, fps = 8, off = 0) => name + (Math.floor(t * fps + off) % n);

/* ---------- Figuren (Schichtblätter 80×64, feste Zeilen) ---------- */
const ANIMS = { idle: [0, 5, 5], walk: [1, 8, 12], walk2: [2, 8, 12], cast: [4, 4, 8], use: [5, 6, 8] };
const CHAR = {};
['mira', 'runa', 'tovin', 'lio', 'selma', 'nim', 'orin', 'elias', 'corvin', 'aveline', 'hedda', 'fenn', 'brann', 'ansgar'].forEach(k => CHAR[k] = { sheet: k });
function drawChar(c, x, y, ch, o = {}) {
  const im = IMG.chars[ch.sheet]; if (!im) return; const dir = o.dir || 1, t = o.t || 0; let row, n, fps, frame;
  const a = o.anim || (o.walking ? 'walk' : 'idle');
  if (a === 'sleep') { row = 6; frame = 9; } else if (a === 'wake') { row = 6; frame = Math.max(0, 9 - Math.floor((o.f || 0))); } else { [row, n, fps] = ANIMS[a] || ANIMS.idle; frame = Math.floor(t * fps + (o.off || 0)) % n; }
  const dx = Math.round(x - 80), dy = Math.round(y - 126);
  c.imageSmoothingEnabled = false;
  if (o.a != null) c.globalAlpha = o.a;
  if (dir > 0) { c.save(); c.translate(dx + 160, dy); c.scale(-1, 1); c.drawImage(im, frame * 80, row * 64, 80, 64, 0, 0, 160, 128); c.restore(); }
  else c.drawImage(im, frame * 80, row * 64, 80, 64, dx, dy, 160, 128);
  if (o.a != null) c.globalAlpha = 1;
}
function npc(id, name, x, dir, walk, face, lookTxt, use, extra = {}) {
  return Object.assign({
    id, actor: id, name, r: [x - 30, GY - 100, 60, 102], walk, face, head: [x, GY - 104],
    draw(c, t) { drawChar(c, x, GY, CHAR[id], { dir, t, talk: speech && speech.who === id }); },
    look: async () => say('mira', lookTxt), use
  }, extra);
}

/* ---------- Pixel-Text (Systemschrift klein gerendert, hart geschwellt, 2× vergrößert) ---------- */
const TXC = new Map(), MEAS = document.createElement('canvas').getContext('2d');
const pxFont = size => 'bold ' + Math.max(7, Math.round(size / 2)) + 'px ' + FONT;
function measureT(s, size) { MEAS.font = pxFont(size); return Math.ceil(MEAS.measureText(s).width) * 2; }
function pxTextImg(s, size, col, outline) {
  const key = s + '|' + size + '|' + col + '|' + outline; let e = TXC.get(key); if (e) return e;
  const fs = Math.max(7, Math.round(size / 2)); MEAS.font = pxFont(size); const w = Math.ceil(MEAS.measureText(s).width) + 6, h = Math.ceil(fs * 1.5) + 4, asc = Math.round(fs * 1.05) + 1;
  const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h; const g = cv2.getContext('2d'); g.font = pxFont(size); g.textBaseline = 'alphabetic';
  if (outline) { g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = INK; g.strokeText(s, 3, asc + 1); }
  g.fillStyle = col; g.fillText(s, 3, asc + 1);
  const d = g.getImageData(0, 0, w, h), a = d.data; for (let i = 3; i < a.length; i += 4) a[i] = a[i] > 110 ? 255 : 0; g.putImageData(d, 0, 0);
  if (TXC.size > 900) TXC.clear(); e = { cv: cv2, w, h, asc: asc + 1 }; TXC.set(key, e); return e;
}
function txt(c, s, x, y, size = 20, col = '#fff', align = 'left', bold = true, outline = true) {
  if (!s) return; const e = pxTextImg(String(s), size, col, outline); c.imageSmoothingEnabled = false;
  let dx = x - 6; if (align === 'center') dx = x - e.w; else if (align === 'right') dx = x - e.w * 2 + 6;
  c.drawImage(e.cv, Math.round(dx / 2) * 2, Math.round((y - e.asc * 2) / 2) * 2, e.w * 2, e.h * 2);
}
function wrap(c, s, maxW, size = 20) {
  const out = []; let cur = '';
  for (const w of String(s).split(' ')) { const t = cur ? cur + ' ' + w : w; if (measureT(t, size) > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
/* Eckige Pixel-Rahmen statt runder Comic-Rahmen */
function rrect(c, x, y, w, h, r, fill, lw = 3) {
  x = Math.round(x / 2) * 2; y = Math.round(y / 2) * 2; w = Math.round(w / 2) * 2; h = Math.round(h / 2) * 2; const b = lw ? 4 : 0;
  if (fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); }
  if (lw) { c.fillStyle = INK; c.fillRect(x, y, w, b); c.fillRect(x, y + h - b, w, b); c.fillRect(x, y, b, h); c.fillRect(x + w - b, y, b, h); if (fill && fill !== 'transparent') { c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x + b, y + b, w - 2 * b, 2); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + b, y + h - b - 2, w - 2 * b, 2); } }
}

/* ---------- Pixel-Symbole (8×8) ---------- */
const GLYPHS = {
  fr: ['..pp.pp.', '.ppppppp', '.pp.y.pp', 'ppp.yppp', '.pp.y.pp', '.ppppppp', '..pp.pp.', '...g....'],
  so: ['y..y.y..', '..yyyy..', '.yyyyyy.', 'yyyyyyyy', '.yyyyyy.', '..yyyy..', '.y.yy..y', '...y....'],
  he: ['....oo..', '..ooooo.', '.ooooooo', 'oorooooo', '.ooroooo', '..oorooo', '...oror.', '..b..r..'],
  wi: ['...cc...', 'c..cc..c', '.c.cc.c.', '..cccc..', 'cccccccc', '..cccc..', '.c.cc.c.', 'c..cc..c'],
  book: ['.nnnnnn.', 'nwwnwwwn', 'nwwnwwwn', 'nwwnwwwn', 'nwwnwwwn', 'nwwnwwwn', '.nnnnnn.', '........'],
  map: ['nnnnnnnn', 'nwnwwnwn', 'nwnwwnwn', 'nwwwnnwn', 'nnwwwnwn', 'nwwnwwwn', 'nnnnnnnn', '........'],
  menu: ['........', 'wwwwwwww', '........', 'wwwwwwww', '........', 'wwwwwwww', '........', '........']
};
const GCOL = { p: '#ff9ac4', y: '#ffd84a', g: '#4ac05a', o: '#e77b26', r: '#b8481c', b: '#6a4422', c: '#bfe6ff', n: '#d8b070', w: '#f4ecd8' };
function glyph(c, name, x, y, s = 2, cols) {
  const g = GLYPHS[name]; if (!g) return; const C = cols || GCOL;
  g.forEach((row, j) => { for (let i = 0; i < 8; i++) { const ch = row[i]; if (ch !== '.') { c.fillStyle = C[ch] || '#fff'; c.fillRect(Math.round(x + i * s), Math.round(y + j * s), s, s); } } });
}
const SEASON_ICON = { fr: '', so: '', he: '', wi: '' };

/* ---------- Inventar-Symbole (gemalte Icons) ---------- */
function drawIcon(c, id, x, y, size = 48) {
  const i = ASSETS.iconOrder.indexOf(id); if (i < 0) return; c.imageSmoothingEnabled = true; c.drawImage(IMG.icons, (i % 10) * 64, Math.floor(i / 10) * 64, 64, 64, x, y, size, size); c.imageSmoothingEnabled = false;
}

/* ---------- Pixel-Bausteine für Szenen ---------- */
function pxSignpost(c, x, dir, label) {          // Wegweiser am Bildrand; x Mitte, Leinwand
  const lx = Math.round(x / 2), y = GY / 2 + 2;
  px(c, lx - 1, y - 40, 3, 42, PX.ink); px(c, lx, y - 40, 1, 42, PX.wood2);
  const x0 = dir < 0 ? lx - 18 : lx - 6;
  px(c, x0 - 1, y - 38, 26, 14, PX.ink); px(c, x0, y - 37, 24, 12, PX.gold); px(c, x0, y - 37, 24, 2, '#f4d890');
  for (let i = 0; i < 5; i++) px(c, dir < 0 ? x0 + 4 + i : x0 + 18 - i, y - 31 - (i > 2 ? 0 : 0) + (i === 4 ? 0 : 0), 1, 1 + (i % 2) * 0, PX.ink);
  px(c, dir < 0 ? x0 + 3 : x0 + 14, y - 32, 8, 2, PX.ink); px(c, dir < 0 ? x0 + 3 : x0 + 19, y - 35, 2, 8, PX.ink);
}
function pxArchway(c, x, y, w, label, open = true) {      // Holztorbogen; x Mitte, y Unterkante (Leinwand)
  const lx = Math.round(x / 2), ly = Math.round(y / 2), hw = Math.round(w / 4), h = 50;
  px(c, lx - hw - 4, ly - h, 7, h, PX.ink); px(c, lx + hw - 3, ly - h, 7, h, PX.ink); px(c, lx - hw - 3, ly - h, 5, h, PX.wood2); px(c, lx + hw - 2, ly - h, 5, h, PX.wood2);
  px(c, lx - hw - 4, ly - h - 6, hw * 2 + 8, 8, PX.ink); px(c, lx - hw - 3, ly - h - 5, hw * 2 + 6, 6, PX.wood3);
  for (let i = 0; i < h - 2; i++) { const k = 1 + Math.floor(i / 14); px(c, lx - hw + 2, ly - h + 2 + i, hw * 2 - 4, 1, i < 4 ? '#3a2a4a' : `rgb(${22 + i / 4},${14 + i / 6},${38 + i / 3})`); }
  const lab = label.length > 14 ? label.slice(0, 13) + '.' : label, pw = Math.max(26, Math.ceil(measureT(lab, 13) / 2) + 8);
  px(c, lx - pw / 2 - 1, ly - h - 19, pw + 2, 13, PX.ink); px(c, lx - pw / 2, ly - h - 18, pw, 11, PX.gold); px(c, lx - pw / 2, ly - h - 18, pw, 1, '#f4d890');
  txt(c, lab, x, (ly - h - 9) * 2 + 2, 13, PX.ink, 'center', true, false);
}
function pxCrow(c, x, y, t, d = 1) {             // kleine Krähe (logische Pixel)
  const lx = Math.round(x / 2), ly = Math.round(y / 2), h = Math.abs(Math.sin(t * 5)) > .7 ? 2 : 0;
  px(c, lx - 4 * d, ly - 6 - h, 8, 5, '#23232c'); px(c, lx + (d > 0 ? 3 : -7), ly - 8 - h, 5, 4, '#23232c'); px(c, lx + (d > 0 ? 8 : -10), ly - 7 - h, 2, 1, '#e8a020'); px(c, lx + (d > 0 ? 6 : -6), ly - 7 - h, 1, 1, '#fff');
  px(c, lx - 6 * d - (d < 0 ? 2 : 0), ly - 5 - h, 3, 2, '#14141a'); px(c, lx - 1, ly - 1 - h, 1, 2, '#e8a020'); px(c, lx + 2, ly - 1 - h, 1, 2, '#e8a020');
}
function pxFlag(c, x, y, col) { px(c, x, y, 6, 4, col); px(c, x + 2, y + 4, 2, 2, col); }
function pxWater(c, se, x0, y0, x1, y1, t, tt = 0) {       // gekachelte, animierte Wasserfläche (logische Pixel)
  const base = se === 'wi' ? '#c8e4f4' : se === 'fr' ? '#3f97b8' : se === 'he' ? '#2f7f9f' : '#2a9fc0', hi = se === 'wi' ? '#ffffff' : '#7fe0e8', lo = se === 'wi' ? '#9cc4dc' : '#1f6f8f';
  px(c, x0, y0, x1 - x0, y1 - y0, base);
  for (let y = y0 + 3; y < y1 - 1; y += 5) for (let x = x0 + ((y * 7) % 13); x < x1 - 6; x += 17) { const s = se === 'wi' ? 0 : Math.round(Math.sin(t * 1.6 + x * .3 + y) * 1.4); px(c, x + s, y, 6, 1, hi); px(c, x + s + 2, y + 2, 5, 1, lo); }
  if (se === 'wi') for (let x = x0 + 8; x < x1 - 10; x += 37) { px(c, x, y0 + 4 + (x % 11), 10, 1, hi); px(c, x + 10, y0 + 5 + (x % 11), 6, 1, '#7fa8c4'); }
  px(c, x0, y0, x1 - x0, 1, PX.ink);
}
