"""Author the mouse limb stage silhouettes and export shapes.ts.

Silhouettes are built from width stations along a bent centreline (stylopod, zeugopod,
plate) plus a fan of tapered digits, authored against the references listed in
docs/superpowers/specs/2026-10-14-drawing-styles-design.md ("Reference-built limbs").
Bone shapes come from the eMouseAtlas E14.5 limb models (DeLaurier et al. 2008;
data/*_bones.json, data/*_groups.json), muscle groups likewise, mapped segment-wise into
each stage and clipped to the silhouette.

Usage (from the repo root, needs numpy, scipy, scikit-image, Pillow):
  python scripts/limbs/author.py            # writes src/library/items/limbs/shapes.ts
  python scripts/limbs/author.py --preview out.png   # also draws a check sheet
"""
import json, math, os, sys
import numpy as np
from scipy.interpolate import PchipInterpolator
from skimage import measure, morphology
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'src', 'library', 'items', 'limbs', 'shapes.ts')
STAGES = ['E10.5', 'E11.5', 'E12.5', 'E13.5', 'E14.5', 'E15.5', 'E16.5', 'E17.5', 'E18.5']
PLATE_WEB = 0.75

# ------------------------------------------------------------------ stage tables
# Each stage: chain angles (deg, screen clockwise positive) and lengths; half-width stations
# (t, anterior, posterior) per segment; digits (angle deg from the palm axis, length, base and
# tip half-widths); spacing between digit bases, arc (quadratic proximal drop of the outer
# bases), web (fraction of the digit length that is webbed; >= PLATE_WEB draws a scalloped plate).
# Buds (E10.5, E11.5): a single segment with stations and a rounded apex (axial length `len`).
def digits(angles, lens, w, tip):
    return [dict(angle=a, len=l, w=w, tip=tip) for a, l in zip(angles, lens)]

