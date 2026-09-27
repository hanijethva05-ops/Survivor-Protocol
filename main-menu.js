document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MAIN SCREENS
    // =====================================================

    const securityMonitor =
        document.getElementById("securityMonitor");

    const loginGateScreen =
        document.getElementById("loginGateScreen");

    const levelSelectScreen =
        document.getElementById("levelSelectScreen");

    const loadoutScreen =
        document.getElementById("loadoutScreen");

    const playBtn =
        document.getElementById("playBtn");


    // =====================================================
    // PLAYER PROGRESS
    // =====================================================

    const defaultProgress = {
        currentLevel: 1,
        completedLevels: [],
        xp: 0,
        selectedLevel: 1,
        selectedMap: "hospital",
        selectedWeapon: "pistol",
        unlockedWeapons: ["pistol"],
        unlockedMaps: ["hospital"]
    };


    function getPlayerProgress() {

    try {

        const saved =
            localStorage.getItem("playerProgress");

        let progress = {
            ...defaultProgress
        };

        if (saved) {

            progress = {
                ...defaultProgress,
                ...JSON.parse(saved)
            };

        }


        // =================================================
        // LEVEL 6 → LEVEL 7 UNLOCK SYNC
        // =================================================

        const level6Completed =
            localStorage.getItem("level6Completed") === "true";

        const level7Unlocked =
            localStorage.getItem("level7Unlocked") === "true";


        if (
            level6Completed ||
            level7Unlocked
        ) {

            // Make sure completedLevels exists
            if (
                !Array.isArray(
                    progress.completedLevels
                )
            ) {

                progress.completedLevels = [];

            }


            // Mark Level 6 completed
            if (
                !progress.completedLevels.includes(6)
            ) {

                progress.completedLevels.push(6);

            }


            // Unlock Level 7
            if (
                Number(progress.currentLevel || 1) < 7
            ) {

                progress.currentLevel = 7;

            }


            // Save synced progress
            localStorage.setItem(
                "playerProgress",
                JSON.stringify(progress)
            );


            console.log(
                "LEVEL 6 COMPLETION DETECTED"
            );

            console.log(
                "LEVEL 7 UNLOCKED"
            );

        }


        // =================================================
// LEVEL 8 → LEVEL 9 UNLOCK SYNC
// =================================================

const level8Completed =
    localStorage.getItem("level8Completed") === "true";

const level9Unlocked =
    localStorage.getItem("level9Unlocked") === "true";

if (
    level8Completed ||
    level9Unlocked
) {

    // Make sure completedLevels exists
    if (
        !Array.isArray(
            progress.completedLevels
        )
    ) {

        progress.completedLevels = [];

    }


    // Mark Level 8 completed
    if (
        !progress.completedLevels.includes(8)
    ) {

        progress.completedLevels.push(8);

    }


    // Unlock Level 9
    if (
        Number(progress.currentLevel || 1) < 9
    ) {

        progress.currentLevel = 9;

    }


    // Save synced progress
    localStorage.setItem(
        "playerProgress",
        JSON.stringify(progress)
    );


    console.log(
        "LEVEL 8 COMPLETION DETECTED"
    );

    console.log(
        "LEVEL 9 UNLOCKED"
    );

}


// =================================================
// LEVEL 9 → LEVEL 10 UNLOCK SYNC
// =================================================

const level9Completed =
    localStorage.getItem("level9Completed") === "true";

const level10Unlocked =
    localStorage.getItem("level10Unlocked") === "true";

if (
    level9Completed ||
    level10Unlocked
) {

    if (
        !Array.isArray(progress.completedLevels)
    ) {
        progress.completedLevels = [];
    }


    // Mark Level 9 completed
    if (
        !progress.completedLevels.includes(9)
    ) {
        progress.completedLevels.push(9);
    }


    // Unlock Level 10
    if (
        Number(progress.currentLevel || 1) < 10
    ) {
        progress.currentLevel = 10;
    }


    localStorage.setItem(
        "playerProgress",
        JSON.stringify(progress)
    );


    console.log(
        "LEVEL 9 COMPLETION DETECTED"
    );

    console.log(
        "LEVEL 10 UNLOCKED"
    );
}


        return progress;


    } catch (error) {

        console.error(
            "PLAYER PROGRESS ERROR:",
            error
        );

        return {
            ...defaultProgress
        };

    }

}




    // =====================================================
// AUTOMATIC LEVEL UNLOCK SYSTEM
// =====================================================

