# スクリーンショット一覧（Hermes Desktop v0.21.0）

原寸 1920x1080 の実機キャプチャから、設定モーダル（原寸 x331-1877 / y52-1037）または
アプリウィンドウ全体（原寸 x288-1920 / y25-1080）を切り出し、ユーザー固有の値を
背景色の単色矩形でマスクしたうえで `cwebp -q 85` で WebP 化したもの。

| 出力ファイル | 元画像 | 写っている画面 | マスクした箇所 | 推奨 alt テキスト |
|---|---|---|---|---|
| settings-models.webp | 02_model.png | 設定 > モデル（適用対象・補助モデル・Mixture of Agents） | なし | 設定 > モデル 画面 |
| settings-chat.webp | 03_chat.png | 設定 > チャット | なし | 設定 > チャット 画面 |
| settings-appearance.webp | 04_appearance.png | 設定 > 外観（言語・テーマ・UI スケール） | なし | 設定 > 外観 画面 |
| settings-workspace.webp | 05_workspace.png | 設定 > ワークスペース | なし（作業ディレクトリは `./Projects/Hermes` の相対パスでユーザー名を含まないため保持） | 設定 > ワークスペース 画面 |
| settings-security.webp | 06_safety.png | 設定 > 安全性（承認モード・許可リスト） | なし | 設定 > 安全性 画面 |
| settings-browser.webp | 07_browser.png | 設定 > Browser | なし | 設定 > Browser 画面 |
| settings-memory-context.webp | 08_memory.png | 設定 > メモリとコンテキスト | なし | 設定 > メモリとコンテキスト 画面 |
| settings-voice.webp | 09_voice.png | 設定 > 音声 | なし | 設定 > 音声 画面 |
| settings-advanced.webp | 10_advanced.png | 設定 > 詳細（実行バックエンド・各種上限） | なし | 設定 > 詳細 画面 |
| settings-notifications.webp | 11_notifications.png | 設定 > 通知 | なし | 設定 > 通知 画面 |
| settings-billing.webp | 39_billing_1.png | 設定 > 請求（Billing / Plan / Payment & credits / Usage） | 残高、プラン名と月額、自動リフィル、プラン更新日、使用量の 3 数値とリセット日 | 設定 > 請求 画面 |
| settings-providers.webp | 13_providers.png | 設定 > プロバイダー > アカウント（接続済みプロバイダー一覧） | なし（メールアドレス・アカウント名は元画像に写っていない） | 設定 > プロバイダー 画面 |
| settings-gateway.webp | 17_plugins.png | 設定 > ゲートウェイ（接続モード・リモート URL・登録済みゲートウェイ） | リモート URL の IP、登録済みゲートウェイの IP とアドレス行 | 設定 > ゲートウェイ 画面 |
| settings-gateway-registered.webp | 36_gateway_1.png | 設定 > ゲートウェイ（スクロール後・認証済み状態） | リモート URL の IP、登録済みゲートウェイの IP とアドレス行 | 設定 > ゲートウェイ 画面の登録済みゲートウェイ一覧 |
| settings-keybinds.webp | 20_keybinds.png | 設定 > キーボードショートカット | なし | 設定 > キーボードショートカット 画面 |
| settings-tools-keys.webp | 20_tools.png | 設定 > ツールとキー > ツール（外部サービスの API キー欄） | なし（全欄が未入力のプレースホルダ表示） | 設定 > ツールとキー 画面 |
| settings-plugins.webp | 41_plugins_0.png | 設定 > Plugins（Desktop plugins / Agent plugins） | なし | 設定 > Plugins 画面 |
| settings-archived-chats.webp | 18_archived.png | 設定 > アーカイブ済みチャット | デフォルトのプロジェクトディレクトリの絶対パス 2 行（ユーザー名を含む） | 設定 > アーカイブ済みチャット 画面 |
| settings-about.webp | 19_about.png | 設定 > 情報（バージョン・更新・Danger zone） | なし | 設定 > 情報 画面 |
| main-sidebar.webp | 50_main.png | メイン画面（SESSIONS タブ・左サイドバー・右ペイン） | セッション一覧のタイトルと日付、CRON ジョブ名と実行予定、右ペインのファイル木 | Hermes Desktop のメイン画面とサイドバー |
| bots-tab.webp | 51_bots.png | メイン画面 BOTS タブ | 右ペインのファイル木 | Hermes Desktop の BOTS タブ |
| cron-jobs.webp | 52_cron.png | スケジュール済みジョブ（ジョブ詳細とブループリント一覧） | ジョブ名（一覧・検索欄・詳細見出し）、前回／次回の実行日時、エラー文、プロンプト本文、実行履歴、背景に透ける左サイドバー | スケジュール済みジョブ 画面 |
| skills-tools.webp | 53_skills.png | スキルとツール（Skills Hub ブラウザ） | セッション一覧、CRON ジョブ、右ペインのファイル木 | スキルとツール 画面 |

## 未生成

- `settings-providers-apikeys.webp` — 指定元の `43_providers_apikeys.png` は設定 > 詳細（Advanced）画面であり、
  プロバイダーの API キー画面ではないためスキップ。プロバイダー > API キー タブのキャプチャは入力素材に存在しない。
