<?php
session_start();
require_once '../config.php';
require_once '../auth_admin.php';
if (!isset($_SESSION['email']) ||!isset($_SESSION['role']) ||$_SESSION['role'] !== 'admin') {
    header("Location: ../index.php");
    exit();
}
if(isset($_SESSION['email'])){
    $username = $_SESSION['first_name'] . ' ' . $_SESSION['last_name'] ?? null;
}
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard</title>
        <link rel="stylesheet" href="../css/Admin/global.css">
        <link rel="stylesheet" href="../css/Admin/notifications.css">
        <link rel="stylesheet" href="../css/Admin/dashboard.css">
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

        <!--Header-->

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

            <!--Main Content-->

            <section class="content">

                <div class="page-header" style="margin-bottom:24px;">
                    <h1>Store Overview</h1>
                    <p style="color: var(--text-muted);">Welcome back, <span><?= htmlspecialchars($username ?? 'Admin') ?></span>! Here's What's happening today</p>
                </div>

                <div class="stats-grid">

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon" style="background: #eef2ff; color: #4f46eb;">
                                <i class="fas fa-box"></i>
                            </div>

                            <div class="stat-info">
                                <div class="stat-value" id="dashboardTotalProducts">0</div>
                                <div class="stat-label">Total Products</div>
                                <div class="stat-change" id="dashboardTrendProducts">
                                     <i class="fas fa-minus"></i> 0%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon" style="background: #ecfdf5; color: #10b981;">
                                <i class="fas fa-shopping-cart"></i>
                            </div>

                            <div class="stat-info">
                                <div class="stat-value" id="dashboardTotalOrders">0</div>
                                <div class="stat-label">Total Orders</div>
                                <div class="stat-change" id="dashboardTrendOrders">
                                     <i class="fas fa-minus"></i> 0%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon" style="background: #fdf2f8; color: #db2777;">
                                <i class="fas fa-users"></i>
                            </div>

                            <div class="stat-info">
                                <div class="stat-value" id="dashboardTotalUsers">0</div>
                                <div class="stat-label">Total Users</div>
                                <div class="stat-change" id="dashboardTrendUsers">
                                     <i class="fas fa-minus"></i> 0%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon" style="background: #fff7ed; color: #ea580c;">
                                <i class="fas fa-peso-sign"></i>
                            </div>

                            <div class="stat-info">
                                <div class="stat-value" id="dashboardTotalRevenue">P0.00</div>
                                <div class="stat-label">Total revenue</div>
                                <div class="stat-change" id="dashboardTrendRevenue">
                                     <i class="fas fa-minus"></i> 0%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!--Order Trends-->

                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3>Order Trends</h3>
                    </div>

                   <div class="chart-container">
                        <canvas id="salesChart"></canvas>
                    </div>
                    
                </div>

                <!--Sales and Recent Activity-->

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">

                    <div class="card">
                        <div class="card-header">
                            <h3>Sales by Category</h3>
                        </div>

                        <div class="category-sales-container">
                            <div id="categorySalesChart" class="category-sales-chart"></div>
                            <div id="categorySalesLegend" class="category-sales-legend"></div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>Recent Activity</h3>
                        </div>

                        <div class="activity-list" id="activityList"></div>
                    </div>
                </div>

                <!--Recent Orders Table-->

                <div class="card">
                    <div class="card-header">
                        <h3>Recent Orders</h3>
                    </div>

                    <div class="card-table">
                        <table id="recentOrdersTable">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customers</th>
                                    <th>Products</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>

                        <div class="table-footer"></div>
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

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="../adminActions/global.js"></script>
        <script src="../adminActions/dashboard.js"></script>
    </body>
</html>