import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookMarked, LifeBuoy } from 'lucide-react';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { AssetImage } from '@/components/ui/AssetImage';
import { DrBug } from '@/components/ui/DrBug';

const BADGES = ['全4室', '所要 6〜9分', '入場無料', '損害額 0円', 'スマホ推奨'];

/**
 * 展示室の予告。
 *
 * hook は表の顔＝その部屋が始まるときの、やわらかい入口。
 * bug は裏の顔＝そこで突かれる認知の欠陥を、臨床の言葉で言い直したもの。
 * ホバー（PC）または臨床モード（全端末）で入れ替わる。
 */
const ROOM_TEASERS = [
  {
    no: '01',
    title: '海の向こうの恋人',
    hook: '半年かけて、好きになってもらう',
    bug: '好意を向けられた脳は、相手の要求を検証する回路を切る',
  },
  {
    no: '02',
    title: '支えたい、という気持ち',
    hook: '3,000円から始まる',
    bug: '一度払った脳は、払った事実のほうを正当化しはじめる',
  },
  {
    no: '03',
    title: 'あなたの口座が危ない',
    hook: 'たった4時間で終わる',
    bug: '急かされた脳は、比較をやめる。権威の声だと、確認もやめる',
  },
  {
    no: '04',
    title: 'みんな、儲かっている',
    hook: '187人が、あなたの背中を押す',
    bug: '大勢が同じ方向を向くと、脳は自分の違和感のほうを疑う',
  },
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
        {/* 主役はまず Dr.バグ。顔が半分ずつ違うことに、
            入口で気づいてもらう（気づかなくても、出口で分かる）。

            ただし背の低い端末では、この図が入口のボタンを画面の外へ押し出す。
            飾りが入口より優先されることはないので、そこでは小さくする */}
        <div className="flex flex-col items-center text-center">
          <AssetImage
            src="/assets/common/dr-bug.webp"
            alt="Dr.バグ。白衣を着た丸メガネの医師だが、顔の右半分は笑みを浮かべた別の誰かになっている"
            className="w-[176px] drop-shadow-sm [@media(max-height:700px)]:w-[132px] sm:w-[208px]"
          />

          {/* 館の名前は、途中で折らない。
              40px だと1行の実寸が 312px で、左右の余白 48px を引くと
              360px 幅がちょうど限界だった。320px 端末では「だまされる博／物館」と
              単語の途中で割れ、360px でも余裕がゼロで、字形しだいで割れうる。

              そこで、入る幅に合わせて字のほうを詰める。
              実測の 7.8em（tracking 込み）に対して 8.1 で割り、約4%の余裕を持たせた。
              下限 28px は 270px 幅まで1行で収まる大きさ */}
          <h1 className="mt-3 whitespace-nowrap font-display text-[clamp(28px,calc((100vw-48px)/8.1),40px)] font-black leading-[1.1] tracking-tight sm:text-[52px]">
            だまされる
            <span className="text-hall-accent-strong">博物館</span>
          </h1>

          <p className="mt-2 font-display text-[17px] font-bold tracking-[0.06em] text-hall-text sm:text-[20px]">
            認知バイアス臨床実験室
          </p>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-4 text-[14.5px] font-bold leading-[1.8] text-hall-muted"
          >
            ようこそ、<br className="sm:hidden" />
            安心して騙される場所へ。
          </motion.p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
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

        {/* 入口は、説明の下ではなくファーストビューに置く。
            以前はここから 1,794px スクロールしないと入れなかった。
            「解説を読ませるな、まず引っかからせろ」がこの館の主張なのに、
            入口だけは 812 字の解説を通過させてから開いていた。
            本文は1文字も削らず、順序だけを入れ替える（読みたい人は下で読める） */}
        <Link
          to="/rooms"
          className="btn-pop group mt-8 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap bg-hall-surface px-4 py-4 font-display text-[15px] font-black text-hall-text hover:bg-hall-paper sm:gap-3 sm:px-8 sm:text-[17px]"
        >
          ［ 被験者として入館する ］
          <ArrowRight size={19} strokeWidth={2.75} className="transition group-hover:translate-x-1" />
        </Link>

        {/* 同意事項の全文は下にあるが、入る前に要る一行はここに出しておく。
            ボタンを上げたせいで注意書きを読まずに入る、という形にはしない */}
        <p className="mt-3 text-center text-[12px] leading-relaxed text-hall-muted">
          登場する人物・企業・URLはすべて架空です。金銭被害の描写を含みます。
          <br className="hidden sm:block" />
          採点はしません。いつでもやめられます。
        </p>

        <div className="mt-9 space-y-4 text-[15px] leading-[1.95] text-hall-text/90">
          <p>
            本物の詐欺師に挑むのは危険です。だから、この館を作りました。
            展示されているのは、いま実際に使われている手口そのもの。
            ただし、どれだけ騙されても、あなたのお金は
            <strong className="marker font-bold text-hall-text">一円も減りません</strong>。
          </p>
        </div>

        {/* 案内役の一言。裏に切り替えると、同じ場所で本音が出る */}
        <div className="mt-8">
          <DrBug
            size="sm"
            front="ようこそ。うまく騙された人ほど、よい来館者です。どうぞ、心ゆくまで思い切り騙されてみてください。"
            back="ようこそ、被験体No.001。あなたの脳は、この館の誰とも同じ場所で必ず躓く。何人見ても、寸分たがわず同じ場所だ。実に美しい。"
          />
        </div>

        {/* 順路の予告 */}
        <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
          {ROOM_TEASERS.map((r, i) => (
            <motion.div
              key={r.no}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.35 }}
              className="peek overflow-hidden rounded-2xl border-2 border-hall-line bg-hall-surface px-4 py-3.5"
            >
              <p className="font-display text-[11px] font-black tracking-widest text-hall-accent">
                ROOM {r.no}
              </p>
              <p className="mt-1 font-display text-[15px] font-bold">{r.title}</p>
              <p className="mt-1 text-[12.5px] text-hall-muted">{r.hook}</p>

              {/* 裏。同じカードの下に、はじめから敷いてある */}
              <span className="peek-back text-[12.5px] font-bold leading-relaxed">{r.bug}</span>
            </motion.div>
          ))}
        </div>

        <p className="mt-7 text-[14px] leading-[1.95] text-hall-muted">
          出口では、仕掛けをすべてお見せします。
          どこで、何が、どんな順番であなたを転ばせたのか。舞台裏を見てから帰る、そういう館です。
        </p>

        <div className="lab-clipboard mt-10 p-5 pt-7 text-[13px] leading-relaxed text-hall-muted">
          <p className="mb-1 text-center">
            <span className="lab-label">CONSENT FORM</span>
          </p>
          <p className="mb-2.5 text-center font-display text-[14px] font-bold text-hall-text">
            ご入館の前に（同意事項）
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

        {/* 上と同じボタンをもう一度。最後まで読んだ人に2画面ぶん戻らせないため。
            順路の戻るボタンを1つに絞ったのとは事情が違う。
            あれは見た目の違う2つが同じ場所へ行って迷わせていた。
            こちらは同じ文言・同じ行き先なので、どちらを押しても同じだと一目で分かる。

            狭い端末（320px級）では、px-8 と 17px のままだと文字が2行に折り返す。
            折り返したボタンは押し間違えやすく、ピルの形も崩れるので、
            余白と文字を詰めて必ず1行に収める */}
        <Link
          to="/rooms"
          className="btn-pop group mt-9 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap bg-hall-surface px-4 py-4 font-display text-[15px] font-black text-hall-text hover:bg-hall-paper sm:gap-3 sm:px-8 sm:text-[17px]"
        >
          ［ 被験者として入館する ］
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
