import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, RotateCcw, TriangleAlert } from 'lucide-react';
import { useScenario } from '@/features/simulator/engine/useScenario';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { LoadingHall } from '@/components/ui/LoadingHall';
import { RichText } from '@/components/ui/RichText';
import { usePlayStore } from '@/store/usePlayStore';

/**
 * 結果の口上。
 *
 * 失敗を責めない、を通り越して「見事なハマりっぷり」として讃える。
 * ここで落ち込ませると、この先の種明かしを読む気が失せる。
 * 逆に回避した人は讃えすぎない（次は騙されてみたくなるように）。
 */
const VERDICT: Record<string, { tag: string; shout: string; lead: string }> = {
  A_AVOIDED: {
    tag: '生還',
    shout: '無傷で出てきましたね。',
    lead: 'ただし、この館の仕掛けはまだ半分も作動していません。別の順路では、同じあなたが転びます。',
  },
  /**
   * 生還だが、そこまでに渡した分がある場合。
   *
   * 等級だけで口上を決めていたため、「失った金額 ¥30,000」のすぐ下に
   * 「無傷で出てきましたね。」と出ていた。画面の中で矛盾している。
   * 第1展示室で、少額を渡したあとに外部へ相談して止めた経路がこれに当たる。
   */
  A_AVOIDED_HURT: {
    tag: '生還',
    shout: '大きいほうは、止められましたね。',
    lead: 'すでに渡した分は戻らないかもしれません。それでも、いちばん大きな一手の前で止まれたことのほうが、ここでは重要です。',
  },
  /**
   * 入れた額より多く引き出して帰った場合。
   *
   * ここは素直に勝ちとして出す。気分がよくなってもらわないと、
   * この先の種明かし（その気分のよさこそが商品だった）が効かないため。
   * ひっくり返すのは、この下に続くエンディング本文の仕事。
   */
  PROFIT: {
    tag: '勝ち逃げ',
    shout: 'おめでとうございます。あなたの勝ちです。',
    lead: '入れた額より多く引き出して、黒字で帰ってきました。詐欺師から金を奪ったことになります。……気分は、いかがですか。',
  },
  B_LUCKY: {
    tag: 'ぎりぎり生還',
    shout: 'あと一歩で落ちていました。',
    lead: '止まれた理由を、自分の言葉で説明できるでしょうか。偶然だったとしたら、次は止まれません。',
  },
  C_MINOR: {
    tag: '軽傷',
    shout: 'かかりましたね。しかも、いちばん自然な形で。',
    lead: 'ここで踏みとどまれた人は多くありません。よく持ちこたえたほうです。',
  },
  D_MAJOR: {
    tag: '完落ち',
    shout: 'お見事です。見事に、全部持っていかれました。',
    lead: 'これだけの仕掛けを全部踏んで歩いたことになります。自慢していい落ち方です。もちろん、一円も減っていません。',
  },
};

/**
 * 数値のカウントアップ（金額の演出）。一気に跳ね上げてから、わずかに行き過ぎて戻る。
 * 渡す値は絶対値（黒字でも桁が伸びる手応えは同じでよい）。
 */
