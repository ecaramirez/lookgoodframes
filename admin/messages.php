<?php
session_start();
require_once '../config.php';
require_once '../auth_admin.php';
if (!isset($_SESSION['email']) ||!isset($_SESSION['role']) ||$_SESSION['role'] !== 'admin') {
    header("Location: ../index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages | Look Good Frames Admin</title>
    <link rel="stylesheet" href="../css/Admin/global.css">
    <link rel="stylesheet" href="../css/Admin/notifications.css">
    <link rel="stylesheet" href="../css/Admin/messages.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <!-- Sidebar -->
    <aside class="sidebar">
        <ul class="nav-links">
            <li class="nav-item">
                <a href="dashboard.php" class="nav-link">
                    <i class="fas fa-chart-line"></i>
                    <span>Dashboard</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="product.php" class="nav-link">
                    <i class="fas fa-box"></i>
                    <span>Product</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="orders.php" class="nav-link">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Order</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="users.php" class="nav-link">
                    <i class="fas fa-users"></i>
                    <span>User</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="messages.php" class="nav-link active">
                    <i class="fas fa-envelope"></i>
                    <span>Message</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="feedback.php" class="nav-link">
                    <i class="fas fa-star"></i>
                    <span>Feedback</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="report.php" class="nav-link">
                    <i class="fas fa-file-alt"></i>
                    <span>Report</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="notifications.php" class="nav-link">
                    <i class="fas fa-bell"></i>
                    <span>Notifications</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="settings.php" class="nav-link">
                    <i class="fas fa-cog"></i>
                    <span>Setting</span>
                </a>
            </li>
        </ul>
        <div class="sidebar-toggle" id="sidebarToggle">
            <i class="fas fa-chevron-left"></i>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="main">
        <!-- Header -->
        <header class="header">
            <div class="sidebar-header">
                <div class="logo-icon">
                    <img src="../uploads/logo/lookgood-black.png" alt="look good logo" class="logo-img">
                </div>
            </div>
            <div class="search-bar">
                <i class="fas fa-search"></i>
                <input type="text" class="search-input" placeholder="Search anything..." name='search_anything_1'>
            </div>

            <!-- Notification Container -->
            <div class="notification-container">
                <div class="notification-trigger" id="notificationTrigger">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" id="notificationBadge" style="display: none;"></span>
                </div>

                <div class="notification-dropdown" id="notificationDropdown">
                    <div class="notification-header">
                        <h4>Notifications</h4>
                        <button class="mark-all-read" id="markAllReadBtn">Mark all as read</button>
                    </div>

                    <div class="notification-list" id="notificationList">
                        <!-- Notifications will be populated here -->
                    </div>

                    <div class="notification-footer">
                        <button type="button" class="view-all-notifications" id="viewAllNotificationsBtn" onclick="viewAllNotificationsHandler(event)">View All Notifications</button>
                    </div>
                </div>
            </div>

            <div class="profile-dropdown-container">
                <div class="profile-trigger" id="profileTrigger">
                    <img src="/global/pic.png" alt="admin" class="avatar">
                    <span>Erica R.</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="dropdown-item" id="editProfileBtn">
                        <i class="fas fa-user-edit"></i>
                        <span>Edit Profile</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Content -->
        <section class="content">
            <div class="message-page">
                <!-- Page Header -->
                <div class="page-header with-actions">
                    <div>
                        <h1>Messages</h1>
                        <p style="color: var(--text-muted);">Manage customer inquiries and conversations</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-icon" title="Mark all as read" onclick="markAllAsRead()">
                            <i class="fas fa-check-double"></i>
                        </button>
                    </div>
                </div>

                <!-- Main Message Container -->
                <div class="message-container">

                    <!-- Left Sidebar - Categories -->
                    <div class="message-sidebar">
                        <div class="sidebar-header">
                            <h3>Folders</h3>
                        </div>
                        <div class="menu-item menu-active" data-category="inbox">
                            <div class="menu-icon-text">
                                <i class="fas fa-inbox"></i>
                                <span class="text">Inbox</span>
                            </div>
                            <span class="count">3</span>
                        </div>
                        <div class="menu-item" data-category="unread">
                            <div class="menu-icon-text">
                                <i class="fas fa-envelope"></i>
                                <span class="text">Unread</span>
                            </div>
                            <span class="count">3</span>
                        </div>
                        <div class="menu-item" data-category="starred">
                            <div class="menu-icon-text">
                                <i class="fas fa-star"></i>
                                <span class="text">Starred</span>
                            </div>
                            <span class="count">3</span>
                        </div>
                        <div class="menu-item" data-category="archive">
                            <div class="menu-icon-text">
                                <i class="fas fa-box-archive"></i>
                                <span class="text">Archive</span>
                            </div>
                            <span class="count">3</span>
                        </div>
                    </div>

                    <!-- Middle - Conversation List -->
                    <div class="conversation-list">
                        <div class="list-header">
                            <h3 id="list-title">Inbox</h3>
                            <div class="search-container">
                                <i class="fas fa-search"></i>
                                <input class="search-input2" type="text" placeholder="Search messages..." id="searchMessages" name='searchMessages'>
                            </div>
                        </div>
                        <div class="message-items" id="message-items"></div>
                    </div>

                    <!-- Right - Conversation Panel -->
                    <div class="conversation-panel">
                        <!-- Empty State -->
                        <div class="empty-view" id="empty-view">
                            <div class="empty-icon">
                                <i class="fas fa-comments"></i>
                            </div>
                            <h3>No conversation selected</h3>
                            <p>Choose a message from the list to view the conversation</p>
                        </div>

                        <!-- Active Chat -->
                        <div id="active-view" style="display:none;">
                            <!-- Chat Header -->
                            <div class="chat-header">
                                <div class="user-profile">
                                    <div class="msg-avatar" id="head-avatar">ER</div>
                                    <div class="user-info">
                                        <h3 id="head-name">Erica Ramirez</h3>
                                        <span class="status" id="head-email">erica@gmail.com</span>
                                    </div>
                                </div>
                                <div class="chat-actions">
                                    <button class="btn-icon" title="Archive" onclick="archiveConversation()">
                                        <i class="fas fa-box-archive"></i>
                                    </button>
                                    <button class="btn-icon" title="Star" onclick="toggleStar()">
                                        <i class="far fa-star"></i>
                                    </button>
                                    <button class="btn-icon" title="Delete" onclick="openDelConvo()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button class="btn-icon" title="Info" onclick="toggleInfoSidebar()">
                                        <i class="fas fa-info-circle"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Blocked Banner -->
                            <div id="blocked-banner" style="display:none; align-items:center; gap:10px; background:#fef2f2; border-bottom:1px solid #fecaca; padding:10px 20px; color:#ef4444; font-size:13px; font-weight:600;">
                                <i class="fas fa-ban"></i>
                                <span>You have blocked this user. They cannot send you messages.</span>
                                <button onclick="toggleBlockUser()" style="margin-left:auto; font-size:12px; padding:4px 12px; border:1px solid #ef4444; background:transparent; color:#ef4444; border-radius:6px; cursor:pointer;">Unblock</button>
                            </div>

                            <!-- Chat Messages -->
                            <div class="chat-content" id="chat-box-wrapper"></div>

                            <!-- Chat Input -->
                            <div class="chat-footer">
                                <button class="btn-icon" title="Attach file">
                                    <i class="fas fa-paperclip"></i>
                                </button>
                                <button class="btn-icon" title="Emoji">
                                    <i class="fas fa-smile"></i>
                                </button>
                                <div class="input-wrapper">
                                    <input type="text" id="type-box" placeholder="Type a message..." onkeypress="handleEnter(event)" name='type-box'>
                                </div>
                                <button class="send-btn" onclick="sendNewMessage()">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>

                            <!-- Info Sidebar -->
                            <div class="info-sidebar" id="info-details">
                                <div class="info-header">
                                    <h4>Contact Details</h4>
                                    <button class="btn-icon" onclick="toggleInfoSidebar()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div class="contact-avatar">
                                    <div class="msg-avatar msg-avatar-large" id="info-avatar">ER</div>
                                    <h3 id="info-name">Erica Ramirez</h3>
                                </div>
                                <div class="info-section">
                                    <div class="detail-item">
                                        <label><i class="fas fa-envelope"></i> Email</label>
                                        <span id="detail-email">email@example.com</span>
                                    </div>
                                    <div class="detail-item">
                                        <label><i class="fas fa-phone"></i> Phone</label>
                                        <span id="detail-phone">+1 234 567 890</span>
                                    </div>
                                    <div class="detail-item">
                                        <label><i class="fas fa-map-marker-alt"></i> Location</label>
                                        <span id="detail-loc">Manila, PH</span>
                                    </div>
                                </div>
                                <div class="info-actions">
                                    <button class="btn btn-secondary" id="block-user-btn">
                                        <i class="fas fa-ban"></i> Block User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Delete Conversation Modal -->
    <div class="modal-overlay" id="delConvo-modal">
        <div class="modal-container small">
            <div class="modal-header">
                <h2>Delete Conversation?</h2>
                <button class="close-btn" onclick="closeDelConvo()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeDelConvo()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmDelete()">Delete</button>
            </div>
        </div>
    </div>

    <!--Edit Profile Modal-->
        <div class="modal-overlay" id="editProfileModal">
            <div class="modal-container modal-edit-profile">

                <div class="modal-header">
                    <h2>Edit Profile</h2>
                    <button class="close-btn" id="closeEditModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body" style="padding: 20px 24px;">

                    <!-- Profile card -->
                    <div class="ep-profile-card">
                        <div class="ep-avatar-wrapper">
                            <div class="ep-avatar-initials" id="epAvatarInitials">ER</div>
                            <img src="/global/pic.png" alt="Profile" id="epAvatarImg" class="ep-avatar-img" onerror="this.style.display='none'">
                            <label for="profileImageInput" class="ep-avatar-edit" title="Change photo">
                                <i class="fas fa-pencil-alt"></i>
                            </label>
                            <input type="file" id="profileImageInput" accept="image/*" style="display: none;" name='profileImageInput'>
                        </div>
                        <div class="ep-card-info">
                            <div class="ep-card-name">Erica Ramirez</div>
                            <div class="ep-card-email">ericakes.ramirez@lookgoodframes.com</div>
                            <label for="profileImageInput" class="ep-change-photo-btn">
                                <i class="fas fa-camera"></i> Change photo
                            </label>
                        </div>
                    </div>

                    <!-- Two-column fields -->
                    <div class="ep-form-grid">
                        <div class="ep-form-group">
                            <label class="ep-label">FULL NAME</label>
                            <input type="text" class="ep-input" id="fullName" value="Erica Ramirez" name='fullName'>
                        </div>
                        <div class="ep-form-group">
                            <label class="ep-label">ROLE</label>
                            <input type="text" class="ep-input" id="role" value="Admin" readonly name='role'>
                        </div>
                    </div>

                    <!-- Full-width email -->
                    <div class="ep-form-group" style="margin-top: 14px;">
                        <label class="ep-label">EMAIL ADDRESS</label>
                        <input type="email" class="ep-input" id="email" value="ericakes.ramirez@lookgoodframes.com" name='email'>
                    </div>

                    <div class="ep-section-title" style="margin-top: 10px;">Change password</div>

                    <div class="ep-form-grid" style="margin-top: 12px; margin-bottom: 8px;">
                        <div class="ep-form-group">
                            <label class="ep-label">NEW PASSWORD</label>
                            <input type="password" class="ep-input" id="newPassword" placeholder="Enter new password" name='newPassword'>
                        </div>
                        <div class="ep-form-group">
                            <label class="ep-label">CONFIRM PASSWORD</label>
                            <input type="password" class="ep-input" id="confirmPassword" placeholder="Confirm password" name='confirmPassword'>
                        </div>
                    </div>

                </div>

                <div class="ep-modal-footer">
                    <div>
                        <button class="btn btn-secondary" id="cancelEditModal">Cancel</button>
                        <button class="btn btn-primary" id="saveProfile">Save changes</button>
                    </div>
                </div>

            </div>
        </div>

        <!-- Logout Modal -->
        <div class="modal-overlay" id="logoutModal">
            <div class="modal-container modal-logout" style="max-width: 380px;">

                <div class="modal-header">
                    <div class="logout-icon">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <button class="close-btn" id="closeLogoutModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <h2>Log out of your account?</h2>
                    <p>Are you sure you want to log out?</p>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelLogout">Cancel</button>
                    <button class="btn btn-danger" id="confirmLogout">
                        <i class="fas fa-sign-out-alt"></i> Log out
                    </button>
                </div>

            </div>
        </div>

    <script src="../adminActions/notifications.js"></script>
    <script src="../adminActions/messages.js"></script>
    <script src="../adminActions/global.js"></script>
</body>
</html>