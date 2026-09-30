#!/usr/bin/env python3
"""Baut aus Assets.zip die eingebetteten Spiel-Ressourcen (Atlas, Figurenblätter, Hintergründe, Karte, Icons).

Aufruf:  python3 tools/build_assets.py Assets.zip build/assets.json [build/gallery.png]
Die GandalfHardcore-Bilder werden nur für das Spiel zugeschnitten und eingebettet (Lizenz: Nutzung in Spielen erlaubt).
"""
import sys, io, json, base64, zipfile, colorsys, random
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

zpath, outjson = sys.argv[1], sys.argv[2]
gallery = sys.argv[3] if len(sys.argv) > 3 else None
Z = zipfile.ZipFile(zpath)
NAMES = {}
for n in Z.namelist():
    if n.startswith('__MACOSX') or n.endswith('/'): continue
    NAMES[n.split('/')[-1]] = n            # Dateiname -> Pfad (Namen sind eindeutig bis auf die Hintergrund-Layer)
def find(suffix):
    names = [n for n in Z.namelist() if not n.startswith('__MACOSX')]
    if '/' not in suffix:                      # reiner Dateiname: exakt vergleichen (Decor.png ≠ Alchemy Decor.png)
        for n in names:
            if n.split('/')[-1] == suffix: return n
    for n in names:
        if n.endswith(suffix): return n
    raise KeyError(suffix)
def img(suffix): return Image.open(io.BytesIO(Z.read(find(suffix)))).convert('RGBA')
def b64png(im, **kw):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
def b64jpg(im, q=82):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

SPR = {}     # name -> PIL image
def crop(name, sheet, x, y, w, h): SPR[name] = img(sheet).crop((x, y, x + w, y + h))
def put(name, im): SPR[name] = im
def crop_cc(name, sheet, x, y, w, h):
    im = img(sheet).crop((x, y, x + w, y + h)); a = np.array(im); lab, n = ndimage.label(a[:, :, 3] > 0, structure=np.ones((3, 3)))
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); keep = 1 + int(np.argmax(sizes)); a[lab != keep] = 0
    im = Image.fromarray(a); bb = im.getbbox(); SPR[name] = im.crop(bb)

# ---------------------------------------------------------------- Bäume
for se, f in [('so', 'Tree1'), ('apfel', 'Tree2'), ('he', 'Tree3'), ('wi', 'Tree4')]: put('tree_' + se, img(f + '.png'))
def blossom(im, seed=3):
    a = np.array(im); rnd = np.random.RandomState(seed); ys, xs = np.where(a[:, :, 3] > 0)
    green = [(y, x) for y, x in zip(ys, xs) if a[y, x, 1] > a[y, x, 0] + 20 and y < 140]
    for i in rnd.choice(len(green), min(len(green), 900), replace=False):
        y, x = green[i]
        if rnd.rand() < .5: a[y, x] = (255, 182, 210, 255) if rnd.rand() < .7 else (255, 240, 246, 255)
    return Image.fromarray(a)
put('tree_fr', blossom(img('Tree1.png')))
for se, f in [('so', 'Weeping Willow1'), ('he', 'Weeping Willow2'), ('wi', 'Weeping Willow3')]: put('willow_' + se, img(f + '.png'))
put('willow_fr', img('Weeping Willow1.png'))
for se, f in [('so', 'Birch1'), ('he', 'Birch2'), ('wi', 'Birch3')]: put('birch_' + se, img(f + '.png'))
put('birch_fr', img('Flowering Tree.png')); put('bonsai', img('Pixel Art Bonsai.png').crop((11, 28, 54, 64)))
# Kiefern (Pine Trees.png 672x192): 0 grün, 3 oliv, 5 rot, 6 orange, 7 Schnee
pt = 'Pine Trees.png'
for n, x0 in [('pine_so', 0), ('pine_fr', 96), ('pine_he', 224), ('pine_he2', 320), ('pine_wi', 448)]: crop_cc(n, pt, x0, 0, 96, 192)
crop('stump1', pt, 2, 31, 28, 42)
crop('trunk', 'Pine forest sheet.png', 10, 0, 44, 208)
crop('larch', 'Large Pine Tree.png', 0, 7, 128, 169)

