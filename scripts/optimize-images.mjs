/**
 * 画像アセットの一括リサイズ・WebP変換
 *
 *   assets-src/<展示室>/*.{png,jpg,jpeg,webp}   ← 生成AIが出した原本（配信しない）
 *        ↓  npm run optimize-images
 *   public/assets/<展示室>/*.webp               ← 実際に配信されるもの
 *
 * 原本を public/ の外に置いているのは、public/ の中身がそのまま dist/ に
 * コピーされるため。原本を置いたままにすると数MBの元画像まで配信されてしまう。
 *
 * 用途ごとの出力サイズは RULES で決まる。ファイル名に応じて自動で振り分けるので、
 * 新しい画像を追加するときは assets-src/ に置いて実行するだけでよい。
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'assets-src');
const OUT_DIR = path.join(ROOT, 'public', 'assets');

/**
 * ファイル名に含まれる語で出力仕様を決める。上から順に最初に一致したものを使う。
 * - fit: 'cover' は正方形に切り抜く（アイコン用）
 * - quality は WebP の品質。写真は 78 前後で劣化がほぼ分からない
 */
const RULES = [
  { match: /avatar|icon/i, width: 128, height: 128, fit: 'cover', quality: 82 },
  { match: /chart|screen|graph/i, width: 800, quality: 80 },
  { match: /.*/, width: 720, quality: 78 }, // 吹き出し内の写真（表示幅は最大でも約300px）
];

const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

/**
 * 正方形に切り抜くとき（アイコン）、どこを中心にするか。0〜1の相対座標。
 *
 * sharp の被写体検出は、横長の自撮りだと手や明るい窓を拾って顔を外すことがある。
 * 顔の位置が分かっている画像は、ここで明示する。未指定なら自動検出に任せる。
 * 画像を作り直して顔の位置が変わったら、この値も調整すること。
 */
const FOCUS = {
  'yua-avatar': { x: 0.56, y: 0.42 },
};

function focusCrop(meta, focus) {
  const side = Math.min(meta.width, meta.height);
  const clamp = (v, max) => Math.max(0, Math.min(Math.round(v), max));
  return {
    left: clamp(focus.x * meta.width - side / 2, meta.width - side),
    top: clamp(focus.y * meta.height - side / 2, meta.height - side),
    width: side,
    height: side,
  };
}

function ruleFor(filename) {
  return RULES.find((r) => r.match.test(filename));
}

function formatBytes(n) {
  return n < 1024 * 1024 ? `${(n / 1024).toFixed(0)}KB` : `${(n / 1048576).toFixed(2)}MB`;
}

async function listRooms() {
  if (!existsSync(SRC_DIR)) return [];
  const entries = await readdir(SRC_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function processRoom(room) {
  const srcRoom = path.join(SRC_DIR, room);
  const outRoom = path.join(OUT_DIR, room);
  await mkdir(outRoom, { recursive: true });

  const files = (await readdir(srcRoom)).filter((f) =>
    SOURCE_EXT.has(path.extname(f).toLowerCase()),
  );
  if (files.length === 0) return { room, results: [] };

  const results = [];
  for (const file of files) {
    const srcPath = path.join(srcRoom, file);
    const name = path.basename(file, path.extname(file));
    const outPath = path.join(outRoom, `${name}.webp`);
    const rule = ruleFor(name);

    const before = (await stat(srcPath)).size;
    const image = sharp(srcPath).rotate(); // Exif の向きを反映
    const meta = await image.metadata();

    // 顔の位置を指定してある画像は、先に正方形へ切り抜いてから縮小する
    const focus = rule.fit === 'cover' ? FOCUS[name] : undefined;
    if (focus) image.extract(focusCrop(meta, focus));

    await image
      .resize({
        width: rule.width,
        height: rule.height,
        fit: rule.fit ?? 'inside',
        position: 'attention', // cover のとき、被写体が中心に来るように切り抜く
        withoutEnlargement: true,
      })
      .webp({ quality: rule.quality })
      .toFile(outPath);

    const after = (await stat(outPath)).size;
    results.push({
      name: `${name}.webp`,
      from: `${meta.width}×${meta.height} ${formatBytes(before)}`,
      to: `${formatBytes(after)}`,
      saved: 1 - after / before,
      bytes: after,
    });
  }
  return { room, results };
}

const rooms = await listRooms();
if (rooms.length === 0) {
  console.log(`原本が見つかりません。${path.relative(ROOT, SRC_DIR)}/<展示室名>/ に画像を置いてください。`);
  process.exit(0);
}

let total = 0;
const manifest = {};

for (const room of rooms) {
  const { results } = await processRoom(room);
  if (results.length === 0) continue;
  console.log(`\n${room}/`);
  for (const r of results) {
    console.log(
      `  ${r.name.padEnd(26)} ${r.from.padEnd(22)} → ${r.to.padStart(6)}  (-${(r.saved * 100).toFixed(0)}%)`,
    );
    total += r.bytes;
    manifest[`/assets/${room}/${r.name}`] = r.bytes;
  }
}

// シナリオ側がどのパスを使えばいいか一目で分かるように一覧を残す
await writeFile(
  path.join(OUT_DIR, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`\n合計 ${formatBytes(total)}（public/assets/manifest.json を更新しました）`);
