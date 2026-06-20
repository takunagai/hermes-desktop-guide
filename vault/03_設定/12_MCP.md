---
title: MCP
description: Hermes DesktopでMCPサーバーを登録、接続、無効化するときの設定項目と安全上の注意。
slug: settings/mcp
sidebar:
  order: 12
tags:
  - hermes
  - settings
  - mcp
audience:
  - Hermes Desktop利用者
status: verified
hermes_version: 0.17.0
verified: '2026-06-20'
---

外部の Model Context Protocol サーバーを追加し、Hermes にツールを公開する。

![](@editorial/editorial-11-hermes-emblem.webp)

## 画面項目

| 画面表示（主） | 内部キー・操作（サブ） | 製品既定値・初期状態 | 動作 |
|---|---|---|---|
| 新しいサーバー | UI 下書き、保存キーなし | 該当なし | 空のサーバー定義を作成 |
| MCP を再読み込み | Gateway RPC `reload.mcp` | 該当なし | 保存済み定義からサーバーとツールスキーマを更新 |
| サーバー一覧の各名前 | `mcp_servers.<name>` | `mcp_servers` なし、一覧は空 | 保存済みサーバーを選択 |
| サーバーを編集 | UI 見出し、保存キーなし | 選択なし | 選択サーバーの編集フォーム |
| 名前 | `mcp_servers` オブジェクトのキー | 空欄 | 一意なサーバー名 |
| サーバー JSON | `mcp_servers.<name>` の値 | `{"command":"","args":[],"env":{}}` | 1サーバー分の JSON オブジェクト |
| 削除 | `mcp_servers.<name>` を削除 | 該当なし | 選択サーバーを設定から削除 |
| サーバーを保存 | `mcp_servers.<name>` を保存 | 該当なし | JSON を保存。再読み込み後に適用 |

一覧のバッジは `stdio`, `http`, `custom` を示す。実行時にサーバーを無効化する正式なキーは `enabled: false`。

> [!warning] v0.17.0 の「無効」バッジ
> デスクトップ UI は「無効」バッジの表示だけを `disabled: true` で判定しているが、実際の MCP ランタイムは `enabled: false` で停止する。`disabled` は正式な停止キーではない。確実に停止するには `enabled: false` を使い、現行 UI ではバッジが出ない場合がある。

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
| `enabled` | 真偽値 | 両方 | `true` | `false` で接続・検出・登録をすべて停止 |
| `timeout` | 数値 | 両方 | `120` 秒 | 1回のツール呼び出しタイムアウト |
| `connect_timeout` | 数値 | 両方 | `60` 秒 | 初回接続タイムアウト |
| `supports_parallel_tool_calls` | 真偽値 | 両方 | `false` | 同じサーバーのツールを並列実行可能と宣言 |
| `tools` | オブジェクト | 両方 | `{}` | ツールの公開範囲とリソース・プロンプト方針 |
| `auth` | 文字列 | HTTP | 未設定 | `oauth` で OAuth 2.1 PKCE を有効化 |
| `sampling` | オブジェクト | 両方 | `{}`（内部項目は下表） | MCP サーバーから Hermes への LLM 推論要求ポリシー |

> [!warning] TLS
> `ssl_verify: false` はサーバー証明書を検証しない。実サービスでは使わず、プライベート CA は CA bundle のパスを指定する。

> [!note] `type` キー
> 保存後のサーバー JSON には、一覧バッジ（`stdio` / `http` / `custom`）に対応する `type` キーが付与されることがある（例: stdio サーバーでは `"type": "stdio"`）。最小例のように `type` を書かなくても、`command`/`args` か `url` の有無からトランスポートが判定される。

## `tools` の全キー

| 内部キー（JSON） | 型 | 製品既定値 | 動作 |
|---|---|---|---|
| `include` | 文字列または配列 | 未設定（全ツール対象） | 指定したサーバー固有ツールだけを登録 |
| `exclude` | 文字列または配列 | 未設定（除外なし） | `include` がない場合、指定ツールを登録しない |
| `resources` | 真偽値相当 | `true` | `list_resources`, `read_resource` の登録を許可 |
| `prompts` | 真偽値相当 | `true` | `list_prompts`, `get_prompt` の登録を許可 |

`include` と `exclude` を両方設定した場合は `include` が優先する。リソース・プロンプトを許可しても、サーバー自体が対応していなければユーティリティは現れない。

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

## 反映タイミング

保存だけでは実行中のツール一覧は変わらない。「MCP を再読み込み」を実行し、新しいツールスキーマは **次の新しいターン** から使われる。ゲートウェイが切断中は再読み込みできない。

`approvals.mcp_reload_confirm` がオンの場合は再読み込み時に確認が入る。安全のためオンを推奨する。

## 推奨チェック

1. 配布元と実行コマンドを確認する。
2. stdio の `env` とアクセス可能なパスを最小化する。
3. HTTP は HTTPS、ホスト名、認証方式を確認する。
4. `tools.include` で必要なツールだけ公開する。
5. 未信頼サーバーでは `sampling.enabled: false` にする。
6. 書き込み系ツールを並列化しない。
7. 保存後に再読み込みし、新しいターンで動作確認する。

公式: [MCP ガイド](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp) / [MCP Config Reference](https://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference)
