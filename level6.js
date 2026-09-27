/* ==========================================
   LEVEL 6 - THE SERVER CORE
   DATA EXTRACTION
   ========================================== */

"use strict";

/* ==========================================
   DOM
========================================== */

const gameWorld = document.getElementById("gameWorld");
const player = document.getElementById("player");

const terminal1 = document.getElementById("terminal1");
const terminal2 = document.getElementById("terminal2");
const terminal3 = document.getElementById("terminal3");

const terminals = [
    terminal1,
    terminal2,
    terminal3
];

const objectiveText = document.getElementById("objectiveText");
const signalStatus = document.getElementById("signalStatus");

const interactionPrompt =
    document.getElementById("interactionPrompt");

const downloadPanel =
    document.getElementById("downloadPanel");

const downloadTitle =
    document.getElementById("downloadTitle");

const progressBar =
    document.getElementById("progressBar");

const downloadPercent =
    document.getElementById("downloadPercent");

const damageEffect =
    document.getElementById("damageEffect");

const magAmmo =
    document.getElementById("magAmmo");

const reserveAmmo =
    document.getElementById("reserve");

const zombiesKilledText =
    document.getElementById("zombiesKilled");

const missionComplete =
    document.getElementById("missionComplete");

const gameOver =
    document.getElementById("gameOver");

const continueBtn =
    document.getElementById("continueBtn");

const restartBtn =
    document.getElementById("restartBtn");

const vitalStatus =
    document.getElementById("vitalStatus");

const bpm =
    document.getElementById("bpm");

const batteryPercent =
    document.getElementById("batteryPercent");


/* ==========================================
   GAME SETTINGS
========================================== */

const PLAYER_SPEED = 3.2;
const SPRINT_SPEED = 5.5;

const MAX_HP = 100;

const MAG_SIZE = 30;

const DOWNLOAD_TIME = 4000;

const TERMINAL_RANGE = 115;

const ZOMBIE_COUNT_PER_TERMINAL = 3;

const ZOMBIE_SPEED = 1.15;

const ZOMBIE_DAMAGE = 7;

const ZOMBIE_ATTACK_RANGE = 38;

const BULLET_DAMAGE = 50;

const SHOOT_COOLDOWN = 150;

const RELOAD_TIME = 1400;


/* ==========================================
   GAME STATE
========================================== */

let hp = MAX_HP;

let mag = MAG_SIZE;

let reserve = 120;

let zombiesKilled = 0;

let logsDownloaded = 0;

let currentTerminal = null;

let downloading = false;

let downloadTimer = null;

let downloadStartTime = 0;

let reloadInProgress = false;

let lastShot = 0;

let sprinting = false;

let gameEnded = false;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let keys = {};

let enemies = [];


/* ==========================================
   PLAYER POSITION
========================================== */

let playerX = window.innerWidth / 2;
let playerY = window.innerHeight * 0.75;

function updateHUD() {
    if (magAmmo) {
        magAmmo.textContent = mag;
    }

    if (reserveAmmo) {
        reserveAmmo.textContent = reserve;
    }

    if (zombiesKilledText) {
        zombiesKilledText.textContent = zombiesKilled;
    }

    if (signalStatus) {
        if (logsDownloaded >= 3) {
            signalStatus.textContent = "SECURED";
            signalStatus.style.color = "#00ff66";
        } else if (downloading) {
            signalStatus.textContent = "EXTRACTING";
            signalStatus.style.color = "#ffcc00";
        } else {
            signalStatus.textContent = "STABLE";
            signalStatus.style.color = "#00ffff";
        }
    }

    if (objectiveText) {
        if (logsDownloaded >= 3) {
            objectiveText.textContent =
                "ALL VIRUS LOGS EXTRACTED — PROCEED TO LEVEL 7";
        } else {
            objectiveText.textContent =
                `DOWNLOAD ENCRYPTED VIRUS LOGS (${logsDownloaded}/3)`;
        }
    }

    if (vitalStatus) {
        if (hp > 50) {
            vitalStatus.textContent = "STABLE";
            vitalStatus.style.color = "#00ff66";
        } else if (hp > 20) {
            vitalStatus.textContent = "WARNING";
            vitalStatus.style.color = "#ffcc00";
        } else {
            vitalStatus.textContent = "CRITICAL";
            vitalStatus.style.color = "#ff003c";
        }
    }

    if (bpm) {
        bpm.textContent =
            hp <= 20 ? "118" :
            hp <= 50 ? "96" :
            "72";
    }

    if (batteryPercent) {
        batteryPercent.textContent = "80%";
    }
}

