# Das Schloss der verlorenen Jahreszeiten

Pixel-Art-Adventure im Stil klassischer Point-and-Click-Spiele. Eine einzige HTML-Datei, läuft offline im Browser:
`Das_Schloss_der_verlorenen_Jahreszeiten.html` einfach öffnen (Chrome, Firefox, Safari, Edge).

**Steuerung:** Linksklick gehen/benutzen · Rechtsklick ansehen · Gegenstand im Inventar (Maus an den unteren Rand) anklicken und dann auf ein Ziel oder einen zweiten Gegenstand klicken.
**Tasten:** I Inventar · J Tagebuch · M Karte · S Jahreszeit (nach dem Herz) · H Hotspots · F Vollbild · Esc Menü/Intro überspringen

**Umfang:** Comic-Intro, alle 19 Orte (Lager bis Adlerhorst), alle Rätsel und Figuren aus `Spielaufbau.md`, Tagebuch mit Hinweisen, gemalte Karte mit Nebel und Wegkristall-Schnellreise, Autosave und die drei Enden A/B/C.
Nicht enthalten: die geplanten v4-Erweiterungen (Köhlerei, Sternenhügel, Nebenaufgaben mit Album).

## Grafik
Alle Bilder stammen aus `Assets.zip` (GandalfHardcore-Packs, gemalte Karte und Icons): Hintergrund-Ebenen, Bäume, Dekor, Figuren-Schichtblätter, Medaillon.
Logische Auflösung 480×270, mit Faktor 2 auf eine 960×540-Leinwand gezeichnet. Der Text wird klein gerendert und hart geschwellt (Pixel-Schrift).
Lizenz der Pixel-Assets: Nutzung in Spielen erlaubt, **keine** Weitergabe der Assets selbst, **nicht** für KI-Training.

## Bauen
```
pip install pillow numpy scipy
python3 tools/build_assets.py Assets.zip build/assets.json   # schneidet Sprites, setzt Figuren zusammen, packt den Atlas
python3 tools/build.py                                      # src/ + Ressourcen -> Das_Schloss_der_verlorenen_Jahreszeiten.html
```
Quellen: `src/game_base.js` (Logik, Dialoge, Overlays), `src/art.js` (Sprites, Hintergründe, Figuren, Pixel-Text), `src/scenes1-3.js` (Orte), `src/ui.js` (Oberfläche, Karte, Intro, Enden).
