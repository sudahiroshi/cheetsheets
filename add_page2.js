// index.html に新しい2ページ目(ジェスチャ/CLIインストール/ターミナル/記号)を挿入し、旧2ページ目を3ページ目にする
const fs = require('fs');
const dir = '/Volumes/Ramdisk/cheetsheets/';
let s = fs.readFileSync(dir + 'index.html', 'utf8');
if (s.includes('id="page-terminal"')) throw new Error('already inserted');

const css = `
  /* ---- Page 2 (new) ---- */
  .p2{display:grid;grid-template-columns:1fr 1fr 1.25fr;grid-template-rows:auto 1fr;gap:2.6mm;height:176mm}
  .p2 .card{margin-bottom:0}
  .p2 .a-gest{grid-column:1;grid-row:1}
  .p2 .a-term{grid-column:2;grid-row:1}
  .p2 .a-sym{grid-column:3;grid-row:1 / span 2}
  .p2 .a-cli{grid-column:1 / span 2;grid-row:2}
  .p2 .row .k{min-width:0;font-size:7pt;color:#ffe29a;font-weight:600}
  .p2 .row{align-items:flex-start}
  .p2 .row .k{max-width:46%;white-space:normal}
  .p2 .cli{padding:1.8mm 2.4mm;display:grid;grid-template-columns:1fr 1fr;gap:1.6mm 3mm}
  .p2 .cli h3{font-size:7.8pt;margin-bottom:.6mm;color:var(--c5)}
  .p2 .cli p{font-size:7pt;color:var(--muted);margin-top:.6mm}
  .p2 .cli pre{margin-top:.4mm}
  .sym{width:100%;border-collapse:collapse;font-size:7pt}
  .sym th{text-align:left;padding:.7mm 1.6mm;font-size:6.8pt;background:rgba(255,255,255,.08)}
  .sym td{padding:.55mm 1.6mm;border-top:.2mm solid rgba(255,255,255,.07);vertical-align:top}
  .sym td:first-child{font:700 8.4pt/1.2 "SF Mono",ui-monospace,Menlo,monospace;color:#ffe29a;white-space:nowrap}
  .sym tr:nth-child(even) td{background:rgba(255,255,255,.03)}
  .sym .in{white-space:nowrap}
`;
s = s.replace('</style>', css + '</style>');

const g = (a, b, cls = '') => `      <div class="row ${cls}"><span class="t">${b}</span><span class="k">${a}</span></div>`;
const k = (...x) => x.map(v => `<kbd>${v}</kbd>`).join('');
const sym = (c, name, use, input) => `        <tr><td>${c}</td><td>${name}</td><td>${use}</td><td class="in">${input}</td></tr>`;