FORELIMB = {
    'E10.5': dict(bud=True, len=13, angle=2, stations=[(0, 20, 20), (0.45, 19.5, 19.5), (0.85, 15, 15)]),
    'E11.5': dict(bud=True, len=27, angle=4, stations=[(0, 15, 16.5), (0.35, 16.5, 18.5), (0.75, 15, 17)]),
    'E12.5': dict(angles=(8, -2, -4), lengths=(18, 15, 16), stylopod=[(0, 15.0, 16.0), (0.3, 15.5, 16.8), (0.65, 12.1, 12.9), (1, 11, 11.5)], zeugopod=[(0, 12, 12.5), (0.5, 11.5, 12), (1, 11, 11.5)],
                  plate=[(0, 11, 11.5), (0.4, 14, 14)], digits=digits([-34, -17, 0, 17, 34], [4, 6.5, 7, 6.5, 4.5], 5, 5), spacing=8, arc=1.0, web=0.9),
    'E13.5': dict(angles=(12, -3, -6), lengths=(23, 20, 16), stylopod=[(0, 14.0, 15.0), (0.3, 14.4, 15.8), (0.65, 10.9, 12.2), (1, 9.5, 10.5)], zeugopod=[(0, 9.5, 10.5), (0.05, 9.5, 11.5), (0.5, 8.5, 9), (1, 7.5, 8)],
                  plate=[(0, 7.5, 8), (0.4, 11, 10.5)], digits=digits([-32, -16, 0, 16, 32], [12, 17, 19, 17, 13], 4.6, 3.4), spacing=7.5, arc=1.1, web=0.5),
    'E14.5': dict(angles=(14, -3, -6), lengths=(27, 24, 16), stylopod=[(0, 13.5, 14.5), (0.3, 13.9, 15.2), (0.65, 10.2, 10.9), (1, 8.5, 9)], zeugopod=[(0, 8.5, 9), (0.05, 8.5, 10.5), (0.5, 7.5, 8), (1, 6, 6.5)],
                  plate=[(0, 6, 6.5), (0.4, 9.5, 9.5)], digits=digits([-30, -15, 0, 15, 30], [13, 21, 23, 21, 16], 4, 2.6), spacing=7, arc=1.0, web=0.15),
    'E15.5': dict(angles=(14, -3, -6), lengths=(30, 27, 17), stylopod=[(0, 14.0, 15.0), (0.3, 14.4, 15.8), (0.65, 10.4, 11.2), (1, 8.5, 9)], zeugopod=[(0, 8.5, 9), (0.05, 8.5, 10.5), (0.5, 7.5, 8), (1, 6, 6.5)],
                  plate=[(0, 6, 6.5), (0.4, 9.5, 9.5)], digits=digits([-26, -13, 0, 13, 26], [13, 22, 24, 22, 17], 3.3, 2.2), spacing=7.6, arc=1.0, web=0.06),
    'E16.5': dict(angles=(14, -3, -6), lengths=(31, 28, 18), stylopod=[(0, 15.0, 16.0), (0.3, 15.5, 16.8), (0.65, 10.9, 11.7), (1, 9, 9.5)], zeugopod=[(0, 9, 9.5), (0.05, 9, 11), (0.5, 8, 8.5), (1, 6.3, 6.8)],
                  plate=[(0, 6.3, 6.8), (0.4, 9.5, 9.5)], digits=digits([-22, -11, 0, 11, 22], [13, 23, 25, 23, 17], 3.3, 2.2), spacing=7.6, arc=0.9, web=0.05),
    'E17.5': dict(angles=(14, -3, -6), lengths=(32, 29, 19), stylopod=[(0, 16.0, 17.0), (0.3, 16.5, 17.9), (0.65, 11.4, 12.2), (1, 9.5, 10)], zeugopod=[(0, 9.5, 10), (0.05, 9.5, 11.5), (0.5, 8.5, 9), (1, 6.6, 7)],
                  plate=[(0, 6.6, 7), (0.4, 10, 10)], digits=digits([-22, -11, 0, 11, 22], [13, 23, 25, 23, 17], 3.4, 2.3), spacing=7.8, arc=0.9, web=0.05),
    'E18.5': dict(angles=(14, -3, -6), lengths=(33, 30, 20), stylopod=[(0, 17.0, 18.5), (0.3, 17.5, 19.4), (0.65, 12.2, 13.0), (1, 10, 10.5)], zeugopod=[(0, 10, 10.5), (0.05, 10, 12), (0.5, 9, 9.5), (1, 7, 7.5)],
                  plate=[(0, 7, 7.5), (0.4, 10.5, 10.5)], digits=digits([-22, -11, 0, 11, 22], [13, 23, 25, 23, 17], 3.5, 2.3), spacing=8, arc=0.9, web=0.05),
}
HINDLIMB = {
    'E10.5': dict(bud=True, len=10, angle=2, stations=[(0, 18, 18), (0.45, 17.5, 17.5), (0.85, 13, 13)]),
    'E11.5': dict(bud=True, len=19, angle=3, stations=[(0, 13.5, 14), (0.4, 14.5, 15.5), (0.8, 12.5, 13.5)]),
    'E12.5': dict(angles=(6, 2, 0), lengths=(15, 13, 16), stylopod=[(0, 15.0, 16.0), (0.3, 15.5, 16.8), (0.65, 12.8, 13.6), (1, 12, 12.5)], zeugopod=[(0, 12, 12.5), (0.5, 11.5, 12), (1, 11, 11.5)],
                  plate=[(0, 11, 11.5), (0.4, 15, 15)], digits=digits([-32, -16, 0, 16, 32], [3.5, 5, 5, 5, 3.5], 5, 5), spacing=8.5, arc=1.0, web=0.97),
    'E13.5': dict(angles=(12, -3, -5), lengths=(22, 19, 17), stylopod=[(0, 14.5, 15.5), (0.3, 14.9, 16.3), (0.65, 11.7, 12.4), (1, 10, 10.5)], zeugopod=[(0, 10, 10.5), (0.05, 10, 12), (0.5, 9, 9.5), (1, 8, 8.5)],
                  plate=[(0, 8, 8.5), (0.4, 12, 11.5)], digits=digits([-30, -15, 0, 15, 30], [9, 13, 15, 13, 11], 5, 4.2), spacing=7.5, arc=1.3, web=0.76),
    'E14.5': dict(angles=(12, -3, -5), lengths=(28, 26, 17), stylopod=[(0, 15.0, 16.0), (0.3, 15.5, 16.8), (0.65, 10.9, 11.7), (1, 9, 9.5)], zeugopod=[(0, 9, 9.5), (0.05, 9, 11), (0.5, 7.5, 8), (1, 6, 6.5)],
                  plate=[(0, 6, 6.5), (0.4, 10, 9.5)], digits=digits([-30, -14, 0, 14, 30], [12, 19, 21, 19, 15], 4.2, 2.8), spacing=7.2, arc=1.0, web=0.3),
    'E15.5': dict(angles=(12, -3, -5), lengths=(31, 28, 18), stylopod=[(0, 15.5, 16.5), (0.3, 16.0, 17.3), (0.65, 11.2, 12.0), (1, 9, 9.5)], zeugopod=[(0, 9, 9.5), (0.05, 9, 11), (0.5, 7.5, 8), (1, 6, 6.5)],
                  plate=[(0, 6, 6.5), (0.4, 10, 9.5)], digits=digits([-26, -13, 0, 13, 26], [12, 20, 22, 20, 16], 3.4, 2.3), spacing=7.8, arc=1.0, web=0.1),
    'E16.5': dict(angles=(12, -3, -5), lengths=(32, 29, 19), stylopod=[(0, 16.5, 17.5), (0.3, 17.0, 18.4), (0.65, 11.7, 12.5), (1, 9.5, 10)], zeugopod=[(0, 9.5, 10), (0.05, 9.5, 11.5), (0.5, 8, 8.5), (1, 6.3, 6.8)],
                  plate=[(0, 6.3, 6.8), (0.4, 10, 9.5)], digits=digits([-23, -11, 0, 11, 23], [12, 21, 23, 21, 16], 3.4, 2.3), spacing=7.8, arc=0.9, web=0.06),
    'E17.5': dict(angles=(12, -3, -5), lengths=(33, 30, 20), stylopod=[(0, 17.5, 18.5), (0.3, 18.0, 19.4), (0.65, 12.2, 13.0), (1, 10, 10.5)], zeugopod=[(0, 10, 10.5), (0.05, 10, 12), (0.5, 8.5, 9), (1, 6.6, 7)],
                  plate=[(0, 6.6, 7), (0.4, 10.5, 10)], digits=digits([-23, -11, 0, 11, 23], [12, 21, 23, 21, 16], 3.5, 2.3), spacing=8, arc=0.9, web=0.06),
    'E18.5': dict(angles=(12, -3, -5), lengths=(34, 31, 21), stylopod=[(0, 18.5, 19.5), (0.3, 19.1, 20.5), (0.65, 13.0, 13.8), (1, 10.5, 11)], zeugopod=[(0, 10.5, 11), (0.05, 10.5, 12.5), (0.5, 9, 9.5), (1, 7, 7.5)],
                  plate=[(0, 7, 7.5), (0.4, 11, 10.5)], digits=digits([-23, -11, 0, 11, 23], [12, 21, 23, 21, 16], 3.6, 2.4), spacing=8.2, arc=0.9, web=0.06),
}
LENGTH_MM = {'forelimb': {'E10.5': 0.9, 'E11.5': 1.4, 'E12.5': 2.1, 'E13.5': 2.8, 'E14.5': 3.5, 'E15.5': 4.1, 'E16.5': 4.7, 'E17.5': 5.3, 'E18.5': 6},
             'hindlimb': {'E10.5': 0.6, 'E11.5': 1.1, 'E12.5': 1.8, 'E13.5': 2.5, 'E14.5': 3.2, 'E15.5': 3.9, 'E16.5': 4.6, 'E17.5': 5.3, 'E18.5': 6}}

