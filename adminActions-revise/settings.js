// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.remove('error');

    if (type === 'error') {
        toast.classList.add('error');
        toast.querySelector('i').className = 'fas fa-exclamation-circle';
    } else {
        toast.querySelector('i').className = 'fas fa-check-circle';
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Tab switching
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length && tabContents.length) {
        tabButtons[0].classList.add('active');
        tabContents[0].classList.add('active');
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// General form
function initGeneralForm() {
    const form = document.getElementById('generalForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const storeName    = document.getElementById('storeName').value;
        const storeUrl     = document.getElementById('storeUrl').value;
        const contactEmail = document.getElementById('contactEmail').value;
        const phoneNumber  = document.getElementById('phoneNumber').value;

        if (!storeName || !storeUrl || !contactEmail || !phoneNumber) {
            showToast('Please fill out all required fields', 'error');
            return;
        }
        showToast('Settings saved successfully!');
    });
}

// Admin management
let adminCounter = 4;

function initAdminManagement() {
    const addAdminBtn  = document.getElementById('addAdminBtn');
    const addAdminModal  = document.getElementById('addAdminModal');
    const editAdminModal = document.getElementById('editAdminModal');
    const closeAddBtn  = document.getElementById('closeAddAdminModal');
    const closeEditBtn = document.getElementById('closeEditAdminModal');
    const cancelAddBtn  = document.getElementById('cancelAddAdmin');
    const cancelEditBtn = document.getElementById('cancelEditAdmin');
    const addAdminForm  = document.getElementById('addAdminForm');
    const editAdminForm = document.getElementById('editAdminForm');

    // Open Add Modal
    addAdminBtn.addEventListener('click', () => addAdminModal.classList.add('show'));

    // Close Add Modal
    [closeAddBtn, cancelAddBtn].forEach(btn => btn.addEventListener('click', () => {
        addAdminModal.classList.remove('show');
        addAdminForm.reset();
    }));

    // Close Edit Modal
    [closeEditBtn, cancelEditBtn].forEach(btn => btn.addEventListener('click', () => {
        editAdminModal.classList.remove('show');
    }));

    // Click outside to close
    [addAdminModal, editAdminModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    });

    // Add Admin submit
    addAdminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name  = document.getElementById('addAdminName').value;
        const email = document.getElementById('addAdminEmail').value;
        const role  = document.getElementById('addAdminRole').value;

        if (!name || !email) {
            showToast('Please fill out all fields', 'error');
            return;
        }

        const tableBody = document.getElementById('adminTableBody');
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', adminCounter++);

        const badgeClass = role === 'Main Admin' ? 'badge-info' : 'badge-success';
        newRow.innerHTML = `
            <td><strong>${name}</strong></td>
            <td>${email}</td>
            <td><span class="badge ${badgeClass}">${role}</span></td>
            <td>Just now</td>
            <td><button class="btn btn-secondary btn-sm edit-admin-btn"><i class="fas fa-edit"></i></button></td>
        `;
        tableBody.appendChild(newRow);

        newRow.querySelector('.edit-admin-btn').addEventListener('click', () => openEditModal(newRow));

        showToast('Admin added successfully!');
        addAdminModal.classList.remove('show');
        addAdminForm.reset();
    });

    // Attach edit listeners to existing rows
    document.querySelectorAll('.edit-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.closest('tr')));
    });

    // Edit Admin submit
    editAdminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const adminId  = document.getElementById('editAdminId').value;
        const name     = document.getElementById('editAdminName').value;
        const email    = document.getElementById('editAdminEmail').value;
        const role     = document.getElementById('editAdminRole').value;
        const isActive = document.getElementById('adminAccess').checked;

        const row = document.querySelector(`tr[data-id="${adminId}"]`);
        if (row) {
            const badgeClass = role === 'Main Admin' ? 'badge-info' : 'badge-success';
            row.children[0].innerHTML = `<strong>${name}</strong>`;
            row.children[1].textContent = email;
            row.children[2].innerHTML = `<span class="badge ${badgeClass}">${role}</span>`;
            row.style.opacity = isActive ? '1' : '0.5';
        }

        showToast('Changes saved successfully!');
        editAdminModal.classList.remove('show');
    });

    // Access toggle label update
    const adminAccessToggle = document.getElementById('adminAccess');
    const accessStatus = document.getElementById('accessStatus');
    adminAccessToggle.addEventListener('change', () => {
        accessStatus.textContent = adminAccessToggle.checked ? 'Active' : 'Disabled';
    });
}

function openEditModal(row) {
    document.getElementById('editAdminId').value    = row.getAttribute('data-id');
    document.getElementById('editAdminName').value  = row.children[0].textContent.trim();
    document.getElementById('editAdminEmail').value = row.children[1].textContent.trim();
    document.getElementById('editAdminRole').value  = row.children[2].textContent.trim();

    const isActive = row.style.opacity !== '0.5';
    document.getElementById('adminAccess').checked  = isActive;
    document.getElementById('accessStatus').textContent = isActive ? 'Active' : 'Disabled';

    document.getElementById('editAdminModal').classList.add('show');
}

// Password form
function initPasswordForm() {
    const form = document.getElementById('passwordForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const current  = document.getElementById('currentPassword').value;
        const newPass  = document.getElementById('newPassword').value;
        const confirm  = document.getElementById('confirmPassword').value;

        if (!current || !newPass || !confirm) {
            showToast('Please fill out all password fields', 'error');
            return;
        }
        if (newPass !== confirm) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (newPass.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }
        showToast('Password changed successfully!');
        form.reset();
    });
}

// Security form
function initSecurityForm() {
    const form = document.getElementById('securityForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const sessionTimeout = document.getElementById('sessionTimeout').value;
        if (sessionTimeout < 5 || sessionTimeout > 120) {
            showToast('Session timeout must be between 5 and 120 minutes', 'error');
            return;
        }
        showToast('Security settings updated!');
    });
}

// Payment form
function initPaymentForm() {
    const form         = document.getElementById('paymentForm');
    const gcashEnabled = document.getElementById('gcashEnabled');
    const gcashDetails = document.getElementById('gcashDetails');

    gcashEnabled.addEventListener('change', () => {
        gcashDetails.classList.toggle('hidden', !gcashEnabled.checked);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const gcashNumber = document.getElementById('gcashNumber').value;
        const gcashName   = document.getElementById('gcashName').value;

        if (gcashEnabled.checked && (!gcashNumber || !gcashName)) {
            showToast('Please enter GCash details', 'error');
            return;
        }
        showToast('Payment settings saved successfully!');
    });
}

// ESC key closes modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('addAdminModal')?.classList.remove('show');
        document.getElementById('editAdminModal')?.classList.remove('show');
    }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initGeneralForm();
    initAdminManagement();
    initPasswordForm();
    initSecurityForm();
    initPaymentForm();
});