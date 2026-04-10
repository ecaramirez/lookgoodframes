// ==========================================
// USER.JS – pulls data from usersAPI.php
// ==========================================

let currentUsersPage = 1;
const itemsPerPage = 10;
let usersData = [];
let userToDeleteId = null;
let userToBanId = null;

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Active':   return 'badge-success';
        case 'Inactive': return 'badge-warning';
        case 'Banned':   return 'badge-danger';
        default:         return 'badge-secondary';
    }
}

function updateUserStats() {
    document.getElementById('totalCustomers').textContent   = usersData.length;
    document.getElementById('suspendedUsers').textContent   =
        usersData.filter(u => u.status === 'Banned' || u.status === 'Inactive').length;
}

// ── Load from API ──────────────────────────
function loadUsers() {
    fetch('../adminBack_end/usersAPI.php')
        .then(res => res.json())
        .then(data => {
            usersData = data;
            updateUserStats();
            renderUsers();
        })
        .catch(err => console.error('Users API error:', err));
}

// ── Delete ────────────────────────────────
function openDeleteUserModal(id) {
    userToDeleteId = id;
    const user = usersData.find(u => u.id == id);
    const nameEl = document.getElementById('deleteUserName');
    if (nameEl && user) nameEl.textContent = user.name;
    document.getElementById('deleteUserModal').classList.add('show');
}

function confirmDelete() {
    if (!userToDeleteId) return;
    fetch(`../adminBack_end/usersAPI.php?id=${userToDeleteId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => { userToDeleteId = null; closeModal('deleteUserModal'); loadUsers(); })
        .catch(err => console.error(err));
}

// ── Ban ───────────────────────────────────
function openBanUserModal(id) {
    userToBanId = id;
    const user = usersData.find(u => u.id == id);
    const nameEl = document.getElementById('banUserName');
    if (nameEl && user) nameEl.textContent = user.name;
    document.getElementById('banUserModal').classList.add('show');
}

function confirmBan() {
    if (!userToBanId) return;
    fetch('../adminBack_end/usersAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userToBanId, status: 'Banned' }),
    })
        .then(res => res.json())
        .then(() => { userToBanId = null; closeModal('banUserModal'); loadUsers(); })
        .catch(err => console.error(err));
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    if (modalId === 'deleteUserModal') userToDeleteId = null;
    if (modalId === 'banUserModal')    userToBanId    = null;
}

// ── Render ────────────────────────────────
function renderUsers() {
    const tableBody = document.querySelector('#usersTable tbody');
    if (!tableBody) return;

    const search = document.getElementById('userSearchInput').value.toLowerCase();
    const status = document.getElementById('userStatusFilter').value;

    const filtered = usersData.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
        const matchesStatus = !status || u.status === status;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentUsersPage > totalPages) currentUsersPage = totalPages || 1;

    const start = (currentUsersPage - 1) * itemsPerPage;
    const paged = filtered.slice(start, start + itemsPerPage);

    tableBody.innerHTML = paged.map(u => `
        <tr>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td>${u.number ?? 'N/A'}</td>
            <td><span class="badge ${getStatusBadgeClass(u.status)}">${u.status}</span></td>
            <td>
                <div style="display:flex;gap:8px;">
                    ${u.status !== 'Banned' ? `
                    <button class="btn btn-danger btn-sm" onclick="openBanUserModal(${u.id})">
                        <i class="fas fa-ban"></i>
                    </button>` : ''}
                    <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="openDeleteUserModal(${u.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');

    renderPagination('usersPagination', currentUsersPage, totalPages);
}

function renderPagination(containerId, currentPage, totalPages) {
    const container = document.getElementById(containerId);
    if (!container || totalPages === 0) return;
    let html = `<button class="pagination-btn" ${currentPage===1?'disabled':''} onclick="changePage(${currentPage-1})"><i class="fas fa-chevron-left"></i></button>`;
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max/2));
    let end   = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) {
        html += `<button class="pagination-btn ${i===currentPage?'active':''}" onclick="changePage(${i})">${i}</button>`;
    }
    html += `<button class="pagination-btn" ${currentPage===totalPages?'disabled':''} onclick="changePage(${currentPage+1})"><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = html;
}

function changePage(page) {
    currentUsersPage = page;
    renderUsers();
}

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    document.getElementById('userSearchInput').addEventListener('input', () => { currentUsersPage = 1; renderUsers(); });
    document.getElementById('userStatusFilter').addEventListener('change', () => { currentUsersPage = 1; renderUsers(); });
    document.getElementById('clearUserFilters')?.addEventListener('click', () => {
        document.getElementById('userSearchInput').value = '';
        document.getElementById('userStatusFilter').value = '';
        currentUsersPage = 1;
        renderUsers();
    });
});
