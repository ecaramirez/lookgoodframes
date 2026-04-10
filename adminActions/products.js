// Page trackers
let currentProductsPage  = 1;
let currentInventoryPage = 1;
let currentDiscountsPage = 1;
let activeProductTab = 'productsTab';
const itemsPerPage = 5;
let pendingInventoryHighlightId = null;
let pendingDiscountHighlightCode = null;

// Selection trackers
let selectedProductId   = null;
let deleteTargetId      = null;
let currentInventoryId  = null;
let deleteDiscountId    = null;
let viewModalImageList  = [];
let currentViewImageIndex = 0;
const PRODUCT_ID_PATTERN = /^LGF-\d{3}$/;
// In-memory state synchronized with DB APIs
const mockData = {
    products: [],
    discounts: []
};

function formatProductId(value) {
    const raw = String(value || '').trim().toUpperCase();
    if (!raw) return '';

    if (PRODUCT_ID_PATTERN.test(raw)) return raw;

    const match = raw.match(/^(?:LGF-)?(\d+)$/);
    if (!match) return raw;

    return `LGF-${match[1].padStart(3, '0')}`;
}

function normalizeCategoryValue(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'men' || raw === 'male') return 'male';
    if (raw === 'women' || raw === 'female') return 'female';
    if (raw === 'unisex') return 'unisex';
    return raw;
}

function toCategoryLabel(value) {
    const normalized = normalizeCategoryValue(value);
    if (normalized === 'male') return 'Men';
    if (normalized === 'female') return 'Women';
    if (normalized === 'unisex') return 'Unisex';
    return value || '—';
}

function isLikelyAutofilledEmail(value) {
    const text = String(value || '').trim();
    if (!text) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function clearProductSearchIfAutofilledEmail() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    if (isLikelyAutofilledEmail(searchInput.value)) {
        searchInput.value = '';
    }
}

function getProductSearchTerm() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return '';

    const raw = String(searchInput.value || '').trim();
    if (isLikelyAutofilledEmail(raw)) {
        searchInput.value = '';
        return '';
    }
    return raw.toLowerCase();
}

function renderActiveProductTab() {
    if (activeProductTab === 'inventoryTab') {
        renderInventory();
        return;
    }
    if (activeProductTab === 'discountsTab') {
        renderDiscounts();
        return;
    }
    renderProducts();
}

function normalizeExistingProductIds() {
    mockData.products.forEach((product) => {
        product.id = formatProductId(product.id);
    });
}

normalizeExistingProductIds();

// Helpers
function openModal(modalId)  { document.getElementById(modalId).style.display = 'flex'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

document.querySelectorAll('.modal .close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) modal.style.display = 'none';
    });
});

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Discount status logic
function getDiscountStatus(discount) {
    const now   = new Date();
    const start = new Date(discount.startDate);
    const end   = new Date(discount.endDate);

    if (discount.active === false)                return { label: 'Inactive',      cls: 'badge-muted'   };
    if ((discount.usageCount ?? 0) >= (discount.usageLimit ?? 0) && (discount.usageLimit ?? 0) > 0) return { label: 'Limit Reached', cls: 'badge-purple'  };
    if (now < start)                              return { label: 'Scheduled',     cls: 'badge-info'    };
    if (now > end)                                return { label: 'Expired',       cls: 'badge-danger'  };

    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7)                            return { label: 'Active',        cls: 'badge-warning' };
    return                                               { label: 'Active',        cls: 'badge-success' };
}

// Discount stats
function updateDiscountStats() {
    const now      = new Date();
    const list     = mockData.discounts;
    const total    = list.length;
    const active   = list.filter(d => {
        const s = getDiscountStatus(d);
        return s.label === 'Active';
    }).length;
    const expiring = list.filter(d => {
        if (d.active === false) return false;
        const end = new Date(d.endDate);
        const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 7;
    }).length;
    const expired  = list.filter(d => new Date(d.endDate) < now).length;

    document.getElementById('totalDiscounts').textContent   = total;
    document.getElementById('activeDiscounts').textContent  = active;
    document.getElementById('expiringSoon').textContent     = expiring;
    document.getElementById('expiredDiscounts').textContent = expired;
}

