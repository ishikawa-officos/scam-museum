import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Beat, Choice, Ending, Message, ReplayItem, Scenario, Stats } from './types';

/** 画面に積まれていく1行分の表示単位 */
export type TranscriptItem =
  | { kind: 'time'; id: string; label: string }
  | { kind: 'them'; id: string; message: Message }
  | { kind: 'me'; id: string; body: string };

export type RunnerPhase =
  | 'delivering' // 相手のメッセージを順次配信中（入力中…表示）
  | 'transition' // 配信し終えて、次のビートへ移る間
  | 'choosing' // 選択肢待ち
  | 'ended'; // エンディング到達

export type ChoiceLogEntry = {
  beatId: string;
  choiceId: string;
  label: string;
  irreversible: boolean;
};

const TYPING_MIN_MS = 650;
const TYPING_PER_CHAR_MS = 26;
const TYPING_MAX_MS = 2000;
const TRANSITION_MS = 650;
/** 選択待ち中に周囲の発言が流れる間隔（第4展示室） */
const AMBIENT_MS = 2600;

/**
 * 通話（第3展示室）の話す速さ。
 *
 * チャットは読み返せるので、次の1通が来るまでの間は「相手が打っている時間」で足りる。
 * 通話は違う。画面に残るのは直近3発言だけで、消えたら二度と読めない。
 * それなのに配信間隔をチャットと同じ式にしていたため、実測で 38.5字/秒 ——
 * 黙読（およそ9字/秒）の4倍、音読（およそ5字/秒）の8倍の速さで流れていた。
 * 読み終える前に消えるので、何を言われたのか分からないまま選択を迫られる。
 *
 * 急かされること自体は展示物だが、それは「読めたうえで急かされる」ことであって、
 * 「読めない」ことではない。人が声に出して話す速さに合わせる。
 */
const CALL_CHARS_PER_SEC = 6.5;
/** 短い一言（「はい」など）でも、これだけは画面に置く */
const CALL_DWELL_MIN_MS = 1500;
/** 万一の長文で止まって見えないように上限を置く */
const CALL_DWELL_MAX_MS = 12000;
/** 話し始めるまでの息継ぎ。相手の言葉の長さとは関係がないので一定 */
const CALL_GAP_MS = 700;

/** 次の1通が出るまでの「間」。相手が打つ／話し始めるまでの時間 */
function gapBefore(message: Message): number {
  // 通話は「打っている」わけではないので、長さに比例させない
  if (message.surface === 'call') return CALL_GAP_MS;
  const len = message.body.length + (message.media ? 20 : 0);
  return Math.min(TYPING_MAX_MS, Math.max(TYPING_MIN_MS, len * TYPING_PER_CHAR_MS));
}

/**
 * いま出ている1通を、読む／聞くのに要る時間。
 *
 * 次の1通の長さではなく、目の前にある1通の長さで決める。
 * 以前は「次の1通の入力時間」だけが間隔だったので、長い台詞のあとに
 * 短い台詞が続くと 0.65 秒で流れていた。
 *
 * チャットとグループは画面に残り、さかのぼって読めるので 0 のまま（従来どおり）。
 */
