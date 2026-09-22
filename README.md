# だまされる博物館 / Museum of Being Fooled

詐欺の手口を「疑似体験 → 判定 → 種明かし」で学ぶ、教育型インタラクティブ展示。

実際に使われている手口を、一円も失わずに体験できる4つの部屋と、
体験後に仕掛けをすべて開示する舞台裏ツアーで構成されています。

- 仕様・設計思想: [SPEC.md](SPEC.md)
- シナリオ全文（自動生成）: [docs/](docs/)

## 着想のもと

[ダークパターン博物館｜だまされて、学ぼう。](https://amix-design.com/tl/web-darkp/)（制作：AMIX／トミナガハルキ）

ウェブサイトの「だましのUI」を実際に踏んで学ぶ展示から着想を得ている。
解説を読ませるのではなく、まず引っかからせて、そのあとで種を明かす — その構成を踏襲した。
題材は異なり（あちらはウェブUIの設計、こちらは対人コミュニケーションを使った詐欺の手口）、
本サイトは同館とは無関係の非公式な制作物で、内容についての責任はすべて制作者にある。

## セットアップ

```bash
npm install
npm run dev        # http://localhost:5173
```

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー。起動時にシナリオの整合性を自動チェックする |
| `npm run build` | 本番ビルド（`dist/`） |
| `npm run typecheck` | 型チェック |
| `npm run make-charts` | 第1展示室のチャート画像2枚をSVGから生成（数字が展示の中身なので手描き） |
| `npm run build-fonts` | 使う文字だけに絞ったフォントを生成（後述） |
| `npm run check-fonts` | 本文の文字がフォントに収録されているか検査 |
| `npm run optimize-images` | `assets-src/` の原本を `public/assets/` の webp に変換 |
| `npm run check-assets` | シナリオが参照する画像の配置状況を確認 |
| `npm run export-scenario` | シナリオ本文を `docs/*.md` に書き出す |
| `npm run check-release` | 公開前チェック（未対応があれば終了コード1） |

## 構成

```
src/
  app/                  ルーティング
  features/
    museum/             館内モード（エントランス・順路・図鑑・診断・相談窓口・この館について）
    simulator/          体験モード（スマホ筐体と4つのサーフェス）
      surfaces/         Chat / Group / Web / Call
      engine/           シナリオ実行エンジン
    debrief/            判定と舞台裏（種明かし）
  content/
    scenarios/          展示室ごとのシナリオ（動的インポート）
    tactics.ts          手口カード26枚
assets-src/             画像の原本（配信されない）
public/assets/          配信用 webp（optimize-images が生成）
docs/                   シナリオ全文（export-scenario が生成）
```

### 編集するときの注意

- **シナリオ本文は `src/content/scenarios/*.ts` を直す。** `docs/*.md` は自動生成なので、
  直接編集しても次の `npm run export-scenario` で上書きされる
- **画像は `assets-src/<部屋>/` に置いて `npm run optimize-images`。**
  `public/assets/` に直接置かない（原本が配信物に混ざる）
- 手口タグを足したら、`src/content/tactics.ts` にカードも必ず足す
  （タグだけ付けて解説が無い状態は、dev起動時のチェックで検出される）

## 公開

Cloudflare Pages を想定。

| 設定 | 値 |
|---|---|
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| Node バージョン | 22 |
| 環境変数 | `VITE_PUBLIC_ORIGIN=https://<公開ドメイン>` |

`VITE_PUBLIC_ORIGIN` は OGP の絶対URLに使う。未設定のまま公開すると
SNSでシェアしてもカードが出ないため、`npm run check-release` で検出できるようにしてある。

SPA のため、直リンク・リロードに `public/_redirects`（Cloudflare Pages / Netlify）と
`vercel.json` を用意済み。これが無いと `/rooms` などが 404 になる。

## 内容についての方針

この展示は詐欺被害の防止を目的としており、**加害の手引きにならないこと**を設計制約としている。
登場する人物・団体・企業・サービス・URLはすべて架空。
詳細は [SPEC.md §5](SPEC.md) を参照。

## フォント

フォントは自前で配っている（`public/fonts/`）。Google Fonts の `<link>` は、
この構成だと **145KB の CSS**（アプリ本体のJSより大きい）を返したうえで
レンダリングを止めていたため。

```bash
npm run build-fonts    # 原本を取得してサブセットを生成
npm run check-fonts    # 本文の文字がフォントに収録されているか検査
```

日本語フォントは1ウェイト数MBあるので、**使う文字だけ**に絞っている。

| | 収録範囲 | 字数 |
|---|---|---|
| Noto Sans JP 400 / 700（本文） | 画面に出る全文字 | 1,509 |
| Zen Kaku Gothic New 700 / 900（見出し） | 見出しに出た漢字＋かな英数記号 | 630 |

**本文に新しい漢字を足したら `npm run build-fonts` を回すこと。**
忘れるとその字が豆腐（□）になる。`check-fonts` が検出し、`check-release` でも落ちる。

見出し用の漢字一覧（`scripts/display-kanji.txt`）に漏れがあっても壊れない。
フォントスタックが Zen Kaku → Noto Sans JP の順なので、無い字は本文用の書体で出る。
見出しの書体を揃えたい場合だけ足せばよい。

## ブランド画像（アイコンとOGP）

```bash
npm run make-brand-images
```

`assets-src/common/dr-bug.png` から生成する。

| 出力 | 用途 |
|---|---|
| `public/icon-32.png` / `icon-192.png` | タブのアイコン |
| `public/apple-touch-icon.png` | iOSのホーム画面 |
| `public/ogp.png` | LINE・X などにリンクを貼ったときの画像 |

ファビコンは**顔だけ**を切り出している。全身を32pxに縮めると何が描いてあるか
分からなくなるが、顔だけなら「左右で違う」ことが小さくても読み取れる。

OGPは画像生成AIではなくSVGから組んでいる。日本語の字形が崩れず、
文言やドメインを変えたときに作り直せるため。

### OGP画像を差し替えるとき

SNSはページURL単位でOGPをキャッシュし、画像だけ差し替えても取りに来ない。
だからURLのほうを変える。版番号はOG画像の中身のハッシュで、次の3か所に同じ値が入る。

| 入る場所 | 何のため |
|---|---|
| `og:image` | 画像単位のキャッシュを外す |
| `og:url` | SNSが照合する「正規のアドレス」を新しくする |
| アドレスバー（`AppShell`） | ブラウザの共有ボタンが渡すURLを新しくする |

**画像を作り直したら `npm run build` を通すだけでよい。**
3か所はビルド時に同じ値で埋まる。ずれたまま公開できないよう、
`check-release` が3者を突き合わせて落とす（実際にずらして検出を確認済み）。

手でやることは無い。`?v=2` のような小細工も要らない。

**どうしても直せないもの**：すでに誰かのトークに貼られているカードと、
版番号なしの素のURLをそのまま貼られた場合。どちらもSNS側に保存された情報なので、
こちらからは消せない（時間が経てばSNS側で切れる）。
