// =========================
// ENVIRONMENT SYSTEM
// =========================

function createEnvironment(gameArea) {

    if (!gameArea) {
        return;
    }


    // =========================
    // LEFT HOUSES
    // =========================

    createHouse(
        gameArea,
        15,
        30,
        "left"
    );

    createHouse(
        gameArea,
        15,
        190,
        "left"
    );

    createHouse(
        gameArea,
        15,
        350,
        "left"
    );


    // =========================
    // RIGHT HOUSES
    // =========================

    createHouse(
        gameArea,
        680,
        30,
        "right"
    );

    createHouse(
        gameArea,
        680,
        190,
        "right"
    );

    createHouse(
        gameArea,
        680,
        350,
        "right"
    );


    // =========================
    // STREET LIGHTS
    // =========================

    createStreetLight(
        gameArea,
        145,
        80
    );

    createStreetLight(
        gameArea,
        635,
        80
    );

    createStreetLight(
        gameArea,
        145,
        330
    );

    createStreetLight(
        gameArea,
        635,
        330
    );


    // =========================
    // CARS
    // =========================

    createCar(
        gameArea,
        250,
        80
    );

    createCar(
        gameArea,
        510,
        370
    );


    // =========================
    // GARBAGE
    // =========================

    createGarbage(
        gameArea,
        185,
        150
    );

    createGarbage(
        gameArea,
        600,
        250
    );

    createGarbage(
        gameArea,
        220,
        400
    );

}


// =========================
// HOUSE
// =========================

function createHouse(
    gameArea,
    x,
    y,
    side
) {

    const house =
        document.createElement("div");

    house.className =
        "environmentHouse";

    house.style.left =
        x + "px";

    house.style.top =
        y + "px";

    house.dataset.side =
        side;


    house.innerHTML = `

        <div class="houseRoof"></div>

        <div class="houseWindow windowOne"></div>

        <div class="houseWindow windowTwo"></div>

        <div class="houseDoor"></div>

    `;


    gameArea.appendChild(
        house
    );

}


// =========================
// STREET LIGHT
// =========================

function createStreetLight(
    gameArea,
    x,
    y
) {

    const light =
        document.createElement("div");

    light.className =
        "streetLight";

    light.style.left =
        x + "px";

    light.style.top =
        y + "px";


    light.innerHTML = `
        <div class="lampGlow"></div>
        <div class="lampHead"></div>
        <div class="lampPole"></div>
    `;


    gameArea.appendChild(
        light
    );

}


// =========================
// CAR
// =========================

function createCar(
    gameArea,
    x,
    y
) {

    const car =
        document.createElement("div");

    car.className =
        "environmentCar";

    car.style.left =
        x + "px";

    car.style.top =
        y + "px";


    car.innerHTML = `
        <div class="carWindow"></div>
        <div class="carWheel wheelOne"></div>
        <div class="carWheel wheelTwo"></div>
    `;


    gameArea.appendChild(
        car
    );

}


// =========================
// GARBAGE
// =========================

function createGarbage(
    gameArea,
    x,
    y
) {

    const garbage =
        document.createElement("div");

    garbage.className =
        "environmentGarbage";

    garbage.style.left =
        x + "px";

    garbage.style.top =
        y + "px";


    garbage.textContent =
        "🗑️";


    gameArea.appendChild(
        garbage
    );

}

// =========================
// ENVIRONMENT COLLISION
// =========================

function checkEnvironmentCollision(
    newX,
    newY
) {

    const playerSize = 50;

    const playerLeft = newX;
    const playerRight = newX + playerSize;

    const playerTop = newY;
    const playerBottom = newY + playerSize;


    // =========================
    // CHECK HOUSES
    // =========================

    const houses =
        document.querySelectorAll(
            ".environmentHouse"
        );


    for (
        let i = 0;
        i < houses.length;
        i++
    ) {

        const house =
            houses[i];

        const houseLeft =
            parseFloat(house.style.left);

        const houseTop =
            parseFloat(house.style.top);

        const houseWidth =
            house.offsetWidth;

        const houseHeight =
            house.offsetHeight;


        const houseRight =
            houseLeft + houseWidth;

        const houseBottom =
            houseTop + houseHeight;


        // COLLISION

        if (
            playerRight > houseLeft &&
            playerLeft < houseRight &&
            playerBottom > houseTop &&
            playerTop < houseBottom
        ) {

            return true;

        }

    }


    // =========================
    // CHECK CARS
    // =========================

    const cars =
        document.querySelectorAll(
            ".environmentCar"
        );


    for (
        let i = 0;
        i < cars.length;
        i++
    ) {

        const car =
            cars[i];

        const carLeft =
            parseFloat(car.style.left);

        const carTop =
            parseFloat(car.style.top);

        const carWidth =
            car.offsetWidth;

        const carHeight =
            car.offsetHeight;


        const carRight =
            carLeft + carWidth;

        const carBottom =
            carTop + carHeight;


        if (
            playerRight > carLeft &&
            playerLeft < carRight &&
            playerBottom > carTop &&
            playerTop < carBottom
        ) {

            return true;

        }

    }


    // =========================
    // NO COLLISION
    // =========================

    return false;

}