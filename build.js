// Build script: generates the static website (site/) from the design source (src/Main.dc.html).
// Run: node build.js
//
// The design source is a Design Component file: markup with <sc-for> loops and {{holes}},
// CSS in <helmet><style>, and all texts (DE/EN/IT) in texts() inside the script block.
// This build expands the markup once per language into a plain HTML page and adds
// everything a static site needs: meta/OG/hreflang, JSON-LD, fonts, WebP images,
// language links, the enquiry form (Web3Forms), the consent-gated Google map,
// sitemap, robots, llms.txt, CNAME and favicons.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'site');
const DOMAIN = 'https://thirty-three.ch';
const HOST = 'thirty-three.ch';
const INDEXNOW_KEY = '92455364d20c20e6f61716b20a9827ec';

// Switches — set LIVE to true once the content is approved (lifts noindex and opens robots.txt).
const LIVE = false;
const STATUS = 'available'; // 'available' | 'rented'
const WEB3FORMS_KEY = ''; // from web3forms.com; empty = the form falls back to a prepared e-mail
const GA_ID = ''; // Google Analytics 4 measurement id; empty = no analytics, no cookie banner
const MAIL = 'leonardo.fasciati@hotmail.com';
const LASTMOD = '2026-11-04';

// ---------- 1. Source ----------
const main = fs.readFileSync(path.join(SRC, 'Main.dc.html'), 'utf8');
const scriptSrc = main.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
class DCLogic { constructor(p) { this.props = p || {}; } setState() {} }
const Component = new Function('DCLogic', scriptSrc + '\nreturn Component;')(DCLogic);
const TEXTS = new Component({}).texts();
let css = main.match(/<helmet>[\s\S]*?<style>([\s\S]*?)<\/style>/)[1];
let markup = main.slice(main.indexOf('</helmet>') + '</helmet>'.length, main.indexOf('</x-dc>'));

// Images: design-editor blobs -> site files (SEO names)
const IMG = {
  '/_blob/5fa2dc49f45751a1fb6ee638df78e13a': 'thirty-three-rueschlikon-haus',
  '/_blob/c2504cc65731c2a4e4e25c9343429c83': 'thirty-three-rueschlikon-wohnbereich-balkon',
  '/_blob/58f211a293dc771acb78a688d55c5e18': 'thirty-three-rueschlikon-kueche-eggersmann',
};

const LANGS = {
  de: { dir: '', hreflang: 'de', extra: ['de-CH'], ogLocale: 'de_CH' },
  en: { dir: 'en/', hreflang: 'en', extra: ['en-GB'], ogLocale: 'en_GB' },
  it: { dir: 'it/', hreflang: 'it', extra: ['it-CH'], ogLocale: 'it_CH' },
};
const HREFLANGS = Object.values(LANGS).flatMap((v) => [v.hreflang, ...v.extra].map((h) => [h, v.dir]));