# ---------------------------------------------------------------- Decor.png
D = 'Decor.png'
for n, r in {
    'crate': (2, 16, 27, 16), 'crates2': (34, 0, 27, 32), 'barrel': (73, 14, 15, 18), 'barrels2': (98, 14, 29, 18), 'stool': (137, 19, 14, 13),
    'cauldron': (168, 17, 18, 15), 'stump_cleaver': (199, 3, 18, 29), 'stump_axe': (231, 11, 21, 21), 'stall': (262, 6, 51, 58),
    'apples_s': (326, 21, 19, 11), 'apples_l': (354, 14, 28, 18), 'bottles': (387, 20, 25, 12),
    'tent_a': (0, 57, 96, 40), 'tent_b': (96, 57, 96, 40), 'tripod_pot': (32, 96, 32, 32), 'ash_a': (0, 113, 32, 15), 'ash_b': (69, 110, 23, 18),
    'logs': (201, 75, 47, 21), 'table': (267, 77, 39, 19), 'basket_a': (328, 81, 17, 15), 'basket_b': (360, 81, 17, 15), 'bottle1': (397, 84, 5, 12),
    'bucket_a': (106, 116, 12, 12), 'bucket_b': (139, 113, 10, 15), 'plate': (168, 122, 17, 6),
    'grave_a': (197, 104, 23, 24), 'grave_b': (229, 104, 21, 24), 'grave_c': (262, 107, 22, 21), 'grave_d': (293, 101, 21, 27), 'grave_e': (321, 106, 28, 22),
    'pumpkin_s': (362, 117, 14, 11), 'pumpkin_l': (390, 113, 19, 15), 'reeds': (288, 139, 64, 53), 'wall': (359, 141, 50, 51),
    'rock_so_a': (35, 177, 26, 15), 'rock_so_b': (66, 181, 26, 11), 'rock_he_a': (131, 177, 26, 15), 'rock_he_b': (162, 181, 26, 11), 'rock_wi_a': (227, 177, 26, 15), 'rock_wi_b': (258, 181, 26, 11),
    'rocks_so': (36, 237, 52, 19), 'rocks_he': (132, 237, 52, 19), 'rocks_wi': (228, 237, 52, 19),
    'bigrock_so': (4, 280, 88, 40), 'bigrock_so2': (100, 280, 88, 40), 'bigrock_he': (196, 280, 88, 40), 'bigrock_wi': (292, 280, 88, 40),
    'statue': (387, 265, 26, 55), 'scarecrow': (300, 197, 40, 59), 'laundry': (27, 354, 106, 62), 'rope': (32, 325, 96, 9),
    'leaves_big': (322, 332, 93, 20), 'drift_big': (258, 333, 93, 19), 'leaves_s': (326, 369, 56, 15), 'drift_s': (228, 369, 55, 15),
    'bush_so': (3, 424, 57, 24), 'bush_so2': (64, 431, 62, 17), 'bush_he': (3, 456, 57, 24), 'bush_he2': (64, 463, 62, 17), 'bush_wi': (3, 488, 57, 24), 'bush_wi2': (64, 495, 62, 17),
}.items(): crop(n, D, *r)
for k in ('bush_so', 'bush_so2'):
    put(k.replace('so', 'fr'), SPR[k])
