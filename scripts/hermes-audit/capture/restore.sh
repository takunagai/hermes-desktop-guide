#!/bin/zsh
# calibrate.sh で隠したアプリを再表示する。使い方: restore.sh <出力ディレクトリ>
OUT=${1:?}
for p in $(tr ',' '\n' < "$OUT/visible-procs.txt" | sed 's/^ //'); do
  [ "$p" = "Hermes" ] || osascript -e "tell application \"System Events\" to set visible of process \"$p\" to true" >/dev/null 2>&1
done
echo restored
