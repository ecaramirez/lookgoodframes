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

const globalSearchData = [
    // Orders
    { type: 'Order', label: '#1234 — Erica Ramirez', sublabel: 'Shipped · ₱245', href: '/order/order.html' },
    { type: 'Order', label: '#1235 — Pollyne Bartolome', sublabel: 'Pending · ₱180', href: '/order/order.html' },
    { type: 'Order', label: '#1236 — Aahron Bautista', sublabel: 'Cancelled · ₱320', href: '/order/order.html' },

    // Products
    { type: 'Product', label: 'Classic Aviator Frame', sublabel: 'Women · ₱245', href: '/product/product.html' },
    { type: 'Product', label: 'Round Metal Frame', sublabel: 'Unisex · ₱310', href: '/product/product.html' },

    // Users
    { type: 'User', label: 'Erica Ramirez', sublabel: 'ericakes.ramirez@lookgoodframes.com', href: '/user/user.html' },
    { type: 'User', label: 'Pollyne Bartolome', sublabel: 'pollyne@email.com', href: '/user/user.html' },
];

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

    // Create dropdown element
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    searchBar.appendChild(dropdown);

    function renderDropdown(query) {
        dropdown.innerHTML = '';

        if (!query) {
            dropdown.classList.remove('show');
            return;
        }

        const results = globalSearchData.filter(item =>
            item.label.toLowerCase().includes(query) ||
            item.sublabel.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
        );

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

    searchInput.addEventListener('input', (e) => {
        renderDropdown(e.target.value.trim().toLowerCase());
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

const STORAGE_KEY = 'adminNotifications';
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

// Load notifications from local storage
function pageLoadNotifications() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        pageNotifications = [];
        return;
    }
    try {
        const parsed = JSON.parse(raw);
        pageNotifications = (parsed.notifications || []).map((item) => ({
            ...item,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        }));
    } catch (error) {
        pageNotifications = [];
    }
}

// Save notifications to local storage
function pageSaveNotifications() {
    const raw = localStorage.getItem(STORAGE_KEY);
    let counter = 1;
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            counter = parsed.counter || counter;
        } catch (error) {
            counter = 1;
        }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        notifications: pageNotifications,
        counter
    }));
}

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
function markNotificationAsRead(id) {
    const notification = pageNotifications.find((item) => item.id === id);
    if (!notification || notification.read) return;
    notification.read = true;
    pageSaveNotifications();
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
            return `/order/order.html?source=notification&action=open-order&orderId=${encodeURIComponent(orderId || '')}&focus=summary`;
        case 'payment':
            return `/order/order.html?source=notification&action=open-payment&orderId=${encodeURIComponent(orderId || '')}&tab=payments`;
        case 'cancel':
            return `/order/order.html?source=notification&action=open-order&orderId=${encodeURIComponent(orderId || '')}&focus=summary`;
        case 'status':
            return `/order/order.html?source=notification&action=open-order&orderId=${encodeURIComponent(orderId || '')}&focus=timeline`;
        case 'return':
            return `/order/order.html?source=notification&action=open-order&orderId=${encodeURIComponent(orderId || '')}&focus=return&details=${encodeURIComponent(notification.message || '')}`;
        case 'stock':
            return `/product/product.html?source=notification&tab=inventory&productId=${encodeURIComponent(productId || '')}`;
        default:
            return '/dashboard/dashboard.html';
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
function openNotificationTarget(id) {
    const notification = pageNotifications.find((item) => item.id === id);
    if (!notification) return;
    if (!notification.read) {
        markNotificationAsRead(id);
    }
    const targetUrl = getNotificationTargetUrl(notification);
    if (targetUrl) {
        window.location.href = targetUrl;
    }
}

// Mark all as read
function markAllAsRead() {
    pageNotifications.forEach((item) => {
        item.read = true;
    });
    pageSaveNotifications();
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
function initNotificationsPage() {
    pageLoadNotifications();
    bindNotificationEvents();
    initProfileFeatures();
    updateUnreadSummary();
    renderNotificationPage();
}

// ============================================================
// HEADER NOTIFICATIONS FUNCTIONS
// ============================================================

let notifications = [];
let notificationIdCounter = 1;
let showAllNotifications = false;
let notificationsInitialized = false;
const SAMPLE_NOTIFICATIONS_VERSION = '2026-04-09';

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
            notifications.forEach(notification => {
                notification.read = true;
            });
            saveNotificationsToStorage();
            updateNotificationBadge();
            renderNotifications();
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

    window.location.href = '/notification/notification.html';
}

window.viewAllNotificationsHandler = viewAllNotificationsHandler;

function addNotification(type, title, message, data = {}) {
    const notification = {
        id: notificationIdCounter++,
        type: type,
        title: title,
        message: message,
        timestamp: new Date(),
        read: false,
        data: data
    };

    notifications.unshift(notification);
    saveNotificationsToStorage();
    updateNotificationBadge();
    renderNotifications();

    if (typeof showToast === 'function') {
        showToast(`New notification: ${title}`, 'info');
    }
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
        saveNotificationsToStorage();
        updateNotificationBadge();
        renderNotifications();
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
    const stored = localStorage.getItem('adminNotifications');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            notifications = parsed.notifications || [];
            notificationIdCounter = parsed.counter || 1;

            notifications.forEach(notification => {
                if (typeof notification.timestamp === 'string') {
                    notification.timestamp = new Date(notification.timestamp);
                }
            });
        } catch (e) {
            console.warn('Failed to load notifications from storage');
            loadSampleNotifications();
        }
    } else {
        loadSampleNotifications();
    }

    syncSampleNotificationsVersion();
    ensureMinimumSampleNotifications(12);
    updateNotificationBadge();
    renderNotifications();
    showAllNotifications = false;
}

