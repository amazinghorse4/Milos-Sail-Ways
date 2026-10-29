# Milos Sail Ways – Website-Relaunch

Neue Website für [milossailways.gr](https://milossailways.gr) (private Segeltouren auf Milos).
Vier Design-Varianten zur Auswahl. Stand: 29.10.2026.

| Ordner | Was | Status |
|---|---|---|
| `variante-a/` | Klassisch, mit großen Fotos. **Komplette Website**: 41 Seiten in EN/EL/FR/ES, SEO, Preisrechner, Buchung per WhatsApp/E-Mail | Fertig gebaut, Fotos/Blog per `npm run migrate` |
| `variante-b/` | Elegant, kykladisch Blau-Weiß, interaktive Routenkarte | Nur Startseite (EN) |
| `variante-c/` | Sportlich, im Stil von sea-ibiza.com | Nur Startseite (EN) |
| `variante-d/` | „Der Segeltag zum Durchscrollen“: animiertes Meer, Weggabelung zu eigenen Seiten für Kleftiko und Polyaigos, Crew, Bewertungen | 3 Seiten (EN), SEO-fähig |
| `vorschau/` | Jede Variante als einzelne HTML-Datei zum Anschauen/Verschicken | Nur Vorschau, nicht hochladen |

## Variante A bauen

```bash
cd variante-a
npm install
npm run migrate   # Fotos, Schrift und Blog von der alten WordPress-Seite holen (solange sie online ist)
npm run build     # -> dist/
npm run preview   # http://localhost:8080
```

Details: `variante-a/README.md`

## Variante D bauen

```bash
cd variante-d/quelle
python3 build.py voyage-base.html ../website
```

- Bewertungen: `quelle/reviews.json` (Vorlage `reviews.example.json`). Nur echte Bewertungen, wortwörtlich.
- Crew: `quelle/crew.json` (Vorlage `crew.example.json`).
- Hochgeladen wird nur `website/`. Details: `variante-d/LIESMICH.txt`

## Offene Punkte

- Preise für die Saison 2027 eintragen (A: `src/site.mjs`, D: Texte in `quelle/build.py`)
- Echte Fotos einbinden; für D: Fotos vom Boot aus von Kleftiko, Sykia, Klima und Plaka
- Crew: Fotos, Rollen, Sprachen, Einverständnis
- Google-Unternehmensprofil und Bewertungslink
- Übersetzungen (EL/FR/ES) muttersprachlich gegenlesen lassen
- D: weitere Sprachen; die gewählte Variante final ausbauen
