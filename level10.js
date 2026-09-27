/* ==========================================
   LEVEL 10 - THE FINAL CORE
   FINAL BOSS
========================================== */

"use strict";


/* ==========================================
   DOM
========================================== */

const gameWorld =
    document.getElementById("gameWorld");

const player =
    document.getElementById("player");

const boss =
    document.getElementById("boss");

const objectiveText =
    document.getElementById("objectiveText");

const bossStatus =
    document.getElementById("bossStatus");

const bossHealthFill =
    document.getElementById("bossHealthFill");

const bossHealthText =
    document.getElementById("bossHealthText");

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

const phaseAlert =
    document.getElementById("phaseAlert");

const warningText =
    document.getElementById("warningText");

const shutdownPanel =
    document.getElementById("shutdownPanel");

const shutdownFill =
    document.getElementById("shutdownFill");

const shutdownPercent =
    document.getElementById("shutdownPercent");

const victoryScreen =
    document.getElementById("victoryScreen");

const gameOver =
    document.getElementById("gameOver");

const restartBtn =
    document.getElementById("restartBtn");

const retryBtn =
    document.getElementById("retryBtn");


/* ==========================================
   SETTINGS
========================================== */

const MAX_HP = 100;

const MAG_SIZE = 30;

const PLAYER_SPEED = 4.3;

const SPRINT_SPEED = 7;

const BOSS_MAX_HP = 1200;

const MINION_MAX_HP = 100;
const MINION_DAMAGE = 6;
const MINION_SPEED = 1.3;


const BULLET_DAMAGE = 50;

const SHOOT_COOLDOWN = 120;

const RELOAD_TIME = 1300;

const BOSS_ATTACK_RANGE = 520;


/* ==========================================
   STATE
========================================== */

let hp = MAX_HP;

let mag = MAG_SIZE;

let reserve = 240;

let bossHP = BOSS_MAX_HP;

let bossPhase = 1;

let playerX = 150;

let playerY =
    window.innerHeight / 2;

let mouseX =
    window.innerWidth / 2;

let mouseY =
    window.innerHeight / 2;

let keys = {};

let sprinting = false;

let reloadInProgress = false;

let lastShot = 0;

let gameEnded = false;

let shutdownStarted = false;

let bossAttackTimer = 0;

let projectiles = [];

let bossMinions = [];

let lastTime = performance.now();


/* ==========================================
   INIT
========================================== */

function initGame() {

    hp = MAX_HP;

    mag = MAG_SIZE;

    reserve = 240;

    bossHP = BOSS_MAX_HP;

    bossPhase = 1;

    playerX = 150;

    playerY =
        window.innerHeight / 2;

    gameEnded = false;

    shutdownStarted = false;

    reloadInProgress = false;

    projectiles = [];

    bossMinions = [];

    if (victoryScreen) {
        victoryScreen.classList.remove("active");
    }

    if (gameOver) {
        gameOver.classList.remove("active");
    }

    if (shutdownPanel) {
        shutdownPanel.classList.remove("active");
    }

    updatePlayer();

    updateAmmo();

    updateVitals();

    updateBossHUD();

    objectiveText.textContent =
        "DESTROY THE CORE GUARDIAN";

    bossStatus.textContent =
        "BOSS: ACTIVE";

    requestAnimationFrame(gameLoop);

    console.log(
        "LEVEL 10 // FINAL CORE INITIALIZED"
    );
}


/* ==========================================
   PLAYER
========================================== */

