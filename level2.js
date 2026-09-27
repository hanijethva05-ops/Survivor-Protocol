// ==========================================
// ZOMBIE SURVIVAL
// LEVEL 2 - FLOODED SUBWAY
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    

    // LEVEL 2 PROFILE DATA
    localStorage.setItem("currentLevel", "2");
    localStorage.setItem(
        "currentLocation",
        "SECTOR_02 // SUBWAY"
    );


    // ==========================================
    // ELEMENTS
    // ==========================================

    const gameWorld =
        document.getElementById("gameWorld");

    const player =
        document.getElementById("player");

    const floodWater =
        document.getElementById("floodWater");

    const generatorRoom =
        document.getElementById("generatorRoom");

    const generatorPrompt =
        document.getElementById("generatorPrompt");

    const controlRoom =
        document.getElementById("controlRoom");

    const computerPrompt =
        document.getElementById("computerPrompt");

    const escapeGate =
        document.getElementById("escapeGate");

    const escapePrompt =
        document.getElementById("escapePrompt");

    const objectiveText =
        document.getElementById("objectiveText");

    const sprinterContainer =
        document.getElementById("sprinterContainer");

    const flashlightText =
        document.getElementById("flashlightText");

    const waterText =
        document.getElementById("waterText");

    const bpm =
        document.getElementById("bpm");

    const vitalStatus =
        document.getElementById("vitalStatus");

    const signalStatus =
        document.getElementById("signalStatus");

    const magazineText =
        document.getElementById("magAmmo");

    const reserveText =
        document.getElementById("reserve");

    const missionComplete =
        document.getElementById("missionComplete");

    const nextLevelBtn =
        document.getElementById("nextLevelBtn");

    const levelFailed =
    document.getElementById("levelFailed");

    const restartLevelBtn =
    document.getElementById("restartLevelBtn");

    const returnHQBtn =
    document.getElementById("returnHQBtn");

    const zombiesKilledText =
    document.getElementById("zombiesKilled");

const xpAwardedText =
    document.getElementById("xpAwarded");

    const completeKillsText =
    document.getElementById("completeKills");

