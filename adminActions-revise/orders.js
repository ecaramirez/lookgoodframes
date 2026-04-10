// ==========================================
// ORDERS.JS – pulls data from orders.php (existing API)
// ==========================================

let ordersData = [];

function loadOrders() {
    fetch('../adminBack_end/orders.php')
        .then(res => res.json())
        .then(data => {
            ordersData = data;
            updateOrderStats();
            updatePaymentStats();
            renderOrders();
            renderPayments();
        })
        .catch(err => console.error('Orders API error:', err));
}

// ── Tabs ──────────────────────────────────
document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// ── Badge class ───────────────────────────
function getStatusBadgeClass(status) {
    status = (status || '').toLowerCase();
    if (['active','delivered','paid','in stock'].includes(status))          return 'badge-success';
    if (['processing','pending','low stock'].includes(status))              return 'badge-warning';
    if (['inactive','cancelled','failed','out of stock','banned'].includes(status)) return 'badge-danger';
    if (['shipped'].includes(status))                                        return 'badge-info';
    return 'badge-info';
}

// ── Stats ─────────────────────────────────
function updateOrderStats() {
    const orders = ordersData;
    document.getElementById('totalOrders').textContent       = orders.length;
    document.getElementById('processingOrders').textContent  = orders.filter(o => (o.status || '').toLowerCase() === 'processing').length;
    document.getElementById('shippedOrders').textContent     = orders.filter(o => (o.status || '').toLowerCase() === 'shipped').length;
    document.getElementById('cancelledOrders').textContent   = orders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length;
}

function updatePaymentStats() {
    const orders = ordersData;
    document.getElementById('totalPayments').textContent     = orders.length;
    document.getElementById('completedPayments').textContent = orders.filter(o => o.paymentStatus === 'Paid').length;
    document.getElementById('pendingPayments').textContent   = orders.filter(o => o.paymentStatus === 'Pending').length;
    const total = orders.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);
    document.getElementById('totalAmount').textContent       = `₱${total.toFixed(2)}`;
}

// ── Pagination ────────────────────────────
let currentOrdersPage   = 1;
let currentPaymentsPage = 1;
const itemsPerPage      = 10;

function renderPagination(container, currentPage, totalPages, onPageChange) {
    if (!container || totalPages === 0) return;
    container.innerHTML = '';

    const createBtn = (text, disabled, page) => {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn';
        btn.disabled  = disabled;
        btn.innerHTML = text;
        if (!disabled) btn.addEventListener('click', () => onPageChange(page));
        return btn;
    };

    container.appendChild(createBtn('<i class="fas fa-chevron-left"></i>', currentPage === 1, currentPage - 1));

    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max/2));
    let end   = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);

    if (start > 1) { container.appendChild(createBtn('1', false, 1)); if (start > 2) container.appendChild(document.createTextNode(' ... ')); }
    for (let i = start; i <= end; i++) {
        const btn = createBtn(i, i === currentPage, i);
        if (i === currentPage) btn.classList.add('active');
        container.appendChild(btn);
    }
    if (end < totalPages) { if (end < totalPages-1) container.appendChild(document.createTextNode(' ... ')); container.appendChild(createBtn(totalPages, false, totalPages)); }
    container.appendChild(createBtn('<i class="fas fa-chevron-right"></i>', currentPage === totalPages, currentPage + 1));
}

