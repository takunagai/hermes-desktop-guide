---
title: MCP
description: Hermes DesktopでMCPサーバーを登録、接続、認証、無効化するときの設定項目と安全上の注意。設定画面ではなくスキルとツール画面のConnectorsタブから操作する。
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
hermes_version: 0.22.1
hermes_commit: '297552a9'
verified: '2026-10-15'
---

外部の Model Context Protocol サーバーを追加し、Hermes にツールを公開する。

![](@editorial/editorial-11-hermes-emblem.webp)

> [!note] MCP は「スキルとツール > Connectors」タブから操作する
> MCP は設定画面の中にも独立したページにもなく、サイドバーの「スキルとツール」画面（`/capabilities`）の「Connectors」タブ（`/capabilities?tab=connectors`）から操作する。タブは「スキル」「ツールセット」「Connectors」「Plugins」の 4 つ。Connectors タブには、Nous が提供するホスト型アプリ（Managed）と、このコンピューター上の MCP サーバーが 1 つの一覧に並ぶ。旧ディープリンク `/settings?tab=mcp` は Connectors タブへ自動で転送され、`server=` 付きのブックマークでも選択中のサーバーが引き継がれる。

> [!note] 画面は英語表示
> Connectors タブの本文（タブ名、検索欄、フィルタ、カード、追加フォーム、ダイアログ）は、日本語リソース未整備のため日本語 UI でも英語で表示される。以下では画面の英語表記をそのまま使う。

## 画面構成

![スキルとツール > Connectors タブ](@screenshots/skills-connectors.webp)

タブ帯の下には「Configuring:」のプロファイル・接続先セレクタ（例: 「default — This device (current)」）があり、どのプロファイル・ゲートウェイの `mcp_servers` を編集するかを切り替えられる。その下が Connectors の一覧で、上から次の要素が並ぶ。

| 画面表示（主） | 内部キー・操作（サブ） | 動作 |
|---|---|---|
| Add your own | `mcp_servers` に 1 件追加 | 「Connect to a custom MCP」ダイアログで自分の MCP サーバーを追加する（後述） |
| Search N apps | 表示のみ | アプリ名・スラッグで絞り込む |
| フィルタ（All / Connected / On this device / Available / Turned off） | 表示のみ | 区分ごとの件数付きで絞り込む。表示されるのは、その時点で 1 件以上ある区分だけ（例: 未接続の環境では「All / On this device / Available」） |
| カード | `mcp_servers.<name>` またはホスト型アプリ | アイコン、名前、種類バッジ、状態、ボタン（Connect / Install など）。カードを押すと詳細ダイアログが開く |

一覧は区分ごとにまとまり、「Connected」（不調な接続を先頭に表示）→「On this device」→「Available」→「Turned off」（サインイン情報は保持される）の順に並ぶ。

### カードの種類

| 種類バッジ | 意味 |
|---|---|
| Managed | Nous が提供するホスト型アプリ。Nous Portal へのサインインが必要（未サインイン時は「Sign in to Nous to use managed apps.」）。Nous のアプリはプロファイルではなくアカウントに従う |
| MCP · Catalog | Hermes のカタログに載っている MCP サーバー。「Install」でこのコンピューターの `mcp_servers` に追加する |
| MCP · Custom | 自分で追加した MCP サーバー |
| MCP · Plugin （名前） | プラグインが提供する MCP サーバー。管理は「Plugins」タブで行う |

### 状態表示

このコンピューター上の MCP サーバーの状態は、カードと詳細ダイアログに次のように表示される。

| 表示 | 意味 |
|---|---|
| Connecting… | 接続・検出を実行中 |
| On | 接続済みで、ツールを使っている |
| On, unused | 接続済みだが、まだ使われていない |
| Needs authentication | OAuth 等の認証が未完了（401 / unauthorized 系の応答を検出）。「Authenticate」で認証する |
| Error | 接続または検出に失敗（「The server refused the connection.」）。「Open logs」でログを確認する |
| Off | `enabled: false` で停止中 |

