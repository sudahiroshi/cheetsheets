// C言語チートシート(A4横・5段組)を生成する
// デザインは ~/tex-cheatsheet/tex_cheatsheet.html と同じ流儀
//   .page / .head / .legend / .grid / .sec / .card / .ct / .cc / .cg / .cd / .foot
// C言語の内容に合わせて .kv(キー+説明の行) / .tb(一覧表) / .cw(⚠注意) を追加している
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'c_lang_cheatsheet_light.html');

/* ================= カテゴリ ================= */
const CATS = [
  ['A', '書き方とコンパイル'],
  ['B', '変数・型・入出力'],
  ['C', '演算子と型変換'],
  ['D', '制御構文'],
  ['E', '関数とファイル分割'],
  ['F', '配列と文字列'],
  ['G', 'ポインタとメモリ'],
  ['H', '数の表現・ツール・設計'],
];
const CATNAME = Object.fromEntries(CATS);

/* ================= 部品 ================= */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inl = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

// コード塊。lang='c' は //、'sh' は # をコメント色にする
const CC = (text, lang = 'c') => {
  const lines = text.replace(/^\n/, '').replace(/\n$/, '').split('\n').map(l => {
    const key = lang === 'c' ? l.indexOf('//') : lang === 'sh' ? l.search(/\s#\s/) : -1;
    if (key < 0) return esc(l);
    const cut = lang === 'sh' ? key + 1 : key;
    return esc(l.slice(0, cut)) + '<span class="cm">' + esc(l.slice(cut)) + '</span>';
  });
  return `<div class="cc">${lines.join('\n')}</div>`;
};

// キー+説明の行。flag 'm' で ★(定番)
const KV = (...rows) => '<div class="kv">' + rows.map(([code, desc, flag = '']) =>
  `<div${flag ? ` class="${flag}"` : ''}>${code ? `<b>${esc(code)}</b>` : ''}` +
  `<span>${inl(desc)}</span></div>`).join('') + '</div>';

// 説明文のみ
const CD = t => `<div class="cd">${inl(t)}</div>`;
// ⚠ 間違えやすい点
const CW = t => `<div class="cw">${inl(t)}</div>`;
// チップ列
const CG = (...items) => '<div class="cg">' + items.map(i => `<span>${esc(i)}</span>`).join('') + '</div>';
// 一覧表
const TB = (head, rows) =>
  `<table class="tb"><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>` +
  rows.map(r => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="f"' : ''}>${inl(c)}</td>`).join('')}</tr>`).join('') +
  '</tbody></table>';

// カード1枚
const C = (cat, title, ...body) => ({ cat, title, html:
  `<div class="card c${cat}"><div class="ct">${inl(title)}</div>${body.join('')}</div>` });

/* ================= 収録カード(47枚・掲載順はそのまま) ================= */
const CARDS = [

/* ---- A 書き方とコンパイル ---- */
C('A', 'まず覚える5つ',
  CC(`
gcc -Wall x.c -o x  // コンパイル
./x                 // 実行
printf("%d\\n", n);  // 表示
scanf("%d", &n);    // 入力(& を忘れない)
for (int i=0;i<n;i++) // 繰り返し`),
  CD('迷ったらこの5つ。詳しくは各カードへ')),

C('A', 'プログラムの骨格',
  CC(`
#include <stdio.h>   // 標準入出力

/* 複数行の
   コメント */
int main(void) {
    printf("Hello\\n");  // 1行コメント
    return 0;           // 正常終了
}`),
  KV(['#include', '標準ライブラリを読み込む', 'm'],
     ['main', '実行の入口(プログラムに1つ)', 'm'],
     [';', '文の終わり', 'm'],
     ['{ }', 'ブロックの範囲']),
  CW('`{` と `}` の対応、文末の `;` の付け忘れ')),

C('A', 'コンパイルと実行',
  CC(`
gcc hello.c -o hello   # コンパイル
./hello                # 実行`, 'sh'),
  KV(['-o 名前', '実行ファイル名を指定(省略すると a.out)', 'm'],
     ['-Wall', '警告をすべて表示(常に付ける)', 'm'],
     ['-g', 'デバッグ情報を付ける(lldb 用)'],
     ['-lm', '`math.h` の関数を使うときに付ける'],
     ['-c', '`.o` までで止める(分割コンパイル)'],
     ['-std=c17', '規格を指定(Apple clang の既定は C17)'],
     ['-std=c23', '最新規格(`0b1010` などが警告なしで使える)'],
     ['./', '現在のディレクトリのプログラムを指す']),
  CD('macOS の `gcc` は実体が Apple clang(`gcc --version` で確認)。教科書の GNU gcc とはエラー文面が異なる'),
  CD('`ls` `cd` `pwd` などの基本コマンドと、記号の読み方・入力方法は macOS 版シート参照'),
  CW('`./hello` の `./` を忘れると command not found')),

C('A', 'よくあるエラー・警告',
  KV(["expected ';'", 'セミコロンの付け忘れ'],
     ['undeclared identifier', '変数・関数の宣言忘れ、綴りミス'],
     ['implicit declaration', '`#include` 忘れ、プロトタイプ宣言なし'],
     ['format specifies type', '`printf` の `%d` などと型が不一致'],
     ['unused variable', '使っていない変数(警告)'],
     ['Segmentation fault', '不正なメモリアクセス(配列・ポインタ)'],
     ['command not found', '`./` の付け忘れ、名前の誤り'],
     ['Undefined symbols', 'リンクエラー。実装ファイルの渡し忘れ(`gcc main.c add.c`)'],
     ['Unicode character', '全角スペースが混ざっている(警告)']),
  CW('エラーは「最初の1個」から直す(後ろは連鎖して出る)'),
  CW('原因不明のときは全角を疑う(全角の `；` `（` はエラー、全角スペースは警告)')),

C('A', 'コンパイラとインタープリタ',
  KV(['コンパイラ', '全体を機械語に翻訳してから実行(C 言語・速い)'],
     ['インタープリタ', '1行ずつ解釈しながら実行(Python など)']),
  CC(`
hello.c --gcc--> hello --./hello--> 実行
ソース        実行ファイル`, 'none')),

C('A', '終了コードとデバッグ',
  KV(['return 0', '正常終了(0 以外は異常)'],
     ['echo $?', '直前のコマンドの終了コードを表示'],
     ['printf', '途中の変数の値を表示して確認する'],
     ['lldb ./hello', 'デバッガ起動(`-g` 付きで作成)', 'p'],
     ['b main', 'main にブレークポイント', 'p'],
     ['r', '実行  /  `n` 次の行  /  `c` 続行', 'p'],
     ['p x', '変数 x の値を表示  /  `q` 終了', 'p'])),

/* ---- B 変数・型・入出力 ---- */
C('B', '変数と型',
  TB(['型', '用途', 'printf', 'サイズ'], [
    ['`int`', '整数', '`%d`', '4B'],
    ['`long`', '大きな整数', '`%ld`', '8B'],
    ['`float`', '実数(単精度)', '`%f`', '4B'],
    ['`double`', '実数(倍精度)', '`%f`', '8B'],
    ['`char`', '1文字', '`%c`', '1B'],
  ]),
  CC(`
int a;          // 宣言
int b = 5;      // 宣言 + 初期化
a = b + 1;      // 代入
sizeof(int)     // 型のバイト数`),
  CW('初期化していない変数の値は不定(ゴミ)'),
  CW('変数名は大文字小文字を区別(`Num` と `num` は別物)。数字始まり・予約語は不可')),

C('B', '定数',
  CC(`
#define PI 3.14159   // マクロ(置換・; なし)
const int MAX = 10;  // 型付きの定数`),
  CD('定数名は大文字にするのが慣習')),

C('B', '入力',
  CC(`
int n; double d; char c;
scanf("%d",  &n);    // 整数
scanf("%lf", &d);    // double は %lf
scanf(" %c", &c);    // 空白で改行を読み飛ばす`),
  KV(['&', '変数のアドレス(scanf に必須)', 'm'],
     ['fgets(s,N,stdin)', '1行を文字列で入力'],
     ['getchar()', '1文字入力']),
  CW('`scanf` で `&` を忘れると `-Wall` でコンパイル時に警告(`format specifies type \'int *\'`)。無視して実行すると未定義動作'),
  CW('古い教科書の `gets` は使わない(長さを制限できず危険。deprecated 警告が出る)。`fgets` を使う')),

C('B', 'printf の書式',
  KV(['%d', '整数', 'm'], ['%f', '実数(小数)', 'm'], ['%c', '1文字', 'm'], ['%s', '文字列', 'm'],
     ['%x / %o', '16進数 / 8進数'], ['%e', '指数表記(1.2e+03)', 'p'], ['%ld', 'long'], ['%%', '% 記号そのもの'])),

C('B', '桁揃え',
  KV(['%5d', '5桁・右詰め'], ['%-5d', '5桁・左詰め'], ['%05d', '5桁・0埋め'],
     ['%.2f', '小数点以下2桁'], ['%8.3f', '全体8桁・小数3桁'])),

C('B', 'エスケープ',
  KV(['\\n', '改行', 'm'], ['\\t', 'タブ'], ['\\\\', 'バックスラッシュ'],
     ['\\"', 'ダブルクォート'], ["\\'", 'シングルクォート'], ['\\0', '文字列の終端'],
     ['\\033[31m', '文字を赤に(ANSI)'], ['\\033[0m', '色を元に戻す'],
     ['Option+¥', 'Mac で `\\` を入力'])),

/* ---- C 演算子と型変換 ---- */
C('C', '演算子',
  KV(['+ - * / %', '算術(`%` は剰余)', 'm'],
     ['= += -= *= /=', '代入 / 複合代入'],
     ['++  --', '1増やす / 1減らす'],
     ['== != < > <= >=', '比較', 'm'],
     ['&& || !', 'かつ / または / 否定', 'm'],
     ['? :', '条件演算子 `a ? b : c`', 'p'],
     ['優先順位', '`! ++` → `* / %` → `+ -` → 比較 → `&&` → `||` → `=`']),
  CW('`=` は代入、比較は `==`')),

C('C', '型変換の落とし穴',
  KV(['5 / 2', '→ 2(整数どうしは切り捨て)'],
     ['5 / 2.0', '→ 2.5(片方が実数なら実数)'],
     ['(double)a / b', 'キャスト(型変換)'],
     ['0.1+0.2 == 0.3', '→ 偽(誤差が出る)'],
     ['fabs(x-y) < 1e-9', '実数は差で比較する'])),

C('C', 'math.h(コンパイル時 -lm)',
  KV(['sqrt(x)', '平方根'], ['pow(x, y)', 'x の y 乗'], ['fabs(x)', '実数の絶対値'],
     ['abs(n)', '整数の絶対値(`stdlib.h`)'], ['floor / ceil', '切り捨て / 切り上げ'],
     ['sin cos tan', '三角関数(ラジアン)'])),

/* ---- D 制御構文 ---- */
C('D', '条件分岐',
  CC(`
if (x > 0) {
    ...
} else if (x == 0) {
    ...
} else {
    ...
}
switch (n) {
    case 1: ...; break;
    default: ...;
}`),
  CW('`switch` の `break` 忘れで次の case に落ちる / `if (x = 1)` は代入')),

C('D', '乱数',
  CC(`
#include <stdlib.h>
#include <time.h>
srand(time(NULL));    // 最初に1回だけ
int r = rand() % 3;   // 0〜2`)),

C('D', 'フローチャート',
  KV(['楕円', '開始・終了'], ['四角', '処理'], ['ひし形', '判断(条件分岐)'])),

C('D', '繰り返し',
  CC(`
for (int i = 0; i < 10; i++) { ... }  // 10回
while (cond) { ... }       // 真の間
do { ... } while (cond);   // 最低1回`),
  KV(['break', 'ループを抜ける'],
     ['continue', '次の周回へ'],
     ['for', '回数が決まっているとき', 'm'],
     ['while', '回数が決まっていないとき', 'm'],
     ['do-while', '先に1回実行したいとき']),
  CW('`i <= 10` と `i < 10` の違い / `for(...);` の `;` / 無限ループは Ctrl+C')),

C('D', '二重ループ(三角形)',
  CC(`
for (int i = 1; i <= 5; i++) {
    for (int j = 0; j < i; j++)
        printf("*");
    printf("\\n");
}`),
  KV(['外側', '行(縦)を繰り返す'], ['内側', '列(横)を繰り返す'])),

C('D', '再帰',
  CC(`
int fact(int n) {
    if (n <= 1) return 1;     // 終了条件
    return n * fact(n - 1);
}`),
  CW('終了条件がないと無限に呼び出される')),

/* ---- E 関数とファイル分割 ---- */
C('E', '関数',
  CC(`
int add(int a, int b);        // プロトタイプ宣言

int main(void) {
    printf("%d\\n", add(2, 3));
    return 0;
}
int add(int a, int b) {       // 定義
    return a + b;
}`),
  KV(['void', '戻り値または引数がない'],
     ['値渡し', '引数はコピーされる'],
     ['ローカル変数', '関数の中だけで有効'],
     ['グローバル変数', '関数の外・全体で有効(多用しない)'])),

C('E', 'ファイル分割',
  CC(`
// add.h    int add(int a, int b);
// add.c    #include "add.h" + 定義
// main.c   #include "add.h" + main`),
  CC(`
gcc main.c add.c -o app    # まとめてコンパイル`, 'sh'),
  CC(`
#ifndef ADD_H     // インクルードガード
#define ADD_H
int add(int a, int b);
#endif`),
  KV(['"x.h"', '自作ヘッダは `" "`、標準は `< >`'])),

C('E', 'ヘッダ早見',
  KV(['stdio.h', '`printf` `scanf` `fgets` `fopen`', 'm'],
     ['stdlib.h', '`malloc` `free` `rand` `srand` `abs`'],
     ['string.h', '`strlen` `strcpy` `strcat` `strcmp`'],
     ['math.h', '`sqrt` `pow` `fabs`(`-lm` を付ける)'],
     ['time.h', '`time`(`srand` の種に使う)']),
  CD('`implicit declaration` が出たら `#include` 忘れを疑う')),

/* ---- F 配列と文字列 ---- */
C('F', '配列',
  CC(`
int a[5] = {10, 20, 30, 40, 50};
int b[5] = {0};            // すべて0
a[0] = 1;                  // 添字は0から
int n = sizeof(a) / sizeof(a[0]);  // 要素数
for (int i = 0; i < n; i++)
    printf("%d ", a[i]);`),
  CW('`a[5]` は範囲外(正しくは `a[0]`〜`a[4]`)。エラーにならず危険')),

C('F', '二次元配列',
  CC(`
int m[2][3] = { {1,2,3}, {4,5,6} };
for (int i = 0; i < 2; i++)
    for (int j = 0; j < 3; j++)
        sum += m[i][j];`),
  KV(['合計', '`sum += m[i][j]`'],
     ['最大', '`if (m[i][j] > max) max = m[i][j];`'],
     ['平均', '`(double)sum / (行数 * 列数)`'])),

C('F', '関数への配列の渡し方',
  CC(`
void show(int a[], int n) { ... }
show(a, 5);`),
  KV(['', '先頭アドレスが渡る(コピーされない)'],
     ['', '関数内で変更すると元の配列も変わる'],
     ['', '要素数 `n` は別に渡す'])),

C('F', '文字と文字列',
  CC(`
char c = 'A';           // 文字は ' '
char s[] = "Hello";     // 文字列は " "
// 実体: 'H' 'e' 'l' 'l' 'o' '\\0'`),
  KV(['文字列', '`char` の配列 + 終端 `\\0`', 'm'],
     ["c - '0'", '数字の文字 → 数値'],
     ["'a' - 'A'", '= 32(大文字と小文字の差)'])),

C('F', 'string.h',
  KV(['strlen(s)', '文字数(`\\0` を除く)'],
     ['strcpy(d, s)', 's を d にコピー'],
     ['strcat(d, s)', 's を d の後ろに連結'],
     ['strcmp(a, b)', '比較(同じなら 0)', 'm']),
  CW('文字列は `==` で比較できない(アドレス比較になる)')),

C('F', 'ASCII 早見',
  TB(['文字', '10進', '16進'], [
    ["`'0'`", '48', '0x30'], ["`'A'`", '65', '0x41'], ["`'a'`", '97', '0x61'],
    ["`' '`", '32', '0x20'], ["`'\\n'`", '10', '0x0A'], ["`'\\0'`", '0', '0x00'],
  ])),

/* ---- G ポインタとメモリ ---- */
C('G', 'メモリとポインタ',
  CC(`
int x = 10;
int *p = &x;
*p = 20;               // x は 20 になる
printf("%p\\n", (void*)p);  // アドレスを表示`),
  KV(['&x', 'x のアドレス', 'm'],
     ['int *p', 'int へのポインタ変数', 'm'],
     ['*p', 'p が指す先の値', 'm'],
     ['NULL', '何も指していない印'])),

C('G', 'ポインタと配列',
  KV(['a', '配列名 = 先頭要素のアドレス'],
     ['a[i]', '`*(a + i)` と同じ'],
     ['p + 1', '次の要素(型のサイズ分進む)'],
     ['scanf の &', '変数のアドレスに書き込むため必要'])),

C('G', 'コマンドライン引数',
  CC(`
int main(int argc, char *argv[]) { ... }
// ./app a b → argc=3
// argv[0]="./app" argv[1]="a" argv[2]="b"`)),

C('G', '未定義動作',
  KV(['', '初期化していない変数を使う'],
     ['', '配列の範囲外にアクセスする(`a[10]`)'],
     ['', '解放済みのメモリを使う'],
     ['', '`NULL` を参照する → Segmentation fault'])),

C('G', '動的メモリ',
  CC(`
#include <stdlib.h>
int *a = malloc(n * sizeof(int));
if (a == NULL) { return 1; }  // 確保失敗
a[0] = 1;
free(a);        // 使い終わったら解放
a = NULL;`),
  CW('解放忘れ(メモリリーク)、二重 free、解放後の使用')),

C('G', '構造体',
  CC(`
struct Point { int x; int y; };
struct Point p = {1, 2};
p.x = 5;              // メンバは .
struct Point *q = &p;
q->y = 7;             // ポインタ経由は ->
typedef struct { int x, y; } Pt;`)),

C('G', 'ファイル入出力',
  CC(`
FILE *fp = fopen("a.txt", "r");   // "w" 書込 / "a" 追記
if (fp == NULL) { return 1; }
fscanf(fp, "%d", &n);
fprintf(stdout, "%d\\n", n);
fclose(fp);`)),

/* ---- H 数の表現・ツール・設計 ---- */
C('H', '進数の対応表',
  TB(['10進', '2進', '16進'],
    Array.from({ length: 16 }, (_, i) => [String(i), i.toString(2).padStart(4, '0'), i.toString(16).toUpperCase()]))),

C('H', '進数の書き方と変換',
  KV(['0b1010', '2進数(C23 の機能。既定の C17 では `-pedantic` で警告)'],
     ['012', '8進数(先頭に 0)'],
     ['0x1F', '16進数(先頭に 0x)'],
     ['2→10', '各桁 × 2のn乗 の合計'],
     ['10→2', '2で割った余りを逆順に並べる'],
     ['16⇔2', '16進1桁 = 2進4桁'])),

C('H', '負数と2の補数',
  KV(['補数', 'ビットを反転して +1'],
     ['例 -5', '`00000101` → `11111010` → `11111011`'],
     ['符号', '最上位ビットが 1 なら負'],
     ['引き算', '`a - b` = `a + (-b)` を足し算で計算'],
     ['範囲', 'nビット: -2^(n-1) 〜 2^(n-1)-1']),
  CW('範囲を超えるとオーバーフロー(INT_MAX + 1 は負になる)')),

C('H', '型の範囲(limits.h)',
  TB(['型', '範囲'], [
    ['`char`', '-128 〜 127'], ['`unsigned char`', '0 〜 255'],
    ['`int`', '-2147483648 〜 2147483647'], ['`long long`', '約 ±9.2×10^18'],
  ]),
  CD('`char` の符号は処理系依存。本機(macOS / Apple clang)では signed で -128〜127')),

C('H', 'ビット演算',
  KV(['&  |  ^', 'AND / OR / XOR'], ['~', 'NOT(ビット反転)'],
     ['<<  >>', '左シフト(×2) / 右シフト(÷2)'])),

C('H', 'システム開発の流れ',
  CC(`
要件定義 → 基本設計 → 詳細設計
  → 実装 → テスト → 運用`, 'none'),
  KV(['TDD / CI', 'テストを先に書く / 変更のたびに自動でビルド・テスト'])),

C('H', 'プログラミングの格言',
  KV(['DRY / KISS / YAGNI', '同じことを繰り返し書かない / 単純に保つ / 今いらない機能は作らない'])),

C('H', 'リダイレクトとパイプ',
  CC(`
./app > out.txt     # 出力をファイルへ(上書き)
./app >> out.txt    # 追記
./app < in.txt      # ファイルから入力
./app | grep abc    # 出力を次のコマンドへ
./app 2> err.txt    # エラー出力だけファイルへ`, 'sh')),

C('H', 'ライブラリと make',
  KV(['静的 (.a)', '実行ファイルに組み込む'],
     ['動的 (.dylib)', '実行時に読み込む(Mac)'],
     ['-l名前', 'ライブラリを指定(例 `-lm`)'],
     ['-L dir', 'ライブラリの検索先', 'p'],
     ['-I dir', 'ヘッダの検索先', 'p']),
  CC(`
app: main.o add.o      # Makefile
\tgcc main.o add.o -o app`, 'sh')),

C('H', '仕様書とテスト',
  KV(['関数仕様書', '名前・機能・引数・戻り値・備考'],
     ['テストの観点', '正常値 / 境界値 / 異常値'],
     ['カバレッジ', 'すべての分岐を通ったか']),
  CC(`
#include <assert.h>
assert(add(2, 3) == 5);   // 失敗すると停止`)),
];

/* ================= ページ分割 ================= */
// 各ページに載せるカード枚数。合計が CARDS.length と一致していること
const SPLIT = [13, 16, 18];

const TITLE = 'C言語チートシート';
const SUB = 'macOS / gcc — 授業で扱う文法・コンパイル・ポインタ・メモリ・開発手法';
const LEGEND = CATS.map(([k, n]) => `<span class="lg lg${k}"><i></i>${k} ${esc(n)}</span>`).join('') +
  '<span class="lg mk"><b>★</b>まず覚える定番</span>' +
  '<span class="lg ad"><b>Aa</b>グレー文字=上級者向け</span>' +
  '<span class="lg wn"><b>⚠</b>間違えやすい点</span>';

// 各ページの役割(S-6: 「まず持ち歩く2枚」は macOS 版1ページ目 + 本シート1ページ目)
const ROLE = [
  'このページ＝まず持ち歩く1枚。文法の基本・コンパイル・変数と入出力・演算子(もう1枚は macOS 版の1ページ目)',
  'このページ＝書くときに開く。演算子・制御構文・関数・配列・文字列',
  'このページ＝詰まったときに引く。ポインタとメモリ・数の表現・ツールと開発手法',
];

const total = SPLIT.reduce((a, b) => a + b, 0);
if (total !== CARDS.length) throw new Error(`SPLIT の合計 ${total} がカード数 ${CARDS.length} と合わない`);

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
    body.push(card.html);
  }
  return `<div class="page">
<div class="head${pi > 0 ? ' slim' : ''}"><div class="ttl"><b>${esc(TITLE)}</b><span>${esc(pi > 0 ? 'macOS / gcc' : SUB)}</span></div><div class="legend">${LEGEND}</div></div>
<div class="grid">
${body.join('\n')}
</div>
<div class="foot"><span>${esc(ROLE[pi])}</span><span>コンパイル: gcc -Wall file.c -o app ／ 実行: ./app</span><span>${pi + 1} / ${SPLIT.length}</span></div>
</div>`;
});

