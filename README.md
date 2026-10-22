# CPDoS Security Lab

Dieses Projekt demonstriert zwei Cache-Poisoned-Denial-of-Service-Angriffe (CPDoS) in einer lokalen Docker-Umgebung.

Ziel ist es, sogenannte *Semantic Gaps* zwischen NGINX als Reverse Proxy und Apache als Backend-Webserver auszunutzen. Dabei werden Unterschiede in der Verarbeitung von HTTP-Anfragen verwendet, um Fehlerantworten im Cache zu speichern.

## Angriffe

### 1. HTTP Header-Oversize Attack (HHO)

Bei diesem Angriff wird eine HTTP-Anfrage mit einem übergroßen Header von 10.000 Zeichen gesendet.

NGINX akzeptiert die Anfrage, während Apache sie aufgrund seiner geringeren Headergrößenbegrenzung mit 400 Bad Request ablehnt.

### 2. HTTP Meta Character Attack (HMC)

Bei diesem Angriff wird das ungültige Steuerzeichen `\x0B` (Vertical Tab) innerhalb eines HTTP-Headers übertragen.

Die unterschiedliche Verarbeitung durch NGINX und Apache kann ebenfalls zu einer HTTP-400-Fehlerantwort führen.

In beiden Fällen kann NGINX die Fehlerantwort zwischenspeichern, sodass auch normale Anfragen vorübergehend eine Fehlermeldung erhalten.

## Verwendete Technologien

- **Docker Compose:** Verwaltung und Start der Container
- **NGINX:** Reverse Proxy und Cache
- **Apache HTTP Server:** Backend-Webserver
- **Node.js:** Erzeugung, Übertragung und Auswertung der HTTP-Anfragen
- **HTML und JavaScript:** Benutzeroberfläche zur Steuerung der Angriffe

## Installation und Start

Voraussetzung ist eine funktionierende Docker-Installation mit Docker Compose.

Container starten: 

```bash
docker compose up -d
```

Die Benutzeroberfläche ist danach unter folgender Adresse erreichbar:

http://localhost:8080/index.html

Die Testressource ist erreichbar unter:

http://localhost:8080/test.html

## Durchführung

Über die HTML-Oberfläche können drei verschiedene HTTP-Anfragen ausgelöst werden:

- **Normal:** Sendet eine gewöhnliche HTTP-Anfrage.
- **HHO:** Sendet eine HTTP-Anfrage mit einem übergroßen Header von 10.000 Zeichen.
- **HMC:** Sendet eine HTTP-Anfrage mit dem Steuerzeichen `\x0B` im Headerwert.

Nach dem Klick auf den HHO- oder HMC-Button wird die manipulierte Anfrage über Node.js an NGINX gesendet und die Serverantwort in der Benutzeroberfläche angezeigt.

Anschließend wird automatisch ein neuer Browser-Tab mit der Testressource `/test.html` geöffnet. Dadurch kann überprüft werden, ob die Fehlerantwort aus dem NGINX-Cache ausgeliefert wird.

### Untersuchung mit den Browser-Entwicklertools

1. Die Benutzeroberfläche öffnen und mit `F12` die Entwicklertools starten.
2. Zum Tab **Netzwerk (Network)** wechseln.
3. Einen Angriff über den HHO- oder HMC-Button auslösen.
4. Im neu geöffneten Tab die Netzwerkanfrage an `test.html` untersuchen.
5. Unter **Headers → Response Headers** den HTTP-Statuscode und den Header `X-Cache-Status` überprüfen.

Bei erfolgreichem Cache Poisoning erhält die normale Browseranfrage `400 Bad Request` mit `X-Cache-Status: HIT`.

## Cache-Verhalten

NGINX ist so konfiguriert, dass HTTP-Antworten mit den Statuscodes `200` und `400` für 20 Sekunden zwischengespeichert werden können.

Folgende Cache-Statuswerte sind relevant:

| MISS | Kein passender Cache-Eintrag vorhanden |
| HIT | Antwort wurde aus dem Cache ausgeliefert |
| EXPIRED | Cache-Eintrag vorhanden, aber abgelaufen |

### Ablauf eines erfolgreichen CPDoS-Angriffs

1. **Manipulierte Anfrage: 400 Bad Request – MISS**

   Der Backend-Server lehnt die manipulierte Anfrage ab. Da noch kein passender Cache-Eintrag vorhanden ist, wird die Fehlerantwort von NGINX übernommen und gemäß der Cache-Konfiguration zwischengespeichert.

2. **Normale Anfrage: 400 Bad Request – HIT**

   Obwohl die Anfrage gültig ist, liefert NGINX die zuvor gespeicherte Fehlerantwort direkt aus dem Cache, ohne Apache erneut zu kontaktieren. Dadurch ist die eigentlich erreichbare Ressource vorübergehend nicht verfügbar.

3. **Nach Ablauf der Cache-Dauer: 200 OK – EXPIRED oder MISS**

   Nach 20 Sekunden gilt die gespeicherte Fehlerantwort als abgelaufen. NGINX fragt die Ressource erneut bei Apache an, der die normale Anfrage mit `200 OK` beantwortet.

Die tatsächlichen Ergebnisse hängen vom Cache-Zustand und der verwendeten Softwarekonfiguration ab.

## Docker beenden

Alle Container stoppen und entfernen:

docker compose down