#!/usr/bin/env bash
# Rebuild src/library/items/embryos/traced.ts from the eMouseAtlas Theiler stage plates.
# Needs a Python with numpy, scikit-image and Pillow (e.g. conda env); plates are downloaded into work/.
set -euo pipefail
cd "$(dirname "$0")"
PY="${PYTHON:-python3}"
mkdir -p work preview
for n in 17 19 20 21 22 23 24 25 26; do
  f="work/ts${n}_1B.png"
  [ -f "$f" ] || curl -sL "https://www.emouseatlas.org/emap/ema/theiler_stages/StageDefinition/Images/ts${n}_1B.png" -o "$f"
  # plates with heavier gap closing (the outline is broken by dotted lines in these stages)
  case $n in 19|21|22|26) r=6 ;; *) r=2 ;; esac
  "$PY" -I trace_plate.py "$f" "work/ts${n}.json" "$r"
done
"$PY" -I export_traced.py ../../src/library/items/embryos/traced.ts preview
