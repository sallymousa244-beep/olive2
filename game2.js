const board = document.getElementById("memoryBoard");
const matchesText = document.getElementById("matches");
const timerText = document.getElementById("timer");
const message = document.getElementById("message");
const gameInfo = document.getElementById("gameInfo");
const successBox = document.getElementById("successBox");
const treeGrowth = document.getElementById("treeGrowth");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const symbols = ["🫒", "🌿", "🌳", "🧺", "🌱", "🪵"];

let cards = [];
let firstCard = null;
let secondCard = null;
let locked = false;
let matches = 0;
let timeLeft = 60;
let gameOver = false;
let timerInterval = null;
let flipTimeout = null;

function createBoard() {
    board.innerHTML = "";

    const shuffledSymbols = [...symbols, ...symbols]
        .sort(() => Math.random() - 0.5);

    cards = shuffledSymbols.map((symbol, index) => ({
        id: index,
        symbol
    }));

    cards.forEach(cardData => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "memory-card";
        card.textContent = "❧";
        card.setAttribute("aria-label", "بطاقة مخفية");
        card.dataset.symbol = cardData.symbol;

        card.addEventListener("click", () => {
            flipCard(card);
        });

        board.appendChild(card);
    });
}

function flipCard(card) {
    if (
        locked ||
        gameOver ||
        card === firstCard ||
        card.classList.contains("matched")
    ) {
        return;
    }

    card.classList.add("flipped");
    card.textContent = card.dataset.symbol;
    card.setAttribute("aria-label", "بطاقة " + card.dataset.symbol);

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    locked = true;

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard.disabled = true;
        secondCard.disabled = true;

        matches++;
        matchesText.textContent = `🫒 ${matches} / 6 أزواج`;

        firstCard = null;
        secondCard = null;
        locked = false;

        if (matches === 6) {
            finishGame(true);
        }
    } else {
        const card1 = firstCard;
        const card2 = secondCard;

        flipTimeout = setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");

            card1.textContent = "❧";
            card2.textContent = "❧";

            card1.setAttribute("aria-label", "بطاقة مخفية");
            card2.setAttribute("aria-label", "بطاقة مخفية");

            firstCard = null;
            secondCard = null;
            locked = false;
            flipTimeout = null;
        }, 850);
    }
}

function finishGame(won) {
    if (gameOver) return;

    gameOver = true;
    locked = true;
    clearInterval(timerInterval);

    if (flipTimeout) {
        clearTimeout(flipTimeout);
        flipTimeout = null;
    }

    if (won) {
        sessionStorage.setItem("challenge2", "completed");

        setTimeout(() => {
            board.hidden = true;
            gameInfo.hidden = true;
            message.hidden = true;
            restartBtn.hidden = true;

            successBox.hidden = false;
            treeGrowth.classList.remove("animate");
            void treeGrowth.offsetWidth;
            treeGrowth.classList.add("animate");
        }, 700);
    } else {
        message.textContent = "انتهى الوقت! حاولي مرة أخرى 🌿";
        restartBtn.hidden = false;
    }
}

function startGame() {
    clearInterval(timerInterval);

    if (flipTimeout) {
        clearTimeout(flipTimeout);
        flipTimeout = null;
    }

    firstCard = null;
    secondCard = null;
    locked = false;
    matches = 0;
    timeLeft = 60;
    gameOver = false;

    board.hidden = false;
    gameInfo.hidden = false;
    message.hidden = false;
    successBox.hidden = true;
    restartBtn.hidden = true;

    message.textContent = "اقلب بطاقتين للبحث عن الصور المتطابقة";
    matchesText.textContent = "🫒 0 / 6 أزواج";
    timerText.textContent = "⏱️ 60 ثانية";

    createBoard();

    timerInterval = setInterval(() => {
        if (gameOver) return;

        timeLeft--;
        timerText.textContent = `⏱️ ${timeLeft} ثانية`;

        if (timeLeft <= 0) {
            finishGame(false);
        }
    }, 1000);
}

restartBtn.addEventListener("click", startGame);

nextBtn.addEventListener("click", () => {
    window.location.href = "game3.html";
});

startGame();