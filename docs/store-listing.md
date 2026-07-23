# Push My Tabs store listing

## URLs

- Privacy: https://github.com/enis-uys/TabCompass/blob/main/PRIVACY.md
- Support: https://github.com/enis-uys/TabCompass/issues
- Source code: https://github.com/enis-uys/TabCompass

## English

### Short description

Switch and move tabs with directional shortcuts that follow horizontal or vertical tab layouts.

### Full description

Push My Tabs gives browser-managed arrow-key shortcuts a direction that matches your tab layout.

- Switch to the previous or next tab.
- Move the active tab backward or forward.
- Follow horizontal or vertical tabs automatically, or force either layout.
- Choose a built-in preset or create one custom mapping.
- Optionally wrap tab switching at the first and last tab.

Chrome does not expose its tab-strip orientation to extensions. Automatic mode therefore uses browser-window geometry and can mistake an open side panel for vertical tabs. If that happens, choose Horizontal or Vertical in the popup. Firefox reads the browser's official vertical-tabs setting instead.

Push My Tabs is free, advertising-free, local-only, and open source under the MIT License. It has no accounts, analytics, telemetry, remote code, host permissions, or content scripts. It does not read page content, URLs, or browsing history. Only extension settings are stored in local browser storage.

### Permission explanations

**Chrome — `storage`:** Saves the selected layout mode, shortcut preset, custom mapping, tab-switching preference, and language preference locally in the browser.

**Firefox — `storage`:** Saves the same extension settings locally in the browser.

**Firefox — `browserSettings`:** Reads Firefox's official vertical-tabs setting so Automatic mode can select the correct horizontal or vertical mapping. Push My Tabs does not change browser settings.

### Reviewer instructions

1. Open the extension settings and verify the Layout mode and Shortcut preset controls.
2. Assign any unassigned command shortcuts. In Chrome, use `chrome://extensions/shortcuts`; in Firefox, edit supported shortcuts directly in the settings page.
3. Open several tabs and invoke the four directional commands. The Follow layout preset switches tabs on the visible layout axis and moves tabs on the other axis.
4. Change Layout mode to Horizontal or Vertical to verify the manual override.
5. In Chrome, note that Automatic mode is a geometry-based heuristic; an open side panel can require the manual override. In Firefox, Automatic mode reads the official vertical-tabs setting.

No account, network service, payment, or external test credential is required.

## Deutsch

### Kurzbeschreibung

Wechsle und verschiebe Tabs mit Richtungstasten passend zu horizontalen oder vertikalen Tab-Leisten.

### Vollständige Beschreibung

Push My Tabs gibt browserverwalteten Richtungstasten eine Belegung, die zum sichtbaren Tab-Layout passt.

- Zum vorherigen oder nächsten Tab wechseln.
- Den aktiven Tab zurück oder vor verschieben.
- Horizontalen oder vertikalen Tabs automatisch folgen oder ein Layout fest vorgeben.
- Ein mitgeliefertes Preset wählen oder eine eigene Zuordnung erstellen.
- Tabwechsel am ersten und letzten Tab optional fortsetzen.

Chrome stellt Erweiterungen die Ausrichtung der Tab-Leiste nicht bereit. Der automatische Modus nutzt deshalb die Geometrie des Browserfensters und kann eine geöffnete Seitenleiste mit vertikalen Tabs verwechseln. In diesem Fall lässt sich im Popup Horizontal oder Vertikal fest vorgeben. Firefox liest stattdessen die offizielle Browser-Einstellung für vertikale Tabs.

Push My Tabs ist kostenlos, werbefrei, lokal und unter der MIT-Lizenz quelloffen. Es gibt keine Konten, Analysen, Telemetrie, extern geladenen Code, Host-Berechtigungen oder Content-Skripte. Die Erweiterung liest weder Seiteninhalte noch URLs oder den Browserverlauf. Nur Erweiterungseinstellungen werden im lokalen Browser-Speicher abgelegt.

### Erklärungen der Berechtigungen

**Chrome — `storage`:** Speichert Layout-Modus, Shortcut-Preset, eigene Zuordnung, Tabwechsel-Einstellung und Spracheinstellung lokal im Browser.

**Firefox — `storage`:** Speichert dieselben Erweiterungseinstellungen lokal im Browser.

**Firefox — `browserSettings`:** Liest die offizielle Firefox-Einstellung für vertikale Tabs, damit der automatische Modus die passende horizontale oder vertikale Zuordnung wählen kann. Push My Tabs verändert keine Browser-Einstellungen.

### Hinweise für die Prüfung

1. Erweiterungseinstellungen öffnen und die Steuerelemente für Layout-Modus und Shortcut-Preset prüfen.
2. Nicht belegte Befehlstasten zuweisen. In Chrome dafür `chrome://extensions/shortcuts` verwenden; in Firefox lassen sich unterstützte Befehlstasten direkt in den Einstellungen bearbeiten.
3. Mehrere Tabs öffnen und die vier Richtungsbefehle ausführen. Das Preset Layout folgen wechselt Tabs auf der sichtbaren Layout-Achse und verschiebt Tabs auf der anderen Achse.
4. Den Layout-Modus auf Horizontal oder Vertikal stellen, um die manuelle Vorgabe zu prüfen.
5. In Chrome ist der automatische Modus eine Geometrie-Heuristik; eine geöffnete Seitenleiste kann die manuelle Vorgabe erfordern. In Firefox liest der automatische Modus die offizielle Einstellung für vertikale Tabs.

Es sind weder Konto noch Netzwerkdienst, Zahlung oder externe Testzugangsdaten erforderlich.
