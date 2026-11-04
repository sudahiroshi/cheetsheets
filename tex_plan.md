# upLaTeX チートシート 収録内容一覧（tex_plan.md）

対象: **upLaTeX + dvipdfmx**（TeX Live 2024 / e-upTeX）。
紙面: A4 横 2〜3 ページ、白背景＋カテゴリ色の枠・見出し。
この一覧がそのまま `tex_cheatsheet.html` のカード群になる。各項目は「見出し / コマンド例 / 一言説明」の3点セット。

> 注意: pdfLaTeX / LuaLaTeX 固有の書き方（`\usepackage[utf8]{inputenc}` など）は意図的に排除している。
> upLaTeX のソースは UTF-8 がそのまま通るため `inputenc` は不要。

## カテゴリと色（凡例）

| 記号 | カテゴリ | 色 |
|---|---|---|
| A | 土台とコンパイル | 濃青 |
| B | 文書クラスとプリアンブル | 紫 |
| C | 文書構造と見出し | 緑 |
| D | 文字装飾・段落・特殊文字 | 琥珀 |
| E | 箇条書き | オリーブ |
| F | 数式 | 赤 |
| G | 図・表 | 橙 |
| H | 参照・文献・コード・日本語・トラブル | ティール |

---

## A. 土台とコンパイル（濃青）

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| A1 | コンパイル手順 | `uplatex main.tex` → `dvipdfmx main.dvi` | DVI 経由の2段。`-kanji=utf8` は既定なので省略可 |
| A2 | latexmk 設定例 ~/.latexmkrc | `$latex='uplatex -synctex=1 -halt-on-error %O %S';`<br>`$bibtex='upbibtex %O %B';`<br>`$dvipdf='dvipdfmx %O -o %D %S';`<br>`$makeindex='upmendex %O -o %D %S';`<br>`$pdf_mode=3;` | uplatex 用の設定。`$pdf_mode=3` が「DVI→PDF を dvipdfmx で」の意味 |
| A3 | よく使うオプション | `-halt-on-error` `-interaction=nonstopmode` `-synctex=1` | 最初のエラーで停止／対話せず最後まで／エディタとの相互ジャンプ |
| A4 | コンパイル回数 | `latexmk main.tex` | 相互参照・目次は 2 回以上必要。latexmk が自動で回数を判断する |
| A5 | ソースは UTF-8 保存 | （エディタの設定） | upLaTeX は UTF-8 が既定。`inputenc` は読み込まない |
| A6 | 中間ファイル掃除 | `latexmk -c` / `latexmk -C` | `-c` は aux/log など中間物のみ、`-C` は生成 PDF も消す |

**計 6 項目**

---

## B. 文書クラスとプリアンブル（紫）

### クラス（jlreq を既定とする）

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| B1 | 文書の体裁 [jlreq] ★推奨 | `\documentclass[uplatex,dvipdfmx,paper=a4,fontsize=11pt]{jlreq}`<br>主要オプション: `paper=` `fontsize=` `line_length=` `number_of_lines=` `tate` | **本シートの既定クラス。** JLReq（日本語組版処理の要件）準拠で、版面を字数・行数で直接指定できる |
| B2 | 他の選択肢 [jsarticle / ujarticle] | `\documentclass[uplatex,dvipdfmx,a4paper,11pt]{jsarticle}`<br>`\documentclass[dvipdfmx,a4paper]{ujarticle}` | 他人のテンプレートを読むとき用。jsarticle は長年の定番。`uj*` 系（`ujreport` / `ujbook` / `utarticle`）は upLaTeX 専用なので `uplatex` 不要 |
| B3 | クラスオプション | `twocolumn` `titlepage` `landscape` `draft` `fleqn` `leqno` | 2段組／表題別ページ／横置き／下書き（画像を枠だけに）／数式左寄せ／式番号左 |
| B4 | dvipdfmx はクラスへ | `\documentclass[uplatex,dvipdfmx,...]{jlreq}` | クラスに書くと graphicx/xcolor/hyperref へ伝播し、ドライバ不一致事故を防ぐ |
| B5 | パッケージの読み込み順 | `\usepackage{graphicx,xcolor}`<br>`\usepackage{amsmath,amssymb}`<br>…<br>`\usepackage{hyperref}`（原則いちばん最後）<br>`\usepackage{pxjahyper}`（その直後） | `hyperref` は他の多くの命令を上書きするため最後。`pxjahyper` はその後でないと効かない |

