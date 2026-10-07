#!/usr/bin/env bash
# Tag the version in package.json and publish a GitHub release whose notes are
# that version's section of CHANGELOG.md. Usage: scripts/release.sh [commit]
set -euo pipefail
cd "$(dirname "$0")/.."
v=$(node -p "require('./package.json').version")
tag="v$v"
[[ -z $(git status --porcelain) ]] || { echo "working tree not clean" >&2; exit 1; }
grep -q "^## \[$v\]" CHANGELOG.md || { echo "CHANGELOG.md has no '## [$v]' heading" >&2; exit 1; }
notes=$(awk -v v="$v" '/^## \[/ { p = ($0 ~ ("^## \\[" v "\\]")) ; next } p' CHANGELOG.md)
git tag -a "$tag" -m "DiagramIt $v" "${1:-HEAD}"
git push origin "$tag"
gh release create "$tag" --title "DiagramIt $v" --notes "$notes"
