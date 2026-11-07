# スクリーンショット一覧（Hermes Desktop v0.23.0 / Retina 2x）

v0.23.0 の Retina 実機キャプチャ（原寸 3600x2338）から切り出したもの。設定画面は設定モーダルの外接矩形
（検索ピルを含む。全画面共通で原寸の `[170, 154, 2830, 1798]`、2660x1644 px）、メイン画面系はアプリウィンドウ全体
（原寸の `[80, 88, 2920, 1888]`、2840x1800 px）。ユーザー固有の値を背景色の単色矩形でマスクし、
`scripts/hermes-audit/crop_mask.py` で `cwebp -q 85` の WebP にした。幅は 2x のまま（表示時は CSS で 1x 相当に縮める前提）。

`settings-passwords.webp`・`settings-web-access.webp`・`cron-new-job.webp` は翌日（2026-11-08 朝）の追加撮影。
Web アクセスはこのマシンのゲートウェイへ切り替えて撮った（理由は判断メモ）。

| 出力ファイル | 元画像 | 写っている画面 | マスクした箇所 | 推奨 alt テキスト |
|---|---|---|---|---|
| settings-models.webp | 02_model_a_0.png | 設定 > モデル > メインモデル（適用対象・プロバイダー・モデル選択、Reasoning、高速、コンテキスト上書き） | 適用対象のプロファイルチップ一式、プロバイダーとモデルの選択値 | 設定のモデル画面のメインモデル |
| settings-models-auxiliary.webp | 02_model_c_0.png | 設定 > モデル > 補助モデル（補助タスク一覧と警告バナー） | 適用対象のチップ一式、警告バナー内のプロバイダー名、補助モデルの割り当て値 4 件（圧縮・承認・MCP・タイトル生成）。「自動 · メインモデルを使用」は残した | 設定のモデル画面の補助モデル一覧 |
| settings-models-subagents.webp | 02_model_d_1.png | 設定 > モデル > サブエージェント（ルーティング 3 方式とサブエージェントの既定値） | 画面下端に重なった macOS の明るさ表示（撮影時の写り込み） | 設定のモデル画面のサブエージェント |
| settings-chat.webp | 03_chat_a_0.png | 設定 > チャット > 動作（人格・タイムゾーン・推論ブロック） | 適用対象のチップ一式（タイムゾーンは残した） | 設定のチャット画面 |
| settings-appearance.webp | 04_appearance_a_0.png | 設定 > 外観 > 一般（言語・イントロ表示・モデル料金・前回のチャットを再開・アプリ内ヒント・ガイドツアー） | なし | 設定の外観画面の一般設定 |
| settings-appearance-theme.webp | 04_appearance_b_0.png | 設定 > 外観 > テーマ（ライト／ダーク／システムとテーマ一覧） | なし | 設定の外観画面のテーマ一覧 |
| settings-appearance-window.webp | 04_appearance_d_0.png | 設定 > 外観 > ウィンドウとレイアウト（インターフェースモード・セッションリストの密度・タブバー・ウィンドウの透過など） | なし | 設定の外観画面のウィンドウとレイアウト |
| settings-workspace.webp | 05_workspace_a_0.png | 設定 > ワークスペース > プロジェクトと検出 | 適用対象のチップ一式、作業ディレクトリの絶対パス | 設定のワークスペース画面 |
| settings-security.webp | 06_safety_a_0.png | 設定 > 安全性 > 承認（承認モード・タイムアウト・MCP 再読み込み・コマンド許可リスト） | 適用対象のチップ一式、コマンド許可リストの値 | 設定の安全性画面 |
| settings-browser.webp | 07_browser_a_0.png | 設定 > Browser > ブラウザープロファイル（Use My Real Browser Profile） | 適用対象のチップ一式 | 設定の Browser 画面 |
| settings-passwords.webp | 07v_vault_a_0.png（追加撮影） | 設定 > パスワードとログイン > 保存済みの認証情報（未保存の空表示） | 適用対象のプロファイルチップ一式 | 設定のパスワードとログイン画面 |
| settings-web-access.webp | 15_webaccess_0.png（追加撮影） | 設定 > Web アクセス（停止中、公開方法「このネットワーク」、開始ボタンは Nous 未サインインで無効） | 説明文と URL 行の LAN アドレス | 設定の Web アクセス画面 |
| settings-passwords-managers.webp | 07v_vault_b_0.png | 設定 > パスワードとログイン > パスワードマネージャー（1Password / Bitwarden の検出状態） | 適用対象のチップ一式（検出状態は環境依存） | 設定のパスワードマネージャー連携画面 |
| settings-memory-context.webp | 08_memory_a_0.png | 設定 > メモリとコンテキスト > 永続メモリ | 適用対象のチップ一式 | 設定のメモリとコンテキスト画面 |
| settings-voice.webp | 09_voice_a_0.png | 設定 > 音声 > 音声会話（Voice Chat Mode・GPT-Live Voice・GPT-Live Persona など） | 適用対象のチップ一式、GPT-Live Voice の選択値（既定の `marin` ではない）、GPT-Live Persona の入力文 | 設定の音声画面 |
| settings-advanced.webp | 10_advanced_a_0.png | 設定 > 詳細 > デスクトップと起動（スリープ防止・クイック入力など） | 適用対象のチップ一式 | 設定の詳細画面 |
| settings-notifications.webp | 11_notifications_a_0.png | 設定 > 通知 > デスクトップ通知 | なし | 設定の通知画面 |
| settings-billing.webp | 12_billing_a_0.png | 設定 > 請求 > 概要（Balance / Plan / Payment & credits / Usage） | 残高・プラン名と月額・自動リフィル値、プランカード（画像・プラン名・更新日）、Usage 見出しのプラン名、リセットまでの時間、使用率 2 件 | 設定の請求画面 |
| settings-providers.webp | 13_providers_a_1.png | 設定 > プロバイダー > アカウント（ローカル実行と接続済み一覧） | 上端に残った適用対象のチップ、ユーザーが導入したプラグインのプロバイダー名と説明文（他の公開サービス名は残した） | 設定のプロバイダー画面 |
| settings-providers-apikeys.webp | 13_providers_b_0.png | 設定 > プロバイダー > API キー（プロバイダー別のキー入力欄） | 上端に残った適用対象のチップ（全欄が未入力のプレースホルダ表示） | 設定のプロバイダー API キー画面 |
| settings-providers-local.webp | 13_providers_d_0.png | 設定 > プロバイダー > ローカルモデル（ローカルランタイム・このマシン・モデル一覧） | 冒頭文の適用先プロファイル名 | 設定のプロバイダーのローカルモデル画面 |
| settings-gateway.webp | 14_gateway_a_0.png | 設定 > ゲートウェイ > プライマリゲートウェイ（接続モード 4 種・リモート URL・認証・診断） | リモート URL の値 | 設定のゲートウェイ画面 |
| settings-gateway-registered.webp | 14_gateway_b_0.png | 設定 > ゲートウェイ > 保存済みの接続 | 保存済み接続の名前とアドレス | 設定のゲートウェイ画面の保存済み接続一覧 |
| settings-keybinds.webp | 15_keybinds_a_0.png | 設定 > キーボードショートカット > キー割り当て（COMPOSER と PROFILES の先頭） | なし | 設定のキーボードショートカット画面 |
| settings-keybinds-hud.webp | 15_keybinds_b_0.png | 設定 > キーボードショートカット > HUDジェスチャー | なし | 設定のキーボードショートカットの HUD ジェスチャー |
| settings-keybinds-capture.webp | 15_keybinds_c_0.png | 設定 > キーボードショートカット > 画面キャプチャ | なし | 設定のキーボードショートカットの画面キャプチャ |
| settings-tools-keys.webp | 16_tools_a_0.png | 設定 > ツールとキー > ツール（外部サービスの API キー欄） | 適用対象のチップ一式、設定済みキー（FAL）の断片表示 | 設定のツールとキー画面 |
| settings-tools-settings.webp | 16_tools_b_0.png | 設定 > ツールとキー > 設定（IRC / LINE / Matrix などの項目。先頭は撮影範囲外） | なし（全欄が「省略可能」表示） | 設定のツールとキーの設定タブ |
| settings-plugins.webp | 17_plugins_a_0.png | 設定 > プラグイン（設定を持つプラグインの一覧） | 適用対象のチップ一式、ユーザーが導入したプラグインの名前（サイドバーの子項目と一覧の行） | 設定のプラグイン画面 |
| settings-archived-chats.webp | 18_sessions_a_1.png | 設定 > セッション > アーカイブと保持（自動アーカイブとアーカイブ済みセッション） | アーカイブ済みセッション 6 件のタイトル・冒頭文・プロジェクト名・件数（総数表示は残した） | 設定のセッション画面のアーカイブ一覧 |
| settings-about.webp | 19_about_a_0.png | 設定 > 情報 > バージョンと更新（バージョン 0.23.0・更新・アップデートチャンネル・ビルド情報） | コミットハッシュ、Install ID とそのパス | 設定の情報画面 |
| settings-about-uninstall.webp | 19_about_b_0.png | 設定 > 情報 > アンインストール（3 段階の削除範囲） | なし | 設定の情報画面のアンインストール |
| main-sidebar.webp | 50_main_0.png | メイン画面（セッションタブ・左サイドバー・右ペインのファイル） | タブバーのセッション名（既定名は残した）、ピン留め、プロジェクト内のセッション名と日数、プロジェクト名一覧、右ペインのルート名、コンポーザーのモデル選択値、ステータスバーの接続名とワークスペース名 | Hermes Desktop のメイン画面とサイドバー |
| bots-tab.webp | 51_bots_0.png | メイン画面 ボットタブ（グループチャット一覧・ボット名簿） | グループチャット名・状態文・日数、ゲートウェイ見出しの名前、ボット名簿（アバターと名前）、タブバーのセッション名、右ペインのルート名、モデル選択値、ステータスバーのワークスペース名 | Hermes Desktop のボットタブ |
| bots-menu.webp | 51_bots_menu_0.png | ボットタブの「+」メニュー（新しいボット／グループチャット／セクション） | bots-tab と同じ箇所 | ボットタブの追加メニュー |
| cron-new-job.webp | 52_cron_new_0.png（追加撮影） | 新しい Cron ジョブのフォーム（開始点・名前・プロンプト・頻度・配信先・モデル・見逃した実行）。フォームだけを切り出し | なし（ジョブ 0 件のローカルゲートウェイで撮影。保存はしていない） | 新しい Cron ジョブのフォーム |
| cron-jobs.webp | 52_cron_0.png | スケジュール済みジョブ（ジョブ一覧・詳細・ブループリント一覧） | ジョブ名一覧と検索欄の例示ジョブ名、プロンプト本文、実行履歴、背面のタブバー・サイドバー端・ステータスバー（ジョブ件数とブループリント名は残した） | スケジュール済みジョブの画面 |
| skills-tools.webp | 53_skills_0.png | スキルとツール > スキル（スキル一覧・詳細） | Configuring の対象名、セッション一覧、右ペインのルート名、ステータスバー（組み込みスキル名は残した） | スキルとツールの画面 |
| skills-toolset.webp | 57_cap_toolset_0.png | スキルとツール > ツールセット（ツールセットカードと Developer Mode） | Configuring の対象名、呼び出し回数 2 件、セッション一覧、右ペインのルート名、ステータスバー | ツールセットの画面 |
| skills-connectors.webp | 56_cap_connectors_0.png | スキルとツール > Connectors（利用可能なアプリ一覧） | Configuring の対象名、セッション一覧、右ペインのルート名、ステータスバー（カタログのアプリ名は残した） | スキルとツールのコネクタ一覧 |
| skills-plugins.webp | 58_cap_plugins_0.png | スキルとツール > Plugins（Plugin Catalog と詳細） | 詳細のレビュー済みコミット、セッション一覧、右ペインのルート名、ステータスバー（カタログのプラグイン名は残した） | スキルとツールのプラグイン画面 |
| messaging.webp | 54_messaging_0.png | メッセージング（連携先一覧と Telegram の設定） | 適用対象のチップ一式、ボットトークンの断片、許可する Telegram ユーザー ID、セッション一覧、右ペインのルート名、ステータスバー | メッセージング連携の設定画面 |
| kanban.webp | 59_kanban_0.png | カンバン（ボードの列と完了列のカード） | 完了列のカード（タイトル・本文・担当・ID）、セッション一覧、右ペインのルート名、ステータスバー（ボード名 Default・列名・件数は残した） | カンバンの画面 |

