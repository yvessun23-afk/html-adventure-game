/* =====================================================================
   SZENEN (Pixel-Art) – Teil 2: Bergpfad, Erzgrube, Garten, Weidenhain, Bachfurt, Händlerlager, Kräuterlager
   ===================================================================== */

/* ======================= BERGPFAD ======================= */
SC.bergpfad = {
  id: 'bergpfad', title: 'Bergpfad', natural: 'so', minX: 50, maxX: 880, startX: 120,
  land(c, se) { drawBG(c, se, { ox: 0, sy: 30 }); drawGround(c, se); spr(c, 'pine_' + se, 70, GY + 50); spr(c, 'larch', 830, GY + 40); spr(c, sv('rocks', se), 230, GYB + 6); spr(c, sv('bush', se), 930, GYB + 6); },
  objs() {
    const se = curSeason(), list = [];
    if (!has('stein') && !F('steinPos') && !F('blockWeg')) list.push({
      id: 'stein', name: 'Kantiger Stein', r: sprR('rock_' + se + '_b', 330, GYB, 10), walk: 330, draw(c) { spr(c, 'rock_' + se + '_b', 330, GYB + 2, { s: 3 }); },
      look: async () => say('mira', 'Ein faustgroßer, kantiger Granitbrocken. Der taugt als Drehpunkt für einen Hebel.'),
      use: async () => { give('stein'); await say('mira', 'Der Stein liegt schwer und stabil in der Hand.'); }
    });
    if (!F('blockWeg')) list.push({
      id: 'block', name: 'Felsblock', r: [570, 400, 190, 90], walk: 500, face: 1,
      draw(c) { spr(c, 'bigrock_' + se, 660, GYB + 4, { s: 2 }); if (F('steinPos')) { const off = [.2, .5, 1, 1.6][S.flags.steinPos - 1]; spr(c, 'rock_' + se + '_a', 575 - off * 40, GYB + 2, { s: 2 }); } },
      look: async () => say('mira', 'Ein Felsblock versperrt den Pfad. Etwa 80 × 50 × 45 cm groß. Granit wiegt rund 2,7 Tonnen pro Kubikmeter – der Block also knapp 480 Kilo. Zum Kippen müsste ich nur die Hälfte stemmen: gut 240 Kilo. Das schaffe ich nie mit bloßen Händen. Ich schaffe etwa 35 Kilo.'),
      use: async () => {
        if (F('steinPos')) { S.flags.steinPos = 0; give('stein'); return say('mira', 'Ich hebe den Stein wieder auf, um ihn anders zu legen.'); }
        await say('mira', 'Ich stemme mich dagegen. Der Block ist unbeeindruckt. Kraft × Kraftarm = Last × Lastarm – ich brauche einen Hebel.');
      },
      items: {
        stein: async () => {
          if (F('steinPos')) return;
          await say('mira', 'Der Stein soll der Drehpunkt sein. Wie weit vom Block entfernt lege ich ihn hin? (Die Stange ist 2 m lang.)');
          const i = await choice(['Direkt am Block (20 cm)', 'Etwas weiter weg (50 cm)', 'In der Mitte der Stange (1 m)', 'Fast am Ende (1,6 m)']);
          take('stein'); S.flags.steinPos = i + 1; sfx('use'); await say('mira', 'Der Stein liegt. Jetzt fehlt noch die Stange.');
        },
        stange: async () => {
          if (!F('steinPos')) { sfx('fail'); return say('mira', 'Ohne Drehpunkt rutscht die Stange nur ab. Ich brauche einen Stein als Auflage.'); }
          const f = [27, 80, 240, 960][S.flags.steinPos - 1];
          if (f <= 35) { setF('blockWeg'); sfx('success'); await say('mira', 'Ich schiebe die Stange unter den Block und lehne mich auf das Ende … Der lange Arm gewinnt: Mit nur rund ' + f + ' Kilo Druck kippt der Block – und rumpelt den Hang hinunter!'); insight_hebel(); }
          else { sfx('fail'); await say('mira', 'Bei diesem Abstand müsste ich mit ' + f + ' Kilo drücken – ich schaffe nur etwa 35. Der Block rührt sich nicht. Ich muss den Stein anders legen (Block anklicken, um ihn zurückzuholen).'); }
        }
      }
    });
    list.push(edgeExit('l', 'werkstatt', 'Zur Werkstatt', 840, null));
    list.push(edgeExit('r', 'grube', 'Zur Erzgrube', 110, () => F('blockWeg'), 'Der Felsblock versperrt den Pfad. Ich muss ihn irgendwie beiseite bekommen.'));
    return list;
  },
  async onEnter() { if (!F('introBerg')) { setF('introBerg'); await say('mira', 'Der Bergpfad. Frische Luft, steile Hänge – und ein Felsblock, der mitten im Weg liegt.'); } }
};
function insight_hebel() { note('Hebelgesetz: Kraft × Kraftarm = Last × Lastarm. Je näher der Drehpunkt an der Last, desto weniger Kraft brauche ich.'); }

