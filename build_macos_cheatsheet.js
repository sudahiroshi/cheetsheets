// macOS チートシート(A4横・5段組)を生成する
// デザインは ~/tex-cheatsheet/tex_cheatsheet.html と同じ流儀
//   .page / .head / .legend / .grid / .sec / .card / .ct / .cc / .cg / .cd / .foot
// macOS の内容に合わせて .kv(キー+説明の行) / .cl(手順・箇条書き) を追加している
// 出力: index-light.html(ライト) と index.html(同じ構造で配色だけダーク)
// tako:run node build_macos_cheatsheet.js
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

/* ================= カテゴリ ================= */
const CATS = [
  ['A', '基本操作', '基本操作'],
  ['B', 'アプリ・ウィンドウ・システム', 'アプリ・ウィンドウ'],
  ['C', 'Finder・スクリーンショット', 'Finder・スクショ'],
  ['D', '日本語入力・アクセシビリティ', '日本語入力・支援'],
  ['E', 'ブラウザ', 'ブラウザ'],
  ['F', 'トラックパッド', 'トラックパッド'],
  ['G', 'ターミナル', 'ターミナル'],
  ['H', '記号', '記号'],
  ['I', 'アプリのインストール', 'インストール'],
];

/* ================= 記法 =================
   ⟦x⟧ … キーキャップ/等幅チップ   **x** … 太字
   kv 行: [キー, 説明, フラグ]  フラグ m=まず覚える(★) / p=上級者向け
========================================== */
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rich = (s, tag) => esc(s)
  .replace(/⟦([^⟧]*)⟧/g, (_, k) => `<${tag}>${k}</${tag}>`)
  .replace(/\*\*([^*]+)\*\*/g, '<b class="st">$1</b>');

const KEY = s => rich(s, 'span');       // キー欄: チップは .cg span
const TXT = s => rich(s, 'code');       // 説明文: チップは <code>

/* ================= 部品 ================= */
const kv = rows => '<div class="kv">' + rows.map(([k, d, f]) =>
  `<div${f ? ` class="${f}"` : ''}><em class="cg">${KEY(k)}</em><span>${TXT(d)}</span></div>`).join('') + '</div>';
const cc = code => `<div class="cc">${esc(code).replace(/#([^\n]*)/g, '<i class="cm">#$1</i>')}</div>`;
const cd = t => `<div class="cd">${TXT(t)}</div>`;
const ol = items => '<ol class="cl">' + items.map(i => `<li>${TXT(i)}</li>`).join('') + '</ol>';
const ul = items => '<ul class="cl b">' + items.map(i => `<li>${TXT(i)}</li>`).join('') + '</ul>';

