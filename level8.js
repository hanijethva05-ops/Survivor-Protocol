/* ==========================================
   LEVEL 8 - QUARANTINE LAB
========================================== */

"use strict";


/* ==========================================
   DOM
========================================== */

const gameWorld =
    document.getElementById("gameWorld");

const player =
    document.getElementById("player");

const node1 =
    document.getElementById("node1");

const node2 =
    document.getElementById("node2");

const node3 =
    document.getElementById("node3");

const nodes = [
    node1,
    node2,
    node3
];

const quarantineDoor =
    document.getElementById("quarantineDoor");

const objectiveText =
    document.getElementById("objectiveText");

const securityStatus =
    document.getElementById("securityStatus");

const nodesActivatedText =
    document.getElementById("nodesActivated");

const zombiesKilledText =
    document.getElementById("zombiesKilled");

const interactionPrompt =
    document.getElementById("interactionPrompt");

const magAmmo =
    document.getElementById("magAmmo");

const reserveAmmo =
    document.getElementById("reserve");

const hpText =
    document.getElementById("hpText");

const healthFill =
    document.getElementById("healthFill");

const damageEffect =
    document.getElementById("damageEffect");

const missionComplete =
    document.getElementById("missionComplete");

const gameOver =
    document.getElementById("gameOver");

const continueBtn =
    document.getElementById("continueBtn");

const restartBtn =
    document.getElementById("restartBtn");


/* ==========================================
   SETTINGS
========================================== */

const MAX_HP = 100;

const MAG_SIZE = 30;

const PLAYER_SPEED = 3.8;

const SPRINT_SPEED = 6.2;

const ZOMBIE_SPEED = 1.4;

const ZOMBIE_DAMAGE = 6;

const ZOMBIE_ATTACK_RANGE = 40;

const BULLET_DAMAGE = 100;

const SHOOT_COOLDOWN = 180;

const RELOAD_TIME = 1300;

const NODE_RANGE = 100;

const DOOR_RANGE = 110;


/* ==========================================
   STATE
========================================== */

let hp = MAX_HP;

let mag = MAG_SIZE;

let reserve = 180;

let zombiesKilled = 0;

let nodesActivated = 0;

let currentNode = null;

let playerX = window.innerWidth / 2;

let playerY = window.innerHeight / 2;

let mouseX = window.innerWidth / 2;

let mouseY = window.innerHeight / 2;

let keys = {};

let enemies = [];

let lastShot = 0;

let reloadInProgress = false;

let sprinting = false;

let gameEnded = false;

let doorUnlocked = false;


/* ==========================================
   NODE POSITIONS
========================================== */

function positionNodes() {

    node1.style.left = "25%";
    node1.style.top = "35%";

    node2.style.left = "50%";
    node2.style.top = "65%";

    node3.style.left = "75%";
    node3.style.top = "35%";
}


/* ==========================================
   INITIALIZE
========================================== */

function initGame() {

    hp = MAX_HP;

    mag = MAG_SIZE;

    reserve = 180;

    zombiesKilled = 0;

    nodesActivated = 0;

    playerX = window.innerWidth / 2;

    playerY = window.innerHeight / 2;

    mouseX = window.innerWidth / 2;

    mouseY = window.innerHeight / 2;

    enemies = [];

    gameEnded = false;

    doorUnlocked = false;

    currentNode = null;

    reloadInProgress = false;

    sprinting = false;

    nodes.forEach(function(node) {

        if (!node) {
            return;
        }

        node.classList.remove("active");
        node.classList.remove("completed");

    });

    if (quarantineDoor) {
        quarantineDoor.classList.remove("unlocked");
    }

    if (missionComplete) {
        missionComplete.classList.add("hidden");
        missionComplete.classList.remove("active");
    }

    if (gameOver) {
        gameOver.classList.add("hidden");
        gameOver.classList.remove("active");
    }

    positionNodes();

    updatePlayer();

    updateAmmo();

    updateVitals();

    updateHUD();

    spawnInitialZombies();

    requestAnimationFrame(gameLoop);

    console.log(
        "LEVEL 8 // QUARANTINE LAB INITIALIZED"
    );
}


/* ==========================================
   HUD
========================================== */

