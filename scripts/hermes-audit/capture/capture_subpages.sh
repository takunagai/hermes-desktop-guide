#!/bin/zsh
# 設定 19 画面の全サブページを撮る（v0.22.1 のアコーディオン式サイドバー: 選択中の画面だけ子項目が開く）。
# 前提: calibrate.sh 済みで設定モーダルが開き、「チャット」が選択されている（t_chat を撮った直後の状態）。
#   選択中の画面が違う場合は PREV_Y / PREV_N をその画面の y と子の数に合わせる。
# 使い方: SHOTS=<出力ディレクトリ> capture_subpages.sh
# 座標は縮小画像（1280 幅）基準。y は全画面を畳んだときの各画面の位置、STEP は 1 行の高さ。
# 画面構成が変わったら 00_calibrate_s.png で読み直して SECTIONS を直す。撮影後は必ずパンくずを一覧化して着弾を確かめる。
set -u
S=$(cd "$(dirname "$0")" && pwd)/shot.sh
STEP=21.3
# name|畳んだときの y|子ごとのスクロール枚数（個数 = 子の数）
SECTIONS=(
  "02_model|83|0 1 3 2"
  "03_chat|104.3|0 0"
  "04_appearance|125.6|2 2 2 2 2 1"
  "05_workspace|146.9|2 2 2"
  "06_safety|168.2|2 2 2"
  "07_browser|189.5|1 1"
  "07v_vault|210.8|1 1"
  "08_memory|232.1|2 2"
  "09_voice|253.4|2 2 2"
  "10_advanced|274.7|2 2 2 2 2 2"
  "11_notifications|296|1 1"
  "12_billing|317.3|1 1"
  "13_providers|345.4|2 3 1 3"
  "14_gateway|366.7|2 2 1"
  "15_keybinds|388|4 0 0"
  "16_tools|409.3|3 2"
  "18_sessions|430.6|2 1"
)
PREV_Y=${PREV_Y:-104.3}; PREV_N=${PREV_N:-2}
for spec in $SECTIONS; do
  NAME=${spec%%|*}; REST=${spec#*|}; BASE=${REST%%|*}; PAGES=(${=REST#*|})
  # 上で開いている画面があれば、その子の数だけ下にずれた位置をクリックする
  if (( BASE > PREV_Y )); then CY=$(( BASE + STEP * PREV_N )); else CY=$BASE; fi
  $S "${NAME}_a" 130 $CY ${PAGES[1]} 980,350 || exit 1
  for j in $(seq 2 ${#PAGES}); do
    $S "${NAME}_$(printf "\\x$(printf %x $((96 + j)))")" 140 $(( BASE + STEP * j )) ${PAGES[$j]} 980,350 || exit 1
  done
  PREV_Y=$BASE; PREV_N=${#PAGES}
done
# プラグイン（設定ページを持つプラグインが無ければ子なし）と情報
$S 17_plugins_a 130 $(( 458.4 + STEP * PREV_N )) 1 980,350 || exit 1
$S 19_about_a 130 487.4 2 980,350 || exit 1
$S 19_about_b 140 $(( 487.4 + STEP * 2 )) 1 980,350 || exit 1
echo ALL DONE
