// Enhanced Application Data with Local Storage
const appData = {
    locations: JSON.parse(localStorage.getItem('treetails_locations')) || [],
    currentPinMode: null,
    tempMarker: null,
    tempCoords: null,
    markers: [],
    map: null
};

// Enhanced Sample Data
const sampleLocations = [
    {
        id: 1,
        type: 'tree',
        name: 'Rizal Triangle Park',
        description: 'Perfect community park for planting native Narra trees. Large open space with good soil quality.',
        lat: 14.8386,
        lng: 120.2821,
        treeType: 'narra',
        priority: 'high',
        date: '2023-11-15',
        status: 'planned'
    },
    {
        id: 2,
        type: 'animal',
        name: 'Stray Dog Rescue',
        description: 'Friendly golden retriever mix, appears injured in left hind leg. Very gentle but needs medical attention.',
        lat: 14.8400,
        lng: 120.2800,
        animalType: 'dog',
        condition: 'injured',
        urgency: 'high',
        date: '2023-11-20',
        status: 'needs_help'
    },
    {
        id: 3,
        type: 'tree',
        name: 'Gordon Heights Elementary',
        description: 'School grounds ideal for educational tree planting program with students.',
        lat: 14.8350,
        lng: 120.2850,
        treeType: 'mango',
        priority: 'medium',
        date: '2023-11-18',
        status: 'planned'
    }
];

// Initialize application
function initApp() {
    initMap();
    setupEventListeners();
    loadInitialData();
    showToast('Welcome to TreeTails Map! 🗺️', 'info');
}

// Enhanced Map Initialization
function initMap() {
    // Set initial coordinates for Olongapo City
    const olongapoCoords = [14.8386, 120.2821];
    
    // Initialize the map with better options
    appData.map = L.map('map', {
        center: olongapoCoords,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true
    }).setView(olongapoCoords, 13);
    
    // Add OpenStreetMap tiles with better attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | TreeTails Olongapo',
        maxZoom: 18,
        minZoom: 10
    }).addTo(appData.map);

    // Add additional tile layer for variety (optional)
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.3
    }).addTo(appData.map);

    // Fix map size issues
    setTimeout(() => {
        appData.map.invalidateSize();
        // Add initial bounds for Olongapo area
        const bounds = L.latLngBounds(
            [14.80, 120.25],
            [14.87, 120.32]
        );
        appData.map.setMaxBounds(bounds);
    }, 100);

    // Add scale control
    L.control.scale({ imperial: false }).addTo(appData.map);
}

// Enhanced Event Listeners
function setupEventListeners() {
    // Map controls
    document.getElementById('addTreeBtn').addEventListener('click', () => enterPinMode('tree'));
    document.getElementById('addAnimalBtn').addEventListener('click', () => enterPinMode('animal'));
    document.getElementById('cancelPinMode').addEventListener('click', cancelPinMode);
    document.getElementById('resetViewBtn').addEventListener('click', resetMapView);

    // Modal controls
    document.getElementById('closeTreeModal').addEventListener('click', () => closeModal('treeModal'));
    document.getElementById('closeAnimalModal').addEventListener('click', () => closeModal('animalModal'));
    document.getElementById('cancelTree').addEventListener('click', () => closeModal('treeModal'));
    document.getElementById('cancelAnimal').addEventListener('click', () => closeModal('animalModal'));

    // Form submissions
    document.getElementById('treeForm').addEventListener('submit', handleTreeSubmit);
    document.getElementById('animalForm').addEventListener('submit', handleAnimalSubmit);

    // Search and filter with debouncing
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterLocations(), 300);
    });
    
    document.getElementById('typeFilter').addEventListener('change', filterLocations);

    // Map click handler for pin placement
    appData.map.on('click', function(e) {
        if (appData.currentPinMode) {
            handleMapClick(e);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Save data before unload
    window.addEventListener('beforeunload', saveToLocalStorage);
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 't':
                e.preventDefault();
                enterPinMode('tree');
                break;
            case 'a':
                e.preventDefault();
                enterPinMode('animal');
                break;
            case 'r':
                e.preventDefault();
                resetMapView();
                break;
        }
    }
    
    if (e.key === 'Escape') {
        cancelPinMode();
        closeModal('treeModal');
        closeModal('animalModal');
    }
}

