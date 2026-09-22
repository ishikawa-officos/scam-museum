import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, EyeOff, MessageSquare, Wallet } from 'lucide-react';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { LoadingHall } from '@/components/ui/LoadingHall';
import { useScenario } from './engine/useScenario';
import { PACE_LABELS, usePlayStore } from '@/store/usePlayStore';

/** S-03 ブリーフィング */
export function BriefingPage() {
  const { scenarioId = '' } = useParams();
  const navigate = useNavigate();
  const { status, scenario } = useScenario(scenarioId);
  const paceMode = usePlayStore((s) => s.paceMode);
  const setPaceMode = usePlayStore((s) => s.setPaceMode);

  if (status === 'loading') return <LoadingHall />;
  if (status === 'missing') {
    return (
      <HallLayout>
        <p className="text-hall-muted">この展示室はまだ準備中です。</p>
        <Link to="/rooms" className="mt-4 inline-block text-hall-accent underline">
          展示室一覧へ戻る
        </Link>
      </HallLayout>
    );
  }

  return (
    <HallLayout>
      <button
        onClick={() => navigate('/rooms')}
        className="mb-8 inline-flex items-center gap-1 text-[13px] text-hall-muted hover:text-hall-text"
      >
        <ChevronLeft size={15} />
        順路
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] tracking-[0.2em] text-hall-accent">{scenario.roomLabel}</p>
        <h1 className="mt-2 font-display font-bold text-3xl">{scenario.title}</h1>

        <section className="mt-9 rounded-xl border border-hall-line bg-hall-surface p-6">
          <h2 className="text-[12px] tracking-[0.2em] text-hall-muted">この部屋でのあなた</h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed">
            {scenario.persona.summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-2 border-t border-hall-line pt-4 text-hall-muted">
            <Wallet size={16} className="text-hall-accent" />
            <span className="text-[13px]">預貯金</span>
            <span className="ml-auto font-display font-bold text-xl tabular-nums text-hall-text">
              ¥{scenario.persona.savings.toLocaleString('ja-JP')}
            </span>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-[12px] tracking-[0.2em] text-hall-muted">できること</h2>
          <div className="flex gap-3 rounded-lg border border-hall-line/70 p-4">
            <MessageSquare size={17} className="mt-0.5 shrink-0 text-hall-accent" />
            <p className="text-[13.5px] leading-relaxed text-hall-text/85">
              <strong>返信を選ぶ。</strong>
              どれも不自然ではない文面です。「正解の選択肢」は用意されていません。
            </p>
          </div>
          <div className="flex gap-3 rounded-lg border border-hall-line/70 p-4">
            <EyeOff size={17} className="mt-0.5 shrink-0 text-hall-accent" />
            <p className="text-[13.5px] leading-relaxed text-hall-text/85">
              <strong>それだけです。</strong>
              手口を指摘する操作も、採点もありません。画面は本物のアプリと同じもので、
              相手の言葉に、ただ素直に反応してください。
              <span className="mt-1.5 block text-hall-muted">
                何が仕込まれていたかは、体験が終わったあとに一つ残らずお見せします。
              </span>
            </p>
          </div>
        </section>

        <p className="mt-6 text-[12.5px] leading-relaxed text-hall-muted">
          時間はシナリオ内で数か月進みます。会話はいつでも左上の「←」で中断できます。
        </p>

        {/* 体験のペースは来館者が選べるようにする（SPEC.md §3.5 アクセシビリティ） */}
        <fieldset className="mt-6">
          <legend className="text-[12px] tracking-[0.2em] text-hall-muted">体験のペース</legend>
          <div className="mt-3 space-y-2">
            {PACE_LABELS.map((mode) => (
              <label
                key={mode.id}
                className={[
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition',
                  paceMode === mode.id
                    ? 'border-hall-accent/60 bg-hall-accent/[0.08]'
                    : 'border-hall-line/70 hover:border-hall-line',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="pace"
                  checked={paceMode === mode.id}
                  onChange={() => setPaceMode(mode.id)}
                  className="mt-1 size-4 shrink-0 accent-[var(--color-hall-accent)]"
                />
                <span className="text-[13.5px] leading-relaxed">
                  <strong className="text-hall-text">{mode.name}</strong>
                  <span className="mt-1 block text-hall-muted">{mode.detail}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          onClick={() => navigate(`/play/${scenario.id}`)}
          className="btn-pop mt-9 w-full bg-hall-accent py-4 font-display text-[16px] font-black text-hall-on-accent"
        >
          ［ 中に入る ］
        </button>

        <HallFooter />
      </motion.div>
    </HallLayout>
  );
}