put('bigrock_fr', SPR['bigrock_so']); put('rocks_fr', SPR['rocks_so']); put('rock_fr_a', SPR['rock_so_a']); put('rock_fr_b', SPR['rock_so_b'])
# Wäscheleine ohne Tuch: helle Pixel (Stoff) zwischen den Pfosten entfernen
lw = np.array(SPR['laundry']); lum = lw[:, :, :3].mean(axis=2)
lw2 = lw.copy(); m = (lum > 150) & (np.arange(lw.shape[1])[None, :] > 8) & (np.arange(lw.shape[1])[None, :] < lw.shape[1] - 8); lw2[m, 3] = 0; put('laundry_empty', Image.fromarray(lw2))
put('bigrock_so_dark', SPR['bigrock_so'])

crop('stump_plain', D, 199, 14, 18, 18)
# Garten
G = 'Garden Decorations.png'
for n, r in {'pot_vio': (0, 7, 31, 26), 'pot_silber': (0, 33, 31, 31), 'pot_gruen': (36, 7, 23, 25), 'pot_oliv': (37, 36, 21, 28), 'pot_empty': (72, 19, 16, 13), 'pedestal': (35, 86, 27, 42), 'urn_green': (99, 66, 27, 62), 'cypress': (130, 26, 28, 102), 'gtree': (163, 38, 56, 90), 'bust': (5, 83, 21, 45)}.items(): crop(n, G, *r)
def dull(im):
    a = np.array(im).astype(float); g = a[:, :, :3].mean(axis=2, keepdims=True); a[:, :, :3] = np.clip((a[:, :, :3] * .25 + g * .75) * .8, 0, 255); return Image.fromarray(a.astype(np.uint8))
for k in ('pot_vio', 'pot_silber', 'pot_gruen', 'pot_oliv'): put(k + '_c', dull(SPR[k]))
A = 'Alchemy Decor.png'
for n, r in {'girlande': (1, 0, 61, 26), 'herbs': (4, 32, 25, 26), 'labtable': (35, 42, 26, 22), 'labtable2': (79, 26, 37, 38), 'stand': (137, 46, 14, 18)}.items(): crop(n, A, *r)
# Sonstiges
crop('ore_haematit', 'Ores.png', 6, 26, 53, 38); crop('ore_x', 'Ores.png', 70, 26, 53, 38); crop('ore_pyrit', 'Ores.png', 6, 90, 53, 38); crop('ore_azurit', 'Ores.png', 70, 90, 53, 38)
def hueshift(im, deg, sat=1.0, val=1.0):
    a = np.array(im).astype(float) / 255; out = a.copy()
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y, x, 3] > 0:
                h, s, v = colorsys.rgb_to_hsv(*a[y, x, :3]); h = (h + deg / 360) % 1; r, g, b = colorsys.hsv_to_rgb(h, min(1, s * sat), min(1, v * val)); out[y, x, :3] = (r, g, b)
    return Image.fromarray((out * 255).astype(np.uint8))
