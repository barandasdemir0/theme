if (window.location.protocol !== 'file:') {
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/htmx.org@1.9.10';
    document.head.appendChild(script);
} else {
    console.log('[HTMX] Not loaded on file:// protocol. SPA features will work on server.');
}
