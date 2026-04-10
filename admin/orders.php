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
        <title>Orders | Look Good Frames Admin</title>
        <link rel="stylesheet" href="../css/Admin/global.css">
        <link rel="stylesheet" href="../css/Admin/notifications.css">
        <link rel="stylesheet" href="../css/Admin/orders.css">
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
                <li class="nav-item">
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

                <div class="page-header" style="margin-bottom:20px;">
                    <h2 id="orderSectionHeading">Order Overview</h2>
                </div>

                <div class="tabs">
                    <button class="tab-link active" data-tab="ordersTab">Orders</button>
                    <button class="tab-link" data-tab="paymentsTab">Payment</button>
                </div>

                <!-- ORDERS TAB -->
                <div class="tab-content active" id="ordersTab">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#e0f2fe;color:#0ea5e9;"><i class="fas fa-shopping-bag"></i></div>
                            </div>
                            <div class="stat-value" id="totalOrders">0</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fef3c7;color:#f59e0b;"><i class="fas fa-clock"></i></div>
                            </div>
                            <div class="stat-value" id="processingOrders">0</div>
                            <div class="stat-label">Processing</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#e0e7ff;color:#4338ca;"><i class="fas fa-truck"></i></div>
                            </div>
                            <div class="stat-value" id="shippedOrders">0</div>
                            <div class="stat-label">Shipped</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fee2e2;color:#ef4444;"><i class="fas fa-times-circle"></i></div>
                            </div>
                            <div class="stat-value" id="cancelledOrders">0</div>
                            <div class="stat-label">Cancelled</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div class="table-row">
                                <div class="card-search-controls">
                                    <div class="card-search-bar">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="orderSearchInput" class="card-search-input" placeholder="Search orders..." name='orderSearchInput'>
                                    </div>
                                    <select id="orderStatusFilter" class="card-filter-input">
                                        <option value="">All Orders</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <div class="card-date-filter">
                                        <label for="fromDate">From:</label>
                                        <input type="date" id="fromDate" class="card-filter-input card-date-input" name='fromDate'>
                                    </div>
                                    <div class="card-date-filter">
                                        <label for="toDate">To:</label>
                                        <input type="date" id="toDate" class="card-filter-input card-date-input" name='toDate'>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <table id="ordersTable">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer Name</th>
                                    <th>Product</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                        <div class="pagination" id="ordersPagination"></div>
                    </div>
                </div>

                <!-- PAYMENTS TAB -->
                <div class="tab-content" id="paymentsTab">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#e0f2fe;color:#0ea5e9;"><i class="fas fa-credit-card"></i></div>
                            </div>
                            <div class="stat-value" id="totalPayments">0</div>
                            <div class="stat-label">Total Payments</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#dcfce7;color:#10b981;"><i class="fas fa-check-circle"></i></div>
                            </div>
                            <div class="stat-value" id="completedPayments">0</div>
                            <div class="stat-label">Completed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fef3c7;color:#f59e0b;"><i class="fas fa-clock"></i></div>
                            </div>
                            <div class="stat-value" id="pendingPayments">0</div>
                            <div class="stat-label">Pending</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#ecfdf5;color:#059669;"><i class="fas fa-peso-sign"></i></div>
                            </div>
                            <div class="stat-value" id="totalAmount">₱0</div>
                            <div class="stat-label">Total Amount</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div class="table-row">
                                <div class="card-search-controls">
                                    <div class="card-search-bar">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="paymentSearchInput" class="card-search-input" placeholder="Search payments..." name='paymentSearchInput'>
                                    </div>
                                    <select id="payStatFilter" class="card-filter-input">
                                        <option value="">All Status</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Failed">Failed</option>
                                    </select>
                                    <div class="card-date-filter">
                                        <label for="paymentFromDate">From:</label>
                                        <input type="date" id="paymentFromDate" class="card-filter-input card-date-input" name='paymentFromDate'>
                                    </div>
                                    <div class="card-date-filter">
                                        <label for="paymentToDate">To:</label>
                                        <input type="date" id="paymentToDate" class="card-filter-input card-date-input" name='paymentToDate'>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <table id="paymentsTable">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer Name</th>
                                    <th>Status</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                        <div class="pagination" id="paymentsPagination"></div>
                    </div>
                </div>

            </section>
        </main>


        <!-- ORDER DETAILS MODAL -->
        <div id="orderModal" class="modal-overlay">
            <div class="order-modal-card">

                <div class="om-header">
                    <div class="om-header-text">
                        <span class="om-eyebrow">Order Details</span>
                        <h2 class="om-order-id" id="modalHeaderOrderID">—</h2>
                    </div>
                    <div class="om-header-right">
                        <button class="close-btn" id="closeOrderModal">
                            <i class="fas fa-times"></i>
                        </button>
                        <span class="om-status-badge" id="modalOrderStatus"></span>
                    </div>
                </div>

                <div class="om-body">
                    <!-- Customer Info Section -->
                    <div class="om-section">
                        <div class="om-section-header">
                            <i class="fas fa-user"></i>
                            <span>Customer Information</span>
                        </div>
                        <div class="om-section-content">
                            <div class="om-customer-info om-customer-info-inline">
                                <div class="om-customer-field">
                                    <span class="om-customer-field-label">Name</span>
                                    <span class="om-customer-field-value" id="modalCustomerName">—</span>
                                </div>
                                <div class="om-customer-field">
                                    <span class="om-customer-field-label">Email</span>
                                    <span class="om-customer-field-value" id="modalCustomerEmail">—</span>
                                </div>
                                <div class="om-customer-field">
                                    <span class="om-customer-field-label">Phone</span>
                                    <span class="om-customer-field-value" id="modalCustomerPhone">—</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Shipping Address Section -->
                    <div class="om-section">
                        <div class="om-section-header">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Shipping Address</span>
                        </div>
                        <div class="om-section-content">
                            <div class="om-address-block">
                                <div class="om-address-row">
                                    <div class="om-address-item">
                                        <span class="om-address-label">Full Name</span>
                                        <span class="om-address-value" id="modalShippingFullName">—</span>
                                    </div>
                                    <div class="om-address-item">
                                        <span class="om-address-label">Phone</span>
                                        <span class="om-address-value" id="modalShippingPhone">—</span>
                                    </div>
                                </div>
                                <div class="om-address-row">
                                    <div class="om-address-item">
                                        <span class="om-address-label">Address Line 1</span>
                                        <span class="om-address-value" id="modalAddressLine1">—</span>
                                    </div>
                                    <div class="om-address-item">
                                        <span class="om-address-label">Address Line 2</span>
                                        <span class="om-address-value" id="modalAddressLine2">—</span>
                                    </div>
                                    <div class="om-address-item">
                                        <span class="om-address-label">City</span>
                                        <span class="om-address-value" id="modalCity">—</span>
                                    </div>
                                </div>
                                <div class="om-address-row">
                                    <div class="om-address-item">
                                        <span class="om-address-label">Province</span>
                                        <span class="om-address-value" id="modalProvince">—</span>
                                    </div>
                                    <div class="om-address-item">
                                        <span class="om-address-label">ZIP Code</span>
                                        <span class="om-address-value" id="modalZip">—</span>
                                    </div>
                                    <div class="om-address-item">
                                        <span class="om-address-label">Region</span>
                                        <span class="om-address-value" id="modalRegion">—</span>
                                    </div>
                                </div>
                                <div class="om-address-item om-address-full">
                                    <span class="om-address-label">Delivery Note</span>
                                    <span class="om-address-value" id="modalDeliveryNote">—</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Shipping Method Section -->
                    <div class="om-section">
                        <div class="om-section-header">
                            <i class="fas fa-truck"></i>
                            <span>Shipping Method</span>
                        </div>
                        <div class="om-section-content">
                            <div class="om-shipping-method">
                                <div class="om-shipping-field">
                                    <span class="om-shipping-field-label">Shipping Method</span>
                                    <span class="om-shipping-field-value" id="modalCourierName">—</span>
                                </div>
                                <div class="om-shipping-field">
                                    <span class="om-shipping-field-label">Estimated Delivery</span>
                                    <span class="om-shipping-field-value" id="modalEstimatedDelivery">—</span>
                                </div>
                                <div class="om-shipping-field">
                                    <span class="om-shipping-field-label">Tracking Number</span>
                                    <span class="om-shipping-field-value" id="modalTrackingNumber">—</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Items Ordered Section -->
                    <div class="om-section">
                        <div class="om-section-header">
                            <i class="fas fa-shopping-bag"></i>
                            <span>Items Ordered</span>
                        </div>
                        <div class="om-section-content">
                            <div class="om-items-list" id="modalItemsList">
                                <!-- Items will be populated by JS -->
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary Section -->
                    <div class="om-section">
                        <div class="om-section-header">
                            <i class="fas fa-receipt"></i>
                            <span>Order Summary</span>
                        </div>
                        <div class="om-section-content">
                            <div class="om-summary-grid">
                                <div class="om-summary-row">
                                    <span>Subtotal</span>
                                    <span id="modalSubtotal">₱0.00</span>
                                </div>
                                <div class="om-summary-row">
                                    <span>Shipping Fee</span>
                                    <span id="modalShippingFee">₱0.00</span>
                                </div>
                                <div class="om-summary-row" id="modalDiscountRow" style="display:none;">
                                    <span>Discount</span>
                                    <span id="modalDiscount">-₱0.00</span>
                                </div>
                                <div class="om-summary-divider"></div>
                                <div class="om-summary-row om-summary-total">
                                    <span>Total</span>
                                    <span id="modalTotalAmount">₱0.00</span>
                                </div>
                                <div class="om-summary-row">
                                    <span>Payment Method</span>
                                    <span id="modalPaymentMethodOrder">—</span>
                                </div>
                                <div class="om-summary-row">
                                    <span>Payment Status</span>
                                    <span class="om-payment-status" id="modalPaymentStatus">—</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Timeline Section -->
                    <div class="om-section">
                        <div class="om-section-header">
                            <i class="fas fa-clock"></i>
                            <span>Order Timeline</span>
                        </div>
                        <div class="om-section-content">
                            <div class="om-timeline" id="modalTimeline">
                                <!-- Timeline will be populated by JS -->
                            </div>
                        </div>
                    </div>

                    <div class="om-section" id="modalReturnRequestsSection" style="display:none;">
                        <div class="om-section-header">
                            <i class="fas fa-undo"></i>
                            <span>Return Requests</span>
                        </div>
                        <div class="om-section-content">
                            <div id="modalReturnRequestText" class="om-return-request-text">No return request details.</div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="om-footer">
                    <button class="btn btn-secondary" id="printOrderBtn">
                        <i class="fas fa-print"></i> Print Order Slip
                    </button>
                    <div class="om-action-buttons" id="modalActionButtons">
                        <!-- Action buttons will be populated by JS -->
                    </div>
                </div>

            </div>
        </div>

        <!-- PAYMENT DETAILS MODAL -->
        <div id="paymentModal" class="modal-overlay">
            <div class="pay-modal-card">

                <div class="pm-header">
                    <div class="pm-header-text">
                        <span class="pm-eyebrow">Payment Details</span>
                        <h2 class="pm-customer-name" id="modalPaymentCustomerName">—</h2>
                        <span class="pm-order-id" id="modalPaymentOrderID">—</span>
                    </div>
                    <button class="close-btn" id="closePaymentModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="pm-body">
                    <div class="pm-amount-hero">
                        <div class="pm-amount-label">Total Amount</div>
                        <div class="pm-amount-value" id="modalPaymentAmount">—</div>
                    </div>
                    <div class="pm-grid">
                        <div class="pm-field">
                            <span class="pm-field-label">Payment Status</span>
                            <span class="pm-field-value" id="modalPaymentStatusPayment">—</span>
                        </div>
                        <div class="pm-field">
                            <span class="pm-field-label">Payment Method</span>
                            <span class="pm-field-value" id="modalPaymentMethod">—</span>
                        </div>
                        <div class="pm-field">
                            <span class="pm-field-label">Order ID</span>
                            <span class="pm-field-value" id="modalPaymentOrderIDField">—</span>
                        </div>
                        <div class="pm-field">
                            <span class="pm-field-label">Payment Date</span>
                            <span class="pm-field-value" id="modalPaymentDate">—</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- CONFIRM STATUS MODAL -->
        <div class="modal-overlay" id="confirmStatusModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h2 id="confirmModalTitle">Update Order Status</h2>
                    <button class="close-btn" id="closeConfirmModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p id="confirmModalBody"></p>
                </div>
                <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;">
                    <button class="btn btn-secondary" id="cancelConfirmModal">Cancel</button>
                    <button class="btn-confirm" id="confirmStatusBtn">Confirm</button>
                </div>
            </div>
        </div>

        <!-- EDIT PROFILE MODAL -->
        <div class="modal-overlay" id="editProfileModal">
            <div class="modal-container modal-edit-profile">
                <div class="modal-header">
                    <h2>Edit Profile</h2>
                    <button class="close-btn" id="closeEditModal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body" style="padding:20px 24px;">
                    <div class="ep-profile-card">
                        <div class="ep-avatar-wrapper">
                            <div class="ep-avatar-initials" id="epAvatarInitials">ER</div>
                            <img src="/global/pic.png" alt="Profile" id="epAvatarImg" class="ep-avatar-img" onerror="this.style.display='none'">
                            <label for="profileImageInput" class="ep-avatar-edit" title="Change photo">
                                <i class="fas fa-pencil-alt"></i>
                            </label>
                            <input type="file" id="profileImageInput" accept="image/*" style="display:none;" name='profileImageInput'>
                        </div>
                        <div class="ep-card-info">
                            <div class="ep-card-name">Erica Ramirez</div>
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
                    <div class="ep-form-group" style="margin-top:14px;">
                        <label class="ep-label">EMAIL ADDRESS</label>
                        <input type="email" class="ep-input" id="email" value="ericakes.ramirez@lookgoodframes.com" name='email'>
                    </div>
                    <div class="ep-section-title" style="margin-top:10px;">Change password</div>
                    <div class="ep-form-grid" style="margin-top:12px;margin-bottom:8px;">
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

        <!-- LOGOUT MODAL -->
        <div class="modal-overlay" id="logoutModal">
            <div class="modal-container modal-logout" style="max-width:380px;">
                <div class="modal-header">
                    <div class="logout-icon"><i class="fas fa-sign-out-alt"></i></div>
                    <button class="close-btn" id="closeLogoutModal"><i class="fas fa-times"></i></button>
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

        <!-- TOAST -->
        <div id="statusToast" class="status-toast">
            <i class="fas fa-check-circle"></i>
            <span id="toastMessage"></span>
        </div>

        <script src="../adminActions/notifications.js"></script>
        <script src="../adminActions/orders.js"></script>
        <script src="../adminActions/global.js"></script>
    </body>
</html>