put('ore_limonit', hueshift(SPR['ore_x'], 20, 1.4, 1.0))
crop('tent_large', 'Large Tent.png', 0, 7, 96, 121); crop('tent_small', 'Small Tent.png', 0, 0, 64, 64); crop('angel', 'Angel Statue.png', 9, 0, 48, 64)
for i in range(10): crop('boat%d' % i, 'Boat.png', 1 + 80 * i, 7, 78, 25)
W = 'Pixel Art Wheat.png'
for n, r in {'wheat0': (42, 20, 10, 12), 'wheat1': (73, 13, 12, 19), 'wheat2': (102, 7, 16, 25), 'wheat3': (133, 0, 19, 32), 'wheat_basket': (165, 17, 23, 15), 'wheat_sack': (198, 12, 20, 20), 'wheat_bundle': (226, 16, 12, 15)}.items(): crop(n, W, *r)
crop('tallgrass', 'Tall Grass.png', 0, 12, 96, 20)
# Fackeln
T = 'Torch.png'; crop('torch_off', T, 13, 14, 6, 18)
for i, r in enumerate([(107, 38, 9, 28), (139, 37, 8, 28), (171, 36, 8, 28), (13, 68, 7, 28), (76, 70, 7, 26)]): crop('torch%d' % i, T, *r)
# Ofen / Säge
F = 'Pixel Art Furnace and Sawmill.png'
for i in range(6): crop('furnace%d' % i, F, i * 64, 0, 64, 64); crop('saw%d' % i, F, i * 64, 64, 64, 64)
fa = np.array(SPR['furnace0']); cold = fa.copy(); fire = (fa[:, :, 0] > 170) & (fa[:, :, 1] < 220) & (fa[:, :, 2] < 120) & (fa[:, :, 3] > 0)
cold[fire] = (26, 20, 24, 255); put('furnace_cold', Image.fromarray(cold))
sa = np.array(SPR['saw0']).astype(float); rust = sa.copy(); rust[:, :, 0] = np.minimum(255, sa[:, :, 0] * 1.2 + 25); rust[:, :, 2] = sa[:, :, 2] * .7; put('saw_rust', Image.fromarray(rust.astype(np.uint8)))
# Lagerfeuer / Kochstelle (animiert)
cf = img('Campfire sheet.png'); cfood = img('Campfire with food sheet.png')
for i in range(8): put('fire%d' % i, cf.crop((0, i * 32, 32, i * 32 + 32))); put('fire_pot%d' % i, cfood.crop((0, i * 32, 32, i * 32 + 32)))
ck = img('Cooking area.png')
for i in range(12): put('cook%d' % i, ck.crop((i * 64, 32, i * 64 + 64, 64)))
po = img('GandalfHardcore Portal sheet.png')
for i in range(10): put('portal%d' % i, po.crop((i * 64, 0, i * 64 + 64, 64)))
def tint_hue(im, hue, sat=None):
    a = np.array(im).astype(float) / 255; out = a.copy()
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y, x, 3] > 0:
                h, s_, v = colorsys.rgb_to_hsv(*a[y, x, :3])
                if s_ > .18 and v > .25: r, g, b = colorsys.hsv_to_rgb(hue, min(1, (s_ if sat is None else sat)), v); out[y, x, :3] = (r, g, b)
    return Image.fromarray((out * 255).astype(np.uint8))
for n, hue in [('violett', .76), ('gelb', .14), ('gruen', .33)]: put('girl_' + n, tint_hue(SPR['girlande'], hue, 0.75))
# Himmel
crop('sun', 'sun.png', 0, 0, 32, 32)
for i in range(1, 7): put('cloud%d' % i, img('cloud%d.png' % i))
for i in range(1, 5): put('bird%d' % i, img('birds%d.png' % i))
put('balloon', img('hot air balloon.png'))
# Hp bar
put('medal', img('Hp bar.png'))

# Haus aus den House Tiles: geschlossene Löcher mit Mauerfarbe füllen
ht = img('House Tiles.png').crop((20, 0, 204, 196)); a = np.array(ht); opaque = a[:, :, 3] > 0
lab, n = ndimage.label(~opaque); edge = set(np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]])))
for i in range(1, n + 1):
    if i not in edge: a[lab == i] = (126, 110, 96, 255)
for x in range(a.shape[1]):                      # Dachboden: alles zwischen Dach und Balken auffüllen
    col = a[:, x, 3] > 0
    if col[:100].any():
        y0 = int(np.argmax(col)); 
        for y in range(y0, 100):
            if a[y, x, 3] == 0: a[y, x] = (126, 110, 96, 255)
put('house', Image.fromarray(a))

# ---------------------------------------------------------------- Atlas packen
items = sorted(SPR.items(), key=lambda kv: (-kv[1].height, kv[0]))
AW = 1024; x = y = rowh = 0; pos = {}
for name, im in items:
    if x + im.width + 1 > AW: x = 0; y += rowh + 1; rowh = 0
    pos[name] = [x, y, im.width, im.height]; x += im.width + 1; rowh = max(rowh, im.height)
