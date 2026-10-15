"""Group the E14.5 STL part masks into icon tissues, trace them, and compute landmarks.
Usage: python stl_groups.py <hl|fl> ; reads <dir>/<limb>_masks, writes <dir>/<limb>_groups.json and a check PNG."""
import sys, os, glob, json
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from trace import trace
limb = sys.argv[1]
D = f'WORKDIR/{limb}'
masks = {os.path.basename(f)[:-4].split('_', 1)[1] if '_' in os.path.basename(f) else os.path.basename(f)[:-4]: np.array(Image.open(f)) > 127 for f in glob.glob(f'{D}/{limb}_masks/*.png')}
names = sorted(masks)
# ---- bones: single elements kept separate; small bones clustered
if limb == 'hl':
    BONES = {'femur': ['femur'], 'tibia': ['tibia'], 'fibula': ['fibula'], 'tarsal': ['talus', 'calcaneus', 'navicular', 'cuboid', 'medial_cuneiform', 'intermediate_cuneiform', 'lateral_cuneiform', 'tibiale'], 'metatarsal': ['metatarsal_bone'], 'phalanx': ['hindlimb_phalanx'], 'girdle': ['pelvis']}
    MUSCLES = {
        'gluteal': ['gluteus_maximus', 'gluteus_medius', 'gluteus_minimus', 'tensor_fasciae_lata', 'piriformis', 'gemellus_inferior', 'gemellus_superior', 'obturator_internus', 'obturator_externus', 'quadratus_femoris', 'caudofemoralis', 'iliacus', 'psoas_major', 'psoas_minor'],
        'quadriceps': ['vastus_lateralis', 'vastus_medialis', 'vastus_intermedius', 'patella', 'ligamentum_patellae'],
        'hamstring': ['semitendinosus', 'semimembranosus', 'accessory_head_of_biceps_femoris', 'anterior_head_of_biceps_femoris', 'posterior_head_of_biceps_femoris'],
        'adductor': ['adductor_brevis', 'adductor_longus', 'adductor_magnus', 'gracilis_anticus', 'gracilis_posticus', 'pectineus'],
        'tibialis anterior': ['tibialis_anterior', 'extensor_hallucis_longus'],
        'extensor digitorum longus': ['extensor_digitorum_longus', 'peroneus_longus', 'peroneus_brevis', 'peroneus_digiti_quarti', 'peroneus_digiti_quinti'],
        'gastrocnemius': ['lateral_head_of_gastrocnemius', 'medial_head_of_gastrocnemius', 'soleus', 'plantaris', 'popliteus'],
        'flexor digitorum': ['flexor_digitorum_longus', 'tibialis_posterior'],
        'intrinsic foot': ['extensor_digitorum_brevis', 'flexor_digitorum_brevis', 'lumbrical_muscle_of_foot', 'interosseus_muscle_of_foot', 'quadratus_plantae', 'abductor_digiti_quinti_of_foot', 'adductor_indicis', 'flexor_digiti_primi_brevis_of_foot', 'tensor_aponeurosis_plantaris'],
    }
    LM = {'stylopod': 'femur', 'zeugopod': 'tibia', 'meta': 'metatarsal_bone', 'phalanx': 'hindlimb_phalanx'}
