// ==========================================
// ZOMBIE SURVIVAL - LEVEL 5
// NORMAL MODE
// MASTER TERMINAL + MISSION RECORD
// LEVEL 5 → RECORD → CONTINUE → LEVEL 6
// NO AI ENGINE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    localStorage.setItem(
    "currentLevel",
    "5"
);

localStorage.setItem(
    "currentLocation",
    "SECTOR_05"
);

    // ==========================================
    // ELEMENTS
    // ==========================================

    const gameWorld = document.getElementById("gameWorld");
    const player = document.getElementById("player");

    let enemies = Array.from(
        document.querySelectorAll(".enemy")
    );

    const objectiveText =
        document.getElementById("objectiveText");

    const signalStatus =
        document.getElementById("signalStatus");

    const magAmmo =
        document.getElementById("magAmmo");

    const reserve =
        document.getElementById("reserve");

    const batteryPercent =
        document.getElementById("batteryPercent");

    const bpm =
        document.getElementById("bpm");

    const vitalStatus =
        document.getElementById("vitalStatus");

    const damageEffect =
        document.getElementById("damageEffect");

    const radar =
        document.getElementById("radar");

    const lowAmmoWarning =
        document.getElementById("lowAmmoWarning");

    const gameOver =
        document.getElementById("gameOver");

    const medicalCrate =
        document.getElementById("medicalCrate");

    const pickupPrompt =
        document.getElementById("pickupPrompt");

    const escapeDoor =
        document.getElementById("escapeDoor");

    const escapePrompt =
        document.getElementById("escapePrompt");

    const recDot =
        document.getElementById("recDot");

    const clock =
        document.getElementById("clock");


    // ==========================================
    // GAME STATE
    // ==========================================

    let playerX = 50;
    let playerY = 50;

    let playerHealth = 100;

    let magazine = 30;
    let reserveAmmo = 120;

    let battery = 80;

    let currentBPM = 72;

    let zombiesKilled = 0;

    let gameRunning = true;
    let paused = false;

    let flashlightOn = false;
    let sprinting = false;
    let adsMode = false;

    let terminalActivated = false;
    let missionFinished = false;

    let startTime = Date.now();

    let lastDamageTime = 0;



    // ==========================================
    // MOVEMENT
    // ==========================================

    const keys = {
        w: false,
        a: false,
        s: false,
        d: false
    };


    // ==========================================
    // OBSTACLES
    // ==========================================

    const obstacles = [

        {
            x1: 35,
            x2: 45,
            y1: 25,
            y2: 55
        },

        {
            x1: 60,
            x2: 72,
            y1: 45,
            y2: 70
        },

        {
            x1: 20,
            x2: 32,
            y1: 65,
            y2: 80
        }

    ];


    // ==========================================
    // COLLISION
    // ==========================================

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

        const objectX =
            (
                objectRect.left +
                objectRect.width / 2 -
                worldRect.left
            ) /
            worldRect.width *
            100;

        const objectY =
            (
                objectRect.top +
                objectRect.height / 2 -
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
    // KEYBOARD DOWN
    // ==========================================

    document.addEventListener(
        "keydown",
        function (event) {

            const key =
                event.key.toLowerCase();


            // MOVEMENT
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


            // SPRINT
            if (event.key === "Shift") {
                sprinting = true;
            }


            // FLASHLIGHT
            if (key === "f") {
                toggleFlashlight();
            }


            // RELOAD
            if (key === "r") {
                reloadWeapon();
            }


            // INTERACTION
            if (key === "e") {
                handleInteraction();
            }


            // PAUSE
            if (event.key === "Escape") {
                togglePause();
            }


            // INVENTORY
            if (event.key === "Tab") {

                event.preventDefault();

                showInventory();

            }

        }
    );


    // ==========================================
    // KEYBOARD UP
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
    // MOUSE SHOOTING
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


            // RIGHT CLICK = AIM
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


    // DISABLE RIGHT CLICK MENU
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

        const baseSpeed =
            sprinting
                ? 0.55
                : 0.28;

        let dx = 0;
        let dy = 0;


        if (keys.w) {
            dy -= baseSpeed;
        }

        if (keys.s) {
            dy += baseSpeed;
        }

        if (keys.a) {
            dx -= baseSpeed;
        }

        if (keys.d) {
            dx += baseSpeed;
        }


        // DIAGONAL NORMALIZATION
        if (
            dx !== 0 &&
            dy !== 0
        ) {

            dx *= 0.7071;
            dy *= 0.7071;

        }


        const nextX =
            Math.max(
                5,
                Math.min(
                    95,
                    playerX + dx
                )
            );


        const nextY =
            Math.max(
                8,
                Math.min(
                    92,
                    playerY + dy
                )
            );


        if (
            !isBlocked(
                nextX,
                nextY
            )
        ) {

            playerX = nextX;
            playerY = nextY;

        }


        if (player) {

            player.style.left =
                playerX + "%";

            player.style.top =
                playerY + "%";

        }


        // HEART RATE
        if (
            sprinting &&
            (
                dx !== 0 ||
                dy !== 0
            )
        ) {

            currentBPM =
                Math.min(
                    150,
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
                currentBPM >= 125 ||
                playerHealth < 30
            ) {

                vitalStatus.textContent =
                    "CRITICAL";

                document.body.classList.add(
                    "critical"
                );

            } else {

                vitalStatus.textContent =
                    "STABLE";

                document.body.classList.remove(
                    "critical"
                );

            }

        }

    }


    // ==========================================
    // AMMO
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


        if (lowAmmoWarning) {

            lowAmmoWarning.classList.toggle(
                "warningActive",
                magazine <= 5
            );

        }

    }


    // ==========================================
    // SHOOT
    // ==========================================

    function shoot() {

        if (
            !gameRunning ||
            paused
        ) {
            return;
        }


        // EMPTY MAGAZINE
        if (magazine <= 0) {

            updateAmmo();

            return;

        }


        magazine--;

        updateAmmo();

        createMuzzleFlash();

        createRadarNoise();

        


        let closestZombie = null;

        let closestDistance =
            Infinity;


        // FIND CLOSEST ZOMBIE
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
                    playerX -
                    zombieX;


                const dy =
                    playerY -
                    zombieY;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance <
                    closestDistance &&
                    distance < 30
                ) {

                    closestDistance =
                        distance;

                    closestZombie =
                        enemy;

                }

            }
        );


        // DAMAGE
        if (closestZombie) {

            damageZombie(
                closestZombie
            );

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


        const damage =
            50;


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
            150
        );


        // ZOMBIE DEAD
        if (hp <= 0) {

         

            enemy.dataset.dead =
                "true";


            enemy.style.opacity =
                "0.2";


            enemy.style.pointerEvents =
                "none";


            enemy.style.transform =
                "scale(.7) rotate(25deg)";


            zombiesKilled++;


            updateKillCounter();

        }

    }


    // ==========================================
    // KILL COUNTER
    // ==========================================

    function updateKillCounter() {

        const counter =
            document.getElementById(
                "zombiesKilled"
            );

        if (counter) {

            counter.textContent =
                zombiesKilled;

        }

    }


    // ==========================================
    // RELOAD
    // ==========================================

    function reloadWeapon() {

        if (
            !gameRunning ||
            paused
        ) {
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


        magazine += amount;

        reserveAmmo -= amount;


        updateAmmo();

        

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


        document.body.classList.toggle(
            "flashlightON",
            flashlightOn
        );

    }


    // ==========================================
    // FLASHLIGHT BATTERY
    // ==========================================

    setInterval(
        function () {

            if (
                gameRunning &&
                flashlightOn
            ) {

                battery--;

                battery =
                    Math.max(
                        0,
                        battery
                    );


                if (batteryPercent) {

                    batteryPercent.textContent =
                        battery + "%";

                }


                if (battery <= 0) {

                    flashlightOn =
                        false;

                    document.body.classList.remove(
                        "flashlightON"
                    );

                }

            }

        },
        5000
    );


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
    // RADAR
    // ==========================================

    function createRadarNoise() {

        if (!radar) {
            return;
        }


        radar.classList.add(
            "pulseActive"
        );


        setTimeout(
            function () {

                radar.classList.remove(
                    "pulseActive"
                );

            },
            500
        );

    }


    // ==========================================
    // INTERACTION
    // ==========================================

    function handleInteraction() {

    if (!gameRunning || paused) {
        return;
    }

    const terminal =
        document.getElementById("aiTerminal");

    if (!terminalActivated) {

        if (
            terminal &&
            distanceToObject(terminal) < 12
        ) {

            activateMasterTerminal();

        } else {

            if (objectiveText) {
                objectiveText.textContent =
                    "MOVE CLOSER TO MASTER TERMINAL";
            }

        }

        return;
    }

    // Terminal activated = mission complete
    completeLevel5();
}


    // ==========================================
    // MASTER TERMINAL
    // ==========================================

    function activateMasterTerminal() {

    if (terminalActivated) {
        return;
    }

    terminalActivated = true;

    if (objectiveText) {

        objectiveText.textContent =
            "MASTER TERMINAL INITIALIZED // EXTRACT";

        objectiveText.style.color =
            "#00ff00";
    }

    if (signalStatus) {

        signalStatus.innerHTML =
            "SIGNAL: <span>LEVEL 5 COMPLETE</span>";
    }

    const terminalStatus =
        document.getElementById("terminalStatus");

    const hackText =
        document.getElementById("hackText");

    const hackPrompt =
        document.getElementById("hackPrompt");

    if (terminalStatus) {
        terminalStatus.textContent =
            "AUTHORIZATION ACCEPTED";
    }

    if (hackText) {
        hackText.textContent =
            "AI GENERATOR INITIALIZED";
    }

    if (hackPrompt) {
        hackPrompt.textContent =
            "SYSTEM EXTRACTION READY";
    }

    document.body.classList.add(
        "terminalActivated"
    );

    if (pickupPrompt) {
        pickupPrompt.textContent = "";
    }

    // Complete after short terminal boot sequence
    setTimeout(function () {

        if (gameRunning && terminalActivated) {
            completeLevel5();
        }

    }, 1200);
}



// ==========================================
// COMPLETE LEVEL 5
// ==========================================

function completeLevel5() {

    if (missionFinished) {
        return;
    }

    missionFinished = true;
    gameRunning = false;

    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;

    sprinting = false;

    // Stop flashlight
    flashlightOn = false;
    document.body.classList.remove("flashlightON");

    if (objectiveText) {
        objectiveText.textContent =
            "LEVEL 5 COMPLETE // EXTRACTION SUCCESSFUL";

        objectiveText.style.color = "#00ff66";
    }

    if (signalStatus) {
        signalStatus.innerHTML =
            "SIGNAL: <span>EXTRACTION SUCCESSFUL</span>";
    }

    document.body.classList.add(
        "levelComplete"
    );

    // ==========================================
// SAVE LEVEL 5 PROGRESS
// ==========================================

localStorage.setItem(
    "currentLevel",
    "5"
);

localStorage.setItem(
    "currentLocation",
    "SECTOR_05 // COMPLETE"
);


// ==========================================
// UPDATE MAIN MENU PROGRESS
// LEVEL 5 COMPLETE → LEVEL 6 UNLOCK
// ==========================================

let playerProgress = {};

try {

    playerProgress =
        JSON.parse(
            localStorage.getItem("playerProgress")
        ) || {};

} catch (error) {

    console.error(
        "PLAYER PROGRESS LOAD ERROR:",
        error
    );

    playerProgress = {};

}


// Make sure completedLevels exists
if (
    !Array.isArray(
        playerProgress.completedLevels
    )
) {

    playerProgress.completedLevels = [];

}


// Mark Level 5 completed
if (
    !playerProgress.completedLevels.includes(5)
) {

    playerProgress.completedLevels.push(5);

}


// Unlock Level 6
if (
    Number(
        playerProgress.currentLevel || 1
    ) < 6
) {

    playerProgress.currentLevel = 6;

}


// Keep selected level valid
playerProgress.selectedLevel = 6;


// Save progress
localStorage.setItem(
    "playerProgress",
    JSON.stringify(
        playerProgress
    )
);


// Other Level 5 data
localStorage.setItem(
    "playerXP",
    localStorage.getItem("playerXP") || "0"
);

localStorage.setItem(
    "zombiesKilled",
    zombiesKilled
);


console.log(
    "LEVEL 5 COMPLETE → LEVEL 6 UNLOCKED"
);

console.log(
    "PLAYER PROGRESS:",
    playerProgress
);


    // Show completion screen first
    showLevelComplete();
}

// ==========================================
// LEVEL COMPLETE SCREEN
// ==========================================

function showLevelComplete() {

    // Remove existing screen
    const existing =
        document.getElementById(
            "level5CompleteScreen"
        );

    if (existing) {
        existing.remove();
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "level5CompleteScreen";

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "99999";

    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    overlay.style.background =
        "rgba(0,0,0,.90)";

    overlay.style.fontFamily =
        "monospace";

    overlay.style.color =
        "#00ff66";

    overlay.innerHTML = `

        <div style="
            width:min(760px,90vw);
            padding:45px;
            text-align:center;

            border:1px solid #00ff66;

            background:
                rgba(0,15,10,.96);

            box-shadow:
                0 0 25px rgba(0,255,100,.25),
                inset 0 0 30px rgba(0,255,100,.05);
        ">

            <div style="
                font-size:42px;
                font-weight:bold;
                letter-spacing:6px;
                color:#00ff66;

                text-shadow:
                    0 0 10px #00ff66,
                    0 0 25px #00ff66;

                margin-bottom:18px;
            ">
                LEVEL 5 COMPLETE
            </div>


            <div style="
                font-size:18px;
                letter-spacing:4px;
                color:#00ffff;
                margin-bottom:12px;
            ">
                // SECTOR 05 //
            </div>


            <div style="
                font-size:15px;
                letter-spacing:3px;
                color:#00ff66;
                margin-bottom:35px;
            ">
                OPERATION COMPLETE // EXTRACTION SUCCESSFUL
            </div>


            <div style="
                border:1px solid
                rgba(0,255,255,.35);

                padding:22px;
                margin-bottom:30px;

                color:#00ffff;

                background:
                rgba(0,255,255,.03);
            ">

                <div style="
                    font-size:18px;
                    margin-bottom:10px;
                ">
                    MASTER TERMINAL
                </div>

                <div style="
                    color:#00ff66;
                    font-size:14px;
                    letter-spacing:2px;
                ">
                    SECURED
                </div>

            </div>


            <button
                id="level5RecordBtn"
                style="
                    width:100%;
                    padding:16px;

                    border:1px solid #00ffff;

                    background:
                    rgba(0,255,255,.06);

                    color:#00ffff;

                    font-family:monospace;
                    font-size:17px;

                    letter-spacing:4px;

                    cursor:pointer;

                    transition:
                    .2s ease;
                "
            >
                VIEW MISSION RECORD →
            </button>

        </div>

    `;

    document.body.appendChild(
        overlay
    );


    const recordBtn =
        document.getElementById(
            "level5RecordBtn"
        );


    if (recordBtn) {

        recordBtn.addEventListener(
            "mouseenter",
            function () {

                recordBtn.style.background =
                    "rgba(0,255,255,.15)";

                recordBtn.style.boxShadow =
                    "0 0 20px rgba(0,255,255,.25)";

            }
        );


        recordBtn.addEventListener(
            "mouseleave",
            function () {

                recordBtn.style.background =
                    "rgba(0,255,255,.06)";

                recordBtn.style.boxShadow =
                    "none";

            }
        );


        recordBtn.addEventListener(
            "click",
            function () {

                overlay.remove();

                createMissionRecord();

            }
        );

    }

}

    // ==========================================
    // MISSION RECORD SCREEN
    // ==========================================

    function createMissionRecord() {

        // REMOVE IF ALREADY EXISTS
        const old =
            document.getElementById(
                "level5RecordScreen"
            );


        if (old) {
            old.remove();
        }


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


        const timeString =
            String(minutes).padStart(
                2,
                "0"
            )
            +
            ":"
            +
            String(seconds).padStart(
                2,
                "0"
            );


        const overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "level5RecordScreen";


        // ======================================
        // STYLE
        // ======================================

        overlay.style.position =
            "fixed";

        overlay.style.inset =
            "0";

        overlay.style.zIndex =
            "99999";

        overlay.style.display =
            "flex";

        overlay.style.alignItems =
            "center";

        overlay.style.justifyContent =
            "center";

        overlay.style.background =
            "rgba(0,0,0,.94)";

        overlay.style.color =
            "#00ffff";

        overlay.style.fontFamily =
            "monospace";


        // ======================================
        // CONTENT
        // ======================================

        overlay.innerHTML = `

            <div style="
                width:min(620px,90vw);
                padding:40px;
                border:1px solid #00ffff;
                background:
                    rgba(0,20,25,.96);
                box-shadow:
                    0 0 40px
                    rgba(0,255,255,.25);
                text-align:center;
            ">

                <div style="
                    font-size:28px;
                    letter-spacing:6px;
                    color:#00ffff;
                    margin-bottom:12px;
                ">
                    MISSION RECORD
                </div>


                <div style="
                    font-size:16px;
                    color:#00ff66;
                    margin-bottom:30px;
                ">
                    LEVEL 5 // COMPLETE
                </div>


                <div style="
                    display:grid;
                    grid-template-columns:
                    1fr 1fr;
                    gap:14px;
                    text-align:left;
                    margin-bottom:30px;
                ">

                    <div>
                        ZOMBIES KILLED
                    </div>

                    <div style="
                        text-align:right;
                        color:#ffffff;
                    ">
                        ${zombiesKilled}
                    </div>


                    <div>
                        TIME ALIVE
                    </div>

                    <div style="
                        text-align:right;
                        color:#ffffff;
                    ">
                        ${timeString}
                    </div>


                    <div>
                        HEALTH
                    </div>

                    <div style="
                        text-align:right;
                        color:#ffffff;
                    ">
                        ${playerHealth}%
                    </div>


                    <div>
                        MAGAZINE
                    </div>

                    <div style="
                        text-align:right;
                        color:#ffffff;
                    ">
                        ${magazine}/30
                    </div>


                    <div>
                        RESERVE
                    </div>

                    <div style="
                        text-align:right;
                        color:#ffffff;
                    ">
                        ${reserveAmmo}
                    </div>

                </div>


                <div style="
                    border-top:1px solid
                    rgba(0,255,255,.3);
                    padding-top:25px;
                    margin-bottom:25px;
                    color:#00ff66;
                ">
                    MASTER TERMINAL SECURED
                </div>


                <button
                    id="level5ContinueBtn"
                    style="
                        width:100%;
                        padding:16px;
                        border:1px solid #00ffff;
                        background:
                        rgba(0,255,255,.08);
                        color:#00ffff;
                        font-family:monospace;
                        font-size:18px;
                        letter-spacing:4px;
                        cursor:pointer;
                    "
                >
                    CONTINUE →
                </button>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        // ======================================
        // CONTINUE BUTTON
        // ======================================

        const continueBtn =
            document.getElementById(
                "level5ContinueBtn"
            );


        if (continueBtn) {

            continueBtn.addEventListener(
                "click",
                function () {

                    continueToLevel6();

                }
            );

        }

    }


    // ==========================================
    // CONTINUE TO LEVEL 6
    // ==========================================

    function continueToLevel6() {

        const button =
            document.getElementById(
                "level5ContinueBtn"
            );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "LOADING LEVEL 6...";

        }


        setTimeout(
            function () {

                window.location.href =
                    "level6.html";

            },
            500
        );

    }


    // ==========================================
    // DAMAGE PLAYER
    // ==========================================

    function damagePlayer(amount) {

        if (
            !gameRunning ||
            paused
        ) {
            return;
        }


        const now =
            Date.now();


        if (
            now -
            lastDamageTime <
            900
        ) {
            return;
        }


        lastDamageTime =
            now;


        playerHealth -= amount;


        playerHealth =
            Math.max(
                0,
                playerHealth
            );


        currentBPM =
            Math.min(
                150,
                currentBPM + 15
            );


        if (damageEffect) {

            damageEffect.classList.add(
                "damageActive"
            );


            setTimeout(
                function () {

                    damageEffect.classList.remove(
                        "damageActive"
                    );

                },
                250
            );

        }


        updateVitals();


        if (playerHealth <= 0) {

            endGame();

        }

    }


    // ==========================================
    // NORMAL ZOMBIE MOVEMENT
    // ==========================================

    function updateEnemies() {

        if (
            !gameRunning ||
            paused
        ) {
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


                let zombieX =
                    parseFloat(
                        enemy.style.left
                    );


                let zombieY =
                    parseFloat(
                        enemy.style.top
                    );


                if (
                    Number.isNaN(zombieX) ||
                    Number.isNaN(zombieY)
                ) {
                    return;
                }


                const dx =
                    playerX -
                    zombieX;


                const dy =
                    playerY -
                    zombieY;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (distance <= 0) {
                    return;
                }


                // NORMAL ZOMBIE SPEED
                const speed =
                    0.055;


                zombieX +=
                    (
                        dx /
                        distance
                    ) *
                    speed;


                zombieY +=
                    (
                        dy /
                        distance
                    ) *
                    speed;


                zombieX =
                    Math.max(
                        5,
                        Math.min(
                            95,
                            zombieX
                        )
                    );


                zombieY =
                    Math.max(
                        8,
                        Math.min(
                            92,
                            zombieY
                        )
                    );


                enemy.style.left =
                    zombieX + "%";


                enemy.style.top =
                    zombieY + "%";


                // ATTACK
                if (distance < 5) {

                    damagePlayer(8);

                

                }

            }
        );

    }


    // ==========================================
    // GAME OVER
    // ==========================================

    function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;

    sprinting = false;

    showLevelFailed();

}

// ==========================================
// LEVEL FAILED SCREEN
// ==========================================

function showLevelFailed() {

    const existing =
        document.getElementById(
            "level5FailedScreen"
        );

    if (existing) {
        existing.remove();
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "level5FailedScreen";

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "99999";

    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    overlay.style.background =
        "rgba(0,0,0,.94)";

    overlay.style.fontFamily =
        "monospace";

    overlay.style.color =
        "#ff3333";

    overlay.innerHTML = `

        <div style="
            width:min(620px,90vw);
            padding:40px;

            text-align:center;

            border:1px solid #ff3333;

            background:
            rgba(20,0,0,.96);

            box-shadow:
            0 0 35px
            rgba(255,0,0,.25);
        ">

            <div style="
                font-size:38px;
                letter-spacing:6px;
                font-weight:bold;

                text-shadow:
                0 0 12px #ff3333;
            ">
                LEVEL 5 FAILED
            </div>


            <div style="
                margin-top:18px;
                margin-bottom:30px;

                color:#ff6666;
                letter-spacing:3px;
            ">
                OPERATOR VITALS CRITICAL
            </div>


            <div style="
                border-top:
                1px solid
                rgba(255,50,50,.3);

                border-bottom:
                1px solid
                rgba(255,50,50,.3);

                padding:20px;
                margin-bottom:30px;

                color:#ffffff;
            ">

                ZOMBIES KILLED:
                ${zombiesKilled}

                <br><br>

                FINAL HEALTH:
                ${playerHealth}%

            </div>


            <button
                id="level5RetryBtn"
                style="
                    width:100%;
                    padding:16px;

                    border:1px solid #ff3333;

                    background:
                    rgba(255,0,0,.06);

                    color:#ff4444;

                    font-family:monospace;
                    font-size:17px;

                    letter-spacing:4px;

                    cursor:pointer;
                "
            >
                RETRY LEVEL 5
            </button>

        </div>

    `;

    document.body.appendChild(
        overlay
    );


    const retryBtn =
        document.getElementById(
            "level5RetryBtn"
        );


    if (retryBtn) {

        retryBtn.addEventListener(
            "click",
            function () {

                window.location.reload();

            }
        );

    }

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


        if (paused) {

            keys.w = false;
            keys.a = false;
            keys.s = false;
            keys.d = false;

        }


        gameRunning =
            !paused;


        document.body.classList.toggle(
            "gamePaused",
            paused
        );

    }


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
                    LEVEL: 5
                </div>

                <div>
                    MAG:
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
                    TERMINAL:
                    ${terminalActivated
                        ? "ONLINE"
                        : "LOCKED"}
                </div>

                <small>
                    TAB // CLOSE
                </small>

            </div>

        `;


        document.body.appendChild(
            panel
        );

    }


    // ==========================================
    // CLOCK
    // ==========================================

    function updateClock() {

        if (!clock) {
            return;
        }


        const now =
            new Date();


        clock.textContent =
            now.toISOString()
                .slice(0, 19)
                .replace(
                    "T",
                    " "
                );

    }


    setInterval(
        updateClock,
        1000
    );


    updateClock();


    // ==========================================
    // RECORDING LIGHT
    // ==========================================

    setInterval(
        function () {

            if (recDot) {

                recDot.classList.toggle(
                    "recBlink"
                );

            }

        },
        500
    );


    // ==========================================
    // INITIALIZE ZOMBIES
    // ==========================================

    enemies.forEach(
        function (enemy, index) {

            if (!enemy) {
                return;
            }


            enemy.dataset.hp =
                enemy.dataset.hp ||
                "100";


            enemy.dataset.dead =
                "false";


            enemy.style.position =
                "absolute";


            // ZOMBIE 1
            if (index === 0) {

                enemy.style.left =
                    "20%";

                enemy.style.top =
                    "25%";

            }


            // ZOMBIE 2
            if (index === 1) {

                enemy.style.left =
                    "80%";

                enemy.style.top =
                    "25%";

            }


            // ZOMBIE 3
            if (index === 2) {

                enemy.style.left =
                    "75%";

                enemy.style.top =
                    "75%";

            }


            // ZOMBIE 4
            if (index === 3) {

                enemy.style.left =
                    "25%";

                enemy.style.top =
                    "75%";

            }

        }
    );


    // ==========================================
    // INITIAL UI
    // ==========================================

    updateAmmo();

    updateVitals();


    updateClock();

    updateKillCounter();


    if (batteryPercent) {

        batteryPercent.textContent =
            battery + "%";

    }


    if (objectiveText) {

        objectiveText.textContent =
            "LEVEL 5 // INITIALIZE MASTER TERMINAL";

        objectiveText.style.color =
            "#00ffff";

    }


    if (signalStatus) {

        signalStatus.innerHTML =
            "SIGNAL: <span>LEVEL 5 ACTIVE</span>";

    }


    // ==========================================
    // MAIN GAME LOOP
    // ==========================================

    function gameLoop() {

        if (gameRunning) {

            updateMovement();

            updateEnemies();

        }


        requestAnimationFrame(
            gameLoop
        );

    }


    // ==========================================
    // START
    // ==========================================

    requestAnimationFrame(
        gameLoop
    );

});