/* ==========================================
   LEVEL 9 - THE CORE REACTOR
========================================== */

"use strict";


/* ==========================================
   DOM
========================================== */

const gameWorld =
    document.getElementById("gameWorld");

const player =
    document.getElementById("player");

const objectiveText =
    document.getElementById("objectiveText");

const stabilizerCount =
    document.getElementById("stabilizerCount");

const instabilityFill =
    document.getElementById("instabilityFill");

const instabilityText =
    document.getElementById("instabilityText");

const reactorStatus =
    document.getElementById("reactorStatus");

const interactionPrompt =
    document.getElementById("interactionPrompt");

const reactorAlert =
    document.getElementById("reactorAlert");

const damageEffect =
    document.getElementById("damageEffect");

const magAmmo =
    document.getElementById("magAmmo");

const reserveAmmo =
    document.getElementById("reserve");

const hpText =
    document.getElementById("hpText");

const healthFill =
    document.getElementById("healthFill");

const exitDoor =
    document.getElementById("exitDoor");

const exitPrompt =
    document.getElementById("exitPrompt");

const missionComplete =
    document.getElementById("missionComplete");

const gameOver =
    document.getElementById("gameOver");

const continueBtn =
    document.getElementById("continueBtn");

const restartBtn =
    document.getElementById("restartBtn");


const stabilizers = [
    document.getElementById("stabilizer1"),
    document.getElementById("stabilizer2"),
    document.getElementById("stabilizer3")
];


/* ==========================================
   SETTINGS
========================================== */

const MAX_HP = 100;

const MAG_SIZE = 30;

const PLAYER_SPEED = 3.7;

const SPRINT_SPEED = 6.2;

const STABILIZER_RANGE = 110;

const STABILIZER_TIME = 3000;

const ZOMBIE_SPEED = 1.25;

const ZOMBIE_DAMAGE = 8;

const ZOMBIE_ATTACK_RANGE = 42;

const BULLET_DAMAGE = 50;

const SHOOT_COOLDOWN = 130;

const RELOAD_TIME = 1300;

const EXIT_RANGE = 120;


/* ==========================================
   STATE
========================================== */

let hp = MAX_HP;

let mag = MAG_SIZE;

let reserve = 180;

let zombiesKilled = 0;

let stabilizersActivated = 0;

let currentStabilizer = null;

let stabilizing = false;

let stabilizerStart = 0;

let stabilizerAnimation = null;

let instability = 100;

let exitUnlocked = false;

let gameEnded = false;

let reloadInProgress = false;

let sprinting = false;

let lastShot = 0;

let mouseX =
    window.innerWidth / 2;

let mouseY =
    window.innerHeight / 2;

let keys = {};

let enemies = [];


/* ==========================================
   PLAYER POSITION
========================================== */

let playerX =
    window.innerWidth / 2;

let playerY =
    window.innerHeight * .75;


/* ==========================================
   INITIALIZE
========================================== */

function initGame() {

    hp = MAX_HP;

    mag = MAG_SIZE;

    reserve = 180;

    zombiesKilled = 0;

    stabilizersActivated = 0;

    currentStabilizer = null;

    stabilizing = false;

    instability = 100;

    exitUnlocked = false;

    gameEnded = false;

    reloadInProgress = false;

    enemies = [];

    playerX =
        window.innerWidth / 2;

    playerY =
        window.innerHeight * .75;


    stabilizers.forEach(
        function(stabilizer) {

            if (!stabilizer) {
                return;
            }

            stabilizer.classList.remove(
                "active",
                "completed"
            );

            const status =
                stabilizer.querySelector(
                    ".stabilizerStatus"
                );

            if (status) {
                status.textContent =
                    "OFFLINE";
            }
        }
    );


    if (missionComplete) {
        missionComplete.classList.remove(
            "active"
        );
    }

    if (gameOver) {
        gameOver.classList.remove(
            "active"
        );
    }

    if (exitDoor) {
        exitDoor.classList.remove(
            "unlocked"
        );
    }


    updatePlayer();

    updateAmmo();

    updateVitals();

    updateObjective();

    updateInstability();

    requestAnimationFrame(
        gameLoop
    );

    console.log(
        "LEVEL 9 // CORE REACTOR INITIALIZED"
    );
}


/* ==========================================
   PLAYER
========================================== */

function updatePlayer() {

    if (!player) {
        return;
    }

    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;
}


