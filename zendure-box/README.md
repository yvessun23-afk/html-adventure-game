# Isolierte Winterbox für Zendure Hyper 2000 + 3× AB2000X

Inhalt dieses Ordners:

| Datei | Inhalt |
|---|---|
| `Zendure_Winterbox_Zeichnungen.pdf` | Alle 5 Blätter als PDF (A3 quer) |
| `01_explosionszeichnung.svg` | Explosionszeichnung mit Dämmung, Lüftern, Sensortasche |
| `02_schnitt_AA_senkrecht.svg` | Vertikalschnitt durch beide Lüfter, Luftführung |
| `03_schnitt_BB_CC_waagerecht.svg` | Horizontalschnitte auf Hyper- und Akku-Höhe |
| `04_details.svg` | Lüfter-Einbau, Kabelschlitze, Ecke, Deckel |
| `05_zuschnittplan.svg` | Zuschnitt auf 5 Platten |
| `build_drawings.py` | Erzeugt die SVGs. Maße oben im Skript anpassen, dann `python3 build_drawings.py` |

> **Wichtig – Maße nachmessen!** Die Gerätemaße sind Annahmen (Grundfläche 360 × 260 mm, Hyper 200 mm, je AB2000X 200 mm hoch, Stapel 800 mm). Bitte vor dem Zuschnitt mit Zollstock am echten Stapel prüfen (inkl. Stecker/Kabelbögen) und in `build_drawings.py` eintragen. Preise sind Richtwerte, keine Live-Preise – vor Ort bzw. online prüfen.

## Konzept

- **Wandring** aus 4 XPS-Platten (30 mm), stumpf verklebt, wird von oben über den fertig verkabelten Stapel gestülpt. Kein Boden am Ring, der Stapel steht auf einer losen Bodenplatte.
- **Innen 460 × 360 mm** → **50 mm Luftspalt** rundum, **70 mm** über dem Hyper. Außen 520 × 420 × 960 mm.
- **Zuluft-Lüfter** unten in der linken Wand (Mitte 110 mm über Boden), **Abluft-Lüfter** oben in der rechten Wand (Mitte 790 mm, auf Hyper-Höhe). Diagonale Anordnung → Querstrom durch die ganze Box, kein Kurzschluss.
- **Kabelschlitze**: offene Nuten am Rand der Rückwand (2× unten 80×70, 1× oben 100×60). Wand wird über die Kabel gestülpt, nichts wird abmontiert. Restspalt mit Schaumstoff/Bürstenstreifen schließen.
- **Deckel**: Stopfen (sitzt im Ring, 1 mm Spiel) + Deckelplatte mit Überstand, gehalten von 2 Klettbandschlaufen. Abnehmen = Klettband auf, hochheben.
- **Sensortasche** 40 × 40 × 12 mm in der Rückwand-Innenseite für den rechteckigen Aqara-Sensor (Zigbee funkt problemlos durch XPS).
- **Alle Lüfterkabel** laufen durch eine Ø 6 mm Bohrung nach außen; Netzteil und Schaltsteckdose bleiben außerhalb der Box, trocken.

## Dämmung: Empfehlung

**XPS (Styrodur-Art) 30 mm, Platte 1250 × 600 mm**, Kante glatt, geschlossenzellig.

- günstig, überall im Baumarkt, wasserabweisend (wichtig bei Kondensat/Regen)
- mit Cuttermesser oder Fuchsschwanz sauber zu schneiden, formstabil, druckfest genug für ca. 80 kg Stapel (ca. 8 kPa)
- Achtung beim Kleben: **keine lösemittelhaltigen Kleber** (lösen XPS auf) → Kleber mit Aufdruck „für Styropor/Styrodur geeignet“.
- Günstigere Alternative: EPS 30 mm (bröselig, saugt mehr Wasser). Bessere Dämmung: XPS 40/50 mm (Zuschnittplan dann neu rechnen).
- Brandschutz: XPS ist brennbar (B1/E). Akkus (LFP) nicht direkt an die Dämmung, Luftspalt beibehalten, Box nicht im Wohnraum, Rauchmelder in der Nähe.
- Realistisch: 30 mm XPS puffert Temperaturschwankungen und hält Frost/Wind ab; sie „heizt“ nicht. Nur die Abwärme des Systems hilft. Betriebs- und Ladetemperaturgrenzen laut Zendure-Datenblatt prüfen (Laden bei Frost eingeschränkt).

## Materialliste

| Pos. | Artikel | Menge | Bezug | Preis (Richtwert) |
|---|---|---|---|---|
| 1 | XPS-Dämmplatte 1250×600×30 mm | 5 | Bauhaus / Sonderpreis Baumarkt (Restposten oft günstiger) | 8–14 € je Platte, ca. 40–70 € |
| 2 | XPS-tauglicher Montage-/Styroporkleber, Kartusche | 1–2 | Bauhaus / Sonderpreis | 5–8 € je Stk. |
| 3 | Alu-Klebeband 50 mm, 25 m | 1 | Bauhaus | 8–12 € |
| 4 | Lüftungsgitter Kunststoff mit Insektenschutz 150×150 mm | 2 | Bauhaus | 4–8 € je Stk. |
| 5 | Klettband-/Spanngurt 25 mm × 2 m | 2 | Bauhaus / Sonderpreis | 3–6 € je Stk. |
| 6 | Selbstklebendes Schaumstoff-Dichtband 3–6 mm, ca. 10 m | 1 | Bauhaus / Sonderpreis | 4–7 € |
| 7 | Schaumstoff- oder Bürstenstreifen für Kabelschlitze | 1 | Bauhaus | 4–8 € |
| 8 | Cuttermesser + Ersatzklingen (Abbrechklingen, 18 mm) | 1 | Bauhaus / Sonderpreis | 3–6 € |
| 9 | Kabelbinder, Wago 221 (2 Ader) | 1 Set | Bauhaus | 5–10 € |
| 10 | Hohlstecker-Adapter/Klemme 12 V oder Netzteil-Kabel mit Klemmen | 1 | Bauhaus/online | 3–6 € |
| 11 | PC-Lüfter 120 mm, 12 V (z. B. Arctic P12) | 2 | online (Amazon/Arctic) – Baumarkt führt selten passende | 6–10 € je Stk. |
| 12 | Netzteil 12 V / 2 A | 1 | online / ggf. Bauhaus | 8–12 € |
| 13 | Schalt-Steckdose mit HA-Anbindung (z. B. Shelly Plug S Gen3 oder Zigbee-Steckdose) | 1 | online | 15–25 € |
| 14 | Aqara Temperatur-/Feuchtesensor (rechteckig) | 1 (vorhanden) | – | – |

