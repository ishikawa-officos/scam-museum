import { useEffect, useState } from 'react';
import { SCENARIO_LOADERS } from '@/content/scenarios';
import type { Scenario } from './types';

export type ScenarioState =
  | { status: 'loading'; scenario: null }
  | { status: 'ready'; scenario: Scenario }
  | { status: 'missing'; scenario: null };

/**
 * 展示室のシナリオを読み込む。
 *
 * 一度読み込んだものはモジュールキャッシュに残るため、
 * 判定 → リプレイ → 再プレイのあいだに再ダウンロードは発生しない。
 */
export function useScenario(id: string): ScenarioState {
  const [state, setState] = useState<ScenarioState>({ status: 'loading', scenario: null });

  useEffect(() => {
    const loader = SCENARIO_LOADERS[id];
    if (!loader) {
      setState({ status: 'missing', scenario: null });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading', scenario: null });
    loader()
      .then((scenario) => {
        if (!cancelled) setState({ status: 'ready', scenario });
      })
      .catch((error) => {
        console.error(`[scenario] 読み込みに失敗: ${id}`, error);
        if (!cancelled) setState({ status: 'missing', scenario: null });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
