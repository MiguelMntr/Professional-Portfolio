// script.js

// --- Dropdown Management Functions ---

function toggleDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    closePhoneDropdown(); // Close phone dropdown if open

    const dropdown = document.getElementById('section-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

function closeDropdown() {
    const dropdown = document.getElementById('section-dropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

function togglePhoneDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    closeDropdown(); // Close section dropdown if open

    const phoneDropdown = document.getElementById('phone-dropdown');
    if (phoneDropdown) {
        phoneDropdown.classList.toggle('open');
    }
}

function closePhoneDropdown() {
    const phoneDropdown = document.getElementById('phone-dropdown');
    if (phoneDropdown) {
        phoneDropdown.classList.remove('open');
    }
}

// --- Global Event Listeners ---

// Close open dropdowns when clicking anywhere outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('section-dropdown');
    const phoneDropdown = document.getElementById('phone-dropdown');

    if (dropdown && dropdown.classList.contains('open') && !dropdown.contains(e.target)) {
        closeDropdown();
    }

    if (phoneDropdown && phoneDropdown.classList.contains('open') && !phoneDropdown.contains(e.target)) {
        closePhoneDropdown();
    }
});

// Close open dropdowns when pressing Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closeDropdown();
        closePhoneDropdown();
    }
});

// Global Filter State
let selectedTags = new Set();
let notificationTimeout = null;

// Clipboard Notification Logic
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add('show');

    if (notificationTimeout) clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Tab Switching
function switchTab(event, tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const searchControls = document.getElementById('search-controls');
    const emptyMessage = document.getElementById('no-projects-message');
    
    if (tabName === 'custom-search') {
        searchControls.style.display = 'flex';
        filterProjects();
    } else {
        searchControls.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'none';
        
        document.querySelectorAll('.tab-content').forEach(card => {
            if (card.classList.contains(tabName)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Custom Tag Filtering
function toggleTagFilter(element) {
    const tagName = element.getAttribute('data-tag').toLowerCase();

    if (selectedTags.has(tagName)) {
        selectedTags.delete(tagName);
        element.classList.remove('active');
    } else {
        selectedTags.add(tagName);
        element.classList.add('active');
    }

    filterProjects();
}

function filterProjects() {
    let visibleCount = 0;

    document.querySelectorAll('.tab-content').forEach(card => {
        const cardTags = (card.getAttribute('data-tags') || '').toLowerCase();

        let matches = true;
        selectedTags.forEach(tag => {
            if (!cardTags.includes(tag)) {
                matches = false;
            }
        });

        if (matches) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show or hide the empty state message
    const emptyMessage = document.getElementById('no-projects-message');
    if (emptyMessage) {
        emptyMessage.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
}

function clearAllFilters() {
    selectedTags.clear();
    document.querySelectorAll('.tag-pill').forEach(pill => pill.classList.remove('active'));
    filterProjects();
}

// Helper: Pause all videos inside a container (Modal or Page)
function pauseModalVideos(container) {
    if (!container) return;
    container.querySelectorAll('video').forEach(video => {
        video.pause();
    });
}

// Modal Mechanics
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        pauseModalVideos(modal);
        modal.classList.remove('active');
    }
}

function generateModalDots() {
    document.querySelectorAll('.modal-gallery').forEach(gallery => {
        const modal = gallery.closest('.modal');
        const modalId = modal ? modal.id : '';
        const items = gallery.querySelectorAll('.gallery-item');
        
        const existingDots = gallery.querySelector('.gallery-dots');
        if (existingDots) existingDots.remove();

        if (items.length <= 1) return;

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'gallery-dots';

        items.forEach((item, index) => {
            const dot = document.createElement('span');
            dot.className = `dot ${item.classList.contains('active') ? 'active' : ''}`;
            dot.onclick = () => setModalImage(modalId, index);
            dotsContainer.appendChild(dot);
        });

        gallery.appendChild(dotsContainer);
    });
}

// Refactored to reuse setModalImage logic for full video-control sync
function changeModalImage(modalId, direction) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const items = modal.querySelectorAll('.gallery-item');
    if (items.length <= 1) return;

    let currentIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
    let newIndex = (currentIndex + direction + items.length) % items.length;

    setModalImage(modalId, newIndex);
}

function setModalImage(modalId, targetIndex) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const items = modal.querySelectorAll('.gallery-item');
    const dots = modal.querySelectorAll('.dot');

    items.forEach((item, idx) => {
        item.classList.remove('active');
        
        // Pause videos on inactive slides
        const video = item.querySelector('video');
        if (video && idx !== targetIndex) {
            video.pause();
        }
    });

    dots.forEach(dot => dot.classList.remove('active'));

    if (items[targetIndex]) {
        items[targetIndex].classList.add('active');
        
        // Play video on the active slide
        const activeVideo = items[targetIndex].querySelector('video');
        if (activeVideo) {
            activeVideo.play().catch(e => console.log('Autoplay prevented:', e));
        }
    }
    
    if (dots[targetIndex]) {
        dots[targetIndex].classList.add('active');
    }
}

// Page Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initial tab layout setup
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const tabCategory = activeTab.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 'structural';
        document.querySelectorAll('.tab-content').forEach(card => {
            card.style.display = card.classList.contains(tabCategory) ? 'flex' : 'none';
        });
    }

    // Modal click bindings
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const modalId = card.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                
                // Play active video inside modal when opened
                const activeItem = modal.querySelector('.gallery-item.active');
                if (activeItem) {
                    const video = activeItem.querySelector('video');
                    if (video) video.play().catch(e => console.log('Autoplay prevented:', e));
                }

                // --- Google Analytics Event ---
                if (typeof gtag === 'function') {
                    const projectTitle = card.querySelector('.card-header-title')?.innerText || 'Project Card';
                    gtag('event', 'select_project', {
                        'project_name': projectTitle
                    });
                }
            }
        });
    });

    // Close modal on background click
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            pauseModalVideos(event.target);
            event.target.classList.remove('active');
        }
    });

    // Close modal on Escape key press
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                pauseModalVideos(activeModal);
                activeModal.classList.remove('active');
            }
        }
    });

    // Setup gallery pagination dots
    generateModalDots();
});

