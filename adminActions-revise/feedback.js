// ==========================================
// FEEDBACK.JS – pulls data from feedbackAPI.php
// ==========================================

let feedbacks       = [];
let filteredFeedbacks = [];
let currentPage     = 1;
const itemsPerPage  = 6;
let selectedFeedbackId = null;

const replyTemplates = {
    5: "Thank you so much for your wonderful 5-star review! We're thrilled to hear you're satisfied with your purchase.",
    4: "Thank you for your positive feedback! We're glad you enjoyed your product.",
    3: "Thank you for your feedback. We appreciate your honest review and will continue working to improve.",
    2: "We're sorry to hear that our product didn't fully meet your expectations. Please contact our support team.",
    1: "We sincerely apologize for your disappointing experience. Please reach out to our customer support team immediately.",
};

// ── DOM refs ──────────────────────────────
const feedbackGrid       = document.getElementById('feedbackGrid');
const searchInput        = document.getElementById('feedbackSearchInput');
const ratingFilter       = document.getElementById('ratingFilter');
const statusFilter       = document.getElementById('statusFilter');
const paginationContainer= document.getElementById('feedbackPagination');
const feedbackModal      = document.getElementById('feedbackModal');
const adminReplyInput    = document.getElementById('adminReplyInput');
const sendReplyBtn       = document.getElementById('sendReplyBtn');

// ── Utilities ─────────────────────────────
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return `<div class="star-rating">${stars}</div>`;
}

function getInitials(name) {
    const parts = name.split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    const n = document.createElement('div');
    n.textContent = message;
    n.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${type==='error'?'#ef4444':'#000'};color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;z-index:10001;box-shadow:0 4px 12px rgba(0,0,0,.2);transition:opacity .3s;`;
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
}

// ── Load ──────────────────────────────────
function loadFeedback() {
    fetch('../adminBack_end/feedbackAPI.php')
        .then(res => res.json())
        .then(data => {
            feedbacks = data;
            filteredFeedbacks = [...feedbacks];
            renderFeedbackGrid();
            updateStats();
        })
        .catch(err => console.error('Feedback API error:', err));
}

// ── Filter ────────────────────────────────
function filterFeedbacks() {
    const search     = searchInput.value.toLowerCase();
    const selRating  = ratingFilter.value;
    const selStatus  = statusFilter.value;

    filteredFeedbacks = feedbacks.filter(f => {
        const matchesSearch = f.customer.toLowerCase().includes(search) ||
                              f.product.toLowerCase().includes(search) ||
                              f.comment.toLowerCase().includes(search);
        const matchesRating = !selRating || f.rating == selRating;
        const matchesStatus = !selStatus ||
                              (selStatus === 'replied'  && f.reply) ||
                              (selStatus === 'pending'  && !f.reply);
        return matchesSearch && matchesRating && matchesStatus;
    });

    currentPage = 1;
    renderFeedbackGrid();
    updateStats();
}

// ── Render grid ───────────────────────────
function renderFeedbackGrid() {
    feedbackGrid.innerHTML = '';

    if (filteredFeedbacks.length === 0) {
        feedbackGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-secondary);"><i class="fas fa-inbox" style="font-size:48px;margin-bottom:16px;opacity:.3;"></i><p>No feedback found</p></div>`;
        paginationContainer.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * itemsPerPage;
    const paged = filteredFeedbacks.slice(start, start + itemsPerPage);

    paged.forEach(f => {
        const hasReply    = f.reply && f.reply.trim() !== '';
        const statusClass = hasReply ? 'replied' : 'pending';
        const statusText  = hasReply ? 'Replied'  : 'Pending Reply';
        const statusIcon  = hasReply ? 'fa-check-circle' : 'fa-clock';

        const item = document.createElement('div');
        item.className = 'feedback-item';
        item.onclick   = () => openFeedbackModal(f.id);
        item.innerHTML = `
            <div class="feedback-item-header">
                <div class="feedback-user">
                    <div class="feedback-avatar">${getInitials(f.customer)}</div>
                    <div class="feedback-user-info"><h4>${escapeHtml(f.customer)}</h4><p>${formatDate(f.date)}</p></div>
                </div>
                <div class="feedback-rating">${renderStars(f.rating)}</div>
            </div>
            <div class="feedback-product"><i class="fas fa-box"></i> ${escapeHtml(f.product)}</div>
            <div class="feedback-comment">${escapeHtml(f.comment)}</div>
            <div class="feedback-item-footer">
                <div class="feedback-status ${statusClass}"><i class="fas ${statusIcon}"></i> ${statusText}</div>
                <div class="feedback-actions" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="openFeedbackModal(${f.id})" title="Reply"><i class="fas fa-reply"></i></button>
                    <button class="action-btn" onclick="openFeedbackModal(${f.id})" title="View"><i class="fas fa-eye"></i></button>
                </div>
            </div>`;
        feedbackGrid.appendChild(item);
    });

    renderPagination(totalPages);
}

