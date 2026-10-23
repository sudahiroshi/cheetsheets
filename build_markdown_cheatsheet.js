// Markdown チートシート(A4横・5段組・6ページ)を生成する。p1〜p2 が Markdown、p2 の最後の段から p6 が Mermaid
// 生成方式と CSS は build_node_cheatsheet.js(ライト1枚出力・絵文字あり)に揃えている
//   .page / .head / .legend / .grid / .sec / .card / .ct / .cc / .kv / .tb / .cw / .cd / .er / .foot
// Markdown 版では「書き方 → GitHub での表示」を並べる .ex と、表示例の枠 .ov を追加している
// 掲載内容は GitHub の Markdown API(gh api /markdown の gfm / markdown 両モード)と
// 実リポジトリの .md ファイルの描画結果で確認済み(2026年10月)。数式は公式ドキュメントで確認
// Mermaid は GitHub の描画器が mermaid v12.2.0 であることを ```mermaid の info で確かめ(2026年10月)、
// 載せたコードはすべて mermaid 12.2.0 を GitHub と同じ initialize 設定で動かして描画できることを確認している
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
  ['E', '数式', '数式'],
  ['F', '文書を整える(脚注・目次・HTML)', '文書を整える'],
  ['G', 'よくある失敗', 'よくある失敗'],
  ['H', 'Mermaid とフローチャート', '図の基本'],
  ['I', 'シーケンス図・クラス図ほか', '設計の図'],
  ['J', 'ER 図・グラフ・エラーなど', 'ほかの図'],
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
// GitHub の描画器は mermaid.initialize で theme: default を指定している(ページの色モードが dark のときは dark)。色はライトの既定値に合わせている
// v12 から flowchart などは影付き・角の丸い直角の線(look: neo)になったが、印刷で見やすいよう影は省いている
const MC = { fill: '#ececff', line: '#9370db', ink: '#333', lab: '#e8e8e8', note: '#fff5ad', noteLine: '#aaaa33' };
const R = n => +n.toFixed(2);
// 矢印の先の形。ページの先頭に1回だけ置き、すべての図から url(#mm-…) で参照する
const MARKERS = `<svg class="defs" width="0" height="0" aria-hidden="true"><defs>
<marker id="mm-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="#333"/></marker>
<marker id="mm-ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="#f00"/></marker>
<marker id="mm-a2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="2.6" markerHeight="2.6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="#333"/></marker>
<marker id="mm-o" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L7 4L1 7" fill="none" stroke="#333" stroke-width="1.2"/></marker>
<marker id="mm-x" viewBox="0 0 8 8" refX="5" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L7 7M7 1L1 7" stroke="#333" stroke-width="1.4"/></marker>
<marker id="mm-c" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4.5" markerHeight="4.5" orient="auto"><circle cx="4" cy="4" r="3" fill="#333"/></marker>
<marker id="mm-t" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L11 6L1 11z" fill="#fff" stroke="#333"/></marker>
<marker id="mm-d" viewBox="0 0 14 8" refX="13" refY="4" markerWidth="8" markerHeight="5" orient="auto-start-reverse"><path d="M1 4L7 1L13 4L7 7z" fill="#333" stroke="#333"/></marker>
<marker id="mm-dh" viewBox="0 0 14 8" refX="13" refY="4" markerWidth="8" markerHeight="5" orient="auto-start-reverse"><path d="M1 4L7 1L13 4L7 7z" fill="#fff" stroke="#333"/></marker>
</defs></svg>`;

// 図の枠。w は段の幅に対する表示幅(%)
const SVG = (vb, w, label, body) =>
  `<svg class="mm" viewBox="${vb}" style="width:${w}%" role="img" aria-label="${esc(label)}">${body}</svg>`;
// 行の中に置く小さな図。h は表示の高さ(mm)
const ICO = (vw, vh, h, body) =>
  `<svg class="mi" viewBox="0 0 ${vw} ${vh}" style="width:${R(h * vw / vh)}mm;height:${h}mm" aria-hidden="true">${body}</svg>`;
// 文字幅の目安(全角 1.0・半角 0.6 文字ぶん)。ラベルの背景の幅に使う
const tw = (s, fs) => [...s].reduce((w, ch) => w + (ch.codePointAt(0) > 0xff ? fs : fs * 0.6), 0);
// 文字。o = { fs: 大きさ, a: 揃え, c: 色, b: 太字, it: 斜体, u: 下線, rot: 回転(度) }
const TX = (x, y, s, o = {}) => {
  const at = `font-size="${o.fs || 8}" text-anchor="${o.a || 'middle'}" fill="${o.c || MC.ink}"` +
    (o.b ? ' font-weight="700"' : '') + (o.it ? ' font-style="italic"' : '') + (o.u ? ' text-decoration="underline"' : '');
  return o.rot ? `<text transform="translate(${x} ${y}) rotate(${o.rot})" ${at}>${esc(s)}</text>`
    : `<text x="${R(x)}" y="${R(y)}" ${at}>${esc(s)}</text>`;
};
// ノード(中心 cx,cy・幅 w・高さ h)。label は \n で改行
const ND = (k, cx, cy, w, h, label = '', o = {}) => {
  const x = cx - w / 2, y = cy - h / 2, i = Math.min(h * 0.45, w * 0.2);
  const at = `fill="${o.fill || MC.fill}" stroke="${o.stroke || MC.line}" stroke-width="${o.sw || 1}"`;
  const ln = `fill="none" stroke="${o.stroke || MC.line}" stroke-width="${o.sw || 1}"`;
  const P = pts => `<polygon points="${pts.map(([a, b]) => R(a) + ',' + R(b)).join(' ')}" ${at}/>`;
  const RC = rx => `<rect x="${R(x)}" y="${R(y)}" width="${w}" height="${h}" rx="${R(rx)}" ${at}/>`;
  const e = h * 0.18, q = h * 0.14;
  const g = {
    rect: () => RC(1), round: () => RC(h * 0.3), stadium: () => RC(h / 2),
    sub: () => RC(0) + `<path d="M${R(x + 3)} ${R(y)}V${R(y + h)}M${R(x + w - 3)} ${R(y)}V${R(y + h)}" ${ln}/>`,
    cyl: () => `<path d="M${R(x)} ${R(y + e)}A${R(w / 2)} ${R(e)} 0 0 1 ${R(x + w)} ${R(y + e)}V${R(y + h - e)}A${R(w / 2)} ${R(e)} 0 0 1 ${R(x)} ${R(y + h - e)}Z" ${at}/>` +
      `<path d="M${R(x)} ${R(y + e)}A${R(w / 2)} ${R(e)} 0 0 0 ${R(x + w)} ${R(y + e)}" ${ln}/>`,
    circle: () => `<circle cx="${cx}" cy="${cy}" r="${R(h / 2)}" ${at}/>`,
    dcircle: () => `<circle cx="${cx}" cy="${cy}" r="${R(h / 2)}" ${at}/><circle cx="${cx}" cy="${cy}" r="${R(h / 2 - 1.6)}" ${ln}/>`,
    diamond: () => P([[cx, y], [x + w, cy], [cx, y + h], [x, cy]]),
    hex: () => P([[x + i, y], [x + w - i, y], [x + w, cy], [x + w - i, y + h], [x + i, y + h], [x, cy]]),
    para: () => P([[x + i, y], [x + w, y], [x + w - i, y + h], [x, y + h]]),
    paraR: () => P([[x, y], [x + w - i, y], [x + w, y + h], [x + i, y + h]]),
    trap: () => P([[x + i, y], [x + w - i, y], [x + w, y + h], [x, y + h]]),
    trapR: () => P([[x, y], [x + w, y], [x + w - i, y + h], [x + i, y + h]]),
    flag: () => P([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x + i, cy]]),
    doc: () => `<path d="M${R(x)} ${R(y)}H${R(x + w)}V${R(y + h - q)}Q${R(x + w * 0.75)} ${R(y + h - 3 * q)} ${R(cx)} ${R(y + h - q)}T${R(x)} ${R(y + h - q)}Z" ${at}/>`,
  }[k]();
  const fs = o.fs || 8, lines = String(label).split('\n');
  return g + lines.map((t, n) => TX(cx, cy + fs * 0.35 + (n - (lines.length - 1) / 2) * fs * 1.2, t, { fs, c: o.tc, b: o.b })).join('');
};
// 線・矢印。o = { end: 先の形(既定 'a'、'' で無し), start, dash, sw, c }
const ED = (d, o = {}) => {
  const end = o.end === undefined ? 'a' : o.end;
  return `<path d="${d}" fill="none" stroke="${o.c || MC.ink}" stroke-width="${o.sw || 1}"` +
    (o.dash ? ` stroke-dasharray="${o.dash}"` : '') + (end ? ` marker-end="url(#mm-${end})"` : '') +
    (o.start ? ` marker-start="url(#mm-${o.start})"` : '') + '/>';
};
// 矢印のラベル(灰色の背景つき)
const EL = (cx, cy, s, fs = 7) => {
  const w = tw(s, fs) + 3, h = fs * 1.35;
  return `<rect x="${R(cx - w / 2)}" y="${R(cy - h / 2)}" width="${R(w)}" height="${R(h)}" fill="${MC.lab}"/>` + TX(cx, cy + fs * 0.35, s, { fs });
};
const CIRC = (cx, cy, r, f = MC.ink, s = 'none') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" stroke="${s}"/>`;
const BOX = (x, y, w, h, f, s = 'none', extra = '') => `<rect x="${R(x)}" y="${R(y)}" width="${R(w)}" height="${R(h)}" fill="${f}" stroke="${s}"${extra}/>`;
// 状態遷移図の開始 [*] と終了 [*]
const S_START = (cx, cy, r = 4) => CIRC(cx, cy, r);
const S_END = (cx, cy, r = 5) => CIRC(cx, cy, r, '#fff', MC.ink) + CIRC(cx, cy, R(r * 0.6));

