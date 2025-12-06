// Application Data

const appData = {
    currentUser: {
        name: "testlang",
        avatar: "TL"
    },
    posts: [
        {
            id: 1,
            author: "Green Earth Initiative",
            avatar: "GE",
            type: "event",
            title: "Community Tree Planting - This Saturday",
            content: "Join us this Saturday at Central Park for our monthly tree planting event. We'll be planting 50 native oak trees. Tools and refreshments provided!\n\nWhen: Saturday, 10 AM - 2 PM\nWhere: Central Park, Meeting at North Entrance",
            time: "2 hours ago",
            likes: 24,
            liked: false
        },
        {
            id: 2,
            author: "Sarah Chen",
            avatar: "SC",
            type: "alert",
            title: "Lost Dog - Golden Retriever",
            content: "Our family dog, Buddy, went missing yesterday near Oak Street Park. He's friendly, microchipped, and wearing a blue collar.\n\nLast Seen: Oak Street Park area\nContact: 555-1234",
            time: "5 hours ago",
            likes: 15,
            liked: false
        },
        {
            id: 3,
            author: "Olongapo City Environment Office",
            avatar: "OC",
            type: "announcement",
            title: "New Recycling Program Launch",
            content: "The City of Olongapo is launching a new recycling program starting next month. Separate your plastics, papers, and metals for collection every Wednesday.\n\nCollection Schedule:\n- Barangay Kalaklan: 8-10 AM\n- Barangay Gordon Heights: 10 AM-12 PM\n- Barangay New Cabalan: 1-3 PM",
            time: "1 day ago",
            likes: 42,
            liked: false
        }
    ],
    volunteerOpportunities: [
        {
            id: 1,
            title: "Olongapo Coastal Cleanup Drive",
            organization: "Save Olongapo Seas",
            date: "2023-11-25",
            time: "7:00 AM - 11:00 AM",
            location: "Waterfront Road, Olongapo City",
            volunteersNeeded: 50,
            volunteersJoined: 32,
            description: "Join us for a coastal cleanup along Olongapo's beautiful waterfront. We'll be removing plastic waste and debris to protect marine life. Gloves and bags will be provided.",
            category: "cleanup",
            joined: false
        },
        {
            id: 2,
            title: "Tree Planting at Gordon Heights",
            organization: "Olongapo Green Movement",
            date: "2023-12-02",
            time: "8:00 AM - 12:00 PM",
            location: "Gordon Heights, Olongapo City",
            volunteersNeeded: 30,
            volunteersJoined: 18,
            description: "Help us plant native trees in Gordon Heights to combat erosion and improve air quality in the community. No experience needed - we'll provide training!",
            category: "tree-planting",
            joined: false
        },
        {
            id: 3,
            title: "Urban Gardening Workshop",
            organization: "Olongapo Community Gardens",
            date: "2023-11-28",
            time: "2:00 PM - 5:00 PM",
            location: "Rizal Triangle, Olongapo City",
            volunteersNeeded: 20,
            volunteersJoined: 15,
            description: "Learn how to start your own urban garden and help maintain our community vegetable patches. Perfect for beginners!",
            category: "education",
            joined: false
        },
        {
            id: 4,
            title: "Recycling Awareness Campaign",
            organization: "Eco Warriors Olongapo",
            date: "2023-12-10",
            time: "9:00 AM - 3:00 PM",
            location: "SM Olongapo",
            volunteersNeeded: 25,
            volunteersJoined: 12,
            description: "Help educate the community about proper waste segregation and recycling practices. Bilingual volunteers especially needed!",
            category: "education",
            joined: true
        }
    ],
    myVolunteering: [
        {
            id: 4,
            title: "Recycling Awareness Campaign",
            organization: "Eco Warriors Olongapo",
            date: "2023-12-10",
            time: "9:00 AM - 3:00 PM",
            location: "SM Olongapo",
            status: "upcoming"
        },
        {
            id: 5,
            title: "Barretto Beach Cleanup",
            organization: "Save Olongapo Seas",
            date: "2023-10-15",
            time: "7:00 AM - 10:00 AM",
            location: "Barretto Beach, Olongapo",
            status: "completed"
        },
        {
            id: 6,
            title: "Mountain View Park Restoration",
            organization: "Olongapo Green Movement",
            date: "2023-09-20",
            time: "8:00 AM - 12:00 PM",
            location: "Mountain View Park, Olongapo",
            status: "completed"
        }
    ]
};

