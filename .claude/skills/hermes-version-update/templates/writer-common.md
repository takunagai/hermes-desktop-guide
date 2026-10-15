# 執筆エージェント共通前提（{{VERSION}} 反映）

> 雛形。Phase 0〜3 の確定値で書き換え、scratchpad にコピーして各 writer に渡す。前回（v0.22.1、2026-10-15）の値を例として残してある。SP の絶対パスはセッションごとに変わる。

SP = {{SCRATCHPAD}}
リポジトリ = このガイドのリポジトリルート（正本は vault/）

## 確定事実
- 実機: Hermes Desktop / Hermes Agent **v0.22.1**（タグ v0.22.1、2026-10-14 リリース。直前の大型版は v0.22.0「The Threshold Release」2026-10-14）。実機コミット `297552a9`（完全 `297552a9d646119871391d202509822cd86330df`）= タグ v0.22.1 と同一。`_config_version` 39→51。前回監査は v0.21.0 / `c5c9aa8d`（2026-09-02）。監査日 2026-10-15。
- 中間リリース v0.21.1〜v0.21.7（v2026.9.7 / 9.11 / 9.14 / 9.21 / 9.24 / v0.21.6 / v0.21.7）の内容は v0.22.0 に統合。v0.22.2（2026-10-15）は対象外（実機は v0.22.1）。
- 設定サイドバーは **19 画面**。新設は「パスワードとログイン」1 画面。各画面はサイドバーの**子項目（サブページ）**を持つアコーディオン式になった（選択中の画面だけ子項目が開き、画面を開くと先頭の子が表示される）。順と子項目:
  1 モデル（メインモデル / 代替モデル / 補助モデル / エージェントの協調）
  2 チャット（動作 / 添付ファイル）
  3 外観（一般 / テーマ / フォントと表示倍率 / ウィンドウとレイアウト / チャット表示 / ペット）
  4 ワークスペース（プロジェクトと検出 / シェル環境 / ファイルと実行）
  5 安全性（承認 / プライバシーとネットワーク / チェックポイント）
  6 Browser ※英語表記のまま（ブラウザープロファイル / ローカル・プライベート URL）
  7 パスワードとログイン【新設】（保存済みの認証情報 / パスワードマネージャー）
  8 メモリとコンテキスト（永続メモリ / コンテキストと圧縮）
  9 音声（音声会話 / 音声認識 / 音声合成）
  10 詳細（デスクトップと起動 / エージェントの制限 / ツールへのアクセス / ターミナルのバックエンド / サブエージェント / 出力の制限）
  11 通知（デスクトップ通知 / サウンド）
  12 請求（概要 / プラン ※プランは条件付き）
  ─ 区切り ─
  13 プロバイダー（アカウント / API キー / カスタムエンドポイント / ローカルモデル）
  14 ゲートウェイ（このウィンドウ / 保存済みの接続 / リモート更新）
  15 キーボードショートカット（キー割り当て / HUDジェスチャー / 画面キャプチャ）
  16 ツールとキー（ツール / 設定）
  17 セッション ※旧「アーカイブ済みチャット」から改名（アーカイブと保持 / 既定のプロジェクトフォルダー）
  ─ 区切り ─
  18 プラグイン ※旧「Plugins」が日本語化。役割が変わり、各プラグインの設定ページの入口（設定を持つプラグインの子項目が並ぶ）。プラグインの一覧・有効化・インストールは「スキルとツール > Plugins」タブへ移った
  ─ 区切り ─
  19 情報（バージョンと更新 / アンインストール）
