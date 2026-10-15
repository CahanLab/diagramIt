"""Per-bone shapes from the E14.5 STL models: split meshes into connected components, project each on its own
principal plane, orient proximal->distal, normalise to length 1. Writes <limb>_bones.json and a check sheet.
Usage: python stl_bones.py <hl|fl>"""
import sys, os, glob, json
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from stlview import read_stl
from trace import trace
limb = sys.argv[1]
ROOT = 'WORKDIR'
SD = f'{ROOT}/Surfaces' if limb == 'hl' else f'{ROOT}/fl_surfaces/Surfaces'
if limb == 'hl':
    FILES = {'femur': 'EMAPA19143_femur', 'tibia': 'EMAPA19142_tibia', 'fibula': 'EMAPA19141_fibula', 'metatarsal': 'EMAPA36159_metatarsal_bone', 'phalanx': 'EMAPA32941_hindlimb_phalanx',
             'talus': 'EMAPA19135_talus', 'calcaneus': 'EMAPA19134_calcaneus', 'navicular': 'EMAPA36180_navicular', 'cuboid': 'EMAPA36175_cuboid', 'medial_cuneiform': 'EMAPA36176_medial_cuneiform', 'intermediate_cuneiform': 'EMAPA36177_intermediate_cuneiform', 'lateral_cuneiform': 'EMAPA36178_lateral_cuneiform', 'tibiale': 'EMAPA36179_tibiale', 'girdle': 'EMAPA35931_pelvis'}
else:
    FILES = {'humerus': 'EMAPA19106_humerus', 'radius': 'EMAPA19103_radius', 'ulna': 'EMAPA19104_ulna', 'metacarpal': 'EMAPA36158_metacarpal_bone', 'phalanx': 'EMAPA35933_forelimb_bone',
             'scapholunate': 'EMAPA36166_scapholunate', 'triquetrum': 'EMAPA36167_triquetrum', 'capitate': 'EMAPA36169_capitate', 'hamate': 'EMAPA36172_hamate', 'trapezium': 'EMAPA36173_trapezium', 'trapezoid': 'EMAPA36174_trapezoid', 'centrale': 'EMAPA36170_centrale', 'falciform': 'EMAPA36171_falciform', 'girdle': 'EMAPA18722_scapula'}
def load(name):
    f = glob.glob(f'{SD}/*{name.split("_", 1)[1] if name.startswith("EMAPA") else name}.stl')
    f = [x for x in f if os.path.basename(x)[:-4] == name] or f
    return read_stl(f[0]) if f else None
def components(tris):
    """connected components by shared (rounded) vertices"""
    v = np.round(tris.reshape(-1, 3), 3)
    keys, inv = np.unique(v, axis=0, return_inverse=True)
    inv = inv.reshape(-1, 3)
    parent = np.arange(len(keys))
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]; a = parent[a]
        return a
    for a, b, c in inv:
        ra, rb, rc = find(a), find(b), find(c)
        parent[rb] = ra; parent[find(rc)] = find(ra)
    roots = np.array([find(i) for i in range(len(keys))])
    tri_root = roots[inv[:, 0]]
    comps = []
    for r in np.unique(tri_root):
        comps.append(tris[tri_root == r])
    comps.sort(key=lambda t: -len(t))
    return comps
girdle = load(FILES['girdle']).reshape(-1, 3).mean(0)
ref = load('reference').reshape(-1, 3)
def shape_of(tris, prox_hint):
    """project the component on its principal plane; orient so the end nearest prox_hint is at x=0 and distal at x=1"""
    v = tris.reshape(-1, 3); c = v.mean(0)
    u, s, vt = np.linalg.svd(v[::3] - c, full_matrices=False)
    a1, a2 = vt[0], vt[1]
    t = (v - c) @ a1
    end_lo, end_hi = c + a1 * t.min(), c + a1 * t.max()
    if np.linalg.norm(end_lo - prox_hint) > np.linalg.norm(end_hi - prox_hint):
        a1 = -a1
    # keep a right-handed frame: a2 sign so that the triple (a1, a2, a3) matches the model's handedness
    a3 = np.cross(a1, a2)
    x = (v - c) @ a1; y = (v - c) @ a2
    L = x.max() - x.min()
    x = (x - x.min()) / L; y = y / L
    # rasterise the projected triangles to a mask, trace to a polygon
    px = 400; W = px + 20; H = int(px * (y.max() - y.min())) + 20
    im = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(im)
    X = (x * px + 10).reshape(-1, 3); Y = ((y - y.min()) * px + 10).reshape(-1, 3)
    for i in range(len(X)):
        dr.polygon([(X[i, 0], Y[i, 0]), (X[i, 1], Y[i, 1]), (X[i, 2], Y[i, 2])], fill=255)
    m = np.array(im) > 127
    r = trace(m, 1.5, 1.0, (0, 0), smooth=3, min_area=200)
    if not r: return None
    pts = [[round((p[0] - 10) / px, 3), round((p[1] - 10) / px + float(y.min()), 3)] for p in r[0]['points']]
    return {'points': pts, 'length': float(L), 'centroid': [float(q) for q in c], 'prox': [float(q) for q in (c + a1 * ((v - c) @ a1).min())], 'dist': [float(q) for q in (c + a1 * ((v - c) @ a1).max())]}