function updatePlayer() {

    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;
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

    if (
        dx === 0 &&
        dy === 0
    ) {
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

    playerX =
        Math.max(
            40,
            Math.min(
                window.innerWidth - 40,
                playerX
            )
        );

    playerY =
        Math.max(
            100,
            Math.min(
                window.innerHeight - 40,
                playerY
            )
        );

    updatePlayer();
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

    if (shutdownStarted) {
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

        reload();

        return;
    }

    mag--;

    updateAmmo();


    let target = null;
    let bestDistance = Infinity;


    // ==========================================
    // CHECK BOSS
    // ==========================================

    if (
        boss &&
        bossHP > 0
    ) {

        const bossRect =
            boss.getBoundingClientRect();

        const bx =
            bossRect.left +
            bossRect.width / 2;

        const by =
            bossRect.top +
            bossRect.height / 2;

        const distanceToMouse =
            Math.sqrt(
                Math.pow(
                    bx - mouseX,
                    2
                ) +
                Math.pow(
                    by - mouseY,
                    2
                )
            );

        const distanceToPlayer =
            Math.sqrt(
                Math.pow(
                    bx - playerX,
                    2
                ) +
                Math.pow(
                    by - playerY,
                    2
                )
            );


        if (
            distanceToMouse < 130 &&
            distanceToPlayer < 900
        ) {

            target = {
                type: "boss",
                distance: distanceToMouse
            };

            bestDistance =
                distanceToMouse;

        }

    }


    // ==========================================
    // CHECK MINIONS
    // ==========================================

    bossMinions.forEach(
        function(minion) {

            if (
                minion.dead ||
                minion.hp <= 0
            ) {
                return;
            }


            const distanceToMouse =
                Math.sqrt(
                    Math.pow(
                        minion.x - mouseX,
                        2
                    ) +
                    Math.pow(
                        minion.y - mouseY,
                        2
                    )
                );


            const distanceToPlayer =
                Math.sqrt(
                    Math.pow(
                        minion.x - playerX,
                        2
                    ) +
                    Math.pow(
                        minion.y - playerY,
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

                    target = {
                        type: "minion",
                        minion: minion
                    };

                }

            }

        }
    );


    // ==========================================
    // APPLY DAMAGE
    // ==========================================

    if (!target) {
        return;
    }


    if (
        target.type ===
        "boss"
    ) {

        damageBoss(
            BULLET_DAMAGE
        );


        const bossRect =
            boss.getBoundingClientRect();

        createHitEffect(
            bossRect.left +
            bossRect.width / 2,

            bossRect.top +
            bossRect.height / 2
        );

    }


    if (
        target.type ===
        "minion"
    ) {

        damageMinion(
            target.minion,
            BULLET_DAMAGE
        );

    }

}


/* ==========================================
   BOSS DAMAGE
========================================== */

function damageBoss(damage) {

    if (bossHP <= 0) {
        return;
    }

    bossHP -= damage;

    bossHP =
        Math.max(
            0,
            bossHP
        );

    updateBossHUD();

    checkBossPhase();

    if (bossHP <= 0) {
        destroyBoss();
    }
}


/* ==========================================
   BOSS HUD
========================================== */

function updateBossHUD() {

    const percent =
        Math.floor(
            (bossHP /
            BOSS_MAX_HP) *
            100
        );

    if (bossHealthFill) {
        bossHealthFill.style.width =
            `${percent}%`;
    }

    if (bossHealthText) {
        bossHealthText.textContent =
            `${percent}%`;
    }
}


/* ==========================================
   PHASE SYSTEM
========================================== */

function checkBossPhase() {

    let newPhase = 1;

    if (bossHP <= 800) {
        newPhase = 2;
    }

    if (bossHP <= 400) {
        newPhase = 3;
    }

    if (
        newPhase !== bossPhase
    ) {

        bossPhase =
            newPhase;

        activateBossPhase();
    }
}


function activateBossPhase() {

    phaseAlert.textContent =
        `PHASE ${bossPhase}`;

    phaseAlert.classList.remove(
        "active"
    );

    void phaseAlert.offsetWidth;

    phaseAlert.classList.add(
        "active"
    );


    if (bossPhase === 2) {

        boss.classList.add(
            "enraged"
        );

        bossStatus.textContent =
            "BOSS: ENRAGED";

        objectiveText.textContent =
            "CORE GUARDIAN ENRAGED — KEEP ATTACKING";

        spawnMinions(1);

    }


    if (bossPhase === 3) {

        boss.classList.add(
            "enraged"
        );

        bossStatus.textContent =
            "BOSS: CRITICAL";

        objectiveText.textContent =
            "FINAL PHASE — DESTROY THE CORE GUARDIAN";

        spawnMinions(2);

        warningText.classList.add(
            "active"
        );
    }
}


/* ==========================================
   BOSS ATTACKS
========================================== */

function updateBoss(delta) {

    if (gameEnded) {
        return;
    }

    bossAttackTimer -= delta;

    if (
        bossAttackTimer <= 0
    ) {

        bossAttackTimer =
            bossPhase === 1
                ? 1800
                : bossPhase === 2
                    ? 1200
                    : 750;

        bossAttack();
    }
}


/* ==========================================
   BOSS ATTACK
========================================== */

function bossAttack() {

    if (gameEnded) {
        return;
    }

    const rect =
        boss.getBoundingClientRect();

    const bx =
        rect.left +
        rect.width / 2;

    const by =
        rect.top +
        rect.height / 2;

    /*
       Phase 1:
       single projectile
    */

    if (bossPhase === 1) {

        createProjectile(
            bx,
            by,
            playerX,
            playerY
        );

        return;
    }


    /*
       Phase 2:
       three projectiles
    */

    if (bossPhase === 2) {

        const angle =
            Math.atan2(
                playerY - by,
                playerX - bx
            );

        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            const spread =
                angle +
                i * .18;

            createProjectileAngle(
                bx,
                by,
                spread,
                5
            );
        }

        return;
    }


    /*
       Phase 3:
       five projectiles
    */

    if (bossPhase === 3) {

        const angle =
            Math.atan2(
                playerY - by,
                playerX - bx
            );

        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            const spread =
                angle +
                i * .22;

            createProjectileAngle(
                bx,
                by,
                spread,
                6.2
            );
        }
    }
}


