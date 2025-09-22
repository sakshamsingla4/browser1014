// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const loginFormEl = document.getElementById('login-form');
const signupFormEl = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout');
const createWebsiteBtn = document.getElementById('create-website');
const domainSearch = document.getElementById('domain-search');
const searchBtn = document.getElementById('search-btn');
const domainSuggestions = document.getElementById('domain-suggestions');
const domainsList = document.getElementById('domains-list');
const currentDomain = document.getElementById('current-domain');
const publishBtn = document.getElementById('publish-btn');
const domainInput = document.getElementById('domain-input');
const visitBtn = document.getElementById('visit-btn');
const siteFrame = document.getElementById('site-frame');
const notFound = document.getElementById('not-found');
const viewSites = document.getElementById('view-sites');

// Data storage
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    initializeEditors();
    loadPageSpecificCode();
});

// Check if user is authenticated
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        currentUser = user;
        if (currentPage === 'index.html') {
            window.location.href = 'dashboard.html';
        }
    } else if (currentPage !== 'index.html' && currentPage !== 'view.html') {
        window.location.href = 'index.html';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Auth related
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (showSignup) showSignup.addEventListener('click', toggleAuthForms);
    if (showLogin) showLogin.addEventListener('click', toggleAuthForms);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Dashboard related
    if (searchBtn) searchBtn.addEventListener('click', searchDomain);
    if (domainSearch) domainSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchDomain();
    });
    
    // Editor related
    if (publishBtn) publishBtn.addEventListener('click', publishWebsite);
    
    // View related
    if (visitBtn) visitBtn.addEventListener('click', visitDomain);
    if (domainInput) domainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') visitDomain();
    });
    
    // Navigation
    if (viewSites) viewSites.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'view.html';
    });
    
    // Tab switching in editor
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Auto-save draft
    if (window.location.pathname.includes('editor.html')) {
        setInterval(saveDraft, 5000);
    }
}

// Toggle between login and signup forms
function toggleAuthForms(e) {
    if (e) e.preventDefault();
    loginFormEl.style.display = loginFormEl.style.display === 'none' ? 'block' : 'none';
    signupFormEl.style.display = signupFormEl.style.display === 'none' ? 'block' : 'none';
}

// Handle user login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email.endsWith('@singla.com') && email !== 'sakshamsingla4.com') {
        showMessage('login-message', 'Only @singla.com emails are allowed', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        showMessage('login-message', 'Invalid email or password', 'error');
    }
}

// Handle user signup
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const email = `${username}@singla.com`;
    
    if (!name || !username || !password) {
        showMessage('signup-message', 'All fields are required', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === email)) {
        showMessage('signup-message', 'Email already exists', 'error');
        return;
    }
    
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('signup-message', 'Account created successfully! Please login.', 'success');
    toggleAuthForms();
}

// Handle user logout
function handleLogout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

// Search for available domains
function searchDomain() {
    const query = domainSearch.value.trim().toLowerCase();
    if (!query) return;
    
    const domains = JSON.parse(localStorage.getItem('domains')) || [];
    const userDomains = domains.filter(d => d.ownerEmail === currentUser.email);
    const isAdmin = currentUser.email === 'sakshamsingla4.com';
    
    // Clear previous suggestions
    domainSuggestions.innerHTML = '';
    
    // Domain extensions
    const extensions = isAdmin ? ['com', 'net', 'org'] : ['scom', 'ssin', 'ssai', 'ssorg', 'snet'];
    
    extensions.forEach(ext => {
        const domainName = `${query}.${ext}`;
        const isAvailable = !domains.some(d => d.domainName === domainName);
        
        const domainEl = document.createElement('div');
        domainEl.className = 'domain-suggestion';
        domainEl.innerHTML = `
            <div class="domain-name">${domainName}</div>
            <div class="domain-status">${isAvailable ? 'Available' : 'Taken'}</div>
        `;
        
        if (isAvailable) {
            domainEl.addEventListener('click', () => registerDomain(domainName));
            domainEl.style.cursor = 'pointer';
        } else {
            domainEl.style.opacity = '0.6';
        }
        
        domainSuggestions.appendChild(domainEl);
    });
}

