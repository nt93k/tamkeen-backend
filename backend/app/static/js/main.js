/**
 * Tamkeen (تمكين) - Main JavaScript
 */

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- Common UI Functions ---
document.addEventListener('DOMContentLoaded', () => {
    // Basic fade-in for main content
    const main = document.querySelector('.main-content');
    if (main) main.classList.add('fade-in');

    // Handle logout button clicks if they are regular links
    const logoutLinks = document.querySelectorAll('a[href="/auth/logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            // If it's a GET request to a route that handles logout, 
            // we don't necessarily need JS, but if we want to handle the response:
            // e.preventDefault();
            // const res = await fetch('/auth/logout', { method: 'POST' });
            // if (res.ok) window.location.href = '/auth/login';
        });
    });
});

// --- Dynamic Form Validation Helpers ---
function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}
