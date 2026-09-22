import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Link2, X } from 'lucide-react';
import { TACTICS, type TacticCard } from '@/content/tactics';
import type { TacticId } from '@/features/simulator/engine/types';
import { RichText } from '@/components/ui/RichText';
import { useFocusTrap } from '@/components/ui/useFocusTrap';

type Props = {
  card: TacticCard | null;
  /** そのメッセージ固有の解説（シナリオ側の note） */
  context?: { quote: string; note?: string };
  onClose: () => void;
  onSelectRelated: (id: TacticId) => void;
};

/** 手口カード（SPEC.md §3.3） */
export function TacticCardModal({ card, context, onClose, onSelectRelated }: Props) {
  // 関連カードへ移ると中身だけ差し替わるので、card.id を渡して再フォーカスさせる
  const panelRef = useFocusTrap<HTMLDivElement>(Boolean(card), card?.id ?? null);

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [card, onClose]);

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`手口カード ${card.name}`}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            ref={panelRef}
            tabIndex={-1}
            className="thin-scroll max-h-[86dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-2 border-hall-line bg-hall-surface p-6 pb-8 outline-none sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-[11px] font-black tracking-[0.25em] text-hall-accent">
                  手口カード #{String(card.no).padStart(2, '0')}
                </p>
                <h2 className="mt-2 font-display font-bold text-2xl leading-snug">{card.name}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="-mr-1 -mt-1 rounded-full p-2 text-hall-muted hover:bg-white/5 hover:text-hall-text"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-hall-text/80">
              {card.shortDescription}
            </p>

            {context && (
              <section className="mt-6 rounded-lg border-l-2 border-hall-accent/60 bg-black/20 py-3 pl-4 pr-3">
                <p className="text-[11px] tracking-[0.2em] text-hall-muted">該当箇所</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-hall-text/90">
                  「{context.quote}」
                </p>
                {context.note && (
                  <p className="mt-3 border-t border-hall-line pt-3 text-[13px] leading-[1.85] text-hall-muted">
                    <RichText text={context.note} />
                  </p>
                )}
              </section>
            )}

            <section className="mt-6">
              <h3 className="text-[11px] tracking-[0.2em] text-hall-muted">なぜ効くのか</h3>
              <p className="mt-2.5 text-[14px] leading-[1.9] text-hall-text/85">{card.why}</p>
            </section>

            <section className="mt-6">
              <h3 className="flex items-center gap-1.5 text-[11px] tracking-[0.2em] text-hall-muted">
                <Eye size={12} className="text-hall-accent" />
                現実での見分け方
              </h3>
              <ul className="mt-3 space-y-2.5">
                {card.howToSpot.map((line) => (
                  <li key={line} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                    <span className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-hall-accent/70" />
                    <span className="text-hall-text/85">{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            {card.related.length > 0 && (
              <section className="mt-6 border-t border-hall-line pt-4">
                <h3 className="flex items-center gap-1.5 text-[11px] tracking-[0.2em] text-hall-muted">
                  <Link2 size={12} />
                  関連カード
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {card.related.map((id) => (
                    <button
                      key={id}
                      onClick={() => onSelectRelated(id)}
                      className="rounded-full border-2 border-hall-line px-3 py-1.5 text-[12.5px] font-bold text-hall-text/80 transition hover:border-hall-accent hover:text-hall-text"
                    >
                      #{String(TACTICS[id].no).padStart(2, '0')} {TACTICS[id].name}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
