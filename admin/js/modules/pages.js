// ===== GLOBAL VARIABLES & CONFIG VALIDATION =====
const GITHUB_USERNAME = 'baransel-k'; // GitHub kullanıcı adınız
const REPO_NAME = 'my-portfolio'; // Repo adınız
const FILE_PATH = 'data/profile.json'; // JSON dosya yolu
const BRANCH_NAME = 'main'; // Branch adı

// ===== HELPER FUNCTIONS =====
function getEditor() {
    return document.getElementById('editorContent') || document.getElementById('projectEditor') || document.getElementById('projectEditorContent') || document.getElementById('composeEditorContent');
}

// ===== SELECTION SAVING MECHANISM =====
let savedRange = null;

function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        let node = sel.anchorNode;
        const editor1 = document.getElementById('editorContent');
        const editor2 = document.getElementById('projectEditor');
        const editor3 = document.getElementById('projectEditorContent');
        const editor4 = document.getElementById('composeEditorContent');

        let insideEditor = false;
        while (node) {
            if (node === editor1 || node === editor2 || node === editor3 || node === editor4) {
                insideEditor = true;
                break;
            }
            node = node.parentNode;
        }
        if (insideEditor) {
            savedRange = sel.getRangeAt(0);
        }
    }
}

function restoreSelection() {
    const editor = getEditor();
    if (editor) editor.focus();
    if (savedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
    }
}

