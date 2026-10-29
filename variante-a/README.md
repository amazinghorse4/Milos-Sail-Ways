# Milos Sail Ways – neue Website

Schnelle, statische Website in **4 Sprachen** (EN, EL, FR, ES) mit 41 Seiten.
Kein WordPress, keine Plugins, keine Datenbank: nichts, was gehackt werden oder veralten kann.

## Was drin ist

| Bereich | Details |
|---|---|
| Seiten | Startseite, Kreuzfahrten-Vergleich, Kleftiko, Polyaigos, Preise, Über uns, Galerie, Kontakt/Buchung, Storno, Blog, 404 – je Sprache |
| Buchung | Anfrageformular mit **Live-Preisrechner** (Datum + Personen). Wird per **WhatsApp** oder **E-Mail** fertig ausformuliert verschickt. Kein Server, keine Kosten. |
| Mobil | Feste Leiste unten mit „WhatsApp“ und „Buchen“, große Buttons, Menü für Daumenbedienung |
| SEO | Eigene Titel & Beschreibungen pro Seite und Sprache, `hreflang`, Sitemap mit allen Sprachen, `robots.txt`, Canonicals, Open Graph, strukturierte Daten (LocalBusiness, TouristTrip mit Preisen, FAQ, Breadcrumbs, BlogPosting) |
| Alte URLs | EN/EL/FR behalten die alten Adressen → Google-Rankings bleiben. Alte Links (`/en/…`, `/kleftiko-tour/`, `/tours/…`) werden per 301 umgeleitet. |
| Tempo | Kein Framework, ~25 KB CSS+JS, Bilder als WebP in 2 Größen, Lazy Loading |
| DSGVO | Keine Cookies, kein Tracking, Schrift wird selbst gehostet → kein Cookie-Banner nötig |

## In 4 Schritten online

Voraussetzung: [Node.js](https://nodejs.org) (Version 18 oder neuer).

```bash
npm install          # einmalig
npm run migrate      # holt Fotos, Schrift und alle Blog-Artikel von der ALTEN Seite
npm run build        # erzeugt die fertige Website im Ordner dist/
npm run preview      # Vorschau unter http://localhost:8080
```

> **Wichtig:** `npm run migrate` muss laufen, **solange die alte WordPress-Seite noch online ist.**
> Danach liegen alle Fotos in `public/img/` und die Artikel in `content/blog/` – die alte Seite wird nicht mehr gebraucht.

### Hochladen – Variante A (empfohlen, kostenlos): Netlify oder Cloudflare Pages
1. Konto anlegen, „Deploy manually“ wählen, den Ordner **`dist/`** hineinziehen.
2. Domain `milossailways.gr` im Dashboard verbinden (DNS-Einträge laut Anleitung beim Domain-Anbieter setzen).
3. Weiterleitungen (`_redirects`) und Caching (`_headers`) funktionieren automatisch.

### Hochladen – Variante B: beim bisherigen Hoster (FTP)
1. Die alte WordPress-Installation sichern und aus `public_html` entfernen.
2. **Inhalt** von `dist/` (inkl. der versteckten Datei `.htaccess`) per FTP nach `public_html` hochladen.

## Nach dem Livegang – Google

1. **Google Search Console**: Domain bestätigen → unter „Sitemaps“ `https://milossailways.gr/sitemap.xml` einreichen.
2. **Google Unternehmensprofil** (Google Maps) anlegen bzw. pflegen: Kategorie „Bootstour-Anbieter“, Website-Link, Fotos, Öffnungszeiten. Für Suchen wie „boat tour Milos“ ist das der größte Hebel.
3. **Bewertungen sammeln**: Nach jeder Tour den Gästen den Google-Bewertungslink schicken (WhatsApp). Mehr Bewertungen = bessere Platzierung. Bitte keine Bewertungen auf der Website erfinden.
4. Optional: Bing Webmaster Tools (Sitemap einreichen), TripAdvisor-Profil mit Link zur Website.

## Inhalte ändern

| Was | Wo |
|---|---|
| Preise, Telefon, E-Mail, Saison, Bootsdaten | `src/site.mjs` |
| Texte (je Sprache) | `src/i18n/en.mjs`, `el.mjs`, `fr.mjs`, `es.mjs` |
| Fotos tauschen/ergänzen | `src/site.mjs` → `images` / `gallery`, dann `npm run migrate images` |
| Design | `src/styles.css` |

Nach jeder Änderung: `npm run build` und `dist/` neu hochladen.

## Vor dem Livegang bitte prüfen

- [ ] **Preise 2027** in `src/site.mjs` eintragen (aktuell stehen die Preise der Saison 2026 drin).
- [ ] Bild-Beschreibungen (Alt-Texte) der Galerie: aktuell allgemein formuliert. Wer mag, beschreibt die Fotos genauer – gut für die Google-Bildersuche.
- [ ] Logo: Die Seite nutzt eine neue Wort-Bild-Marke. Soll das alte Logo bleiben, die Datei in `public/` legen und `logo()` in `build.mjs` anpassen.
- [ ] Migrierte Blog-Artikel einmal in der Vorschau durchklicken.
- [ ] Spanisch hat noch keine Blog-Artikel – der Blog-Link erscheint dort automatisch, sobald es welche gibt.
- [ ] Texte von einem Muttersprachler gegenlesen lassen (v. a. EL/FR/ES).
