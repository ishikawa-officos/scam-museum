/**
 * 使っている文字だけに絞ったフォントを作り、同一オリジンに置く。
 *
 *   npm run build-fonts
 *
 * なぜセルフホストするか：
 *   Google Fonts の <link> はレンダリングを止める。しかもこのサイトの構成だと
 *   返ってくる CSS が 145KB あり、アプリ本体の JS より大きい。
 *   5ウェイト × 約120分割の @font-face 宣言が並ぶため。
 *   別ドメインへの DNS・TLS・CSS取得・woff2取得と往復が重なり、
 *   LCP が 0.7〜2.6秒の幅で揺れていた。自前で配れば往復が消える。
 *
 * なぜ「使っている文字だけ」か：
 *   日本語フォントは1ウェイトで数MBある。素朴にセルフホストすると、
 *   レンダリングを止めるのをやめた代わりに桁違いの転送量を招く。
 *   このサイトの本文はすべてビルド時に確定しているので、絞り込める。
 *
 * 本文用と見出し用で収録範囲が違う：
 *   本文（Noto Sans JP）は画面に出る全文字。
 *   見出し（Zen Kaku Gothic New）は見出しに実際に出た漢字だけ。
 *   見出しの漢字は181字しかなく、本文の1023字を入れると重さが倍になる。
 *
 * 漏れたときどうなるか：
 *   本文用は src を機械的に走査しているので漏れない（check-fonts が検査する）。
 *   見出し用が漏れても壊れない。フォントスタックが Zen Kaku → Noto Sans JP の
 *   順なので、無い字は本文用の書体で出る。見出しの中で一字だけ書体が変わるだけ。
 *
 * Google Fonts の text= によるサブセット配信は使わない。
 * Zen Kaku Gothic New では text= が黙って無視され、標準の分割が返ってくる。
 * 相手の実装に依存せず、原本から自分で切り出す。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import subsetFont from 'subset-font';
import { ROOT, collectCharacters, displayCharacters } from './font-charset.mjs';

const OUT = path.join(ROOT, 'src', 'fonts');
const LICENSE_OUT = path.join(ROOT, 'public', 'fonts');
const GF = 'https://raw.githubusercontent.com/google/fonts/main/ofl';

const FACES = [
  {
    out: 'zen-kaku-700',
    family: 'Zen Kaku Gothic New',
    weight: 700,
    scope: 'display',
    src: `${GF}/zenkakugothicnew/ZenKakuGothicNew-Bold.ttf`,
  },
  {
    out: 'zen-kaku-900',
    family: 'Zen Kaku Gothic New',
    weight: 900,
    scope: 'display',
    src: `${GF}/zenkakugothicnew/ZenKakuGothicNew-Black.ttf`,
  },
  {
    out: 'noto-sans-jp-400',
    family: 'Noto Sans JP',
    weight: 400,
    scope: 'body',
    src: `${GF}/notosansjp/NotoSansJP%5Bwght%5D.ttf`,
    // 可変フォントなので、切り出しと同時にウェイトを固定する
    variationAxes: { wght: 400 },
  },
  {
    out: 'noto-sans-jp-700',
    family: 'Noto Sans JP',
    weight: 700,
    scope: 'body',
    src: `${GF}/notosansjp/NotoSansJP%5Bwght%5D.ttf`,
    variationAxes: { wght: 700 },
  },
];

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} の取得に失敗 (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

const bodyChars = await collectCharacters();
const displayChars = await displayCharacters();
const text = { body: bodyChars.join(''), display: displayChars.join('') };

console.log(`本文用 ${bodyChars.length} 字 ／ 見出し用 ${displayChars.length} 字\n`);

await mkdir(OUT, { recursive: true });
await mkdir(LICENSE_OUT, { recursive: true });

const cache = new Map(); // 同じ原本を2回落とさない
let total = 0;

for (const face of FACES) {
  if (!cache.has(face.src)) {
    process.stdout.write(`  原本 ${path.basename(decodeURIComponent(face.src))} … `);
    cache.set(face.src, await download(face.src));
    console.log(`${(cache.get(face.src).length / 1024 / 1024).toFixed(1)}MB`);
  }
  const buf = await subsetFont(cache.get(face.src), text[face.scope], {
    targetFormat: 'woff2',
    variationAxes: face.variationAxes,
  });
  await writeFile(path.join(OUT, `${face.out}.woff2`), buf);
  total += buf.length;
  console.log(
    `  ${face.out}.woff2  ${String(Math.round(buf.length / 1024)).padStart(4)}KB  ` +
      `(${face.family} ${face.weight} / ${face.scope})`,
  );
}

// 何を収録したかを残す。check-fonts がこれと現在の本文を突き合わせて、
// 生成し忘れ（＝豆腐になる文字）を検出する
await writeFile(
  path.join(OUT, 'manifest.json'),
  JSON.stringify({ body: text.body, display: text.display }),
  'utf8',
);

const [zenLicense, notoLicense] = await Promise.all([
  download(`${GF}/zenkakugothicnew/OFL.txt`).then((b) => b.toString('utf8')),
  download(`${GF}/notosansjp/OFL.txt`).then((b) => b.toString('utf8')),
]);

await writeFile(
  path.join(LICENSE_OUT, 'OFL.txt'),
  `このフォルダの woff2 は scripts/build-fonts.mjs が生成しています。手で編集しないでください。\n` +
    `本文用 ${bodyChars.length} 字 ／ 見出し用 ${displayChars.length} 字\n\n` +
    `${'='.repeat(70)}\nZen Kaku Gothic New\n${'='.repeat(70)}\n${zenLicense}\n\n` +
    `${'='.repeat(70)}\nNoto Sans JP\n${'='.repeat(70)}\n${notoLicense}\n`,
  'utf8',
);

console.log(`\n合計 ${(total / 1024).toFixed(0)}KB を public/fonts/ に出力しました。`);