// Register a new domain
function registerDomain(domainName) {
    const domains = JSON.parse(localStorage.getItem('domains')) || [];
    
    // Check if domain is already taken
    if (domains.some(d => d.domainName === domainName)) {
        alert('This domain is already taken');
        return;
    }
    
    // Create a basic HTML template with the domain name
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>My New Website</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Welcome to ${domainName}</h1>
    <p>This is your new website. Start editing to make it your own!</p>
    <script>
        // Your JavaScript code here
        console.log('Welcome to ${domainName}');
    </script>
</body>
</html>`;

    const newDomain = {
        domainName,
        ownerEmail: currentUser.email,
        html: htmlTemplate,
        css: '',
        js: '',
        createdAt: new Date().toISOString()
    };
    
    domains.push(newDomain);
    localStorage.setItem('domains', JSON.stringify(domains));
    
    // Redirect to editor with the new domain
    window.location.href = `editor.html?domain=${encodeURIComponent(domainName)}`;
}

// Initialize code editors
function initializeEditors() {
    if (typeof CodeMirror === 'undefined') return;
    
    // HTML Editor
    window.htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        extraKeys: { 'Ctrl-Space': 'autocomplete' },
        lineWrapping: true
    });
    
    // CSS Editor
    window.cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {
        mode: 'css',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        extraKeys: { 'Ctrl-Space': 'autocomplete' },
        lineWrapping: true
    });
    
    // JavaScript Editor
    window.jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        extraKeys: { 'Ctrl-Space': 'autocomplete' },
        lineWrapping: true
    });
    
    // Update preview when editors change
    [window.htmlEditor, window.cssEditor, window.jsEditor].forEach(editor => {
        editor.on('change', updatePreview);
    });
}

// Update the preview iframe
function updatePreview() {
    if (!window.htmlEditor) return;
    
    const html = window.htmlEditor.getValue();
    const css = window.cssEditor.getValue();
    const js = window.jsEditor.getValue();
    
    // Create a complete HTML document with the code
    const previewDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${js}</script>
        </body>
        </html>
    `;
    
    // Update the preview iframe
    const preview = document.getElementById('preview');
    if (preview) {
        const doc = preview.contentDocument || preview.contentWindow.document;
        doc.open();
        doc.write(previewDoc);
        doc.close();
    }
}

// Switch between editor tabs
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(`${tabName}-editor`);
    if (tab) tab.classList.add('active');
    
    // Activate selected tab button
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (tabBtn) tabBtn.classList.add('active');
    
    // Update preview if switching to preview tab
    if (tabName === 'preview') {
        updatePreview();
    }
}

