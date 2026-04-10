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
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Users | Look Good Frames Admin</title>
        <link rel="stylesheet" href="../css/Admin/global.css">
        <link rel="stylesheet" href="../css/Admin/notifications.css">
        <link rel="stylesheet" href="../css/Admin/manageUsers.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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


            <section class="content">
                <div class="page-header" style="margin-bottom: 20px;">
                    <h1>User Management</h1>
                    <p style="color: var(--text-muted);">Manage user accounts</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon" style="background: #e0f2fe; color: #0ea5e9;"><i class="fas fa-users"></i></div>
                        </div>
                        <div class="stat-value" id="totalCustomers">0</div>
                        <div class="stat-label">Total Customers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon" style="background: #dcfce7; color: #10b981;"><i class="fas fa-user-plus"></i></div>
                        </div>
                        <div class="stat-value">12</div>
                        <div class="stat-label">New Customers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon" style="background: #fef3c7; color: #f59e0b;"><i class="fas fa-eye"></i></div>
                        </div>
                        <div class="stat-value">1,245</div>
                        <div class="stat-label">Visitors</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon" style="background: #fee2e2; color: #ef4444;"><i class="fas fa-user-shield"></i></div>
                        </div>
                        <div class="stat-value" id="suspendedUsers">0</div>
                        <div class="stat-label">Suspended Users</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="table-row">
                            <div class="card-search-controls">
                                <div class="card-search-bar">
                                    <i class="fas fa-search"></i>
                                    <input type="text" id="userSearchInput" class="card-search-input" placeholder="Search users..." name='userSearchInput'>
                                </div>
                                <select id="userStatusFilter" class="card-filter-input">
                                    <option value="">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Banned">Banned</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <table id="usersTable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>CONTACT NUMBER</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>


                <div id="deleteUserModal" class="modal">

                    <div class="modal-content delete-modal">
                        <div class="modal-header" id="deleteModalHeader">
                            <span>Delete User</span>
                            <button class="close-btn" onclick="closeModal('deleteUserModal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="delete-warning">
                            <div class="delete-icon">
                                <i class="fas fa-user-times"></i>
                            </div>
                            <h3>Delete this user account?</h3>
                            <p class="delete-text">Are you sure you want to delete the account of <strong id="deleteUserName"></strong>? This cannot be undone.</p>
                        </div>

                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="closeModal('deleteUserModal')">Cancel</button>
                            <button class="btn btn-danger" onclick="confirmDelete()">Delete User</button>
                        </div>

                    </div>

                </div>

                <div id="banUserModal" class="modal">
                    <div class="modal-content delete-modal">
                        <div class="modal-header" id="banModalHeader">
                            <span>Ban User</span>
                            <button class="close-btn" onclick="closeModal('banUserModal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="delete-warning">
                            <div class="delete-icon">
                                <i class="fas fa-ban"></i>
                            </div>
                            <h3>Ban this user account?</h3>
                            <p class="delete-text">Are you sure you want to ban <strong id="banUserName"></strong>?</p>
                        </div>

                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="closeModal('banUserModal')">Cancel</button>
                            <button class="btn btn-danger" onclick="confirmBan()">Ban User</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>


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

    <script src="../adminActions/user.js"></script>
    <script src="../adminActions/global.js"></script>

    </body>
</html>