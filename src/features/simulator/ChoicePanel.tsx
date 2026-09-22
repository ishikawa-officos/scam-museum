import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Choice, Stats } from './engine/types';
import { isChoiceAvailable } from './engine/useScenarioRunner';

type Props = {
  choices: Choice[];
  stats: Stats;
  onChoose: (choiceId: string) => void;
  /** 制限時間つきの選択。時間切れで defaultChoiceId が自動選択される */
  timeLimit?: { seconds: number; defaultChoiceId: string };
};

/**
 * 返信選択パネル（SPEC.md §3.2）
 *
 * 重要：irreversible（送金・入力など一線を越える操作）であることを、
 * ここでは一切UIに出さない。警告を出すと「騙される」体験が成立しないため、
 * 開示は判定・解説リプレイ側に寄せる（SPEC.md §2.2 / §2.4）。
 */
export function ChoicePanel({ choices, stats, onChoose, timeLimit }: Props) {
  const [monologue, setMonologue] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(timeLimit?.seconds ?? 0);
  const fired = useRef(false);

  // 制限時間（SPEC.md §2.5）。急かされると、選ぶ前に選ばされる。
  const active = Boolean(timeLimit) && choices.length > 0;
  useEffect(() => {
    if (!active || !timeLimit) return;
    setRemaining(timeLimit.seconds);
    fired.current = false;
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          if (!fired.current) {
            fired.current = true;
            onChoose(timeLimit.defaultChoiceId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, timeLimit?.seconds, timeLimit?.defaultChoiceId]);

  const handleChoose = (id: string) => {
    fired.current = true;
    onChoose(id);
  };

  // requires を満たさない選択肢のうち、独白を持たないものは「分岐のための内部条件」
  // （例：被害額による結末の振り分け）なので画面に出さない。
  // 独白を持つものだけが、押せない選択肢として意図的に見せるもの（SPEC.md §2.5）。
  const visible = choices.filter((c) => isChoiceAvailable(c, stats) || c.blockedMonologue);

  return (
    <AnimatePresence>
      {visible.length > 0 && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 space-y-1.5 border-t border-black/10 bg-white px-3 pb-3 pt-2.5"
        >
          {timeLimit && (
            <div className="px-1 pb-1">
              <div className="flex items-center justify-between text-[11.5px] text-rose-600">
                <span>返答を待たれています</span>
                <span className="tabular-nums font-semibold">残り {remaining} 秒</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/10">
                <motion.div
                  className="h-full bg-rose-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(remaining / timeLimit.seconds) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
          )}
          <AnimatePresence>
            {monologue && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden px-1 pb-1 text-[12.5px] italic leading-relaxed text-black/45"
              >
                {monologue}
              </motion.p>
            )}
          </AnimatePresence>

          {visible.map((choice) => {
            const available = isChoiceAvailable(choice, stats);
            return (
              <button
                key={choice.id}
                onClick={() => {
                  if (available) handleChoose(choice.id);
                  // 押せない選択肢は、押したときに理由を独白として見せる。
                  // 「選べない」ことそのものが体験の一部（SPEC.md §2.5）。
                  else setMonologue(choice.blockedMonologue ?? null);
                }}
                aria-disabled={!available}
                className={[
                  'w-full rounded-xl border px-3.5 py-3 text-left text-[14px] leading-snug transition',
                  available
                    ? 'border-black/12 bg-white hover:border-black/30 hover:bg-black/[0.03] active:scale-[0.99]'
                    : 'border-black/5 bg-black/[0.03] text-black/25',
                ].join(' ')}
              >
                {choice.label}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
