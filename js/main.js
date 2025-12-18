// ===========================
// Main JavaScript - All Functionality
// ===========================

// Initialize app data
const APP_KEYS = {
    USERS: 'blogapp_users',
    CURRENT_USER: 'blogapp_current_user',
    POSTS: 'blogapp_posts'
};

// Initialize default data if not exists
function initializeAppData() {
    if (!localStorage.getItem(APP_KEYS.USERS)) {
        localStorage.setItem(APP_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(APP_KEYS.POSTS)) {
        // Add some default posts
        const defaultPosts = [
            {
                id: 1,
                title: 'The Future of Web Assembly',
                excerpt: 'Exploring how WASM is radically changing browser performance benchmarks.',
                content: 'Web design is in a constant state of flux...',
                category: 'Dev',
                author: 'Elena Rodriguez',
                authorRole: 'Senior Engineer',
                authorAvatar: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=6366f1&color=fff&size=128',
                image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
                date: 'Oct 26, 2023',
                readTime: '5 min read',
                tags: ['Technology', 'WebAssembly']
            },
            {
                id: 2,
                title: 'Design Systems 101',
                excerpt: 'Building consistent UIs at scale isn\'t just about components; it\'s about communication.',
                content: 'A design system is a collection of reusable components...',
                category: 'Design',
                author: 'Sarah Jenkins',
                authorRole: 'Product Designer',
                authorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=6366f1&color=fff&size=128',
                image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
                date: 'Oct 24, 2023',
                readTime: '5 min read',
                tags: ['Design', 'UI/UX']
            },
            {
                id: 3,
                title: 'React vs Vue in 2024',
                excerpt: 'A comprehensive framework comparison for modern frontend teams.',
                content: 'Both React and Vue have their strengths...',
                category: 'Dev',
                author: 'Mike Ross',
                authorRole: 'Frontend Developer',
                authorAvatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=6366f1&color=fff&size=128',
                image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
                date: 'Oct 22, 2023',
                readTime: '8 min read',
                tags: ['React', 'Vue', 'JavaScript']
            }
        ];
        localStorage.setItem(APP_KEYS.POSTS, JSON.stringify(defaultPosts));
    }
}

// ===========================
// User Management
// ===========================
function getUsers() {
    return JSON.parse(localStorage.getItem(APP_KEYS.USERS) || '[]');
}

function saveUser(user) {
    const users = getUsers();
    user.id = Date.now();
    user.avatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullname) + '&background=6366f1&color=fff&size=128';
    user.bio = '';
    user.followers = 0;
    user.following = 0;
    user.articles = 0;
    users.push(user);
    localStorage.setItem(APP_KEYS.USERS, JSON.stringify(users));
    return user;
}

function findUser(email, password) {
    const users = getUsers();
    return users.find(u => u.email === email && u.password === password);
}

function getCurrentUser() {
    const userData = localStorage.getItem(APP_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
    localStorage.setItem(APP_KEYS.CURRENT_USER, JSON.stringify(user));
}

function updateCurrentUser(updates) {
    const user = getCurrentUser();
    if (user) {
        const updatedUser = { ...user, ...updates };
        setCurrentUser(updatedUser);
        
        // Also update in users array
        const users = getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem(APP_KEYS.USERS, JSON.stringify(users));
        }
        return updatedUser;
    }
    return null;
}

function logout() {
    localStorage.removeItem(APP_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
}

// ===========================
// Post Management
// ===========================
function getPosts() {
    return JSON.parse(localStorage.getItem(APP_KEYS.POSTS) || '[]');
}

function savePost(post) {
    const posts = getPosts();
    const currentUser = getCurrentUser();
    
    post.id = Date.now();
    post.date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    post.author = currentUser ? currentUser.fullname : 'Anonymous';
    post.authorRole = currentUser ? (currentUser.role || 'Writer') : 'Guest';
    post.authorAvatar = currentUser ? currentUser.avatar : 'https://ui-avatars.com/api/?name=Anonymous&background=6366f1&color=fff&size=128';
    post.readTime = Math.ceil(post.content.split(' ').length / 200) + ' min read';
    
    posts.unshift(post); // Add to beginning
    localStorage.setItem(APP_KEYS.POSTS, JSON.stringify(posts));
    
    // Update user's article count
    if (currentUser) {
        updateCurrentUser({ articles: (currentUser.articles || 0) + 1 });
    }
    
    return post;
}

function getPostById(id) {
    const posts = getPosts();
    return posts.find(p => p.id === parseInt(id));
}

// ===========================
// DOM Ready Handler
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    initializeAppData();
    initPasswordToggle();
    initMobileMenu();
    initLoginForm();
    initSignupForm();
    initImageUpload();
    initTagsInput();
    initArticleForm();
    initEditProfileForm();
    initProfilePage();
    initSingleArticlePage();
    initFilterButtons();
    renderPosts();
    updateUIForUser();
});

