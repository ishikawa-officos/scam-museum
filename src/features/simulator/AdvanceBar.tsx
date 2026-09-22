import { ChevronDown } from 'lucide-react';

type Props = {
  /** 押すと待ちを飛ばして次の1通が出る */
  onAdvance: () => void;
  /** 一度も押されていない間だけ、押せることを知らせる */
  showHint: boolean;
};

/**
 * 送りのバー（相手の発言を待っている間だけ出る）
 *
 * 読む速さは人によって何倍も違う。これまでは全行がタイマー任せで、
 * 読み終えた人にも進む手段が無く、ただ待つしかなかった。
 *
 * 置き場所は選択肢とまったく同じ位置。親指の届く場所が一つに定まり、
 * 「ここを押していれば進む」とだけ覚えればよくなる。
 *
 * 止めるのではなく飛ばすだけなので、押さなければ従来どおり勝手に進む。
 * 急かされる感覚（第3展示室の展示物）は残したままにできる。
 */
export function AdvanceBar({ onAdvance, showHint }: Props) {
  return (
    // フェードインは付けない。出ている途中の半透明な状態は、
    // 背景と混ざって一瞬だけ読めない色になる（実測 1.16:1）。
    // 出るか出ないかだけの部品に、読めない時間を作る理由がない
    <div className="shrink-0 border-t border-black/10 bg-white px-3 pb-3 pt-2.5">
      <button
        onClick={onAdvance}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-black/15 bg-black/[0.02] py-3 text-[13px] font-bold text-black/60 transition hover:border-black/30 hover:text-black/80 active:scale-[0.99]"
      >
        {showHint ? '読み終えたら、ここで次へ' : '次へ'}
        <ChevronDown size={15} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