ホスト型アプリでは「Connected」「Available」「Access expired」（「Reconnect」で再接続）「Could not connect」「Off for you」「Off by your organisation」などが表示される。ツール数は「N tools」「N tools, M on」のように、有効化の状態とあわせて表示される。

### 詳細ダイアログ

カードを押すと開くダイアログで、サーバー単位の操作を行う。

| 画面表示（主） | 内部キー・操作（サブ） | 動作 |
|---|---|---|
| 名前・状態バッジ・説明 | 表示のみ | 説明が無いローカルサーバーは、起動コマンドや URL を表示する |
| Connect / Install / Authenticate / Reconnect / Try again / Turn back on | 接続・インストール・認証 | 状態に応じたボタンが 1 つ表示される。認証はブラウザーで OAuth 2.1 PKCE フローを行う |
| サーバーのスイッチ（Turn （名前） on / off） | `enabled` | オフで `enabled: false` を書き込み、オンで `enabled` キーを削除 |
| What Hermes may do with （名前） | `tools.include` / `tools.exclude` | ツール一覧とスイッチ。「Read only」「Turn off destructive」「Everything on」の一括操作と、ツールごとのオン・オフができる |
| uses in 30 days / tokens per call | 表示のみ | 直近 30 日の使用回数と、ツールスキーマから概算した 1 呼び出しあたりのトークン数（後述「コストと使用量の表示」） |
| Advanced（the mcp.json entry and logs） | `mcp_servers.<name>` | そのサーバーの mcp.json エントリを JSON で編集するエディタと、ログペイン |
| More actions > Refresh tools | 単一サーバーの再プローブ | 再接続してツール一覧・状態を更新する |
| Remove （名前）? | `mcp_servers.<name>` を削除 | 「The entry leaves mcp.json on this computer. Nothing else is deleted.」の確認後に削除する |

同じアプリがホスト型とローカルの両方で動いている場合は、「Where （名前） runs」に両方が表示され、両方オンのままだと Hermes に同じツールが二重に見える旨の注意と「Turn off the local server」が出る。

### バックグラウンドの健全性チェック

Connectors タブを開いていなくても、ゲートウェイ接続時とその後 30 分ごとに、アクティブなプロファイルで有効な HTTP / SSE サーバーへ接続確認を行う。「認証が必要」（OAuth トークンの失効など）または「エラー」へ状態が**変わった**ときだけ通知が出て、通知から Connectors タブの該当サーバーへ直接移動できる。同じサーバーが不調のままでも再通知はしない。

- stdio サーバーはこのチェックの対象外。stdio の接続確認はローカルプロセスの起動を伴うため、ユーザーが設定したコマンドをバックグラウンドで勝手に実行しない設計になっている。
- 接続確認の結果は Connectors タブと共有される 5 分間のキャッシュに入り、同じ構成のサーバーを両方の経路で二重に確認しない。手動の再取得・認証・有効化はキャッシュを無視して再確認する。

### 他ツールの設定を貼り付けられる

mcp.json のエディタは、素の「名前 → 設定」マップに加えて `{"mcpServers": {...}}` ラッパー形式（Cursor / Claude などのエコシステム形式）も受け付ける。貼り付けた定義の `type` キーは読み込み時に Hermes の `transport` キーへ正規化される。

### 自分のサーバーを追加する（Add your own）

「Add your own」を押すと「Connect to a custom MCP」ダイアログが開く（mcp.json に 1 件追加する操作）。

