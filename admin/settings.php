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
        <title>Settings | Look Good Frames Admin</title>
        <link rel="stylesheet" href="../css/Admin/global.css">
        <link rel="stylesheet" href="../css/Admin/notifications.css">
        <link rel="stylesheet" href="../css/Admin/setting.css">
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
                <div class="notification-container">
                    <div class="notification-trigger" id="notificationTrigger">
                        <i class="fas fa-bell"></i>
                        <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
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
                        <div class="dropdown-item" id="editProfileBtn"><i class="fas fa-user-edit"></i><span>Edit Profile</span></div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" id="logoutBtn"><i class="fas fa-sign-out-alt"></i><span>Logout</span></div>
                    </div>
                </div>
            </header>

            <section class="content">
                <div class="page-header settings-page-header">
                    <h1>Store Configuration</h1>
                    <p>Manage identity, operations, security, and customer-facing preferences from one place.</p>
                </div>

                <!-- Tabs -->
                <div class="settings-tabs" aria-label="Settings sections">
                    <button class="tab-btn active" data-tab="general">
                        <i class="fas fa-store"></i> General
                    </button>
                    <button class="tab-btn" data-tab="admins">
                        <i class="fas fa-users"></i> Admin Users
                    </button>
                    <button class="tab-btn" data-tab="security">
                        <i class="fas fa-shield-alt"></i> Security
                    </button>
                    <button class="tab-btn" data-tab="payment">
                        <i class="fas fa-credit-card"></i> Payment
                    </button>
                    <button class="tab-btn" data-tab="shipping">
                        <i class="fas fa-truck"></i> Shipping
                    </button>
                    <button class="tab-btn" data-tab="orders">
                        <i class="fas fa-shopping-cart"></i> Order Settings
                    </button>
                    <button class="tab-btn" data-tab="notifications">
                        <i class="fas fa-bell"></i> Notifications
                    </button>
                    <button class="tab-btn" data-tab="appearance">
                        <i class="fas fa-palette"></i> Appearance
                    </button>
                </div>

                <!-- General Tab -->
                <div class="tab-content active" id="general">
                    <div class="card">
                        <div class="card-header"><h3>General Settings</h3></div>
                        <form class="settings-section" id="generalForm">
                            <div class="settings-block">
                                <div class="settings-block-header">
                                    <h4>Store Identity</h4>
                                    <p>Basic details customers see first across the storefront.</p>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Store Name</label>
                                        <input type="text" value="Look Good Frames" id="storeName" name='storeName'>
                                    </div>
                                    <div class="form-group">
                                        <label>Store URL</label>
                                        <input type="text" value="www.lookgoodframes.com" id="storeUrl" name='storeUrl'>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Store Description</label>
                                    <textarea rows="4" id="storeDescription" placeholder="Example: Premium eyewear crafted for everyday comfort and style."></textarea>
                                </div>
                            </div>

                            <div class="settings-block">
                                <div class="settings-block-header">
                                    <h4>Contact & Operations</h4>
                                    <p>How customers and couriers can reach your team.</p>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Contact Email</label>
                                        <input type="email" value="support@lookgoodframes.com" id="contactEmail" name='contactEmail'>
                                    </div>
                                    <div class="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" value="+1 234 567 8900" id="phoneNumber" name='phoneNumber'>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Store Address</label>
                                    <textarea rows="2" placeholder="Your store address..." id="storeAddress"></textarea>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Business Hours</label>
                                        <input type="text" value="Mon-Fri: 9AM-6PM, Sat: 9AM-4PM" id="businessHours" name='businessHours'>
                                    </div>
                                    <div class="form-group">
                                        <label>Currency</label>
                                        <select id="currency">
                                            <option value="PHP" selected>PHP (₱)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Social Media Links -->
                            <div class="settings-block">
                                <div class="section-title">
                                    <i class="fas fa-share-alt"></i>
                                    <h4>Social Media Links</h4>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Facebook</label>
                                        <input type="url" placeholder="https://facebook.com/yourpage" id="facebookUrl" name='facebookUrl'>
                                    </div>
                                    <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" placeholder="contact@yourstore.com" id="socialEmail" name='socialEmail'>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Twitter</label>
                                        <input type="url" placeholder="https://twitter.com/yourhandle" id="twitterUrl" name='twitterUrl'>
                                    </div>
                                    <div class="form-group">
                                        <label>Instagram</label>
                                        <input type="url" placeholder="https://instagram.com/yourhandle" id="instagramUrl" name='instagramUrl'>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Admin Users Tab -->
                <div class="tab-content" id="admins">
                    <div class="card">
                        <div class="card-header">
                            <h3>Admin Users</h3>
                            <button class="btn btn-primary btn-sm" id="addAdminBtn">
                                <i class="fas fa-plus"></i> Add Admin
                            </button>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Last Login</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">
                                    <tr data-id="1">
                                        <td><strong>Erica Ramirez</strong></td>
                                        <td>erica.ramirez@lookgoodframes.com</td>
                                        <td><span class="badge badge-info">Main Admin</span></td>
                                        <td>2 hours ago</td>
                                        <td><button class="btn btn-secondary btn-sm edit-admin-btn"><i class="fas fa-edit"></i></button></td>
                                    </tr>
                                    <tr data-id="2">
                                        <td><strong>Pollyne Anne</strong></td>
                                        <td>pollyneanne@lookgoodframes.com</td>
                                        <td><span class="badge badge-success">Admin</span></td>
                                        <td>1 day ago</td>
                                        <td><button class="btn btn-secondary btn-sm edit-admin-btn"><i class="fas fa-edit"></i></button></td>
                                    </tr>
                                    <tr data-id="3">
                                        <td><strong>Eds Halili</strong></td>
                                        <td>edsedseds@lookgoodframes.com</td>
                                        <td><span class="badge badge-success">Admin</span></td>
                                        <td>3 days ago</td>
                                        <td><button class="btn btn-secondary btn-sm edit-admin-btn"><i class="fas fa-edit"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Security Tab -->
                <div class="tab-content" id="security">
                    <!-- Change Password Card -->
                    <div class="card" style="margin-bottom: 24px;">
                        <div class="card-header">
                            <h3><i class="fas fa-lock" style="color:var(--text-muted);margin-right:8px;"></i>Change Password</h3>
                        </div>
                        <form class="settings-section" id="passwordForm">
                            <div class="form-group">
                                <label>Current Password</label>
                                <div class="input-wrapper">
                                    <input type="password" placeholder="Enter current password" id="currentPassword" name='currentPassword'>
                                    <button type="button" class="toggle-password" id="toggleCurrentPassword">
                                        <i class="fas fa-eye" id="toggleCurrentIcon"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>New Password</label>
                                    <div class="input-wrapper">
                                        <input type="password" placeholder="Enter new password" id="newPassword" name='newPassword'>
                                        <button type="button" class="toggle-password" id="toggleNewPassword">
                                            <i class="fas fa-eye" id="toggleNewIcon"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Confirm New Password</label>
                                    <div class="input-wrapper">
                                        <input type="password" placeholder="Confirm new password" id="confirmPassword" name='confirmPassword'>
                                        <button type="button" class="toggle-password" id="toggleConfirmPassword">
                                            <i class="fas fa-eye" id="toggleConfirmIcon"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="info-box">
                                <p class="info-title">Password Requirements:</p>
                                <ul class="info-list">
                                    <li>At least 8 characters long</li>
                                    <li>Include uppercase and lowercase letters</li>
                                    <li>Include at least one number</li>
                                </ul>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-lock"></i> Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Security Settings Card -->
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-shield-alt" style="color:var(--text-muted);margin-right:8px;"></i>Security Settings</h3>
                        </div>
                        <form class="settings-section" id="securityForm">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-title">Two-Factor Authentication</div>
                                    <div class="setting-description">Add an extra layer of security to your account</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="twoFactor" checked name='twoFactor'>
                                    <label for="twoFactor" class="toggle-label"><span class="toggle-slider"></span></label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Session Timeout (minutes)</label>
                                <input type="number" value="30" min="5" max="120" id="sessionTimeout" style="max-width:200px;" name='sessionTimeout'>
                                <small>Automatically log out after this period of inactivity</small>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Payment Tab -->
                <div class="tab-content" id="payment">
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h3>Payment Settings</h3>
                                <p style="color:var(--text-muted);font-size:14px;margin-top:4px;">Configure your store's payment methods and pricing</p>
                            </div>
                        </div>
                        <form class="settings-section" id="paymentForm">
                            <!-- GCash -->
                            <div class="payment-section">
                                <div class="payment-header">
                                    <div class="payment-icon">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div class="payment-info">
                                        <div class="payment-title">GCash Payment</div>
                                        <div class="payment-description">Accept payments via GCash</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="gcashEnabled" checked name='gcashEnabled'>
                                        <label for="gcashEnabled" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="payment-details" id="gcashDetails">
                                    <div class="form-group">
                                        <label>GCash Account Name</label>
                                        <input type="text" value="Look Good Frames" id="gcashName" name='gcashName'>
                                    </div>
                                    <div class="form-group">
                                        <label>GCash Mobile Number</label>
                                        <input type="tel" value="+63 917 123 4567" id="gcashNumber" placeholder="+63 9XX XXX XXXX" name='gcashNumber'>
                                        <small>This number will be shown to customers for payment</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Cash on Delivery -->
                            <div class="payment-section">
                                <div class="payment-header">
                                    <div class="payment-icon">
                                        <i class="fas fa-money-bill-wave"></i>
                                    </div>
                                    <div class="payment-info">
                                        <div class="payment-title">Cash on Delivery</div>
                                        <div class="payment-description">Allow customers to pay upon delivery</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="codEnabled" checked name='codEnabled'>
                                        <label for="codEnabled" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                            </div>

                            <!-- Pricing -->
                            <div class="pricing-section">
                                <div class="section-title">
                                    <i class="fas fa-chart-line"></i>
                                    <h4>Pricing Configuration</h4>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tax Rate (%)</label>
                                        <input type="number" value="8.5" step="0.1" min="0" max="100" id="taxRate" placeholder="0.0" name='taxRate'>
                                        <small>Applied to all product prices</small>
                                    </div>
                                    <div class="form-group">
                                        <label>Shipping Fee (₱)</label>
                                        <input type="number" value="50.00" step="0.01" min="0" id="shippingFee" placeholder="0.00" name='shippingFee'>
                                        <small>Standard shipping fee per order</small>
                                    </div>
                                </div>
                                <div class="form-group" style="margin-top: 10px;">
                                    <label>Free Shipping Threshold (₱)</label>
                                    <input type="number" value="500.00" step="0.01" min="0" id="freeShippingThreshold" placeholder="0.00" name='freeShippingThreshold'>
                                    <small>Orders above this amount get free shipping</small>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Shipping Tab -->
                <div class="tab-content" id="shipping">
                    <div class="card">
                        <div class="card-header"><h3>Shipping Settings</h3></div>
                        <form class="settings-section" id="shippingForm">
                            <!-- Courier Services -->
                            <div class="section-title">
                                <i class="fas fa-truck"></i>
                                <h4>Courier Services</h4>
                            </div>
                            <div class="courier-grid">
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">J&T Express</div>
                                        <div class="setting-description">Enable J&T Express shipping</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="jtEnabled" checked name='jtEnabled'>
                                        <label for="jtEnabled" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">LBC</div>
                                        <div class="setting-description">Enable LBC shipping</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="lbcEnabled" checked name='lbcEnabled'>
                                        <label for="lbcEnabled" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Flash Express</div>
                                        <div class="setting-description">Enable Flash Express shipping</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="flashEnabled" name='flashEnabled'>
                                        <label for="flashEnabled" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Ninja Van</div>
                                        <div class="setting-description">Enable Ninja Van shipping</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="ninjaEnabled" checked name='ninjaEnabled'>
                                        <label for="ninjaEnabled" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                            </div>

                            <!-- Coverage & Timing -->
                            <div class="section-title" style="margin-top: 32px;">
                                <i class="fas fa-map-marked-alt"></i>
                                <h4>Coverage & Timing</h4>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Coverage Area</label>
                                    <select id="coverageArea">
                                        <option value="metro-manila" selected>Metro Manila</option>
                                        <option value="luzon">Luzon</option>
                                        <option value="visayas">Visayas</option>
                                        <option value="mindanao">Mindanao</option>
                                        <option value="nationwide">Nationwide</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Same-Day Cut-off Time</label>
                                    <input type="time" value="14:00" id="cutoffTime" name='cutoffTime'>
                                    <small>Orders after this time will be processed next day</small>
                                </div>
                            </div>

                            <!-- Regional Rates -->
                            <div class="section-title" style="margin-top: 32px;">
                                <i class="fas fa-tags"></i>
                                <h4>Regional Shipping Rates</h4>
                            </div>
                            <div class="rates-grid">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Metro Manila (₱)</label>
                                        <input type="number" value="50" step="1" min="0" id="metroManilaRate" placeholder="0" name='metroManilaRate'>
                                    </div>
                                    <div class="form-group">
                                        <label>Luzon (₱)</label>
                                        <input type="number" value="80" step="1" min="0" id="luzonRate" placeholder="0" name='luzonRate'>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Visayas (₱)</label>
                                        <input type="number" value="100" step="1" min="0" id="visayasRate" placeholder="0" name='visayasRate'>
                                    </div>
                                    <div class="form-group">
                                        <label>Mindanao (₱)</label>
                                        <input type="number" value="120" step="1" min="0" id="mindanaoRate" placeholder="0" name='mindanaoRate'>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Notifications Tab -->
                <div class="tab-content" id="notifications">
                    <div class="card">
                        <div class="card-header"><h3>Notification Settings</h3></div>
                        <form class="settings-section" id="notificationsForm">
                            <!-- Admin Alerts -->
                            <div class="section-title">
                                <i class="fas fa-bell"></i>
                                <h4>Admin Alerts</h4>
                            </div>
                            <div class="alerts-grid">
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">New Order Alerts</div>
                                        <div class="setting-description">Get notified when new orders are placed</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="newOrderAlert" checked name='newOrderAlert'>
                                        <label for="newOrderAlert" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Payment Alerts</div>
                                        <div class="setting-description">Get notified when payments are received</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="paymentAlert" checked name='paymentAlert'>
                                        <label for="paymentAlert" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Low Stock Alerts</div>
                                        <div class="setting-description">Get notified when products are running low</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="lowStockAlert" checked name='lowStockAlert'>
                                        <label for="lowStockAlert" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Cancellation Alerts</div>
                                        <div class="setting-description">Get notified when orders are cancelled</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="cancellationAlert" checked name='cancellationAlert'>
                                        <label for="cancellationAlert" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                            </div>

                            <!-- Customer Notifications -->
                            <div class="section-title" style="margin-top: 32px;">
                                <i class="fas fa-envelope"></i>
                                <h4>Customer Notifications</h4>
                            </div>
                            <div class="customer-notifications">
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Order Confirmation Email</div>
                                        <div class="setting-description">Send email when order is confirmed</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="orderConfirmEmail" checked name='orderConfirmEmail'>
                                        <label for="orderConfirmEmail" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Shipping Email</div>
                                        <div class="setting-description">Send email when order is shipped</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="shippingEmail" checked name='shippingEmail'>
                                        <label for="shippingEmail" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Delivery SMS</div>
                                        <div class="setting-description">Send SMS when order is out for delivery</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="deliverySms" checked name='deliverySms'>
                                        <label for="deliverySms" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Review Request Email</div>
                                        <div class="setting-description">Send email requesting product reviews</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="reviewEmail" name='reviewEmail'>
                                        <label for="reviewEmail" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Order Settings Tab -->
                <div class="tab-content" id="orders">
                    <div class="card">
                        <div class="card-header"><h3>Order Settings</h3></div>
                        <form class="settings-section" id="orderSettingsForm">
                            <!-- Order Processing -->
                            <div class="section-title">
                                <i class="fas fa-cog"></i>
                                <h4>Order Processing</h4>
                            </div>
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-title">Auto-Confirm Orders</div>
                                    <div class="setting-description">Automatically confirm new orders without manual approval</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="autoConfirm" checked name='autoConfirm'>
                                    <label for="autoConfirm" class="toggle-label"><span class="toggle-slider"></span></label>
                                </div>
                            </div>

                            <!-- Order Management -->
                            <div class="section-title" style="margin-top: 32px;">
                                <i class="fas fa-shopping-cart"></i>
                                <h4>Order Management</h4>
                            </div>
                            <div class="order-options">
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Allow Cancellations</div>
                                        <div class="setting-description">Customers can cancel their orders</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="allowCancellations" checked name='allowCancellations'>
                                        <label for="allowCancellations" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Allow Returns</div>
                                        <div class="setting-description">Customers can return products</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="allowReturns" checked name='allowReturns'>
                                        <label for="allowReturns" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                            </div>

                            <!-- Order Configuration -->
                            <div class="section-title" style="margin-top: 32px;">
                                <i class="fas fa-hashtag"></i>
                                <h4>Order Configuration</h4>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Order ID Prefix</label>
                                    <input type="text" value="LGF" maxlength="5" id="orderIdPrefix" name='orderIdPrefix'>
                                    <small>Prefix for all order IDs (max 5 characters)</small>
                                </div>
                            </div>

                            <!-- Return & Refund Policy -->
                            <div class="section-title" style="margin-top: 32px;">
                                <i class="fas fa-file-contract"></i>
                                <h4>Return & Refund Policy</h4>
                            </div>
                            <div class="form-group">
                                <label>Policy Text</label>
                                <textarea rows="6" placeholder="Enter your return and refund policy..." id="refundPolicy">We offer a 30-day return policy for all products. Items must be in original condition with tags attached. Shipping costs for returns are the responsibility of the customer unless the item is defective.</textarea>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Appearance Tab -->
                <div class="tab-content" id="appearance">
                    <div class="card">
                        <div class="card-header"><h3>Appearance Settings</h3></div>
                        <form class="settings-section" id="appearanceForm">
                            <!-- Branding Section -->
                            <div class="settings-group">
                                <h4>Branding</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Logo Upload</label>
                                        <div class="file-upload">
                                            <input type="file" id="logoUpload" accept="image/*" style="display: none;" name='logoUpload'>
                                            <button type="button" class="btn btn-secondary" id="logoBtn">
                                                <i class="fas fa-upload"></i> Choose Logo
                                            </button>
                                            <span id="logoFileName">lookgood-black.png</span>
                                        </div>
                                        <small>Recommended: PNG, 200x60px</small>
                                        <div id="logoPreview" style="margin-top: 12px; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-color); display: none;">
                                            <img id="logoPreviewImg" src="" alt="Logo preview" style="max-width: 100%; max-height: 100px; display: block;">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Favicon Upload</label>
                                        <div class="file-upload">
                                            <input type="file" id="faviconUpload" accept="image/*" style="display: none;" name='faviconUpload'>
                                            <button type="button" class="btn btn-secondary" id="faviconBtn">
                                                <i class="fas fa-upload"></i> Choose Favicon
                                            </button>
                                            <span id="faviconFileName">favicon.ico</span>
                                        </div>
                                        <small>Recommended: ICO/PNG, 32x32px</small>
                                        <div id="faviconPreview" style="margin-top: 12px; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-color); display: none;">
                                            <img id="faviconPreviewImg" src="" alt="Favicon preview" style="width: 48px; height: 48px; display: block;">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Banner Section -->
                            <div class="settings-group">
                                <h4>Banner Image</h4>
                                <div class="form-group">
                                    <label>Banner Upload</label>
                                    <div class="file-upload">
                                        <input type="file" id="bannerUpload" accept="image/*" style="display: none;" name='bannerUpload'>
                                        <button type="button" class="btn btn-secondary" id="bannerBtn">
                                            <i class="fas fa-upload"></i> Choose Banner
                                        </button>
                                        <span id="bannerFileName">No banner selected</span>
                                    </div>
                                    <small>Recommended: JPG/PNG, 1200x300px</small>
                                    <div id="bannerPreview" style="margin-top: 12px; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-color); display: none;">
                                        <img id="bannerPreviewImg" src="" alt="Banner preview" style="max-width: 100%; max-height: 300px; display: block;">
                                    </div>
                                </div>
                            </div>

                            <!-- Announcement Bar Section -->
                            <div class="settings-group">
                                <h4>Announcement Bar</h4>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-title">Enable Announcement Bar</div>
                                        <div class="setting-description">Show announcement bar at the top of your store</div>
                                    </div>
                                    <div class="toggle-switch">
                                        <input type="checkbox" id="announcementEnabled" name='announcementEnabled'>
                                        <label for="announcementEnabled" class="toggle-label"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="form-group" id="announcementTextGroup" style="display: none;">
                                    <label>Announcement Text</label>
                                    <input type="text" placeholder="Enter your announcement..." id="announcementText" name='announcementText'>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            <!-- Add Admin Modal -->
            <div class="modal-overlay" id="addAdminModal">
                <div class="modal-container admin-modal">
                    <div class="modal-header">
                        <h2>Add New Admin</h2>
                        <button class="close-btn" id="closeAddAdminModal"><i class="fas fa-times"></i></button>
                    </div>
                    <form class="modal-body" id="addAdminForm">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter full name" id="addAdminName" required name='addAdminName'>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="Enter email" id="addAdminEmail" required name='addAdminEmail'>
                        </div>
                        <div class="form-group">
                            <label>Role</label>
                            <select id="addAdminRole">
                                <option value="Admin">Admin</option>
                                <option value="Main Admin">Main Admin</option>
                                <option value="Chat Support">Chat Support</option>
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelAddAdmin">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Admin</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit Admin Modal -->
            <div class="modal-overlay" id="editAdminModal">
                <div class="modal-container admin-modal">
                    <div class="modal-header">
                        <h2>Admin Details</h2>
                        <button class="close-btn" id="closeEditAdminModal"><i class="fas fa-times"></i></button>
                    </div>
                    <form class="modal-body" id="editAdminForm">
                        <input type="hidden" id="editAdminId" name='editAdminId'>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="editAdminName" required name='editAdminName'>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="editAdminEmail" required name='editAdminEmail'>
                        </div>
                        <div class="form-group">
                            <label>Role</label>
                            <select id="editAdminRole">
                                <option value="Admin">Admin</option>
                                <option value="Main Admin">Main Admin</option>
                                <option value="Chat Support">Chat Support</option>
                            </select>
                        </div>
                        <div class="form-group setting-item">
                            <div class="setting-info">
                                <div class="setting-title">Account Access</div>
                            </div>
                            <div class="toggle-switch">
                                <input type="checkbox" id="adminAccess" checked name='adminAccess'>
                                <label for="adminAccess" class="toggle-label"><span class="toggle-slider"></span></label>
                                <div class="setting-description" id="accessStatus">Active</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelEditAdmin">Close</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Toast Notification -->
            <div class="toast" id="toast">
                <i class="fas fa-check-circle"></i>
                <span id="toastMessage"></span>
            </div>
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

        <script src="../adminActions/global.js"></script>
        <script src="../adminActions/settings.js"></script>
    </body>
</html>