const completeXPText =
    document.getElementById("completeXP");


    // ==========================================
    // GAME STATE
    // ==========================================

    let playerX = 50;
    let playerY = 50;

    let playerHealth = 100;

    let currentBPM = 72;

    let magazine = 30;
    let reserveAmmo = 90;

    let flashlightOn = false;

    let sprinting = false;

    let gameRunning = true;

    let waterFlooded = true;

    let powerGridRestored = false;

    let trainRouteOverridden = false;

    let missionFinished = false;

    let lastDamageTime = 0;

    let zombiesKilled = 0;
    let xpAwarded = 200;


    // ==========================================
    // IMPORTANT
    // ==========================================
    // Array hona chahiye, const bhi chalega,
    // kyunki hum isme push kar sakte hain.

    const enemies = [];

    


    // ==========================================
    // KEYS
    // ==========================================

    const keys = {
        w: false,
        a: false,
        s: false,
        d: false
    };


    // ==========================================
    // DISTANCE
    // ==========================================

    function distanceTo(element) {

        if (!element) {
            return Infinity;
        }

        const worldRect =
            gameWorld.getBoundingClientRect();

        const rect =
            element.getBoundingClientRect();

        const objectX =
            (
                rect.left +
                rect.width / 2 -
                worldRect.left
            ) /
            worldRect.width *
            100;

        const objectY =
            (
                rect.top +
                rect.height / 2 -
                worldRect.top
            ) /
            worldRect.height *
            100;

        const dx =
            playerX - objectX;

        const dy =
            playerY - objectY;

        return Math.sqrt(
            dx * dx + dy * dy
        );
    }


    // ==========================================
    // KEYBOARD
    // ==========================================

    document.addEventListener(
        "keydown",
        function (event) {

            const key =
                event.key.toLowerCase();

            if (key === "w") {
                keys.w = true;
            }

            if (key === "a") {
                keys.a = true;
            }

            if (key === "s") {
                keys.s = true;
            }

            if (key === "d") {
                keys.d = true;
            }

            if (event.key === "Shift") {
                sprinting = true;
            }

            // F = FLASHLIGHT

            if (key === "f") {
                toggleFlashlight();
            }

            // E = OBJECTIVE

            if (key === "e") {
                objectiveAction();
            }

            // R = RELOAD

            if (key === "r") {
                reload();
            }

        }
    );


    // ==========================================
    // KEY RELEASE
    // ==========================================

    document.addEventListener(
        "keyup",
        function (event) {

            const key =
                event.key.toLowerCase();

            if (key === "w") {
                keys.w = false;
            }

            if (key === "a") {
                keys.a = false;
            }

            if (key === "s") {
                keys.s = false;
            }

            if (key === "d") {
                keys.d = false;
            }

            if (event.key === "Shift") {
                sprinting = false;
            }

        }
    );


    // ==========================================
    // MOVEMENT
    // ==========================================

    function updateMovement() {

        if (!gameRunning) {
            return;
        }

        let baseSpeed =
            sprinting
                ? 0.55
                : 0.28;


        // WATER FRICTION

        let speed =
            waterFlooded
                ? baseSpeed * 0.6
                : baseSpeed;


        let dx = 0;
        let dy = 0;


        if (keys.w) {
            dy -= speed;
        }

        if (keys.s) {
            dy += speed;
        }

        if (keys.a) {
            dx -= speed;
        }

        if (keys.d) {
            dx += speed;
        }


        // DIAGONAL NORMALIZATION

        if (dx !== 0 && dy !== 0) {

            dx *= 0.7071;
            dy *= 0.7071;

        }


        const nextX =
            Math.max(
                3,
                Math.min(
                    97,
                    playerX + dx
                )
            );


        const nextY =
            Math.max(
                5,
                Math.min(
                    95,
                    playerY + dy
                )
            );


        playerX = nextX;
        playerY = nextY;


        player.style.left =
            playerX + "%";

        player.style.top =
            playerY + "%";


        // SPRINTING IN WATER = NOISE

        if (
            waterFlooded &&
            sprinting &&
            (dx !== 0 || dy !== 0)
        ) {

            createNoise();

            alertNearbyZombies();

        }


        // BPM

        if (
            sprinting &&
            (dx !== 0 || dy !== 0)
        ) {

            currentBPM =
                Math.min(
                    155,
                    currentBPM + 0.5
                );

        } else {

            currentBPM =
                Math.max(
                    72,
                    currentBPM - 0.15
                );

        }


        updateVitals();

    }


    // ==========================================
    // VITALS
    // ==========================================

    function updateVitals() {

        if (bpm) {

            bpm.textContent =
                Math.round(currentBPM);

        }


        if (vitalStatus) {

            if (
                currentBPM > 125 ||
                playerHealth < 30
            ) {

                vitalStatus.textContent =
                    "CRITICAL";

            } else {

                vitalStatus.textContent =
                    "STABLE";

            }

        }

    }


    // ==========================================
    // FLASHLIGHT
    // ==========================================

    function toggleFlashlight() {

        flashlightOn =
            !flashlightOn;


        if (gameWorld) {

            gameWorld.classList.toggle(
                "flashlightON",
                flashlightOn
            );

        }


        if (flashlightText) {

            flashlightText.textContent =
                flashlightOn
                    ? "ON"
                    : "OFF";

        }

    }


    // ==========================================
    // OBJECTIVE SYSTEM
    // ==========================================

    function objectiveAction() {

        if (!gameRunning) {
            return;
        }


        // TASK 1

        if (!powerGridRestored) {

            const distance =
                distanceTo(generatorRoom);


            if (distance <= 10) {

                restorePower();

            } else {

                console.log(
                    "Move closer to the generator."
                );

            }

            return;

        }


        // TASK 2

        if (!trainRouteOverridden) {

            const distance =
                distanceTo(controlRoom);


            if (distance <= 10) {

                overrideTrainRoute();

            } else {

                console.log(
                    "Move closer to the control terminal."
                );

            }

            return;

        }


        // TASK 3

        const distance =
            distanceTo(escapeGate);


        if (distance <= 10) {

            completeMission();

        } else {

            console.log(
                "Move closer to the tunnel exit."
            );

        }

    }


    // ==========================================
    // TASK 1 - POWER
    // ==========================================

    function restorePower() {

        powerGridRestored =
            true;


        waterFlooded =
            false;


        // WATER OFF

        if (floodWater) {

            floodWater.style.opacity =
                "0.15";

        }


        if (waterText) {

            waterText.textContent =
                "DRAINING";

        }


        // GENERATOR

        if (generatorRoom) {

            generatorRoom.classList.add(
                "active"
            );

        }


        // OBJECTIVE

        if (objectiveText) {

            objectiveText.textContent =
                "POWER RESTORED → REACH CONTROL ROOM";

        }


        // SIGNAL

        if (signalStatus) {

            signalStatus.innerHTML =
                "SIGNAL: <span>POWER RESTORED</span>";

        }


        console.log(
            "MAIN POWER RESTORED"
        );


        // LIGHTS

        document.body.classList.add(
            "powerRestored"
        );

    }


    // ==========================================
    // TASK 2 - CONTROL ROOM
    // ==========================================

    function overrideTrainRoute() {

        trainRouteOverridden =
            true;


        if (controlRoom) {

            controlRoom.classList.add(
                "active"
            );

        }


        if (objectiveText) {

            objectiveText.textContent =
                "ROUTE OVERRIDDEN → ESCAPE TUNNEL";

        }


        if (escapeGate) {

            escapeGate.classList.add(
                "unlocked"
            );

        }


        if (signalStatus) {

            signalStatus.innerHTML =
                "SIGNAL: <span>ROUTE OVERRIDE</span>";

        }


        console.log(
            "TRAIN ROUTE OVERRIDDEN"
        );


        // SIREN

        playSiren();


        // SPRINTERS

        spawnSprinters();

    }


    // ==========================================
    // SPRINTER ZOMBIES
    // ==========================================

    function spawnSprinters() {

        if (!sprinterContainer) {
            return;
        }


        const positions = [

            [8, 30],
            [12, 70],
            [88, 25],
            [92, 70],
            [50, 12],
            [50, 88]

        ];


        positions.forEach(
            function (position) {

                const zombie =
                    document.createElement(
                        "div"
                    );


                zombie.className =
                    "sprinter";


                zombie.textContent =
                    "🧟";


                zombie.style.left =
                    position[0] + "%";


                zombie.style.top =
                    position[1] + "%";


                zombie.dataset.dead =
                    "false";


                zombie.dataset.alerted =
                    "true";


                zombie.dataset.hp =
                    "100";


                sprinterContainer.appendChild(
                    zombie
                );


                enemies.push(
                    zombie
                );

            }
        );


        console.log(
            "6 SPRINTER ZOMBIES SPAWNED"
        );

    }


    // ==========================================
    // ZOMBIE AI
    // ==========================================

    function updateEnemyAI() {

        if (!gameRunning) {
            return;
        }


        enemies.forEach(
            function (enemy) {

                if (
                    !enemy ||
                    enemy.dataset.dead ===
                    "true"
                ) {
                    return;
                }


                let ex =
                    parseFloat(
                        enemy.style.left
                    );


                let ey =
                    parseFloat(
                        enemy.style.top
                    );


                const dx =
                    playerX - ex;

                const dy =
                    playerY - ey;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                // ALERTED ZOMBIES

                if (
                    enemy.dataset.alerted ===
                    "true"
                ) {

                    // 2X FAST SPRINTER

                    const aiSpeed =
                        0.18;


                    if (distance > 1) {

                        ex +=
                            (dx / distance) *
                            aiSpeed;


                        ey +=
                            (dy / distance) *
                            aiSpeed;

                    }


                    enemy.style.left =
                        ex + "%";


                    enemy.style.top =
                        ey + "%";

                }


                // ATTACK

                if (distance < 4) {

                    zombieAttack();

                }

            }
        );

    }


    // ==========================================
    // ZOMBIE DAMAGE
    // ==========================================

    function zombieAttack() {

        const now =
            Date.now();


        if (
            now - lastDamageTime <
            900
        ) {
            return;
        }


        lastDamageTime =
            now;

           

        playerHealth -=
            10;


        currentBPM =
            Math.min(
                155,
                currentBPM + 20
            );


        updateVitals();


        if (signalStatus) {

            signalStatus.innerHTML =
                "SIGNAL: <span>INTERFERENCE</span>";

        }


        if (
    playerHealth <= 0
) {

    failLevel();

}

    }

    // ==========================================
