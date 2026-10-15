# Limb icon authoring pipeline

`author.py` builds the mouse limb stage silhouettes and writes
`src/library/items/limbs/shapes.ts` (generated, do not edit by hand).

- Silhouettes come from width stations along a bent centreline (stylopod,
  zeugopod, palm) and a fan of tapered digits, authored in the `FORELIMB` and
  `HINDLIMB` tables against the references listed in
  `docs/superpowers/specs/2026-10-14-drawing-styles-design.md`
  ("Reference-built limbs").
- Bone outlines (`BONE_SHAPES`) and muscle groups come from the eMouseAtlas
  E14.5 limb models (EMA108 forelimb, EMA109 hindlimb; DeLaurier et al. 2008,
  BMC Dev Biol 8:83; University of Edinburgh DataShare, CC BY). The STL
  surfaces were split into connected components, projected on their principal
  planes and traced (`data/*_bones.json`); muscles were grouped by name,
  projected dorsally and traced (`data/*_groups.json`); `stl/` holds the
  extraction scripts. Muscle groups are mapped segment-wise into each stage and
  clipped to the silhouette, superficial groups first.

Run from the repository root with a Python that has numpy, scipy,
scikit-image and Pillow:

```bash
python scripts/limbs/author.py                       # rewrite shapes.ts
python scripts/limbs/author.py --preview out.svg     # plus a check sheet
```