## 判断メモ

- 設定項目のラベル・説明文・既定値・ボタン・タブ名・サブページ名、公開サービス名（プロバイダー名・プラットフォーム名・
  Connectors のアプリ名・カタログのプラグイン名）、ツールセット名、組み込みスキル名、ブループリント名は残した。
- 適用対象のチップはプロファイル名（ユーザー値）なので、先頭のチップを含めチップ行全体を背景色で塗った。
- `settings-passwords.webp` は初回の撮影（`07v_vault_a` / `07v_vault_b` とも）がパスワードマネージャー画面だったため、
  翌朝に撮り直した。
- 「Web アクセス」はリモートゲートウェイ接続中はナビに出ないため、接続先を一時的に「This device」へ切り替えて撮り、撮影後に戻した。
  開始ボタンは押していない。
- `settings-providers.webp` は `_0` が読み込み中のスケルトンだったため `_1` を使った。`settings-archived-chats.webp` も同じ理由で `_1`。
- `settings-models-subagents.webp` は `_0` に適用対象チップが残り下端に macOS の音量表示が写っていたため、チップの無い `_1`
  を使い、下端の明るさ表示を背景色で塗った。
- ユーザーが導入したプラグインの名前は公開可否が不明なため、`settings-plugins.webp` と `settings-providers.webp` で塗った。
- `settings-about.webp` と `skills-plugins.webp` のコミットハッシュは公開のものだが、マスク方針に合わせて塗った。
- 設定モーダルは半透明で、背面がぼかされて透けている。通常の明るさでは判読できないため塗っていない。
- 塗りの色は矩形周囲の最頻色。サイドバー（`#1c1d1e`）・ステータスバー（`#0d1014`）・cron モーダル背面（`#0d1012`）は
  周囲に枠線や半透明が入るため色を指定して塗った。