/* ==========================================
   MOVEMENT
========================================== */

function updateMovement() {

    if (gameEnded) {
        return;
    }

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


    if (dx === 0 && dy === 0) {
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
        dx * speed;

    playerY +=
        dy * speed;


    const margin = 40;

    playerX =
        Math.max(
            margin,
            Math.min(
                window.innerWidth - margin,
                playerX
            )
        );

    playerY =
        Math.max(
            90,
            Math.min(
                window.innerHeight - margin,
                playerY
            )
        );


    updatePlayer();

    checkNearestStabilizer();
    checkExit();
}


/* ==========================================
   KEYBOARD
========================================== */

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();

        keys[key] = true;


        if (key === "shift") {
            sprinting = true;
        }


        if (key === "e") {
            interact();
        }


        if (key === "r") {
            reload();
        }

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


/* ==========================================
   MOUSE
========================================== */

document.addEventListener(
    "mousemove",
    function(event) {

        mouseX =
            event.clientX;

        mouseY =
            event.clientY;

    }
);


document.addEventListener(
    "mousedown",
    function(event) {

        if (event.button === 0) {
            shoot();
        }

    }
);


/* ==========================================
   STABILIZER DISTANCE
========================================== */

function getStabilizerDistance(
    stabilizer
) {

    const rect =
        stabilizer.getBoundingClientRect();

    const x =
        rect.left +
        rect.width / 2;

    const y =
        rect.top +
        rect.height / 2;


    return Math.sqrt(
        Math.pow(
            playerX - x,
            2
        ) +
        Math.pow(
            playerY - y,
            2
        )
    );
}


/* ==========================================
   FIND NEAREST
========================================== */

function getNearestStabilizer() {

    let nearest = null;

    let nearestDistance =
        Infinity;


    stabilizers.forEach(
        function(stabilizer) {

            if (!stabilizer) {
                return;
            }

            if (
                stabilizer.classList.contains(
                    "completed"
                )
            ) {
                return;
            }


            const distance =
                getStabilizerDistance(
                    stabilizer
                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearest =
                    stabilizer;
            }

        }
    );


    return {
        stabilizer: nearest,
        distance: nearestDistance
    };
}


/* ==========================================
   STABILIZER PROMPT
========================================== */

function checkNearestStabilizer() {

    if (
        gameEnded ||
        stabilizing
    ) {
        return;
    }


    const result =
        getNearestStabilizer();


    stabilizers.forEach(
        function(stabilizer) {

            if (stabilizer) {
                stabilizer.classList.remove(
                    "active"
                );
            }

        }
    );


    if (
        result.stabilizer &&
        result.distance <=
        STABILIZER_RANGE
    ) {

        currentStabilizer =
            result.stabilizer;

        currentStabilizer.classList.add(
            "active"
        );


        interactionPrompt.textContent =
            "[ E ] ACTIVATE STABILIZER";

        interactionPrompt.classList.add(
            "active"
        );

    } else {

        currentStabilizer =
            null;

        interactionPrompt.textContent =
            "ACTIVATE ALL REACTOR STABILIZERS";

        interactionPrompt.classList.remove(
            "active"
        );

    }
}


/* ==========================================
   INTERACT
========================================== */

function interact() {

    if (gameEnded) {
        return;
    }


    if (stabilizing) {
        return;
    }


    if (exitUnlocked) {

        tryExit();

        return;
    }


    const result =
        getNearestStabilizer();


    if (
        result.stabilizer &&
        result.distance <=
        STABILIZER_RANGE
    ) {

        startStabilizer(
            result.stabilizer
        );

    } else {

        interactionPrompt.textContent =
            "MOVE CLOSER TO A STABILIZER";

        interactionPrompt.classList.add(
            "active"
        );

    }
}


/* ==========================================
   START STABILIZER
========================================== */

function startStabilizer(
    stabilizer
) {

    if (
        stabilizing ||
        stabilizer.classList.contains(
            "completed"
        )
    ) {
        return;
    }


    stabilizing = true;

    currentStabilizer =
        stabilizer;

    stabilizerStart =
        performance.now();


    interactionPrompt.textContent =
        "STABILIZING REACTOR CORE...";

    interactionPrompt.classList.add(
        "active"
    );


    stabilizer.classList.add(
        "active"
    );


    const status =
        stabilizer.querySelector(
            ".stabilizerStatus"
        );

    if (status) {
        status.textContent =
            "STABILIZING...";
    }


    stabilizerAnimation =
        requestAnimationFrame(
            updateStabilizer
        );

}


/* ==========================================
   UPDATE STABILIZER
========================================== */

function updateStabilizer(now) {

    if (
        !stabilizing ||
        !currentStabilizer
    ) {
        return;
    }


    const distance =
        getStabilizerDistance(
            currentStabilizer
        );


    if (
        distance >
        STABILIZER_RANGE + 30
    ) {

        cancelStabilizer();

        return;
    }


    const elapsed =
        now -
        stabilizerStart;


    const percent =
        Math.min(
            100,
            Math.floor(
                elapsed /
                STABILIZER_TIME *
                100
            )
        );


    interactionPrompt.textContent =
        `STABILIZING CORE... ${percent}%`;


    if (
        percent >= 100
    ) {

        finishStabilizer();

        return;
    }


    stabilizerAnimation =
        requestAnimationFrame(
            updateStabilizer
        );

}


/* ==========================================
   CANCEL STABILIZER
========================================== */

function cancelStabilizer() {

    stabilizing = false;

    cancelAnimationFrame(
        stabilizerAnimation
    );


    if (currentStabilizer) {

        const status =
            currentStabilizer.querySelector(
                ".stabilizerStatus"
            );

        if (status) {
            status.textContent =
                "OFFLINE";
        }

        currentStabilizer.classList.remove(
            "active"
        );
    }


    interactionPrompt.textContent =
        "STABILIZATION INTERRUPTED";

    setTimeout(
        function() {

            if (!gameEnded) {
                interactionPrompt.classList.remove(
                    "active"
                );
            }

        },
        1000
    );

}


/* ==========================================
   FINISH STABILIZER
========================================== */

function finishStabilizer() {

    stabilizing = false;

    cancelAnimationFrame(
        stabilizerAnimation
    );


    if (!currentStabilizer) {
        return;
    }


    currentStabilizer.classList.remove(
        "active"
    );

    currentStabilizer.classList.add(
        "completed"
    );


    const status =
        currentStabilizer.querySelector(
            ".stabilizerStatus"
        );

    if (status) {
        status.textContent =
            "ONLINE";
    }


    stabilizersActivated++;


    /*
       Each stabilizer reduces instability.
    */

    instability =
        Math.max(
            0,
            instability - 30
        );


    updateInstability();

    updateObjective();


    /*
       Zombies appear after activation.
    */

    spawnStabilizerWave();


    if (
        stabilizersActivated >= 3
    ) {

        unlockExit();

    } else {

        interactionPrompt.textContent =
            "STABILIZER ONLINE — FIND NEXT NODE";

        interactionPrompt.classList.add(
            "active"
        );


        setTimeout(
            function() {

                if (!gameEnded) {

                    interactionPrompt.classList.remove(
                        "active"
                    );

                }

            },
            1500
        );

    }


    currentStabilizer = null;

}


/* ==========================================
   OBJECTIVE
========================================== */

function updateObjective() {

    if (!objectiveText) {
        return;
    }


    if (
        stabilizersActivated < 3
    ) {

        objectiveText.textContent =
            `ACTIVATE REACTOR STABILIZERS`;

    } else {

        objectiveText.textContent =
            "REACTOR STABILIZED — REACH CORE ACCESS";

    }


    if (stabilizerCount) {

        stabilizerCount.textContent =
            `${stabilizersActivated} / 3`;

    }

}


/* ==========================================
   INSTABILITY
========================================== */

function updateInstability() {

    if (instabilityFill) {

        instabilityFill.style.width =
            `${instability}%`;

    }


    if (instabilityText) {

        instabilityText.textContent =
            `${instability}%`;

    }


    if (instability <= 40) {

        if (reactorStatus) {

            reactorStatus.textContent =
                "REACTOR STABILIZING";

            reactorStatus.style.color =
                "#00ff66";

        }

    } else {

        if (reactorStatus) {

            reactorStatus.textContent =
                "REACTOR UNSTABLE";

            reactorStatus.style.color =
                "#ff3333";

        }

    }

}


/* ==========================================
   SPAWN WAVE
========================================== */

function spawnStabilizerWave() {

    showReactorAlert();


    const count =
    stabilizersActivated === 1
        ? 2
        : stabilizersActivated === 2
            ? 3
            : 4;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            300 +
            Math.random() * 250;


        createZombie(
            playerX +
            Math.cos(angle) *
            distance,

            playerY +
            Math.sin(angle) *
            distance
        );

    }

}


