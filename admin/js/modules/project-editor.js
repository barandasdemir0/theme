/**
 * Project Editor Script
 * Handles toolbar buttons for the project description editor
 */
document.addEventListener('DOMContentLoaded', function () {
    const toolbar = document.querySelector('#projectForm [style*="flex-wrap"]');
    if (!toolbar) return;

    const editorDiv = document.querySelector('#projectForm [contenteditable="true"]');
    if (!editorDiv) return;

    editorDiv.id = 'projectEditorContent';

    // Highlight.js integration for project editor
    if (typeof hljs !== 'undefined') {
        editorDiv.addEventListener('input', function() {
            // Highlight all code blocks in the editor
            this.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        });
    }

    const buttons = toolbar.querySelectorAll('button.btn');

    buttons.forEach(btn => {
        const title = btn.getAttribute('title') || '';

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            editorDiv.focus();

            // Text formatting
            if (title.includes('Kalın')) document.execCommand('bold');
            else if (title.includes('İtalik')) document.execCommand('italic');
            else if (title.includes('Altı Çizili')) document.execCommand('underline');
            else if (title.includes('Üstü Çizili')) document.execCommand('strikeThrough');

            // Headings
            else if (btn.textContent === 'H1') document.execCommand('formatBlock', false, '<h1>');
            else if (btn.textContent === 'H2') document.execCommand('formatBlock', false, '<h2>');
            else if (btn.textContent === 'H3') document.execCommand('formatBlock', false, '<h3>');

            // Lists
            else if (title.includes('Madde')) document.execCommand('insertUnorderedList');
            else if (title.includes('Numaralı')) document.execCommand('insertOrderedList');
            else if (title.includes('Alıntı')) document.execCommand('insertHTML', false, '<blockquote>Alıntı...</blockquote><p></p>');

            // Links & Media - with modals
            else if (title.includes('Link')) showInputModal('Link URL:', url => url && document.execCommand('createLink', false, url));
            else if (title.includes('Resim')) showInputModal('Resim URL:', url => url && document.execCommand('insertHTML', false, '<img src="' + url + '" style="max-width:100%"><p></p>'));
            else if (title.includes('Video')) showInputModal('Video URL:', url => url && document.execCommand('insertHTML', false, '<iframe src="' + url + '" width="560" height="315" frameborder="0"></iframe><p></p>'));
            else if (title.includes('Kod')) showInputModal('Kod:', code => code && document.execCommand('insertHTML', false, '<pre><code>' + code + '</code></pre><p></p>'));

            // Alignment
            else if (title.includes('Sola')) document.execCommand('justifyLeft');
            else if (title.includes('Ortala')) document.execCommand('justifyCenter');
            else if (title.includes('Sağa')) document.execCommand('justifyRight');
            else if (title.includes('Yana')) document.execCommand('justifyFull');

            // Extras
            else if (title.includes('Tablo')) document.execCommand('insertHTML', false, '<table border="1" style="width:100%;border-collapse:collapse;"><tr><td style="padding:8px;">1</td><td style="padding:8px;">2</td></tr><tr><td style="padding:8px;">3</td><td style="padding:8px;">4</td></tr></table><p></p>');
            else if (title.includes('Yatay')) document.execCommand('insertHTML', false, '<hr><p></p>');
            else if (title.includes('Emoji')) {
                const emojis = ['😀', '👍', '❤️', '🎉', '🚀', '✅', '⭐', '🔥'];
                document.execCommand('insertText', false, emojis[Math.floor(Math.random() * emojis.length)]);
            }

            // Undo/Redo
            else if (title.includes('Geri Al')) document.execCommand('undo');
            else if (title.includes('İleri')) document.execCommand('redo');
        });
    });

    // Color pickers
    toolbar.querySelectorAll('input[type="color"]').forEach((input, i) => {
        input.addEventListener('change', function () {
            editorDiv.focus();
            document.execCommand(i === 0 ? 'foreColor' : 'hiliteColor', false, this.value);
        });
    });

    // Modal helper function
    function showInputModal(label, callback) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>${label.split(':')[0]}</h3>
                    <button class="btn btn-sm btn-outline close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>${label}</label>
                        <input type="text" class="form-control modal-input" value="https://">
                    </div>
                </div>
                <div class="modal-footer" style="display:flex;gap:10px;justify-content:flex-end;padding:15px 20px;border-top:1px solid var(--admin-border);">
                    <button class="btn btn-outline close-modal">İptal</button>
                    <button class="btn btn-primary confirm-modal">Ekle</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const input = modal.querySelector('.modal-input');
        setTimeout(() => input.select(), 100);

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.querySelector('.confirm-modal').addEventListener('click', () => {
            callback(input.value);
            modal.remove();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                callback(input.value);
                modal.remove();
            }
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
});
