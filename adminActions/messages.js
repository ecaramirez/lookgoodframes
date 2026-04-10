// =========================================
// CONVERSATION DATA
// =========================================
const conversationsData = {
    inbox: [
        {
            id: 1,
            name: "Erica Ramirez",
            email: "erica@gmail.com",
            phone: "+63 900 000 0000",
            location: "Manila, Philippines",
            avatar: "ER",
            lastMessage: "Hi. I would like to ask about my order #12345.",
            time: "10:30 AM",
            unread: true,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "Hi. I would like to ask about my order #12345.", time: "10:30 AM" },
                { type: "outgoing", text: "Hello! Let me check that for you right away.", time: "10:32 AM", seen: "Read 10:32 AM" },
                { type: "incoming", text: "Thank you! I appreciate your help.", time: "10:33 AM" },
                { type: "outgoing", text: "Your order is currently being processed and will be shipped within 24 hours.", time: "10:35 AM", seen: "Read 10:35 AM" }
            ]
        },
        {
            id: 2,
            name: "Eds Sed",
            email: "edriansedrik@gmail.com",
            phone: "+63 965 726 7584",
            location: "Quezon City, Philippines",
            avatar: "ES",
            lastMessage: "Is this available?",
            time: "10:00 AM",
            unread: false,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "Is this available?", time: "10:00 AM" },
                { type: "outgoing", text: "Yes, it is currently available! How many do you need?", time: "10:05 AM", seen: "Read 10:05 AM" },
                { type: "incoming", text: "I need 2 pieces. Can you ship to Quezon City?", time: "10:08 AM" },
                { type: "outgoing", text: "Absolutely! We ship to Quezon City. Delivery takes 2-3 business days.", time: "10:10 AM", seen: "Read 10:10 AM" }
            ]
        },
        {
            id: 3,
            name: "Pollyne Anne",
            email: "pollyne.aldrin@yahoo.com",
            phone: "+63 939 203 2873",
            location: "Makati, Philippines",
            avatar: "PA",
            lastMessage: "Delivery query.",
            time: "09:00 AM",
            unread: false,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "Delivery query.", time: "09:00 AM" },
                { type: "outgoing", text: "It would take 2-3 business days.", time: "09:15 AM", seen: "Read 09:15 AM" },
                { type: "incoming", text: "Perfect! I'll place my order now.", time: "09:18 AM" },
                { type: "outgoing", text: "Great! Let me know if you need any assistance.", time: "09:20 AM" }
            ]
        }
    ],
    unread: [
        {
            id: 4,
            name: "Ms. Mess",
            email: "mess.143@gmail.com",
            phone: "+63 912 345 6789",
            location: "Pasig, Philippines",
            avatar: "MM",
            lastMessage: "Invoice #332",
            time: "11:00 AM",
            unread: true,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "Hello, can I get a copy of invoice #332?", time: "11:00 AM" },
                { type: "incoming", text: "I need it for my records.", time: "11:01 AM" }
            ]
        },
        {
            id: 5,
            name: "Shipping Department",
            email: "shipship@gmail.com",
            phone: "+63 922 222 2222",
            location: "Manila, Philippines",
            avatar: "SD",
            lastMessage: "Delivery update",
            time: "04:00 PM",
            unread: true,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "Delivery update for order #445", time: "04:00 PM" },
                { type: "incoming", text: "Package is out for delivery today", time: "04:01 PM" }
            ]
        },
        {
            id: 6,
            name: "JNT Partner",
            email: "jnt_delivery@company.com",
            phone: "N/A",
            location: "Logistics Center",
            avatar: "JNT",
            lastMessage: "Delay notification",
            time: "08:00 AM",
            unread: true,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "There will be a slight delay in delivery due to weather conditions.", time: "08:00 AM" },
                { type: "incoming", text: "Expected delivery: Tomorrow afternoon", time: "08:02 AM" }
            ]
        }
    ],
    starred: [
        {
            id: 7,
            name: "Bossing",
            email: "bigbozz@company.com",
            phone: "+63 939 302 1628",
            location: "BGC, Philippines",
            avatar: "B",
            lastMessage: "Meeting notes",
            time: "02:30 PM",
            unread: false,
            starred: true,
            blocked: false,
            messages: [
                { type: "incoming", text: "Meeting notes from today's session", time: "02:30 PM" },
                { type: "incoming", text: "Please review the attached document", time: "02:32 PM" },
                { type: "outgoing", text: "Received with thanks. I will review them.", time: "02:35 PM", seen: "Read 02:35 PM" },
                { type: "outgoing", text: "Everything looks good. I'll implement these changes.", time: "02:45 PM", seen: "Read 02:50 PM" }
            ]
        },
        {
            id: 8,
            name: "Big Client",
            email: "bigclient@gmail.com",
            phone: "+44 20 7946 0000",
            location: "London, UK",
            avatar: "BC",
            lastMessage: "Proposal accepted",
            time: "05:00 PM",
            unread: false,
            starred: true,
            blocked: false,
            messages: [
                { type: "incoming", text: "We've reviewed your proposal and we're happy to accept!", time: "05:00 PM" },
                { type: "outgoing", text: "That's great news! I'll send the contract shortly.", time: "05:10 PM", seen: "Read 05:12 PM" },
                { type: "outgoing", text: "Contract sent. Please review and sign.", time: "05:43 PM", seen: "Read 06:00 PM" },
                { type: "incoming", text: "Will review by end of day. Thanks!", time: "06:15 PM" }
            ]
        },
        {
            id: 9,
            name: "HR Department",
            email: "hr@company.com",
            phone: "N/A",
            location: "Head Office",
            avatar: "HR",
            lastMessage: "Holiday schedule",
            time: "09:15 AM",
            unread: false,
            starred: true,
            blocked: false,
            messages: [
                { type: "incoming", text: "Updated holiday schedule for 2026", time: "09:15 AM" },
                { type: "incoming", text: "Please check the attached file", time: "09:16 AM" },
                { type: "outgoing", text: "Noted on this. Thank you for the update!", time: "09:20 AM", seen: "Read 09:25 AM" }
            ]
        }
    ],
    archive: [
        {
            id: 10,
            name: "Old Client",
            email: "oldkliyente@yahoo.com",
            phone: "+1 000 000 0000",
            location: "New York, USA",
            avatar: "OC",
            lastMessage: "Project done",
            time: "10:00 AM",
            unread: false,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "Project has been completed successfully!", time: "10:00 AM" },
                { type: "outgoing", text: "Great job team. Thanks for the update!", time: "10:30 AM", seen: "Read 11:00 AM" },
                { type: "incoming", text: "Will send final invoice by EOD", time: "10:35 AM" },
                { type: "outgoing", text: "Perfect, looking forward to it.", time: "10:40 AM" }
            ]
        },
        {
            id: 11,
            name: "System",
            email: "admin@system.com",
            phone: "N/A",
            location: "System",
            avatar: "S",
            lastMessage: "Welcome!",
            time: "12:00 PM",
            unread: false,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "Welcome to Look Good Frames Admin!", time: "12:00 PM" },
                { type: "outgoing", text: "Thank you!", time: "12:05 PM" }
            ]
        },
        {
            id: 12,
            name: "Sales Department",
            email: "salesdept@company.com",
            phone: "N/A",
            location: "Sales Office",
            avatar: "SD",
            lastMessage: "Weekly sales update",
            time: "08:00 AM",
            unread: false,
            starred: false,
            blocked: false,
            messages: [
                { type: "incoming", text: "Weekly sales update for review", time: "08:00 AM" },
                { type: "incoming", text: "Sales are up 25% this week!", time: "08:00 AM" },
                { type: "outgoing", text: "Excellent work team! Keep it up.", time: "08:15 AM", seen: "Read 08:20 AM" }
            ]
        }
    ]
};