// Save the current website
function publishWebsite() {
    const domain = new URLSearchParams(window.location.search).get('domain');
    if (!domain) return;
    
    const domains = JSON.parse(localStorage.getItem('domains')) || [];
    const domainIndex = domains.findIndex(d => d.domainName === domain);
    
    if (domainIndex === -1) {
        alert('Domain not found');
        return;
    }
    
    // Update domain with new content
    domains[domainIndex].html = window.htmlEditor.getValue();
    domains[domainIndex].css = window.cssEditor.getValue();
    domains[domainIndex].js = window.jsEditor.getValue();
    domains[domainIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('domains', JSON.stringify(domains));
    
    // Show success message
    const message = document.createElement('div');
    message.className = 'message success';
    message.textContent = 'Website published successfully!';
    
    const container = document.querySelector('.editor-container');
    container.insertBefore(message, container.firstChild);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Save draft of the current website
function saveDraft() {
    const domain = new URLSearchParams(window.location.search).get('domain');
    if (!domain || !window.htmlEditor) return;
    
    const draft = {
        domain,
        html: window.htmlEditor.getValue(),
        css: window.cssEditor.getValue(),
        js: window.jsEditor.getValue(),
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`draft_${domain}`, JSON.stringify(draft));
}

// Visit a domain
function visitDomain() {
    let domain = domainInput.value.trim().toLowerCase();
    
    // Add .com if no extension is provided
    if (!domain.includes('.')) {
        domain += '.scom';
    }
    
    const domains = JSON.parse(localStorage.getItem('domains')) || [];
    const domainData = domains.find(d => d.domainName === domain);
    
    if (domainData) {
        // Show the iframe and hide not found message
        siteFrame.style.display = 'block';
        if (notFound) notFound.style.display = 'none';
        
        // Create a complete HTML document with the domain's code
        const doc = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${domain}</title>
                <style>${domainData.css || ''}</style>
            </head>
            <body>
                ${domainData.html || ''}
                <script>${domainData.js || ''}</script>
            </body>
            </html>
        `;
        
        // Write the document to the iframe
        const frameDoc = siteFrame.contentDocument || siteFrame.contentWindow.document;
        frameDoc.open();
        frameDoc.write(doc);
        frameDoc.close();
        
        // Update URL without reloading
        history.pushState({}, '', `view.html?domain=${encodeURIComponent(domain)}`);
    } else {
        // Show not found message and hide iframe
        if (notFound) notFound.style.display = 'block';
        siteFrame.style.display = 'none';
    }
}

// Load page-specific code
function loadPageSpecificCode() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Dashboard page
    if (currentPage === 'dashboard.html') {
        loadUserDomains();
        
        // Show admin panel if user is admin
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel && currentUser && currentUser.email === 'sakshamsingla4.com') {
            adminPanel.style.display = 'block';
        }
    }
    // Editor page
    else if (currentPage === 'editor.html') {
        const domain = new URLSearchParams(window.location.search).get('domain');
        if (!domain) {
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Set current domain in the UI
        if (currentDomain) {
            currentDomain.textContent = domain;
        }
        
        // Load domain data
        const domains = JSON.parse(localStorage.getItem('domains')) || [];
        const domainData = domains.find(d => d.domainName === domain);
        
        if (!domainData) {
            alert('Domain not found');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Check if user owns this domain
        if (domainData.ownerEmail !== currentUser.email) {
            alert('You do not have permission to edit this domain');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Load draft if available
        const draft = localStorage.getItem(`draft_${domain}`);
        if (draft) {
            const { html, css, js } = JSON.parse(draft);
            if (window.htmlEditor) window.htmlEditor.setValue(html || domainData.html || '');
            if (window.cssEditor) window.cssEditor.setValue(css || domainData.css || '');
            if (window.jsEditor) window.jsEditor.setValue(js || domainData.js || '');
        } else {
            // Load saved content
            if (window.htmlEditor) window.htmlEditor.setValue(domainData.html || '');
            if (window.cssEditor) window.cssEditor.setValue(domainData.css || '');
            if (window.jsEditor) window.jsEditor.setValue(domainData.js || '');
        }
        
        // Initialize preview
        updatePreview();
    }
    // View page
    else if (currentPage === 'view.html') {
        // Load domain from URL if specified
        const urlParams = new URLSearchParams(window.location.search);
        const domain = urlParams.get('domain');
        
        if (domain) {
            domainInput.value = domain;
            visitDomain();
        }
    }
}

// Load user's domains
function loadUserDomains() {
    if (!currentUser) return;
    
    const domains = JSON.parse(localStorage.getItem('domains')) || [];
    const userDomains = domains.filter(d => d.ownerEmail === currentUser.email);
    
    if (domainsList) {
        if (userDomains.length === 0) {
            domainsList.innerHTML = '<p>You have no domains yet. Search for a domain to get started!</p>';
            return;
        }
        
        domainsList.innerHTML = '<div class="domains-grid"></div>';
        const grid = domainsList.querySelector('.domains-grid');
        
        userDomains.forEach(domain => {
            const domainEl = document.createElement('div');
            domainEl.className = 'domain-card';
            domainEl.innerHTML = `
                <div class="domain-name">${domain.domainName}</div>
                <div class="domain-meta">
                    Created: ${new Date(domain.createdAt).toLocaleDateString()}
                    ${domain.updatedAt ? `<br>Updated: ${new Date(domain.updatedAt).toLocaleDateString()}` : ''}
                </div>
                <div class="domain-actions">
                    <a href="editor.html?domain=${encodeURIComponent(domain.domainName)}" class="btn">Edit</a>
                    <a href="view.html?domain=${encodeURIComponent(domain.domainName)}" class="btn btn-secondary" target="_blank">View</a>
                </div>
            `;
            
            grid.appendChild(domainEl);
        });
    }
}

// Show a message to the user
function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = `message ${type}`;
    
    // Remove message after 5 seconds
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 5000);
}

// Initialize admin user if not exists
function initializeAdminUser() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const adminEmail = 'sakshamsingla4.com';
    
    if (!users.some(u => u.email === adminEmail)) {
        users.push({
            name: 'Admin',
            email: adminEmail,
            password: 'GjPriKZL4',
            isAdmin: true
        });
        
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize the application
initializeAdminUser();
