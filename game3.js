const cards = [...document.querySelectorAll(".tree-card")];
const tools = [...document.querySelectorAll(".tool")];

const progressText = document.getElementById("progressText");
const message = document.getElementById("message");
const successBox = document.getElementById("successBox");
const finishBtn = document.getElementById("finishBtn");
const plantMessage = document.getElementById("plantMessage");
const plantEmoji = document.getElementById("plantEmoji");
const visitorTreeName = document.getElementById("visitorTreeName");
const treesGrid = document.getElementById("treesGrid");
const toolsPanel = document.querySelector(".tools-panel");
const gameHeader = document.querySelector(".game-header");

let completed = 0;
let selectedTool = null;
let drag = null;

const toolNames = {
    water: "السقاية",
    prune: "التقليم",
    fertilize: "التسميد",
    harvest: "القطاف"
};

function applyTool(toolType, card) {
    if (!card || card.classList.contains("completed")) {
        return;
    }

    if (toolType !== card.dataset.tool) {
        message.textContent =
            "هذه الأداة غير مناسبة لهذه الشجرة، جرّب أداة ثانية 🌿";
        return;
    }

    card.classList.add("completed");
    // تغيير صورة الشجرة بعد العناية
const treeImage = card.querySelector("img");

const healthyImages = {
    water: "tree-watered.png",
    prune: "tree-pruned.png",
    fertilize: "tree-fertilized.png",
    harvest: "tree-harvested.png"
};

treeImage.src = healthyImages[toolType];
treeImage.alt = "شجرة الزيتون بعد العناية";

    const zone = card.querySelector(".drop-zone");
    zone.textContent = "✓ تمت العناية بالشجرة";

    const heading = card.querySelector("h2");
    heading.textContent = "🌿 شجرة معتنى بها";

    const usedTool = tools.find(
        tool => tool.dataset.tool === toolType
    );

    usedTool.classList.add("used");
    usedTool.disabled = true;

    completed++;

    progressText.textContent =
        `الأشجار المعتنى بها: ${completed} / 4`;

    message.textContent =
        `أحسنت! نجحت في مهمة ${toolNames[toolType]} 🌱`;

    selectedTool = null;
    tools.forEach(tool => tool.classList.remove("selected"));

    if (completed === 4) {
    sessionStorage.setItem("challenge3", "completed");

    setTimeout(() => {
        treesGrid.hidden = true;
        toolsPanel.hidden = true;
        gameHeader.hidden = true;
        message.hidden = true;

        successBox.hidden = false;

       plantMessage.textContent = "حان وقت زراعة شجرتك";
visitorTreeName.textContent =
    `🌿 شجرة ${sessionStorage.getItem("visitorName") || "زائر البستان"}`;
finishBtn.hidden = false;

        successBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 800);
}
}

tools.forEach(tool => {
    tool.addEventListener("pointerdown", event => {
        if (tool.disabled) return;

        selectedTool = tool.dataset.tool;

        tools.forEach(t => t.classList.remove("selected"));
        tool.classList.add("selected");

        const ghost = document.createElement("div");
        ghost.className = "drag-ghost";
        ghost.textContent = tool.querySelector("span").textContent;
        ghost.style.left = event.clientX + "px";
        ghost.style.top = event.clientY + "px";
        document.body.appendChild(ghost);

        drag = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            ghost
        };

        tool.setPointerCapture(event.pointerId);
    });

    tool.addEventListener("pointermove", event => {
        if (!drag || drag.pointerId !== event.pointerId) return;

        drag.ghost.style.left = event.clientX + "px";
        drag.ghost.style.top = event.clientY + "px";

        cards.forEach(card => card.classList.remove("drag-over"));

        const target = document.elementFromPoint(
            event.clientX, event.clientY
        );

        const card = target?.closest(".tree-card");

        if (card && !card.classList.contains("completed")) {
            card.classList.add("drag-over");
        }
    });

    tool.addEventListener("pointerup", event => {
        if (!drag || drag.pointerId !== event.pointerId) return;

        const distance = Math.hypot(
            event.clientX - drag.startX,
            event.clientY - drag.startY
        );

        const target = document.elementFromPoint(
            event.clientX, event.clientY
        );

        const card = target?.closest(".tree-card");

        drag.ghost.remove();
        drag = null;

        cards.forEach(c => c.classList.remove("drag-over"));

        if (distance > 12 && card) {
            applyTool(tool.dataset.tool, card);
        } else {
            message.textContent =
                "اختاري الشجرة المناسبة للأداة 🌿";
        }
    });

    tool.addEventListener("pointercancel", () => {
        if (drag) {
            drag.ghost.remove();
            drag = null;
        }
        cards.forEach(c => c.classList.remove("drag-over"));
    });
});

cards.forEach(card => {
    card.addEventListener("click", () => {
        if (selectedTool) {
            applyTool(selectedTool, card);
        } else {
            message.textContent =
                "اختاري أداة من الأسفل أولًا 🌿";
        }
    });
});

finishBtn.addEventListener("click", () => {
    window.location.href = "grove.html";

});
function startTreeGrowth() {
    const visitorName =
        sessionStorage.getItem("visitorName") || "زائر البستان";

    finishBtn.hidden = true;
    visitorTreeName.textContent = "";

    const stages = [
        {
            emoji: "🫘",
            text: "🌱 نزرع بذرة الأمل..."
        },
        {
            emoji: "🌱",
            text: "بدأت بذرتك تنبت..."
        },
        {
            emoji: "🪴",
            text: "شجرتك الصغيرة تنمو..."
        },
        {
            emoji: "🌳",
            text: "أصبحت شجرتك قوية وجميلة!"
        }
    ];

    let stageIndex = 0;

    function showStage() {
        const stage = stages[stageIndex];

        plantEmoji.classList.remove("grow");
        void plantEmoji.offsetWidth;

        plantEmoji.textContent = stage.emoji;
        plantEmoji.classList.add("grow");

        plantMessage.textContent = stage.text;

        stageIndex++;

        if (stageIndex < stages.length) {
            setTimeout(showStage, 1400);
        } else {
            setTimeout(() => {
                visitorTreeName.textContent =
                    `🌿 شجرة ${visitorName}`;

                plantMessage.textContent =
                    "اكتمل نمو شجرتك! حان وقت زراعتها في بستان الأمل الرقمي";

                finishBtn.hidden = false;
            }, 1500);
        }
    }

    showStage();
}