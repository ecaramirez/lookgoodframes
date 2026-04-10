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
        <title>Reports | Look Good Frames Admin</title>
        <link rel="stylesheet" href="../css/Admin/global.css">
        <link rel="stylesheet" href="../css/Admin/notifications.css">
        <link rel="stylesheet" href="../css/Admin/report.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body>
        <aside class="sidebar">
            <ul class="nav-links">
                <li class="nav-item">
                    <a href="dashboard.php" class="nav-link">
                        <i class="fas fa-chart-line"></i><span>Dashboard</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="product.php" class="nav-link">
                        <i class="fas fa-box"></i><span>Product</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="orders.php" class="nav-link">
                        <i class="fas fa-shopping-cart"></i><span>Order</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="users.php" class="nav-link">
                        <i class="fas fa-users"></i><span>User</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="messages.php" class="nav-link">
                        <i class="fas fa-envelope"></i><span>Message</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="feedback.php" class="nav-link">
                        <i class="fas fa-star"></i><span>Feedback</span>
                    </a>
                </li>
                <li class="nav-item active">
                    <a href="report.php" class="nav-link">
                        <i class="fas fa-file-alt"></i><span>Report</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="notifications.php" class="nav-link">
                        <i class="fas fa-bell"></i><span>Notifications</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="settings.php" class="nav-link">
                        <i class="fas fa-cog"></i><span>Setting</span>
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
                            <i class="fas fa-user-edit"></i><span>Edit Profile</span>
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i><span>Logout</span>
                        </div>
                    </div>
                </div>
            </header>

            <section class="content">
                <div id="reportContent">

                    <!-- Page Header -->
                    <div class="page-header">
                        <div>
                            <h1>Reports &amp; Analytics</h1>
                            <p style="color: var(--text-muted); margin: 0;" id="reportPeriodText">Comprehensive business insights · This Year</p>
                        </div>
                    </div>

                    <div class="filter-bar">
                        <div class="quick-filters" role="group" aria-label="Quick report filters">
                            <button type="button" class="filter-btn" data-filter="today">Today</button>
                            <button type="button" class="filter-btn" data-filter="thisWeek">This Week</button>
                            <button type="button" class="filter-btn active" data-filter="thisMonth">This Month</button>
                            <button type="button" class="filter-btn" data-filter="thisYear">This Year</button>
                        </div>
                        <div class="custom-range">
                            <label>
                                <span>From</span>
                                <input type="date" id="fromDate" name="fromDate">
                            </label>
                            <label>
                                <span>To</span>
                                <input type="date" id="toDate" name="toDate">
                            </label>
                            <button type="button" class="filter-apply" id="applyCustomRangeBtn">Apply</button>
                            <button type="button" class="btn-export" id="exportPdfBtn">
                                <i class="fas fa-file-pdf btn-icon"></i> Export PDF
                            </button>
                        </div>
                    </div>

                    <!-- KPI Cards -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#ecfdf5; color:#10b981;">
                                    <i class="fas fa-peso-sign"></i>
                                </div>
                                <span style="color:#6b7280; font-size:12px; font-weight:600;">
                                    <i class="fas fa-minus"></i> Live
                                </span>
                            </div>
                            <div class="stat-value" id="totalRevenueValue">₱0</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#e0f2fe; color:#0ea5e9;">
                                    <i class="fas fa-shopping-bag"></i>
                                </div>
                                <span style="color:#6b7280; font-size:12px; font-weight:600;">
                                    <i class="fas fa-minus"></i> Live
                                </span>
                            </div>
                            <div class="stat-value" id="totalOrdersValue">0</div>
                            <div class="stat-label">Total Orders</div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#f3e8ff; color:#9333ea;">
                                    <i class="fas fa-users"></i>
                                </div>
                                <span style="color:#6b7280; font-size:12px; font-weight:600;">
                                    <i class="fas fa-minus"></i> Live
                                </span>
                            </div>
                            <div class="stat-value" id="totalCustomersValue">0</div>
                            <div class="stat-label">Total Customers</div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fef9c3; color:#ca8a04;">
                                    <i class="fas fa-chart-bar"></i>
                                </div>
                                <span style="color:#6b7280; font-size:12px; font-weight:600;">
                                    <i class="fas fa-minus"></i> Live
                                </span>
                            </div>
                            <div class="stat-value" id="avgOrderValueValue">₱0.00</div>
                            <div class="stat-label">Avg Order Value</div>
                        </div>
                    </div>

                    <!-- Monthly Bar Chart  -->
                    <div class="card" style="padding: 24px; margin-bottom: 24px;">
                        <div class="card-header" style="padding: 0 0 20px; border: none;">
                            <h3>Monthly Performance (Jan – Dec)</h3>
                            <div class="chart-legend">
                                <div class="legend-item">
                                    <span class="legend-color" style="background:#111;"></span>
                                    <span>Revenue</span>
                                </div>
                                <div class="legend-item">
                                    <span class="legend-color" style="background:#6b7280;"></span>
                                    <span>Units Sold</span>
                                </div>
                            </div>
                        </div>
                        <div class="grouped-bar-chart" id="monthlyPerformanceChart"></div>
                    </div>

                    <!-- ── Financial Overview + Top Products (side by side) -->
                    <div class="section-row">

                        <!-- Financial Overview -->
                        <div class="card" style="padding: 24px;">
                            <div class="card-header" style="padding: 0 0 20px; border: none;">
                                <h3>Financial Overview</h3>
                            </div>
                            <div class="stats-grid" style="grid-template-columns: 1fr 1fr;">
                                <div class="stat-card" style="padding:16px;">
                                    <div class="stat-value" style="font-size:20px;" id="grossRevenueValue">₱0</div>
                                    <div class="stat-label">Gross Revenue</div>
                                </div>
                                <div class="stat-card" style="padding:16px;">
                                    <div class="stat-value" style="font-size:20px; color:#dc2626;" id="totalDiscountValue">₱0</div>
                                    <div class="stat-label">Total Discounts</div>
                                </div>
                                <div class="stat-card" style="padding:16px;">
                                    <div class="stat-value" style="font-size:20px;" id="netRevenueValue">₱0</div>
                                    <div class="stat-label">Net Revenue</div>
                                </div>
                                <div class="stat-card" style="padding:16px;">
                                    <div class="stat-value" style="font-size:20px; color:#10b981;" id="estProfitValue">₱0</div>
                                    <div class="stat-label">Est. Profit</div>
                                </div>
                            </div>
                        </div>

                        <!-- Top Products -->
                        <div class="card">
                            <div class="card-header">
                                <h3>Top 5 Performing Products</h3>
                            </div>
                            <div class="card-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Product</th>
                                            <th>Units</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody id="topProductsBody">
                                        <tr>
                                            <td colspan="4" style="text-align:center; color:#9ca3af;">Loading data...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!--  Discount Analytics  -->
                    <div class="card" style="margin-bottom: 24px;">
                        <div class="card-header">
                            <h3>Discount Analytics</h3>
                        </div>
                        <div class="card-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Times Used</th>
                                        <th>Total Discount Given</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                    <tbody id="discountAnalyticsBody">
                                        <tr>
                                            <td colspan="4" style="text-align:center; color:#9ca3af;">Loading data...</td>
                                        </tr>
                                    </tbody>
                            </table>
                        </div>
                    </div>

                </div><!-- reportContent -->
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

        <script src="../adminActions/report.js"></script>
        <script src="../adminActions/global.js"></script>
    </body>
</html>