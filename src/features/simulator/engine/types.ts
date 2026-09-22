/**
 * シナリオの型定義（SPEC.md §4.2）
 */

/** 手口タグ。体験中は一切表示せず、解説リプレイですべて開示する。 */
export type TacticId =
  | 'AUTHORITY' // 権威
  | 'URGENCY' // 緊急性
  | 'LOVE_BOMBING' // 過剰な好意
  | 'SUNK_COST' // サンクコスト
  | 'ISOLATION' // 社会的隔離
  | 'SMALL_ASK' // 段階的要求
  | 'FAKE_PROOF' // 偽の実績・社会的証明
  | 'RECIPROCITY' // 互恵性
  | 'SCARCITY' // 希少性
  | 'INTERMITTENT' // 間欠強化
  | 'FAKE_DOMAIN' // ドメイン偽装
  | 'TIME_PRESSURE' // 制限時間
  | 'SELF_ESTEEM' // 自己重要感の付与
  | 'PITY' // 同情の誘発
  | 'INDIRECT_ASK' // 間接要求（言わせる）
  | 'GUILT' // 罪悪感の利用
  | 'SAVIOR' // 救済者役割の付与
  | 'FEAR' // 恐怖の利用
  | 'COACHED_LIE' // 窓口での嘘を指導する
  | 'KEEP_ON_LINE' // 電話を切らせない
  | 'SOCIAL_PROOF' // 数の演出（社会的証明）
  | 'FOMO' // 取り残される恐怖
  | 'SILENCING' // 異論の封殺
  | 'BORROWED_FAME' // 著名人の信用の借用
  | 'BACKSTAGE_PULL' // 個別トークへの裏誘導
  | 'PUBLIC_COMMITMENT'; // 公開の場での宣言

export type Surface = 'chat' | 'web' | 'call' | 'group';

/** 隠しステータス（SPEC.md §2.3） */
export type Stats = {
  trust: number; // 信頼度 0-100
  pressure: number; // 切迫感 0-100
  isolation: number; // 孤立度 0-100
  damage: number; // 被害額（円）純額。出金できた分はマイナスで相殺する
  days: number; // 経過日数
};

export type Media =
  /** src は public/assets/... のパス。未配置ならプレースホルダーが表示される */
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'linkCard'; title: string; domain: string; brand: string; caption?: string }
  /** src を指定すると生成画像を使い、無ければ内蔵SVGのチャートを描く */
  | { kind: 'chart'; label: string; caption?: string; trend?: 'up' | 'down'; src?: string }
  | { kind: 'receipt'; label: string; amount: number; sub?: string };

/**
 * グループチャットの発言者。
 * role は「劇団員の名簿」（リプレイ）でのみ開示する。体験中は名前と色しか出さない。
 */
export type Speaker = {
  id: string;
  name: string;
  color: string;
  /** サクラの役割。空なら先生・アシスタントなど役職者、または一般参加者 */
  role?: string;
};

export type Message = {
  /** グループでの発言者。scenario.speakers のキー */
  speakerId?: string;
  id: string;
  from: 'them' | 'me' | 'system';
  surface: Surface;
  body: string;
  media?: Media;
  /** 空配列 = この発言に手口は仕込まれていない */
  tactics: TacticId[];
  /** リプレイ時の解説。tactics が空でない場合は必須運用とする */
  note?: string;
};

export type ChoiceId = string;
export type BeatId = string;

export type Choice = {
  id: ChoiceId;
  label: string;
  /** 選択可能条件。満たさない場合はグレーアウト */
  requires?: Partial<Record<keyof Stats, { lt?: number; gte?: number }>>;
  /** グレーアウト時に表示する独白 */
  blockedMonologue?: string;
  effects?: Partial<Stats>;
  /**
   * 送金・入力など「一線を越える」操作かどうか。被害はここでしか確定しない（SPEC.md §2.2）。
   * 体験中はこれを一切UIに出さない。判定・リプレイでのみ開示する。
   */
  irreversible?: boolean;
  /** 選択後に自分の吹き出しとして表示される文面（省略時は label をそのまま表示） */
  sentAs?: string;
  /**
   * 解説リプレイで「選ばなかった場合どうなっていたか」を1行で示す。
   * pivotal なビートの選択肢にだけ付ける。
   */
  outcomeHint?: string;
  /**
   * この選択に対する相手の即時リアクション。
   * 次のビートに入る前に配信されるため、「プレイヤーが言っていないことに相手が答える」
   * という不整合を作らずに分岐を1本にまとめられる。
   */
  reaction?: Message[];
  next: BeatId | { ending: EndingId };
};

/** 偽サイト画面の定義（SPEC.md §3.2-2） */
export type WebRow = { label: string; value: string; tone?: 'good' | 'bad' | 'muted' };