| 画面表示（主） | 内部キー（サブ） | 内容 |
|---|---|---|
| Paste a command or a snippet | 表示のみ | 他ツールの設定やコマンド行を貼り付けると、下の欄へ自動入力する |
| Name | `mcp_servers.<name>` | サーバー名。既存の名前と重なると「That name is already used.」 |
| Type | `transport` | `STDIO` または `Streamable HTTP` |
| Command to launch / Arguments / Environment variables / Environment variable passthrough / Working directory | `command` / `args` / `env` ほか | STDIO のとき |
| URL / Headers / Auth（None / OAuth / Bearer token） | `url` / `headers` / `auth` | Streamable HTTP のとき |
| Edit mcp.json | ─ | フォームの代わりに JSON で直接書く |

貼り付け欄は次の形式を自動判別する。

- mcp.json のスニペット（`mcpServers` ラッパーの有無を問わない）
- `npx ...` / `docker run ...` のコマンド行（stdio サーバーとして解釈）
- `claude mcp add ...` のコマンド行
- リモートサーバーの URL（HTTP サーバーとして解釈）
- Cursor の `Add to Cursor` 形式のリンク

認識できない場合は「Nothing here reads as a server. Fill the fields below instead.」と表示されるので、各欄を手で入力する。

### コストと使用量の表示

詳細ダイアログには、接続確認（プローブ）で得たツールスキーマから概算した「tokens per call」（1 呼び出しあたりのトークン数）と、使用状況分析（直近 30 日）から集計した「uses in 30 days」（使用回数）が表示される。使用量は 10 分間キャッシュされ、分析が取得できない場合は表示が省略されるだけでエラーにはならない。トークン概算は、そのサーバーのツール定義がシステムプロンプトに載る分のコストの目安で、使っていないサーバーを無効化する判断材料になる。

## サーバー追加の手順

前提: ゲートウェイに接続済みであること（未接続時は保存後の自動反映（reload）がスキップされ、再接続後に反映される）。

1. サイドバーの「スキルとツール」を開き、「Connectors」タブを選ぶ。複数のプロファイルを使っている場合は「Configuring:」で追加先を確認する。
2. カタログにあるサーバーなら、検索してカードの「Install」を押す。自分のサーバーなら「Add your own」を押し、貼り付け欄にコマンド行やスニペットを貼るか各欄を入力して保存する。
3. カードが「On this device」の区分に現れ、状態が「Connecting…」から「On」または「On, unused」とツール数の表示に変われば成功。
4. 「Needs authentication」と表示された場合は、カードを開いて「Authenticate」を押す。ブラウザーで認証を完了すると認証済みの通知（サーバー名とツール数）が出て、サーバー JSON に `auth: "oauth"` が保存される。

失敗した場合は状態が「Error」になる。カードを開いて「Open logs」または「Advanced」のログペインを `stdio` / `agent` で切り替えて原因を確認する。同じ内容は `agent.log` にも記録される。

## リンクからサーバーを追加する（hermes:// ディープリンク）

MCP ベンダーのサイトにある「Add to Hermes」型のボタンは、`hermes://mcp/install?name=<サーバー名>&config=<base64>` 形式のディープリンクでサーバー定義を渡す（Cursor の `cursor://.../mcp/install` と同じ考え方）。`config` は 1 サーバー分の設定 JSON を base64url（標準 base64 も可）でエンコードしたもの。

リンクを開いても設定は即座には書き込まれない。「MCP サーバーを追加しますか？」というダイアログに、サーバー名と、書き込まれる設定の全文が整形表示され、「サーバーを追加」を押すまで何も変更されない。説明文は「リンクがこの MCP サーバーを Hermes に追加するよう要求しました。下の設定はリンク側から来たものです。内容を必ず確認してください。」。

- `command` を持つ stdio 定義には「このサーバーは下記のコマンドでローカルプロセスを実行します。提供元を信頼できる場合のみ続行してください。」という注意が追加表示される。
- 同名のサーバーが既にある場合は上書きされず、「<名前> という名前のサーバーは既に存在します。別の名前にするかキャンセルしてください。」と表示されて、名前を変えるまで追加できない。
- 名前は 1〜64 文字の英数字・ドット・ハイフン・アンダースコアに限られる。設定は `url`（`http://` / `https://` のみ）または `command` を持つ JSON オブジェクトで、デコード後 32KB 以内。これらに反するリンクは「MCP インストールリンクを拒否しました」の通知とともに拒否される。

