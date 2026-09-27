// ==========================================
// ZOMBIE SURVIVAL // GAME SYSTEM
// LEVEL 1 - QUARANTINE HOSPITAL
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
// LEVEL 1 CURRENT PROFILE
// ==========================================

localStorage.setItem("currentLevel", "1");
localStorage.setItem(
    "currentLocation",
    "QUARANTINE HOSPITAL"
);

    // ==========================================
// LEVEL CONFIGURATION
// ==========================================

const LEVEL_CONFIG = {

    number: 1,

    sector: "01",

    name: "QUARANTINE HOSPITAL",

    nextLevel: "level2.html",

    xp: 100

};


    // ==========================================
    // ELEMENTS
    // ==========================================

    const gameWorld = document.getElementById("gameWorld");
    const player = document.getElementById("player");

    const profileName =
    document.getElementById("playerName");

const profileEmail =
    document.getElementById("playerEmail");

const profileID =
    document.getElementById("playerID");

const profileLevel =
    document.getElementById("playerLevel");

const profileProgressBar =
    document.getElementById("profileXPFill");

const profileProgressText =
    document.getElementById("playerXP");

    

// ==========================================
// LOAD GOOGLE PLAYER
// ==========================================

function loadPlayerProfile() {

    const savedUser =
        localStorage.getItem("googleUser");

    if (!savedUser) {

        console.log(
            "No Google profile found."
        );

        return;

    }

    try {

        const user =
            JSON.parse(savedUser);

        console.log(
            "PLAYER PROFILE:",
            user
        );


        // NAME

        if (profileName) {

            profileName.textContent =
                user.name || "PLAYER";

        }


        // EMAIL

        if (profileEmail) {

            profileEmail.textContent =
                user.email || "UNKNOWN";

        }


        // PLAYER ID

        if (profileID) {

            profileID.textContent =
                createPlayerID(
                    user.email
                );

        }


        // CURRENT LEVEL

        if (profileLevel) {

    const savedLevel =
        parseInt(
            localStorage.getItem("currentLevel") || "1",
            10
        );

    profileLevel.textContent =
        String(savedLevel).padStart(2, "0");

}


        // INITIAL PROGRESS

        const savedXP =
    parseInt(
        localStorage.getItem("playerXP") || "0",
        10
    );

updatePlayerProgress(
    savedXP % 100
);

    }

    catch (error) {

        console.error(
            "PLAYER PROFILE ERROR:",
            error
        );

    }

}


// ==========================================
// CREATE PLAYER ID
// ==========================================

function createPlayerID(email) {

    if (!email) {

        return "LOCAL-001";

    }

    let hash = 0;

    for (
        let i = 0;
        i < email.length;
        i++
    ) {

        hash =
            (
                (
                    hash << 5
                ) -
                hash
            ) +
            email.charCodeAt(i);

        hash |= 0;

    }

    return (
        "ZS-" +
        Math.abs(hash)
            .toString()
            .slice(0, 8)
    );

}


// ==========================================
// PLAYER PROGRESS
// ==========================================

