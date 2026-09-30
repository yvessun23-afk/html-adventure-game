#!/usr/bin/env python3
"""Erzeugt die technischen Zeichnungen (SVG) fuer die isolierte Zendure-Winterbox.

Alle Masse in mm. Die Annahmen fuer das Batterie-Paket stehen unten und sollten
VOR dem Zuschnitt mit dem echten Geraet nachgemessen werden.
"""
import math
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- Masse ----
T = 30                      # Dicke XPS-Platte
STACK_W, STACK_D = 360, 260  # Grundflaeche Hyper 2000 / AB2000X (Annahme!)
AB_H, HY_H = 200, 200        # Hoehe je AB2000X / Hyper (Annahme!)
GAP = 50                     # Luft seitlich / hinten / vorne
W_IN = STACK_W + 2 * GAP     # 460
D_IN = STACK_D + 2 * GAP     # 360
W_OUT, D_OUT = W_IN + 2 * T, D_IN + 2 * T   # 520 x 420
STACK_H = 3 * AB_H + HY_H    # 800
BASE_T = T
H_WALL = 930                 # Wandhoehe (Boden 30 + Stapel 800 + 100 Luft)
PLUG_T = T
FAN = 120
FAN_LOW, FAN_HIGH = 110, 790  # Mittelhoehe Zuluft / Abluft (ueber Boden = 0)
SX0, SX1 = GAP + T, GAP + T + STACK_W        # Stapel x: 80..440
SY0, SY1 = GAP + T, GAP + T + STACK_D        # Stapel y: 80..340
Z0 = BASE_T                                   # Stapel-Unterkante 30

C_XPS = "#cfe8f7"
C_LINE = "#1d2b36"

DEFS = f"""
<defs>
  <pattern id="xps" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="8" height="8" fill="{C_XPS}"/><line x1="0" y1="0" x2="0" y2="8" stroke="#4f97cc" stroke-width="1.3"/>
  </pattern>
  <pattern id="foam" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="6" height="6" fill="#e6f2fa"/><circle cx="2" cy="2" r="0.7" fill="#9cc3de"/><circle cx="5" cy="5" r="0.7" fill="#9cc3de"/>
  </pattern>
  <pattern id="ground" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
    <line x1="0" y1="0" x2="0" y2="8" stroke="#777" stroke-width="1"/>
  </pattern>
  <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="#0a7bd1"/></marker>
  <marker id="arrw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="#d1400a"/></marker>
  <marker id="dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0,1 L10,5 L0,9 z" fill="{C_LINE}"/></marker>
</defs>
<style>
  text{{font-family:Arial,Helvetica,sans-serif;fill:#111}}
  .t{{font-size:13px}} .s{{font-size:11px}} .h{{font-size:20px;font-weight:bold}}
  .b{{font-weight:bold}}
</style>
"""


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">'
            f'<title>{title}</title>{DEFS}<rect width="100%" height="100%" fill="#ffffff"/>{body}</svg>')


def txt(x, y, s, cls="t", anchor="start", fill=None, rot=None):
    f = f' fill="{fill}"' if fill else ""
    r = f' transform="rotate({rot} {x:.1f} {y:.1f})"' if rot else ""
    return f'<text x="{x:.1f}" y="{y:.1f}" class="{cls}" text-anchor="{anchor}"{f}{r}>{s}</text>'


def poly(pts, fill, stroke=C_LINE, sw=1, extra=""):
    p = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'


def line(x1, y1, x2, y2, stroke=C_LINE, sw=1, dash=None, marker=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    m = ""
    if marker:
        m = f' marker-end="url(#{marker})"'
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}"{d}{m}/>'


def path(pts, stroke, sw=2, dash=None, marker=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    m = f' marker-end="url(#{marker})"' if marker else ""
    p = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return f'<polyline points="{p}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"{d}{m}/>'


def rect(x, y, w, h, fill, stroke=C_LINE, sw=1, extra=""):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'


def badge(x, y, n):
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="10" fill="#fff" stroke="#c0392b" stroke-width="1.5"/>'
            f'<text x="{x:.1f}" y="{y + 4:.1f}" class="s b" text-anchor="middle" fill="#c0392b">{n}</text>')


def title_block(w, h, title, sub, sheet):
    x0, y0 = 10, h - 62
    return (rect(x0, y0, w - 20, 52, "none", C_LINE, 1.5) +
            line(w - 210, y0, w - 210, y0 + 52) +
            txt(x0 + 10, y0 + 22, title, "h") + txt(x0 + 10, y0 + 42, sub, "s") +
            txt(w - 200, y0 + 20, "Zendure Winterbox", "t b") +
            txt(w - 200, y0 + 36, f"Blatt {sheet} - Masse in mm", "s") +
            txt(w - 200, y0 + 48, "XPS 30 mm | Massstab siehe Zeichnung", "s"))


# ------------------------------------------------- Bemassung (2D-Ansichten) --
def dim_h(x1, x2, y, label, off=0):
    return (line(x1, y, x2, y, C_LINE, 1) +
            f'<line x1="{x1:.1f}" y1="{y:.1f}" x2="{x2:.1f}" y2="{y:.1f}" stroke="{C_LINE}" stroke-width="1" marker-start="url(#dim)" marker-end="url(#dim)"/>' +
            txt((x1 + x2) / 2, y - 4 + off, label, "s", "middle"))


def dim_v(x, y1, y2, label):
    return (f'<line x1="{x:.1f}" y1="{y1:.1f}" x2="{x:.1f}" y2="{y2:.1f}" stroke="{C_LINE}" stroke-width="1" marker-start="url(#dim)" marker-end="url(#dim)"/>' +
            txt(x - 4, (y1 + y2) / 2, label, "s", "middle", rot=-90))


