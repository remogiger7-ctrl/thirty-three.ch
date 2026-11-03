// Build script: generates the static website (site/) from the design source (src/).
// Run: node build.js
//
// Phase 1 (now): src/Main.dc.html does not exist yet -> a minimal placeholder page is built,
// so that GitHub Pages, the domain and HTTPS can be set up and verified.
// Phase 2: once the design draft (Main.dc.html with texts() per language) exists, this file
// reads it the same way as the chesa-somplaz.ch build does and renders the full page.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'site');
const DOMAIN = 'https://thirty-three.ch';
const HOST = 'thirty-three.ch';
const INDEXNOW_KEY = '92455364d20c20e6f61716b20a9827ec';

const LANGS = {
  de: { dir: '', html: 'de-CH', title: 'THIRTY THREE – 3.5-Zimmer-Wohnung in Rüschlikon, Erstbezug 2027' },
  en: { dir: 'en/', html: 'en', title: 'THIRTY THREE – 3.5-room apartment in Rüschlikon, first occupancy 2027' },
};
const HREFLANGS = [['de', ''], ['en', 'en/']];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PLACEHOLDER = {
  de: {
    kicker: 'Schönenstrasse 33 · 8803 Rüschlikon',
    h1: 'THIRTY THREE',
    lead: '3.5-Zimmer-Neubauwohnung mit Balkon und Lift direkt in die Wohnung. Erstbezug ab Januar 2027.',
    note: 'Die Website ist im Aufbau. Weitere Informationen folgen in Kürze.',
    lang: 'English',
  },
  en: {
    kicker: 'Schönenstrasse 33 · 8803 Rüschlikon, Switzerland',
    h1: 'THIRTY THREE',
    lead: 'New 3.5-room apartment with balcony and a lift opening directly into the apartment. First occupancy from January 2027.',
    note: 'This website is under construction. More information will follow shortly.',
    lang: 'Deutsch',
  },
};

const CSS = `
@font-face{font-family:Manrope;font-style:normal;font-weight:400 800;font-display:swap;src:url(/fonts/manrope-latin-wght-normal.woff2) format("woff2-variations");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:Manrope;font-style:normal;font-weight:400 800;font-display:swap;src:url(/fonts/manrope-latin-ext-wght-normal.woff2) format("woff2-variations");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%}
body{font-family:Manrope,system-ui,sans-serif;background:#FBF9F4;color:#1b1f1e;-webkit-font-smoothing:antialiased;display:flex;flex-direction:column;min-height:100vh}
main{flex:1;display:flex;align-items:center;justify-content:center;padding:48px 24px}
.card{max-width:640px;width:100%;background:#fff;border:1px solid #e3e7e4;border-radius:20px;padding:40px 32px}
.kicker{font-size:14px;font-weight:600;color:#1e4a5f;letter-spacing:.04em;text-transform:uppercase;margin:0 0 12px}
h1{font-size:40px;line-height:1.1;margin:0 0 16px;letter-spacing:.06em}
.lead{font-size:18px;line-height:1.5;margin:0 0 20px}
.note{font-size:15px;color:#5a6361;margin:0}
footer{padding:20px 24px;text-align:center;font-size:14px;color:#5a6361}
footer a{color:#1e4a5f;font-weight:600;text-decoration:none;padding:10px 12px;display:inline-block;min-height:44px;line-height:24px}
@media(max-width:480px){h1{font-size:32px}.card{padding:28px 20px}}
`;

function page(lang) {
  const v = LANGS[lang];
  const t = PLACEHOLDER[lang];
  const other = lang === 'de' ? 'en' : 'de';
  const url = DOMAIN + '/' + v.dir;
  return `<!doctype html>
<html lang="${v.html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(v.title)}</title>
<meta name="description" content="${esc(t.lead)}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${url}">
${HREFLANGS.map(([h, d]) => `<link rel="alternate" hreflang="${h}" href="${DOMAIN}/${d}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${DOMAIN}/">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${CSS}</style>
</head>
<body>
<main>
<div class="card">
<p class="kicker">${esc(t.kicker)}</p>
<h1>${esc(t.h1)}</h1>
<p class="lead">${esc(t.lead)}</p>
<p class="note">${esc(t.note)}</p>
</div>
</main>
<footer><a href="/${LANGS[other].dir}" hreflang="${other}">${esc(t.lang)}</a></footer>
</body>
</html>
`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const [lang, v] of Object.entries(LANGS)) {
  const dir = path.join(OUT, v.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(lang));
}
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${Object.values(LANGS).map((v) => `<url><loc>${DOMAIN}/${v.dir}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>${HREFLANGS.map(([h, d]) => `<xhtml:link rel="alternate" hreflang="${h}" href="${DOMAIN}/${d}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/"/></url>`).join('\n')}
</urlset>
`);
// Placeholder phase: keep search engines out until the real content is live.
fs.writeFileSync(path.join(OUT, 'robots.txt'), ['User-agent: *', 'Disallow: /', ''].join('\n'));
fs.writeFileSync(path.join(OUT, 'CNAME'), HOST + '\n');
fs.writeFileSync(path.join(OUT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
fs.writeFileSync(path.join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1e4a5f"/><text x="32" y="42" text-anchor="middle" font-family="Manrope,system-ui,sans-serif" font-size="26" font-weight="800" fill="#ffffff">33</text></svg>`);
fs.writeFileSync(path.join(OUT, '404.html'), `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/"><title>THIRTY THREE</title></head><body><a href="/">${HOST}</a></body></html>`);
console.log('built:', Object.values(LANGS).map((v) => v.dir + 'index.html').join(', '));
