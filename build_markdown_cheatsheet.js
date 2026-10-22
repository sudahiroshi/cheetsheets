// Markdown チートシート(A4横・5段組・2ページ)を生成する
// 生成方式と CSS は build_node_cheatsheet.js(ライト1枚出力・絵文字あり)に揃えている
//   .page / .head / .legend / .grid / .sec / .card / .ct / .cc / .kv / .tb / .cw / .cd / .er / .foot
// Markdown 版では「書き方 → GitHub での表示」を並べる .ex と、表示例の枠 .ov を追加している
// 掲載内容は GitHub の Markdown API(gh api /markdown の gfm / markdown 両モード)と
// 実リポジトリの .md ファイルの描画結果で確認済み(2026年10月)。数式と Mermaid は公式ドキュメントで確認
// tako:run node build_markdown_cheatsheet.js
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'markdown_cheatsheet_light.html');

/* ================= カテゴリ ================= */
// [記号, 帯の名前, 凡例の短い名前]
const CATS = [
  ['A', '基本の書式(見出し・文字・改行)', '基本の書式'],
  ['B', 'リスト・引用・コード', 'リスト・コード'],
  ['C', 'リンク・画像・表', 'リンク・表'],
  ['D', 'GitHub の便利な記法', 'GitHub の記法'],
  ['E', '数式と図(Mermaid)', '数式と図'],
  ['F', '文書を整える(脚注・目次・HTML)', '文書を整える'],
  ['G', 'よくある失敗', 'よくある失敗'],
];
const CATNAME = Object.fromEntries(CATS.map(([k, n]) => [k, n]));

/* ================= 部品 ================= */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// 説明文の独自記法は ⟦x⟧(等幅)と ⟪x⟫(強調)の2つだけ。
// Markdown の記号(** ` # | < > [ ] $ など)は本文にそのまま載せるので、ほかは一切解釈せず文字として出す
const inl = s => String(s).split(/(⟦[^⟧]*⟧|⟪[^⟫]*⟫)/).map(t =>
  /^⟦[^⟧]*⟧$/.test(t) ? `<code>${esc(t.slice(1, -1))}</code>` :
  /^⟪[^⟫]*⟫$/.test(t) ? `<strong>${esc(t.slice(1, -1))}</strong>` : esc(t)).join('');
