// ==========================================
// PRODUCTS.JS – pulls data from productsAPI.php
// ==========================================

let currentProductsPage  = 1;
let currentInventoryPage = 1;
const itemsPerPage       = 10;
let productsData         = [];
let deleteTargetId       = null;
let currentInventoryId   = null;

// ── Modals ────────────────────────────────
function openModal(id)  { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

document.querySelectorAll('.modal .close-btn').forEach(btn => {
    btn.addEventListener('click', e => e.target.closest('.modal').style.display = 'none');
});

// ── Load ──────────────────────────────────
function loadProducts() {
    fetch('../adminBack_end/productsAPI.php')
        .then(res => res.json())
        .then(data => {
            productsData = data;
            updateStats();
            updateInvStats();
            renderProducts();
            renderInventory();
        })
        .catch(err => console.error('Products API error:', err));
}

// ── Add product – handled by existing adminBack_end/add_products.php form ──
function addProduct() {
    const form = document.getElementById('addProductForm');
    if (form) { form.submit(); } else { closeModal('addProductModal'); }
}

// ── Edit product – redirect to edit page ──
function openEditModal(productId) {
    const product = productsData.find(p => p.id == productId);
    if (!product) return;
    document.getElementById('editProductId').value    = product.id;
    document.getElementById('editProductName').value  = product.name;
    document.getElementById('editDescription').value  = product.description || '';
    document.getElementById('editCategory').value     = product.category;
    document.getElementById('editPrice').value        = product.price;
    openModal('editProductModal');
}

function updateProduct() {
    const id   = document.getElementById('editProductId').value;
    window.location.href = `../adminBack_end/edit_products.php?id=${id}`;
}

// ── Delete ────────────────────────────────
function openDeleteModal(productId) {
    deleteTargetId = productId;
    openModal('deleteProductModal');
}

function confirmDelete() {
    if (!deleteTargetId) return;
    window.location.href = `../adminBack_end/delete_products.php?id=${deleteTargetId}`;
}

// ── Inventory update ──────────────────────
function openInventoryModal(productId) {
    const product = productsData.find(p => p.id == productId);
    if (!product) return;
    currentInventoryId = productId;
    document.getElementById('inventoryProductName').value = product.name;
    document.getElementById('inventoryStock').value       = product.stock;
    document.getElementById('inventoryPrice').value       = product.price;
    document.querySelector('#updateInventoryHeader span').textContent = `Update: ${product.name}`;
    openModal('updateInventoryModal');
}

function updateInventory() {
    const stock = parseInt(document.getElementById('inventoryStock').value);
    const price = parseFloat(document.getElementById('inventoryPrice').value);
    if (isNaN(stock) || isNaN(price)) { alert('Please enter valid stock and price'); return; }

    fetch('../adminBack_end/productsAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentInventoryId, stock, price }),
    })
        .then(res => res.json())
        .then(() => { closeModal('updateInventoryModal'); loadProducts(); alert('Inventory updated!'); })
        .catch(err => console.error(err));
}

// ── Stock status ──────────────────────────
function getStockStatus(stock) {
    if (stock === 0)  return { label: 'Out of Stock', class: 'badge-danger' };
    if (stock < 15)   return { label: 'Low Stock',    class: 'badge-warning' };
    return              { label: 'In Stock',      class: 'badge-success' };
}

// ── Stats ─────────────────────────────────
function updateStats() {
    const p = productsData;
    document.getElementById('totalProducts').textContent = p.length;
    document.getElementById('inStock').textContent       = p.filter(x => x.stock >= 15).length;
    document.getElementById('lowStock').textContent      = p.filter(x => x.stock > 0 && x.stock < 15).length;
    document.getElementById('outOfStock').textContent    = p.filter(x => x.stock === 0).length;
}

function updateInvStats() {
    const p = productsData;
    document.getElementById('totalItems').textContent     = p.length;
    document.getElementById('lowStockInv').textContent    = p.filter(x => x.stock > 0 && x.stock < 15).length;
    document.getElementById('outOfStockInv').textContent  = p.filter(x => x.stock === 0).length;
    document.getElementById('overstocked').textContent    = p.filter(x => x.stock > 100).length;
}

