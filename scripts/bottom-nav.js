// Bottom Navigation Bar - RL Shine
document.addEventListener('DOMContentLoaded', function() {
    
    // Get all navigation items
    const navItems = document.querySelectorAll('.nav-item');
    
    // Function to update active tab
    function setActiveTab(activePageId) {
        // Remove active class from all nav items
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked nav item
        const activeNavItem = document.querySelector(`.nav-item[data-page="${activePageId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // Save to localStorage
        localStorage.setItem('currentPage', activePageId);
    }
    
    // Add click event to each nav item
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            
            // Redirect to different pages based on click
            if (pageId === 'home') {
                window.location.href = 'index.html';
            } else if (pageId === 'categories') {
                window.location.href = 'consumer.html';
            } else if (pageId === 'account') {
                window.location.href = 'account.html';
            } else if (pageId === 'cart') {
                window.location.href = 'checkout.html';
            }
            
            setActiveTab(pageId);
        });
    });
    
    // Update cart badge count
    function updateCartBadge() {
        const cartBadge = document.querySelector('.cart-badge');
        const savedCart = localStorage.getItem('rlShineCart');
        
        if (savedCart) {
            try {
                const cart = JSON.parse(savedCart);
                const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
                
                if (cartBadge) {
                    if (cartCount > 0) {
                        cartBadge.textContent = cartCount > 99 ? '99+' : cartCount;
                        cartBadge.style.display = 'flex';
                    } else {
                        cartBadge.style.display = 'none';
                    }
                }
            } catch(e) {
                console.log('Error parsing cart');
            }
        }
    }
    
    // Set active tab based on current page
    function setActiveByCurrentPage() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('index.html') || currentPath === '/' || currentPath === '/index.html') {
            document.querySelector('.nav-item[data-page="home"]')?.classList.add('active');
        } else if (currentPath.includes('consumer.html')) {
            document.querySelector('.nav-item[data-page="categories"]')?.classList.add('active');
        } else if (currentPath.includes('checkout.html')) {
            document.querySelector('.nav-item[data-page="cart"]')?.classList.add('active');
        }
    }
    
    // Initialize
    updateCartBadge();
    setActiveByCurrentPage();
    
    // Listen for cart updates
    window.addEventListener('storage', function() {
        updateCartBadge();
    });
});