// ===========================
// Update UI Based on Login State
// ===========================
function updateUIForUser() {
    const user = getCurrentUser();
    const headerActions = document.querySelector('.header-actions');
    const signInBtn = document.querySelector('.header-actions a[href="login.html"]');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (user) {
        // User is logged in - replace Sign In button with user avatar
        if (signInBtn) {
            // Create user profile link with avatar
            const userProfileLink = document.createElement('a');
            userProfileLink.href = 'profile.html';
            userProfileLink.className = 'user-avatar-link';
            userProfileLink.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                text-decoration: none;
                color: white;
            `;
            userProfileLink.innerHTML = `
                <div class="header-user-avatar" style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background-image: url('${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullname) + '&background=6366f1&color=fff&size=128'}');
                    background-size: cover;
                    background-position: center;
                    border: 2px solid rgba(99, 102, 241, 0.5);
                "></div>
                <span style="font-weight: 500; font-size: 0.875rem;">${user.fullname.split(' ')[0]}</span>
            `;
            signInBtn.replaceWith(userProfileLink);
        }
        
        // Update mobile menu - replace Sign In with Sign Out
        if (mobileMenu) {
            const mobileSignIn = mobileMenu.querySelector('a[href="login.html"]');
            if (mobileSignIn) {
                mobileSignIn.href = '#';
                mobileSignIn.textContent = 'Sign Out';
                mobileSignIn.onclick = function(e) {
                    e.preventDefault();
                    logout();
                };
            }
        }
        
        // Update profile page if we're on it
        const profileName = document.querySelector('.profile-name');
        const profileBio = document.querySelector('.profile-bio');
        const profileAvatar = document.querySelector('.profile-avatar');
        const profileArticles = document.querySelector('.profile-stat-value');
        
        if (profileName) profileName.textContent = user.fullname;
        if (profileBio) profileBio.textContent = user.bio || 'No bio yet. Click Edit Profile to add one.';
        if (profileAvatar && user.avatar) profileAvatar.style.backgroundImage = `url('${user.avatar}')`;
    }
}

// ===========================
// Password Visibility Toggle
// ===========================
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('.eye-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) {
                    icon.innerHTML = `
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    `;
                }
            } else {
                input.type = 'password';
                if (icon) {
                    icon.innerHTML = `
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    `;
                }
            }
        });
    });
}

// ===========================
// Mobile Menu Toggle
// ===========================
function initMobileMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (burgerMenu && mobileMenu) {
        burgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                burgerMenu.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// ===========================
// Login Form Handling
// ===========================
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!email || !password) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            // Find user
            const user = findUser(email, password);
            
            if (user) {
                setCurrentUser(user);
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'blog_home.html';
                }, 1000);
            } else {
                showMessage('Invalid email or password', 'error');
            }
        });
    }
}

// ===========================
// Signup Form Handling
// ===========================
function initSignupForm() {
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms');
            
            // Validation
            if (!fullname || !email || !password || !confirmPassword) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }
            
            if (terms && !terms.checked) {
                showMessage('Please accept the terms and conditions', 'error');
                return;
            }
            
            // Check if email already exists
            const users = getUsers();
            if (users.find(u => u.email === email)) {
                showMessage('Email already registered', 'error');
                return;
            }
            
            // Save user
            const newUser = saveUser({
                fullname: fullname,
                email: email,
                password: password,
                role: 'Writer'
            });
            
            showMessage('Account created successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
}

// ===========================
// Article Form Handling
// ===========================
function initArticleForm() {
    const articleForm = document.getElementById('article-form');
    
    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('article-title').value;
            const content = document.querySelector('.editor-textarea').value;
            const tagsElements = document.querySelectorAll('.tags-list .tag span');
            const preview = document.querySelector('.upload-preview');
            
            if (!title || !content) {
                showMessage('Please fill in title and content', 'error');
                return;
            }
            
            // Get tags
            const tags = Array.from(tagsElements).map(t => t.textContent);
            
            // Get cover image
            let coverImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800';
            if (preview && preview.style.backgroundImage) {
                coverImage = preview.style.backgroundImage.slice(5, -2);
            }
            
            // Create post object
            const post = {
                title: title,
                content: content,
                excerpt: content.substring(0, 150) + '...',
                category: tags[0] || 'General',
                tags: tags,
                image: coverImage
            };
            
            // Save post
            savePost(post);
            
            showMessage('Article published successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'blog_home.html';
            }, 1500);
        });
    }
}

// ===========================
// Edit Profile Form Handling
// ===========================
function initEditProfileForm() {
    const editProfileForm = document.getElementById('edit-profile-form');
    
    if (editProfileForm) {
        const user = getCurrentUser();
        
        // Pre-fill form with current user data
        if (user) {
            const nameInput = document.getElementById('profile-name');
            const bioInput = document.getElementById('profile-bio');
            const roleInput = document.getElementById('profile-role');
            const avatarPreview = document.querySelector('.avatar-preview');
            
            if (nameInput) nameInput.value = user.fullname || '';
            if (bioInput) bioInput.value = user.bio || '';
            if (roleInput) roleInput.value = user.role || '';
            if (avatarPreview && user.avatar) {
                avatarPreview.style.backgroundImage = `url('${user.avatar}')`;
            }
        }
        
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('profile-name').value;
            const bio = document.getElementById('profile-bio').value;
            const role = document.getElementById('profile-role').value;
            const avatarPreview = document.querySelector('.avatar-preview');
            
            if (!fullname) {
                showMessage('Name is required', 'error');
                return;
            }
            
            let avatar = user ? user.avatar : '';
            if (avatarPreview && avatarPreview.style.backgroundImage) {
                avatar = avatarPreview.style.backgroundImage.slice(5, -2);
            }
            
            // Update user
            updateCurrentUser({
                fullname: fullname,
                bio: bio,
                role: role,
                avatar: avatar
            });
            
            showMessage('Profile updated successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
        });
    }
}

// ===========================
// Render Posts to Page
// ===========================
function renderPosts(filterCategory = 'all') {
    const articlesGrid = document.querySelector('.articles-grid');
    
    if (articlesGrid) {
        let posts = getPosts();
        
        // Apply filter if not 'all'
        if (filterCategory && filterCategory.toLowerCase() !== 'all') {
            posts = posts.filter(post => {
                const postCategory = (post.category || '').toLowerCase();
                const filter = filterCategory.toLowerCase();
                
                // Match category or tags
                if (postCategory.includes(filter) || filter.includes(postCategory)) {
                    return true;
                }
                
                // Also check tags
                if (post.tags && post.tags.some(tag => tag.toLowerCase().includes(filter))) {
                    return true;
                }
                
                // Map common categories
                if (filter === 'development' && (postCategory === 'dev' || postCategory.includes('dev'))) {
                    return true;
                }
                if (filter === 'tutorials' && (postCategory === 'tutorial' || post.tags?.includes('Tutorial'))) {
                    return true;
                }
                
                return false;
            });
        }
        
        // Clear existing content
        articlesGrid.innerHTML = '';
        
        if (posts.length === 0) {
            articlesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">
                    <p>No articles found in this category.</p>
                </div>
            `;
            return;
        }
        
        posts.forEach(post => {
            const articleCard = document.createElement('article');
            articleCard.className = 'article-card';
            articleCard.dataset.category = post.category || 'General';
            articleCard.innerHTML = `
                <div class="article-image-wrapper">
                    <div class="article-image" style="background-image: url('${post.image}');"></div>
                    <span class="article-category">${post.category}</span>
                </div>
                <div class="article-content">
                    <h3 class="article-title">${post.title}</h3>
                    <p class="article-excerpt">${post.excerpt}</p>
                </div>
                <div class="article-footer">
                    <div class="article-author">
                        <div class="article-author-avatar" style="background-image: url('${post.authorAvatar}');"></div>
                        <div class="article-author-info">
                            <span class="article-author-name">${post.author}</span>
                            <span class="article-meta">${post.date} • ${post.readTime}</span>
                        </div>
                    </div>
                    <button class="like-btn" onclick="toggleLike(this)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                </div>
            `;
            
            // Add click to open article
            articleCard.addEventListener('click', function(e) {
                if (!e.target.closest('.like-btn')) {
                    window.location.href = `single_article.html?id=${post.id}`;
                }
            });
            articleCard.style.cursor = 'pointer';
            
            articlesGrid.appendChild(articleCard);
        });
    }
}

