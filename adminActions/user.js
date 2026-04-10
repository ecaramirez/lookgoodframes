let currentUsersPage = 1;
const itemsPerPage = 10;
let userToDeleteIndex = null;
let userToBanIndex = null;

const mockData = {
    users: []
};


async function fetchUsers() {
    try {
        const res = await fetch('../adminBack_end/usersAPI.php'); 
        if (!res.ok) throw new Error('Failed to fetch users');
        mockData.users = await res.json();
        renderUsers();
        updateUserStats();
    } catch (err) {
        console.error('Error fetching users:', err);
    }
}

async function apiDeleteUser(id) {
    const res = await fetch(`../adminBack_end/usersAPI.php?id=${id}`, { method: 'DELETE' });
    return res.json();
}

async function apiBanUser(id, status) {
    const res = await fetch('../adminBack_end/usersAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
    });
    return res.json();
}

// ── MODALS ───────────────────────────────────────────────────────────────────

function openDeleteUserModal(index) {
    userToDeleteIndex = index;
    const user = mockData.users[index];
    const nameElement = document.getElementById('deleteUserName');
    if (nameElement) nameElement.textContent = user.name;
    document.getElementById('deleteUserModal').classList.add('show');
}

function openBanUserModal(index) {
    userToBanIndex = index;
    const user = mockData.users[index];
    const nameElement = document.getElementById('banUserName');
    if (nameElement) nameElement.textContent = user.name;
    document.getElementById('banUserModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    if (modalId === 'deleteUserModal') userToDeleteIndex = null;
    if (modalId === 'banUserModal') userToBanIndex = null;
}

async function confirmBan() {
    if (userToBanIndex !== null) {
        const user = mockData.users[userToBanIndex];
        try {
            await apiBanUser(user.id, 'Banned');
            user.status = 'Banned'; // update local copy
            closeModal('banUserModal');
            renderUsers();
            updateUserStats();
        } catch (err) {
            console.error('Error banning user:', err);
        }
    }
}

async function confirmDelete() {
    if (userToDeleteIndex !== null) {
        const user = mockData.users[userToDeleteIndex];
        try {
            await apiDeleteUser(user.id);
            mockData.users.splice(userToDeleteIndex, 1); // remove from local copy
            closeModal('deleteUserModal');
            renderUsers();
            updateUserStats();
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    }
}

// ── RENDER ───────────────────────────────────────────────────────────────────

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Active':   return 'badge-success';
        case 'Inactive': return 'badge-warning';
        case 'Banned':   return 'badge-danger';
        default:         return 'badge-secondary';
    }
}

function updateUserStats() {
    const users = mockData.users;
    document.getElementById('totalCustomers').textContent = users.length;
    document.getElementById('suspendedUsers').textContent =
        users.filter(u => u.status === 'Banned' || u.status === 'Inactive').length;
}

function renderUsers() {
    const tableBody = document.querySelector('#usersTable tbody');
    if (!tableBody) return;

    const search = document.getElementById('userSearchInput').value.toLowerCase();
    const status = document.getElementById('userStatusFilter').value;

    const filtered = mockData.users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search) ||
                            u.email.toLowerCase().includes(search);
        const matchesStatus = !status || u.status === status;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentUsersPage > totalPages) currentUsersPage = totalPages || 1;

    const startIndex = (currentUsersPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    tableBody.innerHTML = paginatedData.map((u, index) => {
        const userIndex = startIndex + index;
        return `
            <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${u.number}</td>
                <td><span class="badge ${getStatusBadgeClass(u.status)}">${u.status}</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${u.status !== 'Banned' ? `
                        <button class="btn btn-danger btn-sm" onclick="openBanUserModal(${userIndex})">
                            <i class="fas fa-ban"></i>
                        </button>` : ''}
                        <button class="btn btn-secondary btn-sm" style="color: var(--danger);"
                            onclick="openDeleteUserModal(${userIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination('usersPagination', currentUsersPage, totalPages);
}

// ── PAGINATION ───────────────────────────────────────────────────────────────

function renderPagination(containerId, currentPage, totalPages) {
    const container = document.getElementById(containerId);
    if (!container || totalPages === 0) return;

    let html = `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''}
        onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1)
        startPage = Math.max(1, endPage - maxVisiblePages + 1);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}"
            onclick="changePage(${i})">${i}</button>`;
    }

    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''}
        onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = html;
}

function changePage(page) {
    currentUsersPage = page;
    renderUsers();
}

// ── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers(); // fetch from PHP API on load

    document.getElementById('userSearchInput').addEventListener('input', () => {
        currentUsersPage = 1;
        renderUsers();
    });
    document.getElementById('userStatusFilter').addEventListener('change', () => {
        currentUsersPage = 1;
        renderUsers();
    });
    document.getElementById('clearUserFilters')?.addEventListener('click', () => {
        document.getElementById('userSearchInput').value = '';
        document.getElementById('userStatusFilter').value = '';
        currentUsersPage = 1;
        renderUsers();
    });

    initNotifications();
});