/* ================= 掲載内容 ================= */
const CARDS = [

/* ---------- A 基本操作 ---------- */
{ cat: 'A', t: 'まず覚える6つ', body: [
  kv([
    ['⟦⌘⟧⟦C⟧', 'コピー', 'm'],
    ['⟦⌘⟧⟦V⟧', 'ペースト', 'm'],
    ['⟦⌘⟧⟦X⟧', 'カット', 'm'],
    ['⟦⌘⟧⟦Z⟧', '取り消し', 'm'],
    ['⟦⌘⟧⟦S⟧', '保存', 'm'],
    ['⟦⌘⟧⟦Space⟧', 'Spotlight', 'm'],
  ]),
]},

{ cat: 'A', t: '修飾キーの記号', body: [
  kv([
    ['⟦⌘⟧', 'Command'],
    ['⟦⌥⟧', 'Option'],
    ['⟦⌃⟧', 'Control'],
    ['⟦⇧⟧', 'Shift'],
    ['⟦⎋⟧', 'Esc'],
    ['⟦⌫⟧', 'Delete'],
    ['⟦↩⟧', 'Return'],
    ['⟦⇥⟧', 'Tab'],
    ['⟦🌐⟧', 'Fn'],
  ]),
]},

{ cat: 'A', t: '基本編集', body: [
  kv([
    ['⟦⌘⟧⟦C⟧', 'コピー', 'm'],
    ['⟦⌘⟧⟦X⟧', 'カット', 'm'],
    ['⟦⌘⟧⟦V⟧', 'ペースト', 'm'],
    ['⟦⌘⟧⟦Z⟧', '取り消し', 'm'],
    ['⟦⇧⟧⟦⌘⟧⟦Z⟧', 'やり直し', 'm'],
    ['⟦⌘⟧⟦A⟧', 'すべて選択', 'm'],
    ['⟦⌘⟧⟦S⟧', '保存', 'm'],
    ['⟦⌘⟧⟦F⟧', '検索'],
    ['⟦⌘⟧⟦G⟧', '次を検索'],
    ['⟦⌘⟧⟦N⟧ / ⟦O⟧', '新規 / 開く'],
    ['⟦⌘⟧⟦P⟧', '印刷'],
    ['⟦⌥⟧⟦⌘⟧⟦V⟧', '移動ペースト(元を削除)', 'p'],
    ['⟦⌥⟧⟦⇧⟧⟦⌘⟧⟦V⟧', '書式なしペースト', 'p'],
  ]),
]},

{ cat: 'A', t: 'テキスト編集・カーソル移動', body: [
  kv([
    ['⟦⌘⟧⟦←⟧ / ⟦→⟧', '行頭 / 行末へ'],
    ['⟦⌥⟧⟦←⟧⟦→⟧', '単語単位で移動'],
    ['⟦⌘⟧⟦↑⟧ / ⟦↓⟧', '文書の先頭 / 末尾'],
    ['⟦⇧⟧+移動', '移動しながら選択'],
    ['⟦⌥⟧⟦⌫⟧', '単語を削除'],
    ['⟦⌘⟧⟦⌫⟧', '行頭まで削除'],
    ['⟦⌘⟧⟦B⟧⟦I⟧⟦U⟧', '太字 / 斜体 / 下線'],
    ['⟦⌘⟧⟦+⟧ / ⟦-⟧', '文字サイズ 拡大 / 縮小'],
    ['⟦⌃⟧⟦A⟧ / ⟦E⟧', '行頭 / 行末(Emacs風)', 'p'],
    ['⟦⌃⟧⟦K⟧', '行末まで削除', 'p'],
    ['⟦⌃⟧⟦D⟧', '右の1文字を削除', 'p'],
  ]),
]},

/* ---------- B アプリ・ウィンドウ・システム ---------- */
{ cat: 'B', t: 'アプリ・ウィンドウ', body: [
  kv([
    ['⟦⌘⟧⟦⇥⟧', 'アプリ切替', 'm'],
    ['⟦⌘⟧⟦Q⟧', 'アプリを終了', 'm'],
    ['⟦⌘⟧⟦W⟧', 'ウインドウを閉じる', 'm'],
    ['⟦⌥⟧⟦⌘⟧⟦⎋⟧', '強制終了', 'm'],
    ['⟦⌘⟧⟦M⟧', '最小化'],
    ['⟦⌘⟧⟦H⟧', 'アプリを隠す'],
    ['⟦⌥⟧⟦⌘⟧⟦H⟧', 'ほかを隠す'],
    ['⟦⌘⟧⟦`⟧', '同アプリのウインドウ切替'],
    ['⟦⌘⟧⟦,⟧', '設定を開く(旧: 環境設定)'],
    ['⟦⌃⟧⟦⌘⟧⟦F⟧', 'フルスクリーン'],
    ['⟦⌥⟧⟦⌘⟧⟦W⟧', 'すべて閉じる', 'p'],
    ['⟦⌥⟧⟦⌘⟧⟦D⟧', 'Dockの表示切替', 'p'],
  ]),
]},

{ cat: 'B', t: 'Mission Control・システム', body: [
  kv([
    ['⟦⌘⟧⟦Space⟧', 'Spotlight検索', 'm'],
    ['⟦⌃⟧⟦↑⟧', 'Mission Control'],
    ['⟦⌃⟧⟦↓⟧', 'アプリのウインドウ一覧'],
    ['⟦⌃⟧⟦←⟧⟦→⟧', 'デスクトップ左右切替'],
    ['⟦🌐⟧⟦F11⟧', 'デスクトップを表示'],
    ['⟦⌃⟧⟦⌘⟧⟦Space⟧', '絵文字と記号'],
    ['⟦⌃⟧⟦⌘⟧⟦Q⟧', '画面ロック'],
    ['⟦🌐⟧⟦N⟧', '通知センター'],
    ['⟦🌐⟧⟦C⟧', 'コントロールセンター'],
    ['⟦🌐⟧⟦⌃⟧⟦←⟧⟦→⟧', 'ウインドウタイル配置(Sequoia~)', 'p'],
  ]),
  cd('⚠ 上段のファンクションキー(⟦F11⟧ など)は、ノートPCでは ⟦🌐⟧ を押しながらでないと働かないことがある。'),
  cd('⟦⌘⟧⟦Space⟧ →「アプリ」ビューでインストール済みアプリを一覧できる(macOS 26 Tahoe 以降。Launchpad の置き換え)。'),
]},

{ cat: 'B', t: '起動・トラブル対応', body: [
  kv([
    ['⟦⌥⟧⟦⌘⟧⟦⎋⟧', '強制終了ウインドウ', 'm'],
    ['電源ボタン長押し', 'スリープ解除/電源メニュー'],
    ['⟦⌃⟧⟦⌘⟧+電源', '強制再起動', 'p'],
    ['電源オフ→電源ボタン長押し', '起動オプション(復旧・起動ディスク・セーフモード)', 'p'],
  ]),
  cd('macOS 27 は Apple Silicon 専用。復旧・起動ディスク選択・セーフモードはすべて上の「起動オプション」画面から選ぶ。'),
]},

/* ---------- C Finder・スクリーンショット ---------- */
{ cat: 'C', t: 'Finder(ファイル操作)', body: [
  kv([
    ['⟦Space⟧', 'クイックルック', 'm'],
    ['⟦⌘⟧⟦⌫⟧', 'ゴミ箱へ移動', 'm'],
    ['⟦⇧⟧⟦⌘⟧⟦N⟧', '新規フォルダ'],
    ['⟦↩⟧', '名前を変更'],
    ['⟦⌘⟧⟦I⟧', '情報を見る'],
    ['⟦⌘⟧⟦D⟧', '複製'],
    ['⟦⇧⟧⟦⌘⟧⟦⌫⟧', 'ゴミ箱を空にする', 'p'],
    ['⟦⌥⟧ / ⟦⌥⟧⟦⌘⟧', 'ドラッグ中コピー / エイリアス', 'p'],
    ['⟦⌥⟧⟦⌘⟧⟦C⟧', 'パスをコピー', 'p'],
  ]),
]},

{ cat: 'C', t: 'Finder(移動・表示)', body: [
  kv([
    ['⟦⌘⟧⟦↓⟧ / ⟦↑⟧', '開く / 上の階層へ'],
    ['⟦⇧⟧⟦⌘⟧⟦G⟧', 'フォルダへ移動'],
    ['⟦⇧⟧⟦⌘⟧⟦.⟧', '隠しファイル表示切替'],
    ['⟦⌘⟧⟦1⟧〜⟦4⟧', '表示 アイコン/リスト/カラム/ギャラリー'],
    ['⟦⇧⟧⟦⌘⟧⟦H⟧ / ⟦D⟧', 'ホーム / デスクトップ'],
    ['⟦⇧⟧⟦⌘⟧⟦A⟧', 'アプリケーション'],
  ]),
]},

{ cat: 'C', t: 'スクリーンショット', body: [
  kv([
    ['⟦⇧⟧⟦⌘⟧⟦4⟧', '範囲を指定して撮影', 'm'],
    ['⟦⇧⟧⟦⌘⟧⟦3⟧', '画面全体'],
    ['⟦⇧⟧⟦⌘⟧⟦5⟧', '撮影ツール(録画も可)'],
    ['⟦Space⟧', 'ウインドウ単位(4の後に)'],
    ['⟦⌃⟧', 'クリップボードへ(追加で)'],
  ]),
  cd('保存先は ⇧⌘5 → オプションで変更できます。'),
]},

/* ---------- D 日本語入力・アクセシビリティ ---------- */
{ cat: 'D', t: '日本語入力', body: [
  kv([
    ['⟦英数⟧ / ⟦かな⟧', '英数 / かな 切替', 'm'],
    ['⟦F6⟧', 'ひらがなに変換(変換中)'],
    ['⟦F7⟧', '全角カタカナに変換'],
    ['⟦F8⟧', '半角カタカナに変換'],
    ['⟦F9⟧', '全角英数に変換'],
    ['⟦F10⟧', '半角英数に変換'],
    ['⟦⌃⟧⟦Space⟧', '入力ソース切替'],
  ]),
  cd('⚠ F6〜F10 はノートPCでは ⟦🌐⟧ 併用が必要な場合あり。'),
]},

{ cat: 'D', t: 'アクセシビリティ・ヘルプ', body: [
  kv([
    ['⟦⇧⟧⟦⌘⟧⟦/⟧', 'ヘルプメニュー検索'],
    ['⟦⌥⟧⟦⌘⟧⟦F5⟧', 'アクセシビリティ設定(機種により ⟦🌐⟧ 併用)'],
  ]),
]},

/* ---------- E ブラウザ ---------- */
{ cat: 'E', t: 'ブラウザ(Safari / Chrome)', body: [
  kv([
    ['⟦⌘⟧⟦T⟧', '新規タブ', 'm'],
    ['⟦⌘⟧⟦W⟧', 'タブを閉じる', 'm'],
    ['⟦⇧⟧⟦⌘⟧⟦T⟧', '閉じたタブを復元', 'm'],
    ['⟦⌘⟧⟦L⟧', 'アドレスバーへ'],
    ['⟦⌘⟧⟦R⟧', '再読み込み'],
    ['⟦⌘⟧⟦[⟧ / ⟦]⟧', '戻る / 進む'],
    ['⟦⌃⟧⟦⇥⟧ / ⟦⇧⟧⟦⌃⟧⟦⇥⟧', 'タブ切替(次/前)'],
    ['⟦⌘⟧⟦1⟧〜⟦9⟧', 'n番目のタブへ'],
    ['⟦⇧⟧⟦⌘⟧⟦N⟧', 'プライベートウインドウ'],
    ['⟦⌥⟧⟦⌘⟧⟦I⟧', '開発者ツール', 'p'],
  ]),
]},

/* ---------- F トラックパッド ---------- */
{ cat: 'F', t: 'トラックパッドジェスチャ(1〜2本指)', body: [
  kv([
    ['1本指タップ', 'クリック', 'm'],
    ['2本指タップ / ⟦⌃⟧+クリック', '副ボタン(右クリック)', 'm'],
    ['2本指スクロール', 'スクロール', 'm'],
    ['2本指ピンチ', '拡大・縮小'],
    ['2本指ダブルタップ', 'スマートズーム'],
    ['2本指で回転', '画像などの回転'],
    ['2本指で左右スワイプ', 'ページ戻る・進む(ブラウザ)'],
    ['右端から2本指スワイプ', '通知センター'],
  ]),
  cd('設定: システム設定 → トラックパッド'),
]},

{ cat: 'F', t: 'トラックパッドジェスチャ(3本指以上)', body: [
  kv([
    ['3本指タップ', '調べる(辞書・プレビュー)'],
    ['3/4本指で上スワイプ', 'Mission Control'],
    ['3/4本指で下スワイプ', 'App Exposé'],
    ['3/4本指で左右スワイプ', 'フルスクリーンアプリ切替'],
    ['親指+3本指でピンチイン', 'アプリ(旧 Launchpad)'],
    ['親指+3本指でピンチアウト', 'デスクトップを表示'],
    ['強めに押し込む', 'クイックルック・調べる', 'p'],
    ['3本指ドラッグ(要設定)', 'ウインドウ移動', 'p'],
  ]),
]},

/* ---------- G ターミナル ---------- */
{ cat: 'G', t: 'ターミナル(実行・履歴)', body: [
  kv([
    ['⟦⌃⟧⟦C⟧', '実行中のコマンドを中断', 'm'],
    ['⟦Tab⟧', '補完(ファイル名・コマンド名)', 'm'],
    ['⟦↑⟧ ⟦↓⟧', 'コマンド履歴をたどる', 'm'],
    ['⟦⌃⟧⟦D⟧', '入力終了(EOF)/ログアウト'],
    ['⟦⌃⟧⟦L⟧', '画面クリア(clear)'],
    ['⟦⌃⟧⟦R⟧', '履歴をさかのぼって検索'],
    ['⟦⌃⟧⟦Z⟧', '一時停止(fg で再開)', 'p'],
    ['⟦!!⟧', '直前のコマンドを再実行', 'p'],
    ['⟦cd -⟧', '直前のディレクトリへ戻る', 'p'],
  ]),
]},

{ cat: 'G', t: 'ターミナル(行編集・ウインドウ)', body: [
  kv([
    ['⟦⌃⟧⟦A⟧ / ⟦E⟧', '行頭 / 行末へ移動'],
    ['⟦⌃⟧⟦U⟧', 'カーソルから行頭まで削除'],
    ['⟦⌃⟧⟦K⟧', 'カーソルから行末まで削除'],
    ['⟦⌃⟧⟦W⟧', '直前の1単語を削除'],
    ['⟦⌥⟧⟦←⟧⟦→⟧', '単語単位で移動'],
    ['⟦⌘⟧⟦T⟧ / ⟦N⟧', '新規タブ / ウインドウ'],
    ['⟦⌘⟧⟦K⟧', '画面と履歴を消去'],
    ['⟦⌘⟧⟦+⟧ / ⟦-⟧', '文字サイズ変更'],
  ]),
  cd('ターミナルの場所: アプリケーション → ユーティリティ → ターミナル ／ ⟦⌘⟧⟦Space⟧ で「ターミナル」'),
]},

{ cat: 'G', t: '基本コマンド① 今どこ・何がある・移動する', body: [
  cd('**コマンド名 ／ 由来(フルスペル) ／ 用途**　書き方は ⟦コマンド -オプション 対象⟧。'),
  kv([
    ['⟦pwd⟧', '**print working directory** 今いる場所(カレントディレクトリ)のパスを表示', 'm'],
    ['⟦ls⟧', '**list** その場所のファイル・フォルダ一覧を表示', 'm'],
    ['⟦ls -l⟧', '**long** 1行1件で詳細表示(種類・権限・サイズ・更新日時)'],
    ['⟦ls -a⟧', '**all** ⟦.⟧ で始まる隠しファイルも表示'],
    ['⟦ls -lh⟧', '**human readable** サイズを ⟦4.0K⟧ ⟦12M⟧ のように読みやすく'],
    ['⟦ls -lt⟧ / ⟦-ltr⟧', '**time** 更新日時順 / **reverse** を足して古い順'],
    ['⟦ls -F⟧', '**file type** 種類の記号を付ける(⟦/⟧ フォルダ ⟦*⟧ 実行可能)'],
    ['⟦ls -la⟧', 'オプションはまとめて書ける(= ⟦-l -a⟧)'],
    ['⟦cd フォルダ名⟧', '**change directory** そのフォルダへ移動', 'm'],
    ['⟦cd ..⟧', '一つ上(親フォルダ)へ。⟦..⟧ = 親、⟦.⟧ = 現在地', 'm'],
    ['⟦cd ~⟧ / ⟦cd⟧', '**~** = ホーム(自分のフォルダ)。引数なしでも同じ'],
    ['⟦cd -⟧', '直前にいたディレクトリへ戻る', 'p'],
  ]),
  cd('名前の途中で ⟦Tab⟧ を押すと補完される。打ち間違い防止に必ず使うこと。'),
]},

{ cat: 'G', t: '基本コマンド② 作る・コピー・移動・消す', body: [
  kv([
    ['⟦mkdir 名前⟧', '**make directory** フォルダを作る', 'm'],
    ['⟦mkdir -p a/b/c⟧', '**parents** 途中の階層もまとめて作る'],
    ['⟦touch 名前⟧', '空のファイルを作る(既存なら更新日時だけ変える)'],
    ['⟦cp 元 先⟧', '**copy** ファイルをコピー', 'm'],
    ['⟦cp -r 元 先⟧', '**recursive** フォルダを中身ごとコピー'],
    ['⟦mv 元 先⟧', '**move** 移動。⟦mv a.c b.c⟧ で名前の変更にもなる', 'm'],
    ['⟦rm ファイル⟧', '**remove** 削除。ゴミ箱に入らず**その場で消える**', 'm'],
    ['⟦rm -r フォルダ⟧', '**recursive** フォルダを中身ごと削除'],
    ['⟦rm -i⟧', '**interactive** 1件ずつ確認してから削除(安全)'],
    ['⟦rmdir 名前⟧', '**remove directory** 空のフォルダだけ削除'],
    ['⟦cat ファイル⟧', '**concatenate** 中身を画面に流して表示', 'm'],
    ['⟦less ファイル⟧', '長いファイルを1画面ずつ読む(⟦q⟧ で終了)'],
  ]),
  cd('⚠ ⟦rm⟧ に取り消しは無い。消す前に ⟦ls⟧ で確認し、⟦*⟧ を使う指定は特に慎重に。'),
]},

{ cat: 'G', t: 'macOS のコマンド・システム情報', body: [
  kv([
    ['⟦open .⟧', '今いる場所を Finder で開く(⟦.⟧ = 現在地)', 'm'],
    ['⟦open ファイル⟧', '標準のアプリでそのファイルを開く'],
    ['⟦open -a Safari⟧', '**application** アプリを指定して開く'],
    ['⟦pbcopy⟧', '**pasteboard copy** 出力をコピー ⟦cat a.c | pbcopy⟧'],
    ['⟦pbpaste⟧', '**pasteboard paste** クリップボードの中身を出力'],
    ['⟦say こんにちは⟧', 'テキストを読み上げる'],
    ['⟦ps⟧', '**process status** 実行中のプロセスを表示', 'm'],
    ['⟦top⟧', '負荷の高い順にプロセスを表示(⟦q⟧ で終了)'],
    ['⟦whoami⟧ / ⟦who⟧', '自分のユーザ名 / ログイン中のユーザー一覧'],
    ['⟦hostname⟧', 'この Mac の名前を表示'],
    ['⟦uname -a⟧', '**unix name** OS・カーネルの情報'],
    ['⟦vm_stat⟧', 'メモリの使用状況。Linux の ⟦free⟧ は macOS に**無い**'],
    ['⟦df -h⟧ / ⟦du -sh .⟧', 'ディスクの空き / このフォルダの使用量'],
    ['⟦man コマンド名⟧', '**manual** そのコマンドの説明書(⟦q⟧ で終了)', 'm'],
  ]),
  cd('**Finder ⇄ ターミナル** ⟦cd⟧ と半角スペースまで打ってから Finder のフォルダを**ドラッグ&ドロップ**するとパスが入る。逆は ⟦open .⟧ で現在地を Finder で開く。Finder の右クリック →「フォルダに新規ターミナル」も使える(サービス設定で有効化)。'),
]},

{ cat: 'G', t: '① Xcode Command Line Tools(C言語の最初の一歩)', body: [
  cc(`# gcc / git / make などが入る
xcode-select --install
# 確認
xcode-select -p
gcc --version
# コンパイルと実行
gcc hello.c -o hello
./hello`),
  cd('ダイアログで「インストール」→ 完了まで数分〜。Xcode 本体は不要。'),
  cd('🔑 途中で**管理者のパスワード**(Mac のログインパスワード)を求められたら入力。ターミナルでは入力中の文字が**表示されない**が正常。入力後 ⟦↩⟧。'),
]},

{ cat: 'G', t: '② うまくいかないとき', body: [
  cc(`command not found  → ターミナルを開き直す
echo $PATH         # PATH を確認
sudo xcode-select --reset`),
  cd('アップデート後に動かなくなったら ① を再実行。'),
]},

{ cat: 'G', t: '基本コマンド③ プロセスとポートを調べる・止める', body: [
  cd('**PID** = 実行中のプログラム(プロセス)ごとの番号。止めるときはこの番号で指定する。'),
  kv([
    ['⟦ps⟧', '**process status** 自分が端末で動かすプロセスと PID', 'm'],
    ['⟦ps aux | grep 名前⟧', '全プロセスから探す。2列目が PID', 'm'],
    ['⟦kill PID⟧', '終了を頼む。まずこれ', 'm'],
    ['⟦kill -9 PID⟧', '**SIGKILL** 後片付けさせず強制終了。⟦kill⟧ で止まらないときだけ'],
  ]),
  cc(`# address already in use と出たら
lsof -i :3000
COMMAND  PID ... NAME
node   12345 ... *:hbci (LISTEN)
kill 12345  # 再びlsofで空なら解放`),
  cd('**lsof** = **list open files**。2列目が PID。NAME の ⟦hbci⟧ は 3000番ポートに登録された名前(番号の代わりに表示される)。'),
  cd('⚠ 何も出ないのに使えないときは ⟦sudo lsof …⟧。root など他ユーザーのプロセスは sudo なしでは見えない。'),
]},

/* ---------- H 記号 ---------- */
{ cat: 'H', t: 'コンピュータで使用する主な記号 (1)', body: [
  cd('記号 ／ 読み方 ／ 主な用途 ／ 入力(JISキー)'),
  kv([
    ['⟦~⟧', '**チルダ** ホームディレクトリ ／ ⟦⇧⟧⟦^⟧'],
    ['⟦/⟧', '**スラッシュ** パス区切り・除算・コメント ⟦//⟧ ／ ⟦/⟧'],
    ['⟦\\⟧', '**バックスラッシュ** エスケープ ⟦\\n⟧ ／ ⟦⌥⟧⟦¥⟧'],
    ['⟦|⟧', '**パイプ** コマンド連結・論理和 ⟦||⟧ ／ ⟦⇧⟧⟦¥⟧'],
    ['⟦> <⟧', '**大なり・小なり** リダイレクト・比較 ／ ⟦⇧⟧⟦.⟧ ⟦⇧⟧⟦,⟧'],
    ['⟦&⟧', '**アンパサンド** アドレス取得・論理積 ⟦&&⟧ ／ ⟦⇧⟧⟦6⟧'],
    ['⟦*⟧', '**アスタリスク** ポインタ・乗算・ワイルドカード ／ ⟦⇧⟧⟦:⟧'],
    ['⟦#⟧', '**シャープ** ⟦#include⟧・コメント(シェル) ／ ⟦⇧⟧⟦3⟧'],
    ['⟦$⟧', '**ドル** 変数展開・プロンプト ／ ⟦⇧⟧⟦4⟧'],
    ['⟦%⟧', '**パーセント** 剰余・⟦printf⟧ 書式 ／ ⟦⇧⟧⟦5⟧'],
  ]),
]},

{ cat: 'H', t: 'コンピュータで使用する主な記号 (2)', body: [
  kv([
    ['⟦!⟧', '**エクスクラメーション** 否定・履歴展開 ／ ⟦⇧⟧⟦1⟧'],
    ['⟦=⟧', '**イコール** 代入(⟦==⟧ は比較) ／ ⟦⇧⟧⟦-⟧'],
    ['⟦+⟧', '**プラス** 加算・インクリメント ⟦++⟧ ／ ⟦⇧⟧⟦;⟧'],
    ['⟦-⟧', '**ハイフン** 減算・オプション指定 ／ ⟦-⟧'],
    ['⟦_⟧', '**アンダースコア** 変数名・関数名 ／ ⟦⇧⟧⟦ろ⟧'],
    ['⟦^⟧', '**キャレット** ビット排他的論理和 ／ ⟦^⟧'],
    ['⟦"⟧', '**ダブルクォート** 文字列 ／ ⟦⇧⟧⟦2⟧'],
    ["⟦'⟧", "**シングルクォート** 文字 ⟦'a'⟧ ／ ⟦⇧⟧⟦7⟧"],
  ]),
]},

{ cat: 'H', t: 'コンピュータで使用する主な記号 (3)', body: [
  kv([
    ['⟦`⟧', '**バッククォート** コマンド置換 ／ ⟦⇧⟧⟦@⟧'],
    ['⟦( )⟧', '**丸括弧** 関数呼び出し・優先順位 ／ ⟦⇧⟧⟦8⟧ ⟦⇧⟧⟦9⟧'],
    ['⟦{ }⟧', '**波括弧** ブロック・配列初期化 ／ ⟦⇧⟧⟦[⟧ ⟦⇧⟧⟦]⟧'],
    ['⟦[ ]⟧', '**角括弧** 配列の添字 ／ ⟦[⟧ ⟦]⟧'],
    ['⟦;⟧', '**セミコロン** C言語の文末 ／ ⟦;⟧'],
    ['⟦:⟧', '**コロン** 三項演算子・ラベル ／ ⟦:⟧'],
    ['⟦?⟧', '**クエスチョン** 三項演算子・1文字ワイルドカード ／ ⟦⇧⟧⟦/⟧'],
    ['⟦.⟧', '**ドット** 現在のディレクトリ・メンバ参照 ／ ⟦.⟧'],
  ]),
  cd('英数(半角)モードで入力。全角になる場合は ⟦英数⟧ で切替。'),
  cd('⚠ **全角スペース・全角記号が混ざると、見た目は正しいのにエラーになる。** 画面上では半角と見分けがつきにくい。'),
  cd('⚠ ⟦command not found⟧ や意味の分からないコンパイルエラーが出たら、まず全角が混じっていないか疑うこと。'),
]},

/* ---------- I アプリのインストール ---------- */
{ cat: 'I', t: '🛍️ Mac App Store', s: '最も手軽・安全', body: [
  cd('Apple の審査済みアプリ。自動アップデート対応。'),
  ol([
    'App Store を開き Apple Account でサインイン',
    'アプリを検索 →「入手」/ 価格ボタン →「インストール」',
    'Spotlight(⟦⌘⟧⟦Space⟧)/ アプリケーションフォルダから起動',
  ]),
  cd('**👍 長所** 安全・更新が自動・購入履歴で再DL'),
  cd('**👎 短所** サンドボックスで機能制限あり・掲載外のアプリあり'),
  cd('削除: Finder の「アプリケーション」フォルダからゴミ箱へ'),
]},

{ cat: 'I', t: '💿 DMG(ディスクイメージ)', s: '最も一般的', body: [
  cd('公式サイトからダウンロードする ⟦.dmg⟧。中に .app が入っている。'),
  ol([
    '⟦.dmg⟧ をダブルクリックしてマウント',
    '開いたウインドウで **アプリを「Applications」へドラッグ&ドロップ**',
    'Finder サイドバーでディスクイメージの **⏏** を押して取り出す',
    '.dmg ファイルはゴミ箱へ(不要なら)',
  ]),
  cd('**👍 長所** 操作が直感的・管理者権限が不要なことが多い'),
  cd('**👎 短所** 更新は手動(アプリ内更新があれば自動)'),
  cd('削除: Applications からゴミ箱へ。設定は ⟦~/Library⟧ に残る場合あり'),
]},

{ cat: 'I', t: '📦 pkg(インストーラ)', s: 'システム変更あり', body: [
  cd('ウィザード形式の ⟦.pkg⟧。複数ファイル・ドライバ・ヘルパー等を配置する。'),
  ol([
    '⟦.pkg⟧ をダブルクリック',
    '「続ける」で使用許諾 → インストール先を選択',
    'Touch ID / パスワードで管理者認証',
    '完了後、インストーラはゴミ箱へ',
  ]),
  cc(`# ターミナルから
sudo installer -pkg app.pkg -target /`),
  cd('削除: .app 削除だけでは不完全なことが多い → 公式アンインストーラを使う / ⟦pkgutil --files <id>⟧ で確認'),
]},

{ cat: 'I', t: '🍺 Homebrew', s: '開発者向け定番', body: [
  cd('コマンドでアプリ・CLIツールを一括管理。⟦brew.sh⟧ の手順で導入。'),
  cc(`# GUIアプリ(Cask)
brew install --cask google-chrome
# CLIツール(Formula)
brew install git wget
brew search keyword     # 検索
brew list               # 一覧
brew update && brew upgrade   # 更新
brew uninstall wget     # 削除
brew uninstall --cask --zap app # 設定も削除
brew bundle dump        # Brewfile に書き出し`),
  cd('**👍 長所** 再現しやすい・一括更新・Brewfileで環境複製'),
  cd('**👎 短所** 初回に導入作業が必要・CLIに慣れが必要'),
]},

{ cat: 'I', t: '🗜️ ZIP / .app 直接配置', s: 'シンプル', body: [
  cd('⟦.zip⟧ を展開すると ⟦.app⟧ が出てくる形式。'),
  ol([
    'ZIP をダブルクリックで展開(自動で .app が出現)',
    '**.app を「アプリケーション」フォルダへ移動**',
    '初回は一度起動を試み、警告を閉じる → **システム設定 → プライバシーとセキュリティ →「このまま開く」**(🔒 の欄を参照)',
  ]),
  cd('ダウンロードフォルダのまま起動すると自動更新・権限付与が失敗することがある。必ず Applications へ。'),
]},

{ cat: 'I', t: '🧰 その他のメジャーな方法', body: [
  ul([
    '**公式インストーラスクリプト**: ⟦curl -fsSL URL | sh⟧(例: Homebrew, rustup)⚠ 取得したスクリプトの**中身を確認してから**実行する',
    '**言語ごとのパッケージ管理**: ⟦pip⟧ / ⟦npm⟧ / ⟦cargo⟧ / ⟦gem⟧ など、その言語用のライブラリ・ツールを入れる仕組み',
  ]),
]},

{ cat: 'I', t: 'インストール方法の比較', body: [
  cd('方法 ／ おすすめの場面 ／ 更新 ／ 管理者権限 ／ 削除のしやすさ'),
  kv([
    ['⟦App Store⟧', 'まず探す場所。安全重視 ／ 更新: 自動 ／ 管理者権限: 不要 ／ 削除: ◎ 簡単'],
    ['⟦DMG / ZIP⟧', '公式サイト配布の普通のアプリ ／ 更新: アプリ依存 ／ 管理者権限: 不要が多い ／ 削除: ○ ゴミ箱へ'],
    ['⟦pkg⟧', 'ドライバ・業務ソフト・ヘルパー付き ／ 更新: アプリ依存 ／ 管理者権限: 必要 ／ 削除: △ 専用アンインストーラ推奨'],
    ['⟦Homebrew⟧', '開発ツール・環境の再現・一括更新 ／ 更新: ⟦brew upgrade⟧ ／ 管理者権限: 初回のみ ／ 削除: ◎ コマンド一発'],
  ]),
]},

{ cat: 'I', t: '🔒 「開発元を検証できません」と表示されたら', s: 'Gatekeeper', body: [
  cd('信頼できる配布元か確認したうえで、**システム設定 → プライバシーとセキュリティ →「このまま開く」** を押します。'),
  cc('xattr -dr com.apple.quarantine /Applications/Foo.app'),
  cd('⚠ 隔離属性は上のコマンドで外せますが、出所が確かな場合のみ使ってください。ダウンロード元は公式サイト・App Store・信頼できる Homebrew を基本にしましょう。'),
  cd('不明な提供元のアプリは避ける。'),
]},

];

