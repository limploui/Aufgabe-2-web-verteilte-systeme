# CPDoS Security Lab

Dieses Projekt demonstriert zwei Cache-Poisoned-Denial-of-Service-Angriffe (CPDoS) in einer lokalen Docker-Umgebung.

## Angriffe

**1. HTTP Header-Oversize Attack (HHO)**

Bei diesem Angriff wird eine HTTP-Anfrage mit einem übergroßen Header gesendet. NGINX akzeptiert die Anfrage, während Apache sie aufgrund seiner geringeren Headergrößenbegrenzung mit `400 Bad Request` ablehnt.

**2. HTTP Meta Character Attack (HMC)**

Bei diesem Angriff wird ein ungültiges Steuerzeichen (`\x0B`) innerhalb eines HTTP-Headers übertragen. Die unterschiedliche Verarbeitung durch NGINX und Apache kann ebenfalls zu einer HTTP-400-Fehlerantwort führen.

In beiden Fällen kann die Fehlerantwort durch NGINX zwischengespeichert werden, sodass auch normale Anfragen vorübergehend einen Fehler erhalten.

## Verwendete Technologien

- Docker Compose – Verwaltung der Container
- NGINX – Reverse Proxy und Cache
- Apache HTTP Server – Backend-Webserver
- Node.js – Erzeugung und Übertragung der HTTP-Anfragen
- HTML und JavaScript – Benutzeroberfläche

## Installation und Start

Voraussetzung ist eine funktionierende Docker-Installation mit Docker Compose.

Repository klonen und in das Projektverzeichnis wechseln.

Anschließend die Container starten mit docker compose up -d

Die Benutzeroberfläche ist danach unter folgender Adresse erreichbar:

http://localhost:8080/index.html

## Durchführung

Über die HTML-Oberfläche können drei verschiedene HTTP-Anfragen ausgelöst werden:

- **Normal:** Sendet eine gewöhnliche HTTP-Anfrage.
- **HHO:** Sendet eine HTTP-Anfrage mit einem übergroßen Header von 10.000 Zeichen.
- **HMC:** Sendet eine HTTP-Anfrage mit dem Steuerzeichen `\x0B` im Headerwert.

Die Serverantworten werden direkt in der Benutzeroberfläche angezeigt.

## Cache-Verhalten

NGINX ist so konfiguriert, dass HTTP-Antworten mit den Statuscodes `200` und `400` für 20 Sekunden zwischengespeichert werden können.

Folgende Cache-Statuswerte sind relevant:

| Cache-Status | Bedeutung |
|---|---|
| MISS | Kein passender Cache-Eintrag vorhanden |
| HIT | Antwort wurde aus dem Cache ausgeliefert |
| EXPIRED | Cache-Eintrag vorhanden, aber abgelaufen |

Ein erfolgreicher CPDoS-Versuch kann durch folgende Abfolge nachgewiesen werden:

1. **Manipulierte Anfrage: 400 Bad Request – MISS**  
   Der Backend-Server lehnt die manipulierte Anfrage ab und NGINX speichert die Fehlerantwort im Cache.

2. **Normale Anfrage: 400 Bad Request – HIT**  
   Obwohl die Anfrage gültig ist, liefert NGINX die zuvor gespeicherte Fehlerantwort direkt aus dem Cache, ohne Apache erneut zu kontaktieren.

3. **Nach Ablauf der Cache-Dauer: 200 OK – EXPIRED oder MISS**  
   Nach 20 Sekunden ist die Fehlerantwort nicht mehr gültig. NGINX fragt die Ressource erneut bei Apache an, der die normale Anfrage mit 200 OK beantwortet.

## Docker beenden

Alle Container stoppen und entfernen: docker compose down
