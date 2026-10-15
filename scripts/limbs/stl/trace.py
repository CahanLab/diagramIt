"""Trace a binary mask (PNG, white = object) into a simplified, smoothed SVG path.
Usage: python trace.py <mask.png> <tolerance px> [--open] -> prints JSON {path, bbox, n}
The path is scaled so that the mask's bounding box maps to viewBox units given by --scale (units per px)."""
import sys, json
import numpy as np
from PIL import Image
from skimage import measure, morphology

def catmull(pts, closed):
    n = len(pts)
    def at(i):
        return pts[(i % n + n) % n] if closed else pts[min(n - 1, max(0, i))]
    segs = n if closed else n - 1
    d = f'M{pts[0][0]:.1f} {pts[0][1]:.1f}'
    for i in range(segs):
        p0, p1, p2, p3 = at(i - 1), at(i), at(i + 1), at(i + 2)
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    return d + ('z' if closed else '')

def trace(mask, tol=1.5, scale=1.0, origin=(0, 0), smooth=2, min_area=200):
    mask = morphology.remove_small_objects(mask, min_area)
    mask = morphology.remove_small_holes(mask, min_area)
    cs = measure.find_contours(mask.astype(float), 0.5)
    cs = sorted(cs, key=lambda c: -len(c))
    out = []
    for c in cs[:3]:
        # c is (row, col); smooth by moving average then simplify
        pts = np.stack([c[:, 1], c[:, 0]], 1)
        if smooth > 0:
            k = 2 * smooth + 1
            pad = np.concatenate([pts[-smooth:], pts, pts[:smooth]])
            pts = np.stack([np.convolve(pad[:, 0], np.ones(k) / k, 'valid'), np.convolve(pad[:, 1], np.ones(k) / k, 'valid')], 1)
        simp = measure.approximate_polygon(pts, tol)
        if len(simp) > 1 and np.allclose(simp[0], simp[-1]):
            simp = simp[:-1]
        scaled = [((p[0] - origin[0]) * scale, (p[1] - origin[1]) * scale) for p in simp]
        out.append({'n': len(scaled), 'path': catmull(scaled, True), 'points': [[round(x, 1), round(y, 1)] for x, y in scaled]})
    return out

if __name__ == '__main__':
    im = np.array(Image.open(sys.argv[1]).convert('L')) > 127
    tol = float(sys.argv[2]) if len(sys.argv) > 2 else 1.5
    scale = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    ys, xs = np.nonzero(im)
    origin = (xs.min(), ys.min())
    res = trace(im, tol, scale, origin)
    print(json.dumps({'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], 'contours': res}))
