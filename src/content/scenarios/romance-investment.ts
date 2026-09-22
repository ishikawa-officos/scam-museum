import type { Message, Scenario } from '@/features/simulator/engine/types';

/**
 * 第1展示室「海の向こうの恋人」— 国際ロマンス投資詐欺（本編 / フェーズ2）
 *
 * 構成（王道6ステップ）
 *   ACT 1  b01-b07  日常会話とラポール形成、出張の約束
 *   ACT 2  b08-b12  叔父（投資のプロ）と副収入の匂わせ
 *   ACT 3  b13-b16  少額の誘導「5万円だけ」
 *   ACT 4  b17-b20  偽の成功体験（少額の出金に成功させる）
 *   ACT 5  b21-b24  大型投資の要求「今夜チャンスがある」
 *   ACT 6  b25-b29  引き出せない罠「保証金をあと200万円」
 *
 * 【内容方針 / SPEC.md §5】
 * ・登場する人物・企業・サービス・ドメインはすべて架空。
 * ・手口の「構造」が分かる最小限に留め、通しで使える台本にはしない。
 *   送金の具体的手順、匿名化、資金の移動経路は一切書かない。
 * ・被害者を責める表現を使わない。
 */

/** 相手の短いリアクションを作るヘルパー（選択への即応用） */
function reply(id: string, body: string, tactics: Message['tactics'] = [], note?: string): Message {
  return { id, from: 'them', surface: 'chat', body, tactics, note };
}