function updatePlayerProgress(percent) {

    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    if (profileProgressBar) {

        profileProgressBar.style.width =
            percent + "%";

    }


    if (profileProgressText) {

        profileProgressText.textContent =
            percent + "%";

    }

}

    const enemies = [
        document.querySelector(".enemyOne"),
        document.querySelector(".enemyTwo"),
        document.querySelector(".enemyThree")
    ];

   

    const clock = document.getElementById("clock");
    const recDot = document.getElementById("recDot");

    const bpm = document.getElementById("bpm");
    const vitalStatus = document.getElementById("vitalStatus");

    const batteryPercent =
        document.getElementById("batteryPercent");

    const magAmmo =
        document.getElementById("magAmmo");

    const reserve =
        document.getElementById("reserve");

    const lowAmmoWarning =
        document.getElementById("lowAmmoWarning");

    const damageEffect =
        document.getElementById("damageEffect");

    const signalStatus =
        document.getElementById("signalStatus");

    const radar =
        document.getElementById("radar");

    const gameOver =
        document.getElementById("gameOver");

    const missionComplete =
        document.getElementById("missionComplete");

    const restartBtn =
        document.getElementById("restartBtn");

    const returnHQBtn =
        document.getElementById("returnHQBtn");

    const timeAlive =
        document.getElementById("timeAlive");

    const zombiesKilledText =
        document.getElementById("zombiesKilled");

    const itemsFound =
        document.getElementById("itemsFound");


    // ==========================================
    // LEVEL 1 OBJECTIVE ELEMENTS
    // ==========================================

    const medicalCrate =
        document.getElementById("medicalCrate");

    const pickupPrompt =
        document.getElementById("pickupPrompt");

    const escapeDoor =
        document.getElementById("escapeDoor");

    const escapePrompt =
        document.getElementById("escapePrompt");

    const objectiveText =
        document.getElementById("objectiveText");

    const surpriseZombies =
        document.getElementById("surpriseZombies");


    // ==========================================
    // GAME STATE
    // ==========================================

    let playerX = 50;
    let playerY = 50;

    let playerHealth = 100;

    let currentBPM = 72;

    let battery = 80;

    let magazine = 30;
    let reserveAmmo = 90;

    let zombiesKilled = 0;

    let gameRunning = true;

    let flashlightOn = false;

    let sprinting = false;

    let adsMode = false;

    let paused = false;

    let insulinCollected = false;

    let missionFinished = false;

    let startTime = Date.now();

    let lastDamageTime = 0;

   

    // ==========================================
    // MOVEMENT KEYS
    // ==========================================

    const keys = {
        w: false,
        a: false,
        s: false,
        d: false
    };

    

    // ==========================================
    // HOSPITAL COLLISION
    // ==========================================

    const obstacles = [
        {
            x1: 35,
            x2: 65,
            y1: 42,
            y2: 58
        }
    ];


    function isBlocked(x, y) {

        for (const obstacle of obstacles) {

            if (
                x > obstacle.x1 &&
                x < obstacle.x2 &&
                y > obstacle.y1 &&
                y < obstacle.y2
            ) {
                return true;
            }

        }

        return false;
    }


    // ==========================================
    // DISTANCE
    // ==========================================

    function distanceToObject(element) {

        if (!element || !gameWorld) {
            return Infinity;
        }

        const worldRect =
            gameWorld.getBoundingClientRect();

        const objectRect =
            element.getBoundingClientRect();

        const playerRect =
            player.getBoundingClientRect();

        const objectX =
            (
                objectRect.left +
                objectRect.width / 2 -
                worldRect.left
            ) / worldRect.width * 100;

        const objectY =
            (
                objectRect.top +
                objectRect.height / 2 -
                worldRect.top
            ) / worldRect.height * 100;

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

            if (
                key === "w" ||
                key === "a" ||
                key === "s" ||
                key === "d"
            ) {
                event.preventDefault();
            }
            // W A S D

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


            // SHIFT = SPRINT

            if (event.key === "Shift") {
                sprinting = true;
            }


            // F = FLASHLIGHT

            if (key === "f") {
                toggleFlashlight();
            }


            // R = RELOAD

            if (key === "r") {
                reloadWeapon();
            }



            // TAB = INVENTORY

            if (event.key === "Tab") {

                event.preventDefault();

                showInventory();
            }


            // E = OBJECTIVE

            if (key === "e") {
                handleObjectiveKey();
            }

        }
    );


    // ==========================================
    // KEYBOARD RELEASE
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
    // MOUSE
    // ==========================================

    document.addEventListener(
        "mousedown",
        function (event) {

            if (!gameRunning) {
                return;
            }


            // LEFT CLICK = SHOOT

            if (event.button === 0) {
                shoot();
            }


            // RIGHT CLICK = ADS

            if (event.button === 2) {

                adsMode = true;

                document.body.classList.add(
                    "adsMode"
                );
            }

        }
    );


    document.addEventListener(
        "mouseup",
        function (event) {

            if (event.button === 2) {

                adsMode = false;

                document.body.classList.remove(
                    "adsMode"
                );
            }

        }
    );


    document.addEventListener(
        "contextmenu",
        function (event) {

            event.preventDefault();

        }
    );


    // ==========================================
    // MOVEMENT
    // ==========================================

    function updateMovement() {

    if (!gameRunning || paused) {
        return;
    }

    let speed = sprinting ? 0.55 : 0.28;

    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= speed;
    if (keys.s) dy += speed;
    if (keys.a) dx -= speed;
    if (keys.d) dx += speed;

    // Diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
    }

    let nextX = playerX + dx;
    let nextY = playerY + dy;

    // Boundaries
    nextX = Math.max(5, Math.min(95, nextX));
    nextY = Math.max(8, Math.min(92, nextY));

    // TEMPORARILY NO COLLISION
    playerX = nextX;
    playerY = nextY;

    // Player position
    if (player) {
        player.style.left = playerX + "%";
        player.style.top = playerY + "%";
    }

    // Heart rate
    if (sprinting && (dx !== 0 || dy !== 0)) {
        currentBPM = Math.min(145, currentBPM + 0.5);
    } else {
        currentBPM = Math.max(72, currentBPM - 0.15);
    }

    updateVitals();
}

        // ==========================================
    // VITALS
    // ==========================================

    function updateVitals() {

        const displayedBPM =
            Math.round(currentBPM);


        if (bpm) {
            bpm.textContent =
                displayedBPM;
        }


        if (
            currentBPM >= 120 ||
            playerHealth < 30
        ) {

            if (vitalStatus) {
                vitalStatus.textContent =
                    "CRITICAL";
            }

            document.body.classList.add(
                "critical"
            );

        } else {

            if (vitalStatus) {
                vitalStatus.textContent =
                    "STABLE";
            }

            document.body.classList.remove(
                "critical"
            );

        }

    }


    // ==========================================
    // ZOMBIE SETUP
    // ==========================================

    function setupZombies() {

        enemies.forEach(
            function (enemy, index) {

                if (!enemy) {
                    return;
                }


                if (index === 0) {

                    enemy.style.left =
                        "20%";

                    enemy.style.top =
                        "30%";
                }


                if (index === 1) {

                    enemy.style.left =
                        "78%";

                    enemy.style.top =
                        "25%";
                }


                if (index === 2) {

                    enemy.style.left =
                        "70%";

                    enemy.style.top =
                        "75%";
                }


                enemy.dataset.hp =
                    enemy.dataset.hp || "100";

                enemy.dataset.dead =
                    enemy.dataset.dead || "false";

            }
        );

    }


    // ==========================================
    // ZOMBIE AI
    // ==========================================

    function updateZombies() {

        if (!gameRunning) {
            requestAnimationFrame(
                updateZombies
            );
            return;
        }


        enemies.forEach(
            function (enemy) {

                if (!enemy) {
                    return;
                }


                if (
                    enemy.dataset.dead === "true"
                ) {
                    return;
                }


                let zombieX =
                    parseFloat(
                        enemy.style.left
                    ) || 50;


                let zombieY =
                    parseFloat(
                        enemy.style.top
                    ) || 50;


                const dx =
                    playerX - zombieX;

                const dy =
                    playerY - zombieY;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                // CHASE

                if (
                    distance < 65 &&
                    distance > 0
                ) {

                    let zombieSpeed =
                        0.055;


                    if (
                        enemy.dataset.fast ===
                        "true"
                    ) {

                        zombieSpeed =
                            0.095;
                    }


                    const newZombieX =
                        zombieX +
                        (dx / distance) *
                        zombieSpeed;


                    const newZombieY =
                        zombieY +
                        (dy / distance) *
                        zombieSpeed;


                    zombieX =
                        Math.max(
                            5,
                            Math.min(
                                95,
                                newZombieX
                            )
                        );


                    zombieY =
                        Math.max(
                            8,
                            Math.min(
                                92,
                                newZombieY
                            )
                        );


                    enemy.style.left =
                        zombieX + "%";

                    enemy.style.top =
                        zombieY + "%";

                }


                // ATTACK

                if (distance < 5) {

                    zombieAttack();

                }

            }
        );


        requestAnimationFrame(
            updateZombies
        );

    }


    // ==========================================
    // ZOMBIE ATTACK
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

        
        

        playerHealth -= 10;


        playerHealth =
            Math.max(
                0,
                playerHealth
            );


        currentBPM += 25;


        currentBPM =
            Math.min(
                145,
                currentBPM
            );


        // DAMAGE EFFECT

        if (damageEffect) {

            damageEffect.classList.remove(
                "damageActive"
            );


            void damageEffect.offsetWidth;


            damageEffect.classList.add(
                "damageActive"
            );

        }


        // SIGNAL

        if (signalStatus) {

            signalStatus.innerHTML =
                'SIGNAL: <span>INTERFERENCE</span>';

        }


        updateVitals();


        // GAME OVER

        if (
            playerHealth <= 0
        ) {

            endGame();

        }

    }


    // ==========================================
    // SHOOT
    // ==========================================

    function shoot() {

        if (!gameRunning) {
            return;
        }


        if (magazine <= 0) {

            showLowAmmo();

            return;

        }


        magazine--;


        updateAmmo();


        createMuzzleFlash();


        createRadarNoise();


        let closestZombie =
            null;


        let closestDistance =
            Infinity;


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


                const zombieX =
                    parseFloat(
                        enemy.style.left
                    ) || 50;


                const zombieY =
                    parseFloat(
                        enemy.style.top
                    ) || 50;


                const dx =
                    playerX - zombieX;


                const dy =
                    playerY - zombieY;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance <
                    closestDistance &&
                    distance < 35
                ) {

                    closestDistance =
                        distance;

                    closestZombie =
                        enemy;

                }

            }
        );


        if (closestZombie) {

            damageZombie(
                closestZombie
            );

        }


        if (magazine <= 5) {

            showLowAmmo();

        }

    }


    // ==========================================
    // DAMAGE ZOMBIE
    // ==========================================

    function damageZombie(enemy) {

        if (!enemy) {
            return;
        }


        let hp =
            parseInt(
                enemy.dataset.hp || "100",
                10
            );


        let damage = 34;


        if (
            enemy.dataset.headshot ===
            "true"
        ) {

            damage = 100;

        }


        hp -= damage;


        enemy.dataset.hp =
            hp;


        enemy.classList.add(
            "enemyHit"
        );


        setTimeout(
            function () {

                enemy.classList.remove(
                    "enemyHit"
                );

            },
            180
        );


        if (hp <= 0) {

            enemy.dataset.dead =
                "true";


            enemy.style.opacity =
                "0.2";


            enemy.style.transform =
                "scale(.7) rotate(20deg)";


            zombiesKilled++;

        }

    }


    // ==========================================
    // MUZZLE FLASH
    // ==========================================

    function createMuzzleFlash() {

        if (!gameWorld) {
            return;
        }


        const flash =
            document.createElement(
                "div"
            );


        flash.className =
            "muzzleFlash";


        gameWorld.appendChild(
            flash
        );


        setTimeout(
            function () {

                flash.remove();

            },
            100
        );

    }


    // ==========================================
    // RADAR NOISE
    // ==========================================

    function createRadarNoise() {

        if (!radar) {
            return;
        }


        const pulse =
            document.createElement(
                "div"
            );


        pulse.className =
            "radarNoisePulse";


        radar.appendChild(
            pulse
        );


        setTimeout(
            function () {

                pulse.remove();

            },
            1500
        );

    }


    // ==========================================
    // LOW AMMO
    // ==========================================

    function showLowAmmo() {

        if (!lowAmmoWarning) {
            return;
        }


        lowAmmoWarning.classList.add(
            "warningActive"
        );

    }


    function hideLowAmmo() {

        if (!lowAmmoWarning) {
            return;
        }


        lowAmmoWarning.classList.remove(
            "warningActive"
        );

    }


    // ==========================================
    // AMMO UPDATE
    // ==========================================

    function updateAmmo() {

        if (magAmmo) {

            magAmmo.textContent =
                magazine;

        }


        if (reserve) {

            reserve.textContent =
                String(
                    reserveAmmo
                ).padStart(
                    3,
                    "0"
                );

        }


        if (magazine <= 5) {

            showLowAmmo();

        } else {

            hideLowAmmo();

        }

    }


    // ==========================================
    // RELOAD - R KEY
    // ==========================================

    function reloadWeapon() {

        if (!gameRunning) {
            return;
        }


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


        hideLowAmmo();


        document.body.classList.add(
            "reloadFlash"
        );


        setTimeout(
            function () {

                document.body.classList.remove(
                    "reloadFlash"
                );

            },
            180
        );

    }


    // ==========================================
    // FLASHLIGHT
    // ==========================================

    function toggleFlashlight() {

        if (battery <= 0) {
            return;
        }


        flashlightOn =
            !flashlightOn;


        if (flashlightOn) {

            document.body.classList.add(
                "flashlightON"
            );

        } else {

            document.body.classList.remove(
                "flashlightON"
            );

        }

    }


    // ==========================================
    // BATTERY
    // ==========================================

    setInterval(
        function () {

            if (!gameRunning) {
                return;
            }


            if (!flashlightOn) {
                return;
            }


            battery -= 1;


            battery =
                Math.max(
                    0,
                    battery
                );


            if (batteryPercent) {

                batteryPercent.textContent =
                    battery + "%";

            }


            if (battery <= 20) {

                document.body.classList.add(
                    "flashlightFlicker"
                );

            }


            if (battery <= 0) {

                flashlightOn =
                    false;


                document.body.classList.remove(
                    "flashlightON"
                );

            }

        },
        60000
    );


    // ==========================================
    // CLOCK
    // ==========================================

    function updateClock() {

        if (!clock) {
            return;
        }


        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        const hours =
            String(
                now.getHours()
            ).padStart(
                2,
                "0"
            );


        const minutes =
            String(
                now.getMinutes()
            ).padStart(
                2,
                "0"
            );


        const seconds =
            String(
                now.getSeconds()
            ).padStart(
                2,
                "0"
            );


        clock.textContent =
            `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    }


    setInterval(
        updateClock,
        1000
    );


    updateClock();


    // ==========================================
    // RECORDING BLINK
    // ==========================================

    setInterval(
        function () {

            if (!recDot) {
                return;
            }


            recDot.classList.toggle(
                "recBlink"
            );

        },
        500
    );

        // ==========================================
    // INVENTORY
    // ==========================================

    function showInventory() {

        if (!gameRunning) {
            return;
        }


        const existing =
            document.getElementById(
                "quickInventory"
            );


        if (existing) {

            existing.remove();

            return;
        }


        const panel =
            document.createElement(
                "div"
            );


        panel.id =
            "quickInventory";


        panel.innerHTML = `

            <div class="inventoryWindow">

                <div class="inventoryTitle">
                    TACTICAL INVENTORY
                </div>

                <div>
                    PRIMARY:
                    M4 RIFLE
                </div>

                <div>
                    MAGAZINE:
                    ${magazine} / 30
                </div>

                <div>
                    RESERVE:
                    ${reserveAmmo}
                </div>

                <div>
                    BATTERY:
                    ${battery}%
                </div>

                <div>
                    HEALTH:
                    ${playerHealth}%
                </div>

                <div>
                    INSULIN:
                    ${insulinCollected ? "YES" : "NO"}
                </div>

                <small>
                    TAB // CLOSE INVENTORY
                </small>

            </div>

        `;


        document.body.appendChild(
            panel
        );

    }


    // ==========================================
    // PAUSE
    // ==========================================

    function togglePause() {

        if (missionFinished) {
            return;
        }


        paused =
            !paused;


        gameRunning =
            !paused;


        document.body.classList.toggle(
            "gamePaused",
            paused
        );


        // Movement keys reset
        if (paused) {

            keys.w = false;
            keys.a = false;
            keys.s = false;
            keys.d = false;

        }

    }


// ==========================================
// LEVEL FAILED
// ==========================================

function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    // ======================================
    // CALCULATE SURVIVAL TIME
    // ======================================

    const aliveTime =
        Math.floor(
            (
                Date.now() -
                startTime
            ) / 1000
        );

    const minutes =
        Math.floor(
            aliveTime / 60
        );

    const seconds =
        aliveTime % 60;

    // ======================================
    // UPDATE STATS
    // ======================================

    if (timeAlive) {

        timeAlive.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    }

    if (zombiesKilledText) {

        zombiesKilledText.textContent =
            zombiesKilled;

    }

    if (itemsFound) {

        itemsFound.textContent =
            insulinCollected
                ? "1"
                : "0";

    }

    // ======================================
    // UPDATE FAIL SCREEN
    // ======================================

    const failTitle =
        document.getElementById(
            "connectionLost"
        );

    const failSubtitle =
        document.getElementById(
            "signalTerminated"
        );

    const restartButton =
        document.getElementById(
            "restartBtn"
        );

    if (failTitle) {

        failTitle.textContent =
            `LEVEL ${LEVEL_CONFIG.number} // SECTOR ${LEVEL_CONFIG.sector} FAILED`;

    }

    if (failSubtitle) {

        failSubtitle.textContent =
            "// SURVIVOR SIGNAL LOST";

    }

    if (restartButton) {

        restartButton.textContent =
            `↻ RESTART LEVEL ${LEVEL_CONFIG.number}`;

    }

    // ======================================
    // SHOW GAME OVER SCREEN
    // ======================================

    if (gameOver) {

        gameOver.classList.add(
            "active"
        );

    }

    console.log(
        `LEVEL ${LEVEL_CONFIG.number} FAILED`
    );

}


    // ==========================================
    // RESTART BUTTON
    // ==========================================

    if (restartBtn) {

        restartBtn.addEventListener(
            "click",
            function () {

                window.location.reload();

            }
        );

    }

    // ==========================================
    // CONTINUE TO LEVEL 2
    // ==========================================

    const continueMissionBtn =
        document.getElementById("continueMissionBtn");

    if (continueMissionBtn) {

    continueMissionBtn.addEventListener(
        "click",
        function () {

            console.log(
                "LOADING LEVEL 2..."
            );

            window.location.href =
                LEVEL_CONFIG.nextLevel;

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
    // LEVEL 1 OBJECTIVE
    // ==========================================

    function updateObjective() {

        if (!gameRunning) {
            return;
        }


        // ======================================
        // FIND INSULIN
        // ======================================

        if (!insulinCollected) {

            const distance =
                distanceToObject(
                    medicalCrate
                );


            if (distance <= 10) {

                if (pickupPrompt) {

                    pickupPrompt.classList.add(
                        "visible"
                    );

                }

            } else {

                if (pickupPrompt) {

                    pickupPrompt.classList.remove(
                        "visible"
                    );

                }

            }


            return;
        }


        // ======================================
        // ESCAPE
        // ======================================

        const distance =
            distanceToObject(
                escapeDoor
            );


        if (distance <= 10) {

            if (escapePrompt) {

                escapePrompt.classList.add(
                    "visible"
                );

            }

        } else {

            if (escapePrompt) {

                escapePrompt.classList.remove(
                    "visible"
                );

            }

        }

    }


    // ==========================================
    // E KEY OBJECTIVE
    // ==========================================

    function handleObjectiveKey() {

        if (!gameRunning) {
            return;
        }


        // ======================================
        // COLLECT INSULIN
        // ======================================

        if (!insulinCollected) {

            const distance =
                distanceToObject(
                    medicalCrate
                );


            if (distance <= 10) {

                collectInsulin();

            } else {

                console.log(
                    "Move closer to the medical crate."
                );

            }


            return;
        }


        // ======================================
        // ESCAPE THROUGH REAR DOOR
        // ======================================

        const distance =
            distanceToObject(
                escapeDoor
            );


        if (distance <= 10) {

            completeMission();

        } else {

            console.log(
                "Move closer to the rear exit."
            );

        }

    }


    // ==========================================
    // COLLECT INSULIN
    // ==========================================

    function collectInsulin() {

        if (insulinCollected) {
            return;
        }


        insulinCollected =
            true;


        // Hide medical crate

        if (medicalCrate) {

            medicalCrate.classList.add(
                "collected"
            );

        }


        // Hide prompt

        if (pickupPrompt) {

            pickupPrompt.classList.remove(
                "visible"
            );

        }


        // Update objective text

        if (objectiveText) {

            objectiveText.textContent =
                "[X] INSULIN COLLECTED → ESCAPE VIA REAR DOOR";

        }


        // Unlock door

        if (escapeDoor) {

            escapeDoor.classList.add(
                "unlocked"
            );

        }


        // Make sure escape prompt is hidden
        // until player reaches door

        if (escapePrompt) {

            escapePrompt.classList.remove(
                "visible"
            );

        }


        console.log(
            "INSULIN COLLECTED"
        );

        
        

        // Surprise zombies

        spawnSurpriseZombies();

    }


    // ==========================================
    // SURPRISE ZOMBIES
    // ==========================================

    function spawnSurpriseZombies() {

        if (!surpriseZombies) {
            return;
        }

        

        const positions = [

            {
                x: 12,
                y: 20
            },

            {
                x: 85,
                y: 20
            },

            {
                x: 15,
                y: 80
            },

            {
                x: 85,
                y: 80
            }

        ];


        positions.forEach(
            function (position) {

                const zombie =
                    document.createElement(
                        "div"
                    );


                zombie.className =
                    "enemy surpriseZombie";


                zombie.textContent =
                    "🧟";


                zombie.dataset.hp =
                    "100";


                zombie.dataset.dead =
                    "false";


                zombie.dataset.fast =
                    "true";


                zombie.style.left =
                    position.x + "%";


                zombie.style.top =
                    position.y + "%";


                surpriseZombies.appendChild(
                    zombie
                );


                enemies.push(
                    zombie
                );

            }
        );


        document.body.classList.add(
            "surpriseEvent"
        );


        setTimeout(
            function () {

                document.body.classList.remove(
                    "surpriseEvent"
                );

            },
            1200
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
    gameRunning = false;

    // ======================================
    // STOP PLAYER
    // ======================================

    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;

    // ======================================
    // UPDATE OBJECTIVE
    // ======================================

    if (objectiveText) {

        objectiveText.textContent =
            "MISSION ACCOMPLISHED";

    }

    // ======================================
    // HIDE PROMPTS
    // ======================================

    if (pickupPrompt) {

        pickupPrompt.classList.remove(
            "visible"
        );

    }

    if (escapePrompt) {

        escapePrompt.classList.remove(
            "visible"
        );

    }

    // ======================================
    // COMPLETE SCREEN DATA
    // ======================================

    const completeTitle =
        document.getElementById(
            "missionCompleteTitle"
        );

    const completeSubtitle =
        document.getElementById(
            "missionCompleteSubtitle"
        );

    const completeKills =
        document.getElementById(
            "completeKills"
        );

    const completeItems =
        document.getElementById(
            "completeItems"
        );

    const completeXP =
        document.getElementById(
            "completeXP"
        );

    if (completeTitle) {

        completeTitle.textContent =
            `LEVEL ${LEVEL_CONFIG.number} // SECTOR ${LEVEL_CONFIG.sector} COMPLETE`;

    }

    if (completeSubtitle) {

        completeSubtitle.textContent =
            `${LEVEL_CONFIG.name} // EXTRACTION SUCCESSFUL`;

    }

    if (completeKills) {

        completeKills.textContent =
            zombiesKilled;

    }

    if (completeItems) {

        completeItems.textContent =
            insulinCollected ? "1" : "0";

    }

    if (completeXP) {

        completeXP.textContent =
            LEVEL_CONFIG.xp;

    }

    // ======================================
    // SAVE PROGRESS
    // ======================================

    let progress =
        JSON.parse(
            localStorage.getItem(
                "playerProgress"
            )
        ) || {

            currentLevel: 1,
            completedLevels: [],
            xp: 0,
            selectedMap: "hospital",
            selectedWeapon: "pistol",
            unlockedWeapons: ["pistol"],
            unlockedMaps: ["hospital"]

        };

    // Level completed

    if (
        !progress.completedLevels.includes(
            LEVEL_CONFIG.number
        )
    ) {

        progress.completedLevels.push(
            LEVEL_CONFIG.number
        );

    }

    // XP

    progress.xp =
        Math.max(
            Number(progress.xp) || 0,
            0
        ) +
        LEVEL_CONFIG.xp;

    // Unlock next level

    progress.currentLevel =
        Math.max(
            Number(progress.currentLevel) || 1,
            LEVEL_CONFIG.number + 1
        );

    localStorage.setItem(
        "playerProgress",
        JSON.stringify(progress)
    );

    // Legacy values if profile.js uses them

    localStorage.setItem(
        "currentLevel",
        String(
            LEVEL_CONFIG.number
        )
    );

    localStorage.setItem(
        "currentLocation",
        LEVEL_CONFIG.name
    );

    localStorage.setItem(
        "playerXP",
        String(
            LEVEL_CONFIG.xp
        )
    );

    localStorage.setItem(
        "zombiesKilled",
        String(
            zombiesKilled
        )
    );

    localStorage.setItem(
        "itemsFound",
        insulinCollected
            ? "1"
            : "0"
    );

    // ======================================
    // SCREEN FADE
    // ======================================

    document.body.classList.add(
        "missionFade"
    );

    // ======================================
    // SHOW COMPLETE SCREEN
    // ======================================

    setTimeout(
        function () {

            if (missionComplete) {

                missionComplete.classList.add(
                    "active"
                );

            }

        },
        1000
    );

    console.log(
        `LEVEL ${LEVEL_CONFIG.number} COMPLETE`
    );

}

    


    // ==========================================
    // OBJECTIVE LOOP
    // ==========================================

    function objectiveLoop() {

    updateObjective();

    requestAnimationFrame(objectiveLoop);

}


    // ==========================================
// START GAME
// ==========================================

loadPlayerProfile();

setupZombies();
updateAmmo();
updateVitals();


// ==========================================
// MAIN GAME LOOP
// ==========================================

function gameLoop() {

    if (gameRunning && !paused) {
        updateMovement();
    }

    requestAnimationFrame(gameLoop);
}


// START

gameLoop();
updateZombies();
objectiveLoop();

// ==========================================
// LEVEL 1 SURVIVOR PROFILE
// ==========================================

const survivorProfilePanel =
    document.getElementById("survivorProfilePanel");

    console.log("PROFILE PANEL:", survivorProfilePanel);

const resumeGameBtn =
    document.getElementById("resumeGameBtn");

const profileReturnHQBtn =
    document.getElementById("profileReturnHQBtn");


// ==========================================
// OPEN PROFILE
// ==========================================

function openSurvivorProfile() {

    if (!survivorProfilePanel) {
        console.error("PROFILE PANEL NOT FOUND");
        return;
    }

    survivorProfilePanel.classList.add("active");

    survivorProfilePanel.style.setProperty(
        "display",
        "block",
        "important"
    );

    survivorProfilePanel.style.setProperty(
        "opacity",
        "1",
        "important"
    );

    survivorProfilePanel.style.setProperty(
        "visibility",
        "visible",
        "important"
    );

    survivorProfilePanel.style.setProperty(
        "pointer-events",
        "auto",
        "important"
    );

    survivorProfilePanel.style.setProperty(
        "z-index",
        "100000",
        "important"
    );

    paused = true;
    gameRunning = false;

    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;

    console.log("PROFILE OPENED");
}


// ==========================================
// CLOSE PROFILE
// ==========================================

function closeSurvivorProfile() {

    if (!survivorProfilePanel) {
        return;
    }

    survivorProfilePanel.classList.remove("active");

    survivorProfilePanel.style.setProperty(
        "display",
        "none",
        "important"
    );

    survivorProfilePanel.style.setProperty(
        "opacity",
        "0",
        "important"
    );

    survivorProfilePanel.style.setProperty(
        "visibility",
        "hidden",
        "important"
    );

    survivorProfilePanel.style.setProperty(
        "pointer-events",
        "none",
        "important"
    );

    paused = false;
    gameRunning = true;

    console.log("PROFILE CLOSED");
}


// ==========================================
// ESC KEY
// ==========================================

document.addEventListener("keydown", function (event) {

    if (event.key !== "Escape") {
        return;
    }

    if (!survivorProfilePanel) {
        console.error("PROFILE PANEL NOT FOUND");
        return;
    }

    const isOpen =
        survivorProfilePanel.classList.contains("active");

    if (isOpen) {

        closeSurvivorProfile();

    } else {

        openSurvivorProfile();

    }

});


// ==========================================
// RESUME BUTTON
// ==========================================

if (resumeGameBtn) {

    resumeGameBtn.addEventListener("click", function () {

        closeSurvivorProfile();

        console.log("GAME RESUMED");

    });

}


// ==========================================
// RETURN TO HQ
// ==========================================

if (profileReturnHQBtn) {

    profileReturnHQBtn.addEventListener("click", function () {

        closeSurvivorProfile();

        console.log("RETURNING TO HQ");

        // Agar baad me HQ screen banayenge,
        // yahan uska function call kar sakte hain.

    });

}










});