// Render discounts table
function renderDiscounts() {
    const tbody       = document.querySelector('#discountsTable tbody');
    if (!tbody) return;

    const searchInput = document.getElementById('discountSearch');
    const statusInput = document.getElementById('discountStatusFilter');
    const search      = String(searchInput?.value || '').toLowerCase();
    const statusFilter = String(statusInput?.value || '');

    const filtered = mockData.discounts.filter(d => {
        const code = String(d.code || d.id || '').toLowerCase();
        const description = String(d.description || '').toLowerCase();
        const matchSearch = code.includes(search) || description.includes(search);
        const status = getDiscountStatus(d).label;
        const matchStatus = !statusFilter || status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages  = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    if (currentDiscountsPage > totalPages) currentDiscountsPage = totalPages;
    if (currentDiscountsPage < 1) currentDiscountsPage = 1;
    const start       = (currentDiscountsPage - 1) * itemsPerPage;
    const paginated   = filtered.slice(start, start + itemsPerPage);

    if (paginated.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted);">
                No discounts found for the current filters.
            </td>
        </tr>`;
        renderPagination('discountsPagination', currentDiscountsPage, totalPages, 'discounts');
        updateDiscountStats();
        return;
    }

    tbody.innerHTML = paginated.map(d => {
        
        const status    = getDiscountStatus(d);
        const typeValue = String(d.type || d.carts || '').toLowerCase();
        const typeLabel = typeValue === 'percentage' ? `${d.value}%` : `₱${d.value}`;
        const typeText  = typeValue === 'percentage' ? 'Percentage' : 'Fixed';
        return `
        <tr data-discount-code="${d.code}">
            <td><span class="discount-code">${d.code}</span></td>
            <td>${d.description || '—'}</td>
            <td>${typeText}</td>
            <td><strong>${typeLabel}</strong></td>
            <td>${d.perUserLimit ?? d.UsagePerUser ?? '—'} / ${d.usageLimit ?? d.totalUsageLimit ?? '—'}</td>
            <td>${formatDate(d.endDate)}</td>
            <td><span class="badge ${status.cls}">${status.label}</span></td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="openEditDiscountModal('${d.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="openDeleteDiscountModal('${d.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    if (pendingDiscountHighlightCode) {
        highlightDiscountRow(pendingDiscountHighlightCode);
        pendingDiscountHighlightCode = null;
    }

    renderPagination('discountsPagination', currentDiscountsPage, totalPages, 'discounts');
    updateDiscountStats();
}

// Add discount
function addDiscount() {
    console.log('Attempting to add discount...');
    const code         = document.getElementById('discountCode').value.trim().toUpperCase();
    const description  = document.getElementById('discountDescription').value.trim();
    const type         = document.getElementById('discountType').value;
    const value        = parseFloat(document.getElementById('discountValue').value);
    const minPurchase  = parseFloat(document.getElementById('discountMinPurchase').value) || 0;
    const maxAmount    = parseFloat(document.getElementById('discountMaxAmount').value) || null;
    const startDate    = document.getElementById('discountStartDate').value;
    const endDate      = document.getElementById('discountEndDate').value;
    const usageLimit   = parseInt(document.getElementById('discountUsageLimit').value);
    const perUserLimit = parseInt(document.getElementById('discountPerUserLimit').value) || 1;
    const applicableTo = document.getElementById('discountApplicableTo').value;

    if (!code || isNaN(value) || !startDate || !endDate || isNaN(usageLimit)) {
        alert('Please fill out all required fields.');
        return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
        alert('End date must be after start date.');
        return;
    }
    if (mockData.discounts.find(d => d.code === code)) {
        alert(`Discount code "${code}" already exists.`);
        return;
    }

    const formData = new FormData();
    formData.append('discountCode',        code);
    formData.append('discountDescription', description);
    formData.append('discountType',        type);
    formData.append('discountValue',       value);
    formData.append('discountMinPurchase', minPurchase);
    formData.append('discountMaxAmount',   maxAmount ?? '');   // send empty string when null
    formData.append('discountStartDate',   startDate);
    formData.append('discountEndDate',     endDate);
    formData.append('discountUsageLimit',  usageLimit);
    formData.append('discountPerUserLimit',perUserLimit);
    formData.append('discountApplicableTo',applicableTo);

    fetch('../adminBack_end/add_discount.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        console.log('ADD DISCOUNT RESPONSE:', data);

        if (data.trim().toLowerCase() === 'success') {
            pendingDiscountHighlightCode = code;
            closeModal('addDiscountModal');

            ['discountCode','discountDescription','discountValue','discountMinPurchase',
             'discountMaxAmount','discountStartDate','discountEndDate','discountUsageLimit',
             'discountPerUserLimit'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });

            loadDiscounts();
            alert('Discount created successfully!');
        } else {
            alert('Failed to create discount: ' + data);
        }
    })
    .catch(err => {
        console.error(err);
        alert('Request failed.');
    });

    // ✅ FIX 2 (cont.): nothing here anymore — removed the premature
    //    closeModal / field clear / renderDiscounts / alert that used to live here
}
// Open edit discount modal
function openEditDiscountModal(discountId) {
    const d = mockData.discounts.find(x => x.id === discountId);
    if (!d) return;

    document.getElementById('editDiscountId').value           = d.id;
    document.getElementById('editDiscountCode').value         = d.code;
    document.getElementById('editDiscountDescription').value  = d.description || '';
    document.getElementById('editDiscountType').value         = d.type;
    document.getElementById('editDiscountValue').value        = d.value;
    document.getElementById('editDiscountMinPurchase').value  = d.minPurchase || 0;
    document.getElementById('editDiscountMaxAmount').value    = d.maxAmount || '';
    document.getElementById('editDiscountStartDate').value    = formatDateForInput(d.startDate);
    document.getElementById('editDiscountEndDate').value      = formatDateForInput(d.endDate);
    document.getElementById('editDiscountUsageLimit').value   = d.usageLimit;
    document.getElementById('editDiscountPerUserLimit').value = d.perUserLimit || 1;
    document.getElementById('editDiscountApplicableTo').value = d.applicableTo || 'all';

    const toggle = document.getElementById('editDiscountActive');
    toggle.checked = d.active;
    document.getElementById('editDiscountStatusText').textContent = d.active ? 'Active' : 'Inactive';

    toggle.onchange = () => {
        document.getElementById('editDiscountStatusText').textContent =
            toggle.checked ? 'Active' : 'Inactive';
    };

    openModal('editDiscountModal');
}

