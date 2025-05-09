const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

// Validation Function
function validateInput(emailLogin, password, firstName = null, lastName = null, email = null, companyName = null, confirmPassword = null) {
    const messageDiv = document.getElementById('message');
    
    // Check required fields for login (email and password)
    if (!emailLogin || !password) {
        messageDiv.textContent = 'Email and password are required';
        messageDiv.style.color = 'red';
        return false;
    }

    // Check required fields for registration (firstName, lastName, email)
    if (firstName !== null || lastName !== null || email !== null) {
        if (!firstName || !lastName || !email) {
            messageDiv.textContent = 'First name, last name, and email are required for registration';
            messageDiv.style.color = 'red';
            return false;
        }
    }

    // Email validation (for login and registration)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLogin) && email === null) {
        messageDiv.textContent = 'Invalid email format';
        messageDiv.style.color = 'red';
        return false;
    }
    if (email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        messageDiv.textContent = 'Invalid email format';
        messageDiv.style.color = 'red';
        return false;
    }

    // Password validation: at least 8 characters
    if (password.length < 8) {
        messageDiv.textContent = 'Password must be at least 8 characters';
        messageDiv.style.color = 'red';
        return false;
    }

    // Confirm password validation (if provided)
    if (confirmPassword !== null && password !== confirmPassword) {
        messageDiv.textContent = 'Passwords do not match';
        messageDiv.style.color = 'red';
        return false;
    }

    // First and last name validation (if provided)
    if (firstName !== null && !/^[a-zA-Z\s-]+$/.test(firstName)) {
        messageDiv.textContent = 'First name must contain only letters, spaces, or hyphens';
        messageDiv.style.color = 'red';
        return false;
    }
    if (lastName !== null && !/^[a-zA-Z\s-]+$/.test(lastName)) {
        messageDiv.textContent = 'Last name must contain only letters, spaces, or hyphens';
        messageDiv.style.color = 'red';
        return false;
    }

    // Company name validation (if provided and non-empty)
    if (companyName && !/^[a-zA-Z0-9\s&.,'-]+$/.test(companyName)) {
        messageDiv.textContent = 'Company name can only contain letters, numbers, spaces, and common punctuation';
        messageDiv.style.color = 'red';
        return false;
    }

    return true;
}

// Registration Handler
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('register-password').value;
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const companyName = document.getElementById('company-name').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!validateInput(email, password, firstName, lastName, email, companyName, confirmPassword)) return;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName, companyName })
            });
            const data = await response.json();
            messageDiv.style.color = response.ok ? 'green' : 'red';
            messageDiv.textContent = data.message;
        } catch (error) {
            messageDiv.textContent = 'Error connecting to server';
            messageDiv.style.color = 'red';
        }
    });
}

// Original Login Handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('login-password').value;

        if (!validateInput(email, password)) return;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            messageDiv.style.color = response.ok ? 'green' : 'red';
            messageDiv.textContent = data.message;
            if (response.ok) {
                setTimeout(() => window.location.href = '/dashboard', 1000);
            }
        } catch (error) {
            messageDiv.textContent = 'Error connecting to server';
            messageDiv.style.color = 'red';
        }
    });
}

// New Label Creator Functionality
document.addEventListener('DOMContentLoaded', () => {
    initLabelCreator();
    initColorPicker();
    initBanner();
});