// Enhanced Pin Mode Functions
function enterPinMode(type) {
    appData.currentPinMode = type;
    
    const pinModeIndicator = document.getElementById('pinModeIndicator');
    const pinModeText = document.getElementById('pinModeText');
    
    pinModeIndicator.classList.add('active', `${type}-mode`);
    pinModeText.textContent = `Click on the map to place a ${type === 'tree' ? '🌳 tree planting site' : '🐾 animal rescue location'}`;
    
    // Change cursor to indicate pin mode
    appData.map.getContainer().style.cursor = 'crosshair';
    
    const message = type === 'tree' 
        ? 'Click anywhere on the map to mark a tree planting location 🌱'
        : 'Click anywhere on the map to report an animal in need 🐕';
    
    showToast(message, 'info');
}

function cancelPinMode() {
    if (appData.tempMarker) {
        appData.map.removeLayer(appData.tempMarker);
        appData.tempMarker = null;
    }
    exitPinMode();
    showToast('Pin placement cancelled', 'info');
}

function exitPinMode() {
    appData.currentPinMode = null;
    const pinModeIndicator = document.getElementById('pinModeIndicator');
    pinModeIndicator.classList.remove('active', 'tree-mode', 'animal-mode');
    appData.map.getContainer().style.cursor = '';
}

function handleMapClick(e) {
    // Remove any existing temporary marker
    if (appData.tempMarker) {
        appData.map.removeLayer(appData.tempMarker);
    }
    
    // Add enhanced temporary marker
    const icon = appData.currentPinMode === 'tree' ? getTreeIcon() : getAnimalIcon();
    appData.tempMarker = L.marker(e.latlng, { 
        icon: icon, 
        zIndexOffset: 1000,
        draggable: true 
    }).addTo(appData.map);
    
    // Add popup with instructions
    const popupContent = appData.currentPinMode === 'tree' 
        ? '📍 Tree Planting Site<br><small>Drag to adjust position</small>'
        : '📍 Animal Rescue<br><small>Drag to adjust position</small>';
    
    appData.tempMarker.bindPopup(popupContent).openPopup();
    
    // Make marker draggable
    appData.tempMarker.on('dragend', function(e) {
        const marker = e.target;
        const position = marker.getLatLng();
        appData.tempCoords = position;
    });
    
    // Store the coordinates for form submission
    appData.tempCoords = e.latlng;
    
    // Show the appropriate modal
    const modalId = appData.currentPinMode === 'tree' ? 'treeModal' : 'animalModal';
    document.getElementById(modalId).style.display = 'flex';
    
    // Exit pin mode
    exitPinMode();
}

