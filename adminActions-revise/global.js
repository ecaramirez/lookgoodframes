//Profile
function initProfileFeatures() {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const logoutModal = document.getElementById('logoutModal');

    if (!profileTrigger) return;

    // Toggle dropdown menu
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => profileDropdown.classList.remove('show'));

    // Edit profile button
    editProfileBtn.addEventListener('click', () => {
        editProfileModal.classList.add('show');
        profileDropdown.classList.remove('show');
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
        logoutModal.classList.add('show');
        profileDropdown.classList.remove('show');
    });

    // Close modals buttons
    ['closeEditModal', 'cancelEditModal'].forEach(id => document.getElementById(id).addEventListener('click', () => editProfileModal.classList.remove('show')));
    ['closeLogoutModal', 'cancelLogout'].forEach(id => document.getElementById(id).addEventListener('click', () => logoutModal.classList.remove('show')));

    // Confirm logout
    document.getElementById('confirmLogout').addEventListener('click', () => {
        window.location.href = "../index.php";
    });

    // Save profile changes
    document.getElementById('saveProfile').addEventListener('click', () => {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (newPassword && newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        alert('Profile updated successfully!');
        editProfileModal.classList.remove('show');
    });

    // Profile image preview
    document.getElementById('profileImageInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => document.getElementById('profileImagePreview').src = e.target.result;
            reader.readAsDataURL(file);
        }
    });

    // Close modal by clicking overlay
    [editProfileModal, logoutModal].forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    });

    // ESC key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            editProfileModal.classList.remove('show');
            logoutModal.classList.remove('show');
        }
    });
}

function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');
    if (!sidebarToggle) return;

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
    });
}

function setActiveNavLink() {
    const currentPath = window.location.pathname; 
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        if (currentPath.endsWith(linkPath)) {
            link.classList.add('active');
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    initProfileFeatures();
    initSidebarToggle();
    setActiveNavLink();
});