// Label Creator Module
function initLabelCreator() {
    const labelText = document.getElementById('labelText');
    const addLabel = document.getElementById('addLabel');
    const labelsList = document.getElementById('labelsList');
    const colorPickerModal = document.getElementById('colorPickerModal');
    const colorGrid = document.querySelector('.color-grid');
    const cartLink = document.querySelector('.nav-link.cart');
    const previewGrid = document.getElementById('previewGrid');

    // Available colors for the color picker
    const colors = [
        '#9bd3f9', '#7375f3', '#d9d9d9', '#b4736d',
        '#79b47b', '#b074bb', '#7cb5b7', '#ffe585',
        '#c29b7b', '#7173b7', '#b0b87c', '#fdfd82',
        '#84fefc', '#fe76ff', '#717171'
    ];

    // Get cart items from localStorage
    const getCartItems = () => {
        const items = localStorage.getItem('cartItems');
        return items ? JSON.parse(items) : [];
    };

    // Save cart items to localStorage
    const saveCartItems = (items) => {
        localStorage.setItem('cartItems', JSON.stringify(items));
    };

    // Update preview grid
    const updatePreviewGrid = () => {
        if (!previewGrid) return;
        previewGrid.innerHTML = '';
        const cartItems = getCartItems();
        
        cartItems.forEach(item => {
            for (let i = 0; i < (parseInt(item.quantity) || 1); i++) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.style.color = item.color || '#000000';
                previewItem.textContent = item.text;
                previewGrid.appendChild(previewItem);
            }
        });
    };

    // Create a label item element
    const createLabelItem = (itemData) => {
        const labelItem = document.createElement('div');
        labelItem.className = 'label-item';
        labelItem.dataset.labelId = Date.now().toString();

        const labelContent = document.createElement('div');
        labelContent.className = 'label-content';
        labelContent.textContent = itemData.text;
        labelContent.style.color = itemData.color || '#000000';

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'quantity-input';
        quantityInput.value = itemData.quantity || 1;
        quantityInput.min = '1';

        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = itemData.color || '#000000';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '🗑️';
        deleteButton.title = 'Delete item';

        labelItem.appendChild(labelContent);
        labelItem.appendChild(quantityInput);
        labelItem.appendChild(colorBox);
        labelItem.appendChild(deleteButton);

        // Color picker click handler
        colorBox.addEventListener('click', () => {
            const modal = document.getElementById('colorPickerModal');
            modal.style.display = 'block';
            modal.dataset.currentLabelId = labelItem.dataset.labelId;
        });

        // Quantity change handler
        quantityInput.addEventListener('change', () => {
            const index = Array.from(labelsList.children).indexOf(labelItem);
            const cartItems = getCartItems();
            if (index >= 0 && index < cartItems.length) {
                cartItems[index].quantity = parseInt(quantityInput.value) || 1;
                saveCartItems(cartItems);
                updatePreviewGrid();
                updateCartDisplay();
                updateTotalLabels();
            }
        });

        // Delete handler
        deleteButton.addEventListener('click', () => {
            const index = Array.from(labelsList.children).indexOf(labelItem);
            const cartItems = getCartItems();
            if (index >= 0 && index < cartItems.length) {
                cartItems.splice(index, 1);
                saveCartItems(cartItems);
            }
            labelItem.remove();
            updateTotalLabels();
            updateCartDisplay();
            updatePreviewGrid();
        });

        return labelItem;
    };

    // Load existing items
    const loadExistingItems = () => {
        if (!labelsList) return;
        const cartItems = getCartItems();
        cartItems.forEach(item => {
            const labelItem = createLabelItem(item);
            labelsList.appendChild(labelItem);
        });
        updateTotalLabels();
        updateCartDisplay();
        updatePreviewGrid();
    };

    // Create color picker options
    if (colorGrid) {
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorGrid.appendChild(colorOption);
        });
    }

    // Add new label
    if (addLabel) {
        addLabel.addEventListener('click', () => {
            if (labelText.value.trim() === '') return;

            const newItem = {
                text: labelText.value.trim(),
                quantity: 1,
                color: '#000000',
                price: 10.00
            };

            const labelItem = createLabelItem(newItem);
            labelsList.appendChild(labelItem);

            const cartItems = getCartItems();
            cartItems.push(newItem);
            saveCartItems(cartItems);

            labelText.value = '';
            updateCartDisplay();
            updateTotalLabels();
            updatePreviewGrid();
        });
    }

    // Add Enter key handler for input field
    if (labelText) {
        labelText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addLabel.click();
            }
        });
    }

    // Update cart display
    function updateCartDisplay() {
        if (!cartLink) return;
        const cartItems = getCartItems();
        const totalQuantity = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
        cartLink.textContent = `My Cart (${totalQuantity})`;
    }

    // Update total labels
    function updateTotalLabels() {
        const totalLabelsElement = document.querySelector('.total-labels span');
        if (totalLabelsElement) {
            const cartItems = getCartItems();
            const total = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
            totalLabelsElement.textContent = total;
        }
    }

    // Initialize label creator
    if (document.getElementById('labelText')) {
        loadExistingItems();
    }
}

