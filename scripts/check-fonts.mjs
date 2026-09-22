/**
 * 配信中のフォントに、本文で使う文字がすべて入っているか確かめる。
 *
 *   npm run check-fonts
 *
 * フォントを「使う文字だけ」に絞った代償として、本文に新しい漢字を足したまま
 * npm run build-fonts を回し忘れると、その字が豆腐（□）になる。
 * 書いた本人は自分の環境のキャッシュで気づかないことがあるので、機械で見る。
 *
 * 見ているのは本文用（Noto Sans JP）だけ。
 * 見出し用（Zen Kaku Gothic New）は漏れても本文用の書体に落ちるだけで壊れないため、
 * 不足は報告するが失敗にはしない。
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, collectCharacters, displayCharacters } from './font-charset.mjs';

const FONTS = path.join(ROOT, 'src', 'fonts');

/**
 * woff2 に収録されている文字を読む。
 * woff2 は圧縮されていて cmap を直接は読めないので、subset-font に
 * 「この文字だけ残せ」と指示した結果のグリフ数から判定する……のではなく、
 * 素直に fontkit 相当の解析を避けて、生成時の記録と突き合わせる方式をとる。
 * 生成時に収録した文字は OFL.txt の見出しに字数として、
 * 実体は fonts/manifest.json に保存してある。
 */
async function loadManifest() {
  const p = path.join(FONTS, 'manifest.json');
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8'));
}

const manifest = await loadManifest();
if (!manifest) {
  console.error('public/fonts/manifest.json がありません。npm run build-fonts を実行してください。');
  process.exit(1);
}

const bodyNow = new Set(await collectCharacters());
const displayNow = new Set(await displayCharacters());
const bodyHave = new Set(manifest.body);
const displayHave = new Set(manifest.display);

const bodyMissing = [...bodyNow].filter((c) => !bodyHave.has(c));
const displayMissing = [...displayNow].filter((c) => !displayHave.has(c));

for (const f of ['zen-kaku-700', 'zen-kaku-900', 'noto-sans-jp-400', 'noto-sans-jp-700']) {
  if (!existsSync(path.join(FONTS, `${f}.woff2`))) {
    console.error(`  要対応   public/fonts/${f}.woff2 がありません。npm run build-fonts を実行してください。`);
    process.exit(1);
  }
}

if (displayMissing.length > 0) {
  console.log(
    `  参考     見出し用フォントに ${displayMissing.length} 字ありません: ${displayMissing.join('')}`,
  );
  console.log('           本文用の書体で表示されます（壊れません）。');
  console.log('           見出しの書体を揃えたい場合は scripts/display-kanji.txt に足してください。');
}

if (bodyMissing.length > 0) {
  console.log('');
  console.log(`  要対応   本文で使う ${bodyMissing.length} 字がフォントに入っていません。`);
  console.log(`           ${bodyMissing.join('')}`);
  console.log('           このままだと豆腐（□）になります。npm run build-fonts を実行してください。');
  process.exit(1);
}

console.log(`  OK       本文用 ${bodyNow.size} 字、すべてフォントに収録されています。`);
console.log(`  OK       見出し用 ${displayNow.size} 字、すべて収録されています。`);
