# 委譲プロンプト雛形

`{{OLD}}` = 前回監査コミット、`{{NEW}}` = 今回の実機コミット、`{{SCRATCHPAD}}` = セッションの scratchpad。全プロンプトの末尾に「予算」ブロックを付ける（`rules/delegation-budget.md`）。

## 共通の冒頭（全エージェント）

```
対象リポジトリ: /Users/takna/.hermes/hermes-agent（ユーザーの実機チェックアウト。**絶対に git fetch / pull / checkout / reset / stash / ファイル変更をしない**。読み取り専用: `git show OLD:path`、`git diff OLD..NEW -- path`、cat、grep のみ）
OLD={{OLD}}（前回監査）、NEW={{NEW}}（今回、HEAD＝作業ツリーと同一）
出力: 詳細レポートを {{SCRATCHPAD}}/report-<名前>.md に Bash ヒアドキュメントで保存し（Write が拒否されることがある）、返答は 40 行以内のサマリ（結論 / 主要差分 1 行ずつ / 未確認）。根拠は path:line 付き、確信度（高/中/低）付き。日本語。
```

```
--- 予算 ---
打ち切り: 同一検索 3 回空振り、または対応付けが 200 項目を超えたら残りは「未対応付け」として列挙し中間結果を返す。
返却: 結論 + 根拠（path:line + 判定）+ 未確認。raw dump 禁止。
未達時: 調べた範囲 / 空振りした検索語 / 判断できない理由 / 親に聞きたいこと の 4 点で返す。
禁止: 未確認の推測を確定形で書かない。スコープ外へ広げない。リポジトリを変更しない。
```

## 調査（Phase 1、general-purpose / opus。D・F は sonnet / explorer）

**A ナビ + モデル / プロバイダー / ツールとキー**
```
担当: (1) `apps/desktop/src/app/settings/index.tsx` と `apps/desktop/src/i18n/ja.ts` の `settings.nav` / `settings.sections` を OLD/NEW で比較し、NEW のサイドバー画面一覧（表示順・日本語ラベル・id・サブビュー）と差分を確定。前回は {{N_SCREENS}} 画面。(2) model-settings / fallback-models-field / providers-settings / local-models-settings / custom-endpoints-settings / connections-registry / credential-key-ui / keys-settings / env-credentials / toolset-config-panel / constants.ts / field-copy.ts / helpers.ts の項目差分（追加 / 削除 / 改名・移動 / 既定値変更 / ja.ts に訳が無く英語のままの項目）。項目名は ja.ts の日本語ラベルと config キーを対にする。
```

**B 外観 / チャット / 詳細 / メモリ / 音声 / スコープ**
```
担当: appearance-settings / config-settings（どの画面を描画しているか確認）/ quick-entry-settings / pet-settings / memory/ / sessions-settings / terminal-font-setting / computer-use-panel / terminal-backend-panel / browser-real-profile-panel / voice-provider-fields / primitives / config-field / profile-scope。新規ファイルは「何を設定する画面か・どのサイドバー画面に属するか」を確定。
```

**C ゲートウェイ / キーバインド / プラグイン / 情報 / 横断**
```
担当: gateway-settings（連携プラットフォーム一覧の増減を含む）/ ssh-host-selection / keybind-settings / notifications-settings / billing/ / about-settings / plugins-settings / plugin-install-modal / managed-updates-section / uninstall-section / settings-search / use-settings-search / use-deep-link-highlight / types.ts。キーバインド既定の正本 `apps/desktop/src/lib/keybinds/actions.ts` の差分も列挙。横断機能（設定内検索・ディープリンク・管理型更新）の所在と機能を確定。
```

**D 既定値・コマンド機械比較**（Phase 0 の `diff-defaults.txt` / `diff-commands.txt` を渡し、意味的分類と重要変更 top 20 の抽出だけをさせる。Phase 0 で十分なら省略）

