/* =========================================================
   ZOMBIE SURVIVAL - SETTINGS SYSTEM
   settings.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const configurationScreen =
        document.getElementById("configurationScreen");

    const cameraToggleBtn =
        document.getElementById("cameraToggleBtn");

    const scanlineToggleBtn =
        document.getElementById("scanlineToggleBtn");

    const staticToggleBtn =
        document.getElementById("staticToggleBtn");

    const configurationBackBtn =
        document.getElementById("configurationBackBtn");

    const cameraScreen =
        document.getElementById("cameraScreen");

    const signalLost =
        document.getElementById("signalLost");

    const scanlines =
        document.getElementById("scanlines");

    const staticEffect =
        document.getElementById("static");


    /* =====================================================
       SETTINGS STATE
    ===================================================== */

    let settings = {
        camera: true,
        scanlines: true,
        static: true
    };


    /* =====================================================
       LOAD SETTINGS
    ===================================================== */

    const savedSettings =
        localStorage.getItem("zombieSettings");

    if (savedSettings) {

        try {

            settings = {
                ...settings,
                ...JSON.parse(savedSettings)
            };

        } catch (error) {

            console.log(
                "Could not load saved settings."
            );

        }

    }


    /* =====================================================
       SAVE SETTINGS
    ===================================================== */

    function saveSettings() {

        localStorage.setItem(
            "zombieSettings",
            JSON.stringify(settings)
        );

    }


    /* =====================================================
       CAMERA
    ===================================================== */

    function updateCamera() {

        if (!cameraScreen || !signalLost) {
            return;
        }

        if (settings.camera) {

            cameraScreen.style.display = "block";

            signalLost.style.display = "none";

            if (cameraToggleBtn) {
                cameraToggleBtn.textContent = "ON";
            }

            console.log("CAMERA FEED: ON");

        } else {

            cameraScreen.style.display = "block";

            signalLost.style.display = "flex";

            if (cameraToggleBtn) {
                cameraToggleBtn.textContent = "OFF";
            }

            console.log("CAMERA FEED: OFF");

        }

    }


    /* =====================================================
       SCANLINES
    ===================================================== */

    function updateScanlines() {

        if (!scanlines) {
            return;
        }

        if (settings.scanlines) {

            scanlines.style.visibility = "visible";

            scanlines.classList.remove(
                "settings-off"
            );

            if (scanlineToggleBtn) {
                scanlineToggleBtn.textContent = "ON";
            }

            console.log("SCANLINES: ON");

        } else {

            scanlines.style.visibility = "hidden";

            scanlines.classList.add(
                "settings-off"
            );

            if (scanlineToggleBtn) {
                scanlineToggleBtn.textContent = "OFF";
            }

            console.log("SCANLINES: OFF");

        }

    }


    /* =====================================================
       CRT STATIC
    ===================================================== */

    function updateStatic() {

        if (!staticEffect) {
            return;
        }

        if (settings.static) {

            staticEffect.style.visibility = "visible";

            staticEffect.classList.remove(
                "settings-off"
            );

            if (staticToggleBtn) {
                staticToggleBtn.textContent = "ON";
            }

            console.log("CRT STATIC: ON");

        } else {

            staticEffect.style.visibility = "hidden";

            staticEffect.classList.add(
                "settings-off"
            );

            if (staticToggleBtn) {
                staticToggleBtn.textContent = "OFF";
            }

            console.log("CRT STATIC: OFF");

        }

    }


    /* =====================================================
       UPDATE ALL
    ===================================================== */

    function updateAllSettings() {

        updateCamera();
        updateScanlines();
        updateStatic();

        saveSettings();

        /* Make settings available globally */
        window.gameSettings = settings;

        /* Notify other scripts */
        window.dispatchEvent(
            new Event("settingsChanged")
        );

    }


    /* =====================================================
       CAMERA BUTTON
    ===================================================== */

    if (cameraToggleBtn) {

        cameraToggleBtn.addEventListener(
            "click",
            () => {

                settings.camera =
                    !settings.camera;

                updateAllSettings();

            }
        );

    }


    /* =====================================================
       SCANLINE BUTTON
    ===================================================== */

    if (scanlineToggleBtn) {

        scanlineToggleBtn.addEventListener(
            "click",
            () => {

                settings.scanlines =
                    !settings.scanlines;

                updateAllSettings();

            }
        );

    }


    /* =====================================================
       STATIC BUTTON
    ===================================================== */

    if (staticToggleBtn) {

        staticToggleBtn.addEventListener(
            "click",
            () => {

                settings.static =
                    !settings.static;

                updateAllSettings();

            }
        );

    }


    

   


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateAllSettings()

});