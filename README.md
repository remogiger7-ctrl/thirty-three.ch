# THIRTY THREE – Wohnung 201, Schönenstrasse 33, Rüschlikon

Website für die Erstvermietung der 3.5-Zimmer-Neubauwohnung (DE/EN/IT), statisch auf GitHub Pages unter thirty-three.ch.

- `src/Main.dc.html` – Quelle: Markup, CSS und alle Texte (DE/EN/IT in `texts()`); identisch mit dem Design-Entwurf in Claude
- `build.js` – baut daraus `site/` (`/`, `/en/`, `/it/`), inkl. Meta/OG/hreflang, JSON-LD, Formular (Web3Forms), Karte per Klick, Sitemap, robots, llms.txt. Schalter oben im Skript: `LIVE` (Indexierung), `STATUS` (verfügbar/vermietet), `WEB3FORMS_KEY`, `GA_ID`.
- `site/img/` – Bilder (JPG); WebP-Varianten entstehen beim Deploy (`optimize-images.js`)
- `.github/workflows/deploy.yml` – baut bei jedem Push, kopiert die Schriften (Cormorant Garamond, Inter) und veröffentlicht auf GitHub Pages

Lokal bauen: `node build.js`