let autoCycleInterval = null;
let currentCycleIndex = 0;
let userHasSelected = false;

function initTimelineBackgrounds() {
    const items = document.querySelectorAll('.timeline-item.expandable');
    if (!items.length) return;

    const bgDisplay = document.getElementById('timeline-bg');
    
    // Set initial background image from active item or first expandable item
    const initialItem = document.querySelector('.timeline-item.expandable.active') || items[0];
    if (bgDisplay && initialItem) {
        changeBackgroundImage(initialItem.getAttribute('data-bg'));
    }

    startAutoCycle();
}

function startAutoCycle() {
    const items = document.querySelectorAll('.timeline-item.expandable');
    const bgDisplay = document.getElementById('timeline-bg');
    if (!items.length || !bgDisplay) return;

    // Reset lock flag when cycling starts
    userHasSelected = false;

    // Prevent duplicate timers stacking up
    if (autoCycleInterval) clearInterval(autoCycleInterval);

    autoCycleInterval = setInterval(() => {
        currentCycleIndex = (currentCycleIndex + 1) % items.length;
        const targetItem = items[currentCycleIndex];
        const bgUrl = targetItem.getAttribute('data-bg');

        if (bgUrl) {
            changeBackgroundImage(bgUrl);
        }
    }, 4000);
}

function stopAutoCycle() {
    userHasSelected = true;
    if (autoCycleInterval) {
        clearInterval(autoCycleInterval);
        autoCycleInterval = null;
    }
}

