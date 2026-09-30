/* =====================================================================
   SZENEN (Pixel-Art) – Teil 1: Lager, Dorf, Erntefeld, Werkstatt
   Alle Positionen in Leinwand-Koordinaten (960×540), Bodenlinie GY.
   ===================================================================== */
function pxLine(c, x0, y0, x1, y1, w, col) {            // Linie in logischen Pixeln
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx - dy;
  for (;;) { px(c, x0, y0, w, w, col); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 > -dy) { err -= dy; x0 += sx; } if (e2 < dx) { err += dx; y0 += sy; } }
}
function edgeExit(side, target, name, toX, cond, blocked) {
  const L = side === 'l';
  return {
    id: 'exit_' + target, name, exit: target, toX, cond, blocked,
    r: L ? [0, 300, 70, 190] : [W - 70, 300, 70, 190], walk: L ? 24 : W - 24, front: true, kind: 'exit', dirArrow: L ? -1 : 1,
    draw(c) { pxSignpost(c, L ? 34 : W - 34, L ? -1 : 1); }
  };
}
function archExit(target, name, x, y, toX, cond, blocked, w = 90) {
  return { id: 'exit_' + target, name, exit: target, toX, cond, blocked, kind: 'exit', dirArrow: 0, r: [x - w / 2 - 6, y - 150, w + 12, 160], walk: x, draw(c) { pxArchway(c, x, y, w, name); } };
}
const GYB = GY + 4;                                        // Fußlinie für Bodendekor

