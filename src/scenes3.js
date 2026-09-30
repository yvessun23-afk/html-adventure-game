/* =====================================================================
   SZENEN (Pixel-Art) – Teil 3: See, Insel, Nebelwald, Hain, Tor, Schloss, Ballonwiese, Adlerhorst
   ===================================================================== */
function drawGroundRange(c, se, x0, x1, top = 231) {
  const t = IMG.tiles[se]; for (let x = x0; x < x1; x += 64) c.drawImage(t, 0, 0, 32, 32, x, top * 2, 64, 64);
  c.fillStyle = { so: '#1f1a14', fr: '#1f1a14', he: '#231c12', wi: '#22202a' }[se]; c.fillRect(x0, top * 2 + 64, x1 - x0, H - top * 2 - 64);
}
function pxBalloon(c, x, y, rx, ry, patched, lit, t) {       // x,y Mitte der Hülle (logisch); Streifenballon im Asset-Stil
  const cols = ['#d8483c', '#f4d03a', '#4a7ad8', '#f4d03a', '#d8483c', '#f4ecd8'];
  for (let dy = -ry; dy <= ry; dy++) { const w = Math.floor(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)) + .5); for (let dx = -w; dx <= w; dx++) { const k = Math.floor((dx + rx) / (rx * 2) * 6); px(c, x + dx, y + dy, 1, 1, dx < -w + 1 || dx > w - 1 || Math.abs(dy) > ry - 1 ? PX.ink : dx > w * .45 ? (k % 2 ? '#b8382c' : '#c8a020') : cols[k % 6]); } }
  px(c, x - Math.round(rx * .45), y - Math.round(ry * .6), 4, 6, 'rgba(255,255,255,.4)');
  if (patched) { px(c, x - 14, y - 8, 28, 20, '#ece4d0'); px(c, x - 14, y - 8, 28, 1, '#8a6a30'); px(c, x - 14, y + 11, 28, 1, '#8a6a30'); px(c, x - 14, y - 8, 1, 20, '#8a6a30'); px(c, x + 13, y - 8, 1, 20, '#8a6a30'); }
  else { px(c, x - 14, y - 8, 28, 20, '#1a1220'); px(c, x - 16, y - 4, 3, 6, '#1a1220'); px(c, x + 14, y + 2, 4, 6, '#1a1220'); }
  const by = y + ry; pxLine(c, x - 18, by - 6, x - 10, by + 14, 1, PX.ink); pxLine(c, x + 18, by - 6, x + 10, by + 14, 1, PX.ink);
  px(c, x - 12, by + 14, 24, 14, PX.ink); px(c, x - 11, by + 15, 22, 12, '#b88a52'); for (let i = 0; i < 5; i++) px(c, x - 11 + i * 5, by + 15, 1, 12, '#8a6a30');
  px(c, x - 4, by + 8, 8, 5, PX.ink); px(c, x - 3, by + 9, 6, 3, '#4a4a56'); if (lit) { px(c, x - 2, by + 4 - Math.round(Math.abs(Math.sin(t * 8)) * 2), 4, 6, '#ff8a1e'); px(c, x - 1, by + 6, 2, 3, '#ffe060'); }
}

