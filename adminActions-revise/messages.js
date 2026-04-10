// ==========================================
// MESSAGES.JS – pulls data from messagesAPI.php
// ==========================================

let conversationsData = { inbox: [], unread: [], starred: [], archive: [] };
let currentCategory   = 'inbox';
let currentConversation = null;
const commonEmojis = ['😊','😂','❤️','👍','🎉','🔥','✨','💯','🙏','👏','💪','🎯','✅','❌','⭐','💡'];

// ── Utilities ─────────────────────────────
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
    n.style.cssText = `position:fixed;bottom:40px;left:50%;transform:translateX(-50%);background:#111827;color:#fff;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:500;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.25);opacity:0;transition:opacity .2s;white-space:nowrap;`;
    document.body.appendChild(n);
    requestAnimationFrame(() => { n.style.opacity = '1'; });
    setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 2200);
}

// ── Load conversations ─────────────────────
function loadCategory(category) {
    fetch(`../adminBack_end/messagesAPI.php?filter=${category}`)
        .then(res => res.json())
        .then(data => {
            conversationsData[category] = data;
            if (category === currentCategory) {
                loadMessages(category);
                updateCategoryCounts();
            }
        })
        .catch(err => console.error('Messages API error:', err));
}

function loadAllCategories() {
    ['inbox','unread','starred','archive'].forEach(loadCategory);
}

// ── Send ──────────────────────────────────
function sendNewMessage() {
    const input       = document.getElementById('type-box');
    const chatWrapper = document.getElementById('chat-box-wrapper');
    const text        = input.value.trim();
    if (!text || !currentConversation || currentConversation.blocked) return;

    fetch('../adminBack_end/messagesAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', user_id: currentConversation.id, message: text }),
    })
        .then(res => res.json())
        .then(() => {
            const time  = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const row   = document.createElement('div');
            row.classList.add('msg-row', 'outgoing');
            row.innerHTML = `<div class="bubble">${escapeHtml(text)} <span class="time">${time}</span></div>`;
            chatWrapper.appendChild(row);
            input.value = '';
            input.focus();
            chatWrapper.scrollTop = chatWrapper.scrollHeight;
            currentConversation.messages.push({ type: 'outgoing', text, time });
            currentConversation.lastMessage = text;
            currentConversation.time        = time;
            loadMessages(currentCategory);
        })
        .catch(err => console.error(err));
}

// ── Archive ───────────────────────────────
function archiveConversation() {
    if (!currentConversation) return;
    fetch('../adminBack_end/messagesAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', user_id: currentConversation.id }),
    })
        .then(res => res.json())
        .then(() => {
            showNotification('Conversation archived');
            document.getElementById('empty-view').style.display  = 'flex';
            document.getElementById('active-view').style.display = 'none';
            currentConversation = null;
            loadAllCategories();
        })
        .catch(err => console.error(err));
}

// ── Delete ────────────────────────────────
function openDelConvo()  { if (currentConversation) document.getElementById('delConvo-modal').classList.add('show'); }
function closeDelConvo() { document.getElementById('delConvo-modal').classList.remove('show'); }

function confirmDelete() {
    if (!currentConversation) return;
    fetch('../adminBack_end/messagesAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', user_id: currentConversation.id }),
    })
        .then(res => res.json())
        .then(() => {
            closeDelConvo();
            showNotification('Conversation deleted');
            document.getElementById('empty-view').style.display  = 'flex';
            document.getElementById('active-view').style.display = 'none';
            currentConversation = null;
            loadAllCategories();
        })
        .catch(err => console.error(err));
}

// ── Star (client-side only) ────────────────
function toggleStar() {
    if (!currentConversation) return;
    currentConversation.starred = !currentConversation.starred;
    updateStarButton(currentConversation.starred);
    showNotification(currentConversation.starred ? 'Added to starred' : 'Removed from starred');
}

function updateStarButton(isStarred) {
    const btn = document.querySelector('.chat-actions button[title="Star"]');
    if (!btn) return;
    btn.onclick = toggleStar;
    const icon = btn.querySelector('i');
    if (isStarred) { icon.classList.replace('far','fas'); icon.style.color = '#f59e0b'; }
    else           { icon.classList.replace('fas','far'); icon.style.color = ''; }
}

