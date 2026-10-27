const gameArea = document.getElementById("gameArea");
const counter = document.getElementById("counter");
const timer = document.getElementById("timer");
const message = document.getElementById("message");
const basket = document.getElementById("basket");
const basketCount = document.getElementById("basketCount");
const growingTree = document.getElementById("growingTree");
const growthMessage = document.getElementById("growthMessage");
const gameInfo = document.getElementById("gameInfo");

const successBox = document.getElementById("successBox");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const totalOlives = 8;
let found = 0;
let timeLeft = 60;
let timerInterval = null;
let gameOver = false;
let runId = 0;

/* مواقع الزيتونات بعيدة عن مكان السلة */
const positions = [
    [12, 18], [30, 15], [49, 19], [69, 15],
    [85, 20], [19, 39], [40, 37], [62, 36],
    [79, 42], [12, 60], [32, 57], [51, 55],
    [71, 59], [22, 77], [43, 76], [65, 76]
];

function startGame() {
    clearInterval(timerInterval);

    runId++;
    const thisRun = runId;

    found = 0;
    timeLeft = 60;
    gameOver = false;

    /* إزالة الزيتونات القديمة وأي زيتونة متحركة */
    gameArea.querySelectorAll(".olive").forEach(olive => olive.remove());
    document.querySelectorAll(".flying-olive").forEach(olive => olive.remove());

    basketCount.textContent = "0 / 8";
    counter.textContent = "🫒 0 / 8";
    timer.textContent = "⏱️ 60 ثانية";

    gameArea.hidden = false;
    gameInfo.hidden = false;
    message.hidden = false;
    successBox.hidden = true;
    restartBtn.hidden = true;
    nextBtn.hidden = true;

    growingTree.classList.remove("animate");
    growthMessage.textContent = "شجرتك تستعد للنمو...";
    message.textContent = "ابحث عن الحبات بين الأوراق";

    const shuffled = [...positions]
        .sort(() => Math.random() - 0.5);

    shuffled.slice(0, totalOlives).forEach((pos, index) => {
        const olive = document.createElement("button");

        olive.type = "button";
        olive.className = "olive";
        olive.style.left = pos[0] + "%";
        olive.style.top = pos[1] + "%";
        olive.setAttribute(
            "aria-label",
            `حبة زيتون مخفية رقم ${index + 1}`
        );

        olive.addEventListener("click", () => {
            if (gameOver || olive.classList.contains("found")) {
                return;
            }

            olive.classList.add("found");
            olive.disabled = true;
            found++;

            counter.textContent = `🫒 ${found} / ${totalOlives}`;

            flyToBasket(olive, index, thisRun);

            if (found === totalOlives) {
                finishGame(true, thisRun);
            }
        });

        gameArea.appendChild(olive);
    });

    timerInterval = setInterval(() => {
        if (gameOver || thisRun !== runId) return;

        timeLeft--;
        timer.textContent = `⏱️ ${timeLeft} ثانية`;

        if (timeLeft <= 0) {
            finishGame(false, thisRun);
        }
    }, 1000);
}

function finishGame(won, thisRun) {
    if (gameOver || thisRun !== runId) return;

    gameOver = true;
    clearInterval(timerInterval);

    if (won) {
        sessionStorage.setItem("challenge1", "completed");

        message.textContent = "اكتملت المهمة بنجاح!";

        /* ننتظر وصول آخر زيتونة إلى السلة */
        setTimeout(() => {
            if (thisRun !== runId) return;

            gameArea.hidden = true;
            gameInfo.hidden = true;
            message.hidden = true;
            restartBtn.hidden = true;

            successBox.hidden = false;

            growingTree.classList.remove("animate");
            nextBtn.hidden = true;

            void growingTree.offsetWidth;
            growingTree.classList.add("animate");

            growthMessage.textContent = "شاهد شجرتك وهي تنمو 🌱";

            setTimeout(() => {
                if (thisRun !== runId) return;

                growthMessage.textContent =
                    "رائع! اجتزت المرحلة الأولى 🌿";

                nextBtn.hidden = false;
            }, 2600);
        }, 750);

    } else {
        /* إيقاف اللعبة وإظهار إعادة المحاولة فقط */
        gameArea.hidden = true;
        gameInfo.hidden = true;

        message.hidden = false;
        message.textContent =
            "⏰ انتهى الوقت! حاول مرة أخرى واجمع حبات الزيتون الثمانية";

        restartBtn.hidden = false;
        successBox.hidden = true;

        /* إلغاء أي زيتونة كانت في طريقها إلى السلة */
        document.querySelectorAll(".flying-olive").forEach(olive => olive.remove());
    }
}

function flyToBasket(olive, index, thisRun) {
    const start = olive.getBoundingClientRect();
    const target = basket.getBoundingClientRect();

    const flying = document.createElement("div");
    flying.className = "flying-olive";

    if (index % 2 !== 0) {
        flying.classList.add("dark");
    }

    flying.style.left = start.left + start.width / 2 - 9 + "px";
    flying.style.top = start.top + start.height / 2 - 13 + "px";

    document.body.appendChild(flying);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (thisRun !== runId || gameOver && found !== totalOlives) {
                flying.remove();
                return;
            }

            flying.style.left =
                target.left + target.width / 2 - 9 + "px";

            flying.style.top =
                target.top + target.height / 2 - 13 + "px";

            flying.style.transform = "scale(0.3)";
            flying.style.opacity = "0";
        });
    });

    setTimeout(() => {
        flying.remove();

        if (thisRun !== runId) return;

        basketCount.textContent = `${found} / ${totalOlives}`;

        basket.classList.remove("bump");
        void basket.offsetWidth;
        basket.classList.add("bump");
    }, 650);
}

restartBtn.addEventListener("click", startGame);

nextBtn.addEventListener("click", () => {
    window.location.href = "game2.html";
});

startGame();