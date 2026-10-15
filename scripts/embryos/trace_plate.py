"""Trace an eMouseAtlas Theiler-stage plate (line drawing): outer silhouette by flood fill from the border,
interior feature lines as skeleton polylines. Part of the embryo icon pipeline, see README.md.
Usage: python trace_plate.py <plate.png> <out.json> [gap-closing radius px]"""
import sys, json
import numpy as np
from PIL import Image
from skimage import measure, morphology, segmentation
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from trace import trace
im = np.array(Image.open(sys.argv[1]).convert('L'))
# upscale 3x for smoother contours
from PIL import Image as I
big = np.array(I.fromarray(im).resize((im.shape[1] * 3, im.shape[0] * 3), I.LANCZOS))
ink = big < 150
# remove the frame/scale bar: drop ink components touching the image border or very long straight runs
lab = measure.label(ink, connectivity=2)
h, w = ink.shape
border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
for b in border:
    if b: ink[lab == b] = False
# close small gaps in the outline so the flood fill does not leak
rad = int(sys.argv[3]) if len(sys.argv) > 3 else 2
closed = morphology.binary_closing(ink, morphology.disk(rad))
outside = segmentation.flood(closed, (0, 0))
inside = ~outside
inside = morphology.binary_opening(inside, morphology.disk(rad))
inside = morphology.remove_small_objects(inside, 5000)
lab2 = measure.label(inside); sizes = np.bincount(lab2.ravel()); sizes[0] = 0
inside = lab2 == sizes.argmax()
sil = trace(inside, 2.0, 1.0, (0, 0), smooth=4, min_area=1000)[0]
# interior lines: ink inside the silhouette (eroded so the outline itself is excluded)
inner = morphology.binary_erosion(inside, morphology.disk(6))
lines_mask = ink & inner
sk = morphology.skeletonize(lines_mask)
pts = set(zip(*np.nonzero(sk)))
nbrs = lambda p: [(p[0] + dy, p[1] + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx) and (p[0] + dy, p[1] + dx) in pts]
seen = set(); lines = []
ends = [p for p in pts if len(nbrs(p)) == 1] + [p for p in pts if len(nbrs(p)) != 1]
for start in ends:
    if start in seen: continue
    line = [start]; seen.add(start); cur = start
    while True:
        nx = [q for q in nbrs(cur) if q not in seen]
        if not nx: break
        cur = nx[0]; seen.add(cur); line.append(cur)
    if len(line) >= 15:
        arr = np.array([(x, y) for y, x in line], float)
        simp = measure.approximate_polygon(arr, 1.5)
        lines.append([[round(float(x), 1), round(float(y), 1)] for x, y in simp])
ys, xs = np.nonzero(inside)
json.dump({'size': [w, h], 'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], 'silhouette': sil['points'], 'creases': lines}, open(sys.argv[2], 'w'))
print(sys.argv[2], 'silhouette', sil['n'], 'lines', len(lines))