// 複数行の書き方・表示例を書くためのタグ。\ はそのまま残し(LaTeX 用)、\` だけを ` に戻す
const M = (s, ...v) => String.raw(s, ...v).replace(/\\`/g, '`');
const trimNl = t => t.replace(/^\n/, '').replace(/\n$/, '');

// コード塊(書いたとおりに表示)。行中の「 ← 」以降は注釈としてコメント色にする
const CC = text => `<div class="cc">${trimNl(text).split('\n').map(l => {
  const i = l.indexOf(' ← ');
  return i < 0 ? esc(l) : esc(l.slice(0, i + 1)) + '<span class="cm">' + esc(l.slice(i + 1)) + '</span>';
}).join('\n')}</div>`;

// 表示例の枠。html は GitHub での見た目を再現した HTML(信頼できる固定文字列)
const OV = (html, label = 'GitHub での表示') => `<div class="ov"><span class="ovl">${esc(label)}</span><div class="md">${trimNl(html)}</div></div>`;

// 書き方 → 表示 の対比。flag 'm' で ★(定番)、'p' でグレー(上級者向け)
const EX = (...rows) => '<div class="ex"><div class="exh"><span>書き方</span><span>GitHub での表示</span></div>' +
  rows.map(([src, out, flag = '']) =>
    `<div class="exr${flag ? ' ' + flag : ''}"><div class="exs">${esc(trimNl(src))}</div><div class="exo md">${trimNl(out)}</div></div>`).join('') +
  '</div>';

// キー+説明の行。キーは書いたとおりに表示する
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
// 失敗した書き方(そのまま) → 原因と直し方
const ER = (...rows) => '<div class="er">' + rows.map(([src, fix]) =>
  `<div><code>${esc(src)}</code><span>${inl(fix)}</span></div>`).join('') + '</div>';

// 表示例で使う小物
const A = t => `<a>${t}</a>`;                       // リンク(GitHub の青)
const CB = on => `<span class="cbx${on ? ' on' : ''}"></span>`; // チェックボックス
const AL = (k, title, desc) => `<span class="alt a-${k}">${title}</span> <span class="dim">${desc}</span>`;

// カード1枚。見出しの絵文字は ICON から引く
const C = (cat, title, ...body) => ({ cat, title, body });

/* ================= 図の表示例(Mermaid が描く図をインライン SVG で再現) ================= */
const SVG_FLOW = `<svg class="mm" viewBox="0 0 200 108" role="img" aria-label="フローチャートの表示例">
<defs><marker id="mkf" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8z" fill="#333"/></marker></defs>
<g fill="#ececff" stroke="#9370db" stroke-width="1">
<rect x="76" y="2" width="48" height="16" rx="1.5"/>
<path d="M100 27L142 43L100 59L58 43Z"/>
<rect x="26" y="88" width="48" height="16" rx="1.5"/>
<rect x="126" y="88" width="48" height="16" rx="1.5"/>
</g>
<g fill="none" stroke="#333" stroke-width="1" marker-end="url(#mkf)">
<path d="M100 18V26"/><path d="M86 54L52 87"/><path d="M114 54L148 87"/>
<path d="M174 96C196 96 196 43 143 43"/>
</g>
<g font-size="9" text-anchor="middle" fill="#333">
<text x="100" y="13">開始</text><text x="100" y="46">60点以上?</text>
<text x="50" y="99">合格</text><text x="150" y="99">再試験</text>
</g>
<g font-size="8" text-anchor="middle" fill="#333">
<rect x="56" y="64" width="18" height="10" fill="#e8e8e8"/><text x="65" y="72">Yes</text>
<rect x="126" y="64" width="16" height="10" fill="#e8e8e8"/><text x="134" y="72">No</text>
</g>
</svg>`;

const SVG_SEQ = `<svg class="mm sm" viewBox="0 0 200 76" role="img" aria-label="シーケンス図の表示例">
<defs><marker id="mks" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8z" fill="#333"/></marker></defs>
<g stroke="#999" stroke-width=".8" stroke-dasharray="3 2"><path d="M40 16V60"/><path d="M160 16V60"/></g>
<g fill="#ececff" stroke="#9370db" stroke-width="1">
<rect x="10" y="2" width="60" height="14" rx="1.5"/><rect x="130" y="2" width="60" height="14" rx="1.5"/>
<rect x="10" y="60" width="60" height="14" rx="1.5"/><rect x="130" y="60" width="60" height="14" rx="1.5"/>
</g>
<g fill="none" stroke="#333" stroke-width="1" marker-end="url(#mks)">
<path d="M40 32H159"/><path d="M160 50H41" stroke-dasharray="3 2"/>
</g>
<g font-size="9" text-anchor="middle" fill="#333">
<text x="40" y="12">ブラウザ</text><text x="160" y="12">サーバ</text>
<text x="40" y="70">ブラウザ</text><text x="160" y="70">サーバ</text>
<text x="100" y="29">GET /</text><text x="100" y="47">200 OK</text>
</g>
</svg>`;

/* ================= 数式の表示例(MathJax の表示を HTML で近似) ================= */
const FR = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const SQ = x => `<span class="sq">√<span>${x}</span></span>`;
const LIM = (op, lo, hi = '') => `<span class="lim">${hi ? `<small>${hi}</small>` : ''}<span>${op}</span><small>${lo}</small></span>`;
const ACC = (x, a) => `<span class="acc" data-a="${a}"><i>${x}</i></span>`;

/* ================= 収録カード(掲載順はそのまま) ================= */
const CARDS = [

/* ---- A 基本の書式 ---- */
C('A', 'Markdown とは',
  KV(['.md', 'Markdown ファイルの拡張子。⟦README.md⟧ はリポジトリのトップに表示される', 'm'],
     ['Issue・PR', '本文やコメント欄も Markdown。⟪Preview⟫ タブで表示を確認', 'm'],
     ['⇧⌘V', 'VS Code でプレビュー(⟦⌘K V⟧ で横に並べる)'],
     ['GFM', 'GitHub Flavored Markdown。このシートは GitHub での表示が基準']),
  CD('記号を書き足すだけのテキストなので、どのエディタでも書ける。段落・リスト・表・コードなどの⟪かたまりの間は空行⟫で区切るのが基本'),
  CW('アプリごとに方言がある(VS Code・Qiita・Notion など)。提出・公開の前に GitHub 上の表示で確かめる')),

C('A', '見出し',
  EX(['# 見出し1', '<h1>見出し1</h1>', 'm'],
     ['## 見出し2', '<h2>見出し2</h2>', 'm'],
     ['### 見出し3', '<h3>見出し3</h3>'],
     ['#### 見出し4', '<h4>見出し4</h4>']),
  CD('⟦######⟧(h6)まで6段階。⟦#⟧ は文書の題名に1回だけ使い、章は ⟦##⟧ から始めるのが一般的'),
  CW('⟦#⟧ の後には⟪半角スペース⟫。⟦#見出し⟧ は見出しにならず、そのまま文字で出る')),

C('A', '文字飾り',
  EX(['**太字**', '<strong>太字</strong>', 'm'],
     ['*斜体*', '<em>斜体</em>'],
     ['***太字斜体***', '<em><strong>太字斜体</strong></em>'],
     ['~~取り消し線~~', '<del>取り消し線</del>'],
     ['H<sub>2</sub>O', 'H<sub>2</sub>O'],
     ['x<sup>2</sup>', 'x<sup>2</sup>'],
     ['<ins>下線</ins>', '<ins>下線</ins>'],
     ['<kbd>⌘</kbd>+<kbd>C</kbd>', '<kbd>⌘</kbd>+<kbd>C</kbd>', 'p']),
  CW('日本語の文中では ⟦__太字__⟧ ⟦_斜体_⟧ は効かない。⟦**⟧ と ⟦*⟧ を使う'),
  CD('文字の色・大きさ・蛍光ペン(⟦==…==⟧)は GitHub では指定できない')),

C('A', '改行と段落(いちばんの罠)',
  TB(['書き方', '.md ファイル', 'Issue・PR'], [
    ['Enter で改行しただけ', '⚠ ⟪改行されない⟫', '改行される'],
    ['行末に ⟦␣␣⟧(空白2個)', '改行', '改行'],
    ['行末に ⟦\\⟧', '改行', '改行'],
    ['⟦<br>⟧ を書く', '改行', '改行'],
    ['空行を入れる', '⟪段落⟫が分かれる', '同じ'],
  ]),
  CC(M`
1行目
2行目\
3行目

4行目`),
  OV(`<p>1行目 2行目<br>3行目</p><p>4行目</p>`, '.md ファイルでの表示'),
  CD('.md では改行が⟪空白1個⟫になり前の行とつながる(Issue・PR のコメントでは改行になる)。空行は何行入れても1行と同じ'),
  CW('行末の ⟦␣␣⟧ は見えず、保存時にエディタが消すこともある。⟦\\⟧ か ⟦<br>⟧ が確実')),

C('A', 'エスケープ(記号をそのまま出す)',
  EX(['\\*星\\*', '*星*', 'm'],
     ['\\# 見出しにしない', '# 見出しにしない'],
     ['1986\\. 年', '1986. 年'],
     ['10\\~20人', '10~20人']),
  KV(['\\ が効く記号', '⟦\\ ` * _ { } [ ] < > ( ) # + - . ! | ~⟧ など、半角の記号すべて']),
  CD('コードの中では ⟦\\⟧ は不要(書いたとおりに出る)')),

/* ---- B リスト・引用・コード ---- */
C('B', '箇条書き・番号付きリスト',
  EX([M`
- りんご
- みかん
  - 温州みかん`, '<ul><li>りんご</li><li>みかん<ul><li>温州みかん</li></ul></li></ul>', 'm'],
     [M`
1. 準備
1. 実行
1. 確認`, '<ol><li>準備</li><li>実行</li><li>確認</li></ol>', 'm']),
  CD('⟦*⟧ ⟦+⟧ でも同じ(1つのリストでは混ぜない)。番号は自動で振られるので ⟦1.⟧ を並べてよい'),
  CW('⟦-⟧ ⟦1.⟧ の後は⟪半角スペース⟫。全角スペース、⟦・⟧、全角の ⟦－⟧ ではリストにならない'),
  CW('入れ子は親の⟪文字の位置⟫まで下げる。⟦- ⟧ の下は2文字、⟦1. ⟧ の下は⟪3文字⟫。番号付きの下を2文字にすると入れ子にならない')),

C('B', 'チェックボックス',
  EX([M`
- [ ] 資料を読む
- [x] 環境構築`, `<ul class="tl"><li>${CB(false)} 資料を読む</li><li>${CB(true)} 環境構築</li></ul>`, 'm']),
  CD('Issue・PR・コメントでは、表示されたチェックボックスをクリックしてオン・オフできる'),
  CW('⟦[ ]⟧ の中は半角スペース。⟦- []⟧ は文字のまま出る')),

C('B', '引用と水平線',
  EX([M`
> 引用した文
>> 引用の中の引用`, '<blockquote><p>引用した文</p><blockquote><p>引用の中の引用</p></blockquote></blockquote>', 'm'],
     ['---', '<hr>', 'm']),
  CD('水平線は ⟦***⟧ ⟦___⟧ でもよい。引用の中でもリストや太字が使える'),
  CW('文のすぐ下の行に ⟦---⟧ を書くと、その文が⟪見出し(h2)⟫になる。⟦---⟧ の前に空行を入れる')),

C('B', 'コード',
  EX(['`printf()` を使う', '<code>printf()</code> を使う', 'm'],
     ['`` a`b ``', '<code>a`b</code>', 'p']),
  CC(M`
\`\`\`c ← 言語名を付ける
#include <stdio.h>
int main(void) {
    printf("Hello\n");
    return 0;
}
\`\`\``),
  OV(`<pre class="hl"><span class="pl-k">#include</span> <span class="pl-s">&lt;stdio.h&gt;</span>
<span class="pl-smi">int</span> <span class="pl-en">main</span>(<span class="pl-smi">void</span>) {
    <span class="pl-en">printf</span>(<span class="pl-s">"Hello\\n"</span>);
    <span class="pl-k">return</span> <span class="pl-c1">0</span>;
}</pre>`),
  KV(['```言語名', '色分けされる。⟦c⟧ ⟦js⟧ ⟦python⟧ ⟦java⟧ ⟦html⟧ ⟦css⟧ ⟦json⟧ ⟦sh⟧ ⟦sql⟧ など', 'm'],
     ['```diff', '行頭の ⟦+⟧ ⟦-⟧ を追加・削除として色分け'],
     ['~~~', '⟦```⟧ の代わりに使える', 'p'],
     ['````', '⟦```⟧ を含む文章は4個で囲む', 'p']),
  CW('⟦```⟧ を閉じ忘れると、そこからファイルの最後まで全部コードになる')),

/* ---- C リンク・画像・表 ---- */
C('C', 'リンク',
  EX(['[GitHub](https://github.com)', A('GitHub'), 'm'],
     ['<https://example.com>', A('https://example.com')],
     ['https://example.com', A('https://example.com')]),
  KV(['[文字](URL "説明")', 'マウスを乗せると説明が出る'],
     ['[課題1](docs/kadai1.md)', 'リポジトリ内のファイル(このファイルからの相対パス)', 'm'],
     ['[README](/README.md)', '⟦/⟧ で始めるとリポジトリの最上位から'],
     ['[目次へ](#はじめに)', '同じページの見出しへ(F のアンカー)'],
     ['[文字][1]', '参照式。別の行に ⟦[1]: URL⟧ と書く', 'p']),
  CW('URL やファイル名に空白があるとリンクにならない。空白を ⟦%20⟧ にするか、⟦[資料](<my file.md>)⟧ のように ⟦< >⟧ で囲む')),

C('C', '画像',
  EX(['![猫の写真](img/cat.png)', '<span class="img">🐈</span>', 'm']),
  KV(['![代替テキスト](パス)', '代替テキスト = 画像が出ないとき・読み上げのときの説明', 'm'],
     ['![図](URL "説明")', 'Web 上の画像も URL で貼れる'],
     ['<img src="cat.png" width="200">', '大きさを指定するときは HTML(F)'],
     ['[![図](a.png)](URL)', '画像をクリックするとリンク先へ', 'p']),
  CD('Issue やコメントでは、画像を⟪ドラッグ&ドロップ⟫するとアップロードされ、書き方が自動で入る'),
  CW('GitHub はファイル名の⟪大文字と小文字⟫を区別する。Mac 上では ⟦Cat.PNG⟧ を ⟦cat.png⟧ と書いても表示されるが、GitHub では表示されない')),

C('C', '表',
  CC(M`
| 名前 | 点数 | 結果 |
|:-----|-----:|:----:| ← 区切り行
| 佐藤 |   85 | 合格 |
| 鈴木 |    9 | 再試 |`),
  OV(`<table><thead><tr><th class="l">名前</th><th class="r">点数</th><th class="c">結果</th></tr></thead>
<tbody><tr><td class="l">佐藤</td><td class="r">85</td><td class="c">合格</td></tr>
<tr><td class="l">鈴木</td><td class="r">9</td><td class="c">再試</td></tr></tbody></table>`),
  KV([':---', '左寄せ'], ['---:', '右寄せ(数値向き)'], [':---:', '中央寄せ']),
  CD('2行目の⟪区切り行⟫が必須。⟦-⟧ は1個以上ならいくつでもよく、列の幅は内容に合わせて自動で決まる。縦をそろえなくてもよい'),
  CW('区切り行の列の数が見出し行と違うと、表にならず文字のまま表示される')),

C('C', '表の中で使える書き方',
  KV(['<br>', 'セルの中で改行', 'm'],
     ['\\|', 'セルの中に ⟦|⟧ を書く(⟦`a\\|b`⟧ のようにコードの中でも必要)', 'm'],
     ['**太字** `コード`', 'リンクや画像も使える'],
     ['<table>', 'セルの結合は HTML の ⟦rowspan⟧ ⟦colspan⟧ で', 'p']),
  CD('見出し行よりセルが多い行は余りが捨てられ、少ない行は空欄で埋まる。前後の ⟦|⟧ は省略できるが、付けたほうが崩れにくい')),

/* ---- D GitHub の便利な記法 ---- */
C('D', 'アラート(注意書きの枠)',
  CC(M`
> [!NOTE]
> 提出は金曜 17 時まで。`),
  OV(`<div class="al a-note"><span class="alt a-note">ⓘ Note</span><p>提出は金曜 17 時まで。</p></div>`),
  EX(['> [!TIP]', AL('tip', 'Tip', 'コツ・助言')],
     ['> [!IMPORTANT]', AL('important', 'Important', '必ず知っておくこと')],
     ['> [!WARNING]', AL('warning', 'Warning', 'すぐ注意が必要')],
     ['> [!CAUTION]', AL('caution', 'Caution', '危険・悪い結果になる')]),
  CW('⟦[!NOTE]⟧ の行には他の文字を書かない(本文は次の行から)。リストや引用の中には入れられない')),

C('D', '折りたたみ(details)',
  CC(M`
<details>
<summary>解答を見る</summary>
 ← この空行が必要
答えは **42**。
 ← この空行が必要
</details>`),
  OV(`<p><span class="tri">▶</span> 解答を見る</p>`, '表示(押すと開く)'),
  CW('⟦</summary>⟧ の後と ⟦</details>⟧ の前に⟪空行⟫が無いと、中の Markdown が効かず ⟦**⟧ が文字で出る'),
  KV(['<details open>', '最初から開いた状態にする', 'p'])),

C('D', '絵文字と自動リンク',
  EX([':smile: :+1: :warning:', '😄 👍 ⚠️', 'm'],
     ['@octocat', `<strong>${A('@octocat')}</strong>`],
     ['#123', A('#123')]),
  CD('⟦:⟧ を打つと絵文字の候補が出る。⟦@ユーザー名⟧ はその人に⟪通知⟫が届き、⟦#番号⟧ はそのリポジトリの Issue・PR へのリンクになる(どちらも Issue・PR・コメントの中で)'),
  CD('URL は ⟦< >⟧ で囲まなくても、そのまま書けばリンクになる(⟦www.⟧ で始まるものも)')),

/* ---- E 数式と図 ---- */
C('E', '数式の書き方',
  EX(['$E=mc^2$', '<span class="mx"><i>E</i>=<i>mc</i><sup>2</sup></span>', 'm']),
  CC(M`
$$
x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}
$$`),
  OV(`<div class="mx blk"><i>x</i> = ${FR(`−<i>b</i> ± ${SQ(`<i>b</i><sup>2</sup>−4<i>ac</i>`)}`, '2<i>a</i>')}</div>`),
  KV(['$…$', '文中の数式', 'm'],
     ['$$ … $$', '独立した行の数式', 'm'],
     ['```math', '⟦$$⟧ の代わりのコードブロック(⟦$$⟧ は不要)'],
     ['$`…`$', '数式の中の記号が Markdown と衝突して崩れるとき', 'p']),
  CD('LaTeX の書き方で書き、GitHub が MathJax で表示する。.md ファイル・Issue・PR・wiki で使える'),
  CW('数式と同じ行で ⟦$⟧ を文字として出すときは、数式の中では ⟦\\$⟧、数式の外では ⟦<span>$</span>⟧')),

C('E', '数式でよく使う記号',
  EX(['x^2  x_i  x^{10}', '<span class="mx"><i>x</i><sup>2</sup>  <i>x</i><sub><i>i</i></sub>  <i>x</i><sup>10</sup></span>', 'm'],
     ['\\frac{a}{b}  \\sqrt{x}', `<span class="mx">${FR('<i>a</i>', '<i>b</i>')}  ${SQ('<i>x</i>')}</span>`, 'm'],
     ['\\sum_{i=1}^{n}  \\int_0^1', `<span class="mx">${LIM('∑', '<i>i</i>=1', '<i>n</i>')}  ∫<sub>0</sub><sup>1</sup></span>`],
     ['\\lim_{x \\to 0}', `<span class="mx">${LIM('lim', '<i>x</i>→0')}</span>`],
     ['\\times \\div \\pm \\cdot', '<span class="mx">×  ÷  ±  ⋅</span>'],
     ['\\le \\ge \\ne \\approx', '<span class="mx">≤  ≥  ≠  ≈</span>'],
     ['\\alpha \\beta \\pi \\theta', '<span class="mx"><i>α  β  π  θ</i></span>'],
     ['\\infty \\to \\cdots', '<span class="mx">∞  →  ⋯</span>'],
     ['\\vec{v}  \\bar{x}', `<span class="mx">${ACC('v', '→')}  ${ACC('x', '‾')}</span>`],
     ['\\sin x  \\log n', '<span class="mx">sin <i>x</i>  log <i>n</i></span>'],
     ['\\text{個数}', '<span class="mx">個数</span>', 'p']),
  CW('2文字以上を上付き・下付きにするときは ⟦{ }⟧ で囲む。⟦x^10⟧ は ⟦x⟧ の上に ⟦1⟧ だけが付く')),

C('E', 'Mermaid で図を描く(フローチャート)',
  CC(M`
\`\`\`mermaid
flowchart TD
  A[開始] --> B{60点以上?}
  B -->|Yes| C[合格]
  B -->|No| D[再試験]
  D --> B
\`\`\``),
  OV(SVG_FLOW),
  KV(['flowchart TD', '上→下に並べる(⟦LR⟧ で左→右)', 'm'],
     ['A[文字]  A(文字)', '四角 / 角丸'],
     ['A{文字}  A((文字))', 'ひし形(分岐) / 円'],
     ['-->  ---', '矢印 / 線', 'm'],
     ['-.->  ==>', '点線の矢印 / 太い矢印'],
     ['-->|Yes|', '矢印に文字を付ける']),
  CD('⟦```mermaid⟧ のコードブロックに書くと、.md ファイル・Issue・PR などで図になる'),
  CW('文字に ⟦( ) [ ] { }⟧ などの記号を含めるときは ⟦A["f(x) を計算"]⟧ のように ⟦"…"⟧ で囲む')),

C('E', 'Mermaid のほかの図',
  CC(M`
\`\`\`mermaid
sequenceDiagram
  ブラウザ->>サーバ: GET /
  サーバ-->>ブラウザ: 200 OK
\`\`\``),
  OV(SVG_SEQ),
  KV(['sequenceDiagram', 'シーケンス図(やり取りの順番)', 'm'],
     ['->>  -->>', '実線の矢印 / 点線の矢印(返事)'],
     ['classDiagram', 'クラス図(⟦stateDiagram-v2⟧ は状態遷移図)'],
     ['erDiagram', 'ER 図(⟦gantt⟧ はガントチャート、⟦pie⟧ は円グラフ)'])),

/* ---- F 文書を整える(脚注・目次・HTML・frontmatter) ---- */
C('F', '脚注',
  CC(M`
本文です[^1]。

[^1]: 出典は教科書 p.12。`),
  OV(`<p>本文です<sup>${A('1')}</sup>。</p><div class="fn"><ol><li>出典は教科書 p.12。 ${A('↩')}</li></ol></div>`),
  CD('定義はどこに書いても⟪末尾⟫にまとめて出る。番号は出てきた順(⟦[^note]⟧ のような名前も可)。⟦↩⟧ で本文へ戻る。wiki では不可')),

C('F', '見出しのアンカーと目次',
  TB(['見出し', 'リンク先(アンカー)'], [
    ['⟦## Hello World!⟧', '⟦#hello-world⟧'],
    ['⟦## はじめに⟧', '⟦#はじめに⟧'],
    ['⟦## 環境構築（macOS）⟧', '⟦#環境構築macos⟧'],
    ['⟦## 1. 準備⟧', '⟦#1-準備⟧'],
    ['2回目の ⟦## はじめに⟧', '⟦#はじめに-1⟧'],
  ]),
  CD('英字は小文字、空白は ⟦-⟧ に。⟦-⟧ ⟦_⟧ 以外の記号は全角も消える。⟪日本語はそのまま⟫(アドレス欄では ⟦%E3%81%AF…⟧ と見えるが同じ)'),
  CC(M`
## 目次
- [はじめに](#はじめに)
- [Hello World!](#hello-world)`),
  KV(['🔗', '見出しに乗せると出る。押すとアンカー付き URL に', 'm'],
     ['Outline', '.md 表示の目次ボタン(見出し2つ以上)']),
  CW('見出しを変えるとアンカーも変わり、リンクが切れる')),

C('F', 'HTML を混ぜる(Markdown の逃げ道)',
  KV(['<br>', '改行(表のセルの中でも使える)', 'm'],
     ['<img src="a.png" width="300">', '画像の大きさを指定', 'm'],
     ['<p align="center">…</p>', '中央寄せ(⟦<div align="center">⟧ も可)'],
     ['<!-- メモ -->', '表示されないコメント', 'm'],
     ['<sub> <sup> <ins>', '下付き・上付き・下線(A)'],
     ['<kbd>Esc</kbd>', 'キーの表示'],
     ['<details>', '折りたたみ(D)'],
     ['<table>', 'セルの結合(⟦rowspan⟧ ⟦colspan⟧)', 'p']),
  CW('⟦style="color:red"⟧・⟦<font>⟧・⟦<u>⟧ は GitHub が取り除くので、色や下線は付けられない(⟦<script>⟧ は文字のまま出る)'),
  CW('HTML のタグの中に Markdown を書くときは、前後に⟪空行⟫を入れる')),

C('F', 'YAML frontmatter',
  CC(M`
---
title: 第3回 レポート
author: 千葉 太郎
date: 2026-10-23
tags: [markdown, github]
---

# 本文はここから`),
  OV(`<table class="fm"><tbody><tr><th>title</th><td>第3回 レポート</td></tr><tr><th>author</th><td>千葉 太郎</td></tr><tr><th>date</th><td>2026-10-23</td></tr><tr><th>tags</th><td><table><tbody><tr><td>markdown</td><td>github</td></tr></tbody></table></td></tr></tbody></table><h1>本文はここから</h1>`, '.md ファイルでの表示'),
  CD('ファイルの⟪1行目⟫を ⟦---⟧ で始め、⟦---⟧ で閉じる。中は YAML(⟦キー: 値⟧)で、文書の題名・日付などの情報を書く。GitHub Pages(Jekyll)などのツールが設定として読む'),
  CW('⟦:⟧ の後には半角スペース。値に ⟦: ⟧ や ⟦ #⟧ を含むときは ⟦"…"⟧ で囲む'),
  CW('Issue・コメントに書くと⟪水平線と見出し⟫に化ける。.md ファイルの先頭専用')),

/* ---- G よくある失敗 ---- */
C('G', 'よくある失敗(書式が崩れる)',
  ER(['#見出し', '⟦#⟧ の後に半角スペース → ⟦# 見出し⟧'],
     ['-　項目(全角スペース)', 'リストにならない → 半角スペースに'],
     ['・項目', '⟦・⟧ はただの文字 → ⟦- 項目⟧'],
     ['日本語の**「重要」**です', '記号で始まる・終わる太字は効かない → ⟦**⟧ の外側に半角スペースを入れるか ⟦<b>「重要」</b>⟧'],
     ['10~20人、3~5万円', '⟦~⟧ が2つあると間が⟪取り消し線⟫になる → ⟦〜⟧(全角)か ⟦\\~⟧'],
     ['まとめ\n---', '⟦まとめ⟧ が見出しになる → ⟦---⟧ の前に空行'],
     ['1. 親\n  - 子', '2文字下げでは入れ子にならない → 3文字下げる'],
     ['```js(閉じ忘れ)', 'そこから最後まで全部コードになる'])),

C('G', 'よくある失敗(つながる・出ない)',
  ER(['1行目\n2行目', '.md では1行につながる → 行末に ⟦\\⟧(A の改行)'],
     ['| A | B |\n|---|', '区切り行の列の数が違う → 表にならない'],
     ['![図](Img/Cat.PNG)', '大文字・小文字が実際のファイル名と違う → GitHub で画像が出ない'],
     ['[資料](my file.pdf)', '空白を含む → ⟦my%20file.pdf⟧ か ⟦<my file.pdf>⟧'],
     ['<div>**太字**</div>', 'HTML の中の Markdown は効かない → タグの前後に空行'],
     ['- []  タスク', '⟦[ ]⟧ の中の半角スペースが無い → チェックボックスにならない'])),

];

/* ================= カードの見出しアイコン ================= */
const ICON = {
  'Markdown とは': '📝', '見出し': '🔠', '文字飾り': '✏️', '改行と段落(いちばんの罠)': '↩️',
  'エスケープ(記号をそのまま出す)': '🛡️',
  '箇条書き・番号付きリスト': '📋', 'チェックボックス': '☑️', '引用と水平線': '💬', 'コード': '💻',
  'リンク': '🔗', '画像': '🖼️', '表': '📊', '表の中で使える書き方': '🧩',
  'Mermaid で図を描く(フローチャート)': '📈', 'Mermaid のほかの図': '🗺️',
  '数式の書き方': '🧮', '数式でよく使う記号': '🔢',
  '脚注': '📌', '見出しのアンカーと目次': '🧭', 'アラート(注意書きの枠)': '🚨',
  '折りたたみ(details)': '📂', '絵文字と自動リンク': '😀',
  'HTML を混ぜる(Markdown の逃げ道)': '🧱', 'YAML frontmatter': '📑',
  'よくある失敗(書式が崩れる)': '💥', 'よくある失敗(つながる・出ない)': '🐛',
};

const cardHtml = c => {
  const ic = ICON[c.title] ? `<i class="ic">${ICON[c.title]}</i>` : '';
  return `<div class="card c${c.cat}"><div class="ct">${ic}${inl(c.title)}</div>${c.body.join('')}</div>`;
};

/* ================= ページ分割 ================= */
// 各ページに載せるカード枚数。合計が CARDS.length と一致していること
const SPLIT = [14, 12];

const TITLE = 'Markdown チートシート';
const SUB = 'GitHub Flavored Markdown(GFM)— README・レポート・Issue を書くときに。左が書き方、右が GitHub での表示';
const SUB_SLIM = 'GitHub Flavored Markdown(GFM)';
const LEGEND = CATS.map(([k, , s]) => `<span class="lg lg${k}"><i></i>${k} ${esc(s)}</span>`).join('') +
  '<span class="lg mk"><b>★</b>まず覚える定番</span>' +
  '<span class="lg ad"><b>Aa</b>グレー文字=上級者向け</span>' +
  '<span class="lg wn"><b>⚠</b>間違えやすい点</span>';

// 各ページの役割
const ROLE = [
  'このページ＝毎回使う基本の書式と GitHub の便利な記法。左が書き方、右が GitHub での表示',
  'このページ＝数式・図と、文書を整える記法。表示が崩れたら G を見る',
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
<div class="foot"><span>${esc(ROLE[pi])}</span><span>␣ = 半角スペース ／ 表示の確認: GitHub の Preview タブ・VS Code の ⇧⌘V</span><span>${pi + 1} / ${SPLIT.length}</span></div>
</div>`;
});

// 独自記法の閉じ忘れ(⟦ ⟧ ⟪ ⟫ が残る)はビルドを止める
const leftover = pages.join('').match(/[⟦⟧⟪⟫]/g);
if (leftover) throw new Error(`閉じていない独自記法があります: ${leftover.join(' ')}`);

/* ================= CSS ================= */
// pt 値は Node.js 版と同じ基準値のまま残し、SCALE で一括調整する
const SCALE = Number(process.env.SCALE || 1.0);
const refCss = `
:root{
  --cA: #1a4fa0;
  --cB: #6b3fa0;
  --cC: #1f7a3f;
  --cD: #b07500;
  --cE: #0f7b7b;
  --cF: #d2691e;
  --cG: #c0272d;
  --ink:#1a1a1a; --sub:#3f3f3f; --dim:#8a8a8a; --line:#d5d5d5; --codebg:#f4f4f4;
  --star:#b8860b; --warn:#8a4b08; --cmt:#2e7d4f;
  --gh:#1f2328; --ghline:#d1d9e0; --ghlink:#0969da; --ghmuted:#59636e;
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
.cc .cm{color:var(--cmt);font-family:"Hiragino Sans",sans-serif}
.cd{font-size:6.24pt;line-height:1.35;color:var(--sub)}
.cd+.cd{margin-top:.35mm}
.cd strong,.kv strong,.tb strong,.er strong{color:var(--ink)}
.cd+.cw,.cd+.kv,.cd+.cc{margin-top:.55mm}

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

/* 失敗した書き方 → 直し方 */
.er{margin-bottom:.55mm}
.er>div{padding:.3mm 0;font-size:6.24pt;line-height:1.35;color:var(--sub)}
.er>div+div{border-top:.3pt solid #ededed}
.er>div>code{font-family:var(--mono);font-size:5.88pt;line-height:1.3;
  white-space:pre-wrap;overflow-wrap:anywhere;color:var(--ink);
  background:var(--codebg);border-radius:.3mm;padding:0 .4mm;
  -webkit-box-decoration-break:clone;box-decoration-break:clone}
.er span::before{content:" → "}

/* 説明文の中の等幅 */
.cd code,.kv code,.tb code,.cw code,.er span code{font-family:var(--mono);font-size:.95em;
  background:var(--codebg);border-radius:.3mm;padding:0 .3mm;overflow-wrap:anywhere}
.cw code{background:#f6e7cf}

/* 書き方 → GitHub での表示(Markdown 版で追加) */
.ex{margin-bottom:.55mm}
.exh,.exr{display:flex;gap:1.0mm}
.exh{font-size:5.4pt;line-height:1.2;color:var(--dim);padding-bottom:.15mm}
.exh>span:first-child,.exs{flex:0 0 54%;min-width:0}
.exr{align-items:center;padding:.25mm 0;border-top:.3pt solid #ededed}
.exs{font-family:var(--mono);font-size:6.12pt;line-height:1.3;color:var(--ink);
  white-space:pre-wrap;overflow-wrap:anywhere;
  background:var(--codebg);border:.3pt solid #dedede;border-radius:.4mm;padding:.1mm .55mm}
.exo{flex:1 1 auto;min-width:0}
.exr.m>.exs::before{content:"★";color:var(--star);margin-right:.5mm;font-family:"Hiragino Sans",sans-serif}
.exr.p>.exs{color:var(--dim)}

/* 表示例の枠(Markdown 版で追加) */
.ov{position:relative;border:.5pt dashed #b9c2cc;border-radius:.5mm;
  padding:2.0mm 1.0mm .6mm;margin:0 0 .55mm}
.ovl{position:absolute;top:.15mm;left:.8mm;font-size:5.04pt;line-height:1.2;color:var(--dim)}

/* GitHub での見た目の再現(.md の中だけに効かせる) */
.md{font-size:6.24pt;line-height:1.38;color:var(--gh);overflow-wrap:anywhere}
.md>*+*{margin-top:.5mm}
.md h1,.md h2,.md h3,.md h4{font-weight:700;line-height:1.25}
.md h1{font-size:9.0pt;border-bottom:.4pt solid var(--ghline);padding-bottom:.2mm}
.md h2{font-size:7.8pt;border-bottom:.4pt solid var(--ghline);padding-bottom:.2mm}
.md h3{font-size:6.96pt}
.md h4{font-size:6.36pt}
.md code{font-family:var(--mono);font-size:.92em;background:#eff1f3;border-radius:.4mm;padding:0 .4mm}
.md a{color:var(--ghlink)}
.md ul,.md ol{padding-left:3.2mm}
.md ul ul{list-style:circle}
.md ul.tl{list-style:none;padding-left:0}
.md blockquote{border-left:1.3pt solid var(--ghline);color:var(--ghmuted);padding-left:1.2mm}
.md blockquote blockquote{margin-top:.3mm}
.md hr{border:0;border-top:1.4pt solid var(--ghline);margin:.6mm 0}
.md kbd{font-family:var(--mono);font-size:.88em;border:.4pt solid var(--ghline);border-bottom-width:1pt;
  border-radius:.5mm;background:#f6f8fa;padding:0 .5mm}
.md table{border-collapse:collapse;font-size:6.0pt;line-height:1.3}
.md th,.md td{border:.4pt solid var(--ghline);padding:.2mm .9mm}
.md th{font-weight:700}
.md tbody tr:nth-child(2n) td{background:#f6f8fa}
.md .l{text-align:left} .md .r{text-align:right} .md .c{text-align:center}
.md .dim{color:var(--ghmuted)}
.md .cbx{display:inline-block;width:5.6pt;height:5.6pt;border:.6pt solid #6e7781;border-radius:1pt;
  vertical-align:-.6pt;position:relative}
.md .cbx.on{background:var(--ghlink);border-color:var(--ghlink)}
.md .cbx.on::after{content:"";position:absolute;left:1.6pt;top:.3pt;width:1.4pt;height:2.8pt;
  border:solid #fff;border-width:0 .9pt .9pt 0;transform:rotate(45deg)}
.md .img{display:inline-block;width:12mm;height:7mm;line-height:7mm;text-align:center;font-size:10pt;
  background:#eef3f8;border:.4pt solid var(--ghline);border-radius:.5mm}
.md .hl{font-family:var(--mono);font-size:6.12pt;line-height:1.32;white-space:pre-wrap;
  background:#f6f8fa;border-radius:.5mm;padding:.4mm .7mm}
.md .pl-k{color:#cf222e} .md .pl-s{color:#0a3069} .md .pl-en{color:#6639ba}
.md .pl-c1{color:#0550ae} .md .pl-smi{color:var(--gh)}
.md .alt{font-weight:700}
.md .a-note{color:#0969da} .md .a-tip{color:#1a7f37} .md .a-important{color:#8250df}
.md .a-warning{color:#9a6700} .md .a-caution{color:#d1242f}
.md .al{border-left:1.4pt solid currentColor;padding-left:1.2mm}
.md .al p{color:var(--gh)}
.md .fn{border-top:.4pt solid var(--ghline);padding-top:.4mm;font-size:5.76pt;color:var(--ghmuted)}
.md .tri{font-size:.8em}
.md .mm{display:block;width:88%;margin:0 auto;font-family:inherit}
.md .mm.sm{width:70%}
.md .fm th,.md .fm td{font-size:5.76pt}
.md .fm td table{margin:0}
/* 数式 */
.md .mx{font-family:"Times New Roman","Hiragino Mincho ProN",serif;font-size:7.2pt;white-space:pre-wrap}
.md .mx.blk{display:block;text-align:center}
.md .fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.15}
.md .fr>span:first-child{border-bottom:.5pt solid currentColor;padding:0 .4mm}
.md .sq>span{border-top:.5pt solid currentColor}
.md .lim{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1}
.md .lim small{font-size:.62em}
.md .acc{position:relative;display:inline-block}
.md .acc::after{content:attr(data-a);position:absolute;left:0;right:0;top:-.62em;text-align:center;font-size:.7em;font-style:normal}

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
<title>[ライト] Markdown チートシート(GitHub Flavored Markdown)</title>
<meta name="description" content="見出し・文字飾り・改行・リスト・コード・リンク・画像・表から、Mermaid の図・数式・脚注・目次・アラート・HTML・frontmatter・よくある失敗までを、書き方と GitHub での表示を並べてまとめたA4横${SPLIT.length}ページのチートシート(ライトモード)。">
<style>${css}</style>
</head>
<body>
${pages.join('\n')}
</body>
</html>
`;
fs.writeFileSync(OUT, html);
console.log('ok', CARDS.length, 'cards /', SPLIT.length, 'pages /', html.length, 'chars');
