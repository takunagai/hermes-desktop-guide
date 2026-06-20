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
status: verified
hermes_version: 0.17.0
hermes_commit: 857d024
verified: '2026-06-20'
---

> [!note] 確認状況
> v0.17 実機（ビルド `857d024`）のメッセージングパネルで Photon・BlueBubbles の両チャネルと設定項目を確認。接続項目・既定値・CLI コマンド構成はコミット `857d024` のソースと公式ドキュメントで照合済み。実際に iMessage で応答が返るかの end-to-end 動作は外部サービス（Photon Spectrum / BlueBubbles サーバー）依存のため未実行。

iMessage で Hermes を使うには、Desktop のメッセージングパネルから 2 通りの経路がある。リレー不要で手早く始めるなら **Photon**、すでに BlueBubbles サーバーを運用しているなら **BlueBubbles**。

## Photon（Spectrum）

v0.17 で追加。リレー用サーバーを別途立てずにネイティブな iMessage 連携ができる。セットアップは CLI（`hermes photon …`）で行い、パネルでは挙動を調整する。

### セットアップ

- `hermes photon setup`: 初回セットアップ一式を実行する（デバイスコード認証 → プロジェクト作成 → 電話番号登録 → サイドカー導入）。プロジェクト ID・シークレットは自動発行され `~/.hermes/.env` に保存される。
- `hermes photon status`: 認証・プロジェクト・サイドカー依存の状態を確認する。
- `hermes photon install-sidecar`: Node サイドカー（spectrum-ts）の依存を導入する。
- ダッシュボード: `https://app.photon.codes`（既定の Dashboard host）。

> [!note] 認証は setup 内で完結する
> デバイスコード認証は `hermes photon setup` の最初のステップとして自動実行される。独立した `hermes photon login` コマンドは無い。

> [!note] パネルの必須欄
> Photon の必須欄は「トークン不要（セットアップガイドを使ってから有効化）」と表示される。実際の認証と資格情報の設定は `hermes photon setup` で行う。

### 主な設定項目（抜粋）

| 項目 | 説明 |
|---|---|
| Allowed users | 許可する E.164 電話番号（カンマ区切り） |
| Allow all users?（true/false） | 開発用。許可リストを無効化する |
| Photon Spectrum project id / project secret | `hermes photon setup` で設定するプロジェクト ID とシークレット |
| Home Photon target | cron / 通知の既定送信先（Spectrum space id・DM GUID・E.164 電話番号のいずれか） |
| Render replies as markdown?（true/false） | 返信を Markdown で送る。iMessage はそのまま描画、他 Spectrum プラットフォームはプレーン化（既定 true） |
| Require a mention in group chats?（true/false） | グループではメンション（ウェイクワード）時のみ反応（既定 false） |
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
