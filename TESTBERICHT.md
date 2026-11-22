# FRAME//ZERO v42 — Prüfbericht

**Bestanden:** Node.js-Syntaxprüfung für `app.js` und `sw.js`; Chromium-Inline-Tests für 390 px, 820 px und 1150 px: Dashboard geladen, Navigation sichtbar, Dock nach Scrollen an gleicher Position, Seitenwechsel Projekte/Home, keine JavaScript-Laufzeitfehler. ZIP-Integrität und vollständiges Entpacken geprüft.

**Einschränkung:** Direkte lokale Browsernavigation ist in der Testumgebung blockiert. Die Tests liefen deshalb mit eingebettetem HTML/CSS/JS und ohne Service Worker. Kein Test auf echter iPhone-Duo-Hardware bzw. Safari; daher keine Garantie für flackerfreies Verhalten auf diesem Gerät.

**Design-Trade-off:** GPU-intensive Blur-/Liquid-Glass-Dauereffekte sind deaktiviert; statische transparente Glasflächen bleiben. Die Timer-Ein- und Ausblendung ist kurz animiert.
