/**
 * 第1展示室の「相手が送ってくる運用実績のスクリーンショット」を生成する。
 *
 *   node scripts/make-charts.mjs
 *
 * 画像生成AIに描かせると、日本語の字形と数字が崩れる（「評価損益」が
 * 「評佃損益」になる類）。この2枚は数字そのものが展示の中身なので、
 * SVGで描いてラスタライズしている。金額を変えたいときはここを直す。
 *
 * 縦横比の制約：チャットの吹き出しに入るので、縦に長いと選択肢パネルに
 * 隠れて下半分が読めなくなる。アプリ画面まるごとではなく、
 * 「必要な部分だけ切り取って送った」体裁の、正方形に近い比率にしてある。
 *
 * 出力先は assets-src/romance/。配信用の webp は optimize-images が作る。
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets-src', 'romance');

const W = 440;
const FONT = "'Yu Gothic UI','Yu Gothic','Meiryo','Hiragino Sans',sans-serif";

const BG = '#0b1020';
const CARD = '#141b2e';
const LINE = '#1f2940';
const TEXT = '#e8edf7';
const MUTED = '#7b8699';
const GREEN = '#34d399';

/** 数値の列を折れ線の座標文字列にする */
function polyline(values, x0, y0, w, h) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = x0 + (w * i) / (values.length - 1);
      const y = y0 + h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/** ステータスバー。これがあるだけで「スクリーンショット」に見える */
function statusBar(h, time) {
  return `
  <rect width="${W}" height="${h}" fill="${BG}"/>
  <text x="20" y="24" fill="${TEXT}" font-size="12" font-family="${FONT}" font-weight="600">●●●●</text>
  <text x="${W / 2}" y="24" fill="${TEXT}" font-size="12.5" font-family="${FONT}" font-weight="600" text-anchor="middle">${time}</text>
  <text x="${W - 20}" y="24" fill="${TEXT}" font-size="12" font-family="${FONT}" text-anchor="end">86%</text>
  `;
}

function brand(x, y) {
  return `
  <text x="${x}" y="${y}" fill="${TEXT}" font-size="11" font-family="${FONT}"
        letter-spacing="2.4" opacity="0.72" text-anchor="end">MERIDIAN</text>
  <text x="${x}" y="${y + 12}" fill="${MUTED}" font-size="8" font-family="${FONT}"
        letter-spacing="3" text-anchor="end">CAPITAL</text>
  `;
}

/* ── ① 12月の実績。控えめで、堅実に見えること ───────────────── */

const DEC_H = 424;

const DEC_SERIES = [
  300000, 300800, 301600, 300900, 302400, 303100, 302200, 303900, 304800, 304100, 305600, 306400,
  305700, 307100, 308000, 307200, 306100, 307800, 308900, 308200, 309600, 310400, 309300, 310800,
  309900, 311200, 310300, 311600, 311100, 312000, 312480,
];

const december = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${DEC_H}" viewBox="0 0 ${W} ${DEC_H}">
  <defs>
    <linearGradient id="fillDec" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${GREEN}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${GREEN}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${statusBar(DEC_H, '22:41')}

  <text x="20" y="56" fill="${TEXT}" font-size="18" font-family="${FONT}" font-weight="700">ホーム</text>
  ${brand(W - 20, 48)}

  <rect x="16" y="72" width="${W - 32}" height="336" rx="16" fill="${CARD}"/>

  <text x="${W / 2}" y="100" fill="${MUTED}" font-size="11.5" font-family="${FONT}" text-anchor="middle">現在の評価額</text>
  <text x="${W / 2}" y="134" fill="${TEXT}" font-size="30" font-family="${FONT}" font-weight="700" text-anchor="middle">¥312,480</text>

  <text x="${W / 2}" y="162" fill="${MUTED}" font-size="11.5" font-family="${FONT}" text-anchor="middle">評価損益</text>
  <text x="${W / 2}" y="186" fill="${GREEN}" font-size="17" font-family="${FONT}" font-weight="700" text-anchor="middle">+¥12,480（+4.16%）</text>

  ${[0, 1, 2].map((i) => `<rect x="36" y="${214 + i * 47}" width="${W - 118}" height="1" fill="${LINE}"/>`).join('')}
  <text x="${W - 74}" y="218" fill="${MUTED}" font-size="9.5" font-family="${FONT}">312,000</text>
  <text x="${W - 74}" y="265" fill="${MUTED}" font-size="9.5" font-family="${FONT}">306,000</text>
  <text x="${W - 74}" y="312" fill="${MUTED}" font-size="9.5" font-family="${FONT}">300,000</text>

  <polygon points="36,308 ${polyline(DEC_SERIES, 36, 210, W - 118, 98)} ${W - 82},308" fill="url(#fillDec)"/>
  <polyline points="${polyline(DEC_SERIES, 36, 210, W - 118, 98)}"
            fill="none" stroke="${GREEN}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>

  ${['12/1', '12/8', '12/15', '12/22', '12/31']
    .map((d, i) => {
      const x = 36 + ((W - 118) * i) / 4;
      const anchor = i === 0 ? 'start' : i === 4 ? 'end' : 'middle';
      return `<text x="${x}" y="328" fill="${MUTED}" font-size="9.5" font-family="${FONT}" text-anchor="${anchor}">${d}</text>`;
    })
    .join('')}

  <rect x="36" y="348" width="${W - 72}" height="1" fill="${LINE}"/>
  <text x="36" y="374" fill="${MUTED}" font-size="11.5" font-family="${FONT}">当月投資額</text>
  <text x="${W - 36}" y="374" fill="${TEXT}" font-size="12.5" font-family="${FONT}" font-weight="700" text-anchor="end">¥300,000</text>
  <text x="36" y="396" fill="${MUTED}" font-size="11.5" font-family="${FONT}">期間</text>
  <text x="${W - 36}" y="396" fill="${MUTED}" font-size="11.5" font-family="${FONT}" text-anchor="end">12/1 - 12/31</text>
