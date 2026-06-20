---
title: iMessage
description: Hermes DesktopでiMessageを使う2経路。Photon（Spectrum）とBlueBubblesの接続項目・CLIセットアップ・許可ユーザー設定。
slug: channels/imessage
sidebar:
  order: 2
tags:
  - hermes
  - channels
  - imessage
audience:
  - Hermes Desktop利用者
platforms:
  - macOS
status: needs-review
hermes_version: 0.17.0
hermes_commit: 857d024
verified: '2026-06-20'
---

> [!note] 確認状況
> v0.17 実機（ビルド `857d024`）のメッセージングパネルで Photon・BlueBubbles の両チャネルと設定項目を確認。CLI コマンド（`hermes photon …`）の実行結果そのものは要再確認。

iMessage で Hermes を使うには、Desktop のメッセージングパネルから 2 通りの経路がある。リレー不要で手早く始めるなら **Photon**、すでに BlueBubbles サーバーを運用しているなら **BlueBubbles**。

## Photon（Spectrum）

v0.17 で追加。リレー用サーバーを別途立てずにネイティブな iMessage 連携ができる。セットアップは CLI（`hermes photon …`）で行い、パネルでは挙動を調整する。

### セットアップ

- `hermes photon setup`: Spectrum のプロジェクト ID・シークレットを設定する。
- `hermes photon login`: デバイスコードで認証する。
- ダッシュボード: `https://app.photon.codes`（既定の Dashboard host）。

> [!note] パネルの必須欄
> Photon の必須欄は「トークン不要（セットアップガイドを使ってから有効化）」と表示される。実際の認証は上記 CLI で行う。

### 主な設定項目（抜粋）

| 項目 | 説明 |
|---|---|
| Allowed users | 許可する E.164 電話番号（カンマ区切り） |
| Allow all users?（true/false） | 開発用。許可リストを無効化する |
| Photon Spectrum project id / project secret | `hermes photon setup` で設定するプロジェクト ID とシークレット |
| Home Photon target | cron / 通知の既定送信先（電話番号・DM GUID・E.164） |
| Render replies as markdown?（true/false） | 返信を Markdown で送る。iMessage はそのまま描画、他 Spectrum プラットフォームはプレーン化（既定 true） |
| Require a mention in group chats?（true/false） | グループではメンション（ウェイクワード）時のみ反応（既定 true） |
| Enable reaction tapbacks?（true/false） | 処理状況をタップバックで示す（既定 false） |
| Auto-start the sidecar?（true/false） | 接続時に Node サイドカーを起動（既定 true） |
| Sidecar control port | サイドカー制御用ループバックポート（既定 `8789`） |

## BlueBubbles

従来からある経路。macOS 上で動く BlueBubbles サーバー（iMessage ブリッジ）の API を公開し、その URL とパスワードを Hermes に設定する。

### 主な設定項目

| 項目 | 必須 | 説明 |
|---|---|---|
| BlueBubbles server URL | 必須 | iMessage 連携用のサーバー URL（例 `http://192.168.1.10:1234`） |
| BlueBubbles server password | 必須 | BlueBubbles Server → Settings → API のパスワード |
| Allowed iMessage addresses | 推奨 | 許可するメール / 電話（カンマ区切り） |
| すべての iMessage ユーザーを許可 | 詳細 | `true` で許可リストをスキップ |

## どちらを使うか

- リレーを立てずに手早く始めたい → **Photon**。
- すでに BlueBubbles サーバーを運用している → **BlueBubbles**。

## 前提・操作・確認

- 前提: macOS で iMessage にサインイン済みであること。Photon は `hermes` CLI が使えること、BlueBubbles はサーバーが稼働していること。
- 操作: メッセージングパネルで該当チャネルを選び、認証 / 接続情報を設定して許可ユーザーを絞り、トグルを ON にする。
- 期待結果: iMessage から Hermes にメッセージを送ると応答が返る。
- 届かないとき: 認証状態、メッセージングゲートウェイの起動（[[03_設定/10_ゲートウェイ|ゲートウェイ]]）、許可ユーザー設定（[[08_連携/01_連携の全体像|連携の全体像]]）を確認する。

## 関連

- [[08_連携/01_連携の全体像|連携の全体像]]
- [[08_連携/03_メッセージング各種|メッセージング各種]]
