"use strict";

/* =========================================
   LEVEL 7
   MAINTENANCE VENTILATION
   PROPER MAP-BASED VERSION
========================================= */

const gameWorld = document.getElementById("gameWorld");
const player = document.getElementById("player");

const objectiveText = document.getElementById("objectiveText");
const signalStatus = document.getElementById("signalStatus");

const magAmmo = document.getElementById("magAmmo");
const reserveAmmo = document.getElementById("reserveAmmo");

const vitalStatus = document.getElementById("vitalStatus");
const bpm = document.getElementById("bpm");

const damageEffect = document.getElementById("damageEffect");

const elevatorHatch = document.getElementById("elevatorHatch");
const interactionPrompt =
    document.getElementById("interactionPrompt");

const zombieAlert =
    document.getElementById("zombieAlert");

const zombiesKilledText =
    document.getElementById("zombiesKilled");

const fanStatus =
    document.getElementById("fanStatus");

const routeStatus =
    document.getElementById("routeStatus");

const missionComplete =
    document.getElementById("missionComplete");

const gameOver =
    document.getElementById("gameOver");

const continueBtn =
    document.getElementById("continueBtn");

const restartBtn =
    document.getElementById("restartBtn");

const lowAmmoWarning =
    document.getElementById("lowAmmoWarning");


/* =========================================
   SETTINGS
========================================= */

const MAX_HP = 100;

const MAG_SIZE = 30;

const PLAYER_SPEED = 4.5;

const SPRINT_SPEED = 7.5;

const ZOMBIE_SPEED = 1.5;

const ZOMBIE_DAMAGE = 8;

const ZOMBIE_RANGE = 48;

const BULLET_DAMAGE = 50;

const SHOOT_COOLDOWN = 140;

const RELOAD_TIME = 1200;


/*
   Actual map boundaries.

   Player must physically travel
   to the elevator.
*/

const MAP_LEFT = 70;

const MAP_RIGHT =
    window.innerWidth - 70;

const MAP_TOP =
    window.innerHeight * 0.20;

const MAP_BOTTOM =
    window.innerHeight * 0.80;


/* =========================================
   STATE
========================================= */

let hp = MAX_HP;

let mag = MAG_SIZE;

let reserve = 180;

let playerX = 120;

let playerY =
    window.innerHeight / 2;

let keys = {};

let enemies = [];

let zombiesKilled = 0;

let exitUnlocked = false;

let gameEnded = false;

let sprinting = false;

let reloading = false;

let lastShot = 0;

let spawnTimer = 0;

let lastTime =
    performance.now();


/* =========================================
   HELPERS
========================================= */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


