#!/bin/zsh
# 全ページの hermes_version / hermes_commit / verified を一括更新する。引数: <version> <commit8> <verified YYYY-MM-DD>
set -eu
cd "$(dirname "$0")/../.."
VER=$1; COMMIT=$2; DATE=$3
find vault -name '*.md' -not -path '*/.obsidian/*' -print0 | xargs -0 sed -i '' \
  -e "s/^hermes_version: .*/hermes_version: $VER/" \
  -e "s/^hermes_commit: .*/hermes_commit: '$COMMIT'/" \
  -e "s/^verified: .*/verified: '$DATE'/"
echo "updated: $(grep -rl "hermes_commit: '$COMMIT'" vault | wc -l | tr -d ' ') files"
