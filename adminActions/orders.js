// Data store (populated from backend)
const mockData = { orders: [] };

// Load orders from backend
function loadOrders() {
    fetch('../adminBack_end/orders.php')
        .then(res => res.json())
        .then(data => {
            mockData.orders = data;
            updateOrderStats();
            updatePaymentStats();
            renderOrders();
            renderPayments();
        })
        .catch(err => console.error('Failed to load orders:', err));
}

// Status workflow
const statusWorkflow = {
    'Pending':    { label: 'Process',   icon: 'fa-arrows-rotate', next: 'Processing', btnClass: 'action-process'   },
    'Processing': { label: 'Ship',      icon: 'fa-truck',        next: 'Shipped',    btnClass: 'action-ship'      },
    'Shipped':    { label: 'Delivered', icon: 'fa-check-circle', next: 'Delivered',  btnClass: 'action-delivered' },
    // delivered and cancelled are terminal states
};

function getActionButton(orderId, status) {
    const step = statusWorkflow[status];
    if (!step) return ''; // no action
    return `
        <button class="btn-action ${step.btnClass} action-btn"
                data-id="${orderId}"
                data-next="${step.next}"
                data-confirm-class="confirm-${step.next.toLowerCase()}"
                title="Mark as ${step.next}">
            <i class="fas ${step.icon}"></i> ${step.label}
        </button>
    `;
}


// Tabs
const tabs = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});


// Status badge helper
function getStatusBadgeClass(status) {
    const s = status.toLowerCase();
    if (['active', 'delivered', 'paid', 'in stock'].includes(s))              return 'badge-success';
    if (['processing', 'pending', 'low stock'].includes(s))                   return 'badge-warning';
    if (['inactive', 'cancelled', 'failed', 'out of stock', 'banned'].includes(s)) return 'badge-danger';
    if (['shipped'].includes(s))                                               return 'badge-info';
    return 'badge-info';
}


// Stats
function updateOrderStats() {
    const o = mockData.orders;
    document.getElementById('totalOrders').textContent     = o.length;
    document.getElementById('processingOrders').textContent = o.filter(x => x.status === 'Processing').length;
    document.getElementById('shippedOrders').textContent   = o.filter(x => x.status === 'Shipped').length;
    document.getElementById('cancelledOrders').textContent = o.filter(x => x.status === 'Cancelled').length;
}

function updatePaymentStats() {
    const o = mockData.orders;
    document.getElementById('totalPayments').textContent     = o.length;
    document.getElementById('completedPayments').textContent = o.filter(x => x.paymentStatus === 'Paid').length;
    document.getElementById('pendingPayments').textContent   = o.filter(x => x.paymentStatus === 'Pending').length;
    const total = o.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
    document.getElementById('totalAmount').textContent = `₱${total.toFixed(2)}`;
}


// Pagination
let currentOrdersPage  = 1;
let currentPaymentsPage = 1;
const itemsPerPage = 4;

function renderPagination(container, currentPage, totalPages, onPageChange) {
    container.innerHTML = '';
    if (totalPages <= 1) return;

    const createBtn = (text, page, disabled = false) => {
        const btn = document.createElement('button');
        btn.className   = 'pagination-btn';
        btn.innerHTML   = text;
        btn.disabled    = disabled;
        if (!disabled) btn.onclick = () => onPageChange(page);
        if (page === currentPage) btn.classList.add('active');
        return btn;
    };

    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end   = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    container.appendChild(createBtn('<', currentPage - 1, currentPage === 1));
    if (start > 1) container.appendChild(createBtn(1, 1));
    if (start > 2) container.appendChild(document.createTextNode(' … '));
    for (let i = start; i <= end; i++) container.appendChild(createBtn(i, i));
    if (end < totalPages - 1) container.appendChild(document.createTextNode(' … '));
    if (end < totalPages) container.appendChild(createBtn(totalPages, totalPages));
    container.appendChild(createBtn('>', currentPage + 1, currentPage === totalPages));
}