// ER 図の線の端の記号。(x,y) はエンティティの縁、dir は縁から線が出ていく向き
const erEnd = (x, y, dir, kind) => {
  const [ux, uy] = { r: [1, 0], l: [-1, 0], d: [0, 1], u: [0, -1] }[dir], px = -uy, py = ux;
  const pt = (t, s = 0) => `${R(x + ux * t + px * s)} ${R(y + uy * t + py * s)}`;
  const bar = t => `M${pt(t, -3.5)}L${pt(t, 3.5)}`;
  const crow = `M${pt(7)}L${pt(0, -3.5)}M${pt(7)}L${pt(0)}M${pt(7)}L${pt(0, 3.5)}`;
  const ring = t => `<circle cx="${R(x + ux * t)}" cy="${R(y + uy * t)}" r="2.2" fill="#fff" stroke="${MC.ink}" stroke-width=".8"/>`;
  const d = { one: bar(3) + bar(6), zeroOne: bar(3), many0: crow, many1: crow + bar(9) }[kind];
  return `<path d="${d}" fill="none" stroke="${MC.ink}" stroke-width=".8"/>` +
    ({ zeroOne: ring(8.5), many0: ring(10) }[kind] || '');
};

// 行の中の小さな図: ノードの形2つ / 線1本 / クラス図の関係 / ER 図の関係
const SHP2 = (k1, l1, k2, l2) => ICO(84, 14, 3.6, ND(k1, 20, 7, 36, 12, l1, { fs: 6.5 }) + (k2 ? ND(k2, 64, 7, 36, 12, l2, { fs: 6.5 }) : ''));
const LNI = (o = {}, label = '') => ICO(50, 9, 2.6, ED('M3 4.5H46', o) + (label ? EL(24, 4.5, label, 6) : ''));
const CLI = (d, o = {}) => ICO(50, 10, 2.8, TX(3.5, 7.6, 'A', { fs: 7 }) + TX(46.5, 7.6, 'B', { fs: 7 }) + ED(d, o));
const ERI = (l, r) => ICO(58, 12, 2.9, BOX(.5, 1, 10, 10, MC.fill, MC.line) + TX(5.5, 8.6, 'A', { fs: 7 }) +
  BOX(47.5, 1, 10, 10, MC.fill, MC.line) + TX(52.5, 8.6, 'B', { fs: 7 }) +
  ED('M10.5 6H47.5', { end: '', sw: .8 }) + erEnd(10.5, 6, 'r', l) + erEnd(47.5, 6, 'l', r));
// ノードを HTML で描く(ラベルの書き方の表示例用)
const MN = t => `<span class="mn">${t}</span>`;

const SVG_INTRO = SVG('0 0 200 22', 88, '横に3つ並んだフローチャートの表示例',
  ND('rect', 28, 11, 46, 16, '調べる') + ND('rect', 100, 11, 46, 16, '書く') + ND('rect', 172, 11, 46, 16, '提出') +
  ED('M51 11H76') + ED('M123 11H148'));

const SVG_FLOW = SVG('26 0 134 110', 54, 'フローチャートの表示例',
  ND('rect', 122, 10, 52, 16, '開始') + ND('diamond', 122, 44, 68, 36, '60点以上?') +
  ND('rect', 56, 100, 52, 16, '合格') + ND('rect', 122, 100, 52, 16, '再試験') +
  ED('M122 18V25') + ED('M105 53V68Q105 71 102 71H59Q56 71 56 74V91') + ED('M122 62V91') + ED('M142 92V53') +
  EL(56, 82, 'Yes') + EL(122, 79, 'No'));

const SVG_SUB = SVG('0 0 200 46', 88, 'サブグラフの表示例',
  BOX(2, 2, 94, 42, '#ffffde', '#aaaa33') + TX(49, 12, '入力', { fs: 7.5 }) +
  ND('rect', 27, 29, 42, 14, 'キー入力', { fs: 7.5 }) + ND('rect', 75, 29, 32, 14, '検査', { fs: 7.5 }) +
  BOX(104, 2, 94, 42, '#ffffde', '#aaaa33') + TX(151, 12, '出力', { fs: 7.5 }) +
  ND('rect', 128, 29, 32, 14, '計算', { fs: 7.5 }) + ND('rect', 174, 29, 36, 14, '表示', { fs: 7.5 }) +
  ED('M48 29H58') + ED('M91 29H111') + ED('M144 29H155'));

const SVG_STYLE = SVG('0 0 200 20', 88, '色を変えたフローチャートの表示例',
  ND('rect', 28, 10, 44, 14, '入力') + ND('rect', 100, 10, 44, 14, '処理', { fill: '#ffee99', stroke: '#cc9900' }) +
  ND('rect', 172, 10, 44, 14, '出力', { fill: '#ffcccc', stroke: '#cc0000' }) +
  ED('M50 10H77') + ED('M122 10H149', { c: '#f00', end: 'ar' }));

const SVG_LOOP = SVG('16 0 152 150', 58, '繰り返しのフローチャートの表示例',
  ND('stadium', 62, 8, 44, 14, '開始', { fs: 7 }) + ND('para', 62, 29, 60, 14, 'n を入力', { fs: 7 }) +
  ND('rect', 62, 50, 64, 14, 'i = 1, sum = 0', { fs: 7 }) + ND('diamond', 62, 78, 64, 28, 'i が n 以下?', { fs: 7 }) +
  ND('rect', 48, 116, 52, 22, 'sum += i\ni++', { fs: 7 }) +
  ND('para', 130, 116, 60, 14, 'sum を表示', { fs: 7 }) + ND('stadium', 130, 140, 44, 14, '終了', { fs: 7 }) +
  ED('M62 15V21') + ED('M62 36V42') + ED('M62 57V63') +
  ED('M38 82V104') + EL(38, 95, 'Yes', 6.5) + ED('M62 105V93') +
  ED('M80 84V96Q80 99 83 99H127Q130 99 130 102V108') + EL(105, 99, 'No', 6.5) + ED('M130 123V132'));

const SVG_SYS = SVG('0 0 206 52', 88, 'システム構成図の表示例',
  ND('circle', 13, 24, 24, 24, '利用者', { fs: 6 }) + ND('rect', 52, 24, 34, 14, 'ブラウザ', { fs: 6.5 }) +
  ND('rect', 110, 24, 42, 22, 'サーバ\nExpress', { fs: 6.5 }) + ND('cyl', 180, 12, 50, 20, 'データベース', { fs: 6.5 }) +
  ND('para', 180, 40, 40, 14, 'ログ', { fs: 6.5 }) +
  ED('M25 24H34') + ED('M69 24H88') + EL(78.5, 24, 'HTTP', 5.5) +
  ED('M131 20H137Q140 20 140 17V15Q140 12 143 12H154') + EL(147, 12, 'SQL', 5.5) +
  ED('M131 28H137Q140 28 140 31V37Q140 40 143 40H161', { dash: '2 1.6' }));

// シーケンス図の参加者(上下の箱と縦の線)
const SQP = (cx, w, label, top, bottom) => ND('rect', cx, top + 7, w, 14, label, { fs: 7.5 }) +
  ED(`M${cx} ${top + 14}V${bottom}`, { end: '', c: MC.line, sw: .8 }) + ND('rect', cx, bottom + 7, w, 14, label, { fs: 7.5 });
// 人の形の参加者(actor)
const ACT = (cx, y) => CIRC(cx, y + 3.5, 3.2, '#fff', MC.line) +
  `<path d="M${cx} ${y + 6.7}V${y + 13}M${cx - 5} ${y + 9}H${cx + 5}M${cx} ${y + 13}L${cx - 4.5} ${y + 19}M${cx} ${y + 13}L${cx + 4.5} ${y + 19}" fill="none" stroke="${MC.line}"/>`;
// シーケンス図のブロック(loop / alt など)の枠と見出し
const FRAME = (x, y, w, h, kind, cond, cy) => BOX(x, y, w, h, 'none', MC.line, ' stroke-width=".8" stroke-dasharray="1.5 1.5"') +
  `<path d="M${x} ${y}H${x + tw(kind, 6.5) + 10}V${y + 6}L${x + tw(kind, 6.5) + 6} ${y + 10}H${x}Z" fill="${MC.fill}" stroke="${MC.line}" stroke-width=".8"/>` +
  TX(x + 2, y + 7.5, kind, { fs: 6.5, a: 'start' }) + TX(x + w / 2 + 8, cy, cond, { fs: 6.5 });
// 自動で振られる番号(autonumber)
const NUM = (cx, cy, n) => CIRC(cx, cy, 3.4) + TX(cx, cy + 1.8, String(n), { fs: 5, c: '#fff' });

const SVG_SEQ = SVG('0 0 200 76', 70, 'シーケンス図の表示例',
  SQP(40, 60, 'ブラウザ', 2, 60) + SQP(160, 60, 'サーバ', 2, 60) +
  TX(100, 29, 'GET /', { fs: 7.5 }) + ED('M40 32H159') + TX(100, 47, '200 OK', { fs: 7.5 }) + ED('M160 50H41', { dash: '3 2' }));

const SVG_ALT = SVG('0 0 200 138', 64, 'ループと条件分岐のシーケンス図の表示例',
  SQP(40, 56, '利用者', 2, 122) + SQP(160, 56, 'サーバ', 2, 122) +
  TX(100, 24, 'ログイン', { fs: 7 }) + ED('M40 27H159') +
  FRAME(12, 32, 176, 56, 'alt', '[パスワードが正しい]', 40) +
  TX(100, 51, 'マイページ', { fs: 7 }) + ED('M160 54H41', { dash: '3 2' }) +
  ED('M12 60H188', { end: '', c: MC.line, sw: .8, dash: '1.5 1.5' }) + TX(108, 68, '[間違い]', { fs: 6.5 }) +
  TX(100, 78, 'エラー', { fs: 7 }) + ED('M160 81H41', { dash: '3 2' }) +
  FRAME(12, 93, 176, 28, 'loop', '[30秒ごと]', 101) +
  TX(100, 111, '新着を確認', { fs: 7 }) + ED('M40 114H159'));

