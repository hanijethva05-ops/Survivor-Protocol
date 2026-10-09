// =========================
// HEALTH PICKUP
// =========================

let healthPickup = null;


// =========================
// CREATE HEALTH PICKUP
// =========================

function createHealthPickup(gameArea) {

    // Purana pickup remove karo
    if (healthPickup) {
        healthPickup.remove();
        healthPickup = null;
    }


    const pickup =
        document.createElement("div");

    pickup.className =
        "healthPickup";

    pickup.textContent =
        "❤️";


    // Random position

    const x =
        50 + Math.random() * 650;

    const y =
        120 + Math.random() * 300;


    pickup.style.left =
        x + "px";

    pickup.style.top =
        y + "px";


    gameArea.appendChild(
        pickup
    );


    healthPickup =
        pickup;
}


// =========================
// REMOVE HEALTH PICKUP
// =========================

function removeHealthPickup() {

    if (healthPickup) {

        healthPickup.remove();

        healthPickup = null;

    }

}

// =========================
// HEALTH POPUP
// =========================

function showHealthPopup(x, y, text) {

    const gameArea =
        document.getElementById("gameArea");

    if (!gameArea) {
        return;
    }


    const popup =
        document.createElement("div");

    popup.className =
        "healthPopup";

    popup.textContent =
        text;


    popup.style.left =
        x + "px";

    popup.style.top =
        y + "px";


    gameArea.appendChild(
        popup
    );


    setTimeout(function () {

        popup.remove();

    }, 800);

}