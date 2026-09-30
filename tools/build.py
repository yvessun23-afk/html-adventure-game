#!/usr/bin/env python3
"""Baut Das_Schloss_der_verlorenen_Jahreszeiten.html aus src/ und den Ressourcen.

Aufruf:  python3 tools/build.py            (benötigt build/assets.json aus tools/build_assets.py)
Reihenfolge der Quellen:  src/game_base.js (Logik, Dialoge, Overlays)  +  src/art.js  +  src/scenes1-3.js  +  src/ui.js
"""
import re, sys, json, subprocess, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(root, p), encoding='utf-8').read()

s = rd('src/game_base.js')

def remove(name, what=None):
    global s
    pat = r'^(?:async function|function|const|let) ' + re.escape(name) + r'\b' if what is None else what
    m = re.search(pat, s, re.M)
    if not m:
        print('  (nicht gefunden: %s)' % name); return
    start = m.start(); le = s.index('\n', start); line = s[start:le]
    if line.count('{') == line.count('}') and line.count('[') == line.count(']') and line.count('(') == line.count(')'):
        end = le + 1
    else:
        m2 = re.compile(r'^[}\]](?:\))?;?\n', re.M).search(s, le); end = m2.end()
    s = s[:start] + s[end:]

def rep(a, b):
    global s
    if a not in s: print('  !! Muster fehlt:', a[:70]); return
    s = s.replace(a, b, 1)

# --- Teile aus dem alten „TEIL 2“ retten (Gegenstände, Namen), dann den Bereich streichen ---
i = s.index('Object.assign(ITEMS, {'); j = s.index('\n});', i) + 4
items_extra = s[i:j]
names_line = re.search(r'^const NAMES = \{.*\};$', s, re.M).group(0)
a = s.index('/* =====================================================================\n   TEIL 2'); b = s.index('/* =====================================================================\n   TEIL 3')
s = s[:a] + s[b:]

# --- alte Vektorkunst und Szenen entfernen ---
for n in ['blobPath', 'shadeFill', 'blob', 'mountains', 'hills', 'groundBase', 'pine', 'bare', 'tree', 'house', 'barrel', 'fence', 'bush', 'flame', 'smoke',
          'txt', 'wrap', 'rrect', 'CHAR', 'drawChar', 'edgeExit', 'archExit', 'crow', 'getLand', 'drawSky', 'cloud', 'hsh', 'parts', 'drawParticles', 'vign', 'drawVignette',
          'drawScene', 'bubbleFor', 'button', 'panel', 'drawHUD', 'drawCursor', 'drawTitle', 'SEASON_ICON', 'landCache',
          'drawGarland', 'mpos', 'drawMap', 'quadSeasons', 'introCache', 'cached', 'sealDisc', 'INTRO', 'introIdx', 'drawIntro', 'drawEnding']:
    remove(n)
for sc in ['lager', 'dorf', 'feld', 'werkstatt']:
    remove('SC.' + sc, r'^SC\.' + sc + r' = \{')
remove('x', r'^SC\.insel\.noTravel = true;')
rep("let landKey = '', landCv = null;", '')     # jetzt in ui.js

# --- Anpassungen am Kern ---
rep("const W = 960, H = 540, GY = 470;", "const W = 960, H = 540, GY = 472;")
s = re.sub(r"^const FONT = .*$", "const FONT = '\"Trebuchet MS\",\"DejaVu Sans\",Verdana,sans-serif';", s, count=1, flags=re.M)
rep("if (ui === 'title') { drawTitle(ctx, tSum); }", "if (!ASSETS_READY) { ctx.fillStyle = '#120c08'; ctx.fillRect(0, 0, W, H); txt(ctx, 'Lade …', W / 2, H / 2, 28, '#fff', 'center'); }\n  else if (ui === 'title') { drawTitle(ctx, tSum); }")
rep("c.font = '36px ' + FONT; c.textAlign = 'center'; c.fillStyle = INK; c.fillText(SYM[arr[i]], p[0], p[1] + 12);", "if (arr[i]) glyph(c, ['', 'fr', 'so', 'wi', 'he'][arr[i]], p[0] - 20, p[1] - 20, 5);")
rep("{ disabled: !S.unlocked.includes(s), fill: PAL[s].sky[1] }", "{ disabled: !S.unlocked.includes(s), fill: PAL[s].sky[1], glyph: s }")
rep("SEASON_ICON[s] + ' ' + SEASONS[s] + (s === cur ? ' ✓' : '') + (s === nat ? ' ·' : '')", "SEASONS[s] + (s === cur ? ' *' : '') + (s === nat ? ' ·' : '')")
# Ton: keine Änderung nötig

# --- Zusammenbau ---
art = rd('src/art.js')
marker = "const SEASONS = {"
k = s.index(marker); k2 = s.index('\n', k) + 1
s = s[:k2] + '\n' + art + '\n' + s[k2:]
tail = '\n'.join([items_extra, "ITEMS.tuch.d = 'Ein Leinentuch von der Wäscheleine. Steif gefroren.';", names_line, "Object.assign(ITEMS.tagebuch, { direct: true });", rd('src/scenes1.js'), rd('src/scenes2.js'), rd('src/scenes3.js'), rd('src/ui.js')])
mk = '/* ----- Start ----- */'
s = s.replace(mk, tail + '\n' + mk, 1)

open(os.path.join(root, 'build', 'game.js'), 'w', encoding='utf-8').write(s)
assets = open(os.path.join(root, 'build', 'assets.json'), encoding='utf-8').read()
tpl = rd('src/template.html')
html = tpl.replace('/*ASSETS*/', 'const ASSETS = ' + assets + ';').replace('/*GAME*/', s)
out = os.path.join(root, 'Das_Schloss_der_verlorenen_Jahreszeiten.html')
open(out, 'w', encoding='utf-8').write(html)
r = subprocess.run(['node', '--check', os.path.join(root, 'build', 'game.js')], capture_output=True, text=True)
print('HTML: %.2f MB' % (len(html.encode()) / 1e6), '| node --check:', 'OK' if r.returncode == 0 else r.stderr[:1500])