function distanceBetween(
    x1,
    y1,
    x2,
    y2
) {

    const dx = x2 - x1;

    const dy = y2 - y1;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


/* =========================================
   INITIALIZE
========================================= */

function initGame() {

    hp = MAX_HP;

    mag = MAG_SIZE;

    reserve = 180;

    zombiesKilled = 0;

    playerX = 120;

    playerY =
        window.innerHeight / 2;

    exitUnlocked = false;

    gameEnded = false;

    sprinting = false;

    reloading = false;

    lastShot = 0;

    spawnTimer = 0;

    keys = {};

    enemies.forEach(
        zombie => {

            if (zombie.element) {

                zombie.element.remove();

            }

        }
    );

    enemies = [];


    if (missionComplete) {

        missionComplete.classList.add(
            "hidden"
        );

        missionComplete.classList.remove(
            "active"
        );

    }


    if (gameOver) {

        gameOver.classList.add(
            "hidden"
        );

        gameOver.classList.remove(
            "active"
        );

    }


    if (objectiveText) {

        objectiveText.textContent =
            "REACH THE ELEVATOR HATCH";

    }


    if (signalStatus) {

        signalStatus.textContent =
            "UNSTABLE";

    }


    if (routeStatus) {

        routeStatus.textContent =
            "ACTIVE";

    }


    if (fanStatus) {

        fanStatus.textContent =
            "3 ACTIVE";

    }


    if (interactionPrompt) {

        interactionPrompt.textContent =
            "REACH THE ELEVATOR HATCH";

        interactionPrompt.classList.remove(
            "active"
        );

    }


    if (elevatorHatch) {

        elevatorHatch.classList.remove(
            "open"
        );

    }


    updatePlayer();

    updateAmmo();

    updateVitals();

    updateZombieCounter();

    spawnInitialZombies();

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================
   PLAYER
========================================= */

function updatePlayer() {

    if (!player) return;

    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";

}


/* =========================================
   MOVEMENT
========================================= */

function updateMovement(delta) {

    if (gameEnded) return;

    let dx = 0;

    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy--;

    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy++;

    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx--;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx++;

    }


    if (
        dx === 0 &&
        dy === 0
    ) {

        checkHatch();

        return;

    }


    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    dx /= length;

    dy /= length;


    const speed =
        sprinting
            ? SPRINT_SPEED
            : PLAYER_SPEED;


    playerX +=
        dx *
        speed *
        delta;


    playerY +=
        dy *
        speed *
        delta;


    /*
       Keep player inside
       ventilation area.
    */

    const currentMapRight =
        window.innerWidth - 70;


    playerX =
        clamp(
            playerX,
            MAP_LEFT,
            currentMapRight
        );


    playerY =
        clamp(
            playerY,
            MAP_TOP,
            MAP_BOTTOM
        );


    updatePlayer();

    checkHatch();

}


/* =========================================
   ELEVATOR
========================================= */

function getElevatorPosition() {

    if (!elevatorHatch) {

        return {

            x:
                window.innerWidth - 120,

            y:
                window.innerHeight / 2

        };

    }


    const rect =
        elevatorHatch.getBoundingClientRect();


    return {

        x:
            rect.left +
            rect.width / 2,

        y:
            rect.top +
            rect.height / 2

    };

}


/* =========================================
   HATCH CHECK
========================================= */

function checkHatch() {

    if (
        gameEnded ||
        !elevatorHatch
    ) {

        return;

    }


    const elevator =
        getElevatorPosition();


    const distance =
        distanceBetween(
            playerX,
            playerY,
            elevator.x,
            elevator.y
        );


    /*
       Elevator is always
       visible.

       But E only works when
       player is close enough.
    */

    if (distance <= 170) {

        if (exitUnlocked) {

            if (interactionPrompt) {

                interactionPrompt.textContent =
                    "[ E ] ENTER ELEVATOR";

                interactionPrompt.classList.add(
                    "active"
                );

            }

        } else {

            if (interactionPrompt) {

                interactionPrompt.textContent =
                    "ELEVATOR LOCKED";

                interactionPrompt.classList.add(
                    "active"
                );

            }

        }

    } else {

        if (interactionPrompt) {

            interactionPrompt.classList.remove(
                "active"
            );

        }

    }

}


/* =========================================
   OBJECTIVE
========================================= */

function updateObjective() {

    const elevator =
        getElevatorPosition();


    const distance =
        distanceBetween(
            playerX,
            playerY,
            elevator.x,
            elevator.y
        );


    /*
       Unlock elevator when
       physically close to it.
    */

    if (
        distance <= 190 &&
        !exitUnlocked
    ) {

        exitUnlocked = true;


        if (elevatorHatch) {

            elevatorHatch.classList.add(
                "open"
            );

        }


        if (objectiveText) {

            objectiveText.textContent =
                "ELEVATOR HATCH READY — PRESS E";

        }


        if (routeStatus) {

            routeStatus.textContent =
                "ELEVATOR READY";

        }


        if (signalStatus) {

            signalStatus.textContent =
                "LOCK RELEASED";

        }

    }


    checkHatch();

}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        keys[key] = true;


        if (
            [
                "w",
                "a",
                "s",
                "d",
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                "shift",
                " "
            ].includes(key)
        ) {

            event.preventDefault();

        }


        if (key === "shift") {

            sprinting = true;

        }


        if (key === "r") {

            reload();

        }


        if (key === "e") {

            enterElevator();

        }

    },
    {
        passive: false
    }
);


document.addEventListener(
    "keyup",
    function(event) {

        const key =
            event.key.toLowerCase();


        keys[key] = false;


        if (key === "shift") {

            sprinting = false;

        }

    }
);


/* =========================================
   SHOOTING
========================================= */

document.addEventListener(
    "mousedown",
    function(event) {

        if (event.button === 0) {

            shoot();

        }

    }
);


