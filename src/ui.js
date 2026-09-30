/* =====================================================================
   OBERFLÄCHE (Pixel-Art): Szene, Sprechblasen, HUD, Titel, Karte, Intro, Enden
   ===================================================================== */
const landCache = {}; let landKey = '', landCv = null, landMeta = null, curBGMeta = null;
function getLand() {
  const key = S.scene + '|' + curSeason();
  if (key !== landKey) { landKey = key; landCv = document.createElement('canvas'); landCv.width = W; landCv.height = H; const g = landCv.getContext('2d'); g.imageSmoothingEnabled = false; curBGMeta = null; SC[S.scene].land(g, curSeason()); landMeta = curBGMeta; }
  return landCv;
}
function drawScene(c, t, dt) {
  const se = curSeason(); c.imageSmoothingEnabled = false; const land = getLand(), m = landMeta;
  const b = m && IMG.bg[m.se === 'fr' ? 'so' : m.se]; if (b) c.drawImage(b.layers[0], m.ox, m.sy, 480, 270, 0, 0, W, H);
  if (!(m && m.noClouds)) drawClouds(c, t, se);
  c.drawImage(land, 0, 0);
  const sc = SC[S.scene]; if (sc.dyn) sc.dyn(c, t, se);
  const objs = objects();
  const draws = objs.map(o => ({ z: o.z != null ? o.z : (o.front ? 2000 : 0) + (o.r[1] + o.r[3]), fn: () => o.draw && o.draw(c, t) }));
  draws.push({ z: 495, fn: () => drawChar(c, S.x, GY, CHAR.mira, { dir: S.dir, t, walking: S.target != null && Math.abs(S.target - S.x) > 2, talk: speech && speech.who === 'mira' }) });
  draws.sort((a, b) => a.z - b.z).forEach(d => d.fn());
  drawParticles(c, t, se);
  if (showHot) objs.forEach(o => { c.strokeStyle = '#ff0'; c.lineWidth = 2; c.strokeRect(o.r[0], o.r[1], o.r[2], o.r[3]); });
}

/* ---------- Sprechblasen, Knöpfe, Tafeln ---------- */
const NAME_COL = { mira: '#7b3fb8', runa: '#c0621a', tovin: '#b07a10', lio: '#2a78b8', hedda: '#8a6a30', selma: '#3a8a3a', nim: '#5a9a2a', orin: '#3a4ab0', fenn: '#c0701a', brann: '#5a6a7a', ansgar: '#7a6a4a', corvin: '#7a3aa8', elias: '#2a8a48' };
function bubbleFor(c, who, text, t0) {
  const shown = AUTO ? text.length : Math.floor((now() - t0) * 55), size = 22;
  const typed = lines => { let n = 0; return lines.map(l => { const seg = l.slice(0, Math.max(0, shown - n)); n += l.length + 1; return seg; }); };
  if (who === 'n') {
    const lines = wrap(c, text, 760, size), h = lines.length * 28 + 30, w = 800;
    rrect(c, W / 2 - w / 2, 30, w, h, 0, '#1e1428', 3); typed(lines).forEach((seg, i) => txt(c, seg, W / 2, 66 + i * 28, size, '#ffe9b0', 'center', true, false)); return shown >= text.length;
  }
  let x, y, name; if (who === 'mira') { x = S.x; y = GY - 128; } else { const o = objects().find(o => o.actor === who); const hd = o ? (o.head || [o.r[0] + o.r[2] / 2, o.r[1]]) : [W / 2, 300]; x = hd[0]; y = hd[1] - 18; }
  name = NAMES[who] || who[0].toUpperCase() + who.slice(1);
  const lines = wrap(c, text, 380, size), w = Math.min(420, Math.max(...lines.map(l => measureT(l, size))) + 40), h = lines.length * 28 + 34;
  const bx = clamp(Math.round(x - w / 2), 14, W - w - 14), by = clamp(Math.round(y - h), 14, H - h - 14);
  rrect(c, bx, by, w, h, 0, '#fbf4e0', 3);
  const tx = clamp(Math.round(x / 2) * 2, bx + 16, bx + w - 34); for (let i = 0; i < 6; i++) { c.fillStyle = INK; c.fillRect(tx + i * 2, by + h + i * 4 - 2, 16 - i * 4 > 0 ? 16 - i * 4 + 4 : 4, 4); c.fillStyle = '#fbf4e0'; c.fillRect(tx + 4 + i * 2, by + h + i * 4 - 4, Math.max(2, 10 - i * 4), 4); }
  txt(c, name, bx + 18, by + 24, 15, NAME_COL[who] || '#444', 'left', true, false);
  typed(lines).forEach((seg, i) => txt(c, seg, bx + 18, by + 50 + i * 28, size, INK, 'left', true, false));
  return shown >= text.length;
}
function button(c, x, y, w, h, label, fn, o = {}) {
  const hv = mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h && !o.disabled;
  rrect(c, x, y, w, h, 0, o.disabled ? '#8a8a8a' : hv ? '#ffe28a' : (o.fill || '#f4c542'), 3);
  if (o.glyph) glyph(c, o.glyph, x + 12, y + h / 2 - 12, 3);
  txt(c, label, x + w / 2 + (o.glyph ? 14 : 0), y + h / 2 + 7, o.size || 20, o.disabled ? '#ddd' : INK, 'center', true, false);
  if (!o.disabled) btns.push({ x, y, w, h, fn });
  return hv;
}
function panel(c, x, y, w, h, fill = '#f6e8c8') { rrect(c, x + 6, y + 6, w, h, 0, 'rgba(0,0,0,.4)', 0); rrect(c, x, y, w, h, 0, fill, 3); }