/* ======================= SEEUFER ======================= */
SC.see = {
  id: 'see', title: 'Seeufer', natural: 'he', minX: 50, maxX: 880, startX: 120,
  land(c, se) { drawBG(c, se, { ox: 150, layers: [1, 2, 3] }); drawGround(c, se); spr(c, sv('bush', se), 900, GYB + 8); spr(c, 'pine_' + se, 40, GY + 60); },
  dyn(c, t, se) {
    pxWater(c, se, 165, 188, 480, 226, t);
    spr(c, 'bush_' + (se === 'fr' ? 'so' : se), 820, 388, { s: 2 });                     // ferne Insel
    for (let x = 250; x < 450; x += 12) { px(c, x / 2, 218, 5, 2, PX.ink); px(c, x / 2, 218, 5, 1, PX.wood3); }
    for (const x of [260, 330, 400, 440]) px(c, x / 2, 220, 3, 14, PX.ink);
  },
  objs() {
    const se = curSeason(), list = [];
    list.push(npc('orin', 'Orin', 190, 1, 250, -1, 'Orin, der Sternkundige. Sein Bart reicht bis zum Gürtel und in seinen Augen glitzern kleine Sterne.', () => orinTalk()));
    list.push({
      id: 'boot', name: 'Boot', r: [310, 410, 170, 60], walk: 290, draw(c, t) { spr(c, anim('boat', 10, t, 3), 420, GY - 14, { s: 2 }); },
      look: async () => say('mira', 'Orins Boot. Es ist ungefähr so dicht wie Fenns Eimer.'), use: async () => say('mira', 'Ich stelle einen Fuß hinein. Sofort Wasser. Nein danke.')
    });
    list.push({
      id: 'birke', name: 'Birke', r: [490, 250, 140, 230], walk: 480, face: 1,
      draw(c) { spr(c, 'birch_' + se, 570, GYB + 10, { s: 2 }); if (F('birkeKerbe')) { px(c, 281, GY / 2 - 38, 5, 3, '#4a3020'); if (se === 'fr') { px(c, 282, GY / 2 - 34, 1, 3, '#cfeaff'); px(c, 283, GY / 2 - 30, 1, 2, '#cfeaff'); } } if (F('eimerStellt')) spr(c, 'bucket_b', 566, GYB + 2, { s: 2 }); },
      look: async () => say('mira', 'Eine mächtige Birke. Im Vorfrühling „blutet" sie – ihr Saft steigt hoch.'),
      use: async () => say('mira', 'Ich klopfe an den weißen Stamm. Hohl und trocken – nur im Frühling würde sich hier etwas tun.'),
      items: {
        axt: async () => { if (F('birkeKerbe')) return say('mira', 'Die Kerbe ist schon da.'); setF('birkeKerbe'); sfx('use'); await say('mira', 'Ich ritze die Rinde vorsichtig mit der Axtspitze an.'); if (se === 'fr') await say('mira', 'Klarer Saft tropft heraus – genau zur richtigen Jahreszeit!'); else await say('mira', 'Kein Tropfen. Der Baum gibt seinen Saft nur im Frühling her.'); },
        eimer: async () => { if (!F('birkeKerbe')) return say('mira', 'Erst muss ich die Birke anritzen.'); if (se !== 'fr') { sfx('fail'); return say('mira', 'Ich halte den Eimer unter die Kerbe – kein Tropfen. Birken zapft man nur im Frühling.'); } setF('eimerStellt'); await sleep(500); swap('eimer', 'eimerSaft'); sfx('success'); await say('mira', 'Tropfen für Tropfen füllt sich der Eimer. Klarer, leicht süßer Birkensaft!'); setF('eimerStellt', false); }
      }
    });
    list.push({
      id: 'wasser', name: 'See', r: [490, 376, 470, 70], walk: 400, face: 1, draw() { },
      look: async () => say('mira', { fr: 'Der See glitzert im Frühlingslicht. Das Wasser ist eiskalt.', so: 'Der See liegt ruhig und blau da.', he: 'Der Nebel liegt in Streifen über dem Wasser. Der See wirkt still und tief.', wi: 'Der See ist zugefroren. Das Eis ist dick – aber über einer warmen Quelle wäre es dünn.' }[se]),
      use: async () => say('mira', 'Ich tunke einen Finger ins Wasser. Kalt. Ich glaube, ich bleibe an Land.'),
      items: { flasche: async () => { if (se === 'wi') return say('mira', 'Das Eis ist zu dick. Ich müsste die dünne Stelle finden.'); swap('flasche', 'flascheSee'); sfx('use'); await say('mira', 'Ich fülle die Flasche mit gewöhnlichem Seewasser.'); } }
    });
    if (se === 'wi') list.push({
      id: 'eis', name: F('aschespur') ? 'Aschestelle' : 'Eis', r: [640, 430, 260, 60], walk: 620, face: 1,
      draw(c) { if (F('aschespur')) { for (let x = 330; x < 440; x += 3) px(c, x, 217 + (x % 5 === 0 ? 1 : 0), 3, 3, '#3a3a46'); px(c, 425, 214, 10, 6, '#3a7aa8'); px(c, 427, 215, 6, 3, '#5ab0d8'); } },
      look: async () => say('mira', F('aschespur') ? 'Die Asche ist ins Eis eingeschmolzen. Der Streifen führt zu einer dünnen Stelle mit warmer Quelle darunter. Ein Pfad zur Insel!' : 'Dickes Eis. Wo es dünn ist, wüsste ich gern – über einer warmen Quelle schmilzt dunkle Asche schneller ein.'),
      use: async () => say('mira', F('aschespur') ? 'Ich prüfe das Eis mit dem Fuß. Der Aschestreifen trägt.' : 'Ich prüfe das Eis mit dem Fuß. Es knackt. Ich sollte die dünne Stelle finden, bevor ich weitergehe.'),
      items: {
        kesselAsche: async () => { if (F('aschespur')) return; swap('kesselAsche', 'kessel'); setF('aschespur'); sfx('use'); await say('mira', 'Ich streue die kalte Asche aufs Eis. Nach einer Weile schmilzt sie an einer Stelle ein – Wärme von unten! Dort ist das Eis dünn. Dort liegt die Quelle – und der sichere Weg zur Insel.'); note('Die Asche schmilzt über der warmen Quelle ein: Die dünne Stelle am See ist markiert.'); },
        flasche: async () => { if (!F('aschespur')) return say('mira', 'Ohne die dünne Stelle komme ich nicht ans Wasser.'); swap('flasche', 'flascheQuelle'); sfx('use'); await say('mira', 'Ich schöpfe an der Aschestelle: Lauwarmes Quellwasser! Es gefriert nicht einmal im tiefsten Winter.'); }
      }
    });
    const nebel = archExit('wald', 'Nebelpfad', 690, GY + 6, 110, () => F('trankGetrunken'), 'Nebel wabert zwischen den Birken – ich sehe keine zwei Schritte weit. Ohne Hilfe finde ich hier nie hinein.', 84);
    nebel.items = { trank: async () => { if (F('trankGetrunken')) return; take('trank'); setF('trankGetrunken'); sfx('success'); await say('mira', 'Ich trinke den Trank in einem Zug. Er schmeckt nach Minze und Regen. Der Nebel klart auf: Ich sehe einen Pfad zwischen den Stämmen!'); } };
    list.push(nebel);
    list.push(edgeExit('l', 'markt', 'Zum Händlerlager', 850, null));
    list.push(edgeExit('r', 'insel', 'Über das Eis zur Insel', 110, () => curSeason() === 'wi' && F('aschespur'), 'Die Insel liegt weit draußen. Im Sommer ist da nur Wasser, und im Winter ist das Eis tückisch. Ich müsste die dünne Stelle kennen.'));
    return list;
  },
  async onEnter() { if (!F('introSee')) { setF('introSee'); await say('mira', 'Ein stiller See mit Nebel über dem Wasser. Weit draußen sehe ich eine kleine Insel.'); } }
};
async function orinTalk() {
  if (!F('orinMet')) { setF('orinMet'); await say('orin', 'Ah – die Sterne haben dich angekündigt! Ich bin Orin. Du suchst Elias.'); await say('mira', 'Woher weißt du …?'); await say('orin', 'Er ist hier vorbeigekommen. Er floh in den Nebelwald, der bei den Birken beginnt. Ohne Klarsicht-Trank findest du den Weg nicht.'); setF('orinInfo'); note('Orin: Elias ist in den Nebelwald geflohen. Der Klarsicht-Trank ist nötig (Rezept im Kräuterlager).'); }
  await talkLoop([
    { t: 'Wie komme ich zur Insel?', show: () => !F('sWi'), fn: async () => { await say('orin', 'Im Winter friert der See zu. Doch unter dem Eis sprudelt eine warme Quelle, und dort ist es dünn. Streue dunkle Asche aufs Eis – über der Quelle schmilzt sie ein und zeigt dir den Weg.'); await say('orin', 'Auf der Insel steht ein Engel aus Stein. Sein Schatten zeigt im Winter, wo der Schatz liegt. Aber graben kannst du dort nur, wenn der Boden nicht gefroren ist – also in einer anderen Jahreszeit.'); note('Orin: Insel im Winter über das Eis (Aschespur). Der Winterschatten des Engels verrät, wo zu graben ist – gegraben wird in einer wärmeren Jahreszeit.'); } },
    { t: 'Ich habe das Wintersiegel gefunden!', show: () => F('sWi') && !F('orinSiegel'), fn: async () => { setF('orinSiegel'); await say('orin', 'Wunderbar! Die Sterne hatten recht. Jedes Sternbild hat seine Zeit – keines regiert allein, und doch ist es ein Himmel.'); insight('Jedes Sternbild hat seine Zeit – keines regiert allein, und doch ist es ein Himmel.'); } },
    { t: 'Was siehst du in den Sternen?', show: () => true, fn: async () => say('orin', 'Dass du zu viel fragst und zu wenig schläfst. Und dass der Nordstern nie weit wandert.') },
    { t: 'Ich brauche den Klarsicht-Trank. Wie geht das?', show: () => !has('trank') && !F('trankGetrunken'), fn: async () => say('orin', 'Zutaten: Quellwasser – findest du unter dem Eis im Winter –, Birkensaft aus der Birke hier im Frühling, und Zunder. Fenn hat einen Eimer, wenn du ihm einen Kürbis bringst.') }
  ]);
}

