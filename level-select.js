// ==========================================
// LEVEL SELECT SYSTEM
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const levelPoints =
        document.querySelectorAll(".mapPoint");

    const startBtn =
        document.getElementById("startMissionBtn");

    const backBtn =
        document.getElementById("backBtn");

    const selectedOperation =
        document.getElementById("selectedOperation");

    const operationTitle =
        document.getElementById("operationTitle");

    const operationName =
        document.getElementById("operationName");

    const threatLevel =
        document.getElementById("threatLevel");

    const objective =
        document.getElementById("objective");

    const tacticalTip =
        document.getElementById("tacticalTip");

    const cctvText =
        document.getElementById("cctvText");

    const coordinates =
        document.getElementById("coordinates");

    const lockWarning =
        document.getElementById("lockWarning");

    const loadingOverlay =
        document.getElementById("loadingOverlay");

    const loadingPercent =
        document.getElementById("loadingPercent");

    const loadingProgress =
        document.getElementById("loadingProgress");

    const loadingStatus =
        document.getElementById("loadingStatus");


    // ==========================================
    // LEVEL DATA
    // ==========================================

    const levels = {

        1: {

            title: "LEVEL 01",

            name:
                "SECTOR 01 — THE QUARANTINE HOSPITAL",

            threat:
                "THREAT LEVEL: ALPHA // LOW",

            objective:
                "Recover insulin supplies and encrypted data drives from the hospital basement.",

            cctv:
                "CAM 01 // HOSPITAL LOBBY",

            coordinates:
                "S01 // Q-HOSPITAL",

            tip:
                "Basic weapons are sufficient. Test your attachments before entering deeper sectors."

        },


        2: {

            title: "LEVEL 02",

            name:
                "SECTOR 02 — UNDERPASS SUBWAY STATION",

            threat:
                "THREAT LEVEL: BRAVO // MEDIUM",

            objective:
                "Restart the power grid and manually override the train route to open the escape tunnel.",

            cctv:
                "CAM 04 // SUBWAY TUNNEL",

            coordinates:
                "S02 // UNDERPASS",

            tip:
                "Laser sights and scopes are highly recommended for low-visibility combat."

        },


        3: {

            title: "LEVEL 03",

            name:
                "SECTOR 03 — DOWNTOWN SAFEZONE BREACH",

            threat:
                "THREAT LEVEL: OMEGA // NIGHTMARE",

            objective:
                "Reach the military evacuation chopper and survive the Tank / Mutant encounter.",

            cctv:
                "CAM 07 // DOWNTOWN",

            coordinates:
                "S03 // SAFEZONE",

            tip:
                "Extended magazines are strongly recommended. Hostile numbers are extreme."

        }

    };


    // ==========================================
    // PLAYER PROGRESS
    // ==========================================

    function getPlayerProgress() {

        let savedProgress =
            localStorage.getItem("playerProgress");

        if (!savedProgress) {

            return {

                currentLevel: 1,

                completedLevels: [],

                xp: 0,

                selectedMap: "hospital",

                selectedWeapon: "pistol",

                unlockedWeapons: ["pistol"],

                unlockedMaps: ["hospital"]

            };

        }

        try {

            return JSON.parse(savedProgress);

        }

        catch (error) {

            console.error(
                "PLAYER PROGRESS ERROR:",
                error
            );

            return {

                currentLevel: 1,

                completedLevels: [],

                xp: 0,

                selectedMap: "hospital",

                selectedWeapon: "pistol",

                unlockedWeapons: ["pistol"],

                unlockedMaps: ["hospital"]

            };

        }

    }


    // ==========================================
    // CURRENT LEVEL
    // ==========================================

    const playerProgress =
        getPlayerProgress();


    let currentLevel =
        Number(
            playerProgress.currentLevel
        ) || 1;


    // Safety

    currentLevel =
        Math.max(
            1,
            Math.min(
                3,
                currentLevel
            )
        );


    // ==========================================
    // CHECK LEVEL UNLOCK
    // ==========================================

    function isLevelUnlocked(levelNumber) {

        // Level 1 is always unlocked

        if (levelNumber === 1) {

            return true;

        }


        // Current level or lower = unlocked

        if (
            levelNumber <= currentLevel
        ) {

            return true;

        }


        // Completed previous level

        const completedLevels =
            playerProgress.completedLevels || [];


        return completedLevels.includes(
            levelNumber - 1
        );

    }


    // ==========================================
    // UPDATE LEVEL BUTTONS
    // ==========================================

    function updateLevelLocks() {

        levelPoints.forEach(
            function (point) {

                const levelNumber =
                    Number(
                        point.dataset.level
                    );


                const unlocked =
                    isLevelUnlocked(
                        levelNumber
                    );


                if (unlocked) {

                    // UNLOCK

                    point.classList.remove(
                        "locked"
                    );

                    point.classList.add(
                        "unlocked"
                    );


                } else {

                    // LOCK

                    point.classList.remove(
                        "unlocked"
                    );

                    point.classList.add(
                        "locked"
                    );

                    point.classList.remove(
                        "selected"
                    );

                }

            }
        );

    }


    // ==========================================
    // SHOW LEVEL
    // ==========================================

    function selectLevel(levelNumber) {

        const level =
            levels[levelNumber];


        if (!level) {

            return;

        }


        // Check lock

        if (
            !isLevelUnlocked(levelNumber)
        ) {

            if (lockWarning) {

                lockWarning.textContent =
                    "[ ENCRYPTED — COMPLETE PREVIOUS OPERATION ]";

                lockWarning.style.display =
                    "block";

            }

            return;

        }


        currentLevel =
            levelNumber;


        // --------------------------------------
        // REMOVE OLD ACTIVE STATE
        // --------------------------------------

        levelPoints.forEach(
            function (point) {

                point.classList.remove(
                    "selected"
                );

            }
        );


        // --------------------------------------
        // SELECTED POINT
        // --------------------------------------

        const selectedPoint =
            document.querySelector(
                '.mapPoint[data-level="' +
                levelNumber +
                '"]'
            );


        if (selectedPoint) {

            selectedPoint.classList.add(
                "selected"
            );

        }


        // --------------------------------------
        // LEVEL TITLE
        // --------------------------------------

        if (operationTitle) {

            operationTitle.textContent =
                level.title;

        }


        // --------------------------------------
        // LEVEL NAME
        // --------------------------------------

        if (operationName) {

            operationName.textContent =
                level.name;

        }


        // --------------------------------------
        // THREAT
        // --------------------------------------

        if (threatLevel) {

            threatLevel.textContent =
                level.threat;

        }


        // --------------------------------------
        // OBJECTIVE
        // --------------------------------------

        if (objective) {

            objective.textContent =
                level.objective;

        }


        // --------------------------------------
        // CCTV
        // --------------------------------------

        if (cctvText) {

            cctvText.textContent =
                level.cctv;

        }


        // --------------------------------------
        // COORDINATES
        // --------------------------------------

        if (coordinates) {

            coordinates.textContent =
                level.coordinates;

        }


        // --------------------------------------
        // TACTICAL TIP
        // --------------------------------------

        if (tacticalTip) {

            tacticalTip.textContent =
                level.tip;

        }


        // --------------------------------------
        // FOOTER
        // --------------------------------------

        if (selectedOperation) {

            selectedOperation.innerHTML =
                'OPERATION: <strong>SECTOR 0' +
                levelNumber +
                '</strong>';

        }


        // --------------------------------------
        // HIDE WARNING
        // --------------------------------------

        if (lockWarning) {

            lockWarning.style.display =
                "none";

        }

    }


    // ==========================================
    // LEVEL CLICK
    // ==========================================

    levelPoints.forEach(
        function (point) {

            point.addEventListener(
                "click",
                function () {

                    const levelNumber =
                        Number(
                            point.dataset.level
                        );


                    // LOCKED

                    if (
                        !isLevelUnlocked(
                            levelNumber
                        )
                    ) {

                        if (lockWarning) {

                            lockWarning.textContent =
                                "[ ENCRYPTED — COMPLETE PREVIOUS OPERATION ]";

                            lockWarning.style.display =
                                "block";

                        }

                        return;

                    }


                    // UNLOCKED

                    selectLevel(
                        levelNumber
                    );

                }
            );

        }
    );


    // ==========================================
    // START MISSION
    // ==========================================

    if (startBtn) {

        startBtn.addEventListener(
            "click",
            function () {

                // ----------------------------------
                // CHECK LEVEL
                // ----------------------------------

                if (
                    !isLevelUnlocked(
                        currentLevel
                    )
                ) {

                    return;

                }


                // ----------------------------------
                // SAVE SELECTED LEVEL
                // ----------------------------------

                localStorage.setItem(
                    "selectedLevel",
                    String(currentLevel)
                );


                // ----------------------------------
                // SHOW LOADING
                // ----------------------------------

                if (loadingOverlay) {

                    loadingOverlay.style.display =
                        "flex";

                }


                // ----------------------------------
                // LOADING
                // ----------------------------------

                let progress = 0;


                const loadingTimer =
                    setInterval(
                        function () {

                            progress += 10;


                            if (
                                progress > 100
                            ) {

                                progress = 100;

                            }


                            if (loadingPercent) {

                                loadingPercent.textContent =
                                    progress + "%";

                            }


                            if (loadingProgress) {

                                loadingProgress.style.width =
                                    progress + "%";

                            }


                            if (
                                loadingStatus &&
                                progress < 50
                            ) {

                                loadingStatus.textContent =
                                    "CONNECTING TO TACTICAL NETWORK...";

                            }


                            if (
                                loadingStatus &&
                                progress >= 50 &&
                                progress < 90
                            ) {

                                loadingStatus.textContent =
                                    "LOADING OPERATION DATA...";

                            }


                            if (
                                loadingStatus &&
                                progress >= 90
                            ) {

                                loadingStatus.textContent =
                                    "CAMERA FEED READY...";

                            }


                            // ----------------------------------
                            // COMPLETE
                            // ----------------------------------

                            if (
                                progress >= 100
                            ) {

                                clearInterval(
                                    loadingTimer
                                );


                                setTimeout(
                                    function () {

                                        /*
                                         * IMPORTANT:
                                         *
                                         * Current system
                                         * uses game.html.
                                         *
                                         * selectedLevel is saved
                                         * in localStorage.
                                         */

                                        window.location.href =
                                            "../game.html";

                                    },
                                    400
                                );

                            }

                        },
                        100
                    );

            }
        );

    }


    // ==========================================
    // BACK TO LOADOUT
    // ==========================================

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "loadout.html";

            }
        );

    }


    // ==========================================
    // INITIALIZE
    // ==========================================

    updateLevelLocks();


    // Open highest unlocked level

    selectLevel(
        currentLevel
    );

});