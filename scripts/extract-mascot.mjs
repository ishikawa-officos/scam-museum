/**
 * モック画像から Dr.バグを切り出し、背景を透明にする。
 *
 *   node scripts/extract-mascot.mjs
 *
 * 単純な矩形の切り抜きだと、方眼紙の背景ごと持ってくることになり、
 * 置いた先の色と合わずに「貼り付けた四角」に見える。
 * 外周から塗りつぶし（フラッドフィル）で背景だけを消す。
 *
 * キャラクターの輪郭は濃い線で閉じているので、許容差を持たせた
 * 塗りつぶしは輪郭で止まる。内側の白衣は塗りつぶされない。
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets-src', 'common', 'lab-mockup.png');
const OUT = path.join(ROOT, 'assets-src', 'common');

/** モック内でキャラクターが収まっている範囲 */
const CROP = { left: 236, top: 212, width: 352, height: 420 };

/** 背景と見なす色の許容差（0-255 の各チャンネル差の合計） */
const TOLERANCE = 62;

const { data, info } = await sharp(SRC)
  .extract(CROP)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const at = (x, y) => (y * width + x) * channels;

/** 四隅の平均を背景色とみなす */
const corners = [
  [0, 0],
  [width - 1, 0],
  [0, height - 1],
  [width - 1, height - 1],
];
const bg = [0, 1, 2].map(
  (c) => Math.round(corners.reduce((a, [x, y]) => a + data[at(x, y) + c], 0) / corners.length),
);

const near = (i) =>
  Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) <
  TOLERANCE;

// 外周から到達できる背景色の画素だけを透明にする。
// 画像全体から色で消すと、白衣やハイライトまで抜けてしまう。
const seen = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) {
  stack.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y++) {
  stack.push([0, y], [width - 1, y]);
}

let cleared = 0;
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const key = y * width + x;
  if (seen[key]) continue;
  seen[key] = 1;
  const i = at(x, y);
  if (!near(i)) continue;
  data[i + 3] = 0;
  cleared++;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

await mkdir(OUT, { recursive: true });
await sharp(data, { raw: { width, height, channels } })
  .png()
  .trim({ threshold: 1 }) // 透明になった余白を落とす
  .toFile(path.join(OUT, 'dr-bug.png'));

const out = await sharp(path.join(OUT, 'dr-bug.png')).metadata();
console.log(`背景色 rgb(${bg.join(',')})　透明化 ${cleared} 画素`);
console.log(`dr-bug.png  ${out.width}x${out.height}`);