/* ==========================================
   PROJECTILES
========================================== */

function createProjectile(
    x,
    y,
    targetX,
    targetY
) {

    const angle =
        Math.atan2(
            targetY - y,
            targetX - x
        );

    createProjectileAngle(
        x,
        y,
        angle,
        4.5
    );
}


function createProjectileAngle(
    x,
    y,
    angle,
    speed
) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "bossProjectile";

    gameWorld.appendChild(
        element
    );

    projectiles.push({

        element,

        x,
        y,

        vx:
            Math.cos(angle) *
            speed,

        vy:
            Math.sin(angle) *
            speed,

        life: 3000
    });
}


/* ==========================================
   UPDATE PROJECTILES
========================================== */

function updateProjectiles(delta) {

    projectiles.forEach(
        function(projectile) {

            projectile.x +=
                projectile.vx;

            projectile.y +=
                projectile.vy;

            projectile.life -=
                delta;

            projectile.element.style.left =
                `${projectile.x}px`;

            projectile.element.style.top =
                `${projectile.y}px`;

            const distance =
                Math.sqrt(
                    Math.pow(
                        projectile.x -
                        playerX,
                        2
                    ) +
                    Math.pow(
                        projectile.y -
                        playerY,
                        2
                    )
                );

            if (
                distance < 28
            ) {

                takeDamage(
                    bossPhase === 3
                        ? 15
                        : 10
                );

                projectile.life = 0;
            }

            if (
                projectile.life <= 0 ||
                projectile.x < -100 ||
                projectile.x >
                    window.innerWidth + 100 ||
                projectile.y < -100 ||
                projectile.y >
                    window.innerHeight + 100
            ) {

                projectile.element.remove();

                projectile.dead = true;
            }
        }
    );

    projectiles =
        projectiles.filter(
            projectile =>
                !projectile.dead
        );
}


/* ==========================================
   MINIONS
========================================== */

function spawnMinions(count) {

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const element =
            document.createElement(
                "div"
            );

        element.className =
            "bossMinion";

        element.textContent =
            "☠";

        gameWorld.appendChild(
            element
        );


        const minion = {

            element: element,

            x:
                window.innerWidth / 2 +
                (Math.random() - .5) *
                500,

            y:
                window.innerHeight / 2 +
                (Math.random() - .5) *
                350,

            hp:
                MINION_MAX_HP,

            maxHp:
                MINION_MAX_HP,

            speed:
                MINION_SPEED +
                Math.random() * .3,

            attackCooldown: 0,

            dead: false

        };


        bossMinions.push(
            minion
        );

    }

}


function damageMinion(
    minion,
    damage
) {

    if (
        !minion ||
        minion.dead
    ) {
        return;
    }


    minion.hp -= damage;


    // Hit effect
    minion.element.classList.add(
        "enemyHit"
    );


    setTimeout(
        function() {

            if (
                minion.element
            ) {

                minion.element.classList.remove(
                    "enemyHit"
                );

            }

        },
        100
    );


    if (
        minion.hp <= 0
    ) {

        killMinion(
            minion
        );

    }

}

function killMinion(
    minion
) {

    if (
        !minion ||
        minion.dead
    ) {
        return;
    }


    minion.dead = true;


    minion.element.style.opacity =
        "0";

    minion.element.style.transform =
        "translate(-50%, -50%) scale(.3)";


    setTimeout(
        function() {

            if (
                minion.element
            ) {

                minion.element.remove();

            }

        },
        180
    );

}


function updateMinions() {

    bossMinions.forEach(
        function(minion) {

            if (
                minion.dead ||
                minion.hp <= 0
            ) {
                return;
            }


            const dx =
                playerX -
                minion.x;

            const dy =
                playerY -
                minion.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance > 45
            ) {

                minion.x +=
                    dx /
                    distance *
                    minion.speed;

                minion.y +=
                    dy /
                    distance *
                    minion.speed;

            } else {

                const now =
                    performance.now();


                if (
                    now >
                    minion.attackCooldown
                ) {

                    minion.attackCooldown =
                        now + 900;


                    takeDamage(
                        MINION_DAMAGE
                    );

                }

            }


            minion.x =
                Math.max(
                    25,
                    Math.min(
                        window.innerWidth - 25,
                        minion.x
                    )
                );


            minion.y =
                Math.max(
                    85,
                    Math.min(
                        window.innerHeight - 25,
                        minion.y
                    )
                );


            minion.element.style.left =
                `${minion.x}px`;

            minion.element.style.top =
                `${minion.y}px`;

            minion.element.style.transform =
                "translate(-50%, -50%)";

        }
    );


    // Remove dead minions
    bossMinions =
        bossMinions.filter(
            function(minion) {

                return !minion.dead;

            }
        );

}