const SVG_LOGIN = SVG('0 0 200 140', 64, 'ログインのシーケンス図の表示例',
  ACT(22, 2) + TX(22, 29, '利用者', { fs: 6.5 }) + ED('M22 31V112', { end: '', c: MC.line, sw: .8 }) +
  ACT(22, 114) + TX(22, 139, '利用者', { fs: 6.5 }) +
  SQP(74, 46, 'ブラウザ', 5, 117) + SQP(126, 46, 'サーバ', 5, 117) + SQP(178, 40, 'DB', 5, 117) +
  BOX(123, 54, 6, 42, '#f4f4f4', '#666', ' stroke-width=".6"') + BOX(175, 68, 6, 14, '#f4f4f4', '#666', ' stroke-width=".6"') +
  TX(48, 37, 'ログイン', { fs: 6.5 }) + ED('M22 40H73') + NUM(22, 40, 1) +
  TX(100, 51, 'POST /login', { fs: 6.5 }) + ED('M74 54H122') + NUM(74, 54, 2) +
  TX(152, 65, '検索', { fs: 6.5 }) + ED('M129 68H174') + NUM(129, 68, 3) +
  TX(152, 79, '結果', { fs: 6.5 }) + ED('M175 82H130', { dash: '3 2' }) + NUM(175, 82, 4) +
  TX(100, 93, '302 /home', { fs: 6.5 }) + ED('M123 96H75', { dash: '3 2' }) + NUM(123, 96, 5) +
  BOX(66, 101, 68, 11, MC.note, MC.noteLine, ' stroke-width=".6"') + TX(100, 108.6, 'Cookie を発行', { fs: 6 }));

const SVG_SEQBOX = SVG('0 0 200 90', 62, '参加者の種類と枠のシーケンス図の表示例',
  BOX(56, 1, 142, 88, '#fff', MC.line, ' stroke-width=".8"') + TX(127, 8, '学内のシステム', { fs: 6.5 }) +
  ACT(22, 6) + TX(22, 32, '学生', { fs: 6.5 }) + ED('M22 34V62', { end: '', c: MC.line, sw: .8 }) +
  ACT(22, 64) + TX(22, 89, '学生', { fs: 6.5 }) +
  SQP(92, 40, 'サーバ', 12, 64) + SQP(162, 34, 'DB', 12, 64) +
  TX(57, 41, '成績を見る', { fs: 6.5 }) + ED('M22 44H91') + TX(127, 52, '検索', { fs: 6.5 }) + ED('M92 55H161'));

// クラスの箱。parts は区画(属性・メソッド)ごとの行の配列
const CLB = (x, y, w, stereo, name, parts) => {
  let s = '', cy = y + (stereo ? 8.5 : 0);
  if (stereo) s += TX(x + w / 2, y + 8, stereo, { fs: 6 });
  s += TX(x + w / 2, cy + 8, name, { fs: 7.5, b: 1 });
  cy += 11;
  for (const rows of parts) {
    s += ED(`M${x} ${R(cy)}H${x + w}`, { end: '', c: MC.line, sw: .6 });
    cy += rows.length ? 2 : 4;
    for (const t of rows) { cy += 7.5; s += TX(x + 4, cy, t, { fs: 6.5, a: 'start' }); }
    cy += rows.length ? 2 : 0;
  }
  return BOX(x, y, w, R(cy - y), MC.fill, MC.line) + s;
};
const SVG_IFACE = SVG('8 0 184 92', 70, 'インターフェースと実装のクラス図の表示例',
  CLB(66, 2, 68, '«interface»', 'Shape', [[], ['+area() : double']]) +
  CLB(14, 56, 68, '', 'Circle', [['-double r'], ['+area() : double']]) +
  CLB(118, 56, 68, '', 'Rect', [[], []]) +
  ED('M48 56L84 38.5', { end: 't', dash: '3 2' }) + ED('M152 56L116 38.5', { end: 't', dash: '3 2' }));

const SVG_CLASS = SVG('30 0 140 78', 50, 'クラス図の表示例',
  BOX(50, 2, 100, 74, MC.fill, MC.line) + TX(100, 11, '«abstract»', { fs: 6.5 }) + TX(100, 20, 'Animal', { fs: 8, b: 1 }) +
  ED('M50 24H150', { end: '', c: MC.line }) + ED('M50 46H150', { end: '', c: MC.line }) +
  TX(56, 33, '-String name', { fs: 7, a: 'start' }) + TX(56, 41.5, '#int age', { fs: 7, a: 'start' }) +
  TX(56, 55, '+getName() : String', { fs: 7, a: 'start' }) + TX(56, 63.5, '+speak() : void', { fs: 7, a: 'start', it: 1 }) +
  TX(56, 72, '+count() : int', { fs: 7, a: 'start', u: 1 }));

// 中身を省いたクラスの箱(名前と空の区画2つ)
const CLS = (cx, y, w, name) => BOX(cx - w / 2, y, w, 20, MC.fill, MC.line) + TX(cx, y + 9, name, { fs: 7, b: 1 }) +
  ED(`M${cx - w / 2} ${y + 12}H${cx + w / 2}M${cx - w / 2} ${y + 16}H${cx + w / 2}`, { end: '', c: MC.line, sw: .6 });
const SVG_CLREL = SVG('0 0 200 92', 64, 'クラス図の関係の表示例',
  CLS(40, 2, 44, 'Owner') + CLS(40, 70, 36, 'Dog') + CLS(150, 24, 48, 'Animal') + CLS(160, 70, 36, 'Cat') +
  ED('M40 22V69') + EL(40, 46, '飼う', 6.5) + TX(35, 30, '1', { fs: 6 }) + TX(45, 66, '0..*', { fs: 6, a: 'start' }) +
  ED('M50 70V59Q50 56 53 56H137Q140 56 140 53V45', { end: 't' }) + ED('M160 70V45', { end: 't' }));

const SVG_STATE = SVG('20 0 110 114', 50, '状態遷移図の表示例',
  S_START(60, 5) + ND('round', 60, 22, 44, 14, '待機', { fs: 7.5 }) + ND('round', 60, 56, 44, 14, '実行中', { fs: 7.5 }) +
  ND('round', 50, 104, 52, 14, '一時停止', { fs: 7.5 }) + S_END(110, 104) +
  ED('M60 9V14') + ED('M60 29V48') + EL(60, 39, '開始', 6.5) +
  ED('M42 63V96') + EL(42, 80, '停止', 6.5) + ED('M60 97V64') + EL(60, 80, '再開', 6.5) +
  ED('M76 63V70Q76 73 79 73H107Q110 73 110 76V98') + EL(110, 86, '完了', 6.5));

const SVG_VEND = SVG('0 0 200 80', 88, '複合状態と分岐の状態遷移図の表示例',
  S_START(5, 30, 3.5) + ND('round', 32, 30, 40, 13, '入力待ち', { fs: 6.5 }) + ED('M8.5 30H11') +
  ND('diamond', 104, 30, 10, 10) +
  ED('M52 27H101.5') + TX(77, 24.5, '投入', { fs: 6 }) + ED('M102 33H53') + TX(77, 40, '足りない', { fs: 6 }) +
  ED('M109 30H149') + EL(129, 30, '金額が足りる', 5.5) +
  BOX(150, 2, 48, 76, 'none', MC.line, ' rx="3"') + TX(174, 9.5, '販売', { fs: 7 }) + ED('M150 12H198', { end: '', c: MC.line, sw: .6 }) +
  S_START(174, 20, 3) + ED('M174 23V28') + ND('round', 174, 35, 44, 12, '商品を出す', { fs: 6 }) +
  ED('M174 41V48') + ND('round', 174, 55, 46, 12, 'おつりを出す', { fs: 6 }) + ED('M174 61V66') + S_END(174, 71, 4) +
  ED('M149 64H35Q32 64 32 61V37.5'));

// ER 図のエンティティ(見出しと属性の表)
const TBL = (x, y, title, rows, cols) => {
  const w = cols.reduce((a, b) => a + b, 0);
  let s = BOX(x, y, w, 12 + rows.length * 10, MC.fill, MC.line) + TX(x + w / 2, y + 8.5, title, { fs: 7.5 });
  rows.forEach((r, n) => {
    const ry = y + 12 + n * 10;
    s += ED(`M${x} ${ry}H${x + w}`, { end: '', c: MC.line, sw: .6 });
    let cx = x;
    r.forEach((t, k) => { if (k) s += ED(`M${cx} ${ry}V${ry + 10}`, { end: '', c: MC.line, sw: .6 }); s += TX(cx + 2, ry + 7, t, { fs: 6.5, a: 'start' }); cx += cols[k]; });
  });
  return s;
};
const SVG_ER = SVG('0 0 200 90', 84, 'ER 図の表示例',
  TBL(4, 4, '学生', [['int', '学籍番号', 'PK'], ['string', '氏名', '']], [24, 34, 14]) +
  BOX(134, 4, 52, 24, MC.fill, MC.line) + TX(160, 19, '科目', { fs: 7.5 }) +
  TBL(60, 64, '履修', [['int', '学籍番号', 'FK']], [24, 40, 14]) +
  ED('M40 36V70Q40 73 43 73H60', { end: '', sw: .8 }) + erEnd(40, 36, 'd', 'one') + erEnd(60, 73, 'l', 'many0') + EL(40, 52, 'する', 6.5) +
  ED('M160 28V70Q160 73 157 73H138', { end: '', sw: .8 }) + erEnd(160, 28, 'd', 'one') + erEnd(138, 73, 'r', 'many0') + EL(160, 50, 'される', 6.5));

// ガントチャート: 10/01 を 0 日目として x = 34 + 日 × 5.06
const GX = d => R(34 + d * 5.06);
const SVG_GANTT = SVG('0 0 200 72', 88, 'ガントチャートの表示例',
  TX(112, 8, '卒業研究の計画', { fs: 7.5 }) + BOX(0, 13, 200, 24, '#f0f0ff') +
  [0, 7, 14, 21, 28].map(d => ED(`M${GX(d)} 13V61`, { end: '', c: '#d0d0d0', sw: .5 }) +
    TX(GX(d), 68, `10/${String(d + 1).padStart(2, '0')}`, { fs: 5.5 })).join('') +
  TX(3, 27.5, '準備', { fs: 6.5, a: 'start' }) + TX(3, 51.5, 'まとめ', { fs: 6.5, a: 'start' }) +
  BOX(GX(0), 15.5, GX(7) - GX(0), 9, '#d3d3d3', '#808080') + TX((GX(0) + GX(7)) / 2, 22, '文献調査', { fs: 6 }) +
  BOX(GX(7), 27.5, GX(21) - GX(7), 9, '#bfc7ff', '#534fbc') + TX((GX(7) + GX(21)) / 2, 34, '実験', { fs: 6 }) +
  BOX(GX(21), 39.5, GX(31) - GX(21), 9, '#ff5252', '#d00') + TX((GX(21) + GX(31)) / 2, 46, '卒論執筆', { fs: 6, c: '#fff' }) +
  ND('diamond', GX(31), 56, 8, 8, '', { fill: '#8a90dd', stroke: '#534fbc' }) + TX(GX(31) - 6, 58, '発表', { fs: 6, a: 'end' }));