// LEVEL 2 FAILED
// ==========================================

function failLevel() {

    if (missionFinished) {
        return;
    }

    gameRunning = false;

    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;

    if (signalStatus) {

        signalStatus.innerHTML =
            "SIGNAL: <span>TERMINATED</span>";

    }

    if (objectiveText) {

        objectiveText.textContent =
            "MISSION FAILED";

    }

    if (levelFailed) {

        levelFailed.classList.add(
            "active"
        );

    }

    console.log(
        "LEVEL 2 FAILED"
    );

}


    // ==========================================
    // SHOOTING
    // ==========================================

    document.addEventListener(
        "mousedown",
        function (event) {

            if (
                event.button === 0 &&
                gameRunning
            ) {

                shoot();

            }

        }
    );


    function shoot() {

        if (magazine <= 0) {

            console.log(
                "OUT OF AMMO"
            );

            return;

        }


        magazine--;


        updateAmmo();


        let closest =
            null;


        let closestDistance =
            Infinity;


        enemies.forEach(
            function (enemy) {

                if (
                    enemy.dataset.dead ===
                    "true"
                ) {
                    return;
                }


                const ex =
                    parseFloat(
                        enemy.style.left
                    );


                const ey =
                    parseFloat(
                        enemy.style.top
                    );


                const dx =
                    playerX - ex;


                const dy =
                    playerY - ey;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance < 30 &&
                    distance < closestDistance
                ) {

                    closestDistance =
                        distance;

                    closest =
                        enemy;

                }

            }
        );


        if (closest) {

            damageEnemy(
                closest
            );

        }

    }

    // ==========================================
