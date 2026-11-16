---
title: 個人サイト改善ログ — セキュリティ・高速化・機能追加の記録
date: 2026-11-16
category: INFRASTRUCTURE
summary: 公開リポジトリの棚卸しから、秘密情報の切り分け、画像とCSSの高速化、テレメトリのグラフ化、記事紹介の統一まで。一晩で実施した改善作業のまとめ。
thumbnail: /heroImage/pc.webp
tags: [Docker, nginx, Tailwind, Security]
---

# 個人サイト改善ログ — セキュリティ・高速化・機能追加の記録

<p style="color:#64748b;font-size:0.9em;">2026年11月15日〜16日実施 ／ 対象: architectural-noise（このサイト）</p>

2026年11月15日から16日にかけて、このサイトに対して実施した改善作業のまとめ。
公開リポジトリの棚卸しから始まり、セキュリティ対策、表示の高速化、新機能の追加までを一気に実施した。

<div style="border:1px solid rgba(252,167,63,.5);background:rgba(252,167,63,.08);border-radius:12px;padding:12px 16px;">
<strong style="color:#d97706;">✦ 成果サマリー</strong><br>
画像 <strong>約26MB → 約1.5MB</strong> ／ CSS はブラウザ内生成から <strong>47KB の静的ファイル</strong>へ ／ favicon <strong>314KB → 7.5KB</strong> ／ 共有シークレットの<strong style="color:#dc2626;">分離とローテーション完了</strong>
</div>

## 1. 共有シークレットの切り分け <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(220,38,38,.12);color:#dc2626;font-size:0.7em;vertical-align:middle;">SECURITY</span>

テレメトリ用スクリプトと nginx 設定に直書きされていた共有シークレットを、コードの外に出した。

- Python 側は Portainer Stack の環境変数 `TELEMETRY_SECRET` から読む形に変更。未設定の場合は理由を表示して終了するようにした
- シークレットを受け取って表示していたデバッグ出力を削除
- nginx 側は秘密の行だけを `conf.d/telemetry_secret.inc` に切り出して `include` する形に分離。このファイルだけを Git 管理外にした
- 値はローテーション（再発行）済み。Git の履歴に旧値が残っていても無効化されている
- ホスト情報がそのまま出ていた生成ファイル（serverInfo の JSON、インフラ構成 JSON）も Git 管理外に変更

ポイントは「ファイルごと除外」ではなく<span style="color:#d97706;font-weight:600;">「秘密だけを分離」</span>したこと。設定ファイル自体はリポジトリに残るので、クローンすればサイトを再現できる状態を保てた。

## 2. サーバー情報 JSON の公開範囲の締め直し <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(220,38,38,.12);color:#dc2626;font-size:0.7em;vertical-align:middle;">SECURITY</span>

`serverInfo/info.json` はページ表示のために SSI で読み込んでいるが、URL を直接叩いても開けてしまう状態だった。nginx に内部リクエスト専用の location を追加し、<span style="color:#059669;font-weight:600;">外部からは 404、中からは今まで通り表示</span>、を両立させた。

- あわせて、Web ルートに置かれた Python スクリプト（`.py`）の直接ダウンロードも遮断
- 途中で一度、追加した location に `root` 指定が無く SSI の読み込みが失敗し、Server Information が全滅した。location ごとに root を書くこのサイトの流儀に合わせ、`root /usr/share/nginx/html;` を足して解消

## 3. 画像の WebP 化 <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(14,165,233,.12);color:#0284c7;font-size:0.7em;vertical-align:middle;">SPEED</span>

ヒーロー画像を中心に、サイト内の画像を Pillow 製の自作スクリプトで一括変換した。

- 幅 1920px へのリサイズ＋WebP 化。変換後のファイルが開けることを確認してから元ファイルを削除
- サブフォルダーも再帰的に対象にした
- 結果、ヒーロー画像の合計は<span style="color:#0284c7;font-weight:700;">約 26MB から約 1.5MB</span>になった
- 参照側（HTML・各種 config JSON）の拡張子も全て置換済み

## 4. Tailwind CSS のビルド済み化 <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(14,165,233,.12);color:#0284c7;font-size:0.7em;vertical-align:middle;">SPEED</span>

全ページで使っていた Tailwind Play CDN を廃止し、ビルド済み CSS に移行した。

- Play CDN は訪問者のブラウザ内で CSS を生成する仕組みで、表示開始が遅れる原因になっていた
- CLI で実際に使われているクラスだけを抽出した静的 CSS を生成。初回は約 32KB、Typography プラグイン追加後も<span style="color:#0284c7;font-weight:700;">約 47KB</span>に収まった
- motorcycle の記事本文で必要な Typography プラグイン（`prose`）は npm 方式のビルドに切り替えて取り込んだ
- 設定ファイル（tailwind.config.js、入力 CSS）と package.json / package-lock.json はコミットし、`node_modules` は Git 管理外に