/* ======================= ERZGRUBE ======================= */
const ORES = [
  { id: 'limonit', n: 'Rostbraunes Erz', streak: 'gelbbraun' },
  { id: 'pyrit', n: 'Goldglänzendes Erz', streak: 'grünlich-schwarz' },
  { id: 'haematit', n: 'Graurötliches Erz', streak: 'kirschrot' },
  { id: 'azurit', n: 'Bläuliches Erz', streak: 'hellblau' }
];
const ORE_NAME = { limonit: 'Limonit', pyrit: 'Pyrit (Katzengold)', haematit: 'Hämatit', azurit: 'Azurit' };
SC.grube = {
  id: 'grube', title: 'Alte Erzgrube', natural: 'so', minX: 50, maxX: 880, startX: 120,
  land(c, se) {
    drawBG(c, se, { ox: 200, layers: [1], tint: 'rgba(40,30,60,.25)' }); drawGround(c, se, 231, '#1c1820');
    for (let i = 0; i < 3; i++) { const x = 140 + i * 210; px(c, x, GY / 2 - 70, 5, 68, PX.ink); px(c, x + 1, GY / 2 - 69, 3, 66, PX.wood2); px(c, x, GY / 2 - 72, 100, 5, PX.ink); px(c, x + 1, GY / 2 - 71, 98, 3, PX.wood3); px(c, x + 95, GY / 2 - 70, 5, 68, PX.ink); px(c, x + 96, GY / 2 - 69, 3, 66, PX.wood2); }
    for (let x = 0; x < 480; x += 14) { px(c, x, GY / 2 + 6, 10, 2, '#5a4a3a'); px(c, x + 2, GY / 2 + 8, 2, 4, '#3a2a1a'); }
    spr(c, 'bigrock_so', 70, GYB + 6); spr(c, 'crates2', 920, GYB, { s: 3 });
  },
  dyn(c, t, se) { [[300, 330], [610, 330]].forEach(([x, y], i) => { spr(c, anim('torch', 3, t, 10, i), x, y + 40, { s: 3 }); }); },
  objs() {
    const list = [];
    list.push(npc('ansgar', 'Ansgar', 240, 1, 320, -1, 'Ansgar, ein alter Bergmann mit Grubenlampe und Schnurrbart. Er sieht aus, als wäre er selbst aus Fels gehauen.', () => ansgarTalk()));
    ORES.forEach((o, i) => {
      const x = 470 + i * 110;
      list.push({
        id: 'erz_' + o.id, name: 'Erzhaufen', r: sprR('ore_' + o.id, x, GYB + 4, 4), walk: x - 10, face: 1,
        draw(c) { spr(c, 'ore_' + o.id, x, GYB + 4, { s: 2 }); },
        look: async () => say('mira', 'Ein Haufen ' + o.n.toLowerCase() + 's. ' + (F('strich_' + o.id) ? 'Strichprobe: ' + o.streak + '.' : 'Nur am Aussehen erkenne ich es nicht sicher – ich brauche die Strichprobe.')),
        use: async () => say('mira', 'Ich prüfe das Erz mit den Fingern. Schwer, kalt, staubig. Ohne Strichprobe rate ich nur.'),
        items: {
          scherbe: async () => { setF('strich_' + o.id); sfx('use'); await say('mira', 'Ich reibe das Erz über die raue Scherbe – der Strich ist ' + o.streak + '.'); if (o.id === 'haematit') { await say('mira', 'Kirschrot! Das ist Hämatit, der Blutstein.'); note('Strichprobe: Limonit gelbbraun, Hämatit kirschrot, Pyrit grünlich-schwarz, Azurit hellblau.'); } },
          hacke: async () => {
            if (o.id === 'haematit') { if (has('haematit')) return say('mira', 'Ich habe schon genug.'); give('haematit'); sfx('success'); await say('mira', 'Ich schlage mit der Spitzhacke ein paar Brocken Hämatit heraus. Schwer – aber genau das, was Runa braucht.'); await say('ansgar', 'Glück auf, Mädchen! Gut gemacht.'); insight('Ein Stollen, den nur einer kennt, stürzt ein – Wissen muss man teilen.'); return; }
            sfx('fail'); await say('ansgar', 'Halt! Das ist ' + ORE_NAME[o.id] + ', kein Hämatit. Mach erst die Strichprobe.');
          }
        }
      });
    });
    list.push(edgeExit('l', 'bergpfad', 'Zum Bergpfad', 850, null));
    return list;
  },
  async onEnter() { if (!F('introGrube')) { setF('introGrube'); await say('ansgar', 'Glück auf! Selten, dass sich jemand hierher verirrt.'); await say('mira', 'Ich suche Hämatit für eine Schmiedin. Vier Erzhaufen – welcher ist der richtige?'); } }
};
async function ansgarTalk() {
  await talkLoop([
    { t: 'Welches Erz ist Hämatit?', show: () => !F('scherbeHat'), fn: async () => { await say('ansgar', 'Nach der Farbe geht das nicht. Nimm die Strichprobe: Reib das Erz über rauen Porzellanscherben – der Strich verrät die wahre Farbe des Pulvers.'); give('scherbe'); setF('scherbeHat'); note('Strichprobe: Erz über die unglasierte Scherbe reiben. Hämatit streicht kirschrot.'); } },
    { t: 'Darf ich deine Spitzhacke leihen?', show: () => F('scherbeHat') && !F('hackeHat'), fn: async () => { await say('ansgar', 'Leihen ja – aber bring sie zurück! Ich hab sie seit dreißig Jahren.'); give('hacke'); setF('hackeHat'); } },
    { t: 'Was machst du hier?', show: () => true, fn: async () => say('ansgar', 'Ich horche auf den Berg. Er redet, wenn man still ist. Meistens sagt er: "Mehr Stützbalken."') }
  ]);
}