// ===== GENERIC MODAL HELPER =====
function showEditorModal(title, contentHtml, onConfirm) {
    const existingModal = document.querySelector('.editor-modal-container');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay editor-modal-container active'; // Updated classes
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="admin-modal" style="max-width: 500px; width: 90%;">
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                ${contentHtml}
            </div>
            <div class="modal-footer" style="display:flex;gap:10px;justify-content:flex-end;padding:15px 20px;border-top:1px solid var(--admin-border);">
                <button class="btn btn-outline close-modal">${window.I18N?.common?.cancel || 'İptal'}</button>
                <button class="btn btn-primary confirm-modal">${window.I18N?.common?.add || 'Ekle'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    const confirmBtn = modal.querySelector('.confirm-modal');
    confirmBtn.addEventListener('click', () => {
        restoreSelection();
        if (onConfirm(modal)) {
            closeModal();
            savedRange = null;
        }
    });

    const firstInput = modal.querySelector('input, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

// ===== EDITOR FORMATTING FUNCTIONS =====
function formatText(command) {
    // Special handling for alignment commands on images/videos
    if (command.startsWith('justify')) {
        console.log('━━━ ALIGNMENT COMMAND:', command, '━━━');

        // Get selected media
        let mediaElement = window.selectedMediaElement;
        console.log('→ Direct check:', mediaElement ? mediaElement.tagName : 'NONE');

        if (!mediaElement && typeof window.getSelectedMedia === 'function') {
            mediaElement = window.getSelectedMedia();
            console.log('→ Function check:', mediaElement ? mediaElement.tagName : 'NONE');
        }

        if (mediaElement) {
            console.log('✓ MEDIA FOUND:', mediaElement.tagName);

            // For iframes, find the wrapper div and apply alignment to it
            let targetElement = mediaElement;
            if (mediaElement.tagName === 'IFRAME') {
                // Get the closest wrapper div
                const wrapper = mediaElement.closest('div[style*="position:relative"]');
                if (wrapper) {
                    targetElement = wrapper;
                    console.log('→ Using wrapper DIV instead of iframe');
                }
            }

            // Remove existing alignment classes
            targetElement.classList.remove('align-left', 'align-center', 'align-right');
            console.log('→ Cleared old alignment');

            // Add new alignment class
            let alignClass = '';
            if (command === 'justifyLeft') {
                alignClass = 'align-left';
            } else if (command === 'justifyCenter') {
                alignClass = 'align-center';
            } else if (command === 'justifyRight') {
                alignClass = 'align-right';
            }

            if (alignClass) {
                targetElement.classList.add(alignClass);
                console.log('✓ APPLIED:', alignClass, 'to', targetElement.tagName);
                console.log('→ Element classes:', targetElement.className);
            }

            return; // Don't run execCommand for media
        } else {
            console.log('✗ NO MEDIA - running normal text alignment');
        }
    }

    document.execCommand(command, false, null);
    const editor = getEditor();
    if (editor) editor.focus();
}

function formatBlock(tag) {
    document.execCommand('formatBlock', false, '<' + tag + '>');
    const editor = getEditor();
    if (editor) editor.focus();
}

let currentFontSize = 3;

function increaseFontSize() {
    if (currentFontSize < 7) {
        currentFontSize++;
        document.execCommand('fontSize', false, currentFontSize);
        const sel1 = document.getElementById('fontSizeSelect');
        if (sel1) sel1.value = currentFontSize;
        const sel2 = document.getElementById('projectFontSizeSelect');
        if (sel2) sel2.value = currentFontSize;
    }
}

function decreaseFontSize() {
    if (currentFontSize > 1) {
        currentFontSize--;
        document.execCommand('fontSize', false, currentFontSize);
        const sel1 = document.getElementById('fontSizeSelect');
        if (sel1) sel1.value = currentFontSize;
        const sel2 = document.getElementById('projectFontSizeSelect');
        if (sel2) sel2.value = currentFontSize;
    }
}

function insertQuote() {
    const selection = window.getSelection();
    const text = selection.toString() || 'Alıntı metnini buraya yazın...';
    document.execCommand('insertHTML', false, `<blockquote style="border-left: 4px solid var(--admin-primary); padding-left: 15px; margin: 15px 0; color: var(--admin-text-muted); font-style: italic;">${text}</blockquote><p><br></p>`);
}

function insertLink() {
    const html = `
        <div class="form-group">
            <label>Link Adresi (URL)</label>
            <input type="text" class="form-control" id="modalLinkUrl" placeholder="https://example.com" value="https://">
        </div>
    `;
    showEditorModal(window.I18N?.pages?.addLink || 'Link Ekle', html, (modal) => {
        const url = modal.querySelector('#modalLinkUrl').value;
        if (url) {
            document.execCommand('createLink', false, url);
            return true;
        }
        return false;
    });
}

function insertImage() {
    // Check for static modal first
    const staticModal = document.getElementById('imageModal');
    if (staticModal) {
        staticModal.classList.add('active');
        const urlInput = document.getElementById('imageUrlInput');
        if (urlInput) {
            urlInput.value = '';
            urlInput.focus();
        }
        return;
    }

    // Fallback to dynamic modal
    const html = `
        <div class="image-upload-area" style="border: 2px dashed var(--admin-border); border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--admin-text-muted); margin-bottom: 10px;"></i>
            <p style="margin: 0;">Görsel URL'si girin</p>
        </div>
        <div class="form-group">
            <input type="text" class="form-control" id="modalImageUrl" placeholder="https://example.com/image.jpg">
        </div>
        <div class="form-group" style="margin-top:15px;">
            <label>Görsel Boyutu</label>
            <select class="form-control" id="modalImageSize" style="background:var(--admin-bg); color:var(--admin-text); border:1px solid var(--admin-border);">
                <option value="100%">Tam Genişlik (%100)</option>
                <option value="75%">Büyük (%75)</option>
                <option value="50%" selected>Orta (%50)</option>
                <option value="25%">Küçük (%25)</option>
            </select>
        </div>
    `;

    showEditorModal(window.I18N?.pages?.addImage || 'Resim Ekle', html, (modal) => {
        const url = modal.querySelector('#modalImageUrl').value;
        const size = modal.querySelector('#modalImageSize').value;

        if (url) {
            const imgHtml = `<img src="${url}" style="display:block; width:${size}; max-width:100%; height:auto; margin: 20px auto; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.2);">`;
            document.execCommand('insertHTML', false, imgHtml + '<p><br></p>');
            return true;
        }
        return false;
    });
}

function insertVideo() {
    const html = `
        <div class="form-group">
            <label>Video URL</label>
            <input type="text" class="form-control" id="modalVideoUrl" placeholder="YouTube, Dailymotion, Vimeo...">
        </div>
        <div class="form-group" style="margin-top:15px;">
            <label>Video Boyutu</label>
            <select class="form-control" id="modalVideoSize" style="background:var(--admin-bg); color:var(--admin-text); border:1px solid var(--admin-border);">
                <option value="100%">Tam Genişlik (%100)</option>
                <option value="75%">Büyük (%75)</option>
                <option value="50%" selected>Orta (%50)</option>
                <option value="25%">Küçük (%25)</option>
            </select>
        </div>
        <p style="font-size:0.85rem; color:var(--admin-text-muted); margin-top:5px;">Desteklenenler: YouTube, Dailymotion, Vimeo</p>
    `;

    showEditorModal(window.I18N?.pages?.addVideo || 'Video Ekle', html, (modal) => {
        const url = modal.querySelector('#modalVideoUrl').value;
        const size = modal.querySelector('#modalVideoSize').value;

        if (url) {
            let embedUrl = url;

            if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
                const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('youtu.be/')[1]?.split('?')[0];
                if (videoId) embedUrl = 'https://www.youtube.com/embed/' + videoId;
            } else if (url.includes('dailymotion.com/video/')) {
                const videoId = url.split('/video/')[1]?.split('?')[0];
                if (videoId) embedUrl = 'https://www.dailymotion.com/embed/video/' + videoId;
            } else if (url.includes('vimeo.com/')) {
                const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                const match = videoId.match(/\d+/);
                if (match) embedUrl = 'https://player.vimeo.com/video/' + match[0];
            }

            const videoHtml = `
            <div style="width: ${size}; margin: 25px auto; position: relative; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <iframe src="${embedUrl}" style="width: 100%; height: 400px; border: 0;" allowfullscreen></iframe>
            </div><p><br></p>`;

            document.execCommand('insertHTML', false, videoHtml);
            return true;
        }
        return false;
    });
}

function insertCode() {
    const html = `
        <div class="form-group" style="margin-bottom: 15px;">
            <label>Kodunuz</label>
            <textarea class="form-control" id="modalCodeInput" rows="10" placeholder="${window.I18N?.pages?.pasteCode || 'Kodunuzu buraya yapıştırın...'}" style="font-family: 'Fira Code', monospace; font-size: 0.9rem; background: var(--admin-bg); color: var(--admin-text); border: 1px solid var(--admin-border);"></textarea>
        </div>
    `;

    showEditorModal(window.I18N?.pages?.addCode || 'Kod Bloğu Ekle', html, (modal) => {
        const code = modal.querySelector('#modalCodeInput').value;
        if (code) {
            const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            const codeBlock = `<pre style="background:#1e293b; color:#e2e8f0; padding:15px; border-radius:8px; overflow-x:auto; font-family:'Fira Code','Consolas',monospace; font-size:0.9rem; margin:15px 0;"><code>${escaped}</code></pre><p><br></p>`;
            document.execCommand('insertHTML', false, codeBlock);

            // Highlight the newly added code block with Highlight.js
            if (typeof hljs !== 'undefined') {
                setTimeout(() => {
                    const editor = getEditor();
                    if (editor) {
                        editor.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block);
                        });
                    }
                }, 50);
            }

            return true;
        }
        return false;
    });
}

