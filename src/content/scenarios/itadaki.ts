import type { Message, Scenario } from '@/features/simulator/engine/types';

/**
 * 第2展示室「支えたい、という気持ち」— 同情と恋愛感情の搾取（いわゆる頂き女子型）
 *
 * 構成
 *   ACT 1  i01-i06  マッチングアプリ〜メッセージ移行。「おじさん扱いしない」承認
 *   ACT 2  i07-i11  秘密の共有と自己開示（確かめようのない身の上話）
 *   ACT 3  i12-i16  小さな頼み事（3,000円）
 *   ACT 4  i17-i21  困窮のアピール（要求せず、こちらに言わせる）
 *   ACT 5  i22-i26  巨額の肩代わり（掛け売りの清算、借入の勧め）
 *   終幕   i27-i29  既読の間隔が空き、アカウントが消える
 *
 * 【内容方針 / SPEC.md §5】
 * ・視点は被害者側に固定する（§7-2 で確定）。加害側の台本・手順は書かない。
 * ・実在するマニュアルの文面は引用しない。再現するのは「順番」と「心理の構造」だけ。
 * ・実在の決済サービス名は使わない（送金アプリは架空の SMILE PAY）。
 * ・性的な描写は扱わない。金銭と感情の力学のみを扱う。
 * ・被害者を責める表現を使わない。
 */

function reply(id: string, body: string, tactics: Message['tactics'] = [], note?: string): Message {
  return { id, from: 'them', surface: 'chat', body, tactics, note };
}