// ── Block (client-side only) ───────────────
function toggleBlockUser() {
    if (!currentConversation) return;
    currentConversation.blocked = !currentConversation.blocked;
    updateBlockButton(currentConversation.blocked);
    const banner  = document.getElementById('blocked-banner');
    const typeBox = document.getElementById('type-box');
    const sendBtn = document.querySelector('.send-btn');
    if (banner)  banner.style.display  = currentConversation.blocked ? 'flex' : 'none';
    if (typeBox) { typeBox.disabled    = currentConversation.blocked; typeBox.placeholder = currentConversation.blocked ? 'You have blocked this user.' : 'Type a message...'; }
    if (sendBtn)  sendBtn.disabled     = currentConversation.blocked;
    closeInfoSidebar();
    showNotification(currentConversation.blocked ? `${currentConversation.name} has been blocked` : `${currentConversation.name} has been unblocked`);
}

function updateBlockButton(isBlocked) {
    const btn = document.getElementById('block-user-btn');
    if (!btn) return;
    btn.innerHTML  = isBlocked ? '<i class="fas fa-ban"></i> Unblock User' : '<i class="fas fa-ban"></i> Block User';
    btn.className  = isBlocked ? 'btn btn-danger' : 'btn btn-secondary';
}

// ── Info sidebar ──────────────────────────
function toggleInfoSidebar() { document.getElementById('info-details').classList.toggle('active'); }
function closeInfoSidebar()  { document.getElementById('info-details').classList.remove('active'); }

// ── Mark all read ─────────────────────────
function markAllAsRead() {
    conversationsData[currentCategory].forEach(c => { c.unread = false; });
    loadMessages(currentCategory);
    showNotification('All messages marked as read');
}

// ── Enter to send ─────────────────────────
function handleEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendNewMessage(); }
}

// ── Attachment ────────────────────────────
function sendAttachment(file) {
    if (!currentConversation || currentConversation.blocked) return;
    const chatWrapper = document.getElementById('chat-box-wrapper');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const row  = document.createElement('div');
    row.classList.add('msg-row', 'outgoing');
    row.innerHTML = `<div class="bubble">File attached<div class="attachment-preview"><i class="fas fa-file"></i> ${escapeHtml(file.name)}</div><span class="time">${time}</span></div>`;
    chatWrapper.appendChild(row);
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
    showNotification(`Attached: ${file.name}`);
}

// ── Emoji ─────────────────────────────────
function toggleEmojiPicker() { document.getElementById('emoji-picker')?.classList.toggle('active'); }
function closeEmojiPicker()  { document.getElementById('emoji-picker')?.classList.remove('active'); }
function insertEmoji(emoji)  { const i = document.getElementById('type-box'); if (i) { i.value += emoji; i.focus(); } closeEmojiPicker(); }

// ── Render messages ────────────────────────
function renderMessages(messages) {
    const chatWrapper = document.getElementById('chat-box-wrapper');
    chatWrapper.innerHTML = '';
    messages.forEach((msg, i) => {
        if (i === 0) { const d = document.createElement('div'); d.classList.add('date-divider'); d.innerHTML = '<span>Today</span>'; chatWrapper.appendChild(d); }
        const row = document.createElement('div');
        row.classList.add('msg-row', msg.type);
        let html = `<div class="bubble">${escapeHtml(msg.text)} <span class="time">${msg.time}</span></div>`;
        if (msg.seen) html += `<span class="seen">${msg.seen}</span>`;
        row.innerHTML = html;
        chatWrapper.appendChild(row);
    });
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
}

// ── Open conversation ──────────────────────
function openConversation(convo) {
    currentConversation = convo;
    document.getElementById('empty-view').style.display  = 'none';
    document.getElementById('active-view').style.display = 'flex';
    document.getElementById('head-avatar').textContent   = convo.avatar;
    document.getElementById('head-name').textContent     = convo.name;
    document.getElementById('head-email').textContent    = convo.email;
    document.getElementById('info-avatar').textContent   = convo.avatar;
    document.getElementById('info-name').textContent     = convo.name;
    document.getElementById('detail-email').textContent  = convo.email;
    document.getElementById('detail-phone').textContent  = convo.phone;
    document.getElementById('detail-loc').textContent    = convo.location;
    updateStarButton(convo.starred);
    updateBlockButton(convo.blocked);
    const banner  = document.getElementById('blocked-banner');
    const typeBox = document.getElementById('type-box');
    const sendBtn = document.querySelector('.send-btn');
    if (banner)  banner.style.display  = convo.blocked ? 'flex' : 'none';
    if (typeBox) { typeBox.disabled    = convo.blocked; typeBox.placeholder = convo.blocked ? 'You have blocked this user.' : 'Type a message...'; }
    if (sendBtn)  sendBtn.disabled     = convo.blocked;
    renderMessages(convo.messages);
    closeInfoSidebar();
}