function insertTable() {
    document.execCommand('insertHTML', false, `<table style="width:100%;border-collapse:collapse;margin:15px 0;border:1px solid var(--admin-border);">
        <tr style="background:var(--admin-card);">
            <th style="border:1px solid var(--admin-border);padding:10px;">Başlık 1</th>
            <th style="border:1px solid var(--admin-border);padding:10px;">Başlık 2</th>
        </tr>
        <tr>
            <td style="border:1px solid var(--admin-border);padding:10px;">İçerik 1</td>
            <td style="border:1px solid var(--admin-border);padding:10px;">İçerik 2</td>
        </tr>
    </table><p><br></p>`);
}

function insertHR() {
    document.execCommand('insertHorizontalRule', false, null);
}

function insertEmoji() {
    const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '👍', '👎', '👏', '🙌', '🤝', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💯', '✅', '❌', '⭐', '🌟', '💫', '✨', '🔥', '💥', '💢', '💦', '💨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚡', '☀️', '🌙', '⭐', '🚀', '💻', '📱', '💡', '📝', '📚', '🔧', '⚙️', '🔒', '🔓'];

    const html = `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 300px; overflow-y: auto; justify-content: center;">
            ${emojis.map(e => `<button type="button" class="emoji-btn" style="font-size: 1.8rem; padding: 5px; border: none; background: transparent; cursor: pointer; border-radius: 4px;">${e}</button>`).join('')}
        </div>
    `;
    showEditorModal(window.I18N?.pages?.selectEmoji || 'Emoji Seç', html, () => false);

    const modal = document.querySelector('.editor-modal-container');
    if (modal) {
        modal.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.onclick = () => {
                restoreSelection();
                document.execCommand('insertText', false, btn.innerText);
                modal.remove();
            };
        });
        const confirmBtn = modal.querySelector('.confirm-modal');
        if (confirmBtn) confirmBtn.style.display = 'none';
    }
}

