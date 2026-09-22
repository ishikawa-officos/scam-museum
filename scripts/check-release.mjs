/**
 * 公開前チェック。
 *
 *   npm run build && npm run check-release
 *
 * 「公開のときに直すつもりだった」ものを、機械が見つける。
 * 人間のチェックリストは必ず抜けるので、抜けたら落ちる形にしておく。
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const problems = [];
const notes = [];

if (!existsSync(DIST)) {
  console.error('dist/ がありません。先に npm run build を実行してください。');
  process.exit(1);
}

const html = await readFile(path.join(DIST, 'index.html'), 'utf8');

// 1) OGP の絶対URL
if (html.includes('%VITE_PUBLIC_ORIGIN%')) {
  problems.push(
    'OGP の URL が未設定です。.env.production に VITE_PUBLIC_ORIGIN=https://<公開ドメイン> を書いてください。',
  );
} else if (/(og:url|og:image|twitter:image|canonical)[^>]*localhost/.test(html)) {
  problems.push(
    'OGP の URL が localhost のままです。.env.production の VITE_PUBLIC_ORIGIN を公開ドメインにしてください。',
  );
} else {
  notes.push('OGP の絶対URLが設定されています。');
}

// 2) 検索避け
if (/name="robots"[^>]*noindex/.test(html)) {
  problems.push('robots に noindex が残っています。検索結果に出したい場合は外してください。');
} else {
  notes.push('noindex は外れています。');
}

// 3) OG画像の実体
if (!existsSync(path.join(DIST, 'ogp.png'))) {
  problems.push('dist/ogp.png がありません。OG画像が配信されません。');
} else {
  notes.push('OG画像 dist/ogp.png があります。');
}

// 4) robots.txt と sitemap.xml
//    SPAなので、無いと index.html がフォールバックで返り、
//    クローラーは robots.txt としてHTMLを読むことになる
for (const f of ['robots.txt', 'sitemap.xml']) {
  if (!existsSync(path.join(DIST, f))) {
    problems.push(`dist/${f} がありません。vite.config.ts の seoFiles プラグインを確認してください。`);
  } else {
    notes.push(`${f} が出力されています。`);
  }
}

// 5) 画面に残った制作メモ
const assets = path.join(DIST, 'assets');
const { readdir } = await import('node:fs/promises');
const jsFiles = (await readdir(assets)).filter((f) => f.endsWith('.js'));
let memoHit = false;
for (const f of jsFiles) {
  const body = await readFile(path.join(assets, f), 'utf8');
  if (body.includes('制作メモ') || body.includes('公開前に対応')) memoHit = true;
}
if (memoHit) problems.push('画面のどこかに「制作メモ（公開前に対応）」が残っています。');
else notes.push('制作メモは画面に残っていません。');

// ── 結果 ─────────────────────────────────────────────
for (const n of notes) console.log(`  OK       ${n}`);
for (const p of problems) console.log(`  要対応   ${p}`);

console.log('');
if (problems.length > 0) {
  console.log(`${problems.length} 件の未対応があります。`);
  process.exit(1);
}
console.log('公開前チェック: 問題なし。');
console.log('※ 機械で確認できない項目（第三者レビュー、統計の最新性）は SPEC.md を参照してください。');