# ------------------------------------------------------------------ geometry helpers
def unit(v):
    v = np.asarray(v, float); return v / (np.linalg.norm(v) or 1)
def normal(d):  # anterior (upwards on screen) side of a direction
    return np.array([d[1], -d[0]])
def rot(d, deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    return np.array([d[0] * c - d[1] * s, d[0] * s + d[1] * c])
def catmull(pts, closed, tension=1.0, samples=6):
    pts = [np.asarray(p, float) for p in pts]; n = len(pts); out = []
    at = lambda i: pts[(i % n + n) % n] if closed else pts[min(n - 1, max(0, i))]
    segs = n if closed else n - 1
    for i in range(segs):
        p0, p1, p2, p3 = at(i - 1), at(i), at(i + 1), at(i + 2)
        c1 = p1 + (p2 - p0) / 6 * tension; c2 = p2 - (p3 - p1) / 6 * tension
        for k in range(samples):
            t = k / samples
            out.append((1 - t) ** 3 * p1 + 3 * (1 - t) ** 2 * t * c1 + 3 * (1 - t) * t ** 2 * c2 + t ** 3 * p2)
    if not closed: out.append(pts[-1])
    return np.array(out)
def simplify(pts, tol):
    return measure.approximate_polygon(np.asarray(pts, float), tol)

# ------------------------------------------------------------------ silhouette
def build(limb, stage, P):
    """Returns dict(outline [open arc anterior flank -> posterior flank], margin index range, landmarks, rays, flank)."""
    if P.get('bud'):
        d = rot(np.array([1.0, 0.0]), P['angle']); n = normal(d)
        L = P['len']; st = P['stations']
        ts = [s[0] for s in st]; A = [s[1] for s in st]; Po = [s[2] for s in st]
        # widths follow a pchip through the stations and fall to zero on a quarter ellipse beyond the last station
        tl = ts[-1]; aA = PchipInterpolator(ts, A); aP = PchipInterpolator(ts, Po)
        ant, post = [], []
        for t in np.linspace(0, tl, 10):
            c = d * t * L; ant.append(c + n * float(aA(t))); post.append(c - n * float(aP(t)))
        ra, rp = A[-1], Po[-1]
        for k in range(1, 8):
            th = math.pi / 2 * k / 7
            t = tl + (1 - tl) * math.sin(th)
            ant.append(d * t * L + n * ra * math.cos(th)); post.append(d * t * L - n * rp * math.cos(th))
        pts = ant + post[::-1][1:]
        dense = catmull(pts, False, 0.9, 5)
        apex = d * L
        mid_t = tl + 0.5 * (1 - tl)
        margin = [d * mid_t * L + n * ra * 0.7, d * mid_t * L - n * rp * 0.7]
        return dict(outline=dense, margin=margin, landmarks=dict(shoulder=[0, 0], elbow=(d * L * 0.5).tolist(), wrist=(d * L * 0.8).tolist(), palm=apex.tolist(), stylopodWidth=A[0], zeugopodWidth=A[-1]), rays=[],
                    flank=dict(anterior=(n * A[0]).tolist(), posterior=(-n * Po[0]).tolist(), inward=(-d).tolist()))
    a1, a2, a3 = P['angles']; L1, L2, Lp = P['lengths']
    d1, d2, d3 = rot([1, 0], a1), rot([1, 0], a2), rot([1, 0], a3)
    shoulder = np.zeros(2); elbow = d1 * L1; wrist = elbow + d2 * L2; palm = wrist + d3 * Lp
    # dense centreline with smoothed direction so the normals turn gradually at the joints
    kmax = (len(P['digits']) - 1) / 2
    plate_end = P.get('plateEnd', max(0.35, (Lp - kmax * kmax * P['arc'] - 2.0) / Lp))
    # digits first: the plate's distal width must meet the outer digits' bases
    dg = P['digits']; mid = (len(dg) - 1) / 2; n3 = normal(d3)
    rays = []
    wmax = P['spacing'] * 0.44
    for i, g in enumerate(dg):
        k = mid - i
        base = palm + n3 * (k * P['spacing']) - d3 * (k * k * P['arc'])
        dirn = rot(d3, g['angle'])
        w = min(g['w'], wmax)
        rays.append(dict(base=base, tip=base + dirn * g['len'], dir=dirn, w=w, tip_w=min(g['tip'], w), len=g['len']))
    lat = lambda q: float(np.dot(q - palm, n3))
    r0, rl = rays[0], rays[-1]
    ext_a = lat(r0['base'] + normal(r0['dir']) * r0['w']) + 0.3
    ext_p = -lat(rl['base'] - normal(rl['dir']) * rl['w']) + 0.3
    a0, p0 = P['plate'][0][1], P['plate'][0][2]
    # zero slope at the wrist (no corner), biased outward for a convex palm; rounder for scalloped plates
    expo = 0.5 if P['web'] >= PLATE_WEB else P.get('palmExp', 0.7)
    prof = lambda t: ((1 - math.cos(math.pi * t / plate_end)) / 2) ** expo
    plate_st = [(t, a0 + (ext_a - a0) * prof(t), p0 + (ext_p - p0) * prof(t)) for t in (0, plate_end * 0.25, plate_end * 0.5, plate_end * 0.75, plate_end)]
    chain = [(shoulder, elbow, d1, L1, P['stylopod'], 1.0), (elbow, wrist, d2, L2, P['zeugopod'], 1.0), (wrist, palm, d3, Lp, plate_st, plate_end)]
    S, A, Po, C, D = [], [], [], [], []
    s0 = 0.0
    for (a, b, d, L, st, tmax) in chain:
        ts = [x[0] for x in st]; fa = PchipInterpolator(ts, [x[1] for x in st]); fp = PchipInterpolator(ts, [x[2] for x in st])
        for t in np.linspace(0, tmax, max(8, int(L * tmax / 1.5)), endpoint=tmax < 1):
            S.append(s0 + t * L); A.append(float(fa(t))); Po.append(float(fp(t))); C.append(a + d * t * L); D.append(d)
        s0 += L
    C = np.array(C); D = np.array(D)
    # smooth directions over +-5 units of arclength
    Ds = np.array([unit(np.mean(D[(np.abs(np.array(S) - s) < 5)], 0)) for s in S])
    N = np.array([normal(d) for d in Ds])
    ant = C + N * np.array(A)[:, None]; post = C - N * np.array(Po)[:, None]
    web = P['web']; plate = web >= PLATE_WEB
    # the plate's distal corners follow the outer digits: override the last plate station
    r0, rl = rays[-0], rays[-1]
    r0 = rays[0]
    distal = []
    margin_start = None
    sides = []
    for i, r in enumerate(rays):
        nn = normal(r['dir']); nxt = rays[i + 1] if i + 1 < len(rays) else None
        if plate:
            if margin_start is None: margin_start = len(distal)
            shoulders = (1 - web) * r['len'] >= 1.0
            sdep = min(r['w'] * 0.35, (1 - web) * r['len'] * 0.6)
            tc = r['tip'] - r['dir'] * sdep
            sa, sp = tc + nn * r['w'] * 0.5, tc - nn * r['w'] * 0.5
            distal += [sa, r['tip'], sp] if shoulders else [r['tip']]
            if nxt:
                nn2 = normal(nxt['dir']); sdep2 = min(nxt['w'] * 0.35, (1 - web) * nxt['len'] * 0.6)
                sa2 = nxt['tip'] - nxt['dir'] * sdep2 + nn2 * nxt['w'] * 0.5 if shoulders else nxt['tip']
                md = unit(r['dir'] + nxt['dir'])
                distal.append(((sp if shoulders else r['tip']) + sa2) / 2 - md * (1 - web) * min(r['len'], nxt['len']) * (0.5 if shoulders else 1.0))
            continue
        body = r['len'] - r['tip_w']
        side = lambda t, sgn, rr=r, nnn=nn: rr['base'] + rr['dir'] * (t * body if rr is r else t * (rr['len'] - rr['tip_w'])) + nnn * sgn * (rr['w'] * (1 - t) + rr['tip_w'] * t)
        t0 = web if i > 0 else 0.15
        outer = [side(t, 1) for t in np.linspace(t0, 1, 4, endpoint=False)]
        tc = r['base'] + r['dir'] * body
        tip = [tc + r['tip_w'] * (nn * math.cos(a) + r['dir'] * math.sin(a)) for a in np.linspace(0, math.pi, 7)]
        t1 = web if nxt else 0.15
        inner = [side(t, -1) for t in np.linspace(1, t1, 4, endpoint=False)][1:] + [side(t1, -1)]
        if margin_start is None: margin_start = len(distal) + len(outer)
        distal += outer + tip + inner
        if nxt:
            nn2 = normal(nxt['dir']); body2 = nxt['len'] - nxt['tip_w']
            start2 = nxt['base'] + nxt['dir'] * (web * body2) + nn2 * (nxt['w'] * (1 - web) + nxt['tip_w'] * web)
            md = unit(r['dir'] + nxt['dir'])
            depth = max(0.6, min(r['len'], nxt['len']) * (1 - web) * 0.12)
            distal.append((inner[-1] + start2) / 2 - md * depth)
    margin_end = len(distal) - (0 if plate else 4)
    body_ant = list(ant); body_post = list(post)[::-1]
    pts = body_ant + distal + body_post
    m0 = len(body_ant) + margin_start; m1 = len(body_ant) + margin_end
    dense = catmull(pts, False, 0.85, 4)
    margin = [np.asarray(pts[m0], float), np.asarray(pts[m1], float)]
    # drop near-duplicate control points (the spline loops where two points sit less than a unit apart)
    kept = [pts[0]]
    for q in pts[1:]:
        if np.hypot(*(np.asarray(q) - np.asarray(kept[-1]))) >= 1.0: kept.append(q)
    dense = catmull(kept, False, 0.85, 4)
    return dict(outline=dense, margin=margin,
                landmarks=dict(shoulder=shoulder.tolist(), elbow=elbow.tolist(), wrist=wrist.tolist(), palm=palm.tolist(), stylopodWidth=(P['stylopod'][0][1] + P['stylopod'][0][2]) / 2, zeugopodWidth=(P['zeugopod'][0][1] + P['zeugopod'][0][2]) / 2),
                rays=[dict(base=r['base'].tolist(), tip=r['tip'].tolist(), dir=r['dir'].tolist(), width=r['w'], tipWidth=r['tip_w']) for r in rays],
                flank=dict(anterior=ant[0].tolist(), posterior=post[0].tolist(), inward=(-d1).tolist()))

# ------------------------------------------------------------------ bones and muscles from the E14.5 models
def load_bones(limb):
    j = json.load(open(os.path.join(HERE, 'data', f'{"hl" if limb == "hindlimb" else "fl"}_bones.json')))
    out = {}
    for k in (['femur', 'tibia', 'fibula'] if limb == 'hindlimb' else ['humerus', 'radius', 'ulna']):
        out[k] = simplify(j[k][0]['points'], 0.012).tolist()
    meta = j['metatarsal' if limb == 'hindlimb' else 'metacarpal']
    for i, m in enumerate(meta):
        out[f'{"metatarsal" if limb == "hindlimb" else "metacarpal"}-{i + 1}'] = simplify(m['points'], 0.015).tolist()
    return out
def segment_map(src_a, src_b, dst_a, dst_b):
    """similarity transform taking src_a->dst_a and src_b->dst_b"""
    sa, sb, da, db = map(lambda p: np.asarray(p, float), (src_a, src_b, dst_a, dst_b))
    sv, dv = sb - sa, db - da
    scale = np.linalg.norm(dv) / (np.linalg.norm(sv) or 1)
    th = math.atan2(dv[1], dv[0]) - math.atan2(sv[1], sv[0])
    R = np.array([[math.cos(th), -math.sin(th)], [math.sin(th), math.cos(th)]]) * scale
    return lambda p: da + R @ (np.asarray(p, float) - sa)
def clip_to(poly, sil, px=8):
    """intersection of polygon `poly` with silhouette `sil` by rasterisation; returns list of polygons"""
    allp = np.concatenate([np.asarray(poly), np.asarray(sil)])
    lo = allp.min(0) - 2; hi = allp.max(0) + 2
    W, H = int((hi[0] - lo[0]) * px) + 2, int((hi[1] - lo[1]) * px) + 2
    def mask(p):
        im = Image.new('L', (W, H), 0); ImageDraw.Draw(im).polygon([tuple((np.asarray(q) - lo) * px) for q in p], fill=255)
        return np.array(im) > 127
    m = mask(poly) & mask(sil)
    m = morphology.binary_opening(m, morphology.disk(2))
    out = []
    for c in measure.find_contours(m.astype(float), 0.5):
        pts = np.stack([c[:, 1], c[:, 0]], 1) / px + lo
        if len(pts) < 8: continue
        area = 0.5 * abs(np.dot(pts[:, 0], np.roll(pts[:, 1], 1)) - np.dot(pts[:, 1], np.roll(pts[:, 0], 1)))
        if area < 6: continue
        s = simplify(pts, 0.35)
        if len(s) >= 4: out.append(s[:-1].tolist() if np.allclose(s[0], s[-1]) else s.tolist())
    return out
def muscles_for(limb, shape):
    g = json.load(open(os.path.join(HERE, 'data', f'{"hl" if limb == "hindlimb" else "fl"}_groups.json')))
    lm = g['landmarks']; L = shape['landmarks']
    seg_of = {'hindlimb': {'gluteal': 'stylopod', 'quadriceps': 'stylopod', 'hamstring': 'stylopod', 'adductor': 'stylopod', 'tibialis anterior': 'zeugopod', 'extensor digitorum longus': 'zeugopod', 'gastrocnemius': 'zeugopod', 'flexor digitorum': 'zeugopod', 'intrinsic foot': 'autopod'},
              'forelimb': {'deltoid': 'stylopod', 'triceps': 'stylopod', 'biceps': 'stylopod', 'brachialis': 'stylopod', 'extensor carpi radialis': 'zeugopod', 'extensor digitorum': 'zeugopod', 'flexor carpi': 'zeugopod', 'flexor digitorum': 'zeugopod', 'intrinsic hand': 'autopod'}}[limb]
    src = {'stylopod': (lm['stylopod'][0], lm['stylopod'][1]), 'zeugopod': (lm['zeugopod'][0], lm['zeugopod'][1]), 'autopod': (lm['zeugopod'][1], [(lm['meta'][1][0] + lm['meta'][0][0]) / 2, (lm['meta'][1][1] + lm['meta'][0][1]) / 2])}
    dst = {'stylopod': (L['shoulder'], L['elbow']), 'zeugopod': (L['elbow'], L['wrist']), 'autopod': (L['wrist'], L['palm'])}
    sil = np.concatenate([shape['outline'], shape['outline'][:1]])
    # dorsal view: superficial groups first; each later group shows only where no earlier group covers it
    ORDER = {'hindlimb': ['gluteal', 'quadriceps', 'hamstring', 'tibialis anterior', 'gastrocnemius', 'extensor digitorum longus', 'intrinsic foot', 'flexor digitorum', 'adductor'],
             'forelimb': ['deltoid', 'triceps', 'brachialis', 'extensor carpi radialis', 'extensor digitorum', 'flexor carpi', 'intrinsic hand', 'biceps', 'flexor digitorum']}[limb]
    px = 8
    lo = sil.min(0) - 2; hi = sil.max(0) + 2
    W, H = int((hi[0] - lo[0]) * px) + 2, int((hi[1] - lo[1]) * px) + 2
    def mask(p):
        im = Image.new('L', (W, H), 0); ImageDraw.Draw(im).polygon([tuple((np.asarray(q) - lo) * px) for q in p], fill=255)
        return np.array(im) > 127
    silm = mask(sil); covered = np.zeros_like(silm)
    out = []
    for name in ORDER:
        polys = g['muscles'].get(name, [])
        seg = seg_of[name]; f = segment_map(src[seg][0], src[seg][1], dst[seg][0], dst[seg][1])
        m = np.zeros_like(silm)
        for poly in polys: m |= mask([f(p) for p in poly])
        m &= silm
        full = m.sum()
        m &= ~covered
        m = morphology.binary_opening(m, morphology.disk(6))
        if full == 0 or m.sum() < 0.3 * full or m.sum() < 25 * px * px: continue
        covered |= morphology.binary_dilation(m, morphology.disk(1))
        cs = sorted(measure.find_contours(m.astype(float), 0.5), key=lambda c: -len(c))
        pts = np.stack([cs[0][:, 1], cs[0][:, 0]], 1) / px + lo
        sm = simplify(catmull(simplify(pts, 0.9), True, 0.9, 3), 0.25)
        out.append(dict(name=name, segment=seg, points=[[round(float(x), 1), round(float(y), 1)] for x, y in sm]))
    return out

# ------------------------------------------------------------------ export
def fmt(v):
    s = f'{v:.1f}'; return s[:-2] if s.endswith('.0') else s
def pts_ts(pts):
    return '[' + ','.join(f'[{fmt(x)},{fmt(y)}]' for x, y in pts) + ']'
def main():
    preview = None
    if '--preview' in sys.argv: preview = sys.argv[sys.argv.index('--preview') + 1]
    shapes = {}
    for limb, table in (('forelimb', FORELIMB), ('hindlimb', HINDLIMB)):
        shapes[limb] = {}
        for stage in STAGES:
            sh = build(limb, stage, table[stage])
            sh['outline'] = simplify(sh['outline'], 0.22)
            # margin end points -> indices into the simplified outline
            sh['margin'] = [int(np.argmin(np.hypot(*(sh['outline'] - q).T))) for q in sh['margin']]
            sh['muscles'] = muscles_for(limb, sh) if stage >= 'E13.5' else []
            sh['lengthMm'] = LENGTH_MM[limb][stage]
            shapes[limb][stage] = sh
            print(limb, stage, 'outline pts', len(sh['outline']), 'muscles', len(sh['muscles']))
    bones = {limb: load_bones(limb) for limb in ('forelimb', 'hindlimb')}
    lines = ['/**', ' * Mouse limb stage silhouettes, landmarks, digit rays, muscle groups and bone outlines.',
             ' * GENERATED by scripts/limbs/author.py from the authored station tables and the eMouseAtlas',
             ' * E14.5 limb models (DeLaurier et al. 2008, BMC Dev Biol 8:83; CC BY). Do not edit by hand.',
             ' * Frame: proximal cut at x = 0, distal to the right, anterior (digit 1) up; units are viewBox units.',
             ' */', "import type { Limb, Stage } from './types'", '', 'export type Pt = [number, number]',
             'export interface RayShape { base: Pt; tip: Pt; dir: Pt; width: number; tipWidth: number }',
             'export interface MuscleShape { name: string; segment: "stylopod" | "zeugopod" | "autopod"; points: Pt[] }',
             'export interface LimbShape {', '  /** open silhouette from the anterior flank point round the autopod to the posterior flank point */', '  outline: Pt[]',
             '  /** index range of `outline` that forms the distal margin (apical ectodermal ridge) */', '  margin: [number, number]',
             '  landmarks: { shoulder: Pt; elbow: Pt; wrist: Pt; palm: Pt; stylopodWidth: number; zeugopodWidth: number }',
             '  rays: RayShape[]', '  flank: { anterior: Pt; posterior: Pt; inward: Pt }', '  muscles: MuscleShape[]', '  lengthMm: number', '}', '',
             'export const LIMB_SHAPES: Record<Limb, Record<Stage, LimbShape>> = {']
    for limb in ('forelimb', 'hindlimb'):
        lines.append(f'  {limb}: {{')
        for stage in STAGES:
            sh = shapes[limb][stage]; L = sh['landmarks']
            r = ','.join(f'{{base:[{fmt(x["base"][0])},{fmt(x["base"][1])}],tip:[{fmt(x["tip"][0])},{fmt(x["tip"][1])}],dir:[{x["dir"][0]:.3f},{x["dir"][1]:.3f}],width:{fmt(x["width"])},tipWidth:{fmt(x["tipWidth"])}}}' for x in sh['rays'])
            m = ','.join(f'{{name:{json.dumps(x["name"])},segment:"{x["segment"]}",points:{pts_ts(x["points"])}}}' for x in sh['muscles'])
            fl = sh['flank']
            lines.append(f"    '{stage}': {{ outline: {pts_ts(sh['outline'])}, margin: [{sh['margin'][0]},{sh['margin'][1]}], landmarks: {{ shoulder: [{fmt(L['shoulder'][0])},{fmt(L['shoulder'][1])}], elbow: [{fmt(L['elbow'][0])},{fmt(L['elbow'][1])}], wrist: [{fmt(L['wrist'][0])},{fmt(L['wrist'][1])}], palm: [{fmt(L['palm'][0])},{fmt(L['palm'][1])}], stylopodWidth: {fmt(L['stylopodWidth'])}, zeugopodWidth: {fmt(L['zeugopodWidth'])} }}, rays: [{r}], flank: {{ anterior: [{fmt(fl['anterior'][0])},{fmt(fl['anterior'][1])}], posterior: [{fmt(fl['posterior'][0])},{fmt(fl['posterior'][1])}], inward: [{fl['inward'][0]:.3f},{fl['inward'][1]:.3f}] }}, muscles: [{m}], lengthMm: {sh['lengthMm']} }},")
        lines.append('  },')
    lines.append('}')
    lines.append('')
    lines.append('/** Bone outlines from the E14.5 models, normalised: proximal end at x = 0, distal end at x = 1, y in units of the length. */')
    lines.append('export const BONE_SHAPES: Record<Limb, Record<string, Pt[]>> = {')
    for limb in ('forelimb', 'hindlimb'):
        lines.append(f'  {limb}: {{')
        for k, pts in bones[limb].items():
            lines.append(f"    '{k}': [{','.join(f'[{x:.3f},{y:.3f}]' for x, y in pts)}],")
        lines.append('  },')
    lines.append('}')
    open(OUT, 'w').write('\n'.join(lines) + '\n')
    print('wrote', OUT, os.path.getsize(OUT), 'bytes')
    if preview:
        draw_preview(shapes, bones, preview)

def spline_d(pts, closed, tension=1.0):
    pts = [np.asarray(p, float) for p in pts]; n = len(pts)
    at = lambda i: pts[(i % n + n) % n] if closed else pts[min(n - 1, max(0, i))]
    d = f'M{pts[0][0]:.1f} {pts[0][1]:.1f}'
    for i in range(n if closed else n - 1):
        p0, p1, p2, p3 = at(i - 1), at(i), at(i + 1), at(i + 2)
        c1 = p1 + (p2 - p0) / 6 * tension; c2 = p2 - (p3 - p1) / 6 * tension
        d += f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    return d + ('z' if closed else '')
def draw_preview(shapes, bones, path):
    cw, ch, sc = 560, 300, 4.2
    parts = ['<rect width="100%" height="100%" fill="#fff"/>']
    for col, limb in enumerate(('forelimb', 'hindlimb')):
        for row, stage in enumerate(STAGES):
            sh = shapes[limb][stage]; ox, oy = col * cw + 40, row * ch + 150
            g = f'<g transform="translate({ox} {oy}) scale({sc})" stroke-linejoin="round">'
            g += f'<path d="{spline_d(sh["outline"], False, 0.85)}z" fill="#f0e2ce" stroke="#222" stroke-width="0.35"/>'
            for mu in sh['muscles']:
                g += f'<path d="{spline_d(mu["points"], True, 0.8)}" fill="#cd5f55" fill-opacity="0.85" stroke="#7a2a23" stroke-width="0.18"/>'
            L = sh['landmarks']
            g += f'<path d="M{L["shoulder"][0]:.1f} {L["shoulder"][1]:.1f}L{L["elbow"][0]:.1f} {L["elbow"][1]:.1f}L{L["wrist"][0]:.1f} {L["wrist"][1]:.1f}L{L["palm"][0]:.1f} {L["palm"][1]:.1f}" stroke="#c00" stroke-width="0.4" fill="none"/>'
            a, b = sh['margin']
            if b > a: g += f'<path d="{spline_d(sh["outline"][a:b + 1], False)}" stroke="#0a0" stroke-width="0.8" fill="none"/>'
            for r in sh['rays']:
                g += f'<path d="M{r["base"][0]:.1f} {r["base"][1]:.1f}L{r["tip"][0]:.1f} {r["tip"][1]:.1f}" stroke="#06f" stroke-width="0.3"/>'
            g += '</g>'
            parts.append(g + f'<text x="{ox}" y="{oy - 135}" font-family="Helvetica" font-size="13">{stage} {limb} {sh["lengthMm"]} mm, {len(sh["outline"])} pts, {len(sh["muscles"])} muscles</text>')
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{cw * 2}" height="{ch * 9}" viewBox="0 0 {cw * 2} {ch * 9}">{"".join(parts)}</svg>'
    open(path, 'w').write(svg); print('preview', path)

if __name__ == '__main__':
    main()