/* ======================= SELMAS GARTEN ======================= */
const PFL = {
  pflGruen: { n: 'Dunkelgrüne Pflanze', open: 'fr', spr: 'pot_gruen' },
  pflVio: { n: 'Violette Pflanze', open: 'so', spr: 'pot_vio' },
  pflOliv: { n: 'Olivkraut', open: 'he', spr: 'pot_oliv' },
  pflSilber: { n: 'Silberfarn', open: 'wi', spr: 'pot_silber' }
};
const SOCKEL_OK = ['pflGruen', 'pflVio', 'pflOliv', 'pflSilber'], SOCKEL_SE = ['fr', 'so', 'he', 'wi'];
const potSpr = (id, se) => PFL[id].spr + (se === PFL[id].open ? '' : '_c');
SC.garten = {
  id: 'garten', title: 'Selmas Garten', natural: 'so', minX: 50, maxX: 880, startX: 120,
  land(c, se) {
    drawBG(c, se, { ox: 380 }); drawGround(c, se);
    for (let x = 0; x < W + 100; x += 100) spr(c, 'wall', x + 50, GYB - 22, { s: 2 });
    for (let x = 0; x < W + 100; x += 100) spr(c, 'wall', x + 50, GYB - 122, { s: 2, a: .0 });
    spr(c, 'cypress', 90, GYB + 10); spr(c, 'cypress', 900, GYB + 10); spr(c, sv('bush', se), 300, GYB + 8); spr(c, sv('bush', se), 500, GYB + 8);
  },
  objs() {
    const se = curSeason(), list = [];
    list.push(npc('selma', 'Selma', 200, 1, 260, -1, 'Selma, die Gartenhüterin. Sie hat Erde unter den Fingernägeln und Sonne im Gesicht.', () => selmaTalk()));
    Object.keys(PFL).forEach((id, i) => {
      if (F('pflWeg_' + id) || F('pflSetzt_' + id)) return; const x = 340 + i * 54;
      list.push({
        id: 'pfl_' + id, name: PFL[id].n, r: sprR(PFL[id].spr, x, GYB + 4, 6), walk: x, face: 1,
        draw(c) { spr(c, potSpr(id, se), x, GYB + 4, { s: 2 }); },
        look: async () => say('mira', PFL[id].n + ': ' + (se === PFL[id].open ? 'Die Knospen öffnen sich weit und blühen richtig auf.' : (id === 'pflSilber' ? 'Der Silberfarn bleibt fest geschlossen, solange es warm ist.' : 'Die Knospen bleiben fest geschlossen. Die Pflanze wartet auf ihre Zeit.'))),
        use: async () => { setF('pflWeg_' + id); give(id); await say('mira', 'Ich nehme den Topf auf. Ihm scheint es hier eigentlich gut zu gefallen.'); }
      });
    });
    SOCKEL_OK.forEach((pid, i) => {
      const x = 590 + i * 100, placed = F('pflSetzt_' + pid);
      list.push({
        id: 'sockel' + i, name: 'Sockel', r: [x - 34, 380, 70, 100], walk: x, face: 1,
        draw(c) { spr(c, 'pedestal', x, GYB + 4, { s: 2 }); glyph(c, SOCKEL_SE[i], x - 12, GYB - 46, 3); if (placed) spr(c, potSpr(pid, se), x, GYB - 62, { s: 2 }); },
        look: async () => say('mira', 'Ein Sockel mit dem Zeichen für ' + SEASONS[SOCKEL_SE[i]] + '. ' + (placed ? 'Die passende Pflanze steht schon darauf.' : 'Hier gehört eine Pflanze hin, die in dieser Jahreszeit erblüht.')),
        use: async () => say('mira', 'Ich streiche über das Symbol. Es fühlt sich an, als wartete es auf jemanden.'),
        items: Object.fromEntries(Object.keys(PFL).map(id => [id, async () => {
          if (placed) return;
          if (id === pid) {
            take(id); setF('pflSetzt_' + id); sfx('success'); await say('mira', 'Die ' + PFL[id].n + ' steht auf dem ' + SEASONS[SOCKEL_SE[i]] + '-Sockel – und leuchtet kurz auf. Richtig!');
            if (SOCKEL_OK.every(k => F('pflSetzt_' + k))) { setF('gartenOk'); await say('selma', 'Wunderbar! Alle vier Pflanzen an ihrem Platz – jede in ihrer Zeit. Du hast ein Auge dafür!'); give('girlanden'); await say('selma', 'Hier, meine Klanggirlanden. Drei Stück, violett, grün und gelb. Sie klingen im Wind. Vielleicht hilft dir das bei der Baumhüterin.'); insight('Wachstum lässt sich nicht erzwingen – jeder Garten braucht jemanden, der ihn kennt.'); note('Selma: Die Klanggirlanden gehören an den Ast der Weide im Weidenhain.'); }
          } else { sfx('fail'); await say('mira', 'Ich stelle die ' + PFL[id].n + ' hin – und ihre Knospen schließen sich bockig. Falsche Jahreszeit! Ich nehme sie wieder mit.'); }
        }]))
      });
    });
    list.push(edgeExit('l', 'werkstatt', 'Zur Werkstatt', 410, null));
    list.push(edgeExit('r', 'weide', 'Zum Weidenhain', 110, null));
    return list;
  },
  async onEnter() { if (!F('introGarten')) { setF('introGarten'); await say('mira', 'Ein ummauerter Kräutergarten – wunderschön. Aber die Pflanzen sehen aus, als wüssten sie nicht, welche Jahreszeit sie haben.'); } }
};
const SEASON_COL = { fr: '#ffd0e0', so: '#fff0a0', he: '#ffc080', wi: '#d8ecfa' };
async function selmaTalk() {
  if (!F('selmaMet')) { setF('selmaMet'); await say('selma', 'Oh, Besuch! Ich bin Selma, die Gartenhüterin. Meine Pflanzen sind durcheinander – alle Jahreszeiten auf einmal, und keine weiß mehr, wann sie blühen soll.'); }
  await talkLoop([
    { t: 'Wie kann ich helfen?', show: () => !F('gartenOk'), fn: async () => { await say('selma', 'Vier Sockel, vier Pflanzen. Jede gehört zu der Jahreszeit, in der sie erblüht. Beobachte sie, während du das Herz drehst – und stell jede auf ihren Platz.'); note('Selma: Jede Pflanze auf den Sockel ihrer Blütezeit stellen. Zum Beobachten die Jahreszeit umschalten.'); } },
    { t: 'Kann ich Nadel und Garn von dir haben?', show: () => F('gartenOk') && !F('nadelHat'), fn: async () => { await say('selma', 'Natürlich, du hast mir doch geholfen. Meine Segelnadel – halt sie in Ehren.'); give('nadel'); setF('nadelHat'); } },
    { t: 'Erzähl mir vom Garten.', show: () => true, fn: async () => say('selma', 'Ein Garten ist wie ein Gespräch: Man muss zuhören, bevor man etwas sagt.') }
  ]);
}

