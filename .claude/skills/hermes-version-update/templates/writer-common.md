# 執筆エージェント共通前提（{{VERSION}} 反映）

> 雛形。Phase 0〜3 の確定値で書き換え、scratchpad にコピーして各 writer に渡す。前回（v0.23.0、2026-11-08）の値を例として残してある。SP の絶対パスはセッションごとに変わる。

SP = {{SCRATCHPAD}}
リポジトリ = このガイドのリポジトリルート（正本は vault/）

## 確定事実
- 実機: Hermes Desktop / Hermes Agent **v0.23.0**「The Hearth Release」（タグ v0.23.0、2026-11-05 リリース）。実機コミット `2bd378ed`（完全 `2bd378ed1b8d6bf2192cb26e0a55ff3091e6bd19`）= タグ v0.23.0 と同一。`_config_version` 51→52。前回監査は v0.22.1 / `297552a9`（2026-10-15）。監査日 2026-11-08。
- 中間リリース v0.22.2〜v0.22.7（2026-10-15〜11-03）の内容は v0.23.0 のリリースノートに統合済み。
- 設定サイドバーは **20 画面**（新設「Web アクセス」1 画面）。順と子項目（実機確認済み。Web アクセスのみソース根拠）:
  1 モデル（メインモデル / 代替モデル / 補助モデル / サブエージェント / エージェントの協調）※サブエージェントは「詳細」から移動
  2 チャット（動作 / 添付ファイル）
  3 外観（一般 / テーマ / フォントと表示倍率 / ウィンドウとレイアウト / チャット表示 / ペット）
  4 ワークスペース（プロジェクトと検出 / シェル環境 / ファイルと実行）
  5 安全性（承認 / プライバシーとネットワーク / チェックポイント）
  6 Browser ※英語表記のまま（ブラウザープロファイル / ローカル・プライベート URL）
  7 パスワードとログイン（保存済みの認証情報 / パスワードマネージャー）
  8 メモリとコンテキスト（永続メモリ / コンテキストと圧縮）
  9 音声（音声会話 / 音声認識 / 音声合成）
  10 詳細（デスクトップと起動 / エージェントの制限 / ツールへのアクセス / ターミナルのバックエンド / 出力の制限）※5 つに減った
  11 通知（デスクトップ通知 / サウンド）
  12 請求（概要 / プラン ※プランは条件付き）
  ─ 区切り ─
  13 プロバイダー（アカウント / API キー / カスタムエンドポイント / ローカルモデル）
  14 ゲートウェイ（プライマリゲートウェイ / 保存済みの接続 / リモート更新）※旧「このウィンドウ」から改名。3 サブページはネイティブアプリのときだけ
  15 Web アクセス【新設・子項目なし】※ネイティブアプリで、接続が remote でないとき（このマシンのゲートウェイに接続中）だけ表示。リモート接続中は出ない（実機で非表示を確認）
  16 キーボードショートカット（キー割り当て / HUDジェスチャー / 画面キャプチャ）
  17 ツールとキー（ツール / 設定）
  18 セッション（アーカイブと保持 / 既定のプロジェクトフォルダー）
  ─ 区切り ─
  19 プラグイン（各プラグインの設定ページの入口。設定を持つプラグインの子項目が並ぶ。自動更新スイッチはここには無い）
  ─ 区切り ─
  20 情報（バージョンと更新 / アンインストール）