// 円グラフ: 中心 (40,40)・半径 28、上から時計回りに C 40% / Python 35% / JavaScript 25%
const SVG_PIE = SVG('0 0 150 72', 66, '円グラフの表示例',
  TX(75, 7, '使っている言語', { fs: 7.5 }) +
  '<g stroke="#000" stroke-width=".8">' +
  '<path d="M40 40L40 12A28 28 0 0 1 56.46 62.65Z" fill="#ececff"/>' +
  '<path d="M40 40L56.46 62.65A28 28 0 0 1 12 40Z" fill="#ffffde"/>' +
  '<path d="M40 40L12 40A28 28 0 0 1 40 12Z" fill="#c9ff5c"/></g>' +
  TX(56, 37, '40%', { fs: 6 }) + TX(32.4, 57, '35%', { fs: 6 }) + TX(28.1, 30, '25%', { fs: 6 }) +
  [['#ececff', 'C'], ['#ffffde', 'Python'], ['#c9ff5c', 'JavaScript']].map(([f, t], n) =>
    BOX(84, 27 + n * 10, 6, 6, f, '#999', ' stroke-width=".5"') + TX(93, 32.5 + n * 10, t, { fs: 7, a: 'start' })).join(''));

// 棒グラフ: 縦軸 0〜20 を y 64〜14 に(1 あたり 2.5)
const SVG_XY = SVG('0 0 200 76', 80, '棒グラフと折れ線グラフの表示例',
  TX(110, 8, '月別の平均気温', { fs: 7.5 }) +
  [5, 6, 9, 14].map((v, n) => BOX(37 + n * 40, 64 - v * 2.5, 26, v * 2.5, '#ececff') + TX(50 + n * 40, 72, `${n + 1}月`, { fs: 6 })).join('') +
  `<polyline points="50,51.5 90,49 130,41.5 170,29" fill="none" stroke="#8493a6" stroke-width="1.2"/>` +
  ED('M30 14V64H190', { end: '', sw: .8 }) +
  [0, 10, 20].map(v => TX(27, 66 - v * 2.5, String(v), { fs: 5.5, a: 'end' }) + ED(`M28 ${64 - v * 2.5}H30`, { end: '', sw: .6 })).join('') +
  TX(9, 39, '気温(℃)', { fs: 6, rot: -90 }));

// 4象限の図: 1辺 100 の正方形を x 50〜150・y 12〜112 に置く(点の座標 0〜1 を拡大)
const QP = (px, py, t) => CIRC(R(50 + px * 100), R(112 - py * 100), 2.8, '#7f6ad6') + TX(R(50 + px * 100), R(112 - py * 100 + 9), t, { fs: 6 });
const SVG_QUAD = SVG('0 0 200 124', 56, '4象限の図の表示例',
  TX(100, 8, '課題の優先度', { fs: 7.5 }) +
  BOX(100, 12, 50, 50, '#e3e3fb') + BOX(50, 12, 50, 50, '#ebebfc') + BOX(50, 62, 50, 50, '#f3f3fd') + BOX(100, 62, 50, 50, '#ebebfc') +
  ED('M100 12V112M50 62H150', { end: '', c: '#c8c8e8', sw: .6 }) +
  TX(125, 21, 'すぐやる', { fs: 6.5 }) + TX(75, 21, '計画する', { fs: 6.5 }) + TX(75, 71, '後回し', { fs: 6.5 }) + TX(125, 71, '人に頼む', { fs: 6.5 }) +
  QP(.8, .7, 'レポート') + QP(.3, .3, 'サークル') +
  TX(75, 121, '急ぎでない', { fs: 6 }) + TX(125, 121, '急ぎ', { fs: 6 }) +
  TX(45, 87, '重要でない', { fs: 6, rot: -90 }) + TX(45, 37, '重要', { fs: 6, rot: -90 }));

// マインドマップ: 枝ごとに色が変わる(子は親の枝の色)
const MMN = (cx, cy, w, t, f, c = MC.ink) => BOX(cx - w / 2, cy - 6, w, 12, f, 'none', ' rx="2"') + TX(cx, cy + 2.5, t, { fs: 7, c });
const MLN = (x1, y1, x2, y2, c, sw) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c}" stroke-width="${sw}"/>`;
const SVG_MIND = SVG('0 0 200 112', 72, 'マインドマップの表示例',
  MLN(84, 56, 70, 30, '#c8f06e', 3) + MLN(70, 30, 30, 9, '#c8f06e', 2) + MLN(70, 30, 140, 12, '#c8f06e', 2) +
  MLN(84, 56, 86, 88, '#f0f060', 3) + MLN(86, 88, 34, 104, '#f0f060', 2) + MLN(86, 88, 146, 102, '#f0f060', 2) +
  MLN(84, 56, 170, 54, '#b48cf0', 3) +
  CIRC(84, 56, 15, '#2a2aea') + TX(84, 58.5, 'レポート', { fs: 7, c: '#fff' }) +
  MMN(70, 30, 30, '本論', '#d2ff7a') + MMN(30, 9, 26, '方法', '#d2ff7a') + MMN(140, 12, 26, '結果', '#d2ff7a') +
  MMN(86, 88, 30, '序論', '#ffff78') + MMN(34, 104, 26, '目的', '#ffff78') + MMN(146, 102, 26, '背景', '#ffff78') +
  MMN(170, 54, 30, '結論', '#c09aff', '#fff'));

const TLB = (x, y, w, t, f, c = MC.ink) => BOX(x, y, w, 12, f, 'none', ' rx="2"') + TX(x + w / 2, y + 8.3, t, { fs: 6.5, c });
const SVG_TIME = SVG('0 0 200 92', 80, '年表の表示例',
  TX(4, 8, '研究室の1年', { fs: 8, a: 'start', b: 1 }) +
  [33, 93, 158].map(x => ED(`M${x} 43V90`, { end: '', dash: '2 2', sw: .7 })).join('') +
  TLB(8, 13, 110, '前期', '#8080ff', '#fff') + TLB(133, 13, 50, '後期', '#ffff80') +
  TLB(8, 31, 50, '4月', '#8080ff', '#fff') + TLB(68, 31, 50, '7月', '#8080ff', '#fff') + TLB(133, 31, 50, '1月', '#ffff80') +
  ED('M4 51H195', { sw: 1.4 }) +
  TLB(8, 57, 50, '配属', '#a6a6ff', '#fff') + TLB(68, 57, 50, '中間発表', '#a6a6ff', '#fff') +
  TLB(133, 57, 50, '卒論提出', '#ffffaa') + TLB(133, 72, 50, '発表会', '#ffffaa'));

const SVG_GIT = SVG('0 0 200 64', 80, 'Git のブランチ図の表示例',
  BOX(2, 10, 28, 12, '#2f2fff', 'none', ' rx="2"') + TX(16, 18.5, 'main', { fs: 6.5, c: '#fff' }) +
  BOX(2, 36, 34, 12, '#d4d400', 'none', ' rx="2"') + TX(19, 44.5, 'feature', { fs: 6.5 }) +
  ED('M30 16H50M36 42H66M162 16H196', { end: '', dash: '1.5 2', sw: .6 }) +
  ED('M56 16Q56 42 76 42H136Q156 42 156 16', { end: '', c: '#d4d400', sw: 3 }) + ED('M50 16H162', { end: '', c: '#2f2fff', sw: 3 }) +
  CIRC(56, 16, 5, '#2f2fff') + CIRC(100, 42, 5, '#d4d400') + `<circle cx="156" cy="16" r="4.5" fill="#fff" stroke="#2f2fff" stroke-width="2.5"/>` +
  TX(59, 24, '初版', { fs: 5.5, a: 'end', rot: -45 }) + TX(103, 50, '機能追加', { fs: 5.5, a: 'end', rot: -45 }) +
  `<path d="M146 2H170V10H146L143 6Z" fill="#ffffde" stroke="#aaaa33" stroke-width=".6"/>` + TX(157, 8.3, 'v1.0', { fs: 5.5 }));

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

/* ---- H Mermaid の基本とフローチャート ---- */
// Mermaid のコード・書き方の欄はすべて mermaid 12.2.0(GitHub と同じ版・同じ設定)で描画できることを確認している。
// KV のキーや EX の左に載せるのも、そのまま書けるコード片にする(「名前」などの穴埋めの言葉を入れない)
C('H', 'Mermaid とは(図をテキストで描く)',
  CC(M`
\`\`\`mermaid
flowchart LR
  A[調べる] --> B[書く] --> C[提出]
\`\`\``),
  OV(SVG_INTRO),
  KV(['```mermaid', 'コードブロックの言語名を ⟦mermaid⟧ にすると、中身が図として描かれる', 'm'],
     ['Preview', 'Issue・PR の ⟪Preview⟫ タブで図を確かめる', 'm'],
     ['mermaid.live', '書きながら図を確かめられる公式のエディタ(ブラウザで使う)'],
     ['VS Code', '拡張機能 ⟦Markdown Preview Mermaid Support⟧ を入れると、⟦⇧⌘V⟧ のプレビューに図が出る'],
     ['info', '⟦```mermaid⟧ の中に ⟦info⟧ とだけ書くと、Mermaid の版が出る', 'p']),
  CD('.md ファイル・Issue・PR・Discussions・wiki で使える。GitHub の Mermaid は ⟦v12.2.0⟧(2026年10月に ⟦info⟧ で確認)'),
  CW('ツールごとに Mermaid の版が違い、mermaid.live や VS Code で描けても GitHub で描けないことがある。⟪最後は GitHub で確認⟫')),

C('H', 'どの図を使うか(図の種類)',
  TB(['1行目に書く', '図(使いどころ)'], [
    ['⟦flowchart⟧', '⟪フローチャート⟫(処理の流れ)'],
    ['⟦sequenceDiagram⟧', '⟪シーケンス図⟫(やり取りの順番)'],
    ['⟦classDiagram⟧', 'クラス図(オブジェクト指向)'],
    ['⟦stateDiagram-v2⟧', '状態遷移図(状態の切り替わり)'],
    ['⟦erDiagram⟧', 'ER 図(データベースの設計)'],
    ['⟦gantt⟧', 'ガントチャート(日程表)'],
    ['⟦pie⟧ ⟦xychart⟧', '円グラフ / 棒・折れ線グラフ'],
    ['⟦mindmap⟧', 'マインドマップ(構成・発想)'],
    ['⟦timeline⟧', '年表(出来事の順番)'],
    ['⟦gitGraph⟧', 'Git のブランチ図'],
  ]),
  CD('1行目の言葉(キーワード)で図の種類が決まる。1つのコードブロックに描ける図は1つ。ほかの図は J の「そのほかの図」'),
  CW('キーワードは大文字・小文字まで正確に。⟦sequencediagram⟧ や ⟦flowchrt⟧ では図にならない')),