/* ======================= INSEL DES ENGELS ======================= */
const SUN_ELEV = { fr: 40, so: 63.5, he: 40, wi: 16.5 };
const ANGEL_H = 112, ANGEL_X = 150;
const shadowLen = se => ANGEL_H / Math.tan(SUN_ELEV[se] * Math.PI / 180);
SC.insel = {
  id: 'insel', title: 'Insel des Engels', natural: 'he', minX: 50, maxX: 880, startX: 120,
  land(c, se) { drawBG(c, se, { ox: 330 }); },
  dyn(c, t, se) { pxWater(c, se, 0, 170, 480, 270, t); drawGroundRange(c, se, 60, 900); px(c, 28, 226, 2, 4, PX.ink); },
  objs() {
    const se = curSeason(), list = [], L = shadowLen(se), ex = ANGEL_X + L;
    list.push({
      id: 'engel', name: 'Steinerner Engel', r: [ANGEL_X - 60, 340, 120, 140], walk: ANGEL_X + 80, face: -1,
      draw(c) { c.fillStyle = 'rgba(10,8,30,.38)'; c.beginPath(); c.moveTo(ANGEL_X - 20, GY + 4); c.lineTo(ANGEL_X + 20, GY + 4); c.lineTo(ex + 10, GY - 4); c.lineTo(ex - 10, GY - 4); c.closePath(); c.fill(); spr(c, 'angel', ANGEL_X, GYB + 2, { s: 2 }); },
      look: async () => { if (se === 'wi') { setF('schattenGesehen'); note('Im Winter (Sonne nur 16,5° hoch) ist der Mittagsschatten des Engels am längsten: Er endet am großen Felsen rechts.'); await say('mira', 'Der Winterschatten ist lang – sehr lang. Seine Spitze endet genau am großen Felsen rechts, weit hinten. Länge = Höhe geteilt durch Tangens der Sonnenhöhe: Bei nur 16,5° ist der Schatten fast dreimal so lang wie der Engel hoch.'); } else await say('mira', 'Ein steinerner Engel. Sein Schatten ist ' + (se === 'so' ? 'im Hochsommer ganz kurz – die Sonne steht fast senkrecht' : 'mittellang – die Sonne steht nur mäßig hoch') + '. Die Spitze liegt nicht bei einem der großen Felsen.'); },
      use: async () => say('mira', 'Ich streiche über den kalten Stein. Der Engel schweigt.')
    });
    [[ANGEL_X + shadowLen('so'), 'kleiner Felsen', 'rock_' + se + '_a', 3], [ANGEL_X + shadowLen('he'), 'Felsen', 'rocks_' + se, 2], [ANGEL_X + shadowLen('wi'), 'großer Felsen', 'bigrock_' + se, 2]].forEach(([x, nm, sp, sc], i) => {
      list.push({
        id: 'fels' + i, name: nm, r: sprR(sp, x, GYB + 4, 6).map((v, k) => k > 1 && sc === 3 ? v : v), walk: x - 60, face: 1,
        draw(c) { spr(c, sp, x, GYB + 4, { s: sc }); },
        look: async () => say('mira', i === 2 ? 'Ein mächtiger Felsen am Ende der Insel. Er steht genau dort, wo im Winter der Schatten des Engels endet.' : 'Ein Felsen, so wie es viele gibt. Nichts Besonderes.'),
        use: async () => say('mira', 'Ich klopfe an den Stein. Er ist fest.'),
        items: { axt: async () => {
          if (i !== 2) { sfx('fail'); return say('mira', 'Ich grabe ein bisschen am Fuß des Felsens. Nichts. Nur Sand und Steine.'); }
          if (se === 'wi') { sfx('fail'); return say('mira', 'Der Boden ist steinhart gefroren – die Axt prallt ab. Ich müsste in einer wärmeren Jahreszeit graben.'); }
          if (!F('schattenGesehen')) { sfx('fail'); return say('mira', 'Warum ausgerechnet hier graben? Ich brauche einen Hinweis, wo das Siegel liegt.'); }
          if (F('sWi')) return; give('siegelWi'); setF('sWi'); sfx('success'); await say('mira', 'Ich grabe am Fuß des großen Felsens – und die Axt klirrt auf Metall! Ein Kästchen mit dem Wintersiegel!'); note('Wintersiegel gefunden. Orin freut sich sicher.');
        } }
      });
    });
    list.push(edgeExit('l', 'see', 'Zurück zum Seeufer', 850, null));
    return list;
  },
  async onEnter() { if (!F('introInsel')) { setF('introInsel'); await say('mira', 'Die Insel! Mitten im Eis. Ein steinerner Engel und drei Felsen. Sein Schatten zeigt bestimmt etwas.'); } }
};

/* ======================= WALD DER WIEDERHOLTEN WEGE ======================= */
const WALD_OK = [1, 2, 0];
SC.wald = {
  id: 'wald', title: 'Wald der wiederholten Wege', natural: 'he', switchable: false, minX: 50, maxX: 880, startX: 110, noTravel: true,
  land(c, se) {
    drawBG(c, 'he', { ox: 0, tint: 'rgba(30,60,50,.45)' }); drawGround(c, 'he', 231, '#151a14');
    spr(c, 'trunk', 40, GY + 120, { s: 2 }); spr(c, 'trunk', 920, GY + 120, { s: 2 });
    c.fillStyle = 'rgba(200,225,210,.16)'; c.fillRect(0, 0, W, H);
  },
  objs() {
    const list = [], stage = S.flags.waldStage || 0, xs = [200, 480, 760];
    xs.forEach((x, i) => {
      list.push({
        id: 'pfad' + i, name: 'Pfad ' + ['links', 'in der Mitte', 'rechts'][i], r: [x - 70, 260, 140, 220], walk: x, face: 1,
        draw(c, t) {
          for (let k = 0; k < 44; k++) px(c, x / 2 - 22 + (k % 2 ? 1 : 0), GY / 2 - 46 + k, 44 - (k % 2 ? 2 : 0), 1, k < 3 ? '#3a2a1a' : `rgb(${26 + k / 4},${22 + k / 4},${24 + k / 3})`);
          px(c, x / 2 - 23, GY / 2 - 47, 46, 1, PX.ink);
          if (stage === 0) { const nm = ['cloud3', 'cloud6', 'cloud2'][i]; spr(c, nm, x, 300 + Math.sin(t + i) * 3, { s: nm === 'cloud6' ? 1 : 2 }); }
          else if (stage === 1) { const cnt = [5, 3, 12][i], rr = R(300 + i); for (let k = 0; k < cnt; k++) { const bx = x - 50 + rr() * 100, by = 230 + rr() * 70 + Math.sin(t * 3 + k) * 4, n = 1 + (k % 2); spr(c, 'bird' + (k % 2 ? 1 : 2), bx, by, { s: 2 }); void n; } }
          else { const nm = ['pine_wi', 'pine_he', 'pine_so'][i]; spr(c, nm, x, 400, { s: 1 }); }
        },
        look: async () => say('mira', stage === 0 ? 'Über dem Pfad hängt eine Wolke. ' + ['Sie sieht aus wie ein Fisch.', 'Sie ragt spitz auf, hoch wie ein Berg.', 'Sie sieht aus wie ein schlafender Vogel.'][i] : stage === 1 ? 'Ein Vogelschwarm kreist über dem Pfad – ' + ['fünf', 'nur drei', 'ein riesiger Schwarm'][i] + ' Vögel.' : 'Am Pfadrand steht ' + ['ein Baum im weißen Kleid – verschneit, obwohl es Herbst ist', 'ein kahler, toter Baum', 'ein grünender Sommerbaum'][i] + '.'),
        use: async () => {
          if (F('waldOk')) return say('mira', 'Der Nebel ist gelichtet – der Weg nach rechts steht offen.');
          if (i === WALD_OK[stage]) {
            S.flags.waldStage = stage + 1; sfx('success');
            if (stage === 2) { setF('waldOk'); await say('mira', 'Und dann steht sie da: eine kleine Lichtung. Der Nebel lichtet sich. Der Weg ist geschafft – nach rechts geht es weiter!'); note('Wald geschafft: Wolke wie ein Berg, größter Vogelschwarm, Baum im weißen Kleid.'); }
            else await say('mira', ['Ich folge dem Pfad unter der Wolke, die wie ein Berg aussieht. Der Nebel wird lichter – die nächste Weggabelung!', 'Ich folge dem größten Vogelschwarm. Noch eine Weggabelung – und wieder Nebel.'][stage]);
          } else { S.flags.waldStage = 0; S.x = 110; S.target = null; sfx('fail'); await say('mira', 'Der Nebel dreht sich wie ein Wirbel – und plötzlich stehe ich wieder am Waldrand. Falscher Weg! Wo hat Lio den Reim wieder gehört …?'); }
        }
      });
    });
    list.push({ id: 'etappe', name: '', r: [0, 0, 0, 0], draw(c) { txt(c, F('waldOk') ? 'Der Nebel ist gelichtet' : 'Etappe ' + (stage + 1) + ' von 3', W / 2, 64, 22, '#fff', 'center'); }, use: async () => { } });
    list.push(edgeExit('l', 'see', 'Zurück zum See', 600, null));
    list.push(edgeExit('r', 'hain', 'Zum Gedächtnishain', 110, () => F('waldOk'), 'Zwischen den Nebelschwaden verzweigt sich der Weg dreifach. Ich muss den richtigen finden.'));
    return list;
  },
  async onEnter() { if (!F('introWald')) { setF('introWald'); await say('mira', 'Dichter Nebel – und ich kann dank des Tranks trotzdem sehen. Drei Pfade, und ich weiß nicht, welcher der richtige ist.'); await say('mira', 'Lio kannte einen Reim für den Nebelwald. Ich sollte sie fragen – aber falsch abgebogen wird man einfach zum Anfang geführt.'); } }
};

