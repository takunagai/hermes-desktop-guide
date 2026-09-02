#!/bin/zsh
# メイン画面系（サイドバー / スケジュール済みジョブ / スキルとツール 3 タブ / メッセージング / BOTS 名簿・＋メニュー・新しいボット）を撮る。
# 前提: calibrate.sh と同じウィンドウ幾何、設定モーダルは閉じている。cron モーダルの ✕ は幾何依存なので 52_cron_s.png を見て CRON_CLOSE を渡す。
# 使い方: CRON_CLOSE="x,y" capture_main.sh <出力ディレクトリ>
set -u
OUT=${1:?}; D=$(dirname "$0")
cap(){ screencapture -x -D 1 "$OUT/$1.png"; sips -Z 1280 "$OUT/$1.png" --out "$OUT/${1}_s.png" >/dev/null; }
front(){ [ "$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true')" = "Hermes" ] || { echo "Hermes が前面でない。中断"; exit 1; }; }
NAV_X=136; NAV_SKILLS=162; NAV_MESSAGING=194; NAV_CRON=258
TAB_SESSIONS="76,93"; TAB_BOTS="135,93"; TAB_SKILL="680,102"; TAB_TOOLSET="774,102"; TAB_MCP="854,102"; BOTS_PLUS="330,132"; BOTS_MENU_NEW="224,168"
front; cliclick c:$TAB_SESSIONS; sleep 0.8; cap 50_main
cliclick c:$NAV_X,$NAV_CRON; sleep 1.8; cap 52_cron
[ -n "${CRON_CLOSE:-}" ] && { cliclick c:$CRON_CLOSE; sleep 0.8; } || { echo "CRON_CLOSE 未指定: 52_cron_s.png で ✕ を実測して再実行"; exit 1; }
cliclick c:$NAV_X,$NAV_SKILLS; sleep 3; cap 53_skills
cliclick c:$TAB_TOOLSET; sleep 2.5; cap 57_toolset
cliclick c:$TAB_MCP; sleep 2.5; cap 56_mcp; cliclick m:760,300; uv run --quiet --with pyobjc-framework-Quartz python "$D/scroll.py" 60 -10; sleep 0.8; cap 56_mcp_1
cliclick c:$NAV_X,$NAV_MESSAGING; sleep 2.5; cap 54_messaging
cliclick c:$TAB_BOTS; sleep 1.5; cap 51_bots
cliclick c:$BOTS_PLUS; sleep 1.2; cap 51_bots_menu
cliclick c:$BOTS_MENU_NEW; sleep 1.8; cap 51_bots_create; cliclick kp:esc; sleep 0.8; cliclick kp:esc; sleep 0.5
cliclick c:$TAB_SESSIONS; sleep 0.8; cap 60_end
echo "main done"
