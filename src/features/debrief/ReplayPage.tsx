import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Globe, LifeBuoy, Phone, Users, Zap } from 'lucide-react';
import { useScenario } from '@/features/simulator/engine/useScenario';
import { LoadingHall } from '@/components/ui/LoadingHall';
import { TACTICS } from '@/content/tactics';
import { AssetImage } from '@/components/ui/AssetImage';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import {
  indexMessages,
  type Media,
  type Message,
  type TacticId,
} from '@/features/simulator/engine/types';
import { RichText } from '@/components/ui/RichText';
import { usePlayStore } from '@/store/usePlayStore';
import { TacticCardModal } from './TacticCardModal';

/** 手口が仕込まれている要素の見た目。正誤ではなく「ここに何があったか」だけを示す */
const MARKED = 'border-hall-accent/45 bg-hall-accent/[0.05]';
const PLAIN = 'border-hall-line/40';

/**
 * リプレイ用のメディア表示。
 *
 * 体験中に送りつけられた画像そのものを、もう一度、今度は解説つきで見せる。
 * 「この画像は送る側がいくらでも作れる」という話は、現物が目の前にあるほうが効く。
 */
function ReplayMedia({ media }: { media: Media }) {
  switch (media.kind) {
    case 'image':
      return (
        <figure className="mt-3 overflow-hidden rounded-lg border border-hall-line">
          <AssetImage src={media.src} alt={media.alt} className="w-full" />
          <figcaption className="bg-black/30 px-3 py-2 text-[11px] text-hall-muted">
            相手から届いた画像：{media.alt}
          </figcaption>
        </figure>
      );
    case 'chart':
      return (
        <figure className="mt-3 overflow-hidden rounded-lg border border-hall-line">
          <AssetImage
            src={media.src}
            alt={media.label}
            className="w-full"
            fallback={
              <div className="px-3 py-6 text-center text-[12px] text-hall-muted">
                📈 {media.label}（チャート画像）
              </div>
            }
          />
          <figcaption className="bg-black/30 px-3 py-2 text-[11px] text-hall-muted">
            相手から届いた画像：{media.label}
          </figcaption>
        </figure>
      );
    case 'receipt':
      return (
        <p className="mt-3 rounded-lg border border-hall-line px-3 py-2 text-[12px] text-hall-muted">
          🧾 {media.label}：+¥{media.amount.toLocaleString('ja-JP')}
          {media.sub ? `（${media.sub}）` : ''}
        </p>
      );
    case 'linkCard':
      return (
        <p className="mt-3 rounded-lg border border-hall-line px-3 py-2 text-[12px] text-hall-muted">
          🔗 {media.title}　<code className="text-hall-accent/80">{media.domain}</code>
        </p>
      );
  }
}

function TacticChips({
  tactics,
  onOpen,
}: {
  tactics: TacticId[];
  onOpen: (id: TacticId) => void;
}) {
  return (
    <span className="mt-2.5 flex flex-wrap gap-1.5">
      {tactics.map((t) => (
        <span
          key={t}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(t);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onOpen(t);
            }
          }}
          className="cursor-pointer rounded-full border border-hall-accent/50 bg-hall-accent/10 px-2.5 py-1 text-[11px] text-hall-accent transition hover:bg-hall-accent/20"
        >
          #{String(TACTICS[t].no).padStart(2, '0')} {TACTICS[t].name}
        </span>
      ))}
    </span>
  );
}

/**
 * S-06 解説リプレイ — 完全な種明かし（SPEC.md §3.4）
 *
 * 体験中は手口を一切表示しない代わりに、ここではすべてを開示する。
 * 「見抜けたか」は問わない。気づかずに通り過ぎた場所こそ、その人にとっての盲点であり、
 * 採点よりも、そこに何が仕込まれていたかを漏れなく見せることを優先する。
 */