/* ==========================================
   PLAYER DAMAGE
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

    damageEffect.classList.add(
        "active"
    );

    setTimeout(
        function() {

            damageEffect.classList.remove(
                "active"
            );

        },
        130
    );

    updateVitals();

    if (hp <= 0) {
        endGame();
    }
}


/* ==========================================
   VITALS
========================================== */

function updateVitals() {

    hpText.textContent =
        `HP ${hp}`;

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


/* ==========================================
   AMMO
========================================== */

function updateAmmo() {

    magAmmo.textContent =
        mag;

    reserveAmmo.textContent =
        reserve;
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

    setTimeout(
        function() {

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

            reloadInProgress =
                false;

            updateAmmo();

        },
        RELOAD_TIME
    );
}


/* ==========================================
   BOSS DESTROYED
========================================== */

function destroyBoss() {

    if (shutdownStarted) {
        return;
    }

    shutdownStarted = true;

    bossStatus.textContent =
        "BOSS: DESTROYED";

    bossStatus.style.color =
        "#00ff66";

    objectiveText.textContent =
        "CORE GUARDIAN DESTROYED — SHUTTING DOWN REACTOR";

    warningText.classList.remove(
        "active"
    );

    boss.style.animation =
        "none";

    boss.style.opacity =
        "0";

    boss.style.transform =
        "translate(-50%, -50%) scale(.1)";

    bossHealthFill.style.width =
        "0%";

    /*
       Remove minions.
    */

    bossMinions.forEach(
        function(minion) {

            if (minion.element) {
                minion.element.remove();
            }

        }
    );

    bossMinions = [];

    /*
       Start final shutdown.
    */

    shutdownPanel.classList.add(
        "active"
    );

    startShutdown();
}


/* ==========================================
   SHUTDOWN
========================================== */

function startShutdown() {

    let start =
        performance.now();

    function update(now) {

        const elapsed =
            now - start;

        const percent =
            Math.min(
                100,
                Math.floor(
                    elapsed / 5000 *
                    100
                )
            );

        shutdownFill.style.width =
            `${percent}%`;

        shutdownPercent.textContent =
            `${percent}%`;

        if (percent < 100) {

            requestAnimationFrame(
                update
            );

        } else {

            finishGame();
        }
    }

    requestAnimationFrame(
        update
    );
}


/* ==========================================
   FINAL VICTORY
========================================== */

function finishGame() {

    gameEnded = true;

    shutdownPanel.classList.remove(
        "active"
    );

    objectiveText.textContent =
        "REACTOR SHUTDOWN COMPLETE";

    bossStatus.textContent =
        "SYSTEM: SECURED";

    bossStatus.style.color =
        "#00ff66";

    victoryScreen.classList.add(
        "active"
    );

    console.log(
        "================================"
    );

    console.log(
        "CAMPAIGN COMPLETE"
    );

    console.log(
        "LEVEL 10 CLEARED"
    );

    console.log(
        "THE CORE HAS BEEN SHUT DOWN"
    );

    console.log(
        "================================"
    );
}


/* ==========================================
   GAME OVER
========================================== */

function endGame() {

    if (gameEnded) {
        return;
    }

    gameEnded = true;

    gameOver.classList.add(
        "active"
    );

    bossStatus.textContent =
        "SYSTEM: BREACHED";

    bossStatus.style.color =
        "#ff003c";

    console.log(
        "LEVEL 10 FAILED"
    );
}


/* ==========================================
   HIT EFFECT
========================================== */

function createHitEffect(
    x,
    y
) {

    const effect =
        document.createElement(
            "div"
        );

    effect.className =
        "hitEffect";

    effect.style.left =
        `${x}px`;

    effect.style.top =
        `${y}px`;

    gameWorld.appendChild(
        effect
    );

    setTimeout(
        function() {

            effect.remove();

        },
        200
    );
}


/* ==========================================
   GAME LOOP
========================================== */

function gameLoop(now) {

    const delta =
        now - lastTime;

    lastTime = now;

    if (!gameEnded) {

        updateMovement();

        updateBoss(delta);

        updateProjectiles(delta);

        updateMinions();
    }

    requestAnimationFrame(
        gameLoop
    );
}


/* ==========================================
   BUTTONS
========================================== */

if (restartBtn) {

    restartBtn.addEventListener(
        "click",
        function() {

            location.reload();

        }
    );
}


if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        function() {

            location.reload();

        }
    );
}


/* ==========================================
   START
========================================== */

initGame();