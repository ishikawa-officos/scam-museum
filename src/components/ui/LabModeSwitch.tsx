import { FlaskConical } from 'lucide-react';
import { usePlayStore } from '@/store/usePlayStore';

/**
 * 「裏」を見る切り替え。
 *
 * PC ではカードにホバーすると裏の顔が覗くようにしてあるが、
 * タッチ端末にはホバーが無い。仕掛けが端末によって見られないのは、
 * 「誰でも同じものを見られる」という館の前提に反するので、
 * 明示的なスイッチを常に置いておく。
 *
 * aria-pressed を持つトグルボタンにしてあるので、
 * 読み上げでも「オン／オフ」として伝わる。
 */
export function LabModeSwitch() {
  const labMode = usePlayStore((s) => s.labMode);
  const toggle = usePlayStore((s) => s.toggleLabMode);
  const on = labMode === 'back';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={[
        'inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5',
        'text-[11.5px] font-bold transition',
        on
          ? 'border-hall-accent bg-hall-accent/15 text-hall-accent'
          : 'border-hall-line bg-hall-surface text-hall-muted hover:border-hall-accent/60 hover:text-hall-accent',
      ].join(' ')}
    >
      <FlaskConical size={13} aria-hidden />
      臨床モード
      <span
        aria-hidden
        className={[
          'relative h-3.5 w-7 rounded-full border transition',
          on ? 'border-hall-accent bg-hall-accent/40' : 'border-hall-line bg-hall-line/40',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-[1px] size-2.5 rounded-full transition-all',
            on ? 'left-[14px] bg-hall-accent' : 'left-[1px] bg-hall-muted',
          ].join(' ')}
        />
      </span>
    </button>
  );
}
