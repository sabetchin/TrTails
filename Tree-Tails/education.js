// ===============================
// EDUCATION HUB SCRIPT
// Handles posting, fetching, filtering learning materials
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
// POST MATERIAL TO FIRESTORE
// ===============================
async function submitEducationMaterial() {
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const type = typeInput.value;
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert('Please fill in the required fields.');
        return;
    }

    try {
        await db.collection('education_materials').add({
            title,
            category,
            type,
            content,
            postedBy: auth.currentUser ? auth.currentUser.email : 'Guest',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        alert('Thank you! Your material has been submitted.');

        // Reset form
        titleInput.value = "";
        contentInput.value = "";

        fetchMaterials(); // Refresh list
    } catch (err) {
        console.error('Error posting material:', err);
        alert('Failed to submit. Please try again.');
    }
}

postBtn.addEventListener('click', submitEducationMaterial);


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
            const badgeColor = 
                data.type === "video" ? "animal" : 
                data.type === "article" ? "primary" : 
                "accent";

            const item = document.createElement('div');
            item.className = "event-item";
            item.style.borderLeftColor = `var(--${badgeColor})`;

            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <h4 style="color:var(--${badgeColor}); font-size:1.1rem; margin:0;">
                        ${data.title}
                    </h4>
                    <span class="badge" style="background:var(--${badgeColor});">
                        ${data.type}
                    </span>
                </div>

                <p style="margin-bottom:12px; font-size:0.95rem;">
                    ${data.content}
                </p>

                <div style="display:flex; align-items:center; gap:15px; font-size:0.85rem; color:var(--gray);">
                    <span><i class="fas fa-user"></i> ${data.postedBy}</span>
                    <span><i class="fas fa-clock"></i> Just now</span>
                </div>
            `;

            materialsContainer.appendChild(item);
        });

    } catch (err) {
        console.error("Error fetching materials:", err);
        materialsContainer.innerHTML = `<p style="color:red;">Error loading data.</p>`;
    }
}

// Initial load
fetchMaterials();


// ===============================
// TABS FILTERING
// ===============================
tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const tab = btn.textContent.toLowerCase();

        if (tab.includes("guide")) fetchMaterials("article");
        else if (tab.includes("video")) fetchMaterials("video");
        else fetchMaterials("all");
    });
});


// ===============================
// BUTTON UI ENHANCEMENTS (OPTIONAL)
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
    