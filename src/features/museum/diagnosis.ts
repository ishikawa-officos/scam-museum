import type { RunResult } from '@/store/usePlayStore';

export type AxisId = 'affection' | 'authority' | 'conformity' | 'sunkCost';

export type Axis = {
  id: AxisId;
  /** シェアしたくなる呼び名 */
  type: string;
  /** 何に反応しやすいか、の短い説明 */
  tagline: string;
  /** その傾向が強く出た人へ */
  reading: string;
  /** 明日から効く、具体的なひとつの対策 */
  guard: string;
  rooms: string[];
};

export const AXES: Record<AxisId, Axis> = {
  affection: {
    id: 'affection',
    type: '情に弱いヒーロータイプ',
    tagline: '「自分がなんとかしてあげたい」で動いてしまう',
    reading:
      '好意・承認・同情に強く反応しました。困っている人を放っておけず、頼られると力になろうとする。これは人として上等な性質で、欠点ではありません。ただ、この館の第1・第2展示室は、まさにその性質を使って組まれています。好意を向けられると「疑うこと自体が失礼だ」と感じ、検証が後回しになる。狙われているのは財布ではなく、あなたの誠実さのほうです。',
    guard:
      '会ったことのない相手との関係で金銭の話が出たら、一度だけ現実の知人に「こういう人と話している」と話してみてください。内容の相談ではなく、存在を人に知らせるだけで十分です。',
    rooms: ['第1展示室', '第2展示室'],
  },
  authority: {
    id: 'authority',
    type: '権威に怯える優等生タイプ',
    tagline: 'ルールを守ってきた人ほど、深く刺さる',
    reading:
      '肩書きのある相手や、法的な不利益をちらつかせる言葉に強く反応しました。これは、まっとうに生きてきた人ほど強く出ます。「逮捕」「凍結」という言葉が出ると、内容を検討する前に、その状況から抜け出す方法を探してしまう。相手はその出口を一つだけ用意しています。あなたの遵法意識が、そのまま握られたということです。',
    guard:
      '公的機関を名乗る連絡は、その場で結論を出さず、必ず一度電話を切ってください。そのうえで、相手が伝えた番号ではなく、自分で調べた代表番号にかけ直します。本物なら、それで何も問題は起きません。',
    rooms: ['第3展示室'],
  },
  conformity: {
    id: 'conformity',
    type: '「みんなやってる」に弱い同調タイプ',
    tagline: '全員が信じている場で、ひとりだけ疑い続けられない',
    reading:
      '大勢が信じている状況に強く反応しました。あなたが疑わなかったわけではありません。「200人が信じていて自分だけが疑っている」という構図に見えたから、疑いを口に出せなくなった。これは判断力の問題ではなく、人間が集団の中で生きるために備えている機能そのものです。第4展示室の部屋は、その機能を狙って組み立てられていました。',
    guard:
      '参加人数と、実際に発言している人数を数えてみてください。桁が違えば演出です。そして「みんなやっている」は、内容が正しい理由には一切なりません。何人いても、確認できない話は確認できないままです。',
    rooms: ['第4展示室'],
  },
  sunkCost: {
    id: 'sunkCost',
    type: '損切りできない意地っぱりタイプ',
    tagline: '「ここまで来たのに」が、いちばん高くつく',
    reading:
      '一度お金を渡したあと、そこで止まらずに進み続けました。「ここでやめると今までが無駄になる」という感覚は誰にでも働きます。しかし、すでに払った額は、これから払うかどうかの判断とは本来まったく無関係です。被害が生活を変える規模になるのは、ほぼ例外なくこの段階からで、どの展示室でも同じ形で現れます。',
    guard:
      '「ここまで来たのに」と思った瞬間を、判断を止める合図として決めておいてください。とくに、出金や解決のために追加の入金を求められたら、その時点で確定と考えてかまいません。',
    rooms: ['すべての展示室'],
  },
};

export type Diagnosis = {
  scores: Record<AxisId, number>;
  primary: AxisId | null;
  playedRooms: number;
  totalIrreversible: number;
  totalDamage: number;
  allAvoided: boolean;
};