// ZOMBIE KILL DISPLAY
// ==========================================

function updateZombieKillDisplay() {

    // LIVE HUD
    if (zombiesKilledText) {

        zombiesKilledText.textContent =
            zombiesKilled;

    }

    if (xpAwardedText) {

        xpAwardedText.textContent =
            xpAwarded;

    }

    // LEVEL COMPLETE SCREEN
    if (completeKillsText) {

        completeKillsText.textContent =
            zombiesKilled;

    }

    if (completeXPText) {

        completeXPText.textContent =
            xpAwarded;

    }

}

    // ==========================================
    // DAMAGE ENEMY
    // ==========================================

    function damageEnemy(enemy) {

    if (!enemy) {
        return;
    }

    let hp =
        parseInt(
            enemy.dataset.hp || "100",
            10
        );

    hp -= 50;

    enemy.dataset.hp = hp;

    if (hp <= 0) {

        enemy.dataset.dead = "true";

        enemy.style.opacity = "0.2";

        enemy.style.transform =
            "rotate(90deg)";

        // ==============================
        // ZOMBIE KILLED
        // ==============================

        zombiesKilled++;

        console.log(
            "ZOMBIE KILLED:",
            zombiesKilled
        );

        updateZombieKillDisplay();

    }

}


    // ==========================================
    // RELOAD
    // ==========================================

    function reload() {

        if (magazine >= 30) {
            return;
        }


        if (reserveAmmo <= 0) {
            return;
        }


        const needed =
            30 - magazine;


        const amount =
            Math.min(
                needed,
                reserveAmmo
            );


        magazine +=
            amount;


        reserveAmmo -=
            amount;


        updateAmmo();

    }


    function updateAmmo() {

        if (magazineText) {

            magazineText.textContent =
                magazine;

        }


        if (reserveText) {

            reserveText.textContent =
                String(
                    reserveAmmo
                ).padStart(
                    3,
                    "0"
                );

        }

    }


    // ==========================================
    // NOISE
    // ==========================================

    function createNoise() {

        if (!gameWorld) {
            return;
        }


        gameWorld.style.setProperty(
            "--noise",
            "1"
        );

    }


    function alertNearbyZombies() {

        enemies.forEach(
            function (enemy) {

                enemy.dataset.alerted =
                    "true";

            }
        );

    }


    // ==========================================
    // SIREN
    // ==========================================

    function playSiren() {

    if (signalStatus) {

        signalStatus.innerHTML =
            "SIGNAL: <span>⚠ SIREN ACTIVE</span>";

    }

    

    console.log(
        "SUBWAY SIREN ACTIVATED"
    );

}


