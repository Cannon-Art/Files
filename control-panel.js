// Control Panel JavaScript
// This file handles all the logic for the gallery management control panel

// ============================================================================
// PASSWORD PROTECTION
// ============================================================================

// Password hash (SHA-256 hash of the password)
// To change the password:
// 1. Go to https://emn178.github.io/online-tools/sha256.html
// 2. Enter your new password
// 3. Copy the hash
// 4. Replace the value below with the new hash
// 
// IMPORTANT: Choose a strong password! Examples of good passwords:
// - Mix of uppercase, lowercase, numbers, and symbols
// - At least 12 characters long
// - Not dictionary words or personal information
//
// Default password hash (initial password)
const DEFAULT_PASSWORD_HASH = '751d3802f3db8cd910f2a6cacbbf1faf820b218cb8c3c0dd6a06188ce737c5c2'; // Password: &Can1989non

// Get current password hash (checks localStorage first, then falls back to default)
function getPasswordHash() {
    const storedHash = localStorage.getItem('controlPanelPasswordHash');
    return storedHash || DEFAULT_PASSWORD_HASH;
}

// Set new password hash
function setPasswordHash(hash) {
    localStorage.setItem('controlPanelPasswordHash', hash);
}

// Simple SHA-256 hashing function (client-side)
async function sha256(message) {
    try {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (error) {
        console.error('Error hashing password:', error);
        // Fallback: crypto.subtle requires HTTPS, but we can use a simple hash as fallback
        // For now, throw error to alert user
        throw new Error('Password hashing failed. Please ensure you are using HTTPS.');
    }
}

// Check password on login
async function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');
    const loginForm = document.getElementById('loginForm');
    const controlPanel = document.getElementById('controlPanel');
    
    const password = passwordInput.value.trim(); // Trim whitespace
    if (!password) {
        loginError.textContent = 'Please enter a password';
        loginError.classList.remove('hidden');
        return;
    }
    
    // Hash the entered password and compare
    let hash;
    try {
        hash = await sha256(password);
    } catch (error) {
        loginError.textContent = 'Error: ' + error.message + ' Please ensure you are accessing via HTTPS.';
        loginError.classList.remove('hidden');
        return;
    }
    
    // Get current password hash
    const currentPasswordHash = getPasswordHash();
    
    // Debug logging (check browser console)
    console.log('Entered password:', password);
    console.log('Entered password hash:', hash);
    console.log('Expected hash:', currentPasswordHash);
    console.log('Hashes match:', hash === currentPasswordHash);
    
    if (hash === currentPasswordHash) {
        // Check if using default password - prompt to change
        if (hash === DEFAULT_PASSWORD_HASH) {
            // Using default password - prompt to change
            showPasswordChangePrompt();
            return;
        }
        
        // Correct password - show control panel
        loginForm.classList.add('hidden');
        controlPanel.classList.remove('hidden');
        
        // Load gallery data
        loadGalleryData();
    } else {
        // Incorrect password
        loginError.textContent = 'Incorrect password. Access denied.';
        loginError.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Show password change prompt
function showPasswordChangePrompt() {
    const loginForm = document.getElementById('loginForm');
    const passwordChangeModal = document.getElementById('passwordChangeModal');
    
    if (passwordChangeModal) {
        passwordChangeModal.classList.remove('hidden');
        document.getElementById('newPasswordInput').focus();
    }
}

// Handle password change
async function changePassword() {
    const newPasswordInput = document.getElementById('newPasswordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const passwordChangeError = document.getElementById('passwordChangeError');
    const passwordChangeModal = document.getElementById('passwordChangeModal');
    const loginForm = document.getElementById('loginForm');
    const controlPanel = document.getElementById('controlPanel');
    
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    // Clear previous errors
    passwordChangeError.textContent = '';
    passwordChangeError.classList.add('hidden');
    
    // Validate
    if (!newPassword) {
        passwordChangeError.textContent = 'Please enter a new password';
        passwordChangeError.classList.remove('hidden');
        return;
    }
    
    if (newPassword.length < 8) {
        passwordChangeError.textContent = 'Password must be at least 8 characters long';
        passwordChangeError.classList.remove('hidden');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        passwordChangeError.textContent = 'Passwords do not match';
        passwordChangeError.classList.remove('hidden');
        return;
    }
    
    try {
        // Hash new password
        const newHash = await sha256(newPassword);
        
        // Save new password hash
        setPasswordHash(newHash);
        
        // Hide modal and show control panel
        passwordChangeModal.classList.add('hidden');
        loginForm.classList.add('hidden');
        controlPanel.classList.remove('hidden');
        
        // Clear password fields
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        
        // Load gallery data
        loadGalleryData();
        
        // Show success message
        alert('Password changed successfully! Your new password is now active.');
    } catch (error) {
        passwordChangeError.textContent = 'Error: ' + error.message;
        passwordChangeError.classList.remove('hidden');
    }
}

// Cancel password change (use default password)
function cancelPasswordChange() {
    const passwordChangeModal = document.getElementById('passwordChangeModal');
    const loginForm = document.getElementById('loginForm');
    const controlPanel = document.getElementById('controlPanel');
    
    passwordChangeModal.classList.add('hidden');
    loginForm.classList.add('hidden');
    controlPanel.classList.remove('hidden');
    
    // Load gallery data
    loadGalleryData();
}

// Allow Enter key to submit login form
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
});

// ============================================================================
// GALLERY DATA MANAGEMENT
// ============================================================================

let galleryData = {
    sections: {
        'dc-characters': [],
        'marvel-characters': [],
        'music-legends': [],
        'recovery-art': [],
        'miscellaneous': []
    }
};

let currentSectionFilter = 'all';

// Load gallery data from JSON file
async function loadGalleryData() {
    try {
        const response = await fetch('gallery-data.json');
        if (!response.ok) {
            throw new Error('Failed to load gallery data');
        }
        galleryData = await response.json();
        
        // Ensure all sections exist
        if (!galleryData.sections) {
            galleryData.sections = {
                'dc-characters': [],
                'marvel-characters': [],
                'music-legends': [],
                'recovery-art': [],
                'miscellaneous': []
            };
        }
        
        // Render the pictures list
        renderPicturesList();
        
        // Update JSON export
        updateJSONExport();
        
        // Setup file upload handler
        setupFileUpload();
        
        // Load and display GitHub token status
        loadGitHubTokenStatus();
    } catch (error) {
        console.error('Error loading gallery data:', error);
        alert('Error loading gallery data. Please ensure gallery-data.json exists.');
    }
}

// Load GitHub token from localStorage and display status
function loadGitHubTokenStatus() {
    const token = getGitHubToken();
    const tokenInput = document.getElementById('githubToken');
    const tokenStatusText = document.getElementById('tokenStatusText');
    const saveToGitHubBtn = document.getElementById('saveToGitHubBtn');
    const imageUrlRequired = document.getElementById('imageUrlRequired');
    
    if (token) {
        // Show masked token in input (first 8 chars + ...)
        tokenInput.value = token.substring(0, 8) + '...';
        tokenStatusText.textContent = 'Configured ✓';
        tokenStatusText.parentElement.style.backgroundColor = '#d4edda';
        tokenStatusText.parentElement.style.color = '#155724';
        saveToGitHubBtn.style.display = 'inline-block';
    } else {
        tokenInput.value = '';
        tokenStatusText.textContent = 'Not configured';
        tokenStatusText.parentElement.style.backgroundColor = '#f8d7da';
        tokenStatusText.parentElement.style.color = '#721c24';
        saveToGitHubBtn.style.display = 'none';
    }
}

// Save GitHub token
function saveGitHubToken() {
    const tokenInput = document.getElementById('githubToken');
    const tokenMessage = document.getElementById('tokenMessage');
    const token = tokenInput.value.trim();
    
    if (!token) {
        tokenMessage.innerHTML = '<div class="error-message">Please enter a GitHub token</div>';
        return;
    }
    
    // Basic validation (GitHub tokens are typically 40+ characters)
    if (token.length < 20) {
        tokenMessage.innerHTML = '<div class="error-message">Token appears to be invalid. GitHub tokens are typically longer.</div>';
        return;
    }
    
    if (setGitHubToken(token)) {
        tokenMessage.innerHTML = '<div class="success-message">Token saved successfully!</div>';
        loadGitHubTokenStatus();
        setTimeout(() => {
            tokenMessage.innerHTML = '';
        }, 3000);
    } else {
        tokenMessage.innerHTML = '<div class="error-message">Failed to save token</div>';
    }
}

// Clear GitHub token
function clearGitHubToken() {
    if (confirm('Are you sure you want to clear the GitHub token? You will need to enter it again to upload files.')) {
        localStorage.removeItem('github_token');
        loadGitHubTokenStatus();
        document.getElementById('tokenMessage').innerHTML = '<div class="success-message">Token cleared</div>';
    }
}

// Generate unique ID for new pictures
function generateId(section) {
    const sectionPrefix = {
        'dc-characters': 'dc',
        'marvel-characters': 'marvel',
        'music-legends': 'music',
        'recovery-art': 'recovery',
        'miscellaneous': 'misc'
    }[section] || 'pic';
    
    const existingIds = galleryData.sections[section].map(p => p.id);
    let counter = 1;
    let newId;
    do {
        newId = `${sectionPrefix}-${String(counter).padStart(3, '0')}`;
        counter++;
    } while (existingIds.includes(newId));
    
    return newId;
}

// ============================================================================
// GITHUB API CONFIGURATION
// ============================================================================

// GitHub repository configuration
const GITHUB_CONFIG = {
    owner: 'Cannon-Art',
    repo: 'Files',
    branch: 'main',
    imagePath: 'Art_Examples', // Folder where images are stored
    dataFile: 'gallery-data.json' // JSON data file
};

// Get GitHub token from localStorage (set once by admin)
function getGitHubToken() {
    return localStorage.getItem('github_token');
}

// Set GitHub token (called from settings)
function setGitHubToken(token) {
    if (token) {
        localStorage.setItem('github_token', token);
        return true;
    }
    return false;
}

// Check if GitHub token is configured
function hasGitHubToken() {
    return !!getGitHubToken();
}

// ============================================================================
// GITHUB API FUNCTIONS
// ============================================================================

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Upload file to GitHub using REST API
async function uploadFileToGitHub(file, filename) {
    const token = getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not configured. Please set it in Settings.');
    }

    // Convert file to base64
    const content = await fileToBase64(file);
    
    // GitHub API endpoint for creating/updating a file
    const path = `${GITHUB_CONFIG.imagePath}/${filename}`;
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;
    
    // Check if file exists (to get SHA for update)
    let sha = null;
    try {
        const checkResponse = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            sha = existingFile.sha;
        }
    } catch (e) {
        // File doesn't exist, will create new
    }

    // Create or update file
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Upload image: ${filename}`,
            content: content,
            branch: GITHUB_CONFIG.branch,
            ...(sha && { sha: sha }) // Include SHA if updating existing file
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file to GitHub');
    }

    const result = await response.json();
    
    // Return the raw GitHub URL
    return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${path}`;
}

