"""Render STL anatomy parts in one principal view, grouped. Usage: python stlparts.py <dir> <outPrefix> <ax> <ay> <az> <flipY 0|1>
Writes <out>_bones.png, <out>_muscles.png, <out>_all.png plus per-part masks in <out>_masks/ for tracing."""
import sys, os, glob
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from stlview import read_stl
d, out = sys.argv[1], sys.argv[2]
ax, ay, az, flipy = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])
ref = read_stl(os.path.join(d, 'reference.stl'))
pts = ref.reshape(-1, 3); c = pts.mean(0)
u, s, vt = np.linalg.svd(pts[::7] - c, full_matrices=False); R = vt
files = sorted(glob.glob(os.path.join(d, '*.stl')))
tris = {os.path.basename(f)[:-4]: (read_stl(f) - c) @ R.T for f in files}
allp = tris['reference'].reshape(-1, 3); lo, hi = allp.min(0), allp.max(0)
scale = 1000 / (hi[ax] - lo[ax])
W = int((hi[ax] - lo[ax]) * scale) + 20; H = int((hi[ay] - lo[ay]) * scale) + 20
def xy(t):
    X = (t[:, :, ax] - lo[ax]) * scale + 10
    Y = (t[:, :, ay] - lo[ay]) * scale + 10
    if flipy: Y = H - Y
    return np.stack([X, Y], -1)
BONE = ('femur', 'tibia', 'fibula', 'metatarsal', 'phalanx', 'talus', 'cuneiform', 'navicular', 'tibiale', 'calcaneus', 'cuboid', 'humerus', 'radius', 'ulna', 'metacarpal', 'carpal', 'scapula', 'pisiform', 'triquetrum', 'lunate', 'scaphoid', 'trapez', 'capitate', 'hamate', 'clavicle', 'pelvi', 'ilium', 'ischium', 'pubis', 'bone')
def group(n):
    ln = n.lower()
    if n == 'reference': return 'ref'
    return 'bone' if any(b in ln for b in BONE) else 'muscle'
os.makedirs(out + '_masks', exist_ok=True)
def draw_group(names, colours, fname):
    im = Image.new('RGB', (W, H), 'black'); dr = ImageDraw.Draw(im)
    refxy = xy(tris['reference'])
    for p in refxy: dr.polygon([tuple(q) for q in p], fill=(70, 70, 70))
    for n, col in zip(names, colours):
        t = tris[n]; depth = t[:, :, az].mean(1); order = np.argsort(depth)
        P = xy(t)
        for i in order: dr.polygon([tuple(q) for q in P[i]], fill=col)
    im.save(fname)
names = [n for n in tris if n != 'reference']
bones = [n for n in names if group(n) == 'bone']; muscles = [n for n in names if group(n) == 'muscle']
rng = np.random.default_rng(3)
draw_group(bones, [(90 + int(rng.integers(0, 120)), 140 + int(rng.integers(0, 100)), 255) for _ in bones], out + '_bones.png')
draw_group(muscles, [(200 + int(rng.integers(0, 55)), 60 + int(rng.integers(0, 120)), 60 + int(rng.integers(0, 60))) for _ in muscles], out + '_muscles.png')
# per-part masks (white on black) and reference mask
for n in ['reference'] + names:
    im = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(im)
    for p in xy(tris[n]): dr.polygon([tuple(q) for q in p], fill=255)
    im.save(f'{out}_masks/{n}.png')
print('bones', bones); print('muscles', len(muscles), muscles[:6]); print('size', W, H)
