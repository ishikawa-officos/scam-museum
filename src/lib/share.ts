import type { RoomEntry } from '@/content/scenarios';

/**
 * 共有するURLに、OG画像の版番号を付ける。
 *
 * 素のURLをそのまま渡すと、LINEでは過去に誰かが貼ったときのカードが出る。
 * LINEはページURL単位でOGPを丸ごとキャッシュするため、こちらが画像を
 * 差し替えても取りに来ない（実際にそうなった）。
 *
 * 版番号はOG画像の中身から作っているので、画像が変わらないかぎり値も変わらない。
 * URLが無駄に散らかることはない。
 */
export function withOgpVersion(url: string): string {
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}v=${__OGP_VERSION__}`;
}

/**
 * 展示室ひとつを指すURL。
 *
 * 行き先は体験本編（/play）ではなく入室前の説明（/briefing）。
 * いきなり会話の途中に落とすと、自分が誰で、いくら持っている設定なのかが
 * 分からないまま始まってしまう。
 */
export function roomUrl(origin: string, scenarioId: string): string {
  return withOgpVersion(`${origin.replace(/\/$/, '')}/briefing/${scenarioId}`);
}

function manYen(yen: number): string {
  if (yen >= 10_000) return `${Math.round(yen / 10_000).toLocaleString('ja-JP')}万円`;
  return `${yen.toLocaleString('ja-JP')}円`;
}

/**
 * 展示室ひとつを誰かに渡すための文面。
 *
 * 「親に偽警察の部屋をやらせたい」という渡し方に、これまで手段が無かった。
 * 部屋ごとのURLは前からあったが、画面のどこにも出ていなかったので、
 * 誰も気づけない状態だった。
 *
 * damage を渡すと、自分の結果を添えた挑戦状になる。
 * 説得より、自分が転んだ話をするほうが届く。
 *
 * 【制約 / SPEC.md §2.4b】文面には必ず「お金は一円も減らない体験型の展示」と
 * 明記する。展示の金額が実際の被害と取り違えられないようにするため。
 */
export function buildRoomShareText(
  room: RoomEntry,
  url: string,
  damage?: number,
): string {
  const lines: string[] = [`「だまされる博物館」${room.roomLabel}「${room.title}」`];

  if (damage !== undefined && damage > 0) {
    lines.push(`私はここで${manYen(damage)}、まんまと持っていかれました。`);
  } else if (damage !== undefined && damage < 0) {
    lines.push(`私はここで${manYen(-damage)}の黒字で逃げ切りました。……が、それも罠でした。`);
  } else {
    lines.push(`${room.subject}を、${room.minutes}分で体験できます。`);
  }

  lines.push('');
  lines.push('たぶん、あなたも見抜けません。');
  lines.push('（お金は一円も減らない、体験型の防犯展示です）');
  lines.push('');
  lines.push(url);

  return lines.join('\n');
}
