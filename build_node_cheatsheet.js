// Node.js Webアプリ開発チートシート(A4横・5段組・4ページ)を生成する
// 生成方式と CSS は build_c_cheatsheet.js(ライト1枚出力)に揃え、
// カード見出しの絵文字(ICON)は build_macos_cheatsheet.js の流儀に合わせている
//   .page / .head / .legend / .grid / .sec / .card / .ct / .cc / .kv / .tb / .cw / .cd / .foot
// Node.js 版では、実際のエラー文面を載せる .er(エラー → 対処)を追加している
// 掲載内容は Node v26.4.0 / npm 11.17.0 / Express 5.3.0 / ejs 7.0.2 / nodemon 3.1.14 で動作確認済み
// tako:run node build_node_cheatsheet.js
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'node_cheatsheet_light.html');

/* ================= カテゴリ ================= */
// [記号, 帯の名前, 凡例の短い名前]
const CATS = [
  ['A', '環境構築(brew・nodebrew・npm)', '環境構築'],
  ['B', 'UNIX 基本コマンド', 'UNIX コマンド'],
  ['C', 'JavaScript の値・型・制御', 'JS の値と型'],
  ['D', '関数・配列・オブジェクト', '関数・配列'],
  ['E', '非同期処理', '非同期処理'],
  ['F', 'Node.js の作法', 'Node.js の作法'],
  ['G', 'Express(Web アプリ)', 'Express'],
  ['H', 'トラブル対処', 'トラブル対処'],
];
const CATNAME = Object.fromEntries(CATS.map(([k, n]) => [k, n]));

/* ================= 部品 ================= */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// `x` … 等幅  **x** … 強調
const inl = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// コード塊。lang='js' は //、'sh' は # をコメント色にする('none' は着色しない)
// 行頭か空白の直後の記号だけをコメントとみなす(http:// や '#id' を誤って着色しないため)
const CC = (text, lang = 'js') => {
  const re = lang === 'js' ? /(^|\s)\/\// : lang === 'sh' ? /(^|\s)#(\s|$)/ : null;
  const lines = text.replace(/^\n/, '').replace(/\n$/, '').split('\n').map(l => {
    const m = re && re.exec(l);
    if (!m) return esc(l);
    const cut = m.index + m[1].length;
    return esc(l.slice(0, cut)) + '<span class="cm">' + esc(l.slice(cut)) + '</span>';
  });
  return `<div class="cc">${lines.join('\n')}</div>`;
};

// キー+説明の行。flag 'm' で ★(定番)、'p' でグレー(上級者向け)
const KV = (...rows) => '<div class="kv">' + rows.map(([code, desc, flag = '']) =>
  `<div${flag ? ` class="${flag}"` : ''}>${code ? `<b>${esc(code)}</b>` : ''}` +
  `<span>${inl(desc)}</span></div>`).join('') + '</div>';