const ROOM_AXIS: Record<string, AxisId> = {
  'romance-investment': 'affection',
  itadaki: 'affection',
  'police-freeze': 'authority',
  'group-investment': 'conformity',
};

function damageRatio(record: RunResult | undefined): number {
  if (!record || record.savings <= 0) return 0;
  // 黒字（出金が入金を上回った）経路がある。比率がマイナスになると軸が壊れるので 0 で止める
  return Math.min(1, Math.max(0, record.stats.damage / record.savings));
}

/**
 * 騙されツボ診断（SPEC.md §6 フェーズ3/4）
 *
 * 採点ではない。「どの感情のツボを押されると弱いか」を本人に返すだけの計算で、
 * 優劣をつけたり、平均と比べたりはしない。
 */
export function diagnose(records: Record<string, RunResult>): Diagnosis {
  const played = Object.values(records);

  const byAxis = (axis: AxisId) =>
    Math.max(
      0,
      ...Object.entries(ROOM_AXIS)
        .filter(([, a]) => a === axis)
        .map(([id]) => damageRatio(records[id])),
    );

  // 「一線」を2回以上越えた＝最初の支払いのあとも止まらなかった
  const sunkCost = Math.min(
    1,
    played.reduce((acc, r) => acc + Math.max(0, r.irreversibleChoices.length - 1), 0) / 4,
  );

  const scores: Record<AxisId, number> = {
    affection: byAxis('affection'),
    authority: byAxis('authority'),
    conformity: byAxis('conformity'),
    sunkCost,
  };

  const best = (Object.entries(scores) as [AxisId, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    scores,
    primary: best ? best[0] : null,
    playedRooms: played.length,
    totalIrreversible: played.reduce((a, r) => a + r.irreversibleChoices.length, 0),
    // 黒字ぶんで他室の被害を相殺しない。持っていかれた額だけを足す
    totalDamage: played.reduce((a, r) => a + Math.max(0, r.stats.damage), 0),
    allAvoided: played.length > 0 && played.every((r) => r.stats.damage <= 0),
  };
}

function manYen(yen: number): string {
  if (yen >= 10_000) return `${Math.round(yen / 10_000).toLocaleString('ja-JP')}万円`;
  return `${yen.toLocaleString('ja-JP')}円`;
}

/**
 * シェア文面。
 *
 * 「うまく騙された」ことを自慢できる挑戦状として書く。この館では、
 * 派手に転んだことが手柄になる（SPEC.md §2.4 の方針転換に沿う）。
 * ただし、実際の被害と混同されないよう、体験であることが一目で分かる形にする。
 */
/**
 * 共有するURL。
 *
 * 素のURLをそのまま渡すと、LINEでは過去に誰かが貼ったときのカードが出る。
 * LINEはページURL単位でOGPを丸ごとキャッシュするため、こちらが画像を
 * 差し替えても取りに来ない（実際にそうなった）。
 *
 * OG画像の中身から作った版番号を付けて、相手のキャッシュに無いURLにする。
 * 画像が変わらないかぎり値も変わらないので、URLが無駄に散らかることはない。
 */
export function shareUrl(origin: string): string {
  return `${origin.replace(/\/$/, '')}/?v=${__OGP_VERSION__}`;
}

export function buildShareText(diagnosis: Diagnosis, url: string): string {
  const lines: string[] = [];

  if (diagnosis.totalDamage > 0) {
    lines.push(
      `「だまされる博物館」で${manYen(diagnosis.totalDamage)}、まんまと持っていかれました。`,
    );
  } else {
    lines.push('「だまされる博物館」を、一円も渡さずに通り抜けました。');
  }

  if (diagnosis.primary) {
    lines.push(`私の騙されツボは〈${AXES[diagnosis.primary].type}〉でした。`);
  }

  lines.push('');
  lines.push('あの罠、たぶんあなたも見抜けません。');
  lines.push('（お金は一円も減らない、体験型の防犯展示です）');
  lines.push('');
  lines.push(url);

  return lines.join('\n');
}