function shoot() {

    if (
        gameEnded ||
        reloading
    ) {

        return;

    }


    const now =
        performance.now();


    if (
        now - lastShot <
        SHOOT_COOLDOWN
    ) {

        return;

    }


    lastShot = now;


    if (mag <= 0) {

        showLowAmmo();

        return;

    }


    mag--;

    updateAmmo();


    let target = null;

    let closest = Infinity;


    enemies.forEach(
        zombie => {

            if (zombie.dead) return;


            const distance =
                distanceBetween(
                    playerX,
                    playerY,
                    zombie.x,
                    zombie.y
                );


            if (
                distance <= 650 &&
                distance < closest
            ) {

                closest = distance;

                target = zombie;

            }

        }
    );


    if (target) {

        damageZombie(
            target,
            BULLET_DAMAGE
        );

    }

}


/* =========================================
   ZOMBIES
========================================= */

function createZombie(
    x,
    y
) {

    if (!gameWorld) return;


    const element =
        document.createElement("div");


    element.className =
        "enemy chaser";


    element.textContent =
        "☠";


    gameWorld.appendChild(
        element
    );


    const zombie = {

        element,

        x,

        y,

        hp: 100,

        speed:
            ZOMBIE_SPEED +
            Math.random() * 0.5,

        attackCooldown: 0,

        dead: false

    };


    enemies.push(zombie);

    updateZombie(zombie);

}


/* =========================================
   INITIAL ZOMBIES
========================================= */

function spawnInitialZombies() {

    const positions = [

        {
            x: 430,
            y:
                window.innerHeight * 0.30
        },

        {
            x: 700,
            y:
                window.innerHeight * 0.70
        },

        {
            x: 950,
            y:
                window.innerHeight * 0.40
        }

    ];


    positions.forEach(
        position => {

            createZombie(
                position.x,
                position.y
            );

        }
    );

}


/* =========================================
   SPAWN ZOMBIE
========================================= */

function spawnZombie() {

    const side =
        Math.random();


    let x;

    let y;


    if (side < 0.5) {

        /*
           Spawn from left.
        */

        x =
            Math.max(
                MAP_LEFT,
                playerX - 500
            );

    } else {

        /*
           Spawn from right.
        */

        x =
            Math.min(
                window.innerWidth - 70,
                playerX + 500
            );

    }


    y =
        clamp(
            playerY +
            (Math.random() - 0.5) * 300,
            MAP_TOP,
            MAP_BOTTOM
        );


    createZombie(
        x,
        y
    );


    if (zombieAlert) {

        zombieAlert.classList.add(
            "active"
        );


        setTimeout(
            () => {

                zombieAlert.classList.remove(
                    "active"
                );

            },
            900
        );

    }

}


/* =========================================
   ZOMBIE UPDATE
========================================= */

function updateZombies(delta) {

    if (gameEnded) return;


    enemies.forEach(
        zombie => {

            if (zombie.dead) return;


            const dx =
                playerX -
                zombie.x;


            const dy =
                playerY -
                zombie.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance >
                ZOMBIE_RANGE
            ) {

                zombie.x +=
                    (
                        dx /
                        distance
                    ) *
                    zombie.speed *
                    delta;


                zombie.y +=
                    (
                        dy /
                        distance
                    ) *
                    zombie.speed *
                    delta;

            } else {

                attackZombiePlayer(
                    zombie
                );

            }


            zombie.x =
                clamp(
                    zombie.x,
                    MAP_LEFT,
                    window.innerWidth - 70
                );


            zombie.y =
                clamp(
                    zombie.y,
                    MAP_TOP,
                    MAP_BOTTOM
                );


            updateZombie(
                zombie
            );

        }
    );

}


/* =========================================
   UPDATE ZOMBIE
========================================= */

function updateZombie(
    zombie
) {

    if (!zombie.element) return;


    zombie.element.style.left =
        zombie.x + "px";


    zombie.element.style.top =
        zombie.y + "px";


    zombie.element.style.transform =
        "translate(-50%, -50%)";

}


/* =========================================
   ZOMBIE ATTACK
========================================= */

function attackZombiePlayer(
    zombie
) {

    const now =
        performance.now();


    if (
        now <
        zombie.attackCooldown
    ) {

        return;

    }


    zombie.attackCooldown =
        now + 700;


    takeDamage(
        ZOMBIE_DAMAGE
    );

}