/* ======================= GEDÄCHTNISHAIN ======================= */
const HAIN_IMG = ['garbe', 'keim', 'sack', 'weizen'], HAIN_ORDER = ['keim', 'weizen', 'garbe', 'sack'];
const HAIN_SPR = { garbe: 'wheat_bundle', keim: 'wheat0', sack: 'wheat_sack', weizen: 'wheat3' };
SC.hain = {
  id: 'hain', title: 'Gedächtnishain', natural: 'wi', minX: 50, maxX: 880, startX: 110,
  land(c, se) { drawBG(c, se, { ox: 400 }); drawGround(c, se); spr(c, 'pine_' + se, 920, GY + 60); },
  objs() {
    const se = curSeason(), list = [], seq = S.hain || (S.hain = []);
    HAIN_IMG.forEach((k, i) => {
      const x = 270 + i * 170;
      list.push({
        id: 'stumpf' + i, name: 'Baumstumpf', r: [x - 44, 380, 88, 96], walk: x, face: 1,
        draw(c, t) {
          spr(c, 'stump1', x, GYB + 4, { s: 2 });
          if (se === 'he') { const y = 350 + Math.sin(t * 2 + i) * 5, on = seq.includes(k); c.fillStyle = on ? 'rgba(255,240,150,.55)' : 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(x, y - 14, 38, 0, 7); c.fill(); spr(c, HAIN_SPR[k], x, y + 4, { s: 3 }); }
        },
        look: async () => say('mira', se === 'he' ? 'Über dem Stumpf schwebt ein Erinnerungsbild: ' + { garbe: 'eine Garbe', keim: 'ein zarter Keimling', sack: 'ein Sack Mehl', weizen: 'ein reifer Weizenhalm' }[k] + '.' : 'Ein alter Baumstumpf. Er ist still. Die Erinnerungen erwachen nur im Herbst.'),
        use: async () => {
          if (F('hainGeordnet')) return say('mira', 'Die Erinnerungen sind geordnet. Der hohle Stamm hat sich geöffnet.');
          if (se !== 'he') return say('mira', 'Der Stumpf schweigt. Die Erinnerungen erwachen nur im Herbst – ich muss den Hain auf Herbst stellen.');
          if (seq.includes(k)) return say('mira', 'Diese Erinnerung habe ich schon geordnet.');
          if (k === HAIN_ORDER[seq.length]) { seq.push(k); sfx('pick'); if (seq.length === 4) { setF('hainGeordnet'); sfx('success'); await say('mira', 'Keimling, reifer Weizen, Garbe, Sack – die Erinnerung ist vollständig: ein Kreislauf! Der hohle Stamm öffnet sich knarrend.'); } else await say('mira', 'Das Bild leuchtet golden auf und bleibt.'); }
          else { S.hain = []; sfx('fail'); await say('mira', 'Die Bilder verblassen – falsche Reihenfolge! Wie wächst das Getreide auf dem Feld? Vom Keimling bis zum Sack.'); }
        }
      });
    });
    list.push({
      id: 'stamm', name: 'Hohler Stamm', r: [100, 320, 110, 160], walk: 190, face: -1,
      draw(c, t) { spr(c, 'trunk', 150, GY + 100, { s: 2 }); const open = F('hainGeordnet'); px(c, 66, GY / 2 - 52, 18, 34, PX.ink); px(c, 67, GY / 2 - 51, 16, 32, open ? '#ffe28a' : '#0e0806'); if (open && !F('sHe')) { px(c, 71, GY / 2 - 34 + Math.round(Math.sin(t * 3)), 8, 8, '#e77b26'); px(c, 73, GY / 2 - 32 + Math.round(Math.sin(t * 3)), 4, 4, '#ffd06a'); } },
      look: async () => say('mira', F('hainGeordnet') ? 'Der Stamm ist geöffnet – dahinter leuchtet etwas.' : 'Ein hohler Stamm, innen dunkel. Er scheint auf etwas zu warten.'),
      use: async () => { if (!F('hainGeordnet')) return say('mira', 'Nur Dunkelheit. Der Stamm öffnet sich, wenn ich die Erinnerungen ordne.'); if (F('sHe')) return say('mira', 'Nur noch Blätter.'); give('siegelHe'); setF('sHe'); sfx('success'); await say('mira', 'Im Stamm liegt das Herbstsiegel – warm und raschelnd. Elias hat es hier zurückgelassen.'); note('Herbstsiegel gefunden. Der Weg zum Schlosstor ist frei.'); }
    });
    list.push(edgeExit('l', 'wald', 'Zurück in den Wald', 850, null));
    list.push(edgeExit('r', 'tor', 'Zum Schlosstor', 110, () => F('sHe'), 'Der Weg zum Schloss ist von Nebel versperrt. Ich brauche erst das Herbstsiegel.'));
    return list;
  },
  async onEnter() { if (!F('introHain')) { setF('introHain'); await say('mira', 'Eine stille Lichtung mit vier Baumstümpfen im Kreis und einem hohlen Stamm. Was für ein Ort. Irgendetwas ist hier verborgen.'); note('Hain: Im Herbst zeigen die Stümpfe Erinnerungsbilder. Die richtige Reihenfolge: Wie wächst das Getreide auf dem Feld?'); } }
};