追加後は通常のサーバーと同じく、Connectors タブで状態が「Connecting…」から「On」または「On, unused」へ変われば成功。定義の内容（実行コマンド、URL、環境変数）は追加前にダイアログで必ず確認する。

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

- デスクトップとダッシュボードの GUI から OAuth 認証を完結できる（hosted OAuth）。Connectors タブの「Authenticate」ボタンはシステムブラウザを開き、トークンの保存を確認してから完了する。
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

Connectors タブの詳細ダイアログでツールのスイッチを切り替えるとこの `include` / `exclude` が書き換わる（`include` 設定があればそちらを、なければ `exclude` の denylist を維持したまま切り替える）。

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

Connectors タブの「MCP · Catalog」のカードが Nous 承認カタログのサーバーで、「Install」でインストールできる。カタログの情報は登録済みサーバーの説明文の補完にも使われ、インストール後は自動で再取得される。カタログには Blender 連携（`ahujasid/blender-mcp`）などが含まれる。

- `ahujasid/blender-mcp` 1.6.4 を `uvx` で起動する（バージョン固定。カタログは自動更新しない）。
- サーバーは 22 ツールを公開するが、既定では中核の 4 ツールだけが有効化される: `get_scene_info`, `get_object_info`, `get_viewport_screenshot`, `execute_blender_code`。残りは PolyHaven / Sketchfab 等のアセットサービス連携用で、必要になったら個別に有効化する。
- 上流の匿名テレメトリはカタログ定義の `DISABLE_TELEMETRY: "true"` で無効化されている。
- 利用には Blender 側でアドオンのセットアップが別途必要（アドオンが `127.0.0.1:9876` のローカルソケットを開き、stdio サーバーが中継する）。

## ログ通知

MCP サーバーが送る `notifications/message` ログ通知は、サーバー名タグ付きで `agent.log` に記録される。1 件あたり 2000 文字で切り詰められる。Connectors タブでは、サーバーの詳細ダイアログの「Advanced」にあるログペインで `stdio` / `agent` を切り替えて確認できる。

## 反映タイミング

保存・有効/無効の切り替え・削除・認証は、即座に live セッションへ自動反映される（内部で `reload.mcp` を自動実行）。手動の「再読み込み」ボタンはなく、保存すればそのまま反映される。新しいツールスキーマは **次の新しいターン** から使われる。ゲートウェイ未接続時は自動反映（reload）がスキップされ、再接続後に反映される。

CLI 側で `config.yaml` を直接編集した場合は、`mcp.auto_reload_on_config_change`（既定オン）により自動で再読み込みされる。

`approvals.mcp_reload_confirm`（既定オン）は、TUI の `/reload-mcp` コマンドで再読み込みするときに確認を挟むゲート（プロンプトキャッシュ無効化の警告をトランスクリプトに表示する）。デスクトップの自動反映は `confirm` 済みで実行されるため、このゲートによる確認は挟まれない。

## 推奨チェック

1. 配布元と実行コマンドを確認する。
2. stdio の `env` とアクセス可能なパスを最小化する。
3. HTTP は HTTPS、ホスト名、認証方式を確認する。
4. `tools.include`（または詳細ダイアログのツールのスイッチ）で必要なツールだけ公開する。
5. 未信頼サーバーでは `sampling.enabled: false` にする。
6. 書き込み系ツールを並列化しない。
7. 保存すると自動反映される。新しいターンで動作確認し、カードの状態表示とログペインで接続状態を確かめる。

公式: [MCP ガイド](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp) / [MCP Config Reference](https://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference)