// Save edited discount
function saveDiscount() {
    const id           = document.getElementById('editDiscountId').value;
    const d            = mockData.discounts.find(x => x.id === id);
    if (!d) return;

    const code         = document.getElementById('editDiscountCode').value.trim().toUpperCase();
    const startDate    = document.getElementById('editDiscountStartDate').value;
    const endDate      = document.getElementById('editDiscountEndDate').value;

    if (!code || !startDate || !endDate) {
        alert('Please fill out all required fields.');
        return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
        alert('End date must be after start date.');
        return;
    }
    const duplicate = mockData.discounts.find(x => x.code === code && x.id !== id);
    if (duplicate) {
        alert(`Discount code "${code}" already exists.`);
        return;
    }

    const formData = new FormData();
    formData.append('discountId', id);
    formData.append('discountCode', code);
    formData.append('discountDescription', document.getElementById('editDiscountDescription').value.trim());
    formData.append('discountType', document.getElementById('editDiscountType').value);
    formData.append('discountValue', document.getElementById('editDiscountValue').value);
    formData.append('discountMinPurchase', document.getElementById('editDiscountMinPurchase').value || 0);
    formData.append('discountMaxAmount', document.getElementById('editDiscountMaxAmount').value || '');
    formData.append('discountStartDate', startDate);
    formData.append('discountEndDate', endDate);
    formData.append('discountUsageLimit', document.getElementById('editDiscountUsageLimit').value);
    formData.append('discountPerUserLimit', document.getElementById('editDiscountPerUserLimit').value || 1);
    formData.append('discountApplicableTo', document.getElementById('editDiscountApplicableTo').value);
    formData.append('discountActive', document.getElementById('editDiscountActive').checked ? '1' : '0');

    fetch('../adminBack_end/edit_discount.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        if (data.trim().toLowerCase() === 'success') {
            closeModal('editDiscountModal');
            loadDiscounts();
            alert('Discount updated successfully!');
        } else {
            alert('Update failed: ' + data);
        }
    })
    .catch(err => {
        console.error(err);
        alert('Request failed.');
    });
}

// Delete discount
function openDeleteDiscountModal(discountId) {
    deleteDiscountId = discountId;
    openModal('deleteDiscountModal');
}

function confirmDeleteDiscount() {
    if (!deleteDiscountId) return;
    const formData = new FormData();
    formData.append('discountId', deleteDiscountId);

    fetch('../adminBack_end/delete_discount.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        if (data.trim().toLowerCase() === 'success') {
            deleteDiscountId = null;
            closeModal('deleteDiscountModal');
            loadDiscounts();
            alert('Discount deleted successfully!');
        } else {
            alert('Delete failed: ' + data);
        }
    })
    .catch(err => {
        console.error(err);
        alert('Request failed.');
    });
}