/* ================= カードの見出しアイコン ================= */
const ICON = {
  'まず覚える6つ': '🔰', '修飾キーの記号': '⌘', '基本編集': '✂️',
  'テキスト編集・カーソル移動': '📝', 'アプリ・ウィンドウ': '🪟',
  'Mission Control・システム': '🖥️', '起動・トラブル対応': '🛟',
  'Finder(ファイル操作)': '📁', 'Finder(移動・表示)': '📁',
  'スクリーンショット': '📸', '日本語入力': 'あ',
  'アクセシビリティ・ヘルプ': '♿', 'ブラウザ(Safari / Chrome)': '🌐',
  'トラックパッドジェスチャ(1〜2本指)': '👆', 'トラックパッドジェスチャ(3本指以上)': '👆',
  'ターミナル(実行・履歴)': '⌨️', 'ターミナル(行編集・ウインドウ)': '⌨️',
  '基本コマンド① 今どこ・何がある・移動する': '📂',
  '基本コマンド② 作る・コピー・移動・消す': '🗂️',
  '基本コマンド③ プロセスとポートを調べる・止める': '🔌',
  'macOS のコマンド・システム情報': '🍎',
  '① Xcode Command Line Tools(C言語の最初の一歩)': '🛠️',
  'コンピュータで使用する主な記号 (1)': '＃',
  'コンピュータで使用する主な記号 (2)': '＃',
  'コンピュータで使用する主な記号 (3)': '＃',
  'インストール方法の比較': '📊',
};

