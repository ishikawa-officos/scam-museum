import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { EntrancePage } from '@/features/museum/EntrancePage';
import { LoadingHall } from '@/components/ui/LoadingHall';
import { AppShell } from './AppShell';

/**
 * エントランス（S-01）だけは即座に出したいので静的に読み込み、
 * それ以外の画面は遅延読み込みにする（SPEC.md フェーズ4）。
 * シナリオ本体はさらに別チャンクで、入室時にだけ読み込まれる。
 */
const RoomSelectPage = lazy(() =>
  import('@/features/museum/RoomSelectPage').then((m) => ({ default: m.RoomSelectPage })),
);
const CodexPage = lazy(() =>
  import('@/features/museum/CodexPage').then((m) => ({ default: m.CodexPage })),
);
const SummaryPage = lazy(() =>
  import('@/features/museum/SummaryPage').then((m) => ({ default: m.SummaryPage })),
);
const DiagnosisPage = lazy(() =>
  import('@/features/museum/DiagnosisPage').then((m) => ({ default: m.DiagnosisPage })),
);
const AboutPage = lazy(() =>
  import('@/features/museum/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const BriefingPage = lazy(() =>
  import('@/features/simulator/BriefingPage').then((m) => ({ default: m.BriefingPage })),
);
const SimulatorPage = lazy(() =>
  import('@/features/simulator/SimulatorPage').then((m) => ({ default: m.SimulatorPage })),
);
const ResultPage = lazy(() =>
  import('@/features/debrief/ResultPage').then((m) => ({ default: m.ResultPage })),
);
const ReplayPage = lazy(() =>
  import('@/features/debrief/ReplayPage').then((m) => ({ default: m.ReplayPage })),
);

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<LoadingHall />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
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
