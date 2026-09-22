import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Link2, MoreVertical, Phone, Video } from 'lucide-react';
import type { Contact, Media } from '../engine/types';
import type { TranscriptItem } from '../engine/useScenarioRunner';
import { AssetImage } from '@/components/ui/AssetImage';

type Props = {
  contact: Contact;
  transcript: TranscriptItem[];
  typing: boolean;
  onExit: () => void;
};

const bubbleMotion = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

function MediaBlock({ media }: { media: Media }) {
  switch (media.kind) {
    case 'linkCard':
      return (
        <div className="mt-2 overflow-hidden rounded-xl border border-black/10 bg-white">
          <div className="flex h-20 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-600 text-[11px] tracking-widest text-white/70">
            {media.brand}
          </div>
          <div className="px-3 py-2">
            <p className="text-[13px] font-semibold leading-tight">{media.title}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-black/50">
              <Link2 size={11} />
              {media.domain}
            </p>
            {media.caption && (
              <p className="mt-1.5 text-[10px] leading-snug text-black/40">{media.caption}</p>
            )}
          </div>
        </div>
      );
    case 'receipt':
      return (
        <div className="mt-2 rounded-xl border border-black/10 bg-white px-3 py-2.5">
          <p className="text-[11px] text-black/50">{media.label}</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-emerald-600">
            +¥{media.amount.toLocaleString('ja-JP')}
          </p>
          {media.sub && <p className="mt-0.5 text-[11px] text-black/40">{media.sub}</p>}
          <div aria-hidden className="mt-2 flex h-8 items-end gap-0.5">
            {[28, 34, 30, 42, 46, 40, 58, 64, 60, 78, 86, 96].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-emerald-500/70"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      );
    case 'chart': {
      const down = media.trend === 'down';
      // 生成画像が置かれていればそれを使う。無い／読み込めない場合は内蔵SVGに戻す。
      // ここで汎用プレースホルダーを出すと、画像未配置のあいだ「相手が送ってきた
      // 実績画面」という展示物そのものが消えてしまうため、必ずSVGを代替にする。
      const builtInChart = (
        <svg viewBox="0 0 200 70" preserveAspectRatio="none" className="mt-2 h-16 w-full">
          <path
            d={
              down
                ? 'M0,12 L30,20 L60,16 L90,34 L120,30 L150,52 L200,64'
                : 'M0,62 L30,54 L60,58 L90,40 L120,44 L150,24 L200,8'
            }
            fill="none"
            stroke={down ? '#fb7185' : '#34d399'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        </svg>
      );
      return (
        <div className="mt-2 rounded-xl border border-black/10 bg-[#0f1424] px-3 py-3">
          <p className="text-[11px] text-white/45">{media.label}</p>
          <AssetImage
            src={media.src}
            alt={media.label}
            className="mt-2 w-full rounded-lg"
            fallback={builtInChart}
          />
          {media.caption && <p className="mt-1 text-[10.5px] text-white/35">{media.caption}</p>}
        </div>
      );
    }
    case 'image':
      return (
        <div className="mt-2 overflow-hidden rounded-xl bg-black/5">
          <AssetImage src={media.src} alt={media.alt} className="w-full" />
        </div>
      );
  }
}

/**
 * Chat サーフェス（SPEC.md §3.2-1）
 *
 * 本物のメッセージアプリと同じものだけを置く。採点も、手口のマークも、
 * 「いま何かを見抜くべきだ」と示唆する要素も一切出さない。
 * 審査員ではなく当事者として相手の言葉を受け取るための画面（SPEC.md §2.4）。
 */
export function ChatSurface({ contact, transcript, typing, onExit }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [transcript.length, typing]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-app-bg">
      {/* 相手ヘッダー */}
      <header className="flex shrink-0 items-center gap-3 border-b border-black/10 bg-white px-3 py-2.5">
        <button
          onClick={onExit}
          className="-ml-1 rounded-full p-1 text-black/60 hover:bg-black/5"
          aria-label="展示から退室する"
        >
          <ChevronLeft size={22} />
        </button>
        <div
          className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-bold text-white"
          style={{ background: contact.avatarColor }}
          aria-hidden
        >
          <AssetImage
            src={contact.avatarSrc}
            alt={contact.displayName}
            className="size-9 object-cover"
            fallback={<span>{contact.avatarInitial}</span>}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{contact.displayName}</p>
          {contact.subtitle && (
            <p className="flex items-center gap-1 text-[11px] text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {contact.subtitle}
            </p>
          )}
        </div>
        <Phone size={19} className="text-black/40" aria-hidden />
        <Video size={19} className="text-black/40" aria-hidden />
        <MoreVertical size={19} className="text-black/40" aria-hidden />
      </header>

      {/* 会話 */}
      <div className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
        <AnimatePresence initial={false}>
          {transcript.map((item) => {
            if (item.kind === 'time') {
              return (
                <motion.div key={item.id} {...bubbleMotion} className="py-2 text-center">
                  <span className="rounded-full bg-black/8 px-3 py-1 text-[11px] text-black/45">
                    {item.label}
                  </span>
                </motion.div>
              );
            }

            if (item.kind === 'me') {
              return (
                <motion.div key={item.id} {...bubbleMotion} className="flex justify-end pl-12">
                  <div className="rounded-2xl rounded-br-md bg-app-me px-3.5 py-2 text-[14.5px] leading-relaxed shadow-sm">
                    {item.body}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div key={item.id} {...bubbleMotion} className="flex items-end">
                <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-app-them px-3.5 py-2 text-[14.5px] leading-relaxed shadow-sm">
                  <p className="whitespace-pre-wrap">{item.message.body}</p>
                  {item.message.media && <MediaBlock media={item.message.media} />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* タイピングインジケータ */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex"
            >
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-app-them px-4 py-3 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-black/30"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>
    </div>
  );
}