/* ======================= WEIDENHAIN ======================= */
const GIRL = { violett: '#9a4ad8', gelb: '#f0d030', gruen: '#4ac05a' };
SC.weide = {
  id: 'weide', title: 'Weidenhain', natural: 'so', minX: 50, maxX: 880, startX: 120,
  land(c, se) { drawBG(c, se, { ox: 450 }); drawGround(c, se); spr(c, 'pine_' + se, 40, GY + 60); spr(c, 'pine_' + se, 920, GY + 60); spr(c, sv('bush', se), 780, GYB + 8); spr(c, sv('rocks', se), 120, GYB + 8); },
  objs() {
    const se = curSeason(), list = [];
    list.push({ id: 'willowBack', name: '', r: [0, 0, 0, 0], z: 10, draw(c) { spr(c, 'willow_' + se, 470, GY + 16); } });
    list.push({
      id: 'nim', actor: 'nim', name: 'Nim', r: F('nimWach') ? [490, 380, 60, 102] : [350, 430, 140, 50], walk: 330, face: 1, head: [F('nimWach') ? 540 : 420, F('nimWach') ? GY - 104 : GY - 50],
      draw(c, t) { if (F('nimWach')) drawChar(c, 540, GY, CHAR.nim, { dir: -1, t, talk: speech && speech.who === 'nim' }); else { drawChar(c, 420, GY + 2, CHAR.nim, { anim: 'sleep', t }); if (Math.sin(t * 2) > -.3) txt(c, 'Z', 470 + Math.sin(t) * 4, 392 - (t * 14) % 24, 18, '#fff', 'left'); } },
      look: async () => say('mira', F('nimWach') ? 'Nim, die Baumhüterin. Ihr Blick ist so tief wie ein alter Wald.' : 'Eine junge Frau schläft tief unter der Trauerweide. Sie lässt sich nicht wecken – der Schlaf des Waldes ist zu tief.'),
      use: async () => nimTalk()
    });
    list.push({
      id: 'ast', name: 'Ast der Weide', r: [300, 230, 360, 150], walk: 470, face: 1,
      draw(c, t) {
        if (F('girlHang')) S.girl.forEach((g, i) => spr(c, 'girl_' + g, 340 + i * 130, 360 + Math.sin(t * 2 + i) * 2, { s: 2 }));
        else for (let i = 0; i < 3; i++) { px(c, (340 + i * 130) / 2 - 1, 162, 3, 4, PX.ink); }
      },
      look: async () => say('mira', F('girlHang') ? 'Die Girlanden hängen an den Haken. Ob die Reihenfolge stimmt?' : 'Ein dicker Ast der Weide mit drei kleinen Haken. Hier hing wohl früher etwas.'),
      use: async () => { if (!F('girlHang')) return say('mira', 'Drei leere Haken. Etwas zum Aufhängen wäre schön.'); if (F('nimWach')) return say('mira', 'Die Girlanden klingen leise im Wind.'); ui = 'garland'; },
      items: { girlanden: async () => { if (F('girlHang')) return; take('girlanden'); setF('girlHang'); sfx('use'); await say('mira', 'Ich hänge die drei Girlanden an die Haken. Sie klingen leise. Ob die Reihenfolge stimmt? Klick den Ast noch einmal an, um sie umzuhängen.'); } }
    });
    list.push({
      id: 'scheibe', name: 'Holzscheibe', r: [150, 420, 100, 60], walk: 220, face: 1,
      draw(c) { const cx = 100, cy = GY / 2 + 4; pxEll(c, cx, cy + 3, 24, 7, PX.wood); pxEll(c, cx, cy, 24, 7, '#c89860'); pxEll(c, cx, cy, 20, 6, '#4ac05a'); pxEll(c, cx, cy, 13, 4, '#f0d030'); pxEll(c, cx, cy, 6, 2, '#9a4ad8'); },
      look: async () => say('mira', 'Eine Baumscheibe mit Jahresringen – ungewöhnlich bunt: innen violett, in der Mitte gelb, außen grün.'),
      use: async () => { note('Holzscheibe: Ringe von innen nach außen violett, gelb, grün. Die Girlanden gehören in dieser Reihenfolge von links nach rechts an den Ast.'); await say('mira', 'Innen violett, in der Mitte gelb, außen grün. Ich merke mir die Reihenfolge.'); }
    });
    list.push(edgeExit('l', 'garten', 'Zum Garten', 850, null));
    list.push(edgeExit('r', 'furt', 'Zur Bachfurt', 110, () => F('nimWach'), 'Der Weg zum Bach führt an Nim vorbei – und sie schläft mitten im Weg. So einfach lasse ich sie nicht liegen.'));
    return list;
  },
  async onEnter() { if (!F('introWeide')) { setF('introWeide'); await say('mira', 'Eine riesige Trauerweide. Und darunter schläft jemand tief und fest.'); } },
  async onSeason(n) {
    if (n === 'he' && F('girlHang') && !F('nimWach')) {
      if (F('girlOk')) { await nimWake(); } else { await say('mira', 'Der Herbstwind fährt durch die Girlanden – es klingt schief und unschön. Die Reihenfolge stimmt noch nicht.'); }
    }
  }
};
function checkGirl() {
  if (S.girl[0] === 'violett' && S.girl[1] === 'gelb' && S.girl[2] === 'gruen') { setF('girlOk'); sfx('success'); showToast('Die Girlanden klingen harmonisch!'); ui = null; note('Die Girlanden hängen in der richtigen Reihenfolge. Jetzt fehlt ein Westwind: die Weide auf Herbst stellen.'); }
}
async function nimWake() {
  sfx('season'); await say('mira', 'Der Westwind streicht durch die Girlanden – violett, gelb, grün – und die Weide singt!');
  setF('nimWach'); await say('nim', '… Mmh? Wer spielt da meine Melodie? Ich habe seit hundert Herbsten nicht mehr so gut geschlafen!');
  await say('nim', 'Ich bin Nim, Baumhüterin. Du trägst Elias\' Herz? Er hat mir einst dieses Siegel anvertraut – das Frühlingssiegel.');
  give('siegelFr'); setF('sFr'); S.unlocked.includes('wi') || S.unlocked.push('wi');
  await say('nim', 'Nimm es. Und hier: einen Wegkristall aus meinen Wurzeln. Er bringt dich zu jedem Ort, den du schon kennst.');
  give('kristall'); sfx('success'); await say('mira', 'Und der Winter ist jetzt auch frei! Das Herz wird stärker mit jedem Siegel.');
  insight('Der Wald erinnert sich in jedem Baum ein wenig – verteilt ist er klüger als ein einzelner.'); note('Nim gab mir das Frühlingssiegel und einen Wegkristall (Schnellreise über die Karte).');
}
async function nimTalk() {
  if (!F('nimWach')) return say('mira', 'Sie schläft tief. Ich rüttle sie sanft – nichts. Ich brauche eine Melodie, die sie weckt … die Girlanden vielleicht?');
  await talkLoop([
    { t: 'Wo finde ich die anderen Siegel?', show: () => true, fn: async () => say('nim', 'Elias hat sie verteilt: Eines liegt bei den Wintergeistern der Insel, eines im Hain der Erinnerungen, und das Sommersiegel trägt Corvin selbst.') },
    { t: 'Wie komme ich über den Bach?', show: () => !F('platteGelegt'), fn: async () => say('nim', 'Im Frühling ist er ein reißender Fluss. Im Sommer sinkt das Wasser – dann kannst du dir mit einer Steinplatte einen Übergang bauen. Die Platte liegt am Ufer, sie ist nur schwer.') },
    { t: 'Danke, Nim.', show: () => true, fn: async () => say('nim', 'Danke dir. Und lass den Wald nicht warten.') }
  ]);
}