atlas = Image.new('RGBA', (AW, y + rowh + 1), (0, 0, 0, 0))
for name, im in SPR.items(): atlas.paste(im, tuple(pos[name][:2]))

# ---------------------------------------------------------------- Figurenblätter
def L(folder, name): return img(folder + '/' + name)
def sheet(skin, parts, gray=None, sword=None):
    base = img(skin); base = base.copy()
    for p in parts:
        layer = img(p)
        if p == gray:
            a = np.array(layer).astype(float); g = a[:, :, :3].mean(axis=2, keepdims=True); a[:, :, :3] = np.clip(g * .85 + 95, 0, 255); layer = Image.fromarray(a.astype(np.uint8))
        base.alpha_composite(layer)
    if sword: base.alpha_composite(img(sword))
    return base
C = 'Character skin colors/'; FC = 'Female Clothing/'; MC = 'Male Clothing/'; FH = 'Female Hair/'; MH = 'Male Hair/'
def fs(n): return C + 'Female Skin%d.png' % n
def ms(n): return C + 'Male Skin%d.png' % n
CHARS = {
    'mira': sheet(fs(2), [FC + 'Boots.png', FC + 'Skirt.png', FC + 'Purple Corset.png', FH + 'Female Hair2.png']),
    'runa': sheet(fs(5), [FC + 'Boots.png', FC + 'Skirt.png', FC + 'Orange Corset.png', FH + 'Female Hair5.png']),
    'tovin': sheet(ms(4), [MC + 'Shoes.png', MC + 'Pants.png', MC + 'orange Shirt v2.png', MH + 'Male Hair4.png']),
    'lio': sheet(fs(3), [FC + 'Skyblue Socks.png', FC + 'Boots.png', FC + 'Skirt.png', FC + 'Blue Corset.png', FH + 'Female Hair3.png']),
    'selma': sheet(fs(1), [FC + 'Green Socks.png', FC + 'Boots.png', FC + 'Skirt.png', FC + 'Green Corset v2.png', FH + 'Female Hair1.png']),
    'nim': sheet(fs(4), [FC + 'Skirt.png', FC + 'Green Corset.png', FH + 'Female Hair4.png']),
    'orin': sheet(ms(5), [MC + 'Boots.png', MC + 'Blue Pants.png', MC + 'Blue Shirt v2.png', MH + 'Male Hair5.png']),
    'elias': sheet(ms(2), [MC + 'Boots.png', MC + 'Green Pants.png', MC + 'Shirt.png', MH + 'Male Hair2.png']),
    'corvin': sheet(ms(1), [MC + 'Boots.png', MC + 'Purple Pants.png', MC + 'Purple Shirt v2.png', MH + 'Male Hair1.png']),
    'aveline': sheet(fs(3), [FC + 'Boots.png', FC + 'Skirt.png', FC + 'Corset.png', FH + 'Female Hair3.png']),
    'hedda': sheet(fs(4), [FC + 'Boots.png', FC + 'Skirt.png', FC + 'Corset.png', FH + 'Female Hair1.png'], gray=FH + 'Female Hair1.png'),
    'fenn': sheet(ms(3), [MC + 'Shoes.png', MC + 'Orange Pants.png', MC + 'Shirt v2.png', MH + 'Male Hair3.png']),
    'brann': sheet(ms(2), [MC + 'Boots.png', MC + 'Pants.png', MC + 'Green Shirt v2.png', MH + 'Male Hair5.png'], sword='Male Hand/Male Sword.png'),
    'ansgar': sheet(ms(4), [MC + 'Boots.png', MC + 'Pants.png', MC + 'Shirt.png', MH + 'Male Hair2.png'], gray=MH + 'Male Hair2.png'),
}