- ローカルモデルは macOS / Windows / Linux（x64・arm64）では `--local` なしで常に表示（実機確認済み）。それ以外の環境だけ `--local` が要る。
- 「オンボーディングをもう一度実行」は 詳細 > デスクトップと起動（実機確認）。
- メインナビ: 新しいセッション / スキルとツール / メッセージング / アーティファクト / スケジュール済みジョブ（+ カンバン有効時はカンバン）。インターフェースモードが「シンプル」ならアーティファクトとスケジュール済みジョブは非表示。サイドバー上部タブは「セッション / ボット / ターミナル」。
- スキルとツール（ルート /capabilities）のタブ: スキル / ツールセット / Connectors / Plugins（Connectors と Plugins は英語表記）。MCP は独立ページでも設定内でもなく **Connectors タブ**の中（ホスト型アプリとローカル MCP サーバーが 1 つの一覧）。
- 実機で確認できた事実の正本: `SP/report-G-shots-verified.md`（書き起こし・照合表・食い違い 7 件）。ソース差分レポート（すべて SP 配下）:
  - report-A1.md（サイドバー構成・モデル・ローカルモデル）/ report-A2.md（プロバイダー・API キー・カスタムエンドポイント・ツールセット・接続）
  - report-B1.md（外観・チャット・詳細）/ report-B2.md（メモリ・音声・パスワードとログイン・セッション・Browser・適用対象チップ）
  - report-C1.md（ゲートウェイ・キーボードショートカット全アクション表・通知）/ report-C2.md（プラグイン・請求・情報・アンインストール・設定内検索）
  - report-D.md（既定値差分・スラッシュコマンド差分）+ diff-defaults.txt / defaults-new.json / diff-commands.txt
  - report-E1.md（メイン UI・インターフェースモード・初回オンボーディング・コンポーザー）/ report-E2.md（Capabilities・MCP・ボット・カンバン・cron・プロファイル）
  - report-F.md（vault 各ページの現状と陳腐化しうる主張）
  - リリースノート: release-v0.22.0.md / release-v0.22.1.md / release-v0.21.6.md / release-v0.21.7.md / release-v2026.9.*.md
- 食い違いの裁定（report-G 優先）: 情報の詳細表に Runtime 行は無く Channel は「チャンネル」表示 / アンインストールのカード見出しは「Hermes をアンインストール」 / 保存済みの接続は見出しなしで英語の説明文から始まる / Capabilities > Plugins は Agent・Desktop を 1 つの表にバッジと 2 列トグルで並べ、「Git からインストール」ボタンと説明文は日本語、カタログ部分は英語 / Connectors のフィルタは「All / On this device / Available」/ ローカルモデルの hero は説明と「Set up for me」が英語、「自分で選ぶ」は日本語 / ボットのタブ名は「ボット」、一覧見出しは「BOTS」。cron 左列の区分見出しは実機で「ブレーンプリント」（誤字。正しくは「ブループリント」）。
- リリースノートとソースが食い違えばソース・実機を優先。ソース確認が要るなら ~/.hermes/hermes-agent を**読み取りのみ**（`export GIT_NO_LAZY_FETCH=1` を付ける。partial clone のため。fetch / checkout / 変更は厳禁）。

## 編集ルール
- 正本は `vault/`。`src/content/docs/` は触らない。既存ページは Edit（部分置換）。Write は新規ページのみ。
- 触ったページの frontmatter を `hermes_version: 0.22.1` / `hermes_commit: '297552a9'`（引用符必須・8 桁）/ `verified: '2026-10-15'` に更新。`status` は実機またはソースで確認できたら `verified`。
- **各ページ本文に版数（v0.22.1 等）を書かない**。「v0.22 で追加」等は禁止。変更の記録は `06_リファレンス/04_変更履歴.md` に集約（担当 W4）。本文は現在の最新版の解説に徹する。
- サイドバーの子項目化に合わせ、設定ページは原則「子項目ごとに H2」で構成し、冒頭で子項目の一覧を示す。サブページ名は実機の日本語表記どおり。
- 表記: ダッシュは `─`（U+2500）1 個、丸数字禁止、em ダッシュ禁止（UI 文言の引用に含まれる場合のみ可）。日本語 UI でも英語のままの項目は英語表記のまま書き「日本語リソース未整備のため英語表示」と注記。
- config キーと既定値は defaults-new.json / report-D.md で裏取りしてから書く。
- ユーザー固有の値（IP・URL・残高・セッション名・cron 名・パス・ボット名・認証情報）は書かない。
- WikiLink はパス付き。新規ページ: `vault/03_設定/20_パスワードとログイン.md`（slug `settings/passwords`、sidebar.order 7、sidebar.label `パスワードとログイン`。W1 が作成）。WikiLink は `[[03_設定/20_パスワードとログイン|パスワードとログイン]]`。
- 既存ページのファイル名・slug は変えない（`13_アーカイブ済みチャット.md` は slug `settings/archived-chats` のまま、title と本文を「セッション」に改める）。sidebar.order は親が再採番済み（触らない）。
- スクリーンショット: 加工済み WebP を別エージェントが `src/assets/screenshots/` に生成中。参照記法 `![設定 > モデル 画面](@screenshots/settings-models.webp)`。主画像は冒頭の説明段落の直後・最初の H2 の前、子項目の画像はその H2 の直下。下の名前表以外は参照しない。alt は「設定 > 外観 > テーマ 画面」のように画面名で。

