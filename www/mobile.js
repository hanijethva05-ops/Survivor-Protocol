// ==========================================
// MOBILE CONTROLS
// ZOMBIE SURVIVAL
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const joystick =
        document.getElementById("mobileJoystick");

    const knob =
        document.getElementById("joystickKnob");

    const fireBtn =
        document.getElementById("mobileFireBtn");

    const reloadBtn =
        document.getElementById("mobileReloadBtn");

    const interactBtn =
        document.getElementById("mobileInteractBtn");

    const sprintBtn =
        document.getElementById("mobileSprintBtn");

    const flashBtn =
        document.getElementById("mobileFlashBtn");


    // ==========================================
    // ONLY RUN ON MOBILE
    // ==========================================

    if (!joystick) {
        return;
    }


    // ==========================================
    // KEY SIMULATOR
    // ==========================================

    function pressKey(key) {

        document.dispatchEvent(
            new KeyboardEvent(
                "keydown",
                {
                    key: key,
                    bubbles: true
                }
            )
        );

    }


    function releaseKey(key) {

        document.dispatchEvent(
            new KeyboardEvent(
                "keyup",
                {
                    key: key,
                    bubbles: true
                }
            )
        );

    }


    // ==========================================
    // JOYSTICK
    // ==========================================

    let joystickActive = false;

    let joystickPointerId = null;


    function resetJoystick() {

        joystickActive = false;

        joystickPointerId = null;

        knob.style.left = "50%";
        knob.style.top = "50%";

        releaseKey("w");
        releaseKey("a");
        releaseKey("s");
        releaseKey("d");

    }


    function updateJoystick(clientX, clientY) {

        const rect =
            joystick.getBoundingClientRect();


        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;


        let dx =
            clientX - centerX;

        let dy =
            clientY - centerY;


        const maxDistance =
            rect.width / 2 - 28;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance > maxDistance) {

            dx =
                (dx / distance) *
                maxDistance;

            dy =
                (dy / distance) *
                maxDistance;

        }


        knob.style.left =
            `calc(50% + ${dx}px)`;

        knob.style.top =
            `calc(50% + ${dy}px)`;


        // Release all directions first

        releaseKey("w");
        releaseKey("a");
        releaseKey("s");
        releaseKey("d");


        const threshold = 15;


        // UP

        if (dy < -threshold) {
            pressKey("w");
        }


        // DOWN

        if (dy > threshold) {
            pressKey("s");
        }


        // LEFT

        if (dx < -threshold) {
            pressKey("a");
        }


        // RIGHT

        if (dx > threshold) {
            pressKey("d");
        }

    }


    // ==========================================
    // JOYSTICK TOUCH
    // ==========================================

    joystick.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            joystickActive = true;

            joystickPointerId =
                event.pointerId;

            joystick.setPointerCapture(
                event.pointerId
            );

            updateJoystick(
                event.clientX,
                event.clientY
            );

        }
    );


    joystick.addEventListener(
        "pointermove",
        function (event) {

            if (!joystickActive) {
                return;
            }

            if (
                event.pointerId !==
                joystickPointerId
            ) {
                return;
            }

            event.preventDefault();

            updateJoystick(
                event.clientX,
                event.clientY
            );

        }
    );


    joystick.addEventListener(
        "pointerup",
        function (event) {

            if (
                event.pointerId ===
                joystickPointerId
            ) {

                resetJoystick();

            }

        }
    );


    joystick.addEventListener(
        "pointercancel",
        function () {

            resetJoystick();

        }
    );


    // ==========================================
    // FIRE
    // ==========================================

    function fireWeapon() {

        document.dispatchEvent(
            new MouseEvent(
                "mousedown",
                {
                    bubbles: true,
                    button: 0
                }
            )
        );

    }


    fireBtn.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            fireWeapon();

        }
    );


    // ==========================================
    // RELOAD
    // ==========================================

    reloadBtn.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            pressKey("r");

            setTimeout(
                function () {

                    releaseKey("r");

                },
                50
            );

        }
    );


    // ==========================================
    // INTERACT
    // ==========================================

    interactBtn.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            pressKey("e");

            setTimeout(
                function () {

                    releaseKey("e");

                },
                50
            );

        }
    );


    // ==========================================
    // SPRINT
    // ==========================================

    sprintBtn.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            pressKey("Shift");

        }
    );


    sprintBtn.addEventListener(
        "pointerup",
        function () {

            releaseKey("Shift");

        }
    );


    sprintBtn.addEventListener(
        "pointercancel",
        function () {

            releaseKey("Shift");

        }
    );


    // ==========================================
    // FLASHLIGHT
    // ==========================================

    flashBtn.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            pressKey("f");

            setTimeout(
                function () {

                    releaseKey("f");

                },
                50
            );

        }
    );


    // ==========================================
    // PREVENT PAGE SCROLL
    // ==========================================

    document.addEventListener(
        "touchmove",
        function (event) {

            if (
                event.target.closest(
                    "#mobileControls"
                )
            ) {

                event.preventDefault();

            }

        },
        {
            passive: false
        }
    );


    // ==========================================
    // SAFETY
    // ==========================================

    window.addEventListener(
        "blur",
        function () {

            resetJoystick();

            releaseKey("Shift");

        }
    );


    console.log(
        "MOBILE CONTROLS READY"
    );

});