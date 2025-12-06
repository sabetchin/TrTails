// Page routing functionality
function loadPage(page) {
    const mainContent = document.getElementById('mainContent');
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === page) {
            link.classList.add('active');
        }
    });
    
    // Load different content based on page
    if (page === 'account.html') {
        mainContent.innerHTML = `
            <div class="account-page">
                <div class="header">
                    <div class="logo">
                        <div class="logo-icon">👤</div>
                        <div class="logo-text">My Account</div>
                    </div>
                    <p class="tagline">Manage your TreeTails profile and preferences</p>
                </div>
                
                <div class="card">
                    <div class="account-tabs">
                        <button class="account-tab active" data-tab="profile">Profile</button>
                        <button class="account-tab" data-tab="settings">Settings</button>
                        <button class="account-tab" data-tab="privacy">Privacy</button>
                        <button class="account-tab" data-tab="notifications">Notifications</button>
                    </div>
                    
                    <div class="account-content active" id="profile-content">
                        <div class="profile-header">
                            <div class="profile-avatar">TL</div>
                            <div class="profile-info">
                                <h2>testlang</h2>
                                <p><i class="fas fa-map-marker-alt"></i> Olongapo City, Philippines</p>
                                <p><i class="fas fa-user-tag"></i> Community Member since 2023</p>
                                <button class="btn btn-primary" style="margin-top: 10px;">
                                    <i class="fas fa-camera"></i> Change Avatar
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name</label>
                                <input type="text" id="firstName" class="form-control" value="Test">
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name</label>
                                <input type="text" id="lastName" class="form-control" value="Lang">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" class="form-control" value="testlang@example.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" class="form-control" value="+63 912 345 6789">
                        </div>
                        
                        <div class="form-group">
                            <label for="bio">Bio</label>
                            <textarea id="bio" class="form-control" rows="4">Passionate about environmental conservation and animal welfare. Active volunteer with TreeTails since 2023.</textarea>
                        </div>
                        
                        <button class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                    
                    <div class="account-content" id="settings-content">
                        <h3 style="margin-bottom: 20px; color: var(--primary);">Account Settings</h3>
                        
                        <div class="form-group">
                            <label for="language">Language</label>
                            <select id="language" class="form-control">
                                <option>English</option>
                                <option>Filipino</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="timezone">Timezone</label>
                            <select id="timezone" class="form-control">
                                <option>Philippine Standard Time (UTC+8)</option>
                                <option>Other timezone</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="theme">Theme</label>
                            <select id="theme" class="form-control">
                                <option>Light</option>
                                <option>Dark</option>
                                <option>Auto</option>
                            </select>
                        </div>
                        
                        <button class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Settings
                        </button>
                    </div>
                    
                    <div class="account-content" id="privacy-content">
                        <h3 style="margin-bottom: 20px; color: var(--primary);">Privacy Settings</h3>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" checked>
                                Show my profile to other members
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" checked>
                                Allow direct messages from other members
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox">
                                Show my activity on the public feed
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" checked>
                                Receive email notifications
                            </label>
                        </div>
                        
                        <button class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Privacy Settings
                        </button>
                    </div>
                    
                    <div class="account-content" id="notifications-content">
                        <h3 style="margin-bottom: 20px; color: var(--primary);">Notification Preferences</h3>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" checked>
                                New events in my area
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" checked>
                                Animal rescue alerts
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox">
                                Community announcements
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" checked>
                                Volunteer opportunities
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" checked>
                                Adoption updates
                            </label>
                        </div>
                        
                        <button class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Notification Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize account tabs
        const accountTabs = document.querySelectorAll('.account-tab');
        const accountContents = document.querySelectorAll('.account-content');
        
        accountTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                accountTabs.forEach(t => t.classList.remove('active'));
                accountContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });
        
    } else if (page === 'logout.html') {
        mainContent.innerHTML = `
            <div class="logout-page">
                <div class="logout-icon">
                    <i class="fas fa-sign-out-alt"></i>
                </div>
                <h1 style="margin-bottom: 15px; color: var(--primary);">Logout</h1>
                <p style="margin-bottom: 30px; color: var(--gray); font-size: 1.1rem;">
                    Are you sure you want to logout from TreeTails?
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="btn btn-primary" id="confirmLogout">
                        <i class="fas fa-check"></i> Yes, Logout
                    </button>
                    <button class="btn" style="background: var(--light-gray);" id="cancelLogout">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
        
        // Add logout functionality
        document.getElementById('confirmLogout').addEventListener('click', function() {
            alert('You have been logged out successfully. Redirecting to login page...');
            // In a real app, this would redirect to login page
            // window.location.href = 'login.html';
        });
        
        document.getElementById('cancelLogout').addEventListener('click', function() {
            // Go back to home page
            loadPage('index.html');
        });
        
    } else {
        // Default to home page
        // This would be the original home page content
        // For simplicity, we're keeping the home page as default
    }
}

