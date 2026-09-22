import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Copy, Share2, ShieldCheck } from 'lucide-react';
import { ROOMS } from '@/content/scenarios';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { HallNav } from '@/components/ui/HallNav';
import { usePlayStore } from '@/store/usePlayStore';
import { AXES, buildShareText, diagnose, type AxisId } from './diagnosis';
import { DrBug } from '@/components/ui/DrBug';

const AXIS_ORDER: AxisId[] = ['affection', 'authority', 'conformity', 'sunkCost'];

/** S-10 騙されツボ診断 */
export function DiagnosisPage() {
  const navigate = useNavigate();
  const records = usePlayStore((s) => s.records);
  const [copied, setCopied] = useState(false);

  const diagnosis = diagnose(records);
  const readyRooms = ROOMS.filter((r) => r.status === 'ready');
  const remaining = readyRooms.filter((r) => r.scenarioId && !records[r.scenarioId]);

  const shareText = buildShareText(diagnosis, window.location.origin);
  // 端末の共有シートが使えるか（スマホは使える、PCのブラウザは大体使えない）
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const share = async () => {
    try {
      if (canShare) {
        await navigator.share({ text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // 共有シートを閉じた・権限が無い等。何も起こさないのが正しい
    }
  };

  if (diagnosis.playedRooms === 0) {
    return (
      <HallLayout>
        <HallNav />
        <p className="text-[11px] tracking-[0.2em] text-hall-accent">REFLECTION</p>
        <h1 className="mt-2 font-display font-bold text-3xl">振り返り</h1>

        <div className="mt-5">
          <DrBug
            size="sm"
            front="点数ではありません。どの感情のツボを押されたときに転んだか、という記録です。"
            back="押せば動く場所は、個体ごとに少しずつ違う。だがどれか一つは必ずある。例外を、私はまだ見ていない。"
          />
        </div>
        <p className="mt-5 text-[14px] leading-[1.9] text-hall-muted">
          まだどの部屋も歩いていません。ひとつでも通り抜けると、
          あなたの騙されツボがここに出ます。
        </p>
        <button
          onClick={() => navigate('/rooms')}
          className="btn-pop mt-7 bg-hall-accent px-7 py-3.5 font-display text-[15px] font-black text-hall-on-accent"
        >
          ［ 騙されに行く ］
        </button>
        <HallFooter />
      </HallLayout>
    );
  }

  return (
    <HallLayout>
      <HallNav />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] tracking-[0.2em] text-hall-accent">YOUR WEAK SPOT</p>
        <h1 className="mt-2 font-display font-bold text-3xl">あなたの騙されツボ</h1>

        <div className="mt-5">
          <DrBug
            size="sm"
            front="点数ではありません。どの感情のツボを押されたときに転んだか、という記録です。"
            back="押せば動く場所は、個体ごとに少しずつ違う。だがどれか一つは必ずある。例外を、私はまだ見ていない。"
          />
        </div>
        {/* Dr.バグが「点数ではない」と言った直後なので、繰り返さない */}
        <p className="mt-4 text-[14px] leading-[1.9] text-hall-muted">
          {diagnosis.playedRooms}つの部屋を歩いた結果です。ツボは誰にでもあります。
          自分のツボを知っているかどうかだけが、現実での差になります。
        </p>

        {/* 3軸 */}
        <div className="mt-8 space-y-3">
          {AXIS_ORDER.map((id) => {
            const axis = AXES[id];
            const score = diagnosis.scores[id];
            const isPrimary = diagnosis.primary === id;
            return (
              <div
                key={id}
                className={[
                  'rounded-2xl border-2 p-5',
                  isPrimary
                    ? 'border-hall-accent bg-hall-accent/[0.1]'
                    : 'border-hall-line bg-hall-surface/50',
                ].join(' ')}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display font-bold text-lg">{axis.type}</h2>
                  {isPrimary && (
                    <span className="shrink-0 rounded-full bg-hall-accent px-3 py-1 text-[10.5px] font-black text-hall-on-accent">
                      あなたのツボ
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12.5px] text-hall-muted">{axis.tagline}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className={isPrimary ? 'h-full bg-hall-accent' : 'h-full bg-white/25'}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(score * 100)}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-hall-muted">
                  関連：{axis.rooms.join('・')}
                </p>
                {isPrimary && (
                  <p className="mt-3.5 text-[13.5px] leading-[1.9] text-hall-text/85">
                    {axis.reading}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* 対策 */}
        <section className="mt-8 rounded-2xl border-2 border-hall-line bg-hall-surface p-6">
          <h2 className="flex items-center gap-2 text-[12px] tracking-[0.2em] text-hall-muted">
            <ShieldCheck size={14} className="text-hall-accent" />
            明日から効くこと
          </h2>
          {diagnosis.primary ? (
            <p className="mt-3.5 text-[14.5px] leading-[1.95] text-hall-text/90">
              {AXES[diagnosis.primary].guard}
            </p>
          ) : (
            <p className="mt-3.5 text-[14.5px] leading-[1.95] text-hall-text/90">
              今回は一円も渡さずに通り抜けました。ただ、止まれた理由を自分の言葉で説明できるでしょうか。
              偶然だったとしたら、次は止まれません。どの部屋にどんな仕掛けがあったかを、
              種明かしでもう一度見ておいてください。
            </p>
          )}
        </section>

        {diagnosis.totalIrreversible > 0 && (
          <p className="mt-4 text-[12.5px] leading-relaxed text-hall-muted">
            4つの部屋を通して、一線を越える操作を {diagnosis.totalIrreversible} 回選びました。
            会話をどれだけ続けても被害は確定しません。確定するのは、この操作だけです。
          </p>
        )}

        {remaining.length > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-hall-line p-5">
            <p className="text-[13px] leading-relaxed text-hall-muted">
              まだ歩いていない部屋があります。4つそろうと、
              情・権威・同調・損切りのすべてについて、あなたのツボが分かります。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {remaining.map((r) => (
                <button
                  key={r.roomLabel}
                  onClick={() => navigate(`/briefing/${r.scenarioId}`)}
                  className="rounded-xl border border-hall-line px-4 py-2 text-left text-[12.5px] leading-relaxed transition hover:border-hall-accent/60"
                >
                  {r.roomLabel}「{r.title}」
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 共有 */}
        <section className="mt-10">
          <h2 className="font-display font-bold text-2xl">挑戦状を送る</h2>
          <p className="mt-3 text-[13.5px] leading-[1.9] text-hall-muted">
            「あなたも騙されてみて」と渡すのが、いちばん届きます。
            説教より、来てもらったほうが早い。とくに、あなたの親や、離れて暮らす家族に。
          </p>

          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border-2 border-hall-line bg-hall-surface/60 p-5 font-sans text-[13px] leading-[1.9] text-hall-text/85">
            {shareText}
          </pre>
          <p className="mt-2 text-[11.5px] leading-relaxed text-hall-muted/80">
            ※ 展示での金額です。実際の被害と取り違えられないよう、文面には
            「お金は一円も減らない体験型の展示」であることを必ず添えています。
          </p>

          <button
            onClick={share}
            className="btn-pop mt-4 inline-flex items-center gap-2.5 bg-hall-accent px-6 py-3.5 font-display text-[14px] font-black text-hall-on-accent"
          >
            {copied ? <Check size={16} /> : canShare ? <Share2 size={16} /> : <Copy size={16} />}
            {copied ? 'コピーしました' : canShare ? '［ 挑戦状を送る ］' : '［ 挑戦状をコピー ］'}
          </button>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/codex')}
            className="flex-1 rounded-full border border-hall-line py-3.5 text-[14px] transition hover:border-hall-accent/60"
          >
            手口図鑑を見る
          </button>
          <button
            onClick={() => navigate('/summary')}
            className="flex-1 rounded-full bg-hall-accent py-3.5 text-[14px] font-semibold text-hall-on-accent transition hover:bg-hall-accent/90"
          >
            現実に持ち帰る
          </button>
        </div>

        <HallFooter />
      </motion.div>
    </HallLayout>
  );
}