const META = {
  de: {
    title: '3.5-Zimmer-Wohnung mieten in Rüschlikon – THIRTY THREE',
    desc: "3.5-Zimmer-Neubauwohnung mit gedecktem Balkon, Lift in die Wohnung und Garagenplatz. Schönenstrasse 33, Rüschlikon. Erstbezug ab 15.1.2027, CHF 4'980 pro Monat.",
    ogTitle: '3.5-Zimmer-Wohnung in Rüschlikon, Erstbezug 2027 – THIRTY THREE',
    ogDesc: "100 m², gedeckter Balkon, Lift direkt in die Wohnung, Garagenplatz. CHF 4'980 pro Monat. Schönenstrasse 33, Rüschlikon.",
    ogAlt: 'Visualisierung des Neubaus THIRTY THREE, Schönenstrasse 33, Rüschlikon',
    mapTitle: 'Google Maps – Schönenstrasse 33, Rüschlikon', mapNote: 'Beim Laden werden Daten an Google übermittelt.',
    formSending: 'Wird gesendet …', formDone: 'Vielen Dank – Ihre Anmeldung ist eingegangen. Sie erhalten eine persönliche Antwort.', formError: 'Das Senden hat nicht geklappt. Ihr E-Mail-Programm öffnet sich mit der Nachricht.', formNeed: 'Bitte Name und eine gültige E-Mail-Adresse angeben.',
    consentText: 'Wir verwenden Google Analytics, um die Nutzung dieser Website zu verstehen. Dafür brauchen wir Ihre Einwilligung.', consentMore: 'Datenschutz', consentAccept: 'Einverstanden', consentDecline: 'Ablehnen', consentSettings: 'Cookie-Einstellungen',
    rented: 'Die Wohnung ist vermietet.',
  },
  en: {
    title: 'Apartment for rent in Rüschlikon: 3.5 rooms – THIRTY THREE',
    desc: "New-build 3.5-room apartment with covered balcony, lift into the apartment and garage space. Schönenstrasse 33, Rüschlikon near Zurich. From 15 Jan 2027, CHF 4'980.",
    ogTitle: '3.5-room apartment in Rüschlikon, available 2027 – THIRTY THREE',
    ogDesc: "100 m², covered balcony, lift directly into the apartment, garage space. CHF 4'980 per month. Schönenstrasse 33, Rüschlikon.",
    ogAlt: 'Rendering of the new THIRTY THREE building, Schönenstrasse 33, Rüschlikon',
    mapTitle: 'Google Maps – Schönenstrasse 33, Rüschlikon', mapNote: 'Loading the map sends data to Google.',
    formSending: 'Sending …', formDone: 'Thank you – your enquiry has been received. You will get a personal reply.', formError: 'Sending did not work. Your e-mail program opens with the message.', formNeed: 'Please enter your name and a valid e-mail address.',
    consentText: 'We use Google Analytics to understand how this website is used. This requires your consent.', consentMore: 'Privacy', consentAccept: 'Accept', consentDecline: 'Decline', consentSettings: 'Cookie settings',
    rented: 'The apartment has been let.',
  },
  it: {
    title: 'Affitto Rüschlikon: 3,5 locali, nuovo – THIRTY THREE',
    desc: "Nuova costruzione, 3,5 locali, 100 m², balcone coperto, ascensore nell'appartamento, posto auto. Rüschlikon, vicino a Zurigo. Dal 15.1.2027, CHF 4'980 al mese.",
    ogTitle: '3,5 locali a Rüschlikon, disponibile dal 2027 – THIRTY THREE',
    ogDesc: "100 m², balcone coperto, ascensore direttamente nell'appartamento, posto auto. CHF 4'980 al mese. Schönenstrasse 33, Rüschlikon.",
    ogAlt: 'Rendering della nuova costruzione THIRTY THREE, Schönenstrasse 33, Rüschlikon',
    mapTitle: 'Google Maps – Schönenstrasse 33, Rüschlikon', mapNote: 'Caricando la mappa vengono trasmessi dati a Google.',
    formSending: 'Invio in corso …', formDone: 'Grazie – la vostra richiesta è stata ricevuta. Riceverete una risposta personale.', formError: "L'invio non è riuscito. Si apre il vostro programma di posta con il messaggio.", formNeed: 'Indicate il nome e un indirizzo e-mail valido.',
    consentText: 'Utilizziamo Google Analytics per capire come viene usato questo sito. Per questo serve il vostro consenso.', consentMore: 'Privacy', consentAccept: 'Accetto', consentDecline: 'Rifiuto', consentSettings: 'Impostazioni cookie',
    rented: "L'appartamento è stato affittato.",
  },
};

// ---------- 2. Template expansion (sc-for, sc-if, {{holes}}) ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (ctx, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ctx);
function expand(h, ctx) {
  h = h.replace(/<sc-for list="\{\{\s*([\w.]+)\s*\}\}" as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, (m, list, as, body) => {
    const arr = get(ctx, list) || [];
    return arr.map((it, i) => expand(body, Object.assign({}, ctx, { [as]: it, $index: i }))).join('');
  });
  h = h.replace(/<sc-if value="\{\{\s*([\w.]+)\s*\}\}"[^>]*>([\s\S]*?)<\/sc-if>/g, (m, v, body) => (get(ctx, v) ? expand(body, ctx) : ''));
  h = h.replace(/\{\{\s*([\w.$]+)\s*\}\}/g, (m, p) => { const v = get(ctx, p); return v == null || typeof v === 'function' ? '' : esc(v); });
  return h;
}

