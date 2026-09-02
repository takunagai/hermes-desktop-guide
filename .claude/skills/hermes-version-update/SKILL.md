---
name: hermes-version-update
description: "Hermes Desktop ガイドを新バージョンへ追従させる定型手順。『Hermes が vX.Y.Z になった』『最新版に追従』『バージョン反映』『実機監査』で発動。実機ピン確定 → 並列ソース差分調査 → 実機スクショ撮影・照合 → 並列執筆 → 画像差し替え → 品質ゲート → デプロイまでを、スクリプトと委譲雛形で省力化する。"
---

# Hermes バージョン追従スキル

対象: このリポジトリ（Hermes Desktop ガイド）。前回の追従作業（v0.20.0 → v0.21.0、2026-09-02）で確立した手順を定型化したもの。スクリプトは `scripts/hermes-audit/`、委譲プロンプト雛形は `templates/` にある。

## 前提と判断原則

- 正本は実機チェックアウト `~/.hermes/hermes-agent`（git インストール）。**読み取りのみ**。`git fetch` / `checkout` / `stash` は禁止
- ガイドは実機コミットに**ピン留め**する（`hermes_commit` は引用付き 8 桁）。リリースノートとソースが食い違えばソース・実機を優先
- 各ページ本文に版数を書かない。変更の記録は `vault/06_リファレンス/04_変更履歴.md` に集約
- 探索・執筆はサブエージェントへ委譲し、親は 40 行サマリだけ受け取る（レポート本体は scratchpad）。使用上限で止まった子は、解除後に SendMessage「続きから」で再開できる
- GUI 操作は `rules/gui-automation.md` に従う。**着手前に「Mac を触らないで」と伝え、終了時に「OK」と伝える**。作成・保存・更新ボタンは押さない
- ユーザーが監査中に `hermes update` すると実機コミットが動く。撮影後・執筆後に `git rev-parse HEAD` を再確認し、動いていたら Phase 0 の差分確認をやり直して再ピンする

## Phase 0 ─ ピン確定（自分で実行、5 分）

```bash
OUT=<scratchpad>/audit
scripts/hermes-audit/preflight.sh $OUT <前回監査コミット8桁>
```

出力で確認: バージョン行、HEAD、`_config_version`、最新タグとその祖先関係、前回からのコミット数、設定関連 4 パスの diff stat、`diff-defaults.txt`（追加/削除/変更の件数）、`diff-commands.txt`。リリースノートは `$OUT/release-<tag>.md`。

前回コミットは memory `hermes-rolling-main-version-pinned` または `vault/06_リファレンス/02_バージョンと調査根拠.md` の対象表から取る。

## Phase 1 ─ ソース差分調査（並列 6 体）

`templates/prompts.md` の「調査」節を使い、同一メッセージで起動する。モデルは差分読解が要る A/B/C/E を opus、機械比較 D と vault マップ F を sonnet / explorer。

| 名前 | 担当 |
|---|---|
| A | 設定サイドバー構成 + モデル / プロバイダー / ツールとキー / 認証情報 |
| B | 外観 / チャット / 詳細 / メモリ / 音声 / プロファイルスコープ / Browser |
| C | ゲートウェイ / キーバインド既定（`lib/keybinds/actions.ts`）/ 通知 / 請求 / 情報 / プラグイン / 横断機能 |
| D | 既定値とコマンドの機械比較（Phase 0 の JSON を渡すだけで済むなら省略可） |
| E | 設定以外のデスクトップ変更（メインナビ・`plugins/`・新機能の UI 所在、ノートとの食い違い） |
| F | vault 全ページのトピック対応表と陳腐化しうる横断的主張 |

差分が 7,000 行を超えたら A/B/C の担当をさらに割る。全員に scratchpad へのレポート書き出しと `未確認` 欄を義務付ける。

## Phase 2 ─ 実機スクリーンショット（GUI 自動操作）

Hermes は Electron で AX ツリーを公開しないため、座標クリック + `screencapture`。詳細は memory `hermes-desktop-screenshot-capture`。