/* ======================= LAGER ======================= */
SC.lager = {
  id: 'lager', title: 'Verlassenes Lager', natural: 'wi', minX: 50, maxX: 880, startX: 330,
  land(c, se) {
    drawBG(c, se, { ox: 40 }); drawGround(c, se);
    spr(c, 'pine_' + se, 60, GY + 40); spr(c, 'pine_' + se, 930, GY + 50); spr(c, sv('bush', se), 300, GYB + 6); spr(c, sv('rocks', se), 690, GYB + 10);
  },
  objs() {
    const se = curSeason(), snow = se === 'wi', list = [];
    list.push({
      id: 'stump', name: 'Baumstumpf', r: sprR('stump_cleaver', 135, GYB, 4), walk: 185, face: -1,
      draw(c) { spr(c, F('axtHat') ? 'stump_plain' : 'stump_cleaver', 135, GYB, { s: 3 }); },
      look: async () => say('mira', F('axtHat') ? 'Ein alter Baumstumpf. Er hat schon bessere Tage gesehen – und bessere Äxte.' : 'Elias\' Axt steckt tief im Stumpf. Eingefroren! Ich brauche einen Hebel oder Zugkraft.'),
      use: async () => say('mira', F('axtHat') ? 'Ein Stumpf. Zum Sitzen zu kalt.' : 'Ich ziehe daran, aber die Axt sitzt fest. Meine Finger sind schon blau.'),
      items: {
        seil: async () => {
          if (F('axtHat')) return say('mira', 'Die Axt habe ich schon.');
          await say('mira', 'Seil um den Griff, Fuß gegen den Stumpf … und ZIEH!');
          sfx('use'); setF('axtHat'); give('axt'); await say('mira', 'Geschafft! Das Seil behalte ich – man kann nie wissen.');
        }
      }
    });
    list.push({
      id: 'kiste', name: 'Kiste', r: sprR('crate', 240, GYB, 8), walk: 290, face: -1,
      draw(c) { spr(c, 'crate', 240, GYB, { s: 3 }); if (F('kisteAuf')) { px(c, 101, GY / 2 - 14, 18, 4, '#140c08'); } if (snow) px(c, 100, GY / 2 - 24, 20, 3, '#fff'); },
      look: async () => say('mira', F('kisteAuf') ? 'Elias\' Kiste. Jetzt offen und ziemlich leer.' : 'Elias\' Vorratskiste. Der Deckel ist zugefroren, aber nicht abgeschlossen.'),
      use: async () => {
        if (F('kisteAuf')) return say('mira', 'Nur noch Staub und Eiszapfen.');
        await say('mira', 'Ich klopfe das Eis vom Deckel …'); sfx('use'); setF('kisteAuf'); give('seil'); await say('mira', 'Ein festes Hanfseil! Genau das, was ich brauche.');
      }
    });
    list.push({
      id: 'leine', name: 'Wäscheleine', r: [330, 350, 200, 130], walk: 440, draw(c) { spr(c, F('tuchWeg') ? 'laundry_empty' : 'laundry', 430, GYB + 4); },
      look: async () => say('mira', F('tuchWeg') ? 'Eine leere Wäscheleine. Nur der Wind wohnt hier noch.' : 'Ein Leinentuch, so steif gefroren, dass es fast stehen könnte.'),
      use: async () => { if (F('tuchWeg')) return say('mira', 'Da hängt nichts mehr.'); setF('tuchWeg'); give('tuch'); await say('mira', 'Es knackt beim Abnehmen wie ein Keks. Ich nehme es mit.'); }
    });
    list.push({
      id: 'zelt', name: 'Elias\' Zelt', r: sprR('tent_small', 560, GYB, 0), walk: 500, face: 1,
      draw(c) { spr(c, 'tent_small', 560, GYB); if (F('zeltAuf')) { c.fillStyle = '#1a0e10'; c.fillRect(578, GYB - 72, 36, 64); c.fillStyle = '#3a2418'; c.fillRect(578, GYB - 72, 36, 6); } if (snow) { px(c, 249, GYB / 2 - 62, 26, 3, '#fff'); px(c, 255, GYB / 2 - 66, 14, 3, '#fff'); } },
      look: async () => say('mira', F('zeltAuf') ? 'Elias\' Zelt. Innen ist alles durchwühlt – ich habe genommen, was brauchbar war.' : 'Elias\' Zelt. Die Klappe ist mit einem eingefrorenen Knoten verschnürt. Mit bloßen Fingern hoffnungslos.'),
      use: async () => say('mira', F('zeltAuf') ? 'Da ist nichts mehr, außer Elias\' Socken. Nein danke.' : 'Der Knoten ist steinhart. Ich brauche etwas zum Hebeln.'),
      items: {
        axt: async () => {
          if (F('zeltAuf')) return say('mira', 'Das Zelt ist doch schon offen.');
          await say('mira', 'Die Axt als Hebel unter den Knoten … und – KRACK!'); sfx('use'); setF('zeltAuf');
          await say('mira', 'Drinnen liegt ein Bündel mit Elias\' Sachen.');
          give('herz'); give('notizenNass'); give('blueten'); give('phiole');
          await say('mira', 'Das Jahreszeitenherz! Dazu nasse Notizen, getrocknete Blüten und eine leere Phiole.');
          await say('mira', 'Der Ring am Herz sitzt schief. Und das Innere ist leer … Ich muss es erst einmal genauer ansehen.');
        }
      }
    });
    if (!F('fackelWeg')) list.push({
      id: 'fackel', name: 'Fackel', r: sprR('torch_off', 635, GYB, 10), walk: 625, draw(c) { spr(c, 'torch_off', 635, GYB, { s: 3 }); },
      look: async () => say('mira', 'Eine Pechfackel, an den Zeltrand gelehnt.'),
      use: async () => { setF('fackelWeg'); give('fackel'); await say('mira', 'Eine Fackel. Nicht angezündet – noch nicht.'); }
    });
    if (!F('kesselWeg')) list.push({
      id: 'kessel', name: 'Kessel', r: sprR('cauldron', 680, GYB, 6), walk: 670, draw(c) { spr(c, 'cauldron', 680, GYB, { s: 3 }); },
      look: async () => say('mira', 'Ein kleiner gusseiserner Kessel. Schwer, aber nützlich.'),
      use: async () => { setF('kesselWeg'); give('kessel'); await say('mira', 'Der Kessel kommt mit. Irgendwer muss ja kochen.'); }
    });
    list.push({
      id: 'feuer', name: 'Feuerstelle', r: [730, 420, 110, 60], walk: 790, face: -1,
      draw(c, t) { spr(c, 'ash_a', 780, GYB + 2, { s: 3 }); if (F('feuer')) { spr(c, anim('fire', 8, t, 10), 780, GYB + 6, { s: 4 }); } },
      look: async () => say('mira', F('feuer') ? 'Das Feuer knistert. Endlich etwas Wärme.' : 'Eine Feuerstelle aus Steinen. Kalte Asche, sonst nichts.'),
      use: async () => say('mira', F('feuer') ? 'Autsch. Heiß. Ich lasse es lieber brennen.' : 'Ohne Holz brennt hier gar nichts.'),
      items: {
        holz: async () => { if (F('feuer')) return say('mira', 'Es brennt schon.'); take('holz'); setF('feuer'); sfx('fire'); await say('mira', 'Holz auf die Asche, ein Funke vom Schlageisen … und es brennt! Ein Feuer im Winter – das ist echter Luxus.'); },
        fackel: async () => { if (!F('feuer')) return say('mira', 'Erst brauche ich ein Feuer.'); swap('fackel', 'fackelLit'); sfx('fire'); await say('mira', 'Die Fackel fängt Feuer. Flammen zum Mitnehmen!'); },
        phioleMisch: async () => {
          if (!F('feuer')) return say('mira', 'Ohne Feuer keine Wärme.');
          await say('mira', 'Ich halte die Phiole vorsichtig über die Flammen … Nicht kochen, nur sanft erwärmen …'); await sleep(600);
          swap('phioleMisch', 'essenz'); sfx('success'); await say('mira', 'Die Mischung leuchtet! Blütenessenz – wie ein kleiner Frühling im Glas.');
        }
      }
    });
    list.push({
      id: 'dreibein', name: 'Dreibein', r: [720, 300, 120, 130], walk: 690, face: 1,
      draw(c) {
        const cx = 390, top = GYB / 2 - 66, base = GYB / 2 - 4;
        pxLine(c, cx - 26, base, cx, top, 2, PX.wood2); pxLine(c, cx + 26, base, cx, top, 2, PX.wood2); pxLine(c, cx, base, cx, top, 2, PX.wood3); px(c, cx - 2, top - 2, 6, 3, PX.ink);
        if (F('tuchSpann')) { px(c, cx - 20, top + 14, 40, 12, '#e8e4d8'); px(c, cx - 20, top + 24, 40, 2, '#b8b4a8'); if (F('notizenAuf')) px(c, cx - 8, top + 17, 16, 6, '#d8c890'); else if (F('notizenLiegen')) px(c, cx - 8, top + 17, 16, 6, '#8a8a7a'); }
      },
      look: async () => say('mira', F('tuchSpann') ? 'Das Tuch hängt über dem Dreibein – im Wärmeschein des Feuers.' : 'Ein hölzernes Dreibein über der Feuerstelle. Da könnte man etwas aufspannen.'),
      use: async () => { if (F('tuchSpann') && (F('notizenAuf') || !has('notizenNass')) && !F('tuchZurueck')) { setF('tuchZurueck'); setF('tuchSpann', false); give('tuch'); return say('mira', 'Das Tuch ist getrocknet und weich. Ich nehme es vom Dreibein – als Flicken könnte es noch nützlich sein.'); } await say('mira', 'Ich rüttle daran. Es steht.'); },
      items: {
        tuch: async () => { if (F('tuchSpann')) return; take('tuch'); setF('tuchSpann'); sfx('use'); await say('mira', 'Ich spanne das Tuch übers Dreibein. Es taut schon in der Wärme auf.'); },
        notizenNass: async () => {
          if (!F('tuchSpann')) return say('mira', 'Ich brauche eine Unterlage – und Wärme.');
          if (!F('feuer')) return say('mira', 'Ohne Feuer trocknen die Notizen nie.');
          take('notizenNass'); setF('notizenLiegen'); await say('mira', 'Ich lege die Seiten vorsichtig aufs Tuch …'); await sleep(700);
          setF('notizenLiegen', false); setF('notizenAuf'); give('notizen'); sfx('success'); await say('mira', 'Trocken und lesbar! Elias\' Handschrift ist wie eh und je: unmöglich, aber lesbar.');
          await readNotes();
        }
      }
    });
    if (!F('holzWeg')) list.push({
      id: 'holzstapel', name: 'Holzstapel', r: sprR('logs', 850, GYB, 4), walk: 840, face: -1, draw(c) { spr(c, 'logs', 850, GYB, { s: 3 }); if (snow) px(c, 401, GYB / 2 - 32, 50, 4, '#fff'); },
      look: async () => say('mira', 'Ein Stapel Brennholz. Oben schneebedeckt, unten trocken – so wie Elias es immer machte.'),
      use: async () => { setF('holzWeg'); give('holz'); await say('mira', 'Trockene Scheite von ganz unten. Elias, du Genie.'); }
    });
    if (snow) list.push({
      id: 'schneewehe', name: 'Schneewehe', r: [900, 380, 60, 110], walk: 880, face: 1, draw(c) { spr(c, 'drift_big', 950, GYB + 6, { s: 3 }); },
      look: async () => say('mira', 'Eine mannshohe Schneewehe versperrt den Weg ins Dorf. Ohne Frühling komme ich hier nie durch.'),
      use: async () => say('mira', 'Ich buddle ein bisschen. Das macht die Wehe nur noch breiter.'),
      items: {
        phiole: async () => { swap('phiole', 'phioleSchnee'); sfx('use'); await say('mira', 'Frischer, sauberer Schnee in der Phiole.'); },
        axt: async () => say('mira', 'Ich hacke ein bisschen – der Schnee lacht nur. Es sind Tonnen davon.')
      }
    });
    list.push(edgeExit('r', 'dorf', 'Zum Dorfplatz', 110, () => curSeason() !== 'wi', 'Die Schneewehe versperrt den Weg. Ich müsste den Winter loswerden …'));
    return list;
  },
  async onEnter() { if (!F('introLager')) { setF('introLager'); await say('mira', 'Das Lager ist verlassen. Elias\' Zelt, sein Kochtopf … und überall Schnee. Mitten im Herbst!'); await say('mira', 'Elias, wo steckst du nur? Ich muss herausfinden, was hier passiert ist.'); } },
  async onSeason(n, o) { if (n !== 'wi' && !F('weg')) { setF('weg'); sfx('success'); await say('mira', 'Der Schnee schmilzt in Rekordzeit! Der Weg ins Dorf ist frei.'); } }
};

