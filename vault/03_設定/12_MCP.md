---
title: MCP
description: Hermes DesktopでMCPサーバーを登録、接続、認証、無効化するときの設定項目と安全上の注意。v0.19でスキルとツール画面へ移動。
slug: settings/mcp
sidebar:
  order: 13
tags:
  - hermes
  - settings
  - mcp
audience:
  - Hermes Desktop利用者
status: verified
hermes_version: 0.19.0
hermes_commit: '967e078a'
verified: '2026-07-22'
---

外部の Model Context Protocol サーバーを追加し、Hermes にツールを公開する。

![](@editorial/editorial-11-hermes-emblem.webp)

> [!note] v0.19.0 で設定画面から移動
> 設定画面の MCP タブは v0.19.0 で削除され、サイドバーの「スキルとツール」（Capabilities）画面の「MCP」タブ（`/skills?tab=mcp`）へ移動した。旧ディープリンク `/settings?tab=mcp` は新しい場所へ自動リダイレクトされ、`server=` 付きのブックマークでも選択中のサーバーが引き継がれる（2026-07-22 実機ソースで確認）。

## 画面構成（v0.19.0）

新しい MCP タブは、左列がサーバー一覧とサーバー詳細、右側が mcp.json エディタ、下部がログペインという構成になった。旧設定画面の「名前」「サーバー JSON」「サーバーを保存」のサーバー単位フォームは廃止され、`mcp_servers` 全体を 1 つの JSON ドキュメントとして編集する。

| 画面表示（主） | 内部キー・操作（サブ） | 動作 |
|---|---|---|
| 新しいサーバー | UI 下書き、保存キーなし | 空のサーバー定義をエディタに追加 |
| 再取得（更新アイコン、ツールチップ「MCP を再読み込み」） | 単一サーバーの再プローブ | 選択サーバーへ再接続してツール一覧・状態を更新（表示のみ。live 反映は保存時に自動実行される） |
| サーバー一覧の各行 | `mcp_servers.<name>` | ステータスドットと状態行を表示。選択で詳細を開く |
| 有効/無効スイッチ | `enabled` | オフで `enabled: false` を書き込み、オンで `enabled` キーを削除 |
| 認証 | OAuth 2.1 PKCE フロー | ブラウザで OAuth 認証。実行中は「ブラウザを待機中…」 |
| ツール名チップ | `tools.include` / `tools.exclude` | クリックでツールを個別に有効/無効化。無効は取り消し線表示 |
| 削除 | `mcp_servers.<name>` を削除 | 選択サーバーを設定から削除 |
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

### 他ツールの設定を貼り付けられる

mcp.json エディタは、素の「名前 → 設定」マップに加えて `{"mcpServers": {...}}` ラッパー形式（Cursor / Claude などのエコシステム形式）も受け付ける。貼り付けた定義の `type` キーは読み込み時に Hermes の `transport` キーへ正規化される。

## サーバー追加の手順

前提: ゲートウェイに接続済みであること（未接続時は保存後の自動反映（reload）がスキップされ、再接続後に反映される）。

1. サイドバーの「スキルとツール」を開き、「MCP」タブを選ぶ。
2. 「新しいサーバー」を押すか、mcp.json エディタへ定義を直接書き、「保存」する。
3. 状態行が「接続中…」から capability サマリ（例: 「ツール 12 個 を有効化」）に変われば成功。
4. 「認証が必要です」と表示された場合は「認証」ボタンを押す。ブラウザで認証を完了すると「認証済み」の通知（サーバー名とツール数）が出て、サーバー JSON に `auth: "oauth"` が保存される。

失敗した場合は状態行が「エラー」になる。下部のログペインを `stdio` / `agent` で切り替えて原因を確認する。同じ内容は `agent.log` にも記録される。

## 有効/無効の正式キー

サーバーを停止する正式なキーは `enabled: false`。v0.19.0 の新画面では、有効/無効スイッチの表示と実行時ゲートの両方が同じ `enabled` キーを読むよう統一された。

> [!note] v0.17 時点の「無効」バッジ注意（新画面で解消）
> v0.17.0 の旧設定画面では「無効」バッジの表示だけを `disabled: true` で判定しており、実際のランタイム停止キー `enabled: false` と食い違っていた。v0.19.0 の新画面はスイッチ・実行時判定とも `enabled` キーに一本化されており、この不一致は解消している（2026-07-22 実機ソースで確認）。

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

## OAuth の詳細設定（v0.19.0）

v0.19.0 で MCP の OAuth まわりが大きく更新された。

- デスクトップとダッシュボードの GUI から OAuth 認証を完結できるようになった（hosted OAuth の完成）。画面の「認証」ボタンはシステムブラウザを開き、トークンの保存を確認してから完了する。
- OAuth コールバック用ポートの自動選択で起きていた競合（複数サーバーの同時認証時のポート競合）が解消された。
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

## ツール名の命名規約（v0.19.0）

エージェントに登録される MCP ツール名は `mcp__<サーバー名>__<ツール名>` 形式に統一された（Claude Code / Codex / OpenCode と共通の規約）。サーバー名・ツール名の英数字とアンダースコア以外の文字は `_` に置換される。ログや設定でツールを参照するときはこの形式で現れる。

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