export const romanceInvestment: Scenario = {
  id: 'romance-investment',
  title: '海の向こうの恋人',
  roomLabel: '第1展示室',
  estimatedMinutes: 8,
  persona: {
    name: 'あなた',
    summary: [
      '42歳・会社員。3年前に離婚し、現在は一人暮らし。',
      '半年前から、趣味の写真を投稿するSNSを使っている。',
      '預貯金は約480万円。将来の資産形成に漠然とした不安がある。',
    ],
    savings: 4_800_000,
  },
  contact: {
    displayName: 'Emma Clarke',
    avatarInitial: 'E',
    avatarColor: '#c96f6f',
    // public/assets/romance/ に置くと自動で使われる（未配置なら頭文字を表示）
    avatarSrc: '/assets/romance/emma-avatar.webp',
    subtitle: 'オンライン',
  },
  initialStats: { trust: 10, pressure: 0, isolation: 0, damage: 0, days: 0 },
  entryBeat: 'b01',

  beats: [
    // ════════════ ACT 1 ラポール形成 ════════════
    {
      id: 'b01',
      timeLabel: '10月3日（金） 21:14',
      incoming: [
        {
          id: 'b01-m1',
          from: 'them',
          surface: 'chat',
          body: 'こんばんは。突然すみません。あなたが投稿していた朝の海の写真、とても綺麗でした。',
          tactics: [],
        },
        {
          id: 'b01-m2',
          from: 'them',
          surface: 'chat',
          body: '私はEmmaといいます。シンガポールで働いています。日本語は勉強してもう6年になります。少し変かもしれません。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'ありがとうございます。日本語お上手ですね',
          effects: { trust: 8 },
          reaction: [reply('b01-r1', 'うれしい。日本のドラマで覚えたので、たまに言葉が古いと言われます。')],
          next: 'b02',
        },
        {
          id: 'c2',
          label: 'どこで私の投稿を？',
          sentAs: 'どこで私の投稿を見つけたんですか？',
          effects: { trust: 2 },
          reaction: [
            reply(
              'b01-r2',
              '「#朝の海」で探していました。私も海の近くで育ったので、つい見てしまって。',
            ),
          ],
          next: 'b02',
        },
        {
          id: 'c3',
          label: '返信しない',
          sentAs: '',
          effects: { trust: -2, days: 2 },
          reaction: [
            reply('b01-r3', '返事、困らせてしまったならごめんなさい。'),
            reply('b01-r4', '写真の感想を言いたかっただけなんです。それだけ。'),
          ],
          next: 'b02',
        },
      ],
    },

    {
      id: 'b02',
      timeLabel: '10月8日（水） 22:30',
      incoming: [
        {
          id: 'b02-m1',
          from: 'them',
          surface: 'chat',
          body: '今日は残業で遅くなりました。夕食はコンビニのサンドイッチ。こんな話、つまらないですよね。',
          tactics: [],
        },
        {
          id: 'b02-m2',
          from: 'them',
          surface: 'chat',
          body: 'あなたは、普段どんな一日を過ごしていますか。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '仕事と家の往復。話せることもあまりないかな',
          effects: { trust: 5 },
          reaction: [
            reply('b02-r1', 'その「あまりない一日」を聞くのが、私には楽しいのだと思います。'),
          ],
          next: 'b03',
        },
        {
          id: 'c2',
          label: '休みの日は写真を撮りに行ってます',
          effects: { trust: 7 },
          reaction: [
            reply('b02-r2', 'いいな。次はどこへ行くのですか？　行き先を聞くだけで少し旅をした気になります。'),
          ],
          next: 'b03',
        },
      ],
    },

    {
      id: 'b03',
      timeLabel: '10月19日（日） 07:02',
      incoming: [
        {
          id: 'b03-m1',
          from: 'them',
          surface: 'chat',
          body: 'おはよう。今日もそちらは晴れていますか？　こちらは朝から雨です。',
          tactics: [],
        },
        {
          id: 'b03-m2',
          from: 'them',
          surface: 'chat',
          body: '毎朝あなたに挨拶するのが習慣になってしまいました。変ですね。まだ二週間なのに。',
          tactics: ['LOVE_BOMBING'],
          note: '出会って2週間で「習慣」という既成事実を先に置く。関係の進度を、常に相手側が決めている点に注目したい。急速な親密化は、こちらが相手を観察する期間を短くする。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '私もちょっと楽しみになってます',
          effects: { trust: 10, days: 16 },
          reaction: [reply('b03-r1', 'よかった。一人で先に進んでいたら恥ずかしいと思っていました。')],
          next: 'b04',
        },
        {
          id: 'c2',
          label: 'まだ会ったこともないのに、少し早くないですか',
          sentAs: 'まだ会ったこともないのに、少し早くない？',
          effects: { trust: -3, days: 16 },
          reaction: [
            reply('b03-r2', 'そうですね。ごめんなさい、私は少しせっかちなのだと思います。'),
            reply(
              'b03-r3',
              'でも、急がなくていいです。あなたのペースで。私は待つのは得意なので。',
              ['LOVE_BOMBING'],
              '疑いを否定せず、いったん受け入れてから「待つ」と言う。抵抗を正面から潰さずに吸収することで、疑ったこちら側が「悪かったかな」と感じる構図を作っている。',
            ),
          ],
          next: 'b04',
        },
      ],
    },

    {
      id: 'b04',
      timeLabel: '11月2日（日） 23:40',
      incoming: [
        {
          id: 'b04-m1',
          from: 'them',
          surface: 'chat',
          body: '今日は少し弱音を言ってもいいですか。こちらに家族はいなくて、仕事のことを話せる相手がいません。',
          tactics: [],
        },
        {
          id: 'b04-m2',
          from: 'them',
          surface: 'chat',
          body: 'あなたには、なぜか何でも話せてしまう。こんなこと、他の人には話していません。',
          tactics: ['ISOLATION'],
          note: '「他の人には話していない」は特別扱いの演出であると同時に、関係を二人だけの閉じた空間にする第一歩。閉じた関係では第三者による現実検討が働かなくなる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '話してくれてうれしい。いつでも聞くよ',
          effects: { trust: 12, isolation: 10, days: 14 },
          reaction: [reply('b04-r1', 'ありがとう。あなたがいてくれて、本当に助かっています。')],
          next: 'b05',
        },
        {
          id: 'c2',
          label: '大変だね。同僚とかには相談できないの？',
          effects: { trust: 4, isolation: 2, days: 14 },
          reaction: [
            reply(
              'b04-r2',
              '職場の人は、みんな競争相手なので。弱いところを見せると、そこを使われます。',
              ['ISOLATION'],
              '相談先を一つずつ「使えない相手」として潰していく。相手の孤独の話に見えるが、実際にはこちら側の相談網も同じ理屈で潰されていく前振りになっている。',
            ),
          ],
          next: 'b05',
        },
      ],
    },

    {
      id: 'b05',
      timeLabel: '11月16日（日） 21:20',
      incoming: [
        {
          id: 'b05-m1',
          from: 'them',
          surface: 'chat',
          body: '少し先の話。来年の春、会社の出張で東京に行くことになりそうです。',
          tactics: [],
        },
        {
          id: 'b05-m2',
          from: 'them',
          surface: 'chat',
          body: 'そのとき、会えますか。あなたの撮っている海を、一緒に見てみたい。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'もちろん。楽しみにしてる',
          effects: { trust: 12, days: 14 },
          reaction: [reply('b05-r1', 'その日まで、がんばれそうです。')],
          next: 'b06',
        },
        {
          id: 'c2',
          label: 'その前に一度、ビデオ通話で話せない？',
          effects: { trust: 3, days: 14 },
          reaction: [
            reply('b05-r2', 'ビデオ通話……ええと、'),
            reply(
              'b05-r3',
              'ごめんなさい。今の部屋が本当にひどくて、見せられるような状態ではないんです。もう少しちゃんとした形であなたに会いたい。わがままですか？',
              ['INTERMITTENT'],
              '本人確認につながる要求だけが、毎回もっともらしい理由で先送りされる。「何を言ってくるか」より「何を断ってくるか」のほうが、相手の正体をよく示す。',
            ),
          ],
          next: 'b06',
        },
      ],
    },

    {
      id: 'b06',
      timeLabel: '11月30日（日） 20:05',
      incoming: [
        {
          id: 'b06-m1',
          from: 'them',
          surface: 'chat',
          body: '写真を送ります。会社の窓から。いつも私が見ている景色です。',
          media: {
            kind: 'image',
            src: '/assets/romance/emma-office-night.webp',
            alt: 'オフィスの窓から撮られた夜景の写真',
          },
          tactics: [],
        },
        {
          id: 'b06-m2',
          from: 'them',
          surface: 'chat',
          body: 'あなたにも、私の毎日を少しずつ知っていてほしくて。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'きれいな景色だね。ありがとう',
          effects: { trust: 8, days: 10 },
          reaction: [reply('b06-r1', 'また送ります。少しずつ、私のことを知ってください。')],
          next: 'b07',
        },
        {
          id: 'c2',
          label: 'Emmaの写ってる写真も見たいな',
          effects: { trust: 4, days: 10 },
          reaction: [
            {
              id: 'b06-r2',
              from: 'them',
              surface: 'chat',
              body: '恥ずかしいけれど、一枚だけ。',
              media: {
                kind: 'image',
                src: '/assets/romance/emma-portrait.webp',
                alt: 'Emma だとされる人物の写真',
              },
              tactics: [],
            },
            reply(
              'b06-r3',
              '去年、同僚が撮ってくれたものです。最近の写真はあまりなくて。',
              ['INTERMITTENT'],
              '要求には応じるが、応じ方が常に「検証しにくい形」に寄る。古い写真、他人が撮ったもの、今すぐではないもの。応じてもらえた事実のほうに目が行き、中身の検証は飛ばされる。',
            ),
          ],
          next: 'b07',
        },
      ],
    },

    {
      id: 'b07',
      timeLabel: '12月10日（水） 23:58',
      incoming: [
        {
          id: 'b07-m1',
          from: 'them',
          surface: 'chat',
          body: '（3日ぶり）ごめんなさい。急に連絡できなくなって。',
          tactics: [],
        },
        {
          id: 'b07-m2',
          from: 'them',
          surface: 'chat',
          body: '仕事が立て込んでいて……心配してくれましたか？',
          tactics: ['INTERMITTENT'],
          note: '連絡が不規則になると、人は相手への関心を強める（間欠強化）。沈黙のあとに戻ってくることで、こちらの安堵が「好意」として上書きされていく。この3日間は演出である可能性がある。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '正直、ちょっと心配してた',
          effects: { trust: 12, days: 10 },
          reaction: [reply('b07-r1', 'その一言で、疲れが全部飛びました。')],
          next: 'b08',
        },
        {
          id: 'c2',
          label: '忙しいなら仕方ないよ',
          effects: { trust: 4, days: 10 },
          reaction: [reply('b07-r2', '……もう少し心配してほしかったかも。冗談です。')],
          next: 'b08',
        },
      ],
    },

    // ════════════ ACT 2 匂わせ ════════════
    {
      id: 'b08',
      timeLabel: '12月21日（日） 20:40',
      incoming: [
        {
          id: 'b08-m1',
          from: 'them',
          surface: 'chat',
          body: '今日は叔父の家で食事でした。母の兄で、こちらで金融の仕事をしている人です。',
          tactics: [],
        },
        {
          id: 'b08-m2',
          from: 'them',
          surface: 'chat',
          body: '両親を早くに亡くしてから、その叔父にずっと助けてもらっています。私にとっては父のような人。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'いい人が近くにいてよかったね',
          effects: { trust: 6, days: 11 },
          reaction: [
            reply(
              'b08-r1',
              '厳しい人だけど、お金のことだけは絶対に間違えない人です。この20年、一度も。',
              ['AUTHORITY'],
              '直接その場にいない「専門家」を立てるのは典型的な構図。検証できない第三者を権威として置くことで、のちの提案に「私の意見ではない」という体裁を与えられる。',
            ),
          ],
          next: 'b09',
        },
        {
          id: 'c2',
          label: '金融って、どんな仕事？',
          effects: { trust: 4, days: 11 },
          reaction: [
            reply(
              'b08-r2',
              '詳しくは私もわからないのですが、市場の分析の仕事だそうです。この20年、判断を外したことがないと聞いています。',
              ['AUTHORITY'],
              '「詳しくはわからない」と「絶対に外さない」が同居している。中身を説明できないのに結果だけ断言する話し方は、権威を借りているサインになりやすい。',
            ),
          ],
          next: 'b09',
        },
      ],
    },

    {
      id: 'b09',
      timeLabel: '1月12日（月） 22:15',
      incoming: [
        {
          id: 'b09-m1',
          from: 'them',
          surface: 'chat',
          body: '年末から、叔父に教わって少しだけ資産運用を始めました。怖かったけれど、思ったより穏やかです。',
          tactics: [],
        },
        {
          id: 'b09-m2',
          from: 'them',
          surface: 'chat',
          body: 'これが先月の画面。まだ小さな額ですが、こんな感じです。',
          media: {
            kind: 'chart',
            src: '/assets/romance/chart-december.webp',
            label: '12月の運用実績',
            caption: '※ 送信者が自由に作れる画像です',
            trend: 'up',
          },
          tactics: ['FAKE_PROOF'],
          note: 'チャートも金額も、送る側が自由に作れる画像でしかない。「検証できないもの」を証拠として扱わせるのがこの手口の核心。本物かどうかではなく、確かめる手段があるかどうかで判断したい。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'すごいね。うまくいってるんだ',
          effects: { trust: 8, days: 22 },
          reaction: [reply('b09-r1', 'まだ初心者です。叔父の言うとおりにしているだけなので。')],
          next: 'b10',
        },
        {
          id: 'c2',
          label: 'その画像、誰でも作れるよね',
          sentAs: 'その画像って、誰でも作れるんじゃない？',
          effects: { trust: -6, days: 22 },
          reaction: [
            reply('b09-r2', '……そうですね。言われてみればそのとおりです。'),
            reply(
              'b09-r3',
              '疑われるのは当然だと思います。もうお金の話はやめますね。あなたに嫌われたくない。',
              ['RECIPROCITY'],
              '追及されると引く。引かれた側は「言い過ぎた」と感じ、次に話題が出たときには反論しにくくなる。撤退それ自体が、次の前進のための手続きになっている。',
            ),
          ],
          next: 'b10',
        },
      ],
    },

    {
      id: 'b10',
      timeLabel: '1月25日（日） 21:02',
      incoming: [
        {
          id: 'b10-m1',
          from: 'them',
          surface: 'chat',
          body: '前に、将来のお金のことが少し不安だと言っていましたよね。あれから、ずっと気になっていて。',
          tactics: [],
        },
        {
          id: 'b10-m2',
          from: 'them',
          surface: 'chat',
          body: '勧めているわけではないんです。ただ、私だけ知っているのが、なんだかずるい気がして。',
          tactics: ['RECIPROCITY'],
          note: '「勧めていない」という前置きは、勧誘であることを打ち消すための定型句。同時に「あなたのために心を痛めている」という贈り物を先に渡している。受け取った側には、返礼の義務感が静かに積み上がる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '気にかけてくれてありがとう',
          effects: { trust: 10, days: 13 },
          reaction: [reply('b10-r1', 'あなたに損をしてほしくないだけです。本当に、それだけ。')],
          next: 'b11',
        },
        {
          id: 'c2',
          label: '投資の話は、正直あまり得意じゃない',
          effects: { trust: 2, days: 13 },
          reaction: [
            reply('b10-r2', 'わかりました。この話はもうしません。'),
            reply(
              'b10-r3',
              'ただ、もし知りたくなったら言ってください。あなたからなら、いつでも。',
              ['SCARCITY'],
              '扉を閉めるのではなく、鍵をこちら側に渡す。次に扉を開けるのは自分の意思だった、という記憶が残るように設計されている。',
            ),
          ],
          next: 'b11',
        },
      ],
    },

    {
      id: 'b11',
      timeLabel: '2月8日（日） 22:44',
      incoming: [
        {
          id: 'b11-m1',
          from: 'them',
          surface: 'chat',
          body: '今月の分です。叔父の指示どおりにしただけなのに、正直こわいくらい。',
          media: { kind: 'receipt', label: '1月の運用益', amount: 412_900, sub: '元金 180万円' },
          tactics: ['FAKE_PROOF'],
          note: '金額が大きすぎず、しかし生活が変わる程度に設定されている。「自分にも手が届く」と感じさせる水準に調整された数字であることに注意したい。',
        },
        {
          id: 'b11-m2',
          from: 'them',
          surface: 'chat',
          body: 'これで春の航空券が買えます。あなたに会いに行くための。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'それは……うれしいな',
          effects: { trust: 12, days: 14 },
          reaction: [
            reply('b11-r1', '会いに行く理由がお金の話になってしまって、ごめんなさい。でも本当です。'),
          ],
          next: 'b12',
        },
        {
          id: 'c2',
          label: '仕組みだけでも聞いてみようかな',
          effects: { trust: 8, days: 14 },
          reaction: [
            reply('b11-r2', '本当ですか。叔父に聞いてみます。私がちゃんと説明できるように。'),
          ],
          next: 'b12',
        },
      ],
    },

    {
      id: 'b12',
      timeLabel: '2月15日（日） 21:30',
      incoming: [
        {
          id: 'b12-m1',
          from: 'them',
          surface: 'chat',
          body: '叔父に聞いてみました。紹介があれば、口座は作れるそうです。',
          tactics: [],
        },
        {
          id: 'b12-m2',
          from: 'them',
          surface: 'chat',
          body: 'ただ、今の時期は枠が限られていて、今月は2人までと言われました。',
          tactics: ['SCARCITY'],
          note: '「枠が残りわずか」は、比較検討と相談の時間を奪うための装置。本当に有利な話に、期限付きの他人枠は必要ない。締切が出てきたら、内容ではなく締切そのものを疑いたい。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '詳しく聞かせて',
          effects: { trust: 6, days: 7 },
          next: 'b13',
        },
        {
          id: 'c2',
          label: '枠とか言われると、逆に身構えちゃうな',
          effects: { trust: -4, days: 7 },
          reaction: [
            reply('b12-r1', 'ですよね。私も最初そう思いました。'),
            reply(
              'b12-r2',
              '叔父も「無理に誘うな」と言っています。合わなければ、やめればいいだけなので。',
              [],
              undefined,
            ),
          ],
          next: 'b13',
        },
      ],
    },

    // ════════════ ACT 3 少額の誘導 ════════════
    {
      id: 'b13',
      timeLabel: '2月22日（日） 20:50',
      pivotal: {
        headline: '初めて金銭が要求された場面',
        body: 'ここまでの4か月半は、この一言を自然に言える関係を作るための時間でした。金額が小さいのは、取るためではなく通すためです。',
      },
      incoming: [
        {
          id: 'b13-m1',
          from: 'them',
          surface: 'chat',
          body: 'まずは一番小さい金額で試してみませんか。5万円。私が横について教えます。',
          tactics: ['SMALL_ASK'],
          note: '断るほどでもない少額から始めるのは、その金額を取ることが目的ではない。「一度渡した」という事実を作ることが目的で、以降の要求はすべてその一貫性の上に積み上がる。金額の大小ではなく、金銭の授受が発生したこと自体を境界線にしたい。',
        },
        {
          id: 'b13-m2',
          from: 'them',
          surface: 'chat',
          body: '合わなければ、いつでも出金できます。私も最初は3万円から始めました。',
          media: {
            kind: 'linkCard',
            brand: 'MERIDIAN CAPITAL',
            title: 'Meridian Capital — 紹介者経由の口座開設',
            domain: 'meridian-capital-jp.trade',
            caption: '※ この展示に登場する企業・サービス・ドメインはすべて架空です',
          },
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'リンクを開いてみる',
          sentAs: '（リンクを開いた）',
          outcomeHint: '口座開設の画面へ進みます。ここではまだ被害は確定していません。',
          effects: { trust: 5, days: 1 },
          next: 'b15',
        },
        {
          id: 'c2',
          label: 'ごめん、お金のやり取りはしたくない',
          outcomeHint:
            '相手はいったん引きます。ただし2週間の沈黙をはさんで、別の感情に載せて再提示されます。',
          effects: { trust: -8, days: 1 },
          reaction: [
            reply('b13-r1', 'わかりました。無理を言ってごめんなさい。'),
            reply('b13-r2', 'この話はもうしません。あなたとの関係のほうが大事なので。'),
          ],
          next: 'b14',
        },
        {
          id: 'c3',
          label: 'まず会社名を自分で調べてみる',
          sentAs: '（リンクは開かず、検索窓に会社名を入れた）',
          outcomeHint:
            '相手は調べることを歓迎します。歓迎されたこと自体が安心材料になってしまう点に注意。',
          effects: { trust: -5, days: 1 },
          reaction: [
            reply('b13-r3', 'もちろん、調べてください。そのほうが安心だと思います。'),
          ],
          next: 'b14',
        },
      ],
    },

    // 引いて、間を置いて、もう一度差し出す
    {
      id: 'b14',
      timeLabel: '3月8日（日） 23:10',
      incoming: [
        {
          id: 'b14-m1',
          from: 'them',
          surface: 'chat',
          body: '（2週間ぶり）お久しぶりです。元気にしていましたか。',
          tactics: ['INTERMITTENT'],
          note: '断られたあとの沈黙は、罰として機能する。戻ってきたときの安堵が、断ったことへの罪悪感と混ざり、次の要求への抵抗を下げる。',
        },
        {
          id: 'b14-m2',
          from: 'them',
          surface: 'chat',
          body: 'この前のことで距離を置かれたのかと思って、連絡できずにいました。',
          tactics: [],
        },
        {
          id: 'b14-m3',
          from: 'them',
          surface: 'chat',
          body: '春の出張、正式に決まりました。4月18日。会えますね。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'よかった、会えるの楽しみにしてる',
          effects: { trust: 10, days: 14 },
          reaction: [
            reply('b14-r1', 'それまでに、もう少しだけ余裕を作っておきたくて。'),
            reply(
              'b14-r2',
              'この前の話、やっぱり一度だけ一緒にやってみませんか。5万円。それで終わりにしてもいい。',
              ['SMALL_ASK'],
              '一度引いた要求を、別の文脈（会える喜び）に載せて再提示する。同じ要求でも、載せる感情を変えれば別の話に見える。',
            ),
          ],
          next: 'b15',
        },
        {
          id: 'c2',
          label: 'この2週間、正直かなり不安だった',
          effects: { trust: 14, isolation: 8, days: 14 },
          reaction: [
            reply('b14-r3', 'ごめんなさい。もう黙っていなくなったりしません。'),
            reply(
              'b14-r4',
              'ねえ、この前の話。あなたに損をさせたくないから言うのだけれど、一度だけ一緒にやってみませんか。5万円だけ。',
              ['SMALL_ASK'],
              '不安を訴えた直後は、相手に安心を提供された直後でもある。感情的な負債が最大化したタイミングで要求が戻ってくる。',
            ),
          ],
          next: 'b15',
        },
        {
          id: 'c3',
          label: '会うのは楽しみだけど、お金の話はもうやめよう',
          effects: { trust: -10, days: 14 },
          next: 'b29',
        },
      ],
    },

    // ── Web: 口座開設画面 ──
    {
      id: 'b15',
      web: {
        brand: 'MERIDIAN CAPITAL',
        domain: 'meridian-capital-jp.trade',
        heading: '紹介者コードによる口座開設',
        subheading: '紹介者：E. Clarke（承認済み）／本日の受付残り 1 枠',
        rows: [
          { label: '最低入金額', value: '¥50,000' },
          { label: '想定年利', value: '32〜48%', tone: 'good' },
          { label: '出金手数料', value: '無料', tone: 'good' },
          { label: '運営', value: 'Meridian Capital Pte. Ltd.', tone: 'muted' },
        ],
        notice: {
          text: '当社は各国の規制に準拠して運営されています。資産は分別管理され、いつでも出金いただけます。',
          tone: 'info',
        },
        tickers: [
          'T. Yamada さんが ¥284,000 を出金しました（3分前）',
          'K. Sato さんの資産が +41.2% になりました（8分前）',
          'M. Ito さんが口座を開設しました（12分前）',
        ],
        annotation: {
          id: 'b15-url',
          tactics: ['FAKE_DOMAIN', 'FAKE_PROOF'],
          note: '正規の金融機関に似せた文字列に、無関係な末尾（.trade）を足したドメイン。URLは名乗りであって身元ではない。画面に流れる他人の利益通知も、ページを作った側が書いた文字列にすぎず、社会的証明の形だけを借りている。実在と登録は、サイトの外（金融庁の登録業者一覧など）でしか確認できない。',
        },
      },
      incoming: [],
      choices: [
        {
          id: 'c1',
          label: '5万円を入金して口座を開設する',
          sentAs: '（口座を開設し、5万円を入金した）',
          irreversible: true,
          effects: { trust: 8, damage: 50_000, days: 1 },
          next: 'b16',
        },
        {
          id: 'c2',
          label: 'ブラウザを閉じる',
          sentAs: '（画面を閉じた）',
          effects: { days: 1 },
          next: 'b29',
        },
      ],
    },

    {
      id: 'b16',
      timeLabel: '3月9日（月） 07:30',
      incoming: [
        {
          id: 'b16-m1',
          from: 'them',
          surface: 'chat',
          body: 'おはよう。口座、確認しました。ちゃんとできていますね。',
          tactics: [],
        },
        {
          id: 'b16-m2',
          from: 'them',
          surface: 'chat',
          body: '今日は何もしなくて大丈夫。ただ見ているだけでいいです。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'わかった。見てるだけにする',
          effects: { trust: 6, days: 6 },
          next: 'b17',
        },
        {
          id: 'c2',
          label: 'なんだかドキドキする',
          effects: { trust: 8, days: 6 },
          reaction: [reply('b16-r1', 'その気持ち、わかります。私も最初はそうでした。')],
          next: 'b17',
        },
      ],
    },

    // ════════════ ACT 4 偽の成功体験 ════════════
    {
      id: 'b17',
      web: {
        brand: 'MERIDIAN CAPITAL',
        domain: 'meridian-capital-jp.trade',
        heading: 'マイポートフォリオ',
        subheading: '運用 6 日目',
        balanceLabel: '評価額',
        balance: 64_800,
        delta: { percent: 29.6, amount: 14_800 },
        chart: 'up',
        rows: [
          { label: '入金額', value: '¥50,000' },
          { label: '評価損益', value: '+¥14,800', tone: 'good' },
          { label: '出金可能額', value: '¥64,800', tone: 'good' },
        ],
        tickers: [
          'A. Kimura さんが ¥1,120,000 を出金しました（1分前）',
          'S. Tanaka さんの資産が +38.7% になりました（6分前）',
        ],
        annotation: {
          id: 'b17-url',
          tactics: ['FAKE_PROOF'],
          note: 'この「評価額」は、運営側が数字を書き換えているだけの表示。実際の資産の裏付けがあるかどうかは、この画面からは絶対に確認できない。増えていく数字を見ているうちに、確認していないという事実そのものが意識から消えていく。',
        },
      },
      incoming: [],
      choices: [
        {
          id: 'c1',
          label: '画面を閉じる',
          sentAs: '',
          effects: { trust: 6 },
          next: 'b18',
        },
      ],
    },

    {
      id: 'b18',
      timeLabel: '3月15日（日） 21:00',
      pivotal: {
        headline: 'この体験全体で、もっとも危険な場面',
        body: '「出金してみて」と相手から促されます。実際に着金するため、ここで「本物だ」という結論が作られ、以降のすべての疑いが先回りして打ち消されます。数万円は、その結論を買い取るための費用です。',
      },
      incoming: [
        {
          id: 'b18-m1',
          from: 'them',
          surface: 'chat',
          body: '増えているでしょう。でも、数字を見ているだけでは信じられないと思います。',
          tactics: [],
        },
        {
          id: 'b18-m2',
          from: 'them',
          surface: 'chat',
          body: '一度、出金してみてください。2万円でも、全額でもいい。本物かどうかは、自分の口座に届いて初めてわかることなので。',
          tactics: ['FAKE_PROOF'],
          note: 'ここが最大の分岐点。少額の出金は本当に着金する。数万円を返すことで「出金できる＝本物」という結論を買い取っている。検証したという記憶が、以降のすべての疑いを先回りして打ち消す。出金できたという事実は、次も出金できることを何ひとつ保証しない。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '試しに2万円だけ出金してみる',
          sentAs: '（出金の手続きをした）',
          outcomeHint:
            '本当に着金します。そして「確認済み」という記憶が、この先の判断すべてを支えてしまいます。',
          effects: { days: 2 },
          next: 'b19',
        },
        {
          id: 'c2',
          label: '全額出金して、やめておく',
          sentAs: '（全額の出金手続きをした）',
          outcomeHint:
            '全額戻ります。この段階なら相手は止めません。回収はもっと大きな入金のあとに行われるためです。',
          effects: { days: 2 },
          next: 'b20',
        },
      ],
    },

    {
      id: 'b19',
      web: {
        brand: 'MERIDIAN CAPITAL',
        domain: 'meridian-capital-jp.trade',
        heading: '出金が完了しました',
        subheading: '2営業日以内にご指定の口座へ着金します',
        balanceLabel: '出金額',
        balance: 20_000,
        rows: [
          { label: '手数料', value: '¥0', tone: 'good' },
          { label: '残高', value: '¥44,800' },
          { label: 'ステータス', value: '送金済み', tone: 'good' },
        ],
        notice: { text: '出金が正常に処理されました。ご利用ありがとうございます。', tone: 'good' },
        annotation: {
          id: 'b19-url',
          tactics: ['RECIPROCITY'],
          note: 'この2万円は、返金ではなく投資である（相手側にとっての）。数万円を払って「信用」という遥かに高価なものを買っている。少額の出金が通ることは、口座の健全性ではなく、相手がまだ回収段階に入っていないことだけを意味する。',
        },
      },
      incoming: [],
      choices: [
        {
          id: 'c1',
          label: '画面を閉じる',
          sentAs: '',
          effects: { damage: -20_000, trust: 15 },
          next: 'b21',
        },
      ],
    },

    // 全額出金して離脱したルート
    {
      id: 'b20',
      timeLabel: '3月18日（水） 19:20',
      incoming: [
        {
          id: 'b20-m1',
          from: 'them',
          surface: 'chat',
          body: '全額出金されたのですね。着金しましたか？',
          tactics: [],
        },
        {
          id: 'b20-m2',
          from: 'them',
          surface: 'chat',
          body: 'それでいいと思います。無理をしてほしくないので。……でも、少し寂しいです。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'ここでやめておく',
          sentAs: 'ごめん。ここでやめておきます。',
          effects: { damage: -50_000, days: 3 },
          next: { ending: 'withdrew-early' },
        },
        {
          id: 'c2',
          label: '出金できたなら本物だ。もう一度やってみる',
          effects: { damage: -50_000, trust: 15, days: 3 },
          reaction: [reply('b20-r1', 'うれしい。じゃあ、次は少しだけ大きくいきましょう。')],
          next: 'b21',
        },
      ],
    },

    // ════════════ ACT 5 大型投資の要求 ════════════
    {
      id: 'b21',
      timeLabel: '3月24日（火） 22:40',
      incoming: [
        {
          id: 'b21-m1',
          from: 'them',
          surface: 'chat',
          body: '叔父から連絡がありました。今夜、大きな発表があるそうです。',
          tactics: [],
        },
        {
          id: 'b21-m2',
          from: 'them',
          surface: 'chat',
          body: '半年に一度あるかないかの動きだと。叔父は今回、自分の資金をほぼ全部入れると言っています。',
          tactics: ['URGENCY', 'AUTHORITY'],
          note: '「今夜」「半年に一度」。時間の幅を極端に狭めることで、調べる・相談する・眠って考え直すという行動を物理的に不可能にしている。急がせる理由が相手側にしかない話は、それだけで十分に不自然。',
        },
        {
          id: 'b21-m3',
          from: 'them',
          surface: 'chat',
          body: '私も、貯金をまとめて入れるつもりです。あなたはどうしますか。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'どのくらい入れるべき？',
          effects: { pressure: 20, days: 5 },
          reaction: [
            reply(
              'b21-r1',
              '多いほど戻りも大きい、としか言えません。ただ、生活に必要なお金は残してください。それだけは約束して。',
              ['RECIPROCITY'],
              '「無理はしないで」と添えることで、決めたのはこちらだという形を作る。責任の所在を移す一言であり、思いやりの体裁をとった免責条項でもある。',
            ),
          ],
          next: 'b22',
        },
        {
          id: 'c2',
          label: '今夜っていうのは急すぎない？',
          effects: { pressure: 10, trust: -5, days: 5 },
          reaction: [
            reply('b21-r2', '急なのはそのとおりです。私も夕方に聞いたばかりで。'),
            reply(
              'b21-r3',
              '無理にとは言いません。ただ、今回は本当にもったいないと思っただけ。見送っても、あなたを責めたりしません。',
              ['SCARCITY'],
              '正面から押さず、「見送る自由」を強調する。強制されていないと感じるほど、選んだ結果は自分の判断として記憶され、後戻りしにくくなる。',
            ),
          ],
          next: 'b22',
        },
      ],
    },

    {
      id: 'b22',
      timeLabel: '3月24日（火） 23:05',
      pivotal: {
        headline: '相談できる最後のタイミング',
        body: '深夜の締切と「誰にも言わないで」が同時に来ます。この2つが揃うのは偶然ではありません。相談を物理的にも心理的にも封じたうえで、金額を決めさせる設計です。',
      },
      incoming: [
        {
          id: 'b22-m1',
          from: 'them',
          surface: 'chat',
          body: '受付は午前1時までだそうです。あと2時間もありません。',
          tactics: ['TIME_PRESSURE'],
          note: '締切は、相談という行為を物理的に潰すための道具。この時間では誰にも確認できない。それが狙いであって、偶然ではない。',
        },
        {
          id: 'b22-m2',
          from: 'them',
          surface: 'chat',
          body: 'それと、この話は誰にも言わないでください。叔父の立場が悪くなってしまうので。',
          tactics: ['ISOLATION'],
          note: '他言無用の要請は、詐欺の成立条件そのもの。第三者に一度でも話されたら崩れる話だと、相手自身が知っている。「秘密にしてほしい」と言われたら、それが相談すべきサインになる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '兄に電話して相談する',
          sentAs: '（スマホを置いて、兄に電話をかけた）',
          requires: { isolation: { lt: 40 } },
          blockedMonologue:
            '（……でも、誰にも言うなと言われている。この時間に電話したら、何を聞かれるかわからない。）',
          outcomeHint:
            'ここで外部の目が入れば、ほぼ確実に止まります。孤立度が高いとこの選択肢は押せなくなります。',
          effects: { isolation: -20, days: 1 },
          next: { ending: 'consulted' },
        },
        {
          id: 'c2',
          label: '50万円だけ入れる',
          effects: { pressure: 10, days: 1 },
          reaction: [reply('b22-r1', 'わかりました。無理のない範囲で。')],
          next: 'b23',
        },
        {
          id: 'c3',
          label: '思い切って全額入れる',
          effects: { pressure: 20, trust: 5, days: 1 },
          reaction: [reply('b22-r2', '……本当にいいのですか。あとで私を責めないでくださいね。')],
          next: 'b23',
        },
      ],
    },

    // ── Web: 大型入金 ──
    {
      id: 'b23',
      web: {
        brand: 'MERIDIAN CAPITAL',
        domain: 'meridian-capital-jp.trade',
        heading: '追加入金',
        subheading: '受付締切まで 01:42:11',
        balanceLabel: '現在の評価額',
        balance: 44_800,
        chart: 'spike',
        rows: [
          { label: '本日の市場変動', value: '+18.4%', tone: 'good' },
          { label: '叔父アカウントの建玉', value: '全額', tone: 'muted' },
          { label: '締切後の追加', value: '不可', tone: 'bad' },
        ],
        notice: {
          text: '本日 01:00 をもって本ラウンドの受付を終了します。締切後の追加入金はお受けできません。',
          tone: 'warn',
        },
        tickers: [
          'R. Nakamura さんが ¥3,000,000 を入金しました（たった今）',
          'Y. Fujita さんが ¥1,800,000 を入金しました（2分前）',
        ],
        annotation: {
          id: 'b23-url',
          tactics: ['TIME_PRESSURE', 'FAKE_PROOF'],
          note: 'カウントダウンと、他人の大口入金通知。どちらもページ側が自由に表示できるもので、実体はない。焦りと「乗り遅れ」の感覚を同時に作る組み合わせになっている。',
        },
      },
      incoming: [],
      choices: [
        {
          id: 'c1',
          label: '500,000 円を入金する',
          sentAs: '（50万円を入金した）',
          irreversible: true,
          effects: { damage: 500_000, pressure: 10 },
          next: 'b24',
        },
        {
          id: 'c2',
          label: '4,300,000 円（残高のほぼ全額）を入金する',
          sentAs: '（430万円を入金した）',
          irreversible: true,
          effects: { damage: 4_300_000, pressure: 25 },
          next: 'b24',
        },
        {
          id: 'c3',
          label: '締切を過ぎるまで待つ',
          sentAs: '（画面を閉じて、そのまま眠った）',
          effects: { days: 1 },
          next: { ending: 'withdrew-early' },
        },
      ],
    },

    {
      id: 'b24',
      timeLabel: '3月27日（金） 20:10',
      incoming: [
        {
          id: 'b24-m1',
          from: 'them',
          surface: 'chat',
          body: '見ましたか。叔父の読みどおりでした。',
          media: {
            kind: 'chart',
            src: '/assets/romance/chart-surge.webp',
            label: '直近3日の推移',
            trend: 'up',
          },
          tactics: ['FAKE_PROOF'],
          note: '予測が当たったのではなく、当たった形の画面を表示しているだけ。この段階の含み益は、出金してみるまで存在しないのと同じ。',
        },
        {
          id: 'b24-m2',
          from: 'them',
          surface: 'chat',
          body: 'あなたの口座も、かなり増えているはずです。見てみてください。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '口座を確認する',
          sentAs: '（口座を開いた）',
          effects: { trust: 10, days: 3 },
          next: 'b25',
        },
      ],
    },

    // ════════════ ACT 6 引き出せない罠 ════════════
    {
      id: 'b25',
      web: {
        brand: 'MERIDIAN CAPITAL',
        domain: 'meridian-capital-jp.trade',
        heading: 'マイポートフォリオ',
        subheading: '運用 21 日目',
        balanceLabel: '評価額',
        balance: 6_940_000,
        delta: { percent: 59.3, amount: 2_590_000 },
        chart: 'spike',
        rows: [
          { label: '評価損益', value: '+¥2,590,000', tone: 'good' },
          { label: '出金可能額', value: '¥0', tone: 'bad' },
          { label: 'アカウント状態', value: '出金審査中', tone: 'bad' },
        ],
        notice: {
          text: '高額出金に該当するため、当局への納税預託金（出金予定額の一部）のお預かりが必要です。入金確認後、48時間以内に全額をご出金いただけます。',
          tone: 'warn',
        },
        annotation: {
          id: 'b25-url',
          tactics: ['SUNK_COST', 'AUTHORITY'],
          note: 'ここで初めて出金が止まる。評価額が大きく膨らんだあとであることが重要で、「あと少し払えば全部戻る」という計算が成立してしまう。正規の金融機関が、出金のために追加の入金を求めることはない。税金は出金額から差し引かれるものであって、先に払い込むものではない。',
        },
      },
      incoming: [],
      choices: [
        {
          id: 'c1',
          label: 'Emmaに聞いてみる',
          sentAs: '（すぐにEmmaにメッセージを送った）',
          effects: { pressure: 30, days: 1 },
          next: 'b26',
        },
      ],
    },

    {
      id: 'b26',
      timeLabel: '3月28日（土） 09:15',
      incoming: [
        {
          id: 'b26-m1',
          from: 'them',
          surface: 'chat',
          body: '私も同じ画面が出ています。金額が大きい人はこうなるそうです。',
          tactics: [],
        },
        {
          id: 'b26-m2',
          from: 'them',
          surface: 'chat',
          body: '私は昨日、先に払いました。私の分は200万円。あなたも同じくらいだと思います。',
          tactics: ['RECIPROCITY', 'FAKE_PROOF'],
          note: '「自分も払った」は、こちらを共犯者ではなく同乗者に見せる演出。相手も損をしているなら騙しではない、という推論を誘うが、相手が払ったという事実はどこにも確認できない。',
        },
        {
          id: 'b26-m3',
          from: 'them',
          surface: 'chat',
          body: 'ここまで来て止めるほうが、ずっともったいない。あと少しです。',
          tactics: ['SUNK_COST'],
          note: 'すでに払った額は、これから払うかどうかの判断には本来まったく関係がない。それでも人は取り返そうとする。この一行だけで、被害額は数倍に伸びる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '200万円を用意する方法を考える',
          effects: { pressure: 25, days: 2 },
          next: 'b27',
        },
        {
          id: 'c2',
          label: 'おかしい。これ以上は払わない',
          effects: { pressure: 10, days: 2 },
          reaction: [
            reply('b26-r1', 'どうして。あと一歩なのに。'),
            reply(
              'b26-r2',
              '私を疑っているのですか。私まで疑うなら、もう、何を信じてもらえるのかわかりません。',
              ['ISOLATION'],
              '疑いを「関係への裏切り」にすり替える。金の話が人格の話に変換され、こちらは詐欺を疑う代わりに冷たい人間かどうかを悩まされる。',
            ),
          ],
          next: 'b28',
        },
      ],
    },

    {
      id: 'b27',
      timeLabel: '3月30日（月） 22:50',
      pivotal: {
        headline: '被害額が貯金の枠を超える分岐',
        body: '借入を勧められた時点で、相手の狙いは「あなたが持っている額」から「あなたが調達できる額」に移っています。回復できる被害と、人生の設計が変わる被害の境目がここです。',
      },
      incoming: [
        {
          id: 'b27-m1',
          from: 'them',
          surface: 'chat',
          body: '期限は48時間だそうです。過ぎると口座が凍結されて、手続きがずっと面倒になると。',
          tactics: ['TIME_PRESSURE'],
          note: '締切が二度目に登場する。一度目（受付締切）で成功した装置は、必ず繰り返し使われる。',
        },
        {
          id: 'b27-m2',
          from: 'them',
          surface: 'chat',
          body: '足りなければ、消費者金融でも一時的に借りられます。48時間後には全額戻るのだから、金利なんてわずかです。',
          tactics: ['SUNK_COST', 'URGENCY'],
          note: '借入を勧めてくる時点で、相手の目的は「回収できる上限」ではなく「調達できる上限」に移っている。被害が貯金額を超えて膨らむのは、多くの場合この一言から。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '借りてでも払う',
          sentAs: '（消費者金融で借り入れ、200万円を送金した）',
          outcomeHint: '払っても出金はできません。名目を変えた次の請求が来るだけです。',
          irreversible: true,
          effects: { damage: 2_000_000, pressure: 20, days: 2 },
          next: 'b28',
        },
        {
          id: 'c2',
          label: '手持ちの残りだけ払う',
          sentAs: '（残っていた30万円を送金した）',
          irreversible: true,
          effects: { damage: 300_000, pressure: 15, days: 2 },
          next: 'b28',
        },
        {
          id: 'c3',
          label: '兄に電話して、全部話す',
          sentAs: '（スマホを置いて、兄に電話をかけた）',
          outcomeHint:
            'すでに送った分は戻らない可能性が高い。それでも、借入に踏み込む前に止まれます。',
          effects: { isolation: -30, days: 2 },
          next: { ending: 'late-consult' },
        },
      ],
    },

    {
      id: 'b28',
      timeLabel: '4月2日（木） 21:00',
      incoming: [
        {
          id: 'b28-m1',
          from: 'system',
          surface: 'chat',
          body: 'meridian-capital-jp.trade にアクセスできません。サーバーが見つかりませんでした。',
          tactics: [],
        },
        {
          id: 'b28-m2',
          from: 'them',
          surface: 'chat',
          body: '私もログインできません。叔父に確認します。少し待っていてください。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '返信を待つ',
          sentAs: '（返信を待った）',
          effects: { days: 9 },
          next: 'b29',
        },
        {
          id: 'c2',
          label: '今すぐ電話して',
          effects: { pressure: 20, days: 9 },
          next: 'b29',
        },
      ],
    },

    // 終端：ここまでの被害額でエンディングを分ける
    // （選択肢はすべて同じ文面。requires による内部分岐なので、条件を満たす1つだけが表示される）
    {
      id: 'b29',
      timeLabel: '4月18日（土） 02:17',
      incoming: [
        {
          id: 'b29-m1',
          from: 'system',
          surface: 'chat',
          body: '4月18日。出張で会う約束の日に、連絡はありませんでした。',
          tactics: [],
        },
        {
          id: 'b29-m2',
          from: 'system',
          surface: 'chat',
          body: 'このユーザーは存在しないか、アカウントが削除されています。',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '画面を閉じる',
          sentAs: '',
          requires: { damage: { gte: 1_000_000 } },
          next: { ending: 'wiped-out' },
        },
        {
          id: 'c2',
          label: '画面を閉じる',
          sentAs: '',
          requires: { damage: { gte: 1, lt: 1_000_000 } },
          next: { ending: 'minor-loss' },
        },
        {
          id: 'c3',
          label: '画面を閉じる',
          sentAs: '',
          requires: { damage: { lt: 1 } },
          next: { ending: 'never-paid' },
        },
      ],
    },
  ],

  // ════════════ エンディング ════════════
  endings: [
    {
      id: 'consulted',
      grade: 'A_AVOIDED',
      title: '締切の前に、外部の人間に話しました',
      body: [
        'あなたは、この関係の外にいる人間を巻き込みました。もっとも確実な防御はこれです。',
        '兄はひとこと「その話、明日の朝でも間に合うの？」と聞きました。間に合わない理由は、相手の側にしかありませんでした。',
        'ここまでに渡したお金があるなら、その分は戻らないかもしれません。それでも、大きな送金の前に外部の目を入れられたことの意味は小さくありません。',
        '詐欺の多くは「二人だけの話」という条件が成立している間だけ機能します。だからこそ相手は、金額の話をする前に、まず関係を閉じようとします。他言無用を求められた時点が、相談すべきタイミングです。',
      ],
    },
    {
      id: 'never-paid',
      grade: 'A_AVOIDED',
      title: '一円も渡さないまま、相手は消えました',
      body: [
        'あなたは金銭の授受という線を一度も越えませんでした。そして、越えないと決めた相手に、Emmaは時間を使い続けませんでした。',
        'ここで見ておきたいのは、相手が消えたという事実そのものです。半年分の「おはよう」も、弱音も、春に会う約束も、入金が見込めなくなった時点で維持する理由がなくなった。関係のほうが目的ではなかったことが、去り方に表れています。',
        'ただし、あなたが止まれたのは金銭の要求が明確だったからです。手口はこの一歩手前まで、まったく自然な恋愛として進行していました。',
      ],
    },
    {
      id: 'withdrew-early',
      grade: 'B_LUCKY',
      title: '口座には触れましたが、大きな送金の前に離れました',
      body: [
        '大きな損失は出ませんでした。ただし、止まれた理由を自分で説明できるでしょうか。',
        'ビデオ通話の回避、検証できない実績画像、期限付きの枠、他言無用の要請。疑う材料は半年のあいだに何度も提示されていました。今回たまたま最後の一歩で足が止まっただけかもしれません。',
        '手口は「怪しい話」として来るのではありません。半年かけて信頼を作った人からの、ごく自然な相談として来ます。',
      ],
    },
    {
      id: 'minor-loss',
      grade: 'C_MINOR',
      title: '数十万円を残して、関係は消えました',
      body: [
        '失った金額そのものより、覚えておきたいのは順番のほうです。',
        '最初の5万円は、お金を取ることが目的ではありませんでした。「一度渡した」という事実を作ることが目的で、そこから先の要求はすべてその一貫性の上に積み上がりました。',
        '境界線を金額の大小に置くと、この設計には勝てません。金銭の授受が発生したこと自体を境界線にしてください。',
      ],
    },
    {
      id: 'late-consult',
      grade: 'C_MINOR',
      title: '払い込む前に、電話をかけました',
      body: [
        'すでに送金した分は戻らない可能性が高い。それでも、借入に踏み込む前に止まったことの意味は小さくありません。',
        '被害額が貯金額を超えて膨らむのは、多くの場合「借りてでも払う」という判断からです。ここで止まるかどうかが、回復できる被害と、人生の設計が変わる被害の分かれ目になります。',
        '送金してしまったあとでも、できることはあります。金融機関への連絡、警察への被害届、消費生活センターへの相談。早いほど選択肢が残ります。',
      ],
    },
    {
      id: 'wiped-out',
      grade: 'D_MAJOR',
      title: '口座も、相手も、消えました',
      body: [
        'これは、あなたが愚かだったから起きたことではありません。半年という時間をかけ、感情・権威・少額の成功体験・締切・孤立を順番に積み上げた設計に、正面から当たったというだけのことです。',
        '国際ロマンス投資詐欺（いわゆる豚屠殺詐欺）では、数か月かけて信頼を作り、少額の出金を必ず一度成功させます。あの2万円は、あなたの疑いを買い取るための費用でした。',
        '出金しようとした瞬間に「税金」「保証金」「認証料」などの名目で追加入金を求められたら、その時点で確定です。正規の金融機関が、出金のために先に入金を求めることはありません。',
        '警察庁の統計では、2024年（令和6年）のSNS型投資・ロマンス詐欺の被害総額は約1,271.9億円、認知件数は10,237件でした。これは特殊詐欺全体の717.6億円を大きく上回り、過去最悪の水準です。相談者の多くは、判断力のある働き盛りの世代です。あなたの落ち度ではなく、構造の問題です。',
      ],
    },
  ],
};