function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // 終盤で少しオーバーシュートさせ、跳ね上がった手応えを出す
      const eased = 1 - Math.pow(1 - t, 4);
      const overshoot = Math.sin(t * Math.PI) * 0.045;
      setValue(Math.min(target, Math.round(target * (eased + overshoot))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

/**
 * S-05 判定
 *
 * 採点はしない。起きた事実（失った金額・経過した時間・越えてしまった一線）だけを示し、
 * 学びは解説リプレイに預ける（SPEC.md §2.4）。
 */
export function ResultPage() {
  const { scenarioId = '' } = useParams();
  const navigate = useNavigate();
  const { status, scenario } = useScenario(scenarioId);
  const result = usePlayStore((s) => s.lastResult);

  const ending = scenario?.endings.find((e) => e.id === result?.endingId);
  // 生還でも、そこまでに渡した分がある経路がある。口上を等級だけで決めると
  // 「失った金額 ¥30,000」の下に「無傷で出てきましたね。」と並ぶ
  const grade = ending?.grade ?? 'C_MINOR';
  const net = result?.stats.damage ?? 0;
  /** マイナス＝入れた額より多く引き出した。あなたの取り分 */
  const profit = net < 0;
  const key = profit ? 'PROFIT' : grade === 'A_AVOIDED' && net > 0 ? 'A_AVOIDED_HURT' : grade;
  const verdict = VERDICT[key] ?? VERDICT.C_MINOR;
  const amount = useCountUp(Math.abs(net));

  if (status === 'loading') return <LoadingHall />;

  if (!scenario || !result || !ending) {
    return (
      <HallLayout>
        <p className="text-hall-muted">表示できる結果がありません。</p>
        <button
          onClick={() => navigate('/rooms')}
          className="mt-4 rounded-full border border-hall-line px-5 py-2 text-sm"
        >
          展示室一覧へ
        </button>
      </HallLayout>
    );
  }

  return (
    <HallLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] tracking-[0.2em] text-hall-accent">
          {scenario.roomLabel}　判定
        </p>

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-8 overflow-hidden rounded-2xl border-2 border-hall-line bg-hall-surface p-8 text-center"
        >
          {/* 被害が出たときだけ、赤い光が一度だけ走る */}
          {net > 0 && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(60% 50% at 50% 40%, rgba(244,63,94,0.28), transparent 70%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.12] }}
              transition={{ duration: 1.6, times: [0, 0.35, 1] }}
            />
          )}

          <p className="relative text-[12px] tracking-[0.3em] text-hall-muted">
            {verdict.tag}
          </p>
          <p className="relative mt-5 text-[13px] text-hall-muted">
            {profit ? '詐欺師から奪った金額' : '失った金額'}
          </p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.08, 1] }}
            transition={{ duration: 1.5, times: [0, 0.6, 1], ease: 'easeOut' }}
            className={[
              'relative font-display font-bold text-[54px] leading-tight tabular-nums sm:text-6xl',
              net > 0 ? 'text-rose-400' : profit ? 'text-hall-mint' : 'text-hall-text',
            ].join(' ')}
          >
            {profit ? '+' : ''}¥{amount.toLocaleString('ja-JP')}
          </motion.p>
          <p className="relative mt-4 text-[12px] text-hall-muted">
            経過日数 {result.stats.days} 日／一線を越えた操作{' '}
            {result.irreversibleChoices.length} 回
          </p>
          <p className="relative mt-5 border-t border-hall-line pt-5 font-display font-bold text-[19px] leading-relaxed text-hall-text">
            {verdict.shout}
          </p>
          <p className="relative mt-3 text-[13.5px] leading-[1.9] text-hall-muted">
            {verdict.lead}
          </p>
        </motion.div>

        {/* 体験中は伏せていた「一線」を、ここで初めて赤く示す（SPEC.md §2.2） */}
        {result.irreversibleChoices.length > 0 && (
          <section className="mt-5 rounded-2xl border-2 border-rose-500/35 bg-rose-500/[0.07] p-5">
            <h2 className="flex items-center gap-2 text-[12px] tracking-[0.2em] text-rose-300/90">
              <TriangleAlert size={13} />
              ここが一線でした
            </h2>
            <ul className="mt-3.5 space-y-2">
              {result.irreversibleChoices.map((label, i) => (
                <li key={`${label}-${i}`} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-rose-400" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] leading-relaxed text-hall-muted">
              会話をどれだけ続けても、被害は確定しません。確定するのは、送金・入力・インストールといった
              <strong className="text-hall-text">自分の手を動かした操作</strong>
              だけです。体験中にこの警告を出さなかったのは、現実の画面にも警告は出ないからです。
            </p>
          </section>
        )}

        <h1 className="mt-9 font-display font-bold text-2xl leading-snug">{ending.title}</h1>
        <div className="mt-4 space-y-3.5 text-[15px] leading-[1.9] text-hall-text/85">
          {ending.body.map((p) => (
            <p key={p}>
              <RichText text={p} />
            </p>
          ))}
        </div>

        {/* 学びの本体はリプレイ側にある。ここが主導線 */}
        <button
          onClick={() => navigate(`/replay/${scenario.id}`)}
          className="group mt-6 flex w-full items-center gap-4 rounded-2xl border-2 border-hall-accent/60 bg-hall-accent/[0.09] px-6 py-5 text-left transition hover:-translate-y-0.5 hover:border-hall-accent"
        >
          <BookOpen size={22} className="shrink-0 text-hall-accent" />
          <span className="flex-1">
            <span className="block font-display font-bold text-lg">［ 舞台裏の種明かしを見る ］</span>
            <span className="mt-1 block text-[12.5px] leading-relaxed text-hall-muted">
              会話を1通ずつ巻き戻し、どこに何が仕掛けられていたかを全部お見せします。
            </span>
          </span>
          <ArrowRight
            size={18}
            className="shrink-0 text-hall-accent transition group-hover:translate-x-0.5"
          />
        </button>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate(`/play/${scenario.id}`)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-hall-line py-3.5 text-[14px] font-bold transition hover:border-hall-accent"
          >
            <RotateCcw size={15} />
            別の順路を試す
          </button>
          <button
            onClick={() => navigate('/rooms')}
            className="btn-pop flex-1 bg-hall-accent py-3.5 font-display text-[14px] font-black text-hall-on-accent"
          >
            順路にもどる
          </button>
        </div>

        <HallFooter />
      </motion.div>
    </HallLayout>
  );
}
