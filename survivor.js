// =========================
// SURVIVOR DATABASE SYSTEM
// =========================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // =========================
        // ELEMENTS
        // =========================

        const cards =
            document.querySelectorAll(
                ".survivorCard"
            );

        const mugshotCharacter =
            document.getElementById(
                "mugshotCharacter"
            );

        const statusText =
            document.getElementById(
                "statusText"
            );

        const locationText =
            document.getElementById(
                "locationText"
            );

        const nameText =
            document.getElementById(
                "nameText"
            );

        const specialtyText =
            document.getElementById(
                "specialtyText"
            );

        const clearanceText =
            document.getElementById(
                "clearanceText"
            );

        const bioText =
            document.getElementById(
                "bioText"
            );

        const selectBtn =
            document.getElementById(
                "selectBtn"
            );

        const backBtn =
            document.getElementById(
                "backBtn"
            );

        const terminalStatus =
            document.getElementById(
                "terminalStatus"
            );

        const fingerprint =
            document.getElementById(
                "fingerprint"
            );


        // =========================
        // SURVIVOR DATA
        // =========================

        const survivors = [

            {
                name: "SURVIVOR 01",

                character: "👤",

                status: "SURVIVED",

                location: "SECTOR 4",

                specialty: "COMBAT EXPERT",

                clearance: "LEVEL 01",

                bio:
                    "Former emergency response operative. Highly trained in close combat and firearm handling. Last confirmed alive during the Sector 4 evacuation."
            },


            {
                name: "SURVIVOR 02",

                character: "👨",

                status: "SURVIVED",

                location: "HOSPITAL WING B",

                specialty: "MEDIC",

                clearance: "LEVEL 01",

                bio:
                    "Emergency medical specialist assigned to the hospital response unit. Capable of treating injuries and stabilizing wounded survivors."
            },


            {
                name: "SURVIVOR 03",

                character: "👩",

                status: "MISSING",

                location: "BASEMENT SECTOR",

                specialty: "TECH SPECIALIST",

                clearance: "LEVEL 02",

                bio:
                    "Security systems technician. Last transmission originated from the basement escape route before communication was lost."
            }

        ];


        let selectedSurvivor = 0;


        // =========================
        // TYPEWRITER EFFECT
        // =========================

        function typeText(
            element,
            text
        ) {

            element.textContent = "";

            let index = 0;


            const typing =
                setInterval(
                    function () {

                        if (
                            index >=
                            text.length
                        ) {

                            clearInterval(
                                typing
                            );

                            return;

                        }


                        element.textContent +=
                            text.charAt(index);

                        index++;

                    },
                    18
                );

        }


        // =========================
        // FINGERPRINT SCAN
        // =========================

        function fingerprintScan() {

            fingerprint.classList.remove(
                "fingerprintActive"
            );

            void fingerprint.offsetWidth;

            fingerprint.classList.add(
                "fingerprintActive"
            );

        }


        // =========================
        // LOAD SURVIVOR
        // =========================

        function loadSurvivor(index) {

            selectedSurvivor =
                index;


            const survivor =
                survivors[index];


            // =========================
            // ACTIVE CARD
            // =========================

            cards.forEach(
                function (
                    card,
                    cardIndex
                ) {

                    card.classList.remove(
                        "active"
                    );


                    if (
                        cardIndex ===
                        index
                    ) {

                        card.classList.add(
                            "active"
                        );

                    }

                }
            );


            // =========================
            // PROFILE DATA
            // =========================

            mugshotCharacter.textContent =
                survivor.character;


            nameText.textContent =
                survivor.name;


            statusText.textContent =
                survivor.status;


            locationText.textContent =
                survivor.location;


            specialtyText.textContent =
                survivor.specialty;


            clearanceText.textContent =
                survivor.clearance;


            // =========================
            // STATUS COLOR
            // =========================

            if (
                survivor.status ===
                "MISSING"
            ) {

                statusText.style.color =
                    "#ff5555";

            }

            else {

                statusText.style.color =
                    "#62ff82";

            }


            // =========================
            // FINGERPRINT
            // =========================

            fingerprintScan();


            // =========================
            // TERMINAL
            // =========================

            terminalStatus.textContent =
                "> SCANNING SUBJECT " +
                (index + 1) +
                " // DATABASE MATCH FOUND";


            // =========================
            // TYPEWRITER BIO
            // =========================

            typeText(
                bioText,
                survivor.bio
            );

        }


        // =========================
        // CARD CLICK
        // =========================

        cards.forEach(
            function (
                card,
                index
            ) {

                card.addEventListener(
                    "click",
                    function () {

                        loadSurvivor(
                            index
                        );

                    }
                );

            }
        );


        // =========================
        // SELECT SURVIVOR
        // =========================

        selectBtn.addEventListener(
            "click",
            function () {

                const survivor =
                    survivors[
                        selectedSurvivor
                    ];


                // SAVE SELECTION

                localStorage.setItem(
                    "selectedSurvivor",
                    selectedSurvivor
                );


                localStorage.setItem(
                    "survivorClass",
                    survivor.specialty
                );


                // BUTTON EFFECT

                selectBtn.textContent =
                    "✓ SURVIVOR SELECTED";


                terminalStatus.textContent =
                    "> " +
                    survivor.name +
                    " // PROFILE AUTHORIZED";


                // NEXT SCREEN

                setTimeout(
                    function () {

                        window.location.href =
                            "loadout.html";

                    },
                    900
                );

            }
        );


        // =========================
        // BACK BUTTON
        // =========================

        backBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "main-menu.html";

            }
        );


        // =========================
        // INITIAL PROFILE
        // =========================

        loadSurvivor(0);

    }
);