// ── Render products table ─────────────────
function renderProducts() {
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;

    const search   = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filtered = productsData.filter(p => {
        const matchesSearch   = p.name.toLowerCase().includes(search) || p.id.toString().includes(search);
        const matchesCategory = !category || p.category === category;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start      = (currentProductsPage - 1) * itemsPerPage;
    const paged      = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = paged.map(p => `
        <tr>
            <td><img src="${p.image || ''}" alt="${p.name}" class="avatar" style="border-radius:8px;" onerror="this.style.display='none'"></td>
            <td><strong>${p.id}</strong></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td><strong>₱${Number(p.price).toLocaleString()}</strong></td>
            <td>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal('${p.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="openDeleteModal('${p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');

    renderPagination('productsPagination', currentProductsPage, totalPages);
}

// ── Render inventory table ────────────────
function renderInventory() {
    const tableBody = document.querySelector('#inventoryTable tbody');
    if (!tableBody) return;

    const search      = document.getElementById('invSearchInput').value.toLowerCase();
    const stockFilter = document.getElementById('stockFilter').value;

    const filtered = productsData.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const statusInfo    = getStockStatus(p.stock);
        const matchesStock  = !stockFilter || statusInfo.label === stockFilter;
        return matchesSearch && matchesStock;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start      = (currentInventoryPage - 1) * itemsPerPage;
    const paged      = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = paged.map(p => {
        const s = getStockStatus(p.stock);
        return `
            <tr>
                <td><strong>${p.id}</strong></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td><strong>${p.stock}</strong></td>
                <td><span class="badge ${s.class}">${s.label}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openInventoryModal('${p.id}')">
                        <i class="fas fa-edit"></i> Update Stock
                    </button>
                </td>
            </tr>`;
    }).join('');

    renderPagination('inventoryPagination', currentInventoryPage, totalPages);
}

// ── Pagination ────────────────────────────
function renderPagination(containerId, currentPage, totalPages) {
    const container = document.getElementById(containerId);
    if (!container || totalPages === 0) return;
    let html = `<button class="pagination-btn" ${currentPage===1?'disabled':''} onclick="changePage(${currentPage-1},'${containerId}')">Prev</button>`;
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max/2));
    let end   = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    if (start > 1) { html += `<button class="pagination-btn" onclick="changePage(1,'${containerId}')">1</button>`; if (start > 2) html += `<span style="padding:0 8px;">...</span>`; }
    for (let i = start; i <= end; i++) html += `<button class="pagination-btn ${i===currentPage?'active':''}" onclick="changePage(${i},'${containerId}')">${i}</button>`;
    if (end < totalPages) { if (end < totalPages-1) html += `<span style="padding:0 8px;">...</span>`; html += `<button class="pagination-btn" onclick="changePage(${totalPages},'${containerId}')">${totalPages}</button>`; }
    html += `<button class="pagination-btn" ${currentPage===totalPages?'disabled':''} onclick="changePage(${currentPage+1},'${containerId}')">Next</button>`;
    container.innerHTML = html;
}

function changePage(page, containerId) {
    if (containerId === 'productsPagination')  { currentProductsPage  = page; renderProducts(); }
    if (containerId === 'inventoryPagination') { currentInventoryPage = page; renderInventory(); }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
            if (tab.dataset.tab === 'productsTab')  renderProducts();
            if (tab.dataset.tab === 'inventoryTab') renderInventory();
        });
    });

    document.getElementById('searchInput')?.addEventListener('input',   () => { currentProductsPage  = 1; renderProducts(); });
    document.getElementById('categoryFilter')?.addEventListener('change',() => { currentProductsPage  = 1; renderProducts(); });
    document.getElementById('invSearchInput')?.addEventListener('input', () => { currentInventoryPage = 1; renderInventory(); });
    document.getElementById('stockFilter')?.addEventListener('change',   () => { currentInventoryPage = 1; renderInventory(); });
});
