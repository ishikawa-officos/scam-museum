/**
 * 選択の結果が、そのあとの発言と食い違っていないかを洗い出す。
 *
 *   npm run check-branches
 *
 * きっかけは第4展示室で見つかった食い違い。
 * 「これは詐欺では？」と書かずに進んでも、翌朝みかが
 * 「昨日はちょっとびっくりしましたね」と話しかけてくる。
 * 何も起きていないのに、起きた前提で会話が続いていた。
 *
 * 原因は合流。複数の選択肢が同じビートへ入るのに、その先の本文が
 * 特定の経路を通ってきたことを前提に書かれていると、
 * 別の経路で来た人には意味の通らない会話になる。
 *
 * 合流そのものは設計であって不具合ではない（枝を全部持つと維持できない）。
 * だから機械には「どこが合流か」と「そこで前を指す言葉が使われているか」
 * までを出させて、読むべき場所を絞る。判断は人がやる。
 *
 * 【この検査で見つからないもの】
 * 見ているのは「前を指す言葉があるか」だけなので、片側しか拾えない。
 *
 *   拾える … 何も起きていない経路で「昨日はびっくりしましたね」と言われる
 *   拾えない … 何か起きた経路で「誰も、何も疑っていない」と言われる
 *
 * 後者は前を指す言葉を含まないので素通りする。実際、n08 の行き先を
 * わざと戻して試したところ、この検査は何も言わなかった。
 * 「起きたことを無かったことにする」側は、人が読んで気づくしかない。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = [
  { id: 'romance-investment', file: 'romance-investment.ts', export: 'romanceInvestment' },
  { id: 'itadaki', file: 'itadaki.ts', export: 'itadaki' },
  { id: 'police-freeze', file: 'police-freeze.ts', export: 'policeFreeze' },
  { id: 'group-investment', file: 'group-investment.ts', export: 'groupInvestment' },
];

/**
 * 直前の出来事を指す言い回し。
 * これが合流地点の本文にあると、どの経路で来たかによって意味が変わりうる。
 */
const BACKREFERENCE = [
  '昨日', 'さっき', '先ほど', 'あの話', 'あのこと', 'あれから', 'この前', 'こないだ',
  '昨夜', '昨晩', '例の', 'さきほど', '先日', 'あのとき', 'あの時', 'さっきの',
  '終わったこと', '気にしないで', '謝', 'すみませんでした', 'ごめん',
];

/**
 * 読んで、そのままでよいと判断した合流。
 *
 * ここに載っているものは報告しない。載っていない合流が出たら落とす。
 * 毎回13件並べても読み飛ばすだけなので、「新しく増えたぶん」だけが目に入るようにする。
 */
const REVIEWED = {
  // 前の晩の出来事は、どの選択肢を選んでも同じ。謝っているのは相手自身の不在について
  'romance-investment/b07': '「ごめんなさい」は相手の音信不通のこと。選択に依らない',
  // 「あれから」が指すのは相手が気に病んでいた時間。こちらの返事の内容には依らない
  'romance-investment/b10': '「前に…と言っていましたよね」は数か月の会話の外側を指す。画面に出ていない会話の範囲',
  // どちらの選択肢も金の話を断っている。「距離を置かれた」はどちらにも当たる
  'romance-investment/b14': '2つの選択肢はどちらも断り。相手の受け取り方は共通',
  // もとは c2（こちらから誘わない選択）でも「明日の約束」の話から始まっていた。
  // c2 の返しに、相手が日にちを決める一言を足して、どちらの経路でも約束が成立するようにした
  'itadaki/i05': 'c1 はこちらが誘い、c2 は相手が日にちを決める。どちらの経路でも約束は成立している',
  'itadaki/i06': '「こんな時間にごめんなさい」は時刻のこと。選択に依らない',
  'itadaki/i11': '謝っているのは相手自身の音信不通について',
  'itadaki/i12': '謝っているのは相手自身が金の話を出したことについて',
  'itadaki/i16': '合流元3本はいずれも金を断る選択。「変なこと言って」はどれにも当たる',
  'itadaki/i21': '「どうしていいかわからなくて」は相手の状況。こちらの選択に依らない',
  'group-investment/n03': '「昨日の解説」は講義のこと。こちらの発言とは無関係',
  'group-investment/n05': '「感謝」が語に当たっただけ。前の出来事を指していない',
  'group-investment/n24': '「昨日まで」は部屋に入れていた事実。どちらの選択でも退会させられる',
};

const problems = [];
const notes = [];

for (const target of TARGETS) {
  const mod = await import(`../src/content/scenarios/${target.file}`);
  const scenario = mod[target.export];
  if (!scenario) {
    problems.push(`${target.id}: export ${target.export} が見つかりません`);
    continue;
  }

  const beats = new Map(scenario.beats.map((b) => [b.id, b]));

  // どのビートへ、どこから入ってくるか
  const inbound = new Map();
  for (const beat of scenario.beats) {
    for (const choice of beat.choices ?? []) {
      if (typeof choice.next !== 'string') continue;
      if (!inbound.has(choice.next)) inbound.set(choice.next, []);
      inbound.get(choice.next).push({
        from: beat.id,
        choiceId: choice.id,
        label: choice.label,
      });
    }
  }

  const merges = [...inbound.entries()].filter(([, edges]) => edges.length > 1);

  console.log(`\n══ ${target.id}（ビート ${scenario.beats.length}／合流 ${merges.length}）`);

  for (const [beatId, edges] of merges) {
    const beat = beats.get(beatId);
    if (!beat) continue;

    const lines = [...(beat.incoming ?? []), ...(beat.ambient ?? [])];
    const hits = [];
    for (const m of lines) {
      for (const word of BACKREFERENCE) {
        if (m.body.includes(word)) hits.push({ word, body: m.body, id: m.id });
      }
    }

    // 同じビートから来る枝（選択肢違い）だけなら、直前の出来事は共通なので問題になりにくい。
    // 別々のビートから合流している場合が、いちばん危ない
    const sources = new Set(edges.map((e) => e.from));

    if (hits.length === 0) {
      notes.push(`${target.id} ${beatId}: 合流 ${edges.length}本、前を指す言葉なし`);
      continue;
    }

    const key = `${target.id}/${beatId}`;
    if (REVIEWED[key]) {
      notes.push(`${key}: 確認済み（${REVIEWED[key]}）`);
      continue;
    }

    console.log(`\n  ⚠ ${beatId} ← ${edges.length}本（元ビート ${[...sources].join(', ')}）`);
    for (const e of edges) console.log(`      from ${e.from}.${e.choiceId}「${e.label}」`);
    for (const h of hits) {
      console.log(`      「${h.word}」を含む: ${h.id} … ${h.body.slice(0, 46)}`);
    }
    problems.push(`${target.id} ${beatId}（元ビート ${[...sources].join(', ')}）`);
  }
}

console.log('\n──────────────');
if (problems.length === 0) {
  console.log(`未確認の合流はありません（確認済み・無害な合流 ${notes.length} 件）。`);
  console.log('※ 機械が見ているのは「前を指す言葉があるか」まで。意味が通るかは人が読むこと。');
  process.exit(0);
}

console.log(`未確認の合流が ${problems.length} 件あります。`);
for (const p of problems) console.log(`  ${p}`);
console.log(
  '\n本文を読み、どの経路から来ても意味が通るか確かめてください。\n' +
    '通らないなら、そのビートを経路ごとに分けます（例: n09 と n09-after）。\n' +
    '通るなら、scripts/check-branches.mjs の REVIEWED に理由を書いて登録してください。',
);
process.exit(1);
