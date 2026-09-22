# だまされる博物館 / Museum of Being Fooled

詐欺の手口を「疑似体験 → 判定 → 種明かし」で学ぶ、教育型インタラクティブ展示。

実際に使われている手口を、一円も失わずに体験できる4つの部屋と、
体験後に仕掛けをすべて開示する舞台裏ツアーで構成されています。

- 仕様・設計思想: [SPEC.md](SPEC.md)
- シナリオ全文（自動生成）: [docs/](docs/)

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
