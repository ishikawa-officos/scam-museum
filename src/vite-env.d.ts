/// <reference types="vite/client" />

/**
 * OG画像の中身から作られる版番号。vite.config.ts の define が埋め込む。
 * 共有URLに付けて、SNS側のキャッシュを確実に新しくするために使う。
 */
declare const __OGP_VERSION__: string;
