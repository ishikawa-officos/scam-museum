import type { Scenario } from '@/features/simulator/engine/types';

/**
 * シナリオ整合性チェック（SPEC.md §4.1）
 *
 * 分岐が増えるほど、壊れたグラフは「プレイして初めて気づく」不具合になる。
 * 開発時は起動直後にここで落とす。
 */
export function validateScenario(scenario: Scenario): string[] {
  const errors: string[] = [];
  const beatIds = new Set(scenario.beats.map((b) => b.id));
  const endingIds = new Set(scenario.endings.map((e) => e.id));
  const seenIds = new Set<string>();

  if (!beatIds.has(scenario.entryBeat)) {
    errors.push(`entryBeat "${scenario.entryBeat}" が beats に存在しません`);
  }
  if (beatIds.size !== scenario.beats.length) {
    errors.push('ビートIDが重複しています');
  }

  const noteMissing: string[] = [];
  const checkMessages = (where: string, messages: { id: string; tactics: string[]; note?: string }[]) => {
    for (const m of messages) {
      if (seenIds.has(m.id)) errors.push(`メッセージIDが重複: ${m.id}（${where}）`);
      seenIds.add(m.id);
      if (m.tactics.length > 0 && !m.note) noteMissing.push(m.id);
    }
  };

  const reachable = new Set<string>([scenario.entryBeat]);
  const queue = [scenario.entryBeat];

  for (const beat of scenario.beats) {
    checkMessages(beat.id, beat.incoming);
    if (beat.choices.length === 0) errors.push(`ビート ${beat.id} に選択肢がありません`);
    if (beat.web?.annotation) {
      if (seenIds.has(beat.web.annotation.id)) errors.push(`🚩IDが重複: ${beat.web.annotation.id}`);
      seenIds.add(beat.web.annotation.id);
      if (!beat.web.annotation.note) noteMissing.push(beat.web.annotation.id);
    }
    for (const choice of beat.choices) {
      checkMessages(`${beat.id}/${choice.id}`, choice.reaction ?? []);
      if (typeof choice.next === 'object') {
        if (!endingIds.has(choice.next.ending)) {
          errors.push(`${beat.id}/${choice.id} の遷移先エンディング "${choice.next.ending}" が未定義`);
        }
      } else if (!beatIds.has(choice.next)) {
        errors.push(`${beat.id}/${choice.id} の遷移先ビート "${choice.next}" が未定義`);
      }
    }
  }

  // 到達可能性
  while (queue.length > 0) {
    const id = queue.shift()!;
    const beat = scenario.beats.find((b) => b.id === id);
    if (!beat) continue;
    for (const choice of beat.choices) {
      if (typeof choice.next === 'string' && !reachable.has(choice.next)) {
        reachable.add(choice.next);
        queue.push(choice.next);
      }
    }
  }
  for (const beat of scenario.beats) {
    if (!reachable.has(beat.id)) errors.push(`ビート ${beat.id} に到達できません`);
  }

  // 到達できないエンディング
  const usedEndings = new Set(
    scenario.beats.flatMap((b) =>
      b.choices.flatMap((c) => (typeof c.next === 'object' ? [c.next.ending] : [])),
    ),
  );
  for (const ending of scenario.endings) {
    if (!usedEndings.has(ending.id)) errors.push(`エンディング ${ending.id} に到達できません`);
  }

  if (noteMissing.length > 0) {
    errors.push(`手口タグはあるが解説(note)が無い: ${noteMissing.join(', ')}`);
  }
  return errors;
}