/* ==========================================
   ALERT
========================================== */

function showReactorAlert() {

    if (!reactorAlert) {
        return;
    }


    reactorAlert.classList.remove(
        "active"
    );


    void reactorAlert.offsetWidth;


    reactorAlert.classList.add(
        "active"
    );


    setTimeout(
        function() {

            reactorAlert.classList.remove(
                "active"
            );

        },
        900
    );

}


/* ==========================================
   CREATE ZOMBIE
========================================== */

function createZombie(
    x,
    y
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "enemy";


    element.textContent =
        "☠";


    gameWorld.appendChild(
        element
    );


    const zombie = {

        element: element,

        x:
            Math.max(
                30,
                Math.min(
                    window.innerWidth - 30,
                    x
                )
            ),

        y:
            Math.max(
                90,
                Math.min(
                    window.innerHeight - 30,
                    y
                )
            ),

        hp: 50,

        speed:
    ZOMBIE_SPEED +
    Math.random() * .20,

        attackCooldown: 0,

        dead: false

    };


    enemies.push(
        zombie
    );


    updateZombie(
        zombie
    );

}


/* ==========================================
   ZOMBIE UPDATE
========================================== */

function updateZombies() {

    if (gameEnded) {
        return;
    }


    enemies.forEach(
        function(zombie) {

            if (zombie.dead) {
                return;
            }


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
                ZOMBIE_ATTACK_RANGE
            ) {

                zombie.x +=
                    dx /
                    distance *
                    zombie.speed;

                zombie.y +=
                    dy /
                    distance *
                    zombie.speed;

            } else {

                attackPlayer(
                    zombie
                );

            }


            zombie.x =
                Math.max(
                    25,
                    Math.min(
                        window.innerWidth - 25,
                        zombie.x
                    )
                );

            zombie.y =
                Math.max(
                    85,
                    Math.min(
                        window.innerHeight - 25,
                        zombie.y
                    )
                );


            updateZombie(
                zombie
            );

        }
    );

}


