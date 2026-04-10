let currentProductsPage = 1;
let currentInventoryPage = 1;
const itemsPerPage = 10;

let selectedProductId = null;
let deleteTargetId = null;
let currentInventoryId = null;

const mockData = {
    products: []
};

function openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

document.querySelectorAll('.modal .close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        modal.style.display = 'none';
    });
});

function addProduct() {
    const formData = new FormData();

    formData.append('name', document.getElementById('addProductName').value);
    formData.append('description', document.getElementById('addDescription').value);
    formData.append('category', document.getElementById('addCategory').value);
    formData.append('price', document.getElementById('addPrice').value);
    formData.append('stock', document.getElementById('addStock').value);

    const imageFile = document.getElementById('addImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    fetch('../adminBack_end/add_products.php', { 
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert("Product Added!");
        closeModal("addProductModal");
        loadProducts();
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to add product.");
    });
}

function openEditModal(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editDescription').value = product.description || '';
    document.getElementById('editCategory').value = product.category;
    document.getElementById('editPrice').value = product.price;

    openModal('editProductModal');
}

function openDeleteModal(productId) {
    deleteTargetId = productId;
    openModal('deleteProductModal');
}

function confirmDelete() {
    if (!deleteTargetId) return;

    mockData.products = mockData.products.filter(p => p.id !== deleteTargetId);
    deleteTargetId = null;

    closeModal('deleteProductModal');
    renderProducts();
    updateStats();
    updateInvStats();
}

function openInventoryModal(productId) {
    const product = mockData.products.find(p => p.id == productId);
    if (!product) return;

    currentInventoryId = productId;

    document.getElementById('inventoryProductName').value = product.name;
    document.getElementById('inventoryStock').value = product.stock;
    document.getElementById('inventoryPrice').value = product.price;

    openModal('updateInventoryModal');
}

function updateInventory() {
    const stock = parseInt(document.getElementById('inventoryStock').value);
    const price = parseFloat(document.getElementById('inventoryPrice').value);

    if (isNaN(stock) || isNaN(price)) {
        alert("Invalid input");
        return;
    }

    const product = mockData.products.find(p => p.id == currentInventoryId);

    if (!product) {
        alert("Product not found");
        return;
    }

    product.stock = stock;
    product.price = price;

    // 🔥 REFRESH UI
    renderProducts();
    renderInventory();
    updateStats();
    updateInvStats();

    closeModal('updateInventoryModal');

    alert("Updated (frontend only)");
}

function loadProducts() {
    fetch('../adminBack_end/get_products.php')
        .then(res => res.json())
        .then(data => {
            mockData.products = data; 
            renderProducts();
            renderInventory();
            updateStats();
            updateInvStats();
        })
        .catch(err => console.error(err));
}

function updateProduct() {
    console.log("Selected ID:", selectedProductId);
    console.log("CLICKED");

    if (!selectedProductId) {
        alert("No product selected");
        return;
    }

    const nameEl = document.getElementById('inventoryProductName');
    const priceEl = document.getElementById('inventoryPrice');
    const stockEl = document.getElementById('inventoryStock');

    if (!nameEl || !priceEl || !stockEl) {
        console.error("Missing elements");
        alert("Form error");
        return;
    }

    const formData = new FormData();
    formData.append('id', selectedProductId);
    formData.append('name', nameEl.value);
    formData.append('price', priceEl.value);
    formData.append('stock', stockEl.value);

    console.log("Sending...");

    fetch('../adminBack_end/edit_products.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        console.log("Response:", data);

        if (data.trim() === "success") {
            alert("Product updated!");
            closeModal('updateInventoryModal');
            loadProducts();
        } else {
            alert("Update failed: " + data);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Request error");
    });
}

function getStockStatus(stock) {
    if (stock === 0) return { label: 'Out of Stock', class: 'badge-danger' };
    if (stock < 15) return { label: 'Low Stock', class: 'badge-warning' };
    return { label: 'In Stock', class: 'badge-success' };
}

function updateStats() {
    const products = mockData.products;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('inStock').textContent = products.filter(p => p.stock >= 15).length;
    document.getElementById('lowStock').textContent = products.filter(p => p.stock > 0 && p.stock < 15).length;
    document.getElementById('outOfStock').textContent = products.filter(p => p.stock === 0).length;
}

function updateInvStats() {
    const products = mockData.products;
    document.getElementById('totalItems').textContent = products.length;
    document.getElementById('lowStockInv').textContent = products.filter(p => p.stock > 0 && p.stock < 15).length;
    document.getElementById('outOfStockInv').textContent = products.filter(p => p.stock === 0).length;
    document.getElementById('overstocked').textContent = products.filter(p => p.stock > 100).length;
}

function renderProducts() {
    const tableBody = document.querySelector('#productsTable tbody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filtered = mockData.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search) || p.id.includes(search);
        const matchesCategory = !category || p.category === category;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentProductsPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    tableBody.innerHTML = paginatedData.map(p => `
        <tr>
            <td><img src="${p.image}" alt="${p.name}" class="avatar" style="border-radius: 8px;"></td>
            <td><strong>${p.id}</strong></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td><strong>₱${p.price}</strong></td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal('${p.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color: var(--danger);" onclick="openDeleteModal('${p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    renderPagination('productsPagination', currentProductsPage, totalPages);
}

function renderInventory() {
    const tableBody = document.querySelector('#inventoryTable tbody');
    const search = document.getElementById('invSearchInput').value.toLowerCase();
    const stockFilter = document.getElementById('stockFilter').value;

    const filtered = mockData.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const statusInfo = getStockStatus(p.stock);
        const matchesStock = !stockFilter || statusInfo.label === stockFilter;
        return matchesSearch && matchesStock;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentInventoryPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    tableBody.innerHTML = paginatedData.map(p => {
        const statusInfo = getStockStatus(p.stock);
        return `
            <tr>
                <td><strong>${p.id}</strong></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td><strong>${p.stock}</strong></td>
                <td><span class="badge ${statusInfo.class}">${statusInfo.label}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openInventoryModal('${p.id}')">
                        <i class="fas fa-edit"></i> Update Stock
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination('inventoryPagination', currentInventoryPage, totalPages);
}

//Pagination Functions
function renderPagination(containerId, currentPage, totalPages) {
    const container = document.getElementById(containerId);
    if (!container || totalPages === 0) return;

    let paginationHTML = '';

    paginationHTML += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1}, '${containerId}')">Prev</button>`;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) startPage = Math.max(1, endPage - maxVisiblePages + 1);

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1, '${containerId}')">1</button>`;
        if (startPage > 2) paginationHTML += `<span style="padding: 0 8px; color: var(--text-muted);">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i}, '${containerId}')">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationHTML += `<span style="padding: 0 8px; color: var(--text-muted);">...</span>`;
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages}, '${containerId}')">${totalPages}</button>`;
    }

    paginationHTML += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1}, '${containerId}')">Next</button>`;

    container.innerHTML = paginationHTML;
}


function changePage(page, containerId) {
    if (containerId === 'productsPagination') {
        currentProductsPage = page;
        renderProducts();
    } else if (containerId === 'inventoryPagination') {
        currentInventoryPage = page;
        renderInventory();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');

            if (tab.dataset.tab === "productsTab") renderProducts();
            if (tab.dataset.tab === "inventoryTab") renderInventory();
        });
    });

    updateStats();
    updateInvStats();
    renderProducts();
    renderInventory();
    loadProducts();
});
