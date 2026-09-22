import { useEffect, useRef } from 'react';

/**
 * モーダルにフォーカスを閉じ込める。
 *
 * `role="dialog"` と `aria-modal` を書いただけでは、キーボード操作は成立しない。
 * 開いてもフォーカスは背後に残ったままなので、利用者はモーダルが開いたことに
 * 気づけず、Tab を押すと背後のページを移動していく。
 * axe のような静的検査はDOMの属性しか見ないため、ここは検出されない。
 *
 * やること：
 *  - 開いたらパネル自身にフォーカスを移す（dialog の aria-label が読み上げられる）
 *  - Tab / Shift+Tab を端で折り返し、外に出さない
 *  - 閉じたら、開く前にフォーカスしていた要素へ戻す
 *
 * @param active 開いているか
 * @param resetKey 中身が差し替わったとき（関連カードへの移動など）に渡す識別子
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement>(active: boolean, resetKey?: string | null) {
  const panelRef = useRef<T>(null);

  // フォーカスの退避と復帰、および Tab の折り返し
  useEffect(() => {
    if (!active) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previous = document.activeElement as HTMLElement | null;

    const focusables = () =>
      [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement;
      const outside = !panel.contains(current);

      if (e.shiftKey && (current === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      // 開く前の位置に戻す。戻さないと、閉じた瞬間にフォーカスが
      // 先頭まで飛び、どこを読んでいたのか分からなくなる
      previous?.focus?.();
    };
  }, [active]);

  // 開いた直後と、中身が差し替わったときにパネルへフォーカスを移す
  useEffect(() => {
    if (!active) return;
    panelRef.current?.focus();
  }, [active, resetKey]);

  return panelRef;
}
