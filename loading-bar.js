// loading-bar.js
export function setLoadingProgress(percent, text) {
    const bar = document.getElementById('loading-bar');
    const label = document.getElementById('loading-text');
    if (bar) bar.style.width = percent + '%';
    if (label && text) label.textContent = text;
}

export function hideLoadingBar() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}
