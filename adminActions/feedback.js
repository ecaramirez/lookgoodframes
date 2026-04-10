// Feedback data
const feedbacks = [
    { 
        id: 1, 
        customer: "Ericakes Ramirez", 
        product: "Classic Round Frames", 
        rating: 5, 
        comment: "Excellent quality! The frames are exactly as described and the fit is perfect. Very satisfied with my purchase.", 
        date: "2026-04-02", 
        reply: "" 
    },
    { 
        id: 2, 
        customer: "Eds Sedrik", 
        product: "Modern Square Frames", 
        rating: 3, 
        comment: "Average quality. The product is okay but could be better for the price.", 
        date: "2026-04-01", 
        reply: "" 
    },
    { 
        id: 3, 
        customer: "Pollyne Anne", 
        product: "Aviator Sunglasses", 
        rating: 4, 
        comment: "Good product overall. Stylish design and comfortable to wear.", 
        date: "2026-03-31", 
        reply: "" 
    },
    { 
        id: 4, 
        customer: "Aarhon Bautista", 
        product: "Vintage Cat Eye", 
        rating: 5, 
        comment: "Very good! Love the retro style and the quality is top-notch.", 
        date: "2026-03-30", 
        reply: "" 
    },
    { 
        id: 5, 
        customer: "Maria Santos", 
        product: "Designer Metal Frames", 
        rating: 2, 
        comment: "Not satisfied with the durability. The frame feels a bit flimsy.", 
        date: "2026-03-29", 
        reply: "" 
    },
    { 
        id: 6, 
        customer: "John Dela Cruz", 
        product: "Sport Wrap Frames", 
        rating: 4, 
        comment: "Works well for sports activities. Comfortable and stays in place.", 
        date: "2026-03-28", 
        reply: "" 
    },
    { 
        id: 7, 
        customer: "Anna Mae", 
        product: "Classic Round Frames", 
        rating: 5, 
        comment: "Perfect! Exactly what I was looking for. Fast delivery too!", 
        date: "2026-03-27", 
        reply: "" 
    },
    { 
        id: 8, 
        customer: "Robert Chen", 
        product: "Modern Square Frames", 
        rating: 3, 
        comment: "Decent frames but the color was slightly different from the photos.", 
        date: "2026-03-26", 
        reply: "" 
    },
    {
        id: 9,
        customer: "Sarah Johnson",
        product: "Aviator Sunglasses",
        rating: 5,
        comment: "Amazing! These aviators are perfect for sunny days. Great UV protection.",
        date: "2026-03-25",
        reply: ""
    },
    {
        id: 10,
        customer: "Michael Wong",
        product: "Vintage Cat Eye",
        rating: 1,
        comment: "Very disappointed. The frame broke after just one week of normal use.",
        date: "2026-03-24",
        reply: ""
    }
];

// Reply templates
const replyTemplates = {
    5: "Thank you so much for your wonderful 5-star review! We're thrilled to hear you're satisfied with your purchase. Your feedback means a lot to us!",
    4: "Thank you for your positive feedback! We're glad you enjoyed your product. If there's anything we can do to make your next experience even better, please let us know.",
    3: "Thank you for your feedback. We appreciate your honest review and will continue working to improve our products and services.",
    2: "We're sorry to hear that our product didn't fully meet your expectations. We'd like to learn more about your experience. Please contact our support team so we can make this right.",
    1: "We sincerely apologize for your disappointing experience. This is not the standard we strive for. Please reach out to our customer support team immediately so we can resolve this issue for you."
};

// Global vars
let currentPage = 1;
const itemsPerPage = 6;
let selectedFeedbackId = null;
let filteredFeedbacks = [...feedbacks];

// DOM elements
const feedbackGrid = document.getElementById("feedbackGrid");
const searchInput = document.getElementById("feedbackSearchInput");
const ratingFilter = document.getElementById("ratingFilter");
const statusFilter = document.getElementById("statusFilter");
const dateFromFilter = document.getElementById("dateFromFilter");
const dateToFilter = document.getElementById("dateToFilter");
const paginationContainer = document.getElementById("feedbackPagination");
const totalFeedbackEl = document.getElementById("totalFeedback");
const avgRatingEl = document.getElementById("avgRating");
const positiveCountEl = document.getElementById("positiveCount");
const repliedCountEl = document.getElementById("repliedCount");
const feedbackModal = document.getElementById("feedbackModal");
const adminReplyInput = document.getElementById("adminReplyInput");
const sendReplyBtn = document.getElementById("sendReplyBtn");

// Utility functions
function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating 
            ? `<i class="fas fa-star"></i>` 
            : `<i class="far fa-star"></i>`;
    }
    return `<div class="star-rating">${stars}</div>`;
}

function getInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Filter feedbacks
function filterFeedbacks() {
    const searchText = searchInput.value.toLowerCase();
    const selectedRating = ratingFilter.value;
    const selectedStatus = statusFilter.value;
    const selectedFromDate = dateFromFilter.value;
    const selectedToDate = dateToFilter.value;

    filteredFeedbacks = feedbacks.filter(f => {
        const matchesSearch = f.customer.toLowerCase().includes(searchText) || 
                            f.product.toLowerCase().includes(searchText) ||
                            f.comment.toLowerCase().includes(searchText);
        const matchesRating = !selectedRating || f.rating == selectedRating;
        const matchesStatus = !selectedStatus || 
                            (selectedStatus === 'replied' && f.reply) ||
                            (selectedStatus === 'pending' && !f.reply);
        const matchesFromDate = !selectedFromDate || f.date >= selectedFromDate;
        const matchesToDate = !selectedToDate || f.date <= selectedToDate;
        return matchesSearch && matchesRating && matchesStatus && matchesFromDate && matchesToDate;
    });

    currentPage = 1;
    renderFeedbackGrid();
    updateStats();
}

// Render feedback grid
function renderFeedbackGrid() {
    feedbackGrid.innerHTML = "";

    if (filteredFeedbacks.length === 0) {
        feedbackGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p style="font-size: 16px; font-weight: 500;">No feedback found</p>
                <p style="font-size: 14px;">Try adjusting your filters</p>
            </div>
        `;
        paginationContainer.innerHTML = "";
        return;
    }

    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, startIndex + itemsPerPage);

    paginatedFeedbacks.forEach(f => {
        const feedbackItem = document.createElement("div");
        feedbackItem.className = "feedback-item";
        feedbackItem.dataset.feedbackId = String(f.id);
        feedbackItem.onclick = () => openFeedbackModal(f.id);
        
        const hasReply = f.reply && f.reply.trim() !== "";
        const statusClass = hasReply ? "replied" : "pending";
        const statusText = hasReply ? "Replied" : "Pending Reply";
        const statusIcon = hasReply ? "fa-check-circle" : "fa-clock";

        feedbackItem.innerHTML = `
            <div class="feedback-item-header">
                <div class="feedback-user">
                    <div class="feedback-avatar">${getInitials(f.customer)}</div>
                    <div class="feedback-user-info">
                        <h4>${escapeHtml(f.customer)}</h4>
                        <p>${formatDate(f.date)}</p>
                    </div>
                </div>
                <div class="feedback-rating">${renderStars(f.rating)}</div>
            </div>
            <div class="feedback-product">
                <i class="fas fa-box"></i>
                ${escapeHtml(f.product)}
            </div>
            <div class="feedback-comment">${escapeHtml(f.comment)}</div>
            <div class="feedback-item-footer">
                <div class="feedback-status ${statusClass}">
                    <i class="fas ${statusIcon}"></i>
                    ${statusText}
                </div>
                <div class="feedback-actions" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="openFeedbackModal(${f.id})" title="Reply">
                        <i class="fas fa-reply"></i>
                    </button>
                    <button class="action-btn" onclick="openFeedbackModal(${f.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
        
        feedbackGrid.appendChild(feedbackItem);
    });

    renderPagination(totalPages);
}

// Render pagination
function renderPagination(totalPages) {
    paginationContainer.innerHTML = "";
    if (totalPages <= 1) return;

    const createBtn = (text, page, disabled = false) => {
        const btn = document.createElement("button");
        btn.className = "pagination-btn";
        btn.innerHTML = text;
        btn.disabled = disabled;
        if (!disabled) {
            btn.onclick = () => {
                currentPage = page;
                renderFeedbackGrid();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
        if (page === currentPage) btn.classList.add("active");
        return btn;
    };

    paginationContainer.appendChild(createBtn("<", currentPage - 1, currentPage === 1));

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createBtn(i, i));
    }

    paginationContainer.appendChild(createBtn(">", currentPage + 1, currentPage === totalPages));
}

// Update stats
function updateStats() {
    const total = feedbacks.length;
    totalFeedbackEl.textContent = total;

    const avgRating = total > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
        : "0.0";
    avgRatingEl.textContent = avgRating;

    positiveCountEl.textContent = feedbacks.filter(f => f.rating >= 4).length;
    repliedCountEl.textContent = feedbacks.filter(f => f.reply && f.reply.trim() !== "").length;

    updateRatingDistribution();
}