/* ================= ページ割り ================= */
const SPLIT = [13, 9, 12];         // 各ページに載せるカード枚数
const META = [
  { ttl: 'macOS ショートカット チートシート',
    sub: '★ = まず覚える定番 ／ グレー文字 = 上級者向け ／ ⚠ = 間違えやすい点',
    foot: '**［まず持ち歩く］1枚目** 毎日使う基本操作 ／ macOS 26 Tahoe / 27 Golden Gate 対応 ／ ⌘ = Command　⌥ = Option　⌃ = Control　⇧ = Shift　⌫ = Delete　↩ = Return' },
  { ttl: 'macOS トラックパッド・ターミナル',
    sub: 'ジェスチャ / キー操作 / 基本コマンド ／ ★ 定番　グレー 上級者向け　⚠ 間違えやすい点',
    foot: '**［参照用］2枚目** ターミナルで手が止まったとき ／ ターミナルの場所: アプリケーション → ユーティリティ → ターミナル ／ コマンドは「コマンド -オプション 対象」の形で書く ／ ⟦Tab⟧ 補完と ⟦man⟧ を使うこと' },
  { ttl: 'macOS 記号・アプリのインストール',
    sub: '記号の読み方と入力 / アプリの入手 ／ ★ 定番　グレー 上級者向け　⚠ 間違えやすい点',
    foot: '**［参照用］3枚目** 記号とアプリ導入で迷ったとき ／ 配布形式ごとの手順・向き不向き・アンインストール方法 ／ 記号は英数(半角)モードで入力する' },
];