1. ユーザーに「数分 Mac を触らない」と伝える。撮影したい状態（ローカルゲートウェイか、`hermes desktop --local` 起動か）を先に確認する
2. `scripts/hermes-audit/capture/calibrate.sh $OUT/shots` → `00_calibrate_s.png` を Read し、カーソルが「モデル」に乗っていることを確認。乗っていなければ縮小画像の座標 × 1.18125 で `capture_settings.sh` の座標表を直す（内蔵ディスプレイ 1512x982 論理、ウィンドウ (40,40) 1420x900 が既定幾何）
3. `capture_settings.sh $OUT/shots`（`--local` 起動なら `HERMES_LOCAL=1` を付ける）
4. `52_cron_s.png` で cron モーダルの ✕ を実測して `CRON_CLOSE="x,y" capture_main.sh $OUT/shots`
5. `restore.sh $OUT/shots` で他アプリを再表示し、ユーザーに「OK」と伝える
6. 落とし穴: モーダルの ✕ は Esc で閉じない / サブビュー展開で下の項目が 33px ずつずれる / スクロールはマウス直下の容器が動くのでテーマ格子・ペット格子を避ける / 透過モーダルに背景が透けるので他アプリを隠す / hide 直後に Hermes が別ディスプレイへ戻ることがある

撮れない画面（SSH 登録が要る Managed updates、平文トークン警告 等）は無理に作らず「ソース根拠」と明記して残す。

## Phase 3 ─ スクショ照合（1 体、opus）

`templates/prompts.md` の「照合」節。全スクショを書き起こし、Phase 1 レポートの主張と突き合わせて「確認 / 未確認 / 食い違い」を判定させる。**調査エージェント同士の食い違い（例: F12 トグルの所在）はここで裁定**する。OCR の読み違い（例: ブレーンプリント / ブループリント）があるので、表記が争点なら原寸を切り出して自分で確認する。

## Phase 4 ─ 執筆（並列 5 体、hermes-docs-writer）

1. `templates/writer-common.md` をコピーし、プレースホルダを Phase 0〜3 の確定値で埋めて scratchpad に置く
2. `templates/prompts.md` の「執筆」節で W1〜W5 を起動（画面グループ別。新設ページのファイル名・slug・order は親が先に確定して雛形に書く）
3. サイドバー order の再採番（新設画面の挿入）と `astro.config.mjs` の変更は親が先にやる。writer は Edit のみで Write は新規ページに限る
4. 執筆中に届く申し送り（既定値変更・索引の件数・表記統一）はリファレンス担当（W4）へ SendMessage で転送する

## Phase 5 ─ 画像の切り出し・マスク・差し替え（1 体、opus）

`templates/prompts.md` の「加工」節。`scripts/hermes-audit/crop_mask.py` に渡す `jobs.json` を作らせ、`src/assets/screenshots/` へ出力させる。出力名は `settings-<slug末尾>.webp` を基本とし、writer と同じ名前表を渡す。マスク必須: リモート URL / IP、残高・プラン、セッション名、cron 名・プロンプト・実行履歴、ボット名と状態文、適用対象チップの `default` 以外、モデル選択値、絶対パス、コミットハッシュ、トークン断片、右ペインのファイル木。加工後に 2〜3 枚を自分で Read して確認する。

## Phase 6 ─ 整合と品質ゲート（自分で実行）

```bash
scripts/hermes-audit/bump_frontmatter.sh <version> <commit8> <YYYY-MM-DD>   # writer が触らなかったページも揃える
scripts/hermes-audit/check_refs.sh <version> <commit8> <YYYY-MM-DD>        # 画像参照・未参照画像・ピン・版数記載
npm run quality
```

`check_refs.sh` の版数検出は `00_ホーム.md` の更新履歴と `06_リファレンス` を除外している。UI 文言の引用に含まれる em ダッシュは許容。

## Phase 7 ─ コミット・デプロイ・記録

- コミットメッセージは前回（`git log --grep 'Hermes v0.2'`）の書式に揃える。`main` へ push すると Workers Builds が本番デプロイする。反映は `curl` で新規ページの 200 と画像名の埋め込みを実測する
- memory `hermes-rolling-main-version-pinned` の「現在の状態」をピン・画面数・件数で更新する
- 派生ドキュメントを見直す: `KNOWN_ISSUES.md`（設定画面の表示順とファイル接頭辞の対応表）、`README.md` の frontmatter 例のピン、`docs/` 配下の版数・ページ数の記述、`templates/writer-common.md` の例示値
- 残った未確認項目は本文に明記した状態で終える。ユーザーが「残課題も」と言ったら Phase 2 を条件付き（`--local` 起動、ゲートウェイ切替）で再実行する

## 所要の目安（v0.21.0 実績）

調査 6 体 15 分 → 撮影 20 分（座標校正の手戻り込み）→ 照合 10 分 → 執筆 5 体 30 分（上限停止で中断あり）→ 加工 10 分 → 品質・デプロイ 5 分。スクリプト化後は撮影と整合チェックが短縮される見込み。