/* ======================= SCHLOSSTOR ======================= */
SC.tor = {
  id: 'tor', title: 'Schlosstor', natural: 'he', minX: 50, maxX: 880, startX: 110,
  land(c, se) {
    drawBG(c, se, { ox: 100, sy: 30, castle: true }); drawGround(c, se);
    for (let r = 0; r < 3; r++) for (let x = 420; x < W + 100; x += 100) spr(c, 'wall', x + 50, GYB - r * 100, { s: 2 });
    px(c, 320, GY / 2 - 152, 160, 6, PX.stone2); for (let x = 320; x < 480; x += 20) px(c, x, GY / 2 - 158, 10, 6, PX.stone2);
    px(c, 302, GY / 2 - 74, 56, 2, PX.ink); px(c, 304, GY / 2 - 72, 52, 74, '#0e0a14'); px(c, 300, GY / 2 - 76, 4, 78, PX.ink); px(c, 356, GY / 2 - 76, 4, 78, PX.ink);
  },
  objs() {
    const se = curSeason(), list = [];
    list.push(npc('brann', 'Brann', 500, -1, 470, 1, 'Brann, der Torwächter. Ein Schwert an der Hüfte, Sorgenfalten auf der Stirn – kein böser Mensch, nur ein einsamer.', () => brannTalk(), { items: { zweig: async () => {
      if (F('torOffen')) return; take('zweig'); setF('torOffen'); sfx('success');
      await say('brann', 'Ein Apfelblütenzweig … Ich habe seit Jahren keinen mehr gesehen. Er duftet wie Avelines Garten im Frühling.');
      await say('brann', 'Das Tor ist offen. Geh zum Fürsten. Ein Wächter, der nur einem Herrn dient, bewacht am Ende eine leere Halle – ich hätte früher etwas sagen sollen.');
      insight('Ein Wächter, der nur einem Herrn dient, bewacht am Ende eine leere Halle.'); note('Das Schlosstor ist offen. Corvin wartet auf dem Schlossberg.');
    } } }));
    list.push({
      id: 'gitter', name: 'Gittertor', r: [600, 300, 200, 180], walk: 560, face: 1,
      draw(c, t) { const open = F('torOffen'), up = open ? 70 : 0; for (let i = 0; i < 10; i++) { px(c, 312 + i * 5, GY / 2 - 72 - up, 2, 70, '#4a4a5a'); } px(c, 306, GY / 2 - 60 - up, 50, 2, '#4a4a5a'); px(c, 306, GY / 2 - 30 - up, 50, 2, '#4a4a5a'); for (const x of [270, 400]) { px(c, x, GY / 2 - 50, 4, 50, PX.wood); spr(c, anim('torch', 3, t, 10, x), x * 2 + 4, GY / 2 * 2 - 100 + 40 + 12, { s: 3 }); } },
      look: async () => say('mira', F('torOffen') ? 'Das Gittertor ist offen. Dahinter führt der Weg zum Schlossberg.' : 'Ein schweres Gittertor, mit Fackeln zu beiden Seiten. Brann steht davor.'),
      use: async () => F('torOffen') ? gotoScene('schloss', 110) : say('mira', 'Das Gitter ist fest verschlossen. Brann schaut mich an.')
    });
    list.push({
      id: 'graeber', name: 'Gräber', r: [100, 400, 210, 80], walk: 330, face: -1,
      draw(c) { spr(c, 'grave_a', 140, GYB + 6, { s: 3 }); spr(c, 'grave_b', 230, GYB + 10, { s: 3 }); spr(c, sv('bush', se), 300, GYB + 8, { s: 2 }); },
      look: async () => { await say('mira', 'Zwei Gräber am Tor. Die Inschriften: "Avelines Eltern – im Wechsel der Zeiten geborgen".'); await say('mira', 'Aveline … Corvins Frau. Ihre Eltern sind hier begraben, nicht sie selbst.'); },
      use: async () => say('mira', 'Ich stehe einen Moment still. Manche Orte verlangen das.')
    });
    list.push({
      id: 'statue', name: 'Statue', r: sprR('statue', 370, GYB, 6), walk: 350, face: 1, draw(c) { spr(c, 'statue', 370, GYB + 4, { s: 3 }); },
      look: async () => say('mira', 'Eine Statue – eine junge Frau mit sanftem Lächeln. Aveline, laut der Inschrift. Sie sieht aus, als würde sie gerade in eine andere Jahreszeit blicken.'),
      use: async () => say('mira', 'Ich lege die Hand auf den Sockel. Er ist glatt vom Regen vieler Jahre.')
    });
    list.push(edgeExit('l', 'hain', 'Zum Hain', 850, null));
    return list;
  },
  async onEnter() { if (!F('introTor')) { setF('introTor'); await say('mira', 'Das Schlosstor! Mauern mit Fackeln, ein Gittertor – und auf dem Weg dahin ein kleiner Friedhof.'); } }
};
async function brannTalk() {
  if (!F('brannMet')) { setF('brannMet'); await say('brann', 'Halt. Das Tor ist zu. Fürst Corvin empfängt niemanden.'); await say('mira', 'Ich bin Mira. Ich möchte nur mit ihm reden.'); await say('brann', 'Viele wollten das. Keiner kam zurück, wie er ging.'); }
  await talkLoop([
    { t: 'Wer liegt in diesen Gräbern?', show: () => true, fn: async () => { await say('brann', 'Avelines Eltern. Ich war Avelines Leibwächter. Sie liebte den Frühling, und ich bringe ihren Eltern immer einen Zweig Apfelblüten. Aber ich darf mein Tor nicht verlassen – und im Herbst blüht kein Apfelbaum.'); setF('brannZweig'); note('Brann sehnt sich nach einem blühenden Apfelblütenzweig (Dorfplatz im Frühling, mit der Axt).'); } },
    { t: 'Lass mich bitte durch.', show: () => !F('torOffen'), fn: async () => { await say('brann', 'Nur, wenn du mir etwas bringst, das ich seit Jahren nicht sah: einen blühenden Apfelblütenzweig.'); note('Brann öffnet das Tor gegen einen Apfelblütenzweig.'); } },
    { t: 'Ich bin schon durch?', show: () => F('torOffen'), fn: async () => say('brann', 'Geh. Und bring ihn zur Vernunft. Bitte.') }
  ]);
}

