// =========================================================
// LOADOUT SYSTEM
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const weaponCards =
        document.querySelectorAll(".weaponCard");

    const weaponSlots =
        document.querySelectorAll(".weaponSlot");

    const primarySlot =
        document.getElementById("primarySlot");

    const secondarySlot =
        document.getElementById("secondarySlot");

    const utilitySlot =
        document.getElementById("utilitySlot");

    const blueprintName =
        document.getElementById("blueprintName");

    const blueprintWeapon =
        document.querySelector(".blueprintWeapon");

    const recoil =
        document.getElementById("recoil");

    const caliber =
        document.getElementById("caliber");

    const warningText =
        document.getElementById("warningText");

    const statusPrimary =
        document.getElementById("statusPrimary");

    const statusSecondary =
        document.getElementById("statusSecondary");

    const statusUtility =
        document.getElementById("statusUtility");

    const continueBtn =
        document.getElementById("continueBtn");

    const backBtn =
        document.getElementById("backBtn");

    const modificationBtn =
        document.getElementById("modificationBtn");


    // =====================================================
    // CURRENT LOADOUT
    // =====================================================

    let selectedPrimary = null;
    let selectedSecondary = null;
    let selectedUtility = null;


    // =====================================================
    // WEAPON DATA
    // =====================================================

    const weapons = {

        "M4 RIFLE": {

            slot: "primary",

            blueprint: "M4",

            damage: 4,

            rpm: 6,

            recoil: "LOW",

            caliber: "5.56MM"

        },


        "COMBAT SHOTGUN": {

            slot: "primary",

            blueprint: "SHOTGUN",

            damage: 7,

            rpm: 2,

            recoil: "HIGH",

            caliber: "12 GAUGE"

        },


        "M9 PISTOL": {

            slot: "secondary",

            blueprint: "M9",

            damage: 3,

            rpm: 5,

            recoil: "LOW",

            caliber: "9MM"

        },


        "REVOLVER": {

            slot: "secondary",

            blueprint: "357",

            damage: 6,

            rpm: 2,

            recoil: "HIGH",

            caliber: ".357"

        },


        "MACHETE": {

            slot: "utility",

            blueprint: "MACHETE",

            damage: 6,

            rpm: 1,

            recoil: "NONE",

            caliber: "MELEE"

        }

    };


    // =====================================================
    // SHOW WEAPON
    // =====================================================

    function showWeapon(weaponName) {

        const weapon =
            weapons[weaponName];

        if (!weapon) {
            return;
        }


        // BLUEPRINT NAME

        blueprintName.textContent =
            "BLUEPRINT // " +
            weaponName;


        // BLUEPRINT

        blueprintWeapon.textContent =
            weapon.blueprint;


        // STATS

        recoil.textContent =
            weapon.recoil;

        caliber.textContent =
            weapon.caliber;


        // PERFORMANCE BARS

        createBars(
            "damageBar",
            weapon.damage
        );

        createBars(
            "rpmBar",
            weapon.rpm
        );

    }


    // =====================================================
    // PERFORMANCE BARS
    // =====================================================

    function createBars(
        elementId,
        amount
    ) {

        const element =
            document.getElementById(
                elementId
            );

        if (!element) {
            return;
        }


        element.innerHTML = "";


        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const bar =
                document.createElement("span");


            if (i < amount) {

                bar.classList.add(
                    "filled"
                );

            }


            element.appendChild(bar);

        }

    }


    // =====================================================
    // PUT WEAPON INTO SLOT
    // =====================================================

    function selectWeapon(
        weaponName
    ) {

        const weapon =
            weapons[weaponName];

        if (!weapon) {
            return;
        }


        // ================================================
        // PRIMARY
        // ================================================

        if (
            weapon.slot ===
            "primary"
        ) {

            selectedPrimary =
                weaponName;

            primarySlot.querySelector(
                ".slotWeapon"
            ).textContent =
                weaponName;

            statusPrimary.textContent =
                weaponName;

            primarySlot.classList.add(
                "active"
            );

        }


        // ================================================
        // SECONDARY
        // ================================================

        if (
            weapon.slot ===
            "secondary"
        ) {

            selectedSecondary =
                weaponName;

            secondarySlot.querySelector(
                ".slotWeapon"
            ).textContent =
                weaponName;

            statusSecondary.textContent =
                weaponName;

            secondarySlot.classList.add(
                "active"
            );

        }


        // ================================================
        // UTILITY
        // ================================================

        if (
            weapon.slot ===
            "utility"
        ) {

            selectedUtility =
                weaponName;

            utilitySlot.querySelector(
                ".slotWeapon"
            ).textContent =
                weaponName;

            statusUtility.textContent =
                weaponName;

            utilitySlot.classList.add(
                "active"
            );

        }


        // SELECTED CARD

        weaponCards.forEach(
            function (card) {

                card.classList.remove(
                    "selected"
                );

            }
        );


        const selectedCard =
            document.querySelector(
                '[data-weapon="' +
                weaponName +
                '"]'
            );


        if (selectedCard) {

            selectedCard.classList.add(
                "selected"
            );

        }


        // SUCCESS MESSAGE

        warningText.textContent =
            "> ASSET LOADED: " +
            weapon.caliber;

        warningText.classList.add(
            "success"
        );


        // SHOW BLUEPRINT

        showWeapon(
            weaponName
        );

    }


    // =====================================================
    // WEAPON CARD CLICK
    // =====================================================

    weaponCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    // LOCKED WEAPON

                    if (
                        card.classList.contains(
                            "locked"
                        )
                    ) {

                        warningText.textContent =
                            "> ACCESS DENIED // LEVEL 10 REQUIRED";

                        warningText.classList.remove(
                            "success"
                        );

                        warningText.classList.add(
                            "warning"
                        );

                        return;

                    }


                    const weaponName =
                        card.dataset.weapon;


                    selectWeapon(
                        weaponName
                    );

                }
            );

        }
    );


    // =====================================================
    // SLOT CLICK
    // =====================================================

    weaponSlots.forEach(
        function (slot) {

            slot.addEventListener(
                "click",
                function () {

                    const weaponName =
                        slot.querySelector(
                            ".slotWeapon"
                        ).textContent;


                    if (
                        weaponName !==
                        "EMPTY"
                    ) {

                        showWeapon(
                            weaponName
                        );

                    }

                }
            );

        }
    );


    // =====================================================
    // MODIFICATION
    // =====================================================

    modificationBtn.addEventListener(
        "click",
        function () {

            let selectedWeapon =

                selectedPrimary ||
                selectedSecondary ||
                selectedUtility;


            if (!selectedWeapon) {

                warningText.textContent =
                    "> NO ASSET SELECTED // CALIBRATION ABORTED";

                warningText.classList.remove(
                    "success"
                );

                warningText.classList.add(
                    "warning"
                );

                return;

            }


            warningText.textContent =
                "> CALIBRATION COMPLETE // ATTACHMENT OPTIMIZED";

            warningText.classList.remove(
                "warning"
            );

            warningText.classList.add(
                "success"
            );

        }
    );


    // =====================================================
    // CONTINUE
    // =====================================================

    continueBtn.addEventListener(
        "click",
        function () {

            if (!selectedPrimary) {

                warningText.textContent =
                    "> WARNING // SELECT A PRIMARY ASSET FIRST";

                warningText.classList.remove(
                    "success"
                );

                warningText.classList.add(
                    "warning"
                );

                return;

            }


            // SAVE LOADOUT

            localStorage.setItem(
                "selectedPrimary",
                selectedPrimary
            );

            localStorage.setItem(
                "selectedSecondary",
                selectedSecondary || ""
            );

            localStorage.setItem(
                "selectedUtility",
                selectedUtility || ""
            );


            warningText.textContent =
                "> LOADOUT CONFIRMED // INITIALIZING SURVIVAL SYSTEM";


            // NEXT SCREEN

            setTimeout(
                function () {

                    window.location.href =
                        "game.html";

                },
                700
            );

        }
    );


    // =====================================================
    // BACK
    // =====================================================

    backBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "survivor.html";

        }
    );


    // =====================================================
    // INITIAL WEAPON
    // =====================================================

    showWeapon(
        "M4 RIFLE"
    );

});

// ==========================================
// CONTINUE TO LEVEL SELECT
// ==========================================

const continueBtn = document.getElementById("continueBtn");

if (continueBtn) {

    continueBtn.addEventListener("click", function () {

        // Check if a primary weapon was selected
        const primarySlot =
            document.getElementById("primarySlot");

        const selectedWeapon =
            primarySlot
                ? primarySlot.querySelector(".slotWeapon")
                : null;

        if (
            !selectedWeapon ||
            selectedWeapon.textContent.trim() === "EMPTY"
        ) {

            alert("SELECT A PRIMARY WEAPON FIRST");
            return;

        }

        // Go to Level Select
        window.location.href = "level-select.html";

    });

}