// Color Picker Module
function initColorPicker() {
    const colors = [
        '#9bd3f9', '#7375f3', '#d9d9d9', '#b4736d',
        '#79b47b', '#b074bb', '#7cb5b7', '#ffe585',
        '#c29b7b', '#7173b7', '#b0b87c', '#fdfd82',
        '#84fefc', '#fe76ff', '#717171'
    ];

    const colorGrid = document.querySelector('.color-grid');
    const modal = document.getElementById('colorPickerModal');
    const labelsList = document.getElementById('labelsList');

    // Clear existing color options
    if (colorGrid) {
        colorGrid.innerHTML = '';
        
        // Create color options
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            
            colorOption.addEventListener('click', () => {
                const labelId = modal.dataset.currentLabelId;
                const labelItem = document.querySelector(`[data-label-id="${labelId}"]`);
                
                if (labelItem) {
                    const colorBox = labelItem.querySelector('.color-box');
                    const labelContent = labelItem.querySelector('.label-content');
                    
                    colorBox.style.backgroundColor = color;
                    labelContent.style.color = color;
                    
                    const index = Array.from(labelsList.children).indexOf(labelItem);
                    const cartItems = getCartItems();
                    if (index >= 0 && index < cartItems.length) {
                        cartItems[index].color = color;
                        saveCartItems(cartItems);
                    }
                    
                    updatePreviewGrid();
                }
                
                modal.style.display = 'none';
            });
            
            colorGrid.appendChild(colorOption);
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Banner Module
function initBanner() {
    const banners = [
        { src: 'images/Create_Magnets.png', alt: 'Create Magnet Labels With Your Text!' },
        { src: 'images/EZ_Magnets.png', alt: 'EZ MAGNET LABELS' },
        { src: 'images/Free_Shipping.png', alt: 'Free Shipping!' },
        { src: 'images/How_To.png', alt: 'How To Create Labels' },
        { src: 'images/Label_Specs.png', alt: 'Label Specifications' },
        { src: 'images/Package_Options.png', alt: 'Package Options' }
    ];
    
    let currentBannerIndex = 0;
    const rotatingBanners = document.querySelectorAll('.rotating-banner');
    
    if (rotatingBanners.length === 0) return;

    function updateBanner() {
        rotatingBanners.forEach(banner => {
            // Clear existing content
            banner.innerHTML = '';
            
            // Create new image element
            const img = document.createElement('img');
            img.src = banners[currentBannerIndex].src;
            img.alt = banners[currentBannerIndex].alt;
            img.style.width = '100%';
            img.style.height = 'auto';
            
            // Append only if src is valid
            if (img.src) {
                banner.appendChild(img);
            }
        });
        
        currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    }
    
    // Initial load
    updateBanner();
    
    // Rotate every 4 seconds
    setInterval(updateBanner, 4000);
}

// Helper Functions
function getCartItems() {
    const items = localStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
}

function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
}

function updatePreviewGrid() {
    const previewGrid = document.getElementById('previewGrid');
    if (!previewGrid) return;
    
    previewGrid.innerHTML = '';
    const cartItems = getCartItems();
    
    cartItems.forEach(item => {
        for (let i = 0; i < (parseInt(item.quantity) || 1); i++) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.textContent = item.text;
            previewItem.style.color = item.color || '#000000';
            previewGrid.appendChild(previewItem);
        }
    });
}

function updateCartCount() {
    const cartItems = getCartItems();
    const totalItems = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    
    const cartLinks = document.querySelectorAll('.nav-link.cart');
    cartLinks.forEach(link => {
        link.innerHTML = `My Cart (${totalItems})`;
    });
}