C('H', 'Mermaid で図を描く(フローチャート)',
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

C('H', 'ノードの形',
  EX(['A[処理]  B(角丸)', SHP2('rect', '処理', 'round', '角丸'), 'm'],
     ['A{判断}  B{{準備}}', SHP2('diamond', '判断', 'hex', '準備'), 'm'],
     ['A([端子])  B[[定義済み]]', SHP2('stadium', '端子', 'sub', '定義済み')],
     ['A[(DB)]  B((円))', SHP2('cyl', 'DB', 'circle', '円')],
     [M`A[/入出力/]  B[\逆\]`, SHP2('para', '入出力', 'paraR', '逆')],
     [M`A[/台形\]  B[\逆台形/]`, SHP2('trap', '台形', 'trapR', '逆台形'), 'p'],
     ['A>旗]  B(((円)))', SHP2('flag', '旗', 'dcircle', '円'), 'p'],
     ['A@{ shape: doc, label: "書類" }', SHP2('doc', '書類'), 'p']),
  CD('⟦A⟧ が ID(矢印でつなぐときの名前)、括弧の中が表示する文字。2回目からは ⟦A⟧ とだけ書けばよい'),
  KV(['shape: の値', '⟦doc⟧ 書類・⟦docs⟧ 複数の書類・⟦cyl⟧ DB・⟦sl-rect⟧ 手入力・⟦delay⟧ 待ち など50種以上(v11.3.0 からの書き方)', 'p']),
  CW('形の記号は半角で書く。全角の ⟦［ ］⟧ ⟦（ ）⟧ で囲むとエラー(⟦Lexical error⟧)。ラベルの中の全角はそのままでよい')),

C('H', '矢印(線)の種類',
  EX(['A --> B', LNI(), 'm'],
     ['A --- B', LNI({ end: '' })],
     ['A -.-> B', LNI({ dash: '2 1.6' })],
     ['A ==> B', LNI({ sw: 2.2, end: 'a2' })],
     ['A --o B', LNI({ end: 'c' })],
     ['A --x B', LNI({ end: 'x' })],
     ['A <--> B', LNI({ start: 'a' })],
     ['A -->|Yes| B', LNI({}, 'Yes'), 'm'],
     ['A -- Yes --> B', LNI({}, 'Yes')],
     ['A ~~~ B', '<span class="dim">線は描かれない(並び方の調整用)</span>', 'p'],
     ['A ---> B', '<span class="dim">- を増やすと1段ぶん長くなる</span>', 'p']),
  KV(['A --> B --> C', '続けて書ける'],
     ['A & B --> C', '⟦&⟧ でまとめてつなぐ(⟦A --> C⟧ と ⟦B --> C⟧)']),
  CW('⟦dev---ops⟧ は「先が丸の線」で ⟦ps⟧ につながる。⟦o⟧ ⟦x⟧ で始まる ID の前には空白を入れる(⟦dev --- ops⟧)')),

C('H', '向きとサブグラフ(まとめる枠)',
  CC(M`
\`\`\`mermaid
flowchart LR
  subgraph 入力
    A[キー入力] --> B[検査]
  end
  subgraph 出力
    C[計算] --> D[表示]
  end
  B --> C
\`\`\``),
  OV(SVG_SUB),
  KV(['TD  TB  LR', '上→下(⟦TD⟧ と ⟦TB⟧ は同じ)/ 左→右', 'm'],
     ['BT  RL', '下→上 / 右→左'],
     ['subgraph S1 [入力と検査]', 'ID と表示する題名を分ける(題名に空白を使うとき)'],
     ['入力 --> 出力', '枠そのものにも矢印をつなげる'],
     ['direction TB', '枠の中だけ向きを変える。枠の外とつながる矢印があると効かない', 'p']),
  CW('枠は ⟦end⟧ で閉じる。閉じ忘れるとエラー(⟦Parse error⟧)')),

C('H', '文字(ラベル)の書き方',
  EX(['A["f(x) を計算"]', MN('f(x) を計算'), 'm'],
     ['A["1行目<br>2行目"]', MN('1行目<br>2行目')],
     ['A[関数（引数）]', MN('関数（引数）')],
     ['開始 --> 終了', `${MN('開始')} → ${MN('終了')}`],
     ['A["`**太字**で強調`"]', MN('<b>太字</b>で強調'), 'p'],
     ['A["#quot;引用#quot;"]', MN('"引用"'), 'p']),
  CW('半角の ⟦( ) [ ] { }⟧ を含む文字は ⟦"…"⟧ で囲む。⟦A[f(x)]⟧ ⟦A[a[0]]⟧ ⟦A[{1,2}]⟧ はどれもエラー。全角の ⟦（ ）⟧ は囲まなくてよい'),
  CW('ID に小文字の ⟦end⟧ は使えない(⟦End⟧ や ⟦A[end]⟧ ならよい)'),
  CD('日本語は ID にもラベルにもそのまま使える。⟦"⟧ そのものは ⟦#quot;⟧、⟦#⟧ は ⟦#35;⟧ のように ⟦#⟧ と ⟦;⟧ で挟んで書く')),

C('H', '色と線のスタイル',
  CC(M`
\`\`\`mermaid
flowchart LR
  A[入力] --> B[処理]:::warn
  B --> C[出力]
  classDef warn fill:#fe9,stroke:#c90
  style C fill:#fcc,stroke:#c00
  linkStyle 1 stroke:red
\`\`\``),
  OV(SVG_STYLE),
  KV(['classDef warn fill:#fe9', 'スタイルに名前(⟦warn⟧)を付ける', 'm'],
     ['B:::warn', 'ノードに名前を付けたスタイルを当てる(⟦class A,B warn⟧ でも同じ)', 'm'],
     ['style C fill:#fcc', 'そのノードだけ直接指定する'],
     ['linkStyle 1 stroke:red', '矢印は書いた順の番号(⟦0⟧ から)で指定。⟦default⟧ で全部']),
  CD('指定は ⟦,⟧ で区切って続ける。⟦fill⟧ 塗り・⟦stroke⟧ 枠線・⟦stroke-width⟧ 太さ・⟦color⟧ 文字の色・⟦stroke-dasharray:5 5⟧ 点線'),
  CW('白黒で印刷すると色の違いは消える。色だけでなく、形や文字でも区別する')),

C('H', '例: プログラムの処理の流れ',
  CC(M`
\`\`\`mermaid
flowchart TD
  S([開始]) --> In[/n を入力/]
  In --> Init[i = 1, sum = 0]
  Init --> C{i が n 以下?}
  C -->|Yes| Add[sum += i<br>i++]
  Add --> C
  C -->|No| Out[/sum を表示/]
  Out --> E([終了])
\`\`\``),
  OV(SVG_LOOP),
  CD('1 から n までの和を求める繰り返し。⟪端子⟫ ⟦([ ])⟧・⟪入出力⟫ ⟦[/ /]⟧・⟪処理⟫ ⟦[ ]⟧・⟪判断⟫ ⟦{ }⟧ を使い分けると、授業で習うフローチャートの記号に近くなる')),

C('H', '例: システムの構成図',
  CC(M`
\`\`\`mermaid
flowchart LR
  U((利用者)) --> B[ブラウザ]
  B -- HTTP --> S[サーバ<br>Express]
  S -- SQL --> D[(データベース)]
  S -.-> L[/ログ/]
\`\`\``),
  OV(SVG_SYS),
  CD('⟦LR⟧ で横に並べるとページの幅に収まりやすい。人は ⟦(( ))⟧、DB は ⟦[( )]⟧、ファイルは ⟦[/ /]⟧ のように⟪形で役割を分ける⟫と読みやすい')),

C('H', '設定・テーマ・コメント(どの図でも共通)',
  CC(M`
\`\`\`mermaid
---
title: 処理の流れ
config:
  theme: neutral
  look: classic
---
flowchart LR
  %% この行は図に出ない
  A --> B
\`\`\``),
  KV(['%% メモ', 'コメント(図に出ない)。1行まるごと', 'm'],
     ['title: 処理の流れ', '図の上に題名を出す'],
     ['theme: neutral', '配色。⟦default⟧ ⟦neutral⟧(白黒印刷向き)⟦dark⟧ ⟦forest⟧ ⟦base⟧', 'm'],
     ['look: classic', '見た目。⟦classic⟧(以前の見た目)⟦neo⟧ ⟦handDrawn⟧(手書き風)'],
     ['%%{init: {"theme": "dark"}}%%', '以前の設定の書き方(v10.5.0 から非推奨)。今は ⟦---⟧ の中に書く', 'p']),
  CW('⟦---⟧ の設定はコードブロックの⟪1行目⟫から書く。前に空行やコメントがあるとエラー'),
  CD('v12 から flowchart などの見た目が変わった(影・角の丸い線)。古い記事と見た目が違うときは ⟦look: classic⟧')),

/* ---- I Mermaid の設計図(シーケンス図・クラス図・状態遷移図) ---- */
C('I', 'シーケンス図の基本',
  CC(M`
\`\`\`mermaid
sequenceDiagram
  ブラウザ->>サーバ: GET /
  サーバ-->>ブラウザ: 200 OK
\`\`\``),
  OV(SVG_SEQ),
  KV(['sequenceDiagram', 'シーケンス図(やり取りの順番)', 'm'],
     ['->>  -->>', '実線の矢印 / 点線の矢印(返事)'],
     ['A->>B: こんにちは', '⟦:⟧ の後がメッセージ。参加者は出てきた順に左から並ぶ', 'm'],
     ['participant B as ブラウザ', '並ぶ順を先に決める。⟦as⟧ の後が表示名(ID は短くてよい)'],
     ['actor U as 利用者', '人の形で描く']),
  CW('メッセージに半角の ⟦;⟧ を書くと、そこで行が切れてエラーになる。⟦#59;⟧ と書くか全角の ⟦；⟧ を使う')),

C('I', 'メッセージの矢印と処理中の帯',
  EX(['A->>B: 依頼', `${LNI()} 実線`, 'm'],
     ['A-->>B: 返事', `${LNI({ dash: '3 2' })} 点線`, 'm'],
     ['A->B: 合図', `${LNI({ end: '' })} 先なし`],
     ['A-->B: 合図', `${LNI({ end: '', dash: '3 2' })} 点線`],
     ['A-xB: 失敗', `${LNI({ end: 'x' })} ×`],
     ['A-)B: 通知', `${LNI({ end: 'o' })} 非同期`],
     ['A<<->>B: 同期', `${LNI({ start: 'a' })} 両向き`, 'p']),
  KV(['A->>+B: 依頼', '⟦+⟧ で B に⟪処理中の帯⟫を出す。返す矢印に ⟦-⟧ を付けて消す(⟦B-->>-A: 返事⟧)', 'm'],
     ['activate B', '帯を出す(⟦deactivate B⟧ で消す)。上の ⟦+⟧ ⟦-⟧ と同じ', 'p'],
     ['autonumber', '矢印に 1, 2, 3… と番号を振る'],
     ['Note right of A: メモ', 'メモ。⟦left of⟧ で左、⟦over A,B⟧ で2人にまたがる。⟦<br>⟧ で改行']),
  CW('帯を出していない相手に ⟦-⟧ を使うとエラー(⟦Trying to inactivate an inactive participant⟧)')),

C('I', 'ループと条件分岐(ブロック)',
  CC(M`
\`\`\`mermaid
sequenceDiagram
  participant U as 利用者
  participant S as サーバ
  U->>S: ログイン
  alt パスワードが正しい
    S-->>U: マイページ
  else 間違い
    S-->>U: エラー
  end
  loop 30秒ごと
    U->>S: 新着を確認
  end
\`\`\``),
  OV(SVG_ALT),
  KV(['loop 30秒ごと', '繰り返し', 'm'],
     ['alt 正しい', '条件分岐(if)。⟦else 間違い⟧ で別の場合を続ける', 'm'],
     ['opt 希望者だけ', '条件を満たすときだけ(else の無い if)'],
     ['par 同時に送信', '同時に進む処理。⟦and⟧ で区切る'],
     ['break 入力エラー', 'そこで流れを打ち切る(例外)', 'p'],
     ['rect rgb(240,240,255)', '背景に色を付けて範囲を示す', 'p']),
  CD('どのブロックも ⟦end⟧ で閉じる。入れ子にもできる。ほかに ⟦critical⟧(必ず行う処理)、⟦box⟧(参加者を枠でまとめる)'),
  CW('メッセージの中の ⟦end⟧ は問題ないが、参加者の名前に小文字の ⟦end⟧ は使えない')),

C('I', 'シーケンス図の参加者の種類と枠',
  CC(M`
\`\`\`mermaid
sequenceDiagram
  actor U as 学生
  box 学内のシステム
    participant S as サーバ
    participant D as DB
  end
  U->>S: 成績を見る
  S->>D: 検索
\`\`\``),
  OV(SVG_SEQBOX),
  KV(['participant D@{ "type": "database" }', 'DB を円柱の形で描く。ほかに ⟦boundary⟧ ⟦control⟧ ⟦entity⟧ ⟦collections⟧ ⟦queue⟧', 'm'],
     ['box 学内のシステム', '参加者を枠でまとめる。⟦end⟧ で閉じる'],
     ['box rgb(230,240,255) 学内', '枠に色を付ける。⟦#ff0000⟧ の形は使えない', 'p'])),

C('I', '例: Web アプリのログイン',
  CC(M`
\`\`\`mermaid
sequenceDiagram
  autonumber
  actor U as 利用者
  participant B as ブラウザ
  participant S as サーバ
  participant D as DB
  U->>B: ログイン
  B->>+S: POST /login
  S->>+D: 検索
  D-->>-S: 結果
  S-->>-B: 302 /home
  Note over B,S: Cookie を発行
\`\`\``),
  OV(SVG_LOGIN),
  CD('⟦+⟧ ⟦-⟧ の帯で、サーバや DB が処理している間が分かる。ID(⟦B⟧ ⟦S⟧)は短くする')),

C('I', 'クラス図の基本(クラスとメンバー)',
  CC(M`
\`\`\`mermaid
classDiagram
  class Animal {
    <<abstract>>
    -String name
    #int age
    +getName() String
    +speak()* void
    +count()$ int
  }
\`\`\``),
  OV(SVG_CLASS),
  KV(['+name  -name  #name  ~name', 'public / private / protected / package', 'm'],
     ['+getName() String', '⟦( )⟧ があればメソッド、無ければ属性。戻り値の型は ⟦)⟧ の後に空白を空けて'],
     ['+speak()*  +count()$', '抽象メソッド(斜体) / static(下線)'],
     ['<<interface>>', '注釈。⟦<<abstract>>⟧ ⟦<<enumeration>>⟧ なども'],
     ['+List~int~ items', '総称型(ジェネリクス)は ⟦~⟧ で囲む'],
     ['Animal : +int age', '⟦{ }⟧ を使わず、1行ずつ足す書き方', 'p']),
  CW('⟦List<int>⟧ と書くと、エラーにならずに ⟦<int>⟧ が消える。⟦List~int~⟧ と書く')),

C('I', 'クラス図の関係と多重度',
  EX(['A <|-- B', `${CLI('M41 5H10', { end: 't' })} 継承`, 'm'],
     ['A *-- B', `${CLI('M41 5H10', { end: 'd' })} 合成`],
     ['A o-- B', `${CLI('M41 5H10', { end: 'dh' })} 集約`],
     ['A --> B', `${CLI('M9 5H40')} 関連`, 'm'],
     ['A ..> B', `${CLI('M9 5H40', { end: 'o', dash: '2 1.5' })} 依存`],
     ['A ..|> B', `${CLI('M9 5H40', { end: 't', dash: '2 1.5' })} 実現`],
     ['A -- B  A .. B', `${CLI('M9 5H41', { end: '' })} 線(.. は点線)`]),
  CC(M`
\`\`\`mermaid
classDiagram
  Animal <|-- Dog
  Animal <|-- Cat
  Owner "1" --> "0..*" Dog : 飼う
\`\`\``),
  OV(SVG_CLREL),
  KV(['Owner "1" --> "0..*" Dog', '多重度。⟦1⟧ ⟦0..1⟧ ⟦1..*⟧ ⟦*⟧ などを ⟦"…"⟧ で矢印の前後に', 'm'],
     ['Owner --> Dog : 飼う', '関係に名前を付ける'],
     ['note for Dog "犬のクラス"', 'クラスにメモを付ける(⟦direction LR⟧ で横に並べる)', 'p']),
  CD('合成は部分が全体と一緒に消える関係(家と部屋)、集約は部分だけでも残る関係(大学と学生)'),
  CW('⟦A <|-- B⟧ は「⟪B が A を継承⟫」。三角は⟪親の側⟫に付く(⟦B --|> A⟧ と書いても同じ)')),

C('I', '例: インターフェースと実装',
  CC(M`
\`\`\`mermaid
classDiagram
  class Shape {
    <<interface>>
    +area() double
  }
  class Circle {
    -double r
    +area() double
  }
  Shape <|.. Circle
  Shape <|.. Rect
\`\`\``),
  OV(SVG_IFACE),
  CD('Java の ⟦interface⟧ と ⟦implements⟧ にあたる。実装は⟪点線と白い三角⟫(⟦<|..⟧)、継承は⟪実線と白い三角⟫(⟦<|--⟧)')),

C('I', '状態遷移図の基本',
  CC(M`
\`\`\`mermaid
stateDiagram-v2
  [*] --> 待機
  待機 --> 実行中 : 開始
  実行中 --> 一時停止 : 停止
  一時停止 --> 実行中 : 再開
  実行中 --> [*] : 完了
\`\`\``),
  OV(SVG_STATE),
  KV(['[*] --> 待機', '⟦[*]⟧ から出る矢印が開始、⟦[*]⟧ へ入る矢印が終了', 'm'],
     ['待機 --> 実行中 : 開始', '遷移と、そのきっかけ', 'm'],
     ['state "電源 オフ" as off', '空白や記号を含む状態は、ID と説明を分ける'],
     ['off : 電源 オフ', '上と同じ(ID の後に ⟦:⟧ で説明)', 'p'])),

C('I', '状態遷移図の複合状態と分岐',
  CC(M`
\`\`\`mermaid
stateDiagram-v2
  direction LR
  state 判定 <<choice>>
  [*] --> 入力待ち
  入力待ち --> 判定 : 投入
  判定 --> 販売 : 金額が足りる
  判定 --> 入力待ち : 足りない
  state 販売 {
    [*] --> 商品を出す
    商品を出す --> おつりを出す
    おつりを出す --> [*]
  }
  販売 --> 入力待ち
\`\`\``),
  OV(SVG_VEND),
  KV(['state 判定 <<choice>>', '分岐点(ひし形)', 'm'],
     ['state f <<fork>>', '並行処理に分かれる点(⟦<<join>>⟧ で合流)'],
     ['direction LR', '左→右に並べる(縦に長い図を横にする)'],
     ['note right of 待機 : メモ', 'メモ(⟦left of⟧ で左)', 'p']),
  CD('⟦state 販売 {⟧ … ⟦}⟧ で状態の中に状態を入れる(複合状態)。中の ⟦[*]⟧ はその中だけの開始・終了。中を ⟦--⟧ の行で区切ると、同時に進む領域になる'),
  CW('⟦<<choice>>⟧ ⟦<<fork>>⟧ は、その状態を矢印で使うより⟪前に⟫宣言する。後に書くと普通の四角になる'),
  CW('別々の複合状態の中にある状態どうしは、直接つなげない。複合状態そのものにつなぐ')),

/* ---- J Mermaid のそのほかの図・設定・エラー ---- */
C('J', 'ER 図(テーブルの設計)',
  CC(M`
\`\`\`mermaid
erDiagram
  学生 ||--o{ 履修 : する
  科目 ||--o{ 履修 : される
  学生 {
    int 学籍番号 PK
    string 氏名
  }
  履修 {
    int 学籍番号 FK
  }
\`\`\``),
  OV(SVG_ER),
  KV(['学生 ||--o{ 履修 : する', '関係(つながり)。記号の意味は次のカード', 'm'],
     ['int 学籍番号 PK', '属性(型と名前)。⟦PK⟧ 主キー・⟦FK⟧ 外部キー・⟦UK⟧ 一意', 'm'],
     ['string 氏名 "フルネーム"', '属性に説明を付ける', 'p'],
     ['学生 ||..o{ 履修 : する', '⟦--⟧ を ⟦..⟧ にすると点線(非識別関係)', 'p']),
  CD('空白を含むエンティティの名前は ⟦"学生 情報"⟧ のように ⟦"…"⟧ で囲む'),
  CW('関係の後の ⟦: する⟧ は省略できない(省くとエラー)。名前が要らないときは ⟦: ""⟧ と書く')),

C('J', 'ER 図の多重度(いちばん間違えやすい)',
  TB(['左に書く', '右に書く', 'その側が何個か'], [
    ['⟦|o⟧', '⟦o|⟧', '0 か 1'],
    ['⟦||⟧', '⟦||⟧', '⟪ちょうど 1⟫'],
    ['⟦}o⟧', '⟦o{⟧', '⟪0 以上⟫(いくつでも)'],
    ['⟦}|⟧', '⟦|{⟧', '1 以上'],
  ]),
  EX(['A ||--|| B : 持つ', `${ERI('one', 'one')} 1対1`],
     ['A ||--o{ B : 持つ', `${ERI('one', 'many0')} 1対多`, 'm'],
     ['A ||--|{ B : 持つ', `${ERI('one', 'many1')} 1対1以上`],
     ['A }o--o{ B : 持つ', `${ERI('many0', 'many0')} 多対多`]),
  CD('記号は⟪その記号の側のエンティティが、相手1つに対して何個か⟫を表す。⟦学生 ||--o{ 履修⟧ は「学生1人に履修が0件以上」「履修1件に学生がちょうど1人」'),
  CW('⟦o⟧ は線(⟦--⟧)の側、⟦{⟧ ⟦}⟧ はエンティティの側に来るので、左右で鏡写しになる。⟦o<⟧ ⟦>o⟧ という記号は無い(エラー)'),
  KV(['A 1 to 0+ B : 持つ', '記号の代わりに言葉でも書ける(⟦only one⟧ ⟦zero or more⟧ など)', 'p'])),

C('J', '円グラフ',
  CC(M`
\`\`\`mermaid
pie title 使っている言語
  "C" : 40
  "Python" : 35
  "JavaScript" : 25
\`\`\``),
  OV(SVG_PIE),
  KV(['"Python" : 35', '名前と値。割合(%)は自動で計算される。名前は ⟦"…"⟧ で囲む', 'm'],
     ['pie showData', '凡例に元の値も出す'],
     ['title 使っている言語', '題名。⟦pie⟧ と同じ行か次の行に書く']),
  CW('値に負の数を書くとエラー。書いた順に、上から時計回りに並ぶ')),

C('J', '棒グラフ・折れ線グラフ(xychart)',
  CC(M`
\`\`\`mermaid
xychart
  title "月別の平均気温"
  x-axis ["1月", "2月", "3月", "4月"]
  y-axis "気温(℃)" 0 --> 20
  bar [5, 6, 9, 14]
  line [5, 6, 9, 14]
\`\`\``),
  OV(SVG_XY),
  KV(['x-axis ["1月", "2月"]', '横軸の項目', 'm'],
     ['y-axis "気温(℃)" 0 --> 20', '縦軸の名前と範囲(範囲を省くと自動)'],
     ['bar [5, 6]  line [5, 6]', '棒 / 折れ線。重ねて描ける', 'm'],
     ['xychart horizontal', '横向きのグラフ', 'p']),
  CW('日本語の項目は ⟦"1月"⟧ のように ⟦"…"⟧ で囲む(囲まないとエラー)'),
  CD('以前の書き方 ⟦xychart-beta⟧ も、そのまま使える')),

C('J', '4象限の図(quadrantChart)',
  CC(M`
\`\`\`mermaid
quadrantChart
  title 課題の優先度
  x-axis 急ぎでない --> 急ぎ
  y-axis 重要でない --> 重要
  quadrant-1 すぐやる
  quadrant-2 計画する
  quadrant-3 後回し
  quadrant-4 人に頼む
  レポート: [0.8, 0.7]
  サークル: [0.3, 0.3]
\`\`\``),
  OV(SVG_QUAD),
  KV(['x-axis 急ぎでない --> 急ぎ', '横軸の左端と右端の名前(⟦y-axis⟧ は下端と上端)', 'm'],
     ['quadrant-1 すぐやる', '右上の名前。⟦2⟧ 左上・⟦3⟧ 左下・⟦4⟧ 右下'],
     ['レポート: [0.8, 0.7]', '点。横・縦の位置を 0〜1 で'])),

C('J', 'ガントチャート(日程表)',
  CC(M`
\`\`\`mermaid
gantt
  title 卒業研究の計画
  dateFormat YYYY-MM-DD
  axisFormat %m/%d
  section 準備
    文献調査 :done, a1, 2026-10-01, 7d
    実験 :active, a2, after a1, 14d
  section まとめ
    卒論執筆 :crit, a3, after a2, 10d
    発表 :milestone, after a3, 0d
\`\`\``),
  OV(SVG_GANTT),
  KV(['実験 :a2, 2026-10-08, 14d', 'タスク1行。⟦:⟧ の後に ID・開始日・期間(ID は省略できる)', 'm'],
     ['実験 :a2, after a1, 14d', '⟦a1⟧ が終わってから始める(依存)', 'm'],
     ['3d  2w  1M  4h', '期間。日 / 週 / 月 / 時間'],
     ['done  active  crit', '完了(灰)/ 作業中 / 重要(赤)。⟦:⟧ のすぐ後に書く'],
     ['milestone', '締め切りなどの印(ひし形)。期間は ⟦0d⟧'],
     ['excludes weekends', '土日を期間に数えない', 'p']),
  CW('⟦dateFormat⟧(書くときの日付の形)と ⟦axisFormat⟧(目盛りの形)は書き方が違う。⟦YYYY-MM-DD⟧ と ⟦%Y-%m-%d⟧'),
  CW('タスク名に ⟦:⟧ を入れると、そこで名前が切れる'),
  CD('描いた日の位置に赤い縦線が出る')),

C('J', 'マインドマップ(レポートの構成)',
  CC(M`
\`\`\`mermaid
mindmap
  root((レポート))
    序論
      背景
      目的
    本論
      方法
      結果
    結論
\`\`\``),
  OV(SVG_MIND),
  KV(['字下げ', '⟪字下げの深さ⟫で親子が決まる', 'm'],
     ['A[四角]  B(角丸)  C((円))', '形は flowchart と同じ書き方'],
     ['D{{六角形}}  E)雲(  F))爆発((', 'ほかの形', 'p']),
  CW('いちばん上(根)は1つだけ。根と同じ深さに2つ目を書くとエラー(⟦There can be only one root⟧)')),

C('J', '年表(timeline)',
  CC(M`
\`\`\`mermaid
timeline
  title 研究室の1年
  section 前期
    4月 : 配属
    7月 : 中間発表
  section 後期
    1月 : 卒論提出 : 発表会
\`\`\``),
  OV(SVG_TIME),
  KV(['4月 : 配属', '時期と出来事。書いた順に左から並ぶ(時期は数字でなくてよい)', 'm'],
     ['1月 : 卒論提出 : 発表会', '同じ時期に出来事を複数(縦に並ぶ)'],
     ['section 前期', '時期をまとめて色分けする'])),

C('J', 'Git のブランチ図(gitGraph)',
  CC(M`
\`\`\`mermaid
gitGraph
  commit id: "初版"
  branch feature
  commit id: "機能追加"
  checkout main
  merge feature tag: "v1.0"
\`\`\``),
  OV(SVG_GIT),
  KV(['commit id: "初版"', 'コミット。⟦tag: "v1.0"⟧ も付けられる', 'm'],
     ['branch feature', 'ブランチを作って、そこへ切り替える', 'm'],
     ['checkout main', 'ブランチを切り替える(⟦switch main⟧ でも同じ)'],
     ['merge feature', '今いるブランチに取り込む'],
     ['cherry-pick id: "機能追加"', 'ほかのブランチのコミットを1つ持ってくる', 'p']),
  CW('最初のブランチは ⟦main⟧。作っていないブランチへの ⟦checkout⟧ ⟦merge⟧ や、自分自身への ⟦merge⟧ はエラー')),

C('J', 'そのほかの図(beta を含む)',
  TB(['1行目に書く', '図', ''], [
    ['⟦journey⟧', 'ユーザージャーニー', ''],
    ['⟦quadrantChart⟧', '4象限の図(重要度×緊急度など)', ''],
    ['⟦requirementDiagram⟧', '要求図', ''],
    ['⟦block⟧', 'ブロック図', ''],
    ['⟦packet⟧', 'パケットのビット配置', ''],
    ['⟦kanban⟧', 'かんばん(作業の進み具合)', ''],
    ['⟦sankey⟧', 'サンキー図(量の流れ)', '実験的'],
    ['⟦C4Context⟧', 'C4 モデルの構成図', '実験的'],
    ['⟦treemap-beta⟧', 'ツリーマップ', '⟪beta⟫'],
    ['⟦architecture-beta⟧', 'システムの構成図', '⟪beta⟫'],
    ['⟦radar-beta⟧', 'レーダーチャート', '⟪beta⟫'],
    ['⟦venn-beta⟧', 'ベン図', '⟪beta⟫'],
    ['⟦ishikawa-beta⟧', '特性要因図(魚の骨)', '⟪beta⟫'],
    ['⟦treeView-beta⟧', 'フォルダの構成', '⟪beta⟫'],
    ['⟦usecase-beta⟧', 'ユースケース図(v12 から)', '⟪beta⟫'],
  ]),
  CD('どれも 2026年10月の GitHub で描けることを確認済み。⟦-beta⟧ や「実験的」の付いた図は、版が上がると書き方が変わることがあるので、提出物には定番の図を使うほうが安全'),
  CW('⟦zenuml⟧(別方式のシーケンス図)は GitHub では描けない(⟦No diagram type detected⟧)')),

C('J', 'Mermaid を書くときのコツ',
  KV(['少しずつ', '2〜3行書いたら mermaid.live で描いてみて、少しずつ足す。まとめて書くとエラーの場所が分からない', 'm'],
     ['ID は短く', 'ID は ⟦A⟧ ⟦S1⟧ のように短く、表示する文字はラベルに書く(⟦A[開始]⟧)。長い ID は書き間違えやすい', 'm'],
     ['1行に1本', 'つながりは1行に1本ずつ。図が大きくなったら ⟦subgraph⟧ で分けるか、図を2つに分ける'],
     ['画像にする', 'mermaid.live の ⟪Actions⟫ から PNG・SVG で保存できる(Word のレポートに貼るとき)'],
     ['最後に GitHub', 'Issue・PR の Preview か、push した .md の表示で確かめる。GitHub の図は右下のボタンで拡大・移動できる']),
  CW('図の中の文字は検索・コピーできないことがある。大事な情報は本文にも書く')),

C('J', 'Mermaid のよくあるエラー(図が出ない)',
  ER(['A[f(x)] --> B', 'ラベルに半角の ⟦( )⟧ ⟦[ ]⟧ ⟦{ }⟧ → ⟦A["f(x)"]⟧ と ⟦"…"⟧ で囲む'],
     ['A --> end', '小文字の ⟦end⟧ は ID にできない → ⟦End⟧ か ⟦A[end]⟧'],
     ['A －－＞ B', '全角の記号は矢印にならない(⟦Lexical error⟧)→ 半角の ⟦-->⟧'],
     ['flowchrt TD', 'キーワードのつづり違い → ⟦No diagram type detected⟧'],
     ['A->>B: 了解; 送信', 'シーケンス図の ⟦;⟧ は行の区切り → ⟦#59;⟧ か全角の ⟦；⟧'],
     ['学生 ||--o{ 履修', 'ER 図の関係に名前が無い → ⟦: する⟧ を付ける'],
     ['subgraph 入力\n  A --> B', '⟦end⟧ の閉じ忘れ → ⟦Parse error⟧'],
     ['mindmap\n  レポート\n  まとめ', '根が2つある → 字下げを直す']),
  CD('エラーのときは図の代わりにメッセージが出る。⟦Parse error on line 2⟧ の行番号は、⟦```mermaid⟧ の次の行を1行目として数える'),
  CD('mermaid.live に貼ると、エラーの場所を見ながら直せる')),

C('J', 'Mermaid のよくある失敗(図は出るが違う)',
  ER(['dev---ops', '⟦o⟧ が「先が丸」の記号になり ⟦ps⟧ につながる → ⟦dev --- ops⟧'],
     ['+List<int> items', '⟦<int>⟧ が消える → ⟦+List~int~ items⟧'],
     ['作業: 準備 :a1, 2026-10-01, 3d', 'ガントのタスク名が ⟦作業⟧ で切れる → 名前に ⟦:⟧ を使わない'],
     ['Dog <|-- Animal', '三角は親の側 → 親が Animal なら ⟦Animal <|-- Dog⟧'],
     ['Animal <|-- dog', 'クラス名の大文字・小文字は別物 → ⟦Dog⟧ と ⟦dog⟧ が別のクラスになる'],
     ['履修 ||--o{ 学生 : する', '記号の左右が逆 → 学生1人に履修が多いなら ⟦学生 ||--o{ 履修⟧'])),

];

