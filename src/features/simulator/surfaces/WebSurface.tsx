import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Lock, RotateCw, TrendingUp, TriangleAlert } from 'lucide-react';
import type { WebView } from '../engine/types';

type Props = {
  view: WebView;
  onExit: () => void;
};

const CHART_PATHS: Record<NonNullable<WebView['chart']>, string> = {
  up: 'M0,74 L20,68 L40,70 L60,58 L80,60 L100,46 L120,40 L140,44 L160,28 L180,22 L200,10',
  spike: 'M0,78 L25,74 L50,76 L75,66 L100,68 L125,52 L150,36 L175,18 L200,4',
  flat: 'M0,48 L25,44 L50,50 L75,46 L100,52 L125,45 L150,49 L175,46 L200,48',
};

/**
 * Web サーフェス（SPEC.md §3.2-2）— 偽の投資プラットフォーム
 *
 * チャートも残高も、送られてくる数値をそのまま描くだけで、
 * 裏付けは何もない。この「検証できなさ」自体が展示物。
 */
export function WebSurface({ view, onExit }: Props) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickers = view.tickers ?? [];

  useEffect(() => {
    if (tickers.length <= 1) return;
    const timer = window.setInterval(
      () => setTickerIndex((i) => (i + 1) % tickers.length),
      2600,
    );
    return () => window.clearInterval(timer);
  }, [tickers.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0b1020]">
      {/* ブラウザのURLバー */}
      <div className="flex shrink-0 items-center gap-2 bg-[#e9eaee] px-2.5 py-2">
        <button
          onClick={onExit}
          aria-label="展示から退室する"
          className="rounded p-0.5 text-black/50 hover:bg-black/5"
        >
          <ChevronLeft size={19} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5">
          <Lock size={11} className="shrink-0 text-emerald-600" />
          <span className="truncate text-[12px] text-black/70">{view.domain}</span>
        </div>
        <RotateCw size={15} className="shrink-0 text-black/40" aria-hidden />
      </div>

      {/* ページ本体 */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4 text-white">
        <p className="text-[11px] tracking-[0.25em] text-white/45">{view.brand}</p>
        <h1 className="mt-1.5 text-[19px] font-semibold leading-snug">{view.heading}</h1>
        {view.subheading && (
          <p className="mt-1 text-[12.5px] leading-relaxed text-white/50">{view.subheading}</p>
        )}

        {view.balance !== undefined && (
          <div className="mt-5 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
            <p className="text-[11.5px] text-white/50">{view.balanceLabel ?? '口座残高'}</p>
            <p className="mt-1 text-[34px] font-bold leading-none tabular-nums">
              ¥{view.balance.toLocaleString('ja-JP')}
            </p>
            {view.delta && (
              <p
                className={[
                  'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums',
                  view.delta.amount >= 0
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-rose-500/15 text-rose-300',
                ].join(' ')}
              >
                <TrendingUp size={12} />
                {view.delta.amount >= 0 ? '+' : '−'}¥
                {Math.abs(view.delta.amount).toLocaleString('ja-JP')}（
                {view.delta.percent >= 0 ? '+' : ''}
                {view.delta.percent}%）
              </p>
            )}

            {view.chart && (
              <svg
                viewBox="0 0 200 84"
                preserveAspectRatio="none"
                className="mt-4 h-20 w-full"
                aria-label="運用実績のチャート"
                role="img"
              >
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${CHART_PATHS[view.chart]} L200,84 L0,84 Z`}
                  fill="url(#fill)"
                  stroke="none"
                />
                <path
                  d={CHART_PATHS[view.chart]}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}
          </div>
        )}

        {view.rows && view.rows.length > 0 && (
          <dl className="mt-4 divide-y divide-white/8 rounded-2xl bg-white/[0.04] px-4 ring-1 ring-white/8">
            {view.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3">
                <dt className="text-[12.5px] text-white/50">{row.label}</dt>
                <dd
                  className={[
                    'text-[13.5px] font-semibold tabular-nums',
                    row.tone === 'good'
                      ? 'text-emerald-300'
                      : row.tone === 'bad'
                        ? 'text-rose-300'
                        : row.tone === 'muted'
                          ? 'text-white/40'
                          : 'text-white',
                  ].join(' ')}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {view.notice && (
          <div
            className={[
              'mt-4 flex gap-2.5 rounded-xl p-3.5 text-[12.5px] leading-relaxed',
              view.notice.tone === 'warn'
                ? 'bg-amber-400/12 text-amber-200 ring-1 ring-amber-400/30'
                : view.notice.tone === 'good'
                  ? 'bg-emerald-400/12 text-emerald-200 ring-1 ring-emerald-400/25'
                  : 'bg-white/[0.06] text-white/70 ring-1 ring-white/10',
            ].join(' ')}
          >
            {view.notice.tone === 'warn' && (
              <TriangleAlert size={15} className="mt-px shrink-0" aria-hidden />
            )}
            <p>{view.notice.text}</p>
          </div>
        )}

        {tickers.length > 0 && (
          <div className="mt-5">
            <p className="text-[10.5px] tracking-widest text-white/30">LIVE</p>
            <div className="mt-1.5 h-9 overflow-hidden rounded-lg bg-white/[0.04] px-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="flex h-9 items-center text-[12px] text-emerald-300/90"
                >
                  {tickers[tickerIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        )}

        <p className="mt-6 text-[10px] leading-relaxed text-white/25">
          ※ この画面は教育用の展示です。{view.brand} および {view.domain}{' '}
          は架空であり、実在するサービスではありません。
        </p>
      </div>
    </div>
  );
}
