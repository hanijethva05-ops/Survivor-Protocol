// =====================================================
// ZOMBIE SURVIVAL
// SURVIVOR PROFILE SYSTEM
// LEVEL 1 - 10
// =====================================================

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // PROFILE ELEMENTS
    // =====================================================

    const profilePanel =
        document.getElementById("survivorProfilePanel");

    const miniProfile =
        document.getElementById("survivorMiniProfile");

    const miniPlayerName =
        document.getElementById("miniPlayerName");

    const miniPlayerLevel =
        document.getElementById("miniPlayerLevel");

    const playerName =
        document.getElementById("playerName");

    const playerEmail =
        document.getElementById("playerEmail");

    const playerID =
        document.getElementById("playerID");

    const playerLevel =
        document.getElementById("playerLevel");

    const profileLocation =
        document.getElementById("profileLocation");

    const playerXP =
        document.getElementById("playerXP");

    const profileKills =
        document.getElementById("profileKills");

    const profileItems =
        document.getElementById("profileItems");

    const xpLevel =
        document.getElementById("xpLevel");

    const profileXPFill =
        document.getElementById("profileXPFill");

    const resumeBtn =
        document.getElementById("resumeGameBtn");

    const returnHQBtn =
        document.getElementById("profileReturnHQBtn");


    // =====================================================
    // PROFILE PANEL CHECK
    // =====================================================

    if (!profilePanel) {

        console.warn(
            "SURVIVOR PROFILE PANEL NOT FOUND"
        );

        return;
    }


    // =====================================================
    // GOOGLE USER
    // =====================================================

    let googleUser = null;

    try {

        googleUser =
            JSON.parse(
                localStorage.getItem("googleUser")
            );

    } catch (error) {

        googleUser = null;

    }


    // =====================================================
    // PLAYER INFORMATION
    // =====================================================

    let survivorName =
        "GUEST SURVIVOR";

    let survivorEmail =
        "GUEST ACCESS";


    if (googleUser) {

        survivorName =
            googleUser.name ||
            googleUser.given_name ||
            "SURVIVOR";

        survivorEmail =
            googleUser.email ||
            "GOOGLE ACCOUNT";

    }


    // =====================================================
    // SURVIVOR ID
    // =====================================================

    let survivorID =
        localStorage.getItem("survivorID");


    if (!survivorID) {

        const letters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        let randomLetters = "";


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            randomLetters +=
                letters[
                    Math.floor(
                        Math.random() *
                        letters.length
                    )
                ];

        }


        const randomNumber =
            Math.floor(
                1000 +
                Math.random() * 9000
            );


        survivorID =
            "ZS-" +
            randomLetters +
            randomNumber;


        localStorage.setItem(
            "survivorID",
            survivorID
        );

    }


    // =====================================================
    // LEVEL LOCATIONS
    // =====================================================

    const levelLocations = {

        1:
            "QUARANTINE HOSPITAL",

        2:
            "SECTOR_02 // SUBWAY",

        3:
            "SECTOR_03 // INFECTED DISTRICT",

        4:
            "SECTOR_04 // RESEARCH WING",

        5:
            "SECTOR_05 // BIO LAB",

        6:
            "SECTOR_06 // SERVER CORE",

        7:
            "SECTOR_07 // MAINTENANCE VENTILATION",

        8:
            "SECTOR_08 // SECURITY COMPLEX",

        9:
            "SECTOR_09 // EVACUATION ZONE",

        10:
            "SECTOR_10 // FINAL OUTBREAK"

    };


    // =====================================================
    // DETECT CURRENT LEVEL FROM HTML PAGE
    // =====================================================

    const pageName =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    let detectedLevel = null;


    /*
       Example:

       level7.html
       level8.html
       level9.html
       level10.html
    */

    const levelMatch =
        pageName.match(
            /^level(\d+)\.html$/
        );


    if (levelMatch) {

        detectedLevel =
            parseInt(
                levelMatch[1],
                10
            );

    }


    // =====================================================
    // CURRENT LEVEL
    // =====================================================

    "use strict";

let level = 1;

const currentPage =
    window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


/* =========================================
   DETECT CURRENT LEVEL
========================================= */

if (currentPage.includes("level10")) {

    level = 10;

}
else if (currentPage.includes("level9")) {

    level = 9;

}
else if (currentPage.includes("level8")) {

    level = 8;

}
else if (currentPage.includes("level7")) {

    level = 7;

}
else if (currentPage.includes("level6")) {

    level = 6;

}
else if (currentPage.includes("level5")) {

    level = 5;

}
else if (currentPage.includes("level4")) {

    level = 4;

}
else if (currentPage.includes("level3")) {

    level = 3;

}
else if (currentPage.includes("level2")) {

    level = 2;

}
else if (currentPage.includes("level1")) {

    level = 1;

}
else {

    level = parseInt(
        localStorage.getItem("currentLevel") || "1",
        10
    );

}


/* =========================================
   SAFETY
========================================= */

if (!Number.isFinite(level)) {
    level = 1;
}

level = Math.max(
    1,
    Math.min(10, level)
);


/* =========================================
   SAVE CURRENT LEVEL
========================================= */

localStorage.setItem(
    "currentLevel",
    String(level)
);


/* =========================================
   DEBUG
========================================= */

console.log(
    "CURRENT PAGE:",
    currentPage
);