/* ================= カードの見出しアイコン ================= */
const ICON = {
  'Markdown とは': '📝', '見出し': '🔠', '文字飾り': '✏️', '改行と段落(いちばんの罠)': '↩️',
  'エスケープ(記号をそのまま出す)': '🛡️',
  '箇条書き・番号付きリスト': '📋', 'チェックボックス': '☑️', '引用と水平線': '💬', 'コード': '💻',
  'リンク': '🔗', '画像': '🖼️', '表': '📊', '表の中で使える書き方': '🧩',
  '数式の書き方': '🧮', '数式でよく使う記号': '🔢',
  '脚注': '📌', '見出しのアンカーと目次': '🧭', 'アラート(注意書きの枠)': '🚨',
  '折りたたみ(details)': '📂', '絵文字と自動リンク': '😀',
  'HTML を混ぜる(Markdown の逃げ道)': '🧱', 'YAML frontmatter': '📑',
  'よくある失敗(書式が崩れる)': '💥', 'よくある失敗(つながる・出ない)': '🐛',
  'Mermaid とは(図をテキストで描く)': '🧜', 'どの図を使うか(図の種類)': '🗂️',
  'Mermaid で図を描く(フローチャート)': '📈', 'ノードの形': '🔷', '矢印(線)の種類': '➡️',
  '向きとサブグラフ(まとめる枠)': '📦', '文字(ラベル)の書き方': '🔤', '色と線のスタイル': '🎨',
  '例: プログラムの処理の流れ': '🔁',
  'シーケンス図の基本': '🗺️', 'メッセージの矢印と処理中の帯': '📨', 'ループと条件分岐(ブロック)': '🔀',
  '例: Web アプリのログイン': '🔐', 'クラス図の基本(クラスとメンバー)': '🏛️', 'クラス図の関係と多重度': '🧬',
  '状態遷移図の基本': '🚦', '状態遷移図の複合状態と分岐': '🥤',
  'ER 図(テーブルの設計)': '🗄️', 'ER 図の多重度(いちばん間違えやすい)': '🦶', 'ガントチャート(日程表)': '📅',
  '円グラフ': '🥧', '棒グラフ・折れ線グラフ(xychart)': '📉', 'マインドマップ(レポートの構成)': '🧠',
  '年表(timeline)': '⏳', 'Git のブランチ図(gitGraph)': '🌿', 'そのほかの図(beta を含む)': '🧪',
  '設定・テーマ・コメント(どの図でも共通)': '⚙️', 'Mermaid のよくあるエラー(図が出ない)': '🚫',
  'Mermaid のよくある失敗(図は出るが違う)': '🤔',
  '例: システムの構成図': '🖥️', 'シーケンス図の参加者の種類と枠': '👥', '例: インターフェースと実装': '🧩',
  '4象限の図(quadrantChart)': '🎯', 'Mermaid を書くときのコツ': '💡',
};

