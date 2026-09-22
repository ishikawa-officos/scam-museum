import { NavLink } from 'react-router-dom';
import { BookMarked, LifeBuoy, Landmark, Sparkles } from 'lucide-react';

const ITEMS = [
  { to: '/rooms', label: '順路', icon: Landmark },
  { to: '/codex', label: '仕掛け図鑑', icon: BookMarked },
  { to: '/diagnosis', label: '騙されツボ', icon: Sparkles },
  { to: '/summary', label: '相談窓口', icon: LifeBuoy },
];

/** 館内共通ナビ。どの画面からでも図鑑と相談窓口に行けるようにする */
export function HallNav() {
  return (
    <nav
      aria-label="館内メニュー"
      className="mb-10 flex flex-wrap items-center gap-1.5 border-b-2 border-hall-line pb-3 text-[12.5px] font-bold"
    >
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 transition',
              isActive
                ? 'border-hall-accent bg-hall-accent text-hall-on-accent'
                : 'border-transparent text-hall-muted hover:border-hall-line hover:text-hall-text',
            ].join(' ')
          }
        >
          <Icon size={13} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
