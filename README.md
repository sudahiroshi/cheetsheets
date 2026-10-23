# チートシート

授業で配布する印刷教材です。macOS の操作と C言語の文法を、それぞれ A4横 3 枚に、Node.js による Web アプリ開発を A4横 4 枚に、Markdown の書き方と Mermaid の図を A4横 6 枚にまとめています。

| シート | 出力ファイル | 構成 |
| --- | --- | --- |
| macOS ショートカット（ライト） | `index-light.html` | 3ページ・34カード・5段組 |
| macOS ショートカット（ダーク） | `index.html` | 同上（配色のみ違う） |
| C言語 | `c_lang_cheatsheet_light.html` | 3ページ・47カード・5段組 |
| Node.js Webアプリ開発 | `node_cheatsheet_light.html` | 4ページ・53カード・5段組 |
| Markdown（GitHub）と Mermaid | `markdown_cheatsheet_light.html` | 6ページ・58カード・5段組 |

いずれも外部 CDN を参照しない単一ファイルです。ブラウザで開いてそのまま印刷できます。

## 印刷

ブラウザで HTML を開き、以下の設定で印刷します。

- 用紙: **A4・横**
- 余白: **なし**（`@page{size:A4 landscape;margin:7mm}` で内側に余白を確保済み）
- **背景のグラフィック: オン**（カテゴリの色帯が出ません）

配布用は `index-light.html` と `c_lang_cheatsheet_light.html` と `node_cheatsheet_light.html` と `markdown_cheatsheet_light.html` を使ってください。`index.html` は画面で見るためのダーク版です。

## ページの役割

**macOS**

1. 毎日使う基本操作（基本操作 / アプリ・ウィンドウ・システム / Finder・スクリーンショット / 日本語入力・アクセシビリティ / ブラウザ）
2. トラックパッドとターミナル（ジェスチャ / キー操作 / 基本コマンド）
3. 記号とアプリのインストール

**C言語**

1. まず持ち歩く1枚（書き方とコンパイル / 変数・型・入出力 / 演算子）
2. 書くときに開く（制御構文 / 関数とファイル分割 / 配列と文字列）
3. 詰まったときに引く（ポインタとメモリ / 数の表現・ツール・設計）

**Node.js Webアプリ開発**（Node v26 / npm 11 / Express 5.3 / ejs 7 で動作確認）

1. 環境構築と UNIX コマンド（Homebrew / nodebrew / npm と package.json / ls・cd・ps・kill・lsof）
2. JavaScript の基本文法（変数と型 / 文字列 / 条件とループ / C言語との違い / 関数・配列・オブジェクト / 分割代入 / 例外処理 / デバッグのコツ）
3. 非同期処理と Node.js の作法（callback / Promise / async-await / JSON / CommonJS と ES Modules / fs / HTTP / fetch）
4. Express とトラブル対処（ルーティング / req・res / ミドルウェア / 静的ファイル / フォーム / EJS / 404・エラー処理 / .env / nodemon / よくあるエラー）

**Markdown**（GitHub Flavored Markdown。GitHub 上の表示を正とし、2026年10月に GitHub の Markdown API と実リポジトリの描画で確認）

1. 基本の書式（見出し / 文字飾り / 改行と段落 / エスケープ / リスト / チェックボックス / 引用・水平線 / コード / リンク / 画像 / 表）
2. GitHub の便利な記法と文書を整える記法（アラート / 折りたたみ / 絵文字・自動リンク / 数式 / 脚注 / アンカーと目次 / HTML / YAML frontmatter / よくある失敗）。最後の段から Mermaid（H）が始まる
3. Mermaid の基本とフローチャート（図の種類 / ノードの形 / 矢印 / 向きとサブグラフ / ラベルの書き方 / スタイル / 処理の流れとシステム構成図の例 / 設定・テーマ・コメント）
4. シーケンス図とクラス図（メッセージの矢印 / ブロック / 参加者の種類と枠 / ログインの例 / クラスとメンバー / 関係と多重度）
5. クラス図の例・状態遷移図・ER 図・グラフ（インターフェースの例 / 状態遷移図 / 複合状態と分岐 / ER 図 / 多重度 / 円グラフ / 棒・折れ線グラフ / 4象限の図）
6. そのほかの図とエラーの直し方（ガントチャート / マインドマップ / 年表 / gitGraph / そのほかの図と beta / 書くときのコツ / よくあるエラー / よくある失敗）

各カードは「書き方（左）」と「GitHub での表示（右）」を並べています。

