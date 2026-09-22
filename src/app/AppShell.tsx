import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ROOMS } from '@/content/scenarios';

const SITE = 'だまされる博物館';

const STATIC_TITLES: Record<string, string> = {
  '/': 'ようこそ、安心して騙される場所へ',
  '/rooms': '順路',
  '/codex': '仕掛け図鑑',
  '/summary': '相談窓口と現実のチェックリスト',
  '/about': 'この館について',
  '/diagnosis': '騙されツボ診断',
};

/** 展示室に入る画面は、どの部屋のどの段階かまで名前に出す */
const ROOM_STAGES: Record<string, (room: string) => string> = {
  briefing: (room) => `${room}｜入室前の説明`,
  play: (room) => room,
  result: (room) => `${room}｜判定`,
  replay: (room) => `${room}｜舞台裏の種明かし`,
};

function pageName(pathname: string): string {
  const staticName = STATIC_TITLES[pathname];
  if (staticName) return staticName;

  const [, stage, scenarioId] = pathname.split('/');
  const make = ROOM_STAGES[stage];
  if (make && scenarioId) {
    const room = ROOMS.find((r) => r.scenarioId === scenarioId);
    if (room) return make(`${room.roomLabel}「${room.title}」`);
  }
  return SITE;
}

/**
 * 画面遷移を、見えない人にも伝える。
 *
 * SPA は画面が変わってもページの再読み込みが起きないので、
 * スクリーンリーダーは何も言わない。利用者は、押したあと何が起きたのか
 * 分からないまま置き去りになる。
 *
 * やっていることは2つ。
 *  - document.title を変える（ブラウザのタブ名、履歴、共有時の名前にも効く）
 *  - 遷移先の名前を、読み上げ専用の領域に流す
 *
 * 遷移直後ではなく1フレーム置いてから書き込む。
 * 同じタイミングで大量のDOMが差し替わると、読み上げが拾い損ねるため。
 */
export function AppShell() {
  const { pathname } = useLocation();
  const [announcement, setAnnouncement] = useState('');
  // 「何回目の実行か」ではなく「どこから来たか」で判定する。
  // 回数で見ると、開発時の StrictMode による effect の再実行で
  // 最初の画面を遷移として読み上げてしまう
  const announcedPath = useRef(pathname);

  useEffect(() => {
    const name = pageName(pathname);
    document.title = name === SITE ? SITE : `${SITE} — ${name}`;

    // 最初の表示は「遷移」ではないので読み上げない
    if (announcedPath.current === pathname) return;
    announcedPath.current = pathname;
    const id = window.setTimeout(() => setAnnouncement(name), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        本文へスキップ
      </a>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <Outlet />
    </>
  );
}