### 画像名の表（出力名 ← 写っている画面）
| 出力名 | 画面 |
|---|---|
| settings-models | モデル > メインモデル |
| settings-models-auxiliary | モデル > 補助モデル |
| settings-chat | チャット > 動作 |
| settings-appearance | 外観 > 一般 |
| settings-appearance-theme | 外観 > テーマ |
| settings-appearance-window | 外観 > ウィンドウとレイアウト |
| settings-workspace | ワークスペース > プロジェクトと検出 |
| settings-security | 安全性 > 承認 |
| settings-browser | Browser > ブラウザープロファイル |
| settings-passwords | パスワードとログイン > 保存済みの認証情報 |
| settings-passwords-managers | パスワードとログイン > パスワードマネージャー |
| settings-memory-context | メモリとコンテキスト > 永続メモリ |
| settings-voice | 音声 > 音声会話 |
| settings-advanced | 詳細 > デスクトップと起動 |
| settings-notifications | 通知 > デスクトップ通知 |
| settings-billing | 請求 > 概要 |
| settings-providers | プロバイダー > アカウント |
| settings-providers-apikeys | プロバイダー > API キー |
| settings-providers-local | プロバイダー > ローカルモデル |
| settings-gateway | ゲートウェイ > このウィンドウ |
| settings-gateway-registered | ゲートウェイ > 保存済みの接続 |
| settings-keybinds | キーボードショートカット > キー割り当て |
| settings-keybinds-hud | キーボードショートカット > HUDジェスチャー |
| settings-keybinds-capture | キーボードショートカット > 画面キャプチャ |
| settings-tools-keys | ツールとキー > ツール |
| settings-tools-settings | ツールとキー > 設定 |
| settings-plugins | プラグイン（概要） |
| settings-archived-chats | セッション > アーカイブと保持 |
| settings-about | 情報 > バージョンと更新 |
| settings-about-uninstall | 情報 > アンインストール |
| main-sidebar | メイン画面全体 |
| bots-tab | ボット タブ |
| bots-menu | ボットの＋メニュー（新しいボット / 新しいグループチャット / 新しいセクション） |
| cron-jobs | スケジュール済みジョブ |
| skills-tools | スキルとツール > スキル |
| skills-toolset | スキルとツール > ツールセット |
| skills-connectors | スキルとツール > Connectors |
| skills-plugins | スキルとツール > Plugins |
| messaging | メッセージング |
| kanban | カンバン |
- 廃止する画像（参照を外す）: `settings-appearance-translucency`（透過設定は外観 > ウィンドウとレイアウトへ。settings-appearance-window を使う）、`skills-mcp`（skills-connectors に置換）。`bots-create` は旧版の画面なので、参照している場合は残すか外すかを判断し返答で報告。

## 公開基準
手順には前提・操作・期待結果・失敗時の確認先。未確認内容は `status: needs-review` にするか書かない。ページ本文に H1 を書かない。

## 返答様式（40 行以内）
編集したファイル一覧 / 各ファイルの変更要点 1〜3 行 / 追加・変更した画像参照 / 未確認・判断保留（親に聞きたいこと）
