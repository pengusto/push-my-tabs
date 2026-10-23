<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="../assets/banner-themes/air-traffic-mobile-dark.png">
  <source media="(max-width: 600px) and (prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-mobile-light.png">
  <source media="(prefers-color-scheme: dark)" srcset="../assets/push-my-tabs-air-traffic.png">
  <source media="(prefers-color-scheme: light)" srcset="../assets/banner-themes/air-traffic-light.png">
  <img src="../assets/push-my-tabs-air-traffic.png" alt="Push My Tabs" width="100%">
</picture>

[English](../../README.md) · Deutsch · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> Diese Übersetzung wurde maschinell unterstützt und noch nicht von einer muttersprachlichen Person geprüft. Bei Abweichungen gilt die [englische README](../../README.md).

# Push My Tabs

**Tabs wechseln und verschieben, wie sie angeordnet sind.**

Für alle, die horizontale oder vertikale Tabs lieber per Tastatur bedienen.

## Installation

- [Chrome Web Store](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik) für Chrome 127 oder neuer
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/) für Firefox 142 oder neuer

[Website](https://pengusto.github.io/push-my-tabs/)

## Finde deinen Rhythmus

![Tabs wechseln → Aktiven Tab verschieben](../assets/penguin/tabs-demo.gif)

*Schematische Funktionsillustration des adaptiven Presets, keine Bildschirmaufnahme. Die Grafik enthält englische Beschriftungen; die Richtungen bezeichnen Erweiterungsbefehle. Weise deine bevorzugten Tastenkombinationen im Browser zu.*

[Statische Illustration](../assets/penguin/tabs-demo-poster.png)

| Horizontale Tabs | Vertikale Tabs |
| :--- | :--- |
| **Links / Rechts** → Tabs wechseln | **Oben / Unten** → Tabs wechseln |
| **Oben / Unten** → Aktiven Tab verschieben | **Links / Rechts** → Aktiven Tab verschieben |

Schnellaktionen: duplizieren, anheften, stummschalten, zum ersten oder letzten Tab wechseln oder in ein neues Fenster verschieben. Layout, Preset und optionale Tastenkürzel sind konfigurierbar.

<p align="center"><img src="../assets/penguin/mascot.png" width="132" alt="Ein Pinguin hält einen Tab mit einem Richtungspfeil"></p>

## Loslegen

1. Installiere die Erweiterung über einen der Store-Links oben.
2. Öffne das Popup: Es zeigt die vier Richtungsbefehle und ihre aktuellen Tastenkombinationen.
3. Passe die Kürzel im Browser an. Beginne mit dem adaptiven Preset und wähle bei Bedarf ein manuelles Layout.

Chrome schätzt das Layout anhand der Fenstergeometrie; eine offene Seitenleiste kann die Erkennung beeinflussen. Firefox 142+ liest seine Einstellung für vertikale Tabs direkt.

## Deine Tabs bleiben bei dir

Keine Konten, Analysen, Werbung oder Remote-Code. Einstellungen bleiben lokal im Browser. Chrome nutzt vorübergehend `activeTab` für lokale Layoutprofile; Firefox nutzt `storage` und `browserSettings`, ohne Seitendaten zu lesen.

[Datenschutz](../../PRIVACY.md) · [Support](https://github.com/pengusto/push-my-tabs/issues) · [Releases](https://github.com/pengusto/push-my-tabs/releases) · [Changelog](../../CHANGELOG.md)

<details>
<summary><strong>Sprachen, Entwicklung und Releases</strong></summary>

## Aktueller Stand

Die Release-Pakete für Chrome und Firefox verwenden denselben getesteten Quellcode. Ab Firefox 142 nutzt die Erweiterung die exakte Einstellung für vertikale Tabs und erlaubt das Bearbeiten unterstützter Befehls-Tastenkürzel direkt in den Einstellungen.

Popup und Einstellungsseite zeigen die vier Richtungskürzel mit ihrer aktuellen Browserbelegung. Optionale Kürzel bleiben in einem separaten eingeklappten Bereich. Das Popup bietet außerdem Schnellaktionen, um zum ersten oder letzten Tab zu wechseln, den aktuellen Tab zu verschieben, zu duplizieren, anzuheften, stummzuschalten oder in ein neues Fenster zu verschieben.

## Sprachen

Chrome und Firefox wählen die Sprache der Erweiterung automatisch anhand der Browser-Sprache. In den Einstellungen kann sie auch manuell gewählt werden. Push My Tabs enthält Englisch, Deutsch, Spanisch, Französisch, brasilianisches Portugiesisch, Italienisch, Polnisch, Türkisch, Japanisch, vereinfachtes Chinesisch, Arabisch, Russisch, Ukrainisch, Kurdisch (Kurmandschi) und Dari. Nicht unterstützte Browser-Sprachen verwenden Englisch.

## Lokaler Chrome-Test

Erstelle zuerst die entpackte Entwicklungsversion:

Im Repository-Hauptverzeichnis werden Node.js 22, `zip` und `unzip` benötigt. Eine Paketinstallation ist nicht nötig.

```sh
./scripts/build-chrome-dev.sh
```

1. Öffne `chrome://extensions`.
2. Aktiviere den **Entwicklermodus**.
3. Wähle **Entpackte Erweiterung laden** und dann `dist/chrome-dev`.
4. Prüfe die vier Richtungskürzel und weise optionale Kürzel unter `chrome://extensions/shortcuts` zu.
5. Öffne für die Nutzung im Inkognitomodus die Erweiterungsdetails und aktiviere **Im Inkognitomodus zulassen**. Das Popup erklärt dies, wenn die Einstellung fehlt. `⌘T` bleibt Chromes systemeigenes Kürzel für einen neuen Tab; verwende für die Tab-Positionierung den zugewiesenen Befehl für neue Tabs (empfohlen: `⌥T`).

## Prüfungen

```sh
node tests/layout.test.mjs
node tests/api.test.mjs
node tests/background.test.mjs
node tests/firefox.test.mjs
node tests/i18n.test.mjs
node tests/ui.test.mjs
jq empty manifests/chrome.json manifests/firefox.json
```

## Chrome-Release

Node.js 22, `zip` und `unzip` werden benötigt. Aus einem sauberen Checkout führt ein Befehl alle Prüfungen aus und erstellt `dist/push-my-tabs-chrome-<version>.zip`:

```sh
./scripts/build-chrome.sh
```

Wähle für eine dauerhaft geladene Entwicklungsversion einmal `dist/chrome-dev` unter `chrome://extensions` und aktualisiere sie nach `./scripts/build-chrome-dev.sh`.

## Firefox-Release

Firefox 142 oder neuer, Node.js 22, `npx`, `zip` und `unzip` werden benötigt. Der Build führt Mozillas angeheftetes `web-ext`-Linting aus. Das Firefox-Paket verlangt nur `storage` und `browserSettings` und erklärt, dass keine Daten erfasst oder übertragen werden.

```sh
./scripts/build-firefox.sh
```

## Manuelles GitHub-Release

Releases werden nicht bei jedem Push erstellt. Wähle im GitHub-Actions-Workflow **Create release** den genauen Branch oder Commit, gib ein Tag passend zu beiden Manifesten ein, zum Beispiel `v1.2.0`, und markiere es bei Bedarf als Vorabversion. Der Workflow baut beide Pakete und hängt die Chrome- und Firefox-ZIP-Dateien an ein gemeinsames GitHub Release.

Die Veröffentlichung in den Stores bleibt ein separater manueller Schritt. Chrome Web Store und Firefox Add-ons prüfen und veröffentlichen die passenden Archive; anschließend verwalten die Browser die Updates.

Getaggte Releases und die zugehörigen Chrome- und Firefox-Archive findest du auf der [GitHub-Releases-Seite](https://github.com/pengusto/push-my-tabs/releases).

Wie du mitarbeitest, steht in der [CONTRIBUTING.md](../../CONTRIBUTING.md). Sicherheitslücken meldest du privat nach der [SECURITY.md](../../SECURITY.md).

Die Erweiterung verwendet keine Host-Berechtigungen, Content-Skripte, Konten, Analysen, Werbung oder Remote-Code. Chromes Berechtigung `activeTab` gibt nach einem Tastenkürzel oder einer Popup-Aktion vorübergehend nur den aktuellen Tab frei, damit lokale Geometrieprofile für dessen Ursprung oder genauen Pfad angewendet werden können. Firefox fordert diese Berechtigung nicht an und liest keine Seitendaten.

</details>

## Lizenz

[MIT](../../LICENSE) · [Herkunft der README-Grafiken](../assets/README.md)
