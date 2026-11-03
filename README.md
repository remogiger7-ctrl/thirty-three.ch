# THIRTY THREE – Wohnung 201, Schönenstrasse 33, Rüschlikon

Website für die Erstvermietung der 3.5-Zimmer-Neubauwohnung (DE/EN). Aufbau nach Vorbild chesa-somplaz.ch.

- `src/` – Inhalte aus dem Design-Entwurf (`Main.dc.html` mit `texts()` je Sprache, Grundrisse)
- `build.js` – erzeugt die statischen Seiten in `site/`
- `site/` – fertige Website (`/`, `/en/`), Bilder in `site/img`, Sitemap
- `optimize-images.js` – erzeugt beim Deploy WebP-Varianten der Bilder
- `.github/workflows/deploy.yml` – baut die Seite bei jedem Push und veröffentlicht sie über GitHub Pages auf thirty-three.ch

Status: Platzhalterseite (noindex), bis der Entwurf freigegeben ist.

Lokal bauen: `node build.js`
