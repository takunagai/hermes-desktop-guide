#!/bin/zsh
# 実機 Hermes のバージョン・コミット・タグ祖先関係を確定し、公式リリースノートを保存する。
# 使い方: scripts/hermes-audit/preflight.sh <出力ディレクトリ> [前回監査コミット]
# 実機 repo には読み取りしかしない（fetch / checkout 禁止）。
set -eu
OUT=${1:?出力ディレクトリ}; PREV=${2:-}
D=$(cd "$(dirname "$0")" && pwd)
REPO=${HERMES_REPO:-$HOME/.hermes/hermes-agent}
mkdir -p "$OUT"
cd "$REPO"
VERSION_LINE=$(hermes --version 2>/dev/null | head -1)
HEAD_FULL=$(git rev-parse HEAD); HEAD8=${HEAD_FULL:0:8}
CFG_VER=$(grep -m1 '"_config_version"' hermes_cli/config_defaults.py | tr -dc '0-9')
echo "version : $VERSION_LINE"
echo "commit  : $HEAD8 ($HEAD_FULL)"
echo "config  : _config_version=$CFG_VER"
echo "__version__: $(grep -m1 '__version__' hermes_cli/__init__.py)"
echo "--- releases (latest 8)"
gh api "repos/NousResearch/hermes-agent/releases?per_page=8" --jq '.[] | "\(.tag_name) | \(.name) | \(.published_at)"' | tee "$OUT/releases.txt"
TAG=$(head -1 "$OUT/releases.txt" | cut -d' ' -f1)
TAG_OBJ=$(gh api "repos/NousResearch/hermes-agent/git/ref/tags/$TAG" --jq '.object.sha')
TAG_COMMIT=$(gh api "repos/NousResearch/hermes-agent/git/tags/$TAG_OBJ" --jq '.object.sha' 2>/dev/null || echo "$TAG_OBJ")
echo "tag     : $TAG -> commit ${TAG_COMMIT:0:8}"
if git merge-base --is-ancestor "$TAG_COMMIT" HEAD; then
  echo "ancestor: OK (HEAD is $(git rev-list --count "$TAG_COMMIT"..HEAD) commits ahead of tag)"
else
  echo "ancestor: NG (実機はタグ以前。hermes update を検討)"
fi
gh api "repos/NousResearch/hermes-agent/releases/tags/$TAG" --jq '.body' > "$OUT/release-$TAG.md"
echo "notes   : $OUT/release-$TAG.md ($(wc -l < "$OUT/release-$TAG.md") lines)"
if [ -n "$PREV" ]; then
  echo "--- since $PREV: $(git rev-list --count "$PREV"..HEAD) commits"
  git diff --stat "$PREV"..HEAD -- apps/desktop/src/app/settings apps/desktop/src/i18n/ja.ts hermes_cli/config_defaults.py hermes_cli/commands.py | tail -1
  git show "$PREV":hermes_cli/config_defaults.py > "$OUT/defaults-old.py"
  cp hermes_cli/config_defaults.py "$OUT/defaults-new.py"
  git show "$PREV":hermes_cli/commands.py > "$OUT/commands-old.py"
  cp hermes_cli/commands.py "$OUT/commands-new.py"
  python3 "$D/extract_defaults.py" "$OUT/defaults-old.py" "$OUT/defaults-old.json"
  python3 "$D/extract_defaults.py" "$OUT/defaults-new.py" "$OUT/defaults-new.json"
  python3 "$D/diff_json.py" defaults "$OUT/defaults-old.json" "$OUT/defaults-new.json" > "$OUT/diff-defaults.txt"
  python3 "$D/extract_commands.py" "$OUT/commands-old.py" "$OUT/commands-old.json"
  python3 "$D/extract_commands.py" "$OUT/commands-new.py" "$OUT/commands-new.json"
  python3 "$D/diff_json.py" commands "$OUT/commands-old.json" "$OUT/commands-new.json" > "$OUT/diff-commands.txt"
  head -2 "$OUT/diff-defaults.txt"; head -1 "$OUT/diff-commands.txt"
fi
