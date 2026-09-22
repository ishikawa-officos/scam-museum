import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, Lock } from 'lucide-react';
import { ROOMS } from '@/content/scenarios';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { HallNav } from '@/components/ui/HallNav';
import { usePlayStore } from '@/store/usePlayStore';
import { DrBug } from '@/components/ui/DrBug';

/** S-02 展示室選択 */
export function RoomSelectPage() {
  const navigate = useNavigate();
  const cleared = usePlayStore((s) => s.clearedEndings);

  return (
    <HallLayout>
      <HallNav />

      <button
        onClick={() => navigate('/')}
        className="mb-8 inline-flex items-center gap-1 text-[13px] text-hall-muted hover:text-hall-text"
      >
        <ChevronLeft size={15} />
        エントランス
      </button>

      <h1 className="font-display font-bold text-3xl">順路</h1>

      <div className="mt-5">
        <DrBug
          size="sm"
          front="4つの部屋があります。好きな部屋から、好きな順に。順路という名前ですが、順番に意味はありません。"
          back="どの扉から入っても、突く場所は決まっている。四つの部屋は、四つの穴にそれぞれ対応している。"
        />
      </div>

      <p className="mt-4 text-[14px] leading-[1.9] text-hall-muted">
        どの部屋も、あなたを転ばせるために組まれています。
      </p>

      <div className="mt-9 space-y-3">
        {ROOMS.map((room, i) => {
          const endings = room.scenarioId ? (cleared[room.scenarioId] ?? []) : [];
          const isReady = room.status === 'ready' && room.scenarioId;

          const card = (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className={[
                'peek overflow-hidden rounded-2xl border-2 p-5 transition',
                isReady
                  ? 'border-hall-line bg-hall-surface hover:-translate-y-0.5 hover:border-hall-accent'
                  : 'border-hall-line/50 bg-hall-surface/30',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-[11px] font-black tracking-[0.2em] text-hall-accent">
                    {room.roomLabel}
                  </p>
                  <h2
                    className={[
                      'mt-1.5 font-display text-[22px] font-bold leading-snug',
                      isReady ? 'text-hall-text' : 'text-hall-muted',
                    ].join(' ')}
                  >
                    {room.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] text-hall-muted">{room.subject}</p>
                </div>
                {!isReady && <Lock size={16} className="mt-1 shrink-0 text-hall-muted/50" />}
              </div>

              <div className="mt-4 flex items-center gap-4 text-[12px] text-hall-muted/80">
                <span className="pill">
                  <Clock size={12} />約{room.minutes}分
                </span>
                {isReady ? (
                  endings.length > 0 ? (
                    <span className="pill pill-accent">
                      見た結末 {endings.length} / {room.endingCount}
                    </span>
                  ) : (
                    <span className="pill">未入室</span>
                  )
                ) : (
                  <span className="pill">準備中</span>
                )}
              </div>

              {/* 裏の顔。この部屋が何を突いてくるのかを、臨床の言葉で先に言う。
                  主語は「脳」であって「あなた」ではない */}
              {isReady && (
                <span className="peek-back px-6 text-[13px] font-bold leading-relaxed">
                  {room.bias}
                </span>
              )}
            </motion.div>
          );

          return isReady ? (
            <Link key={room.roomLabel} to={`/briefing/${room.scenarioId}`} className="block">
              {card}
            </Link>
          ) : (
            <div key={room.roomLabel} aria-disabled>
              {card}
            </div>
          );
        })}
      </div>

      <HallFooter />
    </HallLayout>
  );
}
