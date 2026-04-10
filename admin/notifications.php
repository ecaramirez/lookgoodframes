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
    <title>Notifications - LookGood Admin</title>
    <link rel="stylesheet" href="../css/Admin/global.css">
    <link rel="stylesheet" href="../css/Admin/notifications.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
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
                <a href="messages.php" class="nav-link">
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
                <a href="notifications.php" class="nav-link active">
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

    <main class="main">
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

            <div class="notification-container">
                <div class="notification-trigger" id="notificationTrigger">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                </div>
                <div class="notification-dropdown" id="notificationDropdown">
                    <div class="notification-header">
                        <h4>Notifications</h4>
                        <button class="mark-all-read" id="markAllReadBtn" type="button">Mark all as read</button>
                    </div>
                    <div class="notification-list" id="notificationList"></div>
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

        <section class="content">
            <div class="notifications-page">
                <header class="page-header with-actions">
                    <div>
                        <h1>Notifications</h1>
                        <p id="unreadSummary">All caught up</p>
                    </div>
                    <div class="header-actions">
                        <button id="markAllReadBtnPage" class="btn btn-secondary" type="button">Mark all as read</button>
                    </div>
                </header>

                <section class="filters" id="filterPills">
                    <button class="filter-pill active" data-filter="all" type="button">All</button>
                    <button class="filter-pill" data-filter="order" type="button">Orders</button>
                    <button class="filter-pill" data-filter="payment" type="button">Payments</button>
                    <button class="filter-pill" data-filter="stock" type="button">Low stock</button>
                    <button class="filter-pill" data-filter="cancel" type="button">Cancellations</button>
                    <button class="filter-pill" data-filter="return" type="button">Returns</button>
                    <button class="filter-pill" data-filter="status" type="button">Status updates</button>
                </section>

                <section class="notifications-panel">
                    <ul id="notificationsList" class="notifications-list"></ul>
                    <div class="pagination" id="paginationBar"></div>
                </section>
            </div>
        </section>
    </main>

    <div class="modal-overlay" id="editProfileModal">
        <div class="modal-container modal-edit-profile">

            <div class="modal-header">
                <h2>Edit Profile</h2>
                <button class="close-btn" id="closeEditModal" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body" style="padding: 20px 24px;">
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
                        <div class="ep-card-name" id="epCardName">Erica Ramirez</div>
                        <div class="ep-card-email">ericakes.ramirez@lookgoodframes.com</div>
                        <label for="profileImageInput" class="ep-change-photo-btn">
                            <i class="fas fa-camera"></i> Change photo
                        </label>
                    </div>
                </div>

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
                    <button class="btn btn-secondary" id="cancelEditModal" type="button">Cancel</button>
                    <button class="btn btn-primary" id="saveProfile" type="button">Save changes</button>
                </div>
            </div>

        </div>
    </div>

    <div class="modal-overlay" id="logoutModal">
        <div class="modal-container modal-logout" style="max-width: 380px;">

            <div class="modal-header">
                <div class="logout-icon">
                    <i class="fas fa-sign-out-alt"></i>
                </div>
                <button class="close-btn" id="closeLogoutModal" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body">
                <h2>Log out of your account?</h2>
                <p>Are you sure you want to log out?</p>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelLogout" type="button">Cancel</button>
                <button class="btn btn-danger" id="confirmLogout" type="button">
                    <i class="fas fa-sign-out-alt"></i> Log out
                </button>
            </div>

        </div>
    </div>

    <script src="../adminActions/global.js"></script>
</body>
</html>