/* ==========================================
   INITIALIZE
========================================== */

function initGame() {

    playerX = window.innerWidth / 2;
    playerY = window.innerHeight * 0.75;

    hp = MAX_HP;

    mag = MAG_SIZE;

    reserve = 120;

    zombiesKilled = 0;

    logsDownloaded = 0;

    currentTerminal = null;

    downloading = false;

    reloadInProgress = false;

    gameEnded = false;

    enemies = [];

    missionComplete.classList.add("hidden");
    gameOver.classList.add("hidden");

    missionComplete.classList.remove("active");
    gameOver.classList.remove("active");

    updatePlayer();

    updateHUD();

    updateObjective();

    console.log("LEVEL 6 SERVER CORE INITIALIZED");

    requestAnimationFrame(gameLoop);
}


/* ==========================================
   PLAYER MOVEMENT
========================================== */

function updateMovement() {

    if (gameEnded) {
        return;
    }

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) {
        dy -= 1;
    }

    if (keys["s"] || keys["arrowdown"]) {
        dy += 1;
    }

    if (keys["a"] || keys["arrowleft"]) {
        dx -= 1;
    }

    if (keys["d"] || keys["arrowright"]) {
        dx += 1;
    }

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.sqrt(dx * dx + dy * dy);

        dx /= length;
        dy /= length;

        const speed =
            sprinting
                ? SPRINT_SPEED
                : PLAYER_SPEED;

        playerX += dx * speed;
        playerY += dy * speed;
    }

    /* Keep player inside screen */

    const margin = 25;

    playerX = Math.max(
        margin,
        Math.min(
            window.innerWidth - margin,
            playerX
        )
    );

    playerY = Math.max(
        80,
        Math.min(
            window.innerHeight - margin,
            playerY
        )
    );

    updatePlayer();
}


/* ==========================================
   UPDATE PLAYER
========================================== */

function updatePlayer() {

    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}


/* ==========================================
   KEYBOARD
========================================== */

document.addEventListener("keydown", function (event) {

    const key =
        event.key.toLowerCase();

    keys[key] = true;

    if (key === "shift") {
        sprinting = true;
    }

    /* E = terminal interaction */

    if (key === "e") {
        tryTerminalInteraction();
    }

    /* R = reload */

    if (key === "r") {
        reload();
    }

});


document.addEventListener("keyup", function (event) {

    const key =
        event.key.toLowerCase();

    keys[key] = false;

    if (key === "shift") {
        sprinting = false;
    }

});


/* ==========================================
   MOUSE
========================================== */

document.addEventListener("mousemove", function (event) {

    mouseX = event.clientX;
    mouseY = event.clientY;

});


document.addEventListener("mousedown", function (event) {

    if (event.button === 0) {
        shoot();
    }

});


/* ==========================================
   TERMINAL DISTANCE
========================================== */

function distanceToTerminal(terminal) {

    const rect =
        terminal.getBoundingClientRect();

    const tx =
        rect.left + rect.width / 2;

    const ty =
        rect.top + rect.height / 2;

    return Math.sqrt(
        Math.pow(playerX - tx, 2) +
        Math.pow(playerY - ty, 2)
    );
}


/* ==========================================
   FIND NEAREST TERMINAL
========================================== */

function getNearestTerminal() {

    let nearest = null;

    let nearestDistance = Infinity;

    terminals.forEach(function (terminal) {

        if (!terminal) {
            return;
        }

        if (
            terminal.classList.contains(
                "completed"
            )
        ) {
            return;
        }

        const distance =
            distanceToTerminal(terminal);

        if (distance < nearestDistance) {

            nearestDistance = distance;

            nearest = terminal;
        }

    });

    return {
        terminal: nearest,
        distance: nearestDistance
    };
}


/* ==========================================
   TERMINAL PROMPT
========================================== */

function updateTerminalPrompt() {

    if (downloading || gameEnded) {
        return;
    }

    const result =
        getNearestTerminal();

    if (
        result.terminal &&
        result.distance <= TERMINAL_RANGE
    ) {

        currentTerminal =
            result.terminal;

        interactionPrompt.textContent =
            "[ E ] DOWNLOAD VIRUS LOG";

        interactionPrompt.classList.add(
            "active"
        );

        result.terminal.classList.add(
            "active"
        );

    } else {

        terminals.forEach(function (terminal) {

            terminal.classList.remove(
                "active"
            );

        });

        currentTerminal = null;

        interactionPrompt.textContent =
            "MOVE TO A SERVER TERMINAL";

        interactionPrompt.classList.remove(
            "active"
        );
    }
}