/* ======================= BACHFURT ======================= */
const RIVER = { fr: [330, 640], so: [430, 530], he: [400, 560], wi: [420, 540] };
function curSeasonOf(id) { return seasonOf(id); }
SC.furt = {
  id: 'furt', title: 'Bachfurt', natural: 'fr', minX: 50, get maxX() { return curSeasonOf('furt') === 'so' && F('platteGelegt') ? 880 : 380; }, startX: 120,
  land(c, se) { drawBG(c, se, { ox: 60, layers: [1, 2, 3] }); drawGround(c, se); spr(c, 'birch_' + se, 200, GYB + 6); spr(c, 'birch_' + se, 280, GYB + 10, { s: 2 }); spr(c, 'tree_' + se, 900, GY + 30); },
  dyn(c, t, se) {
    const [a, b] = RIVER[se]; pxWater(c, se, a / 2, 186, b / 2, 270, t);
    for (let i = 0; i < 7; i++) { spr(c, sv('rock', se) + '_a', a - 14 + (i % 2) * 6, 380 + i * 24, { s: 2 }); spr(c, sv('rock', se) + '_b', b + 14 - (i % 2) * 6, 386 + i * 24, { s: 2 }); }
  },
  objs() {
    const se = curSeason(), list = [], [a, b] = RIVER[se];
    if (!F('platteGelegt')) list.push({
      id: 'platte', name: 'Steinplatte', r: [290, 430, 120, 55], walk: 290, face: 1,
      draw(c) { px(c, 150, GY / 2 - 6, 50, 7, PX.ink); px(c, 151, GY / 2 - 5, 48, 4, '#a8a8b8'); px(c, 151, GY / 2 - 5, 48, 1, '#d0d0dc'); },
      look: async () => say('mira', 'Eine große, flache Steinplatte am Ufer. Zu schwer zum Tragen – aber mit einem Hebel …'),
      use: async () => say('mira', 'Ich schiebe. Ich schwitze. Nichts. Die Platte wiegt bestimmt 200 Kilo.'),
      items: { stange: async () => { if (se !== 'so') { sfx('fail'); return say('mira', se === 'fr' ? 'Der Bach ist im Frühling viel zu hoch – die Platte würde einfach untergehen.' : se === 'he' ? 'Im Herbst steht das Wasser noch zu hoch für die Platte. Im Sommer ist Niedrigwasser.' : 'Das Wasser ist zugefroren. Die Platte würde nur rutschen.'); } setF('platteGelegt'); sfx('success'); await say('mira', 'Ich stemme die Stange unter die Platte, ein kräftiger Ruck – und sie kippt genau in die Lücke zwischen den Ufersteinen! Ein Übergang. Aber nur bei Niedrigwasser im Sommer gangbar.'); } }
    });
    else if (se === 'so') list.push({ id: 'uebergang', name: 'Steinplatte', r: [420, 440, 120, 40], draw(c) { px(c, a / 2 - 6, GY / 2 + 3, (b - a) / 2 + 12, 8, PX.ink); px(c, a / 2 - 5, GY / 2 + 4, (b - a) / 2 + 10, 5, '#a8a8b8'); px(c, a / 2 - 5, GY / 2 + 4, (b - a) / 2 + 10, 1, '#d0d0dc'); }, look: async () => say('mira', 'Die Platte überbrückt das Niedrigwasser. Solange der Sommer bleibt, komme ich hinüber.'), use: async () => say('mira', 'Fest wie ein Brückenpfeiler.') });
    list.push({
      id: 'bach', name: 'Bach', r: [a, 380, b - a, 100], walk: a - 40, face: 1, draw() { },
      look: async () => say('mira', { fr: 'Schmelzwasser! Der Bach ist zu einem reißenden Fluss angeschwollen – kein Durchkommen.', so: 'Im Sommer liegt der Bach flach und ruhig. Die Steine am Grund sind zu sehen.', he: 'Mittleres Wasser, aber schon zu tief für trockene Füße.', wi: 'Das fließende Wasser ist an den Rändern zugefroren – aber in der Mitte bleibt es offen. Fließendes Wasser friert spät.' }[se]),
      use: async () => say('mira', 'Ich tauche die Hand ein. Eiskalt. Und rutschig.')
    });
    list.push(edgeExit('l', 'weide', 'Zum Weidenhain', 850, null));
    list.push(edgeExit('r', 'markt', 'Zum Händlerlager', 110, () => curSeason() === 'so' && F('platteGelegt'), 'Hinüber komme ich nur bei Niedrigwasser im Sommer und mit einer Steinplatte als Brücke.'));
    return list;
  },
  async onEnter() { if (!F('introFurt')) { setF('introFurt'); await say('mira', 'Ein Bach mit Schmelzwasser, das reißend über die Steine springt. Da komme ich nicht einfach hinüber.'); } },
  async onSeason() { if (S.x > 400 && !(curSeason() === 'so' && F('platteGelegt'))) { S.x = 370; S.target = null; await say('mira', 'Die Strömung schwemmt mich zurück ans Ufer! Ohne Niedrigwasser geht es nicht.'); } }
};

