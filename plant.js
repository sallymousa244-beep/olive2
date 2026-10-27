const seed = document.getElementById("seed");
const sprout = document.getElementById("sprout");

const growBtn = document.getElementById("growBtn");
const nextBtn = document.getElementById("nextBtn");

const statusText = document.getElementById("statusText");
const welcomeText = document.getElementById("welcomeText");

const visitorName =
    sessionStorage.getItem("visitorName") || "زائرنا";

welcomeText.textContent =
    `أهلًا ${visitorName}، لنزرع شجرتك معًا!`;

growBtn.addEventListener("click", () => {

    growBtn.hidden = true;

    statusText.textContent = "بذرتك تنزل إلى التربة...";

    seed.classList.add("falling");

    setTimeout(() => {

        statusText.textContent =
            "بدأت بذرتك بالنمو 🌱";

        sprout.classList.add("growing");

    }, 2000);

    setTimeout(() => {

        statusText.textContent =
            "أحسنت! شجرتك بدأت تنمو 🌿";

        nextBtn.hidden = false;

    }, 4600);

});

nextBtn.addEventListener("click", () => {
    // سنربط الزر بصفحة اللعبة الأولى لاحقًا
   window.location.href = "game1.html";
});