// ── Load conversation list ─────────────────
function loadMessages(category) {
    const container = document.getElementById('message-items');
    container.innerHTML = '';
    const list = conversationsData[category];
    if (!list || list.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">No messages</div>';
        return;
    }
    list.forEach(convo => {
        const div = document.createElement('div');
        div.classList.add('message-msg');
        if (convo.unread) div.classList.add('unread');
        div.dataset.id = convo.id;
        const badge = convo.blocked ? `<span style="font-size:10px;color:#ef4444;font-weight:600;margin-left:4px;">BLOCKED</span>` : '';
        div.innerHTML = `
            <div class="msg-avatar">${convo.avatar}</div>
            <div class="message-info">
                <div class="message-info-header"><p>${convo.name}${badge}</p><span class="time">${convo.time}</span></div>
                <span class="preview">${convo.lastMessage}</span>
            </div>`;
        div.addEventListener('click', () => {
            document.querySelectorAll('.message-msg').forEach(m => m.classList.remove('active'));
            div.classList.add('active');
            div.classList.remove('unread');
            convo.unread = false;
            openConversation(convo);
        });
        container.appendChild(div);
    });
}

// ── Update counts ──────────────────────────
function updateCategoryCounts() {
    document.querySelectorAll('.message-sidebar .menu-item').forEach(item => {
        const cat   = item.dataset.category;
        const badge = item.querySelector('.count');
        if (badge && conversationsData[cat]) badge.textContent = conversationsData[cat].length;
    });
}

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadAllCategories();

    document.querySelectorAll('.message-sidebar .menu-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.message-sidebar .menu-item').forEach(i => i.classList.remove('menu-active'));
            item.classList.add('menu-active');
            currentCategory = item.dataset.category;
            document.getElementById('list-title').textContent = item.querySelector('.text').textContent;
            if (conversationsData[currentCategory].length === 0) loadCategory(currentCategory);
            else loadMessages(currentCategory);
            document.getElementById('empty-view').style.display  = 'flex';
            document.getElementById('active-view').style.display = 'none';
        });
    });

    const searchInput = document.getElementById('searchMessages');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.message-msg').forEach(msg => {
                const name    = msg.querySelector('p')?.textContent.toLowerCase() || '';
                const preview = msg.querySelector('.preview')?.textContent.toLowerCase() || '';
                msg.style.display = (name.includes(q) || preview.includes(q)) ? 'grid' : 'none';
            });
        });
    }

    document.querySelectorAll('.chat-footer button[title="Attach file"]').forEach(btn => {
        btn.onclick = () => {
            const inp = document.createElement('input');
            inp.type = 'file'; inp.accept = 'image/*,.pdf,.doc,.docx';
            inp.onchange = e => { const f = e.target.files[0]; if (f) sendAttachment(f); };
            inp.click();
        };
    });

    document.querySelectorAll('.chat-footer button[title="Emoji"]').forEach(btn => {
        btn.onclick = e => { e.stopPropagation(); toggleEmojiPicker(); };
    });

    const activeViewEl = document.getElementById('active-view');
    if (activeViewEl) {
        const picker = document.createElement('div');
        picker.id = 'emoji-picker'; picker.className = 'emoji-picker';
        picker.innerHTML = `<div class="emoji-picker-header"><h4>Emojis</h4><button class="btn-icon" onclick="closeEmojiPicker()" style="width:24px;height:24px;border:none;"><i class="fas fa-times"></i></button></div><div class="emoji-grid">${commonEmojis.map(e => `<div class="emoji-item" onclick="insertEmoji('${e}')">${e}</div>`).join('')}</div>`;
        activeViewEl.appendChild(picker);
    }

    document.addEventListener('click', e => {
        const picker   = document.getElementById('emoji-picker');
        const emojiBtn = document.querySelector('.chat-footer button[title="Emoji"]');
        if (picker && !picker.contains(e.target) && !emojiBtn?.contains(e.target)) closeEmojiPicker();
    });

    const blockBtn = document.getElementById('block-user-btn');
    if (blockBtn) blockBtn.onclick = toggleBlockUser;
});