/* ======================= HÄNDLERLAGER ======================= */
SC.markt = {
  id: 'markt', title: 'Fenns Händlerlager', natural: 'fr', minX: 50, maxX: 880, startX: 120,
  land(c, se) {
    drawBG(c, se, { ox: 280 }); drawGround(c, se); spr(c, 'tent_large', 170, GYB + 4, { s: 2 });
    px(c, 20, 52, 440, 2, PX.ink); const cols = ['#e8503a', '#f4d03a', '#3a8ae8', '#4ac05a'];
    for (let i = 0; i < 19; i++) { const x = 22 + i * 23; pxFlag(c, x, 54 + Math.round(Math.sin(i / 18 * 3.14) * 8), cols[i % 4]); }
    spr(c, 'crates2', 50, GYB, { s: 3 }); spr(c, sv('bush', se), 440, GYB + 8);
  },
  objs() {
    const list = [];
    list.push(npc('fenn', 'Fenn', 360, -1, 330, 1, 'Fenn, der fahrende Händler. Sein Lächeln ist breit wie sein Warenlager – und wahrscheinlich genauso aufgeblasen.', () => fennTalk()));
    list.push({
      id: 'kochstelle', name: 'Kochstelle', r: [470, 400, 140, 80], walk: 520,
      draw(c, t) { spr(c, anim('cook', 12, t, 8), 540, GYB + 2, { s: 3 }); },
      look: async () => say('mira', 'Fenns Kochstelle. Was auch immer im Topf blubbert – es riecht besser, als es aussieht.'), use: async () => say('mira', 'Ich rühre einmal um. Fenn ruft "Nicht anfassen, das ist Suppe des Tages – seit Montag!"')
    });
    list.push({
      id: 'waren', name: 'Waren', r: sprR('stall', 660, GYB, 4), walk: 640, draw(c) { spr(c, 'stall', 660, GYB + 2, { s: 2 }); },
      look: async () => say('mira', 'Kisten, Körbe, Krimskrams. Ein Schild sagt: "Alles nur echt – Fenn."'), use: async () => say('mira', 'Ich wühle kurz. Fenn räuspert sich vielsagend.')
    });
    list.push(archExit('huette', 'Kräuterlager', 730, GY + 6, 110, null, null, 76));
    list.push(archExit('ballonwiese', 'Ballonwiese', 850, GY + 6, 110, null, null, 76));
    list.push(edgeExit('l', 'furt', 'Zur Furt', 850, null));
    list.push(edgeExit('r', 'see', 'Zum Seeufer', 110, null));
    return list;
  },
  async onEnter() { if (!F('introMarkt')) { setF('introMarkt'); await say('mira', 'Ein Händlerlager, bunt und laut, wie ein Jahrmarkt in Miniatur. Überall Wimpel, Kisten und Körbe.'); } }
};
async function fennTalk() {
  if (!F('fennMet')) { setF('fennMet'); await say('fenn', 'Willkommen, Willkommen! Fenn, fahrender Händler, Tauschmeister und Erfinder des "Fast-dichten" Eimers!'); await say('mira', 'Ich suche Elias. Kennst du ihn?'); await say('fenn', 'Elias? Der kauft bei mir Fläschchen und Kräuter. Sein Lager steht gleich hinter meinem Zelt – dort hinten, durch den Torbogen.'); }
  await talkLoop([
    { t: 'Hast du etwas zu tauschen?', show: () => !F('eimerHat'), fn: async () => {
      if (!has('kuerbis')) { await say('fenn', 'Einen Holzeimer hätte ich! Gegen einen Herbstkürbis. Ich koche die beste Kürbissuppe im Tal – wenn ich nur Kürbisse hätte!'); note('Fenn tauscht einen Holzeimer gegen einen Kürbis (Herbst: Dorfplatz oder Erntefeld).'); }
      else { take('kuerbis'); give('eimer'); setF('eimerHat'); await say('fenn', 'Ein Kürbis! Für dich: meinen Holzeimer. Fast dicht! … Hm, meistens.'); insight('Kein Ort ernährt einen das ganze Jahr – alle Orte mit ihren eigenen Zeiten zusammen schon.'); }
    } },
    { t: 'Wie braue ich einen Klarsicht-Trank?', show: () => F('orinInfo') && !has('trank') && !F('trankGetrunken'), fn: async () => { await say('fenn', 'Elias schreibt es im Kräuterlager auf einen Zettel – aber ich sage dir: Quellwasser, das nie gefriert, und Birkensaft aus dem Frühling. Und ein Feuer, aber erst ganz zuletzt!'); } },
    { t: 'Wie komme ich zum Adlerhorst?', show: () => F('tagebuchZiel'), fn: async () => { await say('fenn', 'Der Adlerhorst? Nur mit dem Ballon! Auf der Ballonwiese liegt einer, aber der hat ein Loch, braucht Brennstoff und kalte Luft – kalte Luft trägt besser.'); } },
    { t: 'Wie hilfst du mir sonst?', show: () => F('tagebuchZiel'), fn: async () => { await say('fenn', 'Dichte Hülle: Flicken drauf. Brennstoff: Stroh. Und die Luft draußen sollte möglichst kalt sein. Rechnen kann ich nicht – aber Physik meint es gut mit uns Ballonfahrern.'); } },
    { t: 'Wo ist das Kräuterlager?', show: () => true, fn: async () => say('fenn', 'Torbogen links von der Ballonwiese, hinter meinen Kisten. Du kannst es nicht verfehlen. Es ist das mit den Kräutern.') }
  ]);
}

