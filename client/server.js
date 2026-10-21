
const http = require("node:http");
const { executeAttack } = require("./test");

const server = http.createServer(async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    if (req.url === "/api/attack" && req.method === "POST") {

        let body = "";

        for await (const chunk of req) {
            body += chunk;
        }

        const { attack } = JSON.parse(body);
        const result = await executeAttack(attack);

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
    }
});

server.listen(3000, "0.0.0.0");
