import { useState } from 'react';
import { motion } from 'framer-motion';
import { TACTIC_GROUPS, TACTIC_LIST, TACTICS } from '@/content/tactics';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { HallNav } from '@/components/ui/HallNav';
import type { TacticId } from '@/features/simulator/engine/types';
import { TacticCardModal } from '@/features/debrief/TacticCardModal';
import { DrBug } from '@/components/ui/DrBug';

/**
 * S-07 手口図鑑 — 防犯アーカイブ（SPEC.md §3.3）
 *
 * ロックも収集率もない。展示を体験したかどうかに関わらず、
 * 20の手口すべてをいつでも読める資料として開いておく。
 * ここで学ぶべき人ほど、ゲームを最後まで遊ぶとは限らないため。
 */
export function CodexPage() {
  const [open, setOpen] = useState<TacticId | null>(null);

  return (
    <HallLayout>
      <HallNav />

      <p className="text-[11px] tracking-[0.2em] text-hall-accent">ARCHIVE</p>
      <h1 className="mt-2 font-display font-bold text-3xl">仕掛け図鑑</h1>

      <div className="mt-5">
        <DrBug
          size="sm"
          front="カードは最初から全部開いています。歩いていない部屋のものも。隠す理由がないので。"
          back="26通り。人間を転ばせる方法は、今のところこれだけしか見つかっていない。少ないと思わないか。"
        />
      </div>
      <p className="mt-4 text-[14px] leading-[1.9] text-hall-muted">
        この館の4つの部屋で使われている仕掛けを、{TACTIC_LIST.length}枚のカードにまとめました。
        どれも「なぜ効くのか」と「現実での見分け方」が読めます。
      </p>

      {TACTIC_GROUPS.map((group, gi) => {
        const cards = TACTIC_LIST.filter((c) => c.group === group.id);
        return (
          <section key={group.id} className="mt-10">
            <h2 className="font-display text-xl font-bold">
              <span className="marker">{group.name}</span>
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-hall-muted">
              {group.description}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {cards.map((card, i) => (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.04 + i * 0.03, duration: 0.35 }}
                  onClick={() => setOpen(card.id)}
                  className="rounded-2xl border-2 border-hall-line bg-hall-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-hall-accent"
                >
                  <p className="pill pill-accent">
                    #{String(card.no).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2.5 font-display text-[17px] font-bold leading-snug">{card.name}</h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-hall-muted">
                    {card.shortDescription}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-10 rounded-2xl border-2 border-hall-line bg-hall-surface/50 p-5 text-[13px] leading-[1.9] text-hall-muted">
        手口は単体では効きません。関係をつくり、判断を奪い、証拠を偽装し、退路を断つ。
        この4つが順番に積み上がったときにだけ成立します。
        逆に言えば、どこか一つでも崩せば止まります。
        もっとも崩しやすいのは「退路を断つ」で、具体的には
        <strong className="text-hall-text">この関係の外にいる誰かに話すこと</strong>です。
      </p>

      <HallFooter />

      <TacticCardModal
        card={open ? TACTICS[open] : null}
        onClose={() => setOpen(null)}
        onSelectRelated={(id) => setOpen(id)}
      />
    </HallLayout>
  );
}
