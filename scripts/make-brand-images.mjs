/**
 * タブのアイコン（ファビコン）と、SNSで共有したときの画像（OGP）を作る。
 *
 *   npm run make-brand-images
 *
 * どちらも Dr.バグを使う。館の顔が二面性を持っていることを、
 * サイトを開く前（リンクの見た目）から伝えたいため。
 *
 * ファビコンは顔だけを切り出す。全身を 32px に縮めると、
 * 何が描いてあるか分からない灰色の塊になる。
 * 二面性が読み取れるのは顔なので、そこだけを使う。
 *
 * OGP は本文を SVG で組んでラスタライズする。画像生成AIに作らせると
 * 日本語の字形が崩れるし、公開ドメインや文言を変えるたびに作り直せない。
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MASCOT = path.join(ROOT, 'assets-src', 'common', 'dr-bug.png');
const OUT = path.join(ROOT, 'public');

const FONT = "'Yu Gothic UI','Yu Gothic','Meiryo','Hiragino Sans',sans-serif";

/* 館内モードの表の顔と同じ色 */
const BG = '#eaf5f1';
const PAPER = '#faf7ef';
const LINE = '#c5ddd5';
const TEXT = '#123b36';
const MUTED = '#4f6f69';
const ORANGE = '#e2622f';
const TAPE = '#fde68a';

/** dr-bug.png（274×380）のうち、顔が収まっている範囲 */
const HEAD = { left: 18, top: 6, width: 240, height: 224 };

/* ── ファビコン ───────────────────────────────────────── */

const head = await sharp(MASCOT).extract(HEAD).png().toBuffer();

/** 顔を、角丸の下地の上に乗せる */
async function icon(size) {
  const pad = Math.round(size * 0.06);
  const inner = size - pad * 2;
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="${PAPER}"/>
       <rect x="1" y="1" width="${size - 2}" height="${size - 2}"
             rx="${Math.round(size * 0.21)}" fill="none" stroke="${LINE}" stroke-width="2"/>
     </svg>`,
  );
  const face = await sharp(head).resize({ width: inner, height: inner, fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(bg).composite([{ input: face, top: pad, left: pad }]).png().toBuffer();
}

for (const size of [32, 180, 192, 512]) {
  const buf = await icon(size);
  const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
  await writeFile(path.join(OUT, name), buf);
  console.log(`  ${name}  ${size}×${size}  ${(buf.length / 1024).toFixed(0)}KB`);
}

/* ── OGP（1200×630）────────────────────────────────────
   LINE や X に貼られたときに出る画像。
   文字は小さく出るので、要素を詰め込まない。 */

const W = 1200;
const H = 630;
const mascotW = 380;
const mascot = await sharp(MASCOT)
  .resize({ width: mascotW })
  .png()
  .toBuffer();
const mascotDataUri = `data:image/png;base64,${mascot.toString('base64')}`;
const mascotH = Math.round((await sharp(mascot).metadata()).height);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M28 0H0V28" fill="none" stroke="${LINE}" stroke-width="1" opacity="0.55"/>
    </pattern>
    <pattern id="tape" width="40" height="40" patternUnits="userSpaceOnUse"
             patternTransform="rotate(-45)">
      <rect width="20" height="40" fill="${TAPE}"/>
      <rect x="20" width="20" height="40" fill="#ffffff"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="16" fill="url(#tape)"/>
  <rect y="${H - 16}" width="${W}" height="16" fill="url(#tape)"/>

  <image href="${mascotDataUri}" x="86" y="${Math.round((H - mascotH) / 2) + 6}"
         width="${mascotW}" height="${mascotH}"/>

  <g transform="translate(520, 0)">
    <text x="0" y="214" font-family="${FONT}" font-size="30" font-weight="700"
          letter-spacing="7" fill="${MUTED}">MUSEUM OF BEING FOOLED</text>

    <text x="0" y="310" font-family="${FONT}" font-size="86" font-weight="700" fill="${TEXT}">
      だまされる<tspan fill="${ORANGE}">博物館</tspan>
    </text>

    <text x="0" y="372" font-family="${FONT}" font-size="38" font-weight="700" fill="${TEXT}">
      認知バイアス臨床実験室
    </text>

    <rect x="0" y="404" width="76" height="5" rx="2.5" fill="${ORANGE}"/>

    <text x="0" y="460" font-family="${FONT}" font-size="27" fill="${MUTED}">
      実際に使われている詐欺の手口を、
    </text>
    <text x="0" y="500" font-family="${FONT}" font-size="27" fill="${MUTED}">
      一円も失わずに体験できる展示。全4室。
    </text>
  </g>
</svg>`;

const ogp = await sharp(Buffer.from(svg), { density: 96 }).png({ quality: 92 }).toBuffer();
await writeFile(path.join(OUT, 'ogp.png'), ogp);
console.log(`  ogp.png  ${W}×${H}  ${(ogp.length / 1024).toFixed(0)}KB`);
