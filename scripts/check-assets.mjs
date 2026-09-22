/**
 * シナリオが参照している画像パスが、実際に public/ に存在するかを確認する。
 *
 * 画像が無くてもフォールバックが出るため、欠けていても画面は壊れない。
 * 壊れないぶん気づけないので、ここで一覧にして可視化する。
 *
 *   npm run check-assets
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = await walk(SRC);
const refs = new Map(); // assetPath -> [ソースファイル]

for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const m of text.matchAll(/['"`](\/assets\/[^'"`]+)['"`]/g)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (!refs.has(m[1])) refs.set(m[1], []);
    refs.get(m[1]).push(rel);
  }
}

const missing = [];
const found = [];
for (const [asset, sources] of [...refs].sort()) {
  const onDisk = path.join(PUBLIC, asset.replace(/^\//, ''));
  (existsSync(onDisk) ? found : missing).push({ asset, sources });
}

for (const f of found) console.log(`  OK      ${f.asset}`);
for (const m of missing) {
  console.log(`  MISSING ${m.asset}`);
  for (const s of m.sources) console.log(`            ← ${s}`);
}

console.log(
  `\n参照 ${refs.size} 件：配置済み ${found.length} / 未配置 ${missing.length}`,
);
if (missing.length > 0) {
  console.log(
    '未配置の画像はフォールバック（プレースホルダー、またはチャートの内蔵SVG）で表示されます。',
  );
  console.log(
    '差し替えるには assets-src/<展示室>/ に原本を置いて npm run optimize-images を実行してください。',
  );
}