// selectTimelineCard
function selectTimelineCard(cardElement) {
    const isCurrentlyOpen = cardElement.classList.contains('active');

    // Remove active state from all items
    document.querySelectorAll('.timeline-item.expandable').forEach(item => {
        item.classList.remove('active');
    });

    if (!isCurrentlyOpen) {
        // Card Opened -> Lock auto-cycle & set image
        cardElement.classList.add('active');
        stopAutoCycle();

        const bgUrl = cardElement.getAttribute('data-bg');
        if (bgUrl) changeBackgroundImage(bgUrl);

        // --- Google Analytics Event ---
        if (typeof gtag === 'function') {
            const achievementTitle = cardElement.querySelector('.timeline-title')?.innerText || 'Achievement';
            gtag('event', 'view_achievement', {
                'achievement_title': achievementTitle
            });
        }
    } else {
        // Card Closed -> Resume auto-cycling!
        startAutoCycle();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTimelineBackgrounds();
});

function changeBackgroundImage(newBgUrl) {
    const bgDisplay = document.getElementById('timeline-bg');
    if (!bgDisplay || !newBgUrl) return;

    // 1. Fade out current background
    bgDisplay.classList.add('fade-out');

    // 2. Swap image and fade back in after 200ms
    setTimeout(() => {
        bgDisplay.style.backgroundImage = `url('${newBgUrl}')`;
        bgDisplay.classList.remove('fade-out');
    }, 200);
}

function toggleTimelineCard(cardElement) {
    const isCurrentlyOpen = cardElement.classList.contains('active');

    // 1. Close all open cards
    document.querySelectorAll('.timeline-card').forEach(card => {
        card.classList.remove('active');
    });

    // 2. If the clicked card wasn't already open, open it and pause auto-cycle
    if (!isCurrentlyOpen) {
        cardElement.classList.add('active');
        
        // Stop auto-cycling while user is inspecting a card
        stopAutoCycle(); 

        // Update image to the selected card's image
        const newBgUrl = cardElement.getAttribute('data-bg');
        if (newBgUrl) changeBackgroundImage(newBgUrl);

    } else {
        // 3. FIX: Card was closed -> Resume auto-cycling!
        startAutoCycle();
    }
}

// Function to explicitly open a modal by ID
function openModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('active');

    // Play active video inside modal if present
    const activeItem = modal.querySelector('.gallery-item.active');
    if (activeItem) {
        const video = activeItem.querySelector('video');
        if (video) video.play().catch(e => console.log('Autoplay prevented:', e));
    }

    // Google Analytics Event
    if (typeof gtag === 'function') {
        gtag('event', 'modal_open', {
            'modal_id': modalId
        });
    }
}

// Global click listener to intercept all <a href="#modal-xxx"> link clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#modal-"]');
    if (link) {
        e.preventDefault(); // Stop page from jumping down
        const modalId = link.getAttribute('href').substring(1);
        openModalById(modalId);
    }
});

// Open modal on initial page load if URL already contains #modal-xxx hash
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash && window.location.hash.startsWith('#modal-')) {
        const modalId = window.location.hash.substring(1);
        openModalById(modalId);
    }
});

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        pauseModalVideos(modal);
        modal.classList.remove('active');

        // Clean up URL hash without re-triggering a page scroll
        if (window.location.hash === `#${modalId}`) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }
}

// --- Updated Recommendations JS Logic ---