### 定番パッケージ（1 カード = 1 パッケージ／見出しは「用途 [名前]」形式）

| # | 見出し（用途 [パッケージ名]） | コマンド例 | 一言説明 |
|---|---|---|---|
| B6 | 画像の読み込み [graphicx] | `\usepackage{graphicx}` | `\includegraphics` を使うため。ドライバはクラスオプションから継承 |
| B7 | 色付け [xcolor] | `\usepackage{xcolor}` | `\textcolor{red}{…}` `\colorbox` など色付け |
| B8 | 用紙サイズ・余白 [geometry] | `\usepackage[margin=25mm]{geometry}` | 用紙余白をまとめて指定 |
| B9 | 数式の拡張 [amsmath / amssymb] | `\usepackage{amsmath,amssymb}` | `align` `cases` などの数式環境と追加記号。数式を書くなら必須 |
| B10 | 数式の太字 [bm] | `\usepackage{bm}` | 数式の太字斜体 `\bm{x}`（ベクトル表記） |
| B11 | リンク・しおり [hyperref + pxjahyper] | `\usepackage{hyperref}`<br>`\usepackage{pxjahyper}` | PDF のリンク・しおり。`pxjahyper` が和文しおりの文字化けを防ぐ |
| B12 | 表の横罫線 [booktabs] | `\usepackage{booktabs}` | `\toprule` `\midrule` `\bottomrule` の見やすい表罫線 |
| B13 | 表の縦方向の結合 [multirow] | `\usepackage{multirow}` | `\multirow` で表のセルを縦方向に結合 |
| B14 | 列指定の拡張 [array] | `\usepackage{array}` | 列指定の拡張（`>{\centering}p{30mm}` など） |
| B15 | 幅を自動調整する表 [tabularx] | `\usepackage{tabularx}` | 幅を指定して `X` 列に残りを自動配分する表 |
| B16 | 箇条書きの書式指定 [enumitem] | `\usepackage{enumitem}` | 箇条書きのラベル・余白を細かく制御 |
| B17 | キャプション調整・図の並置 [caption + subcaption] | `\usepackage{caption,subcaption}` | キャプション書式の調整と、図を並べる `subfigure` 環境 |
| B18 | ソースコードの掲載 [listings + jvlisting] | `\usepackage{listings}`<br>`\usepackage{jvlisting}` | ソースコード掲載。`jvlisting` は日本語を含むコード用（jlisting の後継） |
| B19 | 数値と単位の組版 [siunitx] | `\usepackage{siunitx}` | 数値と単位の組版（`\qty{9.8}{\meter\per\second\squared}`） |
| B20 | URL の折り返し [url] | `\usepackage{url}` | `\url{https://…}` を折り返し付きで組む |
| B21 | 多ウェイト和文・特殊文字 [otf] | `\usepackage[deluxe]{otf}` | 多ウェイト和文（細字・太字・極太）と異体字・記号（`\UTF` `\CID` `\ajMaru`） |

**計 21 項目**

---

## C. 文書構造と見出し（緑）

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| C1 | 表題 | `\title{題名}` `\author{著者}` `\date{\today}`<br>`\maketitle` | `\date{}` を空にすると日付なし。`\maketitle` は `\begin{document}` の直後 |
| C2 | 概要 | `\begin{abstract} … \end{abstract}` | 要旨。jsarticle では表題直後に置く |
| C3 | 目次・図表目次 | `\tableofcontents` `\listoffigures` `\listoftables` | 反映には 2 回コンパイルが必要 |
| C4 | 見出し階層 | `\part` `\chapter` `\section` `\subsection`<br>`\subsubsection` `\paragraph` | `\chapter` は book / report 系のみ（article にはない） |
| C5 | 番号なし見出し | `\section*{謝辞}` | 番号を振らず目次にも載せない |
| C6 | 目次用の短い見出し | `\section[短い名]{本文に出る長い見出し}` | 目次・柱には `[ ]` の方が使われる |
| C7 | 付録 | `\appendix` | 以降の `\section` 番号が A, B, C… になる |
| C8 | 改ページ | `\newpage` / `\clearpage` | `\clearpage` は未出力の図表を吐き出してから改ページ |
| C9 | 番号・目次の深さ | `\setcounter{secnumdepth}{3}`<br>`\setcounter{tocdepth}{2}` | 何段目の見出しまで番号を振るか／目次に載せるか |
| C10 | コメント | `% これはコメント` / 行末の `%` | 行末 `%` は改行由来の余計な空白を消すのに使う |

