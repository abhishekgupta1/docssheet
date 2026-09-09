const fs = require('fs');
const path = require('path');

/**
 * Generates a branded 1200x630 Open Graph image per docs / cheat-sheet page
 * at build time (postBuild) and rewrites that page's og:image / twitter:image
 * to point at it. Pure build step — the PNGs ship as static files.
 *
 * Best-effort: any failure is logged and swallowed so it can never break a
 * deploy. Remove the plugin entry in docusaurus.config.js to disable.
 */

const BRAND = '#8000FF';
const BG = '#141414';
const FG = '#FFFFFF';
const MUTED = '#B9A7D9';

const CATEGORY = [
  [/^\/docs\/sdet-skills\//, 'SDET'],
  [/^\/docs\/sre-skills\//, 'SRE'],
  [/^\/docs\/sde-skills\//, 'SDE'],
  [/^\/docs\/mba-skills\//, 'Leadership'],
  [/^\/docs\/ai-skills\//, 'AI'],
  [/^\/docs\//, 'Docs'],
  [/^\/cheatsheets\//, 'Cheat sheet'],
];

const SKIP = [
  /\/tags(\/|$)/,
  /\/category\//,
];

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(text, max, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max && line) {
      lines.push(line.trim());
      line = w;
      if (lines.length === maxLines - 1) break;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  if (lines.length === maxLines) {
    const rest = words.slice(lines.join(' ').split(/\s+/).length).join(' ');
    if (rest) lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:]?$/, '') + '…';
  }
  return lines;
}

function svg(title, category, siteUrl) {
  const lines = wrap(title, 26, 3);
  const startY = 300 - (lines.length - 1) * 45;
  const tspans = lines
    .map((l, i) => `<tspan x="90" y="${startY + i * 90}">${esc(l)}</tspan>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="10" fill="${BRAND}"/>
  <rect x="90" y="70" width="70" height="70" rx="14" fill="${BRAND}"/>
  <text x="125" y="120" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="${FG}" text-anchor="middle">A</text>
  <text x="180" y="118" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="${FG}">Abhishek Gupta</text>
  <text x="90" y="200" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="3" fill="${BRAND}">${esc(category.toUpperCase())}</text>
  <text font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="800" fill="${FG}">${tspans}</text>
  <text x="90" y="560" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="${MUTED}">${esc(siteUrl.replace(/^https?:\/\//, ''))}</text>
</svg>`;
}

function categoryFor(route) {
  for (const [re, label] of CATEGORY) if (re.test(route)) return label;
  return 'Docs & Cheat Sheets';
}

function htmlPathFor(outDir, route) {
  const rel = route.replace(/^\//, '').replace(/\/$/, '');
  const a = path.join(outDir, rel + '.html');
  const b = path.join(outDir, rel, 'index.html');
  if (fs.existsSync(a)) return a;
  if (fs.existsSync(b)) return b;
  return null;
}

function titleFromHtml(html, siteTitle) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!m) return null;
  let t = m[1].trim();
  // strip " | Site" / " - Site" suffix
  t = t.replace(new RegExp(`\\s*[|\\-–]\\s*${siteTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`), '');
  return t || null;
}

function rewriteMeta(html, imageUrl, title) {
  let out = html;
  const setOrInject = (attr, val, content) => {
    const re = new RegExp(`(<meta[^>]*${attr}="${val}"[^>]*content=")[^"]*(")`, 'i');
    if (re.test(out)) {
      out = out.replace(re, `$1${content}$2`);
    } else {
      out = out.replace(
        /<\/head>/i,
        `<meta ${attr}="${val}" content="${content}"/></head>`,
      );
    }
  };
  setOrInject('property', 'og:image', imageUrl);
  setOrInject('name', 'twitter:image', imageUrl);
  setOrInject('property', 'og:image:width', '1200');
  setOrInject('property', 'og:image:height', '630');
  setOrInject('property', 'og:image:alt', esc(title));
  return out;
}

module.exports = function ogImagePlugin(context) {
  return {
    name: 'og-image',
    async postBuild({outDir, routesPaths, siteConfig}) {
      let Resvg;
      try {
        ({Resvg} = require('@resvg/resvg-js'));
      } catch (e) {
        console.warn('[og-image] @resvg/resvg-js not available — skipping OG image generation');
        return;
      }
      const siteUrl = (siteConfig.url || '').replace(/\/$/, '');
      const outImgDir = path.join(outDir, 'img', 'og');
      fs.mkdirSync(outImgDir, {recursive: true});

      const targets = (routesPaths || []).filter(
        (r) =>
          (r.startsWith('/docs/') || r.startsWith('/cheatsheets/')) &&
          !SKIP.some((re) => re.test(r)),
      );

      let made = 0;
      for (const route of targets) {
        try {
          const htmlPath = htmlPathFor(outDir, route);
          if (!htmlPath) continue;
          let html = fs.readFileSync(htmlPath, 'utf8');
          const title = titleFromHtml(html, siteConfig.title || '') || route;
          const slug = route.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
          const pngPath = path.join(outImgDir, `${slug}.png`);

          const png = new Resvg(svg(title, categoryFor(route), siteUrl), {
            font: {loadSystemFonts: true},
            background: BG,
          })
            .render()
            .asPng();
          fs.writeFileSync(pngPath, png);

          html = rewriteMeta(html, `${siteUrl}/img/og/${slug}.png`, title);
          fs.writeFileSync(htmlPath, html);
          made += 1;
        } catch (e) {
          console.warn(`[og-image] ${route}: ${e.message}`);
        }
      }
      console.log(`[og-image] generated ${made} OG image(s) in img/og/`);
    },
  };
};
