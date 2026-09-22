import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';

type Props = {
  /** 共有する文面。URLも含めた全文を渡す */
  text: string;
  /** 端末の共有シートが使えるときの表記。使えない端末では「コピー」に変わる */
  label: string;
  /** 目立たせるか。既定は控えめな枠線ボタン */
  tone?: 'accent' | 'quiet';
  className?: string;
};

/**
 * 共有ボタン。
 *
 * スマホは端末の共有シートを開く。PCのブラウザは大体 navigator.share を
 * 持っていないので、そのときはクリップボードに入れて「コピーしました」を出す。
 *
 * 診断画面と展示室で同じ挙動が要るので部品にした。
 * 二か所に書くと、どちらかだけ直して食い違う。
 */
export function ShareButton({ text, label, tone = 'quiet', className = '' }: Props) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const share = async () => {
    try {
      if (canShare) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // 共有シートを閉じた・権限が無い等。何も起こさないのが正しい
    }
  };

  const base =
    tone === 'accent'
      ? 'btn-pop bg-hall-accent px-6 py-3.5 font-display text-[14px] font-black text-hall-on-accent'
      : 'rounded-full border-2 border-hall-line px-5 py-3 text-[13.5px] font-bold text-hall-text transition hover:border-hall-accent';

  return (
    <button
      onClick={share}
      className={`inline-flex items-center justify-center gap-2 ${base} ${className}`}
    >
      {copied ? <Check size={15} /> : canShare ? <Share2 size={15} /> : <Copy size={15} />}
      {copied ? 'コピーしました' : canShare ? label : `${label}（コピー）`}
    </button>
  );
}
