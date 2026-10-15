# Embryo icon pipeline

The nine embryo icons are traced from the eMouseAtlas Theiler stage plates
(TS17 to TS26; https://www.emouseatlas.org/emap/ema/theiler_stages/, CC BY 3.0).

- `run.sh` downloads the plates into `work/`, traces each one
  (`trace_plate.py`: silhouette by flood fill, feature lines by skeletonising the
  interior ink) and exports `src/library/items/embryos/traced.ts`
  (`export_traced.py`, 8 viewBox units per mm of crown-rump length). Gridded
  previews land in `preview/` for placing the hand-authored features
  (`src/library/items/embryos/features.ts`: eye, closed eyelids, vibrissa field).
- Needs a Python with numpy, scikit-image and Pillow: `PYTHON=... ./run.sh`.
