// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDhn4Xgc4L1GLcpcR4ffvxjGIQKNuxrCYc",
    authDomain: "treetails-7af34.firebaseapp.com",
    projectId: "treetails-7af34",
    storageBucket: "treetails-7af34.firebasestorage.app",
    messagingSenderId: "469079945405",
    appId: "1:469079945405:web:263b78fa028da2ebe107d4",
    measurementId: "G-7QLXNT4DNG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Initialize EmailJS - REPLACE WITH YOUR ACTUAL KEYS
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

// Global variables
let currentUser = null;
let currentAnimalData = null;
let currentApplicationId = null;
let animalsData = [];

// Main Application Class
class AdoptionApp {
    constructor() {
        this.init();
    }

    async init() {
        // --- FIX 1: Check LocalStorage first for instant UI update ---
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                currentUser = JSON.parse(storedUser);
                console.log("Restored user from storage:", currentUser);
                this.updateUIForUser(currentUser); 
            } catch (e) {
                console.error("Error parsing stored user", e);
            }
        }

        this.setupEventListeners();
        await this.loadAnimals();
        this.loadMyApplications();
        this.loadMyListings();
        this.setupAuthListener();
        this.showNotification('Adoption platform loaded successfully! 🐾', 'success');
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Search and filter events
        const searchInput = document.getElementById('animal-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.renderAnimals());
        }

        const filterSelect = document.getElementById('animal-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.renderAnimals());
        }

        const genderFilter = document.getElementById('gender-filter');
        if (genderFilter) {
            genderFilter.addEventListener('change', () => this.renderAnimals());
        }

        const ageFilter = document.getElementById('age-filter');
        if (ageFilter) {
            ageFilter.addEventListener('change', () => this.renderAnimals());
        }

        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                this.renderAnimals();
            });
        }

        const refreshBtn = document.getElementById('refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAnimals());
        }

        // Barangay filter
        const brgyToggle = document.getElementById('brgyToggle');
        if (brgyToggle) {
            brgyToggle.addEventListener('click', () => this.toggleBarangayFilter());
        }

        document.querySelectorAll('.brgy-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.brgy-option').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                this.renderAnimals();
            });
        });

        // Main action buttons
        const postAnimalBtn = document.getElementById('postAnimalBtn');
        if (postAnimalBtn) {
            postAnimalBtn.addEventListener('click', () => this.checkAuthAndOpenPostForm());
        }

        const myListingsBtn = document.getElementById('myListingsBtn');
        if (myListingsBtn) {
            myListingsBtn.addEventListener('click', () => this.switchTab('mylistings'));
        }

        const postFromEmptyBtn = document.getElementById('postFromEmptyBtn');
        if (postFromEmptyBtn) {
            postFromEmptyBtn.addEventListener('click', () => this.checkAuthAndOpenPostForm());
        }

        const browseFromEmptyBtn = document.getElementById('browseFromEmptyBtn');
        if (browseFromEmptyBtn) {
            browseFromEmptyBtn.addEventListener('click', () => this.switchTab('browse'));
        }

        // Modal close buttons
        const closeAnimalModal = document.getElementById('closeAnimalModal');
        if (closeAnimalModal) closeAnimalModal.addEventListener('click', () => this.closeAnimalModal());

        const closeAdoptionModal = document.getElementById('closeAdoptionModal');
        if (closeAdoptionModal) closeAdoptionModal.addEventListener('click', () => this.closeAdoptionForm());

        const closePostAnimalModal = document.getElementById('closePostAnimalModal');
        if (closePostAnimalModal) closePostAnimalModal.addEventListener('click', () => this.closePostAnimalForm());

        const closeSignInModal = document.getElementById('closeSignInModal');
        if (closeSignInModal) closeSignInModal.addEventListener('click', () => this.closeSignInModal());

        const closeSignUpModal = document.getElementById('closeSignUpModal');
        if (closeSignUpModal) closeSignUpModal.addEventListener('click', () => this.closeSignUpModal());

        const closeLetterModal = document.getElementById('closeLetterModal');
        if (closeLetterModal) closeLetterModal.addEventListener('click', () => this.closeLetterModal());

        // Cancel buttons
        const cancelAdoptionBtn = document.getElementById('cancelAdoptionBtn');
        if (cancelAdoptionBtn) cancelAdoptionBtn.addEventListener('click', () => this.closeAdoptionForm());

        const cancelPostAnimalBtn = document.getElementById('cancelPostAnimalBtn');
        if (cancelPostAnimalBtn) cancelPostAnimalBtn.addEventListener('click', () => this.closePostAnimalForm());

        // Form submissions
        const adoptionForm = document.getElementById('adoption-form');
        if (adoptionForm) {
            adoptionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAdoptionForm();
            });
        }

        const postAnimalForm = document.getElementById('post-animal-form');
        if (postAnimalForm) {
            postAnimalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitPostAnimalForm();
            });
        }

        // Auth buttons
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) signInBtn.addEventListener('click', () => this.showSignInModal());

        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) signOutBtn.addEventListener('click', () => this.signOut());

        const submitSignInBtn = document.getElementById('submitSignInBtn');
        if (submitSignInBtn) submitSignInBtn.addEventListener('click', () => this.signIn());

        const submitSignUpBtn = document.getElementById('submitSignUpBtn');
        if (submitSignUpBtn) submitSignUpBtn.addEventListener('click', () => this.signUp());

        const showSignUpLink = document.getElementById('showSignUpLink');
        if (showSignUpLink) {
            showSignUpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignUpModal();
            });
        }

        const showSignInLink = document.getElementById('showSignInLink');
        if (showSignInLink) {
            showSignInLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignInModal();
            });
        }

        // --- FIX 2: Check if reportBtn exists before adding listener ---
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                this.checkAuthAndOpenPostForm();
            });
        }

        // Letter modal buttons
        const downloadLetterBtn = document.getElementById('downloadLetterBtn');
        if (downloadLetterBtn) {
            downloadLetterBtn.addEventListener('click', () => this.downloadApplicationLetter(currentApplicationId));
        }

        const printLetterBtn = document.getElementById('printLetterBtn');
        if (printLetterBtn) {
            printLetterBtn.addEventListener('click', () => this.printLetter(currentApplicationId));
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    setupAuthListener() {
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            
            // Sync with local storage on state change
            if (user) {
                // We construct a simple object to save
                const userToSave = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                };
                localStorage.setItem('currentUser', JSON.stringify(userToSave));
            } else {
                localStorage.removeItem('currentUser');
            }
            
            this.updateUIForUser(user);
        });
    }

    updateUIForUser(user) {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        const userRole = document.getElementById('userRole');
        const signInBtn = document.getElementById('signInBtn');
        const signOutBtn = document.getElementById('signOutBtn');

        if (user) {
            if (userName) userName.textContent = user.displayName || user.email || 'User';
            if (userAvatar) userAvatar.textContent = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
            if (userRole) userRole.textContent = "Tree Planter & Rescuer";
            if (signInBtn) signInBtn.style.display = 'none';
            if (signOutBtn) signOutBtn.style.display = 'block';
        } else {
            if (userName) userName.textContent = 'Guest';
            if (userAvatar) userAvatar.textContent = 'G';
            if (userRole) userRole.textContent = 'Please Sign In';
            if (signInBtn) signInBtn.style.display = 'block';
            if (signOutBtn) signOutBtn.style.display = 'none';
        }
    }

    async loadAnimals() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) loadingState.style.display = 'block';

        try {
            if (db) {
                const snapshot = await db.collection('animals')
                    .where('status', '==', 'available')
                    .get();

                animalsData = [];
                snapshot.forEach(doc => {
                    animalsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            } else {
                // Load from localStorage if no Firebase
                const saved = localStorage.getItem('treetails_animals');
                animalsData = saved ? JSON.parse(saved) : await this.loadSampleData();
            }

            this.updateStats();
            this.renderAnimals();
            if (loadingState) loadingState.style.display = 'none';
        } catch (error) {
            console.error('Error loading animals:', error);
            animalsData = await this.loadSampleData();
            this.updateStats();
            this.renderAnimals();
            if (loadingState) loadingState.style.display = 'none';
        }
    }

    async loadSampleData() {
        return [
            {
                id: '1',
                name: 'Mingming',
                type: 'cat',
                breed: 'Domestic Shorthair',
                age: '1.5 years',
                gender: 'female',
                location: 'Gordon Heights',
                description: 'Sweet and gentle cat rescued from Gordon Heights.',
                status: 'available',
                postedBy: 'Juan Dela Cruz',
                postedByEmail: 'juan@example.com',
                postedByPhone: '0922-987-6543',
                createdAt: new Date('2024-01-20')
            }
        ];
    }

    renderAnimals() {
        const container = document.getElementById('animals-container');
        if (!container) return;

        const filteredAnimals = this.getFilteredAnimals();

        if (filteredAnimals.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-search"></i>
                    <h3>No Animals Found</h3>
                    <p>No animals match your search criteria. Try different filters or check back later.</p>
                </div>
            `;
            this.updatePaginationInfo(0);
            return;
        }

        let html = '';
        filteredAnimals.forEach(animal => {
            const genderIcon = animal.gender === 'male' ? '♂' : '♀';
            const typeIcon = animal.type === 'dog' ? 'fa-dog' : 'fa-cat';

            html += `
                <div class="animal-card" data-animal-id="${animal.id}">
                    <div class="animal-image">
                        <i class="fas ${typeIcon}"></i>
                    </div>
                    <div class="animal-info">
                        <div class="animal-name">${animal.name}</div>
                        <div class="animal-details">
                            <p>Breed: ${animal.breed || 'Mixed'}</p>
                            <p>Age: ${animal.age || 'Unknown'}</p>
                            <p>Gender: ${genderIcon} ${animal.gender || 'Unknown'}</p>
                            <p>Location: ${animal.location || 'Olongapo City'}</p>
                        </div>
                        <div class="animal-actions">
                            <button class="btn btn-small btn-primary view-btn" data-id="${animal.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-small btn-outline adopt-btn" data-id="${animal.id}">
                                <i class="fas fa-heart"></i> Adopt
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        this.updatePaginationInfo(filteredAnimals.length);

        // Add event listeners to new buttons
        container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.closest('button').dataset.id;
                this.viewAnimalDetails(animalId);
            });
        });

        container.querySelectorAll('.adopt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalId = e.target.closest('button').dataset.id;
                this.openAdoptionForm(animalId);
            });
        });
    }

    getFilteredAnimals() {
        const searchInput = document.getElementById('animal-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        const typeFilter = document.getElementById('animal-filter');
        const animalType = typeFilter ? typeFilter.value : 'all';
        
        const genderFilter = document.getElementById('gender-filter');
        const gender = genderFilter ? genderFilter.value : 'all';
        
        const ageFilter = document.getElementById('age-filter');
        const ageVal = ageFilter ? ageFilter.value : 'all';
        
        const activeBrgyEl = document.querySelector('.brgy-option.active');
        const activeBrgy = activeBrgyEl ? activeBrgyEl.dataset.brgy : 'all';

        return animalsData.filter(animal => {
            // Search filter
            if (searchTerm) {
                const searchable = `${animal.name} ${animal.breed} ${animal.description} ${animal.location}`.toLowerCase();
                if (!searchable.includes(searchTerm)) return false;
            }

            // Type filter
            if (animalType !== 'all' && animal.type !== animalType) return false;

            // Gender filter
            if (gender !== 'all' && animal.gender !== gender) return false;

            // Barangay filter
            if (activeBrgy !== 'all' && animal.location !== activeBrgy) return false;

            // Age filter
            if (ageVal !== 'all') {
                const age = parseFloat(animal.age) || 0;
                switch (ageVal) {
                    case 'baby': if (age > 1) return false; break;
                    case 'young': if (age <= 1 || age > 3) return false; break;
                    case 'adult': if (age <= 3 || age > 8) return false; break;
                    case 'senior': if (age <= 8) return false; break;
                }
            }

            return true;
        });
    }

    updateStats() {
        const dogs = animalsData.filter(a => a.type === 'dog').length;
        const cats = animalsData.filter(a => a.type === 'cat').length;

        const dCount = document.getElementById('dogsCount');
        const cCount = document.getElementById('catsCount');
        
        if (dCount) dCount.textContent = dogs;
        if (cCount) cCount.textContent = cats;
        
        const aCount = document.getElementById('adoptionsCount');
        if (aCount) aCount.textContent = '0';
        
        const vCount = document.getElementById('volunteersCount');
        if (vCount) vCount.textContent = '25';
    }

    updatePaginationInfo(totalItems) {
        const showCount = document.getElementById('showingCount');
        const totalCount = document.getElementById('totalCount');
        
        if (showCount) showCount.textContent = totalItems;
        if (totalCount) totalCount.textContent = totalItems;
    }

    viewAnimalDetails(animalId) {
        const animal = animalsData.find(a => a.id === animalId);
        if (!animal) return;

        currentAnimalData = animal;

        const modal = document.getElementById('animalModal');
        const nameEl = document.getElementById('modal-animal-name');
        const detailsEl = document.getElementById('modal-animal-details');

        if (nameEl) nameEl.textContent = animal.name;

        if (detailsEl) {
            detailsEl.innerHTML = `
                <div class="animal-detail-view">
                    <div class="animal-image-large" style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 60px; margin-bottom: 20px; border-radius: 8px;">
                        <i class="fas fa-${animal.type}"></i>
                    </div>
                    <div class="animal-info-details">
                        <p><strong>Type:</strong> ${animal.type}</p>
                        <p><strong>Breed:</strong> ${animal.breed || 'Mixed breed'}</p>
                        <p><strong>Age:</strong> ${animal.age || 'Unknown'}</p>
                        <p><strong>Gender:</strong> ${animal.gender || 'Unknown'}</p>
                        <p><strong>Location:</strong> ${animal.location || 'Olongapo City'}</p>
                        <p><strong>Description:</strong> ${animal.description || 'No description provided'}</p>
                        <p><strong>Posted by:</strong> ${animal.postedBy || 'Anonymous'}</p>
                        <p><strong>Contact:</strong> ${animal.postedByEmail || 'Email not provided'}</p>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn btn-primary" id="applyFromModalBtn">
                            <i class="fas fa-heart"></i> Apply to Adopt ${animal.name}
                        </button>
                    </div>
                </div>
            `;
        }

        if (modal) modal.style.display = 'block';

        // Add event listener to the apply button in modal
        const applyBtn = document.getElementById('applyFromModalBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.openAdoptionForm(animalId);
            });
        }
    }

    openAdoptionForm(animalId) {
        const animal = animalsData.find(a => a.id === animalId);
        if (!animal) return;

        currentAnimalData = animal;

        const summary = document.getElementById('animalSummary');
        if (summary) {
            summary.innerHTML = `
                <div class="animal-summary-content">
                    <h4>You're applying to adopt: ${animal.name}</h4>
                    <p>${animal.type} • ${animal.breed || 'Mixed breed'} • ${animal.gender || 'Unknown'} • ${animal.age || 'Unknown age'}</p>
                </div>
            `;
        }

        // Pre-fill form with user data if available
        if (currentUser) {
            db.collection('users').doc(currentUser.uid).get().then(userDoc => {
                if (userDoc.exists) {
                    const user = userDoc.data();
                    const nameInput = document.getElementById('applicant-name');
                    const emailInput = document.getElementById('applicant-email');
                    const phoneInput = document.getElementById('applicant-phone');
                    
                    if (nameInput) nameInput.value = user.name || '';
                    if (emailInput) emailInput.value = user.email || '';
                    if (phoneInput) phoneInput.value = user.phone || '';
                }
            });
        }

        const modal = document.getElementById('adoptionFormModal');
        if (modal) modal.style.display = 'block';
    }

    async submitAdoptionForm() {
        if (!currentUser) {
            this.showNotification("Please sign in to submit an application", "error");
            this.showSignInModal();
            return;
        }

        if (!currentAnimalData) {
            this.showNotification("No animal selected", "error");
            return;
        }

        const applicationData = {
            applicantName: document.getElementById('applicant-name').value,
            applicantEmail: document.getElementById('applicant-email').value,
            applicantPhone: document.getElementById('applicant-phone').value,
            applicantAddress: document.getElementById('applicant-address').value,
            applicantAge: document.getElementById('applicant-age').value,
            housingType: document.getElementById('housing-type').value,
            yardAccess: document.getElementById('yard-access').value,
            householdMembers: document.getElementById('household-members').value,
            currentPets: document.getElementById('current-pets').value,
            experience: document.getElementById('experience').value,
            adoptionReason: document.getElementById('adoption-reason').value,
            preparation: document.getElementById('preparation').value
        };

        // Validate form
        const errors = this.validateAdoptionForm(applicationData);
        if (errors.length > 0) {
            this.showNotification(errors.join(', '), "error");
            return;
        }

        const submitBtn = document.getElementById('submitAdoptionBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        try {
            const userData = {
                uid: currentUser.uid,
                name: currentUser.displayName || applicationData.applicantName,
                email: currentUser.email || applicationData.applicantEmail
            };

            const result = await this.sendEmailAndGenerateLetter(
                currentAnimalData,
                applicationData,
                userData
            );

            if (result.success) {
                this.showNotification(result.message, "success");

                if (confirm("Would you like to download a copy of your application letter?")) {
                    await this.downloadApplicationLetter(result.applicationId);
                }

                this.closeAdoptionForm();
                this.loadMyApplications();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, "error");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateAdoptionForm(formData) {
        const errors = [];

        if (!formData.applicantName.trim()) errors.push('Full name is required');
        if (!formData.applicantEmail.trim() || !this.isValidEmail(formData.applicantEmail)) errors.push('Valid email is required');
        if (!formData.applicantPhone.trim()) errors.push('Phone number is required');
        if (!formData.applicantAddress.trim()) errors.push('Address is required');
        if (!formData.housingType) errors.push('Housing type is required');
        if (!formData.experience.trim()) errors.push('Please describe your pet experience');
        if (!formData.adoptionReason.trim()) errors.push('Please explain why you want to adopt');

        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async sendEmailAndGenerateLetter(animalData, applicationData, userData) {
        try {
            const emailParams = {
                to_email: animalData.postedByEmail || "owner@example.com",
                to_name: animalData.postedBy || "Animal Owner",
                from_name: applicationData.applicantName || userData.name,
                from_email: applicationData.applicantEmail || userData.email,
                animal_name: animalData.name,
                animal_type: animalData.type,
                animal_breed: animalData.breed || "Mixed breed",
                application_date: new Date().toLocaleDateString(),
                applicant_name: applicationData.applicantName,
                applicant_email: applicationData.applicantEmail,
                applicant_phone: applicationData.applicantPhone,
                applicant_address: applicationData.applicantAddress,
                adoption_reason: applicationData.adoptionReason,
                experience: applicationData.experience,
                housing_type: applicationData.housingType,
                current_pets: applicationData.currentPets || "None",
                additional_notes: applicationData.preparation || "No additional notes"
            };

            // Send email using EmailJS
            const emailResponse = await emailjs.send(
                "YOUR_EMAILJS_SERVICE_ID",
                "YOUR_EMAILJS_TEMPLATE_ID",
                emailParams
            );

            // Generate application letter
            const applicationLetter = this.generateApplicationLetter(animalData, applicationData, userData);

            // Create application record
            const applicationRecord = {
                animalId: animalData.id,
                animalName: animalData.name,
                animalType: animalData.type,
                ownerId: animalData.ownerId || animalData.postedBy,
                ownerEmail: animalData.postedByEmail,
                applicantId: currentUser.uid,
                applicantName: applicationData.applicantName,
                applicantEmail: applicationData.applicantEmail,
                applicantPhone: applicationData.applicantPhone,
                applicationData: applicationData,
                applicationLetter: applicationLetter,
                status: "pending",
                submittedAt: firebase.firestore.FieldValue.serverTimestamp ? 
                    firebase.firestore.FieldValue.serverTimestamp() : new Date()
            };

            // Save to Firestore if available
            let applicationId;
            if (db) {
                const applicationRef = await db.collection('applications').add(applicationRecord);
                applicationId = applicationRef.id;
            } else {
                // Save locally
                applicationId = 'app_' + Date.now();
                applicationRecord.id = applicationId;
                const applications = JSON.parse(localStorage.getItem('treetails_applications') || '[]');
                applications.push(applicationRecord);
                localStorage.setItem('treetails_applications', JSON.stringify(applications));
            }

            // Save letter separately
            const letters = JSON.parse(localStorage.getItem('treetails_application_letters') || '{}');
            letters[applicationId] = applicationLetter;
            localStorage.setItem('treetails_application_letters', JSON.stringify(letters));

            return {
                success: true,
                emailSent: emailResponse.status === 200,
                applicationId: applicationId,
                applicationLetter: applicationLetter,
                message: "Application submitted successfully! Check your email for confirmation."
            };

        } catch (error) {
            console.error("Error sending email or generating letter:", error);
            return {
                success: false,
                error: error.message,
                message: "Failed to submit application. Please try again."
            };
        }
    }

    generateApplicationLetter(animalData, applicationData, userData) {
        const currentDate = new Date().toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
====================================================
TREE TAILS ADOPTION APPLICATION LETTER
====================================================

Date: ${currentDate}
Application ID: APP-${Date.now().toString().slice(-8)}
Animal: ${animalData.name} (${animalData.type} - ${animalData.breed || "Mixed breed"})

Dear ${animalData.postedBy || "Animal Owner"},

I, ${applicationData.applicantName}, am writing to express my sincere interest 
in adopting ${animalData.name} (${animalData.type} - ${animalData.breed || "Mixed breed"}).

PERSONAL INFORMATION:
• Name: ${applicationData.applicantName}
• Email: ${applicationData.applicantEmail}
• Phone: ${applicationData.applicantPhone}
• Address: ${applicationData.applicantAddress}
• Age: ${applicationData.applicantAge || "Not specified"}

LIVING SITUATION:
• Housing Type: ${applicationData.housingType}
• Yard Access: ${applicationData.yardAccess || "Not specified"}
• Household Members: ${applicationData.householdMembers || "Not specified"}
• Current Pets: ${applicationData.currentPets || "None"}

PET EXPERIENCE:
${applicationData.experience}

REASON FOR ADOPTION:
${applicationData.adoptionReason}

PREPARATIONS MADE:
${applicationData.preparation || "Standard preparations will be made upon approval"}

I understand that adopting ${animalData.name} is a serious commitment and 
I am fully prepared to provide a loving, safe, and permanent home.

Please feel free to contact me at ${applicationData.applicantPhone} or 
${applicationData.applicantEmail} to discuss my application further.

Sincerely,
${applicationData.applicantName}

====================================================
TreeTails Olongapo Adoption Directory
🌳🐾 Giving animals a second chance at life
====================================================
`;
    }

    checkAuthAndOpenPostForm() {
        if (!currentUser) {
            this.showNotification("Please sign in to post an animal", "info");
            this.showSignInModal();
            return false;
        }
        this.openPostAnimalForm();
        return true;
    }

    // --- FIX 3: Robust Open Post Form with Fallbacks ---
    openPostAnimalForm() {
        // Pre-fill form with user data if available
        if (currentUser) {
            // FIX: Use email or 'Volunteer' if the display name is missing
            const fallbackName = currentUser.displayName || currentUser.email || 'TreeTails Volunteer';
            
            const nameField = document.getElementById('post-owner-name');
            const emailField = document.getElementById('post-owner-email');
            
            if (nameField) nameField.value = fallbackName;
            if (emailField) emailField.value = currentUser.email || '';
        }

        const modal = document.getElementById('postAnimalModal');
        if (modal) modal.style.display = 'block';
    }

    async submitPostAnimalForm() {
        if (!currentUser) {
            this.showNotification("Please sign in to post an animal", "error");
            this.showSignInModal();
            return;
        }

        const animalData = {
            name: document.getElementById('post-animal-name').value,
            type: document.getElementById('post-animal-type').value,
            breed: document.getElementById('post-animal-breed').value,
            age: document.getElementById('post-animal-age').value,
            gender: document.getElementById('post-animal-gender').value,
            size: document.getElementById('post-animal-size').value,
            description: document.getElementById('post-animal-description').value,
            location: document.getElementById('post-animal-barangay').value,
            ownerId: currentUser.uid,
            ownerName: document.getElementById('post-owner-name').value,
            ownerEmail: document.getElementById('post-owner-email').value,
            ownerPhone: document.getElementById('post-owner-phone').value,
            status: 'available',
            createdAt: firebase.firestore.FieldValue.serverTimestamp ? 
                firebase.firestore.FieldValue.serverTimestamp() : new Date()
        };

        // Validate required fields
        if (!animalData.name || !animalData.type || !animalData.description || !animalData.location || !animalData.ownerName || !animalData.ownerEmail) {
            this.showNotification("Please fill in all required fields", "error");
            return;
        }

        const submitBtn = document.getElementById('submitPostAnimalBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
        submitBtn.disabled = true;

        try {
            let animalId;
            if (db) {
                const animalRef = await db.collection('animals').add(animalData);
                animalId = animalRef.id;
            } else {
                // Save locally
                animalId = 'animal_' + Date.now();
                animalData.id = animalId;
                const animals = JSON.parse(localStorage.getItem('treetails_animals') || '[]');
                animals.push(animalData);
                localStorage.setItem('treetails_animals', JSON.stringify(animals));
            }

            // Add to my listings
            const listings = JSON.parse(localStorage.getItem('treetails_my_listings') || '[]');
            listings.push({...animalData, id: animalId});
            localStorage.setItem('treetails_my_listings', JSON.stringify(listings));

            this.showNotification("Animal posted successfully!", "success");
            this.closePostAnimalForm();
            await this.loadAnimals(); // Refresh animals
            this.loadMyListings(); // Refresh my listings
        } catch (error) {
            this.showNotification(`Failed to post animal: ${error.message}`, "error");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    loadMyApplications() {
        const container = document.getElementById('applicationsContainer');
        const emptyState = document.getElementById('emptyApplicationsState');
        
        if (!container || !emptyState) return;

        if (!currentUser) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sign-in-alt"></i>
                    <h3>Please Sign In</h3>
                    <p>You need to sign in to view your applications.</p>
                    <button class="btn btn-primary" id="signInFromAppsBtn">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </button>
                </div>
            `;
            emptyState.style.display = 'none';

            // Add event listener to sign in button
            const signInBtn = document.getElementById('signInFromAppsBtn');
            if (signInBtn) {
                signInBtn.addEventListener('click', () => {
                    this.showSignInModal();
                });
            }
            return;
        }

        const loadData = async () => {
            try {
                let applications = [];

                if (db) {
                    const snapshot = await db.collection('applications')
                        .where('applicantId', '==', currentUser.uid)
                        .orderBy('submittedAt', 'desc')
                        .get();

                    applications = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } else {
                    const saved = localStorage.getItem('treetails_applications');
                    applications = saved ? JSON.parse(saved) : [];
                    applications = applications.filter(app => app.applicantId === currentUser.uid);
                }

                if (applications.length === 0) {
                    container.innerHTML = '';
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';
                let html = '';

                applications.forEach(app => {
                    const date = app.submittedAt?.toDate ? app.submittedAt.toDate().toLocaleDateString() : 
                                new Date(app.submittedAt).toLocaleDateString() || 'N/A';

                    html += `
                        <div class="application-card">
                            <div class="application-header">
                                <h4>${app.animalName}</h4>
                                <span class="application-status status-${app.status || 'pending'}">
                                    ${app.status || 'pending'}
                                </span>
                            </div>
                            <div class="application-details">
                                <p><strong>Animal Type:</strong> ${app.animalType}</p>
                                <p><strong>Submitted:</strong> ${date}</p>
                                <p><strong>Application ID:</strong> ${app.id}</p>
                            </div>
                            <div class="application-actions">
                                <button class="btn btn-small btn-outline view-letter-btn" data-id="${app.id}">
                                    <i class="fas fa-file-alt"></i> View Letter
                                </button>
                                <button class="btn btn-small download-letter-btn" data-id="${app.id}">
                                    <i class="fas fa-download"></i> Download
                                </button>
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = html;

                // Add event listeners to buttons
                container.querySelectorAll('.view-letter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const appId = e.target.closest('button').dataset.id;
                        this.showApplicationLetter(appId);
                    });
                });

                container.querySelectorAll('.download-letter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const appId = e.target.closest('button').dataset.id;
                        this.downloadApplicationLetter(appId);
                    });
                });

            } catch (error) {
                console.error('Error loading applications:', error);
                container.innerHTML = '<p>Error loading applications. Please try again.</p>';
            }
        };

        loadData();
    }

    loadMyListings() {
        const container = document.getElementById('myListingsContainer');
        const emptyState = document.getElementById('emptyListingsState');
        
        if (!container || !emptyState) return;

        if (!currentUser) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        const loadData = async () => {
            try {
                let listings = [];

                if (db) {
                    const snapshot = await db.collection('animals')
                        .where('ownerId', '==', currentUser.uid)
                        .orderBy('createdAt', 'desc')
                        .get();

                    listings = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } else {
                    const saved = localStorage.getItem('treetails_my_listings');
                    listings = saved ? JSON.parse(saved) : [];
                }

                if (listings.length === 0) {
                    container.innerHTML = '';
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';
                let html = '';

                listings.forEach(listing => {
                    const genderIcon = listing.gender === 'male' ? '♂' : '♀';
                    const typeIcon = listing.type === 'dog' ? 'fa-dog' : 'fa-cat';

                    html += `
                        <div class="animal-card" data-animal-id="${listing.id}">
                            <div class="animal-image">
                                <i class="fas ${typeIcon}"></i>
                            </div>
                            <div class="animal-info">
                                <div class="animal-name">${listing.name}</div>
                                <div class="animal-details">
                                    <p>Breed: ${listing.breed || 'Mixed'}</p>
                                    <p>Age: ${listing.age || 'Unknown'}</p>
                                    <p>Gender: ${genderIcon} ${listing.gender || 'Unknown'}</p>
                                    <p>Status: <span class="application-status status-${listing.status || 'available'}">${listing.status || 'available'}</span></p>
                                </div>
                                <div class="animal-actions">
                                    <button class="btn btn-small btn-primary view-listing-btn" data-id="${listing.id}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = html;

                // Add event listeners
                container.querySelectorAll('.view-listing-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const animalId = e.target.closest('button').dataset.id;
                        this.viewAnimalDetails(animalId);
                    });
                });

            } catch (error) {
                console.error('Error loading listings:', error);
                container.innerHTML = '<p>Error loading your listings. Please try again.</p>';
            }
        };

        loadData();
    }

    closeAnimalModal() {
        const modal = document.getElementById('animalModal');
        if (modal) modal.style.display = 'none';
    }

    closeAdoptionForm() {
        const modal = document.getElementById('adoptionFormModal');
        if (modal) modal.style.display = 'none';
        
        const form = document.getElementById('adoption-form');
        if (form) form.reset();
    }

    closePostAnimalForm() {
        const modal = document.getElementById('postAnimalModal');
        if (modal) modal.style.display = 'none';
        
        const form = document.getElementById('post-animal-form');
        if (form) form.reset();
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const tabContent = document.getElementById(tabName + 'Tab');
        if (tabContent) tabContent.classList.add('active');

        // Activate selected tab button
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) tabBtn.classList.add('active');

        // Load data for specific tabs
        if (tabName === 'applications') {
            this.loadMyApplications();
        } else if (tabName === 'mylistings') {
            this.loadMyListings();
        }
    }

    toggleBarangayFilter() {
        const grid = document.getElementById('brgyGrid');
        if (grid) {
            grid.classList.toggle('show');
        }
    }

    // Auth Functions
    showSignInModal() {
        const modal = document.getElementById('signInModal');
        if (modal) modal.style.display = 'block';
    }

    closeSignInModal() {
        const modal = document.getElementById('signInModal');
        if (modal) modal.style.display = 'none';
        
        const email = document.getElementById('login-email');
        const pass = document.getElementById('login-password');
        if (email) email.value = '';
        if (pass) pass.value = '';
    }

    showSignUpModal() {
        this.closeSignInModal();
        const modal = document.getElementById('signUpModal');
        if (modal) modal.style.display = 'block';
    }

    closeSignUpModal() {
        const modal = document.getElementById('signUpModal');
        if (modal) modal.style.display = 'none';
        
        const ids = ['signup-name', 'signup-email', 'signup-password', 'signup-phone'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }

    async signIn() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showNotification("Please fill in all fields", "error");
            return;
        }

        try {
            await auth.signInWithEmailAndPassword(email, password);
            this.showNotification("Successfully signed in!", "success");
            this.closeSignInModal();
        } catch (error) {
            this.showNotification(`Sign in failed: ${error.message}`, "error");
        }
    }

    async signUp() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const phone = document.getElementById('signup-phone').value;
        const role = document.getElementById('signup-role').value;

        if (!name || !email || !password) {
            this.showNotification("Please fill in required fields", "error");
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);

            // Update profile with name
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Create user document in Firestore
            if (db) {
                await db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    phone: phone || '',
                    role: role || 'animal_lover',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            this.showNotification("Account created successfully!", "success");
            this.closeSignUpModal();
        } catch (error) {
            this.showNotification(`Sign up failed: ${error.message}`, "error");
        }
    }

    async signOut() {
        try {
            await auth.signOut();
            this.showNotification("Successfully signed out", "success");
        } catch (error) {
            this.showNotification(`Sign out failed: ${error.message}`, "error");
        }
    }

    // Application Letter Functions
    async showApplicationLetter(applicationId) {
        try {
            let letter;
            currentApplicationId = applicationId;

            // Try to get from Firebase
            if (db) {
                const applicationDoc = await db.collection('applications').doc(applicationId).get();
                if (applicationDoc.exists) {
                    const application = applicationDoc.data();
                    letter = application.applicationLetter;
                }
            }

            // If not found in Firebase, try localStorage
            if (!letter) {
                const letters = JSON.parse(localStorage.getItem('treetails_application_letters') || '{}');
                letter = letters[applicationId];
            }

            if (!letter) {
                throw new Error("Application letter not found");
            }

            const content = document.getElementById('letterContent');
            if (content) content.textContent = letter;
            
            const modal = document.getElementById('letterModal');
            if (modal) modal.style.display = 'block';

        } catch (error) {
            console.error("Error showing letter:", error);
            this.showNotification("Failed to load application letter", "error");
        }
    }

    async downloadApplicationLetter(applicationId) {
        try {
            let letter;

            // Try to get from Firebase
            if (db) {
                const applicationDoc = await db.collection('applications').doc(applicationId).get();
                if (applicationDoc.exists) {
                    const application = applicationDoc.data();
                    letter = application.applicationLetter;
                }
            }

            // If not found in Firebase, try localStorage
            if (!letter) {
                const letters = JSON.parse(localStorage.getItem('treetails_application_letters') || '{}');
                letter = letters[applicationId];
            }

            if (!letter) {
                throw new Error("Application letter not found");
            }

            // Create a blob and download link
            const blob = new Blob([letter], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TreeTails_Application_${applicationId}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification("Application letter downloaded", "success");
        } catch (error) {
            console.error("Error downloading letter:", error);
            this.showNotification("Failed to download letter", "error");
        }
    }

    async printLetter(applicationId) {
        try {
            let letter;

            // Try to get from Firebase
            if (db) {
                const applicationDoc = await db.collection('applications').doc(applicationId).get();
                if (applicationDoc.exists) {
                    const application = applicationDoc.data();
                    letter = application.applicationLetter;
                }
            }

            // If not found in Firebase, try localStorage
            if (!letter) {
                const letters = JSON.parse(localStorage.getItem('treetails_application_letters') || '{}');
                letter = letters[applicationId];
            }

            if (!letter) {
                throw new Error("Application letter not found");
            }

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>TreeTails Adoption Application Letter</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                            pre { white-space: pre-wrap; font-family: 'Courier New', monospace; }
                            @media print {
                                .no-print { display: none; }
                                body { margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <button class="no-print" onclick="window.print()" style="margin-bottom: 20px; padding: 10px 20px; background: #0F7A5F; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Print Letter
                        </button>
                        <pre>${letter}</pre>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            console.error("Error printing letter:", error);
            this.showNotification("Failed to print letter", "error");
        }
    }

    closeLetterModal() {
        const modal = document.getElementById('letterModal');
        if (modal) modal.style.display = 'none';
        currentApplicationId = null;
    }

    showNotification(message, type = "info") {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.adoptionApp = new AdoptionApp();
});