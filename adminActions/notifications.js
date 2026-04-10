(() => {
    // Notification management module - handles loading, storing, filtering, and rendering notifications
    const STORAGE_KEY = 'adminNotifications';

    // State variables for notifications and filtering
    let pageNotifications = [];
    let activeFilter = 'all';
    let currentPage = 1;
    const pageSize = 10;

    // Map filter types to display labels
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

    // Sync notifications with header to update badge count
    function syncHeaderNotifications() {
        if (typeof window.loadNotifications === 'function') {
            window.loadNotifications();
        }
    }

    // Filter notifications by active filter type
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

    // Render pagination controls for notification list
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
                    renderNotifications();
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

    // Update unread notification count display
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

    // Format timestamp as relative time (e.g., '5m ago', '2h ago')
    function formatRelativeTime(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    // Render filtered and paginated notification list
    function renderNotifications() {
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
            return `
                <li class="notification-row ${readClass}" data-id="${item.id}">
                    <span class="unread-dot" aria-hidden="true"></span>
                    <div class="notification-content">
                        <p class="notification-title">${item.title}</p>
                        <p class="notification-message">${item.message}</p>
                        <p class="notification-meta">${FILTER_LABELS[item.type] || 'General'} • ${formatRelativeTime(item.timestamp)}</p>
                    </div>
                </li>
            `;
        }).join('');

        renderPagination(filteredItems.length);
    }

    // Mark a single notification as read
    function markNotificationAsRead(id) {
        const notification = pageNotifications.find((item) => item.id === id);
        if (!notification || notification.read) return;

        notification.read = true;
        pageSaveNotifications();
        syncHeaderNotifications();
        updateUnreadSummary();
        renderNotifications();
    }

    // Generate target URL based on notification type (orders, products, payments, etc.)
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

    // Extract order ID from notification message text
    function extractOrderIdFromText(text) {
        if (!text) return '';
        const match = text.match(/#([A-Za-z]+-\d+)/);
        return match ? match[1] : '';
    }

    // Extract product ID from notification message text
    function extractProductIdFromText(text) {
        if (!text) return '';
        const match = text.match(/\b(\d{1,3})\b/);
        return match ? match[1] : '';
    }

    // Normalize order ID to consistent format (ORD-001, etc.)
    function normalizeOrderId(orderId) {
        if (!orderId) return '';
        const upper = String(orderId).toUpperCase();
        if (upper.startsWith('ORD-')) return upper;

        const numberMatch = upper.match(/(\d+)/);
        if (!numberMatch) return upper;

        const padded = numberMatch[1].padStart(3, '0');
        return `ORD-${padded}`;
    }

    // Mark notification as read and navigate to its target page
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

    // Mark all notifications as read
    function markAllAsRead() {
        pageNotifications.forEach((item) => {
            item.read = true;
        });

        pageSaveNotifications();
        syncHeaderNotifications();
        updateUnreadSummary();
        renderNotifications();
    }

    // Bind event listeners to filter pills and notification list
    function bindEvents() {
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
                renderNotifications();
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

    // Initialize profile dropdown menu and settings modal handlers
    function initProfileMenu() {
        const profileTrigger = document.getElementById('profileTrigger');
        const profileDropdown = document.getElementById('profileDropdown');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const editProfileModal = document.getElementById('editProfileModal');
        const logoutModal = document.getElementById('logoutModal');
        const closeEditModal = document.getElementById('closeEditModal');
        const cancelEditModal = document.getElementById('cancelEditModal');
        const saveProfileBtn = document.getElementById('saveProfile');
        const closeLogoutModal = document.getElementById('closeLogoutModal');
        const cancelLogout = document.getElementById('cancelLogout');
        const confirmLogout = document.getElementById('confirmLogout');
        const profileImageInput = document.getElementById('profileImageInput');
        const epAvatarImg = document.getElementById('epAvatarImg');
        const epAvatarInitials = document.getElementById('epAvatarInitials');
        const epCardName = document.getElementById('epCardName');
        const fullNameInput = document.getElementById('fullName');
        const headerName = profileTrigger ? profileTrigger.querySelector('span') : null;
        const headerAvatar = document.querySelector('.avatar');

        if (!profileTrigger || !profileDropdown) return;

        const closeEditProfileModal = () => {
            if (editProfileModal) editProfileModal.classList.remove('show');
        };

        const closeLogoutModalDialog = () => {
            if (logoutModal) logoutModal.classList.remove('show');
        };

        const toHeaderDisplayName = (fullName) => {
            const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
            if (parts.length >= 2) return `${parts[0]} ${parts[1][0]}.`;
            if (parts.length === 1) return parts[0];
            return 'Erica R.';
        };

        const savedName = localStorage.getItem('profileName');
        if (savedName && fullNameInput) fullNameInput.value = savedName;
        if (epCardName) epCardName.textContent = savedName || 'Erica Ramirez';
        if (headerName) headerName.textContent = toHeaderDisplayName(savedName || 'Erica Ramirez');

        if (headerAvatar) headerAvatar.src = '/global/pic.png';
        if (epAvatarImg) {
            epAvatarImg.src = '/global/pic.png';
            epAvatarImg.style.display = 'block';
        }
        if (epAvatarInitials) epAvatarInitials.style.display = 'none';

        profileTrigger.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => profileDropdown.classList.remove('show'));

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                if (editProfileModal) editProfileModal.classList.add('show');
                profileDropdown.classList.remove('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (logoutModal) logoutModal.classList.add('show');
                profileDropdown.classList.remove('show');
            });
        }

        if (closeEditModal) closeEditModal.addEventListener('click', closeEditProfileModal);
        if (cancelEditModal) cancelEditModal.addEventListener('click', closeEditProfileModal);
        if (editProfileModal) {
            editProfileModal.addEventListener('click', (event) => {
                if (event.target === editProfileModal) closeEditProfileModal();
            });
        }

        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                const newPassword = document.getElementById('newPassword')?.value || '';
                const confirmPassword = document.getElementById('confirmPassword')?.value || '';

                if (newPassword && newPassword !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }

                const fullName = (fullNameInput && fullNameInput.value.trim()) || 'Erica Ramirez';
                localStorage.setItem('profileName', fullName);

                if (headerName) headerName.textContent = toHeaderDisplayName(fullName);
                if (epCardName) epCardName.textContent = fullName;

                alert('Profile updated successfully!');
                closeEditProfileModal();
            });
        }

        if (profileImageInput) {
            profileImageInput.addEventListener('change', (event) => {
                const file = event.target.files && event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    const imageData = loadEvent.target && loadEvent.target.result;
                    if (!imageData) return;
                    if (epAvatarImg) {
                        epAvatarImg.src = imageData;
                        epAvatarImg.style.display = 'block';
                    }
                    if (epAvatarInitials) epAvatarInitials.style.display = 'none';
                };
                reader.readAsDataURL(file);
            });
        }

        if (closeLogoutModal) closeLogoutModal.addEventListener('click', closeLogoutModalDialog);
        if (cancelLogout) cancelLogout.addEventListener('click', closeLogoutModalDialog);
        if (logoutModal) {
            logoutModal.addEventListener('click', (event) => {
                if (event.target === logoutModal) closeLogoutModalDialog();
            });
        }

        if (confirmLogout) {
            confirmLogout.addEventListener('click', () => {
                window.location.href = '/login/login.html';
            });
        }
    }

    function initNotificationsPage() {
        pageLoadNotifications();
        bindEvents();
        initProfileMenu();
        updateUnreadSummary();
        renderNotifications();
    }

    document.addEventListener('DOMContentLoaded', initNotificationsPage);
})();
