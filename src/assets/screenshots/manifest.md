# スクリーンショット一覧（Hermes Desktop v0.21.0 / Retina 2x）

Retina 実機キャプチャ（第 2 弾）から切り出したもの。設定画面は設定モーダルの外接矩形
（検索ピルを含む。3060x1942 px）、メイン画面系はアプリウィンドウ全体
（3264x2110 px または 2840x1800 px）。ユーザー固有の値を背景色に近い単色矩形でマスクし、
`cwebp -q 85` で WebP 化した。幅は 2x のまま（表示時は CSS で 1x 相当に縮める前提）。

| 出力ファイル | 元画像 | 写っている画面 | マスクした箇所 | 推奨 alt テキスト |
|---|---|---|---|---|
| settings-models.webp | 02_model_0.png | 設定 > モデル（適用対象・メインモデル・補助モデル） | 適用対象チップ（`default` 以外）、プロバイダーとモデルの選択値、補助モデルの割り当て値 4 件 | 設定のモデル画面 |
| settings-chat.webp | 03_chat_0.png | 設定 > チャット | 適用対象チップ（`default` 以外） | 設定のチャット画面 |
| settings-appearance.webp | 04_appearance_0.png | 設定 > 外観（言語・テーマ一覧・UI スケール） | なし | 設定の外観画面 |
| settings-appearance-translucency.webp | 04_appearance_1.png | 設定 > 外観（ウィンドウの透過。クリア／ガラス・色味・フェード・くもりの質感） | なし | 設定の外観画面のウィンドウ透過設定 |
| settings-workspace.webp | 05_workspace_0.png | 設定 > ワークスペース | 適用対象チップ、作業ディレクトリの絶対パス | 設定のワークスペース画面 |
| settings-security.webp | 06_safety_0.png | 設定 > 安全性（承認モード・コマンド許可リスト） | 適用対象チップ、コマンド許可リストの値 | 設定の安全性画面 |
| settings-browser.webp | 07_browser_0.png | 設定 > Browser | 適用対象チップ | 設定の Browser 画面 |
| settings-memory-context.webp | 08_memory_0.png | 設定 > メモリとコンテキスト | 適用対象チップ、右上に出ていた cron エラーのトースト通知 | 設定のメモリとコンテキスト画面 |
| settings-voice.webp | 09_voice_0.png | 設定 > 音声 | 適用対象チップ | 設定の音声画面 |
| settings-advanced.webp | 10_advanced_0.png | 設定 > 詳細（実行バックエンド・各バックエンドのイメージ・上限値） | 適用対象チップ | 設定の詳細画面 |
| settings-notifications.webp | 11_notifications_0.png | 設定 > 通知 | なし | 設定の通知画面 |
| settings-billing.webp | 12_billing_0.png | 設定 > 請求（Billing / Plan / Payment & credits / Usage） | 残高・プラン名と月額・自動リフィル、プランカード、更新日とリセット日、使用量の 3 数値 | 設定の請求画面 |
| settings-providers.webp | 71_providers_local.png | 設定 > プロバイダー > アカウント（「モデルをローカルで実行」行と接続済み一覧） | なし（公開サービス名のみ。ステータスバーとワークスペース名は設定モーダルの外側で写り込んでいない） | 設定のプロバイダー画面 |
| settings-providers-local.webp | 72_localmodels_0.png | 設定 > プロバイダー > ローカルモデル（ローカルランタイムのインストール・このマシン・モデル一覧） | ランタイムのビルド番号チップ、GPU メモリと RAM の数値 | 設定のプロバイダーのローカルモデル画面 |
| settings-providers-apikeys.webp | 13b_apikeys_0.png | 設定 > プロバイダー > API キー（プロバイダー別のキー入力欄） | なし（全欄が未入力のプレースホルダ表示） | 設定のプロバイダー API キー画面 |
| settings-gateway.webp | 14_gateway_0.png | 設定 > ゲートウェイ（接続モード 4 種・リモート URL・診断） | リモート URL の値 | 設定のゲートウェイ画面 |
| settings-gateway-registered.webp | 14_gateway_2.png | 設定 > ゲートウェイ（スクロール後。認証済み状態と Registered gateways） | 上部のリモート URL、登録済みゲートウェイの名前とアドレス行 | 設定のゲートウェイ画面の登録済みゲートウェイ一覧 |
| settings-keybinds.webp | 15_keybinds_0.png | 設定 > キーボードショートカット | なし | 設定のキーボードショートカット画面 |
| settings-tools-keys.webp | 16_tools_0.png | 設定 > ツールとキー > ツール（外部サービスの API キー欄） | 適用対象チップ、FAL の入力済みキー断片 | 設定のツールとキー画面 |
| settings-tools-settings.webp | 16b_toolsettings_0.png | 設定 > ツールとキー > 設定（Matrix / Mattermost / ntfy などの項目） | なし（全欄が「省略可能」表示） | 設定のツールとキーの設定タブ |
| settings-plugins.webp | 17_plugins_0.png | 設定 > Plugins（Desktop plugins / Agent plugins） | なし | 設定の Plugins 画面 |
| settings-archived-chats.webp | 18_archived_0.png | 設定 > アーカイブ済みチャット | デフォルトのプロジェクトディレクトリの絶対パス 2 行 | 設定のアーカイブ済みチャット画面 |
| settings-about.webp | 19_about_x.png | 設定 > 情報（バージョン 0.21.0・ビルドが古い警告バナー・更新・Danger zone） | コミットハッシュ | 設定の情報画面 |
| main-sidebar.webp | 50_main.png | メイン画面（SESSIONS タブ・左サイドバー・右ペイン FILES） | セッション一覧のタイトル、TELEGRAM / API / DISCORD の各行、CRON ジョブ名、ステータスバーのリモートアドレス、コンポーザーのモデル選択値 | Hermes Desktop のメイン画面とサイドバー |
| bots-tab.webp | 51_bots_b.png | メイン画面 BOTS タブ（ボット名簿とスキル一覧・Skills Hub ブラウザ） | Configuring のリモートアドレス、グループチャット名、ゲートウェイ見出しのアドレス、ボット名簿の全行、スキル詳細の説明文と name / description 欄 | Hermes Desktop の BOTS タブ |
| bots-create.webp | 51_bots_create.png | 新しいボットの作成ダイアログ（アイコン選択・Name / Create on / Title / Description） | Name・Title の入力値、Create on のリモートアドレス、背景に透けるボット名簿とグループチャット名 | 新しいボットを作成するダイアログ |
| cron-jobs.webp | 52_cron.png | スケジュール済みジョブ（ジョブ詳細とブループリント一覧） | ジョブ一覧・検索欄・詳細見出しのジョブ名、前回／次回の実行日時、配信先、モデル、プロンプト本文、実行履歴 17 行、ステータスバーのリモートアドレス | スケジュール済みジョブの画面 |
| skills-tools.webp | 53_skills.png | スキルとツール（スキル一覧・詳細・Skills Hub ブラウザ） | Configuring のリモートアドレス、スキル詳細の説明文と name / description 欄、左サイドバーのセッション一覧、ステータスバーのリモートアドレス | スキルとツールの画面 |
| skills-mcp.webp | 56_mcp.png | スキルとツール > MCP（Servers・Catalog・mcp.json エディタ・ログ） | Configuring のリモートアドレス、登録済みサーバー名、mcp.json のコマンドパスとサーバー名、ログ本文、背景のボット名簿 | MCP サーバーの設定画面 |
| skills-toolset.webp | 57_toolset.png | スキルとツール > ツールセット（ツールセット一覧と実行バックエンドの状態） | Configuring のリモートアドレス、背景のボット名簿とグループチャット名 | ツールセットと実行バックエンドの画面 |
| messaging.webp | 54_messaging.png | メッセージング（連携先一覧と Telegram の設定） | 適用対象チップ、ボットトークン、許可する Telegram ユーザー ID、左サイドバーのセッション一覧、ステータスバーのリモートアドレス | メッセージング連携の設定画面 |

## 判断メモ

- 「適用対象」チップは `default` のみ残し、他のプロファイル名はすべて塗った。
- 設定項目のラベル・説明文・既定値・ボタン・タブ名、および Catalog に並ぶ公開サービス名
  （Airtable・Algolia など）とツールセット名は残した。
- `settings-providers.webp` の接続済みプロバイダー名（Nous Portal / ChatGPT or Codex Subscription /
  xAI Grok）は公開サービス名であり、この画面の説明に不可欠なため残した。
- 右ペイン FILES はルート名がリポジトリ名（公開）で、ツリー自体は読み取り不可の空表示のため塗っていない。
- `settings-providers-local.webp` はモデル名・サイズ・「このマシンには大きすぎます」等のバッジを残し、
  マシン固有の GPU / RAM 数値とランタイムのビルド番号だけを塗った。
- `cron-jobs.webp` は画面の内容がほぼユーザー固有のため、残るのは項目ラベルとブループリント一覧のみ。
