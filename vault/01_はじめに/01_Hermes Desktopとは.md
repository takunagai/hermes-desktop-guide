---
title: Hermes Desktopとは
description: Hermes Desktopの位置づけ、CLIやTUIとの関係、主な機能、対応OSを初めての利用者向けに説明する。
slug: getting-started/overview
sidebar:
  order: 1
tags:
  - hermes
  - desktop
  - overview
audience:
  - 初めてHermes Desktopを使う人
platforms:
  - macOS
  - Windows
  - Linux
status: verified
verified: 2026-06-08
---

Hermes Desktopは、Hermes Agentをチャット中心の画面から利用するデスクトップアプリです。公式ドキュメントによると、CLI、TUI、Web Dashboardとは別のエージェントではなく、設定、APIキー、セッション、スキル、メモリを同じHermes Agentコアと共有します。

![](@editorial/editorial-13-hermes-bust.webp)

## できること

- 複数のチャットセッションを管理する
- エージェントの応答とツール実行状況を確認する
- ファイルを添付し、作業フォルダ内のファイルを閲覧する
- プロバイダー、モデル、ツール、MCP、Gatewayを画面から設定する
- 音声入力・読み上げを利用する
- スキル、スケジュール、プロファイルなどを管理する

## 他の画面との使い分け

| 画面 | 向いている用途 |
|---|---|
| Desktop App | チャット、ファイル確認、設定、複数セッションの日常利用 |
| CLI / TUI | ターミナル中心の操作、自動化、リモート環境 |
| Web Dashboard | ブラウザーからの管理、リモートバックエンドの管理 |

同じHermes環境を使っている場合、ある画面で開始したセッションを別の画面から再開できます。

## 対応OS

公式のDesktop Appガイドでは、macOS、Windows、Linuxに対応すると案内されています。配布方法はOSによって異なるため、次に[[01_はじめに/02_インストール|インストール]]を確認してください。

## このガイドの範囲

このサイトはHermes Agent全体ではなく、主にHermes Desktopの導入、基本操作、画面設定、安全な利用を扱います。CLI固有の高度な運用は公式ドキュメントを参照してください。

## 公式情報

- [Hermes Desktop公式ガイド](https://hermes-agent.nousresearch.com/docs/user-guide/desktop)
- [Hermes Agent公式ドキュメント](https://hermes-agent.nousresearch.com/docs)
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