/* ---------- HUD ---------- */
function medalOrb(c, x, y, se) {                       // Jahreszeitenherz-Medaillon (Kugel aus dem Asset-Pack)
  const p = SPOS.medal; if (!p) return; const cols = ['#ffb6d1', '#ffd84a', '#a9d8ff', '#e77b26'], cx = x + 33, cy = y + 33;
  for (let j = -26; j <= 26; j++) { const w = Math.floor(Math.sqrt(26 * 26 - j * j)); for (let i = -w; i <= w; i++) { c.fillStyle = cols[j < 0 ? (i < 0 ? 0 : 1) : (i < 0 ? 3 : 2)]; c.globalAlpha = .8; c.fillRect(cx + i, cy + j, 1, 1); } }
  c.globalAlpha = 1; c.imageSmoothingEnabled = false; c.drawImage(IMG.atlas, p[0], p[1], 66, 64, x, y, 66, 64);
  const ic = { fr: 'fr', so: 'so', he: 'he', wi: 'wi' }[se]; glyph(c, ic, cx - 8, cy - 8, 2);
}
function drawHUD(c, t) {
  if (ui === null && !busy && hover) { const lab = sel ? 'Benutze ' + ITEMS[sel].n + ' mit ' + hover.name : (hover.kind === 'exit' ? '→ ' + hover.name : hover.name); txt(c, lab, W / 2, H - 88, 22, '#fff', 'center'); }
  else if (ui === null && sel && !busy) txt(c, 'Benutze ' + ITEMS[sel].n + ' mit …', W / 2, H - 88, 22, '#fff', 'center');
  if (ui === null) txt(c, SC[S.scene].title + (S.hasHeart ? '  ·  ' + SEASONS[curSeason()] : ''), S.hasHeart ? 84 : 16, 34, 20, '#fff', 'left');
  if (S.hasHeart && ui === null) { medalOrb(c, 8, 38, curSeason()); if (Math.hypot(mouse.x - 39, mouse.y - 69) < 32 && !busy) txt(c, 'Jahreszeit ändern [S]', 80, 92, 15, '#fff', 'left'); }
  // Inventarleiste
  const bh = 74, want = (mouse.y > H - 50) || (barShown && mouse.y > H - 100) || ui === 'inv';
  if (barSuppress && mouse.y < H - 100) barSuppress = false;
  barShown = want && !barSuppress && (ui === null || ui === 'inv') && S.inv.length > 0;
  if (barShown) {
    const y = H - bh; c.fillStyle = 'rgba(32,20,12,.95)'; c.fillRect(0, y, W, bh); c.fillStyle = INK; c.fillRect(0, y, W, 4); c.fillStyle = '#6a4422'; c.fillRect(0, y + 4, W, 2);
    const step = Math.min(64, (W - 90) / Math.max(1, S.inv.length));
    S.inv.forEach((id, i) => {
      const x = 14 + i * step, yy = y + 10, hv = mouse.x > x && mouse.x < x + 58 && mouse.y > yy && mouse.y < yy + 58 && !busy;
      rrect(c, x, yy, 58, 58, 0, sel === id ? '#ffd86a' : hv ? '#e8c890' : '#c9a86a', 3); drawIcon(c, id, x + 5, yy + 5, 48);
      if (hv) txt(c, ITEMS[id].n, x + 29, y - 8, 17, '#fff', 'center');
      btns.push({ x, y: yy, w: 58, h: 58, inv: id, fn: null });
    });
  }
  if (ui === null) [['book', 'Tagebuch [J]', () => { if (!busy) ui = 'journal'; }], ['map', 'Karte [M]', () => { if (!busy) ui = 'map'; }], ['menu', 'Menü [Esc]', () => { if (!busy) ui = 'menu'; }]].forEach((b, i) => {
    const x = W - 150 + i * 46, y = 8, hv = mouse.x > x && mouse.x < x + 40 && mouse.y > y && mouse.y < y + 40;
    rrect(c, x, y, 40, 40, 0, hv ? '#ffe28a' : 'rgba(40,24,14,.9)', 3); glyph(c, b[0], x + 8, y + 8, 3, hv ? { n: '#6a4422', w: '#2a1810' } : null);
    btns.push({ x, y, w: 40, h: 40, fn: b[2] }); if (hv && !busy) txt(c, b[1], W - 20, 70, 14, '#fff', 'right');
  });
  if (speech) { const done = bubbleFor(c, speech.who, speech.text, speech.t0); if (done && Math.floor(t * 3) % 2 === 0) { c.fillStyle = INK; c.fillRect(W - 40, H - 120, 16, 4); c.fillRect(W - 36, H - 116, 8, 4); c.fillRect(W - 32, H - 112, 0, 0); } }
  if (choiceSt) {
    const o = choiceSt.opts, w = 760, h = o.length * 38 + 20, x = (W - w) / 2, y = H - h - 20; rrect(c, x, y, w, h, 0, 'rgba(30,18,40,.96)', 3);
    o.forEach((s, i) => { const yy = y + 12 + i * 38, hv = mouse.y > yy && mouse.y < yy + 36 && mouse.x > x && mouse.x < x + w; if (hv) { c.fillStyle = 'rgba(255,226,138,.25)'; c.fillRect(x + 8, yy, w - 16, 36); } txt(c, (i + 1) + '.  ' + s, x + 24, yy + 26, 20, hv ? '#ffe28a' : '#fff', 'left', false, false); btns.push({ x, y: yy, w, h: 36, fn: () => { const r = choiceSt.res; choiceSt = null; r(i); } }); });
  }
  if (toast) { const a = now() - toast.t0; if (a > 3.2) toast = null; else { c.globalAlpha = Math.min(1, (3.2 - a)); rrect(c, W - 340, 92, 326, 40, 0, 'rgba(30,18,40,.94)', 3); txt(c, toast.t, W - 177, 119, 16, '#fff', 'center', true, false); c.globalAlpha = 1; } }
}
function drawCursor(c) {
  const x = Math.round(mouse.x / 2) * 2, y = Math.round(mouse.y / 2) * 2;
  if (sel && ui === null) { rrect(c, x - 26, y - 26, 52, 52, 0, 'rgba(255,226,138,.95)', 3); drawIcon(c, sel, x - 20, y - 20, 40); return; }
  const col = hover ? '#ffe28a' : '#ffffff';
  if (hover && hover.kind === 'exit') {
    const d = hover.dirArrow || 0, rows = ['....x....', '...xxx...', '..xxxxx..', '.xxxxxxx.', '...xxx...', '...xxx...', '...xxx...'];
    const pts = []; rows.forEach((r, j) => { for (let i = 0; i < 9; i++) if (r[i] === 'x') { const rx = i - 4, ry = j - 3; pts.push(d < 0 ? [ry, -rx] : d > 0 ? [-ry, rx] : [rx, ry]); } });
    pts.forEach(([a, b]) => { c.fillStyle = INK; c.fillRect(x + a * 4 - 2, y + b * 4 - 2, 8, 8); }); pts.forEach(([a, b]) => { c.fillStyle = col; c.fillRect(x + a * 4, y + b * 4, 4, 4); });
    return;
  }
  const a = ['x.........', 'xx........', 'xxx.......', 'xxxx......', 'xxxxx.....', 'xxxxxx....', 'xxxxxxx...', 'xxxx......', 'xx.xx.....', 'x..xx.....', '....xx....', '....xx....'];
  a.forEach((r, j) => { for (let i = 0; i < 10; i++) if (r[i] === 'x') { c.fillStyle = INK; c.fillRect(x + i * 3 - 2, y + j * 3 - 2, 7, 7); } });
  a.forEach((r, j) => { for (let i = 0; i < 10; i++) if (r[i] === 'x') { c.fillStyle = col; c.fillRect(x + i * 3, y + j * 3, 3, 3); } });
}