// ===========================
// Filter Buttons Functionality
// ===========================
function initFilterButtons() {
    const filterContainer = document.querySelector('.filter-buttons');
    
    if (!filterContainer) return;
    
    // Get all unique categories from posts
    const posts = getPosts();
    const categories = new Set(['All']); // Always start with 'All'
    
    posts.forEach(post => {
        // Add post category
        if (post.category) {
            categories.add(post.category);
        }
        // Add tags as categories too
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => categories.add(tag));
        }
    });
    
    // Clear existing buttons and create new ones
    filterContainer.innerHTML = '';
    
    categories.forEach((category, index) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (index === 0 ? ' active' : '');
        btn.textContent = category;
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter category and render posts
            renderPosts(category);
        });
        filterContainer.appendChild(btn);
    });
}

// ===========================
// Image Upload Functionality
// ===========================
function initImageUpload() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    
    uploadAreas.forEach(area => {
        const input = area.querySelector('input[type="file"]');
        const preview = area.querySelector('.upload-preview');
        const placeholder = area.querySelector('.upload-placeholder');
        
        if (!input) return;
        
        // Click to upload
        area.addEventListener('click', function(e) {
            if (e.target !== input) {
                input.click();
            }
        });
        
        // Drag and drop
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0], preview, placeholder);
            }
        });
        
        // File input change
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleFile(this.files[0], preview, placeholder);
            }
        });
    });
    
    // Avatar upload
    const avatarUpload = document.querySelector('.avatar-upload');
    if (avatarUpload) {
        const input = avatarUpload.querySelector('input[type="file"]');
        const preview = avatarUpload.querySelector('.avatar-preview');
        
        avatarUpload.addEventListener('click', function() {
            input.click();
        });
        
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleFile(this.files[0], preview, null);
            }
        });
    }
}