const cardHtml = c => {
  const ic = ICON[c.title] ? `<i class="ic">${ICON[c.title]}</i>` : '';
  return `<div class="card c${c.cat}"><div class="ct">${ic}${inl(c.title)}</div>${c.body.join('')}</div>`;
};

/* ================= ページ分割 ================= */
// 各ページに載せるカード枚数。合計が CARDS.length と一致していること
const SPLIT = [13, 12, 10, 7, 8, 8];

const TITLE = 'Markdown チートシート';
const SUB = 'GitHub Flavored Markdown(GFM)— README・レポート・Issue を書くときに。左が書き方、右が GitHub での表示';
const SUB_SLIM = 'GitHub Flavored Markdown(GFM)';
const LEGEND = CATS.map(([k, , s]) => `<span class="lg lg${k}"><i></i>${k} ${esc(s)}</span>`).join('') +
  '<span class="lg mk"><b>★</b>まず覚える定番</span>' +
  '<span class="lg ad"><b>Aa</b>グレー文字=上級者向け</span>' +
  '<span class="lg wn"><b>⚠</b>間違えやすい点</span>';

// 各ページの役割
const ROLE = [
  'このページ＝毎回使う基本の書式。左が書き方、右が GitHub での表示',
  'このページ＝GitHub の便利な記法・数式と、文書を整える記法。表示が崩れたら G を見る。H から Mermaid の図',
  'このページ＝Mermaid のフローチャートと、どの図にも共通の設定',
  'このページ＝シーケンス図とクラス図',
  'このページ＝クラス図の例・状態遷移図・ER 図・グラフ',
  'このページ＝ガントチャート・マインドマップなどの図と、Mermaid のエラーの直し方',
];
// 柱の中央。Mermaid のページは図の確認方法を出す
const FOOT_MID = [
  ...Array(2).fill('␣ = 半角スペース ／ 表示の確認: GitHub の Preview タブ・VS Code の ⇧⌘V'),
  ...Array(4).fill('図の確認: GitHub の Preview タブ・mermaid.live(VS Code は拡張機能が必要)'),
];

