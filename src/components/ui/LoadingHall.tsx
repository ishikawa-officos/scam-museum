import { HallLayout } from './HallLayout';

/** 展示室やシナリオの読み込み中に見せる、静かな待ち画面 */
export function LoadingHall({ label = '展示を準備しています' }: { label?: string }) {
  return (
    <HallLayout>
      <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-4">
        <div
          aria-hidden
          className="size-6 animate-spin rounded-full border-2 border-hall-line border-t-hall-accent"
        />
        <p className="text-[13px] tracking-[0.15em] text-hall-muted">{label}</p>
      </div>
    </HallLayout>
  );
}

/** 展示室が見つからないとき */
export function RoomNotReady({ onBack }: { onBack: () => void }) {
  return (
    <HallLayout>
      <p className="text-hall-muted">この展示室はまだ準備中です。</p>
      <button
        onClick={onBack}
        className="mt-5 rounded-full border-2 border-hall-line px-6 py-3 text-[14px] font-bold text-hall-text transition hover:border-hall-accent"
      >
        展示室一覧へ戻る
      </button>
    </HallLayout>
  );
}
