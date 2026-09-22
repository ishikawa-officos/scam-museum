import { usePlayStore } from '@/store/usePlayStore';
import { AssetImage } from './AssetImage';

/**
 * 案内役の Dr.バグ。
 *
 * 顔の左半分は白衣の医師、右半分はマッドサイエンティスト。
 * 各展示室の詐欺師が全員そうであるように、この館自身も二面性を持つ、
 * という宣言としてエントランスに立たせている。
 *
 * 台詞は表と裏で入れ替わるが、**裏の毒は被害者に向けない**。
 * この展示の主張は「騙される人が愚かなのではない」（SPEC.md §2.4）で、
 * Dr.バグが被験者を見下すと、サイトが自分の主張を裏切ることになる。
 * 裏の声が面白がっているのは、人間という種に共通する認知の欠陥のほう。
 */
type Props = {
  /** 表の顔の台詞 */
  front: string;
  /** 裏の顔の台詞。標本を眺める目線で書く */
  back: string;
  size?: 'lg' | 'sm';
};

export function DrBug({ front, back, size = 'lg' }: Props) {
  const labMode = usePlayStore((s) => s.labMode);
  const line = labMode === 'back' ? back : front;
  const big = size === 'lg';

  return (
    <div className={big ? 'flex flex-col items-center' : 'flex items-start gap-3'}>
      <AssetImage
        src="/assets/common/dr-bug.webp"
        alt="Dr.バグ。白衣を着た医師の顔の右半分が、別の誰かの顔になっている"
        className={big ? 'w-[188px] sm:w-[224px]' : 'w-14 shrink-0'}
      />
      <p
        className={[
          'rounded-2xl border-2 border-hall-line bg-hall-surface px-4 py-3',
          'text-hall-text',
          big ? 'mt-1 max-w-md text-center text-[14px] leading-[1.9]' : 'text-[13px] leading-relaxed',
        ].join(' ')}
      >
        {line}
      </p>
    </div>
  );
}