function handleFile(file, preview, placeholder) {
    if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (preview) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.style.display = 'block';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// ===========================
// Tags Input Functionality
// ===========================
function initTagsInput() {
    const tagsContainers = document.querySelectorAll('.tags-container');
    
    tagsContainers.forEach(container => {
        const input = container.querySelector('.tags-input');
        const tagsList = container.querySelector('.tags-list');
        
        if (!input || !tagsList) return;
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = this.value.trim();
                
                if (value && tagsList.children.length < 5) {
                    addTag(value, tagsList);
                    this.value = '';
                } else if (tagsList.children.length >= 5) {
                    showMessage('Maximum 5 tags allowed', 'error');
                }
            }
        });
    });
}

function addTag(text, container) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `
        <span>${text}</span>
        <button type="button" class="tag-remove" onclick="this.parentElement.remove()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    container.appendChild(tag);
}

// ===========================
// Message/Toast Notifications
// ===========================
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        background-color: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===========================
// Like Button Toggle
// ===========================
function toggleLike(button) {
    button.classList.toggle('liked');
    const icon = button.querySelector('svg');
    if (icon) {
        if (button.classList.contains('liked')) {
            icon.setAttribute('fill', 'currentColor');
            button.style.color = '#ef4444';
        } else {
            icon.setAttribute('fill', 'none');
            button.style.color = '';
        }
    }
}

// ===========================
// Profile Page Initialization
// ===========================
function initProfilePage() {
    const profilePage = document.querySelector('.profile-page');
    if (!profilePage) return;
    
    const user = getCurrentUser();
    
    if (!user) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Update profile info
    const profileName = document.querySelector('.profile-name');
    const profileBio = document.querySelector('.profile-bio');
    const profileAvatar = document.querySelector('.profile-avatar');
    const articlesCount = document.getElementById('articles-count');
    const  writeArticle = document.getElementById('write-article');
    
    if (profileName) profileName.textContent = user.fullname || 'User';
    if (profileBio) profileBio.textContent = user.bio || 'No bio yet. Click Edit Profile to add one.';
    if (profileAvatar && user.avatar) profileAvatar.style.backgroundImage = `url('${user.avatar}')`;
    if (articlesCount) articlesCount.textContent = user.articles || 0;

    if(articlesCount >0 ) writeArticle.style.display = 'none';
    
    // Load user's articles
    loadUserArticles(user);
}

function loadUserArticles(user) {
    const container = document.getElementById('user-articles');
    const emptyState = document.getElementById('empty-articles');
    
    if (!container || !emptyState) return;
    
    const posts = getPosts();
    const userPosts = posts.filter(p => p.author === user.fullname);
    
    if (userPosts.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    userPosts.forEach(post => {
        const article = document.createElement('a');
        article.href = `single_article.html?id=${post.id}`;
        article.className = 'profile-article';
        article.innerHTML = `
            <div class="profile-article-image" style="background-image: url('${post.image}');"></div>
            <div class="profile-article-content">
                <h3 class="profile-article-title">${post.title}</h3>
                <p class="profile-article-excerpt">${post.excerpt}</p>
                <span class="profile-article-meta">${post.date} • ${post.readTime}</span>
            </div>
        `;
        container.insertBefore(article, emptyState);
    });
}

// ===========================
// Single Article Page Initialization
// ===========================
function initSingleArticlePage() {
    const articlePage = document.querySelector('.article-page');
    if (!articlePage) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    console.log('Single Article Page - Article ID from URL:', articleId);
    
    if (articleId) {
        const posts = getPosts();
        console.log('All posts in localStorage:', posts);
        console.log('Post IDs available:', posts.map(p => p.id));
        
        // Find post by id (handle both string and number comparison)
        const post = posts.find(p => String(p.id) === String(articleId));
        console.log('Found post:', post);
        
        if (post) {
            // Update page title
            document.title = `${post.title} - Bloggy`;
            
            // Update article header
            const headerTitle = document.querySelector('.article-header h1');
            const headerSubtitle = document.querySelector('.article-subtitle');
            if (headerTitle) headerTitle.textContent = post.title;
            if (headerSubtitle) headerSubtitle.textContent = post.excerpt;
            
            // Update author info
            const authorAvatar = document.querySelector('.author-avatar-lg');
            if (authorAvatar) {
                authorAvatar.style.backgroundImage = `url('${post.authorAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author) + '&background=6366f1&color=fff&size=128'}')`;
            }
            const authorName = document.querySelector('.author-details h4');
            const authorRole = document.querySelector('.author-details p');
            if (authorName) authorName.textContent = post.author;
            if (authorRole) authorRole.textContent = `${post.authorRole || 'Writer'} • Follow`;
            
            // Update meta info
            const metaSpans = document.querySelectorAll('.article-meta-info span');
            if (metaSpans.length >= 3) {
                const dateSvg = metaSpans[0].querySelector('svg');
                const timeSvg = metaSpans[2].querySelector('svg');
                if (dateSvg) metaSpans[0].innerHTML = dateSvg.outerHTML + ' ' + post.date;
                if (timeSvg) metaSpans[2].innerHTML = timeSvg.outerHTML + ' ' + post.readTime;
            }
            
            // Update featured image
            const featuredImage = document.querySelector('.article-featured-image');
            if (featuredImage) featuredImage.style.backgroundImage = `url('${post.image}')`;
            
            // Update tags at top
            const tagsContainer = document.querySelector('.article-tags');
            if (tagsContainer && post.tags && post.tags.length > 0) {
                tagsContainer.innerHTML = post.tags.map(tag => 
                    `<a href="#" class="article-tag">${tag}</a>`
                ).join('');
            }
            
            // Update article content
            const articleBody = document.querySelector('.article-body');
            if (articleBody) {
                articleBody.innerHTML = `
                    <p class="lead">${post.content}</p>
                    <div class="article-tags-footer">
                        <h4>Tags</h4>
                        <div class="tag-links">
                            ${post.tags ? post.tags.map(tag => `<a href="#" class="tag-link">#${tag}</a>`).join('') : ''}
                        </div>
                    </div>
                `;
            }
            
            // Load related articles (excluding current article)
            loadRelatedArticles(articleId);
        }
    }
}

// ===========================
// Load Related Articles
// ===========================
function loadRelatedArticles(currentArticleId) {
    const relatedContainer = document.getElementById('related-articles');
    if (!relatedContainer) return;
    
    const posts = getPosts();
    // Get up to 3 articles that are not the current one
    const relatedPosts = posts.filter(p => String(p.id) !== String(currentArticleId)).slice(0, 3);
    
    if (relatedPosts.length === 0) {
        relatedContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">No related articles found.</p>';
        return;
    }
    
    relatedContainer.innerHTML = relatedPosts.map(post => `
        <a href="single_article.html?id=${post.id}" class="related-card">
            <div class="related-image" style="background-image: url('${post.image}');"></div>
            <div class="related-content">
                <span class="related-category">${post.category || 'General'}</span>
                <h4 class="related-title">${post.title}</h4>
                <p class="related-excerpt">${post.excerpt}</p>
            </div>
        </a>
    `).join('');
}
