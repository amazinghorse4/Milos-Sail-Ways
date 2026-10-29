// ─────────────────────────────────────────────────────────────
//  Milos Sail Ways – central business data
//  Change prices, phone numbers, images etc. HERE, then run:  npm run build
// ─────────────────────────────────────────────────────────────

export const site = {
  name: 'Milos Sail Ways',
  domain: 'https://milossailways.gr',
  phone: '+306932977623',          // used for tel:, WhatsApp, Viber, schema
  phoneDisplay: '+30 693 297 7623',
  email: 'info@milossailways.gr',
  base: 'Mersinia, Milos',
  postalCode: '848 00',
  hours: '10:00–19:00',
  instagram: 'https://www.instagram.com/milos_sailways/',
  facebook: 'https://www.facebook.com/profile.php?id=61583559621736',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Adamas+port+Milos',
  owners: ['Nikos Mathioudakis', 'Minas Moraitis'],

  // Season (month/day). Booking form only accepts dates inside it.
  season: { start: [4, 1], end: [10, 15] },

  // Price for the whole boat, up to `baseGuests`. VAT included.
  // ⚠️ These are the 2026 prices – update for the new season.
  pricing: {
    baseGuests: 8,
    maxGuests: 10,
    extraGuest: 50,
    months: [
      { months: [4], price: 900 },
      { months: [5], price: 1000 },
      { months: [6], price: 1200 },
      { months: [7, 8, 9], price: 1300 },
      { months: [10], price: 1000, untilDay: 15 },
    ],
  },

  boat: {
    name: 'Kalypso',
    model: 'Dromor Triton 48',
    built: 1994,
    length: '14.02 m',
    beam: '4.46 m',
    draft: '2.30 m',
    cabins: 5,
    wc: 4,
    passengers: 10,
    engine: 'Yanmar 110 hp',
    speed: '8–10 kn',
    tender: 7,
  },
};

export const minPrice = Math.min(...site.pricing.months.map((m) => m.price));

// ─────────────────────────────────────────────────────────────
//  Images. `src` = original on the old WordPress site.
//  `npm run migrate` downloads them and creates optimised WebP
//  versions in /public/img – the build then uses those automatically.
//  `alt` per language: please refine with what is really in the photo.
// ─────────────────────────────────────────────────────────────
const U = 'https://milossailways.gr/wp-content/uploads/';

export const images = {
  hero: { src: U + '2026/01/1762365155181-scaled.jpg', w: 2560, h: 1707 },
  heroPortrait: { src: U + '2026/01/1762366561252.jpg', w: 1200, h: 1600 },
  kleftiko: { src: U + '2026/01/kleftiko-2.jpg', w: 1600, h: 1067 },
  polyaigos: { src: U + '2026/01/331.jpg', w: 1500, h: 1000 },
  polyaigos2: { src: U + '2026/01/poliaigos-2-e1769434502345.jpg', w: 1600, h: 1067 },
  boat: { src: U + '2026/02/1770061476092-1024x1024.jpg', w: 1024, h: 1024 },
  deck: { src: U + '2026/04/1770061475811-1024x1024.jpg', w: 1024, h: 1024 },
  boatPlan: { src: U + '2026/01/1762366561240.png', w: 1200, h: 600 },
};

// Gallery – originals (WordPress keeps the full-size file without the -300x225 suffix)
export const gallery = [
  '2026/02/1770061475664.jpg',
  '2026/02/1770061475682.jpg',
  '2026/02/1770061475713.jpg',
  '2026/02/DSC_3043.jpg',
  '2026/02/1770061475730.jpg',
  '2026/02/1770061475776.jpg',
  '2026/02/1770061475794.jpg',
  '2026/02/1770061475811.jpg',
  '2026/02/1770061476079.jpg',
  '2026/02/IMG-e672ad9e2e20815538c1abb92be62e0a-V.jpg',
  '2026/02/DSC_3065.jpg',
  '2026/07/IMG_20260709_143438.jpg',
  '2026/07/IMG-8ab87eca11ec6e583ecf41ef9f79756c-V.jpg',
  '2026/07/IMG-084e55cc3474461b49dbf7fb4304b514-V.jpg',
  '2026/07/IMG20260702122417.jpg',
  '2026/07/IMG-0365b70f091375599e7d44f02ff654b3-V.jpg',
  '2026/07/IMG-618ff205c8627411377218c5c896c1c6-V.jpg',
  '2026/07/IMG20260702134240.jpg',
  '2026/07/IMG-b39249b538eb9ad694c29b2ec87c5fd0-V.jpg',
  '2026/07/IMG-5233d16c1a7b523f4fb7664b3c863c25-V.jpg',
  '2026/07/IMG20260702150816.jpg',
  '2026/07/IMG-20260601-WA0000.jpg',
  '2026/07/IMG20260702162557.jpg',
  '2026/07/GOPR1786_1785240440666.jpg',
  '2026/07/GOPR1601_1785240440666.jpg',
].map((p, i) => ({ key: 'g' + (i + 1), src: U + p }));

