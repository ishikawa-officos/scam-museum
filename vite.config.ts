import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

/** 館内モードの公開ページ。体験中の画面（/play, /result, /replay）は状態に依存するので載せない */
const PUBLIC_ROUTES = ['/', '/rooms', '/codex', '/diagnosis', '/summary', '/about'];

/**
 * robots.txt と sitemap.xml をビルド時に生成する。
 *
 * public/ に静的ファイルとして置くと、公開ドメインを2か所に書くことになる。
 * SPA なので robots.txt が無いと index.html がフォールバックで返り、
 * クローラーは robots.txt としてHTMLを読むことになる（Lighthouseが検出する）。
 */
function seoFiles(origin: string): Plugin {
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
      });

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_ROUTES.map(
  (r) => `  <url>
    <loc>${origin}${r}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
).join('\n')}
</urlset>
`,
      });
    },
  };
}

/**
 * OG画像のURLに、中身のハッシュを付ける。
 *
 * SNSは og:image をURL単位でキャッシュする。ファイル名が ogp.png のままだと、
 * 中身を差し替えてもURLが変わらないので、古い画像が出続ける。
 * 実際に、デザインを刷新したあともLINEに旧デザインのカードが出た。
 *
 * 注意：これで直るのは「画像の」キャッシュ。
 * LINEはページURL単位でもOGPを丸ごとキャッシュするので、
 * すでに貼ったことのあるURLは、これだけでは更新されない。
 * その場合は ?v=2 のように、相手が見たことのないURLで貼り直す必要がある。
 */
function ogpVersion(): string {
  const file = path.join(process.cwd(), 'public', 'ogp.png');
  if (!existsSync(file)) return 'dev';
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 8);
}

function versionOgImage(version: string): Plugin {
  return {
    name: 'version-og-image',
    apply: 'build',
    transformIndexHtml(html) {
      return (
        html
          .replace(/(content="[^"]*\/ogp\.png)"/g, `$1?v=${version}"`)
          // og:url も版番号つきにする。
          // SNSは og:url を正規のアドレスとして扱い、そちらで照合する。
          // ここが素のURLのままだと、せっかく版番号つきで共有しても
          // 古いカードが残っている素のURLに読み替えられてしまう。
          //
          // rel="canonical" は検索エンジン向けなので、素のURLのままにする。
          // 同じページが2つのURLで索引されるのを避けるため。
          .replace(/(<meta property="og:url" content="[^"]*\/)"/, `$1?v=${version}"`)
      );
    },
  };
}

/**
 * 最初に目に入るフォントだけ preload する。
 *
 * フォントは Vite のアセットとして出力させている（＝ファイル名にハッシュが付く）。
 * ハッシュが無いと長期キャッシュを効かせられず、かといって名前固定で
 * immutable にすると、文字を足して作り直したときに古い実体が残り続けて
 * 豆腐になる。ハッシュ付きなら、その二律背反が消える。
 *
 * その代わり、index.html に preload の URL を直接書けない。ここで差し込む。
 */
function preloadFonts(): Plugin {
  const WANTED = [/noto-sans-jp-400.*\.woff2$/, /zen-kaku-900.*\.woff2$/];
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      const files = Object.keys(ctx.bundle ?? {}).filter((f) =>
        WANTED.some((re) => re.test(f)),
      );
      return {
        html,
        tags: files.map((f) => ({
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: `/${f}`,
            as: 'font',
            type: 'font/woff2',
            crossorigin: '',
          },
          injectTo: 'head' as const,
        })),
      };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const origin = (env.VITE_PUBLIC_ORIGIN ?? '').replace(/\/$/, '');
  const ogp = ogpVersion();

  return {
    // 共有するURLにも同じ版番号を付ける。
    // LINEはページURL単位でOGPをキャッシュするので、素のURLを共有すると
    // 過去に誰かが貼ったときの古いカードが出続ける。
    // OG画像の中身が変わったときだけ値が変わるので、無駄にURLは散らからない。
    define: { __OGP_VERSION__: JSON.stringify(ogp) },
    plugins: [react(), tailwindcss(), seoFiles(origin), preloadFonts(), versionOgImage(ogp)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { port: 5173, host: true },
  };
});