/* ======================= ELIAS' KRÄUTERLAGER ======================= */
SC.huette = {
  id: 'huette', title: 'Elias\' Kräuterlager', natural: 'he', minX: 50, maxX: 880, startX: 120,
  land(c, se) {
    drawBG(c, se, { ox: 500, tint: 'rgba(90,50,140,.10)' }); drawGround(c, se); spr(c, 'house', 500, GY + 14);
    for (let i = 0; i < 6; i++) spr(c, 'herbs', 60 + i * 34, 372 + (i % 2) * 6, { s: 2, ay: 't' });
    spr(c, 'pine_' + se, 40, GY + 70); spr(c, sv('bush', se), 880, GYB + 8);
  },
  objs() {
    const se = curSeason(), list = [];
    list.push({
      id: 'rezept', name: 'Rezepttisch', r: sprR('labtable2', 330, GYB, 6), walk: 360, face: 1, draw(c) { spr(c, 'labtable2', 330, GYB + 2, { s: 3 }); },
      look: async () => { await say('mira', 'Ein Tisch mit einem Rezeptzettel in Elias\' Handschrift.'); await readDoc('Elias\' Rezept', ['Klarsicht-Trank – sieht durch jeden Nebel.', '', '1 Flasche Quellwasser – jenes, das auch im tiefsten Winter nie gefriert.', '1 Eimer Birkensaft – nur im Vorfrühling zu zapfen, wenn der Baum „blutet".', '', 'Alles in den Braukessel. Das Feuer erst ganz zuletzt entfachen, sonst kocht der Zauber über.', '', 'Danach abfüllen. Kühl und dunkel lagern. – E.']); note('Rezept Klarsicht-Trank: Quellwasser (bleibt im Winter offen), Birkensaft (nur Frühling), dann Feuer. In den Braukessel im Kräuterlager.'); },
      use: async () => say('mira', 'Ich schaue mir den Zettel genauer an. Rechtsklick genügt – Elias schreibt so klein, dass man ihn lesen muss.')
    });
    list.push({
      id: 'brief', name: 'Zettel', r: sprR('labtable', 440, GYB, 6), walk: 470, draw(c) { spr(c, 'labtable', 440, GYB + 2, { s: 3 }); px(c, 214, GY / 2 - 26, 10, 7, '#f4ecd8'); px(c, 215, GY / 2 - 24, 8, 1, INK); px(c, 215, GY / 2 - 22, 6, 1, INK); },
      look: async () => { await readDoc('Zettel von Elias', ['Mira – falls du das liest:', '', 'Ich musste fort. Corvin darf den Tag nicht länger festhalten.', 'Die Siegel liegen verstreut: Nim hütet den Frühling, im Hain wartet der Herbst, auf einer Insel im Winter der Winter. Corvin selbst trägt den Sommer.', '', 'Ich bin in den Nebelwald. Ohne den Trank findest du den Weg nicht.', '', 'Vertrau dem Herz. – Elias']); note('Elias floh in den Nebelwald. Der Klarsicht-Trank ist nötig.'); },
      use: async () => say('mira', 'Ich stecke ihn lieber nicht ein – ich habe seinen Inhalt schon im Kopf.')
    });
    list.push({
      id: 'bord', name: 'Flaschenbord', r: [170, 350, 120, 130], walk: 240, face: 1,
      draw(c) { for (const y of [-40, -20]) { px(c, 90, GY / 2 + y, 52, 3, PX.ink); px(c, 91, GY / 2 + y + 1, 50, 1, PX.wood3); } px(c, 92, GY / 2 - 70, 3, 72, PX.ink); px(c, 138, GY / 2 - 70, 3, 72, PX.ink); spr(c, 'bottles', 230, GY - 44, { s: 2 }); spr(c, 'bottles', 270, GY - 84, { s: 2 }); if (!F('flascheWeg')) spr(c, 'bottle1', 200, GY - 40, { s: 3 }); },
      look: async () => say('mira', 'Ein Bord voller Fläschchen. Eine saubere, leere Glasflasche steht dabei.'),
      use: async () => { if (F('flascheWeg')) return say('mira', 'Der Rest ist bunt gefüllt – keine leeren mehr.'); setF('flascheWeg'); give('flasche'); await say('mira', 'Eine saubere, leere Glasflasche. Die kann ich gut gebrauchen.'); }
    });
    list.push({
      id: 'kiste2', name: 'Elias\' Kiste', r: sprR('crates2', 640, GYB, 6), walk: 600, face: 1, draw(c) { spr(c, 'crates2', 640, GYB + 2, { s: 3 }); },
      look: async () => say('mira', 'Eine Kiste mit Elias\' Zeichen.'),
      use: async () => { if (F('zunderHat')) return say('mira', 'Leer bis auf Staub.'); setF('zunderHat'); give('zunder'); await say('mira', 'Feuerstein, Schlageisen und trockener Zunder. Genau das, was ich zum Anzünden brauche.'); }
    });
    list.push({
      id: 'brau', name: 'Braukessel', r: [720, 360, 130, 120], walk: 690, face: 1,
      draw(c, t) {
        if (F('brewFeuer')) { spr(c, anim('fire_pot', 8, t, 10), 790, GYB + 6, { s: 4 }); c.fillStyle = 'rgba(120,255,160,.10)'; c.beginPath(); c.arc(790, GYB - 40, 110, 0, 7); c.fill(); }
        else { spr(c, 'tripod_pot', 790, GYB + 6, { s: 4 }); if (F('brewQ')) px(c, 388, GY / 2 - 46, 14, 3, F('brewS') ? '#6ac07a' : '#7ab8e0'); }
      },
      look: async () => say('mira', 'Ein Braukessel über einer Feuerstelle. ' + (F('brewQ') ? 'Quellwasser ist schon drin. ' : '') + (F('brewS') ? 'Birkensaft auch. ' : '') + (F('brewFeuer') ? 'Das Feuer brennt.' : 'Das Feuer ist kalt.')),
      use: async () => say('mira', 'Zutaten und Feuer – in der richtigen Reihenfolge. Rezept lesen!'),
      items: {
        flascheQuelle: async () => { if (F('brewQ')) return; swap('flascheQuelle', 'flasche'); setF('brewQ'); sfx('use'); await say('mira', 'Ich gieße das lauwarme Quellwasser in den Kessel. Die Flasche behalte ich – sie wird noch gebraucht.'); },
        flascheSee: async () => { sfx('fail'); await say('mira', 'Gewöhnliches Seewasser? Elias schreibt "Quellwasser, das nie gefriert". Das hier friert im Winter zu – falsch!'); },
        eimerSaft: async () => { if (F('brewS')) return; swap('eimerSaft', 'eimer'); setF('brewS'); sfx('use'); await say('mira', 'Der klare Birkensaft rinnt in den Kessel.'); },
        zunder: async () => { if (!F('brewQ') || !F('brewS')) { sfx('fail'); return say('mira', 'Zu früh! Erst müssen Quellwasser und Birkensaft im Kessel sein. Das Feuer kommt zuletzt.'); } if (F('brewFeuer')) return; setF('brewFeuer'); sfx('fire'); await say('mira', 'Funken vom Feuerstein – der Zunder fängt, und unter dem Kessel knistert es. Die Brühe färbt sich smaragdgrün und beginnt zu leuchten.'); },
        flasche: async () => { if (!F('brewFeuer')) { sfx('fail'); return say('mira', 'Der Kessel ist noch nicht fertig. Ich brauche Wasser, Saft und Feuer.'); } take('flasche'); give('trank'); setF('brewDone'); sfx('success'); await say('mira', 'Ich fülle den leuchtenden Sud in die Flasche. Der Klarsicht-Trank! Damit sehe ich durch jeden Nebel.'); },
        eimer: async () => say('mira', 'Der Eimer ist leer. Ich brauche Birkensaft.'), holz: async () => say('mira', 'Zum Befeuern reicht Zunder. Lagerholz brauche ich nicht.')
      }
    });
    list.push(edgeExit('l', 'markt', 'Zum Händlerlager', 760, null));
    return list;
  },
  async onEnter() { if (!F('introHuette')) { setF('introHuette'); await say('mira', 'Elias\' Kräuterlager! Kräuter hängen an Schnüren, Fläschchen klirren, und überall liegt sein Geruch nach Salbei und Pergament.'); } }
};
