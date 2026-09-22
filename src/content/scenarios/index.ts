import type { Scenario } from '@/features/simulator/engine/types';

/**
 * シナリオは展示室ごとに動的インポートする（SPEC.md フェーズ4）。
 *
 * 1シナリオで数万文字あるため、静的にインポートすると全展示室のテキストが
 * 初期バンドルに乗る。実際に入室した展示室のぶんだけ読み込む。
 */
export const SCENARIO_LOADERS: Record<string, () => Promise<Scenario>> = {
  'romance-investment': () =>
    import('./romance-investment').then((m) => m.romanceInvestment),
  itadaki: () => import('./itadaki').then((m) => m.itadaki),
  'police-freeze': () => import('./police-freeze').then((m) => m.policeFreeze),
  'group-investment': () =>
    import('./group-investment').then((m) => m.groupInvestment),
};

export function hasScenario(id: string): boolean {
  return id in SCENARIO_LOADERS;
}

export function loadScenario(id: string): Promise<Scenario> | undefined {
  return SCENARIO_LOADERS[id]?.();
}

/**
 * 展示室カタログ。
 * 一覧画面でシナリオ本体を読み込まずに済むよう、表示に要る情報はここに持つ。
 */
export type RoomEntry = {
  scenarioId: string | null;
  roomLabel: string;
  title: string;
  subject: string;
  minutes: number;
  /** 結末の総数。クリア状況の分母に使う（シナリオ側と一致させること） */
  endingCount: number;
  /**
   * その部屋で突かれる認知の欠陥を、臨床の言葉で言い直したもの。
   * 館の裏の顔（臨床モード／PCのホバー）で表に出る。
   * 個人を評する言葉にしないこと。主語は常に「脳」であって「あなた」ではない。
   */
  bias: string;
  status: 'ready' | 'coming-soon';
};

export const ROOMS: RoomEntry[] = [
  {
    scenarioId: 'romance-investment',
    roomLabel: '第1展示室',
    title: '海の向こうの恋人',
    subject: '国際ロマンス詐欺 ＋ 偽投資サイト誘導',
    minutes: 8,
    endingCount: 6,
    bias: '好意を向けられた脳は、相手の要求を検証する回路を切る',
    status: 'ready',
  },
  {
    scenarioId: 'itadaki',
    roomLabel: '第2展示室',
    title: '支えたい、という気持ち',
    subject: '同情と恋愛感情の搾取',
    minutes: 8,
    endingCount: 5,
    bias: '一度払った脳は、払った事実のほうを正当化しはじめる',
    status: 'ready',
  },
  {
    scenarioId: 'police-freeze',
    roomLabel: '第3展示室',
    title: 'あなたの口座が危ない',
    subject: '公的機関をかたる資産保全・口座凍結詐欺',
    minutes: 6,
    endingCount: 7,
    bias: '急かされた脳は比較をやめる。権威の声だと、確認もやめる',
    status: 'ready',
  },
  {
    scenarioId: 'group-investment',
    roomLabel: '第4展示室',
    title: 'みんな、儲かっている',
    subject: 'グループチャット型の投資詐欺（サクラ劇団型）',
    minutes: 9,
    endingCount: 8,
    bias: '大勢が同じ方向を向くと、脳は自分の違和感のほうを疑う',
    status: 'ready',
  },
];