const page = `<!-- ============ PAGE 2 : TRACKPAD / TERMINAL / SYMBOLS ============ -->
<main class="page" id="page-terminal">
  <header>
    <div class="logo">🖱️</div>
    <div>
      <h1>トラックパッド・ターミナル・記号</h1>
      <div class="sub">ジェスチャ / コマンドラインツールの導入 / ターミナルのショートカット / よく使う記号</div>
    </div>
  </header>

  <div class="p2">
    <!-- トラックパッド -->
    <section class="card a-gest" style="--c:var(--c3)">
      <h2><i>👆</i>トラックパッドジェスチャ</h2>
${g('1本指タップ', 'クリック', 'must')}
${g('2本指タップ / ⌃+クリック', '副ボタン(右クリック)', 'must')}
${g('2本指スクロール', 'スクロール', 'must')}
${g('2本指ピンチ', '拡大・縮小')}
${g('2本指ダブルタップ', 'スマートズーム')}
${g('2本指で回転', '画像などの回転')}
${g('2本指で左右スワイプ', 'ページ戻る・進む(ブラウザ)')}
${g('右端から2本指スワイプ', '通知センター')}
${g('3本指タップ', '調べる(辞書・プレビュー)')}
${g('3/4本指で上スワイプ', 'Mission Control')}
${g('3/4本指で下スワイプ', 'App Exposé')}
${g('3/4本指で左右スワイプ', 'フルスクリーンアプリ切替')}
${g('親指+3本指でピンチイン', 'Launchpad')}
${g('親指+3本指でピンチアウト', 'デスクトップを表示')}
${g('強めに押し込む', 'クイックルック・調べる', 'pro')}
${g('3本指ドラッグ(要設定)', 'ウインドウ移動', 'pro')}
      <div class="note">設定: システム設定 → トラックパッド</div>
    </section>

    <!-- ターミナルのショートカット -->
    <section class="card a-term" style="--c:var(--c2)">
      <h2><i>⌨️</i>ターミナルでのショートカット</h2>
${g(k('⌃', 'C'), '実行中のコマンドを中断', 'must')}
${g(k('Tab'), '補完(ファイル名・コマンド名)', 'must')}
${g(k('↑') + ' ' + k('↓'), 'コマンド履歴をたどる', 'must')}
${g(k('⌃', 'D'), '入力終了(EOF)/ログアウト')}
${g(k('⌃', 'L'), '画面クリア(clear)')}
${g(k('⌃', 'A') + ' / ' + k('E'), '行頭 / 行末へ移動')}
${g(k('⌃', 'U'), 'カーソルから行頭まで削除')}
${g(k('⌃', 'K'), 'カーソルから行末まで削除')}
${g(k('⌃', 'W'), '直前の1単語を削除')}
${g(k('⌃', 'R'), '履歴をさかのぼって検索')}
${g(k('⌥', '←') + k('→'), '単語単位で移動')}
${g(k('⌃', 'Z'), '一時停止(fg で再開)', 'pro')}
${g(k('⌘', 'T') + ' / ' + k('N'), '新規タブ / ウインドウ')}
${g(k('⌘', 'K'), '画面と履歴を消去')}
${g(k('⌘', '+') + ' / ' + k('-'), '文字サイズ変更')}
${g('<code>!!</code>', '直前のコマンドを再実行', 'pro')}
${g('<code>cd -</code>', '直前のディレクトリへ戻る', 'pro')}
    </section>

    <!-- 記号 -->
    <section class="card a-sym" style="--c:var(--c10)">
      <h2><i>＃</i>コンピュータで使用する主な記号</h2>
      <table class="sym">
        <thead><tr><th>記号</th><th>読み方</th><th>主な用途</th><th>入力(JISキー)</th></tr></thead>
        <tbody>
${sym('~', 'チルダ', 'ホームディレクトリ', k('⇧', '^'))}
${sym('/', 'スラッシュ', 'パス区切り・除算・コメント <code>//</code>', k('/'))}
${sym('\\', 'バックスラッシュ', 'エスケープ <code>\\n</code>', k('⌥', '¥'))}
${sym('|', 'パイプ', 'コマンド連結・論理和 <code>||</code>', k('⇧', '¥'))}
${sym('&gt; &lt;', '大なり・小なり', 'リダイレクト・比較', k('⇧', '.') + k('⇧', ','))}
${sym('&amp;', 'アンパサンド', 'アドレス取得・論理積 <code>&amp;&amp;</code>', k('⇧', '6'))}
${sym('*', 'アスタリスク', 'ポインタ・乗算・ワイルドカード', k('⇧', ':'))}
${sym('#', 'シャープ', '<code>#include</code>・コメント(シェル)', k('⇧', '3'))}
${sym('$', 'ドル', '変数展開・プロンプト', k('⇧', '4'))}
${sym('%', 'パーセント', '剰余・<code>printf</code> 書式', k('⇧', '5'))}
${sym('!', 'エクスクラメーション', '否定・履歴展開', k('⇧', '1'))}
${sym('=', 'イコール', '代入(<code>==</code> は比較)', k('⇧', '-'))}
${sym('+', 'プラス', '加算・インクリメント <code>++</code>', k('⇧', ';'))}
${sym('-', 'ハイフン', '減算・オプション指定', k('-'))}
${sym('_', 'アンダースコア', '変数名・関数名', k('⇧', 'ろ'))}
${sym('^', 'キャレット', 'ビット排他的論理和', k('^'))}
${sym('@', 'アット', 'メール・ユーザ名', k('@'))}
${sym('&quot;', 'ダブルクォート', '文字列', k('⇧', '2'))}
${sym("'", 'シングルクォート', "文字 <code>'a'</code>", k('⇧', '7'))}
${sym('\`', 'バッククォート', 'コマンド置換', k('⇧', '@'))}
${sym('( )', '丸括弧', '関数呼び出し・優先順位', k('⇧', '8') + k('⇧', '9'))}
${sym('{ }', '波括弧', 'ブロック・配列初期化', k('⇧', '[') + k('⇧', ']'))}
${sym('[ ]', '角括弧', '配列の添字', k('[') + k(']'))}
${sym(';', 'セミコロン', 'C言語の文末', k(';'))}
${sym(':', 'コロン', '三項演算子・ラベル', k(':'))}
${sym('?', 'クエスチョン', '三項演算子・1文字ワイルドカード', k('⇧', '/'))}
${sym('.', 'ドット', '現在のディレクトリ・メンバ参照', k('.'))}
${sym('..', 'ドット2つ', '親ディレクトリ', k('.') + k('.'))}
        </tbody>
      </table>
      <div class="note">英数(半角)モードで入力。全角になる場合は <kbd>英数</kbd> で切替。</div>
    </section>

    <!-- CLI インストール -->
    <section class="card a-cli" style="--c:var(--c5)">
      <h2><i>🛠️</i>コマンドラインツールのインストール方法</h2>
      <div class="cli">
        <div>
          <h3>① Xcode Command Line Tools(C言語の最初の一歩)</h3>
          <pre><span class="c"># clang / git / make などが入る</span>
xcode-select --install
<span class="c"># 確認</span>
xcode-select -p
clang --version</pre>
          <p>ダイアログで「インストール」→ 完了まで数分〜。Xcode 本体は不要。</p>
        </div>
        <div>
          <h3>② Homebrew(追加ツールの導入)</h3>
          <pre><span class="c"># 公式 brew.sh のコマンドを実行後、PATH を設定(Apple Silicon)</span>
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' &gt;&gt; ~/.zprofile
brew install gcc make cmake tree wget</pre>
          <p>Intel Mac は <code>/usr/local/bin/brew</code>。再起動後 <code>brew --version</code> で確認。</p>
        </div>
        <div>
          <h3>③ 動作確認(C言語のコンパイル)</h3>
          <pre>clang hello.c -o hello   <span class="c"># コンパイル</span>
./hello                  <span class="c"># 実行</span>
which clang              <span class="c"># 場所を確認</span></pre>
          <p><code>gcc</code> と打つと Apple の clang が呼ばれる(正常)。</p>
        </div>
        <div>
          <h3>④ うまくいかないとき</h3>
          <pre>command not found  → ターミナルを開き直す
echo $PATH         <span class="c"># PATH を確認</span>
sudo xcode-select --reset</pre>
          <p>アップデート後に動かなくなったら ① を再実行。</p>
        </div>
      </div>
    </section>
  </div>

  <footer class="foot"><span>Terminal: アプリケーション → ユーティリティ → ターミナル / <kbd>⌘</kbd><kbd>Space</kbd> で「ターミナル」</span><span>2 / 3</span></footer>
</main>

`;

const marker = '<!-- ============ PAGE 2 : INSTALL ============ -->';
if (!s.includes(marker)) throw new Error('marker not found');
s = s.replace(marker, page + '<!-- ============ PAGE 3 : INSTALL ============ -->');
s = s.replace('<span>1 / 2</span>', '<span>1 / 3</span>');
s = s.replace('<span>2 / 2</span>', '<span>3 / 3</span>');
s = s.replace('<title>macOS ショートカット &amp; アプリインストール チートシート</title>', '<title>macOS ショートカット・ターミナル・アプリインストール チートシート</title>');
fs.writeFileSync(dir + 'index.html', s);
console.log('ok');