# =========================================================== 1) EXPLOSION ===
class Iso:
    def __init__(self, S, ox, oy):
        self.S, self.ox, self.oy = S, ox, oy
        self.c = math.cos(math.radians(30))

    def p(self, x, y, z):
        return (self.ox + (x - y) * self.c * self.S, self.oy + (x + y) * 0.5 * self.S - z * self.S)

    def cuboid(self, x0, x1, y0, y1, z0, z1, top, right, left, stroke=C_LINE):
        p = self.p
        out = poly([p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)], top, stroke)
        out += poly([p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)], right, stroke)   # +x Flaeche
        out += poly([p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)], left, stroke)    # +y Flaeche
        return out

    def panel(self, O, U, V, N, t, outline, holes=(), face="url(#foam)"):
        """Platte: sichtbare Flaeche bei O, Dicke t entgegen N. outline/holes in (u,v)."""
        def P3(u, v, back=False):
            k = -t if back else 0
            return (O[0] + U[0] * u + V[0] * v + N[0] * k,
                    O[1] + U[1] * u + V[1] * v + N[1] * k,
                    O[2] + U[2] * u + V[2] * v + N[2] * k)
        front = [self.p(*P3(u, v)) for u, v in outline]
        back = [self.p(*P3(u, v, True)) for u, v in outline]
        out = poly(back, "#8fb8d3")
        n = len(outline)
        for i in range(n):
            j = (i + 1) % n
            out += poly([front[i], front[j], back[j], back[i]], "url(#xps)", C_LINE, 0.8)
        out += poly(front, face, C_LINE, 1.2)
        for h in holes:
            out += poly([self.p(*P3(u, v)) for u, v in h], "#2b3a46", C_LINE, 1)
        return out, P3

    def face_poly(self, P3, pts, fill, stroke=C_LINE, sw=1):
        return poly([self.p(*P3(u, v)) for u, v in pts], fill, stroke, sw)