// ─────────────────────────────────────────────────────────────
//  URLs per language. EN, EL and FR keep the OLD WordPress slugs
//  where they existed, so Google rankings carry over.
// ─────────────────────────────────────────────────────────────
export const langs = ['en', 'el', 'fr', 'es'];

export const routes = {
  home:         { en: '/',                     el: '/el/',                     fr: '/fr/',                     es: '/es/' },
  cruises:      { en: '/our-cruises/',         el: '/el/kroyazieres/',         fr: '/fr/nos-croisieres/',      es: '/es/cruceros/' },
  kleftiko:     { en: '/kleftiko-tour-milos/', el: '/el/kleftiko-milos-cruise/', fr: '/fr/kleftiko-milos-cruise/', es: '/es/tour-kleftiko-milos/' },
  polyaigos:    { en: '/polyaigos-tour/',      el: '/el/polyegos-milos/',      fr: '/fr/tour-de-polyaigos/',   es: '/es/tour-polyaigos/' },
  pricing:      { en: '/pricing/',             el: '/el/timokatalogos/',       fr: '/fr/tarifs/',              es: '/es/precios/' },
  about:        { en: '/about-us/',            el: '/el/sxetika-me-emas/',     fr: '/fr/a-propos-de-nous/',    es: '/es/sobre-nosotros/' },
  gallery:      { en: '/gallery/',             el: '/el/fotografies/',         fr: '/fr/galerie/',             es: '/es/galeria/' },
  contact:      { en: '/contact/',             el: '/el/epikoinonia/',         fr: '/fr/contact/',             es: '/es/contacto/' },
  cancellation: { en: '/cancellation-policy/', el: '/el/politiki-akyroseon/',  fr: '/fr/politique-dannulation/', es: '/es/politica-de-cancelacion/' },
  blog:         { en: '/blog/',                el: '/el/blog/',                fr: '/fr/blog/',                es: '/es/blog/' },
};

// Old WordPress URLs that no longer exist → new URL (301)
export const redirects = [
  ['/en/', '/'],
  ['/en/*', '/:splat'],
  ['/kleftiko-tour/', '/kleftiko-tour-milos/'],
  ['/tours/kleftiko/', '/contact/?route=kleftiko'],
  ['/tours/polyaigos-tour/', '/contact/?route=polyaigos'],
  ['/tours/*', '/contact/'],
  ['/el/πολιτική-ακυρώσεων/', '/el/politiki-akyroseon/'],
  ['/el/%cf%80%ce%bf%ce%bb%ce%b9%cf%84%ce%b9%ce%ba%ce%ae-%ce%b1%ce%ba%cf%85%cf%81%cf%8e%cf%83%ce%b5%cf%89%ce%bd/', '/el/politiki-akyroseon/'],
  ['/wp-admin/*', '/'],
  ['/wp-login.php', '/'],
];

// Blog posts (EN). `npm run migrate` pulls the full articles from WordPress
// into /content/blog and the build then creates the article pages at their
// old URLs. Until then the blog index shows this list.
export const blogSeed = [
  { path: '/2026/10/16/sarakiniko-milos-discover-the-islands/', date: '2026-10-16', title: 'Sarakiniko Milos: Discover the Island’s Extraordinary Lunar Landscape' },
  { path: '/2026/09/10/boat-trip-milos-september/', date: '2026-09-10', title: 'Why September Is an Ideal Month for a Boat Trip in Milos' },
  { path: '/2026/07/06/what-to-do-in-milos-in-august/', date: '2026-07-06', title: 'What to do in Milos in August: The ultimate guide to summer experiences' },
  { path: '/2026/07/06/gastronomy-of-milos/', date: '2026-07-06', title: 'The gastronomy of Milos: Flavours that complete the travel experience' },
  { path: '/2026/06/10/adamas-milos-port/', date: '2026-06-10', title: 'Adamas Milos: The Sea Gateway to Discover the Island' },
  { path: '/2026/05/14/chora-of-milos-plaka-guide/', date: '2026-05-14', title: 'Chora of Milos: Walking Through the Alleys and the Most Characteristic Spots' },
  { path: '/2026/04/22/venus-de-milo-history-milos/', date: '2026-04-22', title: 'Venus de Milo: The History of the Iconic Statue and Its Connection to Milos' },
  { path: '/2026/03/18/milos-sailing-tour-the-ultimate-way-to-explore/', date: '2026-03-18', title: 'Milos Sailing Tour: The Ultimate Way to Explore the Island by Sea' },
  { path: '/2026/01/28/milos-beaches-guide/', date: '2026-01-28', title: 'Milos beaches: A complete guide to the island’s most impressive shores' },
  { path: '/2026/01/28/polyaigos-milos/', date: '2026-01-28', title: 'Polyaigos Milos: The largest uninhabited island in the Aegean' },
  { path: '/2026/01/28/kleftiko-beach-milos/', date: '2026-01-28', title: 'Kleftiko Beach in Milos: The island’s ultimate sea destination' },
];
