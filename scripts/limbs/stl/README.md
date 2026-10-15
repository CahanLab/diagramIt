# STL extraction (provenance of data/*.json)

One-off scripts used to derive `../data/hl_bones.json`, `fl_bones.json`,
`hl_groups.json` and `fl_groups.json` from the eMouseAtlas E14.5 limb models
(`Surfaces.zip` of EMA109 hindlimb, https://datashare.ed.ac.uk/handle/10283/2847,
and EMA108 forelimb, https://datashare.ed.ac.uk/handle/10283/2846). Replace
`WORKDIR` with a folder holding the unzipped `Surfaces/` (hindlimb) and
`fl_surfaces/Surfaces/` (forelimb), then:

```bash
python stlparts.py Surfaces hl/hl 0 1 2 0      # dorsal projection + per-part masks
python stl_groups.py hl                         # grouped muscles, landmarks -> hl_groups.json
python stl_bones.py hl                          # per-bone principal-plane outlines -> hl_bones.json
```

and likewise `fl`. Needs numpy, scikit-image and Pillow.