/* ==========================================
   TERMINAL INTERACTION
========================================== */

function tryTerminalInteraction() {

    if (gameEnded) {
        return;
    }

    if (downloading) {
        return;
    }

    const result =
        getNearestTerminal();

    if (!result.terminal) {
        return;
    }

    if (
        result.distance >
        TERMINAL_RANGE
    ) {

        interactionPrompt.textContent =
            "MOVE CLOSER TO TERMINAL";

        interactionPrompt.classList.add(
            "active"
        );

        setTimeout(function () {

            if (!downloading) {
                interactionPrompt.classList.remove(
                    "active"
                );
            }

        }, 1000);

        return;
    }

    startDownload(
        result.terminal
    );
}


/* ==========================================
   START DOWNLOAD
========================================== */

function startDownload(terminal) {

    if (downloading) {
        return;
    }

    if (
        terminal.classList.contains(
            "completed"
        )
    ) {
        return;
    }

    downloading = true;

    currentTerminal = terminal;

    interactionPrompt.classList.remove(
        "active"
    );

    terminals.forEach(function (item) {

        item.classList.remove(
            "active"
        );

    });

    terminal.classList.add(
        "active"
    );

    downloadPanel.classList.remove(
        "hidden"
    );

    downloadPanel.style.display =
        "block";

    downloadTitle.textContent =
        `SERVER TERMINAL ${
            terminal.dataset.terminal
        }`;

    progressBar.style.width = "0%";

    downloadPercent.textContent =
        "0%";

    signalStatus.textContent =
        "EXTRACTING";

    signalStatus.style.color =
        "#ffcc00";

    downloadStartTime =
        performance.now();

    console.log(
        `DOWNLOAD STARTED: TERMINAL ${
            terminal.dataset.terminal
        }`
    );

    /*
       IMPORTANT:
       Zombies spawn immediately when
       terminal download starts.
    */

    spawnTerminalZombies();

    downloadTimer =
        requestAnimationFrame(
            updateDownload
        );
}


/* ==========================================
   DOWNLOAD UPDATE
========================================== */

function updateDownload(now) {

    if (!downloading) {
        return;
    }

    const elapsed =
        now - downloadStartTime;

    let percent =
        Math.floor(
            (elapsed / DOWNLOAD_TIME) * 100
        );

    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );

    progressBar.style.width =
        `${percent}%`;

    downloadPercent.textContent =
        `${percent}%`;

    /*
       Player must stay close to terminal.
    */

    if (
        currentTerminal &&
        distanceToTerminal(
            currentTerminal
        ) > TERMINAL_RANGE + 30
    ) {

        cancelDownload(
            "DOWNLOAD INTERRUPTED"
        );

        return;
    }

    if (percent >= 100) {

        finishDownload();

        return;
    }

    downloadTimer =
        requestAnimationFrame(
            updateDownload
        );
}


/* ==========================================
   FINISH DOWNLOAD
========================================== */

function finishDownload() {

    if (!downloading) {
        return;
    }

    downloading = false;

    cancelAnimationFrame(
        downloadTimer
    );

    if (currentTerminal) {

        currentTerminal.classList.remove(
            "active"
        );

        currentTerminal.classList.add(
            "completed"
        );

        const status =
            currentTerminal.querySelector(
                ".terminalStatus"
            );

        if (status) {
            status.textContent =
                "DOWNLOAD COMPLETE";
        }

    }

    logsDownloaded++;

    downloadPanel.classList.add(
        "hidden"
    );

    downloadPanel.style.display =
        "none";

    signalStatus.textContent =
        "STABLE";

    signalStatus.style.color =
        "#00ff66";

    updateObjective();

    console.log(
        `VIRUS LOG ${
            logsDownloaded
        } / 3 EXTRACTED`
    );

    if (logsDownloaded >= 3) {

        completeLevel();

    } else {

        currentTerminal = null;

        interactionPrompt.textContent =
            "MOVE TO NEXT SERVER TERMINAL";

        interactionPrompt.classList.add(
            "active"
        );

        setTimeout(function () {

            if (!gameEnded) {

                interactionPrompt.classList.remove(
                    "active"
                );

            }

        }, 1800);

    }
}


