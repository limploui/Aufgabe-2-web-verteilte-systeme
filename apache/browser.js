const hho = document.getElementById("HHO");
const hmc = document.getElementById("HMC");
const normal = document.getElementById("NORMAL");
const output = document.getElementById("response");

async function sendAttack(attack, tab = null) {

    output.textContent = "Anfrage wird gesendet ...";

    try {
        const response = await fetch("http://localhost:3000/api/attack", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ attack })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Serverfehler");
        }

        // Antwort in der ursprünglichen HTML anzeigen
        output.textContent = JSON.stringify(result, null, 2);

        // Nur weiterleiten, wenn der Angriff eine 400 liefert
        if (tab && !tab.closed) {
            console.log("Browser-Ziel:", "http://localhost:8080/test.html");
            tab.location.replace("http://localhost:8080/test.html");
        }

    } catch (error) {
        output.textContent = "Fehler: " + error.message;

        if (tab && !tab.closed) {
            tab.close();
        }
    }
}

hho.addEventListener("click", () => {
    const tab = window.open("about:blank", "_blank");
    sendAttack("hho", tab);
});

hmc.addEventListener("click", () => {
    const tab = window.open("about:blank", "_blank");
    sendAttack("hmc", tab);
});

normal.addEventListener("click", () => {
    const tab = window.open("about:blank", "_blank");
    sendAttack("normal", tab);
});