const recommendationsData = [
    {
        quote: "Miguel demonstrated exceptional technical autonomy, responsibility, and engineering maturity... he manufactured test specimens, defined production processes, managed inventory and created new workflows of his own initiative.",
        author: "Frederico Ribeiro",
        role: "Engineering Director at Adamastor",
        linkedin: "https://www.linkedin.com/in/frederico-tomé-ribeiro-26671335/",
        pdf: "./embedded_docs/RL for Miguel Monteiro - Frederico Ribeiro.pdf"
    },
    {
        quote: "Miguel brings a rare combination of technical mastery, work ethic, and clear communication. After working with him, I know firsthand how dependable, thorough, and capable he is.",
        author: "Miguel Damião",
        role: "Ex-Team Leader at FS FEUP",
        linkedin: "https://www.linkedin.com/in/migueldamiao/",
        pdf: "./embedded_docs/RL for Miguel Monteiro - Miguel Damião.pdf"
    },
    {
        quote: "Miguel showed a clear ability to plan and prioritize work to meet deadlines... His versatility and proactivity were decisive for the three podiums achieved in the first year.",
        author: "António Guedes",
        role: "Ex-Chief Mechanical Engineer at FS FEUP",
        linkedin: "https://www.linkedin.com/in/antónioguedes/",
        pdf: "./embedded_docs/RL for Miguel Monteiro - António Guedes.pdf"
    },
    {
        quote: "Miguel demonstrated exceptional dedication, independently learning the skills required to design critical components, including ... finite element simulations and analytical calculations he had not yet learned academically.",
        author: "Tiago Campos",
        role: "Ex-Team Member at FS FEUP",
        linkedin: "https://www.linkedin.com/in/tiago-campos-9937b4255/",
        pdf: "./embedded_docs/RL for Miguel Monteiro - Tiago Campos.pdf"
    }
];

let currentRecIndex = 0;
let recCycleInterval = null;

function renderRecommendations() {
    const menuContainer = document.getElementById('recommendations-menu');
    if (!menuContainer) return;

    menuContainer.innerHTML = '';

    recommendationsData.forEach((item, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = `rec-menu-item ${index === currentRecIndex ? 'active' : ''}`;
        
        menuItem.onmouseenter = () => {
            pauseRecommendationCycle();
            // Only update quote if hovering a card different from the active one
            if (currentRecIndex !== index) {
                selectRecommendation(index);
            }
        };
        
        menuItem.onmouseleave = () => {
            startRecommendationCycle();
        };

        menuItem.innerHTML = `
            <div class="rec-menu-item-header">
                <div>
                    <h5>${item.author}</h5>
                    <p>${item.role}</p>
                </div>
            </div>
            <div class="rec-card-actions">
                <a href="${item.pdf}" target="_blank" rel="noopener noreferrer" class="rec-action-btn" onclick="event.stopPropagation();">
                    <i class="fa-solid fa-file-pdf"></i> View Full Letter
                </a>

                <a href="${item.linkedin}" target="_blank" rel="noopener noreferrer" class="rec-action-btn" onclick="event.stopPropagation();">
                    <i class="fa-brands fa-linkedin"></i> Contact
                </a>
            </div>
        `;

        menuContainer.appendChild(menuItem);
    });

    displayRecommendation(currentRecIndex);
    startRecommendationCycle();
}

function displayRecommendation(index) {
    const item = recommendationsData[index];
    if (!item) return;

    const quoteContainer = document.getElementById('quote-text-container');
    const quoteEl = document.getElementById('recommendation-quote');

    if (quoteContainer && quoteEl) {
        quoteContainer.style.opacity = 0;
        setTimeout(() => {
            quoteEl.innerText = item.quote;
            quoteContainer.style.opacity = 1;
        }, 150);
    }

    // Update active highlight class on the right menu cards
    document.querySelectorAll('.rec-menu-item').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
    });
}

function selectRecommendation(index) {
    currentRecIndex = index;
    displayRecommendation(currentRecIndex);
}

function startRecommendationCycle() {
    if (recCycleInterval) clearInterval(recCycleInterval);
    recCycleInterval = setInterval(() => {
        currentRecIndex = (currentRecIndex + 1) % recommendationsData.length;
        displayRecommendation(currentRecIndex);
    }, 6000);
}

function pauseRecommendationCycle() {
    if (recCycleInterval) {
        clearInterval(recCycleInterval);
        recCycleInterval = null;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderRecommendations();
});