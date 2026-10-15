#!/bin/zsh
# calibrate.sh の縮小画像（1280 幅）の座標でクリックして撮る。前面が Hermes でなければ中断する。
# 使い方: SHOTS=<出力ディレクトリ> [K=<論理px/縮小px>] shot.sh <name> <sx|-> <sy> [スクロール枚数] [スクロール時のマウス sx,sy]
#   sx に "-" を渡すとクリックせずに撮る。K の既定 1.40625 は論理 1800 幅（3600px Retina）のディスプレイ。
#   論理 1512 幅なら K=1.18125。00_calibrate_s.png のカーソル位置で確かめてから使う。
set -u
OUT=${SHOTS:?SHOTS に出力ディレクトリを指定}
D=$(cd "$(dirname "$0")" && pwd)
K=${K:-1.40625}
NAME=$1; SX=$2; SY=$3; PAGES=${4:-0}; MP=${5:-600,450}
lx(){ printf '%.0f' $(( $1 * K )); }
FRONT=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true')
[ "$FRONT" = "Hermes" ] || { echo "ABORT: frontmost=$FRONT"; exit 1; }
if [ "$SX" != "-" ]; then cliclick c:$(lx $SX),$(lx $SY); sleep 1.4; fi
cap(){ screencapture -x -D 1 "$OUT/$1.png"; sips -Z 1280 "$OUT/$1.png" --out "$OUT/${1}_s.png" >/dev/null; }
cliclick m:$(lx ${MP%,*}),$(lx ${MP#*,}); sleep 0.2
cap "${NAME}_0"
for i in $(seq 1 $PAGES); do
  uv run --quiet --with pyobjc-framework-Quartz python "$D/scroll.py" 60 -10; sleep 0.7; cap "${NAME}_$i"
done
echo "ok $NAME pages=$PAGES"
