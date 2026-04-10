// =========================================
// CONVERSATION DATA (DB-BACKED)
// =========================================
const conversationsData = {
    inbox: [],
    unread: [],
    starred: [],
    archive: []
};

// =========================================
// GLOBAL STATE
// =========================================
let currentCategory = "inbox";
let currentConversation = null;
const commonEmojis = ["😊","😂","❤️","👍","🎉","🔥","✨","💯","🙏","👏","💪","🎯","✅","❌","⭐","💡"];
const MESSAGES_API_URL = '../adminBack_end/messagesAPI.php';

async function loadCategoryFromDB(category) {
    try {
        const response = await fetch(`${MESSAGES_API_URL}?filter=${encodeURIComponent(category)}&_=${Date.now()}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error || 'Failed to load conversations');
        }

        conversationsData[category] = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Failed to load ${category} conversations:`, error);
        conversationsData[category] = [];
        showNotification('Unable to load messages from database.');
    }
}

async function postMessageAction(action, payload = {}) {
    const response = await fetch(MESSAGES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
    });
    const data = await response.json();
    if (!response.ok || data.error || data.success === false) {
        throw new Error(data.error || `Failed action: ${action}`);
    }
    return data;
}

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

async function confirmDelete() {
    if (!currentConversation) return;
    try {
        await postMessageAction('delete', { user_id: currentConversation.id });
        await loadCategoryFromDB(currentCategory);
        updateCategoryCounts();
        closeDelConvo();
        loadMessages(currentCategory);
        document.getElementById('empty-view').style.display = "flex";
        document.getElementById('active-view').style.display = "none";
        currentConversation = null;
        showNotification("Conversation deleted");
    } catch (error) {
        console.error('Delete conversation failed:', error);
        showNotification('Unable to delete conversation');
    }
}

// =========================================
// ARCHIVE
// =========================================
async function archiveConversation() {
    if (!currentConversation) return;
    try {
        await postMessageAction('archive', { user_id: currentConversation.id });
        await loadCategoryFromDB(currentCategory);
        updateCategoryCounts();
        loadMessages(currentCategory);
        document.getElementById('empty-view').style.display = "flex";
        document.getElementById('active-view').style.display = "none";
        currentConversation = null;
        showNotification("Conversation archived");
    } catch (error) {
        console.error('Archive conversation failed:', error);
        showNotification('Unable to archive conversation');
    }
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
async function markAllAsRead() {
    try {
        const currentList = conversationsData[currentCategory] || [];
        await Promise.all(currentList.map((c) => postMessageAction('mark_read', { user_id: c.id })));
        await loadCategoryFromDB('inbox');
        await loadCategoryFromDB('unread');
        if (currentCategory !== 'inbox' && currentCategory !== 'unread') {
            await loadCategoryFromDB(currentCategory);
        }
        updateCategoryCounts();
        loadMessages(currentCategory);
        showNotification("All messages marked as read");
    } catch (error) {
        console.error('Mark all read failed:', error);
        showNotification('Unable to mark messages as read');
    }
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
async function sendNewMessage() {
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

    try {
        await postMessageAction('send', { user_id: currentConversation.id, message: text });
        await loadCategoryFromDB(currentCategory);
        const refreshed = conversationsData[currentCategory].find((c) => c.id === currentConversation.id);
        if (refreshed) {
            openConversation(refreshed);
        }
        loadMessages(currentCategory);
    } catch (error) {
        console.error('Send message failed:', error);
        showNotification('Failed to send message');
    }
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

async function setActiveCategory(category) {
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
    await loadCategoryFromDB(currentCategory);
    loadMessages(currentCategory);
    document.getElementById('empty-view').style.display = "flex";
    document.getElementById('active-view').style.display = "none";
}

async function handleNotificationDeepLink() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') !== 'notification') return;

    const preferredCategory = params.get('category');
    const conversationId = parseInt(params.get('conversationId'), 10);

    if (preferredCategory && conversationsData[preferredCategory]) {
        await setActiveCategory(preferredCategory);
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

    await setActiveCategory(foundCategory);

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
    (async () => {
        await loadCategoryFromDB('inbox');
        await loadCategoryFromDB('unread');
        await loadCategoryFromDB('starred');
        await loadCategoryFromDB('archive');

        loadMessages(currentCategory);
        updateCategoryCounts();

        // Category tabs
        document.querySelectorAll(".message-sidebar .menu-item").forEach(item => {
            item.addEventListener("click", async () => {
                await setActiveCategory(item.dataset.category);
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
        await handleNotificationDeepLink();
    })();
});