/* =========================================
   PLAYER DAMAGE
========================================= */

function takeDamage(
    amount
) {

    if (gameEnded) return;


    hp -= amount;


    hp =
        Math.max(
            0,
            hp
        );


    if (damageEffect) {

        damageEffect.classList.add(
            "active"
        );


        setTimeout(
            () => {

                damageEffect.classList.remove(
                    "active"
                );

            },
            150
        );

    }


    updateVitals();


    if (hp <= 0) {

        levelFailed();

    }

}


/* =========================================
   VITALS
========================================= */

function updateVitals() {

    if (bpm) {

        bpm.textContent =
            hp <= 25
                ? "128"
                : hp <= 50
                    ? "104"
                    : "72";

    }


    if (vitalStatus) {

        vitalStatus.textContent =
            hp <= 25
                ? "CRITICAL"
                : hp <= 50
                    ? "INJURED"
                    : "STABLE";

    }

}


/* =========================================
   DAMAGE ZOMBIE
========================================= */

function damageZombie(
    zombie,
    damage
) {

    if (zombie.dead) return;


    zombie.hp -= damage;


    if (zombie.element) {

        zombie.element.classList.add(
            "enemyHit"
        );


        setTimeout(
            () => {

                if (zombie.element) {

                    zombie.element.classList.remove(
                        "enemyHit"
                    );

                }

            },
            100
        );

    }


    if (zombie.hp <= 0) {

        zombie.dead = true;

        zombiesKilled++;


        updateZombieCounter();


        if (zombie.element) {

            zombie.element.remove();

        }

    }

}


/* =========================================
   ZOMBIE COUNTER
========================================= */

function updateZombieCounter() {

    if (zombiesKilledText) {

        zombiesKilledText.textContent =
            zombiesKilled;

    }

}


/* =========================================
   SPAWNING
========================================= */

function updateSpawning(
    delta
) {

    if (gameEnded) return;


    spawnTimer +=
        delta / 60;


    let delay = 5;


    if (zombiesKilled >= 3) {

        delay = 4;

    }


    if (zombiesKilled >= 7) {

        delay = 3;

    }


    if (spawnTimer >= delay) {

        spawnTimer = 0;

        spawnZombie();

    }

}


/* =========================================
   RELOAD
========================================= */

function reload() {

    if (
        gameEnded ||
        reloading ||
        mag >= MAG_SIZE ||
        reserve <= 0
    ) {

        return;

    }


    reloading = true;


    if (signalStatus) {

        signalStatus.textContent =
            "RELOADING";

    }


    setTimeout(
        function() {

            if (gameEnded) {

                reloading = false;

                return;

            }


            const needed =
                MAG_SIZE - mag;


            const amount =
                Math.min(
                    needed,
                    reserve
                );


            mag += amount;

            reserve -= amount;

            reloading = false;


            updateAmmo();


            if (signalStatus) {

                signalStatus.textContent =
                    "UNSTABLE";

            }

        },
        RELOAD_TIME
    );

}


/* =========================================
   AMMO
========================================= */

function updateAmmo() {

    if (magAmmo) {

        magAmmo.textContent =
            mag;

    }


    if (reserveAmmo) {

        reserveAmmo.textContent =
            reserve;

    }


    if (mag <= 5) {

        showLowAmmo();

    }

}


/* =========================================
   LOW AMMO
========================================= */

function showLowAmmo() {

    if (!lowAmmoWarning) return;


    lowAmmoWarning.classList.add(
        "warningActive"
    );


    setTimeout(
        function() {

            lowAmmoWarning.classList.remove(
                "warningActive"
            );

        },
        1000
    );

}


/* =========================================
   ENTER ELEVATOR
========================================= */