else:
    BONES = {'humerus': ['humerus'], 'radius': ['radius'], 'ulna': ['ulna'], 'carpal': ['scapholunate', 'triquetrum', 'capitate', 'hamate', 'trapezium', 'trapezoid', 'pisiform', 'centrale', 'falciform'], 'metacarpal': ['metacarpal_bone'], 'phalanx': ['forelimb_bone', 'forelimb_phalanx', 'phalanx'], 'girdle': ['scapula', 'clavicle']}
    MUSCLES = {
        'deltoid': ['pars_acromialis_of_deltoid', 'pars_scapularis_of_deltoid', 'supraspinatus', 'infraspinatus', 'teres_minor', 'teres_major', 'subscapularis', 'latissimus_dorsi'],
        'triceps': ['lateral_head_of_triceps_brachii', 'long_head_of_triceps_brachii', 'medial_head_of_triceps_brachii', 'anconeus', 'tensor_fasciae_antebrachii'],
        'biceps': ['long_head_of_biceps_brachii', 'short_head_of_biceps_brachii', 'coracobrachialis'],
        'brachialis': ['brachialis'],
        'extensor carpi radialis': ['extensor_carpi_radialis_brevis', 'supinator', 'extensor_pollicis', 'extensor_indicis_proprius'],
        'extensor digitorum': ['extensor_digitorum_communis', 'extensor_digitorum_lateralis', 'extensor_carpi_ulnaris'],
        'flexor carpi': ['flexor_carpi_ulnaris', 'flexor_carpi_radialis', 'palmaris_longus', 'pronator_teres', 'pronator_quadratus'],
        'flexor digitorum': ['flexor_digitorum_profundus', 'humeral_head_of_flexor_digitorum_profundus', 'radial_head_of_flexor_digitorum_profundus', 'ulnar_head_of_flexor_digitorum_profundus', 'flexor_digitorum_superficialis', 'flexor_digitorum_superficialis_1', 'flexor_digitorum_superficialis_2'],
        'intrinsic hand': ['abductor_pollucis', 'abductor_digiti_quinti_of_hand', 'adductor_pollicis', 'flexor_digiti_primi_brevis_of_hand', 'flexor_digiti_quinti_brevis', 'interosseus_muscle_of_hand', 'lumbrical_muscle_of_hand', 'opponens_digiti_quinti'],
    }
    LM = {'stylopod': 'humerus', 'zeugopod': 'radius', 'meta': 'metacarpal_bone', 'phalanx': 'forelimb_bone'}
def union(keys):
    m = np.zeros_like(next(iter(masks.values())))
    used = []
    for k in keys:
        if k in masks: m |= masks[k]; used.append(k)
    return m, used
assigned = set()
out = {'size': [int(masks['reference'].shape[1]), int(masks['reference'].shape[0])], 'bones': {}, 'muscles': {}, 'landmarks': {}}
ref = masks['reference']
ys, xs = np.nonzero(ref)
origin = (int(xs.min()), int(ys.min())); out['bbox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
out['reference'] = trace(ref, 2.0, 1.0, (0, 0), smooth=3, min_area=500)[0]['points']
for g, keys in BONES.items():
    m, used = union(keys); assigned |= set(used)
    if not m.any(): print('bone group empty', g); continue
    rs = trace(m, 1.2, 1.0, (0, 0), smooth=2, min_area=40)
    out['bones'][g] = [r['points'] for r in rs]
for g, keys in MUSCLES.items():
    m, used = union(keys); assigned |= set(used)
    if not m.any(): print('muscle group empty', g); continue
    rs = trace(m, 1.5, 1.0, (0, 0), smooth=3, min_area=80)
    out['muscles'][g] = [r['points'] for r in rs]
un = [n for n in names if n not in assigned and n != 'reference']
print('unassigned:', un)
# landmarks: principal-axis endpoints of long bones
def ends(mask):
    ys, xs = np.nonzero(mask); p = np.stack([xs, ys], 1).astype(float); c = p.mean(0)
    u, s, vt = np.linalg.svd(p - c, full_matrices=False); ax = vt[0]
    t = (p - c) @ ax
    a = c + ax * t.min(); b = c + ax * t.max()
    return [round(float(a[0]), 1), round(float(a[1]), 1)], [round(float(b[0]), 1), round(float(b[1]), 1)]
for k, name in LM.items():
    if name and name in masks:
        out['landmarks'][k] = ends(masks[name])
json.dump(out, open(f'{D}/{limb}_groups.json', 'w'))
# check image
W, H = out['size']; im = Image.new('RGB', (W, H), 'black'); dr = ImageDraw.Draw(im)
dr.polygon([tuple(p) for p in out['reference']], fill=(60, 60, 60))
rng = np.random.default_rng(5)
for g, polys in out['muscles'].items():
    col = (200 + int(rng.integers(0, 55)), 60 + int(rng.integers(0, 120)), 60)
    for poly in polys: dr.polygon([tuple(p) for p in poly], fill=col, outline=(255, 255, 255))
for g, polys in out['bones'].items():
    col = (90 + int(rng.integers(0, 100)), 150 + int(rng.integers(0, 100)), 255)
    for poly in polys: dr.polygon([tuple(p) for p in poly], fill=col, outline=(0, 0, 0))
for k, (a, b) in out['landmarks'].items():
    dr.line([tuple(a), tuple(b)], fill=(255, 255, 0), width=3)
im.save(f'{D}/{limb}_groups.png')
print('bones', {g: len(v) for g, v in out['bones'].items()}, 'muscles', {g: len(v) for g, v in out['muscles'].items()}, 'landmarks', out['landmarks'])
