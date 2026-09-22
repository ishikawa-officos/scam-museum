import { useStickToBottom } from './useStickToBottom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, MoreVertical, Pin, Search, Users } from 'lucide-react';
import type { GroupView, Media, Speaker } from '../engine/types';
import type { TranscriptItem } from '../engine/useScenarioRunner';
import { AssetImage } from '@/components/ui/AssetImage';

type Props = {
  view: GroupView;
  speakers: Record<string, Speaker>;
  transcript: TranscriptItem[];
  typing: boolean;
  onExit: () => void;
};

const bubbleMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
};

function GroupMedia({ media }: { media: Media }) {
  switch (media.kind) {
    case 'receipt':
      return (
        <div className="mt-1.5 rounded-lg border border-black/10 bg-white px-3 py-2">
          <p className="text-[10.5px] text-black/60">{media.label}</p>
          <p className="text-[17px] font-bold tabular-nums text-emerald-700">
            +¥{media.amount.toLocaleString('ja-JP')}
          </p>
          {media.sub && <p className="text-[10.5px] text-black/60">{media.sub}</p>}
        </div>
      );
    case 'image':
      return (
        <div className="mt-1.5 overflow-hidden rounded-lg bg-black/5">
          <AssetImage src={media.src} alt={media.alt} className="w-full" />
        </div>
      );
    case 'chart':
      return (
        <div className="mt-1.5 overflow-hidden rounded-lg bg-[#0f1424] px-3 py-2">
          <p className="text-[10.5px] text-white/45">{media.label}</p>
          <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="mt-1 h-10 w-full">
            <path
              d="M0,44 L30,38 L60,40 L90,26 L120,30 L150,14 L200,4"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      );
    case 'linkCard':
      return (
        <div className="mt-1.5 rounded-lg border border-black/10 bg-white px-3 py-2">
          <p className="text-[12px] font-semibold leading-tight">{media.title}</p>
          <p className="text-[10.5px] text-black/60">{media.domain}</p>
        </div>
      );
  }
}

/**
 * グループチャットサーフェス（第4展示室）
 *
 * 1対1のチャットとの決定的な違いは、画面に「自分以外の大勢」がいること。
 * 参加人数は表示されるが、その実数を確認する方法はどこにもない。
 * この確認できなさこそが展示物なので、UI側でも一切の答え合わせを出さない。
 */
export function GroupChatSurface({ view, speakers, transcript, typing, onExit }: Props) {
  const endRef = useStickToBottom([transcript.length, typing]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#7b98b4]">
      {/* グループヘッダー */}
      <header className="shrink-0 bg-white">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            onClick={onExit}
            className="-ml-1 rounded-full p-1 text-black/60 hover:bg-black/5"
            aria-label="展示から退室する"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight">{view.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-black/60">
              <Users size={11} />
              {view.memberCount}
            </p>
          </div>
          <Search size={18} className="text-black/40" aria-hidden />
          <MoreVertical size={18} className="text-black/40" aria-hidden />
        </div>

        {view.pinned && (
          <div className="flex gap-2 border-t border-black/5 bg-[#fffbe8] px-4 py-2">
            <Pin size={12} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
            <p className="text-[11.5px] leading-snug text-black/70">{view.pinned}</p>
          </div>
        )}
      </header>

      {/* 発言 */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={`${view.name} の発言`}
        className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3"
      >
        <AnimatePresence initial={false}>
          {transcript.map((item, index) => {
            if (item.kind === 'time') {
              return (
                <motion.div key={item.id} {...bubbleMotion} className="py-1.5 text-center">
                  <span className="rounded-full bg-black/20 px-3 py-1 text-[11px] text-white/90">
                    {item.label}
                  </span>
                </motion.div>
              );
            }

            if (item.kind === 'me') {
              return (
                <motion.div key={item.id} {...bubbleMotion} className="flex justify-end pl-12">
                  <div className="rounded-xl rounded-br-sm bg-app-me px-3 py-2 text-[14px] leading-relaxed shadow-sm">
                    <span className="sr-only">自分：</span>
                    {item.body}
                  </div>
                </motion.div>
              );
            }

            const m = item.message;
            if (m.from === 'system') {
              return (
                <motion.div key={item.id} {...bubbleMotion} className="py-1.5 text-center">
                  <span className="rounded-full bg-black/20 px-3 py-1 text-[11px] text-white/90">
                    {m.body}
                  </span>
                </motion.div>
              );
            }

            const speaker = m.speakerId ? speakers[m.speakerId] : undefined;
            // 同じ人の連投はアイコンと名前をまとめる（本物のグループの見え方に寄せる）
            const prev = transcript[index - 1];
            const sameAsPrev =
              prev?.kind === 'them' &&
              prev.message.speakerId === m.speakerId &&
              prev.message.from !== 'system';

            return (
              <motion.div key={item.id} {...bubbleMotion} className="flex gap-2 pr-10">
                <div className="w-8 shrink-0">
                  {!sameAsPrev && (
                    <div
                      className="grid size-8 place-items-center rounded-xl text-[12px] font-bold text-white"
                      style={{ background: speaker?.color ?? '#8a9099' }}
                      aria-hidden
                    >
                      {speaker?.name.slice(0, 1) ?? '?'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  {!sameAsPrev && (
                    <p className="mb-0.5 text-[11px] text-white/85">
                      {speaker?.name ?? '参加者'}
                    </p>
                  )}
                  <div className="inline-block max-w-full rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[14px] leading-relaxed shadow-sm">
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    {m.media && <GroupMedia media={m.media} />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* 複数人が同時に入力している演出 */}
        <AnimatePresence>
          {typing && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 pl-10 pt-1"
            >
              <span className="flex gap-1 rounded-full bg-white/90 px-3 py-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-black/30"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </span>
              {view.typingCount ? (
                <span className="text-[11px] text-white/80">
                  {view.typingCount}人が入力中…
                </span>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>
    </div>
  );
}
