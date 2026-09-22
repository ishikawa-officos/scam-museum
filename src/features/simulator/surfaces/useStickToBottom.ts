import { useCallback, useEffect, useRef } from 'react';

/**
 * チャットを最新のメッセージに追従させる。
 *
 * 新着のたびに末尾へスクロールするだけでは足りない。画像つきメッセージでは、
 * スクロールが走る時点で画像の高さがまだ 0 なので、読み込み完了後に増えた分だけ
 * 下に取り残される。相手が送ってきたチャート画像の下半分に到達できない、
 * という形で表面化する。
 *
 * そこで画像の load も拾って、もう一度末尾へ寄せる。
 *
 * このとき「末尾付近にいるときだけ追従する」という判定は使えない。
 * 取り残されている距離は、まさに読み込まれた画像の高さそのものなので、
 * 距離で測ると必ず「遠くにいる」と判定されてしまう。
 * かわりに、利用者が自分で上に戻したかどうかを直接記録する。
 * 読み返している最中に引き戻さないための区別であって、距離の問題ではない。
 */
const AT_BOTTOM_PX = 80;

export function useStickToBottom(deps: readonly unknown[]) {
  const endRef = useRef<HTMLDivElement>(null);
  /** 利用者が自分で上に戻している最中か */
  const readingBack = useRef(false);

  const scrollToEnd = useCallback((behavior: ScrollBehavior) => {
    endRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    readingBack.current = false;
    scrollToEnd('smooth');
    // 追従のきっかけは呼び出し側が決める（新着メッセージ・入力中表示など）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const container = endRef.current?.parentElement;
    if (!container) return;

    // 手で上に戻したときだけ追従を止める。プログラム側のスクロールと
    // 区別したいので、scroll ではなく入力イベントを見る
    const handleManualScroll = () => {
      const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
      readingBack.current = distance > AT_BOTTOM_PX;
    };

    // img の load はバブリングしないので、キャプチャ段階で拾う
    const handleLoad = () => {
      if (!readingBack.current) scrollToEnd('auto');
    };

    container.addEventListener('wheel', handleManualScroll, { passive: true });
    container.addEventListener('touchmove', handleManualScroll, { passive: true });
    container.addEventListener('load', handleLoad, true);
    return () => {
      container.removeEventListener('wheel', handleManualScroll);
      container.removeEventListener('touchmove', handleManualScroll);
      container.removeEventListener('load', handleLoad, true);
    };
  }, [scrollToEnd]);

  return endRef;
}
