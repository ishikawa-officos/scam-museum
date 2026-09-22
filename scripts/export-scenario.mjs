/**
 * シナリオをレビュー用の Markdown に書き出す。
 *
 *   npm run export-scenario                 … 全シナリオ
 *   npm run export-scenario -- itadaki      … 指定したものだけ
 *
 * 手で書き写すとシナリオ本体と必ずずれるので、TSから生成する。
 * シナリオファイルは型定義しか import していないため、Node の型ストリップで
 * そのまま読み込める（ビルド不要）。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'docs');

const TARGETS = [
  { id: 'romance-investment', file: 'romance-investment.ts', out: 'scenario-01-romance.md' },
  { id: 'itadaki', file: 'itadaki.ts', out: 'scenario-02-itadaki.md' },
  { id: 'police-freeze', file: 'police-freeze.ts', out: 'scenario-03-police.md' },
  { id: 'group-investment', file: 'group-investment.ts', out: 'scenario-04-group.md' },
];

const { TACTICS } = await import('../src/content/tactics.ts');

const tacticLabel = (id) => (TACTICS[id] ? `#${String(TACTICS[id].no).padStart(2, '0')} ${TACTICS[id].name}` : id);
const yen = (n) => `¥${Number(n).toLocaleString('ja-JP')}`;

function effectsText(effects) {
  if (!effects) return '';
  const order = ['trust', 'pressure', 'isolation', 'damage', 'days'];
  const label = { trust: '信頼', pressure: '切迫', isolation: '孤立', damage: '被害', days: '経過' };
  const parts = order
    .filter((k) => effects[k] !== undefined)
    .map((k) => {
      const v = effects[k];
      if (k === 'damage') return `被害 ${v >= 0 ? '+' : '−'}${yen(Math.abs(v))}`;
      if (k === 'days') return `経過 +${v}日`;
      return `${label[k]} ${v >= 0 ? '+' : ''}${v}`;
    });
  return parts.join(' / ');
}

function mediaText(media) {
  if (!media) return '';
  switch (media.kind) {
    case 'image':
      return `　🖼 画像：${media.alt}（\`${media.src}\`）`;
    case 'chart':
      return `　📈 チャート：${media.label}${media.src ? `（\`${media.src}\`）` : '（内蔵SVG）'}`;
    case 'receipt':
      return `　🧾 明細：${media.label} ${yen(media.amount)}`;
    case 'linkCard':
      return `　🔗 リンクカード：${media.title} / \`${media.domain}\``;
    default:
      return '';
  }
}

function speakerName(scenario, m) {
  if (m.speakerId && scenario.speakers?.[m.speakerId]) return scenario.speakers[m.speakerId].name;
  return scenario.contact.displayName;
}

function messageLines(m, speaker) {
  const who = m.from === 'system' ? 'システム' : m.from === 'me' ? 'あなた' : speaker;
  const out = [`- **${who}**：${m.body}`];
  const media = mediaText(m.media);
  if (media) out.push(`  - ${media.trim()}`);
  if (m.tactics.length > 0) {
    out.push(`  - 🚩 **手口**：${m.tactics.map(tacticLabel).join(' / ')}`);
    if (m.note) out.push(`  - 💡 解説：${m.note}`);
  }
  return out;
}

function render(s, sourceFile) {
  const L = [];
  const beatIndex = new Map(s.beats.map((b, i) => [b.id, i + 1]));
  const nextLabel = (next) =>
    typeof next === 'object'
      ? `**結末：${next.ending}**`
      : `→ ${next}（#${beatIndex.get(next) ?? '?'}）`;

  L.push(`# ${s.roomLabel}「${s.title}」シナリオ全文`);
  L.push('');
  L.push('> このファイルは `npm run export-scenario` で自動生成されます。');
  L.push('> 直接編集しても次回の生成で上書きされます。本文の修正は');
  L.push(`> \`src/content/scenarios/${sourceFile}\` 側で行ってください。`);
  L.push('');
  L.push(`- 生成日時：${new Date().toISOString().slice(0, 10)}`);
  L.push(`- ビート数：${s.beats.length}　／　結末：${s.endings.length}`);
  L.push(`- 想定所要時間：約${s.estimatedMinutes}分`);
  L.push('');

  L.push('## プレイヤー設定');
  L.push('');
  for (const line of s.persona.summary) L.push(`- ${line}`);
  L.push(`- 預貯金：${yen(s.persona.savings)}`);
  L.push('');
  L.push(`## 相手：${s.contact.displayName}`);
  L.push('');
  L.push(`- 表示名：${s.contact.displayName}`);
  if (s.contact.avatarSrc) L.push(`- アイコン：\`${s.contact.avatarSrc}\``);
  L.push('');

  // 手口の登場回数
  const counts = new Map();
  const bump = (t) => counts.set(t, (counts.get(t) ?? 0) + 1);
  for (const b of s.beats) {
    for (const m of b.incoming) m.tactics.forEach(bump);
    for (const c of b.choices) for (const m of c.reaction ?? []) m.tactics.forEach(bump);
    if (b.web?.annotation) b.web.annotation.tactics.forEach(bump);
    if (b.call?.annotation) b.call.annotation.tactics.forEach(bump);
    if (b.group?.annotation) b.group.annotation.tactics.forEach(bump);
    for (const m of b.ambient ?? []) m.tactics.forEach(bump);
  }
  L.push('## 使われている手口');
  L.push('');
  L.push('| 手口 | 登場回数 |');
  L.push('|---|---|');
  for (const [t, n] of [...counts].sort((a, b) => b[1] - a[1])) L.push(`| ${tacticLabel(t)} | ${n} |`);
  L.push('');

  L.push('## ビート一覧');
  L.push('');
  for (const [i, b] of s.beats.entries()) {
    L.push(`### ${i + 1}. \`${b.id}\`${b.timeLabel ? `　${b.timeLabel}` : ''}`);
    L.push('');
    if (b.pivotal) {
      L.push(`> ⚡ **ここが分かれ道でした — ${b.pivotal.headline}**`);
      L.push('>');
      L.push(`> ${b.pivotal.body}`);
      L.push('');
    }
    if (b.group) {
      L.push(`**［グループチャット］${b.group.name}（表示上の参加人数 ${b.group.memberCount}）**`);
      L.push('');
      if (b.group.pinned) L.push(`- ピン留め：${b.group.pinned}`);
      if (b.group.annotation) {
        L.push(`- 🚩 **手口**：${b.group.annotation.tactics.map(tacticLabel).join(' / ')}`);
        L.push(`- 💡 解説：${b.group.annotation.note}`);
      }
      L.push('');
    }
    if (b.call) {
      L.push(
        `**［通話画面：${b.call.state === 'incoming' ? '着信中' : '通話中'}］${b.call.callerName}**`,
      );
      L.push('');
      if (b.call.callerClaim) L.push(`- 名乗り：${b.call.callerClaim}`);
      if (b.call.elapsedSeconds !== undefined)
        L.push(`- 通話経過：${Math.floor(b.call.elapsedSeconds / 60)}分`);
      if (b.call.annotation) {
        L.push(`- 🚩 **手口**：${b.call.annotation.tactics.map(tacticLabel).join(' / ')}`);
        L.push(`- 💡 解説：${b.call.annotation.note}`);
      }
      L.push('');
    }
    if (b.timeLimit) {
      L.push(
        `⏱ **制限時間 ${b.timeLimit.seconds}秒**（無操作なら \`${b.timeLimit.defaultChoiceId}\` が自動選択される）`,
      );
      L.push('');
    }
    if (b.web) {
      L.push(`**［偽サイト画面］${b.web.brand} — ${b.web.heading}**`);
      L.push('');
      L.push(`- URL：\`${b.web.domain}\``);
      if (b.web.subheading) L.push(`- 補足：${b.web.subheading}`);
      if (b.web.balance !== undefined)
        L.push(`- ${b.web.balanceLabel ?? '残高'}：${yen(b.web.balance)}`);
      for (const r of b.web.rows ?? []) L.push(`- ${r.label}：${r.value}`);
      if (b.web.notice) L.push(`- 表示文：${b.web.notice.text}`);
      for (const t of b.web.tickers ?? []) L.push(`- 通知：${t}`);
      if (b.web.annotation) {
        L.push(`- 🚩 **手口**：${b.web.annotation.tactics.map(tacticLabel).join(' / ')}`);
        L.push(`- 💡 解説：${b.web.annotation.note}`);
      }
      L.push('');
    }
    for (const m of b.incoming) L.push(...messageLines(m, speakerName(s, m)));
    if ((b.ambient ?? []).length > 0) {
      L.push('');
      L.push('**（選択待ち中に流れる発言）**');
      L.push('');
      for (const m of b.ambient) L.push(...messageLines(m, speakerName(s, m)));
    }
    if (b.incoming.length > 0) L.push('');

    L.push('**選択肢**');
    L.push('');
    for (const c of b.choices) {
      const marks = [];
      if (c.irreversible) marks.push('🔴 一線を越える操作');
      if (c.requires) marks.push(`条件：${JSON.stringify(c.requires)}`);
      L.push(`- 「${c.label}」${marks.length ? `　*(${marks.join(' / ')})*` : ''}`);
      if (c.sentAs !== undefined && c.sentAs !== c.label)
        L.push(`  - 送信表示：${c.sentAs === '' ? '（吹き出しなし）' : c.sentAs}`);
      const eff = effectsText(c.effects);
      if (eff) L.push(`  - 変動：${eff}`);
      if (c.blockedMonologue) L.push(`  - 選べないときの独白：${c.blockedMonologue}`);
      if (c.outcomeHint) L.push(`  - リプレイでの補足：${c.outcomeHint}`);
      L.push(`  - 遷移：${nextLabel(c.next)}`);
      for (const m of c.reaction ?? []) {
        L.push(`  - ↩ **${speakerName(s, m)}**：${m.body}`);
        if (m.tactics.length > 0) {
          L.push(`    - 🚩 手口：${m.tactics.map(tacticLabel).join(' / ')}`);
          if (m.note) L.push(`    - 💡 解説：${m.note}`);
        }
      }
    }
    L.push('');
  }

  L.push('## 結末');
  L.push('');
  const grade = {
    A_AVOIDED: 'A 回避',
    B_LUCKY: 'B 直前離脱',
    C_MINOR: 'C 軽度被害',
    D_MAJOR: 'D 重度被害',
  };
  for (const e of s.endings) {
    L.push(`### ${grade[e.grade] ?? e.grade}：${e.title}　\`${e.id}\``);
    L.push('');
    for (const p of e.body) L.push(`${p}`);
    L.push('');
  }
  return L.join('\n');
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
await mkdir(OUT_DIR, { recursive: true });

for (const t of TARGETS) {
  if (only.length > 0 && !only.includes(t.id)) continue;
  const mod = await import(`../src/content/scenarios/${t.file}`);
  const scenario = Object.values(mod).find((v) => v && typeof v === 'object' && 'beats' in v);
  if (!scenario) {
    console.log(`  スキップ：${t.file} からシナリオを取得できませんでした`);
    continue;
  }
  const md = render(scenario, t.file);
  await writeFile(path.join(OUT_DIR, t.out), `${md}\n`, 'utf8');
  console.log(`  docs/${t.out}  （${scenario.beats.length} beats / ${md.length.toLocaleString()} 文字）`);
}