// ---------- 3. CSS additions for the static site ----------
css = css.replace(/@media \(max-width:900px\)\{\.sec\{padding:72px 0\}\.wrap\{padding:0 20px\}/, '@media (max-width:900px){.sec{padding:72px 0}.wrap{padding:0 20px}.mob .lang{min-height:44px}');
css += `
@font-face{font-family:"Cormorant Garamond";font-style:normal;font-weight:300;font-display:swap;src:url(/fonts/cormorant-garamond-latin-300-normal.woff2) format("woff2")}
@font-face{font-family:"Cormorant Garamond";font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/cormorant-garamond-latin-400-normal.woff2) format("woff2")}
@font-face{font-family:"Cormorant Garamond";font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/cormorant-garamond-latin-500-normal.woff2) format("woff2")}
@font-face{font-family:Inter;font-style:normal;font-weight:400 600;font-display:swap;src:url(/fonts/inter-latin-wght-normal.woff2) format("woff2-variations")}
@font-face{font-family:Inter;font-style:normal;font-weight:400 600;font-display:swap;src:url(/fonts/inter-latin-ext-wght-normal.woff2) format("woff2-variations");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
*{min-width:0}
picture{display:block}
.lang{text-decoration:none;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box}
.langs-desk{display:flex;gap:2px}
.mob .langs{display:flex;gap:4px;padding:16px 0 20px}
.mob .langs a{font-family:Inter,system-ui,sans-serif;font-size:13px;border-bottom:0;padding:8px 10px;color:#8a8580;display:inline-flex}
.mob .langs a.lang-on{color:#1c1b19;border-bottom:1px solid #8c6a3f}
.map-frame{width:100%;aspect-ratio:3/2;border:0;display:block}
#form-hint{font-size:14px;margin-top:14px;color:#c9c6c0;min-height:1.4em}
.hp{position:absolute;left:-9999px;top:-9999px}
.consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:60;max-width:560px;margin:0 auto;background:#22262a;color:#f3f2ef;padding:18px 20px;box-shadow:0 10px 30px rgba(0,0,0,.3);font-size:14px;line-height:1.5}
.consent .btn{padding:10px 18px;font-size:14px;min-height:40px}
.consent .btn-ghost{background:transparent;color:#f3f2ef;border:1px solid #8a8580}
.rented{background:#8c6a3f;color:#fff;text-align:center;padding:12px 20px;font-size:15px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`;

// ---------- 4. JSON-LD ----------
function jsonLd(lang, t) {
  const url = DOMAIN + '/' + LANGS[lang].dir;
  const img = (n) => DOMAIN + '/img/' + n + '.jpg';
  const g = [
    { '@type': 'WebSite', '@id': DOMAIN + '/#website', url: DOMAIN + '/', name: 'THIRTY THREE', alternateName: 'Thirty Three Rüschlikon', inLanguage: ['de', 'en', 'it'] },
    { '@type': 'Person', '@id': DOMAIN + '/#contact', name: 'Leonardo Fasciati', email: MAIL },
    {
      '@type': 'RealEstateListing', '@id': url + '#listing', url, name: META[lang].title, description: META[lang].desc, inLanguage: lang,
      datePosted: '2026-11-04', dateModified: LASTMOD, isPartOf: { '@id': DOMAIN + '/#website' },
      mainEntity: { '@id': DOMAIN + '/#apartment' }, offers: { '@id': DOMAIN + '/#offer' }, primaryImageOfPage: img('thirty-three-rueschlikon-haus'),
    },
    {
      '@type': 'Apartment', '@id': DOMAIN + '/#apartment', name: 'THIRTY THREE – Wohnung 201, Schönenstrasse 33, Rüschlikon', url,
      description: t.aptLead,
      address: { '@type': 'PostalAddress', streetAddress: 'Schönenstrasse 33', postalCode: '8803', addressLocality: 'Rüschlikon', addressRegion: 'ZH', addressCountry: 'CH' },
      floorLevel: '2', numberOfRooms: 3.5, numberOfBedrooms: 2, numberOfBathroomsTotal: 2, numberOfFullBathrooms: 1, numberOfPartialBathrooms: 1,
      floorSize: { '@type': 'QuantitativeValue', value: 100.1, unitCode: 'MTK' }, yearBuilt: 2026,
      amenityFeature: [
        ['balcony', true], ['elevator', true], ['washerDryer', true], ['parking', true], ['cellar', true], ['internet', true], ['heatPump', true], ['solar', true],
      ].map(([name, value]) => ({ '@type': 'LocationFeatureSpecification', name, value })),
      image: [img('thirty-three-rueschlikon-haus'), img('thirty-three-rueschlikon-wohnbereich-balkon'), img('thirty-three-rueschlikon-kueche-eggersmann')],
      containedInPlace: { '@type': 'ApartmentComplex', name: 'THIRTY THREE', numberOfAccommodationUnits: { '@type': 'QuantitativeValue', value: 5 } },
    },
    {
      '@type': 'Offer', '@id': DOMAIN + '/#offer', itemOffered: { '@id': DOMAIN + '/#apartment' }, businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
      price: 4980, priceCurrency: 'CHF', priceSpecification: { '@type': 'UnitPriceSpecification', price: 4980, priceCurrency: 'CHF', unitCode: 'MON' },
      availability: STATUS === 'rented' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', availabilityStarts: '2027-01-15', validFrom: '2026-11-04',
      offeredBy: { '@id': DOMAIN + '/#contact' }, url: url + '#konditionen',
      addOn: { '@type': 'Offer', name: 'Garagenplatz', price: 200, priceCurrency: 'CHF', priceSpecification: { '@type': 'UnitPriceSpecification', price: 200, priceCurrency: 'CHF', unitCode: 'MON' } },
    },
    { '@type': 'FAQPage', '@id': url + '#faq', mainEntity: t.faqs.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': g });
}

// ---------- 5. Page ----------
function page(lang) {
  const t = TEXTS[lang];
  const L = LANGS[lang];
  const m = META[lang];
  const url = DOMAIN + '/' + L.dir;
  const langLinks = (cls) => Object.entries(LANGS).map(([l, v]) => `<a class="lang${l === lang ? ' lang-on' : ''}${cls ? ' ' + cls : ''}" href="/${v.dir}" lang="${l}" hreflang="${v.hreflang}">${l.toUpperCase()}</a>`).join('');

  let body = expand(markup, { t, form: { name: '', mail: '', tel: '', msg: '' }, menuOpen: 'false', mobClass: '', mailAddr: MAIL, mailPlain: 'mailto:' + MAIL, deOn: '', enOn: '', itOn: '' });
  // event attributes from the design editor have no meaning here
  body = body.replace(/\s(onClick|onChange|onSubmit)="[^"]*"/g, '');
  // language buttons -> links (three places: header, mobile menu, footer)
  body = body.replace(/<button class="lang[^"]*"[^>]*>(DE|EN|IT)<\/button>/g, (mm, code) => {
    const l = code.toLowerCase(); const v = LANGS[l];
    return `<a class="lang${l === lang ? ' lang-on' : ''}" href="/${v.dir}" lang="${l}" hreflang="${v.hreflang}">${code}</a>`;
  });
  body = body.replace(/<div style="display:flex;gap:4px;padding:16px 0 20px">/, '<div class="langs">');
  body = body.replace(/<div class="langs-desk" style="display:flex;gap:2px">/, '<div class="langs-desk">');
  // burger needs an id, mobile menu too
  body = body.replace('<button class="burger"', '<button class="burger" id="burger" type="button"').replace('<div class="mob ">', '<div class="mob" id="mob">').replace('<div class="mob">', '<div class="mob" id="mob">');
  // images -> site files
  for (const [blob, name] of Object.entries(IMG)) body = body.split(blob).join('/img/' + name + '.jpg');
  // map: consent-gated iframe
  body = body.replace(/<div class="map"><span>([^<]*)<\/span>(<a class="btn"[^>]*>[^<]*<\/a>)<\/div>/, (mm, label, link) =>
    `<div class="map" id="map-box" data-src="https://www.google.com/maps?q=Sch%C3%B6nenstrasse+33,+8803+R%C3%BCschlikon&amp;z=16&amp;output=embed"><button type="button" class="btn" id="map-load">${label}</button><span style="font-size:13px">${esc(m.mapNote)}</span>${link}</div>`);
  // enquiry form: real form with hint and honeypot
  body = body.replace('<form>', '<form id="enquiry" novalidate="novalidate">').replace('<form >', '<form id="enquiry" novalidate="novalidate">');
  body = body.replace(/<input class="input" id="f-name" type="text" required="required" value="">/, '<input class="input" id="f-name" name="name" type="text" required="required" autocomplete="name">');
  body = body.replace(/<input class="input" id="f-mail" type="email" required="required" value="">/, '<input class="input" id="f-mail" name="mail" type="email" required="required" autocomplete="email">');
  body = body.replace(/<input class="input" id="f-tel" type="tel" value="">/, '<input class="input" id="f-tel" name="tel" type="tel" autocomplete="tel">');
  body = body.replace(/<textarea class="input" id="f-msg" rows="5"><\/textarea>/, '<textarea class="input" id="f-msg" name="msg" rows="5"></textarea>');
  body = body.replace(/(<button class="btn" type="submit">[^<]*<\/button>)/, '<label class="hp" aria-hidden="true"><input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off"> Leave this empty</label>$1<p id="form-hint" aria-live="polite"></p>');
  // images -> picture with webp (optimize-images.js creates -800/-1600 variants in CI)
  body = body.replace(/<img class="img" src="\/img\/([a-z0-9-]+)\.jpg"([^>]*)>/g, (mm, name, rest) => {
    const has = fs.existsSync(path.join(OUT, 'img', `${name}-800.webp`)) && fs.existsSync(path.join(OUT, 'img', `${name}-1600.webp`));
    const isHero = /fetchpriority="high"/.test(rest);
    const sizes = isHero ? '(max-width:900px) 100vw, 1120px' : /kueche/.test(name) ? '(max-width:900px) 100vw, 640px' : '(max-width:900px) 100vw, 1120px';
    const img = `<img class="img" src="/img/${name}.jpg"${rest}${isHero ? '' : ''}>`;
    return has ? `<picture><source type="image/webp" srcset="/img/${name}-800.webp 800w, /img/${name}-1600.webp 1600w" sizes="${sizes}">${img}</picture>` : img;
  });
  // rented banner
  if (STATUS === 'rented') body = body.replace('<header', `<div class="rented">${esc(m.rented)}</div><header`);
  // cookie settings link in footer when analytics is on
  if (GA_ID) body = body.replace(/(<a href="#datenschutz"[^>]*>[^<]*<\/a>)/, `$1<a href="#" id="consent-open" style="color:#f3f2ef;text-decoration:none">${esc(m.consentSettings)}</a>`);

  const heroPreload = fs.existsSync(path.join(OUT, 'img', 'thirty-three-rueschlikon-haus-1600.webp'))
    ? `<link rel="preload" as="image" imagesrcset="/img/thirty-three-rueschlikon-haus-800.webp 800w, /img/thirty-three-rueschlikon-haus-1600.webp 1600w" imagesizes="(max-width:900px) 100vw, 1120px" type="image/webp" fetchpriority="high">`
    : `<link rel="preload" as="image" href="/img/thirty-three-rueschlikon-haus.jpg" fetchpriority="high">`;

  const consent = GA_ID ? `
<div id="consent" class="consent" role="dialog" aria-live="polite" aria-label="Cookies" hidden>
<p style="margin:0 0 12px">${esc(m.consentText)} <a href="#datenschutz" style="color:#fff">${esc(m.consentMore)}</a></p>
<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" id="consent-accept" class="btn" style="background:#f3f2ef;color:#22262a">${esc(m.consentAccept)}</button><button type="button" id="consent-decline" class="btn btn-ghost">${esc(m.consentDecline)}</button></div>
</div>` : '';

  const script = `
<script>
(function(){
  var b=document.getElementById('burger'),mn=document.getElementById('mob');
  function closeMenu(){if(mn){mn.classList.remove('open');}if(b){b.setAttribute('aria-expanded','false');}}
  if(b&&mn){b.addEventListener('click',function(){var o=mn.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');});mn.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu);});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});}
  var f=document.getElementById('enquiry');
  if(f){var hint=document.getElementById('form-hint'),btn=f.querySelector('button[type=submit]');var L=${JSON.stringify(t.mailLabels)};
    f.addEventListener('submit',function(e){e.preventDefault();var g=function(n){return f.elements[n]?f.elements[n].value.trim():'';};
      if(!g('name')||!/\\S+@\\S+\\.\\S+/.test(g('mail'))){hint.textContent=${JSON.stringify(m.formNeed)};f.elements[g('name')?'mail':'name'].focus();return;}
      if(f.elements.botcheck&&f.elements.botcheck.checked){return;}
      var body=[L.name+': '+g('name'),L.mail+': '+g('mail'),L.tel+': '+(g('tel')||'–'),'',L.msg+':',g('msg')].join('\\n');
      var mailto='mailto:${MAIL}?subject='+encodeURIComponent(${JSON.stringify(t.mailSubject)})+'&body='+encodeURIComponent(body);
      var key=${JSON.stringify(WEB3FORMS_KEY)};
      if(!key||!window.fetch){window.location.href=mailto;return;}
      hint.textContent=${JSON.stringify(m.formSending)};if(btn)btn.disabled=true;
      var payload={access_key:key,subject:${JSON.stringify(t.mailSubject)},from_name:'${HOST}',name:g('name'),email:g('mail'),replyto:g('mail'),message:body,language:document.documentElement.lang};
      fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.json();}).then(function(d){
        if(d&&d.success){hint.textContent=${JSON.stringify(m.formDone)};hint.style.color='#f3f2ef';f.reset();if(btn)btn.disabled=false;}else{throw new Error('fail');}
      }).catch(function(){hint.textContent=${JSON.stringify(m.formError)};if(btn)btn.disabled=false;window.location.href=mailto;});});}
  function loadMap(){var mb=document.getElementById('map-box');if(!mb||mb.dataset.done)return;mb.dataset.done='1';var i=document.createElement('iframe');i.className='map-frame';i.title=${JSON.stringify(m.mapTitle)};i.src=mb.getAttribute('data-src');i.setAttribute('loading','lazy');i.setAttribute('referrerpolicy','no-referrer-when-downgrade');mb.replaceWith(i);}
  var ml=document.getElementById('map-load');if(ml)ml.addEventListener('click',loadMap);
  var GA=${JSON.stringify(GA_ID)},KEY='tt-consent',box=document.getElementById('consent');
  function loadGA(){if(!GA||window.__ga)return;window.__ga=true;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config',GA);}
  function get(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function set(v){try{localStorage.setItem(KEY,v);}catch(e){}}
  if(GA&&box){var c=get();if(c==='granted'){loadGA();}else if(c!=='denied'){box.hidden=false;}
    var a=document.getElementById('consent-accept'),d=document.getElementById('consent-decline'),o=document.getElementById('consent-open');
    if(a)a.addEventListener('click',function(){set('granted');box.hidden=true;loadGA();});
    if(d)d.addEventListener('click',function(){var was=get()==='granted';set('denied');box.hidden=true;if(was){window['ga-disable-'+GA]=true;document.cookie.split(';').forEach(function(ck){var n=ck.split('=')[0].trim();if(/^_ga/.test(n)){document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${HOST}';document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';}});location.reload();}});
    if(o)o.addEventListener('click',function(e){e.preventDefault();box.hidden=false;});}
})();
</script>`;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
<link rel="canonical" href="${url}">
${HREFLANGS.map(([h, d]) => `<link rel="alternate" hreflang="${h}" href="${DOMAIN}/${d}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${DOMAIN}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="THIRTY THREE">
<meta property="og:title" content="${esc(m.ogTitle)}">
<meta property="og:description" content="${esc(m.ogDesc)}">
<meta property="og:image" content="${DOMAIN}/img/og-thirty-three-rueschlikon.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(m.ogAlt)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${L.ogLocale}">
${Object.values(LANGS).filter((v) => v.ogLocale !== L.ogLocale).map((v) => `<meta property="og:locale:alternate" content="${v.ogLocale}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="${LIVE ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'}">
<meta name="theme-color" content="#f3f2ef">
<link rel="preload" href="/fonts/cormorant-garamond-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${heroPreload}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48">
<link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/favicon-180.png">
<script type="application/ld+json">${jsonLd(lang, t)}</script>
<style>${css}</style>
</head>
<body>
${body}
${consent}
${script}
</body>
</html>
`;
}

// ---------- 6. Write output ----------
for (const [lang, v] of Object.entries(LANGS)) {
  const dir = path.join(OUT, v.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(lang));
}
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${Object.values(LANGS).map((v) => `<url><loc>${DOMAIN}/${v.dir}</loc><lastmod>${LASTMOD}</lastmod>${HREFLANGS.map(([h, d]) => `<xhtml:link rel="alternate" hreflang="${h}" href="${DOMAIN}/${d}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/"/></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), LIVE
  ? ['User-agent: *', 'Allow: /', '', ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Bingbot', 'Applebot'].flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']), `Sitemap: ${DOMAIN}/sitemap.xml`, ''].join('\n')
  : ['User-agent: *', 'Disallow: /', ''].join('\n'));
const T = TEXTS.de;
fs.writeFileSync(path.join(OUT, 'llms.txt'), `# THIRTY THREE – 3.5-Zimmer-Wohnung mieten in Rüschlikon

> Wohnung 201 im Neubau THIRTY THREE, Schönenstrasse 33, 8803 Rüschlikon (Kanton Zürich, Schweiz): 3.5 Zimmer, 100.1 m² Wohnfläche brutto, 2. Stock, Lift direkt in die Wohnung, gedeckter Balkon 13.5 m², Keller 13.1 m², Garagenplatz. Zwei Zimmer, Bad mit Wanne, separate Dusche, Réduit, eigener Waschturm, Glasfaser, elektrische Storen, Eichenparkett. Küche von eggersmann mit Naturstein-Arbeitsplatte, BORA Kochfeldabzug, Electrolux Kombi-Steamer, Miele Geschirrspüler. Erdsonden-Wärmepumpe mit Freecooling, Photovoltaik. Mehrfamilienhaus mit 5 Wohnungen, Fertigstellung Dezember 2026. Erstbezug ab 15. Januar oder 1. Februar 2027, unbefristet, unmöbliert. Mietzins CHF 4'980 pro Monat, Garagenplatz CHF 200, Nebenkosten akonto, Kaution CHF 12'000. Status: ${STATUS === 'rented' ? 'vermietet' : 'verfügbar'}. Kontakt: ${MAIL} (Leonardo Fasciati).

## Lage
- Zu Fuss: Bushaltestelle 5 Min., Bahnhof Rüschlikon 9 Min., Zürichsee 10 Min., Coop 10 Min.
- Nach Zürich: Bus 165 direkt zum Bürkliplatz 20 Min.; S-Bahn S8/S24 zum Zürich HB 15 Min.; S24 direkt zum Flughafen Zürich 30 Min.; Auto ins Stadtzentrum 10 Min.
- Gemeindesteuerfuss Rüschlikon 75 % (Rang 3 von 160 im Kanton Zürich). Zurich International School in Adliswil und Wädenswil.

## FAQ
${T.faqs.map((q) => `- ${q.q} ${q.a}`).join('\n')}

## Seiten
- [Deutsch](${DOMAIN}/)
- [English](${DOMAIN}/en/)
- [Italiano](${DOMAIN}/it/)
- Sitemap: ${DOMAIN}/sitemap.xml
`);
fs.writeFileSync(path.join(OUT, 'CNAME'), HOST + '\n');
fs.writeFileSync(path.join(OUT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
fs.writeFileSync(path.join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#22262a"/><text x="32" y="43" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#f3f2ef">33</text></svg>`);
fs.writeFileSync(path.join(OUT, '404.html'), `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/"><title>THIRTY THREE</title></head><body><a href="/">${HOST}</a></body></html>`);
console.log('built:', Object.values(LANGS).map((v) => v.dir + 'index.html').join(', '), '| LIVE =', LIVE, '| STATUS =', STATUS);
