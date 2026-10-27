
import { db, authReady } from "./firebase-config.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ================================
// عناصر الصفحة
// ================================

const visitorName =
    sessionStorage.getItem("visitorName") || "زائر البستان";

const welcomeMessage = document.getElementById("welcomeMessage");
const plantTreeBtn = document.getElementById("plantTreeBtn");
const myTree = document.getElementById("myTree");
const treeName = document.getElementById("treeName");
const plantingMessage = document.getElementById("plantingMessage");
const wishBtn = document.getElementById("wishBtn");
const communityTrees = document.getElementById("communityTrees");
const treesCounter = document.getElementById("treesCounter");

// التأكد من وجود عناصر الصفحة
const requiredElements = {
    welcomeMessage,
    plantTreeBtn,
   
    myTree,
    treeName,
    plantingMessage,
    wishBtn,
    communityTrees,
    treesCounter
};

const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

if (missingElements.length > 0) {
    throw new Error(
        "عناصر HTML غير موجودة: " + missingElements.join(", ")
    );
}

// ================================
// حالة البستان
// ================================

let currentUid = null;
let groveLoaded = false;
let planted = false;
let plantingInProgress = false;
let savedTreeExists = false;
let growthInProgress = false;
let treeDocuments = [];
let growthTimer = null;

// مواقع أشجار الزوار
const treePositions = [
    [12, 73], [25, 65], [72, 72],
    [85, 64], [16, 48], [77, 47],
    [37, 55], [58, 60], [47, 38],
    [88, 43], [10, 35], [67, 33]
];

// رسالة الترحيب
welcomeMessage.textContent =
    `أهلاً ${visitorName}، هذه رحلتك إلى بستان الأمل 🌿`;

// إخفاء الشجرة الرئيسية في البداية
myTree.classList.remove("grow", "tree-highlight");
myTree.style.animation = "none";
myTree.style.transform = "translateX(-50%) scale(0)";
myTree.style.opacity = "0";

treeName.classList.remove("visible");
wishBtn.hidden = true;
plantTreeBtn.disabled = true;



// ================================
// إعادة الشجرة إلى حالتها الطبيعية
// ================================

function resetTreeAppearance() {
    myTree.classList.remove("grow", "tree-highlight");
    myTree.style.animation = "none";
    myTree.style.transform = "translateX(-50%) scale(0)";
    myTree.style.opacity = "0";

    treeName.classList.remove("visible");
}

// ================================
// إظهار شجرة محفوظة سابقًا
// ================================

function showExistingTree(name) {
    planted = true;
    savedTreeExists = true;

    plantTreeBtn.hidden = true;
    plantTreeBtn.disabled = true;

    myTree.classList.remove("grow");
    myTree.style.animation = "none";
    myTree.style.transform = "translateX(-50%) scale(1)";
    myTree.style.opacity = "1";

    treeName.textContent = `🌿 شجرة ${name}`;
    treeName.classList.add("visible");

    wishBtn.hidden = false;

    
}

// ================================
// حركة نمو الشجرة الجديدة
// ================================

function growMyTree(name) {
    if (growthInProgress) {
        return Promise.resolve();
    }

    growthInProgress = true;
    planted = true;

    plantTreeBtn.hidden = true;
    plantTreeBtn.disabled = true;

    wishBtn.hidden = true;

    

    treeName.classList.remove("visible");

    myTree.classList.remove("grow", "tree-highlight");
    myTree.style.animation = "";
    myTree.style.transform = "";
    myTree.style.opacity = "";

    // إعادة تشغيل حركة النمو من البداية
    void myTree.offsetWidth;
    myTree.classList.add("grow");

    return new Promise(resolve => {
        growthTimer = setTimeout(() => {
            growthTimer = null;
            growthInProgress = false;

            // تثبيت الشجرة بعد انتهاء الحركة
            myTree.classList.remove("grow");
            myTree.style.animation = "none";
            myTree.style.transform =
                "translateX(-50%) scale(1)";
            myTree.style.opacity = "1";

            treeName.textContent = `🌿 شجرة ${name}`;
            treeName.classList.add("visible");

            

            wishBtn.hidden = false;

            resolve();
        }, 4000);
    });
}

// ================================
// عرض أشجار الزوار
// ================================


function renderCommunityTrees() {
    communityTrees.replaceChildren();

    // ترتيب الأشجار حسب وقت زراعتها
    const sortedTrees = [...treeDocuments].sort((a, b) => {
        const timeA = a.data.createdAt?.seconds || 0;
        const timeB = b.data.createdAt?.seconds || 0;
        return timeA - timeB;
    });

    sortedTrees.forEach((item, index) => {
        if (item.id === currentUid) return;
        const data = item.data;

        const tree = document.createElement("div");
        tree.className = "community-tree";
        tree.dataset.treeId = item.id;

        const position = getTreePosition(
            index,
            sortedTrees.length
        );

        tree.style.left = `${position[0]}%`;
        tree.style.top = `${position[1]}%`;

        const image = document.createElement("img");
        image.src = "olive-tree.png";
        image.alt = "شجرة زيتون في بستان الأمل";
        image.draggable = false;

        const label = document.createElement("div");
        label.className = "visitor-label";
        label.textContent =
            data.visitorName || "زائر البستان";

        // تمييز شجرة الحساب الحالي
        if (item.id === currentUid) {
            tree.classList.add("my-saved-community-tree");
        }

        tree.append(image, label);
        communityTrees.appendChild(tree);
    });

    treesCounter.textContent =
        `🌳 عدد أشجار الأمل: ${treeDocuments.length}`;
}


