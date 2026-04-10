//Profile
function initProfileFeatures() {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const logoutModal = document.getElementById('logoutModal');

    if (!profileTrigger) return;

    // Toggle dropdown menu
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => profileDropdown.classList.remove('show'));

    // Edit profile button
    editProfileBtn.addEventListener('click', () => {
        editProfileModal.classList.add('show');
        profileDropdown.classList.remove('show');
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
        logoutModal.classList.add('show');
        profileDropdown.classList.remove('show');
    });

    // Close modals buttons
    ['closeEditModal', 'cancelEditModal'].forEach(id => document.getElementById(id).addEventListener('click', () => editProfileModal.classList.remove('show')));
    ['closeLogoutModal', 'cancelLogout'].forEach(id => document.getElementById(id).addEventListener('click', () => logoutModal.classList.remove('show')));

    // Confirm logout
    document.getElementById('confirmLogout').addEventListener('click', () => {
        window.location.href = "../login/login.html";
    });

    // Save profile changes
    document.getElementById('saveProfile').addEventListener('click', () => {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (newPassword && newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Save name to localStorage too (optional)
    const fullName = document.getElementById('fullName').value;
    if (fullName) localStorage.setItem('profileName', fullName);

    alert('Profile updated successfully!');
    editProfileModal.classList.remove('show');
});

    // Profile image preview — replace the existing listener with this
document.getElementById('profileImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;

            // Save to localStorage
            localStorage.setItem('profileImage', imageData);

            // Update the modal preview
            const avatarImg = document.getElementById('epAvatarImg');
            if (avatarImg) {
                avatarImg.src = imageData;
                avatarImg.style.display = 'block';
            }

            // Update the header avatar too
            const headerAvatar = document.querySelector('.avatar');
            if (headerAvatar) headerAvatar.src = imageData;
        };
        reader.readAsDataURL(file);
    }
});
}

function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');
    if (!sidebarToggle) return;

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
    });
}

function setActiveNavLink() {
    const currentPath = window.location.pathname; 
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        if (currentPath.endsWith(linkPath)) {
            link.classList.add('active');
        }
    });
}

// =====================
// Global Search
// =====================

const SEARCH_API_URL = '../adminBack_end/searchAPI.php';