function uploadFeaturedImage() {
    const html = `
        <div class="image-upload-area" style="border: 2px dashed var(--admin-border); border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--admin-text-muted); margin-bottom: 10px;"></i>
            <p style="margin: 0;">Kapak Görseli URL</p>
        </div>
        <div class="form-group">
            <input type="text" class="form-control" id="modalFeaturedUrl" placeholder="https://example.com/cover.jpg">
        </div>
    `;

    showEditorModal(window.I18N?.pages?.coverImage || 'Kapak Görseli', html, (modal) => {
        const url = modal.querySelector('#modalFeaturedUrl').value;
        if (url) {
            const div = document.querySelector('.featured-image-upload');
            if (div) {
                div.innerHTML = `<div style="position:relative;width:100%;height:100%;"><img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"><button style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:25px;height:25px;cursor:pointer;" onclick="this.closest('.featured-image-upload').innerHTML='<i class=\\'fas fa-cloud-upload-alt\\'></i><span>Görsel yükle</span>'; this.closest('.featured-image-upload').style.padding=''; this.closest('.featured-image-upload').style.border='';">×</button></div>`;
                div.style.border = 'none';
                div.style.padding = '0';
                div.style.height = '180px';
            }
            const projInput = document.querySelector('input[placeholder*="Görsel URL"]');
            if (projInput) projInput.value = url;
            return true;
        }
        return false;
    });
}

function clearEditor() {
    const html = `<p>${window.I18N?.pages?.clearConfirm || 'Editördeki tüm içeriği silmek istediğinize emin misiniz?'}</p>`;
    showEditorModal(window.I18N?.pages?.clear || 'Temizle', html, () => {
        const editor = getEditor();
        if (editor) editor.innerHTML = '';
        return true;
    });
    const modal = document.querySelector('.editor-modal-container');
    const btn = modal.querySelector('.confirm-modal');
    if (btn) {
        btn.innerText = window.I18N?.common?.yesDelete || "Evet, Sil";
        btn.className = "btn btn-danger confirm-modal";
    }
}

function switchTab(tab) {
    const tabs = document.querySelectorAll('.editor-tab');
    const editorContent = document.getElementById('editorContent');
    const previewContent = document.getElementById('previewContent');

    if (tabs.length && editorContent && previewContent) {
        tabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`[data-tab="${tab}"]`);
        if (activeTab) activeTab.classList.add('active');

        if (tab === 'edit') {
            editorContent.style.display = 'block';
            previewContent.style.display = 'none';
        } else {
            editorContent.style.display = 'none';
            previewContent.style.display = 'block';
            previewContent.innerHTML = editorContent.innerHTML;
        }
    }
}

function removeTag(btn) { if (btn) btn.parentElement.remove(); }
function addProjectTag(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const input = e.target;
        const val = input.value.trim().replace(/,/g, '');
        if (val) {
            const tag = document.createElement('span');
            tag.style.cssText = "background: var(--admin-primary); color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;";
            tag.innerHTML = `${val} <i class="fas fa-times" style="cursor:pointer; opacity: 0.8;" onclick="this.parentElement.remove()"></i>`;
            input.parentElement.insertBefore(tag, input);
            input.value = '';
        }
    }
}
function savePost() { const btn = document.querySelector('[data-action="savePost"]'); if (btn) { const o = btn.innerHTML; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; setTimeout(() => { btn.innerHTML = o; console.log('Kaydedildi'); }, 800); } }
function previewPost() { switchTab('preview'); }
function previewProject() { const editor = document.getElementById('projectEditor'); if (editor) { const w = window.open('', '_blank'); w.document.write(`<html><body style="background:#111;color:#fff;padding:40px;font-family:sans-serif;">${editor.innerHTML}</body></html>`); } }
function showCategoryForm() { document.getElementById('categoryForm').style.display = 'block'; document.querySelector('.card:first-child').style.display = 'none'; }
function showAddForm() { const f = document.getElementById('projectForm'); if (f) { f.style.display = 'block'; document.querySelectorAll('.card').forEach(c => { if (c !== f) c.style.display = 'none' }); } }
function hideForm() { document.querySelectorAll('.card').forEach(f => { if (f.querySelector('form')) f.style.display = 'none'; else f.style.display = 'block'; }); }
function moveRowUp() { } function moveRowDown() { } function editRow() { }