// ── Pagination ────────────────────────────
function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;
    const createBtn = (text, page, disabled = false) => {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn';
        btn.innerHTML = text;
        btn.disabled  = disabled;
        if (!disabled) btn.onclick = () => { currentPage = page; renderFeedbackGrid(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        if (page === currentPage) btn.classList.add('active');
        return btn;
    };
    paginationContainer.appendChild(createBtn('<', currentPage - 1, currentPage === 1));
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max/2));
    let end   = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) paginationContainer.appendChild(createBtn(i, i));
    paginationContainer.appendChild(createBtn('>', currentPage + 1, currentPage === totalPages));
}

// ── Stats ─────────────────────────────────
function updateStats() {
    const total = feedbacks.length;
    document.getElementById('totalFeedback').textContent  = total;
    const avg = total > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : '0.0';
    document.getElementById('avgRating').textContent      = avg;
    document.getElementById('positiveCount').textContent  = feedbacks.filter(f => f.rating >= 4).length;
    document.getElementById('repliedCount').textContent   = feedbacks.filter(f => f.reply && f.reply.trim()).length;
    updateRatingDistribution();
}

function updateRatingDistribution() {
    const counts = {1:0,2:0,3:0,4:0,5:0};
    feedbacks.forEach(f => { counts[f.rating]++; });
    const total = feedbacks.length || 1;
    for (let r = 1; r <= 5; r++) {
        const bar = document.getElementById(`rating-${r}-bar`);
        const cnt = document.getElementById(`rating-${r}-count`);
        if (bar) bar.style.width = `${(counts[r]/total)*100}%`;
        if (cnt) cnt.textContent = counts[r];
    }
}

// ── Modal ─────────────────────────────────
function openFeedbackModal(id) {
    selectedFeedbackId = id;
    const f = feedbacks.find(x => x.id === id);
    if (!f) return;
    document.getElementById('modalAvatar').textContent    = getInitials(f.customer);
    document.getElementById('modalCustomer').textContent  = f.customer;
    document.getElementById('modalDate').textContent      = formatDate(f.date);
    document.getElementById('modalProduct').textContent   = f.product;
    document.getElementById('modalRating').innerHTML      = renderStars(f.rating);
    document.getElementById('modalComment').textContent   = f.comment;
    renderAdminReply(f);
    const hasReply = f.reply && f.reply.trim();
    document.getElementById('replySection').style.display = hasReply ? 'none' : 'block';
    adminReplyInput.value = '';
    feedbackModal.classList.add('show');
}

function renderAdminReply(f) {
    const container = document.getElementById('adminReplyContainer');
    container.innerHTML = f.reply && f.reply.trim()
        ? `<div class="admin-reply-box"><div class="admin-reply-label"><i class="fas fa-reply"></i> Your Reply</div><div class="reply-text">${escapeHtml(f.reply)}</div></div>`
        : '';
}

function closeFeedbackModal() {
    feedbackModal.classList.remove('show');
    selectedFeedbackId = null;
}

function useTemplate() {
    if (!selectedFeedbackId) return;
    const f = feedbacks.find(x => x.id === selectedFeedbackId);
    if (!f) return;
    adminReplyInput.value = replyTemplates[f.rating] || '';
    adminReplyInput.focus();
    showNotification('Template loaded — feel free to edit before sending.');
}

// Send reply to API
sendReplyBtn.onclick = function () {
    if (!selectedFeedbackId) return;
    const reply = adminReplyInput.value.trim();
    if (!reply) { showNotification('Please enter a reply before sending.', 'error'); return; }

    fetch('../adminBack_end/feedbackAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedFeedbackId, reply }),
    })
        .then(res => res.json())
        .then(() => {
            const f = feedbacks.find(x => x.id === selectedFeedbackId);
            if (f) f.reply = reply;
            filteredFeedbacks = [...feedbacks];
            renderAdminReply(f);
            document.getElementById('replySection').style.display = 'none';
            renderFeedbackGrid();
            updateStats();
            showNotification('Reply sent successfully!');
        })
        .catch(err => { console.error(err); showNotification('Failed to send reply.', 'error'); });
};

// ── Event listeners ───────────────────────
searchInput.addEventListener('input',  filterFeedbacks);
ratingFilter.addEventListener('change', filterFeedbacks);
statusFilter.addEventListener('change', filterFeedbacks);
feedbackModal.addEventListener('click', e => { if (e.target === feedbackModal) closeFeedbackModal(); });

document.addEventListener('DOMContentLoaded', loadFeedback);
