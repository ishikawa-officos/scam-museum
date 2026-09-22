/**
 * 公開し直した直後の「古いファイルをつかんだまま」からの復帰。
 *
 * 画面ごとにJSを分けているので、ファイル名にはハッシュが入る。公開し直すと
 * 名前が全部変わり、そのとき開きっぱなしだったページは古い名前を握ったままになる。
 * 次の画面へ進もうとした瞬間に、もう存在しないファイルを取りに行って失敗する。
 *
 *   Failed to fetch dynamically imported module: .../assets/ResultPage-XXXX.js
 *
 * 実際に、体験の最後（判定画面へ移るところ）でこれが起きた。
 * しかも SPA フォールバックが効いて 404 ではなく index.html が 200 で返るため、
 * ブラウザは HTML を JS として読もうとし、何が起きたのか分かりにくい失敗になる。
 *
 * 直し方は単純で、一度読み込み直せば新しい版になる。
 * 進行状況は localStorage に入っているので、戻ってきた先で続きが読める。
 */

const KEY = 'scam-museum/reloaded-at';
/** 読み込み直してもまた失敗するとき、無限に繰り返さないための間隔 */
const COOLDOWN_MS = 10_000;

function readLast(): number {
  try {
    return Number(sessionStorage.getItem(KEY) ?? 0);
  } catch {
    // プライベートモードなどで読めないことがある。その場合は「まだ」とみなす
    return 0;
  }
}

/** 読み込みに失敗したのが「古いファイル名」のせいか */
export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

/**
 * 画面の読み込みに失敗したときの受け皿。
 *
 * 一度だけ読み込み直す。読み込み直しても駄目なときは、
 * ネットワーク側の問題なので、そのまま投げてエラー画面に任せる。
 */
export function recoverFromStaleChunk(error: unknown): Promise<never> {
  if (!isStaleChunkError(error)) throw error;

  const now = Date.now();
  if (now - readLast() < COOLDOWN_MS) throw error;

  try {
    sessionStorage.setItem(KEY, String(now));
  } catch {
    // 印が残せなくても、読み込み直す価値のほうが大きい
  }
  window.location.reload();

  // reload は即座には画面を差し替えないので、解決しない約束を返して
  // 読み込み中の表示のままにしておく（一瞬エラーを見せない）
  return new Promise<never>(() => {});
}
