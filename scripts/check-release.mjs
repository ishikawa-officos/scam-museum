/**
 * 公開前チェック。
 *
 *   npm run build && npm run check-release
 *
 * 「公開のときに直すつもりだった」ものを、機械が見つける。
 * 人間のチェックリストは必ず抜けるので、抜けたら落ちる形にしておく。
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const assets = path.join(DIST, 'assets');
// ビルド出力の一覧。フォント・JS・画像の確認で共通して使う
const emitted = await readdir(assets).catch(() => []);

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

// 3) OG画像の実体と、宣言した寸法との一致
//    og:image:width / height は多くのSNSが先に読む。
//    実体とずれていると、表示の組み立てを誤らせる
if (!existsSync(path.join(DIST, 'ogp.png'))) {
  problems.push('dist/ogp.png がありません。OG画像が配信されません。');
} else {
  const sharp = (await import('sharp')).default;
  const meta = await sharp(path.join(DIST, 'ogp.png')).metadata();
  const declared = {
    w: Number(html.match(/og:image:width"\s+content="(\d+)"/)?.[1]),
    h: Number(html.match(/og:image:height"\s+content="(\d+)"/)?.[1]),
  };
  if (meta.width !== declared.w || meta.height !== declared.h) {
    problems.push(
      `OG画像の寸法が宣言と違います。実体 ${meta.width}×${meta.height} / 宣言 ${declared.w}×${declared.h}。` +
        ' npm run make-brand-images を実行するか、index.html の og:image:width/height を直してください。',
    );
  } else {
    notes.push(`OG画像 ${meta.width}×${meta.height}、宣言と一致しています。`);
  }
}

// 3a) OG画像の版番号が、実体・HTML・JS の3者で一致しているか
//
//     SNSはページURL単位でOGPをキャッシュし、画像を差し替えても取りに来ない。
//     だからURLのほうを変える必要がある。版番号は画像の中身のハッシュなので、
//     画像を作り直せば必ず変わる——はずだが、3者のどれかが古いまま公開されると、
//     そこだけ古いURLを指し、古いカードが出続ける。
//
//     これは人が気をつけて防ぐ種類のものではないので、ここで落とす。
if (existsSync(path.join(DIST, 'ogp.png'))) {
  const { createHash } = await import('node:crypto');
  const bytes = await readFile(path.join(DIST, 'ogp.png'));
  const expected = createHash('sha256').update(bytes).digest('hex').slice(0, 8);

  const inHtml = {
    'og:image': html.match(/og:image" content="[^"]*\?v=([a-f0-9]+)"/)?.[1],
    'og:url': html.match(/og:url" content="[^"]*\?v=([a-f0-9]+)"/)?.[1],
  };
  const jsHits = new Set();
  for (const f of emitted.filter((e) => e.endsWith('.js'))) {
    const body = await readFile(path.join(assets, f), 'utf8');
    for (const m of body.matchAll(/\?v=([a-f0-9]{8})/g)) jsHits.add(m[1]);
  }

  const wrong = Object.entries(inHtml).filter(([, v]) => v !== expected);
  if (wrong.length > 0) {
    problems.push(
      `OG画像の版番号がHTMLとずれています（画像 ${expected} / ` +
        wrong.map(([k, v]) => `${k} ${v ?? '無し'}`).join(' / ') +
        '）。古いカードが出続けます。npm run build を実行し直してください。',
    );
  } else if (jsHits.size > 0 && !jsHits.has(expected)) {
    problems.push(
      `共有URLに埋め込まれた版番号が古いままです（画像 ${expected} / JS ${[...jsHits].join(',')}）。` +
        'サイトから共有したURLが古いカードを指します。',
    );
  } else {
    notes.push(`OG画像の版番号 ${expected} が、画像・HTML・共有URLで一致しています。`);
  }
}

// 3b) タブとホーム画面のアイコン
//     index.html から参照しているのに実体が無いと、既定の白紙アイコンになる
for (const f of ['icon-32.png', 'icon-192.png', 'apple-touch-icon.png']) {
  if (!existsSync(path.join(DIST, f))) {
    problems.push(`dist/${f} がありません。npm run make-brand-images を実行してください。`);
  }
}
if (!/rel="icon"/.test(html)) {
  problems.push('index.html にファビコンの指定がありません。');
} else {
  notes.push('ファビコンとホーム画面アイコンがあります。');
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

// 5) フォントの実体と、外部フォントへの依存が残っていないか
for (const f of ['zen-kaku-700', 'zen-kaku-900', 'noto-sans-jp-400', 'noto-sans-jp-700']) {
  if (!emitted.some((e) => e.startsWith(f) && e.endsWith('.woff2'))) {
    problems.push(`${f} の woff2 が dist/assets/ にありません。npm run build-fonts を実行してください。`);
  }
}
// preload はハッシュ付きの実体を指していないと効かない
if (!/rel="preload"[^>]*noto-sans-jp-400[^>]*.woff2/.test(html)) {
  problems.push('本文フォントの preload が index.html に入っていません。vite.config.ts の preloadFonts を確認してください。');
} else {
  notes.push('フォントの preload が出力されています。');
}
if (/fonts\.(googleapis|gstatic)\.com/.test(html)) {
  problems.push(
    'index.html に Google Fonts への参照が残っています。セルフホストしたので外してください。',
  );
} else {
  notes.push('外部フォントへの依存はありません。');
}

// 5a) 選択の結果と、その後の会話の食い違い
//     合流したビートの本文が特定の経路を前提に書かれていると、
//     別の経路で来た人には意味の通らない会話になる。
//     実際に「疑問を書かずに進んだのに、翌朝『昨日はびっくりしましたね』」が公開されていた。
{
  const { spawnSync } = await import('node:child_process');
  const run = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', path.join(ROOT, 'scripts', 'check-branches.mjs')],
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (run.status !== 0) {
    problems.push(
      '未確認のビート合流があります。npm run check-branches を実行して内容を確認してください。',
    );
  } else {
    notes.push('選択の結果と、その後の会話の食い違いは確認済みです。');
  }
}

// 6) 画面に残った制作メモ
const jsFiles = emitted.filter((f) => f.endsWith('.js'));
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
