import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const origin = (env.VITE_PUBLIC_ORIGIN ?? '').replace(/\/$/, '');

  return {
    plugins: [react(), tailwindcss(), seoFiles(origin)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { port: 5173, host: true },
  };
});