/* ======================= DORF ======================= */
SC.dorf = {
  id: 'dorf', title: 'Dorfplatz', natural: 'he', minX: 50, maxX: 890, startX: 120,
  land(c, se) { drawBG(c, se, { ox: 300 }); drawGround(c, se); spr(c, sv('bush', se), 330, GYB + 6); spr(c, 'pine_' + se, -10, GY + 60); },
  objs() {
    const se = curSeason(), list = [];
    list.push({
      id: 'haus', name: 'Tovins Haus', r: [40, 250, 340, 230], walk: 190, face: -1,
      draw(c) { spr(c, 'house', 210, GY + 14); if (se === 'wi') px(c, 12, 38, 90, 4, '#fff'); },
      look: async () => say('mira', 'Tovins Haus und Scheune. Schief wie ein Hut auf Sturm – aber gemütlich.'),
      use: async () => { if (F('scheuneAuf')) return say('mira', 'Die Scheune steht offen. Ich habe, was ich brauche.'); await say('mira', 'Das Scheunentor ist fest verschlossen. Ohne Schlüssel keine Chance.'); },
      items: {
        schluessel: async () => {
          if (F('scheuneAuf')) return;
          if (!F('oelDeal')) return say('mira', 'Der Schlüssel passt! Aber ohne Tovins Erlaubnis wühle ich hier nicht herum.');
          take('schluessel'); setF('scheuneAuf'); sfx('use'); await say('mira', 'Klick – das Schloss gibt nach. Drinnen stehen Fässer und Werkzeug … und da: Tovins Leinöl!');
          give('oel'); await say('mira', 'Das Öl gehört mir – ehrlich verdient mit Äpfeln.');
        }
      }
    });
    if (!F('flaschenWeg')) list.push({
      id: 'faesser', name: 'Fässer', r: sprR('barrels2', 430, GYB, 8), walk: 400, face: 1,
      draw(c) { spr(c, 'barrels2', 430, GYB, { s: 3 }); spr(c, 'bottle1', 476, GYB, { s: 3 }); },
      look: async () => say('mira', 'Ein paar Fässer – und daneben leere Flaschen. Tovin hat offenbar schon getestet, was drin war.'),
      use: async () => { setF('flaschenWeg'); give('flaschen'); await say('mira', 'Die leeren Flaschen klirren bei jedem Schritt. Ich nehme sie mit. Man weiß nie.'); }
    });
    else list.push({ id: 'faesser', name: 'Fässer', r: sprR('barrels2', 430, GYB, 8), walk: 400, draw(c) { spr(c, 'barrels2', 430, GYB, { s: 3 }); }, look: async () => say('mira', 'Tovins Fässer. Leer – wie meine Hoffnung auf eine Belohnung.'), use: async () => say('mira', 'Nichts mehr zu holen.') });
    list.push(npc('tovin', 'Tovin', 520, -1, 480, 1, 'Tovin, Müller und Bastler. Ein Mann, der aus jedem Schrott einen Plan baut.', () => tovinTalk()));
    list.push(npc('lio', 'Lio', 610, -1, 570, 1, 'Lio, ein aufgewecktes Kind mit Zöpfen und großen Ohren. Es sieht garantiert alles.', () => lioTalk()));
    if (se === 'he' && !F('kuerbisWeg')) list.push({
      id: 'kuerbisBeet', name: 'Kürbis', r: sprR('pumpkin_l', 680, GYB, 8), walk: 650, draw(c) { spr(c, 'pumpkin_l', 680, GYB + 2, { s: 3 }); },
      look: async () => say('mira', 'Ein praller Herbstkürbis. Schwer – und er riecht nach Suppe.'),
      use: async () => { setF('kuerbisWeg'); give('kuerbis'); await say('mira', 'Ein Kürbis! Der wird später sicher noch nützlich.'); }
    });
    list.push({
      id: 'apfelbaum', name: 'Apfelbaum', r: [770, 170, 180, 310], walk: 740, face: 1,
      draw(c) { const nm = se === 'so' ? (F('apfelWeg') ? 'tree_so' : 'tree_apfel') : 'tree_' + se; spr(c, nm, 870, GY + 14); },
      look: async () => say('mira', { fr: 'Der Apfelbaum steht in voller Blüte. Ein Zweig davon wäre eine Zier.', so: F('apfelWeg') ? 'Die Äpfel sind abgeerntet.' : 'Der Apfelbaum hängt voller praller, roter Sommeräpfel.', he: 'Nur noch Fallobst voller Wespen. Keine Chance.', wi: 'Kahl und still – unter der Schneelast. Der Apfelbaum schläft.' }[se]),
      use: async () => {
        if (se === 'so' && !F('apfelWeg')) { setF('apfelWeg'); give('aepfel'); await say('mira', 'Ich pflücke einen ganzen Korb voll. Einer landet zur Probe im Mund – köstlich!'); return; }
        await say('mira', { fr: 'Nur Blüten. Die Äpfel kommen später.', so: 'Ich habe genug Äpfel gepflückt.', he: 'Das Fallobst gehört den Wespen.', wi: 'Nichts als Schnee auf den Ästen.' }[se]);
      },
      items: { axt: async () => { if (se !== 'fr') return say('mira', 'Ich hacke am Baum herum – und ernte nichts als einen bösen Blick von Tovin.'); if (F('zweigWeg')) return say('mira', 'Ein Zweig reicht.'); setF('zweigWeg'); give('zweig'); await say('mira', 'Ein sauberer Schnitt – ein blühender Apfelblütenzweig. Der duftet nach Frühling.'); } }
    });
    list.push(archExit('feld', 'Feldweg', 735, GY + 6, 110, null, null, 84));
    list.push(edgeExit('l', 'lager', 'Zum Lager', 850, null));
    list.push(edgeExit('r', 'werkstatt', 'Zur Werkstatt', 330, null));
    return list;
  },
  async onEnter() { if (!F('introDorf')) { setF('introDorf'); await say('mira', 'Der Dorfplatz. Kaum jemand zu sehen – nur ein Bastler und ein Kind. Vielleicht wissen die etwas.'); } }
};

