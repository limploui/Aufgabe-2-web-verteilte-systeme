const hho = document.getElementById("HHO");
const hmc = document.getElementById("HMC");
const normal = document.getElementById("NORMAL");

async function sendAttack(attack) {
    const response = await fetch("http://localhost:3000/api/attack", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            attack: attack
        })
    });

    const result = await response.json();

    document.getElementById("response").textContent =
        JSON.stringify(result, null, 2);
}

hho.addEventListener("click", () => {
    sendAttack("hho");
});

hmc.addEventListener("click", () => {
    sendAttack("hmc");
});

normal.addEventListener("click", () => {
    sendAttack("normal");
});