function updateHUD() {

    if (nodesActivatedText) {

        nodesActivatedText.textContent =
            `${nodesActivated} / 3`;
    }

    if (zombiesKilledText) {

        zombiesKilledText.textContent =
            zombiesKilled;
    }

    if (securityStatus) {

        securityStatus.textContent =
            doorUnlocked
                ? "UNLOCKED"
                : "LOCKED";

        securityStatus.style.color =
            doorUnlocked
                ? "#00ff66"
                : "#ff003c";
    }

    if (objectiveText) {

        if (doorUnlocked) {

            objectiveText.textContent =
                "QUARANTINE DOOR UNLOCKED — REACH THE EXIT";

        } else {

            objectiveText.textContent =
                `ACTIVATE SECURITY NODES (${nodesActivated}/3)`;
        }
    }
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

    if (keys["w"] || keys["arrowup"]) {
        dy--;
    }

    if (keys["s"] || keys["arrowdown"]) {
        dy++;
    }

    if (keys["a"] || keys["arrowleft"]) {
        dx--;
    }

    if (keys["d"] || keys["arrowright"]) {
        dx++;
    }

    if (dx !== 0 || dy !== 0) {

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

        playerX += dx * speed;
        playerY += dy * speed;
    }


    const margin = 45;

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
            130,
            Math.min(
                window.innerHeight - 80,
                playerY
            )
        );

    updatePlayer();

    updateInteraction();
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

        if (
            key === "w" ||
            key === "a" ||
            key === "s" ||
            key === "d" ||
            key === "arrowup" ||
            key === "arrowdown" ||
            key === "arrowleft" ||
            key === "arrowright" ||
            key === " "
        ) {
            event.preventDefault();
        }

        if (key === "shift") {
            sprinting = true;
        }

        if (key === "e") {

            if (doorUnlocked) {
                tryDoor();
            } else {
                tryNode();
            }
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
   DISTANCE
========================================== */

function distanceToElement(element) {

    if (!element) {
        return Infinity;
    }

    const rect =
        element.getBoundingClientRect();

    const x =
        rect.left +
        rect.width / 2;

    const y =
        rect.top +
        rect.height / 2;

    return Math.sqrt(
        Math.pow(playerX - x, 2) +
        Math.pow(playerY - y, 2)
    );
}


/* ==========================================
   NODE INTERACTION
========================================== */

function getNearestNode() {

    let nearest = null;

    let nearestDistance = Infinity;

    nodes.forEach(function(node) {

        if (!node) {
            return;
        }

        if (
            node.classList.contains(
                "completed"
            )
        ) {
            return;
        }

        const distance =
            distanceToElement(node);

        if (distance < nearestDistance) {

            nearestDistance = distance;

            nearest = node;
        }

    });

    return {
        node: nearest,
        distance: nearestDistance
    };
}


function updateInteraction() {

    if (gameEnded) {
        return;
    }

    if (doorUnlocked) {

        const distance =
            distanceToElement(
                quarantineDoor
            );

        if (
            distance <= DOOR_RANGE
        ) {

            interactionPrompt.textContent =
                "[ E ] OPEN QUARANTINE DOOR";

            interactionPrompt.classList.add(
                "active"
            );

        } else {

            interactionPrompt.textContent =
                "REACH THE QUARANTINE DOOR";

            interactionPrompt.classList.remove(
                "active"
            );
        }

        return;
    }


    const result =
        getNearestNode();

    if (
        result.node &&
        result.distance <= NODE_RANGE
    ) {

        currentNode =
            result.node;

        result.node.classList.add(
            "active"
        );

        interactionPrompt.textContent =
            `[ E ] ACTIVATE NODE ${
                result.node.dataset.node
            }`;

        interactionPrompt.classList.add(
            "active"
        );

    } else {

        nodes.forEach(function(node) {

            if (
                node &&
                !node.classList.contains(
                    "completed"
                )
            ) {
                node.classList.remove(
                    "active"
                );
            }

        });

        currentNode = null;

        interactionPrompt.textContent =
            "SEARCH SECURITY NODES";

        interactionPrompt.classList.remove(
            "active"
        );
    }
}


/* ==========================================
   NODE ACTIVATION
========================================== */

function tryNode() {

    if (gameEnded) {
        return;
    }

    if (doorUnlocked) {
        return;
    }

    const result =
        getNearestNode();

    if (!result.node) {
        return;
    }

    if (
        result.distance >
        NODE_RANGE
    ) {

        interactionPrompt.textContent =
            "MOVE CLOSER TO SECURITY NODE";

        interactionPrompt.classList.add(
            "active"
        );

        return;
    }

    activateNode(
        result.node
    );
}


function activateNode(node) {

    if (!node) {
        return;
    }

    if (
        node.classList.contains(
            "completed"
        )
    ) {
        return;
    }

    node.classList.remove("active");

    node.classList.add("completed");

    nodesActivated++;

    updateHUD();

    spawnNodeZombies();

    if (nodesActivated >= 3) {

        unlockDoor();

    } else {

        interactionPrompt.textContent =
            `NODE ${node.dataset.node} ACTIVATED`;

        interactionPrompt.classList.add(
            "active"
        );

        setTimeout(function() {

            if (!gameEnded) {
                interactionPrompt.classList.remove(
                    "active"
                );
            }

        }, 1000);
    }
}


/* ==========================================
   DOOR
========================================== */

function unlockDoor() {

    doorUnlocked = true;

    if (quarantineDoor) {
        quarantineDoor.classList.add(
            "unlocked"
        );
    }

    updateHUD();

    interactionPrompt.textContent =
        "QUARANTINE DOOR UNLOCKED";

    interactionPrompt.classList.add(
        "active"
    );

    setTimeout(function() {

        if (!gameEnded) {

            interactionPrompt.textContent =
                "REACH THE QUARANTINE DOOR";

        }

    }, 1500);
}


function tryDoor() {

    if (gameEnded) {
        return;
    }

    if (!doorUnlocked) {
        return;
    }

    const distance =
        distanceToElement(
            quarantineDoor
        );

    if (
        distance >
        DOOR_RANGE
    ) {

        interactionPrompt.textContent =
            "MOVE CLOSER TO QUARANTINE DOOR";

        interactionPrompt.classList.add(
            "active"
        );

        return;
    }

    completeLevel();
}


/* ==========================================
   ZOMBIES
========================================== */

function spawnInitialZombies() {

    createZombie(
        120,
        180
    );

    createZombie(
        220,
        window.innerHeight - 160
    );

    createZombie(
        window.innerWidth / 2,
        150
    );

    createZombie(
        window.innerWidth - 200,
        window.innerHeight - 160
    );
}


function spawnNodeZombies() {

    // Har node par sirf 2 zombies
    const count = 2;

    for (let i = 0; i < count; i++) {

        const angle =
            Math.random() * Math.PI * 2;

        const distance =
            300 + Math.random() * 100;

        createZombie(
            playerX +
            Math.cos(angle) * distance,

            playerY +
            Math.sin(angle) * distance
        );
    }
}


function createZombie(x, y) {

    if (!gameWorld) {
        return;
    }

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

        x: Math.max(
            30,
            Math.min(
                window.innerWidth - 30,
                x
            )
        ),

        y: Math.max(
            120,
            Math.min(
                window.innerHeight - 50,
                y
            )
        ),

        hp: 100,

        speed:
            ZOMBIE_SPEED +
            Math.random() * .5,

        attackCooldown: 0,

        dead: false
    };

    enemies.push(zombie);

    updateZombie(zombie);
}


