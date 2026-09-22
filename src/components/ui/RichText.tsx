import { Fragment, type ReactNode } from 'react';

/**
 * シナリオ本文の軽量な強調記法。
 *
 * 執筆側は `**ここ**` と書くだけで太字にできる。
 * Markdown を丸ごと入れると、シナリオに任意のHTMLが書けてしまい、
 * 表示崩れの温床になるので、対応するのは太字ひとつだけに絞る。
 */
export function RichText({ text }: { text: string }): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/gs);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-hall-text">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