/* ---------- Titel ---------- */
function drawTitle(c, t) {
  const b = IMG.bg.so; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  if (b) { b.layers.forEach((im, i) => { c.drawImage(im, 160, 0, 480, 270, 0, 0, W, H); if (i === 1) c.drawImage(b.castle, 160, 0, 480, 270, 0, 0, W, H); }); }
  c.fillStyle = 'rgba(20,10,40,.35)'; c.fillRect(0, 0, W, H); drawClouds(c, t, 'so', 4);
  drawGround(c, 'so', 231);
  drawChar(c, 210, GY, CHAR.mira, { dir: 1, t }); drawChar(c, 750, GY, CHAR.runa, { dir: -1, t, off: 2 }); drawChar(c, 120, GY, CHAR.tovin, { dir: 1, t, off: 1 }); drawChar(c, 840, GY, CHAR.lio, { dir: -1, t, off: 3 });
  const f = (s, y, sz, col) => { txt(c, s, W / 2, y + 4, sz, INK, 'center', true, false); txt(c, s, W / 2, y, sz, col, 'center', true, true); };
  f('Das Schloss der', 104, 50, '#ffe28a'); f('verlorenen Jahreszeiten', 170, 62, '#ffffff');
  txt(c, 'Ein Pixel-Art-Adventure', W / 2, 212, 22, '#ffd0a0', 'center');
  [['fr', 40, 40], ['so', 110, 40], ['he', 800, 40], ['wi', 870, 40]].forEach(([g, x, y]) => glyph(c, g, x, y + Math.round(Math.sin(t * 2 + x)) * 4, 6));
  button(c, W / 2 - 130, 250, 260, 50, 'Neues Spiel', startNew, { size: 24 });
  button(c, W / 2 - 130, 312, 260, 50, 'Weiter', () => { if (loadGame('slvj_auto')) { landKey = ''; ui = null; startMusic(); showToast('Willkommen zurück!'); } }, { size: 24, disabled: !hasSave() });
  txt(c, 'Linksklick: gehen & benutzen', W / 2, 400, 16, '#fff', 'center', false); txt(c, 'Rechtsklick: ansehen · Gegenstand anklicken, dann Ziel', W / 2, 424, 16, '#fff', 'center', false);
}

