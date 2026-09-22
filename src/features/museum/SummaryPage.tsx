import { motion } from 'framer-motion';
import { ExternalLink, Phone, ShieldAlert } from 'lucide-react';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { HallNav } from '@/components/ui/HallNav';
import { DrBug } from '@/components/ui/DrBug';

/**
 * 「これが出たら、その時点で手を止める」チェックリスト。
 *
 * 文言に注意：断定は、例外のない事実にだけ使う。
 * 「絶対に詐欺」と言い切れないものを言い切ると、外れたときに
 * 「じゃあ他も当てにならない」と全部が無効化される。
 */
const RED_FLAGS: { title: string; detail: string }[] = [
  {
    title: 'お金を引き出すために、先にお金を払えと言われた',
    detail:
      '税金・保証金・認証料・手数料、名目は何でも。正規の金融機関が、出金のために先に入金を求めることはありません。例外はありません。',
  },
  {
    title: '公的機関を名乗る相手が、電話やSMSで資産の話をしてきた',
    detail:
      '警察・検察・金融庁・市役所が、個人に電話やメッセージで口座や資産の操作を指示することはありません。折り返す場合は、相手が伝えた番号ではなく、自分で調べた代表番号にかけてください。',
  },
  {
    title: '「このことは誰にも言わないで」と言われた',
    detail:
      '第三者に話されると崩れる話だと、相手自身が知っています。他言無用を求められた時点が、相談すべきタイミングです。',
  },
  {
    title: '現金の手渡し、電子マネー、ギフトカード、暗号資産で払えと言われた',
    detail: 'いずれも、取り戻すことが極めて難しい支払い方法です。だから指定されます。',
  },
  {
    title: '会ったことのない相手から、投資や副業の話が出た',
    detail:
      '相手との関係がどれだけ長くても、対面で会ったことがないなら「会ったことのない相手」です。SNS・マッチングアプリ経由の投資話は、それ自体が典型的な入口です。',
  },
  {
    title: '締切が、相談窓口の営業時間外に設定されている',
    detail:
      '深夜・早朝・連休中の締切は、確認と相談を物理的に不可能にするために選ばれています。',
  },
  {
    title: '足りない分は借りればいいと勧められた',
    detail:
      'この時点で相手の狙いは、あなたが持っている額ではなく、調達できる額に移っています。被害が人生の設計を変える規模になるのは、ほぼここからです。',
  },
  {
    title: 'ビデオ通話や対面だけが、毎回もっともらしい理由で避けられる',
    detail:
      '何を言ってくるかより、何を断ってくるかを見てください。本人確認につながる要求だけが先送りされるなら、理由は一つです。',
  },
];

const CONTACTS = [
  {
    name: '警察相談専用電話',
    number: '#9110',
    tel: 'tel:%239110',
    note: '詐欺かもしれない、と思った段階で相談できます。緊急時は110番。',
  },
  {
    name: '消費者ホットライン',
    number: '188',
    tel: 'tel:188',
    note: '最寄りの消費生活センターにつながります（局番なし・いやや！と覚える）。',
  },
];

const LINKS = [
  {
    label: '金融事業者一括検索（金融庁）',
    url: 'https://search.fsa.go.jp/',
    note: '業者名や電話番号を入れるだけで、登録を受けた事業者かどうかが分かります。検索に出てこなければ、無登録の可能性があります。',
  },
  {
    label: 'SNS型投資詐欺（警察庁）',
    url: 'https://www.npa.go.jp/bureau/safetylife/sos47/case/sns-romance/investment/',
    note: 'いま実際に使われている手口と、最新の統計が公開されています。',
  },
  {
    label: '儲け話に関するトラブルにご注意！（国民生活センター）',
    url: 'https://www.kokusen.go.jp/soudan_now/data/moukebanashi.html',
    note: '実際の相談事例が読めます。自分の状況に近いものが必ず見つかります。',
  },
  {
    label: 'SNSを通じた「もうけ話」にご注意（消費者庁）',
    url: 'https://www.caa.go.jp/policies/policy/consumer_policy/caution/caution_036/',
    note: '著名人のなりすましを含む勧誘への注意喚起。振込先が個人名義なら詐欺、と明記されています。',
  },
];