// ── Render orders ─────────────────────────
function renderOrders() {
    const tableBody = document.querySelector('#ordersTable tbody');
    if (!tableBody) return;

    const search = (document.getElementById('orderSearchInput')?.value || '').toLowerCase();
    const filtered = ordersData.filter(o =>
        o.order_id.toString().includes(search) ||
        (o.user_name || '').toLowerCase().includes(search)
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start      = (currentOrdersPage - 1) * itemsPerPage;
    const paged      = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = paged.map((o, i) => `
        <tr>
            <td><strong>${o.order_id}</strong></td>
            <td>${o.user_name}</td>
            <td>${Array.isArray(o.product_name) ? o.product_name.join(', ') : o.product_name}</td>
            <td>${o.payment_method}</td>
            <td>${o.created_at}</td>
            <td><strong>₱${parseFloat(o.total_amount).toFixed(2)}</strong></td>
            <td>
                <button class="btn btn-secondary btn-sm view-btn" data-index="${start + i}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>`).join('');

    renderPagination(
        document.getElementById('ordersPagination'),
        currentOrdersPage, totalPages,
        page => { currentOrdersPage = page; renderOrders(); }
    );
    attachOrderViewButtons(filtered);
}

// ── Render payments ───────────────────────
function renderPayments() {
    const tableBody = document.querySelector('#paymentsTable tbody');
    if (!tableBody) return;

    const search    = (document.getElementById('paymentSearchInput')?.value || '').toLowerCase();
    const payStat   = document.getElementById('payStatFilter')?.value || '';
    const payMethod = document.getElementById('payMethodFilter')?.value || '';

    const filtered = ordersData.filter(o =>
        ((o.user_name || '').toLowerCase().includes(search) || o.order_id.toString().includes(search)) &&
        (!payStat   || o.paymentStatus  === payStat) &&
        (!payMethod || o.payment_method === payMethod)
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start      = (currentPaymentsPage - 1) * itemsPerPage;
    const paged      = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = paged.map((o, i) => `
        <tr>
            <td><strong>${o.order_id}</strong></td>
            <td>${o.user_name}</td>
            <td><span class="badge ${getStatusBadgeClass(o.paymentStatus)}">${o.paymentStatus || 'N/A'}</span></td>
            <td>${o.payment_method}</td>
            <td><strong>₱${parseFloat(o.total_amount).toFixed(2)}</strong></td>
            <td>${o.created_at}</td>
            <td>
                <button class="btn btn-secondary btn-sm view-btn" data-index="${start + i}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>`).join('');

    renderPagination(
        document.getElementById('paymentsPagination'),
        currentPaymentsPage, totalPages,
        page => { currentPaymentsPage = page; renderPayments(); }
    );
    attachPaymentViewButtons(filtered);
}

// ── Modals ────────────────────────────────
const orderModal   = document.getElementById('orderModal');
const paymentModal = document.getElementById('paymentModal');
const closeOrderModal   = document.getElementById('closeOrderModal');
const closePaymentModal = document.getElementById('closePaymentModal');

function openOrderModal(order) {
    document.getElementById('modalOrderID').textContent        = order.order_id;
    document.getElementById('modalCustomerName').textContent   = order.user_name;
    document.getElementById('modalProductList').textContent    = Array.isArray(order.product_name) ? order.product_name.join(', ') : order.product_name;
    document.getElementById('modalOrderStatus').textContent    = order.status || 'N/A';
    document.getElementById('modalPaymentStatus').textContent  = order.paymentStatus || 'N/A';
    document.getElementById('modalTotalAmount').textContent    = parseFloat(order.total_amount).toFixed(2);
    document.getElementById('modalOrderDate').textContent      = order.created_at;
    document.getElementById('modalShippingMethod').textContent = order.payment_method;
    orderModal.classList.add('show');
}

function openPaymentModal(order) {
    document.getElementById('modalPaymentOrderID').textContent       = order.order_id;
    document.getElementById('modalPaymentCustomerName').textContent  = order.user_name;
    document.getElementById('modalPaymentStatusPayment').textContent = order.paymentStatus || 'N/A';
    document.getElementById('modalPaymentMethod').textContent        = order.payment_method;
    document.getElementById('modalPaymentAmount').textContent        = parseFloat(order.total_amount).toFixed(2);
    document.getElementById('modalPaymentDate').textContent          = order.created_at;
    paymentModal.classList.add('show');
}

function attachOrderViewButtons(filtered) {
    document.querySelectorAll('#ordersTable .view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            if (filtered[idx]) openOrderModal(filtered[idx]);
        });
    });
}

function attachPaymentViewButtons(filtered) {
    document.querySelectorAll('#paymentsTable .view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            if (filtered[idx]) openPaymentModal(filtered[idx]);
        });
    });
}

closeOrderModal?.addEventListener('click',   () => orderModal.classList.remove('show'));
closePaymentModal?.addEventListener('click', () => paymentModal.classList.remove('show'));
orderModal?.addEventListener('click',   e => { if (e.target === orderModal)   orderModal.classList.remove('show'); });
paymentModal?.addEventListener('click', e => { if (e.target === paymentModal) paymentModal.classList.remove('show'); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { orderModal?.classList.remove('show'); paymentModal?.classList.remove('show'); }
});

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    ['orderSearchInput', 'orderStatusFilter'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => { currentOrdersPage = 1; renderOrders(); });
    });
    ['paymentSearchInput', 'payStatFilter', 'payMethodFilter'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => { currentPaymentsPage = 1; renderPayments(); });
    });
});