function dwellAfter(message: Message | null): number {
  if (!message || message.surface !== 'call') return 0;
  const ms = (message.body.length / CALL_CHARS_PER_SEC) * 1000;
  return Math.min(CALL_DWELL_MAX_MS, Math.max(CALL_DWELL_MIN_MS, Math.round(ms)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function applyEffects(stats: Stats, effects?: Partial<Stats>): Stats {
  if (!effects) return stats;
  return {
    trust: clamp(stats.trust + (effects.trust ?? 0), 0, 100),
    pressure: clamp(stats.pressure + (effects.pressure ?? 0), 0, 100),
    isolation: clamp(stats.isolation + (effects.isolation ?? 0), 0, 100),
    damage: Math.max(0, stats.damage + (effects.damage ?? 0)),
    days: Math.max(0, stats.days + (effects.days ?? 0)),
  };
}

/** requires 条件を満たすか（選択肢のグレーアウト判定） */
export function isChoiceAvailable(choice: Choice, stats: Stats): boolean {
  if (!choice.requires) return true;
  return Object.entries(choice.requires).every(([key, cond]) => {
    const value = stats[key as keyof Stats];
    if (cond?.lt !== undefined && !(value < cond.lt)) return false;
    if (cond?.gte !== undefined && !(value >= cond.gte)) return false;
    return true;
  });
}

type Transition = { kind: 'beat'; id: string } | { kind: 'ending'; id: string };

export type ScenarioRunner = {
  scenario: Scenario;
  phase: RunnerPhase;
  /** いま表示中のビート（Web サーフェスの判定に使う） */
  beat: Beat | undefined;
  transcript: TranscriptItem[];
  choices: Choice[];
  stats: Stats;
  ending: Ending | null;
  choiceLog: ChoiceLogEntry[];
  /** 実際に通った経路の記録。解説リプレイ（S-06）はこれを読む */
  replay: ReplayItem[];
  visitedBeats: string[];
  choose: (choiceId: string) => void;
};

/**
 * シナリオ実行エンジン（SPEC.md §2.1）
 *
 * 責務：ビートの進行、メッセージの逐次配信、隠しステータスの更新、
 * 選択ログと経路の記録。表示のしかたには一切関与しない。
 */
export type RunnerOptions = {
  /**
   * 周囲の発言を流す間隔（ミリ秒）。null なら流さず、まとめて表示する。
   * 体験のペースは来館者が選べる（SPEC.md §3.5）。
   */
  ambientIntervalMs?: number | null;
  /**
   * 配信の間の倍率。1 が標準（絶叫モード）、大きいほどゆっくり。
   * じっくり観察モードは制限時間だけでなく、話す速さも落とす
   * （落ちていなかったので、ゆっくり見たい人が実際にはゆっくり見られなかった）。
   */
  paceScale?: number;
};

export function useScenarioRunner(
  scenario: Scenario,
  options: RunnerOptions = {},
): ScenarioRunner {
  const ambientInterval =
    options.ambientIntervalMs === undefined ? AMBIENT_MS : options.ambientIntervalMs;
  const paceScale = options.paceScale ?? 1;
  const beatMap = useMemo(
    () => new Map<string, Beat>(scenario.beats.map((b) => [b.id, b])),
    [scenario],
  );
  const endingMap = useMemo(
    () => new Map<string, Ending>(scenario.endings.map((e) => [e.id, e])),
    [scenario],
  );

  const [beatId, setBeatId] = useState(scenario.entryBeat);
  const [queue, setQueue] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [phase, setPhase] = useState<RunnerPhase>('transition');
  const [stats, setStats] = useState<Stats>(scenario.initialStats);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [choiceLog, setChoiceLog] = useState<ChoiceLogEntry[]>([]);
  const [visitedBeats, setVisitedBeats] = useState<string[]>([]);
  const [replay, setReplay] = useState<ReplayItem[]>([]);

  /**
   * 表示行の連番。ループするシナリオでは同じビート・同じメッセージを再訪しうるため、
   * ビートIDやメッセージIDをそのまま React のキーにすると衝突する。
   */
  const seq = useRef(0);

  /**
   * 選択を受け付けてよいか。
   * phase は state なので、同じティック内に2回タップされると両方が
   * 「まだ choosing」と判断して通ってしまう（スマホのダブルタップで起きる）。
   * 送金の選択が二重に適用されると被害額まで倍になるため、ref で締める。
   */
  const accepting = useRef(false);
  const nextKey = (prefix: string) => `${prefix}#${seq.current++}`;

  /**
   * 直前に画面へ出した相手の1通。次の1通を出すまでに、これを読む時間を確保する。
   * 選択したあとは「読み終えて操作した」ことになるので null に戻す。
   */
  const lastShown = useRef<Message | null>(null);

  /** 配信が終わったあとに移る先。ref で持つのは配信タイマーの中から読むため */
  const pending = useRef<Transition | null>({ kind: 'beat', id: scenario.entryBeat });

  /** ビートに入る：時刻ラベルを積み、相手メッセージを配信キューに載せる */
  const enterBeat = useCallback(
    (id: string) => {
      const beat = beatMap.get(id);
      if (!beat) {
        console.error(`[runner] 未定義のビート: ${id}`);
        return;
      }
      setBeatId(id);
      setVisitedBeats((prev) => (prev.includes(id) ? prev : [...prev, id]));
      if (beat.timeLabel) {
        const label = beat.timeLabel;
        setTranscript((prev) => [...prev, { kind: 'time', id: nextKey(`${beat.id}-time`), label }]);
        setReplay((prev) => [...prev, { kind: 'time', label }]);
      }
      if (beat.web) setReplay((prev) => [...prev, { kind: 'web', beatId: beat.id }]);
      if (beat.call) setReplay((prev) => [...prev, { kind: 'call', beatId: beat.id }]);
      if (beat.group) setReplay((prev) => [...prev, { kind: 'group', beatId: beat.id }]);
      setQueue(beat.incoming);
      accepting.current = beat.incoming.length === 0;
      setPhase(beat.incoming.length === 0 ? 'choosing' : 'delivering');
    },
    [beatMap],
  );

  // シナリオ切替でまるごとリセット
  useEffect(() => {
    setTranscript([]);
    setStats(scenario.initialStats);
    setEndingId(null);
    setChoiceLog([]);
    setVisitedBeats([]);
    setReplay([]);
    setQueue([]);
    seq.current = 0;
    accepting.current = false;
    lastShown.current = null;
    pending.current = { kind: 'beat', id: scenario.entryBeat };
    setPhase('transition');
  }, [scenario]);

  // 相手メッセージの逐次配信（「入力中…」の間を挟む）
  //
  // 注意: queue が空でも phase を切り替えないこと。ビートに入る前は queue が空だが、
  // そこで 'choosing' にすると届くはずのメッセージが配信されないまま選択肢だけが出る。
  // 配信完了の判定は「最後の1通を積んだ瞬間」に行う。
  useEffect(() => {
    if (phase !== 'delivering' || queue.length === 0) return;
    const [next, ...rest] = queue;
    // 「直前の1通を読み終えるまで」＋「次が始まるまでの間」。
    // 読む時間はビートをまたいでも要るので、lastShown はビート遷移で消さない
    const wait = Math.round((dwellAfter(lastShown.current) + gapBefore(next)) * paceScale);
    const timer = window.setTimeout(() => {
      lastShown.current = next;
      setTranscript((prev) => [...prev, { kind: 'them', id: nextKey(next.id), message: next }]);
      setReplay((prev) => [...prev, { kind: 'them', messageId: next.id }]);
      setQueue(rest);
      if (rest.length === 0) {
        const next = pending.current ? 'transition' : 'choosing';
        accepting.current = next === 'choosing';
        setPhase(next);
      }
    }, wait);
    return () => window.clearTimeout(timer);
  }, [phase, queue, paceScale]);

  // ビート／エンディングへの遷移
  useEffect(() => {
    if (phase !== 'transition') return;
    const timer = window.setTimeout(() => {
      const target = pending.current;
      pending.current = null;
      if (!target) {
        accepting.current = true;
        setPhase('choosing');
        return;
      }
      if (target.kind === 'ending') {
        setEndingId(target.id);
        setPhase('ended');
        return;
      }
      enterBeat(target.id);
    }, TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [phase, enterBeat]);

  /**
   * 周囲の発言（第4展示室）。
   *
   * グループチャットは、こちらの返事を待ってくれない。選択肢を出しているあいだも
   * 発言が流れ続け、黙っているほど画面が進んでいく。この流速そのものが圧になる。
   * 無限には流さず、ビートに書かれたぶんを一巡したら止める。
   */
  useEffect(() => {
    if (phase !== 'choosing') return;
    const beat = beatMap.get(beatId);
    const ambient = beat?.ambient;
    if (!ambient || ambient.length === 0) return;

    const push = (m: Message) => {
      setTranscript((prev) => [...prev, { kind: 'them', id: nextKey(m.id), message: m }]);
      setReplay((prev) => [...prev, { kind: 'them', messageId: m.id }]);
    };

    // 手動モードでは、流さずに一度で出す
    if (ambientInterval === null) {
      ambient.forEach(push);
      return;
    }

    let i = 0;
    const timer = window.setInterval(() => {
      if (i >= ambient.length) {
        window.clearInterval(timer);
        return;
      }
      push(ambient[i]);
      i += 1;
    }, ambientInterval);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, beatId, beatMap, ambientInterval]);

  const choose = useCallback(
    (choiceId: string) => {
      if (phase !== 'choosing' || !accepting.current) return;
      accepting.current = false;
      // 操作できたということは、直前の1通はもう読み終えている
      lastShown.current = null;
      const beat = beatMap.get(beatId);
      const choice = beat?.choices.find((c) => c.id === choiceId);
      if (!beat || !choice) return;

      const sent = choice.sentAs ?? choice.label;
      if (sent) {
        setTranscript((prev) => [
          ...prev,
          { kind: 'me', id: nextKey(`${beat.id}-${choice.id}`), body: sent },
        ]);
      }
      setReplay((prev) => [
        ...prev,
        { kind: 'choice', beatId: beat.id, choiceId: choice.id, sent },
      ]);
      setStats((prev) => applyEffects(prev, choice.effects));
      setChoiceLog((prev) => [
        ...prev,
        {
          beatId: beat.id,
          choiceId: choice.id,
          label: choice.label,
          irreversible: choice.irreversible ?? false,
        },
      ]);

      pending.current =
        typeof choice.next === 'object'
          ? { kind: 'ending', id: choice.next.ending }
          : { kind: 'beat', id: choice.next };

      // 選択への即時リアクションがあれば、次のビートに入る前に配信する
      const reaction = choice.reaction ?? [];
      if (reaction.length > 0) {
        setQueue(reaction);
        setPhase('delivering');
      } else {
        setQueue([]);
        setPhase('transition');
      }
    },
    [phase, beatId, beatMap],
  );

  const currentBeat = beatMap.get(beatId);

  return {
    scenario,
    phase,
    beat: currentBeat,
    transcript,
    choices: phase === 'choosing' && currentBeat ? currentBeat.choices : [],
    stats,
    ending: endingId ? (endingMap.get(endingId) ?? null) : null,
    choiceLog,
    replay,
    visitedBeats,
    choose,
  };
}