/* ======================= ERNTEFELD ======================= */
SC.feld = {
  id: 'feld', title: 'Erntefeld', natural: 'so', minX: 50, maxX: 900, startX: 120,
  land(c, se) {
    drawBG(c, se, { ox: 120 }); drawGround(c, se);
    const rows = [[GY - 10, 26, 0], [GY + 6, 34, 13]];
    if (se === 'fr' || se === 'so') rows.forEach(([y, st, o]) => { for (let x = o; x < W + 30; x += st) spr(c, se === 'so' ? 'wheat3' : 'wheat1', x, y, { s: 2 }); });
    else if (se === 'he') for (let x = 40; x < W; x += 110) spr(c, 'wheat_bundle', x, GY - 4, { s: 3 });
    else for (let x = 20; x < W; x += 140) spr(c, 'drift_s', x, GYB + 4, { s: 2 });
    // Zaun
    for (let x = 6; x < 480; x += 26) { px(c, x, GY / 2 - 20, 3, 18, PX.ink); px(c, x + 1, GY / 2 - 19, 1, 16, se === 'wi' ? '#ddd' : PX.wood3); }
    px(c, 0, GY / 2 - 15, 480, 2, PX.ink); px(c, 0, GY / 2 - 7, 480, 2, PX.ink);
    spr(c, 'tent_a', 110, GYB - 60, { s: 2 });
  },
  objs() {
    const se = curSeason(), list = [];
    list.push(npc('hedda', 'Hedda', 250, 1, 330, -1, 'Hedda, Lios Oma. Gesichtszüge wie ein alter Apfel – und Augen wie ein Falke.', () => heddaTalk()));
    const up = F('scheuSeil');
    list.push({
      id: 'scarecrow', actor: 'scarecrow', name: 'Vogelscheuche', r: up ? sprR('scarecrow', 560, GYB, 4) : [460, 430, 140, 50], walk: 500, face: 1,
      draw(c, t) {
        if (up) spr(c, 'scarecrow', 560, GYB, { s: 2 }); else spr(c, 'scarecrow', 530, GYB - 4, { s: 2, rot: -1.45 });
        if (F('scheuFlaschen')) { const s = Math.sin(t * 3) * (se === 'so' ? 0 : 6); [[-34, 100], [0, 80], [34, 100]].forEach(([dx, dy]) => { const bx = 560 + dx, by = GYB - dy; px(c, bx / 2 + s / 2, by / 2 + 4, 4, 9, '#5ac08a'); px(c, bx / 2 + s / 2 + 1, by / 2 + 5, 1, 4, '#d8fff0'); }); }
      },
      look: async () => say('mira', !up ? 'Die Vogelscheuche liegt schief im Feld. Sie hat schon lange keine Krähe mehr erschreckt.' : (F('scheuFlaschen') ? 'Aufrecht und behängt mit Flaschen: eine wachsame Vogelscheuche.' : 'Sie steht wieder! Aber ein wenig … langweilig, so ohne Geklirr.')),
      use: async () => say('mira', 'Ich tätschle sie freundlich. Sie bleibt reserviert.'),
      items: {
        seil: async () => { if (F('scheuSeil')) return say('mira', 'Sie steht doch schon.'); setF('scheuSeil'); sfx('use'); await say('mira', 'Ich stelle die Vogelscheuche auf und binde sie mit dem Seil an ihrer Stange fest. Sie steht wie eine Eins!'); await checkCrows(); },
        flaschen: async () => { if (!F('scheuSeil')) return say('mira', 'Erst muss sie aufrecht stehen, sonst klirrt nichts.'); if (F('scheuFlaschen')) return; take('flaschen'); setF('scheuFlaschen'); sfx('use'); await say('mira', 'Ich hänge die Flaschen an die Arme. Ein Windhauch – und sie klirren, blinken und klingeln.'); await checkCrows(); }
      }
    });
    if (!has('schluessel') && !F('scheuneAuf') && se === 'fr') list.push({
      id: 'schluessel', name: F('krWeg') ? 'Scheunenschlüssel' : 'Krähen', r: [600, 420, 80, 60], walk: 640, face: 1,
      draw(c, t) {
        px(c, 311, GY / 2 - 3, 10, 2, '#e8c040'); px(c, 308, GY / 2 - 4, 4, 4, '#e8c040'); px(c, 309, GY / 2 - 3, 2, 2, '#4a3a20'); px(c, 318, GY / 2 - 1, 2, 3, '#e8c040');
        if (!F('krWeg')) for (let i = 0; i < 3; i++) pxCrow(c, 610 + i * 30, GY + 4 + (i % 2) * 6, t + i, i % 2 ? -1 : 1);
        else if (Math.sin(t * 5) > 0) { px(c, 313, GY / 2 - 8, 1, 3, '#fff'); px(c, 312, GY / 2 - 7, 3, 1, '#fff'); }
      },
      look: async () => say('mira', F('krWeg') ? 'Da liegt ein glänzender Schlüssel – zwischen den Keimlingen versteckt.' : 'Drei Krähen hüpfen um etwas Glänzendes herum. Sie krächzen mich böse an.'),
      use: async () => {
        if (F('krWeg')) { give('schluessel'); setF('schluesselHat'); await say('mira', 'Tovins Scheunenschlüssel! Endlich.'); insight('Jedes Feld hat seine Zeit – wer alles auf einmal will, verliert alles auf einmal.'); return; }
        sfx('fail'); await say('mira', 'Ich strecke die Hand aus – die Krähen hacken nach mir! Und sie krächzen, als hätte ich sie beleidigt.');
      }
    });
    if (se === 'he') {
      if (!F('strohWeg')) list.push({ id: 'stroh', name: 'Strohgarben', r: [380, 420, 110, 60], walk: 420, draw(c) { for (let i = 0; i < 3; i++) spr(c, 'wheat_bundle', 390 + i * 38, GYB + 2, { s: 3 }); }, look: async () => say('mira', 'Trockene Strohgarben. Brennt schnell und heiß – der Brennstoff der ersten Ballonfahrer.'), use: async () => { setF('strohWeg'); give('stroh'); await say('mira', 'Ich nehme ein paar Garben mit. Vielleicht hilft das einem Ballon in die Luft.'); } });
      if (!F('kuerbisWeg')) list.push({ id: 'kuerbisFeld', name: 'Kürbis', r: sprR('pumpkin_l', 720, GYB, 8), walk: 700, draw(c) { spr(c, 'pumpkin_l', 720, GYB + 2, { s: 3 }); }, look: async () => say('mira', 'Ein praller Herbstkürbis am Feldrand.'), use: async () => { setF('kuerbisWeg'); give('kuerbis'); await say('mira', 'Ein Kürbis! Der wird später sicher noch nützlich.'); } });
    }
    list.push({
      id: 'weizen', name: se === 'so' ? 'Weizenfeld' : 'Feld', r: [300, 380, 140, 90], walk: 400, draw() { },
      look: async () => say('mira', { fr: 'Zarte, junge Keimlinge. Zwischen ihnen glitzert etwas.', so: 'Der Weizen steht hoch und golden – hoch genug, um einen Schlüssel darin völlig zu verlieren.', he: 'Stoppeln und Erntereste.', wi: 'Das Feld schläft unter einer Schneedecke.' }[se]),
      use: async () => say('mira', se === 'so' ? 'Ich wühle durch den hohen Weizen. Nichts als Ähren, so weit man sieht.' : 'Hier gibt es nichts zu tun.')
    });
    list.push(edgeExit('l', 'dorf', 'Zum Dorfplatz', 700, null));
    return list;
  },
  async onEnter() { if (!F('introFeld')) { setF('introFeld'); await say('mira', 'Das Erntefeld. Es ist Sommer – der Weizen steht mannshoch. Ob Lio hier wirklich einen Schlüssel verloren hat?'); } await checkCrows(); },
  async onSeason() { await checkCrows(); }
};