// Mobile menu functionality
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
    } else {
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// User dropdown functionality
const userAvatar = document.getElementById('userAvatar');
const userDropdown = document.getElementById('userDropdown');

userAvatar.addEventListener('click', function(e) {
    e.stopPropagation();
    userDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', function() {
    userDropdown.classList.remove('active');
});

// Navigation click handlers
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.getAttribute('href');
        loadPage(page);
        
        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

// Search functionality
const globalSearch = document.getElementById('globalSearch');
const searchBtn = document.getElementById('searchBtn');

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const searchTerm = globalSearch.value.trim();
        if (searchTerm) {
            alert(`Searching for: ${searchTerm}`);
            // In a real app, this would trigger a search
        }
    });

    globalSearch.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Navigation buttons
if (document.getElementById('viewBulletinBtn')) {
    document.getElementById('viewBulletinBtn').addEventListener('click', function() {
        alert('Redirecting to Bulletin page...');
        // window.location.href = 'bulletin.html';
    });
}

if (document.getElementById('viewAnimalsBtn')) {
    document.getElementById('viewAnimalsBtn').addEventListener('click', function() {
        alert('Redirecting to Adoption page...');
        // window.location.href = 'adoption.html';
    });
}

if (document.getElementById('viewMapBtn')) {
    document.getElementById('viewMapBtn').addEventListener('click', function() {
        alert('Redirecting to Map page...');
        // window.location.href = 'map.html';
    });
}

if (document.getElementById('volunteerBtn')) {
    document.getElementById('volunteerBtn').addEventListener('click', function() {
        alert('Thank you for your interest in volunteering! A representative will contact you soon.');
    });
}

// Education tabs functionality
const educationTabs = document.querySelectorAll('.education-tab');
const educationContents = document.querySelectorAll('.education-content');

educationTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        educationTabs.forEach(t => t.classList.remove('active'));
        educationContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(`${tabId}-content`).classList.add('active');
    });
});

// Animate progress bars on page load
window.addEventListener('load', function() {
    const progressFills = document.querySelectorAll('.progress-fill');
    progressFills.forEach(fill => {
        const width = fill.style.width;
        fill.style.width = '0';
        setTimeout(() => {
            fill.style.width = width;
        }, 500);
    });
});

// Enhanced Chatbot functionality
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');

chatbotToggle.addEventListener('click', function() {
    chatbotWindow.classList.toggle('active');
    // Remove pulse animation when opened
    chatbotToggle.classList.remove('pulse');
});

chatbotClose.addEventListener('click', function() {
    chatbotWindow.classList.remove('active');
    // Restore pulse animation when closed
    chatbotToggle.classList.add('pulse');
});