**E 設定以外のデスクトップ変更**
```
{{SCRATCHPAD}}/release-<tag>.md を先に読む。`git diff OLD..NEW --stat -- apps/desktop/src` から settings/ を除いた新規ディレクトリ・主要ビュー、メインナビ（`app/chat/sidebar/`）の構成差分と日本語ラベル、リリースノートの Desktop / Highlights 各項目の UI 所在（画面名・日本語ラベル・操作）を「ソースで確認 / ノートのみ / 食い違う」で判定。MCP の所在（独立ページ化の有無）も確認。
```

**F vault 現状マップ**（explorer）
```
`vault/` 配下の全 Markdown を読み、ページごとに `path | slug | 扱う画面 | 陳腐化しうる具体的主張 最大 5 | verified / hermes_version` を 1 行で。複数ページに跨る横断的主張（画面数・既定値・タブ構成）を集約。
```

## 照合（Phase 3、general-purpose / opus）

```
{{SCRATCHPAD}}/shots/*_s.png（縮小。判読しにくければ原寸）を読み、画面ごとに設定項目名・選択肢・説明文の要点を書き起こす。ユーザー固有値（URL・IP・モデル名・残高・セッション名・cron 名・ボット名）は書き起こさず「ユーザー値」と書く。レポート A/B/C/E の主張と突き合わせ「実機で確認できた / 写っていない / 食い違う」を判定。特に: サイドバーの順序とラベル、新設画面の項目、トグルの所在が割れた項目、メインナビ、タブ構成。ファイル名の対応: <撮影スクリプトの命名を列挙>。出力 report-G-shots-verified.md（書き起こし + 照合表 + 未確認一覧）。
```

第 2 弾（未確認項目の裏取り）では、対象ページの本文で「実機未確認」「ソース確認」と注記された箇所を列挙させ、**具体的な修正指示（ページ・該当行の引用・正しい記述）**を返させる。

## 執筆（Phase 4、hermes-docs-writer ×5）

冒頭で必ず `{{SCRATCHPAD}}/writer-common.md` を読ませる。担当分けの例（v0.21.0）:

| 名前 | 担当ページ |
|---|---|
| W1 | 03_設定/01_モデル・09_プロバイダー・11_ツールとキー・12_MCP・05_安全性 + 新設設定ページ |
| W2 | 03_設定/02_チャット・03_外観・04_ワークスペース・06_メモリ・07_音声・08_詳細・13_アーカイブ |
| W3 | 03_設定/10_ゲートウェイ・14_情報・15_通知・16_請求・17_ショートカット・18_プラグイン、02_基本操作/03 |
| W4 | 06_リファレンス 01〜05（変更履歴の新節・調査根拠の新節・索引の画面数）+ 00_ホーム（設定リンクとアイコン、memory `settings-icons-from-tabler`） |
| W5 | 07_ダッシュボード + 新設ダッシュボードページ、08_連携、09〜11（report-F の陳腐化リストだけを修正、他は frontmatter のみ） |

各プロンプトには「ページごとに何を反映するか」を report の要点で箇条書きし、画像名を指定する。返答様式は共通前提のとおり。

## 加工（Phase 5、general-purpose / opus）

```
{{SCRATCHPAD}}/shots/ の原寸 PNG を Read で内容確認し、対応表（元 → 出力名）に従って `scripts/hermes-audit/crop_mask.py` 用の jobs.json（切り出し矩形・マスク矩形、原寸 px）を作って実行。出力先 src/assets/screenshots/、それ以外は変更しない。切り出し: 設定モーダルの外接矩形（検索ピル含む）/ メイン画面はウィンドウ全体。マスク: <SKILL.md Phase 5 の必須一覧>。ラベル・説明文・既定値・ボタン・タブ名・公開サービス名は残す。迷う値は塗る。manifest.md（出力 | 元 | 画面 | マスク箇所 | alt）を更新。返答は一覧とサイズ、スキップ、マスク要約、未確認。
```