- 主な変更点（詳細と根拠は各レポート）:
  - Web アクセス: このマシンの Hermes を Webapp（Desktop と同じワークスペースをブラウザで開ける）として配信。公開方法「このネットワーク」（LAN）/「独自の URL」（https:// 必須。Tailscale Serve 等）。操作は 開始 / 停止 / ゲートウェイを再起動。開始には Nous へのサインインが必要。背後の config は `webapp.enabled`（既定 false）/ `webapp.host`（127.0.0.1）/ `webapp.port`（9120）/ `webapp.public_url`（""）。host・port の入力欄は画面に無い（確信度 中）。Webapp で開いた場合、ゲートウェイ画面は「Hermes ホスト＋サインアウト」に差し替わり、キーボードショートカットの 8 アクション（session.new / newTab / newWindow / next / prev、view.closeTerminal / closeTab / reopenTab）の既定がブラウザ衝突回避のため macOS は ⌃⌘＋同じキー、Win/Linux は Alt＋同じキーになる。通知に Webapp 専用「ブラウザー通知」行。根拠 report-A/B/C。
  - モデル > サブエージェント: 冒頭に「ルーティング」（既定〔使用中〕/ モデルルート / プロファイルルート。後 2 つは Advanced Delegation プラグインが必要で「プラグインをインストール」案内あり。config `delegation.backend`）。下に「サブエージェントの既定値」（プロバイダー/モデルの複合行＝`delegation.provider`+`delegation.model`、既定はメインエージェントから継承。ルーティングが既定以外だと無効）、ターン上限 `max_iterations` / 並列 `max_concurrent_children` / タイムアウト `child_timeout_seconds` / 推論強度 `reasoning_effort`。`delegation.gateway_mode` / `prefix_stagger_seconds` は UI 無し。旧「詳細 > サブエージェント」へのリンクは自動転送。
  - モデル > メインモデル: レイアウトのみ変更（プロバイダーとモデルが縦 2 行、適用ボタンは下段右）。既定値ブロック（Defaults / Reasoning / Speed 等）は英語のまま。大型モデル通知が追加。
  - メモリ > 永続メモリ: 先頭に読み取り専用の概要パネル（有効なメモリプロバイダー / 組み込みレイヤーと状態）。
  - 通知 > サウンド: 「インターフェース音をミュート」トグル追加（端末ローカル保存）。
  - 請求: 「クレジットで続行」トグル（ウィンドウ型プランの管理者のみ表示）。使用量バーに警告段階、Usage 見出しにプラン名。
  - 情報: Hermes Cloud が更新を管理しているときは「アップデート」セクションを隠す。
  - ゲートウェイ: すべてのゲートウェイが常時接続され、切り替えは即時（This device への切替確認は廃止、確認はインストール時のみ）。保存済みの接続の説明文・「Connection mode」・「Managed updates」見出しは英語のまま。
  - スキルとツール（メイン）: タブ順が **スキル / Plugins / Connectors / ツールセット** に変更（Plugins・Connectors は英語表記）。Plugins タブ上部に「自動更新」スイッチと「すべて更新」（config `plugins.auto_apply`、確認間隔既定 24 時間）。プラグインの tier 表示は Official / Verified / Community / Unverified（英語表記）。MCP は Connectors タブ内（独立ページ無し、従来どおり）。
  - メインナビ: 新しいセッション / スキルとツール / メッセージング / アーティファクト / スケジュール済みジョブ / カンバン（実機 6 項目。カンバンは有効時）。上部タブ「セッション / ボット / ターミナル」。
  - Group Chats（ボット）: ルーム設定に「目的」「共有メモ」「誰も指名されていないメッセージに答えるのは」（全員が答える / リーダー / 回答者を自動で選ぶ）。ボット同士の無限ループ防止（config `gateway.bot_loop_guard.max_hops` 既定 4）。別マシンのボット混在は Desktop が中継するときのみ。
  - cron: 実行中ジョブの詳細ヘッダーに「停止」、編集フォームに「見逃した実行」（既定の設定に従う / 復帰時に1回だけ実行 / スキップする）。ソース根拠（実機未撮影）。
  - スキル: curator lock（スキル詳細と一覧に「ロック」「ロック中」）。組み込みスキル 58→44（Word/PowerPoint/Excel は `microsoft-office` に統合）。
  - 有料 MCP ツール: Desktop に設定 UI 無し。config.yaml の `mcp_servers.<name>.tool_costs` / `spend_limit` / `cost_unit`。承認プロンプトに呼び出し単価とチャット累計が出て、上限超過前は YOLO でも確認（文面は英語固定）。
  - 既定値の変更: **`sessions.auto_prune` が true → false**（古いセッションの自動削除は既定オフ）。新コマンド `/autoprune`（自動削除のオン/オフ）、`/discard`、`/rewind`（CLI/TUI。Esc 2 回）。`/browser` の説明から Browser Use モードの記述が削除。
  - Browser 系: config から `browser.backend` / `browser.camofox.*` / `browser.extension_control.*` / `browser.record_sessions` / `browser.snapshot_threshold` / `browser.allow_unsafe_evaluate` / `browser.restrict_evaluate` が削除、`browser.executable_path` / `browser.user_data_dir` / `browser.chromium_args` が追加。Camofox・`mcp-serve`・エージェントインポーター・Singularity はコアから外れプラグイン化（以前使っていた人には自動インストール）。設定画面の Browser 3 項目は不変。
  - その他の新 config（UI 無し）: `vault.key_storage`（"file"。OS キーチェーンも選べる）、`display.inline_images`（auto）、`display.cli_layout`、`worktrees.*`、`terminal.client_env_passthrough`、`approvals.discord_prompt_timeout`、`agent.daybreak` 等。全量は SP/diff-defaults.txt。