function formatDateForInput(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function normalizeDiscountRecord(item) {
    const cartsValue = String(item.carts || item.type || '').toLowerCase();
    return {
        id: item.discountCode || item.id || '',
        code: item.discountCode || item.code || '',
        type: cartsValue === 'fixed amount' ? 'fixed' : 'percentage',
        description: item.description || '',
        value: parseFloat(item.discountValue ?? item.value ?? 0),
        minPurchase: parseFloat(item.minPurchase ?? 0),
        maxAmount: item.maxDiscount === null || item.maxDiscount === undefined || item.maxDiscount === '' ? null : parseFloat(item.maxDiscount),
        applicableTo: item.discountCategory || item.applicableTo || 'Unisex',
        startDate: formatDateForInput(item.startDate),
        endDate: formatDateForInput(item.endDate),
        usageLimit: parseInt(item.totalUsageLimit ?? item.usageLimit ?? 0),
        perUserLimit: parseInt(item.UsagePerUser ?? item.perUserLimit ?? 1),
        usageCount: parseInt(item.usageCount ?? 0),
        active: item.active !== undefined ? Boolean(item.active) : true
    };
}

function loadDiscounts() {
    fetch(`../adminBack_end/get_discounts.php?_=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.text())
        .then(data => {
            try {
                const json = JSON.parse(data);
                mockData.discounts = Array.isArray(json) ? json.map(normalizeDiscountRecord) : [];
                renderDiscounts();
                updateDiscountStats();
            } catch (error) {
                console.error('JSON ERROR:', error);
                alert('Invalid JSON from discount server');
            }
        })
        .catch(err => console.error('FETCH ERROR:', err));
}

// Image upload handlers
document.addEventListener('DOMContentLoaded', function() {
    // Add product image uploads (4 images)
    for (let i = 1; i <= 4; i++) {
        const addImageArea = document.getElementById(`addImagePreview${i}`);
        const addImageInput = document.getElementById(`addImage${i}`);

        if (addImageArea && addImageInput) {
            addImageArea.addEventListener('click', () => addImageInput.click());
            addImageInput.addEventListener('change', (e) => handleImagePreview(e, `addImagePreview${i}`));
        }
    }

    // Edit product image uploads (4 images)
    for (let i = 1; i <= 4; i++) {
        const editImageArea = document.getElementById(`editImagePreview${i}`);
        const editImageInput = document.getElementById(`editImage${i}`);

        if (editImageArea && editImageInput) {
            editImageArea.addEventListener('click', () => editImageInput.click());
            editImageInput.addEventListener('change', (e) => handleImagePreview(e, `editImagePreview${i}`));
        }
    }
});

function handleImagePreview(event, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(previewId);
        preview.innerHTML = `<img src="${e.target.result}" alt="Product image">`;
    };
    reader.readAsDataURL(file);
}
function addProduct() {
    const warning = document.getElementById('productIdWarning');
    if (warning && warning.style.display === 'flex') {
        alert('Please use a unique Product ID before submitting.');
        return;
    }

    // ✅ FORMAT + VALIDATE
    const rawId = document.getElementById('addProductId').value.trim();
    const id = formatProductId(rawId);

    const name = document.getElementById('addProductName').value.trim();
    const description = document.getElementById('addDescription').value.trim();
    const categoryInput = document.getElementById('addCategory').value;
    const category = normalizeCategoryValue(categoryInput);
    const stock = parseInt(document.getElementById('addStock').value) || 0;
    const price = parseFloat(document.getElementById('addPrice').value) || 0;
    const frameWidth = parseFloat(document.getElementById('addFrameWidth').value) || 0;
    const templeLength = parseFloat(document.getElementById('addTempleLength').value) || 0;
    const material = document.getElementById('addMaterial').value.trim();

    if (!id || !name || !category || price <= 0) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    if (!PRODUCT_ID_PATTERN.test(id)) {
        alert('Product ID must use the LGF-001 format.');
        return;
    }

    const duplicateProductId = mockData.products.some(p => formatProductId(p.id) === id);
    if (duplicateProductId) {
        alert(`Product ID "${id}" already exists.`);
        return;
    }

    // ✅ PREPARE FORM DATA (FOR PHP)
    const formData = new FormData();
    formData.append('addProductID', id);
    formData.append('addProductName', name);
    formData.append('addProductDescription', description);
    formData.append('addProductCategory', category);
    formData.append('addProductPrice', price);
    formData.append('addProductStock', stock);

    // ✅ EXTRA FIELDS (NEW)
    formData.append('addProductFrame', frameWidth);
    formData.append('addProductTemple', templeLength);
    formData.append('addProductMaterial', material);

    // ✅ HANDLE IMAGES
    const images = [];
    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`addImage${i}`);
        const file = input?.files?.[0];

        if (file) {
            formData.append(`addProductImage${i}`, file);
            images.push(URL.createObjectURL(file)); // for preview
        }
    }

    if (images.length === 0) {
        images.push('/global/jin.jpg');
    }

    // ✅ SEND TO SERVER
    fetch('../adminBack_end/add_products.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        console.log("ADD RESPONSE:", data);

        if (data.trim().toLowerCase() === 'success') {

            // ✅ ALSO UPDATE LOCAL STATE (instant UI)
            mockData.products.push({
                id,
                name,
                description,
                category,
                stock,
                price,
                images,
                frameWidth,
                templeLength,
                material
            });

            // ✅ CLEAR FORM
            [
                'addProductId','addProductName','addDescription','addStock',
                'addPrice','addFrameWidth','addTempleLength','addMaterial'
            ].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });

            document.getElementById('addCategory').value = '';

            // ✅ RESET IMAGES
            for (let i = 1; i <= 4; i++) {
                const preview = document.getElementById(`addImagePreview${i}`);
                const input   = document.getElementById(`addImage${i}`);

                if (preview) {
                    preview.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Click to upload image</p>
                        <small>PNG, JPG up to 5MB</small>
                    `;
                }
                if (input) input.value = '';
            }

            if (warning) warning.style.display = 'none';
            document.getElementById('addProductId').style.borderColor = '';

            // ✅ UPDATE UI
            updateStats();
            updateInvStats();
            renderProducts();
            renderInventory();

            alert('Product added successfully!');
            closeModal('addProductModal');

        } else {
            alert('Add failed: ' + data);
        }
    })
    .catch(err => {
        console.error(err);
        alert('Request failed.');
    });
}
function updateProduct() {
    const id = document.getElementById('editProductId').value;
    const category = normalizeCategoryValue(document.getElementById('editCategory').value);

    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', document.getElementById('editProductName').value.trim());
    formData.append('description', document.getElementById('editDescription').value.trim());
    formData.append('category', category);
    formData.append('price', document.getElementById('editPrice').value);
    formData.append('stock', document.getElementById('editStock').value);
    formData.append('frameWidth', document.getElementById('editFrameWidth').value);
    formData.append('templeLength', document.getElementById('editTempleLength').value);
    formData.append('material', document.getElementById('editMaterial').value);

    // ✅ HANDLE MULTIPLE IMAGES (1–4)
    for (let i = 1; i <= 4; i++) {
        const file = document.getElementById(`editImage${i}`).files[0];
        if (file) {
            formData.append(`image${i}`, file);
        }
    }

    fetch('../adminBack_end/edit_products.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        console.log("EDIT RESPONSE:", data);

        if (data.trim().toLowerCase() === 'success') {
            alert('Product updated successfully!');
            closeModal('editProductModal');
            loadProducts(); // ✅ reload from DB
        } else {
            alert('Update failed: ' + data);
        }
    })
    .catch(err => {
        console.error(err);
        alert('Request failed.');
    });
}
function loadProducts() {
    fetch(`../adminBack_end/get_products.php?_=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.text()) // 👈 CHANGE THIS
        .then(data => {
            console.log("RAW RESPONSE:", data); // 👈 DEBUG

            try {
                const json = JSON.parse(data);
                mockData.products = json.map((p) => ({
                    ...p,
                    id: formatProductId(p.id),
                    category: normalizeCategoryValue(p.category)
                }));

                clearProductSearchIfAutofilledEmail();

                renderProducts();
                renderInventory();
                updateStats();
                updateInvStats();

            } catch (e) {
                console.error("JSON ERROR:", e);
                alert("Invalid JSON from server");
            }
        })
        .catch(err => console.error("FETCH ERROR:", err));
}
function openViewModal(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) return;

    // Populate view modal with product details
    document.getElementById('viewProductId').value = product.id;
    document.getElementById('viewProductName').value = product.name;
    document.getElementById('viewProductCategory').value = product.category;
    document.getElementById('viewProductPrice').value = product.price.toLocaleString();
    document.getElementById('viewProductStock').value = product.stock;
    document.getElementById('viewProductDescription').value = product.description || 'No description available';
    document.getElementById('viewFrameWidth').value = product.frameWidth || 'N/A';
    document.getElementById('viewTempleLength').value = product.templeLength || 'N/A';
    document.getElementById('viewMaterial').value = product.material || 'N/A';

    // Show sale info if on sale
    const saleInfoGroup = document.getElementById('saleInfoGroup');
    if (product.onSale) {
        document.getElementById('viewSalePrice').textContent = product.salePrice.toLocaleString();
        document.getElementById('viewSaleStartDate').textContent = product.saleStartDate || 'Not set';
        document.getElementById('viewSaleEndDate').textContent = product.saleEndDate || 'Not set';
        document.getElementById('viewSaleLabel').textContent = product.saleLabel || 'No label';
        saleInfoGroup.style.display = 'block';
    } else {
        saleInfoGroup.style.display = 'none';
    }

    // Handle images - similar to edit modal structure
    const images = product.images && product.images.length ? product.images : ['/global/jin.jpg'];
    viewModalImageList = images.slice(0, 4);
    currentViewImageIndex = 0;
    renderViewImages(viewModalImageList, currentViewImageIndex);

    openModal('viewProductModal');
}

function renderViewImages(images, selectedIndex) {
    const imageContainer = document.getElementById('viewProductImages');
    const mainImage = images[selectedIndex] || '/global/jin.jpg';
    const mainImageHtml = `
        <div id="viewMainImage" class="image-upload-area" style="background-image: url('${mainImage}'); background-size: cover; background-position: center; cursor: default;"></div>
    `;

    const thumbnailImages = images
        .map((img, index) => ({ img, index }))
        .filter(item => item.index !== selectedIndex);

    const thumbnailsHtml = `
        <div class="additional-images-row">
            ${thumbnailImages.map((item) => `
                <div class="image-upload-area thumbnail"
                    style="background-image: url('${item.img}'); background-size: cover; background-position: center;"
                    onclick="setViewMainImage(${item.index})"></div>
            `).join('')}
        </div>
    `;

    imageContainer.innerHTML = mainImageHtml + thumbnailsHtml;
}

function setViewMainImage(index) {
    if (!viewModalImageList || index < 0 || index >= viewModalImageList.length) return;
    currentViewImageIndex = index;
    renderViewImages(viewModalImageList, currentViewImageIndex);
}

function openEditModal(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('editProductId').value    = product.id;
    document.getElementById('editProductName').value  = product.name;
    document.getElementById('editDescription').value  = product.description || '';
    document.getElementById('editCategory').value     = toCategoryLabel(product.category);
    document.getElementById('editStock').value        = product.stock;
    document.getElementById('editPrice').value        = product.price;
    document.getElementById('editFrameWidth').value   = product.frameWidth || '';
    document.getElementById('editTempleLength').value = product.templeLength || '';
    document.getElementById('editMaterial').value     = product.material || '';

    const images = product.images || ['/global/jin.jpg'];

    for (let i = 1; i <= 4; i++) {
        const preview = document.getElementById(`editImagePreview${i}`);
        const imageSrc = images[i - 1] || '/global/jin.jpg';
        if (preview) {
            preview.innerHTML = `<img src="${imageSrc}" alt="Product image">`;
        }
        const input = document.getElementById(`editImage${i}`);
        if (input) input.value = '';
    }

    openModal('editProductModal');
}

function openSaleModal(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('saleProductName').value = product.name;
    document.getElementById('saleOriginalPrice').value = product.price.toLocaleString();
    document.getElementById('salePrice').value = product.salePrice || '';
    document.getElementById('saleStartDate').value = product.saleStartDate || '';
    document.getElementById('saleEndDate').value = product.saleEndDate || '';
    document.getElementById('saleLabel').value = product.saleLabel || '';

    const removeBtn = document.getElementById('removeSaleBtn');
    if (product.onSale) {
        removeBtn.style.display = 'inline-block';
    } else {
        removeBtn.style.display = 'none';
    }

    selectedProductId = productId;
    openModal('saleProductModal');
}

function applySale() {
    const product = mockData.products.find(p => p.id === selectedProductId);
    if (!product) return;

    const salePrice = parseFloat(document.getElementById('salePrice').value);
    const startDate = document.getElementById('saleStartDate').value;
    const endDate = document.getElementById('saleEndDate').value;
    const label = document.getElementById('saleLabel').value.trim();

    if (!salePrice || salePrice <= 0) {
        alert('Please enter a valid sale price.');
        return;
    }

    if (salePrice >= product.price) {
        alert('Sale price must be less than the original price.');
        return;
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        alert('End date must be after start date.');
        return;
    }

    product.onSale = true;
    product.salePrice = salePrice;
    product.saleStartDate = startDate || null;
    product.saleEndDate = endDate || null;
    product.saleLabel = label || null;

    updateStats();
    renderProducts();
    alert('Sale applied successfully!');
    closeModal('saleProductModal');
}

function removeSale() {
    const product = mockData.products.find(p => p.id === selectedProductId);
    if (!product) return;

    product.onSale = false;
    product.salePrice = null;
    product.saleStartDate = null;
    product.saleEndDate = null;
    product.saleLabel = null;

    updateStats();
    renderProducts();
    alert('Sale removed successfully!');
    closeModal('saleProductModal');
}

function openDeleteModal(productId) {
    deleteTargetId = productId;
    openModal('deleteProductModal');
}

function confirmDelete() {
    if (!deleteTargetId) return;

    fetch(`../adminBack_end/delete_products.php?id=${encodeURIComponent(deleteTargetId)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                mockData.products = mockData.products.filter(p => p.id !== deleteTargetId);
                deleteTargetId = null;
                closeModal('deleteProductModal');
                renderProducts();
                updateStats();
                updateInvStats();
            } else {
                alert('Delete failed: ' + (data.error || 'Unknown error'));
                deleteTargetId = null;
            }
        })
        .catch(err => {
            console.error('Delete error:', err);
            alert('Request failed.');
            deleteTargetId = null;
        });
}