</svg>`;

/* ── ② 直近3日の急騰。淡々と結果だけを見せる ────────────────── */

const SURGE_H = 448;

const SURGE_SERIES = [
  5240, 5210, 5180, 5150, 5170, 5140, 5120, 5160, 5190, 5150, 5180, 5230, 5290, 5380, 5510, 5700,
  5960, 6300, 6720, 7210, 7760, 8420,
];

const surge = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${SURGE_H}" viewBox="0 0 ${W} ${SURGE_H}">
  <defs>
    <linearGradient id="fillSurge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${GREEN}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${GREEN}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${statusBar(SURGE_H, '20:08')}

  ${brand(W - 20, 50)}
  <text x="20" y="56" fill="${TEXT}" font-size="15" font-family="${FONT}" font-weight="700">直近3日の推移</text>
  <rect x="0" y="72" width="${W}" height="1" fill="${LINE}"/>

  <text x="20" y="102" fill="${MUTED}" font-size="11.5" font-family="${FONT}">評価額</text>
  <text x="${W - 20}" y="102" fill="${MUTED}" font-size="11" font-family="${FONT}" text-anchor="end">運用 118 日目</text>
  <text x="20" y="140" fill="${TEXT}" font-size="32" font-family="${FONT}" font-weight="700">¥8,420,000</text>
  <text x="20" y="168" fill="${GREEN}" font-size="16" font-family="${FONT}" font-weight="700">+¥3,180,000（+60.7%）</text>

  ${[0, 1, 2, 3].map((i) => `<rect x="20" y="${206 + i * 56}" width="${W - 40}" height="1" fill="${LINE}" opacity="0.7"/>`).join('')}

  <polygon points="20,374 ${polyline(SURGE_SERIES, 20, 202, W - 40, 172)} ${W - 20},374" fill="url(#fillSurge)"/>
  <polyline points="${polyline(SURGE_SERIES, 20, 202, W - 40, 172)}"
            fill="none" stroke="${GREEN}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="${W - 20}" cy="202" r="4" fill="${GREEN}"/>

  ${['3/25', '3/26', '3/27']
    .map((d, i) => {
      const x = 20 + ((W - 40) * i) / 2;
      const anchor = i === 0 ? 'start' : i === 2 ? 'end' : 'middle';
      return `<text x="${x}" y="396" fill="${MUTED}" font-size="10" font-family="${FONT}" text-anchor="${anchor}">${d}</text>`;
    })
    .join('')}

  <rect x="20" y="412" width="${W - 40}" height="1" fill="${LINE}"/>
  <text x="20" y="434" fill="${MUTED}" font-size="11" font-family="${FONT}">元本 ¥5,240,000</text>
  <text x="${W - 20}" y="434" fill="${MUTED}" font-size="11" font-family="${FONT}" text-anchor="end">最終更新 3/27 20:04</text>
</svg>`;

/* ── 出力 ───────────────────────────────────────────── */

const JOBS = [
  ['chart-december', december],
  ['chart-surge', surge],
];

for (const [name, svg] of JOBS) {
  await sharp(Buffer.from(svg), { density: 220 })
    .resize({ width: W * 2 })
    .png()
    .toFile(path.join(OUT, `${name}.png`));
  await writeFile(path.join(OUT, `${name}.svg`), svg, 'utf8');
  console.log(`  ${name}.png`);
}

console.log('\nassets-src/romance/ に出力しました。npm run optimize-images で配信用に変換されます。');