// 説明文のみ
const CD = t => `<div class="cd">${inl(t)}</div>`;
// ⚠ 間違えやすい点
const CW = t => `<div class="cw">${inl(t)}</div>`;
// 一覧表
const TB = (head, rows) =>
  `<table class="tb"><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>` +
  rows.map(r => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="f"' : ''}>${inl(c)}</td>`).join('')}</tr>`).join('') +
  '</tbody></table>';
// エラー文面(実際の出力そのまま) → 原因と対処
const ER = (...rows) => '<div class="er">' + rows.map(([msg, fix]) =>
  `<div><code>${esc(msg)}</code><span>${inl(fix)}</span></div>`).join('') + '</div>';

// カード1枚。見出しの絵文字は ICON から引く
const C = (cat, title, ...body) => ({ cat, title, body });

/* ================= 収録カード(掲載順はそのまま) ================= */
const CARDS = [

/* ---- A 環境構築 ---- */
C('A', '道具の関係(何が何を入れるか)',
  CC(`
Homebrew ─→ nodebrew を入れる
nodebrew ─→ Node.js を入れる
            (node と npm が付属)
npm      ─→ express などを入れる`, 'none'),
  KV(['brew', 'Mac のソフト管理(macOS 全体)', 'm'],
     ['nodebrew', 'Node.js の版の管理(切り替え・更新)', 'm'],
     ['npm', 'JS ライブラリの管理(プロジェクトごと)', 'm'],
     ['… -v', '版を表示(`brew -v` `nodebrew -v` `node -v` `npm -v`)'])),

C('A', 'Homebrew の基本',
  KV(['brew install 名前', 'ソフトを入れる', 'm'],
     ['brew install --cask 名前', 'GUI アプリを入れる(例 `google-chrome`)'],
     ['brew uninstall 名前', '削除'],
     ['brew list', '入っているもの一覧(`--versions` で版も)', 'm'],
     ['brew search 語', '名前で探す'],
     ['brew info 名前', '説明・版・依存を表示'],
     ['brew doctor', '環境の問題を診断']),
  CD('Homebrew 本体の導入は公式サイト `brew.sh` の1行コマンドで(macOS 版シート参照)')),

C('A', 'Homebrew の更新',
  CC(`
brew update      # ① 一覧を最新に
brew outdated    # ② 古いものを確認
brew upgrade     # ③ すべて更新
brew upgrade git # 1つだけ更新
brew cleanup     # ④ 古い版を削除`, 'sh'),
  KV(['brew upgrade --greedy', '自動更新付きの GUI アプリも対象に', 'p']),
  CD('`install` / `upgrade` の前には `update` が24時間に1回自動で走る。`upgrade` の後は古い版の `cleanup` も自動で行われる'),
  CW('`update` は一覧の更新だけで、ソフトは新しくならない。本体を新しくするのは `upgrade`'),
  CW('nodebrew で入れた Node.js は `brew upgrade` では更新されない(次のカード)')),

C('A', 'nodebrew の導入',
  CC(`
brew install nodebrew
nodebrew setup          # 初回だけ
echo 'export PATH=~/.nodebrew/current/bin:$PATH' >> ~/.zshrc
source ~/.zshrc         # 読み直す
nodebrew install stable # 入れる
nodebrew use stable     # 使う版にする
which node  # ~/.nodebrew/… なら OK`, 'sh'),
  KV(['nodebrew ls', '入っている版と `current:`(使用中)', 'm'],
     ['nodebrew install v24', 'v24 系の最新を入れる'],
     ['stable / latest', '最新の偶数版(LTS 系) / 最新版']),
  CW('`brew install node` と併用しない。どちらの node が動くか分からなくなる(`which node` で確認)')),

C('A', 'Node.js のアップデート',
  CC(`
node -v                 # 今の版
nodebrew install stable # 最新を追加
nodebrew use stable     # 切り替え
node -v                 # 新しい版
nodebrew uninstall v26.4.0  # 削除`, 'sh'),
  CD('古い版は消さなくてよい。`nodebrew use v26.4.0` でいつでも戻せる'),
  CW('`use` は全ターミナル共通。開いている他のウインドウの node も切り替わる')),

C('A', 'npm の基本',
  KV(['npm init -y', '`package.json` を作る(最初に1回)', 'm'],
     ['npm install express', 'ライブラリを入れる(`npm i` と略せる)', 'm'],
     ['npm install -D nodemon', '開発中だけ使うものを入れる'],
     ['npm install', '`package.json` の全部を入れる(受け取ったら)', 'm'],
     ['npm outdated / update', '新しい版の確認 / `^` の範囲で更新'],
     ['npm run 名前', '`scripts` の名前のコマンドを実行', 'm'],
     ['npm start', '`scripts.start` を実行(`run` 不要)'],
     ['npx 名前', 'プロジェクト内のコマンドを直接実行']),
  CW('`npm install -g` で入れたものは Node.js の版を切り替えると使えなくなる。プロジェクト内に入れて `npx` で使う')),

C('A', 'package.json',
  CC(`
{
  "name": "myapp",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^5.3.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}`, 'none'),
  KV(['"type"', '`"commonjs"`(npm 11 の `init -y` の既定)→ `require` / `"module"` → `import`(F)', 'm'],
     ['"scripts"', '`npm run dev` で呼ぶコマンドの別名'],
     ['devDependencies', '開発中だけ必要なもの(`-D` で入れた)'],
     ['^5.3.0', '5.x.x の範囲なら新しい版を許す']),
  CW('`npm dev` は動かない(`Unknown command: "dev"`)。`start` 以外は `npm run dev` と `run` を付ける')),

C('A', 'package-lock.json と node_modules',
  KV(['package-lock.json', '実際に入った正確な版の記録。消さずに一緒に配布する', 'm'],
     ['node_modules/', 'ライブラリ本体(数千ファイル)。配布しない。`npm install` で再生成', 'm']),
  CC(`
# .gitignore(Git に入れないもの)
node_modules/
.env`, 'sh'),
  CW('人に渡す・提出するときも `node_modules` は除く。受け取った側が `npm install` する')),

/* ---- B UNIX 基本コマンド ---- */
C('B', '場所の確認と移動',
  KV(['pwd', '**print working directory** 今いる場所', 'm'],
     ['ls', '**list** ファイル一覧', 'm'],
     ['ls -la', '隠しファイル(`.env` など)も詳しく表示'],
     ['cd フォルダ', '**change directory** 移動', 'm'],
     ['cd ..', '一つ上へ'],
     ['cd ~', 'ホームへ(`cd` だけでも同じ)'],
     ['cd -', '直前の場所へ戻る', 'p']),
  CD('名前の途中で `Tab` を押すと補完される。打ち間違い防止に必ず使う')),

C('B', '作る・コピー・移動・消す',
  KV(['mkdir 名前', '**make directory** フォルダを作る', 'm'],
     ['mkdir -p a/b', '途中の階層もまとめて作る'],
     ['touch app.js', '空のファイルを作る'],
     ['cp 元 先', '**copy** コピー(フォルダは `cp -r`)'],
     ['mv 元 先', '**move** 移動・名前の変更', 'm'],
     ['rm ファイル', '**remove** 削除(フォルダは `rm -r`)', 'm'],
     ['cat ファイル', '中身を表示'],
     ['less ファイル', '1画面ずつ読む(`q` で終了)'],
     ['tail -f app.log', 'ファイルの末尾を表示し続ける', 'p']),
  CW('`rm` はゴミ箱に入らず即削除。取り消しできない')),

C('B', 'パスと記号',
  KV(['/', 'ルート(一番上)・区切り'],
     ['~', 'ホーム(`/Users/自分`)'],
     ['.  ..', '今いる場所 / 一つ上'],
     ['*', '何でも一致(`ls *.js`)'],
     ['> / >>', '出力をファイルへ(上書き / 追記)'],
     ['|', '**パイプ** 出力を次のコマンドへ'],
     ['&&', '前が成功したら次を実行']),
  CD('**絶対パス** は `/` から始まる。**相対パス** は今いる場所が起点')),

C('B', 'PATH と環境の確認',
  KV(['which node', '実際に動く node の場所', 'm'],
     ['echo $PATH', 'コマンドを探す場所(`:` 区切り)'],
     ['~/.zshrc', 'ターミナル起動時に読まれる設定ファイル'],
     ['source ~/.zshrc', '設定をいま読み直す'],
     ['export X=値', '環境変数を設定'],
     ['grep -rn 語 .', 'フォルダ内のファイルから文字列を探す'],
     ['man コマンド', '説明書(`q` で終了)']),
  CW('`zsh: command not found: node` は PATH の設定漏れ。nodebrew のカードの `echo … >> ~/.zshrc` を確認')),

C('B', 'プロセスを調べる・止める',
  KV(['Ctrl+C', '前面で動いているサーバを止める', 'm'],
     ['ps', '**process status** このターミナルのプロセス'],
     ['ps aux | grep node', '全プロセスから node を探す(2列目が PID)', 'm'],
     ['ps -p PID -o command=', 'その PID が何のコマンドかを確認'],
     ['kill PID', '終了を頼む。まずこれ', 'm'],
     ['kill -9 PID', '強制終了。`kill` で止まらないときだけ', 'p']),
  CD('**PID** = プロセスごとの番号。止めるときはこの番号で指定する'),
  CW('`Ctrl+Z` は止めずに一時停止するだけ。ポートを握ったまま残り、次の起動が `EADDRINUSE` になる')),

C('B', 'lsof でポートを調べる',
  CC(`
lsof -i :3000   # 3000番を使うのは?
COMMAND   PID ... NAME
node    12345 ... *:hbci (LISTEN)
ps -p 12345 -o command=  # ① 確認
node app.js
kill 12345      # ② 自分のなら止める
lsof -i :3000   # 空なら解放された`, 'sh'),
  KV(['lsof -i :3000', '**list open files** そのポートを使うプロセス', 'm'],
     ['lsof -P -i :3000', 'NAME をポート番号で表示(`*:3000`)', 'p']),
  CD('2列目が PID。NAME の `hbci` は 3000番に登録された名前(番号の代わりに表示される)。止めずに `PORT=3001 node app.js` と別の番号で起動してもよい'),
  CW('他人や別の作業のサーバを止めないよう、`kill` の前に ① で必ず確認する')),

/* ---- C JavaScript の値・型・制御 ---- */
C('C', 'JavaScript を動かす',
  CC(`
node hello.js     # ファイルを実行
node              # 対話モード(REPL)
> 1 + 2
3
> .exit           # 終了(Ctrl+D でも可)`, 'sh'),
  KV(['console.log(x)', '表示(C の `printf`)。`,` で複数並べられる', 'm'],
     ['console.error(x)', 'エラー出力へ表示'],
     ['// …  /* … */', 'コメント(C と同じ)'],
     [';', '文末。省略もできるが付ける習慣に'],
     ['⌥⌘I → Console', 'ブラウザでも実行できる']),
  CD('ファイルの**上から順に**実行される。`main` 関数は無い')),

C('C', '変数と型',
  CC(`
const PI = 3.14;  // 再代入できない
let count = 0;    // 再代入できる
count = count + 1;
var old = 1;      // 古い書き方
typeof count      // 'number'`),
  TB(['型', '例', 'typeof'], [
    ['数値', '`42` `3.14` `NaN`', "`'number'`"],
    ['文字列', "`'abc'` `\"abc\"`", "`'string'`"],
    ['真偽値', '`true` `false`', "`'boolean'`"],
    ['未定義', '`undefined`(値が無い)', "`'undefined'`"],
    ['空', '`null`(空を表す値)', "`'object'` ⚠"],
    ['オブジェクト', '`{ a: 1 }` `[1, 2]`', "`'object'`"],
  ]),
  CW('迷ったら `const`。値を変える変数だけ `let`。`const` に再代入すると `TypeError: Assignment to constant variable.`')),

C('C', '数値と演算',
  KV(['5 / 2', '→ `2.5`(C と違い切り捨てない)', 'm'],
     ['Math.floor(5 / 2)', '→ `2`(切り捨て)'],
     ['7 % 3  /  2 ** 10', '→ `1`(余り) / `1024`(べき乗)'],
     ['0.1 + 0.2', '→ `0.30000000000000004`(誤差)'],
     ['Number("42")', '文字列 → 数値'],
     ['parseInt("42px")', '→ `42`(先頭の数字だけ)'],
     ['Number("abc")', '→ `NaN`(数ではない)'],
     ['(3.14159).toFixed(2)', '→ `"3.14"`(文字列になる)'],
     ['Math.round / max / random', '四捨五入 / 最大 / 0以上1未満の乱数']),
  CW('`"5" + 1` → `"51"`(文字列の連結)、`"5" - 1` → `4`。フォームの値は文字列なので `Number()` で変換する')),

C('C', '文字列',
  CC(`
const name = 'Node';
\`Hello, \${name}!\`  // 'Hello, Node!'
'a' + 'b'          // 'ab'(連結)`),
  KV(['s.length', '文字数'],
     ['s.toUpperCase()', '大文字に(`toLowerCase` で小文字)'],
     ['s.includes("od")', '含むか → `true`'],
     ['s.slice(1, 3)', '1〜2文字目 → `"od"`'],
     ['s.split(",")', '区切って配列に'],
     ['s.trim()', '前後の空白を除く'],
     ['s.replaceAll("a", "b")', 'すべて置換'],
     ['String(42)', '数値 → 文字列']),
  CD("`'…'` と `\"…\"` は同じ意味。変数を埋め込むときはバッククォートで囲む(JIS キーボードでは Shift+@)")),

C('C', '比較と真偽値',
  KV(['=== / !==', '型も含めて比較。こちらを使う', 'm'],
     ['== / !=', '型を変換して比較。`0 == ""` が `true` になるので使わない'],
     ['&& || !', 'かつ / または / 否定(C と同じ)'],
     ['falsy', '`false` `0` `""` `null` `undefined` `NaN` は偽'],
     ['truthy', 'それ以外はすべて真(`"0"` `[]` `{}` も真)'],
     ['a ?? 3', '`a` が `null` か `undefined` なら `3`'],
     ['a || 3', '`a` が偽なら `3`(`0` や `""` も置き換わる)'],
     ['user?.name', '`user` が `undefined` でもエラーにせず `undefined`'])),

C('C', '条件分岐とループ',
  CC(`
if (score >= 80) {
  console.log('A');
} else if (score >= 60) {
  console.log('B');
} else {
  console.log('C');
}
// 三項演算子
const msg = ok ? '成功' : '失敗';
for (let i = 0; i < 3; i++) { … }
for (const x of arr) { … } // 要素
for (const k in obj) { … } // キー`),
  CD('`for (let i …)` / `while` / `switch` / `break` / `continue` は C と同じ書き方'),
  CW('配列には `for...of`。`for...in` を配列に使うと添字が文字列 `"0"` `"1"` で出る')),

C('C', 'C言語との違い',
  TB(['C言語', 'JavaScript'], [
    ['`int x = 1;`', '`let x = 1;`(型を書かない)'],
    ['`5 / 2` → `2`', '`5 / 2` → `2.5`'],
    ['`printf("%d\\n", x);`', '`console.log(x);`'],
    ['`gcc` でコンパイル', '不要。`node app.js` で直接実行'],
    ['`main()` から開始', 'ファイルの上から順に実行'],
    ["`'a'` は文字", "`'a'` も `\"a\"` も文字列"],
    ['`strcmp(a, b) == 0`', '`a === b`'],
    ['`int a[5];`(固定長)', '`const a = [];`(`push` で伸びる)'],
    ['`a[10]` は未定義動作', '`a[10]` は `undefined`'],
    ['`struct`', 'オブジェクト `{ x: 1, y: 2 }`'],
    ['ポインタ', '無い。配列・オブジェクトは参照で渡る'],
    ['`malloc` / `free`', '不要(自動で解放される)'],
  ])),

/* ---- D 関数・配列・オブジェクト ---- */
C('D', '関数とアロー関数',
  CC(`
// 関数宣言
function add(a, b) {
  return a + b;
}
// アロー関数(=> で書く)
const add2 = (a, b) => {
  return a + b;
};
// 1行なら { } と return を省略できる
const add3 = (a, b) => a + b;
// 引数が1つなら ( ) も省略できる
const twice = x => x * 2;
// 引数の既定値
function hi(name = '名無し') { … }`),
  KV(['引数の型', '書かない。渡さなかった引数は `undefined`'],
     ['関数は値', '変数に入れたり、引数として渡したりできる(コールバック)', 'm'],
     ['() => ({ a: 1 })', 'オブジェクトを返すときは `( )` で囲む', 'p'])),

C('D', '配列の基本',
  CC(`
const a = [3, 1, 2];
a.length       // 3
a[0]           // 3(添字は 0 から)
a.push(4);     // 末尾に追加
a.pop();       // 末尾を取り出す → 4
a.includes(2)  // true
a.indexOf(9)   // -1(無い)
a.join('-')    // '3-1-2'
a.slice(0, 2)  // [3, 1](元は不変)`),
  KV(['a.unshift(x) / a.shift()', '先頭に追加 / 先頭を取り出す'],
     ['a.splice(i, 1)', '`i` 番目を1つ削除', 'p']),
  CW('`[10, 9, 1].sort()` → `[1, 10, 9]`(文字列として並ぶ)。数値は `sort((x, y) => x - y)`')),

C('D', '配列メソッド(ループの代わり)',
  CC(`
const nums = [1, 2, 3, 4];
nums.forEach(n => console.log(n));
nums.map(n => n * 2)    // [2,4,6,8]
nums.filter(n => n > 2) // [3, 4]
nums.find(n => n > 2) // 3(最初の1つ)
nums.some(n => n > 3) // true(どれか)
nums.every(n => n > 0) // true(全部)
// 合計 → 10
nums.reduce((s, n) => s + n, 0)`),
  KV(['forEach', '1つずつ処理する(戻り値なし)'],
     ['map', '全要素を変換した新しい配列', 'm'],
     ['filter', '条件に合う要素だけの新しい配列', 'm']),
  CD('`map` `filter` `slice` は元の配列を変えない。`push` `pop` `sort` `splice` は変える')),

C('D', 'オブジェクト',
  CC(`
const user = {
  name: 'Ken',
  age: 20,
};
user.name       // 'Ken'
user['age']     // 20(キーを文字列で)
user.mail = 'a@b.jp'; // 追加
delete user.mail;     // 削除
user.tel        // undefined(無い)
Object.keys(user) // ['name', 'age']
const name = 'Jiro';
// { name: name } の省略形
const u2 = { name, age: 21 };`),
  CD('C の構造体に近い。`[{ id: 1, name: "A" }, …]` のような「オブジェクトの配列」がデータの基本形(JSON と同じ)'),
  CW('`const` でも中身は変更できる(禁止されるのは再代入だけ)')),

C('D', '分割代入とスプレッド構文',
  CC(`
// user.name と user.age を取り出す
const { name, age } = user;
const { name: n } = user; // 別名で
const [a, b] = [10, 20];  // 配列から
const [x, ...rest] = [1, 2, 3];
// rest は [2, 3](残り全部)
// 引数で直接受け取る
function show({ name, age }) { … }
// コピーして一部を上書き
const copy = { ...user, age: 21 };
const all = [...a1, ...a2]; // 連結`),
  KV(['const { id } = req.params;', 'Express でよく使う形', 'm'],
     ['const { name } = req.body;', 'フォームの値を取り出す', 'm'])),

C('D', '例外処理(try / catch)',
  CC(`
try {
  const data = JSON.parse(text);
  console.log(data);
} catch (err) {     // 失敗したら
  console.error(err.message);
} finally {
  // 成功しても失敗しても実行
}
// 自分で例外を投げる
throw new Error('不正な値です');`),
  CD('例外を捕まえないとプログラムはその場で終了する(サーバなら停止)')),

/* ---- H トラブル対処(p2 の空きに置く。JS 全般のデバッグ) ---- */
C('H', 'デバッグのコツ',
  KV(['エラーの1行目', 'まず `Error:` の行と、その下の `at … app.js:12:5`(12行目)を見る', 'm'],
     ['console.log', '途中の値を表示して、どこまで想定どおりか確かめる', 'm'],
     ['JSON.stringify(x, null, 2)', 'オブジェクトの中身を見やすく表示'],
     ['ターミナル', 'サーバ(Node)側のエラーが出る場所'],
     ['⌥⌘I', 'ブラウザ側。Console = JS のエラー、Network = 通信とステータス'],
     ['curl -i URL', 'ブラウザを使わずに応答を確かめる(`-X POST -d \'name=Taro\'` で POST)']),
  CD('エラー文はそのままコピーして検索する。自分のパスやファイル名の部分は除く'),
  CW("zsh では `curl localhost:3000/search?q=node` が `no matches found` になる。`?` を含む URL は `'…'` で囲む")),

/* ---- E 非同期処理 ---- */
C('E', '同期と非同期(待たずに次へ進む)',
  CC(`
console.log('1: 注文');
setTimeout(() => {
  console.log('3: 1秒後に届く');
}, 1000);
console.log('2: 待たずに次へ');`),
  CC(`
時間 →
本体    1 ── 2 ── (本体はここで終わり)
タイマー └──── 1秒 ────→ 3
出力: 1 → 2 → 3`, 'none'),
  CD('ファイル読み込み・通信・タイマーのような時間のかかる処理は、**終わるのを待たずに次の行へ進み**、終わったら後で知らせ(コールバック)を受ける。C は1行ずつ終わるまで待つ'),
  CW('結果を使う処理は「知らせを受けた後」に書く。すぐ次の行に書くと、まだ値が無い')),

C('E', 'コールバック',
  CC(`
const fs = require('fs');
fs.readFile('a.txt', 'utf8', cb);
// 読み終わったら cb が呼ばれる
function cb(err, data) {
  if (err) {   // 失敗すると err に入る
    console.error(err.message);
    return;
  }
  console.log(data);
}
console.log('こちらが先に表示される');`),
  CD('`cb` のように「終わったら呼んでもらう関数」をコールバックと呼ぶ。普通はアロー関数で直接書く。第1引数がエラー、第2引数が結果(Node の約束)。入れ子が深くなりやすい(コールバック地獄)ので、新しく書くなら Promise / async を使う')),

C('E', 'Promise',
  CC(`
const fs = require('fs/promises');
fs.readFile('a.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error(err))
  .finally(() => console.log('終了'));
// 自分で作る例: ms ミリ秒だけ待つ
const sleep = ms => new Promise(
  r => setTimeout(r, ms));`),
  KV(['.then / .catch', '成功したとき / 失敗したときに呼ばれる', 'm'],
     ['Promise', '「後で結果が届く」ことを表す値。成功(resolve)か失敗(reject)で終わる'],
     ['Promise.all([p1, p2])', '全部終わるまで待つ(並行に実行)', 'p'])),

C('E', 'async / await',
  CC(`
const fs = require('fs/promises');

async function main() {
  try {
    const data = await fs.readFile(
      'a.txt', 'utf8');
    // ↑ 読み終わるまで待ってから次へ
    console.log(data);
    await sleep(1000);  // 1秒待つ
  } catch (err) {  // 失敗はここ
    console.error(err.message);
  }
}
main();`),
  CW('`await` は `async` 関数の中だけ。外で使うと `SyntaxError: await is only valid in async functions and the top level bodies of modules`(ES Modules ならトップレベルも可)'),
  CW('`await` を付け忘れると値ではなく `Promise { <pending> }` が返る')),

C('E', '3つの書き方の対応',
  TB(['書き方', '成功したとき', '失敗したとき'], [
    ['コールバック', '`(err, data) =>` の `data`', '`if (err) { … }`'],
    ['Promise', '`.then(data => …)`', '`.catch(err => …)`'],
    ['async/await', '`const data = await …`', '`try { } catch (err) { }`'],
  ]),
  CD('`fs/promises` や `fetch` のように Promise を返す関数には `await` を付けて使う'),
  CW('`forEach` の中の `await` は待ってくれない。順に待つなら `for (const x of list) { await … }`')),

/* ---- F Node.js の作法 ---- */
C('F', 'JSON',
  CC(`
const obj = { name: 'Ken', age: 20 };
// オブジェクト → 文字列
const s = JSON.stringify(obj);
// s は '{"name":"Ken","age":20}'
JSON.stringify(obj, null, 2) // 整形
// 文字列 → オブジェクト
const back = JSON.parse(s);
back.name                    // 'Ken'`),
  KV(['" "', 'キーも文字列もダブルクォート。`\'`・末尾の `,`・コメントは不可', 'm']),
  CW("`SyntaxError: Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON` → HTML(404 ページなど)を受け取った。URL を確認")),

C('F', 'CommonJS と ES Modules',
  CC(`
// CommonJS("type": "commonjs")
const express = require('express');
const { add } = require('./util');
module.exports = { add };  // 書き出し

// ES Modules("type": "module")
import express from 'express';
import { add } from './util.js';
export const add = (a, b) => a + b;
export default app; // 1つだけ`),
  TB(['', 'CommonJS', 'ES Modules'], [
    ['package.json', '`"type": "commonjs"`', '`"type": "module"`'],
    ['自作ファイル', '`./util`(省略可)', '`./util.js`(必須)'],
    ['拡張子で指定', '`.cjs`', '`.mjs`'],
    ['自分のフォルダ', '`__dirname`', '`import.meta.dirname`'],
    ['トップレベル await', '使えない', '使える'],
  ]),
  CW('1つのプロジェクトの中で混ぜない。`"type"` に合わせてどちらかに統一する。ネットの記事をコピーする前に、どちらの書き方か確認する')),

C('F', '混ぜたときのエラー',
  ER(['SyntaxError: Cannot use import statement outside a module',
      '`"type": "commonjs"` のまま `import` を書いた → `"type": "module"` にするか `require` に書き換える'],
     ['ReferenceError: require is not defined in ES module scope, you can use import instead',
      '`"type": "module"` で `require` を書いた → `import` に'],
     ['ReferenceError: __dirname is not defined in ES module scope',
      'ES Modules では `import.meta.dirname` を使う'],
     ['Did you mean to import "./util.js"?',
      'ES Modules で拡張子を省略した(`ERR_MODULE_NOT_FOUND`)']),
  CD('`"type"` を書かずに `import` を使うと、自動判定で動くが `[MODULE_TYPELESS_PACKAGE_JSON] Warning` が出る')),

C('F', 'fs と path(ファイルの読み書き)',
  CC(`
const fs = require('fs');
const path = require('path');
const file =
  path.join(__dirname, 'data.txt');
// 書く(上書き)
fs.writeFileSync(file, 'Hello\\n');
// 追記する
fs.appendFileSync(file, '追記\\n');
// 読む('utf8' で文字列になる)
const text =
  fs.readFileSync(file, 'utf8');
fs.existsSync(file) // 有無 true/false`),
  KV(['…Sync', '終わるまで待つ版。起動時の読み込み向き'],
     ['fs/promises', '`await fs.readFile(…)` の版。サーバの処理中はこちら', 'm'],
     ['__dirname', 'このファイルがあるフォルダ']),
  CW('`"data.txt"` とだけ書くと「node を実行した場所」が基準になる。`path.join(__dirname, …)` で書く')),

C('F', 'HTTP の基礎(リクエストとレスポンス)',
  KV(['http://', '**スキーム** 通信の方式'],
     ['localhost', '**ホスト** 自分の Mac(`127.0.0.1`)'],
     [':3000', '**ポート** どのサーバ宛てか'],
     ['/users/42', '**パス** → `req.params`'],
     ['?q=node&p=2', '**クエリ** → `req.query`']),
  CC(`
▶ リクエスト(ブラウザ → サーバ)
POST /login HTTP/1.1  ← メソッド パス
Host: localhost:3000  ← ヘッダ
Content-Type: application/x-www-form-urlencoded
                      ← 空行
name=Taro             ← ボディ
◀ レスポンス(サーバ → ブラウザ)
HTTP/1.1 302 Found    ← ステータス
Location: /hello?name=Taro  ← ヘッダ`, 'none'),
  CD('上は `curl -v` で実際に見られる。ブラウザでは ⌥⌘I → Network')),

C('F', 'メソッドとステータスコード',
  KV(['GET', '取得。URL を開く・リンク・フォームの既定', 'm'],
     ['POST', '送信。`method="post"` のフォーム・登録', 'm'],
     ['PUT / PATCH / DELETE', '更新 / 一部更新 / 削除', 'p']),
  TB(['コード', '意味'], [
    ['`200 OK`', '成功'],
    ['`301 Moved Permanently`', '恒久的に移動した'],
    ['`302 Found`', '一時的に移動(`res.redirect` の既定)'],
    ['`400 Bad Request`', '送られた値が不正'],
    ['`401 Unauthorized`', 'ログインが必要(未認証)'],
    ['`403 Forbidden`', 'ログイン済みだが権限が無い'],
    ['`404 Not Found`', 'そのパスが無い'],
    ['`500 Internal Server Error`', 'サーバ側の例外・バグ'],
  ]),
  CD('**2xx** 成功 ／ **3xx** 移動 ／ **4xx** 送る側の誤り ／ **5xx** サーバ側の誤り')),

C('F', 'fetch(API を呼ぶ)',
  CC(`
const url = 'http://localhost:3000' +
            '/api/items';
// GET: JSON を受け取る
const res = await fetch(url);
if (!res.ok) throw new Error('失敗');
const items = await res.json();
// POST: JSON を送る
const headers = {
  'Content-Type': 'application/json',
};
const data = { name: 'pen' };
await fetch(url, {
  method: 'POST',
  headers,
  body: JSON.stringify(data),
});`),
  CD('Node 18 以降は組み込み(インストール不要)。ブラウザでも同じ書き方'),
  CW('404 や 500 でも例外にならない。`res.ok`(200番台なら `true`)を確認する')),

/* ---- G Express ---- */
C('G', '最小の Express アプリ(起動の定型)',
  CC(`
// app.js
const express = require('express');
const app = express();
const PORT =
  process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, (err) => {
  if (err) throw err; // 失敗を表示
  console.log(
    \`http://localhost:\${PORT}\`);
});`),
  CD('`npm install express` で 5.3.0 が入る(2026年10月時点)。`node app.js` で起動。ES Modules なら1行目を `import express from \'express\';`'),
  CW('Express 5 は起動の失敗を `err` で渡す。受け取らないと、ポート使用中でも黙って終了する')),

C('G', 'ルーティング',
  CC(`
// /users/42 → id は '42'(文字列)
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id });
});
// /search?q=node → q は 'node'
app.get('/search', (req, res) => {
  res.send(\`検索語: \${req.query.q}\`);
});`),
  KV(['/users/:id', 'パスパラメータ → `req.params.id`', 'm'],
     ['?q=node', 'クエリ → `req.query.q`(無ければ `undefined`)', 'm'],
     ['/files/*path', '残り全部 → `req.params.path` は配列', 'p']),
  CD('上から順に照合し、最初に合ったものが処理する。`app.post` / `app.put` / `app.delete` も同じ形'),
  CW('Express 5 では `app.get("*", …)` はエラー(`Missing parameter name at index 1: *`)。404 は最後の `app.use` で書く')),

C('G', 'req と res',
  KV(['req.params', 'パスの `:id` などの値', 'm'],
     ['req.query', '`?` 以降の値', 'm'],
     ['req.body', 'POST の本文(フォーム・JSON)', 'm']),
  KV(['res.send("文字列")', '文字列・HTML を返す', 'm'],
     ['res.json(obj)', 'JSON を返す', 'm'],
     ['res.status(404).send(…)', 'ステータスを指定して返す', 'm'],
     ['res.redirect("/")', '別のページへ移動(302)']),
  CW('返信は1回だけ。2回送ると `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`。途中で返すときは `return res.send(…)`')),

C('G', 'ミドルウェアと実行順序',
  CC(`
// すべてのリクエストで実行される
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();  // 次へ渡す
});`),
  CC(`
リクエスト
 ↓ ① app.use     ログ → next()
 ↓ ② static      ファイルがあれば返す
 ↓ ③ urlencoded  req.body を作る
 ↓ ④ get / post  返信して終わり
 ↓ ⑤ app.use     404(どれにも不一致)
 ↓ ⑥ app.use     エラー処理(引数4つ)`, 'none'),
  CW('`next()` も返信もしないと、ブラウザは読み込み中のまま待ち続ける'),
  CW('書いた順に実行される。`public/index.html` があると `/` は ② が先に返し、`app.get("/")` は呼ばれない')),

C('G', 'フォルダ構成と静的ファイル',
  CC(`
myapp/
├─ app.js
├─ package.json
├─ public/      ← express.static
│  ├─ index.html  → /
│  └─ style.css   → /style.css
└─ views/       ← テンプレート(EJS)
   └─ hello.ejs`, 'none'),
  CC(`
const path = require('path');
app.use(express.static(
  path.join(__dirname, 'public')));`),
  CW('URL に `public` は含めない(`/style.css`)。HTML からも `<link href="/style.css">` と書く')),

C('G', 'フォームを受け取る',
  CC(`
<!-- public/index.html -->
<form action="/login" method="post">
  <input name="name">
  <button>送信</button>
</form>`, 'none'),
  CC(`
// フォーム → req.body
app.use(express.urlencoded(
  { extended: false }));
// JSON → req.body
app.use(express.json());

app.post('/login', (req, res) => {
  // input の name 属性がキーになる
  const { name } = req.body;
  if (!name) return res.status(400)
    .send('名前が空です');
  res.redirect('/hello?name=' +
    encodeURIComponent(name));
});`),
  CD('どちらも Express に組み込み(`body-parser` は不要)'),
  CW("書き忘れると `req.body` が `undefined` になり `TypeError: Cannot read properties of undefined (reading 'name')`")),

C('G', 'テンプレート(EJS)',
  CC(`
app.set('view engine', 'ejs');
app.get('/hello', (req, res) => {
  res.render('hello', { // hello.ejs
    name: req.query.name,
    items: ['A', 'B'],
  });
});`),
  CC(`
<!-- views/hello.ejs -->
<h1>こんにちは <%= name %> さん</h1>
<ul>
<% for (const it of items) { %>
  <li><%= it %></li>
<% } %>
</ul>`, 'none'),
  KV(['<%= x %>', '値を表示(`<` などはエスケープされる)', 'm'],
     ['<% … %>', 'JS を実行するだけ(表示しない)'],
     ['<%- include("header") %>', '`views/header.ejs` を差し込む']),
  CD('`npm install ejs` で 7.0.2 が入る'),
  CW('`<%- %>` に利用者の入力を入れない(XSS の原因)')),

C('G', '404 とエラー処理',
  CC(`
// すべてのルートの後に書く
app.use((req, res) => {
  res.status(404).send('ありません');
});
// 引数が4つ = エラー処理用
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('サーバエラー');
});`),
  CD('Express 5 は `async` 内の throw も自動でここへ回す。404 を書かなければ既定の `Cannot GET /パス`'),
  CW('Express 4 では `async` 内で throw するとサーバごと落ちる。`try/catch` して `next(err)` を呼ぶ必要があった')),

C('G', '.env と環境変数',
  CC(`
# .env(Git に入れない)
PORT=3000
DB_PASSWORD=secret`, 'sh'),
  CC(`
# .env を読み込んで起動
node --env-file=.env app.js
# その場で1回だけ指定して起動
PORT=4000 node app.js`, 'sh'),
  KV(['process.env.PORT', '`"3000"`(必ず文字列)', 'm'],
     ['dotenv', '古い記事のパッケージ。今の Node では不要', 'p']),
  CW('パスワードやキーは `.env` に書き、`.gitignore` に入れる。コードに直接書かない')),

C('G', 'nodemon(保存したら自動で再起動)',
  CC(`
npm install -D nodemon
# package.json の "scripts" に追加
#   "dev": "nodemon app.js"
npm run dev        # 保存のたびに再起動`, 'sh'),
  KV(['rs + Enter', '手動で再起動'],
     ['npx nodemon app.js', '`scripts` を書かずに直接'],
     ['node --watch app.js', 'Node 組み込みの同じ機能', 'p']),
  CD('`.env` を使うときは `nodemon --env-file=.env app.js`'),
  CW('`nodemon` とだけ打つと `zsh: command not found: nodemon`。`npm run dev` か `npx nodemon` で')),

/* ---- H トラブル対処 ---- */
C('H', '起動時のエラー',
  ER(['Error: listen EADDRINUSE: address already in use :::3000',
      'そのポートは使用中。前に起動したサーバが残っている → B の `lsof` で探して止める'],
     ["Error: Cannot find module 'expres'\n  code: 'MODULE_NOT_FOUND'",
      '名前の誤り、`npm install` していない、別のフォルダで実行している'],
     ["Error: Cannot find module '/Users/…/apps.js'",
      '実行するファイル名・場所の誤り(`ls` と `pwd` で確認)'],
     ['SyntaxError: Unexpected end of input',
      '`}` や `)` の閉じ忘れ'],
     ['SyntaxError: Invalid or unexpected token',
      'クォートの閉じ忘れ、全角の記号・空白']),
  CD('import と require の取り違えは F の「混ぜたときのエラー」')),

C('H', '動かしている最中のエラー',
  ER(["TypeError: Cannot read properties of undefined (reading 'name')",
      '`undefined` の `.name` を読んだ。`express.urlencoded` の書き忘れ、無いキー、`await` の付け忘れ'],
     ['TypeError: add is not a function',
      '名前の誤り、`require` で受け取るものの取り違え'],
     ['ReferenceError: x is not defined',
      '宣言していない・綴りの誤り・`{ }` の外から使った'],
     ['Cannot GET /xxx(ブラウザの表示)',
      'ルートが無い。パスの綴り、GET と POST の違いを確認'])),

C('H', 'npm のエラー',
  CD('今の npm(v11)は行頭が `npm error`(古い記事では `npm ERR!`)'),
  ER(['npm error code ENOENT\nnpm error enoent Could not read package.json',
      '`package.json` が無い場所で実行した → `cd` で移動、または `npm init -y`'],
     ['npm error Missing script: "dev"',
      '`package.json` の `scripts` に `dev` が無い'],
     ['npm error code E404\nnpm error 404 Not Found - GET https://registry.npmjs.org/…',
      'パッケージ名の誤り'])),

];

/* ================= カードの見出しアイコン ================= */
const ICON = {
  '道具の関係(何が何を入れるか)': '🧭', 'Homebrew の基本': '🍺', 'Homebrew の更新': '🔄',
  'nodebrew の導入': '🟢', 'Node.js のアップデート': '⬆️', 'npm の基本': '📦',
  'package.json': '📄', 'package-lock.json と node_modules': '🔒',
  '場所の確認と移動': '📂', '作る・コピー・移動・消す': '🗂️', 'パスと記号': '🔣',
  'PATH と環境の確認': '🛤️', 'プロセスを調べる・止める': '⚙️', 'lsof でポートを調べる': '🔌',
  'JavaScript を動かす': '▶️', '変数と型': '🏷️', '数値と演算': '🔢', '文字列': '🔤',
  '比較と真偽値': '⚖️', '条件分岐とループ': '🔁', 'C言語との違い': '🆚',
  '関数とアロー関数': '🧩', '配列の基本': '📚', '配列メソッド(ループの代わり)': '🧮',
  'オブジェクト': '🗃️', '分割代入とスプレッド構文': '✂️', '例外処理(try / catch)': '🛡️',
  '同期と非同期(待たずに次へ進む)': '⏳', 'コールバック': '📞', 'Promise': '🤝',
  'async / await': '✨', '3つの書き方の対応': '🔀',
  'CommonJS と ES Modules': '📦', '混ぜたときのエラー': '💥',
  'fs と path(ファイルの読み書き)': '📁', 'process(実行環境の情報)': '🖥️',
  'HTTP の基礎(リクエストとレスポンス)': '🌐', 'メソッドとステータスコード': '🚦',
  'JSON': '🧾', 'fetch(API を呼ぶ)': '🛰️',
  '最小の Express アプリ(起動の定型)': '🚀', 'ルーティング': '🧭', 'req と res': '📨',
  'ミドルウェアと実行順序': '🔗', 'フォルダ構成と静的ファイル': '🗂️', 'フォームを受け取る': '📝',
  'テンプレート(EJS)': '🎨', '404 とエラー処理': '🛑', '.env と環境変数': '🔐',
  'nodemon(保存したら自動で再起動)': '♻️',
  '起動時のエラー': '🚨', '動かしている最中のエラー': '🐛', 'npm のエラー': '📦',
  'デバッグのコツ': '🔎',
};

const cardHtml = c => {
  const ic = ICON[c.title] ? `<i class="ic">${ICON[c.title]}</i>` : '';
  return `<div class="card c${c.cat}"><div class="ct">${ic}${inl(c.title)}</div>${c.body.join('')}</div>`;
};

/* ================= ページ分割 ================= */
// 各ページに載せるカード枚数。合計が CARDS.length と一致していること
const SPLIT = [14, 14, 12, 13];

const TITLE = 'Node.js Webアプリ開発チートシート';
const SUB = 'macOS / Node.js v26 / npm 11 / Express 5.3 — 環境構築・UNIX・JavaScript・非同期・Express';
const SUB_SLIM = 'macOS / Node.js v26 / Express 5.3';
const LEGEND = CATS.map(([k, , s]) => `<span class="lg lg${k}"><i></i>${k} ${esc(s)}</span>`).join('') +
  '<span class="lg mk"><b>★</b>まず覚える定番</span>' +
  '<span class="lg ad"><b>Aa</b>グレー文字=上級者向け</span>' +
  '<span class="lg wn"><b>⚠</b>間違えやすい点</span>';

// 各ページの役割
const ROLE = [
  'このページ＝最初に環境を整えるとき。Homebrew・nodebrew・npm と UNIX コマンド',
  'このページ＝JavaScript を書くとき。C言語との違いに注意',
  'このページ＝非同期処理と Node.js の作法。import / require で詰まったら',
  'このページ＝Express で作るとき・エラーが出たとき',
];

const total = SPLIT.reduce((a, b) => a + b, 0);
if (total !== CARDS.length) throw new Error(`SPLIT の合計 ${total} がカード数 ${CARDS.length} と合わない`);
const noIcon = CARDS.filter(c => !ICON[c.title]).map(c => c.title);
if (noIcon.length) throw new Error(`ICON が無いカード: ${noIcon.join(' / ')}`);

let idx = 0, prevCat = null;
const pages = SPLIT.map((n, pi) => {
  const body = [];
  for (let i = 0; i < n; i++, idx++) {
    const card = CARDS[idx];
    if (card.cat !== prevCat) {
      body.push(`<div class="sec s${card.cat}"><b>${card.cat}</b>${esc(CATNAME[card.cat])}</div>`);
      prevCat = card.cat;
    } else if (i === 0) {
      // ページ頭でカテゴリが続いている場合は「(続き)」の帯を出す
      body.push(`<div class="sec s${card.cat}"><b>${card.cat}</b>${esc(CATNAME[card.cat])}(続き)</div>`);
    }
    body.push(cardHtml(card));
  }
  return `<div class="page">
<div class="head${pi > 0 ? ' slim' : ''}"><div class="ttl"><b>${esc(TITLE)}</b><span>${esc(pi > 0 ? SUB_SLIM : SUB)}</span></div><div class="legend">${LEGEND}</div></div>
<div class="grid">
${body.join('\n')}
</div>
<div class="foot"><span>${esc(ROLE[pi])}</span><span>起動: node app.js ／ 停止: Ctrl+C ／ 確認: http://localhost:3000</span><span>${pi + 1} / ${SPLIT.length}</span></div>
</div>`;
});

/* ================= CSS ================= */
// pt 値は C言語版と同じ基準値のまま残し、SCALE で一括調整する
const SCALE = Number(process.env.SCALE || 1.0);
const refCss = `
:root{
  --cA: #1a4fa0;
  --cB: #6b3fa0;
  --cC: #1f7a3f;
  --cD: #b07500;
  --cE: #6d8c1f;
  --cF: #c0272d;
  --cG: #d2691e;
  --cH: #0f7b7b;
  --ink:#1a1a1a; --sub:#3f3f3f; --dim:#8a8a8a; --line:#d5d5d5; --codebg:#f4f4f4;
  --star:#b8860b; --warn:#8a4b08; --cmt:#2e7d4f;
  --mono:"SFMono-Regular","SF Mono",Menlo,Consolas,"DejaVu Sans Mono",monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{background:#8f8f8f;
  font-family:"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;
  color:var(--ink);}
@page{size:A4 landscape;margin:7mm}

.page{
  width:283mm;height:196mm;background:#fff;
  margin:6mm auto;display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 2px 10px rgba(0,0,0,.45);
}
.grid{
  flex:1 1 auto;min-height:0;overflow:hidden;
  column-count:5;column-gap:2.0mm;column-fill:balance;
}

/* ヘッダ帯と凡例 */
.head{display:flex;align-items:flex-end;gap:3mm;border-bottom:1.2pt solid #333;
  padding:0 0 1.0mm;margin-bottom:1.3mm;flex:0 0 auto}
.ttl{white-space:nowrap}
.ttl b{font-size:13.20pt;letter-spacing:.02em}
.ttl span{font-size:6.72pt;color:var(--sub);margin-left:2mm}
.head.slim .ttl b{font-size:10.20pt}
.legend{display:flex;flex-wrap:wrap;gap:0 2.2mm;flex:1 1 auto;justify-content:flex-end}
.lg{font-size:6.60pt;color:#222;white-space:nowrap;display:inline-flex;align-items:center}
.lg i{display:inline-block;width:5.4pt;height:5.4pt;border-radius:1pt;margin-right:.7mm}
.lg b{margin-right:.6mm}
.lg.mk b{color:var(--star)} .lg.wn b{color:var(--warn)}

/* カテゴリ帯 */
.sec{break-inside:avoid;-webkit-column-break-inside:avoid;
  break-after:avoid;-webkit-column-break-after:avoid;
  color:#fff;font-size:7.44pt;font-weight:700;line-height:1.25;
  padding:.55mm 1.1mm;border-radius:.6mm;margin:0 0 .8mm;}
.sec b{display:inline-block;background:rgba(255,255,255,.3);border-radius:.5mm;
  padding:0 .8mm;margin-right:1mm}

/* カード */
.card{break-inside:avoid;-webkit-column-break-inside:avoid;
  border:.4pt solid var(--line);border-top:1.7pt solid #999;border-radius:.6mm;
  padding:.5mm .9mm .8mm;margin:0 0 .95mm;background:#fff;}
.ct{font-size:7.08pt;font-weight:700;line-height:1.2;
  margin:-.5mm -.9mm .6mm;padding:.5mm .9mm .45mm}
.ct .ic{font-style:normal;margin-right:.7mm}
.cc{font-family:var(--mono);font-size:6.36pt;line-height:1.32;
  white-space:pre-wrap;overflow-wrap:anywhere;
  background:var(--codebg);border-left:.9pt solid #c6c6c6;
  padding:.45mm .8mm;border-radius:.4mm;margin-bottom:.55mm;}
.cc .cm{color:var(--cmt)}
.cd{font-size:6.24pt;line-height:1.35;color:var(--sub)}
.cd+.cd{margin-top:.35mm}
.cd strong,.kv strong{color:var(--ink)}

/* キー+説明の行 */
.kv{margin-bottom:.55mm}
.kv>div{display:flex;align-items:baseline;gap:1.0mm;padding:.15mm 0;
  font-size:6.24pt;line-height:1.35;color:var(--sub)}
.kv>div+div{border-top:.3pt solid #ededed}
.kv>div>span{min-width:0;overflow-wrap:anywhere}
.kv b{font-family:var(--mono);font-size:6.12pt;
  background:var(--codebg);border:.3pt solid #dedede;border-radius:.4mm;
  padding:0 .55mm;color:var(--ink);font-weight:400}
.kv b{flex:0 0 auto;max-width:56%;overflow-wrap:anywhere}
.kv>div.m b::before{content:"★";color:var(--star);margin-right:.5mm}
.kv>div.p>span{color:var(--dim)}
.lg.ad b{color:var(--dim)}

/* ⚠ 間違えやすい点 */
.cw{font-size:6.24pt;line-height:1.35;color:var(--warn);
  background:#fdf5e8;border-left:.9pt solid #e0b263;
  padding:.4mm .8mm;border-radius:.4mm;margin-bottom:.55mm}
.cw::before{content:"⚠ "}

/* 一覧表 */
.tb{width:100%;border-collapse:collapse;font-size:6.12pt;line-height:1.3;margin-bottom:.55mm}
.tb th{text-align:left;font-weight:700;color:var(--ink);background:var(--codebg);
  padding:.25mm .6mm;border-bottom:.4pt solid #c6c6c6;white-space:nowrap}
.tb td{padding:.2mm .6mm;border-top:.3pt solid #ededed;color:var(--sub);vertical-align:top}
.tb td.f{white-space:nowrap}

/* エラー文面 → 対処(Node.js 版で追加) */
.er{margin-bottom:.55mm}
.er>div{padding:.3mm 0;font-size:6.24pt;line-height:1.35;color:var(--sub)}
.er>div+div{border-top:.3pt solid #ededed}
.er code{font-family:var(--mono);font-size:5.88pt;line-height:1.3;
  white-space:pre-wrap;overflow-wrap:anywhere;color:var(--ink);
  background:var(--codebg);border-radius:.3mm;padding:0 .4mm;
  -webkit-box-decoration-break:clone;box-decoration-break:clone}
.er span::before{content:" → "}

/* 説明文の中の等幅 */
.cd code,.kv code,.tb code,.cw code,.er span code{font-family:var(--mono);font-size:.95em;
  background:var(--codebg);border-radius:.3mm;padding:0 .3mm;overflow-wrap:anywhere}
.cw code{background:#f6e7cf}

/* 柱 */
.foot{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;gap:3mm;
  border-top:.5pt solid #bbb;margin-top:1.1mm;padding-top:.7mm;
  font-size:6.24pt;color:#666}

.cA{border-top-color:var(--cA)} .cA>.ct{color:var(--cA);background:color-mix(in srgb,var(--cA) 9%,#fff)} .sA{background:var(--cA)} .lgA i{background:var(--cA)}
.cB{border-top-color:var(--cB)} .cB>.ct{color:var(--cB);background:color-mix(in srgb,var(--cB) 9%,#fff)} .sB{background:var(--cB)} .lgB i{background:var(--cB)}
.cC{border-top-color:var(--cC)} .cC>.ct{color:var(--cC);background:color-mix(in srgb,var(--cC) 9%,#fff)} .sC{background:var(--cC)} .lgC i{background:var(--cC)}
.cD{border-top-color:var(--cD)} .cD>.ct{color:var(--cD);background:color-mix(in srgb,var(--cD) 9%,#fff)} .sD{background:var(--cD)} .lgD i{background:var(--cD)}
.cE{border-top-color:var(--cE)} .cE>.ct{color:var(--cE);background:color-mix(in srgb,var(--cE) 9%,#fff)} .sE{background:var(--cE)} .lgE i{background:var(--cE)}
.cF{border-top-color:var(--cF)} .cF>.ct{color:var(--cF);background:color-mix(in srgb,var(--cF) 9%,#fff)} .sF{background:var(--cF)} .lgF i{background:var(--cF)}
.cG{border-top-color:var(--cG)} .cG>.ct{color:var(--cG);background:color-mix(in srgb,var(--cG) 9%,#fff)} .sG{background:var(--cG)} .lgG i{background:var(--cG)}
.cH{border-top-color:var(--cH)} .cH>.ct{color:var(--cH);background:color-mix(in srgb,var(--cH) 9%,#fff)} .sH{background:var(--cH)} .lgH i{background:var(--cH)}

@media print{
  html,body{background:#fff}
  .page{margin:0;box-shadow:none;width:auto;height:196mm;
    break-after:page;page-break-after:always}
  .page:last-child{break-after:auto;page-break-after:auto}
}
`;

const css = refCss.replace(/(\d*\.?\d+)pt/g, (_, n) => (n * SCALE).toFixed(2) + 'pt');

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>[ライト] Node.js Webアプリ開発チートシート(macOS / Express 5)</title>
<meta name="description" content="Homebrew・nodebrew・npm による環境構築、UNIX コマンド、JavaScript の基本文法、非同期処理、Node.js の作法、Express の基本とトラブル対処をまとめたA4横${SPLIT.length}ページのチートシート(ライトモード)。">
<style>${css}</style>
</head>
<body>
${pages.join('\n')}
</body>
</html>
`;
fs.writeFileSync(OUT, html);
console.log('ok', CARDS.length, 'cards /', SPLIT.length, 'pages /', html.length, 'chars');