/* ======================= WERKSTATT ======================= */
SC.werkstatt = {
  id: 'werkstatt', title: 'Runas Werkstatt', natural: 'he', minX: 50, maxX: 880, startX: 330,
  land(c, se) {
    drawBG(c, se, { ox: 520 }); drawGround(c, se);
    for (let x = 0; x < W; x += 100) spr(c, 'wall', x + 50, GYB - 12);
    spr(c, 'barrels2', 930, GYB + 2, { s: 3 }); spr(c, 'crates2', 680, GYB, { s: 3 });
  },
  objs() {
    const se = curSeason(), list = [];
    const luft = ['zu', 'halb offen', 'offen'][S.flags.luft || 0];
    list.push({
      id: 'ofen', name: 'Schmelzofen', r: [100, 340, 150, 140], walk: 250, face: -1,
      draw(c, t) {
        spr(c, F('ofenBrennt') ? anim('furnace', 6, t, 9) : 'furnace_cold', 170, GYB + 4, { s: 4 });
        const lx = 232, ly = GYB - 60, ang = S.flags.luft || 0; c.fillStyle = INK; c.fillRect(lx - 4, ly - 4, 40, 10);
        const dx = [-10, 14, 34][ang], dy = [16, 0, -18][ang]; pxLine(c, lx / 2 + 1, ly / 2 + 1, lx / 2 + 1 + Math.round(dx / 2), ly / 2 + 1 + Math.round(dy / 2), 2, '#c08a3a'); px(c, lx / 2 + 1 + Math.round(dx / 2) - 1, ly / 2 + Math.round(dy / 2), 3, 3, '#d04a3a');
        if (F('ofenBrennt')) { c.fillStyle = 'rgba(255,140,40,.10)'; c.beginPath(); c.arc(170, GYB - 40, 190, 0, 7); c.fill(); }
        else if (F('holzImOfen')) { px(c, 70, GYB / 2 - 14, 30, 5, '#d0a060'); px(c, 76, GYB / 2 - 10, 30, 5, '#b08040'); }
      },
      look: async () => say('mira', 'Runas Schmelzofen. Auf der Seite sitzt eine Luftklappe – "' + luft + '". ' + (F('holzImOfen') ? 'Trockenes Holz liegt schon drin.' : 'Er ist leer und kalt.')),
      use: async () => { S.flags.luft = ((S.flags.luft || 0) + 1) % 3; sfx('click'); await say('mira', 'Ich drehe an der Luftklappe. Sie steht jetzt auf "' + ['zu', 'halb offen', 'offen'][S.flags.luft] + '".'); },
      items: {
        holzTrocken: async () => { if (F('holzImOfen')) return; take('holzTrocken'); setF('holzImOfen'); sfx('use'); await say('mira', 'Ich schichte die trockenen Scheite in den Ofen.'); },
        holz: async () => say('mira', 'Das Lagerholz ist für ein Lagerfeuer gedacht. Für einen Schmelzofen brauche ich mehr – und trockeneres Holz von Runas Sägewerk.'),
        holzNass: async () => say('mira', 'Nasses Holz im Ofen? Das gäbe nur Qualm und einen Wutanfall von Runa.'),
        fackelLit: async () => {
          if (!F('holzImOfen')) return say('mira', 'Ohne Holz gibt es nichts anzuzünden.');
          const l = S.flags.luft || 0;
          if (l === 0) { sfx('fail'); return say('mira', 'Die Fackel züngelt am Holz – und erstickt. Luftklappe zu: Dem Feuer fehlt die Luft. Verbrennung braucht Sauerstoff!'); }
          if (l === 2) { sfx('fail'); return say('mira', 'Die Flamme flackert und kühlt aus – zu viel kalte Luft zieht durch. Ich muss die Klappe irgendwo dazwischen einstellen.'); }
          setF('ofenBrennt'); sfx('fire'); await say('mira', 'Die Fackel entzündet das trockene Holz, und mit halb offener Klappe faucht der Ofen zum Leben. Perfekt!');
          if (!F('runaOfenGesehen')) { setF('runaOfenGesehen'); await say('runa', 'Na also! Das Feuer brennt sauber. Kluges Mädchen.'); }
        },
        fackel: async () => say('mira', 'Die Fackel ist nicht angezündet. Erst am Lagerfeuer entzünden.'),
        kessel: async () => { if (!F('ofenBrennt')) return say('mira', 'Der Ofen ist kalt. Ohne Feuer keine Asche.'); if (has('kesselAsche')) return; swap('kessel', 'kesselAsche'); await say('mira', 'Ich schaufle etwas feine, kalte Asche aus dem Ofenrost. Kann man sicher mal brauchen.'); }
      }
    });
    list.push(npc('runa', 'Runa', 335, 1, 380, -1, 'Runa, die Schmiedin. Arme wie Brechstangen und ein Blick, der Eisen schmelzen könnte.', () => runaTalk(), { items: { haematit: () => runaSegment() } }));
    list.push({
      id: 'saege', name: 'Sägewerk', r: [470, 340, 140, 140], walk: 450, face: 1,
      draw(c, t) { spr(c, F('saegeGeoelt') ? (F('saegeBetrieb') ? anim('saw', 6, t, 12) : 'saw0') : 'saw_rust', 540, GYB + 4, { s: 4 }); },
      look: async () => say('mira', F('saegeGeoelt') ? 'Das geölte Sägewerk dreht sich sanft und flüsterleicht.' : 'Das Sägewerk. Das Blatt ist festgerostet – mit ein bisschen Öl wäre es wieder flott.'),
      use: async () => {
        if (!F('saegeGeoelt')) return say('mira', 'Ich drücke am Hebel. Es knirscht und quietscht – aber nichts bewegt sich. Rost!');
        if (F('holzGesaegtDone')) return say('mira', 'Genug Scheite gesägt.');
        sfx('use'); setF('saegeBetrieb'); await say('mira', 'Das Blatt kreischt durch einen Stamm – Sägemehl wirbelt.'); await sleep(500); setF('saegeBetrieb', false); give('holzNass'); setF('holzGesaegtDone'); await say('mira', 'Frisch gesägte, nasse Scheite. Die müssen erst trocknen.');
      },
      items: {
        oel: async () => { if (F('saegeGeoelt')) return; take('oel'); setF('saegeGeoelt'); sfx('success'); await say('mira', 'Ich träufle Tovins Leinöl auf Lager und Sägeblatt. Es ächzt … dann läuft es rund!'); }
      }
    });
    list.push({
      id: 'gestell', name: 'Trockengestell', r: [700, 370, 200, 110], walk: 690, face: 1,
      draw(c) {
        for (const x of [366, 452]) { px(c, x, GYB / 2 - 44, 4, 46, PX.ink); px(c, x + 1, GYB / 2 - 43, 2, 44, PX.wood2); }
        for (const y of [34, 22, 10]) { px(c, 364, GYB / 2 - y, 92, 3, PX.ink); px(c, 365, GYB / 2 - y + 1, 90, 1, PX.wood3); }
        if (F('holzNassAuf')) { spr(c, 'logs', 780, GYB - 40, { s: 2 }); if (curSeason() !== 'so') { c.fillStyle = 'rgba(40,70,110,.35)'; c.fillRect(734, GYB - 64, 92, 24); } }
      },
      look: async () => say('mira', F('holzNassAuf') ? (curSeason() === 'so' ? 'Die Scheite trocknen in der Sommersonne knochentrocken.' : 'Die Scheite liegen feucht im Herbstnebel. Trocken werden sie so nie.') : 'Ein Trockengestell für frisches Holz. Im Sommer trocknet hier alles in Tagen.'),
      use: async () => {
        if (F('holzNassAuf') && curSeason() === 'so') { setF('holzNassAuf', false); give('holzTrocken'); await say('mira', 'Knochentrocken – perfekt für den Ofen!'); return; }
        if (F('holzNassAuf')) return say('mira', 'Das Holz ist noch nass. Im Herbstnebel trocknet hier gar nichts. Ich brauche Sommer.');
        await say('mira', 'Nichts drauf. Ich lege gern nasse Scheite auf.');
      },
      items: {
        holzNass: async () => { take('holzNass'); setF('holzNassAuf'); sfx('use'); await say('mira', 'Ich lege die nassen Scheite aufs Gestell.'); if (curSeason() === 'so') await say('mira', 'Die Sommersonne wird sie rasch trocknen.'); else await say('mira', 'Im Herbstnebel trocknet das nie. Ich brauche Sommer!'); }
      }
    });
    list.push(edgeExit('l', 'dorf', 'Zum Dorfplatz', 860, null));
    list.push(archExit('bergpfad', 'Bergpfad', 900, GY + 6, 120, () => F('stangeHat'), 'Hinter dem Sägewerk führt ein Torbogen zum Bergpfad. Aber ohne Runas Segen und Werkzeug will ich da nicht hinauf.', 70));
    list.push(archExit('garten', 'Selmas Garten', 410, GY + 6, 120, () => F('segment'), 'Der Torbogen führt zu Selmas Garten. Erst muss ich Runa das Hämatit bringen – ihr Segment schaltet die nächste Jahreszeit frei.', 80));
    return list;
  },
  async onEnter() {
    if (!F('runaMet')) {
      setF('runaMet'); await say('mira', 'Eine Werkstatt! Rauch, Ruß – und eine Frau am Ofen, die genau weiß, was sie will.');
      await say('runa', 'Hände weg von den Werkzeugen, Fremde! … Nein, ich mache Spaß. Ich bin Runa. Was führt dich her?');
      await say('mira', 'Ich suche meinen Lehrmeister Elias und die Jahreszeiten, die durcheinandergeraten sind.'); await say('runa', 'Dann bist du hier richtig. Der Ofen ist kalt, das Sägewerk festgerostet – bring mir trockenes Holz und wir reden.');
    }
  },
  async onSeason(n) { }
};