/* ======================= SCHLOSSBERG ======================= */
SC.schloss = {
  id: 'schloss', title: 'Schlossberg', natural: 'so', switchable: false, minX: 50, maxX: 880, startX: 110,
  land(c, se) {
    drawBG(c, 'so', { ox: 100, sy: 30, castle: true, tint: 'rgba(255,205,90,.22)' }); drawGround(c, 'so');
    for (let x = 40; x < W; x += 54) spr(c, 'wheat3', x, GY - 4 + (x % 3) * 2, { s: 2 });
    c.fillStyle = 'rgba(255,215,100,.08)'; c.fillRect(0, 0, W, H);
  },
  dyn(c, t) { drawParticles(c, t, 'so'); },
  objs() {
    const list = [];
    list.push(npc('corvin', 'Fürst Corvin', 340, 1, 390, -1, 'Fürst Corvin. Sein Gewand ist edel, sein Blick müde. Er sieht aus wie jemand, der seit Ewigkeiten nicht mehr geschlafen hat.', () => corvinTalk()));
    list.push({
      id: 'grab', name: 'Avelines Grab', r: [110, 380, 140, 100], walk: 210, face: -1,
      draw(c) { spr(c, 'grave_d', 180, GYB + 6, { s: 3 }); ['#ffb6d1', '#ffd84a', '#e77b26', '#c8e0ff', '#ffb6d1', '#ffd84a'].forEach((col, i) => { px(c, 62 + i * 8, GY / 2 + 1 + (i % 2), 4, 4, col); px(c, 63 + i * 8, GY / 2 + 5 + (i % 2), 1, 3, '#3a8a3a'); }); },
      look: async () => { await say('mira', 'Avelines Grab. Blumen aus allen vier Jahreszeiten liegen darauf – und jede sieht frisch aus.'); await readDoc('Avelines Grab', ['„Aveline, geliebte Gefährtin. Sie liebte den Wechsel der Zeiten."', '', 'Und darunter, mit anderer Hand: „Halte mich nicht fest. Lass mich in jedem Jahr wiederkehren."']); insight('Sie lebte im Wechsel der Zeiten – nicht in einem festgehaltenen Tag.'); },
      use: async () => say('mira', 'Ich verneige mich kurz. Sie hat es verdient.')
    });
    list.push({
      id: 'schale', name: 'Siegelschale', r: [480, 360, 110, 120], walk: 480, face: 1,
      draw(c, t) { spr(c, 'pedestal', 540, GYB + 4, { s: 3 }); if (F('schaleOk')) { c.fillStyle = 'rgba(255,240,150,.25)'; c.beginPath(); c.arc(540, GYB - 120, 70 + Math.sin(t * 3) * 6, 0, 7); c.fill(); } const pos = [[0, -6], [8, 0], [0, 6], [-8, 0]], cols = ['sFr', 'sSo', 'sWi', 'sHe'], cc = ['#ffb6d1', '#ffd84a', '#a9d8ff', '#e77b26']; cols.forEach((f, i) => { if (F('schaleOk') || F(f)) px(c, 270 + pos[i][0] - 2, GYB / 2 - 62 + pos[i][1], 5, 5, cc[i]); }); },
      look: async () => say('mira', 'Eine Schale mit vier Mulden, jede mit dem Zeichen einer Jahreszeit. Hier gehören die vier Siegel hin.'),
      use: async () => {
        if (F('schaleOk')) return say('mira', 'Die Siegel ruhen in der Schale.');
        if (!(F('sFr') && F('sSo') && F('sHe') && F('sWi'))) return say('mira', 'Ich brauche alle vier Siegel: ' + [F('sFr') ? '' : 'Frühling', F('sSo') ? '' : 'Sommer', F('sHe') ? '' : 'Herbst', F('sWi') ? '' : 'Winter'].filter(Boolean).join(', ') + ' fehlt noch.');
        await say('mira', 'Vier Mulden: oben, rechts, unten, links. Elias schrieb: nach dem Lauf der Sonne.'); ui = 'ring'; ringKind = 'schale'; await new Promise(res => { ringDone = res; }); if (F('schaleOk')) await schaleSequence();
      }
    });
    list.push({
      id: 'riss', name: 'Riss zwischen den Zeiten', r: [640, 250, 240, 230], walk: 620, face: 1,
      draw(c, t) { if (F('eliasFrei')) return; spr(c, anim('portal', 10, t, 10), 770, GYB + 10, { s: 4 }); drawChar(c, 770, GY - 4, CHAR.elias, { dir: -1, t, a: .55 }); },
      look: async () => say('mira', F('eliasFrei') ? 'Der Riss hat sich geschlossen.' : 'Ein Riss mitten in der Luft, hinter dem sich die Jahreszeiten drängen. Und darin: Elias! Er sieht mich, aber ich höre ihn kaum.'),
      use: async () => say('mira', F('eliasFrei') ? 'Nichts mehr da.' : 'Ich strecke die Hand aus – sie prallt an einer unsichtbaren Wand ab. Ich brauche die Siegelschale!')
    });
    if (F('eliasFrei')) list.push(npc('elias', 'Elias', 740, -1, 690, 1, 'Elias, endlich frei. Sein Bart ist ein bisschen weißer geworden.', () => eliasTalk()));
    list.push(edgeExit('l', 'tor', 'Zum Schlosstor', 800, null));
    return list;
  },
  async onEnter() { if (!F('introSchloss')) { setF('introSchloss'); await say('mira', 'Ein ewiger Sommertag! Alles glüht golden, die Ähren stehen reif. Wie ein Gemälde, das nie trocknet.'); await say('mira', 'Das ist also das Herz der ganzen Sache: der Schlossberg. Und dort – Fürst Corvin.'); } },
  async onSeason() { }
};
async function corvinTalk() {
  if (!F('corvinMet')) { setF('corvinMet'); await say('corvin', 'Du bist weit gekommen. Sehr weit. Wer bist du?'); await say('mira', 'Mira, Elias\' Schülerin. Ich habe die Siegel gesammelt. Fürst, dieser Sommer muss enden.'); await say('corvin', 'Nein. An diesem Tag hat Aveline gelacht. Wenn der Tag vergeht, vergeht sie mit ihm.'); }
  await talkLoop([
    { t: 'Hör mich an, Corvin.', show: () => !F('corvinZweifel'), fn: async () => { await say('mira', 'Draußen im Tal reifen die Ähren nicht. Der Weizen fault am Halm, die Kinder frieren mitten im Herbst. Avelines Grab liegt hier – aber sie liegt nicht in diesem Tag.'); await say('corvin', '… Du sprichst wahr. Doch Worte sind nicht sie. Wenn du mir Avelines eigene Worte bringst – ihre Stimme –, dann würde ich zuhören.'); setF('corvinZweifel'); setF('tagebuchZiel'); note('Corvin will Avelines eigene Worte hören. Ihr Tagebuch liegt irgendwo im Adlerhorst (nur mit dem Ballon erreichbar).'); } },
    { t: 'Hör, was Aveline in ihr Tagebuch geschrieben hat.', show: () => has('tagebuch') && !F('sSo'), fn: async () => {
      await say('mira', '„Mein Liebster, du fragst, warum ich die Jahreszeiten liebe. Weil nichts in der Welt stillsteht, und weil ich das Wiederkommen mehr liebe als das Bleiben. Halte nichts fest – ich werde in jedem Jahr sein, das du weiterlebst."');
      await say('corvin', '… Sie hat es gewusst. Sie hat gewusst, dass ich sie festhalten würde – und ich habe es trotzdem getan.'); await say('corvin', 'Hier. Das Sommersiegel. Nimm es. Lass die Zeit wieder fließen.');
      give('siegelSo'); setF('sSo'); sfx('success'); note('Corvin gab mir das Sommersiegel. Alle vier Siegel gehören in die Siegelschale.');
    } },
    { t: 'Warum dieser Tag?', show: () => true, fn: async () => say('corvin', 'Es war der letzte Sommertag, an dem sie mit mir tanzte. Danach kam der Herbst, dann ihr Fieber. Ich wollte nur einen Tag länger.') }
  ]);
}
async function schaleSequence() {
  sfx('season'); flash = 1; await sleep(600); setF('eliasFrei'); landKey = '';
  await say('mira', 'Die Siegel leuchten – Frühling, Sommer, Herbst, Winter. Der Riss knistert, flackert – und öffnet sich!');
  await say('elias', 'Mira! Ich wusste, dass du den Weg findest. Nur du konntest es.');
  await say('mira', 'Elias! Du lebst. Du hast alles hinterlassen und bist verschwunden …');
  await say('elias', 'Ich musste. Die Siegel durften nicht in Corvins Hände fallen. Aber jetzt liegen sie in der Schale – und die Frage ist, was mit ihnen geschehen soll.');
  await say('elias', 'Die Entscheidung ist deine, Mira. Du hast das Herz getragen.');
  await chooseEnding();
}
async function eliasTalk() { await chooseEnding(); }
async function chooseEnding() {
  for (;;) {
    const n = S.insights.length, cOk = n >= INSIGHT_NEED;
    const i = await choice(['A – Wiederherstellung: Das Schloss hütet alle vier Siegel, der alte Jahreslauf kehrt zurück.', 'B – Freier Wandel: Die Bindung zerbrechen. Die Jahreszeiten folgen nur noch der Natur.', cOk ? 'C – Behutsame Neuordnung: Die Siegel werden auf die Hüter des Tals verteilt.' : 'C – (verschlossen: Ich habe erst ' + n + ' von 12 Einsichten, ich brauche mindestens ' + INSIGHT_NEED + ')', 'Ich muss noch nachdenken.']);
    if (i === 3) return;
    if (i === 2 && !cOk) { await say('elias', 'Dazu fehlt dir noch Verständnis für das Tal. Sprich mit seinen Hütern – Runa, Tovin, Selma, Nim, Orin, Hedda, Fenn, Brann, Ansgar. Oder lies noch einmal, was Aveline schrieb.'); continue; }
    await say('elias', ['Wiederherstellung – das Schloss hütet wieder alle Siegel. Ist das dein letztes Wort?', 'Freier Wandel – ohne Bindung, für immer unberechenbar. Sicher?', 'Behutsame Neuordnung – jedes Siegel in die Hände derer, die ihre Zeit kennen. Bist du sicher?'][i]);
    const j = await choice(['Ja, so soll es sein.', 'Nein, noch einmal überlegen.']); if (j === 0) { await startEnding(['A', 'B', 'C'][i]); return; }
  }
}
const INSIGHT_TOTAL = 12, INSIGHT_NEED = 6;