const total = SPLIT.reduce((a, b) => a + b, 0);
if (total !== CARDS.length) throw new Error(`SPLIT の合計 ${total} がカード数 ${CARDS.length} と合わない`);
if (ROLE.length !== SPLIT.length || FOOT_MID.length !== SPLIT.length) throw new Error('ROLE・FOOT_MID の数がページ数と合わない');
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
<div class="foot"><span>${esc(ROLE[pi])}</span><span>${esc(FOOT_MID[pi])}</span><span>${pi + 1} / ${SPLIT.length}</span></div>
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
  --cH: #b5306b;
  --cI: #3f5f8a;
  --cJ: #6f7d1c;
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
.kv b{flex:0 0 auto;max-width:56%;overflow-wrap:anywhere;white-space:pre-wrap}
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
.md .mi{display:inline-block;vertical-align:middle;font-family:inherit}
.md .mn{display:inline-block;background:#ececff;border:.5pt solid #9370db;border-radius:.5mm;
  padding:0 1.1mm;line-height:1.3;text-align:center}
.defs{position:absolute;width:0;height:0;overflow:hidden}
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
.cH{border-top-color:var(--cH)} .cH>.ct{color:var(--cH);background:color-mix(in srgb,var(--cH) 9%,#fff)} .sH{background:var(--cH)} .lgH i{background:var(--cH)}
.cI{border-top-color:var(--cI)} .cI>.ct{color:var(--cI);background:color-mix(in srgb,var(--cI) 9%,#fff)} .sI{background:var(--cI)} .lgI i{background:var(--cI)}
.cJ{border-top-color:var(--cJ)} .cJ>.ct{color:var(--cJ);background:color-mix(in srgb,var(--cJ) 9%,#fff)} .sJ{background:var(--cJ)} .lgJ i{background:var(--cJ)}

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
<meta name="description" content="見出し・文字飾り・改行・リスト・コード・リンク・画像・表から、数式・脚注・目次・アラート・HTML・frontmatter・よくある失敗、Mermaid のフローチャート・シーケンス図・クラス図・状態遷移図・ER 図・ガントチャートなどの図までを、書き方と GitHub での表示を並べてまとめたA4横${SPLIT.length}ページのチートシート(ライトモード)。">
<style>${css}</style>
</head>
<body>
${MARKERS}
${pages.join('\n')}
</body>
</html>
`;
fs.writeFileSync(OUT, html);
console.log('ok', CARDS.length, 'cards /', SPLIT.length, 'pages /', html.length, 'chars');