Mermaid は、GitHub の描画器が mermaid **v12.2.0** であることを ```mermaid の中に `info` と書いて確かめ（2026年10月）、載せたコードはすべて mermaid 12.2.0 を GitHub と同じ設定（`theme: default`・`securityLevel: antiscript` など）で動かして描画できることを確認しています。GitHub が Mermaid の版を上げると描き方や書き方が変わることがあるので、版が変わったら確認し直してください。

「まず持ち歩く2枚」は、macOS 版の1ページ目と C言語版の1ページ目です。

## 凡例

両シートで記法を揃えています。

- `★` … まず覚える定番
- グレー文字 … 上級者向け
- `⚠` … 間違えやすい点

## ビルド

**HTML は 100% 生成物です。直接編集しないでください。** 次回のビルドで上書きされます。

```sh
node build_macos_cheatsheet.js   # index.html と index-light.html を生成
node build_c_cheatsheet.js       # c_lang_cheatsheet_light.html を生成
node build_node_cheatsheet.js    # node_cheatsheet_light.html を生成
node build_markdown_cheatsheet.js  # markdown_cheatsheet_light.html を生成
```

Node.js の標準モジュール（`fs` / `path`）しか使っていないので、依存関係のインストールは不要です。開発に使った Node は v26.4.0 です。

`index.html` と `index-light.html` は同じスクリプトから生成され、`<body>` は完全に同一です。違いは `:root` の CSS 変数だけなので、内容を直すとダーク・ライト両方に反映されます。

## 内容を変更する

各スクリプトの `CARDS` 配列を編集します。

- カードの追加・削除をしたら、**`SPLIT`（各ページに載せるカード枚数）も更新する**こと。合計がカード数と一致しないとビルドが例外で止まります。
  - macOS: `SPLIT = [13, 9, 12]`
  - C言語: `SPLIT = [13, 16, 18]`
  - Node.js: `SPLIT = [14, 14, 12, 13]`
  - Markdown: `SPLIT = [13, 12, 10, 7, 8, 8]`（p2 の最後に「H Mermaid とフローチャート」の1枚目、p3・p5・p6 の先頭はそれぞれ H・I・J の「（続き）」）
- 全体の文字サイズは macOS が `FS`（現在 1.16）、C言語が `SCALE`（現在 1.13）、Node.js と Markdown が `SCALE`（現在 1.0）で調整します。C言語版・Node.js 版・Markdown 版は `SCALE=1.10 node build_c_cheatsheet.js` のように環境変数でも渡せます。
- Node.js 版のコード塊は1行 37 桁（全角は約 1.7 桁）を超えると折り返して高さが増えます。長い行は自然な位置で改行してください。
- Markdown 版は本文に `**` や `` ` `` をそのまま載せるため、説明文の独自記法を他のシートと変えています。説明文（`CD` / `CW` / `KV` の説明 / `TB` / `ER` の右側）では **等幅は `⟦…⟧`、強調は `⟪…⟫`** と書きます。`` ` `` と `**` は解釈せず文字のまま出ます。書き方の欄（`EX` の左・`CC`・`KV` のキー・`ER` の左）は一切解釈せず、書いたとおりに表示します。`⟦` `⟪` の閉じ忘れはビルドが例外で止まります。
- Markdown 版の右側（GitHub での表示）は、GitHub の見た目を HTML で再現した固定文字列です。書き方を変えたら表示も手で直してください。
- Mermaid の表示例はインライン SVG で手描きしています（`SVG_FLOW` などの定数。部品は `ND` ノード・`ED` 線・`EL` 矢印のラベル）。配置と配色は mermaid 12.2.0 が GitHub の設定で描いた図に合わせています。Mermaid のコードを変えたら、mermaid.live か GitHub の Preview で描けることを確かめ、SVG も描き直してください。
- Mermaid のカードは大きい（1枚 60〜120mm）ため、1段に2枚入る組み合わせになるよう並べています。カードの順番を変えると段からあふれやすいので、必ず下の方法で計測してください。

### レイアウトの確認を必ず行うこと

**紙面に余裕がほとんどありません。** 1行足しただけで段からあふれます。

- C言語 1ページ目: 余白 **約 5.0mm**
- macOS 3ページ目の第1段: 余白 **約 4.9mm**
- Node.js 3ページ目の第2段: 余白 **約 5.7mm**（各ページの最小余白は p1 8.5 / p2 8.6 / p3 5.7 / p4 10.5mm）
- Markdown 2ページ目の第3段: 余白 **約 6.0mm**（各ページの最小余白は p1 11.8 / p2 6.0 / p3 14.4 / p4 9.3 / p5 6.6 / p6 14.8mm）

さらに厄介なことに、**PDF のページ数を見るだけでは、あふれを検出できません。** 段から押し出された内容は `overflow:hidden` で見えなくなるため、はみ出していてもページ数は 3 のままになります。

確認するときは、ヘッドレス Chrome の CDP で各段の最下端を `getBoundingClientRect` で実測し、ページ枠に収まっているかを数値で見てください。段数が 5 を超えていないかも併せて確認します。計測スクリプトを書いたら、**わざと行を足してあふれさせ、ちゃんと検出できることを確かめてから**本番の判定に使ってください。

## ファイル

| ファイル | 内容 |
| --- | --- |
| `build_macos_cheatsheet.js` | macOS シートの生成スクリプト（唯一の編集対象） |
| `build_c_cheatsheet.js` | C言語シートの生成スクリプト（唯一の編集対象） |
| `build_node_cheatsheet.js` | Node.js シートの生成スクリプト（唯一の編集対象） |
| `build_markdown_cheatsheet.js` | Markdown シートの生成スクリプト（唯一の編集対象） |
| `index.html` / `index-light.html` | macOS シート（生成物） |
| `c_lang_cheatsheet_light.html` | C言語シート（生成物） |
| `node_cheatsheet_light.html` | Node.js シート（生成物） |
| `markdown_cheatsheet_light.html` | Markdown シート（生成物） |
| `content_review.md` | 内容精査の記録。誤り・追加候補・削除候補・未解決事項 |
| `c_lang.md` | C言語シートの素材 |
| `c_lang_plan.md` | C言語シートの構成案 |
| `history.md` | 作成の経緯 |

### 使わないスクリプト

`regroup.js` / `add_page2.js` / `add_lesson_plan.js` は、現在とは異なる旧構造の HTML を前提に書かれたものです。**今の HTML に対して実行すると壊れます。** 経緯の記録として残してあるだけなので、実行しないでください。

## 対象環境

macOS 限定です。macOS 26 Tahoe / 27 Golden Gate を想定しています。Linux や Windows での挙動は意図的に載せていません。

本文は Hiragino Sans を前提に字詰めを調整しています。このフォントが無い環境で開くと、行の折り返しが変わって段からあふれることがあります。
