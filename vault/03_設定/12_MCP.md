---
title: MCP
description: Hermes DesktopでMCPサーバーを登録、接続、認証、無効化するときの設定項目と安全上の注意。設定画面ではなくスキルとツール画面から操作する。
slug: settings/mcp
sidebar:
  hidden: true
  order: 99
tags:
  - hermes
  - settings
  - mcp
audience:
  - Hermes Desktop利用者
status: verified
hermes_version: 0.21.0
hermes_commit: 'c5c9aa8d'
verified: '2026-09-02'
---

外部の Model Context Protocol サーバーを追加し、Hermes にツールを公開する。

![](@editorial/editorial-11-hermes-emblem.webp)

![スキルとツール 画面](@screenshots/skills-tools.webp)

> [!note] MCP はスキルとツール画面から操作する
> MCP はこの設定画面ではなく、サイドバーの「スキルとツール」（Capabilities）画面の「MCP」タブ（`/skills?tab=mcp`）から操作する。タブは「スキル」「ツールセット」「MCP」の 3 つで、Skills Hub はスキルタブ内に埋め込まれている（独立した「ハブ」タブは無い）。旧ディープリンク `/settings?tab=mcp` は新しい場所へ自動リダイレクトされ、`server=` 付きのブックマークでも選択中のサーバーが引き継がれる。

## 画面構成

![スキルとツール > MCP タブ](@screenshots/skills-mcp.webp)

登録済みサーバー名・mcp.json の中身・ログ本文はマスクしている。

MCP タブは 3 ペイン構成で、左列が「Servers」（サーバー一覧。右上に「インポート」ボタン）とその下の「Catalog」、右上が mcp.json エディタ（行番号付き。右上に整形アイコンと「保存」ボタン）、右下がログペイン（左に「すべてのサーバー」セレクタ、右に「stdio | agent」切替、右下に「再試行」）である。タブ帯の下には「Configuring:」のプロファイル・接続先セレクタがあり、どのプロファイル・ゲートウェイの `mcp_servers` を編集しているかを切り替えられる。サーバー単位の「名前」「サーバー JSON」というフォームではなく、`mcp_servers` 全体を 1 つの JSON ドキュメントとして編集する。

| 画面表示（主） | 内部キー・操作（サブ） | 動作 |
|---|---|---|
| Servers（一覧） | `mcp_servers` | 各行にアイコン・名前・状態バッジ（「未使用」など）・capability サマリ（「ツール N 個を有効化」）・有効/無効トグル。一覧末尾の「＋」で追加 |
| Catalog | 表示のみ + Install | 導入可能なサーバー一覧。各行に名前、`http` / `OAuth` のバッジ、英語の 1 行説明、右端の「Install」ボタン（例: Airtable / Algolia / Asana / Atlassian / Attio など） |
| 新しいサーバー | UI 下書き、保存キーなし | 空のサーバー定義をエディタに追加 |
| 再取得（更新アイコン、ツールチップ「MCP を再読み込み」） | 単一サーバーの再プローブ | 選択サーバーへ再接続してツール一覧・状態を更新（表示のみ。live 反映は保存時に自動実行される） |
| サーバー一覧の各行 | `mcp_servers.<name>` | ステータスドットと状態行を表示。選択で詳細を開く |
| 有効/無効スイッチ | `enabled` | オフで `enabled: false` を書き込み、オンで `enabled` キーを削除 |
| 認証 | OAuth 2.1 PKCE フロー | ブラウザで OAuth 認証。実行中は「ブラウザを待機中…」 |
| ツール名チップ | `tools.include` / `tools.exclude` | クリックでツールを個別に有効/無効化。無効は取り消し線表示 |
| 削除 | `mcp_servers.<name>` を削除 | 選択サーバーを設定から削除 |
| インポート | 貼り付け欄から `mcp_servers` へ追加 | 他ツールの設定やコマンド行を貼り付けてサーバー定義に変換する（後述） |
| コスト・使用量表示 | 表示のみ | 各サーバー行に「1 呼び出しあたり約 N トークン」（ツールスキーマの概算）と「過去 30 日で N 回使用」または「未使用」を表示 |
| mcp.json（エディタ） | `mcp_servers` 全体 | 全サーバー定義を 1 つの JSON ドキュメントとして編集し「保存」 |
| ログペイン | `stdio` / `agent` 切替 | 選択サーバー（未選択時は「すべてのサーバー」）のログを表示 |

### 接続ステータス表示

