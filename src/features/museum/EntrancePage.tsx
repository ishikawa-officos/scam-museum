import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookMarked, LifeBuoy } from 'lucide-react';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';

const BADGES = ['全4室', '所要 6〜9分', '入場無料', '損害額 0円', 'スマホ推奨'];

const ROOM_TEASERS = [
  { no: '01', title: '海の向こうの恋人', hook: '半年かけて、好きになってもらう' },
  { no: '02', title: '支えたい、という気持ち', hook: '3,000円から始まる' },
  { no: '03', title: 'あなたの口座が危ない', hook: 'たった4時間で終わる' },
  { no: '04', title: 'みんな、儲かっている', hook: '187人が、あなたの背中を押す' },
];

/**
 * S-01 エントランス
 *
 * ここで決まるのは「この先で何をしてよいか」。
 * 防犯サイトの顔をしていると、来館者は身構えて審査員になる。
 * 現代美術館の企画展の入口くらいの軽さで、思い切り騙されてよい場所だと最初に伝える。
 */
export function EntrancePage() {
  return (
    <HallLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[11px] font-bold tracking-[0.3em] text-hall-accent">
          MUSEUM OF BEING FOOLED
        </p>

        <h1 className="mt-5 font-display text-[44px] font-black leading-[1.15] tracking-tight sm:text-[58px]">
          <span className="marker">だまされる</span>
          <br />
          博物館
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 font-display text-[21px] font-bold leading-[1.6] text-hall-accent sm:text-[25px]"
        >
          ようこそ、<br className="sm:hidden" />
          安心して騙される場所へ。
        </motion.p>

        <div className="mt-5 flex flex-wrap gap-2">
          {BADGES.map((b, i) => (
            <motion.span
              key={b}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
              className={i === 3 ? 'pill pill-accent' : 'pill'}
            >
              {b}
            </motion.span>
          ))}
        </div>

        <div className="mt-8 space-y-4 text-[15px] leading-[1.95] text-hall-text/90">
          <p>
            本物の詐欺師に挑むのは危険です。だから、この館を作りました。
            展示されているのは、いま実際に使われている手口そのもの。
            ただし、どれだけ騙されても、あなたのお金は
            <strong className="marker font-bold text-hall-text">一円も減りません</strong>。
          </p>
          <p className="rounded-2xl border-2 border-hall-accent/45 bg-hall-accent/[0.08] p-5 font-display text-[17px] font-bold leading-[1.75] text-hall-text">
            うまく騙された人ほど、よい来館者です。
            <br />
            どうぞ、心ゆくまで思い切り騙されてみてください。
          </p>
        </div>

        {/* 順路の予告 */}
        <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
          {ROOM_TEASERS.map((r, i) => (
            <motion.div
              key={r.no}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.35 }}
              className="rounded-2xl border-2 border-hall-line bg-hall-surface px-4 py-3.5"
            >
              <p className="font-display text-[11px] font-black tracking-widest text-hall-accent">
                ROOM {r.no}
              </p>
              <p className="mt-1 font-display text-[15px] font-bold">{r.title}</p>
              <p className="mt-1 text-[12.5px] text-hall-muted">{r.hook}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-7 text-[14px] leading-[1.95] text-hall-muted">
          出口では、仕掛けをすべてお見せします。
          どこで、何が、どんな順番であなたを転ばせたのか。舞台裏を見てから帰る、そういう館です。
        </p>

        <div className="mt-8 rounded-2xl border-2 border-hall-line bg-hall-surface/70 p-5 text-[13px] leading-relaxed text-hall-muted">
          <p className="mb-2.5 font-display text-[13.5px] font-bold text-hall-text">
            ご入館の前に
          </p>
          <ul className="space-y-2">
            {[
              '登場する人物・団体・企業・サービス・URLはすべて架空です。',
              '採点はしません。手口を指摘する操作もありません。読んで、返事を選ぶだけです。',
              '金銭被害の描写を含みます。いつでも途中でやめられます。',
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-hall-accent/70" />
                <span>{t}</span>
              </li>
            ))}
            <li className="flex gap-2.5">
              <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-hall-mint/70" />
              <span>
                実際に被害にあわれた方は、無理をなさらず
                <Link
                  to="/summary"
                  className="font-bold text-hall-mint underline underline-offset-4"
                >
                  相談窓口
                </Link>
                をご覧ください。
              </span>
            </li>
          </ul>
        </div>

        <Link
          to="/rooms"
          className="btn-pop group mt-9 inline-flex items-center gap-3 bg-hall-accent px-8 py-4 font-display text-[17px] font-black text-hall-bg hover:bg-yellow-300"
        >
          ［ 騙されに入館する ］
          <ArrowRight size={19} strokeWidth={2.75} className="transition group-hover:translate-x-1" />
        </Link>

        {/* 体験せずに情報だけ必要な人のための導線 */}
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px]">
          <Link
            to="/codex"
            className="inline-flex items-center gap-1.5 font-bold text-hall-muted underline-offset-4 hover:text-hall-text hover:underline"
          >
            <BookMarked size={14} />
            仕掛けの一覧だけ見る
          </Link>
          <Link
            to="/summary"
            className="inline-flex items-center gap-1.5 font-bold text-hall-muted underline-offset-4 hover:text-hall-text hover:underline"
          >
            <LifeBuoy size={14} />
            いま相談したい方へ
          </Link>
        </div>

        <HallFooter />
      </motion.div>
    </HallLayout>
  );
}