// DOM Elements
const postsContainer = document.getElementById('postsContainer');
const postInput = document.getElementById('postInput');
const postType = document.getElementById('postType');
const postBtn = document.getElementById('postBtn');
const deleteModal = document.getElementById('deleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const toast = document.getElementById('toast');
const volunteerOpportunities = document.getElementById('volunteerOpportunities');
const upcomingActivities = document.getElementById('upcomingActivities');
const pastActivities = document.getElementById('pastActivities');
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

// State variables
let postToDelete = null;

// Initialize the application
function initApp() {
    renderPosts();
    renderVolunteerOpportunities();
    renderMyVolunteering();
    setupEventListeners();
}

// Render posts to the DOM
function renderPosts() {
    postsContainer.innerHTML = '';
    
    if (appData.posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-slash"></i>
                <h3>No posts yet</h3>
                <p>Be the first to share something with the Olongapo community!</p>
            </div>
        `;
        return;
    }
    
    appData.posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create a post element
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    postElement.setAttribute('data-id', post.id);
    
    // Determine post type class and icon
    let typeClass = '';
    let typeIcon = '';
    
    switch(post.type) {
        case 'event':
            typeClass = 'event';
            typeIcon = 'fas fa-calendar-alt';
            break;
        case 'alert':
            typeClass = 'alert';
            typeIcon = 'fas fa-exclamation-triangle';
            break;
        case 'question':
            typeClass = 'question';
            typeIcon = 'fas fa-question-circle';
            break;
        default:
            typeClass = 'announcement';
            typeIcon = 'fas fa-bullhorn';
    }
    
    // Check if current user is the author
    const isCurrentUser = post.author === appData.currentUser.name;
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="author-avatar">${post.avatar}</div>
                <div class="author-info">
                    <div class="author-name">${post.author}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <span class="post-type ${typeClass}">
                <i class="${typeIcon}"></i> ${post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </span>
        </div>
        <div class="post-content">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-text">${post.content}</p>
        </div>
        <div class="post-actions">
            <button class="post-action like-btn ${post.liked ? 'liked' : ''}">
                <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                <span>${post.likes}</span>
            </button>
            ${isCurrentUser ? `
                <button class="post-action delete">
                    <i class="fas fa-trash"></i>
                    <span>Delete</span>
                </button>
            ` : ''}
        </div>
    `;
    
    // Add event listeners to action buttons
    const likeBtn = postElement.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => handleLike(post.id));
    
    // Add delete button listener if it exists
    if (isCurrentUser) {
        const deleteBtn = postElement.querySelector('.delete');
        deleteBtn.addEventListener('click', () => openDeleteModal(post.id));
    }
    
    return postElement;
}

// Render volunteer opportunities
function renderVolunteerOpportunities() {
    volunteerOpportunities.innerHTML = '';
    
    if (appData.volunteerOpportunities.length === 0) {
        volunteerOpportunities.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-hands-helping"></i>
                <h3>No volunteer opportunities available</h3>
                <p>Check back later for new cleanup drives and activities!</p>
            </div>
        `;
        return;
    }
    
    appData.volunteerOpportunities.forEach(opportunity => {
        const opportunityElement = createOpportunityElement(opportunity);
        volunteerOpportunities.appendChild(opportunityElement);
    });
}

// Create volunteer opportunity element
function createOpportunityElement(opportunity) {
    const opportunityElement = document.createElement('div');
    opportunityElement.className = 'opportunity-card';
    opportunityElement.setAttribute('data-id', opportunity.id);
    
    // Determine category badge
    let categoryText = '';
    
    switch(opportunity.category) {
        case 'cleanup':
            categoryText = 'Cleanup';
            break;
        case 'tree-planting':
            categoryText = 'Tree Planting';
            break;
        default:
            categoryText = 'Education';
    }
    
    // Calculate progress percentage
    const progressPercent = (opportunity.volunteersJoined / opportunity.volunteersNeeded) * 100;
    
    opportunityElement.innerHTML = `
        <div class="opportunity-header">
            <div>
                <h3 class="opportunity-title">${opportunity.title}</h3>
                <div class="opportunity-organization">
                    <i class="fas fa-users"></i>
                    <span>${opportunity.organization}</span>
                </div>
            </div>
            <span class="opportunity-badge">${categoryText}</span>
        </div>
        <div class="opportunity-details">
            <div class="opportunity-detail">
                <i class="far fa-calendar"></i>
                <span>${formatDate(opportunity.date)}</span>
            </div>
            <div class="opportunity-detail">
                <i class="far fa-clock"></i>
                <span>${opportunity.time}</span>
            </div>
            <div class="opportunity-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>${opportunity.location}</span>
            </div>
        </div>
        <p class="opportunity-description">${opportunity.description}</p>
        <div class="volunteer-stats">
            <div>
                <div class="volunteer-count">
                    <i class="fas fa-user-friends"></i>
                    <span>${opportunity.volunteersJoined} / ${opportunity.volunteersNeeded} volunteers</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            <button class="btn ${opportunity.joined ? 'btn-secondary' : 'btn-success'}" id="joinBtn-${opportunity.id}">
                <i class="fas ${opportunity.joined ? 'fa-check' : 'fa-plus'}"></i>
                ${opportunity.joined ? 'Joined' : 'Join'}
            </button>
        </div>
    `;
    
    // Add event listener to join button
    const joinBtn = opportunityElement.querySelector(`#joinBtn-${opportunity.id}`);
    joinBtn.addEventListener('click', () => handleJoinOpportunity(opportunity.id));
    
    return opportunityElement;
}

// Render my volunteering activities
function renderMyVolunteering() {
    upcomingActivities.innerHTML = '';
    pastActivities.innerHTML = '';
    
    const upcoming = appData.myVolunteering.filter(activity => activity.status === 'upcoming');
    const past = appData.myVolunteering.filter(activity => activity.status === 'completed');
    
    if (upcoming.length === 0) {
        upcomingActivities.innerHTML = `
            <div class="empty-state" style="padding: 30px;">
                <i class="far fa-calendar-check"></i>
                <p>No upcoming volunteer activities</p>
            </div>
        `;
    } else {
        upcoming.forEach(activity => {
            const activityElement = createMyVolunteeringElement(activity);
            upcomingActivities.appendChild(activityElement);
        });
    }
    
    if (past.length === 0) {
        pastActivities.innerHTML = `
            <div class="empty-state" style="padding: 30px;">
                <i class="fas fa-history"></i>
                <p>No past volunteer activities</p>
            </div>
        `;
    } else {
        past.forEach(activity => {
            const activityElement = createMyVolunteeringElement(activity);
            pastActivities.appendChild(activityElement);
        });
    }
}

// Create my volunteering element
function createMyVolunteeringElement(activity) {
    const activityElement = document.createElement('div');
    activityElement.className = 'volunteering-item';
    
    activityElement.innerHTML = `
        <div class="volunteering-info">
            <h4>${activity.title}</h4>
            <p>${formatDate(activity.date)} • ${activity.time} • ${activity.organization}</p>
        </div>
        <span class="volunteering-status ${activity.status === 'upcoming' ? 'status-upcoming' : 'status-completed'}">
            ${activity.status === 'upcoming' ? 'Upcoming' : 'Completed'}
        </span>
    `;
    
    return activityElement;
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Handle like action
function handleLike(postId) {
    const post = appData.posts.find(p => p.id === postId);
    if (post) {
        if (post.liked) {
            post.likes--;
            post.liked = false;
            showToast('Like removed', 'info');
        } else {
            post.likes++;
            post.liked = true;
            showToast('Post liked!', 'success');
        }
        renderPosts();
    }
}

// Handle join opportunity
function handleJoinOpportunity(opportunityId) {
    const opportunity = appData.volunteerOpportunities.find(o => o.id === opportunityId);
    if (opportunity) {
        if (opportunity.joined) {
            opportunity.joined = false;
            opportunity.volunteersJoined--;
            showToast('You left the volunteer opportunity', 'info');
            
            // Remove from my volunteering if it exists
            const index = appData.myVolunteering.findIndex(a => a.id === opportunityId);
            if (index !== -1) {
                appData.myVolunteering.splice(index, 1);
            }
        } else {
            opportunity.joined = true;
            opportunity.volunteersJoined++;
            showToast('You joined the volunteer opportunity!', 'success');
            
            // Add to my volunteering
            appData.myVolunteering.push({
                id: opportunity.id,
                title: opportunity.title,
                organization: opportunity.organization,
                date: opportunity.date,
                time: opportunity.time,
                location: opportunity.location,
                status: 'upcoming'
            });
        }
        renderVolunteerOpportunities();
        renderMyVolunteering();
    }
}

// Open delete confirmation modal
function openDeleteModal(postId) {
    postToDelete = postId;
    deleteModal.style.display = 'flex';
}

// Close delete confirmation modal
function closeDeleteModal() {
    postToDelete = null;
    deleteModal.style.display = 'none';
}

// Handle post deletion
function handleDelete() {
    if (postToDelete) {
        // Find post index
        const postIndex = appData.posts.findIndex(p => p.id === postToDelete);
        
        if (postIndex !== -1) {
            // Remove post from array
            appData.posts.splice(postIndex, 1);
            
            // Re-render posts
            renderPosts();
            
            // Close modal and show success message
            closeDeleteModal();
            showToast('Post deleted successfully', 'success');
        }
    }
}

// Handle new post creation
function handleNewPost() {
    const content = postInput.value.trim();
    const type = postType.value;
    
    if (!content) {
        showToast('Please enter some content for your post', 'warning');
        return;
    }
    
    // Extract title from content (first line or first 50 chars)
    let title = content.split('\n')[0];
    if (title.length > 50) {
        title = title.substring(0, 50) + '...';
    }
    
    // Create new post
    const newPost = {
        id: Date.now(), // Simple ID generation
        author: appData.currentUser.name,
        avatar: appData.currentUser.avatar,
        type: type,
        title: title,
        content: content,
        time: 'Just now',
        likes: 0,
        liked: false
    };
    
    // Add to beginning of posts array
    appData.posts.unshift(newPost);
    
    // Re-render posts and clear input
    renderPosts();
    postInput.value = '';
    
    // Show success message
    showToast('Your post has been published!', 'success');
}

// Handle tab switching
function handleTabSwitch(tabId) {
    // Update active tab
    navTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update active content
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    // Set icon based on type
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    if (type === 'error') icon = 'fas fa-times-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    // Set background color based on type
    if (type === 'success') {
        toast.style.background = 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)';
    } else if (type === 'warning') {
        toast.style.background = 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)';
    } else if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    } else {
        toast.style.background = 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)';
    }
    
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Set up event listeners
function setupEventListeners() {
    // Post button
    postBtn.addEventListener('click', handleNewPost);
    
    // Enter key to post (with Shift+Enter for new line)
    postInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNewPost();
        }
    });
    
    // Delete modal actions
    cancelDelete.addEventListener('click', closeDeleteModal);
    confirmDelete.addEventListener('click', handleDelete);
    
    // Close modal when clicking outside
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
    
    // Tab switching
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            handleTabSwitch(tabId);
        });
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);