Geschätzt insgesamt ca. **110–190 €** (je nach Vorhandenem). Positionen 1–10 sind Baumarktware; 11–13 müssen online bestellt werden.

## Aufbau in 8 Schritten

1. Maße prüfen, ggf. in `build_drawings.py` ändern und Zeichnungen neu erzeugen.
2. Nach Blatt 5 zuschneiden: erst die Lüfteröffnungen 121 × 121 und Nuten, Sensortasche nur 12 mm tief (Cutter, dann Spachtel/Messer).
3. Lüftungsgitter außen auf die Öffnungen kleben, Lüfter von innen einpressen (Pfeilrichtung: links **ein**, rechts **aus**), innen Alu-Band rundum.
4. Lüfterkabel durch Ø 6 mm Bohrung nach außen führen, außen an 12-V-Netzteil (Wago).
5. Vier Wände stumpf verkleben (Seitenwände zwischen Vorder- und Rückwand), Ecken außen mit Alu-Band überkleben.
6. Bodenplatte (2 Hälften mit Alu-Band verbunden) unter den Stapel legen, Stapel wie bisher verkabeln.
7. Wandring von oben über den Stapel stülpen, Kabel in die Nuten legen, Nuten mit Schaumstoff schließen. Sensor in die Tasche kleben/stecken.
8. Dichtband auf die Oberkante, Stopfen einsetzen, Deckelplatte auflegen, 2 Klettbandschlaufen um die Box.

## Home-Assistant-Automation (Lüfter nur bei Bedarf)

Entities anpassen: `sensor.aqara_box_temperatur`, `sensor.aqara_box_feuchte`, `switch.luefter_steckdose`. Schwellen sind Startwerte: Hysterese verhindert Takten.

```yaml
alias: Zendure-Box Lüfter
mode: single
triggers:
  - trigger: numeric_state
    entity_id: sensor.aqara_box_temperatur
    above: 30
    for: "00:02:00"
    id: heiss
  - trigger: numeric_state
    entity_id: sensor.aqara_box_feuchte
    above: 75
    for: "00:10:00"
    id: feucht
  - trigger: numeric_state
    entity_id: sensor.aqara_box_temperatur
    below: 26
    for: "00:05:00"
    id: kuehl
  - trigger: numeric_state
    entity_id: sensor.aqara_box_feuchte
    below: 65
    for: "00:05:00"
    id: trocken
actions:
  - choose:
      - conditions:
          - condition: trigger
            id: [heiss, feucht]
        sequence:
          - action: switch.turn_on
            target: { entity_id: switch.luefter_steckdose }
      - conditions:
          - condition: trigger
            id: [kuehl, trocken]
          - condition: numeric_state
            entity_id: sensor.aqara_box_temperatur
            below: 26
          - condition: numeric_state
            entity_id: sensor.aqara_box_feuchte
            below: 65
        sequence:
          - action: switch.turn_off
            target: { entity_id: switch.luefter_steckdose }
```

Optional: zusätzlich Lüfter zwingend an, wenn die Hyper-Leistung hoch ist (Leistungssensor der Zendure-Integration), und Sicherheits-Aus bei Sensor „unavailable“ > 30 min (Lüfter dann dauerhaft an oder Warnung).

## Prompt für Bild-KI (GPT Image o. ä.)

```text
Technical exploded-view illustration (isometric, clean white background, engineering
drawing style with thin dark linework and subtle shading) of an insulated winter
enclosure for a home solar battery system: one Zendure Hyper 2000 inverter on top
of three stacked Zendure AB2000X batteries (grey/orange boxes). The enclosure is
made of 30 mm light-blue XPS foam insulation boards, shown exploded: a base board
on the bottom, the four wall panels pulled outward, an inner lid plug and a top lid
board with overhang floating above. Show the foam thickness clearly on the cut edges
with diagonal hatching. The left wall has a square cut-out with a 120 mm PC fan at
the bottom (blue arrow: fresh air in) and a plastic grille outside; the right wall has
a second 120 mm fan near the top (red arrow: air out). The back wall has three open
U-shaped cable slots on its edges and a small square pocket for a rectangular Aqara
temperature sensor. A visible 50 mm air gap surrounds the battery stack inside the
box. Two Velcro straps hold the lid. Add numbered callouts in German: 1 XPS-Dämmung 30 mm,
2 Zuluft-Lüfter, 3 Abluft-Lüfter, 4 Kabelschlitze, 5 Sensortasche, 6 Deckel-Stopfen,
7 Bodenplatte. Also provide a second panel showing a vertical cross-section through both
fans with hatched insulation walls, 50 mm air gaps and a dashed airflow path from the
lower left fan over the top of the Hyper to the upper right fan. Neutral colors,
no brand logos, no people, high resolution.
```
