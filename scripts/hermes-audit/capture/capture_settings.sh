#!/bin/zsh
# 設定 18 画面＋サブビュー＋スクロール系列を撮る。前提: calibrate.sh 済み（ウィンドウ (40,40) 1420x900、内蔵ディスプレイ 1512x982 論理、設定モーダルが開いている）。
# 使い方: capture_settings.sh <出力ディレクトリ>
# 座標は論理 px。ウィンドウ幾何が違えば calibrate の画像から再計算する（縮小画像 1280px 幅 → 論理 = 縮小 x 1.18125）。
set -u
OUT=${1:?}; D=$(dirname "$0")
X=183; CLOSE_X=1379; CLOSE_Y=116   # サイドバー x / モーダル ✕
# サイドバー項目 y（畳んだ状態）。サブビュー展開時は下の項目が 33px ずつずれる
typeset -A Y=(model 119 chat 152 appearance 185 workspace 218 safety 251 browser 284 memory 317 voice 350 advanced 383 notifications 416 billing 449 providers 494 gateway 527 keybinds 560 tools 593 plugins 626 archived 659 about 703)
cap(){ screencapture -x -D 1 "$OUT/$1.png"; sips -Z 1280 "$OUT/$1.png" --out "$OUT/${1}_s.png" >/dev/null; }
front(){ [ "$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true')" = "Hermes" ] || { echo "Hermes が前面でない。中断"; exit 1; }; }
scroll(){ uv run --quiet --with pyobjc-framework-Quartz python "$D/scroll.py" "$1" -10; }
shoot(){ # name y pages
  front; cliclick c:$X,$2; sleep 1.3; cap "${1}_0"; cliclick m:800,760; sleep 0.2
  for i in $(seq 1 $3); do scroll 60; sleep 0.7; cap "${1}_$i"; done
}
shoot 02_model $Y[model] 3
shoot 03_chat $Y[chat] 1
shoot 04_appearance $Y[appearance] 8
shoot 05_workspace $Y[workspace] 1
shoot 06_safety $Y[safety] 2
shoot 07_browser $Y[browser] 0
shoot 08_memory $Y[memory] 2
shoot 09_voice $Y[voice] 2
shoot 10_advanced $Y[advanced] 3
shoot 11_notifications $Y[notifications] 1
shoot 12_billing $Y[billing] 1
shoot 14_gateway $Y[gateway] 2
shoot 15_keybinds $Y[keybinds] 3
shoot 17_plugins $Y[plugins] 1
shoot 18_archived $Y[archived] 1
shoot 19_about $Y[about] 1
# プロバイダー（展開: アカウント +33 / API キー +66 / カスタム +99 / ローカルモデル +132 は --local 起動時のみ）
shoot 13_providers $Y[providers] 1
cliclick c:$X,$(($Y[providers]+33)); sleep 1.3; cap 13a_accounts_0
cliclick c:$X,$(($Y[providers]+66)); sleep 1.3; cap 13b_apikeys_0
cliclick c:$X,$(($Y[providers]+99)); sleep 1.3; cap 13c_custom_0
cliclick c:$X,$(($Y[providers]+132)); sleep 2; cap 13d_local_0; cliclick m:800,760; scroll 60; sleep 0.7; cap 13d_local_1
# ツールとキー（プロバイダー展開分 +99 または +132 を加味。--local なら 132）
SHIFT=99; [ -n "${HERMES_LOCAL:-}" ] && SHIFT=132
cliclick c:$X,$(($Y[tools]+SHIFT)); sleep 1.3; cap 16_tools_0; cliclick m:800,760; for i in 1 2 3; do scroll 60; sleep 0.7; cap 16_tools_$i; done
cliclick c:$X,$(($Y[tools]+66)); sleep 1.3; cap 16b_toolsettings_0; cliclick m:800,760; scroll 60; sleep 0.7; cap 16b_toolsettings_1
cliclick c:$X,$(($Y[about]+66)); sleep 1; cap 19_about_x
cliclick c:$CLOSE_X,$CLOSE_Y; sleep 0.8
echo "settings done: $(ls "$OUT"/*_s.png | wc -l) files"
