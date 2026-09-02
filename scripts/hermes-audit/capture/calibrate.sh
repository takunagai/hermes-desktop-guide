#!/bin/zsh
# 撮影前の準備: 他アプリを隠し、Hermes を内蔵ディスプレイ (40,40) 1420x900 に置き、設定を開いてカーソル込みで 1 枚撮る。
# 使い方: calibrate.sh <出力ディレクトリ>   → 出力の *_s.png を Read して座標係数（論理 px / 縮小 px）と項目位置を確定する
set -eu
OUT=${1:?出力ディレクトリ}; mkdir -p "$OUT"
osascript -e 'tell application "System Events" to get name of every process whose visible is true' > "$OUT/visible-procs.txt"
osascript -e 'tell application "System Events" to set visible of every process whose visible is true and name is not "Hermes" to false' >/dev/null 2>&1 || true
sleep 0.5
osascript -e 'tell application "System Events" to set visible of process "Hermes" to true'
osascript -e 'tell application "System Events" to tell process "Hermes" to set frontmost to true'; sleep 0.8
osascript -e 'tell application "System Events" to tell process "Hermes" to set size of window 1 to {1420, 900}'
osascript -e 'tell application "System Events" to tell process "Hermes" to set position of window 1 to {40, 40}'; sleep 1
echo "window: $(osascript -e 'tell application "System Events" to tell process "Hermes" to get {position, size} of window 1')"
echo "front : $(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true')"
system_profiler SPDisplaysDataType 2>/dev/null | grep -E "Resolution|UI Looks" | head -2
osascript -e 'tell application "System Events" to keystroke "," using command down'; sleep 1.8
cliclick m:183,119
screencapture -x -C -D 1 "$OUT/00_calibrate.png"
sips -Z 1280 "$OUT/00_calibrate.png" --out "$OUT/00_calibrate_s.png" >/dev/null
sips -g pixelWidth -g pixelHeight "$OUT/00_calibrate.png" | tail -2
echo "Read $OUT/00_calibrate_s.png: カーソルが「モデル」に乗っていれば座標表（capture_settings.sh の既定）がそのまま使える"
