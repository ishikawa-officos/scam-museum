/**
 * 経路を総当たりで歩いて、プレイしないと気づけない種類のずれを探す。
 *
 *   npm run check-paths
 *
 * src/lib/validateScenario.ts が見ているのはグラフの形（遷移先の存在、
 * 到達可能性、ID重複）まで。ここで見るのは、歩いてみて初めて分かるもの。
 *
 *   1. 時刻の逆行 … 経路の途中で日付が戻る
 *   2. ambient の取りこぼし … validateScenario は incoming と reaction しか
 *      見ていない。ambient の ID重複と、手口タグはあるのに解説が無いもの
 *   3. 選べない選択肢 … requires を満たす経路がひとつも無い
 *   4. エンディングの等級と被害額の食い違い
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = [
  { id: 'romance-investment', file: 'romance-investment.ts', export: 'romanceInvestment' },
  { id: 'itadaki', file: 'itadaki.ts', export: 'itadaki' },
  { id: 'police-freeze', file: 'police-freeze.ts', export: 'policeFreeze' },
  { id: 'group-investment', file: 'group-investment.ts', export: 'groupInvestment' },
];

/** 「6月23日（月） 07:40」から比較できる数値を作る。月日と時刻だけを見る */
function parseWhen(label) {
  const md = label.match(/(\d{1,2})月(\d{1,2})日/);
  const hm = label.match(/(\d{1,2}):(\d{2})/);
  if (!md) return null;
  return {
    month: Number(md[1]),
    day: Number(md[2]),
    minutes: hm ? Number(hm[1]) * 60 + Number(hm[2]) : 0,
    label,
  };
}

