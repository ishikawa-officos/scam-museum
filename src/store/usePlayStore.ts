import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReplayItem, Stats } from '@/features/simulator/engine/types';

export type PaceMode = 'thrill' | 'slow' | 'manual';

/** 選択待ち中に周囲の発言が流れる間隔（ミリ秒）。manual は流さない */
export const PACE_INTERVAL: Record<PaceMode, number | null> = {
  thrill: 2600,
  slow: 5200,
  manual: null,
};

/**
 * 制限時間の倍率。null は「時間切れでも自動選択しない」。
 *
 * 急かされること自体が展示物（第3展示室の「たった4時間で終わる」）なので、
 * 秒読みを消すわけにはいかない。一方で、15秒で自動選択される作りは、
 * その時間内に操作できない人から選ぶ機会そのものを奪う。
 * 秒読みは残したまま、延長と自動選択の停止を選べるようにしている（WCAG 2.2.1）。
 */
export const PACE_TIME_LIMIT: Record<PaceMode, number | null> = {
  thrill: 1,
  slow: 2,
  manual: null,
};

export const PACE_LABELS: { id: PaceMode; name: string; detail: string }[] = [
  {
    id: 'thrill',
    name: '絶叫モード',
    detail: '標準。会話はあなたを待たずに流れていきます。現実に近いのはこちら',
  },
  {
    id: 'slow',
    name: 'じっくり観察モード',
    detail: '同じ演出を半分の速さで。制限時間も2倍。読みながら仕掛けを観察したい方へ',
  },
  {
    id: 'manual',
    name: '手動モード',
    detail: '流れる演出を止め、まとめて表示します。時間切れでも勝手に選ばれません',
  },
];

export type RunResult = {
  scenarioId: string;
  endingId: string;
  /** エンディングの区分。診断で「どこまで進んでしまったか」の判定に使う */
  grade: 'A_AVOIDED' | 'B_LUCKY' | 'C_MINOR' | 'D_MAJOR';
  stats: Stats;
  /** 一線を越えた操作（送金・入力）のラベル。判定画面で初めて開示する */
  irreversibleChoices: string[];
  /** このシナリオの想定資産。被害の割合を出すのに使う */
  savings: number;
  /** 実際に通った経路。解説リプレイ（S-06）が読む */
  replay: ReplayItem[];
};

type PlayState = {
  /** 直近のプレイ結果。判定とリプレイはこれを読む */
  lastResult: RunResult | null;
  /**
   * 展示室ごとの最新の結果。弱点タイプ診断（S-10）はこれを横断して見る。
   * 採点ではなく、行動の傾向を振り返るための記録。
   */
  records: Record<string, RunResult>;
  /** 到達済みエンディング（展示室選択のクリア表示に使う） */
  clearedEndings: Record<string, string[]>;
  /**
   * 体験のペース。
   * thrill  = 絶叫モード（標準）。グループの発言が次々に流れる
   * slow    = じっくり観察モード。同じ演出をゆっくり流す
   * manual  = 手動。流さず、まとめて表示する
   * 初期値は OS の prefers-reduced-motion に合わせる。
   */
  paceMode: PaceMode;
  setPaceMode: (mode: PaceMode) => void;
  setResult: (result: RunResult) => void;
  resetProgress: () => void;
};

export const usePlayStore = create<PlayState>()(
  persist(
    (set) => ({
      lastResult: null,
      records: {},
      clearedEndings: {},
      paceMode:
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 'manual'
          : 'thrill',

      setPaceMode: (mode) => set({ paceMode: mode }),

      setResult: (result) =>
        set((state) => {
          const prev = state.clearedEndings[result.scenarioId] ?? [];
          return {
            lastResult: result,
            records: { ...state.records, [result.scenarioId]: result },
            clearedEndings: {
              ...state.clearedEndings,
              [result.scenarioId]: prev.includes(result.endingId)
                ? prev
                : [...prev, result.endingId],
            },
          };
        }),

      resetProgress: () => set({ lastResult: null, records: {}, clearedEndings: {} }),
    }),
    {
      name: 'scam-museum/progress',
      version: 2,
      // v1 では採点（見抜いた手口）を保存していた。採点を廃止したので作り直す。
      migrate: (): Partial<PlayState> => ({
        lastResult: null,
        records: {},
        clearedEndings: {},
      }),
      partialize: (state) => ({
        lastResult: state.lastResult,
        records: state.records,
        clearedEndings: state.clearedEndings,
        paceMode: state.paceMode,
      }),
    },
  ),
);