function unlockNextLevel(completedLevel) {

    const progress = getPlayerProgress();

    // Make sure arrays exist
    if (!Array.isArray(progress.completedLevels)) {
        progress.completedLevels = [];
    }

    // Mark current level completed
    if (!progress.completedLevels.includes(completedLevel)) {
        progress.completedLevels.push(completedLevel);
    }

    // Unlock next level
    const nextLevel = completedLevel + 1;

    if (
        nextLevel <= 10 &&
        Number(progress.currentLevel || 1) < nextLevel
    ) {
        progress.currentLevel = nextLevel;
    }

    // Save
    localStorage.setItem(
        "playerProgress",
        JSON.stringify(progress)
    );

    console.log(
        "LEVEL COMPLETED:",
        completedLevel
    );

    console.log(
        "NEXT LEVEL UNLOCKED:",
        nextLevel <= 10 ? nextLevel : "ALL LEVELS COMPLETE"
    );
}


    function savePlayerProgress(progress) {

        localStorage.setItem(
            "playerProgress",
            JSON.stringify(progress)
        );

    }


    function initializePlayerProgress() {

        const progress =
            getPlayerProgress();

        savePlayerProgress(progress);

        

        return progress;

    }


    // =====================================================
    // MAIN MENU
    // =====================================================

    if (playBtn) {

        playBtn.addEventListener(
            "click",
            function () {

                securityMonitor.style.display =
                    "none";

                const savedGoogleUser =
                    localStorage.getItem("googleUser");


                if (savedGoogleUser) {

                    console.log(
                        "SAVED GOOGLE ACCOUNT FOUND"
                    );

                    initializePlayerProgress();

                    loginGateScreen.classList.add(
                        "hidden"
                    );

                    levelSelectScreen.classList.remove(
                        "hidden"
                    );

                    createLevelSelection();

                } else {

                    loginGateScreen.classList.remove(
                        "hidden"
                    );

                    console.log(
                        "AUTHORIZATION TERMINAL OPEN"
                    );

                }

            }
        );

    }


    // =====================================================
    // GOOGLE CONFIGURATION
    // =====================================================

    const GOOGLE_CLIENT_ID =
        "856209198111-44kl91sca5anls23952ejtvesc5pugf0.apps.googleusercontent.com";


    const googleLoginBtn =
        document.getElementById(
            "googleLoginBtn"
        );


    // =====================================================
    // WAIT FOR GOOGLE GIS
    // =====================================================

    function waitForGoogleGIS(callback) {

        if (
            window.google &&
            google.accounts &&
            google.accounts.oauth2
        ) {

            callback();

            return;

        }


        console.log(
            "Waiting for Google Identity Services..."
        );


        setTimeout(
            function () {

                waitForGoogleGIS(callback);

            },
            200
        );

    }


    // =====================================================
    // GOOGLE LOGIN
    // =====================================================

    function startGoogleLogin() {

        waitForGoogleGIS(
            function () {

                console.log(
                    "Opening Google account selection..."
                );


                const codeClient =
                    google.accounts.oauth2.initCodeClient({

                        client_id:
                            GOOGLE_CLIENT_ID,

                        scope:
                            "openid email profile",

                        ux_mode:
                            "popup",


                        callback:
                            async function (response) {

                                console.log(
                                    "Google callback:",
                                    response
                                );


                                if (!response.code) {

                                    console.error(
                                        "Google login failed:",
                                        response
                                    );

                                    return;

                                }


                                try {

                                    const result =
    await fetch(
        "http://localhost:3000/auth/google",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({
                    code:
                        response.code
                })
        }
    );
                                            
                                    


                                    const data =
                                        await result.json();


                                    console.log(
                                        "Backend response:",
                                        data
                                    );


                                    if (
                                        data.success &&
                                        data.user
                                    ) {

                                        console.log(
                                            "GOOGLE USER VERIFIED:",
                                            data.user
                                        );


                                        googleLoginBtn.innerHTML =
                                            "<strong>✓ GOOGLE ID LINKED</strong>" +
                                            "<small>" +
                                            data.user.email +
                                            "</small>";


                                        localStorage.setItem(
                                            "googleUser",
                                            JSON.stringify(
                                                data.user
                                            )
                                        );


                                        initializePlayerProgress();


                                        setTimeout(
                                            function () {

                                                loginGateScreen.classList.add(
                                                    "hidden"
                                                );

                                                levelSelectScreen.classList.remove(
                                                    "hidden"
                                                );

                                                createLevelSelection();

                                            },
                                            700
                                        );


                                    } else {

                                        throw new Error(
                                            data.message ||
                                            "Google verification failed"
                                        );

                                    }


                                } catch (error) {

                                    console.error(
                                        "Backend authentication error:",
                                        error
                                    );


                                    googleLoginBtn.innerHTML =
                                        "<strong>◎ LINK GOOGLE ID</strong>" +
                                        "<small>AUTHENTICATION FAILED</small>";

                                }

                            }

                    });


                codeClient.requestCode();

            }
        );

    }


    if (googleLoginBtn) {

        googleLoginBtn.addEventListener(
            "click",
            startGoogleLogin
        );

    }


    // =====================================================
    // GUEST LOGIN
    // =====================================================

    const guestAccessBtn =
        document.getElementById(
            "guestAccessBtn"
        );


    if (guestAccessBtn) {

        guestAccessBtn.addEventListener(
            "click",
            function () {

                guestAccessBtn.innerHTML =
                    "<strong>✓ GUEST ACCESS GRANTED</strong>" +
                    "<small>LOCAL PROFILE INITIALIZED</small>";


                initializePlayerProgress();


                setTimeout(
                    function () {

                        loginGateScreen.classList.add(
                            "hidden"
                        );

                        levelSelectScreen.classList.remove(
                            "hidden"
                        );

                        createLevelSelection();

                    },
                    600
                );

            }
        );

    }


    // =====================================================
    // LOGIN BACK
    // =====================================================

    const loginBackBtn =
        document.getElementById(
            "loginBackBtn"
        );


    if (loginBackBtn) {

        loginBackBtn.addEventListener(
            "click",
            function () {

                loginGateScreen.classList.add(
                    "hidden"
                );

                securityMonitor.style.display =
                    "block";

            }
        );

    }


    // =====================================================
    // LEVEL SELECTION
    // =====================================================

    const levelGrid =
        document.getElementById(
            "levelGrid"
        );

    const selectedLevelText =
        document.getElementById(
            "selectedLevelText"
        );

    const confirmLevelBtn =
        document.getElementById(
            "confirmLevelBtn"
        );


    let selectedLevel = null;


    // =====================================================
    // LEVEL NAMES
    // =====================================================

    function getLevelName(level) {

        const names = {

            1: "QUARANTINE HOSPITAL",

            2: "FLOODED SUBWAY",

            3: "SUBWAY LOCKDOWN",

            4: "ABANDONED WING",

            5: "BIOHAZARD SECTOR",

            6: "UNDERGROUND FACILITY",

            7: "MAINTENANCE VENTILATION",

            8: "RESEARCH LABORATORY",

            9: "OUTBREAK CORE",

            10: "FINAL EXTRACTION"

        };


        return (
            names[level] ||
            "UNKNOWN SECTOR"
        );

    }


    // =====================================================
    // CREATE LEVEL SELECTION
    // =====================================================

    function createLevelSelection() {

        if (!levelGrid) {

            console.error(
                "LEVEL GRID NOT FOUND"
            );

            return;

        }


        levelGrid.innerHTML = "";


        const progress =
            getPlayerProgress();


        const currentLevel =
            Number(progress.currentLevel) || 1;


        const completedLevels =
            Array.isArray(
                progress.completedLevels
            )
                ? progress.completedLevels
                : [];


        selectedLevel = null;


        if (selectedLevelText) {

            selectedLevelText.textContent =
                "SELECT LEVEL";

        }


        for (
            let i = 1;
            i <= 10;
            i++
        ) {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "mapCard";


            card.dataset.level =
                String(i);


            const isCompleted =
                completedLevels.includes(i);


            const isUnlocked =
                i <= currentLevel;


            if (isCompleted) {

                card.classList.add(
                    "completed"
                );

            }


            if (!isUnlocked) {

                card.classList.add(
                    "locked"
                );

                card.disabled =
                    true;

            }


            card.innerHTML = `

                <div class="mapImage hospitalMap">

                    LEVEL ${String(i).padStart(2, "0")}

                </div>

                <strong>

                    ${getLevelName(i)}

                </strong>

                <small>

                    MISSION LEVEL
                    ${String(i).padStart(2, "0")}

                </small>

                <span class="mapStatus ${
                    !isUnlocked
                        ? "locked"
                        : ""
                }">

                    ${
                        isCompleted
                            ? "COMPLETED"
                            : isUnlocked
                                ? "AVAILABLE"
                                : "LOCKED"
                    }

                </span>

            `;


            // =================================================
            // LEVEL CLICK
            // =================================================

            if (isUnlocked) {

                card.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                "#levelGrid .mapCard"
                            )
                            .forEach(
                                function (item) {

                                    item.classList.remove(
                                        "selected"
                                    );

                                }
                            );


                        card.classList.add(
                            "selected"
                        );


                        selectedLevel =
                            i;


                        if (selectedLevelText) {

                            selectedLevelText.textContent =
                                "SELECTED: LEVEL " +
                                String(i).padStart(
                                    2,
                                    "0"
                                );

                        }

                    }
                );

            }


            levelGrid.appendChild(
                card
            );

        }


        console.log(
            "LEVEL SELECTION CREATED"
        );

    }


    // =====================================================
    // CONFIRM LEVEL
    // =====================================================

    if (confirmLevelBtn) {

        confirmLevelBtn.addEventListener(
            "click",
            function () {

                if (!selectedLevel) {

                    if (selectedLevelText) {

                        selectedLevelText.textContent =
                            "SELECT A LEVEL FIRST";

                    }

                    return;

                }


                const progress =
                    getPlayerProgress();


                progress.selectedLevel =
                    selectedLevel;


                savePlayerProgress(
                    progress
                );


                console.log(
                    "LEVEL SELECTED:",
                    selectedLevel
                );


                levelSelectScreen.classList.add(
                    "hidden"
                );


                loadoutScreen.classList.remove(
                    "hidden"
                );


                updateLoadoutScreen();

            }
        );

    }


    // =====================================================
    // LOADOUT
    // =====================================================

    const weaponCards =
        document.querySelectorAll(
            ".weaponCard"
        );


    const selectedWeaponText =
        document.getElementById(
            "selectedWeaponText"
        );


    let selectedWeapon =
        "pistol";


    // =====================================================
    // UPDATE LOADOUT
    // =====================================================

    function updateLoadoutScreen() {

        const progress =
            getPlayerProgress();


        selectedWeapon =
            progress.selectedWeapon ||
            "pistol";


        weaponCards.forEach(
            function (card) {

                card.classList.remove(
                    "selected"
                );


                if (
                    card.dataset.weapon ===
                    selectedWeapon
                ) {

                    card.classList.add(
                        "selected"
                    );

                }

            }
        );


        if (selectedWeaponText) {

            if (
                selectedWeapon ===
                "pistol"
            ) {

                selectedWeaponText.textContent =
                    "M9 PISTOL";

            } else if (
                selectedWeapon ===
                "rifle"
            ) {

                selectedWeaponText.textContent =
                    "ASSAULT RIFLE";

            } else if (
                selectedWeapon ===
                "shotgun"
            ) {

                selectedWeaponText.textContent =
                    "TACTICAL SHOTGUN";

            }

        }

    }


    // =====================================================
    // WEAPON SELECTION
    // =====================================================

    weaponCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const status =
                        card.querySelector(
                            "span"
                        );


                    if (
                        status &&
                        status.textContent
                            .toUpperCase()
                            .includes("LOCKED")
                    ) {

                        return;

                    }


                    weaponCards.forEach(
                        function (item) {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    card.classList.add(
                        "selected"
                    );


                    selectedWeapon =
                        card.dataset.weapon;


                    if (selectedWeaponText) {

                        if (
                            selectedWeapon ===
                            "pistol"
                        ) {

                            selectedWeaponText.textContent =
                                "M9 PISTOL";

                        }

                    }


                    console.log(
                        "WEAPON SELECTED:",
                        selectedWeapon
                    );

                }
            );

        }
    );


    // =====================================================
    // DEPLOY SURVIVOR
    // =====================================================

    const deployAgentBtn =
        document.getElementById(
            "deployAgentBtn"
        );


    if (deployAgentBtn) {

        deployAgentBtn.addEventListener(
            "click",
            function () {

                const progress =
                    getPlayerProgress();


                const level =
                    Number(
                        progress.selectedLevel ||
                        progress.currentLevel ||
                        1
                    );


                progress.selectedLevel =
                    level;


                progress.selectedWeapon =
                    selectedWeapon;


                progress.selectedMap =
                    "hospital";


                savePlayerProgress(
                    progress
                );


                console.log(
                    "DEPLOYING LEVEL:",
                    level
                );


                console.log(
                    "WEAPON:",
                    selectedWeapon
                );


                const levelPages = {

                    1: "level1.html",

                    2: "level2.html",

                    3: "level3.html",

                    4: "level4.html",

                    5: "level5.html",

                    6: "level6.html",

                    7: "level7.html",

                    8: "level8.html",

                    9: "level9.html",

                    10: "level10.html"

                };


                const targetPage =
                    levelPages[level];


                if (!targetPage) {

                    console.error(
                        "INVALID LEVEL:",
                        level
                    );

                    return;

                }


                window.location.href =
                    targetPage;

            }
        );

    }


    // =====================================================
    // CONFIGURATION
    // =====================================================

    const settingsBtn =
        document.getElementById(
            "settingsBtn"
        );


    const configurationScreen =
        document.getElementById(
            "configurationScreen"
        );


    const configurationBackBtn =
        document.getElementById(
            "configurationBackBtn"
        );


    if (
        settingsBtn &&
        configurationScreen
    ) {

        settingsBtn.addEventListener(
            "click",
            function () {

                securityMonitor.style.display =
                    "none";

                configurationScreen.classList.remove(
                    "hidden"
                );

            }
        );

    }


    if (
        configurationBackBtn &&
        configurationScreen
    ) {

        configurationBackBtn.addEventListener(
            "click",
            function () {

                configurationScreen.classList.add(
                    "hidden"
                );

                securityMonitor.style.display =
                    "block";

            }
        );

    }


    // =====================================================
    // SYSTEM SPEC
    // =====================================================

    const loadoutBtn =
        document.getElementById(
            "loadoutBtn"
        );


    const systemSpecScreen =
        document.getElementById(
            "systemSpecScreen"
        );


    const systemSpecBackBtn =
        document.getElementById(
            "systemSpecBackBtn"
        );


    if (
        loadoutBtn &&
        systemSpecScreen
    ) {

        loadoutBtn.addEventListener(
            "click",
            function () {

                securityMonitor.style.display =
                    "none";


                systemSpecScreen.classList.remove(
                    "hidden"
                );


                updateSystemSpec();

            }
        );

    }


    function updateSystemSpec() {

        const progress =
            getPlayerProgress();


        const specWeapon =
            document.getElementById(
                "specWeapon"
            );


        const specMap =
            document.getElementById(
                "specMap"
            );


        const specLevel =
            document.getElementById(
                "specLevel"
            );


        const specXP =
            document.getElementById(
                "specXP"
            );


        const specWeapons =
            document.getElementById(
                "specWeapons"
            );


        const specMaps =
            document.getElementById(
                "specMaps"
            );


        if (specWeapon) {

            if (
                progress.selectedWeapon ===
                "pistol"
            ) {

                specWeapon.textContent =
                    "M9 PISTOL";

            } else if (
                progress.selectedWeapon ===
                "rifle"
            ) {

                specWeapon.textContent =
                    "ASSAULT RIFLE";

            } else if (
                progress.selectedWeapon ===
                "shotgun"
            ) {

                specWeapon.textContent =
                    "TACTICAL SHOTGUN";

            }

        }


        if (specMap) {

            specMap.textContent =
                "QUARANTINE HOSPITAL";

        }


        if (specLevel) {

            specLevel.textContent =
                "LEVEL " +
                (
                    progress.currentLevel ||
                    1
                );

        }


        if (specXP) {

            specXP.textContent =
                (
                    progress.xp ||
                    0
                ) +
                " XP";

        }


        if (specWeapons) {

            specWeapons.textContent =
                (
                    progress.unlockedWeapons ||
                    ["pistol"]
                ).length;

        }


        if (specMaps) {

            specMaps.textContent =
                (
                    progress.unlockedMaps ||
                    ["hospital"]
                ).length;

        }

    }


    if (
        systemSpecBackBtn &&
        systemSpecScreen
    ) {

        systemSpecBackBtn.addEventListener(
            "click",
            function () {

                systemSpecScreen.classList.add(
                    "hidden"
                );

                securityMonitor.style.display =
                    "block";

            }
        );

    }


    // =====================================================
    // SHUT DOWN
    // =====================================================

    const quitBtn =
        document.getElementById(
            "quitBtn"
        );


    const shutdownScreen =
        document.getElementById(
            "shutdownScreen"
        );


    const shutdownBackBtn =
        document.getElementById(
            "shutdownBackBtn"
        );


    if (
        quitBtn &&
        shutdownScreen
    ) {

        quitBtn.addEventListener(
            "click",
            function () {

                securityMonitor.style.display =
                    "none";

                shutdownScreen.classList.remove(
                    "hidden"
                );

            }
        );

    }


    if (
        shutdownBackBtn &&
        shutdownScreen
    ) {

        shutdownBackBtn.addEventListener(
            "click",
            function () {

                shutdownScreen.classList.add(
                    "hidden"
                );

                securityMonitor.style.display =
                    "block";

            }
        );

    }


    // =====================================================
    // STARTUP
    // =====================================================

    console.log(
        "MAIN MENU SYSTEM INITIALIZED"
    );

});
