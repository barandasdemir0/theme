document.addEventListener('DOMContentLoaded', function () {
    const editor = document.getElementById('editorContent');
    if (!editor) return;

    // Track selected media element - use global for easy access
    window.selectedMediaElement = null;

    // Clear selection
    function clearMediaSelection() {
        if (window.selectedMediaElement) {
            window.selectedMediaElement.classList.remove('media-selected');
            window.selectedMediaElement = null;
            // console.log('✗ Selection cleared');
        }
    }

    // Set media selection
    function selectMedia(element) {
        // Clear previous
        clearMediaSelection();

        // Set new
        window.selectedMediaElement = element;
        element.classList.add('media-selected');

        // console.log('✓ Media SELECTED:', element.tagName, element);
    }

    // Handle mousedown on media (more reliable than click)
    editor.addEventListener('mousedown', function (e) {
        let target = e.target;
        // console.log('Mousedown on:', target.tagName, target);

        // Check if clicking on or near iframe/video
        let mediaElement = null;

        // Direct hit on media
        if (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.tagName === 'IFRAME') {
            mediaElement = target;
            // console.log('→ Direct media hit');
        } else {
            // Check if clicked element CONTAINS media (for DIV/P around iframe)
            const childMedia = target.querySelector('iframe, video, img');
            if (childMedia) {
                mediaElement = childMedia;
                // console.log('→ Found media inside clicked element:', childMedia.tagName);
            } else {
                // Check if we're inside a media wrapper
                const wrapper = target.closest('.media-wrapper');
                if (wrapper) {
                    mediaElement = wrapper.querySelector('iframe, video, img');
                    // console.log('→ Found media in wrapper:', mediaElement ? mediaElement.tagName : 'none');
                }
            }
        }

        if (mediaElement) {
            e.preventDefault();
            e.stopPropagation();
            selectMedia(mediaElement);
        } else {
            // console.log('→ No media found, clearing selection');
            clearMediaSelection();
        }
    }, true);

    // Expose for global access
    window.getSelectedMedia = function () {
        // console.log('→ Getting selected media:', window.selectedMediaElement ? window.selectedMediaElement.tagName : 'NONE');
        return window.selectedMediaElement;
    };

    // Word count and reading time update
    function updateStats() {
        const rawText = editor.textContent || '';
        const text = rawText.replace(/\u00A0/g, ' ').trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        const readTime = wordCount === 0 ? 0 : Math.ceil(wordCount / 200); // 200 kelime/dk

        const wordCountEl = document.getElementById('wordCount');
        const readTimeEl = document.getElementById('readTime');

        if (wordCountEl) wordCountEl.textContent = wordCount;
        if (readTimeEl) readTimeEl.textContent = readTime;
    }

    // Color picker handlers
    const textColorPicker = document.getElementById('textColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const textColorIndicator = document.getElementById('textColorIndicator');

    if (textColorPicker) {
        textColorPicker.addEventListener('change', function () {
            editor.focus();
            document.execCommand('foreColor', false, this.value);
            if (textColorIndicator) textColorIndicator.style.background = this.value;
        });
    }

    if (bgColorPicker) {
        bgColorPicker.addEventListener('change', function () {
            editor.focus();
            document.execCommand('hiliteColor', false, this.value);
        });
    }

    // Update word count on content change
    editor.addEventListener('input', function () {
        updateStats();

        // Auto-highlight code blocks
        if (typeof hljs !== 'undefined') {
            editor.querySelectorAll('pre code').forEach((block) => {
                // Remove old highlighting
                block.className = '';
                // Apply new highlighting
                hljs.highlightElement(block);
            });
        }
    });

    // Keyboard shortcuts
    editor.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b': e.preventDefault(); document.execCommand('bold'); break;
                case 'i': e.preventDefault(); document.execCommand('italic'); break;
                case 'u': e.preventDefault(); document.execCommand('underline'); break;
            }
        }
    });

    // Initial stats update
    updateStats();

    // Clear editor
    const clearBtn = document.querySelector('[data-action="clearEditor"]');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            editor.innerHTML = '';
            clearMediaSelection();
            updateStats();
        });
    }

    // Font size select handler
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', function () {
            editor.focus();
            document.execCommand('fontSize', false, this.value);
            if (typeof currentFontSize !== 'undefined') {
                currentFontSize = parseInt(this.value);
            }
        });
    }

    // Tags input handler
    const tagsInput = document.getElementById('tagsInput');
    if (tagsInput) {
        tagsInput.addEventListener('keydown', function (event) {
            if (typeof addTag === 'function') {
                addTag(event);
            }
        });
    }
});

// Add tag to the tag list on Enter
function addTag(event) {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    const input = event.target;
    const value = input.value.trim();
    if (!value) return;

    const container = input.closest('.tags-input');
    if (!container) return;

    // Skip duplicates (case-insensitive)
    const exists = Array.from(container.querySelectorAll('.tag-item'))
        .some(tag => (tag.dataset.value || '').toLowerCase() === value.toLowerCase());
    if (exists) {
        input.value = '';
        return;
    }

    const tagEl = document.createElement('span');
    tagEl.className = 'tag-item';
    tagEl.dataset.value = value;

    const label = document.createElement('span');
    label.textContent = value;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', 'Etiketi kaldır');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function () {
        tagEl.remove();
    });

    tagEl.append(label, removeBtn);
    container.insertBefore(tagEl, input);
    input.value = '';
}