// =========================================
// GLOBAL STATE
// =========================================
let currentCategory = "inbox";
let currentConversation = null;
const commonEmojis = ["😊","😂","❤️","👍","🎉","🔥","✨","💯","🙏","👏","💪","🎯","✅","❌","⭐","💡"];

// =========================================
// UTILITY
// =========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    const existing = document.getElementById('msg-notification');
    if (existing) existing.remove();

    const n = document.createElement('div');
    n.id = 'msg-notification';
    n.textContent = message;
    n.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: #111827;
        color: #fff;
        padding: 12px 28px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 500;
        z-index: 99999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        opacity: 0;
        transition: opacity 0.2s ease;
        white-space: nowrap;
    `;
    document.body.appendChild(n);

    requestAnimationFrame(() => { n.style.opacity = '1'; });

    setTimeout(() => {
        n.style.opacity = '0';
        setTimeout(() => n.remove(), 300);
    }, 2200);
}

// =========================================
// DELETE MODAL
// =========================================
function openDelConvo() {
    if (!currentConversation) return;
    document.getElementById('delConvo-modal').classList.add('show');
}

function closeDelConvo() {
    document.getElementById('delConvo-modal').classList.remove('show');
}

function confirmDelete() {
    if (!currentConversation) return;
    const id = currentConversation.id;
    Object.keys(conversationsData).forEach(cat => {
        const i = conversationsData[cat].findIndex(c => c.id === id);
        if (i > -1) conversationsData[cat].splice(i, 1);
    });
    updateCategoryCounts();
    closeDelConvo();
    loadMessages(currentCategory);
    document.getElementById('empty-view').style.display = "flex";
    document.getElementById('active-view').style.display = "none";
    currentConversation = null;
    showNotification("Conversation deleted");
}

// =========================================
// ARCHIVE
// =========================================
function archiveConversation() {
    if (!currentConversation) return;
    const id = currentConversation.id;
    Object.keys(conversationsData).forEach(cat => {
        const i = conversationsData[cat].findIndex(c => c.id === id);
        if (i > -1) {
            const [convo] = conversationsData[cat].splice(i, 1);
            if (cat !== 'archive') conversationsData.archive.push(convo);
        }
    });
    updateCategoryCounts();
    loadMessages(currentCategory);
    document.getElementById('empty-view').style.display = "flex";
    document.getElementById('active-view').style.display = "none";
    currentConversation = null;
    showNotification("Conversation archived");
}

// =========================================
// STAR
// =========================================
function toggleStar() {
    if (!currentConversation) return;
    currentConversation.starred = !currentConversation.starred;
    const id = currentConversation.id;
    if (currentConversation.starred) {
        Object.keys(conversationsData).forEach(cat => {
            const c = conversationsData[cat].find(x => x.id === id);
            if (c && cat !== 'starred' && !conversationsData.starred.find(x => x.id === id)) {
                conversationsData.starred.push({ ...c });
            }
        });
        showNotification("Added to starred");
    } else {
        const i = conversationsData.starred.findIndex(c => c.id === id);
        if (i > -1) conversationsData.starred.splice(i, 1);
        Object.keys(conversationsData).forEach(cat => {
            const c = conversationsData[cat].find(x => x.id === id);
            if (c) c.starred = false;
        });
        showNotification("Removed from starred");
    }
    updateStarButton(currentConversation.starred);
    updateCategoryCounts();
    if (currentCategory === 'starred') loadMessages(currentCategory);
}

function updateStarButton(isStarred) {
    const btn = document.querySelector('.chat-actions button[title="Star"]');
    if (!btn) return;
    btn.onclick = toggleStar;
    const icon = btn.querySelector('i');
    if (isStarred) {
        icon.classList.replace('far', 'fas');
        icon.style.color = '#f59e0b';
    } else {
        icon.classList.replace('fas', 'far');
        icon.style.color = '';
    }
}

// =========================================
// BLOCK
// =========================================
function toggleBlockUser() {
    if (!currentConversation) return;
    currentConversation.blocked = !currentConversation.blocked;
    const id = currentConversation.id;
    Object.keys(conversationsData).forEach(cat => {
        const c = conversationsData[cat].find(x => x.id === id);
        if (c) c.blocked = currentConversation.blocked;
    });
    updateBlockButton(currentConversation.blocked);
    const banner = document.getElementById("blocked-banner");
    if (banner) banner.style.display = currentConversation.blocked ? "flex" : "none";
    const typeBox = document.getElementById("type-box");
    const sendBtn = document.querySelector(".send-btn");
    if (typeBox) {
        typeBox.disabled = currentConversation.blocked;
        typeBox.placeholder = currentConversation.blocked ? "You have blocked this user." : "Type a message...";
    }
    if (sendBtn) sendBtn.disabled = currentConversation.blocked;
    loadMessages(currentCategory);
    closeInfoSidebar();
    showNotification(currentConversation.blocked
        ? `${currentConversation.name} has been blocked`
        : `${currentConversation.name} has been unblocked`
    );
}

function updateBlockButton(isBlocked) {
    const btn = document.getElementById("block-user-btn");
    if (!btn) return;
    btn.innerHTML = isBlocked ? '<i class="fas fa-ban"></i> Unblock User' : '<i class="fas fa-ban"></i> Block User';
    btn.className = isBlocked ? 'btn btn-danger' : 'btn btn-secondary';
}

// =========================================
// INFO SIDEBAR
// =========================================
function toggleInfoSidebar() {
    document.getElementById("info-details").classList.toggle("active");
}

function closeInfoSidebar() {
    document.getElementById("info-details").classList.remove("active");
}

// =========================================
// MARK ALL READ
// =========================================
function markAllAsRead() {
    Object.keys(conversationsData).forEach(cat => {
        conversationsData[cat].forEach(c => { c.unread = false; });
    });
    conversationsData.unread = [];
    updateCategoryCounts();
    loadMessages(currentCategory);
    showNotification("All messages marked as read");
}

// =========================================
// HANDLE ENTER
// =========================================
function handleEnter(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendNewMessage();
    }
}

// =========================================
// SEND MESSAGE
// =========================================
function sendNewMessage() {
    const input = document.getElementById("type-box");
    const chatWrapper = document.getElementById("chat-box-wrapper");
    const text = input.value.trim();
    if (!text || !currentConversation || currentConversation.blocked) return;

    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const msgRow = document.createElement("div");
    msgRow.classList.add("msg-row", "outgoing");
    msgRow.innerHTML = `<div class="bubble">${escapeHtml(text)} <span class="time">${time}</span></div>`;
    chatWrapper.appendChild(msgRow);

    input.value = "";
    input.focus();
    chatWrapper.scrollTop = chatWrapper.scrollHeight;

    currentConversation.messages.push({ type: "outgoing", text, time });
    currentConversation.lastMessage = text;
    currentConversation.time = time;
    loadMessages(currentCategory);
}

// =========================================
// SEND ATTACHMENT
// =========================================
function sendAttachment(file) {
    if (!currentConversation || currentConversation.blocked) return;
    const chatWrapper = document.getElementById("chat-box-wrapper");
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const msgRow = document.createElement("div");
    msgRow.classList.add("msg-row", "outgoing");
    msgRow.innerHTML = `<div class="bubble">File attached<div class="attachment-preview"><i class="fas fa-file"></i> ${escapeHtml(file.name)}</div><span class="time">${time}</span></div>`;
    chatWrapper.appendChild(msgRow);
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
    currentConversation.messages.push({ type: "outgoing", text: "File attached", time, attachment: file.name });
    showNotification(`Attached: ${file.name}`);
}

// =========================================
// EMOJI PICKER
// =========================================
function toggleEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker) picker.classList.toggle('active');
}

function closeEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker) picker.classList.remove('active');
}

function insertEmoji(emoji) {
    const input = document.getElementById('type-box');
    if (input) { input.value += emoji; input.focus(); }
    closeEmojiPicker();
}

// =========================================
// RENDER MESSAGES
// =========================================
function renderMessages(messages) {
    const chatWrapper = document.getElementById("chat-box-wrapper");
    chatWrapper.innerHTML = "";
    messages.forEach((msg, i) => {
        if (i === 0) {
            const d = document.createElement("div");
            d.classList.add("date-divider");
            d.innerHTML = '<span>Today</span>';
            chatWrapper.appendChild(d);
        }
        const row = document.createElement("div");
        row.classList.add("msg-row", msg.type);
        let html = `<div class="bubble">${escapeHtml(msg.text)} <span class="time">${msg.time}</span></div>`;
        if (msg.attachment) html += `<div class="attachment-preview"><i class="fas fa-file"></i> ${msg.attachment}</div>`;
        if (msg.seen) html += `<span class="seen">${msg.seen}</span>`;
        row.innerHTML = html;
        chatWrapper.appendChild(row);
    });
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
}

// =========================================
// OPEN CONVERSATION
// =========================================
function openConversation(convo) {
    currentConversation = convo;
    document.getElementById('empty-view').style.display = "none";
    document.getElementById('active-view').style.display = "flex";

    document.getElementById("head-avatar").textContent = convo.avatar;
    document.getElementById("head-name").textContent = convo.name;
    document.getElementById("head-email").textContent = convo.email;
    document.getElementById("info-avatar").textContent = convo.avatar;
    document.getElementById("info-name").textContent = convo.name;
    document.getElementById("detail-email").textContent = convo.email;
    document.getElementById("detail-phone").textContent = convo.phone;
    document.getElementById("detail-loc").textContent = convo.location;

    updateStarButton(convo.starred);
    updateBlockButton(convo.blocked);

    const banner = document.getElementById("blocked-banner");
    if (banner) banner.style.display = convo.blocked ? "flex" : "none";

    const typeBox = document.getElementById("type-box");
    const sendBtn = document.querySelector(".send-btn");
    if (typeBox) { typeBox.disabled = convo.blocked; typeBox.placeholder = convo.blocked ? "You have blocked this user." : "Type a message..."; }
    if (sendBtn) sendBtn.disabled = convo.blocked;

    renderMessages(convo.messages);
    closeInfoSidebar();
}

// =========================================
// LOAD CONVERSATION LIST
// =========================================
function loadMessages(category) {
    const container = document.getElementById("message-items");
    container.innerHTML = "";
    const list = conversationsData[category];
    if (!list || list.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">No messages</div>';
        return;
    }
    list.forEach(convo => {
        const div = document.createElement("div");
        div.classList.add("message-msg");
        if (convo.unread) div.classList.add("unread");
        div.dataset.id = convo.id;
        const badge = convo.blocked ? `<span style="font-size:10px;color:#ef4444;font-weight:600;margin-left:4px;">BLOCKED</span>` : '';
        div.innerHTML = `
            <div class="msg-avatar">${convo.avatar}</div>
            <div class="message-info">
                <div class="message-info-header">
                    <p>${convo.name}${badge}</p>
                    <span class="time">${convo.time}</span>
                </div>
                <span class="preview">${convo.lastMessage}</span>
            </div>`;
        div.addEventListener("click", () => {
            document.querySelectorAll(".message-msg").forEach(m => m.classList.remove("active"));
            div.classList.add("active");
            div.classList.remove("unread");
            convo.unread = false;
            openConversation(convo);
        });
        container.appendChild(div);
    });
}

function setActiveCategory(category) {
    if (!conversationsData[category]) return;

    document.querySelectorAll(".message-sidebar .menu-item").forEach((i) => {
        i.classList.remove("menu-active");
    });

    const activeItem = document.querySelector(`.message-sidebar .menu-item[data-category="${category}"]`);
    if (activeItem) {
        activeItem.classList.add("menu-active");
        document.getElementById("list-title").textContent = activeItem.querySelector(".text").textContent;
    }

    currentCategory = category;
    loadMessages(currentCategory);
    document.getElementById('empty-view').style.display = "flex";
    document.getElementById('active-view').style.display = "none";
}

function handleNotificationDeepLink() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') !== 'notification') return;

    const preferredCategory = params.get('category');
    const conversationId = parseInt(params.get('conversationId'), 10);

    if (preferredCategory && conversationsData[preferredCategory]) {
        setActiveCategory(preferredCategory);
    }

    if (Number.isNaN(conversationId)) return;

    let foundConversation = null;
    let foundCategory = preferredCategory && conversationsData[preferredCategory] ? preferredCategory : null;

    if (foundCategory) {
        foundConversation = conversationsData[foundCategory].find((c) => c.id === conversationId) || null;
    }

    if (!foundConversation) {
        Object.keys(conversationsData).some((category) => {
            const match = conversationsData[category].find((c) => c.id === conversationId);
            if (match) {
                foundConversation = match;
                foundCategory = category;
                return true;
            }
            return false;
        });
    }

    if (!foundConversation || !foundCategory) return;

    setActiveCategory(foundCategory);

    const row = document.querySelector(`.message-msg[data-id="${foundConversation.id}"]`);
    if (row) {
        document.querySelectorAll('.message-msg').forEach((m) => m.classList.remove('active'));
        row.classList.add('active');
        row.classList.remove('unread');
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    foundConversation.unread = false;
    openConversation(foundConversation);
    updateCategoryCounts();
}

// =========================================
// UPDATE COUNTS
// =========================================
function updateCategoryCounts() {
    document.querySelectorAll(".message-sidebar .menu-item").forEach(item => {
        const cat = item.dataset.category;
        const badge = item.querySelector(".count");
        if (badge && conversationsData[cat]) badge.textContent = conversationsData[cat].length;
    });
}

// =========================================
// INIT
// =========================================
document.addEventListener("DOMContentLoaded", () => {

    loadMessages(currentCategory);
    updateCategoryCounts();

    // Category tabs
    document.querySelectorAll(".message-sidebar .menu-item").forEach(item => {
        item.addEventListener("click", () => {
            setActiveCategory(item.dataset.category);
        });
    });

    // Search
    const searchInput = document.getElementById("searchMessages");
    if (searchInput) {
        searchInput.addEventListener("input", e => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll(".message-msg").forEach(msg => {
                const name = msg.querySelector("p")?.textContent.toLowerCase() || '';
                const preview = msg.querySelector(".preview")?.textContent.toLowerCase() || '';
                msg.style.display = (name.includes(q) || preview.includes(q)) ? "grid" : "none";
            });
        });
    }

    // Attach file
    document.querySelectorAll('.chat-footer button[title="Attach file"]').forEach(btn => {
        btn.onclick = () => {
            const inp = document.createElement('input');
            inp.type = 'file';
            inp.accept = 'image/*,.pdf,.doc,.docx';
            inp.onchange = e => { const f = e.target.files[0]; if (f) sendAttachment(f); };
            inp.click();
        };
    });

    // Emoji button
    document.querySelectorAll('.chat-footer button[title="Emoji"]').forEach(btn => {
        btn.onclick = e => { e.stopPropagation(); toggleEmojiPicker(); };
    });

    // Build emoji picker
    const activeViewEl = document.getElementById('active-view');
    if (activeViewEl) {
        const picker = document.createElement('div');
        picker.id = 'emoji-picker';
        picker.className = 'emoji-picker';
        picker.innerHTML = `
            <div class="emoji-picker-header">
                <h4>Emojis</h4>
                <button class="btn-icon" onclick="closeEmojiPicker()" style="width:24px;height:24px;border:none;"><i class="fas fa-times"></i></button>
            </div>
            <div class="emoji-grid">
                ${commonEmojis.map(e => `<div class="emoji-item" onclick="insertEmoji('${e}')">${e}</div>`).join('')}
            </div>`;
        activeViewEl.appendChild(picker);
    }

    // Close emoji on outside click
    document.addEventListener('click', e => {
        const picker = document.getElementById('emoji-picker');
        const emojiBtn = document.querySelector('.chat-footer button[title="Emoji"]');
        if (picker && !picker.contains(e.target) && !emojiBtn?.contains(e.target)) closeEmojiPicker();
    });

    // Block user button
    const blockBtn = document.getElementById("block-user-btn");
    if (blockBtn) blockBtn.onclick = toggleBlockUser;

    initNotifications();
    handleNotificationDeepLink();
});