**計 10 項目**

---

## D. 文字装飾・段落・特殊文字（琥珀）

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| D1 | 欧文書体（命令形） | `\textbf{}` `\textit{}` `\texttt{}` `\textsf{}`<br>`\textrm{}` `\textsc{}` `\emph{}` `\underline{}` | 太字／斜体／等幅／サンセリフ／ローマン／スモールキャップ／強調／下線 |
| D2 | 和文書体 | `\textgt{ゴシック}` / `\textmc{明朝}` | upLaTeX の和文専用。jsarticle では `\textbf` でも和文がゴシックになる |
| D3 | 宣言形 | `\bfseries` `\itshape` `\ttfamily`<br>`\gtfamily` `\mcfamily` | `{ }` のグループ内で以降すべてに効く。`\gtfamily` `\mcfamily` は和文 |
| D4 | 文字サイズ | `\tiny` `\scriptsize` `\footnotesize` `\small`<br>`\normalsize` `\large` `\Large` `\LARGE` `\huge` `\Huge` | 宣言形。`{\small 小さい文字}` のように使う |
| D5 | 改行・段落 | 空行 = 段落／`\\` / `\\[5mm]` / `\par` | `\\` は段落を変えずに改行。空行での段落分けが基本 |
| D6 | 字下げ・余白 | `\noindent` `\parindent=0pt` `\parskip=1em`<br>`\vspace{1em}` `\vspace*{}` `\hspace{1em}` | `\vspace*` はページ先頭でも消えない縦空き |
| D7 | 細かい空白量 | `\,` `\:` `\;` `\!` `\quad` `\qquad` `~` | 順に 1/6em・2/9em・5/18em・負・1em・2em・改行禁止スペース |
| D8 | 詰め物（伸びる空白） | `\hfill` `\vfill` `\dotfill` `\hrulefill` | 行内・ページ内の残りを埋める。目次風の点線や罫線に |
| D9 | 揃え・引用 | `\centering` / `center` `flushleft` `flushright` 環境<br>`quote` `quotation` | `\centering` は宣言形（環境より余計な空きが出ない）、引用は quote 系 |
| D10 | エスケープが要る文字 | `\# \$ \% \& \_ \{ \}`<br>`\textbackslash` `\textasciitilde` `\textasciicircum` | `\` `~` `^` はバックスラッシュ単体では書けず専用命令を使う |
| D11 | 引用符とダッシュ | `` `シングル' `` `` ``ダブル'' ``<br>`-`(ハイフン) `--`(範囲) `---`(ダッシュ) | 欧文の引用符は開きがバッククォート。`"` 直打ちは使わない |
| D12 | 記号 | `\ldots` `\S` `\dag` `\ddag` `\copyright`<br>`\textdegree` `\textregistered` | 三点リーダ／節記号／ダガー／コピーライト／度／登録商標 |

**計 12 項目**

---

## E. 箇条書き（オリーブ）

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| E1 | 3 つの基本環境 | `itemize`（記号）/ `enumerate`（番号）/ `description`（語句） | `\begin{itemize} \item … \end{itemize}` |
| E2 | 項目とラベル | `\item 本文` / `\item[→] 本文`<br>`\item[用語] 説明`（description） | `[ ]` でラベルを上書き |
| E3 | ネスト | 入れ子は 4 段階まで | 記号・番号は段ごとに自動で変化（• – * · / 1. (a) i. A.） |
| E4 | enumitem で書式指定 | `\begin{enumerate}[label=(\arabic*),`<br>`leftmargin=*, itemsep=0pt, topsep=0pt]` | ラベル書式と上下左右の空きをその場で指定 |
| E5 | ラベル書式 | `label=\alph*` `label=\Roman*` `label=\arabic*` | a,b,c / I,II,III / 1,2,3。`*` がカウンタの位置 |
| E6 | 余白を詰める | `nosep` / `noitemsep` | `nosep` は項目間と前後の空きを全部ゼロに |
| E7 | 文書全体の既定を変える | `\setlist[itemize]{nosep, leftmargin=1.5em}`<br>`\setlist[enumerate,1]{label=(\arabic*)}` | プリアンブルで一括設定。`[環境,階層]` で対象を絞れる |
| E8 | 番号の継続 | `\begin{enumerate}[resume]` | 中断した番号の続きから再開する |