/* ==========================================
   CANCEL DOWNLOAD
========================================== */

function cancelDownload(reason) {

    if (!downloading) {
        return;
    }

    downloading = false;

    cancelAnimationFrame(
        downloadTimer
    );

    downloadPanel.classList.add(
        "hidden"
    );

    downloadPanel.style.display =
        "none";

    signalStatus.textContent =
        "STABLE";

    signalStatus.style.color =
        "#00ff66";

    interactionPrompt.textContent =
        reason;

    interactionPrompt.classList.add(
        "active"
    );

    setTimeout(function () {

        if (!gameEnded) {

            interactionPrompt.classList.remove(
                "active"
            );

        }

    }, 1200);

}


/* ==========================================
   SPAWN ZOMBIES
========================================== */

function spawnTerminalZombies() {

    const centerX = playerX;
    const centerY = playerY;

    for (
        let i = 0;
        i < ZOMBIE_COUNT_PER_TERMINAL;
        i++
    ) {

        /*
           Spawn around player,
           but not directly on player.
        */

        const angle =
            (Math.PI * 2 / 3) * i;

        const distance =
            260 + Math.random() * 100;

        const x =
            centerX +
            Math.cos(angle) * distance;

        const y =
            centerY +
            Math.sin(angle) * distance;

        createZombie(
            x,
            y
        );
    }

    showZombieAlert();
}


/* ==========================================
   ZOMBIE ALERT
========================================== */

function showZombieAlert() {

    let alert =
        document.getElementById(
            "zombieAlert"
        );

    if (!alert) {

        alert =
            document.createElement(
                "div"
            );

        alert.id =
            "zombieAlert";

        alert.className =
            "zombieAlert";

        alert.textContent =
            "⚠ HOSTILES DETECTED ⚠";

        document.body.appendChild(
            alert
        );
    }

    alert.classList.remove(
        "active"
    );

    void alert.offsetWidth;

    alert.classList.add(
        "active"
    );

    setTimeout(function () {

        alert.classList.remove(
            "active"
        );

    }, 1000);
}


/* ==========================================
   CREATE ZOMBIE
========================================== */

function createZombie(x, y) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "enemy sprinter";

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
            90,
            Math.min(
                window.innerHeight - 30,
                y
            )
        ),

        hp: 100,

        maxHp: 100,

        speed:
            ZOMBIE_SPEED +
            Math.random() * 0.35,

        attackCooldown: 0,

        dead: false

    };

    enemies.push(
        zombie
    );

    updateZombieElement(
        zombie
    );
}


/* ==========================================
   UPDATE ZOMBIES
========================================== */

function updateZombies() {

    if (gameEnded) {
        return;
    }

    enemies.forEach(function (zombie) {

        if (zombie.dead) {
            return;
        }

        const dx =
            playerX - zombie.x;

        const dy =
            playerY - zombie.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance >
            ZOMBIE_ATTACK_RANGE
        ) {

            const moveX =
                dx / distance;

            const moveY =
                dy / distance;

            zombie.x +=
                moveX *
                zombie.speed;

            zombie.y +=
                moveY *
                zombie.speed;

        } else {

            attackPlayer(
                zombie
            );

        }

        updateZombieElement(
            zombie
        );

    });

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
        now + 700;

    takeDamage(
        ZOMBIE_DAMAGE
    );
}


/* ==========================================
   ZOMBIE ELEMENT POSITION
========================================== */

function updateZombieElement(
    zombie
) {

    zombie.element.style.left =
        `${zombie.x}px`;

    zombie.element.style.top =
        `${zombie.y}px`;

    zombie.element.style.transform =
        "translate(-50%, -50%)";
}


/* ==========================================
   DAMAGE PLAYER
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
        "damageActive"
    );

    setTimeout(function () {

        damageEffect.classList.remove(
            "damageActive"
        );

    }, 150);

    updateVitals();

    if (hp <= 0) {

        endGame();

    }
}


/* ==========================================
   UPDATE VITALS
========================================== */