/* ==========================================
   ZOMBIE ELEMENT
========================================== */

function updateZombie(zombie) {

    if (!zombie.element) {
        return;
    }


    zombie.element.style.left =
        `${zombie.x}px`;

    zombie.element.style.top =
        `${zombie.y}px`;

    zombie.element.style.transform =
        "translate(-50%, -50%)";

}


/* ==========================================
   ATTACK
========================================== */

function attackPlayer(zombie) {

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


/* ==========================================
   DAMAGE
========================================== */

function takeDamage(amount) {

    if (gameEnded) {
        return;
    }


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
            function() {

                damageEffect.classList.remove(
                    "active"
                );

            },
            150
        );

    }


    updateVitals();


    if (hp <= 0) {
        endGame();
    }

}


/* ==========================================
   VITALS
========================================== */

function updateVitals() {

    if (hpText) {

        hpText.textContent =
            `HP ${hp}`;

    }


    if (healthFill) {

        healthFill.style.width =
            `${hp}%`;


        if (hp <= 25) {

            healthFill.style.background =
                "#ff003c";

        } else if (hp <= 50) {

            healthFill.style.background =
                "#ffcc00";

        } else {

            healthFill.style.background =
                "#00ff66";

        }

    }

}


/* ==========================================
   SHOOT
========================================== */