**計 8 項目**

---

## F. 数式（赤）※ 紙面を最も大きく取る

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| F1 | インライン数式 | `$x^2+y^2=z^2$` / `\(x+y\)` | 本文中に埋め込む。`$$…$$` は使わない（LaTeX では非推奨） |
| F2 | ディスプレイ数式 | `\[ E = mc^2 \]` | 別行立て。番号が要らないときの基本形 |
| F3 | 番号付き数式 | `\begin{equation}\label{eq:x} … \end{equation}`<br>`equation*` は番号なし | `*` 付きは amsmath が必要 |
| F4 | 番号の制御 | `\tag{A.1}` / `\notag` / `\nonumber` | 任意の式番号を付ける／その行だけ番号を消す |
| F5 | 複数行（揃える） | `\begin{align} a &= b \\ &= c \end{align}` | `&` の位置で縦に揃う。`align*` は番号なし |
| F6 | 複数行（その他） | `gather`（中央揃え）/ `multline`（長い式を分割）<br>`split`（1 つの番号で複数行）/ `aligned`（部分揃え） | `split` `aligned` は `equation` の中に入れて使う |
| F7 | 場合分け | `\begin{cases} 1 & (x>0) \\ 0 & (x\le 0) \end{cases}` | 左の大括弧付き。`\begin{equation}` の中に入れる |
| F8 | 分数・根号 | `\frac{a}{b}` `\dfrac{a}{b}` `\tfrac{a}{b}`<br>`\sqrt{x}` `\sqrt[3]{x}` | `\dfrac` は常にディスプレイ寸法、`\tfrac` は常に小さく |
| F9 | 添字 | `x^{2}` `a_{ij}` `x_i^2` `{}^{t}\!A` | 2 文字以上の添字は必ず `{ }` で囲む |
| F10 | 大型演算子 | `\sum_{i=1}^{n}` `\prod_{i=1}^{n}` `\int_a^b`<br>`\iint` `\oint` `\lim_{x\to 0}` `\max_{i}` | インラインでは上下に付かない。`\limits` で強制できる |
| F11 | 括弧の自動伸縮 | `\left( … \right)` `\left\{ … \right.`<br>`\bigl \Bigl \biggl \Biggl` | `\right.` は閉じ括弧なし。手動サイズは `\bigl` 系 |
| F12 | 括弧・絶対値の種類 | `\langle x \rangle` `\lvert x \rvert`<br>`\lVert x \rVert` `\lfloor \rfloor \lceil \rceil` | 山括弧／絶対値／ノルム／床・天井 |
| F13 | 関数名（立体） | `\sin \cos \tan \log \ln \exp`<br>`\max \min \arg \det \dim \gcd` | 自前にないものは `\operatorname{sgn}` で作る |
| F14 | 演算子・関係子 | `\cdot \times \div \pm \mp \leq \geq \neq \approx`<br>`\simeq \equiv \sim \propto \ll \gg \in \notin`<br>`\subset \subseteq \cup \cap \setminus \emptyset`<br>`\forall \exists \neg \land \lor \infty \partial \nabla`<br>`\to \mapsto \Rightarrow \Leftrightarrow \therefore` | 1 カードにミニグリッドでまとめる |
| F15 | ギリシャ文字（小文字） | `\alpha \beta \gamma \delta \epsilon \varepsilon \zeta`<br>`\eta \theta \vartheta \iota \kappa \lambda \mu \nu \xi`<br>`\pi \rho \sigma \tau \upsilon \phi \varphi \chi \psi \omega` | o（オミクロン）はラテン文字の `o` を使う |
| F16 | ギリシャ文字（大文字） | `\Gamma \Delta \Theta \Lambda \Xi \Pi`<br>`\Sigma \Upsilon \Phi \Psi \Omega` | 大文字は既定で立体。斜体にするなら `\varGamma` 系（amsmath） |
| F17 | アクセント | `\hat{x}` `\bar{x}` `\vec{x}` `\dot{x}` `\ddot{x}` `\tilde{x}`<br>`\overline{AB}` `\underline{x}` `\overrightarrow{AB}`<br>`\widehat{ABC}` `\widetilde{ABC}` | 2 文字以上には `\wide…` / `\over…` 系を使う |
| F18 | 数式内の書体 | `\mathrm{d}` `\mathbf{A}` `\bm{x}` `\mathit{}`<br>`\mathcal{F}` `\mathbb{R}` `\mathsf{}` | 単位や微分の d は立体 `\mathrm`、ベクトル太字は `\bm` |
| F19 | 数式内の日本語 | `\text{ただし }x>0` | `\text{}` は amsmath。数式中に和文を直書きしない |
| F20 | 行列 | `pmatrix`( ) `bmatrix`[ ] `vmatrix`\| \|<br>`Vmatrix`‖ ‖ `matrix`(括弧なし) `array` | `array` は列指定が要る。他は amsmath で括弧付き |
| F21 | 行列の省略記号 | `\cdots` `\vdots` `\ddots` `\dots` | 横／縦／斜めの三点。文脈任せなら `\dots` |
| F22 | 数式内の空き | `\,`（細） `\quad` `\qquad` `\!`（負） | 記号の詰まり具合を手で微調整する |
| F23 | 単位（siunitx v3） | `\num{1.2e3}` `\unit{\kilo\gram}`<br>`\qty{9.8}{\meter\per\second\squared}`<br>`\qtyrange{10}{20}{\celsius}` | 数値と単位の間を自動で正しく空ける。旧 `\SI` `\si` も互換で動くが新記法を推奨 |