移行中の教訓として、CSS の読み込み順序の問題があった。`tailwind.css` を自前 CSS より前に置くと、`.glass-card` の白い背景が Tailwind の濃色指定に勝ってしまい、プロフィールカードが白く読めなくなった。<span style="color:#d97706;font-weight:600;">生成 CSS は自前 CSS の後ろに置く</span>のがこのサイトの正解。

## 5. nginx の gzip 圧縮 <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(14,165,233,.12);color:#0284c7;font-size:0.7em;vertical-align:middle;">SPEED</span>

テキスト系コンテンツ（HTML / CSS / JS / JSON / SVG）に gzip を有効化した。設定数行で転送量を削減できる、費用対効果の高い改善。

## 6. favicon の軽量化 <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(14,165,233,.12);color:#0284c7;font-size:0.7em;vertical-align:middle;">SPEED</span>

<span style="color:#0284c7;font-weight:700;">314KB あった favicon.ico を約 7.5KB</span>に作り直した（16 / 32 / 48px の標準サイズだけの構成）。全ページで読み込まれるファイルなので、小さいが確実に効く。

## 7. テレメトリのグラフ化 <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(5,150,105,.12);color:#059669;font-size:0.7em;vertical-align:middle;">FEATURE</span>

Server Information ドロワーに「LIVE HISTORY」として、直近3分間の CPU / メモリ使用率の折れ線グラフを追加した。

- 既存の SSE（3秒間隔の配信）をそのまま使い、ブラウザ側で最大60点を保持して Canvas に描画する
- サーバー側に履歴は保存しない<span style="color:#059669;font-weight:600;">「使い捨て」方式</span>。開くたびにゼロから溜まっていくライブ感を優先した
- CPU はブランドカラーの<span style="color:#d97706;font-weight:600;">オレンジ</span>、メモリは<span style="color:#0284c7;font-weight:600;">水色</span>。数値表示とグラフが同じデータ源なので矛盾がない

## 8. コマンドパレットの復活 <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(5,150,105,.12);color:#059669;font-size:0.7em;vertical-align:middle;">FEATURE</span>

押しても何も起きなかった検索ボタンと Ctrl / ⌘+K のコマンドパレットを復活させた。

- 原因は、script.js 側のロジックは揃っているのに、モーダルの HTML 要素が全ページに存在しなかったこと
- 器となるモーダルを追加し、既存ロジックを無改造で動作させた
- 実装中、新規の Tailwind クラスが未ビルドで表示が崩れる問題があり、CSS の再ビルドと強制リロードで解消。以後の運用は `--watch` 常駐と npm scripts 化で再発を防ぐ

## 9. 記事リンク（openInspector）の 404 修正 <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(5,150,105,.12);color:#059669;font-size:0.7em;vertical-align:middle;">FEATURE</span>

トップページのプロジェクト詳細から最新記事へ飛ぶ導線で、一部カテゴリが 404 になっていた問題を修正した。

- 原因は、カテゴリ名と記事フォルダ名の不一致（design に対して room_design、infrastructure に対して infra）と、一部カテゴリの list.json 不在
- コード側に読み替えを足すのではなく、フォルダ側をカテゴリ名に合わせて再編する方針で統一した
- あわせて、list.json 内の古い画像参照（`.jpg` のまま残っていたもの）も WebP に修正

## 10. 記事紹介方式の統一 <span style="display:inline-block;padding:0.05em 0.6em;border-radius:9999px;background:rgba(5,150,105,.12);color:#059669;font-size:0.7em;vertical-align:middle;">FEATURE</span>

記事の紹介方法を、motorcycle 以外の全カテゴリで room_design と同じ方式に統一した。

- 方式は「list.json → カテゴリフィルタ＋カードグリッド → 右からスライドインするリーダー」で、`?json=<id>` の直リンクにも対応
- room_design にあった専用実装を、共通モジュール `js/log-articles.js` に切り出し、room_design 自身もそのモジュールに移行した
- infrastructure / smartphone / gadget は、セクションを追加して同じモジュールを使う形に
- 記事が0件のカテゴリではセクションごと自動で非表示になる。記事を書いて list.json に足せば自動的に現れる

## まとめ

- <span style="color:#dc2626;font-weight:600;">セキュリティ</span>：秘密の分離とローテーション、公開範囲の締め直しが完了
- <span style="color:#0284c7;font-weight:600;">高速化</span>：画像 約26MB → 約1.5MB、CSS はブラウザ内生成から 47KB の静的ファイルへ、gzip と favicon 軽量化も実施
- <span style="color:#059669;font-weight:600;">機能追加</span>：テレメトリのグラフ化、コマンドパレット復活、記事紹介の統一

いずれも「やったこと」が Git のコミット履歴に残る形で実施できた。今後の課題は、記事本文そのものを増やしていくこと。