function shoot() {

    if (gameEnded) {
        return;
    }


    if (reloadInProgress) {
        return;
    }


    const now =
        performance.now();


    if (
        now -
        lastShot <
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

    let bestDistance =
        Infinity;


    enemies.forEach(
        function(zombie) {

            if (zombie.dead) {
                return;
            }


            const distanceToMouse =
                Math.sqrt(
                    Math.pow(
                        zombie.x -
                        mouseX,
                        2
                    ) +
                    Math.pow(
                        zombie.y -
                        mouseY,
                        2
                    )
                );


            const distanceToPlayer =
                Math.sqrt(
                    Math.pow(
                        zombie.x -
                        playerX,
                        2
                    ) +
                    Math.pow(
                        zombie.y -
                        playerY,
                        2
                    )
                );


            if (
                distanceToMouse < 75 &&
                distanceToPlayer < 900
            ) {

                if (
                    distanceToMouse <
                    bestDistance
                ) {

                    bestDistance =
                        distanceToMouse;

                    target =
                        zombie;

                }

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


/* ==========================================
   DAMAGE ZOMBIE
========================================== */

function damageZombie(
    zombie,
    damage
) {

    if (zombie.dead) {
        return;
    }


    zombie.hp -= damage;


    zombie.element.classList.add(
        "enemyHit"
    );


    setTimeout(
        function() {

            if (zombie.element) {

                zombie.element.classList.remove(
                    "enemyHit"
                );

            }

        },
        100
    );


    if (zombie.hp <= 0) {

        killZombie(
            zombie
        );

    }

}


/* ==========================================
   KILL ZOMBIE
========================================== */

function killZombie(zombie) {

    if (zombie.dead) {
        return;
    }


    zombie.dead = true;

    zombiesKilled++;


    zombie.element.style.opacity =
        "0";

    zombie.element.style.transform =
        "translate(-50%, -50%) scale(.3)";


    setTimeout(
        function() {

            if (zombie.element) {
                zombie.element.remove();
            }

        },
        180
    );

}


/* ==========================================
   RELOAD
========================================== */

function reload() {

    if (gameEnded) {
        return;
    }


    if (reloadInProgress) {
        return;
    }


    if (mag >= MAG_SIZE) {
        return;
    }


    if (reserve <= 0) {
        return;
    }


    reloadInProgress = true;


    if (interactionPrompt) {

        interactionPrompt.textContent =
            "RELOADING...";

        interactionPrompt.classList.add(
            "active"
        );

    }


    setTimeout(
        function() {

            if (gameEnded) {
                return;
            }


            const needed =
                MAG_SIZE -
                mag;


            const amount =
                Math.min(
                    needed,
                    reserve
                );


            mag += amount;

            reserve -= amount;

            reloadInProgress = false;


            updateAmmo();


            if (
                !stabilizing
            ) {

                interactionPrompt.classList.remove(
                    "active"
                );

            }

        },
        RELOAD_TIME
    );

}


/* ==========================================
   AMMO
========================================== */

function updateAmmo() {

    if (magAmmo) {

        magAmmo.textContent =
            mag;

    }


    if (reserveAmmo) {

        reserveAmmo.textContent =
            reserve;

    }

}


/* ==========================================
   LOW AMMO
========================================== */

function showLowAmmo() {

    let warning =
        document.getElementById(
            "lowAmmoWarning"
        );


    if (!warning) {

        warning =
            document.createElement(
                "div"
            );


        warning.id =
            "lowAmmoWarning";


        warning.textContent =
            "LOW AMMUNITION";


        warning.style.position =
            "fixed";

        warning.style.left =
            "50%";

        warning.style.top =
            "68%";

        warning.style.transform =
            "translateX(-50%)";

        warning.style.color =
            "#ff003c";

        warning.style.fontSize =
            "13px";

        warning.style.letterSpacing =
            "3px";

        warning.style.zIndex =
            "1000";


        document.body.appendChild(
            warning
        );

    }


    warning.classList.add(
        "active"
    );


    setTimeout(
        function() {

            warning.classList.remove(
                "active"
            );

        },
        1000
    );

}


/* ==========================================
   UNLOCK EXIT
========================================== */

function unlockExit() {

    exitUnlocked = true;


    if (exitDoor) {
        exitDoor.classList.add(
            "unlocked"
        );
    }


    if (objectiveText) {

        objectiveText.textContent =
            "ALL STABILIZERS ONLINE — REACH CORE ACCESS";

    }


    if (interactionPrompt) {

        interactionPrompt.textContent =
            "CORE ACCESS UNLOCKED";

        interactionPrompt.classList.add(
            "active"
        );

    }


    setTimeout(
        function() {

            if (!gameEnded) {

                interactionPrompt.classList.remove(
                    "active"
                );

            }

        },
        1800
    );

}


/* ==========================================
   EXIT
========================================== */

function checkExit() {

    if (
        !exitUnlocked ||
        gameEnded ||
        !exitDoor
    ) {
        return;
    }


    const rect =
        exitDoor.getBoundingClientRect();


    const x =
        rect.left +
        rect.width / 2;

    const y =
        rect.top +
        rect.height / 2;


    const distance =
        Math.sqrt(
            Math.pow(
                playerX - x,
                2
            ) +
            Math.pow(
                playerY - y,
                2
            )
        );


    if (
        distance <= EXIT_RANGE
    ) {

        exitPrompt.textContent =
            "[ E ] EXIT CORE";

        exitPrompt.classList.add(
            "active"
        );

    } else {

        exitPrompt.classList.remove(
            "active"
        );

    }

}


/* ==========================================
   TRY EXIT
========================================== */

function tryExit() {

    if (
        !exitUnlocked ||
        gameEnded
    ) {
        return;
    }


    const rect =
        exitDoor.getBoundingClientRect();


    const x =
        rect.left +
        rect.width / 2;

    const y =
        rect.top +
        rect.height / 2;


    const distance =
        Math.sqrt(
            Math.pow(
                playerX - x,
                2
            ) +
            Math.pow(
                playerY - y,
                2
            )
        );


    if (
        distance <= EXIT_RANGE
    ) {

        completeLevel();

    } else {

        exitPrompt.textContent =
            "MOVE CLOSER TO CORE ACCESS";

        exitPrompt.classList.add(
            "active"
        );

    }

}


/* ==========================================
   COMPLETE
========================================== */

function completeLevel() {

    if (gameEnded) {
        return;
    }

    gameEnded = true;

    // ==========================================
    // LEVEL 9 COMPLETE
    // ==========================================

    localStorage.setItem(
        "level9Completed",
        "true"
    );

    localStorage.setItem(
        "level10Unlocked",
        "true"
    );


    // ==========================================
    // UPDATE PLAYER PROGRESS
    // ==========================================

    try {

        const saved =
            localStorage.getItem("playerProgress");

        let progress = saved
            ? JSON.parse(saved)
            : {
                currentLevel: 1,
                completedLevels: [],
                xp: 0,
                selectedLevel: 1,
                selectedMap: "hospital",
                selectedWeapon: "pistol",
                unlockedWeapons: ["pistol"],
                unlockedMaps: ["hospital"]
            };


        if (!Array.isArray(progress.completedLevels)) {
            progress.completedLevels = [];
        }


        // Mark Level 9 completed
        if (!progress.completedLevels.includes(9)) {
            progress.completedLevels.push(9);
        }


        // Unlock Level 10
        if (
            Number(progress.currentLevel || 1) < 10
        ) {
            progress.currentLevel = 10;
        }


        // Save
        localStorage.setItem(
            "playerProgress",
            JSON.stringify(progress)
        );


        console.log(
            "LEVEL 9 COMPLETED"
        );

        console.log(
            "LEVEL 10 UNLOCKED"
        );

        console.log(
            "CURRENT LEVEL:",
            progress.currentLevel
        );


    } catch (error) {

        console.error(
            "LEVEL 9 PROGRESS SAVE ERROR:",
            error
        );

    }


    // ==========================================
    // UI
    // ==========================================

    if (interactionPrompt) {
        interactionPrompt.classList.remove(
            "active"
        );
    }

    if (objectiveText) {
        objectiveText.textContent =
            "LEVEL 9 COMPLETE — LEVEL 10 UNLOCKED";
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


/* ==========================================
   GAME OVER
========================================== */

function endGame() {

    if (gameEnded) {
        return;
    }


    gameEnded = true;


    if (gameOver) {

        gameOver.classList.add(
            "active"
        );

    }


    if (reactorStatus) {

        reactorStatus.textContent =
            "CORE FAILURE";

        reactorStatus.style.color =
            "#ff003c";

    }


    console.log(
        "LEVEL 9 FAILED"
    );

}


/* ==========================================
   BUTTONS
========================================== */

if (continueBtn) {

    continueBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "level10.html";

        }
    );

}


if (restartBtn) {

    restartBtn.addEventListener(
        "click",
        function() {

            location.reload();

        }
    );

}


/* ==========================================
   GAME LOOP
========================================== */

function gameLoop() {

    if (!gameEnded) {

        updateMovement();

        updateZombies();

        checkNearestStabilizer();

        checkExit();

    }


    requestAnimationFrame(
        gameLoop
    );

}


/* ==========================================
   RESIZE
========================================== */

window.addEventListener(
    "resize",
    function() {

        playerX =
            Math.min(
                playerX,
                window.innerWidth - 40
            );


        playerY =
            Math.min(
                playerY,
                window.innerHeight - 40
            );


        updatePlayer();

    }
);


/* ==========================================
   START
========================================== */

initGame();