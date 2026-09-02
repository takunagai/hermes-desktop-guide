# 執筆エージェント共通前提（{{VERSION}} 反映）

> 雛形。`{{...}}` を Phase 0〜3 の確定値で埋め、scratchpad にコピーして各 writer に渡す。前回（v0.21.0）の値を例として残してある。

## 確定事実
- 実機: Hermes Desktop / Hermes Agent **v0.21.0**（2026.8.31、リリース名「The Pantheon Release」）。実機コミット `c5c9aa8d`（完全 `c5c9aa8d44e03f4e8b5fe7f230cfd97ab2dde0bf`）。監査中の自動更新で `18029116` から進んだため再ピンした値で、vault 全ページのピンもこれに揃っている。リリースタグ `v2026.8.31`（タグ先コミット `29112bef`）は HEAD の祖先で、実機 main はタグより 297 コミット先行。`_config_version` 34→39。前回監査 v0.20.0 コミット `3bd844ed`（2026-08-11）。監査日 2026-09-02。
- 中間タグ v0.20.1〜v0.20.6（v2026.8.13 / 8.16 / 8.16.2 / 8.18 / 8.19 / 8.27）はインフラパッチで、内容は v0.21.0 ノートに統合。
- 設定サイドバーは **18 画面**（順: モデル / チャット / 外観 / ワークスペース / 安全性 / Browser / メモリとコンテキスト / 音声 / 詳細 / 通知 / 請求 / プロバイダー（サブ: アカウント・API キー・カスタムエンドポイント・ローカルモデル[--local 起動時のみ]）/ ゲートウェイ / キーボードショートカット / ツールとキー（サブ: ツール・設定）/ Plugins / アーカイブ済みチャット / 情報）。Browser と Plugins は日本語 UI でも英語表記。
- F12 無効化トグルは **詳細** 画面（「PC をスリープさせない」の直下）。安全性画面には「プライベート URL を許可」が**残っている**（Browser 画面の項目とは別行）。
- 実機で確認できた事実の正本: `report-G-shots-verified.md`。ソース差分: `report-A-nav-model-providers.md`（ナビ・モデル・プロバイダー・ツールとキー）、`report-B-appearance-chat-advanced.md`（外観・チャット・詳細・プロファイルスコープ・Browser）、`report-C-gateway-keybinds-plugins.md`（ゲートウェイ・キーバインド・プラグイン・情報）、`report-D-defaults-commands.md` + `diff-output.txt`（既定値差分・スラッシュコマンド）、`report-E-desktop-nonsettings.md`（Bot Mode・MCP・cron・ブラウザ操作）、`report-F-vault-page-map.md`（各ページの現状）、`release-v0.21.0.md`（公式ノート）。すべて {{SCRATCHPAD}}/ 配下。
- リリースノートとソースが食い違う場合は**ソース・実機を優先**（例: ターミナルペットはデスクトップでは v0.20.0 から存在）。
- ソースの追加確認が必要なら /Users/takna/.hermes/hermes-agent を**読み取りのみ**で参照（git fetch / checkout / 変更は厳禁）。

## 編集ルール
- 正本は `vault/`。`src/content/docs/` は触らない。既存ページは Edit（部分置換）で編集し、Write で丸ごと書き直さない。新規ページのみ Write。
- 触ったページの frontmatter を `hermes_version: 0.21.0` / `hermes_commit: 'c5c9aa8d'`（引用符必須・8 桁。7 桁や引用符なしは YAML が数値化しうる）/ `verified: '2026-09-02'` に更新。`status` は実機またはソースで確認できたら `verified`。
- **各ページ本文に版数（v0.21.0 等）を書かない**。「v0.21.0 で追加」のような記述は禁止。変更の記録は `06_リファレンス/04_変更履歴.md` に集約する（担当 W4）。本文は「現在の最新版の解説」に徹する。
- 表記: ダッシュは `─`（U+2500）1 個、丸数字禁止、em ダッシュ禁止。UI ラベルは実機の日本語表記どおり。日本語 UI でも英語のままの項目は英語表記のまま書き「日本語リソース未整備のため英語表示」と注記。
- config キー（例 `browser.use_real_profile`）と既定値は `defaults-new.json` / `diff-output.txt` で裏取りしてから書く。
- ユーザー固有の値（IP・URL・残高・セッション名・cron 名・パス）は書かない。
- WikiLink はパス付き `[[03_設定/19_Browser|Browser]]` 形式。新規ページの正式ファイル名: `vault/03_設定/19_Browser.md`（slug `settings/browser`、sidebar.order 6、sidebar.label `Browser`）と `vault/07_ダッシュボード/04_ボット.md`（slug `dashboard/bots`、sidebar.order 4）。
- スクリーンショット: `src/assets/screenshots/` に加工済み WebP が別エージェントで生成中。参照記法 `![設定 > モデル 画面](@screenshots/settings-models.webp)`。配置位置は、ページ冒頭の説明段落（既存の `@editorial` 画像があればその後）の直後・最初の H2 の前。利用可能名: settings-models / settings-chat / settings-appearance / settings-workspace / settings-security / settings-browser / settings-memory-context / settings-voice / settings-advanced / settings-notifications / settings-billing / settings-providers / settings-gateway / settings-gateway-registered / settings-keybinds / settings-tools-keys / settings-plugins / settings-archived-chats / settings-about / main-sidebar / bots-tab / cron-jobs / skills-tools。`src/assets/screenshots/manifest.md` が存在すればそれを正とし、存在しないファイル名は参照しない（後で親が検証する）。alt は「設定 > 外観 画面」のように画面名で。画像下に 1 行「表示値は環境依存の例。」等の注記は既存ページの慣例に従う。
- 公開基準: 手順には前提・操作・期待結果・失敗時の確認先。未確認内容は `status: needs-review` にするか書かない。

## 返答様式（40 行以内）
編集したファイル一覧 / 各ファイルの変更要点 1〜3 行 / 追加した画像参照 / 未確認・判断保留（親に聞きたいこと）
