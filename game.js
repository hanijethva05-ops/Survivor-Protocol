// GAME START

document.addEventListener("DOMContentLoaded", function () {

    const startBtn =
        document.getElementById("startBtn");

    if (startBtn) {

        startBtn.addEventListener(
            "click",
            startGame
        );

    }

});


// =========================
// START GAME
// =========================

function startGame() {

    document.getElementById("game").innerHTML = `

        <div id="gameArea">

            <div id="health">
                ❤️ Health: 100
            </div>

            <div id="score">
                🏆 Score: 0
            </div>

            <div id="wave">
                🌊 Wave: 1
            </div>

            <div id="ammo">
                🔫 Ammo: 30
            </div>

            <button id="reloadBtn">
                🔄 RELOAD
            </button>

            <div id="player"></div>

            <div id="zombies"></div>

        </div>

    `;


    // =========================
    // RESET GAME DATA
    // =========================

    resetHealth();

    resetAmmo();

    resetScore();

    currentWave = 1;

    waveZombies = 3;

    zombies = [];


    // =========================
    // GAME ELEMENTS
    // =========================

    const player =
        document.getElementById("player");

    const gameArea =
        document.getElementById("gameArea");

    const zombiesContainer =
        document.getElementById("zombies");

        // =========================
        // CREATE ENVIRONMENT
        // =========================

        createEnvironment(gameArea);


    // =========================
    // PERMANENT GUN
    // =========================

    const gun =
        document.createElement("img");

    gun.src =
        "assets/images/weapons/gun.png";

    gun.className =
        "gun";

    gun.style.position =
        "absolute";

    gun.style.width =
        "45px";

    gun.style.height =
        "45px";

    gameArea.appendChild(gun);

    window.gameGun =
        gun;


    // =========================
    // PLAYER POSITION
    // =========================

    playerX = 375;

    playerY = 225;

    updatePlayer(player);


    // =========================
    // MOUSE AIM
    // =========================

    let mouseX = playerX;

    let mouseY = playerY;


    gameArea.addEventListener(
        "mousemove",
        function (event) {

            const rect =
                gameArea.getBoundingClientRect();

            mouseX =
                event.clientX -
                rect.left;

            mouseY =
                event.clientY -
                rect.top;


            window.mouseX =
                mouseX;

            window.mouseY =
                mouseY;

        }
    );


    // =========================
    // CREATE ZOMBIE
    // =========================

    function newZombie() {

        return createZombie(
            zombiesContainer
        );

    }


    // =========================
    // CREATE BOSS
    // =========================

    function newBoss() {

        playBossSound();

        return createBoss(
            zombiesContainer
        );

    }


    // =========================
    // FIRST WAVE
    // =========================

    startWave(
        newZombie,
        newBoss
    );


   // =========================
// KEYBOARD CONTROLS
// =========================

const keys = {};

document.addEventListener(
    "keydown",
    function (event) {

        keys[event.key.toLowerCase()] = true;

        // SPACE = SHOOT

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            shootWeapon(

                gameArea,

                playerX,
                playerY,

                mouseX,
                mouseY

            );

        }

    }
);


document.addEventListener(
    "keyup",
    function (event) {

        keys[event.key.toLowerCase()] = false;

    }
);


// =========================
// SMOOTH PLAYER MOVEMENT
// =========================

function updatePlayerMovement() {

    if (keys["w"] || keys["arrowup"]) {

        movePlayer("w");

    }

    if (keys["s"] || keys["arrowdown"]) {

        movePlayer("s");

    }

    if (keys["a"] || keys["arrowleft"]) {

        movePlayer("a");

    }

    if (keys["d"] || keys["arrowright"]) {

        movePlayer("d");

    }

    updatePlayer(player);

}

    


    // =========================
    // RELOAD BUTTON
    // =========================

    document
        .getElementById("reloadBtn")
        .addEventListener(
            "click",
            function () {

                reloadAmmo();

            }
        );
// =========================
// MOVEMENT LOOP
// =========================

setInterval(
    updatePlayerMovement,
    16
);

    // =========================
    // GAME LOOP
    // =========================

    setInterval(
        function () {

            // MOVE ZOMBIES

            moveZombies(
                playerX,
                playerY
            );

                // =========================
                // CHECK HEALTH PICKUP
                // =========================

                checkHealthPickup(
                    playerX,
                    playerY
                );


            // =====================
            // PLAYER DAMAGE
            // =====================

            zombies.forEach(
                function (zombieData) {


                    const distance =
                        Math.sqrt(

                            Math.pow(
                                playerX -
                                zombieData.x,
                                2
                            )

                            +

                            Math.pow(
                                playerY -
                                zombieData.y,
                                2
                            )

                        );


                    // =====================
                    // BOSS SPECIAL ATTACK
                    // =====================

                    if (
                        zombieData.type ===
                        "boss"
                    ) {

                        if (
                            bossSpecialAttack(

                                zombieData,

                                playerX,

                                playerY

                            )
                        ) {

                            const bossDamage =
                                3;


                            const dead =
                                damagePlayer(
                                    bossDamage
                                );


                            player.classList
                                .remove(
                                    "playerHit"
                                );


                            void player.offsetWidth;


                            player.classList
                                .add(
                                    "playerHit"
                                );


                            if (dead) {

                                playGameOverSound();

                                showGameOverMenu(

                                    playerScore,

                                    currentWave

                                );

                            }

                            return;

                        }

                    }


                    // =====================
                    // PLAYER COLLISION
                    // =====================

                    // =====================
// PLAYER COLLISION
// =====================

if (distance < 45) {

    // Attack cooldown setup
    const now = Date.now();

    if (!zombieData.lastAttackTime) {
        zombieData.lastAttackTime = 0;
    }


    // Normal zombie = 1000ms
    // Fast zombie = 700ms

    const attackCooldown =
        zombieData.type === "fast"
            ? 700
            : 1000;


    // Zombie can attack only
    // after cooldown

    if (
        now - zombieData.lastAttackTime <
        attackCooldown
    ) {
        return;
    }


    // Save attack time

    zombieData.lastAttackTime =
        now;


    // =====================
    // DAMAGE
    // =====================

    const damage =
        zombieData.type === "fast"
            ? 2
            : 1;


    // PLAYER HIT EFFECT

    player.classList.remove(
        "playerHit"
    );

    void player.offsetWidth;

    player.classList.add(
        "playerHit"
    );


    // DAMAGE PLAYER

    const dead =
        damagePlayer(damage);


    // =====================
    // GAME OVER
    // =====================

    if (dead) {

        playGameOverSound();

        showGameOverMenu(
            playerScore,
            currentWave
        );

    }

}

                }
            );

        },

        50

    );

}