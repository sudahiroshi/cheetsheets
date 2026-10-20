// index.html の1ページ目カードを、列ごとの <div class="col"> に再配置する
const fs = require('fs');
const p = '/Volumes/Ramdisk/cheetsheets/index.html';
let s = fs.readFileSync(p, 'utf8');

const start = s.indexOf('<div class="cols">') + '<div class="cols">'.length;
const re = /<section class="card"[\s\S]*?<\/section>/g;
const region = s.slice(start);
const cards = [];
let m, last = 0;
while ((m = re.exec(region)) && cards.length < 10) {
  cards.push(m[0].replace(/;order:\d+/, ''));
  last = m.index + m[0].length;
}
if (cards.length !== 10) throw new Error('cards=' + cards.length);

// ファイル内の出現順: 0基本 1アプリ 2MC 3スクショ 4Finder 5テキスト 6ブラウザ 7日本語 8起動 9アクセ
const cols = [[0, 3, 8], [1, 2, 9], [4, 7], [5, 6]];
const html = '\n' + cols.map(c =>
  '    <div class="col">\n' + c.map(i => cards[i].replace(/^/gm, '  ').replace(/^ {2}/, '      ')).join('\n\n') + '\n    </div>'
).join('\n') + '\n';

s = s.slice(0, start) + html + s.slice(start + last);

s = s.replace(/  \/\* 4列:[\s\S]*?\.cols \.card\{[^}]*\}/,
  '  /* 4列: 列ごとにカードを明示配置(固定高でも欠けない) */\n' +
  '  .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:2.5mm;height:171mm;align-items:start}\n' +
  '  .col{display:flex;flex-direction:column;min-width:0}\n' +
  '  .col .card:last-child{margin-bottom:0}');
s = s.replace('padding:.75mm 2.2mm;\n       border-top', 'padding:.55mm 2.2mm;\n       border-top');
fs.writeFileSync(p, s);
console.log('ok');
