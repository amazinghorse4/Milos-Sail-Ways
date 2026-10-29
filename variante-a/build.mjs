#!/usr/bin/env node
// Milos Sail Ways – static site generator (no dependencies).
// Usage:  node build.mjs            → builds ./dist
//         node build.mjs --inline   → single-file preview (dist-preview/index.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, images, gallery, langs, routes, redirects, blogSeed, minPrice } from './src/site.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const T = {};
for (const l of langs) T[l] = (await import(`./src/i18n/${l}.mjs`)).default;

const CSS = fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf8');
const JS = fs.readFileSync(path.join(ROOT, 'src/main.js'), 'utf8');
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// ───────── helpers ─────────
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.domain + p;
const money = (t, n) => new Intl.NumberFormat(t.locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
// Month names (nominative). Index 4..10 = April..October.
const MONTHS = {
  en: ['', '', '', '', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
  el: ['', '', '', '', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος'],
  fr: ['', '', '', '', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre'],
  es: ['', '', '', '', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre'],
};
const MONTHS_SHORT = {
  en: ['', '', '', '', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  el: ['', '', '', '', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ'],
  fr: ['', '', '', '', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.'],
  es: ['', '', '', '', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct'],
};
const monthName = (t, m) => MONTHS[t.lang][m];
const cap = (s) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
const fontsLocal = fs.existsSync(path.join(PUBLIC, 'fonts/fonts.css'));

function imgInfo(key) {
  const g = gallery.find((x) => x.key === key);
  const meta = images[key] || g;
  if (!meta) throw new Error('Unknown image ' + key);
  const local800 = path.join(PUBLIC, 'img', `${key}-800.webp`);
  if (fs.existsSync(local800)) {
    const sizeFile = path.join(PUBLIC, 'img', `${key}.json`);
    const dims = fs.existsSync(sizeFile) ? JSON.parse(fs.readFileSync(sizeFile, 'utf8')) : meta;
    const has1600 = fs.existsSync(path.join(PUBLIC, 'img', `${key}-1600.webp`));
    return {
      src: `/img/${key}-${has1600 ? 1600 : 800}.webp`,
      srcset: `/img/${key}-800.webp 800w` + (has1600 ? `, /img/${key}-1600.webp 1600w` : ''),
      w: dims.w || 1600, h: dims.h || 1067,
    };
  }
  return { src: meta.src, srcset: '', w: meta.w || 1200, h: meta.h || 900 };
}

function pic(key, alt, { sizes = '100vw', eager = false, cls = '' } = {}) {
  const i = imgInfo(key);
  return `<img class="${cls}" src="${i.src}"${i.srcset ? ` srcset="${i.srcset}" sizes="${sizes}"` : ''} width="${i.w}" height="${i.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
const imgUrl = (key) => { const s = imgInfo(key).src; return s.startsWith('http') ? s : abs(s); };

const icons = {
  boat: '<path d="M3 17h18l-2 4H5zM12 3v12M12 4l7 10h-7M11 6 6 14h5"/>',
  food: '<path d="M6 3v8a2 2 0 0 0 2 2v8M10 3v8a2 2 0 0 1-2 2M8 3v6M16 21V3c2.5 1 4 4 4 8h-4"/>',
  swim: '<path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 22c2 0 2-1.5 4-1.5S8 22 10 22s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><circle cx="16" cy="6" r="2"/><path d="m4 14 5-5 3 3 4-3"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  wa: '<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3 3z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8c-1.2-.5-2.2-1.5-2.7-2.7l.8-1-1-2z"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',
  fb: '<path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.7 1.8-1.7H18V2.6A24 24 0 0 0 15.4 2.4C12.8 2.4 11 4 11 7v2.5H8V13h3v8"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>',
  viber: '<path d="M12 3c5 0 8.5 2.2 8.5 7.5S17 18 12 18l-4 3v-3.6C5 16.3 3.5 14 3.5 10.5 3.5 5.2 7 3 12 3z"/><path d="M9.5 8c0 3 2.5 5.5 5.5 5.5l.8-1.3-1.7-.9-.8.7a4 4 0 0 1-2-2l.7-.8-.9-1.7z"/>',
};
const icon = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[n]}</svg>`;

const waLink = (text = '') => `https://wa.me/${site.phone.replace('+', '')}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const viberLink = `viber://chat?number=${encodeURIComponent(site.phone)}`;

// ───────── blog content (from `npm run migrate`) ─────────
function loadPosts(lang) {
  const dir = path.join(ROOT, 'content/blog', lang);
  if (fs.existsSync(dir)) {
    const posts = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
      .sort((a, b) => b.date.localeCompare(a.date));
    if (posts.length) return posts;
  }
  return lang === 'en' ? blogSeed.map((p) => ({ ...p, seed: true })) : [];
}
const POSTS = Object.fromEntries(langs.map((l) => [l, loadPosts(l)]));

// ───────── layout ─────────
function head({ t, page, title, desc, canonical, alternates, ogImage, schema, noindex, ogType = 'website' }) {
  const alt = alternates
    ? langs.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(alternates[l])}">`).join('\n') +
      `\n<link rel="alternate" hreflang="x-default" href="${abs(alternates.en)}">`
    : '';
  const fonts = fontsLocal
    ? '<link rel="stylesheet" href="/fonts/fonts.css">'
    : '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Commissioner:wght,FLAR,VOLM@300..800,0..100,0..100&display=swap">';
  return `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${abs(canonical)}">
${alt}
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(canonical)}">
<meta property="og:image" content="${esc(ogImage || imgUrl('hero'))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f2c3a">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${fonts}
<link rel="stylesheet" href="/assets/styles.css?v=${BUILD_DATE}">
${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : ''}
</head>`;
}

function header(t, pageKey, alternates) {
  const L = (k) => routes[k][t.lang];
  const navItems = ['kleftiko', 'polyaigos', 'pricing', 'about', 'gallery', ...(POSTS[t.lang].length ? ['blog'] : [])];
  const nav = navItems.map((k) => `<a href="${L(k)}"${k === pageKey ? ' aria-current="page"' : ''}>${t.nav[k]}</a>`).join('');
  const langSwitch = langs.map((l) => `<a href="${alternates ? alternates[l] : routes.home[l]}" hreflang="${l}" lang="${l}"${l === t.lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('');
  return `<a class="skip" href="#main">${t.ui.skip}</a>
<header class="site-header">
  <div class="wrap header-in">
    <a class="brand" href="${L('home')}" aria-label="${site.name} – ${t.ui.home}">${logo()}</a>
    <nav class="main-nav" aria-label="Main">${nav}</nav>
    <div class="header-tools">
      <div class="lang" aria-label="${t.ui.language}">${icon('globe')}${langSwitch}</div>
      <a class="btn btn-sun btn-sm" href="${L('contact')}">${t.ui.book}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" data-open="${t.ui.menu}" data-close="${t.ui.close}">${icon('menu')}<span class="sr">${t.ui.menu}</span></button>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu" hidden>
    <nav class="wrap" aria-label="Mobile">
      ${['cruises', ...navItems, 'contact'].map((k) => `<a href="${L(k)}"${k === pageKey ? ' aria-current="page"' : ''}>${t.nav[k]}</a>`).join('')}
      <div class="lang lang-mobile">${langs.map((l) => `<a href="${alternates ? alternates[l] : routes.home[l]}" hreflang="${l}" lang="${l}"${l === t.lang ? ' aria-current="true"' : ''}>${T[l].langName}</a>`).join('')}</div>
    </nav>
  </div>
</header>`;
}

function logo() {
  // Wordmark with a small sail – replace with the real logo file if preferred.
  return `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M15 3 6 22h9z" fill="currentColor"/><path d="M17 6c5 4 7.5 9.5 7.5 16H17z" fill="var(--sun)"/><path d="M3 25.5h26l-3 3.5H6z" fill="currentColor"/></svg><span class="logo-text">Milos <b>Sail Ways</b></span>`;
}

function footer(t) {
  const L = (k) => routes[k][t.lang];
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="f-brand">
      <a class="brand brand-light" href="${L('home')}">${logo()}</a>
      <p>${t.footer.tagline}</p>
      <div class="social">
        <a href="${site.instagram}" rel="noopener" target="_blank" aria-label="Instagram">${icon('ig')}</a>
        <a href="${site.facebook}" rel="noopener" target="_blank" aria-label="Facebook">${icon('fb')}</a>
      </div>
    </div>
    <div>
      <h2 class="f-title">${t.footer.contactTitle}</h2>
      <ul class="f-list">
        <li><a href="${waLink()}" rel="noopener">${icon('wa')} WhatsApp</a></li>
        <li><a href="${viberLink}">${icon('viber')} Viber</a></li>
        <li><a href="tel:${site.phone}">${icon('phone')} ${site.phoneDisplay}</a></li>
        <li><a href="mailto:${site.email}">${icon('mail')} ${site.email}</a></li>
        <li>${icon('pin')} ${site.base}, ${site.postalCode}</li>
      </ul>
    </div>
    <div>
      <h2 class="f-title">${t.footer.exploreTitle}</h2>
      <ul class="f-list">
        ${['cruises', 'kleftiko', 'polyaigos', 'pricing', 'about', 'gallery', ...(POSTS[t.lang].length ? ['blog'] : []), 'contact', 'cancellation'].map((k) => `<li><a href="${L(k)}">${t.nav[k]}</a></li>`).join('')}
      </ul>
    </div>
    <div>
      <h2 class="f-title">${t.footer.hoursTitle}</h2>
      <p class="f-hours">${icon('clock')} ${site.hours}</p>
      <p class="f-small">${t.footer.season}</p>
    </div>
  </div>
  <div class="wrap f-bottom"><p>© ${new Date().getFullYear()} ${site.name}. ${t.footer.rights}</p></div>
</footer>
<div class="action-bar" role="navigation" aria-label="${t.ui.book}">
  <a class="ab-wa" href="${waLink(t.form.msgIntro)}" rel="noopener">${icon('wa')}<span>${t.ui.whatsapp}</span></a>
  <a class="ab-book" href="${L('contact')}">${t.ui.book}</a>
</div>`;
}

function page({ t, key, title, desc, alternates, body, schema, ogImage, noindex, ogType, canonical }) {
  const html = `${head({ t, page: key, title, desc, canonical: canonical || alternates[t.lang], alternates: canonical ? null : alternates, ogImage, schema, noindex, ogType })}
<body class="p-${key}">
${header(t, key, canonical ? null : alternates)}
<main id="main">
${body}
</main>
${footer(t)}
<script src="/assets/main.js?v=${BUILD_DATE}" defer></script>
</body>
</html>`;
  return html.replace(/\n\s*\n/g, '\n');
}

// ───────── shared blocks ─────────
const pricingFor = (m, day = 1) => {
  const row = site.pricing.months.find((r) => r.months.includes(m) && (!r.untilDay || day <= r.untilDay));
  return row ? row.price : null;
};

function priceStrip(t) {
  const months = [4, 5, 6, 7, 8, 9, 10];
  const max = Math.max(...site.pricing.months.map((r) => r.price));
  return `<ol class="season" aria-label="${esc(t.pages.pricing.h1)}">
  ${months.map((m) => {
    const p = pricingFor(m);
    const peak = p === max;
    return `<li class="${peak ? 'peak' : ''}" style="--h:${Math.round((p / max) * 100)}%">
      <span class="s-price">${money(t, p)}</span>
      <span class="s-bar" aria-hidden="true"></span>
      <span class="s-month">${cap(MONTHS_SHORT[t.lang][m])}${m === 10 ? '<small>≤15</small>' : ''}</span>
    </li>`;
  }).join('')}
</ol>`;
}

function facts(t) {
  return `<ul class="facts wrap">${t.facts.map((f) => `<li>${icon(f.icon, 'ico ico-lg')}<div><strong>${f.t}</strong><span>${f.d}</span></div></li>`).join('')}</ul>`;
}

function routeCard(t, k) {
  const tour = t.tours[k];
  const imgKey = k === 'kleftiko' ? 'kleftiko' : 'polyaigos';
  return `<article class="route-card">
  <a class="rc-media" href="${routes[k][t.lang]}" tabindex="-1" aria-hidden="true">${pic(imgKey, tour.name, { sizes: '(min-width: 900px) 50vw, 100vw' })}</a>
  <div class="rc-body">
    <p class="rc-feel">${tour.feel}</p>
    <h3><a href="${routes[k][t.lang]}">${tour.name}</a></h3>
    <p>${tour.short}</p>
    <ol class="mini-route">${tour.stops.map((s) => `<li${s.lunch ? ' class="lunch"' : ''}><span>${s.name.replace(/ → .*/, '')}</span></li>`).join('')}</ol>
    <p class="rc-meta"><span>${icon('clock')} ${tour.hours}</span><span>${t.ui.from} <strong>${money(t, minPrice)}</strong> ${t.ui.perBoat}</span></p>
    <div class="btn-row">
      <a class="btn btn-sun" href="${routes.contact[t.lang]}?route=${k}">${t.ui.bookRoute}</a>
      <a class="btn btn-line" href="${routes[k][t.lang]}">${t.ui.seeRoute}</a>
    </div>
  </div>
</article>`;
}

function faqBlock(t, title) {
  return `<section class="section faq" aria-labelledby="faq-h">
  <div class="wrap narrow">
    <h2 id="faq-h">${title}</h2>
    ${t.faq.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join('')}
  </div>
</section>`;
}

function bookingForm(t, { headingLevel = 'h2', withHeading = true } = {}) {
  const f = t.form;
  const cfg = {
    phone: site.phone.replace('+', ''), email: site.email, locale: t.locale,
    season: site.season, pricing: site.pricing,
    msg: { intro: f.msgIntro, route: f.msgRoute, date: f.msgDate, guests: f.msgGuests, name: f.msgName, contact: f.msgContact, estimate: f.msgEstimate, subject: f.mailSubject },
    txt: { pick: f.pickDate, out: f.outOfSeason, required: f.required, note: f.estimateNote },
  };
  const opts = Array.from({ length: site.pricing.maxGuests }, (_, i) => i + 1)
    .map((n) => `<option value="${n}"${n === 4 ? ' selected' : ''}>${n}</option>`).join('');
  return `<form class="booking" id="booking" novalidate data-cfg='${esc(JSON.stringify(cfg))}'>
  ${withHeading ? `<${headingLevel} class="bk-title">${f.title}</${headingLevel}><p class="bk-lead">${f.lead}</p>` : ''}
  <fieldset class="bk-route">
    <legend>${f.route}</legend>
    ${Object.entries(f.routeOpts).map(([k, v], i) => `<label><input type="radio" name="route" value="${k}"${i === 0 ? ' checked' : ''} data-label="${esc(v)}"><span>${v}</span></label>`).join('')}
  </fieldset>
  <div class="bk-grid">
    <label class="fld"><span>${f.date}</span><input type="date" id="bk-date" name="date" required></label>
    <label class="fld"><span>${f.guests}</span><select id="bk-guests" name="guests">${opts}</select></label>
    <label class="fld"><span>${f.name}</span><input type="text" id="bk-name" name="name" autocomplete="name" required></label>
    <label class="fld"><span>${f.contact}</span><input type="text" id="bk-contact" name="contact" autocomplete="email" required></label>
    <label class="fld fld-wide"><span>${f.message}</span><textarea id="bk-msg" name="message" rows="3" placeholder="${esc(f.messagePh)}"></textarea></label>
  </div>
  <div class="bk-estimate" aria-live="polite">
    <span class="bk-est-label">${f.estimate}</span>
    <output id="bk-out" for="bk-date bk-guests">${f.pickDate}</output>
  </div>
  <p class="bk-error" id="bk-error" role="alert" hidden></p>
  <div class="btn-row">
    <button class="btn btn-sun btn-lg" type="submit" value="wa">${icon('wa')} ${f.sendWa}</button>
    <button class="btn btn-line btn-lg" type="submit" value="mail">${icon('mail')} ${f.sendMail}</button>
  </div>
  <p class="bk-note">${f.note}</p>
</form>`;
}

function crumbs(t, items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(url) })),
  };
}

function businessSchema(t) {
  return {
    '@type': ['LocalBusiness', 'TravelAgency'],
    '@id': site.domain + '/#business',
    name: site.name,
    url: abs(routes.home[t.lang]),
    image: [imgUrl('hero'), imgUrl('boat'), imgUrl('kleftiko')],
    logo: abs('/favicon.svg'),
    telephone: site.phone,
    email: site.email,
    priceRange: `€${minPrice}–€${Math.max(...site.pricing.months.map((r) => r.price)) + 2 * site.pricing.extraGuest}`,
    currenciesAccepted: 'EUR',
    address: { '@type': 'PostalAddress', streetAddress: 'Mersinia', addressLocality: 'Milos', addressRegion: 'Cyclades', postalCode: site.postalCode, addressCountry: 'GR' },
    areaServed: { '@type': 'Place', name: 'Milos, Cyclades, Greece' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '10:00', closes: '19:00' }],
    sameAs: [site.instagram, site.facebook],
    founder: site.owners.map((n) => ({ '@type': 'Person', name: n })),
  };
}

function tripSchema(t, k) {
  const tour = t.tours[k];
  return {
    '@type': ['TouristTrip', 'BoatTrip'],
    '@id': abs(routes[k][t.lang]) + '#trip',
    name: t.pages[k].h1,
    description: t.pages[k].desc,
    image: imgUrl(k === 'kleftiko' ? 'kleftiko' : 'polyaigos'),
    url: abs(routes[k][t.lang]),
    inLanguage: t.lang,
    touristType: ['Couples', 'Families', 'Groups of friends'],
    departureTime: '10:00',
    departureBoatTerminal: { '@type': 'BoatTerminal', name: 'Adamas Port, Milos' },
    itinerary: {
      '@type': 'ItemList',
      itemListElement: tour.stops.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'TouristAttraction', name: s.name, description: s.text } })),
    },
    provider: { '@id': site.domain + '/#business' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: minPrice,
      highPrice: Math.max(...site.pricing.months.map((r) => r.price)) + 2 * site.pricing.extraGuest,
      offerCount: site.pricing.months.length,
      availability: 'https://schema.org/InStock',
      url: abs(routes.contact[t.lang]) + '?route=' + k,
    },
  };
}

const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
const altsFor = (key) => Object.fromEntries(langs.map((l) => [l, routes[key][l]]));

// ───────── pages ─────────
const pages = {};

pages.home = (t) => {
  const p = t.pages.home;
  const L = (k) => routes[k][t.lang];
  const galleryKeys = ['g8', 'g4', 'g12', 'g2', 'g15'];
  const body = `
<section class="hero">
  <div class="hero-media">${pic('hero', p.h1, { eager: true })}</div>
  <div class="wrap hero-in">
    <h1>${p.h1}</h1>
    <p class="hero-lead">${p.lead}</p>
    <ul class="chips">${p.chips.map((c) => `<li>${c}</li>`).join('')}</ul>
    <div class="btn-row">
      <a class="btn btn-sun btn-lg" href="#book">${t.ui.book}</a>
      <a class="btn btn-ghost btn-lg" href="${waLink(t.form.msgIntro)}" rel="noopener">${icon('wa')} ${t.ui.whatsapp}</a>
    </div>
    <p class="hero-price">${t.ui.from} <strong>${money(t, minPrice)}</strong> ${t.ui.perBoat}, ${t.ui.upTo} ${site.pricing.baseGuests} ${t.ui.guests}</p>
  </div>
</section>
<div class="facts-band">${facts(t)}</div>

<section class="section" aria-labelledby="routes-h">
  <div class="wrap">
    <div class="sec-head"><h2 id="routes-h">${p.routesTitle}</h2><p>${p.routesLead}</p></div>
    <div class="routes">${routeCard(t, 'kleftiko')}${routeCard(t, 'polyaigos')}</div>
  </div>
</section>

<section class="section boat" aria-labelledby="boat-h">
  <div class="wrap boat-grid">
    <div class="boat-media">${pic('boat', `${site.boat.name} – ${site.boat.model}`, { sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
    <div class="boat-text">
      <h2 id="boat-h">${p.boatTitle}</h2>
      <p>${p.boatText}</p>
      <dl class="specs-mini">
        <div><dt>${t.pages.about.specs.length}</dt><dd>14 m</dd></div>
        <div><dt>${t.pages.about.specs.cabins}</dt><dd>${site.boat.cabins}</dd></div>
        <div><dt>${t.pages.about.specs.wc}</dt><dd>${site.boat.wc}</dd></div>
        <div><dt>${t.pages.about.specs.passengers}</dt><dd>≤ ${site.boat.passengers}</dd></div>
      </dl>
      <a class="link-arrow" href="${L('about')}">${p.boatLink} ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section prices-band" aria-labelledby="prices-h">
  <div class="wrap">
    <div class="sec-head"><h2 id="prices-h">${p.pricesTitle}</h2><p>${p.pricesLead}</p></div>
    ${priceStrip(t)}
    <p class="prices-link"><a class="link-arrow" href="${L('pricing')}">${t.nav.pricing} ${icon('arrow')}</a></p>
  </div>
</section>

<section class="section" aria-labelledby="gal-h">
  <div class="wrap">
    <div class="sec-head sec-head-row"><h2 id="gal-h">${p.galleryTitle}</h2>
      <p><a class="link-arrow" href="${L('gallery')}">${t.ui.seeAll} ${icon('arrow')}</a></p></div>
    <div class="mosaic">${galleryKeys.map((k, i) => `<a href="${L('gallery')}" class="m${i + 1}">${pic(k, `${t.pages.gallery.alt} – ${i + 1}`, { sizes: '(min-width: 900px) 33vw, 50vw' })}</a>`).join('')}</div>
    <p class="ig-link"><a href="${site.instagram}" rel="noopener" target="_blank">${icon('ig')} ${t.ui.instagram}</a></p>
  </div>
</section>

${faqBlock(t, p.faqTitle)}

<section class="section book-band" id="book" aria-label="${t.form.title}">
  <div class="wrap narrow">${bookingForm(t)}</div>
</section>`;
  return page({
    t, key: 'home', title: p.title, desc: p.desc, alternates: altsFor('home'), body,
    schema: graph(
      { '@type': 'WebSite', '@id': site.domain + '/#website', url: abs(L('home')), name: site.name, inLanguage: t.lang, publisher: { '@id': site.domain + '/#business' } },
      businessSchema(t),
      { '@type': 'FAQPage', mainEntity: t.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ),
  });
};

function pageHero(t, p, imgKey) {
  return `<section class="page-hero${imgKey ? ' has-img' : ''}">
  ${imgKey ? `<div class="hero-media">${pic(imgKey, p.h1, { eager: true })}</div>` : ''}
  <div class="wrap">
    <h1>${p.h1}</h1>
    ${p.lead ? `<p class="hero-lead">${p.lead}</p>` : ''}
  </div>
</section>`;
}

function tourPage(k) {
  return (t) => {
    const p = t.pages[k];
    const tour = t.tours[k];
    const L = (x) => routes[x][t.lang];
    const other = k === 'kleftiko' ? 'polyaigos' : 'kleftiko';
    const body = `
${pageHero(t, p, k === 'kleftiko' ? 'kleftiko' : 'polyaigos2')}
<div class="tour-bar"><div class="wrap tour-bar-in">
  <span>${icon('clock')} ${tour.hours}</span>
  <span>${icon('pin')} ${t.ui.departure}: Adamas</span>
  <span>${icon('users')} ${t.ui.upTo} ${site.pricing.maxGuests} ${t.ui.guests}</span>
  <span class="tb-price">${t.ui.from} <strong>${money(t, minPrice)}</strong> ${t.ui.perBoat}</span>
  <a class="btn btn-sun btn-sm" href="${L('contact')}?route=${k}">${t.ui.bookRoute}</a>
</div></div>

<section class="section" aria-labelledby="route-h">
  <div class="wrap tour-grid">
    <div>
      <h2 id="route-h">${p.routeTitle}</h2>
      <ol class="route-line">
        ${tour.stops.map((s) => `<li class="${s.lunch ? 'lunch' : ''}${s.time ? ' timed' : ''}">
          ${s.time ? `<time>${s.time}</time>` : ''}
          <h3>${s.name}</h3>
          <p>${s.text}${s.lunch ? ` <span class="tag">${t.ui.lunch}</span>` : ''}</p>
        </li>`).join('')}
      </ol>
      <div class="note-box">
        <h3>${tour.alt.title}</h3>
        <p>${tour.alt.text}</p>
      </div>
    </div>
    <aside class="tour-aside">
      ${pic(k === 'kleftiko' ? 'deck' : 'polyaigos', tour.name, { sizes: '(min-width: 900px) 35vw, 100vw', cls: 'aside-img' })}
      <div class="incl">
        <h2>${t.included.title}</h2>
        <h3>${t.included.foodTitle}</h3>
        <ul class="ticks">${t.included.food.map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul>
        <p class="small">${t.included.foodNote}</p>
        <h3>${t.included.aboardTitle}</h3>
        <ul class="ticks cols">${t.included.aboard.map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul>
        <p class="small">${t.included.vary}</p>
      </div>
    </aside>
  </div>
</section>

<section class="section custom-band">
  <div class="wrap narrow center">
    <h2>${t.custom.title}</h2>
    <p>${t.custom.text}</p>
    <div class="btn-row center"><a class="btn btn-sun" href="${L('contact')}?route=${k}">${t.ui.book}</a>
    <a class="btn btn-line" href="${waLink(t.form.msgIntro)}" rel="noopener">${icon('wa')} ${t.ui.whatsapp}</a></div>
  </div>
</section>

<section class="section" aria-labelledby="other-h">
  <div class="wrap"><h2 id="other-h" class="sr">${t.tours[other].name}</h2><div class="routes routes-one">${routeCard(t, other)}</div></div>
</section>`;
    return page({
      t, key: k, title: p.title, desc: p.desc, alternates: altsFor(k), body, ogImage: imgUrl(k === 'kleftiko' ? 'kleftiko' : 'polyaigos'),
      schema: graph(tripSchema(t, k), crumbs(t, [[t.ui.home, L('home')], [t.nav.cruises, L('cruises')], [t.nav[k], L(k)]])),
    });
  };
}
pages.kleftiko = tourPage('kleftiko');
pages.polyaigos = tourPage('polyaigos');

pages.cruises = (t) => {
  const p = t.pages.cruises;
  const L = (k) => routes[k][t.lang];
  const c = p.compare;
  const row = (label, f) => `<tr><th scope="row">${label}</th><td>${f('kleftiko')}</td><td>${f('polyaigos')}</td></tr>`;
  const body = `
${pageHero(t, p)}
<section class="section section-tight">
  <div class="wrap">
    <div class="routes">${routeCard(t, 'kleftiko')}${routeCard(t, 'polyaigos')}</div>
    <div class="table-wrap">
      <table class="compare">
        <thead><tr><td></td><th scope="col">${t.tours.kleftiko.name}</th><th scope="col">${t.tours.polyaigos.name}</th></tr></thead>
        <tbody>
          ${row(c.area, (k) => t.tours[k].area)}
          ${row(c.feel, (k) => t.tours[k].feel)}
          ${row(c.stops, (k) => t.tours[k].stops.map((s) => s.name).join(', '))}
          ${row(c.hours, (k) => t.tours[k].hours)}
          ${row(c.price, () => `${t.ui.from} ${money(t, minPrice)} ${t.ui.perBoat}`)}
        </tbody>
      </table>
    </div>
  </div>
</section>
<div class="facts-band">${facts(t)}</div>
${faqBlock(t, t.pages.home.faqTitle)}`;
  return page({
    t, key: 'cruises', title: p.title, desc: p.desc, alternates: altsFor('cruises'), body,
    schema: graph(
      { '@type': 'ItemList', itemListElement: ['kleftiko', 'polyaigos'].map((k, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(L(k)), name: t.tours[k].name })) },
      crumbs(t, [[t.ui.home, L('home')], [t.nav.cruises, L('cruises')]]),
    ),
  });
};

pages.pricing = (t) => {
  const p = t.pages.pricing;
  const L = (k) => routes[k][t.lang];
  const rows = site.pricing.months.map((r) => `<tr><th scope="row">${[r.months[0], r.months.at(-1)].filter((m, i, a) => a.indexOf(m) === i).map((m) => cap(monthName(t, m))).join(' – ')}${r.untilDay ? ` <small>(${p.until15})</small>` : ''}</th><td>${money(t, r.price)}</td><td>+ ${money(t, site.pricing.extraGuest)}</td></tr>`).join('');
  const body = `
${pageHero(t, p)}
<section class="section section-tight">
  <div class="wrap price-grid">
    <div>
      ${priceStrip(t)}
      <div class="table-wrap"><table class="prices">
        <thead><tr><th scope="col">${p.month}</th><th scope="col">${p.price}</th><th scope="col">${p.extra}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p class="small">${p.note} ${t.ui.vatIncl}.</p>
      <div class="note-box"><h3>${p.cancelTitle}</h3><p>${p.cancelText} <a href="${L('cancellation')}">${t.nav.cancellation}</a></p></div>
    </div>
    <aside class="incl">
      <h2>${t.included.title}</h2>
      <ul class="ticks">${t.included.food.map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul>
      <ul class="ticks">${t.included.aboard.slice(0, 6).map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul>
    </aside>
  </div>
</section>
<section class="section book-band" id="book" aria-label="${t.form.title}">
  <div class="wrap narrow">${bookingForm(t)}</div>
</section>`;
  return page({
    t, key: 'pricing', title: p.title, desc: p.desc, alternates: altsFor('pricing'), body,
    schema: graph(
      {
        '@type': 'OfferCatalog', name: p.h1, itemListElement: site.pricing.months.map((r) => ({
          '@type': 'Offer', priceCurrency: 'EUR', price: r.price, name: r.months.map((m) => cap(monthName(t, m))).join(', '),
          description: `${t.pages.pricing.price}. ${t.ui.vatIncl}.`, seller: { '@id': site.domain + '/#business' },
        })),
      },
      crumbs(t, [[t.ui.home, L('home')], [t.nav.pricing, L('pricing')]]),
    ),
  });
};

pages.about = (t) => {
  const p = t.pages.about;
  const L = (k) => routes[k][t.lang];
  const b = site.boat;
  const s = p.specs;
  const specs = [[s.model, b.model], [s.built, b.built], [s.length, b.length], [s.beam, b.beam], [s.draft, b.draft], [s.cabins, b.cabins], [s.wc, b.wc], [s.passengers, `${b.passengers} (+2 crew)`], [s.engine, b.engine], [s.speed, b.speed], [s.flag, s.flagVal]];
  const body = `
${pageHero(t, p, 'hero')}
<section class="section">
  <div class="wrap about-grid">
    <div class="prose">
      ${p.body.map((x) => `<p>${x}</p>`).join('')}
      <h2>${p.safetyTitle}</h2>
      <p>${p.safety}</p>
    </div>
    ${pic('deck', site.name, { sizes: '(min-width: 900px) 40vw, 100vw', cls: 'about-img' })}
  </div>
</section>
<section class="section boat">
  <div class="wrap about-grid">
    <div>
      <h2>${p.boatTitle}</h2>
      <p>${p.boatText}</p>
      <dl class="specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    </div>
    ${pic('boat', `${b.name} – ${b.model}`, { sizes: '(min-width: 900px) 40vw, 100vw', cls: 'about-img' })}
  </div>
</section>
<section class="section custom-band"><div class="wrap narrow center">
  <h2>${t.custom.title}</h2><p>${t.custom.text}</p>
  <div class="btn-row center"><a class="btn btn-sun" href="${L('contact')}">${t.ui.book}</a></div>
</div></section>`;
  return page({
    t, key: 'about', title: p.title, desc: p.desc, alternates: altsFor('about'), body, ogImage: imgUrl('boat'),
    schema: graph(
      { ...businessSchema(t), description: p.desc },
      { '@type': 'AboutPage', url: abs(L('about')), name: p.title, about: { '@id': site.domain + '/#business' } },
      crumbs(t, [[t.ui.home, L('home')], [t.nav.about, L('about')]]),
    ),
  });
};

pages.gallery = (t) => {
  const p = t.pages.gallery;
  const L = (k) => routes[k][t.lang];
  const body = `
${pageHero(t, p)}
<section class="section section-tight">
  <div class="wrap">
    <div class="gallery" data-lightbox data-labels='${esc(JSON.stringify({ prev: t.ui.prev, next: t.ui.next, close: t.ui.closePhoto, of: t.ui.of }))}'>
      ${gallery.map((g, i) => { const info = imgInfo(g.key); return `<a href="${info.src}" data-full="${info.src}">${pic(g.key, `${p.alt} – ${t.ui.photo} ${i + 1}`, { sizes: '(min-width: 900px) 25vw, 50vw' })}</a>`; }).join('')}
    </div>
    <p class="ig-link"><a href="${site.instagram}" rel="noopener" target="_blank">${icon('ig')} ${t.ui.instagram}</a></p>
  </div>
</section>`;
  return page({
    t, key: 'gallery', title: p.title, desc: p.desc, alternates: altsFor('gallery'), body,
    schema: graph(
      { '@type': 'ImageGallery', name: p.title, url: abs(L('gallery')), image: gallery.map((g) => (imgInfo(g.key).src.startsWith('http') ? imgInfo(g.key).src : abs(imgInfo(g.key).src))) },
      crumbs(t, [[t.ui.home, L('home')], [t.nav.gallery, L('gallery')]]),
    ),
  });
};

pages.contact = (t) => {
  const p = t.pages.contact;
  const L = (k) => routes[k][t.lang];
  const body = `
${pageHero(t, p)}
<section class="section section-tight">
  <div class="wrap contact-grid">
    <div class="book-card">${bookingForm(t, { withHeading: false })}</div>
    <aside class="contact-aside">
      <h2>${p.directTitle}</h2>
      <ul class="contact-list">
        <li><a class="btn btn-wa" href="${waLink(t.form.msgIntro)}" rel="noopener">${icon('wa')} WhatsApp</a></li>
        <li><a href="${viberLink}">${icon('viber')} Viber</a></li>
        <li><a href="tel:${site.phone}">${icon('phone')} ${site.phoneDisplay}</a></li>
        <li><a href="mailto:${site.email}">${icon('mail')} ${site.email}</a></li>
        <li>${icon('clock')} ${site.hours}</li>
      </ul>
      <h2>${p.meetTitle}</h2>
      <p>${p.meetText}</p>
      <p><a class="link-arrow" href="${site.mapsUrl}" rel="noopener" target="_blank">${p.openMap} ${icon('arrow')}</a></p>
      <p class="small"><a href="${L('cancellation')}">${t.nav.cancellation}</a></p>
    </aside>
  </div>
</section>`;
  return page({
    t, key: 'contact', title: p.title, desc: p.desc, alternates: altsFor('contact'), body,
    schema: graph(businessSchema(t), { '@type': 'ContactPage', url: abs(L('contact')), name: p.title }, crumbs(t, [[t.ui.home, L('home')], [t.nav.contact, L('contact')]])),
  });
};

pages.cancellation = (t) => {
  const p = t.pages.cancellation;
  const L = (k) => routes[k][t.lang];
  const body = `
${pageHero(t, p)}
<section class="section section-tight"><div class="wrap narrow prose">
  <ul class="policy">${p.items.map((x) => `<li>${x}</li>`).join('')}</ul>
  <p><a class="btn btn-sun" href="${L('contact')}">${t.ui.book}</a></p>
</div></section>`;
  return page({ t, key: 'cancellation', title: p.title, desc: p.desc, alternates: altsFor('cancellation'), body, schema: graph(crumbs(t, [[t.ui.home, L('home')], [t.nav.cancellation, L('cancellation')]])) });
};

pages.blog = (t) => {
  const p = t.pages.blog;
  const L = (k) => routes[k][t.lang];
  const posts = POSTS[t.lang];
  const fmt = (d) => new Intl.DateTimeFormat(t.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
  const body = `
${pageHero(t, p)}
<section class="section section-tight"><div class="wrap">
  ${posts.length ? `<ul class="posts">${posts.map((x) => `<li>
    ${x.image ? `<a class="post-img" href="${x.path}" tabindex="-1" aria-hidden="true"><img src="${x.image}" alt="" loading="lazy" decoding="async" width="800" height="533"></a>` : ''}
    <div><time datetime="${x.date}">${fmt(x.date)}</time><h2><a href="${x.path}">${x.title}</a></h2>${x.excerpt ? `<p>${x.excerpt}</p>` : ''}</div>
  </li>`).join('')}</ul>` : `<p>${p.empty}</p>`}
</div></section>`;
  return page({ t, key: 'blog', title: p.title, desc: p.desc, alternates: altsFor('blog'), body, noindex: !posts.length, schema: graph({ '@type': 'Blog', url: abs(L('blog')), name: p.title, inLanguage: t.lang }, crumbs(t, [[t.ui.home, L('home')], [t.nav.blog, L('blog')]])) });
};

function postPage(t, post) {
  const L = (k) => routes[k][t.lang];
  const fmt = new Intl.DateTimeFormat(t.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(post.date));
  const body = `
<article class="post">
  <header class="page-hero"><div class="wrap narrow">
    <p class="post-meta"><a href="${L('blog')}">${t.nav.blog}</a> · <time datetime="${post.date}">${fmt}</time></p>
    <h1>${post.title}</h1>
  </div></header>
  ${post.image ? `<div class="wrap narrow"><img class="post-hero" src="${post.image}" alt="${esc(post.title)}" width="1200" height="800" fetchpriority="high"></div>` : ''}
  <div class="wrap narrow prose">${post.html}</div>
</article>
<section class="section custom-band"><div class="wrap narrow center">
  <h2>${t.pages.home.routesTitle}</h2>
  <div class="btn-row center"><a class="btn btn-sun" href="${L('kleftiko')}">${t.nav.kleftiko}</a><a class="btn btn-line" href="${L('polyaigos')}">${t.nav.polyaigos}</a></div>
</div></section>`;
  return page({
    t, key: 'post', title: post.seoTitle || `${post.title} | ${site.name}`, desc: post.desc || post.excerpt || '', canonical: post.path, body, ogType: 'article', ogImage: post.image ? (post.image.startsWith('http') ? post.image : abs(post.image)) : undefined,
    schema: graph(
      { '@type': 'BlogPosting', headline: post.title, datePublished: post.date, dateModified: post.modified || post.date, inLanguage: t.lang, image: post.image ? (post.image.startsWith('http') ? post.image : abs(post.image)) : undefined, author: { '@type': 'Organization', name: site.name }, publisher: { '@id': site.domain + '/#business' }, mainEntityOfPage: abs(post.path) },
      crumbs(t, [[t.ui.home, L('home')], [t.nav.blog, L('blog')], [post.title, post.path]]),
    ),
  });
}

// ───────── write ─────────
function write(urlPath, html) {
  const file = urlPath.endsWith('/') ? path.join(OUT, urlPath, 'index.html') : path.join(OUT, urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyDir(s, d); }
    else if (!e.name.endsWith('.json') || !s.includes(path.sep + 'img' + path.sep)) fs.copyFileSync(s, d);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(PUBLIC, OUT);
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'assets/styles.css'), CSS);
fs.writeFileSync(path.join(OUT, 'assets/main.js'), JS);

const sitemapEntries = [];
let count = 0;
for (const l of langs) {
  const t = T[l];
  for (const key of Object.keys(pages)) {
    write(routes[key][l], pages[key](t));
    count++;
    if (key === 'blog' && !POSTS[l].length) continue;
    sitemapEntries.push({ loc: routes[key][l], alts: altsFor(key), priority: key === 'home' ? '1.0' : ['kleftiko', 'polyaigos', 'pricing', 'contact'].includes(key) ? '0.9' : '0.6' });
  }
  for (const post of POSTS[l].filter((p) => !p.seed)) {
    write(post.path, postPage(t, post));
    count++;
    sitemapEntries.push({ loc: post.path, lastmod: post.modified || post.date, priority: '0.5' });
  }
}

// 404
{
  const t = T.en, p = t.pages.notFound;
  const body = `<section class="page-hero nf"><div class="wrap narrow center">
    <h1>${p.h1}</h1><p class="hero-lead">${p.text}</p>
    <div class="btn-row center"><a class="btn btn-sun" href="/">${p.cta}</a></div>
    <p class="nf-langs">${langs.filter((l) => l !== 'en').map((l) => `<a href="${routes.home[l]}" lang="${l}">${T[l].pages.notFound.cta}</a>`).join('')}</p>
  </div></section>`;
  write('/404.html', page({ t, key: '404', title: p.title, desc: p.text, canonical: '/404.html', body, noindex: true }));
}

// sitemap.xml with hreflang
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.map((e) => `  <url>
    <loc>${abs(e.loc)}</loc>
    <lastmod>${e.lastmod || BUILD_DATE}</lastmod>
    <priority>${e.priority}</priority>${e.alts ? '\n' + langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(e.alts[l])}"/>`).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(e.alts.en)}"/>` : ''}
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sm);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /wp-admin/\n\nSitemap: ${site.domain}/sitemap.xml\n`);

// Netlify / Cloudflare Pages redirects
fs.writeFileSync(path.join(OUT, '_redirects'), redirects.map(([a, b]) => `${a}  ${b}  301`).join('\n') + '\n');
// Netlify headers (caching + security)
fs.writeFileSync(path.join(OUT, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/img/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`);
// Apache (.htaccess) – for classic hosting via FTP
const ht = `# Milos Sail Ways – Apache config
ErrorDocument 404 /404.html
Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
RewriteEngine On
# Force HTTPS and no-www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteRule ^(.*)$ https://milossailways.gr/$1 [R=301,L]
# Old WordPress URLs
${redirects.map(([a, b]) => {
  if (a.endsWith('*')) {
    const base = a.slice(1, -1).replace(/[.]/g, '\\.');
    const target = b.includes(':splat') ? b.replace(':splat', '$1') : b;
    return `RewriteRule ^${base}(.*)$ ${target} [R=301,L,NE]`;
  }
  if (a.includes('%')) return '';
  return `RewriteRule ^${a.slice(1).replace(/[.]/g, '\\.')}$ ${b} [R=301,L,NE]`;
}).filter(Boolean).join('\n')}
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/xml text/plain
</IfModule>
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/webp "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
ExpiresByType font/woff2 "access plus 1 year"
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType text/html "access plus 0 seconds"
</IfModule>
<IfModule mod_headers.c>
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`;
fs.writeFileSync(path.join(OUT, '.htaccess'), ht);

console.log(`✔ Built ${count + 1} pages in ${langs.length} languages → dist/`);
console.log(`  Images: ${fs.existsSync(path.join(PUBLIC, 'img')) ? 'local (optimised)' : 'remote (run npm run migrate to download)'}`);
console.log(`  Fonts:  ${fontsLocal ? 'self-hosted' : 'Google Fonts (run npm run migrate to self-host)'}`);
