// ==========================================
// ZOMBIE SURVIVAL
// LEVEL 3 - DOWNTOWN EXTRACTION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // PROFILE
    // ==========================================

    localStorage.setItem("currentLevel", "3");
    localStorage.setItem(
        "currentLocation",
        "SECTOR_03 // DOWNTOWN"
    );


    // ==========================================
    // ELEMENTS
    // ==========================================

    const gameWorld =
        document.getElementById("gameWorld");

    const player =
        document.getElementById("player");

    const enemiesContainer =
        document.getElementById("enemies");

    const checkpoint =
        document.querySelector(".checkpoint");

    const chopper =
        document.getElementById("chopper");

    const healthText =
        document.getElementById("health");

    const objectiveText =
        document.getElementById("objectiveText");

    const suppliesText =
        document.getElementById("supplies");

    const zombiesKilledText =
        document.getElementById("zombiesKilled");

    const magAmmoText =
        document.getElementById("magAmmo");

    const reserveText =
        document.getElementById("reserve");

    const damageEffect =
        document.getElementById("damageEffect");

    const finalScreen =
        document.getElementById("finalScreen");

    const finalTitle =
        document.getElementById("finalTitle");

    const finalMessage =
        document.getElementById("finalMessage");

    const restartLevelBtn =
        document.getElementById("restartLevelBtn");


    // ==========================================
    // SUPPLY CRATES
    // ==========================================

    const crates = [
        document.getElementById("crate1"),
        document.getElementById("crate2"),
        document.getElementById("crate3")
    ];


    // ==========================================
    // GAME STATE
    // ==========================================

    let playerX = 50;
    let playerY = 80;

    let playerHealth = 100;

    let magazine = 30;
    let reserveAmmo = 90;

    let suppliesCollected = 0;
    let zombiesKilled = 0;

    const totalSupplies = 3;
    const totalZombies = 8;

    let checkpointReached = false;
    let extractionReady = false;

    let gameRunning = true;

    let lastDamageTime = 0;

    let enemies = [];


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
            dx * dx +
            dy * dy
        );
    }


    // ==========================================
    // KEY DOWN
    // ==========================================

    document.addEventListener(
        "keydown",
        function (event) {

            const key =
                event.key.toLowerCase();

            if (key === "w") keys.w = true;
            if (key === "a") keys.a = true;
            if (key === "s") keys.s = true;
            if (key === "d") keys.d = true;

            // E = INTERACT

            if (key === "e") {
                interact();
            }

            // R = RELOAD

            if (key === "r") {
                reload();
            }

        }
    );


    // ==========================================
    // KEY UP
    // ==========================================

    document.addEventListener(
        "keyup",
        function (event) {

            const key =
                event.key.toLowerCase();

            if (key === "w") keys.w = false;
            if (key === "a") keys.a = false;
            if (key === "s") keys.s = false;
            if (key === "d") keys.d = false;

        }
    );


    // ==========================================
    // PLAYER MOVEMENT
    // ==========================================

    function updateMovement() {

        if (!gameRunning) {
            return;
        }

        const speed = 0.35;

        let dx = 0;
        let dy = 0;

        if (keys.w) dy -= speed;
        if (keys.s) dy += speed;
        if (keys.a) dx -= speed;
        if (keys.d) dx += speed;


        // DIAGONAL NORMALIZATION

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }


        playerX += dx;
        playerY += dy;


        // WORLD BOUNDS

        playerX =
            Math.max(
                3,
                Math.min(
                    97,
                    playerX
                )
            );

        playerY =
            Math.max(
                5,
                Math.min(
                    95,
                    playerY
                )
            );


        player.style.left =
            playerX + "%";

        player.style.top =
            playerY + "%";


        // CHECKPOINT

        if (
            !checkpointReached &&
            distanceTo(checkpoint) <= 12
        ) {

            reachCheckpoint();

        }


        // CHOPPER

        if (extractionReady) {

            if (
                distanceTo(chopper) <= 12
            ) {

                objectiveText.textContent =
                    "[E] ENTER CHOPPER";

            }

        }

    }


    // ==========================================
    // CHECKPOINT
    // ==========================================

    function reachCheckpoint() {

        checkpointReached = true;

        objectiveText.textContent =
            "SEARCH 3 SUPPLY CRATES";

        checkpoint.classList.add("active");

        console.log(
            "MILITARY CHECKPOINT REACHED"
        );

        spawnZombies();

    }


    // ==========================================
    // SPAWN 8 SLOW ZOMBIES
    // ==========================================

    function spawnZombies() {

        const positions = [

            [35, 25],
            [50, 20],
            [65, 25],
            [75, 40],

            [30, 55],
            [50, 50],
            [70, 60],
            [55, 70]

        ];


        positions.forEach(
            function (position, index) {

                const zombie =
                    document.createElement("div");

                zombie.className =
                    "enemy";

                zombie.textContent =
                    "🧟";

                zombie.style.left =
                    position[0] + "%";

                zombie.style.top =
                    position[1] + "%";

                // 2 SHOTS = KILL

                zombie.dataset.hp = "100";

                zombie.dataset.dead =
                    "false";

                zombie.dataset.id =
                    index + 1;

                enemiesContainer.appendChild(
                    zombie
                );

                enemies.push(zombie);

            }
        );

    }


    // ==========================================
    // ZOMBIE AI
    // ==========================================

    function updateEnemies() {

        if (!gameRunning) {
            return;
        }


        enemies.forEach(
            function (enemy) {

                if (!enemy) {
                    return;
                }

                if (
                    enemy.dataset.dead ===
                    "true"
                ) {
                    return;
                }


                let enemyX =
                    parseFloat(
                        enemy.style.left
                    );

                let enemyY =
                    parseFloat(
                        enemy.style.top
                    );


                const dx =
                    playerX - enemyX;

                const dy =
                    playerY - enemyY;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                // SLOW ZOMBIE

                if (distance > 3) {

                    const speed = 0.055;

                    enemyX +=
                        (dx / distance) *
                        speed;

                    enemyY +=
                        (dy / distance) *
                        speed;

                    enemy.style.left =
                        enemyX + "%";

                    enemy.style.top =
                        enemyY + "%";

                }


                // ATTACK

                if (distance <= 3.5) {

                    zombieAttack();

                }

            }
        );

    }


    // ==========================================
    // ZOMBIE ATTACK
    // ==========================================

    function zombieAttack() {

        const now =
            Date.now();


        // 1.2 SECOND COOLDOWN

        if (
            now - lastDamageTime <
            1200
        ) {
            return;
        }


        lastDamageTime =
            now;


        playerHealth -= 5;

        playerHealth =
            Math.max(
                0,
                playerHealth
            );


        healthText.textContent =
            playerHealth;


        // DAMAGE FLASH

        if (damageEffect) {

            damageEffect.classList.remove(
                "damage"
            );

            void damageEffect.offsetWidth;

            damageEffect.classList.add(
                "damage"
            );

        }


        if (playerHealth <= 0) {

            failLevel();

        }

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

            reload();

            return;

        }


        magazine--;

        updateAmmo();


        let closest = null;

        let closestDistance =
            Infinity;


        enemies.forEach(
            function (enemy) {

                if (
                    !enemy ||
                    enemy.dataset.dead ===
                    "true"
                ) {
                    return;
                }


                const enemyX =
                    parseFloat(
                        enemy.style.left
                    );

                const enemyY =
                    parseFloat(
                        enemy.style.top
                    );


                const dx =
                    playerX - enemyX;

                const dy =
                    playerY - enemyY;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                // EASY AIM RANGE

                if (
                    distance < 25 &&
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
    // DAMAGE ZOMBIE
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


        // 50 DAMAGE
        // 2 SHOTS = KILL

        hp -= 50;

        enemy.dataset.hp =
            hp;


        // HIT EFFECT

        enemy.style.filter =
            "brightness(2)";


        setTimeout(
            function () {

                if (
                    enemy &&
                    enemy.dataset.dead !==
                    "true"
                ) {

                    enemy.style.filter =
                        "";

                }

            },
            100
        );


        if (hp <= 0) {

            killZombie(enemy);

        }

    }


    // ==========================================
    // KILL ZOMBIE
    // ==========================================

    function killZombie(enemy) {

        if (
            enemy.dataset.dead ===
            "true"
        ) {
            return;
        }


        enemy.dataset.dead =
            "true";


        zombiesKilled++;


        enemy.style.opacity =
            "0.25";

        enemy.style.transform =
            "translate(-50%, -50%) rotate(90deg)";


        zombiesKilledText.textContent =
            zombiesKilled;


        console.log(
            "ZOMBIE KILLED:",
            zombiesKilled
        );


        checkMissionProgress();

    }


    // ==========================================
    // INTERACTION
    // ==========================================

    function interact() {

        if (!gameRunning) {
            return;
        }


        // ======================================
        // SUPPLY CRATES
        // ======================================

        if (checkpointReached) {

            for (
                let i = 0;
                i < crates.length;
                i++
            ) {

                const crate =
                    crates[i];


                if (
                    !crate ||
                    crate.dataset.collected ===
                    "true"
                ) {
                    continue;
                }


                const distance =
                    distanceTo(crate);


                if (distance <= 10) {

                    collectSupply(crate);

                    return;

                }

            }

        }


        // ======================================
        // CHOPPER
        // ======================================

        if (
            extractionReady &&
            distanceTo(chopper) <= 12
        ) {

            finishLevel();

            return;

        }

    }


    // ==========================================
    // COLLECT SUPPLY
    // ==========================================

    function collectSupply(crate) {

        crate.dataset.collected =
            "true";

        crate.style.opacity =
            "0.2";


        const label =
            crate.querySelector("span");


        if (label) {

            label.textContent =
                "COLLECTED";

        }


        suppliesCollected++;


        suppliesText.textContent =
            suppliesCollected;


        console.log(
            "SUPPLY:",
            suppliesCollected,
            "/",
            totalSupplies
        );


        checkMissionProgress();

    }


    // ==========================================
    // MISSION PROGRESS
    // ==========================================

    function checkMissionProgress() {

        if (
            suppliesCollected >=
            totalSupplies &&
            zombiesKilled >=
            totalZombies
        ) {

            prepareExtraction();

        }

    }


    // ==========================================
    // EXTRACTION READY
    // ==========================================

    function prepareExtraction() {

        if (extractionReady) {
            return;
        }


        extractionReady =
            true;


        objectiveText.textContent =
            "EVACUATION CHOPPER READY → REACH EXTRACTION";


        chopper.style.display =
            "block";


        chopper.classList.add(
            "ready"
        );


        console.log(
            "CHOPPER READY"
        );

    }


    // ==========================================
    // RELOAD
    // ==========================================

    function reload() {

        if (
            magazine >= 30 ||
            reserveAmmo <= 0
        ) {
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


    // ==========================================
    // AMMO HUD
    // ==========================================

    function updateAmmo() {

        magAmmoText.textContent =
            magazine;

        reserveText.textContent =
            String(
                reserveAmmo
            ).padStart(
                3,
                "0"
            );

    }


    // ==========================================
    // RESULT SCREEN SETUP
    // ==========================================

    function prepareResultScreen() {

        if (!finalScreen) {
            return;
        }

        // Remove old dynamic buttons
        const oldButtons =
            finalScreen.querySelectorAll(
                ".dynamicResultButton"
            );

        oldButtons.forEach(
            function (button) {
                button.remove();
            }
        );


        // Remove old result info
        const oldInfo =
            finalScreen.querySelector(
                ".dynamicResultInfo"
            );

        if (oldInfo) {
            oldInfo.remove();
        }

    }


    // ==========================================
    // CREATE RESULT BUTTON
    // ==========================================

    function createResultButton(
        text,
        callback
    ) {

        const button =
            document.createElement("button");

        button.className =
            "dynamicResultButton";

        button.textContent =
            text;

        // Match existing restart button
        if (restartLevelBtn) {

            const styles =
                window.getComputedStyle(
                    restartLevelBtn
                );

            button.style.display =
                "block";

            button.style.margin =
                "15px auto 0";

            button.style.padding =
                styles.padding;

            button.style.background =
                "transparent";

            button.style.color =
                "#39ff88";

            button.style.border =
                "1px solid #39ff88";

            button.style.fontFamily =
                "monospace";

            button.style.fontSize =
                "16px";

            button.style.letterSpacing =
                "2px";

            button.style.cursor =
                "pointer";

            button.style.textTransform =
                "uppercase";

            button.style.minWidth =
                "260px";

            button.style.boxShadow =
                "0 0 8px rgba(57,255,136,.5)";

        }


        button.addEventListener(
            "mouseenter",
            function () {

                button.style.background =
                    "#39ff88";

                button.style.color =
                    "#000";

                button.style.boxShadow =
                    "0 0 20px rgba(57,255,136,.9)";

            }
        );


        button.addEventListener(
            "mouseleave",
            function () {

                button.style.background =
                    "transparent";

                button.style.color =
                    "#39ff88";

                button.style.boxShadow =
                    "0 0 8px rgba(57,255,136,.5)";

            }
        );


        button.addEventListener(
            "click",
            callback
        );


        finalScreen.appendChild(
            button
        );


        return button;

    }


    // ==========================================
    // RESULT INFO
    // ==========================================

    function createResultInfo(
        type
    ) {

        const info =
            document.createElement("div");

        info.className =
            "dynamicResultInfo";


        if (type === "complete") {

            info.innerHTML = `
                <div style="
                    margin-top:25px;
                    line-height:2;
                    font-size:16px;
                    letter-spacing:3px;
                    text-align:center;
                ">
                    <div>ZOMBIES KILLED:
                        <span>${zombiesKilled}</span>
                    </div>

                    <div>SUPPLIES COLLECTED:
                        <span>${suppliesCollected}</span>
                    </div>

                    <div>XP AWARDED:
                        <span>300</span>
                    </div>
                </div>
            `;

        }

        else {

            info.innerHTML = `
                <div style="
                    margin-top:25px;
                    line-height:2;
                    font-size:16px;
                    letter-spacing:3px;
                    text-align:center;
                ">
                    <div>
                        LEVEL:
                        <span>03</span>
                    </div>

                    <div>
                        LOCATION:
                        <span>DOWNTOWN</span>
                    </div>

                    <div>
                        STATUS:
                        <span>MISSION FAILED</span>
                    </div>
                </div>
            `;

        }


        finalScreen.appendChild(
            info
        );

    }


    // ==========================================
    // LEVEL FAILED
    // ==========================================

    function failLevel() {

        if (!gameRunning) {
            return;
        }


        gameRunning =
            false;


        // Stop movement

        keys.w = false;
        keys.a = false;
        keys.s = false;
        keys.d = false;


        objectiveText.textContent =
            "MISSION FAILED";


        // Prepare screen

        prepareResultScreen();


        finalScreen.style.display =
            "flex";


        finalScreen.style.background =
            "#000";


        finalScreen.style.color =
            "#ff3030";


        finalScreen.style.textShadow =
            "0 0 20px rgba(255,0,0,.8)";


        finalTitle.textContent =
            "SECTOR 03 FAILED";


        finalMessage.textContent =
            "CONNECTION LOST // PLAYER TERMINATED";


        // Info

        createResultInfo(
            "failed"
        );


        // Existing restart button

        restartLevelBtn.style.display =
            "block";

        restartLevelBtn.textContent =
            "RESTART LEVEL 03";


        restartLevelBtn.style.color =
            "#ff3030";

        restartLevelBtn.style.borderColor =
            "#ff3030";

        restartLevelBtn.onclick =
            function () {

                window.location.href =
                    "level3.html";

            };


        // Return HQ

        createResultButton(
            "RETURN TO HQ",
            function () {

                window.location.href =
                    "index.html";

            }
        );


        localStorage.setItem(
            "currentLocation",
            "SECTOR_03 // FAILED"
        );


        console.log(
            "LEVEL 3 FAILED"
        );

    }


    // ==========================================
    // LEVEL COMPLETE
    // ==========================================

    function finishLevel() {

        if (!gameRunning) {
            return;
        }


        gameRunning =
            false;

            // ==========================================
// SAVE LEVEL 3 PROGRESS
// ==========================================

const progress = JSON.parse(
    localStorage.getItem("playerProgress") || "{}"
);

if (!Array.isArray(progress.completedLevels)) {
    progress.completedLevels = [];
}

if (!progress.completedLevels.includes(3)) {
    progress.completedLevels.push(3);
}

// Unlock Level 4
progress.currentLevel = Math.max(
    Number(progress.currentLevel || 1),
    4
);

// Level 3 XP
progress.xp = Number(progress.xp || 0) + 300;

localStorage.setItem(
    "playerProgress",
    JSON.stringify(progress)
);

console.log(
    "LEVEL 3 PROGRESS SAVED",
    progress
);

        keys.w = false;
        keys.a = false;
        keys.s = false;
        keys.d = false;


        objectiveText.textContent =
            "SECTOR 03 COMPLETE";


        // Prepare screen

        prepareResultScreen();


        finalScreen.style.display =
            "flex";


        finalScreen.style.background =
            "#000";


        finalScreen.style.color =
            "#39ff88";


        finalScreen.style.textShadow =
            "0 0 20px rgba(57,255,136,.8)";


        finalTitle.textContent =
            "LEVEL 3 // SECTOR 03 COMPLETE";


        finalMessage.textContent =
            "DOWNTOWN // EXTRACTION SUCCESSFUL";


        // Info

        createResultInfo(
            "complete"
        );


        // Hide restart

        restartLevelBtn.style.display =
            "none";


        // LEVEL 4 BUTTON

        createResultButton(
            "LEVEL 4  →",
            function () {

                localStorage.setItem(
                    "currentLevel",
                    "4"
                );

                localStorage.setItem(
                    "currentLocation",
                    "SECTOR_04"
                );


                window.location.href =
                    "level4.html";

            }
        );


        localStorage.setItem(
            "currentLevel",
            "3"
        );

        localStorage.setItem(
            "currentLocation",
            "SECTOR_03 // COMPLETE"
        );


        console.log(
            "LEVEL 3 COMPLETE"
        );

    }


    // ==========================================
    // RESTART
    // ==========================================

    if (restartLevelBtn) {

        restartLevelBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "level3.html";

            }
        );

    }


    // ==========================================
    // GAME LOOP
    // ==========================================

    function gameLoop() {

        updateMovement();

        updateEnemies();

        requestAnimationFrame(
            gameLoop
        );

    }


    // ==========================================
    // START
    // ==========================================

    updateAmmo();

    healthText.textContent =
        playerHealth;

    suppliesText.textContent =
        suppliesCollected;

    zombiesKilledText.textContent =
        zombiesKilled;


    player.style.left =
        playerX + "%";

    player.style.top =
        playerY + "%";


    gameLoop();

});