/* ================= CSS ================= */
// pt 値は参照デザイン(~/tex-cheatsheet/tex_cheatsheet.html)のまま残し、
// SCALE で一括調整する。C言語版は参照より項目が少ないので少し大きめにして紙面を埋める
const SCALE = Number(process.env.SCALE || 1.13);
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
.cc{font-family:var(--mono);font-size:6.36pt;line-height:1.32;
  white-space:pre-wrap;overflow-wrap:anywhere;
  background:var(--codebg);border-left:.9pt solid #c6c6c6;
  padding:.45mm .8mm;border-radius:.4mm;margin-bottom:.55mm;}
.cc .cm{color:var(--cmt)}
.cg{display:flex;flex-wrap:wrap;gap:.4mm;margin-bottom:.55mm}
.cd{font-size:6.24pt;line-height:1.35;color:var(--sub)}

/* キー＋説明の行(C言語版で追加) */
.kv{margin-bottom:.55mm}
.kv>div{display:flex;align-items:baseline;gap:1.0mm;padding:.15mm 0;
  font-size:6.24pt;line-height:1.35;color:var(--sub)}
.kv>div+div{border-top:.3pt solid #ededed}
.kv>div>span{min-width:0;overflow-wrap:anywhere}
.cg span,.kv b{font-family:var(--mono);font-size:6.12pt;
  background:var(--codebg);border:.3pt solid #dedede;border-radius:.4mm;
  padding:0 .55mm;color:var(--ink);font-weight:400}
.cg span{line-height:1.3;white-space:nowrap}
.kv b{flex:0 0 auto;max-width:56%;overflow-wrap:anywhere}
.kv>div.m b::before{content:"★";color:var(--star);margin-right:.5mm}
.kv>div.p>span{color:var(--dim)}
.lg.ad b{color:var(--dim)}

/* ⚠ 間違えやすい点(C言語版で追加) */
.cw{font-size:6.24pt;line-height:1.35;color:var(--warn);
  background:#fdf5e8;border-left:.9pt solid #e0b263;
  padding:.4mm .8mm;border-radius:.4mm;margin-bottom:.55mm}
.cw::before{content:"⚠ "}

/* 一覧表(C言語版で追加) */
.tb{width:100%;border-collapse:collapse;font-size:6.12pt;line-height:1.3;margin-bottom:.55mm}
.tb th{text-align:left;font-weight:700;color:var(--ink);background:var(--codebg);
  padding:.25mm .6mm;border-bottom:.4pt solid #c6c6c6;white-space:nowrap}
.tb td{padding:.2mm .6mm;border-top:.3pt solid #ededed;color:var(--sub);vertical-align:top}
.tb td.f{white-space:nowrap}

/* 説明文の中の等幅 */
.cd code,.kv code,.tb code,.cw code{font-family:var(--mono);font-size:.95em;
  background:var(--codebg);border-radius:.3mm;padding:0 .3mm;overflow-wrap:anywhere}

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
<title>[ライト] C言語チートシート(macOS / gcc)</title>
<meta name="description" content="授業で扱うC言語の文法・コンパイル・ポインタ・メモリ・開発手法をまとめたA4横${SPLIT.length}ページのチートシート(ライトモード)。">
<style>${css}</style>
</head>
<body>
${pages.join('\n')}
</body>
</html>
`;
fs.writeFileSync(OUT, html);
console.log('ok', CARDS.length, 'cards /', SPLIT.length, 'pages /', html.length, 'chars');
