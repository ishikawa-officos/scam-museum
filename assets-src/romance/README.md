# 第1展示室「海の向こうの恋人」画像アセット

## 使い方

1. 生成した画像を **このフォルダ（`assets-src/romance/`）** に置く（png / jpg / webp どれでも可）
2. プロジェクトルートで次を実行する

```bash
npm run optimize-images
```

3. `public/assets/romance/` に、用途に応じてリサイズされた `.webp` が出力される

**原本をここに置く理由**：`public/` の中身はそのまま `dist/` にコピーされるため、
数MBの原本を `public/` に置くと配信物に混ざってしまいます。原本はここに置いたまま、
配信されるのは変換後の webp だけ、という分担です。

## 出力サイズの自動振り分け

ファイル名に含まれる語でルールが決まります（`scripts/optimize-images.mjs` の `RULES`）。

| ファイル名に含む語 | 出力 | 用途 |
|---|---|---|
| `avatar` / `icon` | 128×128 に正方形切り抜き | プロフィールアイコン |
| `chart` / `screen` / `graph` | 幅 800px | 偽サイトの画面・チャート |
| （その他すべて） | 幅 720px | 吹き出し内の写真 |

ルールを変えたいときは `scripts/optimize-images.mjs` の `RULES` を編集してください。

## この展示室で使うファイル

| 原本ファイル名 | 配信パス | 表示場所 | 状態 |
|---|---|---|---|
| `emma-avatar.*` | `/assets/romance/emma-avatar.webp` | チャットヘッダー | 配置済み |
| `emma-office-night.*` | `/assets/romance/emma-office-night.webp` | b06 のメッセージ | 配置済み |
| `emma-portrait.*` | `/assets/romance/emma-portrait.webp` | b06 のリアクション | 配置済み |
| `chart-december.png` | `/assets/romance/chart-december.webp` | b09 のメッセージ | 配置済み（`npm run make-charts` が生成） |
| `chart-surge.png` | `/assets/romance/chart-surge.webp` | b24 のメッセージ | 配置済み（`npm run make-charts` が生成） |

未配置でも画面は壊れません。写真はファイル名入りのプレースホルダー、
チャートは内蔵SVGのグラフが表示されます。

## 生成時の注意（SPEC.md §5）

- **実在の人物に似せないこと。** 実在人物の肖像を使うと、その人が加害者として
  描かれることになります。生成画像であることが分かる程度の一般性を保ってください。
- **実在の企業名・ロゴ・サービス名を画面内に入れないこと。** チャート画像に
  取引所名などを入れる場合は、架空の名称（MERIDIAN CAPITAL）にしてください。
- 詐欺で実際に使われる画像をそのまま転用しないこと。被害者の写真が流用されている
  可能性があります。

## プロンプト例（画像生成AI向け）

- `emma-office-night`
  「高層オフィスの窓から見た夜景。室内は暗く、ガラスに照明がわずかに映り込む。
   人物は写っていない。スマートフォンで撮影したような自然な画質」

## チャート2枚は画像生成AIを使わない

`chart-december` と `chart-surge` は `scripts/make-charts.mjs` がSVGから生成する。

```bash
npm run make-charts
npm run optimize-images
```

画像生成AIに描かせると、日本語の字形と数字が崩れる（「評価損益」が「評佃損益」になる類）。
この2枚は表示されている数字そのものが展示の中身で、リプレイでは注釈付きで読み直される。
読めない数字では展示にならないので、ここだけは手で描いている。
金額・期間・推移を変えたいときはスクリプトの定数を直すこと。

**縦横比の制約**：縦に長い画像は吹き出しが選択肢パネルに隠れ、下半分に到達できなくなる。
正方形に近い比率を保つこと。

## ファイル名を変えたいとき

`src/content/scenarios/romance-investment.ts` の `media.src` / `contact.avatarSrc` を
書き換えてください。パスはすべて `/assets/romance/...` から始まる絶対パスです。
