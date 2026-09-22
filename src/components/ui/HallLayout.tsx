import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { LabModeSwitch } from './LabModeSwitch';

/** 館内モードの共通レイアウト（SPEC.md §3.5） */
export function HallLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lab-grid relative min-h-[100dvh] text-hall-text">
      {/* 上端の警告テープ。清潔な研究所に一本だけ走る、立入禁止の帯 */}
      <div aria-hidden className="lab-tape pointer-events-none fixed inset-x-0 top-0 z-10 h-2.5" />

      {/* 右上に常駐する「裏」への切り替え。
          ホバーの無い端末でも二面性に触れられるようにするため */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-end p-3">
        <div className="pointer-events-auto">
          <LabModeSwitch />
        </div>
      </div>
      {/* スキップリンクの着地点であり、支援技術が本文へ一発で飛ぶための目印 */}
      <main id="main" className="relative mx-auto w-full max-w-2xl px-6 pb-14 pt-16 sm:pb-20 sm:pt-20">
        {children}
      </main>
    </div>
  );
}

export function HallFooter() {
  return (
    <footer className="mt-16 border-t-2 border-hall-line pt-5 text-[11px] leading-relaxed text-hall-muted/80">
      <p>
        本サイトは詐欺被害の防止を目的とした教育用の展示です。登場する人物・団体・企業・サービス・URLは
        <strong className="text-hall-muted">すべて架空</strong>であり、実在のものとは関係ありません。
      </p>
      <p className="mt-1.5">
        実際に被害にあった・あいそうな場合は、消費者ホットライン
        <strong className="text-hall-muted"> 188</strong> ／ 警察相談専用電話
        <strong className="text-hall-muted"> #9110</strong> へご相談ください。
      </p>
      <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/about" className="font-bold underline-offset-4 hover:text-hall-text hover:underline">
          この館について（制作意図・免責・出典）
        </Link>
        <Link to="/summary" className="font-bold underline-offset-4 hover:text-hall-text hover:underline">
          相談窓口
        </Link>
        <Link to="/codex" className="font-bold underline-offset-4 hover:text-hall-text hover:underline">
          仕掛け図鑑
        </Link>
      </nav>
    </footer>
  );
}