function enterElevator() {

    if (gameEnded) return;

    if (!player || !elevatorHatch) {
        console.log("PLAYER OR ELEVATOR NOT FOUND");
        return;
    }

    const playerRect =
        player.getBoundingClientRect();

    const elevatorRect =
        elevatorHatch.getBoundingClientRect();

    const playerXCenter =
        playerRect.left + playerRect.width / 2;

    const playerYCenter =
        playerRect.top + playerRect.height / 2;

    const elevatorXCenter =
        elevatorRect.left + elevatorRect.width / 2;

    const elevatorYCenter =
        elevatorRect.top + elevatorRect.height / 2;

    const dx =
        elevatorXCenter - playerXCenter;

    const dy =
        elevatorYCenter - playerYCenter;

    const distance =
        Math.sqrt(
            dx * dx + dy * dy
        );

    console.log(
        "ELEVATOR DISTANCE:",
        Math.round(distance)
    );

    if (distance > 250) {

        if (interactionPrompt) {

            interactionPrompt.textContent =
                "MOVE CLOSER TO ELEVATOR";

            interactionPrompt.classList.add(
                "active"
            );

        }

        return;
    }

    completeLevel();
}

/* =========================================
   LEVEL COMPLETE
========================================= */

function completeLevel() {

    if (gameEnded) return;

    gameEnded = true;

    console.log("LEVEL 7 COMPLETE");

    // =========================================
    // UNLOCK LEVEL 8
    // =========================================

    try {

        const saved =
            localStorage.getItem(
                "playerProgress"
            );

        const progress =
            saved
                ? JSON.parse(saved)
                : {
                    currentLevel: 1,
                    completedLevels: [],
                    xp: 0,
                    selectedLevel: 7,
                    selectedMap: "hospital",
                    selectedWeapon: "pistol",
                    unlockedWeapons: ["pistol"],
                    unlockedMaps: ["hospital"]
                };

        if (!Array.isArray(progress.completedLevels)) {
            progress.completedLevels = [];
        }

        if (!progress.completedLevels.includes(7)) {
            progress.completedLevels.push(7);
        }

        // LEVEL 8 UNLOCK
        if (
            Number(progress.currentLevel || 1) < 8
        ) {
            progress.currentLevel = 8;
        }

        // XP reward
        progress.xp =
            Number(progress.xp || 0) + 700;

        localStorage.setItem(
            "playerProgress",
            JSON.stringify(progress)
        );

        console.log(
            "LEVEL 8 UNLOCKED"
        );

    } catch (error) {

        console.error(
            "LEVEL 7 PROGRESS SAVE ERROR:",
            error
        );

    }

    // =========================================
    // UI
    // =========================================

    if (routeStatus) {

        routeStatus.textContent =
            "CLEARED";

    }

    if (objectiveText) {

        objectiveText.textContent =
            "LEVEL 7 COMPLETE";

    }

    if (signalStatus) {

        signalStatus.textContent =
            "LOCK RELEASED";

    }

    if (interactionPrompt) {

        interactionPrompt.textContent =
            "MISSION COMPLETE";

        interactionPrompt.classList.add(
            "active"
        );

    }

    if (elevatorHatch) {

        elevatorHatch.classList.add(
            "open"
        );

    }

    if (missionComplete) {

        missionComplete.classList.remove(
            "hidden"
        );

        missionComplete.classList.add(
            "active"
        );

    }
}


/* =========================================
   LEVEL FAILED
========================================= */

function levelFailed() {

    if (gameEnded) return;


    gameEnded = true;


    if (objectiveText) {

        objectiveText.textContent =
            "MISSION FAILED";

    }


    if (gameOver) {

        gameOver.classList.remove(
            "hidden"
        );

        gameOver.classList.add(
            "active"
        );

    }

}


/* =========================================
   BUTTONS
========================================= */

if (continueBtn) {

    continueBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "level8.html";

        }
    );

}


if (restartBtn) {

    restartBtn.addEventListener(
        "click",
        function() {

            window.location.reload();

        }
    );

}


/* =========================================
   GAME LOOP
========================================= */

function gameLoop(now) {

    const delta =
        Math.min(
            (now - lastTime) /
            16.6667,
            2
        );


    lastTime = now;


    if (!gameEnded) {

        updateMovement(delta);

        updateZombies(delta);

        updateSpawning(delta);

        updateObjective();

    }


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    function() {

        playerY =
            clamp(
                playerY,
                window.innerHeight * 0.20,
                window.innerHeight * 0.80
            );


        playerX =
            clamp(
                playerX,
                MAP_LEFT,
                window.innerWidth - 70
            );


        updatePlayer();

    }
);


/* =========================================
   START LEVEL 7
========================================= */

initGame();