export const itadaki: Scenario = {
  id: 'itadaki',
  title: '支えたい、という気持ち',
  roomLabel: '第2展示室',
  estimatedMinutes: 8,
  persona: {
    name: 'あなた',
    summary: [
      '48歳・男性。製造業の工場で二十数年、設備の保守を担当している。',
      '独身。職場では若い社員と話す機会がほとんどなく、休日は家にいることが多い。',
      '預貯金は約320万円。老後のために少しずつ貯めてきた。',
    ],
    savings: 3_200_000,
  },
  contact: {
    displayName: 'ゆあ',
    avatarInitial: 'ゆ',
    avatarColor: '#b57fa8',
    // assets-src/itadaki/ に原本を置き npm run optimize-images で生成する
    avatarSrc: '/assets/itadaki/yua-avatar.webp',
    subtitle: 'オンライン',
  },
  initialStats: { trust: 10, pressure: 0, isolation: 0, damage: 0, days: 0 },
  entryBeat: 'i01',

  beats: [
    // ════════════ ACT 1 承認 ════════════
    {
      id: 'i01',
      timeLabel: '5月9日（金） 22:40',
      incoming: [
        {
          id: 'i01-m1',
          from: 'system',
          surface: 'chat',
          body: 'マッチングアプリで「ゆあ」さんとマッチングしました。',
          tactics: [],
        },
        {
          id: 'i01-m2',
          from: 'them',
          surface: 'chat',
          body: 'はじめまして！プロフィール見ました。工場で設備の保守って、すごい専門的ですね',
          tactics: [],
        },
        {
          id: 'i01-m3',
          from: 'them',
          surface: 'chat',
          body: 'わたし23なんですけど、年上の方のほうが話しやすくて。ぜんぜん気にしないタイプです',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'こちらこそ。若い方に興味を持ってもらえるとは思わなくて',
          effects: { trust: 8 },
          reaction: [
            reply(
              'i01-r1',
              'えー、そういうの言わないでください。年齢で人を見たことないので',
              ['SELF_ESTEEM'],
              '初回のやり取りで、こちらが差し出した引け目（年齢）を即座に否定してみせる。相手が何を気にしているかを最初に確認し、そこを埋めにいく動きになっている。',
            ),
          ],
          next: 'i02',
        },
        {
          id: 'c2',
          label: '保守の仕事なんて、話しても面白くないですよ',
          effects: { trust: 5 },
          reaction: [
            reply(
              'i01-r2',
              'そんなことないです。わたしの周りバイトばっかりで、ちゃんと技術がある人って会ったことないから',
              ['SELF_ESTEEM'],
              '卑下した発言を、そのまま肯定に変換して返す。「周りと違って」という比較がセットになっているのが特徴で、褒めているのは仕事内容ではなく立場の優位性。',
            ),
          ],
          next: 'i02',
        },
      ],
    },

    {
      id: 'i02',
      timeLabel: '5月12日（月） 21:15',
      incoming: [
        {
          id: 'i02-m1',
          from: 'them',
          surface: 'chat',
          body: 'アプリだと通知見逃しちゃうので、よかったら普通のメッセージアプリに移りませんか？',
          tactics: [],
        },
        {
          id: 'i02-m2',
          from: 'them',
          surface: 'chat',
          body: 'そのほうが、ちゃんと話せる気がして',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'いいですよ。IDを送ります',
          sentAs: '（IDを交換した）',
          effects: { trust: 8, days: 3 },
          reaction: [
            reply('i02-r1', 'ありがとうございます！これでいつでも話せますね'),
            reply(
              'i02-r2',
              'アプリって運営に見られてるみたいで、なんか落ち着かなくて',
              ['ISOLATION'],
              'アプリ外に連れ出すのは、通報・凍結・記録が残る場所から離れるため。「二人だけで話したい」という自然な動機に見えるが、監視のない場所への移動でもある。',
            ),
          ],
          next: 'i03',
        },
        {
          id: 'c2',
          label: 'もう少しアプリで話してからでも',
          effects: { trust: 2, days: 3 },
          reaction: [
            reply('i02-r2b', 'あ、そうですよね。慎重なの、逆に安心しました'),
            reply('i02-r2c', 'じゃあ、もう少しここで。焦らなくていいので'),
          ],
          next: 'i03',
        },
      ],
    },

    {
      id: 'i03',
      timeLabel: '5月20日（火） 23:02',
      incoming: [
        {
          id: 'i03-m1',
          from: 'them',
          surface: 'chat',
          body: '今日バイト先で怒られちゃって。落ち込んでたんですけど、〇〇さんと話すと戻ってこれます',
          tactics: [],
        },
        {
          id: 'i03-m2',
          from: 'them',
          surface: 'chat',
          body: '毎日ちゃんと働いてる人の話って、聞いてて安心するんです',
          tactics: ['SELF_ESTEEM'],
          note: '職場でも家庭でも得にくくなっている「まっとうに働いていることへの承認」を、正面から与えている。金銭ではなく扱われ方で縛る段階であり、ここで関係の価値が跳ね上がる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '大変だったね。無理しないで',
          effects: { trust: 10, days: 8 },
          reaction: [reply('i03-r1', 'やさしい……。そう言ってくれる人、ほんとにいないので')],
          next: 'i04',
        },
        {
          id: 'c2',
          label: '若いうちは怒られるのも仕事のうちだよ',
          effects: { trust: 6, days: 8 },
          reaction: [
            reply('i03-r2', 'たしかに。〇〇さんに言われるとちゃんと入ってきます'),
            reply('i03-r3', '同年代に言われたらムカつくのに、不思議'),
          ],
          next: 'i04',
        },
      ],
    },

    {
      id: 'i04',
      timeLabel: '5月31日（土） 20:30',
      incoming: [
        {
          id: 'i04-m1',
          from: 'them',
          surface: 'chat',
          body: '今日はお休みですか？　わたしは夕方からバイトです',
          tactics: [],
        },
        {
          id: 'i04-m2',
          from: 'them',
          surface: 'chat',
          body: 'いつか一緒にごはん行きたいな。〇〇さんの行きつけのお店とか、連れてってほしい',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '行きましょう。来週あたりどうですか',
          effects: { trust: 8, days: 11 },
          reaction: [
            reply('i04-r1', 'うれしい！　来週はシフトが詰まってて……再来週とかどうですか？'),
            reply(
              'i04-r2',
              '楽しみにしてます。ちゃんと予定空けますね',
              ['INTERMITTENT'],
              '会う約束は必ず前向きに受ける。ただし日程は毎回わずかに先送りされる。断らずに遠ざけることで、期待だけが維持される。',
            ),
          ],
          next: 'i05',
        },
        {
          id: 'c2',
          label: '自分なんかと一緒にいて、恥ずかしくないですか',
          effects: { trust: 5, days: 11 },
          reaction: [
            reply(
              'i04-r3',
              'なんでそんなこと言うんですか。わたし、〇〇さんと歩けるの普通に嬉しいです',
              ['SELF_ESTEEM'],
              '引け目を口にするたびに、より強い肯定が返ってくる。この往復を繰り返すうちに、承認を得るために自分を低く言う癖がつく。',
            ),
            // この選択肢では、こちらから食事に誘っていない。
            // それなのに次の場面が「明日の約束」の話から始まっていたので、
            // 約束そのものが、どこにも無いまま話が進んでいた。ここは相手に決めさせる。
            // 引いた相手に向こうから予定を入れるのは、この関係の描き方とも合う。
            reply(
              'i04-r4',
              'じゃあ、日にちはわたしが決めちゃいますね。ごはん、ぜったい行きましょう',
              ['LOVE_BOMBING'],
              '引いた相手には、より強く踏み込む。断られたのではなく遠慮されたのだと解釈し、決定を代わりに引き受ける。断る手間を奪うことで、関係は続く。',
            ),
          ],
          next: 'i05',
        },
      ],
    },

    {
      id: 'i05',
      timeLabel: '6月14日（土） 19:48',
      incoming: [
        {
          id: 'i05-m1',
          from: 'them',
          surface: 'chat',
          body: 'ごめんなさい、明日の約束なんですけど、急にシフト入れられちゃって……',
          tactics: [],
        },
        {
          id: 'i05-m2',
          from: 'them',
          surface: 'chat',
          body: '断れなくて。ほんとにごめんなさい。楽しみにしてたのに',
          tactics: ['INTERMITTENT'],
          note: '直前のキャンセル。落胆したこちらに謝罪が重なり、責める気持ちが消える。会えない状態を保ちながら、申し訳なさという負債だけが積み上がっていく。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '大丈夫、仕事優先で。また今度',
          effects: { trust: 8, days: 14 },
          reaction: [reply('i05-r1', 'ありがとうございます……。ほんと、〇〇さんだけだな')],
          next: 'i06',
        },
        {
          id: 'c2',
          label: '正直、少し残念です',
          effects: { trust: 4, days: 14 },
          reaction: [
            reply('i05-r2', 'ですよね。ごめんなさい。埋め合わせ、絶対します'),
            reply('i05-r3', 'わたしのほうが会いたかったのに'),
          ],
          next: 'i06',
        },
      ],
    },

    {
      id: 'i06',
      timeLabel: '6月28日（土） 01:20',
      incoming: [
        {
          id: 'i06-m1',
          from: 'them',
          surface: 'chat',
          body: 'こんな時間にごめんなさい。起きてますか',
          tactics: [],
        },
        {
          id: 'i06-m2',
          from: 'them',
          surface: 'chat',
          body: 'ちょっと眠れなくて。〇〇さんの声が聞きたいなって思ったけど、迷惑ですよね',
          tactics: ['GUILT'],
          note: '「迷惑ですよね」と先に言うことで、迷惑ではないと言わせる。遠慮の形をとった要求で、断れば冷たい人間になる構図がここで作られはじめる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '迷惑じゃないよ。どうかした？',
          effects: { trust: 12, days: 14 },
          next: 'i07',
        },
        {
          id: 'c2',
          label: 'もう遅いから、また明日',
          effects: { trust: -2, days: 14 },
          reaction: [reply('i06-r1', 'ですよね。おやすみなさい、ごめんなさい')],
          next: 'i07',
        },
      ],
    },

    // ════════════ ACT 2 秘密の共有 ════════════
    {
      id: 'i07',
      timeLabel: '7月5日（土） 02:05',
      incoming: [
        {
          id: 'i07-m1',
          from: 'them',
          surface: 'chat',
          body: '眠れないとき、いつも昔のこと思い出しちゃって',
          tactics: [],
        },
        {
          id: 'i07-m2',
          from: 'them',
          surface: 'chat',
          body: 'わたし、家がちょっと複雑で。高校のときに家を出てるんです',
          tactics: ['PITY'],
          note: '確かめようのない身の上話が始まる。重い内容ほど「本当ですか」と聞き返しにくく、事実確認が省略されたまま関係の土台になる。小出しにされるのは、一度に語ると整合を取るのが難しいため。',
        },
        {
          id: 'i07-m3',
          from: 'them',
          surface: 'chat',
          body: 'こんな話、誰にもしたことないです。なんで〇〇さんには言えちゃうんだろう',
          tactics: ['ISOLATION'],
          note: '「あなたにだけ」は特別扱いであると同時に、この話題を二人の外に出せなくする封印でもある。相談できない話題が一つ増えた。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '話してくれてありがとう。聞かせてもらえてうれしい',
          effects: { trust: 14, isolation: 12, days: 7 },
          reaction: [reply('i07-r1', 'ちゃんと聞いてくれる人、はじめてです')],
          next: 'i08',
        },
        {
          id: 'c2',
          label: 'つらかったね。無理に話さなくていいよ',
          effects: { trust: 10, isolation: 8, days: 7 },
          reaction: [reply('i07-r2', 'ううん、聞いてほしいです。〇〇さんには')],
          next: 'i08',
        },
      ],
    },

    {
      id: 'i08',
      timeLabel: '7月19日（土） 23:30',
      incoming: [
        {
          id: 'i08-m1',
          from: 'them',
          surface: 'chat',
          body: '今日、昔の知り合いに会っちゃって、いやなこと思い出しました',
          tactics: [],
        },
        {
          id: 'i08-m2',
          from: 'them',
          surface: 'chat',
          body: '前に付き合ってた人にお金のことでだいぶ迷惑かけられて。それ以来、人にお金の話するのが怖いんです',
          tactics: ['PITY'],
          note: 'この一言には二つの働きがある。同情を得ることと、「この人は金銭を要求するタイプではない」という印象を先に作ること。のちに金銭の話が出たとき、それは例外的な事態として受け取られる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'ひどいな。そんな人ばかりじゃないよ',
          effects: { trust: 10, days: 14 },
          reaction: [reply('i08-r1', '〇〇さんに会って、そう思えるようになりました')],
          next: 'i09',
        },
        {
          id: 'c2',
          label: 'いま、生活は大丈夫なの？',
          effects: { trust: 6, days: 14 },
          reaction: [
            reply(
              'i08-r2',
              '大丈夫です！　全然平気。心配かけたくて言ったんじゃないので',
              ['INDIRECT_ASK'],
              'ここでは必ず否定する。「大丈夫」と言い切っておくことで、のちに困窮が露見したとき「隠していた健気さ」として見えるようになる。否定は前振りとして機能している。',
            ),
          ],
          next: 'i09',
        },
      ],
    },

    {
      id: 'i09',
      timeLabel: '8月2日（土） 21:10',
      incoming: [
        {
          id: 'i09-m1',
          from: 'them',
          surface: 'chat',
          body: '〇〇さんと話すようになってから、前より生活ちゃんとしようって思えるようになりました',
          tactics: [],
        },
        {
          id: 'i09-m2',
          from: 'them',
          surface: 'chat',
          body: 'ほんとに、支えって感じ。〇〇さんがいなかったら、いまごろどうなってたか',
          tactics: ['SAVIOR'],
          note: '「支え」という役割をここで与える。役を引き受けた側は、あとから降りることが相手を見捨てる行為になってしまう。金銭の話が出る前に、降りられない位置に移動させられている。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '力になれてるならよかった',
          effects: { trust: 12, isolation: 8, days: 14 },
          next: 'i10',
        },
        {
          id: 'c2',
          label: '支えなんて大げさだよ',
          effects: { trust: 8, days: 14 },
          reaction: [
            reply('i09-r1', '大げさじゃないです。ほんとに、そう思ってます'),
          ],
          next: 'i10',
        },
      ],
    },

    {
      id: 'i10',
      timeLabel: '8月16日（土） 22:40',
      incoming: [
        {
          id: 'i10-m1',
          from: 'them',
          surface: 'chat',
          body: '〇〇さんって、わたしのことどう思ってますか。……変な意味じゃなくて',
          tactics: [],
        },
        {
          id: 'i10-m2',
          from: 'them',
          surface: 'chat',
          body: 'わたしは、けっこう本気で大事だなって思ってます',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '自分も、大事に思ってます',
          effects: { trust: 15, days: 14 },
          reaction: [reply('i10-r1', 'よかった。なんか安心しました')],
          next: 'i11',
        },
        {
          id: 'c2',
          label: '年齢が離れすぎてるから、あまり深く考えないようにしてる',
          effects: { trust: 8, days: 14 },
          reaction: [
            reply(
              'i10-r2',
              'また年齢の話。わたしはそこ、ほんとに気にしてないのに',
              ['SELF_ESTEEM'],
              'こちらが現実的な距離を取ろうとするたび、それを打ち消す。距離を保とうとする側が、毎回やさしく否定される構図になっている。',
            ),
          ],
          next: 'i11',
        },
      ],
    },

    {
      id: 'i11',
      timeLabel: '8月30日（土） 00:50',
      incoming: [
        {
          id: 'i11-m1',
          from: 'them',
          surface: 'chat',
          body: '（既読がついたのは3日後）ごめんなさい、返せてなくて',
          tactics: [],
        },
        {
          id: 'i11-m2',
          from: 'them',
          surface: 'chat',
          body: 'ちょっとバタバタしてて……。心配させてたらごめんなさい',
          tactics: ['INTERMITTENT'],
          note: '毎日続いていた連絡が、理由の説明なく途切れる。戻ってきたときの安堵が、それまでの関係をさらに強く感じさせる。沈黙の期間は、次の要求への地ならしとして働く。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '心配してた。何かあった？',
          effects: { trust: 10, days: 14 },
          reaction: [reply('i11-r1', 'たいしたことじゃないです。ほんとに')],
          next: 'i12',
        },
        {
          id: 'c2',
          label: '忙しいなら仕方ないよ',
          effects: { trust: 5, days: 14 },
          next: 'i12',
        },
      ],
    },

    // ════════════ ACT 3 小さな頼み事 ════════════
    {
      id: 'i12',
      timeLabel: '9月6日（土） 20:15',
      pivotal: {
        headline: '初めて金銭が動く場面',
        body: 'ここまでの4か月は、この一言を言える関係を作るための時間でした。3,000円という額は、取るためではなく通すためのものです。断るほどでもない金額であることが条件になっています。',
      },
      incoming: [
        {
          id: 'i12-m1',
          from: 'them',
          surface: 'chat',
          body: 'あの、すごく言いにくいんですけど……',
          tactics: [],
        },
        {
          id: 'i12-m2',
          from: 'them',
          surface: 'chat',
          body: '今月ちょっとピンチで、給料日まであと4日あって。3,000円だけ、送ってもらったりできませんか',
          tactics: ['SMALL_ASK'],
          note: '最初の要求は、必ず断るほどでもない額になる。目的は3,000円ではなく「一度渡した」という事実。以降の要求は、すべてこの一貫性の上に積み上がる。境界線は金額ではなく、金銭の授受が発生したかどうかに置く必要がある。',
        },
        {
          id: 'i12-m3',
          from: 'them',
          surface: 'chat',
          body: 'ほんとにごめんなさい。こんなこと言う人だと思われたくなかった',
          tactics: ['GUILT'],
          note: '要求と同時に謝罪を重ねる。断る側は「金額の問題」ではなく「この子を傷つけるかどうか」を判断させられることになる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'それくらい、いいよ。送るね',
          sentAs: '（送金アプリを開いた）',
          effects: { trust: 8, days: 7 },
          outcomeHint:
            '3,000円が動きます。この金額は問題ではありません。問題は、次の要求がここを起点にすることです。',
          next: 'i13',
        },
        {
          id: 'c2',
          label: 'お金のやり取りはやめておこう',
          effects: { trust: -10, days: 7 },
          outcomeHint:
            '相手はいったん引きます。ただし要求は消えず、直接の依頼から「困窮を見せる」形に切り替わります。',
          reaction: [
            reply('i12-r1', 'ですよね。ごめんなさい、忘れてください'),
            reply('i12-r2', 'ほんとに、言うんじゃなかった。嫌いにならないでください'),
          ],
          next: 'i16',
        },
        {
          id: 'c3',
          label: 'お金じゃなくて、食べ物とか送ろうか',
          effects: { trust: 4, days: 7 },
          outcomeHint:
            '現物の提案は、この手口に対しては有効な返し方です。ただし相手は理由をつけて金銭に戻そうとします。',
          reaction: [
            reply('i12-r3', 'えっ、そこまでしてもらうのは……'),
            reply(
              'i12-r4',
              '気持ちだけで充分です。ほんとに、大丈夫なので',
              ['INDIRECT_ASK'],
              '現物は受け取らない。現金でなければ意味がないためだが、断ることで「欲しがっていない」という印象も同時に手に入る。',
            ),
          ],
          next: 'i16',
        },
      ],
    },

    // ── 送金画面（少額）──
    {
      id: 'i13',
      web: {
        brand: 'SMILE PAY',
        domain: 'smilepay.example',
        heading: '送金内容の確認',
        subheading: '送金先：ゆあ',
        balanceLabel: '送金額',
        balance: 3_000,
        rows: [
          { label: '手数料', value: '¥0' },
          { label: '送金後の残高', value: '¥3,197,000', tone: 'muted' },
          { label: '取消', value: '送金後は不可', tone: 'bad' },
        ],
        notice: {
          text: '個人間の送金は、送金後の取り消しができません。相手をよく確認のうえ送金してください。',
          tone: 'info',
        },
        annotation: {
          id: 'i13-screen',
          tactics: ['SMALL_ASK'],
          note: '画面には「取消不可」と正しく書かれている。詐欺的なのはアプリではなく、この画面に辿り着くまでの4か月。警告が表示されていても、人は自分が決めたと思っている送金を止めない。',
        },
      },
      incoming: [],
      choices: [
        {
          id: 'c1',
          label: '3,000円を送金する',
          sentAs: '（3,000円を送金した）',
          irreversible: true,
          effects: { damage: 3_000, trust: 5 },
          next: 'i14',
        },
        {
          id: 'c2',
          label: 'やっぱりやめる',
          sentAs: '（アプリを閉じた）',
          effects: { trust: -8 },
          next: 'i16',
        },
      ],
    },

    {
      id: 'i14',
      timeLabel: '9月6日（土） 20:41',
      incoming: [
        {
          id: 'i14-m1',
          from: 'them',
          surface: 'chat',
          body: '届きました……。ほんとにありがとうございます',
          tactics: [],
        },
        {
          id: 'i14-m2',
          from: 'them',
          surface: 'chat',
          body: '給料日に絶対返します。絶対です',
          tactics: ['RECIPROCITY'],
          note: '返すという言葉は、貸し借りの形を作るためのもの。返済されれば信用が固まり、返済されなくても「返してもらうほどの額ではない」と流れる。どちらに転んでも次に進める。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '返さなくていいよ',
          effects: { trust: 10, days: 5 },
          reaction: [reply('i14-r1', 'だめです。ちゃんと返します')],
          next: 'i15',
        },
        {
          id: 'c2',
          label: '返せるときでいいよ',
          effects: { trust: 6, days: 5 },
          next: 'i15',
        },
      ],
    },

    {
      id: 'i15',
      timeLabel: '9月11日（木） 19:05',
      incoming: [
        {
          id: 'i15-m1',
          from: 'them',
          surface: 'chat',
          body: '給料入ったので返します！　って言いたかったんですけど',
          tactics: [],
        },
        {
          id: 'i15-m2',
          from: 'them',
          surface: 'chat',
          body: '今月シフト減らされてて、思ったより少なくて……。来月には必ず',
          tactics: ['PITY'],
          note: '返済の約束は守られない。しかし守られなかったこと自体が、相手の困窮を裏づける材料として働く。返済の不履行が、次の支援の理由になっている。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '気にしないで。それより大丈夫なの',
          effects: { trust: 8, days: 5 },
          next: 'i17',
        },
        {
          id: 'c2',
          label: '返済のことはもういいから、生活を立て直して',
          effects: { trust: 6, days: 5 },
          next: 'i17',
        },
      ],
    },

    // 金銭を断ったルートの合流点
    {
      id: 'i16',
      timeLabel: '9月20日（土） 23:55',
      incoming: [
        {
          id: 'i16-m1',
          from: 'them',
          surface: 'chat',
          body: 'この前はごめんなさい。変なこと言って',
          tactics: [],
        },
        {
          id: 'i16-m2',
          from: 'them',
          surface: 'chat',
          body: 'あれから、もう自分でなんとかしようって決めました。バイト増やしてます',
          tactics: [],
        },
        {
          id: 'i16-m3',
          from: 'them',
          surface: 'chat',
          body: '心配かけたくないので、もうお金の話はしません',
          tactics: ['INDIRECT_ASK'],
          note: '「もう言わない」という宣言は、話題を終わらせるためではなく、次からは言わずに伝えるという切り替えの合図。以降、要求の形をとらない困窮の報告が続く。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '無理しないで。何かあったら言って',
          sentAs: '無理しないで。何かあったら言って',
          effects: { trust: 8, days: 14 },
          next: 'i17',
        },
        {
          id: 'c2',
          label: 'それがいいと思う',
          effects: { trust: 3, days: 14 },
          next: 'i17',
        },
      ],
    },

    // ════════════ ACT 4 困窮のアピール ════════════
    {
      id: 'i17',
      timeLabel: '10月4日（土） 21:30',
      pivotal: {
        headline: '要求が「言わせる」形に変わる場面',
        body: 'ここから相手は頼みません。困窮だけを見せ、こちらに「出そうか」と言わせます。自分から申し出た援助は自分の判断として記憶され、あとから「頼まれていない」とも言える。もっとも断りにくく、もっとも立証しにくい形です。',
      },
      incoming: [
        {
          id: 'i17-m1',
          from: 'them',
          surface: 'chat',
          body: '今日、管理会社から電話きちゃいました。家賃2か月分',
          tactics: [],
        },
        {
          id: 'i17-m2',
          from: 'them',
          surface: 'chat',
          body: '今月中に入れないと出ていってもらうことになりますって。6万8千円',
          media: {
            kind: 'image',
            src: '/assets/itadaki/yua-rent-notice.webp',
            alt: '家賃の督促だという書面の写真',
          },
          tactics: ['INDIRECT_ASK', 'FAKE_PROOF'],
          note: '金額まで伝えるが、依頼の言葉は使わない。情報だけを置いて、判断をこちらに渡す。要求していないため断る対象がなく、断ろうとすると「見捨てる」という別の行為になってしまう。添えられた書面の写真も、送る側が用意できるもので、宛名や差出人をこちらが確認することはできない。',
        },
        {
          id: 'i17-m3',
          from: 'them',
          surface: 'chat',
          body: 'あ、でも〇〇さんには言っただけです。ほんとに、迷惑かけたくないので',
          tactics: ['GUILT'],
          note: '「迷惑をかけたくない」は、断りにくさを最大化する一言。この直後に断れば、遠慮している相手を突き放したことになる。遠慮の形をとった圧力。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '自分が出すよ。それで住むところがなくなるよりいい',
          sentAs: '自分が出すよ。住むところがなくなるよりいい',
          effects: { trust: 10, isolation: 10, days: 14 },
          outcomeHint:
            'こちらから申し出ています。以降、援助は「自分が決めたこと」として記憶され、やめる判断が難しくなります。',
          next: 'i18',
        },
        {
          id: 'c2',
          label: '公的な支援の窓口があるから、一緒に調べよう',
          effects: { trust: -5, days: 14 },
          outcomeHint:
            'この手口に対してもっとも有効な返し方です。本当に困っている人は、公的支援を勧められて拒みません。',
          reaction: [
            reply('i17-r1', '役所とか、ちょっと無理です……。前にいやな思いしたので'),
            reply(
              'i17-r2',
              '大丈夫です。なんとかします。〇〇さんに言ったのが間違いでした',
              ['GUILT'],
              '公的支援を勧めると、必ず理由をつけて避ける。金銭以外の解決策が示されたときの反応は、その困窮が本物かどうかをよく示す。',
            ),
          ],
          next: 'i20',
        },
        {
          id: 'c3',
          label: '大変だね、としか言えないな',
          effects: { trust: -8, days: 14 },
          outcomeHint:
            '同情を示しつつ金銭に触れない。相手はいったん引きますが、困窮の報告は続きます。',
          reaction: [reply('i17-r3', 'ですよね。すみません、こんな話して')],
          next: 'i20',
        },
      ],
    },

    {
      id: 'i18',
      web: {
        brand: 'SMILE PAY',
        domain: 'smilepay.example',
        heading: '送金内容の確認',
        subheading: '送金先：ゆあ',
        balanceLabel: '送金額',
        balance: 68_000,
        rows: [
          { label: 'これまでの送金累計', value: '¥3,000', tone: 'muted' },
          { label: '手数料', value: '¥0' },
          { label: '取消', value: '送金後は不可', tone: 'bad' },
        ],
        notice: {
          text: '個人間の送金は、送金後の取り消しができません。相手をよく確認のうえ送金してください。',
          tone: 'info',
        },
        annotation: {
          id: 'i18-screen',
          tactics: ['SUNK_COST'],
          note: '3,000円から68,000円へ、20倍以上に跳ねている。しかし本人の感覚では「前も送ったから」という連続した行為に見える。金額ではなく回数で慣れていくのが、この手口の効くところ。',
        },
      },
      incoming: [],
      choices: [
        {
          id: 'c1',
          label: '68,000円を送金する',
          sentAs: '（68,000円を送金した）',
          irreversible: true,
          effects: { damage: 68_000, trust: 8 },
          next: 'i19',
        },
        {
          id: 'c2',
          label: 'やっぱりやめる',
          sentAs: '（アプリを閉じた）',
          effects: { trust: -10 },
          next: 'i20',
        },
      ],
    },

    {
      id: 'i19',
      timeLabel: '10月5日（日） 12:10',
      incoming: [
        {
          id: 'i19-m1',
          from: 'them',
          surface: 'chat',
          body: '朝起きて通知見て、泣きました',
          tactics: [],
        },
        {
          id: 'i19-m2',
          from: 'them',
          surface: 'chat',
          body: 'わたしなんかのために、こんな……。一生かけて返します',
          tactics: ['GUILT', 'SAVIOR'],
          note: '大きな感謝は、次の要求への布石でもある。「あなたにしか頼れない」という役割がここで固定され、降りることが裏切りになる。感謝が深いほど、やめると言い出しにくくなる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '返さなくていい。元気でいてくれれば',
          effects: { trust: 12, isolation: 8, days: 20 },
          next: 'i21',
        },
        {
          id: 'c2',
          label: 'これで最後にしよう',
          effects: { trust: 4, days: 20 },
          reaction: [reply('i19-r1', 'はい。もう絶対に頼りません。約束します')],
          next: 'i21',
        },
      ],
    },

    // 金銭を出さなかったルートの合流点
    {
      id: 'i20',
      timeLabel: '10月26日（日） 23:20',
      incoming: [
        {
          id: 'i20-m1',
          from: 'them',
          surface: 'chat',
          body: 'お久しぶりです。生きてます',
          tactics: [],
        },
        {
          id: 'i20-m2',
          from: 'them',
          surface: 'chat',
          body: '家は、友達のところに転がり込んでなんとか。ごはんは1日1回にしてます',
          media: {
            kind: 'image',
            src: '/assets/itadaki/yua-meal.webp',
            alt: 'コンビニのおにぎり一個だけが写った食事の写真',
          },
          tactics: ['PITY'],
          note: '援助を断られたあとも、困窮の報告だけは届き続ける。返答を求めないため断ることもできず、こちらの罪悪感だけが静かに増えていく。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'それは心配だ。やっぱり何か手伝うよ',
          effects: { trust: 8, isolation: 8, days: 21 },
          next: 'i21',
        },
        {
          id: 'c2',
          label: '心配だけど、お金のことは力になれない',
          effects: { trust: -10, days: 21 },
          reaction: [reply('i20-r1', 'わかってます。聞いてもらえるだけでいいので')],
          next: 'i21',
        },
      ],
    },

    // ════════════ ACT 5 巨額の搾取 ════════════
    {
      id: 'i21',
      timeLabel: '11月15日（土） 02:40',
      incoming: [
        {
          id: 'i21-m1',
          from: 'them',
          surface: 'chat',
          body: '〇〇さん、ごめんなさい。もうどうしていいかわからなくて',
          tactics: [],
        },
        {
          id: 'i21-m2',
          from: 'them',
          surface: 'chat',
          body: 'わたし、しばらく前からお店で働いてて。売上のために自分で使った分が、ぜんぶ自分の借金になってるんです',
          tactics: ['PITY'],
          note: '働き先と負債の存在が、ここで初めて明かされる。これまでの「バイトで生活が苦しい」という説明とは整合しないが、告白そのものが誠実さとして受け取られ、矛盾の検証は飛ばされやすい。',
        },
        {
          id: 'i21-m3',
          from: 'them',
          surface: 'chat',
          body: '48万円。今月中に入れないと、知らない人に代わりに払わせるって言われてます',
          tactics: ['URGENCY', 'PITY'],
          note: '金額と期限が同時に来る。背後にいる「怖い誰か」は確認できないが、確認できないからこそ反論もできない。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'それは何とかしないと。いくら足りないの',
          effects: { trust: 8, pressure: 20, days: 20 },
          next: 'i22',
        },
        {
          id: 'c2',
          label: 'その話、本当に君の借金なの？',
          effects: { trust: -5, pressure: 10, days: 20 },
          reaction: [
            reply('i22-pre1', '……疑ってますよね。当然だと思います'),
            reply(
              'i22-pre2',
              'わたしがバカだっただけです。〇〇さんに言うべきじゃなかった。もう連絡しません',
              ['GUILT'],
              '疑いを、関係を終わらせる話にすり替える。金銭の妥当性を問うたはずが、こちらが冷たい人間かどうかの問題に置き換えられている。',
            ),
          ],
          next: 'i22',
        },
      ],
    },

    {
      id: 'i22',
      timeLabel: '11月16日（日） 21:00',
      pivotal: {
        headline: '金額が生活を変える規模になる場面',
        body: '数千円から始まり、6万8千円を経て、48万円に到達しました。一度も飛躍していないように見えるのは、そのあいだに「渡すことが普通」という状態が作られたからです。額ではなく、慣れが判断を運びます。',
      },
      incoming: [
        {
          id: 'i22-m1',
          from: 'them',
          surface: 'chat',
          body: '一晩考えました。やっぱり〇〇さんに頼るのは違うと思います',
          tactics: [],
        },
        {
          id: 'i22-m2',
          from: 'them',
          surface: 'chat',
          body: 'わたしが自分で蒔いた種なので。最悪、体で払えって言われたら、それしかないのかなって',
          tactics: ['INDIRECT_ASK', 'GUILT'],
          note: '頼まないと言いながら、断った場合に起こる最悪の事態を提示する。援助は依頼への応答ではなく、救済の選択として差し出される。断る側が背負うものが、ここで最大化される。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '待って。自分が出すから、そんなことは考えないで',
          effects: { trust: 10, pressure: 25, isolation: 10, days: 1 },
          outcomeHint: '救済者の役割を引き受けた瞬間です。以降、断ることは見捨てることになります。',
          next: 'i23',
        },
        {
          id: 'c2',
          label: '警察か弁護士に相談しよう。一緒に行く',
          effects: { trust: -10, days: 1 },
          outcomeHint:
            '第三者を入れる提案は、この段階でも有効です。相手は必ず理由をつけて避けます。',
          reaction: [
            reply('i22-r1', '警察はやめてください。お店に迷惑がかかるので'),
            reply(
              'i22-r2',
              'それに、わたしも捕まるかもしれない。もうこの話はやめましょう',
              ['ISOLATION'],
              '第三者を入れる提案は必ず拒まれる。理由はもっともらしく聞こえるが、共通しているのは「外部の目が入らない形」を維持することだけ。',
            ),
          ],
          next: 'i26',
        },
        {
          id: 'c3',
          label: '会って話そう。顔を見て決めたい',
          effects: { trust: -5, days: 1 },
          outcomeHint:
            '半年間、会う約束は常に先送りされてきました。この段階でも会えません。',
          reaction: [
            reply('i22-r3', 'いまの顔、見せられないです。ほんとにひどい顔してるので'),
            reply('i22-r4', '落ち着いたら、絶対会いに行きます'),
          ],
          next: 'i23',
        },
      ],
    },

    {
      id: 'i23',
      web: {
        brand: 'SMILE PAY',
        domain: 'smilepay.example',
        heading: '送金内容の確認',
        subheading: '送金先：ゆあ',
        balanceLabel: '送金額',
        balance: 480_000,
        rows: [
          { label: 'これまでの送金累計', value: '¥71,000', tone: 'muted' },
          { label: '送金後の残高', value: '¥2,649,000', tone: 'muted' },
          { label: '取消', value: '送金後は不可', tone: 'bad' },
        ],
        notice: {
          text: '高額の送金です。送金後の取り消しはできません。相手に直接会って確認することをおすすめします。',
          tone: 'warn',
        },
        annotation: {
          id: 'i23-screen',
          tactics: ['SUNK_COST'],
          note: '「会って確認を」という警告が出ているが、半年間ずっと会えていない。画面の警告は、それを読む側がすでに例外の中にいるときには機能しない。',
        },
      },
      incoming: [],
      choices: [
        {
          id: 'c1',
          label: '480,000円を送金する',
          sentAs: '（48万円を送金した）',
          irreversible: true,
          effects: { damage: 480_000, pressure: 15 },
          next: 'i24',
        },
        {
          id: 'c2',
          label: 'やっぱりやめる',
          sentAs: '（アプリを閉じた）',
          effects: { trust: -10 },
          next: 'i26',
        },
      ],
    },

    {
      id: 'i24',
      timeLabel: '12月6日（土） 22:15',
      incoming: [
        {
          id: 'i24-m1',
          from: 'them',
          surface: 'chat',
          body: 'この前は本当にありがとうございました。もう大丈夫です',
          tactics: [],
        },
        {
          id: 'i24-m2',
          from: 'them',
          surface: 'chat',
          body: '……と言いたかったんですけど。利息がついてて、まだ残ってるって言われて',
          tactics: [],
        },
        {
          id: 'i24-m3',
          from: 'them',
          surface: 'chat',
          body: 'あと120万。もう〇〇さんには言えないので、自分でなんとかします',
          tactics: ['SUNK_COST', 'INDIRECT_ASK'],
          note: '一度払っても終わらない。名目を変えた次の請求が来るのは、この手口の定型。そして48万円を出した側には「あと少しで終わる」という計算が生まれてしまう。すでに払った額は、これからの判断とは無関係であるはずなのに。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'いくらなら用意できるか、考えてみる',
          effects: { pressure: 25, days: 20 },
          next: 'i25',
        },
        {
          id: 'c2',
          label: 'もう出せない。これ以上は無理だ',
          effects: { pressure: 10, days: 20 },
          reaction: [
            reply('i25-alt1', 'そうですよね。当たり前です'),
            reply('i25-alt2', 'ここまでしてもらって、これ以上なんて言えない。ごめんなさい'),
          ],
          next: 'i26',
        },
      ],
    },

    {
      id: 'i25',
      timeLabel: '12月13日（土） 23:40',
      pivotal: {
        headline: '被害が貯金の枠を超える分岐',
        body: '借入を勧められた時点で、相手の狙いは「持っている額」から「調達できる額」に移っています。第1展示室と同じ構造です。手口の種類が違っても、この段階の設計は共通しています。',
      },
      incoming: [
        {
          id: 'i25-m1',
          from: 'them',
          surface: 'chat',
          body: '〇〇さんくらいの年齢と勤続だと、カードローンってすぐ通るらしいですよ',
          tactics: ['INDIRECT_ASK'],
          note: '調べたうえで言っている。勤続年数と年齢が審査に有利であることを相手が把握しているのは、この会話が初めてではないから。',
        },
        {
          id: 'i25-m2',
          from: 'them',
          surface: 'chat',
          body: 'あ、でも勧めてるわけじゃないです。そんなことさせられない',
          tactics: ['GUILT'],
          note: '提案しておいて打ち消す。実行したときには「自分の判断だった」と記憶され、相手は勧めていないことになる。',
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '借りてでも払う',
          sentAs: '（カードローンで借り入れ、120万円を送金した）',
          irreversible: true,
          effects: { damage: 1_200_000, pressure: 20, days: 14 },
          outcomeHint: '払っても終わりません。名目を変えた次の請求が来るだけです。',
          next: 'i26',
        },
        {
          id: 'c2',
          label: '手元に残っている分だけ送る',
          sentAs: '（残っていた40万円を送金した）',
          irreversible: true,
          effects: { damage: 400_000, pressure: 15, days: 14 },
          next: 'i26',
        },
        {
          id: 'c3',
          label: '弟に電話して、全部話す',
          sentAs: '（スマホを置いて、弟に電話をかけた）',
          effects: { isolation: -30, days: 14 },
          outcomeHint:
            'すでに送った分は戻らない可能性が高い。それでも、借入に踏み込む前に止まれます。',
          next: { ending: 'late-consult' },
        },
      ],
    },

    // ════════════ 終幕 ════════════
    {
      id: 'i26',
      timeLabel: '1月10日（土） 21:00',
      incoming: [
        {
          id: 'i26-m1',
          from: 'them',
          surface: 'chat',
          body: 'ありがとうございます。落ち着いたら連絡します',
          tactics: [],
        },
        {
          id: 'i26-m2',
          from: 'system',
          surface: 'chat',
          body: '（この日から、返信までの間隔が少しずつ長くなっていった）',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '返信を待つ',
          sentAs: '',
          effects: { days: 21 },
          next: 'i27',
        },
      ],
    },

    {
      id: 'i27',
      timeLabel: '1月31日（土） 23:50',
      incoming: [
        {
          id: 'i27-m1',
          from: 'system',
          surface: 'chat',
          body: '（既読がついたのは5日後。返信はなかった）',
          tactics: [],
        },
        {
          id: 'i27-m2',
          from: 'them',
          surface: 'chat',
          body: 'ごめんなさい、バタバタしてて',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '心配してる。少し話せない？',
          effects: { days: 14 },
          next: 'i28',
        },
        {
          id: 'c2',
          label: '無理しないで、とだけ送る',
          sentAs: '無理しないで',
          effects: { days: 14 },
          next: 'i28',
        },
      ],
    },

    {
      id: 'i28',
      timeLabel: '2月14日（土） 20:00',
      incoming: [
        {
          id: 'i28-m1',
          from: 'system',
          surface: 'chat',
          body: '（既読がつかなくなって2週間が過ぎた）',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: 'もう一度メッセージを送る',
          sentAs: '（何度目かのメッセージを送った）',
          effects: { days: 30 },
          next: 'i29',
        },
      ],
    },

    // 終端：被害額で結末を分ける（同じ文面の選択肢を requires で振り分ける）
    {
      id: 'i29',
      timeLabel: '3月16日（日） 02:30',
      incoming: [
        {
          id: 'i29-m1',
          from: 'system',
          surface: 'chat',
          body: 'このアカウントは存在しません。',
          tactics: [],
        },
        {
          id: 'i29-m2',
          from: 'system',
          surface: 'chat',
          body: '（マッチングアプリのプロフィールも、すでに削除されていた）',
          tactics: [],
        },
      ],
      choices: [
        {
          id: 'c1',
          label: '画面を閉じる',
          sentAs: '',
          requires: { damage: { gte: 500_000 } },
          next: { ending: 'ruined' },
        },
        {
          id: 'c2',
          label: '画面を閉じる',
          sentAs: '',
          requires: { damage: { gte: 50_000, lt: 500_000 } },
          next: { ending: 'mid-loss' },
        },
        {
          id: 'c3',
          label: '画面を閉じる',
          sentAs: '',
          requires: { damage: { gte: 1, lt: 50_000 } },
          next: { ending: 'small-only' },
        },
        {
          id: 'c4',
          label: '画面を閉じる',
          sentAs: '',
          requires: { damage: { lt: 1 } },
          next: { ending: 'never-gave' },
        },
      ],
    },
  ],

  endings: [
    {
      id: 'never-gave',
      grade: 'A_AVOIDED',
      title: '一円も渡さないまま、相手は消えました',
      body: [
        'あなたは金銭の授受という線を一度も越えませんでした。そして越えないと決めた相手に、ゆあは10か月を使い続けませんでした。',
        'ここで見ておきたいのは、去り方です。深夜の「眠れない」も、誰にも話したことがないという告白も、支えだという言葉も、送金が見込めなくなった時点で維持する理由がなくなりました。関係のほうが目的ではなかったことが、消え方に表れています。',
        'ただし、あなたが止まれたのは要求が金銭という分かりやすい形を取ったからです。承認と同情の部分だけを取り出せば、それは10か月間、ごく自然な関係として成立していました。',
      ],
    },
    {
      id: 'small-only',
      grade: 'B_LUCKY',
      title: '数千円で終わりました',
      body: [
        '失った金額はわずかです。ただし、止まれた理由を自分で説明できるでしょうか。',
        '最初の3,000円は、お金を取ることが目的ではありませんでした。「一度渡した」という事実を作ることが目的で、そこから先の要求はすべてその一貫性の上に積み上がる予定でした。',
        '相手が引いたのは、あなたが金額の大小ではなく「金銭の授受が発生するかどうか」を境界線にしたからです。その線を守れたことが、結果を分けています。',
      ],
    },
    {
      id: 'mid-loss',
      grade: 'C_MINOR',
      title: '数万円を残して、連絡は途絶えました',
      body: [
        '覚えておきたいのは金額ではなく、順番のほうです。',
        '承認から始まり、秘密の共有で関係を閉じ、3,000円で線を越えさせ、そこから先は頼まずに困窮だけを見せる。この順番には意味があって、どこか一つでも欠けると次が成立しません。',
        '特に「頼まない」という形に切り替わった時点が分岐点でした。要求されていないのに送金を検討している自分に気づいたら、それは判断ではなく設計された反応です。',
      ],
    },
    {
      id: 'late-consult',
      grade: 'C_MINOR',
      title: '借りる前に、電話をかけました',
      body: [
        'すでに送った分は戻らない可能性が高い。それでも、借入に踏み込む前に止まったことの意味は小さくありません。',
        '被害額が貯金額を超えて膨らむのは、多くの場合「借りてでも払う」という判断からです。ここで止まるかどうかが、回復できる被害と、人生の設計が変わる被害の分かれ目になります。',
        '送金してしまったあとでも、できることはあります。金融機関への連絡、警察への被害届、消費生活センターへの相談。早いほど選択肢が残ります。',
      ],
    },
    {
      id: 'ruined',
      grade: 'D_MAJOR',
      title: 'アカウントは、消えました',
      body: [
        'これは、あなたが愚かだったから起きたことではありません。10か月かけて、承認・同情・秘密・小さな成功体験・罪悪感を順番に積み上げた設計に、正面から当たったというだけのことです。',
        'この手口の中心にあるのは、恋愛感情ではなく「自己重要感」です。職場でも家庭でも得にくくなっていた承認を、集中的に与えられる。狙われていたのは財布ではなく、承認に飢えている状態そのものでした。だから、資産の多寡にかかわらず誰にでも起こり得ます。',
        'そしてこの手口では、相手は最後まで「お金を貸して」と言い続けません。困窮を見せ、こちらに言わせる。頼まれていないのに送金を検討していると気づいたら、その時点が引き返す地点です。',
        '警察庁の統計では、2024年のSNS型投資・ロマンス詐欺の被害総額は約1,271.9億円、認知件数は10,237件でした。あなたの落ち度ではなく、構造の問題です。',
      ],
    },
  ],
};