/* ---------- Girlanden ordnen ---------- */
function drawGarland(c, t) {
  c.fillStyle = 'rgba(10,6,20,.78)'; c.fillRect(0, 0, W, H); panel(c, 130, 110, 700, 320);
  txt(c, 'Klanggirlanden ordnen', W / 2, 160, 28, '#3a8a3a', 'center', true, false);
  txt(c, 'Klicke zwei Girlanden nacheinander an, um sie zu vertauschen. (Tipp: die Holzscheibe)', W / 2, 190, 15, '#5a4030', 'center', false, false);
  S.girl.forEach((g, i) => {
    const x = 240 + i * 240, y = 330;
    if (gSel === i) { c.fillStyle = 'rgba(255,226,138,.6)'; c.fillRect(x - 100, y - 100, 200, 150); }
    spr(c, 'girl_' + g, x, y + Math.round(Math.sin(t * 2 + i)) * 2, { s: 3 });
    btns.push({ x: x - 100, y: y - 100, w: 200, h: 150, fn: () => { sfx('click'); if (gSel < 0) gSel = i; else if (gSel === i) gSel = -1; else { const a = S.girl[gSel]; S.girl[gSel] = S.girl[i]; S.girl[i] = a; gSel = -1; checkGirl(); } } });
  });
  button(c, W / 2 - 60, 380, 120, 36, 'Schließen', () => { ui = null; gSel = -1; }, { size: 16 });
}