# ---------------------------------------------------------------- Hintergründe (Ebenen 5 Himmel, 4 Berge, 3, 2, 1) – unteres 270er-Fenster
BG = {}
for se, d, castle in [('so', 'Normal BG', 'Background Castle .png'), ('he', 'Autumn BG', 'Background Castle Autumn.png'), ('wi', 'Winter BG', 'Background Castle  Winter.png')]:
    layers = []
    for i in (5, 4, 3, 2, 1):
        im = img(d + '/GandalfHardcore Background layers_layer %d.png' % i); layers.append(b64png(im))
    cas = img(d + '/' + castle); BG[se] = {'layers': layers, 'castle': b64png(cas)}
BG['fr'] = BG['so']

# ---------------------------------------------------------------- Boden-Kacheln (Gras-Oberkante)
floor = img('Floor Tiles1.png')
TILES = {}
for se, y0 in [('so', 0), ('he', 192), ('wi', 384)]:
    TILES[se] = floor.crop((32, y0, 64, y0 + 32))
TILES['fr'] = TILES['so']

# ---------------------------------------------------------------- Icons
ic = Image.new('RGBA', (640, 384), (0, 0, 0, 0)); ICON_ORDER = []
names = sorted(n for n in Z.namelist() if '/einzeln/' in n and n.endswith('.png') and not n.startswith('__MACOSX'))
for i, n in enumerate(names):
    key = n.split('/')[-1][:-4]; ICON_ORDER.append(key); im = Image.open(io.BytesIO(Z.read(n))).convert('RGBA').resize((64, 64), Image.LANCZOS); ic.paste(im, ((i % 10) * 64, (i // 10) * 64))
# Siegel-Icons (nicht im Paket): farbige Münzen
def seal(col, sym):
    im = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.ellipse([6, 6, 58, 58], fill=col, outline=(40, 24, 16, 255), width=4); d.ellipse([16, 16, 48, 48], outline=(40, 24, 16, 255), width=3)
    d.text((26, 24), sym, fill=(40, 24, 16, 255)); return im
for key, col, sym in [('siegelFr', (255, 182, 210, 255), 'F'), ('siegelSo', (255, 216, 74, 255), 'S'), ('siegelHe', (231, 123, 38, 255), 'H'), ('siegelWi', (169, 216, 255, 255), 'W')]:
    i = len(ICON_ORDER); ICON_ORDER.append(key); ic.paste(seal(col, sym), ((i % 10) * 64, (i // 10) * 64))

# ---------------------------------------------------------------- Karte
kmap = img('Karte_Avelorn.png').resize((836, 470), Image.LANCZOS)

out = {
    'atlas': b64png(atlas), 'pos': pos, 'chars': {k: b64png(v) for k, v in CHARS.items()}, 'bg': BG,
    'tiles': {k: b64png(v) for k, v in TILES.items()}, 'icons': b64png(ic), 'iconOrder': ICON_ORDER, 'map': b64jpg(kmap, 84),
}
json.dump(out, open(outjson, 'w'))
print('Atlas', atlas.size, len(pos), 'Sprites | JSON', round(len(json.dumps(out)) / 1e6, 2), 'MB')

if gallery:
    cols = 10; cellw = 150; keys = sorted(pos); rows = (len(keys) + cols - 1) // cols
    g = Image.new('RGBA', (cols * cellw, rows * 130), (110, 130, 150, 255)); d = ImageDraw.Draw(g)
    for i, k in enumerate(keys):
        im = SPR[k]; sc = 1 if max(im.size) > 100 else 2
        if max(im.width * sc, im.height * sc) > 120: sc = 1
        im2 = im.resize((im.width * sc, im.height * sc), Image.NEAREST)
        if im2.width > cellw - 4 or im2.height > 105: im2 = im2.crop((0, 0, min(im2.width, cellw - 4), min(im2.height, 105)))
        cx, cy = (i % cols) * cellw, (i // cols) * 130; g.alpha_composite(im2, (cx + 2, cy + 2)); d.text((cx + 2, cy + 112), k, fill=(255, 255, 255, 255))
    g.save(gallery)