export type WebView = {
  brand: string;
  /** URLバーに表示するドメイン。正規サイトに酷似した架空のもの */
  domain: string;
  heading: string;
  subheading?: string;
  balanceLabel?: string;
  balance?: number;
  delta?: { percent: number; amount: number };
  rows?: WebRow[];
  notice?: { text: string; tone: 'info' | 'warn' | 'good' };
  /** 他ユーザーの利益通知（偽の社会的証明）。順番に流れる */
  tickers?: string[];
  chart?: 'up' | 'spike' | 'flat';
  /** この画面に仕込まれている手口。リプレイで開示する */
  annotation?: { id: string; tactics: TacticId[]; note: string };
};

/** グループチャット画面の定義（第4展示室） */
export type GroupView = {
  name: string;
  /** 表示上の参加人数。実数はこの画面からは確認できない、というのが展示物 */
  memberCount: number;
  /** 上部に固定されるアナウンス */
  pinned?: string;
  /** 「N人が入力中…」 */
  typingCount?: number;
  /** この画面に仕込まれている手口。リプレイで開示する */
  annotation?: { id: string; tactics: TacticId[]; note: string };
};

/** 通話画面の定義（SPEC.md §3.2-3） */
export type CallView = {
  /** incoming = 着信中（応答／拒否の画面）、active = 通話中 */
  state: 'incoming' | 'active';
  /** 発信者表示。「非通知設定」や番号など */
  callerName: string;
  /** 相手が名乗っている肩書き。通話中画面に小さく出す */
  callerClaim?: string;
  /** 通話開始からの経過秒。通話が長引いている圧を出す */
  elapsedSeconds?: number;
  /** この画面に仕込まれている手口。リプレイで開示する */
  annotation?: { id: string; tactics: TacticId[]; note: string };
};

export type Beat = {
  id: BeatId;
  /** 指定すると通話サーフェスを表示する */
  call?: CallView;
  /** 指定するとグループチャットサーフェスを表示する */
  group?: GroupView;
  /**
   * 選択を待っているあいだも流れ続ける発言（第4展示室）。
   * グループチャットは、こちらの返事を待ってくれない。その流速そのものが圧になる。
   * リストは一巡したら止まる（無限に流し続けない）。
   */
  ambient?: Message[];
  /**
   * 選択の制限時間（SPEC.md §2.5）。
   * 時間切れになると defaultChoiceId が自動で選ばれる＝「言われるまま」になる。
   */
  timeLimit?: { seconds: number; defaultChoiceId: ChoiceId };
  /** シナリオ内の日時表示（例: '10月3日（金） 21:14'） */
  timeLabel?: string;
  /** 解説リプレイで「⚡ ここが分かれ道でした」として強調するビート */
  pivotal?: { headline: string; body: string };
  /** 指定すると Web サーフェス（偽サイト）を全画面で表示する */
  web?: WebView;
  incoming: Message[];
  choices: Choice[];
};

export type EndingId = string;

export type Ending = {
  id: EndingId;
  grade: 'A_AVOIDED' | 'B_LUCKY' | 'C_MINOR' | 'D_MAJOR';
  title: string;
  body: string[];
};

export type Persona = {
  name: string;
  summary: string[];
  savings: number;
};

export type Contact = {
  displayName: string;
  avatarInitial: string;
  avatarColor: string;
  subtitle?: string;
  /** 生成画像を置いた場合のパス。未配置なら avatarInitial が表示される */
  avatarSrc?: string;
};

export type Scenario = {
  id: string;
  title: string;
  roomLabel: string;
  estimatedMinutes: number;
  persona: Persona;
  contact: Contact;
  /** グループチャットの発言者一覧 */
  speakers?: Record<string, Speaker>;
  initialStats: Stats;
  entryBeat: BeatId;
  beats: Beat[];
  endings: Ending[];
};

/**
 * 解説リプレイ用の記録（SPEC.md §3.4）
 *
 * 実際に通った経路だけを残す。メッセージは id のみを持ち、本文はシナリオ側から引く。
 */
export type ReplayItem =
  | { kind: 'time'; label: string }
  | { kind: 'them'; messageId: string }
  | { kind: 'web'; beatId: BeatId }
  | { kind: 'call'; beatId: BeatId }
  | { kind: 'group'; beatId: BeatId }
  | { kind: 'choice'; beatId: BeatId; choiceId: ChoiceId; sent: string };

/** シナリオ中の全メッセージ（相手のリアクションを含む）を id で引けるようにする */
export function indexMessages(scenario: Scenario): Map<string, Message> {
  const map = new Map<string, Message>();
  for (const beat of scenario.beats) {
    for (const m of beat.incoming) map.set(m.id, m);
    for (const m of beat.ambient ?? []) map.set(m.id, m);
    for (const c of beat.choices) {
      for (const m of c.reaction ?? []) map.set(m.id, m);
    }
  }
  return map;
}