/* ================= 組み立て ================= */
const CATNAME = Object.fromEntries(CATS.map(([k, n]) => [k, n]));
const legend = '<div class="legend">' + CATS.map(([k, , short]) =>
  `<span class="lg lg${k}"><i></i>${k} ${esc(short)}</span>`).join('') + '</div>';

const secBand = (k, cont) =>
  `<div class="sec s${k}"><b>${k}</b>${esc(CATNAME[k])}${cont ? '（続き）' : ''}</div>`;

const cardHtml = c => {
  const ic = ICON[c.t] ? `<i class="ic">${ICON[c.t]}</i>` : '';
  const sm = c.s ? `<i class="sm">${esc(c.s)}</i>` : '';
  return `<div class="card c${c.cat}"><div class="ct">${ic}${esc(c.t)}${sm}</div>${c.body.join('')}</div>`;
};

if (SPLIT.reduce((a, b) => a + b, 0) !== CARDS.length) {
  throw new Error(`SPLIT(${SPLIT.join('+')}) とカード枚数(${CARDS.length})が合わない`);
}

const seen = new Set();
let pos = 0;
const pages = SPLIT.map((n, p) => {
  const chunk = CARDS.slice(pos, pos + n);
  pos += n;
  let cur = null, body = '';
  for (const c of chunk) {
    if (c.cat !== cur) { body += secBand(c.cat, seen.has(c.cat)) + '\n'; seen.add(c.cat); cur = c.cat; }
    body += cardHtml(c) + '\n';
  }
  return `<div class="page">
<div class="head${p ? ' slim' : ''}"><div class="ttl"><b>${esc(META[p].ttl)}</b><span>${esc(META[p].sub)}</span></div>${legend}</div>
<div class="grid">
${body}</div>
<div class="foot"><span>${TXT(META[p].foot)}</span><span>${p + 1} / ${SPLIT.length}</span></div>
</div>`;
});