**計 23 項目**

---

## G. 図・表（橙）

見出しの `[図]` は図だけ、`[表]` は表だけに関わるカード。両方に関わるもの（G2 配置指定 / G4 幅の基準 / G9 キャプションの位置）は無印。

### 図

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| G1 | [図] 図の基本形 | `\begin{figure}[htbp]`<br>`\centering`<br>`\includegraphics[width=0.8\linewidth]{fig.pdf}`<br>`\caption{説明}\label{fig:x}`<br>`\end{figure}` | `\label` は必ず `\caption` の後に置く |
| G2 | 配置指定 | `h`（ここ）`t`（上）`b`（下）`p`（独立ページ）`!`（制約緩和） | `[H]`（絶対ここ）は `float` パッケージが必要 |
| G3 | [図] includegraphics オプション | `width=` `height=` `scale=` `angle=`<br>`trim=10 20 10 20, clip` `keepaspectratio` | `trim` は左下右上の順に切り取り。`clip` を付けないと効かない |
| G4 | 幅の基準 | `\linewidth` `\textwidth` `\columnwidth` | 2 段組や minipage の中では `\linewidth` が安全 |
| G5 | [図] 画像の探索パス | `\graphicspath{{./figs/}}` | 末尾のスラッシュと二重波括弧に注意 |
| G6 | [図] dvipdfmx で使える画像 | PDF / EPS / JPEG / PNG | ベクタは PDF 推奨。拡張子は省略しても良い |
| G7 | [図] バウンディングボックス | `extractbb fig.png` → `fig.xbb` | JPEG/PNG はサイズ情報が要る。TeX Live では自動生成が有効なことが多い |
| G8 | [図] 図を横に並べる | `\begin{subfigure}{0.48\linewidth}`<br>`… \subcaption{(a)}\label{fig:a}`<br>`\end{subfigure}` | `subcaption` パッケージ。参照は `\subref{fig:a}` |
| G9 | キャプションの位置 | 図 = `\includegraphics` の**下**<br>表 = `tabular` の**上** | 和文の組版作法。`\caption` を書く位置で決まる |