// Inventory
function openInventoryModal(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        alert('Product not found!');
        return;
    }
    currentInventoryId = productId;

    // Check if modal elements exist
    const productNameEl = document.getElementById('inventoryProductName');
    const stockDisplayEl = document.getElementById('currentStockDisplay');
    const priceDisplayEl = document.getElementById('currentPriceDisplay');
    const stockInputEl = document.getElementById('inventoryStock');
    const priceInputEl = document.getElementById('inventoryPrice');

    if (!productNameEl || !stockDisplayEl || !priceDisplayEl || !stockInputEl || !priceInputEl) {
        console.error('Modal elements not found');
        alert('Modal elements not found. Please refresh the page.');
        return;
    }

    // Reset modal content first
    productNameEl.textContent = 'Loading...';
    stockDisplayEl.textContent = '0';
    priceDisplayEl.textContent = '₱0.00';
    stockInputEl.value = '';
    priceInputEl.value = '';

    // Populate product info
    productNameEl.textContent = product.name;
    stockDisplayEl.textContent = product.stock.toString();
    priceDisplayEl.textContent = `₱${product.price.toFixed(2)}`;

    // Set form values
    stockInputEl.value = product.stock;
    priceInputEl.value = product.price.toFixed(2);

    openModal('updateInventoryModal');
}