out = {}
meta_dist = []
for key in ['femur' if limb == 'hl' else 'humerus', 'tibia' if limb == 'hl' else 'radius', 'fibula' if limb == 'hl' else 'ulna']:
    t = load(FILES[key]); comps = components(t)
    out[key] = [shape_of(comps[0], girdle)]
    print(key, 'components', len(comps), 'tris', len(comps[0]), 'length', round(out[key][0]['length'], 1))
# small bones
small = [k for k in FILES if k not in ('femur', 'tibia', 'fibula', 'humerus', 'radius', 'ulna', 'metatarsal', 'metacarpal', 'phalanx', 'girdle')]
for key in small:
    t = load(FILES[key])
    if t is None: print('missing', key); continue
    comps = components(t)
    out[key] = [shape_of(comps[0], girdle)]
# metapodials: components ordered anterior->posterior along the second principal axis of the whole set
meta_key = 'metatarsal' if limb == 'hl' else 'metacarpal'
t = load(FILES[meta_key]); comps = components(t)
comps = [c for c in comps if len(c) > 200][:5]
print(meta_key, 'components', [len(c) for c in comps])
zeugo_dist = np.array(out['tibia' if limb == 'hl' else 'radius'][0]['dist'])
shapes = [shape_of(c, zeugo_dist) for c in comps]
# order by position along the axis perpendicular to the limb within the autopod plane: use the ref principal axes
cents = np.array([s['centroid'] for s in shapes]); cc = cents.mean(0)
u, s_, vt = np.linalg.svd(ref[::20] - ref.mean(0), full_matrices=False)
order = np.argsort(cents @ vt[1])
out[meta_key] = [shapes[i] for i in order]
meta_dist = [np.array(shapes[i]['dist']) for i in order]
# phalanges: assign each component to the nearest metapodial distal end, order along that digit
t = load(FILES['phalanx']); comps = [c for c in components(t) if len(c) > 80]
print('phalanx components', len(comps))
digits = {i: [] for i in range(5)}
for c in comps:
    cen = c.reshape(-1, 3).mean(0)
    d = [np.linalg.norm(cen - md) for md in meta_dist]
    i = int(np.argmin(d)); digits[i].append((d[i], c))
out['phalanx'] = {}
for i in range(5):
    lst = sorted(digits[i], key=lambda x: x[0])
    prox_hint = meta_dist[i]
    seq = []
    for dist, c in lst[:3]:
        sh = shape_of(c, prox_hint); seq.append(sh); prox_hint = np.array(sh['dist'])
    out['phalanx'][str(i + 1)] = seq
    print('digit', i + 1, 'phalanges', len(seq), [round(s['length'], 1) for s in seq])
json.dump(out, open(f'{ROOT}/{limb}/{limb}_bones.json', 'w'))
# check sheet: each shape drawn normalised (length 300 px)
items = []
for k, v in out.items():
    if k == 'phalanx':
        for d, seq in v.items():
            for j, s in enumerate(seq): items.append((f'{k} d{d} p{j+1}', s))
    else:
        for j, s in enumerate(v): items.append((f'{k} {j+1}' if len(v) > 1 else k, s))
cw, ch = 330, 120
sheet = Image.new('RGB', (cw * 4, ch * ((len(items) + 3) // 4)), 'white'); dr = ImageDraw.Draw(sheet)
for i, (n, s) in enumerate(items):
    x0, y0 = (i % 4) * cw + 10, (i // 4) * ch + 60
    pts = [(x0 + p[0] * 300, y0 + p[1] * 300) for p in s['points']]
    dr.polygon(pts, fill=(150, 190, 240), outline=(20, 40, 90)); dr.text((x0, y0 - 50), f'{n} L={s["length"]:.0f}', fill='black')
sheet.save(f'{ROOT}/{limb}/{limb}_bones_sheet.png'); print('sheet', sheet.size)
