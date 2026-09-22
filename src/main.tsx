import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import './index.css';

// 開発時のみ、シナリオのグラフ整合性をチェックする
if (import.meta.env.DEV) {
  void (async () => {
    const [{ SCENARIO_LOADERS }, { validateScenario }] = await Promise.all([
      import('./content/scenarios'),
      import('./lib/validateScenario'),
    ]);
    // 開発時のみ、全シナリオを読み込んで整合性を確認する。
    // 本番ビルドではこのブロックごと取り除かれるため、分割の効果は損なわれない。
    const all = await Promise.all(Object.values(SCENARIO_LOADERS).map((load) => load()));
    for (const scenario of all) {
      const errors = validateScenario(scenario);
      if (errors.length > 0) {
        console.error(`[scenario:${scenario.id}] 整合性エラー`, errors);
      } else {
        console.info(
          `[scenario:${scenario.id}] OK — ${scenario.beats.length} beats / ${scenario.endings.length} endings`,
        );
      }
    }
  })();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
