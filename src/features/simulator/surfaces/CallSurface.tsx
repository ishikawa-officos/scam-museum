import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Plus, Volume2 } from 'lucide-react';
import type { CallView, Choice } from '../engine/types';
import type { TranscriptItem } from '../engine/useScenarioRunner';

type Props = {
  view: CallView;
  transcript: TranscriptItem[];
  speaking: boolean;
  /** 着信画面のときだけ、応答／拒否をこの画面自身が描く */
  choices: Choice[];
  onChoose: (choiceId: string) => void;
};

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Call サーフェス（SPEC.md §3.2-3）
 *
 * 通話は読み返せない。相手の言葉は数行しか画面に残らず、時間だけが進む。
 * チャットとの決定的な違いがこれで、特殊詐欺が電話を使う理由でもある。
 */
export function CallSurface({
  view,
  transcript,
  speaking,
  choices,
  onChoose,
}: Props) {
  const [elapsed, setElapsed] = useState(view.elapsedSeconds ?? 0);

  useEffect(() => {
    setElapsed(view.elapsedSeconds ?? 0);
    if (view.state !== 'active') return;
    const timer = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [view.state, view.elapsedSeconds]);

  // 通話中に見えるのは、通話で話された直近の数発言だけ。過去はスクロールで戻れない。
  // SMS（surface: 'chat'）は通話で「聞こえる」ものではないので、ここには出さない。
  const recent = transcript
    .filter((t) => t.kind === 'them' && t.message.surface === 'call')
    .slice(-3);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-[#1c1f26] to-[#0b0d11] text-white">
      {/* 発信者 */}
      <div className="shrink-0 px-8 pt-12 text-center">
        <p className="text-[13px] tracking-[0.2em] text-white/50">
          {view.state === 'incoming' ? '着信' : '通話中'}
        </p>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight">{view.callerName}</h1>
        {view.callerClaim && (
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{view.callerClaim}</p>
        )}
        <p className="mt-3 text-[15px] tabular-nums text-white/45">
          {view.state === 'incoming' ? 'モバイル' : formatDuration(elapsed)}
        </p>
      </div>

      {/* 相手のアイコン（着信中は脈打つ） */}
      <div className="flex shrink-0 justify-center py-8">
        <motion.div
          animate={
            view.state === 'incoming' ? { scale: [1, 1.06, 1] } : { scale: 1, opacity: 0.8 }
          }
          transition={
            view.state === 'incoming'
              ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
          className="grid size-24 place-items-center rounded-full bg-white/10 text-3xl"
          aria-hidden
        >
          👤
        </motion.div>
      </div>

      {/* 相手の発言。直近数行だけが残る */}
      <div className="min-h-0 flex-1 overflow-hidden px-6">
        <AnimatePresence initial={false}>
          {recent.map((item) => (
            <motion.p
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 rounded-xl bg-white/[0.07] px-4 py-3 text-[14.5px] leading-relaxed text-white/90"
            >
              {item.kind === 'them' ? item.message.body : ''}
            </motion.p>
          ))}
        </AnimatePresence>
        {speaking && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="px-1 text-[12.5px] tracking-widest text-white/40"
          >
            相手が話しています…
          </motion.p>
        )}
      </div>

      {/* 操作部 */}
      {view.state === 'incoming' ? (
        <div className="shrink-0 px-10 pb-12 pt-6">
          <div className="flex items-end justify-between">
            {choices.map((choice, i) => {
              const isAnswer = i === 0;
              return (
                <button
                  key={choice.id}
                  onClick={() => onChoose(choice.id)}
                  className="flex flex-col items-center gap-2.5"
                >
                  <span
                    className={[
                      'grid size-16 place-items-center rounded-full text-white transition active:scale-95',
                      isAnswer
                        ? 'bg-emerald-500 hover:bg-emerald-400'
                        : 'bg-rose-500 hover:bg-rose-400',
                    ].join(' ')}
                  >
                    <PhoneOff
                      size={24}
                      className={isAnswer ? 'rotate-[135deg]' : ''}
                      aria-hidden
                    />
                  </span>
                  <span className="max-w-[9rem] text-center text-[12px] leading-snug text-white/70">
                    {choice.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          aria-hidden
          className="grid shrink-0 grid-cols-3 gap-y-6 px-12 pb-8 pt-4 text-white/60"
        >
          {[MicOff, Plus, Volume2, Mic, Plus, Volume2].slice(0, 3).map((Icon, i) => (
            <span key={i} className="grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full bg-white/10">
                <Icon size={20} />
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