// ================================
// توزيع الأشجار
// ================================

function getTreePosition(index, total) {
    if (total <= treePositions.length) {
        return treePositions[index];
    }

    const isMobile = window.innerWidth <= 600;
    const columns = isMobile ? 4 : 6;
    const rows = Math.ceil(total / columns);

    const column = index % columns;
    const row = Math.floor(index / columns);

    const left =
        8 + column * (84 / Math.max(columns - 1, 1));

    const top =
        32 + row * (42 / Math.max(rows - 1, 1));

    return [
        Math.min(94, left),
        Math.min(76, top)
    ];
}

// ================================
// تحميل البستان ومزامنة Firebase
// ================================

async function initializeGrove() {
    try {
        const credential = await authReady;

        if (!credential || !credential.user) {
            throw new Error("لم يتم تسجيل الدخول");
        }

        currentUid = credential.user.uid;

        onSnapshot(
            collection(db, "trees"),

            snapshot => {
                treeDocuments = snapshot.docs.map(treeDoc => ({
                    id: treeDoc.id,
                    data: treeDoc.data()
                }));

                renderCommunityTrees();

                const mySavedTree = treeDocuments.find(
                    item => item.id === currentUid
                );

                savedTreeExists = Boolean(mySavedTree);

                // إذا كانت الشجرة محفوظة، نعرضها دون إعادة النمو
                if (mySavedTree && !plantingInProgress) {
                    showExistingTree(
                        mySavedTree.data.visitorName || visitorName
                    );
                }

                // إذا لم تكن هناك شجرة لهذا الحساب
                if (
                    !mySavedTree &&
                    !planted &&
                    !plantingInProgress
                ) {
                    plantTreeBtn.hidden = false;
                    plantTreeBtn.disabled = false;

                    wishBtn.hidden = true;

                    
                }

                groveLoaded = true;
            },

            error => {
                console.error("خطأ تحميل الأشجار:", error);

                plantingMessage.textContent =
                    "تعذر تحميل الأشجار، تحققي من الاتصال والصلاحيات";

                treesCounter.textContent =
                    "تعذر تحميل الأشجار";
            }
        );

    } catch (error) {
        console.error("خطأ الاتصال بالبستان:", error);

        plantingMessage.textContent =
            "تعذر الاتصال بالبستان، حاولي تحديث الصفحة";
    }
}

// ================================
// زراعة الشجرة وحفظها
// ================================

plantTreeBtn.addEventListener("click", async () => {
    if (
        !groveLoaded ||
        !currentUid ||
        planted ||
        plantingInProgress
    ) {
        return;
    }

    plantingInProgress = true;
    plantTreeBtn.disabled = true;

    

    try {
        const treeRef = doc(db, "trees", currentUid);

        // التحقق من وجود شجرة سابقة
        const existingTree = await getDoc(treeRef);

        if (existingTree.exists()) {
            const data = existingTree.data();

            showExistingTree(
                data.visitorName || visitorName
            );

            

            return;
        }

        // حفظ الشجرة في Firebase
        await setDoc(treeRef, {
            visitorName,
            ownerId: currentUid,
            createdAt: serverTimestamp()
        });

        savedTreeExists = true;

        // تشغيل حركة النمو بعد نجاح الحفظ
        await growMyTree(visitorName);

    } catch (error) {
        console.error("خطأ زراعة الشجرة:", error);

        

        // إعادة التحقق من وجود الشجرة إذا حدث خطأ
        try {
            const treeRef = doc(db, "trees", currentUid);
            const savedTree = await getDoc(treeRef);

            if (savedTree.exists()) {
                savedTreeExists = true;

                showExistingTree(
                    savedTree.data().visitorName || visitorName
                );
            } else {
                plantTreeBtn.hidden = false;
                plantTreeBtn.disabled = false;
            }
        } catch (checkError) {
            console.error(
                "تعذر التحقق من الشجرة:",
                checkError
            );

            plantTreeBtn.hidden = false;
            plantTreeBtn.disabled = false;
        }

    } finally {
        plantingInProgress = false;

        if (savedTreeExists || planted) {
            plantTreeBtn.hidden = true;
            plantTreeBtn.disabled = true;
        } else {
            plantTreeBtn.hidden = false;
            plantTreeBtn.disabled = !groveLoaded;
        }
    }
});




// ================================
// الانتقال إلى شجرة الأمنيات
// ================================

wishBtn.addEventListener("click", () => {
    window.location.href = "wishes.html";
});

// ================================
// إعادة توزيع الأشجار عند تغيير الشاشة
// ================================

window.addEventListener("resize", () => {
    if (groveLoaded) {
        renderCommunityTrees();
    }
});

// تشغيل البستان
initializeGrove();

checkTreeBtn.addEventListener("click", () => {
    if (!currentUid) {
        plantingMessage.textContent =
            "يرجى تسجيل الدخول أولًا";
        return;
    }

    const myTree = communityTrees.querySelector(
        `[data-tree-id="${currentUid}"]`
    );

    if (!myTree) {
        plantingMessage.textContent =
            "لم يتم العثور على شجرتك في البستان";
        return;
    }

    document.querySelectorAll(".my-tree-found").forEach(tree => {
        tree.classList.remove("my-tree-found");
    });

    myTree.classList.add("my-tree-found");

    myTree.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
    });
});

