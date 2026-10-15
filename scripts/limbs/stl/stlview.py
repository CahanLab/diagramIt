"""Render STL surfaces orthographically. Usage: python stlview.py <stl dir> <out.png> [axis views]
Reads every .stl in the dir (binary), projects on the three principal planes of reference.stl, draws filled polygons per structure."""
import sys, os, glob, struct
import numpy as np
from PIL import Image, ImageDraw
def read_stl(p):
    with open(p, 'rb') as f:
        head = f.read(5)
    if head == b'solid':
        import re
        txt = open(p, 'r', errors='ignore').read()
        v = np.array(re.findall(r'vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)', txt), dtype=np.float64)
        return v.reshape(-1, 3, 3)
    with open(p, 'rb') as f:
        head = f.read(80); n = struct.unpack('<I', f.read(4))[0]
        data = np.frombuffer(f.read(n * 50), dtype=np.dtype([('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')]))
    return data['v'].reshape(-1, 3, 3)
if __name__ == '__main__':
    d, out = sys.argv[1], sys.argv[2]
    ref = read_stl(os.path.join(d, 'reference.stl'))
    pts = ref.reshape(-1, 3)
    c = pts.mean(0)
    u, s, vt = np.linalg.svd(pts[::7] - c, full_matrices=False)
    R = vt  # rows: principal axes (longest first)
    files = sorted(glob.glob(os.path.join(d, '*.stl')))
    names = [os.path.basename(f) for f in files]
    tris = {os.path.basename(f): (read_stl(f) - c) @ R.T for f in files}
    allp = tris['reference.stl'].reshape(-1, 3)
    lo, hi = allp.min(0), allp.max(0)
    scale = 700 / (hi[0] - lo[0])
    def render(ax, ay, az, label):
        W = int((hi[ax] - lo[ax]) * scale) + 20; H = int((hi[ay] - lo[ay]) * scale) + 20
        im = Image.new('RGB', (W, H), 'black'); dr = ImageDraw.Draw(im)
        # painter's order by depth: draw reference faintly first, then structures
        order = ['reference.stl'] + [n for n in names if n != 'reference.stl']
        rng = np.random.default_rng(1)
        for n in order:
            t = tris[n]
            col = (60, 60, 60) if n == 'reference.stl' else tuple(int(x) for x in rng.integers(80, 255, 3))
            # sort triangles far to near
            depth = t[:, :, az].mean(1)
            idx = np.argsort(depth)
            xy = np.stack([(t[:, :, ax] - lo[ax]) * scale + 10, (t[:, :, ay] - lo[ay]) * scale + 10], -1)
            for i in idx[::1]:
                dr.polygon([tuple(p) for p in xy[i]], fill=col)
        dr.text((5, 5), label, fill='white')
        return im
    views = [render(0, 1, 2, 'XY (view along axis 3)'), render(0, 2, 1, 'XZ (view along axis 2)'), render(1, 2, 0, 'YZ (view along axis 1)')]
    W = sum(v.width for v in views) + 20; H = max(v.height for v in views)
    sheet = Image.new('RGB', (W, H), 'black'); x = 0
    for v in views:
        sheet.paste(v, (x, 0)); x += v.width + 10
    sheet.save(out); print(out, [v.size for v in views], 'structures', len(names))
