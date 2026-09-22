import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { EntrancePage } from '@/features/museum/EntrancePage';
import { LoadingHall } from '@/components/ui/LoadingHall';
import { AppShell } from './AppShell';
import { RouteError } from './RouteError';
import { recoverFromStaleChunk } from './staleChunk';

/**
 * 遅延読み込みする画面。
 *
 * 公開し直した直後は、開いたままのページが古いファイル名をつかんでいて
 * 読み込みに失敗する。そのときは一度だけ読み込み直して新しい版に乗り換える
 * （staleChunk.ts）。素通しにすると、体験の最後で開発者向けのエラー画面が出る。
 */
function page<T>(load: () => Promise<T>, pick: (mod: T) => ComponentType) {
  return lazy(() =>
    load().then(
      (mod) => ({ default: pick(mod) }),
      (error) => recoverFromStaleChunk(error),
    ),
  );
}

/**
 * エントランス（S-01）だけは即座に出したいので静的に読み込み、
 * それ以外の画面は遅延読み込みにする（SPEC.md フェーズ4）。
 * シナリオ本体はさらに別チャンクで、入室時にだけ読み込まれる。
 */
const RoomSelectPage = page(
  () => import('@/features/museum/RoomSelectPage'),
  (m) => m.RoomSelectPage,
);
const CodexPage = page(() => import('@/features/museum/CodexPage'), (m) => m.CodexPage);
const SummaryPage = page(() => import('@/features/museum/SummaryPage'), (m) => m.SummaryPage);
const DiagnosisPage = page(
  () => import('@/features/museum/DiagnosisPage'),
  (m) => m.DiagnosisPage,
);
const AboutPage = page(() => import('@/features/museum/AboutPage'), (m) => m.AboutPage);
const BriefingPage = page(
  () => import('@/features/simulator/BriefingPage'),
  (m) => m.BriefingPage,
);
const SimulatorPage = page(
  () => import('@/features/simulator/SimulatorPage'),
  (m) => m.SimulatorPage,
);
const ResultPage = page(() => import('@/features/debrief/ResultPage'), (m) => m.ResultPage);
const ReplayPage = page(() => import('@/features/debrief/ReplayPage'), (m) => m.ReplayPage);

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<LoadingHall />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    // 画面が出せなかったときに、館の言葉で案内する。
    // 無いと React Router の開発者向け画面が来館者に出る
    errorElement: <RouteError />,
    children: [
  { path: '/', element: <EntrancePage /> }, // S-01
  { path: '/rooms', element: withSuspense(<RoomSelectPage />) }, // S-02
  { path: '/briefing/:scenarioId', element: withSuspense(<BriefingPage />) }, // S-03
  { path: '/play/:scenarioId', element: withSuspense(<SimulatorPage />) }, // S-04
  { path: '/result/:scenarioId', element: withSuspense(<ResultPage />) }, // S-05
  { path: '/replay/:scenarioId', element: withSuspense(<ReplayPage />) }, // S-06
  { path: '/codex', element: withSuspense(<CodexPage />) }, // S-07
  { path: '/summary', element: withSuspense(<SummaryPage />) }, // S-08
  { path: '/about', element: withSuspense(<AboutPage />) }, // S-09
  { path: '/diagnosis', element: withSuspense(<DiagnosisPage />) }, // S-10
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