/** 年をまたぐ（12月→1月）のは逆行ではない */
function goesBackwards(prev, next) {
  if (!prev || !next) return false;
  const wrapped = prev.month >= 11 && next.month <= 2;
  if (wrapped) return false;
  if (next.month !== prev.month) return next.month < prev.month;
  if (next.day !== prev.day) return next.day < prev.day;
  return next.minutes < prev.minutes;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function applyEffects(stats, effects) {
  if (!effects) return stats;
  return {
    trust: clamp(stats.trust + (effects.trust ?? 0), 0, 100),
    pressure: clamp(stats.pressure + (effects.pressure ?? 0), 0, 100),
    isolation: clamp(stats.isolation + (effects.isolation ?? 0), 0, 100),
    damage: Math.max(0, stats.damage + (effects.damage ?? 0)),
    days: Math.max(0, stats.days + (effects.days ?? 0)),
  };
}

function available(choice, stats) {
  if (!choice.requires) return true;
  return Object.entries(choice.requires).every(([key, cond]) => {
    const v = stats[key];
    if (cond?.lt !== undefined && !(v < cond.lt)) return false;
    if (cond?.gte !== undefined && !(v >= cond.gte)) return false;
    return true;
  });
}

/**
 * 読んで、そのままでよいと判断した「選べない選択肢」。
 *
 * ビートに選択肢がひとつも出せない状態（行き止まり）は避けたいので、
 * 条件から漏れた場合の受け皿を置くことがある。それは発火しないのが正常。
 */
const REVIEWED_CHOICES = {
  'group-investment/n25/c3':
    '被害0でここに来た場合の受け皿。n25 に来るには入金が要るので実際には発火しないが、' +
    '消すと条件から漏れたときに選択肢の無いビートになる',
};

const MAX_PATHS = 400000;
const problems = [];
const notes = [];

for (const target of TARGETS) {
  const mod = await import(`../src/content/scenarios/${target.file}`);
  const scenario = mod[target.export];
  const beats = new Map(scenario.beats.map((b) => [b.id, b]));
  const endings = new Map(scenario.endings.map((e) => [e.id, e]));

  // ── 2) ambient の取りこぼし ────────────────────
  const seen = new Set();
  for (const beat of scenario.beats) {
    for (const m of [...beat.incoming, ...(beat.ambient ?? [])]) {
      if (seen.has(m.id)) problems.push(`${target.id}: メッセージIDの重複 ${m.id}`);
      seen.add(m.id);
    }
    for (const m of beat.ambient ?? []) {
      if (m.tactics?.length > 0 && !m.note) {
        problems.push(`${target.id}: ${m.id} は手口タグがあるのに解説(note)が無い（ambient）`);
      }
    }
  }

  // ── 1) 3) 4) 経路を歩く ───────────────────────
  const usedChoices = new Set();
  const visitedBeats = new Set();
  const backwards = new Set();
  const endingStats = new Map();
  let paths = 0;
  let truncated = false;

  const walk = (beatId, stats, when, visited) => {
    if (paths >= MAX_PATHS) {
      truncated = true;
      return;
    }
    const beat = beats.get(beatId);
    if (!beat) return;
    visitedBeats.add(beatId);

    let now = when;
    if (beat.timeLabel) {
      const next = parseWhen(beat.timeLabel);
      if (goesBackwards(when, next)) {
        backwards.add(`${when.label} → ${beat.timeLabel}（${beatId}）`);
      }
      if (next) now = next;
    }

    for (const choice of beat.choices) {
      if (!available(choice, stats)) continue;
      usedChoices.add(`${beatId}/${choice.id}`);
      const after = applyEffects(stats, choice.effects);

      if (typeof choice.next === 'object') {
        paths += 1;
        const id = choice.next.ending;
        const cur = endingStats.get(id);
        if (!cur) endingStats.set(id, { min: after.damage, max: after.damage, count: 1 });
        else {
          cur.min = Math.min(cur.min, after.damage);
          cur.max = Math.max(cur.max, after.damage);
          cur.count += 1;
        }
        continue;
      }
      // 同じビートを二度通る経路は、そこで打ち切る（ループの展開を防ぐ）
      if (visited.has(choice.next)) {
        paths += 1;
        continue;
      }
      walk(choice.next, after, now, new Set([...visited, choice.next]));
    }
  };

  walk(scenario.entryBeat, scenario.initialStats, null, new Set([scenario.entryBeat]));

  if (backwards.size > 0) {
    for (const b of backwards) problems.push(`${target.id}: 時刻が戻ります ${b}`);
  }

  // 歩いた範囲のビートだけを見る。打ち切りで辿り着かなかったビートの選択肢を
  // 「選べない」と言うと嘘になる（最初にこれをやって誤検出を出した）
  const allChoices = scenario.beats.flatMap((b) => b.choices.map((c) => `${b.id}/${c.id}`));
  for (const beat of scenario.beats) {
    if (!visitedBeats.has(beat.id)) continue;
    const usable = beat.choices.filter((c) => usedChoices.has(`${beat.id}/${c.id}`));
    if (usable.length === 0) {
      problems.push(`${target.id}: ビート ${beat.id} は、選べる選択肢がひとつもありません（行き止まり）`);
      continue;
    }
    for (const c of beat.choices) {
      if (!usedChoices.has(`${beat.id}/${c.id}`)) {
        const key = `${target.id}/${beat.id}/${c.id}`;
        if (REVIEWED_CHOICES[key]) {
          notes.push(`${key}: 確認済み（${REVIEWED_CHOICES[key]}）`);
          continue;
        }
        problems.push(
          `${target.id}: ${beat.id}/${c.id}「${c.label}」は、歩いた範囲では一度も選べませんでした（requires を満たす経路が無いか、打ち切りの範囲外）`,
        );
      }
    }
  }
  const unvisited = scenario.beats.filter((b) => !visitedBeats.has(b.id)).map((b) => b.id);
  if (unvisited.length > 0) {
    notes.push(`${target.id}: 打ち切りで歩けなかったビート ${unvisited.length} 件（${unvisited.join(', ')}）`);
  }

  // 4) 無傷（A_AVOIDED）なのに被害が出る、被害ゼロなのに完落ち（D_MAJOR）
  for (const [id, d] of endingStats) {
    const ending = endings.get(id);
    if (!ending) continue;
    const { min, max } = d;
    // 「生還」でも、そこまでに渡した分がある経路はありうる（大きい一手の前で止まった場合）。
    // 判定画面はその場合の口上を別に持っている（ResultPage の A_AVOIDED_HURT）ので、
    // ここでは落とさずに知らせるだけにする。
    if (ending.grade === 'A_AVOIDED' && max > 0) {
      notes.push(
        `${target.id}: エンディング ${id} は「生還」だが、最大 ¥${max.toLocaleString()} 渡して到達する経路がある` +
          '（判定画面は被害ありの口上に切り替わる）',
      );
    }
    if (ending.grade === 'D_MAJOR' && min === 0) {
      problems.push(`${target.id}: エンディング ${id} は「完落ち」だが、被害 ¥0 で到達する経路がある`);
    }
  }

  notes.push(
    `${target.id}: 経路 ${paths}${truncated ? '（打ち切り）' : ''} / ` +
      `選択肢 ${allChoices.length} / 到達したエンディング ${endingStats.size}`,
  );
}

for (const n of notes) console.log(`  OK       ${n}`);
for (const p of problems) console.log(`  要確認   ${p}`);

console.log('');
if (problems.length > 0) {
  console.log(`${problems.length} 件の要確認があります。`);
  process.exit(1);
}
console.log('経路チェック: 問題なし。');
