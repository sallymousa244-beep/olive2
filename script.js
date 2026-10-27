const startBtn = document.getElementById("startBtn");
const registration = document.getElementById("registration");
const plantBtn = document.getElementById("plantBtn");
const visitorName = document.getElementById("visitorName");
const errorMessage = document.getElementById("errorMessage");

startBtn.addEventListener("click", () => {
  registration.hidden = false;
  startBtn.hidden = true;
  visitorName.focus();
});

plantBtn.addEventListener("click", () => {
  const name = visitorName.value.trim();

  if (!name) {
    errorMessage.textContent = "الرجاء إدخال اسمك أولًا";
    return;
  }

  sessionStorage.setItem("visitorName", name);

  // لاحقًا ننتقل إلى صفحة التحدي الأول
  window.location.href = "plant.html";
});