/* ======================= BALLONWIESE ======================= */
const AUFTRIEB = { fr: [10, 331], so: [28, 249], he: [10, 331], wi: [-8, 424] };
SC.ballonwiese = {
  id: 'ballonwiese', title: 'Ballonwiese', natural: 'so', minX: 50, maxX: 880, startX: 110,
  land(c, se) { drawBG(c, se, { ox: 480, layers: [1, 2, 3] }); drawGround(c, se); px(c, 352, GY / 2 - 40, 4, 42, PX.ink); px(c, 353, GY / 2 - 39, 2, 40, PX.wood2); spr(c, sv('bush', se), 120, GYB + 8); spr(c, sv('rocks', se), 860, GYB + 8); },
  objs() {
    const se = curSeason(), list = [];
    list.push({
      id: 'huelle', name: 'Ballonhülle', r: [410, 100, 190, 250], walk: 430, face: 1,
      draw(c, t) { pxBalloon(c, 250, 100, 46, 56, F('flickenAuf'), F('strohIm') && F('flickenAuf') && Math.sin(t * 2) > 5, t); },
      look: async () => say('mira', F('flickenAuf') ? 'Der Flicken hält: Die Hülle ist wieder dicht.' : 'Die Hülle hat ein riesiges Loch, mitten in der Seite. So kommt der Ballon nie hoch. Ein großer Flicken müsste her.'),
      use: async () => say('mira', 'Ich streiche über den Stoff. Er ist erstaunlich fest.'),
      items: { flicken: async () => { if (F('flickenAuf')) return; take('flicken'); setF('flickenAuf'); sfx('success'); await say('mira', 'Ich lege den Flicken aufs Loch und presse ihn fest. Er hält!'); }, tuch: async () => say('mira', 'Ein einfaches Tuch klebt nicht. Es muss mit Nadel und Garn ringsum vernäht werden – ein Flicken.') }
    });
    list.push({
      id: 'feuerkorb', name: 'Feuerkorb', r: [450, 400, 90, 60], walk: 400, face: 1,
      draw(c) { if (F('strohIm')) for (let i = 0; i < 4; i++) px(c, 242 + i * 4, GY / 2 - 4 + (i % 2) * 2, 2, 6, '#e8c23a'); },
      look: async () => say('mira', F('strohIm') ? 'Trockenes Stroh im Feuerkorb. Es brennt schnell und heiß – bereit zum Entzünden.' : 'Ein leerer Feuerkorb. Hier fehlt Brennstoff.'),
      use: async () => say('mira', 'Ohne Brennstoff bleibt er kalt.'),
      items: { stroh: async () => { if (F('strohIm')) return; take('stroh'); setF('strohIm'); sfx('use'); await say('mira', 'Ich stopfe die Strohgarben in den Feuerkorb. Mit einem Funken geht das in Flammen auf.'); }, holz: async () => say('mira', 'Holz brennt zu langsam. Stroh brennt schnell und heiß – der Brennstoff der ersten Ballonfahrer.') }
    });
    list.push({ id: 'korb', name: 'Ballonkorb', r: [452, 440, 100, 48], walk: 500, face: 1, draw() { }, look: async () => say('mira', 'Ein Weidenkorb. Genug Platz für eine Person und ein bisschen Ballast.'), use: async () => balloonLaunch() });
    list.push(edgeExit('l', 'markt', 'Zum Händlerlager', 810, null));
    return list;
  },
  async onEnter() { if (!F('introBallon')) { setF('introBallon'); await say('mira', 'Eine weite Wiese und darauf: ein alter Ballon. Er sieht aus, als hätte er schon bessere Tage gesehen – und ein Loch in der Seite.'); } }
};
async function balloonLaunch() {
  if (!F('flickenAuf')) return say('mira', 'Die Hülle hat ein riesiges Loch. Die Warmluft würde einfach entweichen.');
  if (!F('strohIm')) return say('mira', 'Ohne Brennstoff im Feuerkorb bringe ich keine heiße Luft zustande.');
  const se = curSeason(), [T, lift] = AUFTRIEB[se];
  if (lift < 335) { sfx('fail'); await say('mira', 'Ich zünde das Stroh an – der Ballon füllt sich, ruckelt, hebt ein Stück … und sinkt zurück. Bei ' + T + ' °C Außentemperatur trägt die Hülle nur etwa ' + lift + ' kg. Die Last beträgt aber 335 kg.'); await say('mira', 'Auftrieb = Volumen × (Dichte der kalten Luft – Dichte der heißen Luft). Je kälter draußen, desto dichter die Luft – desto mehr trägt sie. Es müsste kälter sein!'); note('Ballon: Auftrieb bei 28 °C nur 249 kg, bei 10 °C 331 kg – beides zu wenig für 335 kg Last. Bei −8 °C (Winter) 424 kg – das reicht.'); return; }
  sfx('fire'); await say('mira', 'Bei ' + T + ' °C Außentemperatur trägt die Hülle etwa ' + lift + ' kg – das reicht für meine 335 kg Last! Ich zünde das Stroh …');
  await fadeTo(1); sfx('season'); S.scene = 'adlerhorst'; S.x = 200; S.visited.adlerhorst = true; landKey = ''; await fadeTo(0);
  setF('flugGemacht'); await say('mira', 'Der Ballon steigt über die Wolken! Unter mir liegt das ganze Tal – die Jahreszeiten liegen wie bunte Flicken nebeneinander.'); await SC.adlerhorst.onEnter();
}