// Chatbot responses with more context
const chatbotResponses = {
    'hello': {
        text: 'Hello! How can I assist you with TreeTails today?',
        quickReplies: ['Tree Planting', 'Animal Rescue', 'Events', 'Volunteering']
    },
    'hi': {
        text: 'Hi there! What can I help you with?',
        quickReplies: ['Tree Planting', 'Animal Rescue', 'Events', 'Volunteering']
    },
    'tree planting': {
        text: 'Tree planting events are held regularly throughout Olongapo. We have 120 active planting sites and are always looking for volunteers! Would you like to know about upcoming planting events or how to start your own planting initiative?',
        quickReplies: ['Upcoming Events', 'Start Planting', 'Volunteer', 'Map Locations']
    },
    'animal rescue': {
        text: 'Our animal rescue program helps injured and abandoned animals across Olongapo. We currently have 58 active rescues. You can report an animal in need on our Map page or learn about our adoption program.',
        quickReplies: ['Report Animal', 'Adoption', 'Volunteer', 'Donate']
    },
    'events': {
        text: 'We have several upcoming events! This Saturday there\'s a community cleanup at Rizal Triangle Park, and next Wednesday we have an animal rescue training workshop. Check the Events section in the sidebar for all details.',
        quickReplies: ['Tree Planting Events', 'Rescue Workshops', 'Community Cleanups', 'All Events']
    },
    'volunteer': {
        text: 'That\'s wonderful! We have 3,200 volunteers in our community. You can sign up using the "Become a Volunteer" button in the sidebar. We need help with tree planting, animal rescue, event organization, and more!',
        quickReplies: ['Sign Up', 'Tree Planting', 'Animal Rescue', 'Events']
    },
    'adoption': {
        text: 'Our adoption program has successfully placed 156 animals in loving homes! You can view available animals on the Adoption page. All animals are vaccinated and spayed/neutered before adoption.',
        quickReplies: ['View Animals', 'Adoption Process', 'Foster Program', 'Success Stories']
    },
    'map': {
        text: 'Our interactive map shows all tree planting sites, animal rescue locations, and upcoming events across Olongapo. You can also report new locations or animals in need directly through the map.',
        quickReplies: ['View Map', 'Report Location', 'Report Animal', 'Directions']
    },
    'bulletin': {
        text: 'The Bulletin is our community message board where members can share updates, ask questions, and coordinate activities. You\'ll find the latest community news and announcements there.',
        quickReplies: ['View Bulletin', 'Create Post', 'Community News', 'Questions']
    },
    'help': {
        text: 'I can help with information about tree planting, animal rescue, events, volunteering, adoption, and more! Just ask me anything about TreeTails.',
        quickReplies: ['Tree Planting', 'Animal Rescue', 'Events', 'Volunteering']
    },
    'default': {
        text: 'I\'m not sure I understand. Can you try asking about tree planting, animal rescue, events, or volunteering? I\'m here to help with anything TreeTails related!',
        quickReplies: ['Tree Planting', 'Animal Rescue', 'Events', 'Help']
    }
};

function addMessage(text, isUser = false, quickReplies = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user' : 'bot');
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        ${text}
        <div class="message-time">${time}</div>
    `;
    
    if (quickReplies && !isUser) {
        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.classList.add('quick-replies');
        
        quickReplies.forEach(reply => {
            const button = document.createElement('button');
            button.classList.add('quick-reply');
            button.textContent = reply;
            button.setAttribute('data-query', reply.toLowerCase());
            quickRepliesDiv.appendChild(button);
        });
        
        messageDiv.appendChild(quickRepliesDiv);
    }
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function processMessage(message) {
    const lowerMessage = message.toLowerCase();
    let response = chatbotResponses.default;
    
    // Find the best matching response
    for (const key in chatbotResponses) {
        if (lowerMessage.includes(key)) {
            response = chatbotResponses[key];
            break;
        }
    }
    
    // Simulate typing delay
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage(response.text, false, response.quickReplies);
    }, 1000 + Math.random() * 1000);
}

chatbotSend.addEventListener('click', function() {
    const message = chatbotInput.value.trim();
    if (message) {
        addMessage(message, true);
        chatbotInput.value = '';
        processMessage(message);
    }
});

chatbotInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        chatbotSend.click();
    }
});

// Quick reply functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('quick-reply')) {
        const query = e.target.getAttribute('data-query');
        addMessage(e.target.textContent, true);
        processMessage(query);
    }
});

// Auto-open chatbot after 5 seconds if not interacted with
setTimeout(() => {
    if (!chatbotWindow.classList.contains('active')) {
        chatbotToggle.classList.add('pulse');
    }
}, 5000);

// Small enhancement: focus search on "/search" hash or url param
(function(){
    const q = new URLSearchParams(location.search).get('q');
    if(q) {
        const s = document.getElementById('globalSearch');
        if(s){ 
            s.value = q; 
            s.focus(); 
        }
    }
})();

<script src="i.js"></script>