// Update gallery-data.json on GitHub
async function updateGalleryDataOnGitHub(jsonData) {
    const token = getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not configured.');
    }

    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`;
    
    // Get current file to get SHA
    let sha = null;
    try {
        const checkResponse = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            sha = existingFile.sha;
        }
    } catch (e) {
        throw new Error('Could not read existing gallery-data.json from GitHub');
    }

    // Convert JSON to base64
    const content = btoa(JSON.stringify(jsonData, null, 2));
    
    // Update file
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update gallery data',
            content: content,
            branch: GITHUB_CONFIG.branch,
            sha: sha
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update gallery-data.json');
    }

    return true;
}

// ============================================================================
// ADD NEW PICTURE
// ============================================================================

// Setup file upload handler
function setupFileUpload() {
    const fileInput = document.getElementById('imageFile');
    const fileName = document.getElementById('fileName');
    const imageUrlInput = document.getElementById('imageUrl');
    const imageUrlRequired = document.getElementById('imageUrlRequired');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = `Selected: ${file.name}`;
            // Auto-fill image URL field with expected path (will be updated after upload)
            const sanitizedName = document.getElementById('pictureName').value.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'image';
            const fileExtension = file.name.split('.').pop();
            const expectedFilename = `${sanitizedName}.${fileExtension}`;
            imageUrlInput.value = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.imagePath}/${expectedFilename}`;
            
            // Make image URL field optional when file is selected
            imageUrlInput.required = false;
            if (imageUrlRequired) imageUrlRequired.textContent = '';
        } else {
            // Make image URL required again if no file selected
            imageUrlInput.required = true;
            if (imageUrlRequired) imageUrlRequired.textContent = '*';
        }
    });
    
    // Update URL when picture name changes (if file is selected)
    const pictureNameInput = document.getElementById('pictureName');
    if (pictureNameInput) {
        pictureNameInput.addEventListener('input', function() {
            if (fileInput.files[0]) {
                const sanitizedName = this.value.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'image';
                const fileExtension = fileInput.files[0].name.split('.').pop();
                const expectedFilename = `${sanitizedName}.${fileExtension}`;
                imageUrlInput.value = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.imagePath}/${expectedFilename}`;
            }
        });
    }
}

// Add a new picture to the gallery (with optional file upload)
async function addPicture() {
    const fileInput = document.getElementById('imageFile');
    const name = document.getElementById('pictureName').value.trim();
    const section = document.getElementById('pictureSection').value;
    const medium = document.getElementById('pictureMedium').value;
    let imageUrl = document.getElementById('imageUrl').value.trim();
    const year = document.getElementById('pictureYear').value.trim();
    const notes = document.getElementById('pictureNotes').value.trim();
    const messageDiv = document.getElementById('addPictureMessage');
    
    // Validation
    if (!name || !section || !medium) {
        messageDiv.innerHTML = '<div class="error-message">Please fill in all required fields (marked with *)</div>';
        return;
    }
    
    // Check if file is selected and upload it
    const file = fileInput.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            messageDiv.innerHTML = '<div class="error-message">Please select a valid image file</div>';
            return;
        }
        
        // Check if GitHub token is configured
        if (!hasGitHubToken()) {
            messageDiv.innerHTML = '<div class="error-message">GitHub token not configured. Please set it in Settings below before uploading images.</div>';
            return;
        }
        
        // Show uploading message
        messageDiv.innerHTML = '<div style="color: #169B62; padding: 0.75rem; background-color: #d4edda; border-radius: 4px;">Uploading image to GitHub... Please wait.</div>';
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        try {
            // Sanitize filename (remove special characters, keep extension)
            const fileExtension = file.name.split('.').pop();
            const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const filename = `${sanitizedName}.${fileExtension}`;
            
            // Upload file to GitHub
            imageUrl = await uploadFileToGitHub(file, filename);
            
            // Update the image URL field
            document.getElementById('imageUrl').value = imageUrl;
            
        } catch (error) {
            messageDiv.innerHTML = `<div class="error-message">Error uploading image: ${error.message}</div>`;
            return;
        }
    } else if (!imageUrl) {
        messageDiv.innerHTML = '<div class="error-message">Please either select an image file to upload, or provide an Image URL</div>';
        return;
    }
    
    // Create new picture object
    const newPicture = {
        id: generateId(section),
        name: name,
        imageUrl: imageUrl,
        medium: medium,
        notes: notes || '',
        year: year || ''
    };
    
    // Add to gallery data
    if (!galleryData.sections[section]) {
        galleryData.sections[section] = [];
    }
    galleryData.sections[section].push(newPicture);
    
    // Try to update gallery-data.json on GitHub (if token is configured)
    if (hasGitHubToken()) {
        try {
            messageDiv.innerHTML = '<div style="color: #169B62; padding: 0.75rem; background-color: #d4edda; border-radius: 4px;">Updating gallery-data.json on GitHub... Please wait.</div>';
            await updateGalleryDataOnGitHub(galleryData);
            messageDiv.innerHTML = '<div class="success-message">Picture added and gallery-data.json updated on GitHub successfully!</div>';
        } catch (error) {
            messageDiv.innerHTML = `<div class="error-message">Picture added locally, but failed to update GitHub: ${error.message}. Please copy the JSON below and commit manually.</div>`;
        }
    } else {
        messageDiv.innerHTML = '<div class="success-message">Picture added successfully! Please copy the JSON below and commit it to GitHub manually.</div>';
    }
    
    // Clear form
    document.getElementById('addPictureForm').reset();
    document.getElementById('fileName').textContent = '';
    
    // Update display
    renderPicturesList();
    updateJSONExport();
    
    // Scroll to the new picture
    setTimeout(() => {
        const newPictureElement = document.querySelector(`[data-picture-id="${newPicture.id}"]`);
        if (newPictureElement) {
            newPictureElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newPictureElement.classList.add('editing');
            setTimeout(() => {
                newPictureElement.classList.remove('editing');
            }, 2000);
        }
    }, 100);
}

// ============================================================================
// EDIT EXISTING PICTURES
// ============================================================================

// Render the list of pictures
function renderPicturesList() {
    const picturesList = document.getElementById('picturesList');
    picturesList.innerHTML = '';
    
    // Get sections to display based on filter
    const sectionsToShow = currentSectionFilter === 'all' 
        ? Object.keys(galleryData.sections)
        : [currentSectionFilter];
    
    sectionsToShow.forEach(sectionKey => {
        const sectionName = {
            'dc-characters': 'DC Characters',
            'marvel-characters': 'Marvel Characters',
            'music-legends': 'Music Legends',
            'recovery-art': 'Recovery Art',
            'miscellaneous': 'Miscellaneous'
        }[sectionKey] || sectionKey;
        
        const pictures = galleryData.sections[sectionKey] || [];
        
        if (pictures.length === 0 && currentSectionFilter !== 'all') {
            picturesList.innerHTML += `<p style="color: #666; padding: 2rem; text-align: center;">No pictures in ${sectionName} section yet.</p>`;
            return;
        }
        
        pictures.forEach(picture => {
            const pictureItem = document.createElement('div');
            pictureItem.className = 'picture-item';
            pictureItem.setAttribute('data-picture-id', picture.id);
            pictureItem.setAttribute('data-section', sectionKey);
            
            pictureItem.innerHTML = `
                <div class="picture-header">
                    <h3 style="color: #169B62; margin: 0;">${escapeHtml(picture.name)}</h3>
                    <div class="picture-actions">
                        <button class="btn btn-danger" onclick="deletePicture('${picture.id}', '${sectionKey}')">Delete</button>
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Section:</strong> ${sectionName}
                </div>
                ${picture.imageUrl ? `<img src="${escapeHtml(picture.imageUrl)}" alt="${escapeHtml(picture.name)}" class="picture-preview" onerror="this.style.display='none'">` : ''}
                <div class="editable-field">
                    <label>Picture Name *</label>
                    <input type="text" value="${escapeHtml(picture.name)}" onchange="updatePictureField('${picture.id}', '${sectionKey}', 'name', this.value)">
                </div>
                <div class="editable-field">
                    <label>Image URL *</label>
                    <input type="text" value="${escapeHtml(picture.imageUrl)}" onchange="updatePictureField('${picture.id}', '${sectionKey}', 'imageUrl', this.value)">
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="editable-field">
                        <label>Medium *</label>
                        <select onchange="updatePictureField('${picture.id}', '${sectionKey}', 'medium', this.value)">
                            <option value="Oil" ${picture.medium === 'Oil' ? 'selected' : ''}>Oil</option>
                            <option value="Watercolour" ${picture.medium === 'Watercolour' ? 'selected' : ''}>Watercolour</option>
                            <option value="Acrylic" ${picture.medium === 'Acrylic' ? 'selected' : ''}>Acrylic</option>
                            <option value="Pencil" ${picture.medium === 'Pencil' ? 'selected' : ''}>Pencil</option>
                            <option value="Mixed Media" ${picture.medium === 'Mixed Media' ? 'selected' : ''}>Mixed Media</option>
                        </select>
                    </div>
                    <div class="editable-field">
                        <label>Year (optional)</label>
                        <input type="text" value="${escapeHtml(picture.year || '')}" onchange="updatePictureField('${picture.id}', '${sectionKey}', 'year', this.value)">
                    </div>
                </div>
                <div class="editable-field">
                    <label>Notes (optional)</label>
                    <textarea lang="en" spellcheck="true" onchange="updatePictureField('${picture.id}', '${sectionKey}', 'notes', this.value)">${escapeHtml(picture.notes || '')}</textarea>
                </div>
            `;
            
            picturesList.appendChild(pictureItem);
        });
    });
}

// Update a field in a picture
async function updatePictureField(pictureId, section, field, value) {
    const picture = galleryData.sections[section].find(p => p.id === pictureId);
    if (picture) {
        picture[field] = value.trim();
        
        // Update JSON export
        updateJSONExport();
        
        // Try to update on GitHub if token is configured
        if (hasGitHubToken()) {
            try {
                await updateGalleryDataOnGitHub(galleryData);
            } catch (error) {
                console.error('Failed to update GitHub:', error);
                // Silently fail - user can still copy JSON manually
            }
        }
        
        // Visual feedback
        const pictureElement = document.querySelector(`[data-picture-id="${pictureId}"]`);
        if (pictureElement) {
            pictureElement.classList.add('editing');
            setTimeout(() => {
                pictureElement.classList.remove('editing');
            }, 1000);
        }
    }
}

// Delete a picture
async function deletePicture(pictureId, section) {
    if (!confirm('Are you sure you want to delete this picture? This action cannot be undone.')) {
        return;
    }
    
    const sectionArray = galleryData.sections[section];
    const index = sectionArray.findIndex(p => p.id === pictureId);
    if (index !== -1) {
        sectionArray.splice(index, 1);
        
        // Try to update on GitHub if token is configured
        if (hasGitHubToken()) {
            try {
                await updateGalleryDataOnGitHub(galleryData);
                alert('Picture deleted and gallery-data.json updated on GitHub.');
            } catch (error) {
                alert(`Picture deleted locally, but failed to update GitHub: ${error.message}. Please copy the JSON below and commit manually.`);
            }
        }
        
        // Update display
        renderPicturesList();
        updateJSONExport();
    }
}

// Show specific section or all
function showSection(section) {
    currentSectionFilter = section;
    
    // Update tab styles
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render list
    renderPicturesList();
}

// ============================================================================
// JSON EXPORT
// ============================================================================

// Update the JSON export textarea
function updateJSONExport() {
    const jsonOutput = document.getElementById('jsonOutput');
    jsonOutput.value = JSON.stringify(galleryData, null, 2);
}

// Copy JSON to clipboard
function copyJSON() {
    const jsonOutput = document.getElementById('jsonOutput');
    const copyMessage = document.getElementById('copyMessage');
    
    jsonOutput.select();
    jsonOutput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        copyMessage.innerHTML = '<div class="success-message">JSON copied to clipboard!</div>';
        setTimeout(() => {
            copyMessage.innerHTML = '';
        }, 3000);
    } catch (err) {
        copyMessage.innerHTML = '<div class="error-message">Failed to copy. Please select and copy manually.</div>';
    }
}

// Save JSON directly to GitHub (if token is configured) - NOW AUTOMATICALLY GENERATES HTML TOO
async function saveJSONToGitHub() {
    const copyMessage = document.getElementById('copyMessage');
    
    if (!hasGitHubToken()) {
        copyMessage.innerHTML = '<div class="error-message">GitHub token not configured. Please set it in Settings first.</div>';
        return;
    }
    
    try {
        copyMessage.innerHTML = '<div style="color: #169B62; padding: 0.75rem;">Saving JSON and generating HTML files... Please wait.</div>';
        
        // Step 1: Save JSON
        await updateGalleryDataOnGitHub(galleryData);
        
        // Step 2: Automatically generate and save HTML files
        const generatedHTMLs = generateAllGalleryHTMLs(galleryData);
        const htmlFiles = Object.keys(generatedHTMLs);
        let savedCount = 0;
        let errorCount = 0;
        
        for (const sectionId of htmlFiles) {
            try {
                const file = generatedHTMLs[sectionId];
                await updateGitHubFile(file.filename, file.html, `Auto-update ${file.filename} from control panel`);
                savedCount++;
            } catch (error) {
                console.error(`Failed to save ${generatedHTMLs[sectionId].filename}:`, error);
                errorCount++;
            }
        }
        
        if (errorCount === 0) {
            copyMessage.innerHTML = `<div class="success-message">✅ Successfully saved gallery-data.json and ${savedCount} HTML file(s) to GitHub!</div>`;
        } else {
            copyMessage.innerHTML = `<div class="success-message">✅ Saved gallery-data.json and ${savedCount} HTML file(s). ${errorCount} file(s) failed to save.</div>`;
        }
        
        setTimeout(() => {
            copyMessage.innerHTML = '';
        }, 8000);
    } catch (error) {
        copyMessage.innerHTML = `<div class="error-message">Failed to save to GitHub: ${error.message}. Please copy and commit manually.</div>`;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// HTML GENERATION
// ============================================================================

// Generate all HTML files from current gallery data
async function generateAllHTML() {
    const messageDiv = document.getElementById('htmlGenerationMessage');
    const previewSection = document.getElementById('htmlPreviewSection');
    const filesList = document.getElementById('htmlFilesList');
    
    if (!galleryData || !galleryData.sections) {
        messageDiv.innerHTML = '<div class="error-message">No gallery data loaded. Please refresh the page.</div>';
        return;
    }
    
    try {
        messageDiv.innerHTML = '<div style="color: #169B62; padding: 0.75rem;">Generating HTML files... Please wait.</div>';
        
        // Generate HTML for all sections
        const generatedHTMLs = generateAllGalleryHTMLs(galleryData);
        const fileCount = Object.keys(generatedHTMLs).length;
        
        // Display preview
        let filesHTML = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
        Object.keys(generatedHTMLs).forEach(sectionId => {
            const file = generatedHTMLs[sectionId];
            filesHTML += `
                <div style="border: 1px solid #ddd; padding: 1rem; border-radius: 4px;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #169B62;">${file.filename}</h4>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        <button type="button" class="btn" onclick="copyHTMLToClipboard('${sectionId}')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Copy HTML</button>
                        <button type="button" class="btn" onclick="saveHTMLToGitHub('${sectionId}')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Save to GitHub</button>
                    </div>
                </div>`;
        });
        filesHTML += '</div>';
        
        filesList.innerHTML = filesHTML;
        previewSection.style.display = 'block';
        
        // Store generated HTMLs globally for access by copy/save functions
        window.generatedHTMLs = generatedHTMLs;
        
        messageDiv.innerHTML = `<div class="success-message">Successfully generated ${fileCount} HTML file(s)! Use the buttons below to copy or save to GitHub.</div>`;
        
    } catch (error) {
        messageDiv.innerHTML = `<div class="error-message">Error generating HTML: ${error.message}</div>`;
        console.error('HTML generation error:', error);
    }
}

// Preview generated HTML (same as generate, but shows in modal/textarea)
function previewGeneratedHTML() {
    generateAllHTML();
}

// Copy HTML to clipboard
function copyHTMLToClipboard(sectionId) {
    if (!window.generatedHTMLs || !window.generatedHTMLs[sectionId]) {
        alert('Please generate HTML files first.');
        return;
    }
    
    const html = window.generatedHTMLs[sectionId].html;
    const textarea = document.createElement('textarea');
    textarea.value = html;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert(`HTML for ${sectionId}.html copied to clipboard!`);
    } catch (err) {
        alert('Failed to copy. Please select and copy manually.');
    }
    
    document.body.removeChild(textarea);
}

// Save HTML file to GitHub
async function saveHTMLToGitHub(sectionId) {
    if (!window.generatedHTMLs || !window.generatedHTMLs[sectionId]) {
        alert('Please generate HTML files first.');
        return;
    }
    
    if (!hasGitHubToken()) {
        alert('GitHub token not configured. Please set it in Settings first.');
        return;
    }
    
    const file = window.generatedHTMLs[sectionId];
    const messageDiv = document.getElementById('htmlGenerationMessage');
    
    try {
        messageDiv.innerHTML = `<div style="color: #169B62; padding: 0.75rem;">Saving ${file.filename} to GitHub... Please wait.</div>`;
        
        await updateGitHubFile(file.filename, file.html, `Update ${file.filename} from control panel`);
        
        messageDiv.innerHTML = `<div class="success-message">${file.filename} successfully saved to GitHub!</div>`;
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    } catch (error) {
        messageDiv.innerHTML = `<div class="error-message">Failed to save ${file.filename}: ${error.message}</div>`;
    }
}

// Helper function to use the HTML generator (from html-generator.js)
function generateAllGalleryHTMLs(galleryData) {
    // Use the function from html-generator.js if available
    if (typeof window !== 'undefined' && window.generateAllGalleryHTMLs) {
        return window.generateAllGalleryHTMLs(galleryData);
    }
    
    // Fallback: implement inline if html-generator.js didn't load
    const results = {};
    const SECTION_METADATA = {
        'dc-characters': {
            title: 'DC Characters Collection - Batman & Joker Art | Cannon Art',
            heroTitle: 'DC Characters',
            heroSubtitle: 'Batman, The Joker, and the heroes and villains of the DC Universe',
            description: [
                'This collection explores the iconic characters of the DC Universe, focusing on the eternal struggle between Batman and The Joker. Each piece captures the duality of heroism and villainy that defines these legendary characters.',
                'The artworks blend traditional comic book aesthetics with contemporary artistic techniques, creating a unique visual narrative that honors the legacy of DC\'s most beloved characters.'
            ],
            keywords: 'DC characters, Batman art, Joker art, DC Universe, comic book art, superhero art, villain art, Batman vs Joker, Heath Ledger Joker, contemporary art, mixed media',
            ogDescription: 'Explore Cannon DC Characters collection featuring Batman, The Joker, and iconic DC Universe heroes and villains.'
        },
        'marvel-characters': {
            title: 'Marvel Characters Collection - Superhero Art | Cannon Art',
            heroTitle: 'Marvel Characters',
            heroSubtitle: 'Heroes and villains from the Marvel Universe',
            description: [
                'This collection will feature iconic characters from the Marvel Universe. Stay tuned for new artwork celebrating the heroes and villains that have captivated audiences for generations.'
            ],
            keywords: 'Marvel characters, superhero art, X-Men, Avengers, comic book art, Marvel Universe, contemporary art, mixed media',
            ogDescription: 'Explore Cannon Marvel Characters collection featuring iconic heroes and villains from the Marvel Universe.'
        },
        'music-legends': {
            title: 'Music Legends Collection - Rock & Roll Art | Cannon Art',
            heroTitle: 'Music Legends',
            heroSubtitle: 'Celebrating the icons of rock and roll history',
            description: [
                'This collection pays tribute to the legendary rock bands that defined generations. From The Rolling Stones\' timeless rock and roll energy to The Who\'s pioneering rock opera innovations, each piece captures the spirit and influence of these musical icons.',
                'The mixed media artworks blend contemporary techniques with the raw energy of rock music, creating visual tributes that honor their legendary status and enduring appeal across generations.'
            ],
            keywords: 'music legends, rock and roll art, The Rolling Stones, The Who, music art, contemporary art, mixed media, rock music',
            ogDescription: 'Explore Cannon Music Legends collection celebrating iconic rock and roll bands and musicians.'
        },
        'recovery-art': {
            title: 'Recovery Art Collection - Hope & Transformation | Cannon Art',
            heroTitle: 'Recovery Art',
            heroSubtitle: 'Artwork inspired by themes of recovery, hope, and personal transformation',
            description: [
                'This collection will feature artwork inspired by themes of recovery, hope, and personal transformation. Each piece will explore the journey of healing and the power of resilience.'
            ],
            keywords: 'recovery art, addiction recovery, hope, transformation, healing art, contemporary art, mixed media, personal growth',
            ogDescription: 'Explore Cannon Recovery Art collection featuring artwork inspired by themes of recovery, hope, and personal transformation.'
        },
        'miscellaneous': {
            title: 'Miscellaneous Collection - Diverse Creative Expressions | Cannon Art',
            heroTitle: 'Miscellaneous',
            heroSubtitle: 'A diverse collection of creative expressions',
            description: [
                'This collection features a diverse range of creative expressions that don\'t fit into a single category. Each piece represents a unique artistic vision and creative exploration.'
            ],
            keywords: 'miscellaneous art, diverse art, creative expressions, contemporary art, mixed media, unique artwork',
            ogDescription: 'Explore Cannon Miscellaneous collection featuring diverse creative expressions and unique artwork.'
        }
    };
    
    Object.keys(galleryData.sections).forEach(sectionId => {
        const pictures = galleryData.sections[sectionId] || [];
        const metadata = SECTION_METADATA[sectionId];
        
        if (!metadata) {
            console.warn(`No metadata found for section: ${sectionId}`);
            return;
        }
        
        // Use the generateGalleryHTML function from html-generator.js if available
        if (typeof window !== 'undefined' && window.generateGalleryHTML) {
            results[sectionId] = {
                filename: `${sectionId}.html`,
                html: window.generateGalleryHTML(sectionId, pictures, metadata)
            };
        } else {
            // Fallback: return empty (shouldn't happen if html-generator.js loads)
            results[sectionId] = {
                filename: `${sectionId}.html`,
                html: '<!-- HTML generator not loaded. Please refresh the page. -->'
            };
        }
    });
    
    return results;
}
