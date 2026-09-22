import type { ReactNode } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';

type Props = {
  /** ステータスバーに出す時刻（シナリオ内時刻） */
  clock?: string;
  children: ReactNode;
};

/**
 * スマホ筐体（SPEC.md §3.2）
 *
 * - スマホ実機：筐体の装飾を消し、画面いっぱいに中身を出す（体験の没入を優先）
 * - PC：暗い展示室背景の中央に、縁のある端末として描画する
 */
export function PhoneFrame({ clock = '9:41', children }: Props) {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-hall-bg sm:p-6">
      {/* 展示室の空気感：PCでのみ見える淡いスポットライト */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden sm:block"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(184,149,106,0.10), transparent 70%)',
        }}
      />

      <div
        className={[
          'relative flex w-full flex-col overflow-hidden bg-app-bg text-app-text',
          'h-[100dvh]',
          // PC: 端末サイズに固定して縁を付ける
          'sm:h-[812px] sm:max-h-[calc(100dvh-3rem)] sm:w-[390px] sm:rounded-[2.75rem]',
          'sm:border-[10px] sm:border-[#111014] sm:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.9)]',
        ].join(' ')}
      >
        {/* ステータスバー */}
        <div className="relative z-20 flex shrink-0 items-center justify-between bg-white px-6 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 text-[13px] font-semibold text-black">
          <span className="tabular-nums">{clock}</span>
          {/* ノッチ（PCのみ） */}
          <div
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#111014] sm:block"
          />
          <span className="flex items-center gap-1">
            <Signal size={14} strokeWidth={2.5} />
            <Wifi size={14} strokeWidth={2.5} />
            <BatteryFull size={17} strokeWidth={2.5} />
          </span>
        </div>

        {/* 画面本体 */}
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>

        {/* ホームインジケータ */}
        <div className="flex shrink-0 justify-center bg-white pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
          <div aria-hidden className="h-1 w-32 rounded-full bg-black/25" />
        </div>
      </div>
    </div>
  );
}