> [!note] stdio サーバーの自動リサイクル（v0.19.0）
> `idle_timeout_seconds` / `max_lifetime_seconds` は、上限に達した stdio 子プロセスを自動的に再起動（リサイクル）する。両キーは `lifecycle: {...}` の下にまとめて書くこともでき、`0` は無効を意味する。ブラウザ自動化系（Playwright など）のように長時間常駐でメモリを抱えやすいサーバーの肥大化対策に使える。既定は両方とも未設定（リサイクルしない）。

## `tools` の全キー

| 内部キー（JSON） | 型 | 製品既定値 | 動作 |
|---|---|---|---|
| `include` | 文字列または配列 | 未設定（全ツール対象） | 指定したサーバー固有ツールだけを登録 |
| `exclude` | 文字列または配列 | 未設定（除外なし） | `include` がない場合、指定ツールを登録しない |
| `resources` | 真偽値相当 | `true` | `list_resources`, `read_resource` の登録を許可 |
| `prompts` | 真偽値相当 | `true` | `list_prompts`, `get_prompt` の登録を許可 |

`include` と `exclude` を両方設定した場合は `include` が優先する。リソース・プロンプトを許可しても、サーバー自体が対応していなければユーティリティは現れない。

v0.19.0 の新画面では、接続済みサーバーのツール名チップをクリックするとこの `include` / `exclude` が書き換わる（`include` 設定があればそちらを、なければ `exclude` の denylist を維持したまま切り替える）。

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
| `mcp.auto_reload_on_config_change` | `true`（v0.19.0 の新既定） | `config.yaml` の `mcp_servers` セクションが実行中に変更されたとき（CLI のファイルウォッチャー検知）、MCP 接続を自動で再読み込みする |

自動リロードは毎回エージェントのツール一覧を再構築し、プロバイダーのプロンプトキャッシュを無効化する（次のメッセージで入力プレフィックスを再送する）。長コンテキスト・高推論のモデルではこのコストが大きいため、`false` にして `/reload-mcp` で明示的に適用する運用も選べる。`false` でもウォッチャーは変更を検知し、適用方法を案内する。

## MCP カタログ（v0.19.0 で Blender 追加）

新画面の左列はサーバー一覧と Nous 承認カタログ表示を切り替えられ、カタログからサーバーをインストールできる。v0.19.0 でカタログに Blender が追加された。

- `ahujasid/blender-mcp` 1.6.4 を `uvx` で起動する（バージョン固定。カタログは自動更新しない）。
- サーバーは 22 ツールを公開するが、既定では中核の 4 ツールだけが有効化される: `get_scene_info`, `get_object_info`, `get_viewport_screenshot`, `execute_blender_code`。残りは PolyHaven / Sketchfab 等のアセットサービス連携用で、必要になったら個別に有効化する。
- 上流の匿名テレメトリはカタログ定義の `DISABLE_TELEMETRY: "true"` で無効化済み。
- 利用には Blender 側でアドオンのセットアップが別途必要（アドオンが `127.0.0.1:9876` のローカルソケットを開き、stdio サーバーが中継する）。

## ログ通知（v0.19.0）

MCP サーバーが送る `notifications/message` ログ通知が、サーバー名タグ付きで `agent.log` に記録されるようになった（従来は破棄されており、ツール呼び出し中のサーバー側警告・エラーが見えなかった）。1 件あたり 2000 文字で切り詰められる。新画面下部のログペインでも `stdio` / `agent` を切り替えて確認できる。

## 反映タイミング

新画面では、保存・有効/無効の切り替え・削除・認証が即座に live セッションへ自動反映される（内部で `reload.mcp` を自動実行）。手動の「再読み込み」ボタンはなく、保存すればそのまま反映される。新しいツールスキーマは **次の新しいターン** から使われる。ゲートウェイ未接続時は自動反映（reload）がスキップされ、再接続後に反映される。

CLI 側で `config.yaml` を直接編集した場合は、`mcp.auto_reload_on_config_change`（既定オン）により自動で再読み込みされる。

`approvals.mcp_reload_confirm`（既定オン）は、TUI の `/reload-mcp` コマンドで再読み込みするときに確認を挟むゲート（プロンプトキャッシュ無効化の警告をトランスクリプトに表示する）。デスクトップの自動反映は `confirm` 済みで実行されるため、このゲートによる確認は挟まれない（2026-07-22 実機ソースで確認）。

## 推奨チェック

1. 配布元と実行コマンドを確認する。
2. stdio の `env` とアクセス可能なパスを最小化する。
3. HTTP は HTTPS、ホスト名、認証方式を確認する。
4. `tools.include`（または画面のツール名チップ）で必要なツールだけ公開する。
5. 未信頼サーバーでは `sampling.enabled: false` にする。
6. 書き込み系ツールを並列化しない。
7. 保存すると自動反映される。新しいターンで動作確認し、ステータス行とログペインで接続状態を確かめる。

公式: [MCP ガイド](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp) / [MCP Config Reference](https://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference)