function updateVitals() {

    if (!vitalStatus) {
        return;
    }

    if (hp <= 25) {

        vitalStatus.textContent =
            "CRITICAL";

        vitalStatus.style.color =
            "#ff003c";

        if (bpm) {
            bpm.textContent =
                "142";
        }

    } else if (hp <= 50) {

        vitalStatus.textContent =
            "UNSTABLE";

        vitalStatus.style.color =
            "#ffcc00";

        if (bpm) {
            bpm.textContent =
                "110";
        }

    } else {

        vitalStatus.textContent =
            "STABLE";

        vitalStatus.style.color =
            "#00ff66";

        if (bpm) {
            bpm.textContent =
                "72";
        }
    }
}


/* ==========================================
   SHOOT
========================================== */

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

    if (now - lastShot < SHOOT_COOLDOWN) {
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

    enemies.forEach(function (zombie) {

        if (zombie.dead) {
            return;
        }

        const distanceToMouse =
            Math.sqrt(
                Math.pow(zombie.x - mouseX, 2) +
                Math.pow(zombie.y - mouseY, 2)
            );

        const distanceToPlayer =
            Math.sqrt(
                Math.pow(zombie.x - playerX, 2) +
                Math.pow(zombie.y - playerY, 2)
            );

        /*
           Easier aiming:
           zombie mouse se 140px ke andar ho
           aur player se 1000px ke andar ho.
        */

        if (
            distanceToMouse <= 140 &&
            distanceToPlayer <= 1000
        ) {

            if (distanceToMouse < bestDistance) {

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

        console.log(
            "ZOMBIE HIT",
            target.hp
        );

    } else {

        console.log(
            "SHOT MISSED"
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

    setTimeout(function () {

        zombie.element.classList.remove(
            "enemyHit"
        );

    }, 100);

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

    zombiesKilledText.textContent =
        zombiesKilled;

    zombie.element.style.opacity =
        "0";

    zombie.element.style.transform =
        "translate(-50%, -50%) scale(.4)";

    setTimeout(function () {

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

    setTimeout(function () {

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

        if (!downloading) {

            interactionPrompt.classList.remove(
                "active"
            );

        }

    }, RELOAD_TIME);

}


/* ==========================================
   AMMO HUD
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

        document.body.appendChild(
            warning
        );

    }

    warning.classList.add(
        "warningActive"
    );

    setTimeout(function () {

        warning.classList.remove(
            "warningActive"
        );

    }, 1200);

}


/* ==========================================
   OBJECTIVE
========================================== */

function updateObjective() {

    if (!objectiveText) {
        return;
    }

    if (logsDownloaded < 3) {

        objectiveText.textContent =
            `DOWNLOAD VIRUS LOGS: ${
                logsDownloaded
            } / 3`;

    } else {

        objectiveText.textContent =
            "ALL VIRUS LOGS EXTRACTED";

    }

}




/* ==========================================
   LEVEL 6 COMPLETE
========================================== */

function completeLevel() {

    if (gameEnded) {
        return;
    }

    gameEnded = true;

        // SAVE LEVEL 6 COMPLETION
    localStorage.setItem("level6Completed", "true");
    localStorage.setItem("level7Unlocked", "true");

    
    downloading = false;

    cancelAnimationFrame(downloadTimer);

    if (downloadPanel) {
        downloadPanel.classList.add("hidden");
        downloadPanel.style.display = "none";
    }

    if (interactionPrompt) {
        interactionPrompt.classList.remove("active");
    }

    if (signalStatus) {
        signalStatus.innerHTML =
            "SIGNAL: <span>EXTRACTION SUCCESSFUL</span>";
        signalStatus.style.color = "#00ff66";
    }

    if (objectiveText) {
        objectiveText.textContent =
            "LEVEL 6 COMPLETE // EXTRACTION SUCCESSFUL";
        objectiveText.style.color = "#00ff66";
    }

    showLevel6Complete();

}


/* ==========================================
   LEVEL 6 COMPLETE SCREEN
========================================== */

function showLevel6Complete() {

    const old =
        document.getElementById(
            "level6CompleteScreen"
        );

    if (old) {
        old.remove();
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "level6CompleteScreen";

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "99999";

    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    overlay.style.background =
        "rgba(0,0,0,.92)";

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
                LEVEL 6 COMPLETE
            </div>


            <div style="
                font-size:18px;
                letter-spacing:4px;
                color:#00ffff;
                margin-bottom:12px;
            ">
                // SECTOR 06 //
            </div>


            <div style="
                font-size:15px;
                letter-spacing:3px;
                color:#00ff66;
                margin-bottom:35px;
            ">
                OPERATION COMPLETE // DATA EXTRACTION SUCCESSFUL
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
                    SERVER CORE
                </div>

                <div style="
                    color:#00ff66;
                    font-size:14px;
                    letter-spacing:2px;
                ">
                    VIRUS LOGS SECURED — 3 / 3
                </div>

            </div>


            <button
                id="level6ContinueBtn"
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

                    transition:.2s ease;
                "
            >
                CONTINUE TO LEVEL 7 →
            </button>

        </div>

    `;

    document.body.appendChild(
        overlay
    );


    const continueButton =
        document.getElementById(
            "level6ContinueBtn"
        );


    if (continueButton) {

        continueButton.addEventListener(
            "mouseenter",
            function () {

                continueButton.style.background =
                    "rgba(0,255,255,.15)";

                continueButton.style.boxShadow =
                    "0 0 20px rgba(0,255,255,.25)";

            }
        );


        continueButton.addEventListener(
            "mouseleave",
            function () {

                continueButton.style.background =
                    "rgba(0,255,255,.06)";

                continueButton.style.boxShadow =
                    "none";

            }
        );


        continueButton.addEventListener(
            "click",
            function () {

                continueButton.disabled = true;

                continueButton.textContent =
                    "LOADING LEVEL 7...";

                setTimeout(function () {

                    window.location.href =
                        "level7.html";

                }, 500);

            }
        );

    }

}


/* ==========================================
   LEVEL 6 FAILED
========================================== */

function endGame() {

    if (gameEnded) {
        return;
    }

    gameEnded = true;
    downloading = false;

    cancelAnimationFrame(downloadTimer);

    if (downloadPanel) {
        downloadPanel.classList.add("hidden");
        downloadPanel.style.display = "none";
    }

    if (interactionPrompt) {
        interactionPrompt.classList.remove("active");
    }

    if (signalStatus) {
        signalStatus.innerHTML =
            "SIGNAL: <span>SIGNAL LOST</span>";

        signalStatus.style.color =
            "#ff3333";
    }

    if (objectiveText) {
        objectiveText.textContent =
            "LEVEL 6 FAILED // OPERATOR DOWN";

        objectiveText.style.color =
            "#ff3333";
    }

    showLevel6Failed();

}


/* ==========================================
   LEVEL 6 FAILED SCREEN
========================================== */

function showLevel6Failed() {

    const old =
        document.getElementById(
            "level6FailedScreen"
        );

    if (old) {
        old.remove();
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "level6FailedScreen";

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
                LEVEL 6 FAILED
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
                line-height:1.8;
            ">

                VIRUS LOGS EXTRACTED:
                ${logsDownloaded} / 3

                <br>

                ZOMBIES KILLED:
                ${zombiesKilled}

                <br>

                FINAL HEALTH:
                ${Math.max(0, hp)}%

            </div>


            <button
                id="level6RetryBtn"
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

                    transition:.2s ease;
                "
            >
                RETRY LEVEL 6
            </button>

        </div>

    `;

    document.body.appendChild(
        overlay
    );


    const retryButton =
        document.getElementById(
            "level6RetryBtn"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "mouseenter",
            function () {

                retryButton.style.background =
                    "rgba(255,0,0,.14)";

                retryButton.style.boxShadow =
                    "0 0 20px rgba(255,0,0,.25)";

            }
        );


        retryButton.addEventListener(
            "mouseleave",
            function () {

                retryButton.style.background =
                    "rgba(255,0,0,.06)";

                retryButton.style.boxShadow =
                    "none";

            }
        );


        retryButton.addEventListener(
            "click",
            function () {

                window.location.reload();

            }
        );

    }

}




/* ==========================================
   RESTART LEVEL
========================================== */

if (restartBtn) {

    restartBtn.addEventListener(
        "click",
        function () {

            location.reload();

        }
    );

}


/* ==========================================
   CONTINUE TO LEVEL 7
========================================== */

if (continueBtn) {

    continueBtn.addEventListener(
        "click",
        function () {

            /*
               IMPORTANT:
               level7.html must be in the
               same folder as level6.html.
            */

            window.location.href =
                "level7.html";

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

        updateTerminalPrompt();

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
    function () {

        playerX =
            Math.min(
                playerX,
                window.innerWidth - 30
            );

        playerY =
            Math.min(
                playerY,
                window.innerHeight - 30
            );

        updatePlayer();

    }
);


/* ==========================================
   INITIAL START
========================================== */

updateAmmo();

updateVitals();

initGame();