// ===== ACTION HANDLERS =====
const actionHandlers = {
    'formatText': (e, el) => formatText(el.dataset.command),
    'formatBlock': (e, el) => formatBlock(el.dataset.block),
    'increaseFontSize': increaseFontSize,
    'decreaseFontSize': decreaseFontSize,
    'insertQuote': insertQuote,
    'insertLink': insertLink,
    'insertImage': insertImage,
    'closeImageModal': () => {
        const modal = document.getElementById('imageModal');
        if (modal) modal.classList.remove('active');
    },
    'confirmImageInsert': () => {
        const modal = document.getElementById('imageModal');
        const urlInput = document.getElementById('imageUrlInput');
        const sizeInput = document.getElementById('imageSizeInput');

        if (urlInput && urlInput.value) {
            const size = sizeInput ? sizeInput.value : '100%';
            const imgHtml = `<img src="${urlInput.value}" style="display:block; width:${size}; max-width:100%; height:auto; margin: 20px auto; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.2);">`;

            restoreSelection(); // Restore selection before inserting
            document.execCommand('insertHTML', false, imgHtml + '<p><br></p>');

            if (modal) modal.classList.remove('active');
            urlInput.value = ''; // Reset
        } else {
            if (window.adminApp && window.adminApp.notifications) {
                window.adminApp.notifications.showToast('Hata', window.I18N?.pages?.enterImgUrl || 'Lütfen bir resim URL\'si girin.', 'error');
            } else {
                alert(window.I18N?.pages?.enterImgUrl || 'Lütfen bir resim URL\'si girin.');
            }
        }
    },
    'insertVideo': insertVideo,
    'insertCode': insertCode,
    'insertTable': insertTable,
    'insertHR': insertHR,
    'insertEmoji': insertEmoji,
    'switchTab': (e, el) => switchTab(el.dataset.tab),
    'clearEditor': clearEditor,
    'removeTag': (e, el) => removeTag(el),
    'savePost': savePost,
    'previewPost': previewPost,
    'uploadFeaturedImage': uploadFeaturedImage,
    'previewProject': previewProject,
    'showCategoryForm': (e, el) => showCategoryForm(),
    'showAddForm': (e, el) => showAddForm(),
    'hideForm': hideForm
};

// ===== EDITOR UX =====
function initEditorUX() {
    const editors = [document.getElementById('editorContent'), document.getElementById('projectEditor'), document.getElementById('composeEditorContent')];
    let lastEnterTime = 0;
    editors.forEach(editor => {
        if (!editor) return;
        editor.addEventListener('blur', function () { saveSelection(); });
        editor.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const now = Date.now();
                if (now - lastEnterTime < 500) {
                    const sel = window.getSelection();
                    if (sel.rangeCount) {
                        const block = sel.anchorNode.parentElement.closest('pre, blockquote');
                        if (block) {
                            e.preventDefault();
                            const p = document.createElement('p'); p.innerHTML = '<br>';
                            if (block.nextSibling) block.parentNode.insertBefore(p, block.nextSibling); else block.parentNode.appendChild(p);
                            const r = document.createRange(); r.setStart(p, 0); r.collapse(true);
                            sel.removeAllRanges(); sel.addRange(r);
                        }
                    }
                }
                lastEnterTime = now;
            }
            if (e.ctrlKey || e.metaKey) {
                const k = e.key.toLowerCase();
                if (k === 'b') { e.preventDefault(); document.execCommand('bold'); }
                if (k === 'i') { e.preventDefault(); document.execCommand('italic'); }
                if (k === 'u') { e.preventDefault(); document.execCommand('underline'); }
                if (k === 'z') { e.preventDefault(); document.execCommand('undo'); }
                if (k === 'y') { e.preventDefault(); document.execCommand('redo'); }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initEditorUX();
    document.body.addEventListener('click', function (e) {
        const actionEl = e.target.closest('[data-action]');
        if (actionEl) {
            const action = actionEl.dataset.action;
            if (actionHandlers[action]) {
                e.preventDefault();
                actionHandlers[action](e, actionEl);
            }
        }
    });

    const fs1 = document.getElementById('fontSizeSelect');
    if (fs1) fs1.addEventListener('change', function () { document.execCommand('fontSize', false, this.value); currentFontSize = parseInt(this.value); });
    const fs2 = document.getElementById('projectFontSizeSelect');
    if (fs2) fs2.addEventListener('change', function () { document.execCommand('fontSize', false, this.value); currentFontSize = parseInt(this.value); });

    // Colors
    const tc = document.getElementById('textColorPicker') || document.getElementById('projectTextColorPicker') || document.getElementById('composeTextColorPicker');
    if (tc) {
        tc.addEventListener('change', function () { restoreSelection(); document.execCommand('foreColor', false, this.value); const i1 = document.getElementById('textColorIndicator'); if (i1) i1.style.background = this.value; const i2 = document.getElementById('projectTextColorIndicator'); if (i2) i2.style.background = this.value; const i3 = document.getElementById('composeTextColorIndicator'); if (i3) i3.style.background = this.value; });
    }
    const bg = document.getElementById('bgColorPicker') || document.getElementById('projectBgColorPicker') || document.getElementById('composeBgColorPicker');
    if (bg) {
        bg.addEventListener('change', function () { restoreSelection(); document.execCommand('hiliteColor', false, this.value); });
    }
});