function updateInventory() {
    const stock = parseInt(document.getElementById('inventoryStock').value);
    const price = parseFloat(document.getElementById('inventoryPrice').value);

    if (isNaN(stock) || stock < 0) {
        alert('Please enter a valid stock quantity.');
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price.');
        return;
    }
    if (!currentInventoryId) {
        alert('No product selected.');
        return;
    }

    fetch('../adminBack_end/productsAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentInventoryId, stock, price })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Update local state
            const product = mockData.products.find(p => p.id === currentInventoryId);
            if (product) {
                product.stock = stock;
                product.price = price;
            }

            if (typeof window.loadNotifications === 'function') {
                window.loadNotifications();
            }

            closeModal('updateInventoryModal');
            renderProducts();
            renderInventory();
            updateStats();
            updateInvStats();
            alert('Inventory updated successfully!');
        } else {
            alert('Update failed: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Inventory update error:', err);
        alert('Request failed.');
    });
}

function getStockStatus(stock) {
    if (stock === 0)   return { label: 'Out of Stock', class: 'badge-danger'  };
    if (stock < 15)    return { label: 'Low Stock',    class: 'badge-warning' };
    return                    { label: 'In Stock',     class: 'badge-success' };
}

// Stats
function updateStats() {
    const p = mockData.products;
    document.getElementById('totalProducts').textContent = p.length;
    document.getElementById('inStock').textContent       = p.filter(x => x.stock >= 15).length;
    document.getElementById('lowStock').textContent      = p.filter(x => x.stock > 0 && x.stock < 15).length;
    document.getElementById('outOfStock').textContent    = p.filter(x => x.stock === 0).length;
}

function updateInvStats() {
    const p = mockData.products;
    document.getElementById('totalItems').textContent      = p.length;
    document.getElementById('lowStockInv').textContent     = p.filter(x => x.stock > 0 && x.stock < 15).length;
    document.getElementById('outOfStockInv').textContent   = p.filter(x => x.stock === 0).length;
    document.getElementById('overstocked').textContent     = p.filter(x => x.stock > 100).length;
}

