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
      {/* 発信者。
          余白や文字の大きさに sm: を使わない。スマホ筐体の高さは常に812pxなので、
          ブラウザの幅で中身の余白が変わると、広い画面ほど発言が詰まる */}
      <div className="shrink-0 px-8 pt-7 text-center">
        <p className="text-[13px] tracking-[0.2em] text-white/50">
          {view.state === 'incoming' ? '着信' : '通話中'}
        </p>
        <h1 className="mt-2 text-[23px] font-semibold leading-tight">{view.callerName}</h1>
        {view.callerClaim && (
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{view.callerClaim}</p>
        )}
        <p className="mt-3 text-[15px] tabular-nums text-white/45">
          {view.state === 'incoming' ? 'モバイル' : formatDuration(elapsed)}
        </p>
      </div>

      {/* 相手のアイコン（着信中は脈打つ）。
          画面が短い端末では、これが発言の場所を食いつぶして
          肝心の一言が読めなくなる。装飾なので、そのときは消す。 */}
      <div className="flex shrink-0 justify-center py-4 [@media(max-height:700px)]:hidden">
        <motion.div
          animate={
            view.state === 'incoming' ? { scale: [1, 1.06, 1] } : { scale: 1, opacity: 0.8 }
          }
          transition={
            view.state === 'incoming'
              ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
          className="grid size-20 place-items-center rounded-full bg-white/10 text-3xl"
          aria-hidden
        >
          👤
        </motion.div>
      </div>

      {/* 相手の発言。直近3つだけが残り、それより前は消える。
          「通話は読み返せない」ことが展示の中身なので、残す数は増やさない。

          ただし、見えている3つは最後まで読めなければならない。
          高さが足りないときに切り捨てる作りだと、画面の小さい端末では
          いま聞いたばかりの一言が読めなくなる（実際そうなっていた）。
          入りきらない分はスクロールできるようにし、常に最新を下に置く。 */}
      <div className="call-log thin-scroll flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-6">
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

        {/* flex-col-reverse なので、DOM上は新しい順に並べる。
            画面では古いものが上、最新が下（＝操作部のすぐ上）に出る。
            この向きにしておくと、入りきらない分が上に伸びて
            スクロールで辿れる。justify-end だと先頭に到達できなくなる */}
        <AnimatePresence initial={false}>
          {[...recent].reverse().map((item) => (
            <motion.p
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 shrink-0 rounded-xl bg-white/[0.07] px-4 py-3 text-[14.5px] leading-relaxed text-white/90"
            >
              {item.kind === 'them' ? item.message.body : ''}
            </motion.p>
          ))}
        </AnimatePresence>
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