const typeIcons = {
    Order: 'fa-shopping-cart',
    Product: 'fa-box',
    User: 'fa-user',
};
const typeColors = {
    Order: '#dbeafe',   // blue
    Product: '#dcfce7', // green
    User: '#fce7f3',    // pink
};
function initSearchBar() {
    const searchInput = document.querySelector('.search-input');
    const searchBar = document.querySelector('.search-bar');
    if (!searchInput || !searchBar) return;

    let searchDebounceTimer = null;
    let activeSearchController = null;

    // Create dropdown element
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    searchBar.appendChild(dropdown);

    function renderDropdown(query, results) {
        dropdown.innerHTML = '';

        if (!query) {
            dropdown.classList.remove('show');
            return;
        }

        if (results.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results">No results for "${query}"</div>`;
            dropdown.classList.add('show');
            return;
        }

        // Group results by type
        const grouped = results.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        Object.entries(grouped).forEach(([type, items]) => {
            const group = document.createElement('div');
            group.className = 'search-group';
            group.innerHTML = `<div class="search-group-label">${type}s</div>`;

            items.forEach(item => {
                const el = document.createElement('div');
                el.className = 'search-result-item';
                // REPLACE the el.innerHTML inside renderDropdown with this
                el.innerHTML = `
                    <div class="search-result-dot" style="background: ${typeColors[type] || '#e5e7eb'};"></div>
                    <div class="search-result-text">
                        <div class="search-result-label">${item.label}</div>
                        <div class="search-result-sublabel">${item.sublabel}</div>
                    </div>
                `;
                el.addEventListener('click', () => {
                    window.location.href = item.href;
                });
                group.appendChild(el);
            });

            dropdown.appendChild(group);
        });

        dropdown.classList.add('show');
    }

    function showSearchingState(query) {
        dropdown.innerHTML = `<div class="search-no-results">Searching for "${query}"...</div>`;
        dropdown.classList.add('show');
    }

    async function runSearch(query) {
        if (!query) {
            renderDropdown('', []);
            return;
        }

        if (activeSearchController) {
            activeSearchController.abort();
        }
        activeSearchController = new AbortController();

        showSearchingState(query);

        try {
            const response = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}&_=${Date.now()}`, {
                cache: 'no-store',
                signal: activeSearchController.signal
            });
            const json = await response.json();
            const results = Array.isArray(json.results) ? json.results : [];
            renderDropdown(query, results);
        } catch (error) {
            if (error.name === 'AbortError') return;
            dropdown.innerHTML = `<div class="search-no-results">Search failed. Please try again.</div>`;
            dropdown.classList.add('show');
        }
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }

        if (!query) {
            renderDropdown('', []);
            return;
        }

        searchDebounceTimer = setTimeout(() => {
            runSearch(query);
        }, 250);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            dropdown.classList.remove('show');
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    initProfileFeatures();
    initSidebarToggle();
    setActiveNavLink();
    initSearchBar();

    // Initialize notification page if elements exist
    if (document.getElementById('notificationsList')) {
        initNotificationsPage();
    }
});

// NOTIFICATIONS PAGE FUNCTIONS

const NOTIFICATIONS_API_URL = '../adminBack_end/notificationsAPI.php';
let pageNotifications = [];
let activeFilter = 'all';
let currentPage = 1;
const pageSize = 10;

const FILTER_LABELS = {
    all: 'All',
    order: 'Orders',
    payment: 'Payments',
    stock: 'Low stock',
    cancel: 'Cancellations',
    return: 'Returns',
    status: 'Status updates'
};

async function pageLoadNotifications() {
    try {
        const response = await fetch(`${NOTIFICATIONS_API_URL}?limit=200&_=${Date.now()}`, { cache: 'no-store' });
        const json = await response.json();
        pageNotifications = (json.notifications || []).map((item) => ({
            ...item,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        }));
    } catch (error) {
        pageNotifications = [];
    }
}

function pageSaveNotifications() {}

// Sync notifications with header
function syncHeaderNotifications() {
    if (typeof window.loadNotifications === 'function') {
        window.loadNotifications();
    }
}

// Filter notifications by type
function getFilteredNotifications() {
    if (activeFilter === 'all') return pageNotifications;
    return pageNotifications.filter((n) => n.type === activeFilter);
}

function getTotalPages(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    return Math.max(1, totalPages);
}

function getPagedNotifications(items) {
    const totalPages = getTotalPages(items.length);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
}

// Render pagination
function renderPagination(totalItems) {
    const paginationBar = document.getElementById('paginationBar');
    if (!paginationBar) return;
    paginationBar.innerHTML = '';
    if (totalItems === 0) {
        paginationBar.style.display = 'none';
        return;
    }
    paginationBar.style.display = 'flex';
    const totalPages = getTotalPages(totalItems);
    const createBtn = (text, page, disabled = false) => {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn';
        btn.innerHTML = text;
        btn.disabled = disabled;
        if (!disabled) {
            btn.onclick = () => {
                currentPage = page;
                renderNotificationPage();
            };
        }
        if (page === currentPage) btn.classList.add('active');
        return btn;
    };
    paginationBar.appendChild(createBtn('<', currentPage - 1, currentPage === 1));
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        paginationBar.appendChild(createBtn(i, i));
    }
    paginationBar.appendChild(createBtn('>', currentPage + 1, currentPage === totalPages));
}

// Update unread count
function updateUnreadSummary() {
    const unreadCount = pageNotifications.filter((n) => !n.read).length;
    const summary = document.getElementById('unreadSummary');
    if (!summary) return;
    if (unreadCount === 0) {
        summary.textContent = 'All caught up';
    } else {
        summary.textContent = `${unreadCount} unread`;
    }
}

// Format time relative
function formatRelativeTime(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// Render notifications list
function renderNotificationPage() {
    const list = document.getElementById('notificationsList');
    if (!list) return;
    const filteredItems = getFilteredNotifications();
    const items = getPagedNotifications(filteredItems);
    if (filteredItems.length === 0) {
        const label = FILTER_LABELS[activeFilter] || 'Notifications';
        list.innerHTML = `<li class="empty-state">No ${label.toLowerCase()} found.</li>`;
        renderPagination(0);
        return;
    }
    list.innerHTML = items.map((item) => {
        const readClass = item.read ? 'read' : 'unread';
        const type = item.type || 'general';
        const typeLabel = FILTER_LABELS[type] || 'General';
        return `
            <li class="notification-row ${readClass}" data-id="${item.id}" data-type="${type}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="notification-content">
                    <p class="notification-title">${item.title}</p>
                    <p class="notification-message">${item.message}</p>
                    <p class="notification-meta">
                        <span class="notification-type-pill ${type}">${typeLabel}</span>
                        <span class="notification-time-text">${formatRelativeTime(item.timestamp)}</span>
                    </p>
                </div>
            </li>
        `;
    }).join('');
    renderPagination(filteredItems.length);
}

// Mark as read
async function markNotificationAsRead(id) {
    const notification = pageNotifications.find((item) => item.id === id);
    if (!notification || notification.read) return;

    try {
        await fetch(NOTIFICATIONS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_read', id })
        });
        notification.read = true;
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }

    syncHeaderNotifications();
    updateUnreadSummary();
    renderNotificationPage();
}

// Get notification target URL
function getNotificationTargetUrl(notification) {
    if (!notification || !notification.type) return '';
    const customUrl = notification.data && notification.data.url;
    if (customUrl) return customUrl;
    const orderId = normalizeOrderId(
        (notification.data && notification.data.orderId) || extractOrderIdFromText(notification.message)
    );
    const productId =
        (notification.data && notification.data.productId) ||
        extractProductIdFromText(notification.message);
    switch (notification.type) {
        case 'order':
            return `orders.php?source=notification&orderId=${encodeURIComponent(orderId || '')}`;
        case 'payment':
            return `orders.php?source=notification&tab=payments&orderId=${encodeURIComponent(orderId || '')}`;
        case 'cancel':
            return `orders.php?source=notification&orderId=${encodeURIComponent(orderId || '')}`;
        case 'status':
            return `orders.php?source=notification&tab=status&orderId=${encodeURIComponent(orderId || '')}`;
        case 'return':
            return `orders.php?source=notification&tab=returns&orderId=${encodeURIComponent(orderId || '')}`;
        case 'stock':
            return `product.php?source=notification&tab=inventory&productId=${encodeURIComponent(productId || '')}`;
        default:
            return 'dashboard.php';
    }
}

// Extract order ID from text
function extractOrderIdFromText(text) {
    if (!text) return '';
    const match = text.match(/#([A-Za-z]+-\d+)/);
    return match ? match[1] : '';
}

// Extract product ID from text
function extractProductIdFromText(text) {
    if (!text) return '';
    const match = text.match(/\b(\d{1,3})\b/);
    return match ? match[1] : '';
}

// Normalize order ID
function normalizeOrderId(orderId) {
    if (!orderId) return '';
    const upper = String(orderId).toUpperCase();
    if (upper.startsWith('ORD-')) return upper;
    const numberMatch = upper.match(/(\d+)/);
    if (!numberMatch) return upper;
    const padded = numberMatch[1].padStart(3, '0');
    return `ORD-${padded}`;
}

// Open notification target
async function openNotificationTarget(id) {
    const notification = pageNotifications.find((item) => item.id === id);
    if (!notification) return;
    if (!notification.read) {
        await markNotificationAsRead(id);
    }
    const targetUrl = getNotificationTargetUrl(notification);
    if (targetUrl) {
        window.location.href = targetUrl;
    }
}

// Mark all as read
async function markAllAsRead() {
    try {
        await fetch(NOTIFICATIONS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_all_read' })
        });
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
    }

    pageNotifications.forEach((item) => {
        item.read = true;
    });
    syncHeaderNotifications();
    updateUnreadSummary();
    renderNotificationPage();
}

// Bind events
function bindNotificationEvents() {
    const filterPills = document.getElementById('filterPills');
    const list = document.getElementById('notificationsList');
    const markAllReadBtn = document.getElementById('markAllReadBtnPage');
    if (filterPills) {
        filterPills.addEventListener('click', (event) => {
            const pill = event.target.closest('.filter-pill');
            if (!pill) return;
            activeFilter = pill.dataset.filter || 'all';
            currentPage = 1;
            document.querySelectorAll('.filter-pill').forEach((btn) => {
                btn.classList.toggle('active', btn === pill);
            });
            renderNotificationPage();
        });
    }
    if (list) {
        list.addEventListener('click', (event) => {
            const row = event.target.closest('.notification-row');
            if (!row) return;
            const id = Number(row.dataset.id);
            openNotificationTarget(id);
        });
    }
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }
}

// Initialize notifications page
async function initNotificationsPage() {
    await pageLoadNotifications();
    bindNotificationEvents();
    initProfileFeatures();
    updateUnreadSummary();
    renderNotificationPage();
}

// ============================================================
// HEADER NOTIFICATIONS FUNCTIONS
// ============================================================

let notifications = [];
let showAllNotifications = false;
let notificationsInitialized = false;

function initNotifications() {
    if (notificationsInitialized) return;
    notificationsInitialized = true;

    const notificationTrigger = document.getElementById('notificationTrigger');
    if (!notificationTrigger) return;

    const notificationDropdown = document.getElementById('notificationDropdown') || document.querySelector('.notification-dropdown');
    const notificationList = document.getElementById('notificationList') || document.querySelector('.notification-list');
    const markAllReadBtn = document.querySelector('.mark-all-read');
    const viewAllBtn = document.getElementById('viewAllNotificationsBtn') || document.querySelector('.view-all-notifications');

    if (!notificationDropdown || !notificationList) return;

    notificationDropdown.style.zIndex = '1100';

    const toggleNotificationDropdown = (e) => {
        e.stopPropagation();
        const isCurrentlyShown = notificationDropdown.classList.contains('show');
        notificationDropdown.classList.toggle('show');

        if (!isCurrentlyShown) {
            showAllNotifications = false;
            notificationList.classList.remove('expanded');
            notificationDropdown.classList.remove('expanded');
            notificationList.style.maxHeight = '';
            renderNotifications();
        }

        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) {
            profileDropdown.classList.remove('show');
        }
    };

    notificationTrigger.addEventListener('click', toggleNotificationDropdown);
    notificationDropdown.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', (e) => {
        if (!notificationTrigger.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('show');
            showAllNotifications = false;
            notificationList.classList.remove('expanded');
            notificationDropdown.classList.remove('expanded');
            notificationList.style.maxHeight = '';
        }
    });

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fetch(NOTIFICATIONS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_all_read' })
            })
            .then(() => loadNotifications())
            .catch((error) => console.error('Failed to mark all notifications as read:', error));
        });
    }

    if (viewAllBtn) {
        viewAllBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            viewAllNotificationsHandler(e);
        };
    }

    loadNotifications();
}

document.addEventListener('click', (e) => {
    const viewAllButton = e.target.closest('.view-all-notifications');
    if (!viewAllButton) return;

    e.preventDefault();
    e.stopPropagation();
    viewAllNotificationsHandler(e);
});

function viewAllNotificationsHandler(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const currentPath = window.location.pathname || '';
    const adminMarker = '/admin/';
    const markerIndex = currentPath.toLowerCase().indexOf(adminMarker);

    if (markerIndex !== -1) {
        const adminBasePath = currentPath.slice(0, markerIndex + adminMarker.length);
        window.location.href = `${adminBasePath}notifications.php`;
        return;
    }

    window.location.href = 'admin/notifications.php';
}

window.viewAllNotificationsHandler = viewAllNotificationsHandler;

function addNotification(type, title, message, data = {}) {
    fetch(NOTIFICATIONS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', type, title, message, data })
    })
    .then(() => loadNotifications())
    .catch((error) => console.error('Failed to create notification:', error));
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function renderNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    const notificationsToShow = notifications.slice(0, 10);

    if (notificationsToShow.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-item">
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <i class="fas fa-bell-slash" style="font-size: 24px; margin-bottom: 8px;"></i>
                    <p>No notifications yet</p>
                </div>
            </div>
        `;
        return;
    }

    notificationList.innerHTML = notificationsToShow.map(notification => {
        const timeAgo = getTimeAgo(notification.timestamp);
        const iconClass = getNotificationIconClass(notification.type);
        const unreadClass = notification.read ? '' : 'unread';

        return `
            <div class="notification-item ${unreadClass}" onclick="handleNotificationClick(${notification.id})">
                <div class="notification-item-content">
                    <div class="notification-icon ${iconClass}">
                        <i class="fas ${getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-text">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function handleNotificationClick(notificationId) {
    const notification = markAsRead(notificationId);
    if (!notification) return;

    const targetUrl = getNotificationTargetUrl(notification);
    if (targetUrl) {
        window.location.href = targetUrl;
    }
}

function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        fetch(NOTIFICATIONS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_read', id: notificationId })
        })
        .then(() => {
            updateNotificationBadge();
            renderNotifications();
        })
        .catch((error) => console.error('Failed to mark notification as read:', error));
    }

    return notification || null;
}

function getNotificationIconClass(type) {
    const classes = {
        order: 'order',
        payment: 'payment',
        stock: 'stock',
        cancel: 'cancel',
        status: 'status',
        return: 'return'
    };
    return classes[type] || 'order';
}

function getNotificationIcon(type) {
    const icons = {
        order: 'fa-shopping-cart',
        payment: 'fa-credit-card',
        stock: 'fa-exclamation-triangle',
        cancel: 'fa-times-circle',
        status: 'fa-truck',
        return: 'fa-undo'
    };
    return icons[type] || 'fa-bell';
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function loadNotifications() {
    fetch(`${NOTIFICATIONS_API_URL}?limit=100&_=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((json) => {
            notifications = (json.notifications || []).map((item) => ({
                ...item,
                timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
            }));
            updateNotificationBadge();
            renderNotifications();
            showAllNotifications = false;
        })
        .catch((error) => {
            console.error('Failed to load notifications:', error);
            notifications = [];
            updateNotificationBadge();
            renderNotifications();
        });
}

document.addEventListener('DOMContentLoaded', initNotifications);