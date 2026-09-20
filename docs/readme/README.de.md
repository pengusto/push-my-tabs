[English](../../README.md) · Deutsch · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Français](README.fr.md)

> Diese Übersetzung wurde maschinell unterstützt und noch nicht von einer muttersprachlichen Person geprüft. Bei Abweichungen gilt die [englische README](../../README.md).

<table>
  <tr>
    <td width="184" align="center">
      <img src="../assets/molebyte-pixel.gif" alt="Molebyte winkt und hält dabei einen Browser-Tab" width="168">
    </td>
    <td>
      <h1>Push My Tabs</h1>
      <p>Layoutabhängige Tastenkürzel und schnelle Tab-Aktionen für Chrome und Firefox aus einem gemeinsamen Kern.</p>
    </td>
  </tr>
</table>

Nutzerrelevante Änderungen stehen in der [CHANGELOG.md](../../CHANGELOG.md).

- [Datenschutz](../../PRIVACY.md)
- [Support](https://github.com/pengusto/push-my-tabs/issues)
- [Website](https://pengusto.github.io/push-my-tabs/)

## Installation

- [Chrome Web Store](https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik) für Chrome 127 oder neuer
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/push-my-tabs/) für Firefox 142 oder neuer

## Aktueller Stand

Die Release-Pakete für Chrome und Firefox verwenden denselben getesteten Quellcode. Ab Firefox 142 nutzt die Erweiterung die exakte Einstellung für vertikale Tabs und erlaubt das Bearbeiten unterstützter Befehls-Tastenkürzel direkt in den Einstellungen.

Popup und Einstellungsseite zeigen die vier Richtungskürzel mit ihrer aktuellen Browserbelegung. Optionale Kürzel bleiben in einem separaten eingeklappten Bereich. Das Popup bietet außerdem Schnellaktionen, um zum ersten oder letzten Tab zu wechseln, den aktuellen Tab zu verschieben, zu duplizieren, anzuheften, stummzuschalten oder in ein neues Fenster zu verschieben.

## Sprachen

Chrome und Firefox wählen die Sprache der Erweiterung automatisch anhand der Browser-Sprache. In den Einstellungen kann sie auch manuell gewählt werden. Push My Tabs enthält Englisch, Deutsch, Spanisch, Französisch, brasilianisches Portugiesisch, Italienisch, Polnisch, Türkisch, Japanisch, vereinfachtes Chinesisch, Arabisch, Russisch, Ukrainisch, Kurdisch (Kurmandschi) und Dari. Nicht unterstützte Browser-Sprachen verwenden Englisch.

## Lokaler Chrome-Test

Erstelle zuerst die entpackte Entwicklungsversion:

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
