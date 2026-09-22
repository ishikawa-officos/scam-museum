/**
 * サブセットに収録する文字の集合。
 *
 * build-fonts（作る側）と check-fonts（漏れを見つける側）が同じ定義を見るために
 * 切り出してある。ここがずれると、チェックが素通りするのに豆腐が出る。
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 使用箇所にかかわらず必ず含めるもの。
 * かなと記号は数が少なく、本文を書き足したときに真っ先に増えるので全部入れる。
 * 漢字だけは使用分に絞る（1023字あり、全部入れると桁が変わる）。
 */
export const ALWAYS = [
  ...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)), // ASCII
  ...Array.from({ length: 96 }, (_, i) => String.fromCharCode(0x3040 + i)), // ひらがな
  ...Array.from({ length: 96 }, (_, i) => String.fromCharCode(0x30a0 + i)), // カタカナ
  ...'　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈〉《》「」『』【】＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄¢£％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓',
  ...Array.from({ length: 10 }, (_, i) => String.fromCharCode(0xff10 + i)), // 全角数字
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(0xff21 + i)), // 全角英大
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(0xff41 + i)), // 全角英小
];

/**
 * 見出し用（Zen Kaku Gothic New）に収録する漢字。
 *
 * 見出しに出る漢字は本文よりずっと少ない（181字 対 1023字）。
 * 全部入れると本文用と同じ重さになるので、実際に見出しとして描画された文字を
 * ブラウザで走査して拾った一覧を使う。更新の手順は README を参照。
 *
 * ここに漏れがあっても壊れない。フォントスタックが
 * Zen Kaku → Noto Sans JP の順なので、無い字は本文用の書体で出る。
 * 見出しの中で一字だけ書体が変わるだけで、豆腐にはならない。
 */
export async function displayCharacters() {
  const kanji = await readFile(path.join(ROOT, 'scripts', 'display-kanji.txt'), 'utf8');
  const set = new Set([...ALWAYS, ...kanji.trim()]);
  for (const ch of [...set]) if (ch.codePointAt(0) < 0x20) set.delete(ch);
  return [...set].sort();
}

/** 画面に出る可能性のあるファイルを走査して、現れる全文字を返す */
export async function collectCharacters() {
  const files = [];
  async function walk(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (/\.(ts|tsx|css|html)$/.test(e.name)) files.push(p);
    }
  }
  await walk(path.join(ROOT, 'src'));
  files.push(path.join(ROOT, 'index.html'));

  const set = new Set(ALWAYS);
  for (const f of files) for (const ch of await readFile(f, 'utf8')) set.add(ch);
  for (const ch of [...set]) if (ch.codePointAt(0) < 0x20) set.delete(ch);
  return [...set].sort();
}