/* ==========================================
   ZOMBIE UPDATE
========================================== */

function updateZombies() {

    if (gameEnded) {
        return;
    }

    enemies.forEach(function(zombie) {

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

            if (distance > 0) {

                zombie.x +=
                    (dx / distance) *
                    zombie.speed;

                zombie.y +=
                    (dy / distance) *
                    zombie.speed;
            }

        } else {

            attackPlayer(zombie);
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
                100,
                Math.min(
                    window.innerHeight - 35,
                    zombie.y
                )
            );

        updateZombie(zombie);

    });
}


function updateZombie(zombie) {

    if (!zombie.element) {
        return;
    }

    zombie.element.style.left =
        `${zombie.x}px`;

    zombie.element.style.top =
        `${zombie.y}px`;
}


/* ==========================================
   ZOMBIE ATTACK
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
        now + 650;

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

    updateVitals();

    if (damageEffect) {

        damageEffect.classList.add(
            "active"
        );

        setTimeout(function() {

            damageEffect.classList.remove(
                "active"
            );

        }, 150);
    }

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

    const now = performance.now();

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
    let bestDistance = Infinity;

    enemies.forEach(function(zombie) {

        if (zombie.dead) {
            return;
        }

        const dx =
            zombie.x - mouseX;

        const dy =
            zombie.y - mouseY;

        const distanceToMouse =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        const dxPlayer =
            zombie.x - playerX;

        const dyPlayer =
            zombie.y - playerY;

        const distanceToPlayer =
            Math.sqrt(
                dxPlayer * dxPlayer +
                dyPlayer * dyPlayer
            );

        // Zombie mouse ke 130px ke andar ho
        if (
            distanceToMouse <= 130 &&
            distanceToPlayer <= 900
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
    });

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

    if (zombie.element) {

        zombie.element.classList.add(
            "enemyHit"
        );

        setTimeout(function() {

            if (zombie.element) {

                zombie.element.classList.remove(
                    "enemyHit"
                );
            }

        }, 100);
    }

    if (zombie.hp <= 0) {

        killZombie(zombie);
    }
}


/* ==========================================
   KILL
========================================== */