各サーバー行と詳細には状態行が付く。

| 表示 | 意味 |
|---|---|
| 接続中… | 接続・検出を実行中 |
| 認証が必要です | OAuth 等の認証が未完了（401 / unauthorized 系の応答を検出） |
| エラー | 接続または検出に失敗。詳細はログペインへ |
| オフ | `enabled: false` で停止中 |
| 「ツール n 個、プロンプト n 個、リソース n 個 を有効化」 | 接続成功。capability サマリ（プロンプト・リソースは 0 なら省略）。ツール数は `tools.include` / `exclude` 適用後の登録数 |

未保存のサーバー定義には「未保存 ─ 接続するには mcp.json を保存してください。」と表示され、保存するまで接続・認証・ツール切り替えはできない。

### バックグラウンドの健全性チェック

MCP タブを開いていなくても、ゲートウェイ接続時とその後 30 分ごとに、アクティブなプロファイルで有効な HTTP / SSE サーバーへ接続確認を行う。「認証が必要です」（OAuth トークンの失効など）または「エラー」へ状態が**変わった**ときだけ通知が出て、通知から MCP タブの「認証」ボタンへ直接移動できる。同じサーバーが不調のままでも再通知はしない。

- stdio サーバーはこのチェックの対象外。stdio の接続確認はローカルプロセスの起動を伴うため、ユーザーが設定したコマンドをバックグラウンドで勝手に実行しない設計になっている。
- 接続確認の結果は MCP タブと共有される 5 分間のキャッシュに入り、同じ構成のサーバーを両方の経路で二重に確認しない。手動の再取得・認証・有効化はキャッシュを無視して再確認する。

### 他ツールの設定を貼り付けられる

mcp.json エディタは、素の「名前 → 設定」マップに加えて `{"mcpServers": {...}}` ラッパー形式（Cursor / Claude などのエコシステム形式）も受け付ける。貼り付けた定義の `type` キーは読み込み時に Hermes の `transport` キーへ正規化される。

### 貼り付けて追加（インポート）

エディタを直接編集せずに追加するには「インポート」ボタンを使う。貼り付け欄のプレースホルダーは「mcp.json スニペット、npx/docker コマンド、claude mcp add 行、URL、Cursor リンクを貼り付け…」で、次の形式を自動判別する。

- mcp.json のスニペット（`mcpServers` ラッパーの有無を問わない）
- `npx ...` / `docker run ...` のコマンド行（stdio サーバーとして解釈）
- `claude mcp add ...` のコマンド行
- リモートサーバーの URL（HTTP サーバーとして解釈）
- Cursor の `Add to Cursor` 形式のリンク

認識できると「mcp.json に追加」（複数なら「N 件のサーバーを mcp.json に追加」）ボタンが有効になり、押すとエディタの定義に追記される。認識できない場合は「貼り付けたテキストからサーバー設定を認識できませんでした。」と表示される。追記後は通常どおり「保存」して接続する。

### コストと使用量の表示

各サーバー行には、接続確認（プローブ）で得たツールスキーマから概算した「1 呼び出しあたり約 N トークン」と、使用状況分析（直近 30 日）から集計した「過去 30 日で N 回使用」または「未使用」が表示される。使用量は 10 分間キャッシュされ、分析が取得できない場合は表示が省略されるだけでエラーにはならない。トークン概算は、そのサーバーのツール定義がシステムプロンプトに載る分のコストの目安で、使っていないサーバーを無効化する判断材料になる。

## サーバー追加の手順

前提: ゲートウェイに接続済みであること（未接続時は保存後の自動反映（reload）がスキップされ、再接続後に反映される）。

1. サイドバーの「スキルとツール」を開き、「MCP」タブを選ぶ。
2. 「新しいサーバー」を押すか、mcp.json エディタへ定義を直接書くか、「インポート」に他ツールの設定やコマンド行を貼り付けて「mcp.json に追加」し、「保存」する。
3. 状態行が「接続中…」から capability サマリ（例: 「ツール 12 個 を有効化」）に変われば成功。
4. 「認証が必要です」と表示された場合は「認証」ボタンを押す。ブラウザで認証を完了すると「認証済み」の通知（サーバー名とツール数）が出て、サーバー JSON に `auth: "oauth"` が保存される。

失敗した場合は状態行が「エラー」になる。下部のログペインを `stdio` / `agent` で切り替えて原因を確認する。同じ内容は `agent.log` にも記録される。

## リンクからサーバーを追加する（hermes:// ディープリンク）