export function ReplayPage() {
  const { scenarioId = '' } = useParams();
  const navigate = useNavigate();
  const { status, scenario } = useScenario(scenarioId);
  const result = usePlayStore((s) => s.lastResult);
  const [openTactic, setOpenTactic] = useState<{
    id: TacticId;
    quote: string;
    note?: string;
  } | null>(null);

  const messages = useMemo<Map<string, Message>>(
    () => (scenario ? indexMessages(scenario) : new Map()),
    [scenario],
  );
  const beats = useMemo(
    () => new Map((scenario?.beats ?? []).map((b) => [b.id, b])),
    [scenario],
  );

  if (status === 'loading') return <LoadingHall />;

  if (!scenario || !result || result.scenarioId !== scenario.id || result.replay.length === 0) {
    return (
      <HallLayout>
        <p className="text-hall-muted">
          振り返れる記録がありません。もう一度プレイすると、ここに会話が残ります。
        </p>
        <button
          onClick={() => navigate(`/briefing/${scenarioId}`)}
          className="btn-pop mt-5 bg-hall-accent px-6 py-3 font-display text-[14px] font-black text-hall-bg hover:bg-yellow-300"
        >
          この展示をプレイする
        </button>
      </HallLayout>
    );
  }

  /**
   * 劇団員の名簿（第4展示室）。
   *
   * 体験中は流速のせいで気づけないが、発言者を数え上げると
   * 「同じ数人が交代で書いていた」ことが一撃で分かる。
   * グループ画面を通ったシナリオでだけ表示する。
   */
  const roster = (() => {
    const groupBeat = result.replay.find((r) => r.kind === 'group');
    if (!groupBeat || !scenario.speakers) return null;
    const view = beats.get(groupBeat.beatId)?.group;
    if (!view) return null;

    const counts = new Map<string, number>();
    let mine = 0;
    for (const item of result.replay) {
      if (item.kind === 'choice') {
        // グループに実際に書き込んだ回数だけを数える。
        // 「（広告をタップした）」のような括弧書きは画面外の行動で、発言ではない。
        const isPost =
          Boolean(item.sent) &&
          !item.sent.startsWith('（') &&
          Boolean(beats.get(item.beatId)?.group);
        if (isPost) mine += 1;
        continue;
      }
      if (item.kind !== 'them') continue;
      const m = messages.get(item.messageId);
      if (!m?.speakerId) continue;
      counts.set(m.speakerId, (counts.get(m.speakerId) ?? 0) + 1);
    }

    const rows = [...counts.entries()]
      .map(([id, count]) => ({ ...scenario.speakers![id], count }))
      .filter((r) => r.name)
      .sort((a, b) => b.count - a.count);

    return rows.length > 0 ? { rows, mine, memberCount: view.memberCount } : null;
  })();

  // 通った経路に仕込まれていた手口の総数（種類ではなく箇所数）
  let markedCount = 0;
  const kinds = new Set<TacticId>();
  for (const item of result.replay) {
    if (item.kind === 'them') {
      const m = messages.get(item.messageId);
      if (m && m.tactics.length > 0) {
        markedCount += 1;
        m.tactics.forEach((t) => kinds.add(t));
      }
    }
    if (item.kind === 'web' || item.kind === 'call' || item.kind === 'group') {
      const beat = beats.get(item.beatId);
      const ann =
        item.kind === 'web'
          ? beat?.web?.annotation
          : item.kind === 'call'
            ? beat?.call?.annotation
            : beat?.group?.annotation;
      if (ann) {
        markedCount += 1;
        ann.tactics.forEach((t) => kinds.add(t));
      }
    }
  }

  return (
    <HallLayout>
      <button
        onClick={() => navigate(`/result/${scenario.id}`)}
        className="mb-8 inline-flex items-center gap-1 text-[13px] text-hall-muted hover:text-hall-text"
      >
        <ChevronLeft size={15} />
        判定にもどる
      </button>

      <p className="text-[11px] tracking-[0.2em] text-hall-accent">{scenario.roomLabel}　舞台裏</p>
      <h1 className="mt-2 font-display font-bold text-3xl">仕掛けの種明かし</h1>
      <div className="mt-4 space-y-3 text-[14px] leading-[1.9] text-hall-muted">
        <p>
        お待たせしました。ここからは舞台裏です。
          あなたが歩いた順路を、仕掛けをすべて開けた状態でもう一度お見せします。
          気づいた場所も、素通りした場所も、区別せずに並べています。
        </p>
        <p className="rounded-2xl border-2 border-hall-line bg-hall-surface/60 px-4 py-3 text-[13px] text-hall-text/80">
          この会話には <strong className="text-hall-accent">{markedCount}箇所</strong>、
          <strong className="text-hall-accent">{kinds.size}種類</strong>
          の仕掛けが仕込まれていました。色のついたカードをタップすると、
          なぜそれが効くのかと、現実での見分け方が読めます。
        </p>
      </div>

      {/* 本体 */}
      <div className="mt-9 space-y-3">
        {result.replay.map((item, i) => {
          if (item.kind === 'time') {
            return (
              <p
                key={`t-${i}`}
                className="pt-5 text-center text-[11.5px] tracking-widest text-hall-muted/60"
              >
                {item.label}
              </p>
            );
          }

          if (item.kind === 'call' || item.kind === 'web' || item.kind === 'group') {
            const beat = beats.get(item.beatId);
            const view =
              item.kind === 'call' ? beat?.call : item.kind === 'web' ? beat?.web : beat?.group;
            if (!view) return null;
            const ann = view.annotation;
            const isCall = item.kind === 'call';
            const heading =
              item.kind === 'call'
                ? beat!.call!.callerName
                : item.kind === 'web'
                  ? beat!.web!.heading
                  : beat!.group!.name;
            const sub =
              item.kind === 'call'
                ? beat!.call!.callerClaim
                : item.kind === 'web'
                  ? beat!.web!.domain
                  : `表示上の参加人数 ${beat!.group!.memberCount}人`;
            return (
              <div
                key={`s-${i}`}
                className={`rounded-2xl border-2 px-4 py-3.5 ${ann ? MARKED : PLAIN}`}
              >
                <p className="flex items-center gap-2 text-[11px] tracking-[0.15em] text-hall-muted">
                  {isCall ? <Phone size={12} /> : item.kind === 'group' ? <Users size={12} /> : <Globe size={12} />}
                  {isCall
                    ? beat!.call!.state === 'incoming'
                      ? '着信'
                      : '通話中'
                    : item.kind === 'group'
                      ? 'グループチャット'
                      : '偽サイトの画面'}
                </p>
                <p className="mt-2 text-[14px] text-hall-text/90">{heading}</p>
                {sub && <p className="mt-1 text-[11.5px] text-hall-muted">{sub}</p>}
                {ann && (
                  <>
                    <TacticChips
                      tactics={ann.tactics}
                      onOpen={(id) =>
                        setOpenTactic({ id, quote: sub ?? heading, note: ann.note })
                      }
                    />
                    <p className="mt-3 border-t border-hall-line/60 pt-3 text-[13px] leading-[1.85] text-hall-text/75">
                      <RichText text={ann.note} />
                    </p>
                  </>
                )}
              </div>
            );
          }

          if (item.kind === 'them') {
            const m = messages.get(item.messageId);
            if (!m) return null;
            const marked = m.tactics.length > 0;
            // グループの発言は、誰が言ったかが分かってはじめて名簿の落ちが効く
            const speaker = m.speakerId ? scenario.speakers?.[m.speakerId] : undefined;
            return (
              <div
                key={`m-${i}`}
                className={[
                  'rounded-2xl border-2 px-4 py-3',
                  marked ? MARKED : PLAIN,
                  m.from === 'system' ? 'opacity-70' : '',
                ].join(' ')}
              >
                <p className="text-[10.5px] tracking-[0.15em] text-hall-muted/70">
                  {m.from === 'system' ? (
                    'システム'
                  ) : (
                    <>
                      {speaker && (
                        <span
                          className="mr-1.5 inline-block size-2 translate-y-[1px] rounded-full"
                          style={{ background: speaker.color }}
                          aria-hidden
                        />
                      )}
                      {speaker?.name ?? scenario.contact.displayName}
                    </>
                  )}
                </p>
                <p className="mt-1.5 text-[14px] leading-[1.8] text-hall-text/90">{m.body}</p>
                {m.media && <ReplayMedia media={m.media} />}
                {marked && (
                  <>
                    <TacticChips
                      tactics={m.tactics}
                      onOpen={(id) => setOpenTactic({ id, quote: m.body, note: m.note })}
                    />
                    {m.note && (
                      <p className="mt-3 border-t border-hall-line/60 pt-3 text-[13px] leading-[1.85] text-hall-text/75">
                        <RichText text={m.note} />
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          }

          // プレイヤーの選択
          const beat = beats.get(item.beatId);
          const choice = beat?.choices.find((c) => c.id === item.choiceId);
          if (!beat || !choice) return null;
          const alternatives = beat.choices.filter((c) => c.id !== choice.id);

          return (
            <div key={`c-${i}`}>
              {beat.pivotal && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="my-5 rounded-2xl border-2 border-hall-warn/45 bg-hall-warn/[0.09] px-4 py-4"
                >
                  <p className="flex items-center gap-1.5 font-display text-[12.5px] font-black text-hall-warn">
                    <Zap size={13} />
                    ここが分かれ道でした
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-semibold text-hall-text">
                    {beat.pivotal.headline}
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.85] text-hall-text/75">
                    <RichText text={beat.pivotal.body} />
                  </p>
                </motion.div>
              )}

              <div className="rounded-2xl border-2 border-hall-line bg-white/[0.03] px-4 py-3">
                <p className="text-[10.5px] tracking-[0.15em] text-hall-muted/70">あなたの選択</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-hall-text">
                  {choice.label}
                  {choice.irreversible && (
                    <span className="ml-2 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10.5px] text-rose-300">
                      一線を越えた操作
                    </span>
                  )}
                </p>
                {choice.outcomeHint && (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-hall-muted">
                    → {choice.outcomeHint}
                  </p>
                )}

                {beat.pivotal && alternatives.some((a) => a.outcomeHint) && (
                  <div className="mt-3.5 border-t border-hall-line pt-3">
                    <p className="text-[10.5px] tracking-[0.15em] text-hall-muted/70">
                      選ばなかった道
                    </p>
                    <ul className="mt-2 space-y-2">
                      {alternatives
                        .filter((a) => a.outcomeHint)
                        .map((a) => (
                          <li key={a.id} className="text-[12.5px] leading-relaxed">
                            <span className="text-hall-text/70">{a.label}</span>
                            <span className="mt-0.5 block text-hall-muted">
                              → {a.outcomeHint}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 劇団員の名簿（グループチャットの展示だけ） */}
      {roster && (
        <section className="mt-10 rounded-2xl border-2 border-hall-accent/50 bg-hall-accent/[0.07] p-6">
          <h2 className="flex items-center gap-2 font-display font-bold text-xl">
            <Users size={17} className="text-hall-accent" />
            この部屋にいた「参加者」
          </h2>
          <p className="mt-2.5 text-[13px] leading-relaxed text-hall-muted">
            あなたが見ていたあいだに、実際に発言した人をすべて数えました。
          </p>

          <table className="mt-4 w-full text-[13px]">
            <thead>
              <tr className="border-b border-hall-line text-left text-[11px] tracking-[0.15em] text-hall-muted">
                <th className="py-2 font-normal">表示名</th>
                <th className="py-2 text-right font-normal">発言</th>
                <th className="py-2 pl-3 font-normal">役</th>
              </tr>
            </thead>
            <tbody>
              {roster.rows.map((r) => (
                <tr key={r.name} className="border-b border-hall-line/50">
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: r.color }}
                        aria-hidden
                      />
                      {r.name}
                    </span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-hall-muted">{r.count}回</td>
                  <td className="py-2.5 pl-3 text-hall-accent/90">{r.role ?? '—'}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2.5 font-semibold">あなた</td>
                <td className="py-2.5 text-right tabular-nums text-hall-muted">
                  {roster.mine}回
                </td>
                <td className="py-2.5 pl-3 text-hall-muted">—</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-5 text-[14px] leading-[1.95] text-hall-text/90">
            表示上の参加人数は
            <strong className="text-hall-accent"> {roster.memberCount}人</strong>
            。実際に発言したのは、あなたを含めて
            <strong className="text-hall-accent"> {roster.rows.length + 1}人</strong>
            でした。
          </p>
          <p className="mt-3 text-[13px] leading-[1.9] text-hall-muted">
            残りの人数は、一度も発言しません。存在を確認する方法もありません。
            あなたが「大勢が信じている」と感じていたものの正体は、
            役割を決めて交代で書き込む数人と、確かめようのない数字でした。
          </p>
        </section>
      )}

      {/* 学びを現実に接続する導線 */}
      <button
        onClick={() => navigate('/summary')}
        className="group mt-10 flex w-full items-center gap-4 rounded-2xl border-2 border-hall-accent/60 bg-hall-accent/[0.09] px-6 py-5 text-left transition hover:-translate-y-0.5 hover:border-hall-accent"
      >
        <LifeBuoy size={22} className="shrink-0 text-hall-accent" />
        <span className="flex-1">
          <span className="block font-display font-bold text-lg">［ 現実に持ち帰る ］</span>
          <span className="mt-1 block text-[12.5px] leading-relaxed text-hall-muted">
            これが出たら手を止めるチェックリストと、公的な相談窓口。
          </span>
        </span>
        <ArrowRight
          size={18}
          className="shrink-0 text-hall-accent transition group-hover:translate-x-0.5"
        />
      </button>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => navigate('/codex')}
          className="flex-1 rounded-full border-2 border-hall-line py-3.5 text-[14px] font-bold transition hover:border-hall-accent"
        >
          仕掛けの一覧
        </button>
        <button
          onClick={() => navigate(`/play/${scenario.id}`)}
          className="flex-1 rounded-full border-2 border-hall-line py-3.5 text-[14px] font-bold transition hover:border-hall-accent"
        >
          別の順路を試す
        </button>
        <button
          onClick={() => navigate('/rooms')}
          className="btn-pop flex-1 bg-hall-accent py-3.5 font-display text-[14px] font-black text-hall-bg hover:bg-yellow-300"
        >
          順路にもどる
        </button>
      </div>

      <HallFooter />

      <TacticCardModal
        card={openTactic ? TACTICS[openTactic.id] : null}
        context={
          openTactic?.quote ? { quote: openTactic.quote, note: openTactic.note } : undefined
        }
        onClose={() => setOpenTactic(null)}
        onSelectRelated={(id) => setOpenTactic({ id, quote: '' })}
      />
    </HallLayout>
  );
}
