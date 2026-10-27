import { db, authReady } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const wishInput = document.getElementById("wishInput");
const saveWishBtn = document.getElementById("saveWishBtn");
const wishMessage = document.getElementById("wishMessage");
const wishLeaves = document.getElementById("wishLeaves");

const visitorName =
    sessionStorage.getItem("visitorName") || "زائر البستان";

// توزيع قصاصات الأمنيات على أغصان الشجرة
const positions = [
    [24, 25], [37, 17], [50, 22], [64, 18], [76, 29],
    [16, 38], [31, 34], [44, 31], [57, 35], [72, 39],
    [22, 49], [37, 46], [52, 48], [66, 50], [81, 46],
    [31, 59], [46, 59], [61, 61], [73, 57],
    [40, 69], [55, 70]
];

function addLeaf(data, index) {
    const note = document.createElement("div");
    note.className = "wish-leaf";

    const position = positions[index % positions.length];

    note.style.left = `${position[0]}%`;
    note.style.top = `${position[1]}%`;

    // اختلاف بسيط في ميل القصاصات لإعطاء شكل طبيعي
    const rotations = [-4, 3, -2, 4, 0];
    note.style.setProperty(
        "--note-rotation",
        `${rotations[index % rotations.length]}deg`
    );

    // شريط صغير أعلى القصاصة
    const tape = document.createElement("span");
    tape.className = "wish-note-tape";
    tape.setAttribute("aria-hidden", "true");

    const wishText = document.createElement("span");
    wishText.className = "leaf-text";
    wishText.textContent = data.wishText || "";

    note.append(tape, wishText);
    wishLeaves.appendChild(note);
}

// تحميل الأمنيات المنشورة ومتابعة التحديثات المباشرة
async function loadWishes() {
    try {
        await authReady;

        const wishesQuery = query(
            collection(db, "wishes"),
            where("approved", "==", true)
        );

        onSnapshot(
            wishesQuery,
            snapshot => {
                wishLeaves.replaceChildren();

                const docs = [...snapshot.docs].sort((a, b) =>
                    a.id.localeCompare(b.id)
                );

                docs.forEach((item, index) => {
                    addLeaf(item.data(), index);
                });
            },
            error => {
                console.error("خطأ في تحميل الأمنيات:", error);
                wishMessage.textContent = "تعذر تحميل الأمنيات حاليًا";
            }
        );
    } catch (error) {
        console.error("خطأ في الاتصال:", error);
        wishMessage.textContent = "تعذر الاتصال بالخدمة حاليًا";
    }
}

// حفظ أمنية جديدة
saveWishBtn.addEventListener("click", async () => {
    const wishText = wishInput.value.trim();

    if (!wishText) {
        wishMessage.textContent = "اكتبي أمنيتك للأردن أولًا 🌿";
        wishInput.focus();
        return;
    }

    if (wishText.length > 150) {
        wishMessage.textContent = "الأمنية يجب ألا تتجاوز 150 حرفًا";
        return;
    }

    saveWishBtn.disabled = true;
    wishMessage.textContent = "جاري تعليق أمنيتك على الشجرة...";

    try {
        const credential = await authReady;
        const uid = credential.user.uid;

        await addDoc(collection(db, "wishes"), {
            visitorName,
            ownerId: uid,
            wishText,
            approved: true,
            createdAt: serverTimestamp()
        });

        wishInput.value = "";
        wishMessage.textContent = "🍃 وصلت أمنيتك إلى الشجرة بنجاح";

    } catch (error) {
        console.error("خطأ في حفظ الأمنية:", error);
        wishMessage.textContent =
            "تعذر حفظ الأمنية، تحققي من اتصال الإنترنت وإعدادات Firebase";
    } finally {
        saveWishBtn.disabled = false;
    }
});

loadWishes();
const endJourneyBtn = document.getElementById("endJourneyBtn");

if (endJourneyBtn) {
    endJourneyBtn.addEventListener("click", () => {
        const leave = confirm(
            "🌿 انتهت رحلتك في شجرة الأمنيات\nشكرًا لأنك زرعت أمنية للأردن "
        );

        if (leave) {
            window.close();
        }
    });
}