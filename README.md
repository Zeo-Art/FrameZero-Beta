# FRAME//ZERO v41 – Stabilitätsupdate

- Rechenintensive Daueranimationen auf großen Glasflächen deaktiviert.
- Live-Timer-Animationen GPU-freundlicher: keine animierten Blur-/Filter-Effekte.
- Modal-Dialoge und Eingabefelder werden stabil dargestellt, auch beim Öffnen der Tastatur.
- Service Worker v41 aktualisiert HTML/CSS/JS nach Möglichkeit zuerst aus dem Netzwerk und verwendet nur offline die Cache-Kopie. Alte App-Caches werden beim Aktivieren entfernt.
- Alle bisherigen Projekte, Bilder, Old Projekts, Baustatistik, Drag & Drop und Timer-Sitzungen bleiben im bestehenden lokalen Datenschema erhalten.

**Update:** Alle Dateien gemeinsam auf denselben Hosting-Ort hochladen, danach die App einmal online neu laden. Bei hartnäckig veralteter Ansicht die PWA schließen und neu öffnen. Vorher JSON-Backup exportieren.
