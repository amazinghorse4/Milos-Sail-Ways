#!/usr/bin/env node
// One-time migration from the old WordPress site. Run BEFORE switching the domain:
//   npm install
//   npm run migrate
// It downloads & optimises all photos, self-hosts the font (GDPR-friendly)
// and copies every blog post (EN/EL/FR/ES) word-for-word into /content/blog.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { images, gallery } from '../src/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WP = process.env.WP_URL || 'https://milossailways.gr';
const IMG = path.join(ROOT, 'public/img');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

let sharp;
try { sharp = (await import('sharp')).default; } catch { console.error('✖ sharp is missing. Run "npm install" first.'); process.exit(1); }

const only = process.argv[2]; // optional: images | fonts | blog
fs.mkdirSync(IMG, { recursive: true });

async function get(url, type = 'buffer') {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return type === 'json' ? r.json() : type === 'text' ? r.text() : Buffer.from(await r.arrayBuffer());
}

async function optimise(buf, key, widths = [800, 1600]) {
  const meta = await sharp(buf).metadata();
  let last = null;
  for (const w of widths) {
    if (w > 800 && meta.width < 1000) continue; // don't upscale small photos
    const out = path.join(IMG, `${key}-${w}.webp`);
    const info = await sharp(buf).rotate().resize({ width: Math.min(w, meta.width), withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
    last = info;
  }
  fs.writeFileSync(path.join(IMG, `${key}.json`), JSON.stringify({ w: last.width, h: last.height }));
  return last;
}

// ───────── 1. Images ─────────
async function migrateImages() {
  const all = [...Object.entries(images).map(([key, v]) => ({ key, src: v.src })), ...gallery];
  let ok = 0;
  for (const { key, src } of all) {
    const tries = [src, src.replace(/(\.\w+)$/, '-scaled$1')];
    let done = false;
    for (const url of tries) {
      try { await optimise(await get(url), key); done = true; ok++; process.stdout.write('.'); break; } catch { /* try next */ }
    }
    if (!done) console.warn(`\n⚠ Could not download ${key}: ${src}`);
  }
  console.log(`\n✔ Images: ${ok}/${all.length} optimised → public/img`);
}

// ───────── 2. Fonts (self-hosted, no Google request from visitors) ─────────
async function migrateFonts() {
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Commissioner:wght,FLAR,VOLM@300..800,0..100,0..100&display=swap';
  let css = await get(cssUrl, 'text');
  const dir = path.join(ROOT, 'public/fonts');
  fs.mkdirSync(dir, { recursive: true });
  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+\.woff2)\)/g)].map((m) => m[1]))];
  // keep only subsets we need: latin, latin-ext, greek
  const blocks = css.split('/* ').filter(Boolean).filter((b) => /^(latin|latin-ext|greek) \*\//.test(b));
  css = blocks.map((b) => '/* ' + b).join('');
  let i = 0;
  for (const u of urls) {
    if (!css.includes(u)) continue;
    const name = `commissioner-${++i}.woff2`;
    fs.writeFileSync(path.join(dir, name), await get(u));
    css = css.split(u).join(`/fonts/${name}`);
  }
  fs.writeFileSync(path.join(dir, 'fonts.css'), css);
  console.log(`✔ Fonts: ${i} files → public/fonts`);
}

// ───────── 3. Blog posts ─────────
const ent = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
const decode = (s = '') => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&(\w+);/g, (m, n) => ent[n] ?? m);
const strip = (s = '') => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

async function localImage(url, prefix) {
  try {
    const clean = url.split('?')[0];
    const key = 'blog/' + prefix + '-' + path.basename(clean).replace(/\.\w+$/, '').replace(/-\d+x\d+$/, '').replace(/[^\w-]/g, '').slice(0, 60);
    fs.mkdirSync(path.join(IMG, 'blog'), { recursive: true });
    const file = path.join(IMG, key + '-1200.webp');
    if (!fs.existsSync(file)) {
      const buf = await get(clean.replace(/-\d+x\d+(\.\w+)$/, '$1')).catch(() => get(clean));
      await sharp(buf).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 78 }).toFile(file);
    }
    return '/img/' + key + '-1200.webp';
  } catch (e) { console.warn('  ⚠ image', url, e.message); return url; }
}

function cleanHtml(html) {
  return html
    .replace(/<(script|style|noscript|iframe)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(class|style|id|data-[\w-]+|srcset|sizes|loading|decoding|fetchpriority)="[^"]*"/gi, '')
    .replace(/<\/?(div|span|section|figure|figcaption)[^>]*>/gi, '\n')
    .replace(new RegExp(WP.replace(/[.]/g, '\\.') + '(/(?!wp-content)[^"]*)', 'g'), '$1')
    .replace(/<p>\s*(&nbsp;)?\s*<\/p>/gi, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

async function migrateBlog() {
  const seen = new Map();
  const variants = ['', '&lang=all', '&lang=en', '&lang=el', '&lang=fr', '&lang=es', '&wpml_language=el', '&wpml_language=fr', '&wpml_language=es'];
  for (const v of variants) {
    for (let page = 1; page < 20; page++) {
      let posts;
      try { posts = await get(`${WP}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=wp:featuredmedia${v}`, 'json'); } catch { break; }
      if (!Array.isArray(posts) || !posts.length) break;
      posts.forEach((p) => seen.set(p.id, p));
      if (posts.length < 100) break;
    }
  }
  if (!seen.size) { console.warn('⚠ No posts found. Is the WordPress REST API (/wp-json) enabled?'); return; }
  let n = 0;
  for (const p of seen.values()) {
    const urlPath = new URL(p.link).pathname;
    const lang = (urlPath.match(/^\/(el|fr|es)\//) || [, 'en'])[1];
    const slug = decodeURIComponent(p.slug).replace(/[^\p{L}\p{N}-]/gu, '').slice(0, 80) || String(p.id);
    let html = cleanHtml(p.content.rendered);
    const imgs = [...new Set([...html.matchAll(/src="([^"]+wp-content\/uploads[^"]+)"/g)].map((m) => m[1]))];
    for (const u of imgs) html = html.split(u).join(await localImage(u, slug));
    const feat = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const yoast = p.yoast_head_json || {};
    const post = {
      path: urlPath,
      date: p.date.slice(0, 10),
      modified: (p.modified || p.date).slice(0, 10),
      title: decode(p.title.rendered),
      seoTitle: yoast.title ? decode(yoast.title) : '',
      desc: yoast.description ? decode(yoast.description) : strip(p.excerpt?.rendered).slice(0, 158),
      excerpt: strip(p.excerpt?.rendered).replace(/\s*\[…\]|\s*\[&hellip;\]/g, '…').slice(0, 180),
      image: feat ? await localImage(feat, slug) : '',
      html,
    };
    const dir = path.join(ROOT, 'content/blog', lang);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, slug + '.json'), JSON.stringify(post, null, 2));
    n++;
    console.log(`  ${lang}  ${urlPath}`);
  }
  console.log(`✔ Blog: ${n} posts → content/blog (please skim them once in the browser)`);
}

if (!only || only === 'images') await migrateImages();
if (!only || only === 'fonts') await migrateFonts().catch((e) => console.warn('⚠ Fonts:', e.message));
if (!only || only === 'blog') await migrateBlog();
console.log('\nDone. Now run:  npm run build');