/* ================= CSS ================= */
// 本文(カード内)の文字サイズ倍率。段組の埋まり具合をこれで調整する
const FS = 1.16;
const pt = v => (v * FS).toFixed(2) + 'pt';
const css = `
:root{
  --cA:#1a4fa0; --cB:#6b3fa0; --cC:#1f7a3f; --cD:#b07500;
  --cE:#6d8c1f; --cF:#c0272d; --cG:#9c2a8c; --cH:#d2691e; --cI:#0f7b7b;
  --ink:#1a1a1a; --sub:#3f3f3f; --dim:#7b7b7b; --line:#d5d5d5; --rule:#ededed;
  --codebg:#f4f4f4; --ccbd:#c6c6c6; --chipbd:#dedede; --paper:#fff; --desk:#8f8f8f;
  --band:#fff; --tint:9%; --star:#b8860b; --cmt:#2e7d4f;
  --headrule:#333; --footink:#666; --footrule:#bbb; --shadow:rgba(0,0,0,.45); --cardtop:#999;
  --mono:"SFMono-Regular","SF Mono",Menlo,Consolas,"DejaVu Sans Mono",monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{background:var(--desk);
  font-family:"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;
  color:var(--ink);}
@page{size:A4 landscape;margin:7mm}

.page{
  width:283mm;height:196mm;background:var(--paper);
  margin:6mm auto;display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 2px 10px var(--shadow);
}
.grid{
  flex:1 1 auto;min-height:0;overflow:hidden;
  column-count:5;column-gap:2.0mm;column-fill:balance;
}

/* ヘッダ帯と凡例 */
.head{display:flex;align-items:flex-end;gap:3mm;border-bottom:1.2pt solid var(--headrule);
  padding:0 0 1.0mm;margin-bottom:1.3mm;flex:0 0 auto}
.ttl{white-space:nowrap}
.ttl b{font-size:13.20pt;letter-spacing:.02em}
.ttl span{font-size:6.72pt;color:var(--sub);margin-left:2mm}
.head.slim .ttl b{font-size:10.20pt}
.legend{display:flex;flex-wrap:wrap;gap:0 2.2mm;flex:1 1 auto;justify-content:flex-end}
.lg{font-size:6.60pt;color:var(--ink);white-space:nowrap;display:inline-flex;align-items:center}
.lg i{display:inline-block;width:5.4pt;height:5.4pt;border-radius:1pt;margin-right:.7mm}

/* カテゴリ帯 */
.sec{break-inside:avoid;-webkit-column-break-inside:avoid;
  break-after:avoid;-webkit-column-break-after:avoid;
  color:var(--band);font-size:${pt(7.44)};font-weight:700;line-height:1.25;
  padding:.55mm 1.1mm;border-radius:.6mm;margin:0 0 .8mm;}
.sec b{display:inline-block;background:rgba(255,255,255,.3);border-radius:.5mm;
  padding:0 .8mm;margin-right:1mm}

/* カード */
.card{break-inside:avoid;-webkit-column-break-inside:avoid;
  border:.4pt solid var(--line);border-top:1.7pt solid var(--cardtop);border-radius:.6mm;
  padding:.5mm .9mm .8mm;margin:0 0 .95mm;background:var(--paper);}
.ct{font-size:${pt(7.08)};font-weight:700;line-height:1.25;
  margin:-.5mm -.9mm .6mm;padding:.5mm .9mm .45mm}
.ct .ic{font-style:normal;margin-right:.7mm}
.ct .sm{font-style:normal;font-weight:400;font-size:${pt(6.0)};opacity:.85;margin-left:.9mm}
.cc{font-family:var(--mono);font-size:${pt(6.36)};line-height:1.32;
  white-space:pre-wrap;overflow-wrap:anywhere;
  background:var(--codebg);border-left:.9pt solid var(--ccbd);
  padding:.45mm .8mm;border-radius:.4mm;margin-bottom:.55mm;}
.cc .cm{color:var(--cmt);font-style:normal}
.cg{display:flex;flex-wrap:wrap;gap:.4mm;margin-bottom:.55mm}
.cd{font-size:${pt(6.24)};line-height:1.35;color:var(--sub)}
.cd+.cd{margin-top:.35mm}
.card>.cd{margin-top:.45mm}
.card>.cd:first-of-type{margin-top:0}

/* キー＋説明の行(macOS版で追加) */
.kv{margin-bottom:.3mm}
.kv>div{display:flex;align-items:baseline;gap:1.0mm;padding:.2mm 0;
  font-size:${pt(6.24)};line-height:1.35;color:var(--sub)}
.kv>div+div{border-top:.3pt solid var(--rule)}
.kv em.cg{display:block;flex:0 0 auto;max-width:56%;margin:0;
  font-style:normal;color:var(--ink);overflow-wrap:anywhere}
.kv>div>span{flex:1 1 auto;min-width:0;overflow-wrap:anywhere}
.kv>div.m>span::before{content:"★";color:var(--star);margin-right:.5mm}
.kv>div.p>span{color:var(--dim)}
.cg span{font-family:var(--mono);font-size:${pt(6.12)};
  background:var(--codebg);border:.3pt solid var(--chipbd);border-radius:.4mm;
  padding:0 .55mm;color:var(--ink);font-weight:400}
.cg span{display:inline-block;line-height:1.3;white-space:nowrap}
.kv .cg span{margin:.1mm .15mm .1mm 0}

/* 手順・箇条書き(macOS版で追加) */
.cl{font-size:${pt(6.24)};line-height:1.35;color:var(--sub);
  margin:0 0 .55mm 3.0mm;padding:0}
.cl.b{list-style:disc;margin-left:2.6mm}
.cl li{margin-bottom:.15mm;padding-left:.2mm}

/* 説明文の中の等幅・強調 */
.cd code,.kv code,.cl code,.foot code{font-family:var(--mono);font-size:.95em;
  background:var(--codebg);border:.3pt solid var(--chipbd);border-radius:.3mm;
  padding:0 .35mm;color:var(--ink);overflow-wrap:anywhere}
.cd .st,.kv .st,.cl .st{color:var(--ink)}

/* 柱 */
.foot{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;gap:3mm;
  border-top:.5pt solid var(--footrule);margin-top:1.1mm;padding-top:.7mm;
  font-size:6.24pt;color:var(--footink)}

.cA{border-top-color:var(--cA)} .cA>.ct{color:var(--cA);background:color-mix(in srgb,var(--cA) var(--tint),var(--paper))} .sA{background:var(--cA)} .lgA i{background:var(--cA)}
.cB{border-top-color:var(--cB)} .cB>.ct{color:var(--cB);background:color-mix(in srgb,var(--cB) var(--tint),var(--paper))} .sB{background:var(--cB)} .lgB i{background:var(--cB)}
.cC{border-top-color:var(--cC)} .cC>.ct{color:var(--cC);background:color-mix(in srgb,var(--cC) var(--tint),var(--paper))} .sC{background:var(--cC)} .lgC i{background:var(--cC)}
.cD{border-top-color:var(--cD)} .cD>.ct{color:var(--cD);background:color-mix(in srgb,var(--cD) var(--tint),var(--paper))} .sD{background:var(--cD)} .lgD i{background:var(--cD)}
.cE{border-top-color:var(--cE)} .cE>.ct{color:var(--cE);background:color-mix(in srgb,var(--cE) var(--tint),var(--paper))} .sE{background:var(--cE)} .lgE i{background:var(--cE)}
.cF{border-top-color:var(--cF)} .cF>.ct{color:var(--cF);background:color-mix(in srgb,var(--cF) var(--tint),var(--paper))} .sF{background:var(--cF)} .lgF i{background:var(--cF)}
.cG{border-top-color:var(--cG)} .cG>.ct{color:var(--cG);background:color-mix(in srgb,var(--cG) var(--tint),var(--paper))} .sG{background:var(--cG)} .lgG i{background:var(--cG)}
.cH{border-top-color:var(--cH)} .cH>.ct{color:var(--cH);background:color-mix(in srgb,var(--cH) var(--tint),var(--paper))} .sH{background:var(--cH)} .lgH i{background:var(--cH)}
.cI{border-top-color:var(--cI)} .cI>.ct{color:var(--cI);background:color-mix(in srgb,var(--cI) var(--tint),var(--paper))} .sI{background:var(--cI)} .lgI i{background:var(--cI)}

@media print{
  html,body{background:var(--paper)}
  .page{margin:0;box-shadow:none;width:auto;height:196mm;
    break-after:page;page-break-after:always}
  .page:last-child{break-after:auto;page-break-after:auto}
}
`;

