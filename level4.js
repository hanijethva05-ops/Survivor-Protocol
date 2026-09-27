document.addEventListener("DOMContentLoaded", function () {

    

    // ==========================================
    // ELEMENTS
    // ==========================================

    const gameWorld =
        document.getElementById("gameWorld");

    const player =
        document.getElementById("player");

    const enemiesContainer =
        document.getElementById("enemies");

    const terminal1 =
        document.getElementById("terminal1");

    const terminal2 =
        document.getElementById("terminal2");

    const mainCore =
        document.getElementById("mainCore");

    const escapePod =
        document.getElementById("escapePod");

    const objectiveText =
        document.getElementById("objectiveText");

    const healthText =
        document.getElementById("health");

    const batteryText =
        document.getElementById("batteryPercent");

    const magAmmo =
        document.getElementById("magAmmo");

    const reserveAmmoText =
        document.getElementById("reserveAmmo");

    const hackBar =
        document.getElementById("hackProgress");

    const hackPercent =
        document.getElementById("hackPercent");

    const timerText =
        document.getElementById("timer");

    const damageEffect =
        document.getElementById("damageEffect");

    const finalScreen =
        document.getElementById("finalScreen");


    // ==========================================
    // GAME STATE
    // ==========================================

    let playerX = 50;
    let playerY = 85;

    let playerHealth = 100;

    let battery = 80;

    let magazine = 30;
    let reserveAmmo = 90;

    let terminal1Hacked = false;
    let terminal2Hacked = false;

    let coreOverloaded = false;

    let defenseTurretsActive = true;

    let selfDestructTimer = 45;

    let hackProgress = 0;

    let hackingTerminal = null;

    let gameRunning = true;

    let escapeReady = false;

    let lastDamageTime = 0;

    let enemies = [];

    let turretDamageTime = 0;


    // ==========================================
    // KEY STATE
    // ==========================================

    const keys = {

        w: false,
        a: false,
        s: false,
        d: false

    };


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


            // ==================================
            // E = INTERACT
            // ==================================

            if (key === "e") {

                interact();

            }


            // ==================================
            // R = RELOAD
            // ==================================

            if (key === "r") {

                reload();

            }


        }
    );


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

        }
    );


    // ==========================================
    // MOVEMENT
    // ==========================================

    function updateMovement() {

        if (!gameRunning) {
            return;
        }


        let speed = 0.35;


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

        if (
            dx !== 0 &&
            dy !== 0
        ) {

            dx *= 0.7071;
            dy *= 0.7071;

        }


        playerX += dx;
        playerY += dy;


        // BOUNDARIES

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
                3,
                Math.min(
                    97,
                    playerY
                )
            );


        player.style.left =
            playerX + "%";

        player.style.top =
            playerY + "%";


        // TURRET CHECK

        checkTurrets();

    }


    // ==========================================
    // DISTANCE
    // ==========================================

    function distanceTo(
        element
    ) {

        if (!element) {
            return Infinity;
        }


        const rect =
            element.getBoundingClientRect();


        const worldRect =
            gameWorld.getBoundingClientRect();


        const x =
            (
                rect.left +
                rect.width / 2 -
                worldRect.left
            )
            /
            worldRect.width
            *
            100;


        const y =
            (
                rect.top +
                rect.height / 2 -
                worldRect.top
            )
            /
            worldRect.height
            *
            100;


        const dx =
            playerX - x;


        const dy =
            playerY - y;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }


    // ==========================================
    // INTERACTION
    // ==========================================

    function interact() {

        if (!gameRunning) {
            return;
        }


        // TERMINAL 1

        if (!terminal1Hacked) {

            if (
                distanceTo(terminal1)
                < 12
            ) {

                hackTerminal(
                    terminal1
                );

                return;

            }

        }


        // TERMINAL 2

        if (
            terminal1Hacked &&
            !terminal2Hacked
        ) {

            if (
                distanceTo(terminal2)
                < 12
            ) {

                hackTerminal(
                    terminal2
                );

                return;

            }

        }


        // MAIN CORE

        if (
            terminal1Hacked &&
            terminal2Hacked &&
            !coreOverloaded
        ) {

            if (
                distanceTo(mainCore)
                < 13
            ) {

                overloadCore();

                return;

            }

        }


        // ESCAPE POD

        if (escapeReady) {

            if (
                distanceTo(escapePod)
                < 12
            ) {

                finishMission();

            }

        }

    }


    // ==========================================
    // HACK TERMINAL
    // ==========================================

    function hackTerminal(
        terminal
    ) {

        if (
            hackingTerminal
        ) {
            return;
        }


        hackingTerminal =
            terminal;


        hackProgress = 0;


        objectiveText.textContent =
            "HOLD E // HACKING";


        const hackInterval =
            setInterval(
                function () {

                    if (
                        !gameRunning ||
                        hackingTerminal !== terminal
                    ) {

                        clearInterval(
                            hackInterval
                        );

                        return;

                    }


                    // E MUST BE HELD

                    if (!keys.e) {

                        /*
                         * Keyboard E key state
                         * is handled separately below.
                         */

                    }

                    hackProgress += 2;


                    hackBar.style.width =
                        hackProgress + "%";


                    hackPercent.textContent =
                        Math.floor(
                            hackProgress
                        ) + "%";


                    if (
                        hackProgress >= 100
                    ) {

                        clearInterval(
                            hackInterval
                        );

                        completeHack(
                            terminal
                        );

                    }

                },
                50
            );

    }


    // ==========================================
    // E HOLD SUPPORT
    // ==========================================

    let eHeld = false;


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key.toLowerCase()
                === "e"
            ) {

                eHeld = true;

            }

        }
    );


    document.addEventListener(
        "keyup",
        function (event) {

            if (
                event.key.toLowerCase()
                === "e"
            ) {

                eHeld = false;

            }

        }
    );


    // ==========================================
    // BETTER HACK LOOP
    // ==========================================

    function updateHacking() {

        if (
            !hackingTerminal ||
            !gameRunning
        ) {

            return;

        }


        if (!eHeld) {

            hackProgress =
                Math.max(
                    0,
                    hackProgress - 1
                );

        }
        else {

            hackProgress += 1.5;

        }


        hackProgress =
            Math.min(
                100,
                hackProgress
            );


        hackBar.style.width =
            hackProgress + "%";


        hackPercent.textContent =
            Math.floor(
                hackProgress
            ) + "%";


        if (
            hackProgress >= 100
        ) {

            completeHack(
                hackingTerminal
            );

            hackingTerminal =
                null;

        }

    }


    // ==========================================
    // COMPLETE HACK
    // ==========================================

    function completeHack(
        terminal
    ) {

    
        
        terminal.classList.add(
            "hacked"
        );


        terminal.querySelector(
            "span"
        ).textContent =
            "HACK COMPLETE";


        hackProgress = 0;

        hackBar.style.width =
            "0%";

        hackPercent.textContent =
            "0%";


        if (
            terminal === terminal1
        ) {

            terminal1Hacked =
                true;


            objectiveText.textContent =
                "HACK SUB TERMINAL 02";

        }


        if (
            terminal === terminal2
        ) {

            terminal2Hacked =
                true;


            defenseTurretsActive =
                false;


            document.querySelectorAll(
                ".turret"
            ).forEach(
                function (turret) {

                    turret.classList.add(
                        "turretsOff"
                    );

                }
            );


            objectiveText.textContent =
                "TURRETS OFF → OVERLOAD MAIN CORE";

        }

    }


    // ==========================================
    // CORE OVERLOAD
    // ==========================================

    function overloadCore() {

        if (
            coreOverloaded
        ) {
            return;
        }


        coreOverloaded =
            true;


        selfDestructTimer =
            45;


        mainCore.querySelector(
            "span"
        ).textContent =
            "CORE OVERLOADED";


        objectiveText.textContent =
            "CRITICAL WARNING: ESCAPE LAB";


        document.body.classList.add(
            "alertMode"
        );


        // ARMOR ZOMBIES

        spawnArmoredHorde();


        // SHOW ESCAPE AFTER CORE

        escapeReady =
            false;

    }


    // ==========================================
    // ARMOR ZOMBIE SPAWN
    // ==========================================

    function spawnArmoredHorde() {

        for (
            let i = 0;
            i < 20;
            i++
        ) {

            spawnArmoredZombie();

        }

    }


    function spawnArmoredZombie() {

        const zombie =
            document.createElement(
                "div"
            );


        zombie.className =
            "enemy armored";


        zombie.textContent =
            "🧟";


        zombie.dataset.hp =
            "100";


        zombie.dataset.armored =
            "true";


        zombie.dataset.dead =
            "false";


        // RANDOM EDGE

        const side =
            Math.floor(
                Math.random() * 4
            );


        let x;
        let y;


        if (side === 0) {

            x = 5;
            y = Math.random() * 90 + 5;

        }
        else if (side === 1) {

            x = 95;
            y = Math.random() * 90 + 5;

        }
        else if (side === 2) {

            x = Math.random() * 90 + 5;
            y = 5;

        }
        else {

            x = Math.random() * 90 + 5;
            y = 95;

        }


        zombie.style.left =
            x + "%";


        zombie.style.top =
            y + "%";


        enemiesContainer.appendChild(
            zombie
        );


        enemies.push(
            zombie
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
                    enemy.dataset.dead
                    === "true"
                ) {
                    return;
                }


                let x =
                    parseFloat(
                        enemy.style.left
                    );


                let y =
                    parseFloat(
                        enemy.style.top
                    );


                let dx =
                    playerX - x;


                let dy =
                    playerY - y;


                let distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance > 0
                ) {

                    let speed =
                        enemy.dataset.armored
                            === "true"
                            ? 0.14
                            : 0.10;


                    x +=
                        (
                            dx / distance
                        ) *
                        speed;


                    y +=
                        (
                            dy / distance
                        ) *
                        speed;


                    enemy.style.left =
                        x + "%";


                    enemy.style.top =
                        y + "%";

                }


                if (
                    distance < 4
                ) {

                    damagePlayer();

                }

            }
        );

    }


    // ==========================================
    // PLAYER DAMAGE
    // ==========================================

    function damagePlayer() {

        const now =
            Date.now();

            


        if (
            now - lastDamageTime
            < 800
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


        healthText.textContent =
            playerHealth;


        damageEffect.classList.remove(
            "damage"
        );


        void damageEffect.offsetWidth;


        damageEffect.classList.add(
            "damage"
        );


        if (
            playerHealth <= 0
        ) {

            gameOver();

        }

    }


    // ==========================================
    // TURRET SYSTEM
    // ==========================================

    function checkTurrets() {

        if (
            !defenseTurretsActive
        ) {

            return;

        }


        const turrets =
            document.querySelectorAll(
                ".turret"
            );


        turrets.forEach(
            function (turret) {

                const distance =
                    distanceTo(
                        turret
                    );


                if (
                    distance < 18
                ) {

                    const now =
                        Date.now();


                    if (
                        now -
                        turretDamageTime
                        > 1000
                    ) {

                        turretDamageTime =
                            now;


                        damagePlayer();

                    }

                }

            }
        );

    }


    // ==========================================
    // SHOOTING
    // ==========================================

    document.addEventListener(
        "mousedown",
        function (event) {

            if (!gameRunning) {
                return;
            }


            if (
                event.button === 0
            ) {

                shoot();

            }

        }
    );


    function shoot() {

        if (
            magazine <= 0
        ) {

            reload();

            return;

        }

        


        magazine--;


        magAmmo.textContent =
            magazine;


        let closest =
            null;


        let closestDistance =
            Infinity;


        enemies.forEach(
            function (enemy) {

                if (
                    enemy.dataset.dead
                    === "true"
                ) {

                    return;

                }


                let x =
                    parseFloat(
                        enemy.style.left
                    );


                let y =
                    parseFloat(
                        enemy.style.top
                    );


                let dx =
                    playerX - x;


                let dy =
                    playerY - y;


                let distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance <
                    closestDistance &&
                    distance < 25
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
    // DAMAGE ENEMY
    // ==========================================

    function damageEnemy(
        enemy
    ) {

        let hp =
            parseInt(
                enemy.dataset.hp ||
                "100"
            );


        let damage = 34;


        // ARMORED = 50% DAMAGE

        if (
            enemy.dataset.armored
            === "true"
        ) {

            damage =
                damage * 0.5;

        }


        hp -= damage;


        enemy.dataset.hp =
            hp;


        if (
            hp <= 0
        ) {

            enemy.dataset.dead =
                "true";


            enemy.style.opacity =
                "0.2";


            enemy.style.transform =
                "translate(-50%, -50%) scale(.6)";

        }

    }


    // ==========================================
    // RELOAD
    // ==========================================

    function reload() {

        if (
            magazine >= 30
        ) {

            return;

        }


        if (
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


        magazine += amount;

        reserveAmmo -= amount;


        magAmmo.textContent =
            magazine;


        reserveAmmoText.textContent =
            String(
                reserveAmmo
            ).padStart(
                3,
                "0"
            );

    }


    // ==========================================
    // BATTERY DRAIN
    // ==========================================

    setInterval(
        function () {

            if (
                !gameRunning
            ) {
                return;
            }


            // Server zone

            if (
                playerX > 70 &&
                playerY > 65
            ) {

                battery -= 2;

            }


            battery =
                Math.max(
                    0,
                    battery
                );


            batteryText.textContent =
                battery + "%";

        },
        1000
    );


    // ==========================================
    // SELF DESTRUCT
    // ==========================================

    setInterval(
        function () {

            if (
                !gameRunning
            ) {
                return;
            }


            if (
                !coreOverloaded
            ) {

                return;

            }


            selfDestructTimer--;


            timerText.textContent =
                Math.max(
                    0,
                    selfDestructTimer
                );


            if (
                selfDestructTimer <= 0
            ) {

                gameOver();

            }


            // ESCAPE POD ACTIVATES
            // after 10 seconds of chaos

            if (
                selfDestructTimer <= 35 &&
                !escapeReady
            ) {

                activateEscapePod();

            }

        },
        1000
    );


    // ==========================================
    // ESCAPE POD
    // ==========================================

    function activateEscapePod() {

        escapeReady =
            true;


        escapePod.style.display =
            "block";


        escapePod.querySelector(
            "span"
        ).textContent =
            "PRESS E TO LAUNCH";


        objectiveText.textContent =
            "RUN TO ESCAPE POD";

    }


    // ==========================================
// LEVEL 4 FAILED
// ==========================================

function gameOver() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    objectiveText.textContent =
        "MISSION FAILED";

    document.body.classList.remove(
        "alertMode"
    );

    // FINAL SCREEN SHOW

    if (finalScreen) {

        finalScreen.style.display =
            "flex";

        finalScreen.classList.add(
            "failed"
        );

    }

    const finalTitle =
        document.getElementById("finalTitle");

    const finalMessage =
        document.getElementById("finalMessage");

    const restartLevelBtn =
        document.getElementById("restartLevelBtn");

    const nextLevelBtn =
        document.getElementById("nextLevelBtn");

    const returnHQBtn =
        document.getElementById("returnHQBtn");


    if (finalTitle) {

        finalTitle.textContent =
            "SECTOR 04 FAILED";

    }


    if (finalMessage) {

        finalMessage.textContent =
            "CONNECTION LOST // AGENT TERMINATED";

    }


    if (restartLevelBtn) {

        restartLevelBtn.textContent =
            "RESTART LEVEL 04";

        restartLevelBtn.style.display =
            "block";

    }


    if (returnHQBtn) {

        returnHQBtn.style.display =
            "block";

    }


    if (nextLevelBtn) {

        nextLevelBtn.style.display =
            "none";

    }


    console.log(
        "LEVEL 4 FAILED"
    );

}
    


   // ==========================================
// LEVEL 4 COMPLETE
// ==========================================

function finishMission() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    escapeReady = false;

    document.body.classList.remove(
        "alertMode"
    );


    objectiveText.textContent =
        "SECTOR 04 COMPLETE";


    if (finalScreen) {

        finalScreen.style.display =
            "flex";

        finalScreen.classList.remove(
            "failed"
        );

    }


    const finalTitle =
        document.getElementById("finalTitle");

    const finalMessage =
        document.getElementById("finalMessage");

    const restartLevelBtn =
        document.getElementById("restartLevelBtn");

    const nextLevelBtn =
        document.getElementById("nextLevelBtn");

    const returnHQBtn =
        document.getElementById("returnHQBtn");


    if (finalTitle) {

        finalTitle.textContent =
            "LEVEL 4 // SECTOR 04 COMPLETE";

    }


    if (finalMessage) {

        finalMessage.textContent =
            "OPERATION COMPLETE // EXTRACTION SUCCESSFUL";

    }


    if (restartLevelBtn) {

        restartLevelBtn.style.display =
            "none";

    }


    if (returnHQBtn) {

        returnHQBtn.style.display =
            "none";

    }


    if (nextLevelBtn) {

        nextLevelBtn.textContent =
            "LEVEL 5 →";

        nextLevelBtn.style.display =
            "block";

    }

    const progress =
    JSON.parse(
        localStorage.getItem("playerProgress")
    ) || {
        currentLevel: 1,
        completedLevels: []
    };

if (!Array.isArray(progress.completedLevels)) {
    progress.completedLevels = [];
}

if (!progress.completedLevels.includes(4)) {
    progress.completedLevels.push(4);
}

if (progress.currentLevel < 5) {
    progress.currentLevel = 5;
}

localStorage.setItem(
    "playerProgress",
    JSON.stringify(progress)
);


    localStorage.setItem(
        "currentLevel",
        "4"
    );

    localStorage.setItem(
        "currentLocation",
        "SECTOR_04 // COMPLETE"
    );


    console.log(
        "LEVEL 4 COMPLETE"
    );

}

   


    // ==========================================
    // MAIN GAME LOOP
    // ==========================================

    function gameLoop() {

        if (gameRunning) {

            updateMovement();

            updateEnemies();

            updateHacking();

        }


        requestAnimationFrame(
            gameLoop
        );

    }


    // ==========================================
    // INITIALIZE
    // ==========================================

    player.style.left =
        playerX + "%";


    player.style.top =
        playerY + "%";


    magAmmo.textContent =
        magazine;


    reserveAmmoText.textContent =
        String(
            reserveAmmo
        ).padStart(
            3,
            "0"
        );


    gameLoop();

    // ==========================================
// FINAL SCREEN BUTTONS
// ==========================================

const restartLevelBtn =
    document.getElementById("restartLevelBtn");

const returnHQBtn =
    document.getElementById("returnHQBtn");

const nextLevelBtn =
    document.getElementById("nextLevelBtn");


if (restartLevelBtn) {

    restartLevelBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "level4.html";

        }
    );

}


if (returnHQBtn) {

    returnHQBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


if (nextLevelBtn) {

    nextLevelBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "level5.html";

        }
    );

}

});