MCP ベンダーのサイトにある「Add to Hermes」型のボタンは、`hermes://mcp/install?name=<サーバー名>&config=<base64>` 形式のディープリンクでサーバー定義を渡す（Cursor の `cursor://.../mcp/install` と同じ考え方）。`config` は 1 サーバー分の設定 JSON を base64url（標準 base64 も可）でエンコードしたもの。

リンクを開いても設定は即座には書き込まれない。「MCP サーバーを追加しますか？」というダイアログに、サーバー名と、書き込まれる設定の全文が整形表示され、「サーバーを追加」を押すまで何も変更されない。説明文は「リンクがこの MCP サーバーを Hermes に追加するよう要求しました。下の設定はリンク側から来たものです。内容を必ず確認してください。」。

- `command` を持つ stdio 定義には「このサーバーは下記のコマンドでローカルプロセスを実行します。提供元を信頼できる場合のみ続行してください。」という注意が追加表示される。
- 同名のサーバーが既にある場合は上書きされず、「<名前> という名前のサーバーは既に存在します。別の名前にするかキャンセルしてください。」と表示されて、名前を変えるまで追加できない。
- 名前は 1〜64 文字の英数字・ドット・ハイフン・アンダースコアに限られる。設定は `url`（`http://` / `https://` のみ）または `command` を持つ JSON オブジェクトで、デコード後 32KB 以内。これらに反するリンクは「MCP インストールリンクを拒否しました」の通知とともに拒否される。

追加後は通常のサーバーと同じく「接続中…」から capability サマリへ変われば成功。定義の内容（実行コマンド、URL、環境変数）は追加前にダイアログで必ず確認する。

## 有効/無効の正式キー

サーバーを停止する正式なキーは `enabled: false`。有効/無効スイッチの表示と実行時ゲートの両方が同じ `enabled` キーを読む。