/* ダークは配色だけの上書き(構造・クラスはライトと同一) */
const darkCss = `
:root{
  --cA:#7fa8ff; --cB:#c6a4ff; --cC:#5fd39a; --cD:#e8b84b;
  --cE:#b6d45c; --cF:#ff8f8f; --cG:#e9a3e4; --cH:#ffab6b; --cI:#58d2d2;
  --ink:#e9edf5; --sub:#c3cbd9; --dim:#8c95a6; --line:#2a3140; --rule:#262c38;
  --codebg:#1b202b; --ccbd:#39414f; --chipbd:#39414f; --paper:#141821; --desk:#0a0c11;
  --band:#0d1017; --tint:20%; --star:#ffd166; --cmt:#7fcf9f;
  --headrule:#4d5668; --footink:#8b94a4; --footrule:#2f3645; --shadow:rgba(0,0,0,.7); --cardtop:#565e6e;
}
`;

const htmlDoc = (title, desc, extra) => `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<style>${css}</style>${extra}
</head>
<body>
${pages.join('\n')}
</body>
</html>
`;

const DESC = `macOSの標準的なキーボードショートカット・トラックパッド・ターミナル・記号と、アプリのインストール方法(DMG/pkg/App Store/Homebrewほか)をまとめたA4横${SPLIT.length}ページのチートシート。`;

fs.writeFileSync(path.join(DIR, 'index-light.html'),
  htmlDoc('[ライト] macOS ショートカット・ターミナル・アプリインストール チートシート', DESC, ''));
fs.writeFileSync(path.join(DIR, 'index.html'),
  htmlDoc('macOS ショートカット・ターミナル・アプリインストール チートシート', DESC,
    `\n<style id="dark-theme">${darkCss}</style>`));

console.log('ok', CARDS.length, 'cards /', SPLIT.length, 'pages');
