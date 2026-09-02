#!/bin/zsh
# 画像参照・frontmatter ピン・版数記載・未使用画像を検査する。引数: <version> <commit8> <verified YYYY-MM-DD>
set -u
cd "$(dirname "$0")/../.."
VER=${1:?version}; COMMIT=${2:?commit8}; DATE=${3:?date}
FILES=(${(f)"$(find vault -name '*.md' -not -path '*/.obsidian/*')"})
echo "== 画像参照（存在しない参照）"
grep -rhoE "@screenshots/[a-z0-9-]+\.webp" vault | sort -u | while read r; do
  [ -f "src/assets/screenshots/${r#@screenshots/}" ] || echo "MISSING $r"
done
echo "== 未参照画像"
for f in src/assets/screenshots/*.webp; do b=$(basename "$f"); grep -rq "@screenshots/$b" vault || echo "UNREF $b"; done
echo "== frontmatter が未更新のページ"
for f in "${FILES[@]}"; do
  grep -q "hermes_version: $VER" "$f" && grep -q "hermes_commit: '$COMMIT'" "$f" && grep -q "verified: '$DATE'" "$f" || echo "STALE $f"
done
echo "== 本文の版数記載（06_リファレンス と 00_ホーム の更新履歴以外）"
grep -rnE "v0\.[0-9]+\.[0-9]+|[0-9]\.[0-9]+\.[0-9]+ で" vault --include='*.md' | grep -v "06_リファレンス\|00_ホーム.md\|hermes_version\|description:" | head
echo "== 丸数字・全角ダッシュ（UI 文言の引用は許容）"
grep -rnE "[①-⑳]|―" vault --include='*.md' | grep -v .obsidian | head -5
echo "== done"