// ==========================================
// MISSION COMPLETE
// ==========================================

function completeMission() {

    if (missionFinished) {
        return;
    }

    missionFinished = true;

    // ======================================
// SAVE LEVEL 2 PROGRESS
// ======================================

let progress =
    JSON.parse(
        localStorage.getItem("playerProgress")
    ) || {
        currentLevel: 1,
        completedLevels: [],
        xp: 0,
        selectedMap: "hospital",
        selectedWeapon: "pistol",
        unlockedWeapons: ["pistol"],
        unlockedMaps: ["hospital"]
    };

// LEVEL 2 COMPLETE
if (
    !progress.completedLevels.includes(2)
) {
    progress.completedLevels.push(2);
}

// ADD XP
progress.xp =
    (Number(progress.xp) || 0) + 200;

// UNLOCK LEVEL 3
progress.currentLevel =
    Math.max(
        Number(progress.currentLevel) || 1,
        3
    );

// SAVE
localStorage.setItem(
    "playerProgress",
    JSON.stringify(progress)
);

// CURRENT LEVEL
localStorage.setItem(
    "currentLevel",
    "2"
);

localStorage.setItem(
    "currentLocation",
    "SECTOR_02 // SUBWAY"
);

localStorage.setItem(
    "playerXP",
    String(progress.xp)
);

console.log(
    "LEVEL 3 UNLOCKED"
);

    

    gameRunning = false;

        updateZombieKillDisplay();

    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;


    if (objectiveText) {

        objectiveText.textContent =
            "SECTOR 02 COMPLETE";

    }


    // ======================================
    // FINAL RESULT VALUES
    // ======================================

    updateZombieKillDisplay();


    // ======================================
    // SHOW COMPLETE SCREEN
    // ======================================

    if (missionComplete) {

        missionComplete.classList.add(
            "active"
        );

    }


    console.log(
        "LEVEL 2 COMPLETE"
    );

}
    


    // ==========================================
    // NEXT LEVEL
    // ==========================================

    if (nextLevelBtn) {

        nextLevelBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "level3.html";

            }
        );

    }

    // ==========================================
// RESTART LEVEL 2
// ==========================================

if (restartLevelBtn) {

    restartLevelBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "level2.html";

        }
    );

}


// ==========================================
// RETURN TO HQ
// ==========================================

if (returnHQBtn) {

    returnHQBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


    // ==========================================
    // MAIN GAME LOOP
    // ==========================================

    function gameLoop() {

        updateMovement();

        updateEnemyAI();

        requestAnimationFrame(
            gameLoop
        );

    }


    // ==========================================
    // START
    // ==========================================

    updateAmmo();

    updateVitals();

    gameLoop();

    
});