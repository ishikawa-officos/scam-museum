import { useState } from 'react';
import { ImageOff } from 'lucide-react';

type Props = {
  src?: string;
  alt: string;
  className?: string;
  /** 画像が無いときに使う（ロゴ代わりの頭文字など） */
  fallback?: React.ReactNode;
};

/**
 * public/assets/... の画像を表示し、未配置ならプレースホルダーを出す。
 *
 * 生成画像の差し替えを後回しにしても画面が壊れないようにするための土台。
 * プレースホルダーには期待するファイル名を出すので、何を置けばいいか画面から分かる。
 */
export function AssetImage({ src, alt, className = '', fallback }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (fallback !== undefined) return <>{fallback}</>;
    const filename = src?.split('/').pop() ?? '未指定';
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1.5 bg-black/[0.06] px-3 py-6 text-center ${className}`}
        role="img"
        aria-label={`${alt}（画像は未配置です）`}
      >
        <ImageOff size={18} className="text-black/25" aria-hidden />
        <p className="text-[11px] leading-snug text-black/40">{alt}</p>
        <code className="rounded bg-black/[0.06] px-1.5 py-0.5 text-[10px] text-black/35">
          {filename}
        </code>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
