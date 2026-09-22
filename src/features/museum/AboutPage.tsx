import { motion } from 'framer-motion';
import { ExternalLink, FileWarning, Github, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { HallNav } from '@/components/ui/HallNav';
import { DrBug } from '@/components/ui/DrBug';

const SOURCES = [
  {
    org: '警察庁「SNS型投資詐欺」（SOS47 特殊詐欺対策ページ）',
    url: 'https://www.npa.go.jp/bureau/safetylife/sos47/case/sns-romance/investment/',
    items: [
      '第1・第4展示室が扱う手口の解説と、最新の注意喚起',
      '同サイト内の統計発表が、本サイトの引用している被害統計の出典',
    ],
  },
  {
    org: '警察庁「令和7年における特殊詐欺及びSNS型投資・ロマンス詐欺の認知・検挙状況等について（確定値）」',
    url: 'https://www.npa.go.jp/bureau/safetylife/sos47/new-topics/260605/01.html',
    items: ['本サイトが引用している認知件数・被害額の一次資料'],
  },
  {
    org: '国民生活センター「儲け話に関するトラブルにご注意！」',
    url: 'https://www.kokusen.go.jp/soudan_now/data/moukebanashi.html',
    items: [
      '投資・副業をきっかけとした消費者トラブルの相談事例',
      '無登録の海外業者、SNS経由の勧誘、暗号資産の事例が分類されている',
    ],
  },
  {
    org: '消費者庁「SNSなどを通じた投資や副業といった「もうけ話」にご注意ください!」',
    url: 'https://www.caa.go.jp/policies/policy/consumer_policy/caution/caution_036/',
    items: [
      '著名人のなりすましを含む勧誘への注意喚起',
      '「投資資金の振込先に個人名義の口座を指定された場合、それは詐欺です」',
    ],
  },
  {
    org: '金融庁「金融事業者一括検索」',
    url: 'https://search.fsa.go.jp/',
    items: [
      '業者名や電話番号から、登録を受けた金融事業者かどうかを確認できる',
      '検索されない事業者は無登録である可能性がある、と同庁が明示している',
    ],
  },
];

const CONCEPTS = [
  {
    term: '互恵性・社会的証明・希少性・権威・一貫性',
    from: 'Robert B. Cialdini『影響力の武器』（誠信書房）',
    note: '本サイトの手口カード #02〜#07 の分類は、社会心理学で長く検証されてきたこれらの原理に対応しています。',
  },
  {
    term: 'サンクコスト効果・損失回避',
    from: '行動経済学（プロスペクト理論）の標準的な知見',
    note: '手口カード #12 の土台。すでに払った額が、これからの判断を歪める仕組みです。',
  },
  {
    term: '間欠強化',
    from: '学習心理学における部分強化スケジュールの研究',
    note: '手口カード #06。報酬が不規則なほど、その行動への執着が強まることが知られています。',
  },
];

/** S-09 このサイトについて */
export function AboutPage() {
  return (
    <HallLayout>
      <HallNav />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] tracking-[0.2em] text-hall-accent">ABOUT</p>
        <h1 className="mt-2 font-display font-bold text-3xl">このサイトについて</h1>

        <div className="mt-5">
          <DrBug
            size="sm"
            front="この館の作り方と、根拠にした資料です。疑ってから読んでください。それが正しい読み方です。"
            back="出典を並べてある。確かめられるものだけを置いた。確かめようのない主張こそ、この館が展示している手口なのでね。"
          />
        </div>

        {/* 制作意図 */}
        <section className="mt-9">
          <h2 className="font-display font-bold text-2xl">なぜ作ったか</h2>
          <div className="mt-5 space-y-5 text-[15px] leading-[2] text-hall-text/85">
            <p>
              詐欺の啓発は、たいてい「こういう手口に注意しましょう」という箇条書きで終わります。
              読んだ人はうなずき、そして自分は引っかからないと思う。
              実際に被害にあうのは、その箇条書きを読んだことがある人たちです。
            </p>
            <p>
              知識が足りないから騙されるのではありません。
              手口の側が、人間の判断の仕組みそのものを利用しているからです。
              好意を向けられれば疑いにくくなる。急かされれば比較をやめる。
              一度払えば引き返せなくなる。これらは弱さではなく、人間の標準仕様です。
            </p>
            <p className="rounded-2xl border-2 border-hall-accent/45 bg-hall-accent/[0.08] p-5 font-display text-[17px] font-bold leading-[1.75]">
              騙される人が愚かなのではない。
              <br />
              手口が、人間の認知の穴を正確に突いている。
            </p>
            <p>
              この主張は、読んで納得するものではありません。
              一度通り抜けて、自分の判断が実際に曲げられる感触を持ってはじめて意味を持ちます。
              だからこの博物館の展示物は、ガラスケースの中ではなく、
              あなたのスマートフォンの中で動きます。
            </p>
            <p>
              そして、体験が終わったあとに残ってほしいのは「怖い」という感情ではなく、
              <strong className="text-hall-text">
                手口には順番と構造があり、どこかで必ず止められる
              </strong>
              という理解です。
            </p>
          </div>
        </section>

        {/* 着想のもと */}
        <section className="mt-12">
          <h2 className="font-display font-bold text-2xl">着想のもと</h2>
          <div className="mt-5 rounded-2xl border-2 border-hall-accent/45 bg-hall-accent/[0.06] p-6">
            <a
              href="https://amix-design.com/tl/web-darkp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-display text-[17px] font-bold hover:text-hall-accent"
            >
              ダークパターン博物館｜だまされて、学ぼう。
              <ExternalLink size={14} className="text-hall-accent" />
            </a>
            <p className="mt-1 text-[12.5px] text-hall-muted">制作：AMIX（トミナガハルキ）</p>
            <div className="mt-4 space-y-4 text-[13.5px] leading-[1.95] text-hall-text/85">
              <p>
                この博物館は、ウェブサイトの「だましのUI」を実際に踏んで学ぶ展示
                <strong className="text-hall-text">「ダークパターン博物館」</strong>
                から着想を得ています。
                解説を読ませるのではなく、まず引っかからせて、そのあとで種を明かす。
                その構成に出会わなければ、このサイトは普通の注意喚起ページになっていました。
              </p>
              <p>
                扱う領域は異なります。あちらは日常的に遭遇するウェブUIの設計、
                こちらは対人コミュニケーションを使った詐欺の手口です。
                ただ「人は説明では変わらない。体験してはじめて自分の穴に気づく」という前提は、
                そのまま受け継いでいます。
              </p>
              <p className="text-hall-muted">
                本サイトは同館とは無関係の非公式な制作物で、内容についての責任はすべて制作者にあります。
                先に道を作ってくださったことに感謝します。
              </p>
            </div>
          </div>
        </section>

        {/* 設計上の約束 */}
        <section className="mt-12">
          <h2 className="font-display font-bold text-2xl">設計上の約束</h2>
          <ul className="mt-5 space-y-3">
            {[
              {
                t: '被害者を責めない',
                d: '判定画面や解説で「なぜ気づかなかったのか」という問い方をしません。結果がどうであれ、構造の問題として提示します。',
              },
              {
                t: '加害の手引きにしない',
                d: '手口は構造が分かる最小限に留め、通しで使える台本にはしていません。送金の具体的手順、資金の移動経路、匿名化の方法は一切扱いません。',
              },
              {
                t: '体験中に警告を出さない',
                d: '送金や入力の場面でも、危険を示す表示は出しません。現実の画面にも警告は出ないからです。どこが分岐点だったかは、体験後にすべて開示します。',
              },
              {
                t: 'いつでも抜けられる',
                d: '実際の被害経験がある方に配慮し、各画面の左上から中断できます。相談窓口へはどのページからでも1タップで移動できます。',
              },
            ].map((x) => (
              <li key={x.t} className="rounded-2xl border-2 border-hall-line bg-hall-surface p-5">
                <p className="text-[14.5px] font-semibold">{x.t}</p>
                <p className="mt-2 text-[13px] leading-[1.85] text-hall-muted">{x.d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 免責 */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-display font-bold text-2xl">
            <FileWarning size={19} className="text-hall-accent" />
            免責事項
          </h2>
          <div className="mt-5 space-y-3 rounded-2xl border-2 border-hall-line bg-hall-surface p-6 text-[13.5px] leading-[1.9] text-hall-text/85">
            <p>
              <strong className="text-hall-text">
                本サイトに登場する人物・団体・企業・サービス・アプリ・URL・金額・画面は、
                すべて架空のものです。
              </strong>
              実在の個人、組織、商品、サービスとは一切関係ありません。
              登場する人物の画像は生成AIによるもので、実在の人物ではありません。
            </p>
            <p>
              「Meridian Capital」および `meridian-capital-jp.trade`
              をはじめとする社名・ドメインは、この展示のために作成した架空のものです。
              同名・類似名の実在する事業者があったとしても、本サイトの内容とは無関係です。
            </p>
            <p>
              本サイトは詐欺被害の防止を目的とした教育用の展示であり、
              法律・金融・投資に関する助言を行うものではありません。
              個別の被害や取引についての判断は、必ず公的な相談窓口や専門家にご確認ください。
            </p>
            <p>
              本サイトの内容を利用したことによって生じた損害について、
              制作者は責任を負いかねます。
            </p>
          </div>
        </section>

        {/* 出典 */}
        <section className="mt-12">
          <h2 className="font-display font-bold text-2xl">出典・参考資料</h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-hall-muted">
            手口の分類と、シナリオ内で描いた被害の進行は、以下の公的資料に依拠しています。
            統計の数値は更新されるため、最新の値は各機関の発表をご確認ください。
          </p>

          <div className="mt-5 space-y-3">
            {SOURCES.map((s) => (
              <div key={s.org} className="rounded-2xl border-2 border-hall-line p-5">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold hover:text-hall-accent"
                >
                  {s.org}
                  <ExternalLink size={13} className="text-hall-accent" />
                </a>
                <ul className="mt-2.5 space-y-1.5">
                  {s.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-[12.5px] leading-relaxed">
                      <span className="mt-[0.55em] size-1 shrink-0 rounded-full bg-hall-accent/60" />
                      <span className="text-hall-muted">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mt-8 flex items-center gap-2 text-[12px] tracking-[0.2em] text-hall-muted">
            <Quote size={13} className="text-hall-accent" />
            手口カードの理論的背景
          </h3>
          <div className="mt-4 space-y-3">
            {CONCEPTS.map((c) => (
              <div key={c.term} className="rounded-2xl border-2 border-hall-line/70 p-5">
                <p className="text-[14px] font-semibold">{c.term}</p>
                <p className="mt-1 text-[12.5px] text-hall-accent/90">{c.from}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-hall-muted">{c.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 引用している統計 */}
        <section className="mt-10 rounded-2xl border-2 border-hall-line bg-hall-surface p-6">
          <p className="text-[12px] tracking-[0.2em] text-hall-muted">本サイトが引用している統計</p>
          <dl className="mt-4 space-y-3 text-[13.5px] leading-relaxed">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <dt className="text-hall-muted">SNS型投資・ロマンス詐欺（2024年）</dt>
              <dd className="font-display font-bold text-lg tabular-nums">
                被害総額 約1,271.9億円／認知件数 10,237件
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <dt className="text-hall-muted">特殊詐欺全体（2024年）</dt>
              <dd className="font-display font-bold text-lg tabular-nums">被害総額 717.6億円</dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <dt className="text-hall-muted">SNS型投資詐欺のみ（2025年）</dt>
              <dd className="font-display font-bold text-lg tabular-nums">
                被害額 1,288.0億円／認知件数 9,523件（前年比 +47.9%）
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <dt className="text-hall-muted">同・当初の接触手段（2025年）</dt>
              <dd className="font-display font-bold text-lg tabular-nums">
                バナー等広告 3,785件／DM 3,549件（約8割）
              </dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-hall-line pt-3 text-[12.5px] leading-relaxed text-hall-muted">
            出典：2024年の数値は警察庁「令和6年における特殊詐欺及びSNS型投資・ロマンス詐欺の認知・検挙状況等について」、
            2025年の数値は同「令和7年——（確定値）」。いずれも上記「出典・参考資料」にリンクがあります。
            SNS型投資・ロマンス詐欺の被害額は特殊詐欺全体を大きく上回り、過去最悪の水準です。
            統計は毎年更新されるため、引用の際は最新の発表をご確認ください。
          </p>
        </section>

        {/* 制作 */}
        <section className="mt-12">
          <h2 className="font-display font-bold text-2xl">制作</h2>
          <div className="mt-5 rounded-2xl border-2 border-hall-line bg-hall-surface p-6">
            <p className="font-display text-[17px] font-bold tracking-wide">
              kei_officos
            </p>
            <p className="mt-1.5 text-[12.5px] text-hall-muted">個人制作</p>
            <p className="mt-4 text-[13.5px] leading-[1.9] text-hall-text/85">
              この展示のソースコード、シナリオ本文、手口カードの全文は公開しています。
              何を根拠にどう書いたかを、誰でも確かめられる状態にしておくためです。
            </p>
            <a
              href="https://github.com/ishikawa-officos/scam-museum"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold hover:text-hall-accent"
            >
              <Github size={14} className="text-hall-accent" />
              github.com/ishikawa-officos/scam-museum
              <ExternalLink size={12} className="text-hall-accent" />
            </a>
            <p className="mt-5 border-t border-hall-line pt-4 text-[12.5px] leading-[1.85] text-hall-muted">
              内容の誤り、配慮に欠ける表現、統計の古さに気づかれた場合は、
              上記リポジトリの Issue でお知らせください。
              個別の被害相談には応じられないため、
              <Link to="/summary" className="text-hall-accent underline underline-offset-2">
                相談窓口
              </Link>
              をご利用ください。
            </p>
          </div>
        </section>

        <HallFooter />
      </motion.div>
    </HallLayout>
  );
}