/* ---------- Karte mit Nebel ---------- */
const MAPS = .4402, MAPX = 112, MAPY = 78;
const mpos = id => [MAPX + MP[id][0] * MAPS, MAPY + MP[id][1] * MAPS];
let fogCv = null;
function drawMap(c, t) {
  c.fillStyle = 'rgba(10,6,20,.8)'; c.fillRect(0, 0, W, H); panel(c, 60, 14, 840, 510);
  txt(c, 'Karte von Avelorn', W / 2, 62, 28, '#5a3a20', 'center', true, false);
  const mw = Math.round(1672 * MAPS), mh = Math.round(941 * MAPS);
  c.imageSmoothingEnabled = true; c.drawImage(IMG.map, MAPX, MAPY, mw, mh); c.imageSmoothingEnabled = false; rrect(c, MAPX - 2, MAPY - 2, mw + 4, mh + 4, 0, null, 3);
  if (!fogCv) { fogCv = document.createElement('canvas'); fogCv.width = mw; fogCv.height = mh; }
  const g = fogCv.getContext('2d'); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, mw, mh); g.fillStyle = 'rgba(226,204,156,.94)'; g.fillRect(0, 0, mw, mh);
  g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round';
  const seen = id => S.visited[id];
  MAPE.forEach(([a, b]) => { if (seen(a) && seen(b)) { const p = mpos(a), q = mpos(b); g.lineWidth = 60; g.strokeStyle = 'rgba(0,0,0,.9)'; g.beginPath(); g.moveTo(p[0] - MAPX, p[1] - MAPY); g.lineTo(q[0] - MAPX, q[1] - MAPY); g.stroke(); } });
  Object.keys(MP).forEach(id => { if (!seen(id)) return; const p = mpos(id), rg = g.createRadialGradient(p[0] - MAPX, p[1] - MAPY, 20, p[0] - MAPX, p[1] - MAPY, 80); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.beginPath(); g.arc(p[0] - MAPX, p[1] - MAPY, 80, 0, 7); g.fill(); });
  c.drawImage(fogCv, MAPX, MAPY);
  MAPE.forEach(([a, b]) => { if (seen(a) && seen(b)) { const p = mpos(a), q = mpos(b); c.setLineDash([8, 7]); line(c, [p, q], '#5a3a20', 3); c.setLineDash([]); } });
  const can = has('kristall') && !SC[S.scene].noTravel;
  Object.keys(MP).forEach(id => {
    const [x, y] = mpos(id);
    if (!seen(id)) { const adj = MAPE.some(e => (e[0] === id && seen(e[1])) || (e[1] === id && seen(e[0]))); if (adj) txt(c, '?', x, y + 10, 30, '#5a3a20', 'center', true, false); return; }
    const hv = Math.hypot(mouse.x - x, mouse.y - y) < 16, ok = can && id !== S.scene && !SC[id].noTravel;
    rrect(c, x - 8, y - 8, 16, 16, 0, hv && ok ? '#fff6a0' : PAL[seasonOf(id)].ground, 3); txt(c, MTITLE(id), x, y + 28, 13, '#fff6d8', 'center', true, true);
    if (id === S.scene) { px(c, x / 2 - 1, y / 2 - 26, 2, 14, PX.ink); px(c, x / 2 + 1, y / 2 - 26, 9, 6, '#d04848'); }
    if (ok) btns.push({ x: x - 16, y: y - 16, w: 32, h: 32, fn: () => travelTo(id) });
  });
  txt(c, has('kristall') ? (SC[S.scene].noTravel ? 'Hier wirkt der Wegkristall nicht.' : 'Klicke einen bekannten Ort: Der Wegkristall bringt dich hin.') : 'Orte erscheinen, sobald du sie besucht hast.', 100, 514, 15, '#5a4030', 'left', false, false);
  button(c, 780, 26, 100, 34, 'Schließen', () => { ui = null; }, { size: 16 });
}

