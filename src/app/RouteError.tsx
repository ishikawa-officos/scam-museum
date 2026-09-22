import { useRouteError } from 'react-router-dom';
import { HallFooter, HallLayout } from '@/components/ui/HallLayout';
import { isStaleChunkError } from './staleChunk';

/**
 * 画面の読み込みに失敗したときに出す、館の顔をした案内。
 *
 * これが無いと React Router の開発者向け画面がそのまま出る。
 * 実際に来館者の端末に出てしまった：
 *
 *   Unexpected Application Error!
 *   Failed to fetch dynamically imported module: .../ResultPage-XXXX.js
 *   Hey developer ...
 *
 * 読み手が何をすればよいかが書かれておらず、開発者に話しかけている。
 * 来館者に見せてよい画面ではない。
 */
export function RouteError() {
  const error = useRouteError();
  const stale = isStaleChunkError(error);

  return (
    <HallLayout>
      <p className="text-[11px] tracking-[0.2em] text-hall-accent">TROUBLE</p>
      <h1 className="mt-2 font-display font-bold text-2xl leading-snug">
        {stale ? '館の内容が新しくなりました' : '画面を出せませんでした'}
      </h1>

      <p className="mt-5 text-[15px] leading-[1.9] text-hall-text/85">
        {stale
          ? '開いている間に展示を入れ替えたため、この画面を読み込めませんでした。読み込み直すと続きから見られます。進んだところは残っています。'
          : '通信が途切れたか、読み込みに失敗しました。もう一度お試しください。進んだところは残っています。'}
      </p>

      <button
        onClick={() => window.location.reload()}
        className="btn-pop mt-8 w-full bg-hall-accent py-4 font-display text-[16px] font-black text-hall-on-accent"
      >
        ［ 読み込み直す ］
      </button>

      <a
        href="/"
        className="mt-5 inline-block text-[13.5px] font-bold text-hall-muted underline underline-offset-4 hover:text-hall-text"
      >
        エントランスへ戻る
      </a>

      <HallFooter />
    </HallLayout>
  );
}