function syncSampleNotificationsVersion() {
    const versionKey = 'adminNotificationsSampleVersion';
    const savedVersion = localStorage.getItem(versionKey);
    if (savedVersion === SAMPLE_NOTIFICATIONS_VERSION) return;

    notifications = [];
    notificationIdCounter = 1;
    loadSampleNotifications();
    saveNotificationsToStorage();
    localStorage.setItem(versionKey, SAMPLE_NOTIFICATIONS_VERSION);
}

function ensureMinimumSampleNotifications(minCount) {
    if (notifications.length >= minCount) return;

    const templates = getSampleNotificationTemplates();
    const needed = Math.min(minCount - notifications.length, templates.length);

    for (let i = 0; i < needed; i++) {
        const template = templates[i];
        notifications.push({
            id: notificationIdCounter++,
            type: template.type,
            title: template.title,
            message: template.message,
            data: template.data || {},
            timestamp: template.timestamp,
            read: false
        });
    }

    saveNotificationsToStorage();
}

function saveNotificationsToStorage() {
    try {
        const data = {
            notifications: notifications,
            counter: notificationIdCounter
        };
        localStorage.setItem('adminNotifications', JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save notifications to storage');
    }
}

function loadSampleNotifications() {
    const sampleNotifications = getSampleNotificationTemplates();

    sampleNotifications.forEach(notification => {
        notification.id = notificationIdCounter++;
        notification.read = false;
        notifications.push(notification);
    });
}

function getSampleNotificationTemplates() {
    return [
        {
            type: 'order',
            title: 'New Order Placed',
            message: 'Order #ORD-004 has been placed by Seventeen',
            data: { orderId: 'ORD-004' },
            timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
            type: 'payment',
            title: 'Payment Received',
            message: 'Payment of ₱224.99 received for Order #ORD-002',
            data: { orderId: 'ORD-002' },
            timestamp: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
            type: 'stock',
            title: 'Low Stock Alert',
            message: 'iDeal Aura stock is below threshold (10 units remaining)',
            data: { productId: '1' },
            timestamp: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
            type: 'status',
            title: 'Discount Campaign Active',
            message: 'SUMMER2026 is active with 55 redemptions remaining (45/100 used).',
            data: { url: '/product/product.html?source=notification&tab=discounts&discountCode=SUMMER2026' },
            timestamp: new Date(Date.now() - 45 * 60 * 1000)
        },
        {
            type: 'status',
            title: 'Discount Limit Reached',
            message: 'FLASH50 has reached its usage limit (50/50) and is no longer redeemable.',
            data: { url: '/product/product.html?source=notification&tab=discounts&discountCode=FLASH50' },
            timestamp: new Date(Date.now() - 60 * 60 * 1000)
        },
        {
            type: 'status',
            title: 'Order Status Updated',
            message: 'Order #ORD-003 for Aahron Bautista is now marked as Shipped.',
            data: { orderId: 'ORD-003' },
            timestamp: new Date(Date.now() - 90 * 60 * 1000)
        },
        {
            type: 'return',
            title: 'Return Request',
            message: 'Kim Mingyu submitted a return request for Order #ORD-005',
            data: { orderId: 'ORD-005' },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            type: 'status',
            title: 'New Customer Message',
            message: 'Erica Ramirez sent a new message: "Hi. I would like to ask about my order #12345."',
            data: { url: '/message/message.html?source=notification&category=inbox&conversationId=1' },
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
            type: 'status',
            title: 'Unread Message Alert',
            message: 'Ms. Mess requested a copy of invoice #332 in unread conversations.',
            data: { url: '/message/message.html?source=notification&category=unread&conversationId=4' },
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
            type: 'status',
            title: 'New Feedback Posted',
            message: 'Ericakes Ramirez rated Classic Round Frames 5 stars.',
            data: { url: '/feedback/feedback.html?source=notification&feedbackId=1' },
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
            type: 'status',
            title: 'Critical Feedback',
            message: 'Michael Wong rated Vintage Cat Eye 1 star and requested assistance.',
            data: { url: '/feedback/feedback.html?source=notification&feedbackId=10' },
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        {
            type: 'status',
            title: 'Product Updated',
            message: 'iDeal Atlas was updated with Spring Sale pricing in Product catalog.',
            data: { url: '/product/product.html?source=notification&tab=products' },
            timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000)
        }
    ];
}

document.addEventListener('DOMContentLoaded', initNotifications);