/* ======================= ADLERHORST ======================= */
SC.adlerhorst = {
  id: 'adlerhorst', title: 'Adlerhorst', natural: 'so', minX: 50, maxX: 880, startX: 200, noTravel: true,
  land(c, se) {
    drawBG(c, se, { ox: 50, sy: 0, layers: [1] }); drawGround(c, se, 231);
    for (let i = 0; i < 4; i++) { px(c, 42 + i * 34, GY / 2 - 88, 6, 88, PX.ink); px(c, 43 + i * 34, GY / 2 - 87, 4, 86, '#e8e2f0'); }
    px(c, 34, GY / 2 - 96, 130, 10, PX.ink); px(c, 36, GY / 2 - 94, 126, 6, '#c05a70'); px(c, 48, GY / 2 - 106, 100, 10, PX.ink); px(c, 50, GY / 2 - 104, 96, 6, '#c05a70');
  },
  dyn(c, t, se) { for (let i = 0; i < 5; i++) spr(c, ['cloud5', 'cloud4', 'cloud6', 'cloud5', 'cloud4'][i], 100 + i * 210 + Math.sin(t * .3 + i) * 10, 392 + (i % 2) * 14, { s: 2, a: .92 }); },
  objs() {
    const se = curSeason(), list = [];
    list.push({
      id: 'buste', name: 'Büste', r: [170, 380, 70, 100], walk: 200, face: 1, draw(c) { spr(c, 'bust', 210, GYB + 4, { s: 3 }); spr(c, 'pot_empty', 100, GYB + 4, { s: 2 }); spr(c, 'pot_empty', 300, GYB + 4, { s: 2 }); },
      look: async () => say('mira', 'Eine Marmorbüste einer jungen Frau: Aveline. Neben ihr stehen zwei Urnen – mit Erde aus allen vier Jahreszeiten.'), use: async () => say('mira', 'Ich verweile einen Moment. Man spürt, dass Aveline diesen Ort geliebt hat.')
    });
    list.push({
      id: 'nest', name: 'Storchennest', r: [560, 300, 160, 180], walk: 540, face: 1,
      draw(c, t) {
        spr(c, 'stump1', 650, GYB + 4, { s: 3 }); px(c, 304, GY / 2 - 66, 42, 4, '#8a6a3a'); for (let i = 0; i < 9; i++) px(c, 302 + i * 5, GY / 2 - 70 + (i % 2) * 2, 3, 5, '#a8824a');
        if (se === 'wi') { px(c, 302, GY / 2 - 72, 46, 5, '#fff'); px(c, 288, GY / 2 - 50, 10, 50, 'rgba(200,230,255,.6)'); }
        if (se === 'fr' || se === 'so') for (let i = 0; i < 2; i++) { const bx = 316 + i * 20; px(c, bx, GY / 2 - 94, 8, 24, '#f4f4f4'); px(c, bx, GY / 2 - 94, 8, 1, PX.ink); px(c, bx + 2, GY / 2 - 104 + Math.round(Math.sin(t * 2 + i)), 6, 10, '#f4f4f4'); px(c, bx + 7, GY / 2 - 102 + Math.round(Math.sin(t * 2 + i)), 10, 2, '#e83a3a'); px(c, bx + 3, GY / 2 - 70, 1, 4, '#e8a020'); }
        if (se === 'he' && !F('doseHat')) { px(c, 322, GY / 2 - 74, 8, 6, '#6a6a72'); px(c, 323, GY / 2 - 73, 6, 1, '#b8b8c0'); }
      },
      look: async () => say('mira', { fr: 'Im Nest brüten zwei Weißstörche. Sie klappern drohend, sobald ich näherkomme.', so: 'Zwei Störche füttern ihre Jungen und verteidigen das Nest laut klappernd.', he: 'Das Nest ist leer – die Störche sind schon nach Süden gezogen. Etwas Rostiges glänzt darin.', wi: 'Der Baumstumpf ist vereist – glatt wie Glas. Da klettere ich nicht hoch.' }[se]),
      use: async () => {
        if (se === 'fr' || se === 'so') { sfx('fail'); return say('mira', 'Ich komme nur einen Schritt näher – und schon fährt ein Storchenschnabel auf mich zu. Weißstörche ziehen erst im Spätsommer nach Süden. Ich sollte warten.'); }
        if (se === 'wi') { sfx('fail'); return say('mira', 'Ich rutsche am vereisten Stumpf ab und lande unsanft im Schnee. Auf so glattem Eis komme ich nicht hinauf.'); }
        if (F('doseHat')) return say('mira', 'Nur noch Zweige und Federn.'); setF('doseHat'); give('dose'); await say('mira', 'Im Herbst sind die Störche fort. Ich klettere den Stumpf hinauf – und finde im Nest eine verrostete Blechdose.');
      }
    });
    list.push({
      id: 'ballon', name: 'Ballon', r: [780, 150, 170, 330], walk: 780, face: 1,
      draw(c, t) { pxBalloon(c, 430, 98, 26, 32, true, false, t); },
      look: async () => say('mira', 'Mein Ballon. Er sitzt sicher am Boden, mit dem Anker am Fels.'),
      use: async () => { await say('mira', 'Zurück ins Tal!'); await fadeTo(1); S.scene = 'ballonwiese'; S.x = 520; landKey = ''; await fadeTo(0); }
    });
    return list;
  },
  async onEnter() { if (!F('introHorst')) { setF('introHorst'); await say('mira', 'Der Adlerhorst! Über den Wolken – ein kleiner Pavillon, ein Storchennest auf einem alten Stumpf und wunderbare Aussicht.'); await say('mira', 'Irgendwo hier muss Avelines Tagebuch sein. Elias schrieb, die Störche hüten es …'); } }
};
addCombo('dose', 'stange', async () => {
  if (!has('dose') || !has('stange')) return; take('dose'); give('tagebuch'); sfx('success');
  await say('mira', 'Ich setze die Brechstange am festgerosteten Deckel an – und mit einem Knacken springt er auf! Darin: ein Bündel in rotem Leder – Avelines Tagebuch!');
  await readTagebuch();
});
addCombo('tuch', 'nadel', async () => {
  take('tuch'); give('flicken', true); sfx('success');
  await say('mira', 'Ich säume das Leinentuch ringsum mit festem Garn – Stich für Stich. Ein stabiler Flicken, groß genug für ein ganzes Loch in einer Ballonhülle!');
});
async function readTagebuch() {
  await readDoc('Avelines Tagebuch', ['„Mein Liebster fragt, warum ich Jahreszeiten so liebe. Weil nichts in der Welt stillsteht, und weil ich das Wiederkommen mehr liebe als das Bleiben.', '', 'Der Frühling schenkt mir Mut, der Sommer Leichtigkeit, der Herbst Dankbarkeit und der Winter Ruhe. Nimm mir keine davon.', '', 'Halte nichts fest – ich werde in jedem Jahr sein, das du weiterlebst."']);
  insight('Halte nichts fest – ich werde in jedem Jahr sein, das du weiterlebst.'); setF('tagebuchGelesen'); note('Avelines Tagebuch gefunden. Corvin soll ihre Worte hören.');
}
SC.insel.noTravel = true;