// Render products
function renderProducts() {
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;

    const categoryFilter = document.getElementById('categoryFilter');
    const search = getProductSearchTerm();
    const category = normalizeCategoryValue(categoryFilter?.value || '');

    const filtered = mockData.products.filter(p => {
        const productName = String(p.name || '').toLowerCase();
        const productId = String(p.id || '').toLowerCase();
        const matchesSearch = productName.includes(search) || productId.includes(search);
        const matchesCategory = !category || normalizeCategoryValue(p.category) === category;
        return matchesSearch && matchesCategory;
    });

    const totalPages  = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    if (currentProductsPage > totalPages) currentProductsPage = totalPages;
    if (currentProductsPage < 1) currentProductsPage = 1;
    const start       = (currentProductsPage - 1) * itemsPerPage;
    const paginated   = filtered.slice(start, start + itemsPerPage);

    if (paginated.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">
                    No products found for the current filters.
                </td>
            </tr>
        `;
        renderPagination('productsPagination', currentProductsPage, totalPages, 'products');
        return;
    }

    tableBody.innerHTML = paginated.map(p => `
        <tr>
            <td><img src="${p.images && p.images[0] ? p.images[0] : '/global/jin.jpg'}" alt="${p.name}" class="avatar" style="width:80px;height:80px;border-radius:8px;object-fit:cover;"></td>
            <td><strong>${p.id}</strong></td>
            <td><strong>${p.name}</strong></td>
            <td>${toCategoryLabel(p.category)}</td>
            <td><span class="badge ${p.onSale ? 'badge-purple' : 'badge-success'}">${p.onSale ? 'On Sale' : 'Regular'}</span></td>
            <td><strong>${p.onSale ? `<span style="text-decoration:line-through;color:#888;">₱${p.price}</span> <span style="color:#e74c3c;">₱${p.salePrice}</span>` : `₱${p.price}`}</strong></td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="openViewModal('${p.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal('${p.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="openSaleModal('${p.id}')" title="Put on Sale">
                        <i class="fas fa-tags"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="openDeleteModal('${p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    renderPagination('productsPagination', currentProductsPage, totalPages, 'products');
}

// Render inventory
function renderInventory() {
    const tableBody  = document.querySelector('#inventoryTable tbody');
    const search     = document.getElementById('invSearchInput').value.toLowerCase();
    const stockFilter = document.getElementById('stockFilter').value;

    const filtered = mockData.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const statusInfo    = getStockStatus(p.stock);
        const matchesStock  = !stockFilter || statusInfo.label === stockFilter;
        return matchesSearch && matchesStock;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start      = (currentInventoryPage - 1) * itemsPerPage;
    const paginated  = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = paginated.map(p => {
        const statusInfo = getStockStatus(p.stock);
        return `
        <tr data-product-id="${p.id}">
            <td><img src="${p.images && p.images[0] ? p.images[0] : '/global/jin.jpg'}" alt="${p.name}" class="avatar" style="width:80px;height:80px;border-radius:8px;object-fit:cover;"></td>
            <td><strong>${p.id}</strong></td>
            <td><strong>${p.name}</strong></td>
            <td>${toCategoryLabel(p.category)}</td>
            <td><strong>${p.stock}</strong></td>
            <td><span class="badge ${statusInfo.class}">${statusInfo.label}</span></td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="openInventoryModal('${p.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    renderPagination('inventoryPagination', currentInventoryPage, totalPages, 'inventory');

    if (pendingInventoryHighlightId) {
        highlightInventoryRow(pendingInventoryHighlightId);
        pendingInventoryHighlightId = null;
    }
}

function highlightInventoryRow(productId) {
    const row = document.querySelector(`#inventoryTable tbody tr[data-product-id="${productId}"]`);
    if (!row) return;

    row.classList.remove('notification-target-highlight');
    void row.offsetWidth;
    row.classList.add('notification-target-highlight');
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function highlightDiscountRow(discountCode) {
    const row = document.querySelector(`#discountsTable tbody tr[data-discount-code="${discountCode}"]`);
    if (!row) return;

    row.classList.remove('notification-target-highlight');
    void row.offsetWidth;
    row.classList.add('notification-target-highlight');
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateProductSectionHeading(tabId) {
    const heading = document.getElementById('productSectionHeading');
    if (!heading) return;

    const headings = {
        productsTab: 'Product Overview',
        inventoryTab: 'Inventory Management',
        discountsTab: 'Discounts & Vouchers'
    };

    heading.textContent = headings[tabId] || 'Product Overview';
}

function activateProductTab(tabId) {
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    const tabBtn = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
    const tabContent = document.getElementById(tabId);
    if (tabBtn && tabContent) {
        tabBtn.classList.add('active');
        tabContent.classList.add('active');
        activeProductTab = tabId;
        updateProductSectionHeading(tabId);
    }
}

function ensureActiveProductTabVisible() {
    const activeContent = document.querySelector('.tab-content.active');
    const activeButton = document.querySelector('.tab-link.active');
    if (activeContent && activeButton) {
        renderActiveProductTab();
        return;
    }

    const fallbackTab = document.getElementById(activeProductTab) ? activeProductTab : 'productsTab';
    activateProductTab(fallbackTab);
    renderActiveProductTab();
}

function handleNotificationDeepLink() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') !== 'notification') return;

    const tab = params.get('tab');
    const productId = params.get('productId');
    const discountCode = params.get('discountCode');

    if (tab === 'inventoryTab' || tab === 'inventory') {
        activateProductTab('inventoryTab');

        document.getElementById('invSearchInput').value = '';
        document.getElementById('stockFilter').value = '';

        if (productId) {
            const index = mockData.products.findIndex((p) => String(p.id) === String(productId));
            if (index >= 0) {
                currentInventoryPage = Math.floor(index / itemsPerPage) + 1;
                pendingInventoryHighlightId = String(productId);
            }
        }

        renderInventory();
        return;
    }

    if (tab === 'discountsTab' || tab === 'discounts') {
        activateProductTab('discountsTab');

        document.getElementById('discountSearch').value = '';
        document.getElementById('discountStatusFilter').value = '';

        if (discountCode) {
            const discountIndex = mockData.discounts.findIndex((d) => d.code === discountCode);
            if (discountIndex >= 0) {
                currentDiscountsPage = Math.floor(discountIndex / itemsPerPage) + 1;
                pendingDiscountHighlightCode = discountCode;
            }
        }

        renderDiscounts();
        return;
    }

    if (tab === 'productsTab' || tab === 'products') {
        activateProductTab('productsTab');
        renderProducts();
    }
}

// Pagination
function renderPagination(containerId, currentPage, totalPages, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (totalPages <= 1) return;

    const createBtn = (text, page, disabled = false) => {
        const btn = document.createElement('button');
        btn.className  = 'pagination-btn';
        btn.innerHTML  = text;
        btn.disabled   = disabled;
        if (!disabled) btn.onclick = () => changePage(page, type);
        if (page === currentPage) btn.classList.add('active');
        return btn;
    };

    container.appendChild(createBtn('<', currentPage - 1, currentPage === 1));

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage   = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1)
        startPage = Math.max(1, endPage - maxVisible + 1);

    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createBtn(i, i));
    }

    container.appendChild(createBtn('>', currentPage + 1, currentPage === totalPages));
}

function changePage(page, type) {
    if (type === 'products')  { currentProductsPage  = page; renderProducts();  }
    if (type === 'inventory') { currentInventoryPage = page; renderInventory(); }
    if (type === 'discounts') { currentDiscountsPage = page; renderDiscounts(); }
}

// ── DOMContentLoaded ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const tabs        = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Initialize tabs
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    // Set products tab as active initially
    const productsTab = document.querySelector('[data-tab="productsTab"]');
    const productsContent = document.getElementById('productsTab');
    if (productsTab && productsContent) {
        activateProductTab('productsTab');
        // Render products after a short delay to ensure CSS is loaded
        setTimeout(() => renderProducts(), 10);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            activateProductTab(tab.dataset.tab);
            renderActiveProductTab();
        });
    });

    // Keep the currently selected product tab visible even if other handlers alter classes.
    document.addEventListener('click', () => {
        ensureActiveProductTabVisible();
    });

    // Discount search + filter live update
    const discountSearchInput = document.getElementById('discountSearch');
    const discountStatusSelect = document.getElementById('discountStatusFilter');
    if (discountSearchInput) {
        discountSearchInput.addEventListener('input', () => {
            currentDiscountsPage = 1;
            renderDiscounts();
        });
    }
    if (discountStatusSelect) {
        discountStatusSelect.addEventListener('change', () => {
            currentDiscountsPage = 1;
            renderDiscounts();
        });
    }

    // Product search + filter live update
    const productSearchInput = document.getElementById('searchInput');
    const categoryFilterSelect = document.getElementById('categoryFilter');
    if (productSearchInput) {
        clearProductSearchIfAutofilledEmail();
        productSearchInput.addEventListener('input', () => {
            currentProductsPage = 1;
            renderProducts();
        });
    }
    if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener('change', () => {
            currentProductsPage = 1;
            renderProducts();
        });
    }

    // Inventory search + filter live update
    const inventorySearchInput = document.getElementById('invSearchInput');
    const stockFilterSelect = document.getElementById('stockFilter');
    const clearInventoryFiltersBtn = document.getElementById('clearInvFilters');
    if (inventorySearchInput) {
        inventorySearchInput.addEventListener('input', () => {
            currentInventoryPage = 1;
            renderInventory();
        });
    }
    if (stockFilterSelect) {
        stockFilterSelect.addEventListener('change', () => {
            currentInventoryPage = 1;
            renderInventory();
        });
    }
    if (clearInventoryFiltersBtn) {
        clearInventoryFiltersBtn.addEventListener('click', () => {
            if (inventorySearchInput) inventorySearchInput.value = '';
            if (stockFilterSelect) stockFilterSelect.value = '';
            currentInventoryPage = 1;
            renderInventory();
        });
    }

    // Auto-uppercase discount code inputs
    ['discountCode', 'editDiscountCode'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => { el.value = el.value.toUpperCase(); });
    });

    updateStats();
    updateInvStats();
    renderInventory();
    renderProducts();
    initNotifications();
    handleNotificationDeepLink();
    loadProducts();
    loadDiscounts();
});