def circle_pts(cu, cv, r, n=28):
    return [(cu + r * math.cos(2 * math.pi * i / n), cv + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def draw_fan(iso, P3, cu, cv, size=FAN):
    h = size / 2
    o = iso.face_poly(P3, [(cu - h, cv - h), (cu + h, cv - h), (cu + h, cv + h), (cu - h, cv + h)], "#3a4652", "#111", 1)
    o += iso.face_poly(P3, circle_pts(cu, cv, h - 6), "#222d38", "#8b98a5", 1)
    for k in range(7):
        a = 2 * math.pi * k / 7
        blade = [(cu + 14 * math.cos(a), cv + 14 * math.sin(a)),
                 (cu + (h - 10) * math.cos(a + 0.55), cv + (h - 10) * math.sin(a + 0.55)),
                 (cu + (h - 10) * math.cos(a + 0.05), cv + (h - 10) * math.sin(a + 0.05))]
        o += iso.face_poly(P3, blade, "#5f7a91", "#9db3c5", 0.6)
    o += iso.face_poly(P3, circle_pts(cu, cv, 13), "#111", "#111", 1)
    return o


def explosion():
    S = 0.36
    iso = Iso(S, 0, 0)
    body = ""
    tags = []   # (3D-Punkt, Nummer, Text-Offset)

    def rectl(w, h):
        return [(0, 0), (w, 0), (w, h), (0, h)]

    ex = 300   # radiale Explosion
    dzw = 130  # Waende angehoben
    # --- hintere Wand (Rueckwand, Kabelschlitze + Sensortasche) ---
    ox, oy, oz = 0, 30 - ex, dzw
    outline_back = [(0, 0), (60, 0), (60, 70), (140, 70), (140, 0), (380, 0), (380, 70), (460, 70), (460, 0),
                    (W_OUT, 0), (W_OUT, H_WALL), (310, H_WALL), (310, H_WALL - 60), (210, H_WALL - 60),
                    (210, H_WALL), (0, H_WALL)]
    pocket = [(240, 750), (280, 750), (280, 790), (240, 790)]
    b, P3b = iso.panel((ox, oy, oz), (1, 0, 0), (0, 0, 1), (0, 1, 0), T, outline_back, [pocket])
    b += iso.face_poly(P3b, [(242, 752), (278, 752), (278, 788), (242, 788)], "#f4f4f4", "#333", 1)
    body += b
    # --- linke Wand (Zuluft-Luefter unten, Innenseite sichtbar) ---
    lx, ly = 30 - ex, 30
    l, P3l = iso.panel((lx + T, ly, dzw), (0, 1, 0), (0, 0, 1), (1, 0, 0), T, rectl(D_IN, H_WALL),
                       [[(180 - 60, FAN_LOW - 60), (180 + 60, FAN_LOW - 60), (180 + 60, FAN_LOW + 60), (180 - 60, FAN_LOW + 60)]])
    l += draw_fan(iso, P3l, 180, FAN_LOW)
    body += l
    # --- Boden ---
    bo, _ = iso.panel((T, T, -120 + BASE_T), (1, 0, 0), (0, 1, 0), (0, 0, 1), BASE_T, rectl(W_IN, D_IN))
    body += bo
    # --- Stapel ---
    dz = 60
    cols = [("#c9ced3", "#aab1b8", "#98a0a8")] * 3
    for i in range(3):
        z0 = Z0 + i * AB_H + dz
        body += iso.cuboid(SX0, SX1, SY0, SY1, z0, z0 + AB_H - 2, "#dfe3e7", "#b9c0c7", "#a4acb4")
    zh = Z0 + 3 * AB_H + dz
    body += iso.cuboid(SX0, SX1, SY0, SY1, zh, zh + HY_H, "#f6d9b8", "#e7b984", "#d9a468")
    # Hyper Beschriftung / Anschluesse (Andeutung)
    # --- Vorderwand (aussen) ---
    fx, fy = 0, D_OUT + ex - 30
    f, _ = iso.panel((fx, fy + T, dzw), (1, 0, 0), (0, 0, 1), (0, 1, 0), T, rectl(W_OUT, H_WALL))
    body += f'<g opacity="0.55">{f}</g>'
    # --- rechte Wand (Abluft-Luefter oben, Aussenseite) ---
    rx, ry = W_OUT + ex - T, 30
    r, P3r = iso.panel((rx + T, ry, dzw), (0, 1, 0), (0, 0, 1), (1, 0, 0), T, rectl(D_IN, H_WALL),
                       [[(180 - 60, FAN_HIGH - 60), (180 + 60, FAN_HIGH - 60), (180 + 60, FAN_HIGH + 60), (180 - 60, FAN_HIGH + 60)]])
    r += draw_fan(iso, P3r, 180, FAN_HIGH)
    # Aussengitter 150x150 (Lueftungsgitter) andeuten
    r += iso.face_poly(P3r, [(180 - 75, FAN_HIGH - 75), (180 + 75, FAN_HIGH - 75), (180 + 75, FAN_HIGH + 75), (180 - 75, FAN_HIGH + 75)],
                       "none", "#b03a2e", 1.6)
    for k in range(-60, 61, 15):
        r += iso.face_poly(P3r, [(180 - 68, FAN_HIGH + k), (180 + 68, FAN_HIGH + k)], "none", "#b03a2e", 0.8)
    body += f'<g opacity="0.55">{r}</g>'
    # --- Stopfen (Innendeckel) ---
    pz = 420
    plug_out = [(0, 0), (179, 0), (179, 25), (279, 25), (279, 0), (W_IN - 2, 0), (W_IN - 2, D_IN - 2), (0, D_IN - 2)]
    pl, _ = iso.panel((T + 1, T + 1, H_WALL - PLUG_T + pz + PLUG_T), (1, 0, 0), (0, 1, 0), (0, 0, 1), PLUG_T,
                      [(u, v) for u, v in plug_out])
    body += pl
    # --- Deckel ---
    ld, _ = iso.panel((0, 0, H_WALL + T + 640), (1, 0, 0), (0, 1, 0), (0, 0, 1), T, rectl(W_OUT, D_OUT))
    body += ld

    # Luftpfeile (schematisch) an den Luefter
    a0 = iso.p(-ex - 200 + 30, 30 + 180, FAN_LOW + dzw)
    a1 = iso.p(-ex + 20, 30 + 180, FAN_LOW + dzw)
    body += line(*a0, *a1, "#0a7bd1", 3, marker="arr")
    b0 = iso.p(W_OUT + ex + 20, 30 + 180, FAN_HIGH + dzw)
    b1 = iso.p(W_OUT + ex + 250, 30 + 180, FAN_HIGH + dzw)
    body += line(*b0, *b1, "#d1400a", 3, marker="arrw")

    # Explosionsachsen (gestrichelt)
    def ax(p3a, p3b):
        return line(*iso.p(*p3a), *iso.p(*p3b), "#888", 1, "5 4")
    body += ax((SX0 + 180, SY0 + 130, -60), (SX0 + 180, SY0 + 130, H_WALL + T + 700))

    return body, iso


def build_explosion():
    import re
    body, iso = explosion()
    xs, ys = [], []
    for m in re.finditer(r'points="([^"]+)"', body):
        for pr in m.group(1).split():
            a, b_ = pr.split(",")
            xs.append(float(a)); ys.append(float(b_))
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    W = int(maxx - minx + 2 * 380)
    H = int(maxy - miny + 150 + 200)
    shift = f'<g transform="translate({380 - minx:.0f},{150 - miny:.0f})">{body}'

    def L(p3, num, dx, dy, text, anchor="start"):
        x, y = iso.p(*p3)
        s = line(x, y, x + dx, y + dy, "#c0392b", 1)
        s += badge(x + dx, y + dy, num)
        s += txt(x + dx + (16 if anchor == "start" else -16), y + dy + 4, text, "s", anchor)
        return s
    ex, dzw = 300, 130
    lab = ""
    lab += L((W_OUT - 40, 30 - ex, 850 + dzw), 1, 110, -120, "Rückwand: Kabelschlitze")
    lab += L((260, 30 - ex, 770 + dzw), 2, -230, 30, "Tasche 40x40x12 f. Aqara-Sensor", "end")
    lab += L((30 - ex + T, 30 + 180, 110 + dzw), 3, -170, 120, "Zuluft-Lüfter 120 mm (unten)", "end")
    lab += L((W_OUT + ex, 30 + 180, 790 + dzw), 4, 190, -90, "Abluft-Lüfter 120 mm (oben)")
    lab += L((30 + 200, 30 + 150, -120 + BASE_T), 5, -260, 90, "Bodenplatte XPS 30", "end")
    lab += L((SX0 + 200, SY1, 60 + Z0 + 3 * AB_H + 100), 6, 300, -200, "Hyper 2000 (oben auf dem Stapel)")
    lab += L((SX1, SY0 + 130, 60 + Z0 + 250), 7, 260, 80, "3x AB2000X (gestapelt)")
    lab += L((W_OUT / 2, D_OUT + ex, 300 + dzw), 8, 120, 210, "Vorderwand XPS 30 (transparent dargestellt)")
    lab += L((260, 210, H_WALL + 420 + T), 9, -250, -20, "Deckel-Stopfen 458x358 (sitzt im Wandring)", "end")
    lab += L((W_OUT, 210, H_WALL + T + 640 + T), 10, 200, -60, "Deckelplatte 520x420 (Überstand rundum)")
    lab += L((SX0 + 180, SY0 + 130, H_WALL + 100), 11, -330, -150, "Montage: Wandring von oben über den Stapel stülpen", "end")
    shift += lab + "</g>"
    hdr = txt(20, 32, "1  EXPLOSIONSZEICHNUNG - Zendure Hyper 2000 + 3x AB2000X in isolierter Winterbox", "h")
    hdr += txt(20, 54, "Alle Bauteile aus XPS-Dämmplatte 30 mm (schraffiert = Dämmstoff an der Schnittkante, gepunktet = Plattenfläche). Vorder- und rechte Wand halbtransparent, damit Lüfter/Kabelschlitze sichtbar bleiben.", "s")
    leg_y = 84
    legend = [
        ("Blau", "Zuluft (kalte Frischluft) - Lüfter unten in der linken Wand, 50 mm Luftspalt rundum"),
        ("Rot", "Abluft - Lüfter oben in der rechten Wand, Luft strömt oben über den Hyper und seitlich hinaus"),
        ("Grau", "Batteriestapel (Maße = Annahme, vor Zuschnitt nachmessen!) - 50 mm Abstand zur Dämmung seitlich/vorn/hinten, 70 mm oben"),
    ]
    lg = ""
    for i, (a, b_) in enumerate(legend):
        col = {"Blau": "#0a7bd1", "Rot": "#d1400a", "Grau": "#9aa2aa"}[a]
        lg += rect(20, leg_y + i * 20 - 10, 14, 10, col, col) + txt(42, leg_y + i * 20, b_, "s")
    return svg(W, H, hdr + lg + shift + title_block(W, H, "01 Explosionszeichnung", "Isometrisch, ohne Maßstab (Explosion radial 300 mm)", "1/5"),
               "Explosionszeichnung Zendure Winterbox")


# ================================================================ 2) AA ====
def build_section_AA():
    S = 0.78
    W, H = 1320, 1000
    ox, gz = 300, 830   # x-Ursprung, Bodenlinie

    def X(x): return ox + x * S
    def Z(z): return gz - z * S

    o = txt(20, 32, "2  SCHNITT A-A (senkrecht, durch beide Lüfter) - Isolierung und Luftführung", "h")
    o += txt(20, 52, "Blick von vorn auf Schnittebene y = 210 mm. Schraffur = XPS-Dämmung 30 mm.", "s")
    # Boden
    o += rect(X(-140), Z(0), (W_OUT + 280) * S, 18, "url(#ground)", "#777", 1)
    o += line(X(-140), Z(0), X(W_OUT + 140), Z(0), C_LINE, 1.6)
    # Waende
    def xps(x0, z0, x1, z1):
        return rect(X(x0), Z(z1), (x1 - x0) * S, (z1 - z0) * S, "url(#xps)", C_LINE, 1.2)
    fh = FAN / 2
    # links: Oeffnung 50..170
    o += xps(0, 0, T, FAN_LOW - fh) + xps(0, FAN_LOW + fh, T, H_WALL)
    # rechts: Oeffnung 730..850
    o += xps(W_OUT - T, 0, W_OUT, FAN_HIGH - fh) + xps(W_OUT - T, FAN_HIGH + fh, W_OUT, H_WALL)
    o += xps(T, 0, W_OUT - T, BASE_T)                       # Boden
    o += xps(T + 1, H_WALL - PLUG_T, W_OUT - T - 1, H_WALL)  # Stopfen
    o += xps(0, H_WALL, W_OUT, H_WALL + T)                  # Deckel
    # Stapel
    for i in range(3):
        z0 = Z0 + i * AB_H
        o += rect(X(SX0), Z(z0 + AB_H), STACK_W * S, (AB_H - 2) * S, "#d4d9de", "#555", 1)
        o += txt(X((SX0 + SX1) / 2), Z(z0 + AB_H / 2) + 4, f"AB2000X #{3 - i}", "t", "middle")
    zh = Z0 + 3 * AB_H
    o += rect(X(SX0), Z(zh + HY_H), STACK_W * S, HY_H * S, "#f6d9b8", "#7a5a34", 1)
    o += txt(X((SX0 + SX1) / 2), Z(zh + HY_H / 2) + 4, "Hyper 2000", "t b", "middle")
    # Luefter (Schnitt): Gehaeuse 25 tief, buendig aussen; Gitter aussen
    def fan(x0, zc):
        s = rect(X(x0), Z(zc + fh), 25 * S, FAN * S, "#3a4652", "#111", 1)
        s += line(X(x0 + 12), Z(zc + fh - 8), X(x0 + 12), Z(zc - fh + 8), "#9db3c5", 1.5, "4 3")
        return s
    o += fan(0, FAN_LOW)
    o += fan(W_OUT - 25, FAN_HIGH)
    # Lueftungsgitter aussen
    o += rect(X(-7), Z(FAN_LOW + 75), 7 * S, 150 * S, "#b03a2e", "#7b241c", 1)
    o += rect(X(W_OUT), Z(FAN_HIGH + 75), 7 * S, 150 * S, "#b03a2e", "#7b241c", 1)
    # Luftweg
    zt = H_WALL - PLUG_T - 30
    o += path([(X(-90), Z(FAN_LOW)), (X(GAP / 2 + T), Z(FAN_LOW)), (X(GAP / 2 + T), Z(zt)),
               (X(W_OUT - T - GAP / 2), Z(zt)), (X(W_OUT - T - GAP / 2), Z(FAN_HIGH)), (X(W_OUT + 90), Z(FAN_HIGH))],
              "#0a7bd1", 3, "9 6", "arr")
    o += txt(X(-100), Z(FAN_LOW) - 12, "Zuluft", "t b", "end", "#0a7bd1")
    o += txt(X(W_OUT + 92), Z(FAN_HIGH) - 12, "Abluft", "t b", "start", "#d1400a")
    # Masse
    yb = Z(0) + 60
    o += dim_h(X(0), X(W_OUT), yb, f"{W_OUT} außen")
    o += dim_h(X(T), X(W_OUT - T), yb + 26, f"{W_IN} innen")
    o += dim_h(X(T), X(SX0), Z(300), "50")
    o += dim_h(X(SX1), X(W_OUT - T), Z(300), "50")
    o += dim_v(X(W_OUT) + 150, Z(0), Z(H_WALL + T), f"{H_WALL + T}")
    o += dim_v(X(-60), Z(0), Z(H_WALL), f"{H_WALL}")
    o += dim_v(X(SX1) + 20, Z(STACK_H + Z0), Z(H_WALL - PLUG_T), "70")
    o += dim_v(X(W_OUT) + 110, Z(Z0 + STACK_H), Z(Z0), f"{STACK_H}")
    o += dim_v(X(-95), Z(0), Z(FAN_LOW), f"{FAN_LOW}")
    o += dim_v(X(W_OUT) + 60, Z(FAN_HIGH), Z(H_WALL), f"{H_WALL - FAN_HIGH}")
    o += txt(X(T + 5), Z(BASE_T / 2) + 4, "Boden 30", "s")
    # Badges + Legende
    o += badge(X(-15), Z(FAN_LOW + 100), 3) + badge(X(W_OUT + 18), Z(FAN_HIGH + 100), 4)
    o += badge(X(W_OUT / 2), Z(H_WALL - 12), 9) + badge(X(W_OUT / 2), Z(H_WALL + 15), 10)
    o += badge(X(15), Z(500), "W") + badge(X(W_OUT / 2), Z(15), 5)
    lx, ly = 900, 130
    items = [
        ("W", "Wand XPS 30 mm (Dämmung, geschnitten)"),
        ("3", "Zuluft-Lüfter 120x120x25, Öffnung 121x121, Gitter 150x150 außen"),
        ("4", "Abluft-Lüfter 120x120x25, Öffnung 121x121, Gitter 150x150 außen"),
        ("5", "Bodenplatte XPS 30 - Stapel steht darauf (Druck ca. 8 kPa, unkritisch)"),
        ("9", "Deckel-Stopfen 30 mm: sitzt 1 mm Spiel im Wandring, schließt Luftspalt oben"),
        ("10", "Deckelplatte 30 mm, 30 mm Überstand rundum (gegen Regen/Spritzwasser)"),
    ]
    o += txt(lx, ly - 30, "Legende", "t b")
    for i, (n, t) in enumerate(items):
        o += badge(lx + 10, ly + i * 30, n) + txt(lx + 28, ly + i * 30 + 4, t, "s")
    notes = [
        "Luftführung (Querstrom):",
        "- Zuluft tritt unten links ein, steigt im 50-mm-Spalt auf,",
        "  streicht über den Hyper (70 mm freier Raum oben)",
        "  und verlässt die Box rechts oben. Warme Luft steigt -> Kamineffekt hilft.",
        "- Lüfter-Ebenen bewusst diagonal gegenüber: kein Kurzschlussstrom.",
        "- Luftspalt 50 mm ist das Minimum, mehr (z. B. 70) ist besser.",
        "- Hyper-Höhe liegt auf Abluft-Niveau: Abwärme wird direkt abgeführt.",
    ]
    for i, t in enumerate(notes):
        o += txt(lx, 400 + i * 20, t, "s" if i else "t b")
    return svg(W, H, o + title_block(W, H, "02 Schnitt A-A", "Vertikalschnitt durch Zuluft- und Abluftlüfter, M ca. 1:1.3", "2/5"),
               "Schnitt A-A Zendure Winterbox")


# ================================================================ 3) BB ====
def build_section_BB():
    S = 0.9
    W, H = 1250, 1200
    o = txt(20, 32, "3  SCHNITTE B-B und C-C (waagerecht) - Wandaufbau, Luftspalte, Sensortasche", "h")
    o += txt(20, 52, "Draufsicht auf Schnittebene. Schraffur = XPS-Dämmung 30 mm. Hinten (y=0) = Rückwand mit Kabelschlitzen.", "s")

    def plan(oxp, oyp, zlabel, upper):
        def X(x): return oxp + x * S
        def Y(y): return oyp + y * S
        s = ""
        def xps(x0, y0, x1, y1):
            return rect(X(x0), Y(y0), (x1 - x0) * S, (y1 - y0) * S, "url(#xps)", C_LINE, 1.2)
        fh = FAN / 2
        cy = T + D_IN / 2
        s += xps(0, 0, W_OUT, T)                     # hinten
        s += xps(0, D_OUT - T, W_OUT, D_OUT)          # vorn
        # links
        if not upper:
            s += xps(0, T, T, cy - fh) + xps(0, cy + fh, T, D_OUT - T)
            s += rect(X(0), Y(cy - fh), 25 * S, FAN * S, "#3a4652", "#111", 1)
            s += rect(X(-7), Y(cy - 75), 7 * S, 150 * S, "#b03a2e", "#7b241c", 1)
        else:
            s += xps(0, T, T, D_OUT - T)
        # rechts
        if upper:
            s += xps(W_OUT - T, T, W_OUT, cy - fh) + xps(W_OUT - T, cy + fh, W_OUT, D_OUT - T)
            s += rect(X(W_OUT - 25), Y(cy - fh), 25 * S, FAN * S, "#3a4652", "#111", 1)
            s += rect(X(W_OUT), Y(cy - 75), 7 * S, 150 * S, "#b03a2e", "#7b241c", 1)
        else:
            s += xps(W_OUT - T, T, W_OUT, D_OUT - T)
        # Stapel
        s += rect(X(SX0), Y(SY0), STACK_W * S, STACK_D * S, "#f6d9b8" if upper else "#d4d9de", "#555", 1.3)
        s += txt(X((SX0 + SX1) / 2), Y(SY0) + 24, "Hyper 2000" if upper else "AB2000X", "t b", "middle")
        if upper:  # Sensortasche in Rueckwand-Innenflaeche
            s += rect(X(240), Y(T - 12), 40 * S, 12 * S, "#ffffff", "#333", 1)
            s += rect(X(242), Y(T - 9), 36 * S, 9 * S, "#f39c12", "#7a4a00", 1)
            s += badge(X(260), Y(-14), 2)
            s += txt(X(260) + 18, Y(-10), "Aqara-Sensor in Tasche 40x40x12", "s")
        # Luftpfeile
        if upper:
            s += line(X(GAP / 2 + T), Y(cy), X(W_OUT + 90), Y(cy), "#d1400a", 3, "9 6", "arrw")
            s += path([(X(T + GAP / 2), Y(D_OUT - T - 15)), (X(T + GAP / 2), Y(T + 15))], "#0a7bd1", 2.5, "6 5", "arr")
            s += path([(X(W_OUT - T - GAP / 2), Y(T + 15)), (X(W_OUT - T - GAP / 2), Y(cy - 10))], "#0a7bd1", 2.5, "6 5", "arr")
        else:
            s += line(X(-90), Y(cy), X(T + GAP / 2), Y(cy), "#0a7bd1", 3, "9 6", "arr")
            s += path([(X(T + GAP / 2), Y(cy)), (X(T + GAP / 2), Y(T + 12))], "#0a7bd1", 2.5, "6 5", "arr")
            s += path([(X(T + GAP / 2), Y(cy)), (X(T + GAP / 2), Y(D_OUT - T - 12))], "#0a7bd1", 2.5, "6 5", "arr")
        # Masse
        s += dim_h(X(0), X(W_OUT), Y(D_OUT) + 28, f"{W_OUT}")
        s += dim_h(X(T), X(SX0), Y(D_OUT) + 50, "50")
        s += dim_h(X(SX0), X(SX1), Y(D_OUT) + 50, f"{STACK_W}")
        s += dim_h(X(SX1), X(W_OUT - T), Y(D_OUT) + 50, "50")
        s += dim_v(X(-40), Y(0), Y(D_OUT), f"{D_OUT}")
        s += dim_v(X(W_OUT) + 40, Y(T), Y(SY0), "50")
        s += dim_v(X(W_OUT) + 40, Y(SY0), Y(SY1), f"{STACK_D}")
        s += dim_v(X(W_OUT) + 40, Y(SY1), Y(D_OUT - T), "50")
        s += txt(X(W_OUT / 2), Y(-40), zlabel, "t b", "middle")
        s += txt(X(10), Y(T / 2) + 4, "Rückwand 30", "s")
        s += txt(X(10), Y(D_OUT - T / 2) + 4, "Vorderwand 30", "s")
        return s

    o += plan(180, 130, "SCHNITT B-B auf Höhe z = 780 mm (Hyper, Abluft-Lüfter, Sensor)", True)
    o += plan(180, 700, "SCHNITT C-C auf Höhe z = 110 mm (unterste AB2000X, Zuluft-Lüfter)", False)
    lx = 780
    notes = [
        ("t b", "Aufbau der Wand"),
        ("s", "- XPS 30 mm, glatte Außenhaut, geschlossenzellig (nimmt kein Wasser auf)"),
        ("s", "- Ecken stumpf gestoßen: mit XPS-tauglichem Kleber verkleben"),
        ("s", "  und außen mit Alu-Klebeband (Kantenschutz + Dampfbremse) überkleben"),
        ("s", "- Innen bleibt ein durchgehender Luftspalt von 50 mm rundum"),
        ("t b", "Sensortasche (2)"),
        ("s", "- Aqara Rechteck-Sensor 36x36x9 mm liegt in 40x40x12 mm Tasche"),
        ("s", "  in der Rückwand-Innenfläche, ca. 30 mm unter Hyper-Oberkante"),
        ("s", "- Nicht im direkten Luftstrom -> misst Boxluft statt Lüfterzug"),
        ("s", "- Zigbee funkt durch XPS problemlos; CR2032 bleibt im Warmen"),
        ("t b", "Lüfter"),
        ("s", "- 120x120x25 mm, Öffnung 121x121 mm, Presspassung + Alu-Band"),
        ("s", "- Zuluft links unten (C-C), Abluft rechts oben (B-B)"),
    ]
    for i, (c, t) in enumerate(notes):
        o += txt(lx, 170 + i * 22, t, c)
    return svg(W, H, o + title_block(W, H, "03 Schnitte B-B / C-C", "Horizontalschnitte, M ca. 1:1", "3/5"),
               "Schnitte B-B C-C Zendure Winterbox")


# ============================================================ 4) DETAILS ===
def build_details():
    W, H = 1300, 1150
    o = txt(20, 32, "4  DETAILS - Lüfter-Einbau, Kabelschlitze, Ecke, Deckel", "h")

    # --- D: Luefter-Einbau (Schnitt) ---
    S = 1.6
    ox, oy = 110, 275
    o += txt(30, 75, "D  Lüfter-Einbau (Schnitt, ca. 1.6:1)", "t b")
    def X(x): return ox + x * S
    def Z(z): return oy - z * S
    o += rect(X(0), Z(90), T * S, (90 - 61) * S, "url(#xps)", C_LINE, 1.2)
    o += rect(X(0), Z(-61), T * S, (90 - 61) * S, "url(#xps)", C_LINE, 1.2)
    o += rect(X(0), Z(60), 25 * S, 120 * S, "#3a4652", "#111", 1.2)
    o += rect(X(-7), Z(75), 7 * S, 150 * S, "#b03a2e", "#7b241c", 1)
    o += rect(X(25), Z(61), 5 * S, 122 * S, "#c8c8c8", "#555", 1)
    o += line(X(-40), Z(0), X(-8), Z(0), "#0a7bd1", 3, marker="arr")
    o += txt(X(-45), Z(0) - 8, "Außen", "s", "end")
    o += txt(X(40), Z(-75), "Innen (Luftspalt)", "s")
    lx0 = 260
    for (px, pz, ty, t_) in [
        (X(15), Z(85), 105, "XPS 30 mm (schraffiert)"),
        (X(-3), Z(70), 135, "Lüftungsgitter 150x150, außen mit XPS-tauglichem Kleber"),
        (X(12), Z(20), 175, "Lüfter 120x120x25 - Presspassung in Öffnung 121x121"),
        (X(27), Z(-30), 215, "Alu-Klebeband innen rundum (Fixierung + Dichtung)"),
    ]:
        o += line(px, pz, lx0 - 6, ty, "#c0392b", 1) + txt(lx0, ty + 4, t_, "s")
    o += txt(30, 430, "Lüfterkabel (2 Adern) durch Ø 6 mm Bohrung in der XPS-Wand nach außen zum 12-V-Netzteil.", "s")
    o += txt(30, 446, "Netzteil + Schalt-Steckdose bleiben AUSSEN und trocken.", "s")

    # --- E: Rueckwand mit Kabelschlitzen ---
    S2 = 0.55
    ox2, oy2 = 760, 690
    def X2(x): return ox2 + x * S2
    def Z2(z): return oy2 - z * S2
    o += txt(690, 75, "E  Rückwand von außen (Kabelschlitze, ca. 1:2)", "t b")
    pts = [(0, 0), (60, 0), (60, 70), (140, 70), (140, 0), (380, 0), (380, 70), (460, 70), (460, 0), (W_OUT, 0), (W_OUT, H_WALL),
           (310, H_WALL), (310, H_WALL - 60), (210, H_WALL - 60), (210, H_WALL), (0, H_WALL)]
    o += poly([(X2(W_OUT - x), Z2(z)) for x, z in pts], "url(#foam)", C_LINE, 1.4)
    o += rect(X2(W_OUT - 280), Z2(790), 40 * S2, 40 * S2, "none", "#c0392b", 1.2, 'stroke-dasharray="4 3"')
    o += txt(X2(W_OUT - 285), Z2(770) + 4, "Sensortasche (innen)", "s", "end", "#c0392b")
    for x0, x1, lab in [(60, 140, "80x70"), (380, 460, "80x70")]:
        o += txt(X2(W_OUT - (x0 + x1) / 2), Z2(70) - 8, lab, "s", "middle")
        o += f'<circle cx="{X2(W_OUT - (x0 + x1) / 2):.1f}" cy="{Z2(22):.1f}" r="7" fill="#222"/>'
    o += txt(X2(W_OUT - 260), Z2(H_WALL - 60) + 16, "100x60", "s", "middle")
    o += f'<circle cx="{X2(W_OUT - 260):.1f}" cy="{Z2(H_WALL - 20):.1f}" r="7" fill="#222"/>'
    o += dim_h(X2(0), X2(W_OUT), Z2(0) + 26, f"{W_OUT}")
    o += dim_v(X2(0) - 20, Z2(0), Z2(H_WALL), f"{H_WALL}")
    for i, t_ in enumerate([
        "Kabelschlitze sind offene Nuten am Rand: Wand wird über die bereits",
        "angeschlossenen Kabel gestülpt - nichts abmontieren.",
        "Position/Breite nach dem tatsächlichen Kabelverlauf anpassen.",
        "Restspalt mit Schaumstoffstreifen / Bürstendichtung schließen",
        "(Nut ca. 10 mm breiter als Kabelbündel, Streifen eindrücken).",
        "Schwarze Punkte = Kabel (AC, MC4/PV, Sonstiges).",
    ]):
        o += txt(690, 750 + i * 16, t_, "s")

    # --- F: Ecke ---
    o += txt(30, 490, "F  Wandecke (Draufsicht, ca. 1.5:1)", "t b")
    S3 = 1.5
    ox3, oy3 = 70, 530
    def X3(x): return ox3 + x * S3
    def Y3(y): return oy3 + y * S3
    o += rect(X3(0), Y3(0), 150 * S3, T * S3, "url(#xps)", C_LINE, 1.2)
    o += rect(X3(0), Y3(T), T * S3, 90 * S3, "url(#xps)", C_LINE, 1.2)
    o += rect(X3(-3), Y3(-3), 153 * S3, 3 * S3, "#c8c8c8", "#555", 1)
    o += rect(X3(-3), Y3(-3), 3 * S3, 123 * S3, "#c8c8c8", "#555", 1)
    tx = X3(170)
    for i, t_ in enumerate([
        "Stumpfstoß: Seitenwand zwischen Vorder-/Rückwand,",
        "XPS-tauglicher Kleber (lösemittelfrei), außen Alu-Klebeband",
        "über die Kante (verhindert Aufspreizen, dichtet ab).",
        "Innen bleibt alles glatt - Luftspalt 50 mm durchgehend.",
    ]):
        o += txt(tx, Y3(20) + i * 16, t_, "s")

    # --- G: Deckel ---
    o += txt(30, 740, "G  Deckel-System (Schnitt, ca. 1.6:1)", "t b")
    S4 = 1.6
    ox4, oy4 = 80, 1020
    def X4(x): return ox4 + x * S4
    def Z4(z): return oy4 - z * S4
    o += rect(X4(0), Z4(90), 30 * S4, 90 * S4, "url(#xps)", C_LINE, 1.2)
    o += rect(X4(31), Z4(90), 100 * S4, 30 * S4, "url(#xps)", C_LINE, 1.2)
    o += rect(X4(0), Z4(120), 131 * S4, 30 * S4, "url(#xps)", C_LINE, 1.2)
    o += rect(X4(-1), Z4(92), 32 * S4, 2 * S4, "#444", "#222", 1)
    o += rect(X4(-7), Z4(126), 3, 126 * S4, "#8e44ad", "#5b2c6f", 1)
    o += rect(X4(-7), Z4(126), 138 * S4, 3, "#8e44ad", "#5b2c6f", 1)
    o += txt(X4(65), Z4(75) + 4, "Stopfen 30 mm", "s", "middle")
    o += txt(X4(65), Z4(105) + 4, "Deckelplatte 30 mm", "s", "middle")
    o += txt(X4(4), Z4(30), "Wand", "s", rot=-90)
    for i, (t_, col) in enumerate([
        ("Stopfen: 1 mm Spiel im Wandring, schließt den", None),
        ("Luftspalt oben, Deckel kann nicht verrutschen.", None),
        ("Dichtband (selbstklebend, ca. 3 mm, schwarz)", None),
        ("umlaufend auf der Wandoberkante.", None),
        ("Deckelplatte: 30 mm Überstand rundum (Regen).", None),
        ("Klettband/Spanngurt 25 mm (violett): 2 Schlaufen", "#8e44ad"),
        ("um Box und Boden.", "#8e44ad"),
        ("-> Deckel abnehmen: Klettband öffnen, Deckel", None),
        ("hochheben. Fertig.", None),
    ]):
        o += txt(X4(160), Z4(140) + i * 17, t_, "s", fill=col)
    return svg(W, H, o + title_block(W, H, "04 Details", "Lüfter-Einbau, Kabelschlitze, Ecke, Deckel", "4/5"),
               "Details Zendure Winterbox")


# ============================================================ 5) ZUSCHNITT ==
def build_cutplan():
    S = 0.55
    W, H = 1250, 2080
    o = txt(20, 32, "5  ZUSCHNITTPLAN - 5 Platten XPS 1250 x 600 x 30 mm", "h")
    o += txt(20, 52, "Alle Teile mit Cuttermesser + Lineal (mehrfach anritzen, brechen) oder Fuchsschwanz/Stichsäge zuschneiden.", "s")

    def plate(idx, y0):
        o = rect(20, y0, 1250 * S, 600 * S, "#f4f8fb", "#1d2b36", 1.5)
        o += txt(30, y0 + 14, f"Platte {idx}", "s b")
        return o

    def piece(px, py, a, b, label, feats=(), fill="url(#foam)"):
        s = rect(px, py, a * S, b * S, fill, C_LINE, 1.2)
        for f in feats:
            kind = f[0]
            if kind == "hole":
                _, fa, fb, fw, fh, lab = f
                s += rect(px + fa * S, py + fb * S, fw * S, fh * S, "#2b3a46", "#000", 1)
                if lab:
                    s += txt(px + (fa + fw / 2) * S, py + (fb + fh / 2) * S + 4, lab, "s", "middle", "#fff")
            elif kind == "notch":
                _, fa, fb, fw, fh, lab = f
                s += rect(px + fa * S, py + fb * S, fw * S, fh * S, "#ffe9e6", "#c0392b", 1.2, 'stroke-dasharray="4 3"')
                if lab:
                    s += txt(px + (fa + fw / 2) * S, py + (fb + fh / 2) * S + 3, lab, "s", "middle", "#c0392b")
        s += txt(px + a * S / 2, py + b * S / 2 - 6, label, "t b", "middle")
        s += txt(px + a * S / 2, py + b * S / 2 + 12, f"{a} x {b}", "s", "middle")
        return s

    x0 = 20
    y = 80
    # Platte 1: Rueckwand (a = Hoehe 930 entlang der Platte, b = Breite 520)
    o += plate(1, y)
    o += piece(x0, y, 930, 520, "Rückwand", [
        ("notch", 0, 60, 70, 80, "80x70"), ("notch", 0, 380, 70, 80, "80x70"),
        ("notch", 870, 210, 60, 100, "100x60"), ("hole", 750, 240, 40, 40, "S")])
    o += txt(x0 + 940 * S, y + 60 * S, "Rest 320x600", "s")
    y += 600 * S + 50
    o += plate(2, y)
    o += piece(x0, y, 930, 520, "Vorderwand", [])
    y += 600 * S + 50
    o += plate(3, y)
    o += piece(x0, y, 930, 360, "Linke Wand", [("hole", 50, 120, 121, 121, "121x121")])
    o += txt(x0 + 5, y + 400 * S, "Rest 930x240: Reserve", "s")
    y += 600 * S + 50
    o += plate(4, y)
    o += piece(x0, y, 930, 360, "Rechte Wand", [("hole", 730, 120, 121, 121, "121x121")])
    y += 600 * S + 50
    o += plate(5, y)
    o += piece(x0, y, 520, 420, "Deckelplatte", [])
    o += piece(x0 + 530 * S, y, 458, 358, "Deckel-Stopfen", [("notch", 179, 0, 100, 25, "100x25")])
    o += piece(x0, y + 425 * S, 458, 175, "Boden Hälfte 1", [])
    o += piece(x0 + 465 * S, y + 425 * S, 458, 175, "Boden Hälfte 2", [])
    o += txt(x0 + 995 * S, y + 100 * S, "Die zwei Boden-Hälften nebeneinander", "s")
    o += txt(x0 + 995 * S, y + 118 * S, "legen und mit Alu-Klebeband verbinden.", "s")

    # Legende rechts
    lx, ly = 740, 110
    lines = [
        ("t b", "Hinweise"),
        ("s", "Maße = Wandhöhe 930 | Wandbreiten 520 (vorn/hinten), 360 (Seiten)."),
        ("s", "Plattenlänge 1250: Wandhöhe liegt entlang der Länge."),
        ("s", "Rot gestrichelt = Ausschnitt (Nut am Plattenrand)."),
        ("s", "Dunkel = Loch / Tasche: Lüfter 121x121 (durchgehend),"),
        ("s", "S = Sensortasche 40x40 nur 12 mm tief (nicht durchschneiden!)."),
        ("s", "Lüfteröffnungen: Mitte 180 mm von der Vorderkante der Seitenwand."),
        ("s", "Zuluft-Mitte 110 mm über Boden, Abluft-Mitte 790 mm."),
        ("s", "Lüfter-Kabeldurchführung: Ø 6 mm neben der Öffnung bohren."),
        ("s", "Stopfen 2 mm kleiner als Innenmaß (1 mm Spiel je Seite)."),
        ("s", "Bodenplatte darf ~8 mm kürzer sein (Plattenbreite reicht knapp)."),
        ("s", "Erst nachmessen, dann schneiden: Maße von Hyper/AB2000X"),
        ("s", "in build_drawings.py oben anpassen -> neu generieren."),
    ]
    for i, (c, t) in enumerate(lines):
        o += txt(lx, ly + i * 22, t, c)
    return svg(W, H + 2200 * 0 + 0, o + title_block(W, H, "05 Zuschnittplan", "5 Platten XPS 1250x600x30 - M 0.55:1", "5/5"),
               "Zuschnittplan Zendure Winterbox")


if __name__ == "__main__":
    files = {
        "01_explosionszeichnung.svg": build_explosion(),
        "02_schnitt_AA_senkrecht.svg": build_section_AA(),
        "03_schnitt_BB_CC_waagerecht.svg": build_section_BB(),
        "04_details.svg": build_details(),
        "05_zuschnittplan.svg": build_cutplan(),
    }
    for name, content in files.items():
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
            fh.write(content)
        print("geschrieben:", name)