function killZombie(zombie) {

    if (zombie.dead) {
        return;
    }

    zombie.dead = true;

    zombiesKilled++;

    updateHUD();

    if (zombie.element) {

        zombie.element.style.opacity =
            "0";

        zombie.element.style.transform =
            "translate(-50%, -50%) scale(.3)";
    }

    setTimeout(function() {

        if (zombie.element) {
            zombie.element.remove();
        }

    }, 200);
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

    interactionPrompt.textContent =
        "RELOADING...";

    interactionPrompt.classList.add(
        "active"
    );

    setTimeout(function() {

        if (gameEnded) {
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

        reloadInProgress = false;

        updateAmmo();

        interactionPrompt.classList.remove(
            "active"
        );

    }, RELOAD_TIME);
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

    if (!interactionPrompt) {
        return;
    }

    interactionPrompt.textContent =
        "LOW AMMUNITION — PRESS R TO RELOAD";

    interactionPrompt.classList.add(
        "active"
    );

    setTimeout(function() {

        if (!gameEnded) {

            interactionPrompt.classList.remove(
                "active"
            );
        }

    }, 1200);
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
    // LEVEL 8 COMPLETE
    // ==========================================

    localStorage.setItem(
        "level8Completed",
        "true"
    );

    localStorage.setItem(
        "level9Unlocked",
        "true"
    );


    // ==========================================
    // MAIN PLAYER PROGRESS UPDATE
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


        // Make sure array exists
        if (!Array.isArray(progress.completedLevels)) {
            progress.completedLevels = [];
        }


        // Mark Level 8 completed
        if (!progress.completedLevels.includes(8)) {

            progress.completedLevels.push(8);

        }


        // Unlock Level 9
        if (
            Number(progress.currentLevel || 1) < 9
        ) {

            progress.currentLevel = 9;

        }


        // Save progress
        localStorage.setItem(
            "playerProgress",
            JSON.stringify(progress)
        );


        console.log(
            "LEVEL 8 COMPLETED"
        );

        console.log(
            "LEVEL 9 UNLOCKED"
        );

        console.log(
            "CURRENT LEVEL:",
            progress.currentLevel
        );


    } catch (error) {

        console.error(
            "LEVEL 8 PROGRESS SAVE ERROR:",
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
            "LEVEL 8 COMPLETE — LEVEL 9 UNLOCKED";

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

        gameOver.classList.remove(
            "hidden"
        );

        gameOver.classList.add(
            "active"
        );
    }

    console.log(
        "LEVEL 8 FAILED"
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
                "level9.html";

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
            Math.max(
                45,
                Math.min(
                    window.innerWidth - 45,
                    playerX
                )
            );

        playerY =
            Math.max(
                130,
                Math.min(
                    window.innerHeight - 80,
                    playerY
                )
            );

        updatePlayer();

    }
);


/* ==========================================
   START GAME
========================================== */

initGame();