/* ---------- Intro und Enden ---------- */
function quadSeasons(c, t, ox = 200) {
  ['fr', 'so', 'he', 'wi'].forEach((s, i) => {
    const x = (i % 2) * W / 2, y = Math.floor(i / 2) * H / 2, b = IMG.bg[s === 'fr' ? 'so' : s]; if (!b) return; c.save(); c.beginPath(); c.rect(x, y, W / 2, H / 2); c.clip();
    b.layers.forEach(im => c.drawImage(im, ox, 76, 480, 270, x, y, W / 2, H / 2)); c.restore();
    drawGroundRangeQ(c, s, x, y); spr(c, 'tree_' + s, x + W / 4, y + H / 2 + 6, { s: 1 });
  });
  c.fillStyle = INK; c.fillRect(W / 2 - 3, 0, 6, H); c.fillRect(0, H / 2 - 3, W, 6);
}
function drawGroundRangeQ(c, s, x, y) { const t = IMG.tiles[s]; for (let i = 0; i < W / 2; i += 32) c.drawImage(t, 0, 0, 32, 32, x + i, y + H / 2 - 40, 32, 32); c.fillStyle = '#1f1a14'; c.fillRect(x, y + H / 2 - 8, W / 2, 8); }
const introCache = {};
function cached(key, fn) { if (!introCache[key]) { const cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H; const g = cv2.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); introCache[key] = cv2; } return introCache[key]; }
function bgFull(g, se, ox, sy, castle) { const b = IMG.bg[se === 'fr' ? 'so' : se]; b.layers.forEach((im, i) => { g.drawImage(im, ox, sy, 480, 270, 0, 0, W, H); if (i === 1 && castle) g.drawImage(b.castle, ox, sy, 480, 270, 0, 0, W, H); }); }
const INTRO = [
  { text: 'Im Tal von Avelorn tanzten die vier Jahreszeiten seit jeher im Reigen: Der Frühling weckte, der Sommer nährte, der Herbst erntete, der Winter ruhte.',
    draw(c, t) { c.drawImage(cached('i0', g => quadSeasons(g, 0)), 0, 0); } },
  { top: true, text: 'Hoch über dem Tal, im Schloss auf dem Berg, lebte Fürst Corvin mit seiner Frau Aveline. Sie liebte den Wechsel der Zeiten mehr als alles andere.',
    draw(c, t) { c.drawImage(cached('i1', g => { bgFull(g, 'so', 200, 30, true); drawGround(g, 'so'); }), 0, 0); drawClouds(c, t, 'so', 3); drawChar(c, 330, GY, CHAR.aveline, { dir: 1, t }); drawChar(c, 430, GY, CHAR.corvin, { dir: -1, t, off: 2 }); const hy = 330 - (t * 24) % 50; px(c, 190, hy / 2, 6, 2, '#e83a5a'); px(c, 192, hy / 2 + 2, 2, 2, '#e83a5a'); px(c, 194, hy / 2, 6, 2, '#e83a5a'); } },
  { text: 'Als Aveline starb, konnte Corvin nicht loslassen. Aus Trauer band er das ganze Tal an einen einzigen, ewigen Sommertag. Seitdem geraten die Jahreszeiten durcheinander – und im Tal schneit es mitten im Herbst.',
    draw(c, t) { c.drawImage(cached('i2', g => { bgFull(g, 'wi', 200, 30, true); g.save(); g.beginPath(); g.arc(W / 2 - 40, 210, 240, 0, 7); g.clip(); bgFull(g, 'so', 200, 30, true); g.restore(); g.lineWidth = 6; g.strokeStyle = INK; g.beginPath(); g.arc(W / 2 - 40, 210, 240, 0, 7); g.stroke(); drawGround(g, 'wi'); }), 0, 0); drawParticles(c, t, 'wi'); } },
  { top: true, text: 'Der Alchemist Elias erkannte die Gefahr. Er versteckte die vier Jahreszeitensiegel im ganzen Tal, ließ sein Jahreszeitenherz im Lager zurück – und verschwand.',
    draw(c, t) { c.drawImage(cached('i3', g => { g.fillStyle = '#1a1028'; g.fillRect(0, 0, W, H); g.fillStyle = '#2a1c3a'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % 300, 4, 4); g.fillStyle = '#4a3020'; g.fillRect(0, 472, W, 68); g.fillStyle = INK; g.fillRect(0, 470, W, 4); }), 0, 0);
      c.fillStyle = 'rgba(255,190,90,.14)'; c.beginPath(); c.arc(330, 380, 260, 0, 7); c.fill(); spr(c, anim('fire', 8, t, 10), 480, GY + 4, { s: 4 });
      drawChar(c, 330, GY, CHAR.elias, { dir: 1, t, anim: 'use' });
      ['siegelFr', 'siegelSo', 'siegelHe', 'siegelWi'].forEach((id, i) => { const a = t * .7 + i * 1.57; drawIcon(c, id, 720 + Math.cos(a) * 120 - 32, 290 + Math.sin(a) * 60 - 32, 64); }); } },
  { top: true, text: 'Seine Schülerin Mira, Alchemistin und Sturkopf, folgt seiner Spur in ein verlassenes Lager am Waldrand. Sie ahnt noch nicht, dass sie über die Zukunft des ganzen Tals entscheiden wird.',
    draw(c, t) { c.drawImage(cached('i4', g => { bgFull(g, 'wi', 40, 76); drawGround(g, 'wi'); spr(g, 'pine_wi', 60, GY + 40); spr(g, 'pine_wi', 930, GY + 50); }), 0, 0); drawParticles(c, t, 'wi'); drawChar(c, 120 + (t * 60) % 700, GY, CHAR.mira, { dir: 1, t, walking: true }); } }
];
let introIdx = 0, introT0 = 0;
function drawIntro(c, t) {
  const p = INTRO[introIdx]; c.fillStyle = '#0a0610'; c.fillRect(0, 0, W, H);
  c.save(); c.beginPath(); c.rect(20, 20, W - 40, H - 40); c.clip(); p.draw(c, t); c.restore(); rrect(c, 16, 16, W - 32, H - 32, 0, null, 4);
  const shown = Math.floor((now() - introT0) * 42), lines = wrap(c, p.text, 780, 24), h = lines.length * 32 + 34, y0 = p.top ? 74 : H - 44 - h;
  rrect(c, 60, y0, W - 120, h, 0, '#fbf4e0', 3); let n = 0; lines.forEach((l, i) => { const seg = l.slice(0, Math.max(0, shown - n)); n += l.length + 1; txt(c, seg, 84, y0 + 44 + i * 32, 24, INK, 'left', true, false); });
  txt(c, (introIdx + 1) + ' / ' + INTRO.length + '  ·  Klick: weiter', W - 44, 50, 15, '#fff', 'right');
  button(c, 30, 30, 140, 30, 'Überspringen', finishIntro, { size: 14, fill: '#e8c890' });
  btns.unshift({ x: 0, y: 0, w: W, h: H, fn: introAdvance });
}
function drawEnding(c, t) {
  const E = ENDINGS[endKind], last = endPage >= E.pages.length; c.fillStyle = '#0a0610'; c.fillRect(0, 0, W, H);
  c.save(); c.beginPath(); c.rect(20, 20, W - 40, H - 40); c.clip();
  c.drawImage(cached('e' + endKind, g => quadSeasons(g, 0, endKind === 'B' ? 40 : 200)), 0, 0);
  if (endKind === 'B') for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 30) % W, y = (i * 53 + Math.sin(t * .5 + i) * 30 + t * 20) % H; c.fillStyle = ['#ffb6d1', '#ffd84a', '#e77b26', '#fff'][i % 4]; c.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 6, 6); }
  if (endKind === 'C') [['selma', 240, 230], ['runa', 720, 230], ['nim', 240, 500], ['orin', 720, 500]].forEach(([id, x, y]) => drawChar(c, x, y, CHAR[id], { dir: 1, t }));
  if (endKind === 'A') drawChar(c, W / 2, H / 2 + 20, CHAR.elias, { dir: 1, t });
  c.fillStyle = 'rgba(10,6,20,.3)'; c.fillRect(0, 0, W, H); c.restore(); rrect(c, 16, 16, W - 32, H - 32, 0, null, 4);
  txt(c, E.title, W / 2, 74, 34, '#ffe28a', 'center');
  if (!last) {
    const lines = wrap(c, E.pages[endPage], 780, 24), h = lines.length * 32 + 34, shown = Math.floor((now() - endT0) * 42);
    rrect(c, 60, H - 54 - h, W - 120, h, 0, '#fbf4e0', 3); let n = 0; lines.forEach((l, i) => { const seg = l.slice(0, Math.max(0, shown - n)); n += l.length + 1; txt(c, seg, 84, H - 54 - h + 44 + i * 32, 24, INK, 'left', true, false); });
    btns.unshift({ x: 0, y: 0, w: W, h: H, fn: endAdvance });
  } else {
    panel(c, 220, 130, 520, 290); txt(c, 'ENDE', W / 2, 196, 44, '#7b3fb8', 'center', true, false);
    txt(c, 'Spielzeit: ' + Math.floor(S.playTime / 60) + ' Min. · Einsichten: ' + S.insights.length + ' / ' + INSIGHT_TOTAL, W / 2, 240, 20, '#5a3a20', 'center', true, false);
    txt(c, 'Idee & Spieldesign: Jan', W / 2, 282, 18, '#5a4030', 'center', false, false); txt(c, 'Pixel-Art: GandalfHardcore · Umsetzung: Claude', W / 2, 308, 18, '#5a4030', 'center', false, false);
    button(c, W / 2 - 200, 346, 190, 46, 'Zum Titel', () => { ui = 'title'; }, { size: 20 }); button(c, W / 2 + 10, 346, 190, 46, 'Weiterspielen', () => { ui = null; }, { size: 20, fill: '#e8c890' });
  }
}