### 表

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| G10 | [表] 表の基本形 | `\begin{table}[htbp]`<br>`\centering`<br>`\caption{説明}\label{tab:x}`<br>`\begin{tabular}{lcr} … \end{tabular}`<br>`\end{table}` | `table` が浮動体、`tabular` が中身。キャプションは先に書く |
| G11 | [表] 列指定 | `l` `c` `r` `p{30mm}` `|` `@{}` `*{3}{c}` | 左／中央／右／折り返し幅指定／縦罫線／列間の空き指定／繰り返し |
| G12 | [表] セルと行 | `A & B & C \\` | `&` で列区切り、`\\` で行末 |
| G13 | [表] 罫線（標準） | `\hline` / `\cline{2-3}` | 全幅の横罫／2〜3 列目だけの横罫 |
| G14 | [表] 罫線（booktabs） | `\toprule` `\midrule` `\bottomrule` `\cmidrule{2-3}` | 太さが整った 3 本線。**縦罫線は使わない**のが作法 |
| G15 | [表] セルの結合 | `\multicolumn{2}{c}{見出し}`<br>`\multirow{2}{*}{縦結合}` | 横結合は標準、縦結合は `multirow` パッケージ |
| G16 | [表] 幅を指定する表 | `\begin{tabularx}{\linewidth}{lXr}`<br>`… \end{tabularx}` | `X` 列が残り幅を自動で吸収する |

**計 16 項目**

---

## H. 参照・文献・コード・日本語・トラブル（ティール）

### 相互参照・脚注

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| H1 | ラベルと参照 | `\label{sec:x}` → `\ref{sec:x}`<br>`\eqref{eq:x}` `\pageref{}` `\autoref{}` | `\eqref` は括弧付きの式番号、`\autoref` は「図 3」のように種別付き |
| H2 | ラベル命名の作法 | `sec:` `fig:` `tab:` `eq:` | 接頭辞で種別が分かるようにする |
| H3 | 参照が ?? になる | もう一度コンパイルする | 1 回目は `.aux` に書き出すだけ。`latexmk` なら自動 |
| H4 | 脚注 | `\footnote{注}`<br>`\footnotemark` + `\footnotetext{注}` | 表や minipage の中では後者に分けると確実 |

### 参考文献

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| H5 | 手書きの文献リスト | `\begin{thebibliography}{9}`<br>`\bibitem{key} 著者, 書名, 出版社, 2024.`<br>`\end{thebibliography}` → `\cite{key}` | `{9}` は番号の最大桁幅の目安 |
| H6 | BibTeX | `\bibliographystyle{junsrt}`<br>`\bibliography{ref}` | 処理は **`upbibtex`**（`bibtex` や `pbibtex` ではない） |
| H7 | 日本語向け文献スタイル | `junsrt`（引用順）`jplain` `jalpha` `jabbrv` | `junsrt` は出現順に番号を振る。和文論文で最も使われる |
| H8 | natbib | `\usepackage{natbib}`<br>`\citep{key}` `\citet{key}` | 括弧付き引用／著者名を本文に出す引用 |
| H9 | 索引 | `\usepackage{makeidx}` `\makeindex`<br>`\index{項目}` `\printindex` | 処理は **`upmendex`**（日本語索引の読み仮名に対応） |

### ソースコード

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| H10 | そのまま出す（インライン） | `\verb|printf("%d", n);|` | 区切り文字は中身に出てこない記号なら何でも良い |
| H11 | そのまま出す（ブロック） | `\begin{verbatim} … \end{verbatim}` | 整形なしで等幅出力。中で命令は効かない |
| H12 | listings の設定 | `\lstset{basicstyle=\ttfamily\small,`<br>`frame=single, numbers=left,`<br>`breaklines=true, language=C}` | 枠・行番号・自動折り返し・言語指定 |
| H13 | listings の使用 | `\begin{lstlisting} … \end{lstlisting}`<br>`\lstinputlisting{code.c}` | 直書きと外部ファイル読み込み |
| H14 | 日本語を含むコード | `\usepackage{jvlisting}` | `listings` 単体では和文が化ける。`jvlisting` は jlisting の後継 |