// Enhanced Map Icons
function getTreeIcon() {
    return L.divIcon({
        className: 'tree-marker',
        html: '<div style="background: linear-gradient(135deg, #2d5e3c 0%, #3a7a4e 100%); color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 1.2rem;">🌳</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

function getAnimalIcon() {
    return L.divIcon({
        className: 'animal-marker',
        html: '<div style="background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%); color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 1.2rem;">🐾</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

// Enhanced Form Handlers
function handleTreeSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('treeLocationName').value;
    const description = document.getElementById('treeDescription').value;
    const treeType = document.getElementById('treeType').value;
    const priority = document.getElementById('treePriority').value;
    
    const newLocation = {
        id: Date.now(),
        type: 'tree',
        name: name,
        description: description,
        lat: appData.tempCoords.lat,
        lng: appData.tempCoords.lng,
        treeType: treeType,
        priority: priority,
        date: new Date().toISOString().split('T')[0],
        status: 'planned',
        createdAt: new Date().toISOString()
    };
    
    appData.locations.push(newLocation);
    saveToLocalStorage();
    renderLocations();
    updateStats();
    
    document.getElementById('treeModal').style.display = 'none';
    document.getElementById('treeForm').reset();
    
    if (appData.tempMarker) {
        appData.map.removeLayer(appData.tempMarker);
        appData.tempMarker = null;
    }
    
    showToast('🌳 Tree planting site added successfully!', 'success');
}

function handleAnimalSubmit(e) {
    e.preventDefault();
    
    const animalType = document.getElementById('animalType').value;
    const condition = document.getElementById('animalCondition').value;
    const description = document.getElementById('animalDescription').value;
    const urgency = document.getElementById('animalUrgency').value;
    
    const newLocation = {
        id: Date.now(),
        type: 'animal',
        name: `${animalType.charAt(0).toUpperCase() + animalType.slice(1)} Rescue`,
        description: description,
        lat: appData.tempCoords.lat,
        lng: appData.tempCoords.lng,
        animalType: animalType,
        condition: condition,
        urgency: urgency,
        date: new Date().toISOString().split('T')[0],
        status: 'needs_help',
        createdAt: new Date().toISOString()
    };
    
    appData.locations.push(newLocation);
    saveToLocalStorage();
    renderLocations();
    updateStats();
    
    document.getElementById('animalModal').style.display = 'none';
    document.getElementById('animalForm').reset();
    
    if (appData.tempMarker) {
        appData.map.removeLayer(appData.tempMarker);
        appData.tempMarker = null;
    }
    
    showToast('🐾 Animal rescue location pinned successfully!', 'success');
}

// Enhanced Location Management
function renderLocations() {
    // Clear existing markers
    appData.markers.forEach(marker => appData.map.removeLayer(marker));
    appData.markers = [];
    
    // Clear sidebar lists
    document.getElementById('treeLocations').innerHTML = '';
    document.getElementById('animalLocations').innerHTML = '';
    
    // Sort locations by date (newest first)
    appData.locations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Add markers to map and sidebar
    appData.locations.forEach(location => {
        const icon = location.type === 'tree' ? getTreeIcon() : getAnimalIcon();
        const marker = L.marker([location.lat, location.lng], { icon: icon })
            .addTo(appData.map)
            .bindPopup(createEnhancedPopupContent(location));
        
        // Add click event to marker
        marker.on('click', function() {
            this.openPopup();
            // Center map on marker
            appData.map.setView([location.lat, location.lng], 16);
        });
        
        appData.markers.push(marker);
        
        // Add to sidebar
        addToEnhancedSidebar(location);
    });
    
    // Show empty states if no locations
    updateEmptyStates();
}

function createEnhancedPopupContent(location) {
    const typeIcon = location.type === 'tree' ? '🌳' : '🐾';
    const typeColor = location.type === 'tree' ? '#2d5e3c' : '#ff9800';
    const priorityIcon = getPriorityIcon(location.priority || location.urgency);
    
    return `
        <div style="min-width: 280px; font-family: 'Segoe UI', sans-serif;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${typeColor}20;">
                <span style="font-size: 1.5rem;">${typeIcon}</span>
                <h3 style="margin: 0; color: ${typeColor}; font-weight: 700;">${location.name}</h3>
            </div>
            
            <p style="margin: 0 0 15px 0; line-height: 1.5; color: #555;">${location.description}</p>
            
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                ${location.type === 'tree' ? 
                    `<p style="margin: 5px 0; font-size: 0.9em;"><strong>🌲 Tree Type:</strong> ${getTreeTypeName(location.treeType)}</p>
                     <p style="margin: 5px 0; font-size: 0.9em;"><strong>${priorityIcon} Priority:</strong> <span style="text-transform: capitalize;">${location.priority}</span></p>` : 
                    `<p style="margin: 5px 0; font-size: 0.9em;"><strong>🐕 Animal:</strong> ${location.animalType}</p>
                     <p style="margin: 5px 0; font-size: 0.9em;"><strong>🏥 Condition:</strong> ${location.condition}</p>
                     <p style="margin: 5px 0; font-size: 0.9em;"><strong>${priorityIcon} Urgency:</strong> <span style="text-transform: capitalize;">${location.urgency}</span></p>`
                }
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                <small style="color: #777;">📅 ${formatDate(location.date)}</small>
                <button onclick="deleteLocation(${location.id})" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9em; font-weight: 600;">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;
}

function addToEnhancedSidebar(location) {
    const locationItem = document.createElement('div');
    locationItem.className = `location-item ${location.type === 'animal' ? 'animal-rescue' : ''}`;
    
    const priorityIcon = getPriorityIcon(location.priority || location.urgency);
    const typeIcon = location.type === 'tree' ? '🌳' : '🐾';
    
    locationItem.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="font-size: 1.5rem; margin-top: 2px;">${typeIcon}</div>
            <div style="flex: 1;">
                <h4>${location.name}</h4>
                <p>${location.description}</p>
                <div class="location-meta">
                    <span>📅 ${formatDate(location.date)}</span>
                    <span class="badge ${location.type === 'tree' ? 'badge-tree' : 'badge-animal'}">
                        ${priorityIcon} ${location.type === 'tree' ? 'Tree Site' : 'Animal Rescue'}
                    </span>
                </div>
            </div>
        </div>
        <button class="delete-btn" onclick="event.stopPropagation(); deleteLocation(${location.id})" title="Delete location">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    locationItem.addEventListener('click', () => {
        appData.map.setView([location.lat, location.lng], 16);
        // Find and open the corresponding marker popup
        const marker = appData.markers.find(m => {
            const latLng = m.getLatLng();
            return latLng.lat === location.lat && latLng.lng === location.lng;
        });
        if (marker) {
            marker.openPopup();
        }
    });
    
    const container = location.type === 'tree' ? 
        document.getElementById('treeLocations') : 
        document.getElementById('animalLocations');
    container.appendChild(locationItem);
}

// Enhanced Utility Functions
function getPriorityIcon(priority) {
    const icons = {
        'high': '🔴',
        'medium': '🟡', 
        'low': '🟢'
    };
    return icons[priority] || '⚪';
}

function getTreeTypeName(type) {
    const types = {
        'narra': 'Narra (National Tree) 🇵🇭',
        'acacia': 'Acacia',
        'mango': 'Mango 🥭',
        'coconut': 'Coconut 🥥',
        'mahogany': 'Mahogany',
        'other': 'Other Native Species'
    };
    return types[type] || type;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function updateEmptyStates() {
    const treeLocations = appData.locations.filter(loc => loc.type === 'tree');
    const animalLocations = appData.locations.filter(loc => loc.type === 'animal');
    
    if (treeLocations.length === 0) {
        document.getElementById('treeLocations').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tree" style="color: #2d5e3c;"></i>
                <p>No tree planting sites yet</p>
                <small>Click "Add Tree Planting Site" to get started!</small>
            </div>
        `;
    }
    
    if (animalLocations.length === 0) {
        document.getElementById('animalLocations').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paw" style="color: #ff9800;"></i>
                <p>No animal rescue locations yet</p>
                <small>Click "Pin Animal Rescue" to report animals in need!</small>
            </div>
        `;
    }
}

function deleteLocation(locationId) {
    if (confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
        appData.locations = appData.locations.filter(loc => loc.id !== locationId);
        saveToLocalStorage();
        renderLocations();
        updateStats();
        showToast('Location deleted successfully', 'success');
    }
}

function filterLocations() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.getElementById('typeFilter').value;
    
    // Show/hide markers based on filter
    appData.markers.forEach((marker, index) => {
        const location = appData.locations[index];
        const matchesSearch = location.name.toLowerCase().includes(searchTerm) || 
                             location.description.toLowerCase().includes(searchTerm) ||
                             (location.treeType && getTreeTypeName(location.treeType).toLowerCase().includes(searchTerm)) ||
                             (location.animalType && location.animalType.toLowerCase().includes(searchTerm));
        const matchesType = filterType === 'all' || location.type === filterType;
        
        if (matchesSearch && matchesType) {
            appData.map.addLayer(marker);
        } else {
            appData.map.removeLayer(marker);
        }
    });
    
    // Update sidebar lists
    updateSidebarFilter(searchTerm, filterType);
}

function updateSidebarFilter(searchTerm, filterType) {
    const treeContainer = document.getElementById('treeLocations');
    const animalContainer = document.getElementById('animalLocations');
    
    treeContainer.innerHTML = '';
    animalContainer.innerHTML = '';
    
    const filteredLocations = appData.locations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchTerm) || 
                             location.description.toLowerCase().includes(searchTerm) ||
                             (location.treeType && getTreeTypeName(location.treeType).toLowerCase().includes(searchTerm)) ||
                             (location.animalType && location.animalType.toLowerCase().includes(searchTerm));
        const matchesType = filterType === 'all' || location.type === filterType;
        return matchesSearch && matchesType;
    });
    
    filteredLocations.forEach(location => {
        addToEnhancedSidebar(location);
    });
    
    updateEmptyStates();
}

function updateStats() {
    const treeCount = appData.locations.filter(loc => loc.type === 'tree').length;
    const animalCount = appData.locations.filter(loc => loc.type === 'animal').length;
    
    document.getElementById('treeCount').textContent = treeCount;
    document.getElementById('animalCount').textContent = animalCount;
    document.getElementById('totalCount').textContent = treeCount + animalCount;
}

function resetMapView() {
    appData.map.setView([14.8386, 120.2821], 13);
    showToast('🗺️ Map view reset to Olongapo City', 'info');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (appData.tempMarker) {
        appData.map.removeLayer(appData.tempMarker);
        appData.tempMarker = null;
    }
}

// Enhanced Toast System
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    toast.className = `toast ${type} show`;
    
    // Auto-hide after delay
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Local Storage Management
function saveToLocalStorage() {
    localStorage.setItem('treetails_locations', JSON.stringify(appData.locations));
}

function loadInitialData() {
    if (appData.locations.length === 0) {
        appData.locations = [...sampleLocations];
        saveToLocalStorage();
    }
    renderLocations();
    updateStats();
}

// Make functions available globally
window.deleteLocation = deleteLocation;
window.initApp = initApp;

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', initApp);