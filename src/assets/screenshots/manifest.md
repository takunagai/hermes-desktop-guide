# スクリーンショット一覧（Hermes Desktop v0.22.1 / Retina 2x）

v0.22.1 の Retina 実機キャプチャ（原寸 3600x2338）から切り出したもの。設定画面は設定モーダルの外接矩形
（検索ピルを含む。全画面共通で原寸の `[170, 154, 2830, 1798]`、2660x1644 px）、メイン画面系はアプリウィンドウ全体
（原寸の `[80, 88, 2920, 1888]`、2840x1800 px）。ユーザー固有の値を背景色の単色矩形でマスクし、
`scripts/hermes-audit/crop_mask.py` で `cwebp -q 85` の WebP にした。幅は 2x のまま（表示時は CSS で 1x 相当に縮める前提）。

| 出力ファイル | 元画像 | 写っている画面 | マスクした箇所 | 推奨 alt テキスト |
|---|---|---|---|---|
| settings-models.webp | 02_model_a_0.png | 設定 > モデル > メインモデル（プロバイダー・モデル選択、Reasoning、高速、コンテキスト上書き） | プロバイダーとモデルの選択値 | 設定のモデル画面のメインモデル |
| settings-models-auxiliary.webp | 02_model_c_0.png | 設定 > モデル > 補助モデル（補助タスク一覧と警告バナー） | 補助モデルの割り当て値 5 件（圧縮・承認・MCP・タイトル生成・トリアージ指定）。「自動 · メインモデルを使用」は残した | 設定のモデル画面の補助モデル一覧 |
| settings-chat.webp | 03_chat_a_0.png | 設定 > チャット > 動作（人格・タイムゾーン・推論ブロック） | なし（タイムゾーンは残した） | 設定のチャット画面 |
| settings-appearance.webp | 04_appearance_a_0.png | 設定 > 外観 > 一般（言語・イントロ表示・モデル料金・前回のチャットを再開・ヒント・ガイドツアー） | なし | 設定の外観画面の一般設定 |
| settings-appearance-theme.webp | 04_appearance_b_0.png | 設定 > 外観 > テーマ（ライト／ダーク／システムとテーマ一覧） | なし | 設定の外観画面のテーマ一覧 |
| settings-appearance-window.webp | 04_appearance_d_0.png | 設定 > 外観 > ウィンドウとレイアウト（インターフェースモード・タブバー・ウィンドウの透過など） | なし | 設定の外観画面のウィンドウとレイアウト |
| settings-workspace.webp | 05_workspace_a_0.png | 設定 > ワークスペース > プロジェクトと検出 | 作業ディレクトリの絶対パス | 設定のワークスペース画面 |
| settings-security.webp | 06_safety_a_0.png | 設定 > 安全性 > 承認（承認モード・タイムアウト・MCP 再読み込み・コマンド許可リスト） | コマンド許可リストの値 | 設定の安全性画面 |
| settings-browser.webp | 07_browser_a_0.png | 設定 > Browser > ブラウザープロファイル（Use My Real Browser Profile） | なし | 設定の Browser 画面 |
| settings-passwords.webp | 07v_vault_a_0.png | 設定 > パスワードとログイン > 保存済みの認証情報（未保存の空表示） | なし | 設定のパスワードとログイン画面 |
| settings-passwords-managers.webp | 07v_vault_b_0.png | 設定 > パスワードとログイン > パスワードマネージャー（1Password / Bitwarden の検出状態） | なし（検出状態は環境依存） | 設定のパスワードマネージャー連携画面 |
| settings-memory-context.webp | 08_memory_a_0.png | 設定 > メモリとコンテキスト > 永続メモリ | なし | 設定のメモリとコンテキスト画面 |
| settings-voice.webp | 09_voice_a_0.png | 設定 > 音声 > 音声会話（Voice Chat Mode・GPT-Live Voice など） | なし（GPT-Live Voice の `marin` は既定値） | 設定の音声画面 |
| settings-advanced.webp | 10_advanced_a_0.png | 設定 > 詳細 > デスクトップと起動（スリープ防止・クイック入力など） | なし | 設定の詳細画面 |
| settings-notifications.webp | 11_notifications_a_0.png | 設定 > 通知 > デスクトップ通知 | なし | 設定の通知画面 |
| settings-billing.webp | 12_billing_a_0.png | 設定 > 請求 > 概要（Balance / Plan / Payment & credits / Usage） | 残高・プラン名と月額・自動リフィル値、プランカード（画像・プラン名・更新日）、リセット日、使用量の金額 3 件 | 設定の請求画面 |
| settings-providers.webp | 13_providers_a_0.png | 設定 > プロバイダー > アカウント（ローカル実行と接続済み一覧） | なし（公開サービス名のみ） | 設定のプロバイダー画面 |
| settings-providers-apikeys.webp | 13_providers_b_0.png | 設定 > プロバイダー > API キー（プロバイダー別のキー入力欄） | なし（全欄が未入力のプレースホルダ表示） | 設定のプロバイダー API キー画面 |
| settings-providers-local.webp | 13_providers_d_0.png | 設定 > プロバイダー > ローカルモデル（推奨モデルのワンクリックセットアップ） | なし | 設定のプロバイダーのローカルモデル画面 |
| settings-gateway.webp | 14_gateway_a_1.png | 設定 > ゲートウェイ > このウィンドウ（接続モード 4 種・リモート URL・認証・診断） | リモート URL の値 | 設定のゲートウェイ画面 |
| settings-gateway-registered.webp | 14_gateway_b_0.png | 設定 > ゲートウェイ > 保存済みの接続 | 保存済み接続の名前とアドレス | 設定のゲートウェイ画面の保存済み接続一覧 |
| settings-keybinds.webp | 15_keybinds_a_0.png | 設定 > キーボードショートカット > キー割り当て（COMPOSER と PROFILES の先頭） | なし | 設定のキーボードショートカット画面 |
| settings-keybinds-hud.webp | 15_keybinds_b_0.png | 設定 > キーボードショートカット > HUDジェスチャー | なし | 設定のキーボードショートカットの HUD ジェスチャー |
| settings-keybinds-capture.webp | 15_keybinds_c_0.png | 設定 > キーボードショートカット > 画面キャプチャ | なし | 設定のキーボードショートカットの画面キャプチャ |
| settings-tools-keys.webp | 16_tools_a_0.png | 設定 > ツールとキー > ツール（外部サービスの API キー欄） | なし（全欄が未入力のプレースホルダ表示） | 設定のツールとキー画面 |
| settings-tools-settings.webp | 16_tools_b_0.png | 設定 > ツールとキー > 設定（Matrix / Mattermost などの項目。先頭は撮影範囲外） | なし（全欄が「省略可能」表示） | 設定のツールとキーの設定タブ |
| settings-plugins.webp | 17_plugins_a_0.png | 設定 > プラグイン（設定を持つプラグインなしの空表示） | なし | 設定のプラグイン画面 |
| settings-archived-chats.webp | 18_sessions_a_0.png | 設定 > セッション > アーカイブと保持（自動アーカイブとアーカイブ済みセッション） | アーカイブ済みセッション 3 件のタイトルと冒頭文（件数表示は残した） | 設定のセッション画面のアーカイブ一覧 |
| settings-about.webp | 19_about_a_0.png | 設定 > 情報 > バージョンと更新（バージョン 0.22.1・更新・アップデートチャンネル・ビルド情報） | コミットハッシュ、Install ID とそのパス | 設定の情報画面 |
| settings-about-uninstall.webp | 19_about_b_1.png | 設定 > 情報 > アンインストール（3 段階の削除範囲） | なし | 設定の情報画面のアンインストール |
| main-sidebar.webp | 50_main_0.png | メイン画面（セッションタブ・左サイドバー・右ペインのファイル） | セッション一覧のタイトルと日数、右ペインのファイル木（ルート名含む）、コンポーザーのモデル選択値、ステータスバーのワークスペース名 | Hermes Desktop のメイン画面とサイドバー |
| bots-tab.webp | 51_bots_0.png | メイン画面 ボットタブ（グループチャット一覧・ボット名簿・カンバン） | グループチャット名・状態文・日数、ゲートウェイ見出しの名前、ボット名簿（アバターと名前）、右ペインのファイル木、ステータスバーのワークスペース名 | Hermes Desktop のボットタブ |
| bots-menu.webp | 51_bots_menu_0.png | ボットタブの「+」メニュー（新しいボット／グループチャット／セクション） | bots-tab と同じ箇所 | ボットタブの追加メニュー |
| cron-jobs.webp | 52_cron_0.png | スケジュール済みジョブ（0 件の空表示とブループリント一覧） | なし（ジョブ 0 件。背面は暗転で判読不可） | スケジュール済みジョブの画面 |
| skills-tools.webp | 53_cap_skills2_0.png | スキルとツール > スキル（スキル一覧・詳細・Skills Hub ブラウザ） | ユーザー作成スキルの名前・カテゴリ・説明（一覧と詳細）、セッション一覧、右ペインのファイル木、ステータスバーのワークスペース名 | スキルとツールの画面 |
| skills-toolset.webp | 57_cap_toolset_0.png | スキルとツール > ツールセット（ツールセット一覧と実行バックエンドの状態） | セッション一覧、右ペインのファイル木、ステータスバーのワークスペース名 | ツールセットと実行バックエンドの画面 |
| skills-connectors.webp | 56_cap_connectors_0.png | スキルとツール > Connectors（このデバイスのコネクタと利用可能なアプリ一覧） | ユーザー追加のカスタム MCP コネクタ名とアイコン文字、セッション一覧、右ペインのファイル木、ステータスバーのワークスペース名 | スキルとツールのコネクタ一覧 |
| skills-plugins.webp | 58_cap_plugins_0.png | スキルとツール > Plugins（導入済みプラグインと Plugin Catalog） | セッション一覧、右ペインのファイル木、ステータスバーのワークスペース名 | スキルとツールのプラグイン画面 |
| messaging.webp | 54_messaging_0.png | メッセージング（連携先一覧と Telegram の設定） | 許可する Telegram ユーザー ID、セッション一覧、右ペインのファイル木、ステータスバーのワークスペース名 | メッセージング連携の設定画面 |

## 判断メモ

- 設定項目のラベル・説明文・既定値・ボタン・タブ名・サブページ名、公開サービス名（プロバイダー名・プラットフォーム名・
  Connectors のアプリ名・公式プラグイン名）とツールセット名は残した。
- `settings-providers.webp` の接続済みプロバイダー名は公開サービス名で、この画面の説明に不可欠なため残した。
- 設定モーダルは半透明で、背面のセッション一覧と右ペインのファイル木がぼかされて透けている。通常の明るさでは判読できず、
  4 倍に増光しても名前は読めないため塗っていない。
- `settings-about.webp` のコミットハッシュは公開リリースのものだが、マスク方針に合わせて塗った。
- 塗りの色は矩形周囲の最頻色。ステータスバーとボット名簿は周囲に枠線が入るため、背景色を指定して塗った。