console.log(
    "CURRENT LEVEL:",
    level
);

    // =====================================================
    // LEVEL SAFETY
    // =====================================================

    if (isNaN(level)) {

        level = 1;

    }


    level =
        Math.max(
            1,
            Math.min(
                10,
                level
            )
        );


    // =====================================================
    // SAVE CURRENT LEVEL
    // =====================================================

    localStorage.setItem(
        "currentLevel",
        String(level)
    );


    // =====================================================
    // LEVEL TEXT
    // =====================================================

    const levelText =
        String(level).padStart(
            2,
            "0"
        );


    // =====================================================
    // CURRENT LOCATION
    // =====================================================

    /*
       Location ALWAYS follows
       the current level.
    */

    const location =
        levelLocations[level] ||
        "UNKNOWN SECTOR";


    localStorage.setItem(
        "currentLocation",
        location
    );


    // =====================================================
    // PLAYER XP
    // =====================================================

    let xp =
        parseInt(
            localStorage.getItem(
                "playerXP"
            ) || "0",
            10
        );


    if (isNaN(xp)) {

        xp = 0;

    }


    // =====================================================
    // ZOMBIES KILLED
    // =====================================================

    let kills =
        parseInt(
            localStorage.getItem(
                "zombiesKilled"
            ) || "0",
            10
        );


    if (isNaN(kills)) {

        kills = 0;

    }


    // =====================================================
    // ITEMS FOUND
    // =====================================================

    let items =
        parseInt(
            localStorage.getItem(
                "itemsFound"
            ) || "0",
            10
        );


    if (isNaN(items)) {

        items = 0;

    }


    // =====================================================
    // UPDATE MINI PROFILE
    // =====================================================

    if (miniPlayerName) {

        miniPlayerName.textContent =
            survivorName.toUpperCase();

    }


    if (miniPlayerLevel) {

        miniPlayerLevel.textContent =
            levelText;

    }


    // =====================================================
    // UPDATE FULL PROFILE
    // =====================================================

    if (playerName) {

        playerName.textContent =
            survivorName.toUpperCase();

    }


    if (playerEmail) {

        playerEmail.textContent =
            survivorEmail.toUpperCase();

    }


    if (playerID) {

        playerID.textContent =
            survivorID;

    }


    if (playerLevel) {

        playerLevel.textContent =
            levelText;

    }


    if (profileLocation) {

        profileLocation.textContent =
            location;

    }


    if (playerXP) {

        playerXP.textContent =
            xp;

    }


    if (profileKills) {

        profileKills.textContent =
            kills;

    }


    if (profileItems) {

        profileItems.textContent =
            items;

    }


    if (xpLevel) {

        xpLevel.textContent =
            levelText;

    }


    // =====================================================
    // XP BAR
    // =====================================================

    if (profileXPFill) {

        const XP_PER_LEVEL =
            100;


        const xpInsideLevel =
            xp % XP_PER_LEVEL;


        const xpPercent =
            Math.min(
                100,
                (
                    xpInsideLevel /
                    XP_PER_LEVEL
                ) * 100
            );


        profileXPFill.style.width =
            xpPercent + "%";

    }


    // =====================================================
    // OPEN PROFILE
    // =====================================================

    function openProfile() {

        profilePanel.classList.add(
            "active"
        );


        profilePanel.style.display =
            "flex";


        profilePanel.style.position =
            "fixed";


        profilePanel.style.inset =
            "0";


        profilePanel.style.zIndex =
            "99999";


        console.log(
            "SURVIVOR PROFILE OPENED"
        );

    }


    // =====================================================
    // CLOSE PROFILE
    // =====================================================

    function closeProfile() {

        profilePanel.classList.remove(
            "active"
        );


        profilePanel.style.display =
            "none";


        console.log(
            "SURVIVOR PROFILE CLOSED"
        );

    }


    // =====================================================
    // MINI PROFILE CLICK
    // =====================================================

    if (miniProfile) {

        miniProfile.style.pointerEvents =
            "auto";


        miniProfile.style.cursor =
            "pointer";


        miniProfile.addEventListener(
            "click",
            function () {

                openProfile();

            }
        );

    }


    // =====================================================
    // RESUME BUTTON
    // =====================================================

    if (resumeBtn) {

        resumeBtn.addEventListener(
            "click",
            function () {

                closeProfile();

            }
        );

    }


    // =====================================================
    // RETURN TO HQ
    // =====================================================

    if (returnHQBtn) {

        returnHQBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "main-menu.html";

            }
        );

    }


    // =====================================================
    // ESC KEY
    // =====================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !== "Escape"
            ) {

                return;

            }


            if (
                profilePanel.classList.contains(
                    "active"
                )
            ) {

                closeProfile();

            } else {

                openProfile();

            }

        }
    );


    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
        "================================="
    );

    console.log(
        "SURVIVOR PROFILE SYSTEM READY"
    );

    console.log(
        "SURVIVOR:",
        survivorName
    );

    console.log(
        "ID:",
        survivorID
    );

    console.log(
        "LEVEL:",
        levelText
    );

    console.log(
        "LOCATION:",
        location
    );

    console.log(
        "XP:",
        xp
    );

    console.log(
        "KILLS:",
        kills
    );

    console.log(
        "ITEMS:",
        items
    );

    console.log(
        "================================="
    );

});