## stdio の最小例

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed"],
  "env": {}
}
```

Hermes がローカル子プロセスを起動する。`command`, `args`, `env` を使う。許可するパスを必要最小限にする。

## HTTP の最小例

```json
{
  "url": "https://mcp.example.com/mcp",
  "headers": {
    "Authorization": "Bearer ${MCP_TOKEN}"
  }
}
```

リモート MCP エンドポイントへ接続する。認証情報を JSON に直書きせず、可能なら環境変数参照や OAuth を使う。

OAuth 対応例:

```json
{
  "url": "https://mcp.example.com/mcp",
  "auth": "oauth"
}
```

## OAuth の詳細設定

- デスクトップとダッシュボードの GUI から OAuth 認証を完結できる（hosted OAuth）。画面の「認証」ボタンはシステムブラウザを開き、トークンの保存を確認してから完了する。
- プロキシ / WAF 環境向けに `oauth` ブロックで `redirect_uri` と `redirect_host` を設定できる。

```json
{
  "url": "https://mcp.example.com/mcp",
  "auth": "oauth",
  "oauth": {
    "redirect_uri": "https://oauth.example.ts.net/callback"
  }
}
```

| 内部キー（`oauth` 内） | 既定 | 用途 |
|---|---|---|
| `client_id` / `client_secret` | 未設定（動的登録） | 事前登録済みクライアントを使う場合に指定 |
| `scope` | サーバー提供値 | 要求スコープの上書き |
| `redirect_port` | `0`（空きポート自動選択） | コールバック用ローカルポートの固定 |
| `redirect_uri` | 未設定（ループバック） | プロキシ経由のコールバック URL。公式ドキュメントは Tailscale Funnel で公開 HTTPS URL をコールバックポートへ転送する構成を例示する |
| `redirect_host` | `127.0.0.1` | ループバックコールバックのホスト名。一部プロバイダの WAF は `127.0.0.1` を含む authorize リクエストを拒否するため、`"redirect_host": "localhost"` で回避できる。リスナーの bind は `127.0.0.1` のまま |
| `client_name` | `Hermes Agent` | 動的登録時のクライアント名 |

## ツール名の命名規約

エージェントに登録される MCP ツール名は `mcp__<サーバー名>__<ツール名>` 形式である（Claude Code / Codex / OpenCode と共通の規約）。サーバー名・ツール名の英数字とアンダースコア以外の文字は `_` に置換される。ログや設定でツールを参照するときはこの形式で現れる。

## サーバー JSON の全キー

| 内部キー（JSON） | 型 | 対象 | 製品既定値 | 用途 |
|---|---|---|---|---|
| `command` | 文字列 | stdio | 未設定 | 起動する実行ファイル |
| `args` | 配列 | stdio | `[]` | 実行ファイルへ渡す引数 |
| `env` | オブジェクト | stdio | `{}` | 子プロセスへ明示的に渡す環境変数。ホストの全環境は渡されない |
| `url` | 文字列 | HTTP | 未設定 | Streamable HTTP / SSE のリモート MCP URL |
| `transport` | 文字列 | HTTP | 未設定（実効: URL は Streamable HTTP、`sse` 指定時だけ SSE） | HTTP transport を明示的に選ぶ |
| `headers` | オブジェクト | HTTP | `{}` | リクエストヘッダー |
| `ssl_verify` | 真偽値または文字列 | HTTP | `true` | `true` はシステム CA、`false` は検証無効、文字列は CA bundle のパス |
| `client_cert` | 文字列または配列 | HTTP | 未設定 | mTLS 証明書。結合 PEM、`[cert, key]`、`[cert, key, password]` |
| `client_key` | 文字列 | HTTP | 未設定 | 証明書と秘密鍵が別ファイルの場合の秘密鍵パス |
| `skip_preflight` | 真偽値 | HTTP | `false` | Streamable HTTP のコンテンツタイプ事前プローブを省略 |
| `enabled` | 真偽値 | 両方 | `true` | `false` で接続・検出・登録をすべて停止 |
| `timeout` | 数値 | 両方 | `300` 秒 | 1回のツール呼び出しタイムアウト |
| `connect_timeout` | 数値 | 両方 | `60` 秒 | 初回接続タイムアウト |
| `keepalive_interval` | 数値 | 両方 | `180` 秒（下限 5 秒） | 生存確認 ping の間隔。アイドルセッションをすぐ破棄するサーバーでは短くする |
| `idle_timeout_seconds` | 数値 | stdio | 未設定（無効） | 最後のツール呼び出しからこの秒数を超えた stdio 子プロセスを自動リサイクル |
| `max_lifetime_seconds` | 数値 | stdio | 未設定（無効） | 起動からこの秒数を超えた stdio 子プロセスを自動リサイクル |
| `supports_parallel_tool_calls` | 真偽値 | 両方 | `false` | 同じサーバーのツールを並列実行可能と宣言 |
| `tools` | オブジェクト | 両方 | `{}` | ツールの公開範囲とリソース・プロンプト方針 |
| `auth` | 文字列 | HTTP | 未設定 | `oauth` で OAuth 2.1 PKCE を有効化 |
| `oauth` | オブジェクト | HTTP | `{}` | OAuth の詳細設定（`redirect_uri`, `redirect_host` 等。上記参照） |
| `sampling` | オブジェクト | 両方 | `{}`（内部項目は下表） | MCP サーバーから Hermes への LLM 推論要求ポリシー |

> [!warning] TLS
> `ssl_verify: false` はサーバー証明書を検証しない。実サービスでは使わず、プライベート CA は CA bundle のパスを指定する。

> [!note] stdio サーバーの自動リサイクル
> `idle_timeout_seconds` / `max_lifetime_seconds` は、上限に達した stdio 子プロセスを自動的に再起動（リサイクル）する。両キーは `lifecycle: {...}` の下にまとめて書くこともでき、`0` は無効を意味する。ブラウザ自動化系（Playwright など）のように長時間常駐でメモリを抱えやすいサーバーの肥大化対策に使える。既定は両方とも未設定（リサイクルしない）。

## `tools` の全キー

| 内部キー（JSON） | 型 | 製品既定値 | 動作 |
|---|---|---|---|
| `include` | 文字列または配列 | 未設定（全ツール対象） | 指定したサーバー固有ツールだけを登録 |
| `exclude` | 文字列または配列 | 未設定（除外なし） | `include` がない場合、指定ツールを登録しない |
| `resources` | 真偽値相当 | `true` | `list_resources`, `read_resource` の登録を許可 |
| `prompts` | 真偽値相当 | `true` | `list_prompts`, `get_prompt` の登録を許可 |

`include` と `exclude` を両方設定した場合は `include` が優先する。リソース・プロンプトを許可しても、サーバー自体が対応していなければユーティリティは現れない。

接続済みサーバーのツール名チップをクリックするとこの `include` / `exclude` が書き換わる（`include` 設定があればそちらを、なければ `exclude` の denylist を維持したまま切り替える）。

## `sampling` の全キー

Sampling は、MCP サーバーが `sampling/createMessage` で Hermes のモデル推論を利用する機能。SDK 対応時は既定で有効。

| 内部キー（JSON） | 既定 | 動作 |
|---|---:|---|
| `enabled` | `true` | Sampling を許可・拒否 |
| `model` | 未指定 | Sampling 専用モデルを上書き |
| `max_tokens_cap` | `4096` | 1応答の最大トークン |
| `timeout` | `30` 秒 | 1要求のタイムアウト |
| `max_rpm` | `10` | 1分あたりの最大要求数 |
| `max_tool_rounds` | `5` | Sampling 内のツール反復上限 |
| `allowed_models` | 空配列 | サーバーが要求できるモデルの許可リスト。空は制限なし |
| `log_level` | `info` | `debug`, `info`, `warning` の監査ログレベル |

## MCP ランタイム設定（`mcp.*`）

サーバー個別の定義とは別に、設定ルートの `mcp` セクションでランタイム挙動を制御できる。

| 内部キー | 製品既定値 | 動作 |
|---|---|---|
| `mcp.auto_reload_on_config_change` | `true` | `config.yaml` の `mcp_servers` セクションが実行中に変更されたとき（CLI のファイルウォッチャー検知）、MCP 接続を自動で再読み込みする |

自動リロードは毎回エージェントのツール一覧を再構築し、プロバイダーのプロンプトキャッシュを無効化する（次のメッセージで入力プレフィックスを再送する）。長コンテキスト・高推論のモデルではこのコストが大きいため、`false` にして `/reload-mcp` で明示的に適用する運用も選べる。`false` でもウォッチャーは変更を検知し、適用方法を案内する。

## MCP カタログ

左列はサーバー一覧と Nous 承認カタログ表示を切り替えられ、カタログからサーバーをインストールできる。カタログの情報は登録済みサーバーの説明文の補完にも使われ、インストール後は自動で再取得される。カタログには Blender 連携（`ahujasid/blender-mcp`）などが含まれる。

- `ahujasid/blender-mcp` 1.6.4 を `uvx` で起動する（バージョン固定。カタログは自動更新しない）。
- サーバーは 22 ツールを公開するが、既定では中核の 4 ツールだけが有効化される: `get_scene_info`, `get_object_info`, `get_viewport_screenshot`, `execute_blender_code`。残りは PolyHaven / Sketchfab 等のアセットサービス連携用で、必要になったら個別に有効化する。
- 上流の匿名テレメトリはカタログ定義の `DISABLE_TELEMETRY: "true"` で無効化されている。
- 利用には Blender 側でアドオンのセットアップが別途必要（アドオンが `127.0.0.1:9876` のローカルソケットを開き、stdio サーバーが中継する）。

## ログ通知

MCP サーバーが送る `notifications/message` ログ通知は、サーバー名タグ付きで `agent.log` に記録される。1 件あたり 2000 文字で切り詰められる。画面下部のログペインでも `stdio` / `agent` を切り替えて確認できる。

## 反映タイミング

保存・有効/無効の切り替え・削除・認証は、即座に live セッションへ自動反映される（内部で `reload.mcp` を自動実行）。手動の「再読み込み」ボタンはなく、保存すればそのまま反映される。新しいツールスキーマは **次の新しいターン** から使われる。ゲートウェイ未接続時は自動反映（reload）がスキップされ、再接続後に反映される。

CLI 側で `config.yaml` を直接編集した場合は、`mcp.auto_reload_on_config_change`（既定オン）により自動で再読み込みされる。

`approvals.mcp_reload_confirm`（既定オン）は、TUI の `/reload-mcp` コマンドで再読み込みするときに確認を挟むゲート（プロンプトキャッシュ無効化の警告をトランスクリプトに表示する）。デスクトップの自動反映は `confirm` 済みで実行されるため、このゲートによる確認は挟まれない。

## 推奨チェック

1. 配布元と実行コマンドを確認する。
2. stdio の `env` とアクセス可能なパスを最小化する。
3. HTTP は HTTPS、ホスト名、認証方式を確認する。
4. `tools.include`（または画面のツール名チップ）で必要なツールだけ公開する。
5. 未信頼サーバーでは `sampling.enabled: false` にする。
6. 書き込み系ツールを並列化しない。
7. 保存すると自動反映される。新しいターンで動作確認し、ステータス行とログペインで接続状態を確かめる。

公式: [MCP ガイド](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp) / [MCP Config Reference](https://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference)
