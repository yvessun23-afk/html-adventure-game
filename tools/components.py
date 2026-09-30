#!/usr/bin/env python3
"""Hilfswerkzeug: findet zusammenhängende Sprites in einem Sheet und nummeriert sie (für die Auswahl beim Bau der Atlanten)."""
import sys, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

def components(path, dil=2, minpix=6):
    im = Image.open(path).convert('RGBA'); a = np.array(im)[:, :, 3] > 0
    lab, n = ndimage.label(ndimage.binary_dilation(a, iterations=dil), structure=np.ones((3, 3)))
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        ys, xs = sl; m = a[sl] & (lab[sl] == i)
        if m.sum() < minpix: continue
        yy, xx = np.where(m); boxes.append((xs.start + xx.min(), ys.start + yy.min(), xx.max() - xx.min() + 1, yy.max() - yy.min() + 1))
    boxes.sort(key=lambda b: (b[1] // 24, b[0]))
    return im, boxes

if __name__ == '__main__':
    path, out = sys.argv[1], sys.argv[2]; scale = int(sys.argv[3]) if len(sys.argv) > 3 else 2
    dil = int(sys.argv[4]) if len(sys.argv) > 4 else 2
    im, boxes = components(path, dil)
    bg = Image.new('RGBA', im.size, (110, 130, 150, 255)); bg.alpha_composite(im); bg = bg.resize((im.width * scale, im.height * scale), Image.NEAREST)
    d = ImageDraw.Draw(bg)
    for i, (x, y, w, h) in enumerate(boxes):
        d.rectangle([x * scale, y * scale, (x + w) * scale, (y + h) * scale], outline=(255, 255, 0, 255)); d.text((x * scale + 2, y * scale + 1), str(i), fill=(255, 255, 255, 255))
        print(i, (x, y, w, h))
    bg.save(out)