// Render orders table
function renderOrders() {
    const tableBody = document.querySelector('#ordersTable tbody');
    if (!tableBody) return;

    const search      = (document.getElementById('orderSearchInput')?.value || '').toLowerCase();
    const orderStatus = document.getElementById('orderStatusFilter')?.value;

    const filtered = mockData.orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(search) || o.customerName.toLowerCase().includes(search);
        const matchesOrder  = !orderStatus || o.status === orderStatus;
        return matchesSearch && matchesOrder;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentOrdersPage > totalPages) currentOrdersPage = totalPages;

    const start     = (currentOrdersPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = paginated.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.product}</td>
            <td><span class="badge ${getStatusBadgeClass(o.status)}">${o.status}</span></td>
            <td>${o.date}</td>
            <td><strong>₱${o.total.toFixed(2)}</strong></td>
            <td class="actions-cell">
                <button class="btn btn-secondary btn-sm view-order-btn" data-id="${o.id}" title="View details">
                    <i class="fas fa-eye"></i>
                </button>
                ${getActionButton(o.id, o.status)}
            </td>
        </tr>
    `).join('');

    renderPagination(
        document.getElementById('ordersPagination'),
        currentOrdersPage, totalPages,
        page => { currentOrdersPage = page; renderOrders(); }
    );

    attachOrderButtons();
}


// Render payments table
function renderPayments() {
    const tableBody = document.querySelector('#paymentsTable tbody');
    if (!tableBody) return;

    const search    = (document.getElementById('paymentSearchInput')?.value || '').toLowerCase();
    const payStat   = document.getElementById('payStatFilter')?.value;

    const filtered = mockData.orders.filter(o => {
        const matchesSearch  = o.id.toLowerCase().includes(search) || o.customerName.toLowerCase().includes(search);
        const matchesStat    = !payStat   || o.paymentStatus === payStat;
        return matchesSearch && matchesStat;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentPaymentsPage > totalPages) currentPaymentsPage = totalPages;

    const start     = (currentPaymentsPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = paginated.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customerName}</td>
            <td><span class="badge ${getStatusBadgeClass(o.paymentStatus)}">${o.paymentStatus}</span></td>
            <td>${o.paymentMethod}</td>
            <td><strong>₱${o.total.toFixed(2)}</strong></td>
            <td>${o.date}</td>
            <td>
                <button class="btn btn-secondary btn-sm view-payment-btn" data-id="${o.id}" title="View details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');

    renderPagination(
        document.getElementById('paymentsPagination'),
        currentPaymentsPage, totalPages,
        page => { currentPaymentsPage = page; renderPayments(); }
    );

    attachPaymentButtons();
}


// Attach button listeners
function attachOrderButtons() {
    // view order
    document.querySelectorAll('#ordersTable .view-order-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const order = mockData.orders.find(o => o.id === btn.dataset.id);
            if (order) openOrderModal(order);
        });
    });

    // action button (process / ship / delivered)
    document.querySelectorAll('#ordersTable .action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const order = mockData.orders.find(o => o.id === btn.dataset.id);
            if (order) openConfirmModal(order, btn.dataset.next, btn.dataset.confirmClass);
        });
    });
}

function attachPaymentButtons() {
    document.querySelectorAll('#paymentsTable .view-payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const order = mockData.orders.find(o => o.id === btn.dataset.id);
            if (order) openPaymentModal(order);
        });
    });
}


// Confirm status modal
const confirmModal       = document.getElementById('confirmStatusModal');
const confirmModalTitle  = document.getElementById('confirmModalTitle');
const confirmModalBody   = document.getElementById('confirmModalBody');
const confirmModalBtn    = document.getElementById('confirmStatusBtn');

document.getElementById('closeConfirmModal').addEventListener('click',  () => confirmModal.classList.remove('show'));
document.getElementById('cancelConfirmModal').addEventListener('click', () => confirmModal.classList.remove('show'));
confirmModal.addEventListener('click', e => { if (e.target === confirmModal) confirmModal.classList.remove('show'); });

const confirmMeta = {
    'Processing': { label: 'Process Order',  icon: 'fa-arrows-rotate', btnClass: 'confirm-processing' },
    'Shipped':    { label: 'Ship Order',      icon: 'fa-truck',        btnClass: 'confirm-shipped'    },
    'Delivered':  { label: 'Mark Delivered',  icon: 'fa-check-circle', btnClass: 'confirm-delivered'  },
};

function openConfirmModal(order, nextStatus) {
    const meta = confirmMeta[nextStatus] || { label: `Mark as ${nextStatus}`, icon: 'fa-arrow-right', btnClass: '' };

    confirmModalTitle.textContent = meta.label;
    confirmModalBody.innerHTML = `
        Are you sure you want to mark <strong>${order.id}</strong>
        (<em>${order.customerName}</em>) as <strong>${nextStatus}</strong>?
    `;

    // Apply correct colour class and icon — do this BEFORE showing
    confirmModalBtn.className = `btn-confirm ${meta.btnClass}`;
    confirmModalBtn.innerHTML = `<i class="fas ${meta.icon}"></i> Confirm`;

    // Replace onclick each time to avoid stacking listeners
    confirmModalBtn.onclick = () => {
        const prevStatus = order.status;
        order.status = nextStatus;
        confirmModal.classList.remove('show');
        updateOrderStats();
        updatePaymentStats();
        renderOrders();
        renderPayments();
        showToast(`${order.id} marked as ${nextStatus}`);

        // Persist to backend
        fetch('../adminBack_end/orders.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: order.orderId, status: nextStatus })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                order.status = prevStatus; // rollback
                updateOrderStats(); updatePaymentStats(); renderOrders(); renderPayments();
                alert('Status update failed on server.');
            }
        })
        .catch(() => {
            order.status = prevStatus; // rollback on network error
            updateOrderStats(); updatePaymentStats(); renderOrders(); renderPayments();
            alert('Network error: status not saved.');
        });
    };

    confirmModal.classList.add('show');
}


// Toast notification
function showToast(message) {
    const toast    = document.getElementById('statusToast');
    const toastMsg = document.getElementById('toastMessage');
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}


// Order details modal
const orderModal = document.getElementById('orderModal');

document.getElementById('closeOrderModal').addEventListener('click', () => orderModal.classList.remove('show'));
orderModal.addEventListener('click', e => { if (e.target === orderModal) orderModal.classList.remove('show'); });

function openOrderModal(order) {
    // header banner
    document.getElementById('modalHeaderCustomer').textContent     = order.customerName;
    document.getElementById('modalHeaderOrderID').textContent      = order.id;

    // status badge
    const statusEl = document.getElementById('modalOrderStatus');
    statusEl.textContent = order.status;
    statusEl.className   = `om-status-badge ${order.status.toLowerCase()}`;

    // summary
    document.getElementById('modalSummaryAmount').textContent      = `₱${order.total.toFixed(2)}`;
    document.getElementById('modalSummaryDate').textContent        = order.date;
    document.getElementById('modalSummaryShipping').textContent    = order.shippingMethod;

    // fields
    document.getElementById('modalOrderID').textContent            = order.id;
    document.getElementById('modalCustomerName').textContent       = order.customerName;
    document.getElementById('modalProductList').textContent        = order.product;
    document.getElementById('modalPaymentMethodOrder').textContent = order.paymentMethod;
    document.getElementById('modalShippingMethod').textContent     = order.shippingMethod;
    document.getElementById('modalTotalAmount').textContent        = `₱${order.total.toFixed(2)}`;

    orderModal.classList.add('show');
}


// Payment details modal
const paymentModal = document.getElementById('paymentModal');

document.getElementById('closePaymentModal').addEventListener('click', () => paymentModal.classList.remove('show'));
paymentModal.addEventListener('click', e => { if (e.target === paymentModal) paymentModal.classList.remove('show'); });

function openPaymentModal(order) {
    document.getElementById('modalPaymentCustomerName').textContent  = order.customerName;
    document.getElementById('modalPaymentOrderID').textContent       = order.id;
    document.getElementById('modalPaymentOrderIDField').textContent  = order.id;
    document.getElementById('modalPaymentAmount').textContent        = `₱${order.total.toFixed(2)}`;
    document.getElementById('modalPaymentMethod').textContent        = order.paymentMethod;
    document.getElementById('modalPaymentDate').textContent          = order.date;

    const statusEl = document.getElementById('modalPaymentStatusPayment');
    statusEl.textContent = order.paymentStatus;
    statusEl.className   = `pm-pay-status ${order.paymentStatus.toLowerCase()}`;

    paymentModal.classList.add('show');
}


// Global escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        orderModal.classList.remove('show');
        paymentModal.classList.remove('show');
        document.getElementById('confirmStatusModal').classList.remove('show');
    }
});


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    ['orderSearchInput', 'orderStatusFilter'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => { currentOrdersPage = 1; renderOrders(); });
    });

    ['paymentSearchInput', 'payStatFilter'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => { currentPaymentsPage = 1; renderPayments(); });
    });
});