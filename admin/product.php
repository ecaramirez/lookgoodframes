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
        <title>Products | Look Good Frames Admin</title>
        <link rel="stylesheet" href="../css/Admin/global.css">
        <link rel="stylesheet" href="../css/Admin/notifications.css">
        <link rel="stylesheet" href="../css/Admin/product.css">
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
                    <h2 id="productSectionHeading">Product Overview</h2>
                </div>

                <!-- Tabs -->
                <div class="tabs">
                    <button class="tab-link active" data-tab="productsTab">Products</button>
                    <button class="tab-link" data-tab="inventoryTab">Inventory</button>
                    <button class="tab-link" data-tab="discountsTab">Discounts & Vouchers</button>
                </div>

                <!-- Products Tab -->
                <div class="tab-content active" id="productsTab">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#e0f2fe;color:#0ea5e9;"><i class="fas fa-box"></i></div>
                            </div>
                            <div class="stat-value" id="totalProducts">0</div>
                            <div class="stat-label">Total Products</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#dcfce7;color:#10b981;"><i class="fas fa-check-circle"></i></div>
                            </div>
                            <div class="stat-value" id="inStock">0</div>
                            <div class="stat-label">In Stock</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fef3c7;color:#f59e0b;"><i class="fas fa-exclamation-triangle"></i></div>
                            </div>
                            <div class="stat-value" id="lowStock">0</div>
                            <div class="stat-label">Low Stock</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fee2e2;color:#ef4444;"><i class="fas fa-times-circle"></i></div>
                            </div>
                            <div class="stat-value" id="outOfStock">0</div>
                            <div class="stat-label">Out of Stock</div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="table-row">
                                <div class="card-search-controls">
                                    <div class="card-search-bar">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="searchInput" class="card-search-input" placeholder="Search products..." name='searchInput' autocomplete="off">
                                    </div>
                                    <select id="categoryFilter" class="card-filter-input" autocomplete="off">
                                        <option value="">All Categories</option>
                                        <option value="Women">Women</option>
                                        <option value="Men">Men</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary" onclick="openModal('addProductModal')">
                                    <i class="fas fa-plus"></i> Add Product
                                </button>
                            </div>
                        </div>
                        <table id="productsTable">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product ID</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                        <div class="pagination" id="productsPagination"></div>
                    </div>

                    <!-- Add Product Modal -->
                    <div id="addProductModal" class="modal">
                        <div class="modal-container">
                            <div class="modal-header">
                                <h2><i class="fas fa-plus-circle"></i> Add New Product</h2>
                                <button class="close-btn" id="closeModalBtn">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="product-form-layout">
                                    <div class="product-image-section">
                                        <div class="image-upload-area" id="addImagePreview1">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <p>Click to upload image</p>
                                            <small>PNG, JPG up to 5MB</small>
                                        </div>
                                        <input type="file" id="addImage1" class="form-input" accept="image/*" style="display:none;" name='addImage1'>
                                        
                                        <div class="additional-images-row">
                                            <div class="image-upload-area" id="addImagePreview2">
                                                <i class="fas fa-cloud-upload-alt"></i>
                                                <p>Click to upload image</p>
                                                <small>PNG, JPG up to 5MB</small>
                                            </div>
                                            <input type="file" id="addImage2" class="form-input" accept="image/*" style="display:none;" name='addImage2'>
                                            
                                            <div class="image-upload-area" id="addImagePreview3">
                                                <i class="fas fa-cloud-upload-alt"></i>
                                                <p>Click to upload image</p>
                                                <small>PNG, JPG up to 5MB</small>
                                            </div>
                                            <input type="file" id="addImage3" class="form-input" accept="image/*" style="display:none;" name='addImage3'>
                                            
                                            <div class="image-upload-area" id="addImagePreview4">
                                                <i class="fas fa-cloud-upload-alt"></i>
                                                <p>Click to upload image</p>
                                                <small>PNG, JPG up to 5MB</small>
                                            </div>
                                            <input type="file" id="addImage4" class="form-input" accept="image/*" style="display:none;" name='addImage4'>
                                        </div>
                                    </div>
                                    <div class="product-details-section">
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="addProductId">Product ID *</label>
                                                <input type="text" id="addProductId" class="form-input" placeholder="e.g., LGF-001" name='addProductId'>
                                            </div>
                                            <div class="form-group">
                                                <label for="addProductName">Product Name *</label>
                                                <input type="text" id="addProductName" class="form-input" placeholder="Enter product name" name='addProductName'>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="addDescription">Description</label>
                                            <textarea id="addDescription" class="form-input" rows="3" placeholder="Product description..."></textarea>
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="addCategory">Category *</label>
                                                <select id="addCategory" class="form-input" name = 'addCategory'>
                                                    <option value="">Select Category</option>
                                                    <option value="Men">Men</option>
                                                    <option value="Women">Women</option>
                                                    <option value="Unisex">Unisex</option>
                                                </select>
                                            </div>
                                            <div class="form-group">
                                                <label for="addStock">Stock Quantity *</label>
                                                <input type="number" id="addStock" class="form-input" placeholder="0" min="0" name='addStock'>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="addPrice">Price (₱) *</label>
                                            <input type="number" id="addPrice" class="form-input" placeholder="0.00" min="0" step="0.01" name='addPrice'>
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="addFrameWidth">Frame Width (mm)</label>
                                                <input type="number" id="addFrameWidth" class="form-input" placeholder="140" min="0" step="0.1" name='addFrameWidth'>
                                            </div>
                                            <div class="form-group">
                                                <label for="addTempleLength">Temple Length (mm)</label>
                                                <input type="number" id="addTempleLength" class="form-input" placeholder="145" min="0" step="0.1" name='addTempleLength'>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="addMaterial">Material</label>
                                            <input type="text" id="addMaterial" class="form-input" placeholder="e.g., Acetate, Metal, Titanium" name='addMaterial'>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-actions">
                                <button class="btn btn-secondary" onclick="closeModal('addProductModal')">Cancel</button>
                                <button class="btn btn-primary" onclick="addProduct()" id="addProductBtn">
                                    <i class="fas fa-plus"></i> Add Product
                                </button>
                                <a href="../adminBack_end/get_products.php">hsfheu</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Edit Product Modal -->
                <div id="editProductModal" class="modal">
                    <div class="modal-container">
                        <div class="modal-header">
                            <h2><i class="fas fa-edit"></i> Edit Product</h2>
                            <button class="close-btn" onclick="closeModal('editProductModal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="product-form-layout">
                                <div class="product-image-section">
                                    <div class="image-upload-area" id="editImagePreview1">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <p>Click to change image</p>
                                        <small>PNG, JPG up to 5MB</small>
                                    </div>
                                    <input type="file" id="editImage1" class="form-input" accept="image/*" style="display:none;" name='editImage1'>

                                    <div class="additional-images-row">
                                        <div class="image-upload-area" id="editImagePreview2">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <p>Click to change image</p>
                                            <small>PNG, JPG up to 5MB</small>
                                        </div>
                                        <input type="file" id="editImage2" class="form-input" accept="image/*" style="display:none;" name='editImage2'>

                                        <div class="image-upload-area" id="editImagePreview3">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <p>Click to change image</p>
                                            <small>PNG, JPG up to 5MB</small>
                                        </div>
                                        <input type="file" id="editImage3" class="form-input" accept="image/*" style="display:none;" name='editImage3'>

                                        <div class="image-upload-area" id="editImagePreview4">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <p>Click to change image</p>
                                            <small>PNG, JPG up to 5MB</small>
                                        </div>
                                        <input type="file" id="editImage4" class="form-input" accept="image/*" style="display:none;" name='editImage4'>
                                    </div>
                                </div>
                                <div class="product-details-section">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="editProductId">Product ID</label>
                                            <input type="text" id="editProductId" class="form-input" readonly name='editProductId'>
                                        </div>
                                        <div class="form-group">
                                            <label for="editProductName">Product Name *</label>
                                            <input type="text" id="editProductName" class="form-input" placeholder="Enter product name" name='editProductName'>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="editDescription">Description</label>
                                        <textarea id="editDescription" class="form-input" rows="3" placeholder="Product description..."></textarea>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="editCategory">Category *</label>
                                            <select id="editCategory" class="form-input">
                                                <option value="Men">Men</option>
                                                <option value="Women">Women</option>
                                                <option value="Unisex">Unisex</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="editStock">Stock Quantity *</label>
                                            <input type="number" id="editStock" class="form-input" placeholder="0" min="0" name='editStock'>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="editPrice">Price (₱) *</label>
                                        <input type="number" id="editPrice" class="form-input" placeholder="0.00" min="0" step="0.01" name='editPrice'>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="editFrameWidth">Frame Width (mm)</label>
                                            <input type="number" id="editFrameWidth" class="form-input" placeholder="140" min="0" step="0.1" name='editFrameWidth'>
                                        </div>
                                        <div class="form-group">
                                            <label for="editTempleLength">Temple Length (mm)</label>
                                            <input type="number" id="editTempleLength" class="form-input" placeholder="145" min="0" step="0.1" name='editTempleLength'>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="editMaterial">Material</label>
                                        <input type="text" id="editMaterial" class="form-input" placeholder="e.g., Acetate, Metal, Titanium" name='editMaterial'>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="closeModal('editProductModal')">Cancel</button>
                            <button class="btn btn-primary" onclick="updateProduct()" id="updateProductBtn">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Delete Product Modal -->
                <div id="deleteProductModal" class="modal">
                    <div class="modal-container delete-modal">
                        <div class="modal-header delete-header">
                            <h2><i class="fas fa-exclamation-triangle"></i> Delete Product</h2>
                            <button class="close-btn" onclick="closeModal('deleteProductModal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body delete-body">
                            <div class="delete-warning">
                                <div class="delete-icon">
                                    <i class="fas fa-trash-alt"></i>
                                </div>
                                <h3>Are you sure you want to delete this product?</h3>
                                <p>This action cannot be undone. The product will be permanently removed from the system.</p>
                            </div>
                        </div>
                        <div class="modal-actions delete-actions">
                            <button class="btn btn-secondary" onclick="closeModal('deleteProductModal')">Cancel</button>
                            <button class="btn btn-danger" onclick="confirmDelete()" id="confirmDeleteBtn">
                                <i class="fas fa-trash"></i> Delete Product
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Inventory Tab -->
                <div class="tab-content" id="inventoryTab">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#e0f2fe;color:#0ea5e9;"><i class="fas fa-cubes"></i></div>
                            </div>
                            <div class="stat-value" id="totalItems">0</div>
                            <div class="stat-label">Total Items</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fef3c7;color:#f59e0b;"><i class="fas fa-exclamation-triangle"></i></div>
                            </div>
                            <div class="stat-value" id="lowStockInv">0</div>
                            <div class="stat-label">Low Stock</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fee2e2;color:#ef4444;"><i class="fas fa-times-circle"></i></div>
                            </div>
                            <div class="stat-value" id="outOfStockInv">0</div>
                            <div class="stat-label">Out of Stock</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#f3e8ff;color:#9333ea;"><i class="fas fa-box-open"></i></div>
                            </div>
                            <div class="stat-value" id="overstocked">0</div>
                            <div class="stat-label">Overstocked</div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="table-row">
                                <div class="card-search-controls">
                                    <div class="card-search-bar">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="invSearchInput" class="card-search-input" placeholder="Search inventory..." name='invSearchInput'>
                                    </div>
                                    <select id="stockFilter" class="card-filter-input">
                                        <option value="">All Status</option>
                                        <option value="In Stock">In Stock</option>
                                        <option value="Low Stock">Low Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <table id="inventoryTable">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product ID</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Stock Quantity</th>
                                    <th>Stock Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                        <div class="pagination" id="inventoryPagination"></div>
                    </div>
                </div>

                <!-- Discounts & Vouchers Tab -->
                <div class="tab-content" id="discountsTab">
                    <!-- Discount Stats -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#e0f2fe;color:#0ea5e9;"><i class="fas fa-tag"></i></div>
                            </div>
                            <div class="stat-value" id="totalDiscounts">0</div>
                            <div class="stat-label">Total Discounts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#dcfce7;color:#10b981;"><i class="fas fa-check-circle"></i></div>
                            </div>
                            <div class="stat-value" id="activeDiscounts">0</div>
                            <div class="stat-label">Active Discounts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fef3c7;color:#f59e0b;"><i class="fas fa-clock"></i></div>
                            </div>
                            <div class="stat-value" id="expiringSoon">0</div>
                            <div class="stat-label">Expiring Soon</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background:#fee2e2;color:#ef4444;"><i class="fas fa-times-circle"></i></div>
                            </div>
                            <div class="stat-value" id="expiredDiscounts">0</div>
                            <div class="stat-label">Expired</div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="table-row">
                                <div class="card-search-controls">
                                    <div class="card-search-bar">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="discountSearch" class="card-search-input" placeholder="Search code or description..." name='discountSearch'>
                                    </div>
                                    <select id="discountStatusFilter" class="card-filter-input">
                                        <option value="">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Limit Reached">Limit Reached</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary" onclick="openModal('addDiscountModal')">
                                    <i class="fas fa-plus"></i> Create Discount
                                </button>
                            </div>
                        </div>
                        <table id="discountsTable">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Usage</th>
                                    <th>Valid Until</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                        <div class="pagination" id="discountsPagination"></div>
                    </div>
                </div>

            </section>
        </main>

        <!-- Update Inventory Modal -->
        <div id="updateInventoryModal" class="modal">
            <div class="modal-container">
                <div class="modal-header">
                    <h2><i class="fas fa-boxes"></i> Update</h2>
                    <button class="close-btn" onclick="closeModal('updateInventoryModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 24px;">
                    <div class="inventory-update-form">
                        <!-- First row - Product -->
                        <div class="form-group">
                            <label>Product</label>
                            <div class="product-display" id="inventoryProductName">Loading...</div>
                        </div>

                        <!-- Second row - Current stock and current price -->
                        <div class="form-row" style="gap: 16px;">
                            <div class="form-group">
                                <label>Current Stock</label>
                                <div class="current-value-display" id="currentStockDisplay">0</div>
                            </div>
                            <div class="form-group">
                                <label>Current Price</label>
                                <div class="current-value-display" id="currentPriceDisplay">₱0.00</div>
                            </div>
                        </div>

                        <!-- Third row - New stock quantity and new price -->
                        <div class="form-row" style="gap: 16px;">
                            <div class="form-group">
                                <label for="inventoryStock">New Stock Quantity *</label>
                                <input type="number" id="inventoryStock" class="form-input" min="0" placeholder="Enter new stock quantity" name='inventoryStock'>
                            </div>
                            <div class="form-group">
                                <label for="inventoryPrice">New Price (₱) *</label>
                                <input type="number" id="inventoryPrice" class="form-input" min="0" step="0.01" placeholder="Enter new price" name='inventoryPrice'>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions" style="padding: 20px 24px;">
                    <button class="btn btn-secondary" onclick="closeModal('updateInventoryModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="updateInventory()" id="updateInventoryBtn">
                        <i class="fas fa-save"></i> Update Inventory
                    </button>
                </div>
            </div>
        </div>

        <!--Add Discount Modal-->
        <div id="addDiscountModal" class="modal">
            <div class="modal-container modal-container--lg">
                <div class="modal-header">
                    <h2>Create Discount</h2>
                    <button class="close-btn" onclick="closeModal('addDiscountModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="discountCode">Discount Code *</label>
                            <input type="text" id="discountCode" class="form-input" placeholder="e.g. SUMMER2026" style="text-transform:uppercase;" name='discountCode'>
                        </div>
                        <div class="form-group">
                            <label for="discountType">Type *</label>
                            <select id="discountType" class="form-input">
                                <option value="Percentage">Percentage (%)</option>
                                <option value="Fixed">Fixed Amount (₱)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="discountDescription">Description</label>
                        <input type="text" id="discountDescription" class="form-input" placeholder="Brief description of this discount" name='discountDescription'>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="discountValue">Value *</label>
                            <input type="number" id="discountValue" class="form-input" placeholder="e.g. 20" min="0" name='discountValue'>
                        </div>
                        <div class="form-group">
                            <label for="discountMinPurchase">Minimum Purchase (₱)</label>
                            <input type="number" id="discountMinPurchase" class="form-input" placeholder="0" min="0" name='discountMinPurchase'>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="discountMaxAmount">Maximum Discount (₱) <span style="color:var(--text-muted);font-size:12px;">optional</span></label>
                            <input type="number" id="discountMaxAmount" class="form-input" placeholder="No cap" min="0" name='discountMaxAmount'>
                        </div>
                        <div class="form-group">
                            <label for="discountApplicableTo">Applicable To</label>
                            <select id="discountApplicableTo" class="form-input">
                                <option value="all">All Products</option>
                                <option value="Women">Women</option>
                                <option value="Men">Men</option>
                                <option value="Unisex">Unisex</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="discountStartDate">Start Date *</label>
                            <input type="date" id="discountStartDate" class="form-input" name='discountStartDate'>
                        </div>
                        <div class="form-group">
                            <label for="discountEndDate">End Date *</label>
                            <input type="date" id="discountEndDate" class="form-input" name='discountEndDate'>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="discountUsageLimit">Total Usage Limit *</label>
                            <input type="number" id="discountUsageLimit" class="form-input" placeholder="e.g. 100" min="1" name='discountUsageLimit'>
                        </div>
                        <div class="form-group">
                            <label for="discountPerUserLimit">Per User Limit</label>
                            <input type="number" id="discountPerUserLimit" class="form-input" placeholder="e.g. 1" min="1" name='discountPerUserLimit'>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal('addDiscountModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="addDiscount()">Create Discount</button>
                </div>
            </div>
        </div>

       
        <!--Edit Discount Modal-->
        <div id="editDiscountModal" class="modal">
            <div class="modal-container modal-container--lg">
                <div class="modal-header">
                    <h2>Edit Discount</h2>
                    <button class="close-btn" onclick="closeModal('editDiscountModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="editDiscountId" name='editDiscountId'>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editDiscountCode">Discount Code *</label>
                            <input type="text" id="editDiscountCode" class="form-input" style="text-transform:uppercase;" name='editDiscountCode'>
                        </div>
                        <div class="form-group">
                            <label for="editDiscountType">Type *</label>
                            <select id="editDiscountType" class="form-input">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₱)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editDiscountDescription">Description</label>
                        <input type="text" id="editDiscountDescription" class="form-input" name='editDiscountDescription'>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editDiscountValue">Value *</label>
                            <input type="number" id="editDiscountValue" class="form-input" min="0" name='editDiscountValue'>
                        </div>
                        <div class="form-group">
                            <label for="editDiscountMinPurchase">Minimum Purchase (₱)</label>
                            <input type="number" id="editDiscountMinPurchase" class="form-input" min="0" name='editDiscountMinPurchase'>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editDiscountMaxAmount">Maximum Discount (₱)</label>
                            <input type="number" id="editDiscountMaxAmount" class="form-input" min="0" name='editDiscountMaxAmount'>
                        </div>
                        <div class="form-group">
                            <label for="editDiscountApplicableTo">Applicable To</label>
                            <select id="editDiscountApplicableTo" class="form-input">
                                <option value="all">All Products</option>
                                <option value="Women">Women</option>
                                <option value="Men">Men</option>
                                <option value="Unisex">Unisex</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editDiscountStartDate">Start Date *</label>
                            <input type="date" id="editDiscountStartDate" class="form-input" name='editDiscountStartDate'>
                        </div>
                        <div class="form-group">
                            <label for="editDiscountEndDate">End Date *</label>
                            <input type="date" id="editDiscountEndDate" class="form-input" name='editDiscountEndDate'>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editDiscountUsageLimit">Total Usage Limit *</label>
                            <input type="number" id="editDiscountUsageLimit" class="form-input" min="1" name='editDiscountUsageLimit'>
                        </div>
                        <div class="form-group">
                            <label for="editDiscountPerUserLimit">Per User Limit</label>
                            <input type="number" id="editDiscountPerUserLimit" class="form-input" min="1" name='editDiscountPerUserLimit'>
                        </div>
                    </div>
                    <!-- Active toggle -->
                    <div class="discount-toggle-row">
                        <div>
                            <div class="setting-title">Active Status</div>
                            <div class="setting-description" id="editDiscountStatusText">Active</div>
                        </div>
                        <label class="discount-toggle">
                            <input type="checkbox" id="editDiscountActive" checked name='editDiscountActive'>
                            <span class="discount-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal('editDiscountModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="saveDiscount()">Save Changes</button>
                </div>
            </div>
        </div>

        <!-- Delete Discount Modal -->
        <div id="deleteDiscountModal" class="modal">
            <div class="modal-container delete-modal">
                <div class="modal-header delete-header">
                    <h2><i class="fas fa-exclamation-triangle"></i> Delete Discount</h2>
                    <button class="close-btn" onclick="closeModal('deleteDiscountModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body delete-body">
                    <div class="delete-warning">
                        <div class="delete-icon">
                            <i class="fas fa-trash-alt"></i>
                        </div>
                        <h3>Are you sure you want to delete this discount?</h3>
                        <p>This action cannot be undone. The discount will be permanently removed from the system.</p>
                    </div>
                </div>
                <div class="modal-actions delete-actions">
                    <button class="btn btn-secondary" onclick="closeModal('deleteDiscountModal')">Cancel</button>
                    <button class="btn btn-danger" onclick="confirmDeleteDiscount()">
                        <i class="fas fa-trash"></i> Delete Discount
                    </button>
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

        <!-- View Product Modal -->
        <div id="viewProductModal" class="modal">
            <div class="modal-container">
                <div class="modal-header">
                    <h2><i class="fas fa-eye"></i> View Product</h2>
                    <button class="close-btn" onclick="closeModal('viewProductModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="product-form-layout">
                        <div class="product-image-section" id="viewProductImages">
                            <!-- Images will be populated by JS -->
                        </div>
                        <div class="product-details-section">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Product ID</label>
                                    <input type="text" id="viewProductId" class="form-input" readonly name='viewProductId'>
                                </div>
                                <div class="form-group">
                                    <label>Product Name</label>
                                    <input type="text" id="viewProductName" class="form-input" readonly name='viewProductName'>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="viewProductDescription" class="form-input" rows="3" readonly></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Category</label>
                                    <input type="text" id="viewProductCategory" class="form-input" readonly name='viewProductCategory'>
                                </div>
                                <div class="form-group">
                                    <label>Stock Quantity</label>
                                    <input type="number" id="viewProductStock" class="form-input" readonly name='viewProductStock'>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Price (₱)</label>
                                <input type="text" id="viewProductPrice" class="form-input" readonly name='viewProductPrice'>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Frame Width (mm)</label>
                                    <input type="text" id="viewFrameWidth" class="form-input" readonly name='viewFrameWidth'>
                                </div>
                                <div class="form-group">
                                    <label>Temple Length (mm)</label>
                                    <input type="text" id="viewTempleLength" class="form-input" readonly name='viewTempleLength'>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Material</label>
                                <input type="text" id="viewMaterial" class="form-input" readonly name='viewMaterial'>
                            </div>
                            <div class="form-group" id="saleInfoGroup" style="display:none;">
                                <label>Sale Information</label>
                                <div style="background:#f9f9f9;padding:12px;border-radius:8px;">
                                    <div style="margin-bottom:8px;"><strong>Sale Price:</strong> ₱<span id="viewSalePrice"></span></div>
                                    <div style="margin-bottom:8px;"><strong>Start Date:</strong> <span id="viewSaleStartDate"></span></div>
                                    <div style="margin-bottom:8px;"><strong>End Date:</strong> <span id="viewSaleEndDate"></span></div>
                                    <div><strong>Label:</strong> <span id="viewSaleLabel"></span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sale Product Modal -->
        <div id="saleProductModal" class="modal">
            <div class="modal-container">
                <div class="modal-header">
                    <h2><i class="fas fa-tags"></i> Put Product on Sale</h2>
                    <button class="close-btn" onclick="closeModal('saleProductModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="saleProductName">Product</label>
                        <input type="text" id="saleProductName" class="form-input" readonly name='saleProductName'>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="saleOriginalPrice">Original Price (₱)</label>
                            <input type="text" id="saleOriginalPrice" class="form-input" readonly name='saleOriginalPrice'>
                        </div>
                        <div class="form-group">
                            <label for="salePrice">Sale Price (₱) *</label>
                            <input type="number" id="salePrice" class="form-input" placeholder="0.00" min="0" step="0.01" name='salePrice'>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="saleStartDate">Start Date</label>
                            <input type="date" id="saleStartDate" class="form-input" name='saleStartDate'>
                        </div>
                        <div class="form-group">
                            <label for="saleEndDate">End Date</label>
                            <input type="date" id="saleEndDate" class="form-input" name='saleEndDate'>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="saleLabel">Sale Label (optional)</label>
                        <input type="text" id="saleLabel" class="form-input" placeholder="e.g., Flash Sale, Clearance" name='saleLabel'>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal('saleProductModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="applySale()" id="applySaleBtn">
                        <i class="fas fa-tags"></i> Apply Sale
                    </button>
                    <button class="btn btn-danger" onclick="removeSale()" id="removeSaleBtn" style="display:none;">
                        <i class="fas fa-times"></i> Remove Sale
                    </button>
                </div>
            </div>
        </div>

        <script src="../adminActions/global.js"></script>
        <script src="../adminActions/products.js"></script>
    </body>
</html>