/** S-08 まとめ・相談窓口 */
export function SummaryPage() {
  return (
    <HallLayout>
      <HallNav />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] tracking-[0.2em] text-hall-accent">TAKE THIS WITH YOU</p>
        <h1 className="mt-2 font-display font-bold text-3xl leading-snug">
          持ち帰るもの
        </h1>

        {/* ここだけは Dr.バグに芝居をさせない。
            このページに来る人は、いま実際に困っている可能性がある。
            表と裏で同じことを言う唯一の場所にしてある。
            仮面が外れる場所が一箇所あることで、他の場所の二面性も効く。 */}
        <div className="mt-5">
          <DrBug
            size="sm"
            front="ここから先は展示ではありません。番号も窓口も、すべて実在します。芝居はここまでです。"
            back="ここから先は展示ではありません。番号も窓口も、すべて実在します。芝居はここまでです。"
          />
        </div>

        {/* コアメッセージ */}
        <section className="mt-8 rounded-2xl border-2 border-hall-accent/45 bg-hall-accent/[0.07] p-5">
          <p className="text-[15px] leading-[2] text-hall-text/90">
            この展示を最後まで見た人には、もう分かっているはずです。
            詐欺は「怪しい話」として来るのではありません。
            半年かけて信頼を作った人からの、ごく自然な相談として来ます。
          </p>
          <p className="mt-4 text-[15px] leading-[2] text-hall-text/90">
            騙された人が愚かだったのではありません。
            感情・権威・小さな成功体験・締切・孤立を順番に積み上げた設計に、
            正面から当たっただけです。設計されたものに当たれば、誰でも倒れます。
          </p>
        </section>

        {/* チェックリスト */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-display font-bold text-2xl">
            <ShieldAlert size={20} className="text-hall-warn" />
            これが出たら、手を止める
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-hall-muted">
            内容を吟味する必要はありません。1つでも当てはまったら、
            その場で判断せず、この関係の外にいる人に話してください。
          </p>

          <ol className="mt-6 space-y-3">
            {RED_FLAGS.map((flag, i) => (
              <li
                key={flag.title}
                className="rounded-2xl border-2 border-hall-line bg-hall-surface p-5"
              >
                <div className="flex gap-3.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-hall-accent/15 text-[12px] font-bold tabular-nums text-hall-accent">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[14.5px] font-semibold leading-snug">{flag.title}</p>
                    <p className="mt-2 text-[13px] leading-[1.85] text-hall-muted">
                      {flag.detail}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 相談窓口 */}
        <section className="mt-12">
          <h2 className="font-display font-bold text-2xl">相談する</h2>
          <p className="mt-3 text-[14px] leading-[1.9] text-hall-muted">
            まだ被害が出ていなくても相談できます。「これは詐欺ですか」と聞くために、
            何かを失っている必要はありません。
          </p>

          <div className="mt-6 space-y-3">
            {CONTACTS.map((c) => (
              <a
                key={c.number}
                href={c.tel}
                className="flex items-center gap-4 rounded-2xl border-2 border-hall-accent/50 bg-hall-accent/[0.08] p-5 transition hover:-translate-y-0.5 hover:border-hall-accent"
              >
                <Phone size={20} className="shrink-0 text-hall-accent" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-hall-muted">{c.name}</p>
                  <p className="font-display font-bold text-3xl leading-tight tabular-nums">{c.number}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-hall-muted">
                    {c.note}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-5 rounded-2xl border-2 border-hall-line bg-hall-surface/50 p-4 text-[13px] leading-[1.85] text-hall-muted">
            <strong className="text-hall-text">すでに送金してしまった場合も、できることがあります。</strong>
            まず振込先の金融機関と自分の銀行に連絡し、続いて警察へ被害届を出してください。
            早いほど口座の凍結が間に合う可能性が残ります。
            なお、「被害金を取り返す」と持ちかけてくる業者や個人には応じないでください。
            二次被害としてもっとも多い形です。
          </p>
        </section>

        {/* 公的情報 */}
        <section className="mt-12">
          <h2 className="font-display font-bold text-2xl">確かめる</h2>
          <div className="mt-5 space-y-2.5">
            {LINKS.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-2xl border-2 border-hall-line p-4 transition hover:border-hall-accent"
              >
                <ExternalLink size={15} className="mt-0.5 shrink-0 text-hall-accent" />
                <span>
                  <span className="block text-[14px] font-semibold">{l.label}</span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-hall-muted">
                    {l.note}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* 最後の一押し */}
        <section className="mt-12 rounded-2xl border-2 border-hall-line bg-hall-surface p-6">
          <p className="text-[15px] leading-[2] text-hall-text/90">
            相談をためらわせているのは、たいてい恥ずかしさです。
            しかし窓口の相手は、同じ話を毎日聞いています。
            あなたの話は、その人にとって何千件目かの、よく知られた手口の一つです。
          </p>
          <p className="mt-4 text-[15px] leading-[2] text-hall-text/90">
            黙っていることで守られるのは、あなたの体面ではなく、相手の設計です。
          </p>
        </section>

        <HallFooter />
      </motion.div>
    </HallLayout>
  );
}