// Update rating distribution
function updateRatingDistribution() {
    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    feedbacks.forEach(f => { ratingCounts[f.rating]++; });
    const total = feedbacks.length || 1;

    for (let rating = 1; rating <= 5; rating++) {
        const count = ratingCounts[rating];
        const percentage = (count / total) * 100;
        const barFill = document.getElementById(`rating-${rating}-bar`);
        const countEl = document.getElementById(`rating-${rating}-count`);
        if (barFill) barFill.style.width = `${percentage}%`;
        if (countEl) countEl.textContent = count;
    }

    document.querySelectorAll('.rating-bar-item').forEach(item => {
        item.onclick = () => {
            ratingFilter.value = item.dataset.rating;
            filterFeedbacks();
        };
    });
}

// Open feedback modal
function openFeedbackModal(id) {
    selectedFeedbackId = id;
    const feedback = feedbacks.find(f => f.id === id);
    if (!feedback) return;

    document.getElementById("modalAvatar").textContent = getInitials(feedback.customer);
    document.getElementById("modalCustomer").textContent = feedback.customer;
    document.getElementById("modalDate").textContent = formatDate(feedback.date);
    document.getElementById("modalProduct").textContent = feedback.product;
    document.getElementById("modalRating").innerHTML = renderStars(feedback.rating);
    document.getElementById("modalComment").textContent = feedback.comment;

    renderAdminReply(feedback);

    // hide reply input if already replied
    const hasReply = feedback.reply && feedback.reply.trim() !== "";
    document.getElementById("replySection").style.display = hasReply ? "none" : "block";

    // clear textarea
    adminReplyInput.value = "";

    feedbackModal.classList.add("show");
}

// Render admin reply
function renderAdminReply(feedback) {
    const container = document.getElementById("adminReplyContainer");
    if (feedback.reply && feedback.reply.trim() !== "") {
        container.innerHTML = `
            <div class="admin-reply-box">
                <div class="admin-reply-label">
                    <i class="fas fa-reply"></i>
                    Your Reply
                </div>
                <div class="reply-text">${escapeHtml(feedback.reply)}</div>
            </div>
        `;
    } else {
        container.innerHTML = "";
    }
}

// Close feedback modal
function closeFeedbackModal() {
    feedbackModal.classList.remove("show");
    selectedFeedbackId = null;
}

// Use template
function useTemplate() {
    if (!selectedFeedbackId) return;
    const feedback = feedbacks.find(f => f.id === selectedFeedbackId);
    if (!feedback) return;
    adminReplyInput.value = replyTemplates[feedback.rating] || "";
    adminReplyInput.focus();
    showNotification("Template loaded — feel free to edit before sending.");
}

// Send reply
sendReplyBtn.onclick = function() {
    if (!selectedFeedbackId) return;

    const reply = adminReplyInput.value.trim();
    if (!reply) {
        showNotification("Please enter a reply before sending.", "error");
        return;
    }

    const feedback = feedbacks.find(f => f.id === selectedFeedbackId);
    if (!feedback) return;

    // save reply
    feedback.reply = reply;

    // update reply display
    renderAdminReply(feedback);
    document.getElementById("replySection").style.display = "none";

    // refresh page data
    renderFeedbackGrid();
    updateStats();

    showNotification("Reply sent successfully!");
};

// Event listeners
searchInput.addEventListener("input", filterFeedbacks);
ratingFilter.addEventListener("change", filterFeedbacks);
statusFilter.addEventListener("change", filterFeedbacks);
dateFromFilter.addEventListener("change", filterFeedbacks);
dateToFilter.addEventListener("change", filterFeedbacks);

// Close modal when clicking backdrop
feedbackModal.addEventListener("click", (e) => {
    if (e.target === feedbackModal) closeFeedbackModal();
});

// Notification system
function showNotification(message, type = "success") {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === "error" ? "#ef4444" : "#000"};
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: opacity 0.3s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function handleNotificationDeepLink() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') !== 'notification') return;

    const feedbackId = parseInt(params.get('feedbackId'), 10);
    if (Number.isNaN(feedbackId)) return;

    searchInput.value = "";
    ratingFilter.value = "";
    statusFilter.value = "";
    dateFromFilter.value = "";
    dateToFilter.value = "";
    filteredFeedbacks = [...feedbacks];

    const index = filteredFeedbacks.findIndex((f) => f.id === feedbackId);
    if (index < 0) return;

    currentPage = Math.floor(index / itemsPerPage) + 1;
    renderFeedbackGrid();

    const targetCard = document.querySelector(`.feedback-item[data-feedback-id="${feedbackId}"]`);
    if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    openFeedbackModal(feedbackId);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    renderFeedbackGrid();
    updateStats();
    initNotifications();
    handleNotificationDeepLink();
});