- レポート（すべて SP 配下）: report-A.md（サイドバー・モデル・サブエージェント・Web アクセス）/ report-B.md（外観・メモリ・Browser・セッション等）/ report-C.md（ゲートウェイ・キーバインド・通知・請求・情報・プラグイン・横断）/ report-E.md（メイン UI・Group Chats・cron・プラグイン自動更新・有料 MCP）/ report-F.md（vault 各ページの陳腐化候補。最初に自分の担当分を読む）/ report-G-shots-verified.md（実機書き起こしと照合。実機の表記はここが正本）/ diff-defaults.txt / defaults-new.json / diff-commands.txt / release-v0.23.0.md。
- 食い違いの裁定（report-G 優先）: メインナビは 6 項目（カンバン含む）。自動更新は「スキルとツール > Plugins」タブ。tier 表記は英語。
- リリースノートとソースが食い違えばソース・実機を優先（例: `/delegation` コマンドはコアに登録が無い ─ 書かない）。ソース確認が要るなら ~/.hermes/hermes-agent を**読み取りのみ**（`export GIT_NO_LAZY_FETCH=1` を付ける。fetch / checkout / 変更は厳禁）。

## 編集ルール
- 正本は `vault/`。`src/content/docs/` は触らない。既存ページは Edit（部分置換）。Write は新規ページのみ。
- 触ったページの frontmatter を `hermes_version: 0.23.0` / `hermes_commit: '2bd378ed'`（引用符必須・8 桁）/ `verified: '2026-11-08'` に更新。`status` は実機またはソースで確認できたら `verified`。
- **各ページ本文に版数（v0.23.0 等）を書かない**。「v0.23 で追加」「新しく追加された」等の時期表現も避け、現在の仕様として書く。変更の記録は `06_リファレンス/04_変更履歴.md` に集約（担当 W4）。
- 設定ページは「子項目ごとに H2」の構成を維持。サブページ名は実機の日本語表記どおり。
- 表記: ダッシュは `─`（U+2500）1 個、丸数字禁止、em ダッシュ禁止（UI 文言の引用に含まれる場合のみ可）。日本語 UI でも英語のままの項目は英語表記のまま書き「日本語リソース未整備のため英語表示」と注記。
- config キーと既定値は defaults-new.json / diff-defaults.txt で裏取りしてから書く。
- ユーザー固有の値（IP・URL・残高・セッション名・cron 名・パス・ボット名・プロファイル名・認証情報）は書かない。
- WikiLink はパス付き。新規ページ: `vault/03_設定/21_Webアクセス.md`（slug `settings/web-access`、sidebar.order 15、sidebar.label `Web アクセス`、title `Web アクセス`。W1 が作成）。WikiLink は `[[03_設定/21_Webアクセス|Web アクセス]]`。
- 既存ページのファイル名・slug は変えない。sidebar.order は親が再採番済み（キーボードショートカット 16 / ツールとキー 17 / セッション 18 / プラグイン 19 / 情報 20。触らない）。
- 未確認内容は書かないか「実機未確認」と明記して status: needs-review。
- スクリーンショット: `src/assets/screenshots/` に加工済み WebP を配置済み。参照記法 `![設定 > モデル 画面](@screenshots/settings-models.webp)`。下の名前表以外は参照しない。alt は画面名で。

### 画像名の表（すべて v0.23.0 の実機で撮り直し済み。※は除く）
settings-models（モデル > メインモデル）/ settings-models-auxiliary（補助モデル）/ **settings-models-subagents（モデル > サブエージェント、新規）** / settings-chat / settings-appearance / settings-appearance-theme / settings-appearance-window / settings-workspace / settings-security / settings-browser / settings-passwords（※前回版のまま。画面に差分なし）/ settings-passwords-managers / settings-memory-context（永続メモリ。概要パネル入り）/ settings-voice / settings-advanced / settings-notifications / settings-billing / settings-providers / settings-providers-apikeys / settings-providers-local / settings-gateway（プライマリゲートウェイ）/ settings-gateway-registered / settings-keybinds / settings-keybinds-hud / settings-keybinds-capture / settings-tools-keys / settings-tools-settings / settings-plugins / settings-archived-chats（セッション > アーカイブと保持）/ settings-about / settings-about-uninstall / main-sidebar / bots-tab / bots-menu / cron-jobs / skills-tools / skills-toolset / skills-connectors / skills-plugins / messaging / **kanban（新規）**
- Web アクセス画面の画像は無い（リモート接続中のため撮影不可）。ページには「画面はソースに基づく説明」と注記する。

## 公開基準
手順には前提・操作・期待結果・失敗時の確認先。ページ本文に H1 を書かない。

## 返答様式（40 行以内）
編集したファイル一覧 / 各ファイルの変更要点 1〜3 行 / 追加・変更した画像参照 / 申し送り（索引・変更履歴に反映すべき事項）/ 未確認・判断保留