### 日本語組版

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| H15 | 文字コード | `\usepackage[utf8]{inputenc}` ← 不要<br>`\usepackage[T1]{fontenc}` ← 不要 | upLaTeX は内部 Unicode で UTF-8 がそのまま通る。pdfLaTeX 用のこれらを混ぜると壊れる |
| H16 | 和欧文間の空き | `\xkanjiskip=.25zw plus 1pt minus 1pt`<br>`\kanjiskip=0pt plus .1zw` | 和文と欧文の間／和文同士の間の空き。`\inhibitglue` で局所的に抑止。`zw` は全角幅の単位（`\zw` という命令は無い） |
| H17 | ルビ | `\usepackage{pxrubrica}`<br>`\ruby{漢字}{かん\|じ}`（モノルビ）<br>`\ruby[g]{漢字}{かんじ}`（グループルビ） | ルビ側を `\|` で区切って各文字に対応させる。`[g]` は全体に 1 つ |
| H18 | 縦書き | `\documentclass[uplatex,dvipdfmx,tate,paper=a4]{jlreq}`<br>`\tate` / `\yoko` | jlreq は `tate` オプションで縦組（旧来のクラスなら `utarticle`）。`\tate` `\yoko` での切替はページ先頭か箱の中（`plext` の `\parbox<t>{}`）でのみ可 |
| H19 | 多ウェイト和文 | `\usepackage[deluxe]{otf}`<br>`\ajMaru{1}` `\ajKakko{1}` `\UTF{9DD7}` `\CID{1481}` | 細字・中字・太字を使い分けられる。`\aj…` 系で丸数字・括弧数字、`\UTF` `\CID` で異体字。（`\ajLabel` は引数の取り方が特殊なので `\ajMaru` 系を推奨） |

### トラブルシューティング

| # | 症状 | 対処 | 一言説明 |
|---|---|---|---|
| H20 | Overfull \hbox | `\sloppy` / `\-` / `\raggedright` | 行が右にはみ出す。単語間を緩める／分割位置を教える／右を揃えない |
| H21 | Undefined control sequence | パッケージの読み込み漏れ・綴り間違い | ログの行番号の直前を見る |
| H22 | 目次・図表番号が古い | `latexmk main.tex` | 目次やページ番号は 2〜3 回回さないと揃わない。`latexmk` が必要回数を判断する |
| H23 | 画像が出ない・ずれる | `dvipdfmx` オプション不一致／BB 不足 | ドライバをクラスオプションで統一、`extractbb` で `.xbb` を作る |
| H24 | しおりが文字化け | `\usepackage{pxjahyper}` を `hyperref` の後に | upLaTeX + hyperref + dvipdfmx の定番対策 |
| H25 | .aux 破損・原因不明のエラー | `latexmk -C` 後に再コンパイル | 中間ファイルを全部消してやり直す |

### 自作マクロ（最小限）

| # | 見出し | コマンド例 | 一言説明 |
|---|---|---|---|
| H26 | 引数なしマクロ | `\newcommand{\R}{\mathbb{R}}` | 既存の名前と衝突するとエラーになる |
| H27 | 引数付きマクロ | `\newcommand{\abs}[1]{\left|#1\right|}` | `[1]` が引数の個数、`#1` が 1 番目の引数 |
| H28 | 再定義と演算子定義 | `\renewcommand{\labelitemi}{\textbullet}`<br>`\DeclareMathOperator{\argmax}{arg\,max}` | 既存命令の上書き／立体の新しい数式演算子 |

**計 28 項目**

---

## 項目数まとめ

| カテゴリ | 項目数 |
|---|---|
| A 土台とコンパイル | 6 |
| B 文書クラスとプリアンブル | 21 |
| C 文書構造と見出し | 10 |
| D 文字装飾・段落・特殊文字 | 12 |
| E 箇条書き | 8 |
| F 数式 | 23 |
| G 図・表 | 16 |
| H 参照・文献・コード・日本語・トラブル | 28 |
| **合計** | **124** |

各カテゴリの箇条書きを 1 カード = 1 トピックに分解した結果、合計 124 枚になっている
（**内容の取捨選択はしていない**）。

---

## 掲載しないもの（意図的な除外）

- `\usepackage[utf8]{inputenc}` / `\usepackage[T1]{fontenc}` … pdfLaTeX 用。upLaTeX では不要・有害
- `fontspec` / `luatexja` … LuaLaTeX 用
- `bibtex` / `pbibtex` / `mendex` … upLaTeX では `upbibtex` / `upmendex` を使う
