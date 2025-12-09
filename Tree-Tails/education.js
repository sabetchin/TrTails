// ===============================
// EDUCATION HUB SCRIPT
// ===============================

// --- DOM ELEMENTS ---
const titleInput = document.getElementById('eduTitle');
const categoryInput = document.getElementById('eduCategory');
const typeInput = document.getElementById('eduType');
const contentInput = document.getElementById('eduContent');

const postBtn = document.getElementById('postMaterialBtn'); 
const materialsContainer = document.getElementById('materialsList');
const tabButtons = document.querySelectorAll('.account-tab');

// ===============================
// DELETE MODAL ELEMENTS
// ===============================
let deleteTargetId = null;

const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");

cancelDeleteBtn.onclick = () => {
    deleteTargetId = null;
    deleteModal.style.display = "none";
};

confirmDeleteBtn.onclick = async () => {
    if (!deleteTargetId) return;

    try {
        await db.collection("education_materials").doc(deleteTargetId).delete();
        deleteModal.style.display = "none";
        deleteTargetId = null;
        fetchMaterials();
    } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete post.");
    }
};

// ===============================
// RELATIVE TIMESTAMP
// ===============================
function timeAgo(timestamp) {
    if (!timestamp) return "Just now";

    const now = new Date();
    const seconds = Math.floor((now - timestamp.toDate()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hrs ago";
    return Math.floor(seconds / 86400) + " days ago";
}

// ===============================
// SUBMIT MATERIAL
// ===============================
async function submitEducationMaterial() {
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const type = typeInput.value;
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert("Please fill in the required fields.");
        return;
    }

    try {
        await db.collection("education_materials").add({
            title,
            category,
            type,
            content,
            postedBy: auth.currentUser?.email || "Unknown User",
            postedByUid: auth.currentUser?.uid || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        alert("Thank you! Your material has been submitted.");

        titleInput.value = "";
        contentInput.value = "";

        fetchMaterials();
    } catch (err) {
        console.error("Error posting material:", err);
        alert("Failed to submit. Please try again.");
    }
}

postBtn.addEventListener("click", submitEducationMaterial);

// ===============================
// OPEN DELETE MODAL
// ===============================
function deletePost(id) {
    deleteTargetId = id;
    deleteModal.style.display = "flex";
}

// ===============================
// FETCH MATERIALS
// ===============================
async function fetchMaterials(filter = "all") {
    materialsContainer.innerHTML = `
        <p style="color:var(--gray); text-align:center;">Loading materials...</p>
    `;

    let query = db.collection("education_materials")
        .orderBy("createdAt", "desc");

    if (filter === "article") query = query.where("type", "==", "article");
    if (filter === "video") query = query.where("type", "==", "video");

    try {
        const snapshot = await query.get();

        if (snapshot.empty) {
            materialsContainer.innerHTML = `
                <p style="color:var(--gray); text-align:center;">No materials posted yet.</p>
            `;
            return;
        }

        materialsContainer.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            const badgeColor =
                data.type === "video" ? "animal" :
                data.type === "article" ? "primary" :
                "accent";

            const canDelete =
                auth.currentUser &&
                (
                    auth.currentUser.uid === data.postedByUid ||
                    auth.currentUser.email === data.postedBy
                );

            const item = document.createElement("div");
            item.className = "event-item";
            item.style.borderLeftColor = `var(--${badgeColor})`;

            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <h4 style="color:var(--${badgeColor}); margin:0;">${data.title}</h4>

                    ${canDelete ? `
                        <button class="delete-btn"
                            style="background:none; border:none; color:red; cursor:pointer;"
                            onclick="deletePost('${id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ""}
                </div>

                <span class="badge" style="background:var(--${badgeColor});">${data.type}</span>

                <p style="margin:12px 0;">
                    ${makeLinksClickable(data.content)}
                </p>

                <div style="display:flex; align-items:center; gap:15px; color:gray;">
                    <span><i class="fas fa-user"></i> ${data.postedBy}</span>
                    <span><i class="fas fa-clock"></i> ${timeAgo(data.createdAt)}</span>
                </div>
            `;

            materialsContainer.appendChild(item);
        });

    } catch (err) {
        console.error("Error fetching materials:", err);
        materialsContainer.innerHTML = `<p style="color:red;">Error loading data.</p>`;
    }
}

// ===============================
// MAKE LINKS CLICKABLE
// ===============================
function makeLinksClickable(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url =>
        `<a href="${url}" target="_blank" style="color:var(--primary);">${url}</a>`
    );
}

// ===============================
// INITIAL LOAD
// ===============================
fetchMaterials();

// ===============================
// FILTER TABS
// ===============================
tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        let tab = btn.textContent.toLowerCase();
        if (tab.includes("guide")) fetchMaterials("article");
        else if (tab.includes("video")) fetchMaterials("video");
        else fetchMaterials("all");
    });
});

// ===============================
// BUTTON UI ENHANCEMENTS
// ===============================
const styleButtons = () => {
    const buttons = document.querySelectorAll(".btn, .account-tab");
    buttons.forEach(btn => {
        btn.style.borderRadius = "var(--radius)";
        btn.style.transition = "var(--transition)";
        btn.style.boxShadow = "var(--shadow)";

        btn.addEventListener("mouseenter", () => {
            btn.style.boxShadow = "var(--shadow-hover)";
        });

        btn.addEventListener("mouseleave", () => {
            btn.style.boxShadow = "var(--shadow)";
        });
    });
};

styleButtons();
