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
    <title>Feedback | Look Good Frames Admin</title>
    <link rel="stylesheet" href="../css/Admin/global.css">
    <link rel="stylesheet" href="../css/Admin/notifications.css">
    <link rel="stylesheet" href="../css/Admin/feedback.css">
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
                <a href="messages.php" class="nav-link">
                    <i class="fas fa-envelope"></i>
                    <span>Message</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="feedback.php" class="nav-link active">
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
            <!-- Page Header -->
            <div class="page-header" style="margin-bottom:24px;">
                <div>
                    <h1>Customer Feedback</h1>
                    <p style="color: var(--text-muted);">Manage and respond to customer reviews</p>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background: #e0f2fe; color: #0ea5e9;">
                            <i class="fas fa-comments"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="totalFeedback">0</div>
                    <div class="stat-label">Total Feedback</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background: #fef3c7; color: #f59e0b;">
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="avgRating">0.0</div>
                    <div class="stat-label">Average Rating</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background: #dcfce7; color: #10b981;">
                            <i class="fas fa-thumbs-up"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="positiveCount">0</div>
                    <div class="stat-label">Positive Reviews</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background: #fee2e2; color: #ef4444;">
                            <i class="fas fa-reply"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="repliedCount">0</div>
                    <div class="stat-label">Replied</div>
                </div>
            </div>

            <!-- Rating Distribution -->
            <div class="rating-distribution-card">
                <h3>Rating Distribution</h3>
                <div class="rating-bars">
                    <div class="rating-bar-item" data-rating="5">
                        <span class="rating-label">5 <i class="fas fa-star"></i></span>
                        <div class="rating-bar-bg">
                            <div class="rating-bar-fill" id="rating-5-bar" style="width: 0%"></div>
                        </div>
                        <span class="rating-count" id="rating-5-count">0</span>
                    </div>
                    <div class="rating-bar-item" data-rating="4">
                        <span class="rating-label">4 <i class="fas fa-star"></i></span>
                        <div class="rating-bar-bg">
                            <div class="rating-bar-fill" id="rating-4-bar" style="width: 0%"></div>
                        </div>
                        <span class="rating-count" id="rating-4-count">0</span>
                    </div>
                    <div class="rating-bar-item" data-rating="3">
                        <span class="rating-label">3 <i class="fas fa-star"></i></span>
                        <div class="rating-bar-bg">
                            <div class="rating-bar-fill" id="rating-3-bar" style="width: 0%"></div>
                        </div>
                        <span class="rating-count" id="rating-3-count">0</span>
                    </div>
                    <div class="rating-bar-item" data-rating="2">
                        <span class="rating-label">2 <i class="fas fa-star"></i></span>
                        <div class="rating-bar-bg">
                            <div class="rating-bar-fill" id="rating-2-bar" style="width: 0%"></div>
                        </div>
                        <span class="rating-count" id="rating-2-count">0</span>
                    </div>
                    <div class="rating-bar-item" data-rating="1">
                        <span class="rating-label">1 <i class="fas fa-star"></i></span>
                        <div class="rating-bar-bg">
                            <div class="rating-bar-fill" id="rating-1-bar" style="width: 0%"></div>
                        </div>
                        <span class="rating-count" id="rating-1-count">0</span>
                    </div>
                </div>
            </div>

            <!-- Feedback Card -->
            <div class="card feedback-card">
                <div class="card-header">
                    <div class="search-bar2">
                        <i class="fas fa-search"></i>
                        <input type="text" id="feedbackSearchInput" class="search-input2" placeholder="Search customer name..." name='feedbackSearchInput'>
                    </div>
                    <div class="filter-group">
                        <select id="ratingFilter" class="filter-select">
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        <select id="statusFilter" class="filter-select">
                            <option value="">All Status</option>
                            <option value="replied">Replied</option>
                            <option value="pending">Pending Reply</option>
                        </select>
                        <div class="date-filter-field">
                            <span class="date-filter-label">From</span>
                            <input type="date" id="dateFromFilter" class="filter-date" aria-label="Filter from date" name="dateFromFilter">
                        </div>
                        <div class="date-filter-field">
                            <span class="date-filter-label">To</span>
                            <input type="date" id="dateToFilter" class="filter-date" aria-label="Filter to date" name="dateToFilter">
                        </div>
                    </div>
                </div>

                <div class="feedback-grid" id="feedbackGrid"></div>

                <div class="pagination" id="feedbackPagination"></div>
            </div>
        </section>
    </main>

    <!-- Feedback Details Modal -->
    <div id="feedbackModal" class="modal">
        <div class="feedback-detail-modal">

            <!-- Modal Header -->
            <div class="modal-header-feedback">
                <div class="modal-user-info">
                    <div class="modal-avatar" id="modalAvatar">ER</div>
                    <div>
                        <div class="modal-customer-name" id="modalCustomer"></div>
                        <div class="modal-date" id="modalDate"></div>
                    </div>
                </div>
                <!-- X close button — always visible -->
                <button class="close-btn" onclick="closeFeedbackModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Product & Rating -->
            <div class="modal-product-section">
                <div class="modal-product-info">
                    <label>Product</label>
                    <div class="modal-product-name" id="modalProduct"></div>
                </div>
                <div class="modal-rating-info">
                    <label>Rating</label>
                    <div class="modal-rating" id="modalRating"></div>
                </div>
            </div>

            <!-- Customer Feedback -->
            <div class="modal-comment-card">
                <div class="modal-label">
                    <i class="fas fa-comment-alt"></i> Customer Feedback
                </div>
                <div class="modal-comment-text" id="modalComment"></div>
            </div>

            <!-- Admin Reply (shown after reply is sent) -->
            <div id="adminReplyContainer"></div>

            <!-- Reply Input (visible when no reply yet) -->
            <div class="modal-reply-section" id="replySection" style="display: none;">
                <label for="adminReplyInput">
                    <i class="fas fa-reply"></i> Your Reply
                </label>
                <textarea id="adminReplyInput" placeholder="Write your reply here, or click 'Use Template' to load a suggested response..." class="reply-input"></textarea>
                <div class="reply-actions">
                    <button class="reply-template-btn" onclick="useTemplate()">
                        <i class="fas fa-magic"></i> Use Template
                    </button>
                    <button id="sendReplyBtn" class="send-reply-btn">
                        <i class="fas fa-paper-plane"></i> Send Reply
                    </button>
                </div>
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

    <script src="../adminActions/notification.js"></script>
    <script src="../adminActions/feedback.js"></script>
    <script src="../adminActions/global.js"></script>
</body>
</html>