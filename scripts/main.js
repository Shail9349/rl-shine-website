// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// Cart functionality
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

// Initialize cart from localStorage
function initCart() {
    const savedCart = localStorage.getItem('rlShineCart');
    if (savedCart) {
        cartCount = parseInt(savedCart);
        updateCartCount();
    }
}

function updateCartCount() {
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
    localStorage.setItem('rlShineCart', cartCount.toString());
}

function addToCart(productId, productName) {
    cartCount++;
    updateCartCount();
    
    // Show notification
    showNotification(`${productName} added to cart!`);
    
    // In a real app, you would add the specific product to cart
    console.log(`Product ${productId} added to cart`);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <p>${message}</p>
        <a href="#" class="view-cart">View Cart</a>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #38a169;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add view cart link styles
    const viewCartLink = notification.querySelector('.view-cart');
    viewCartLink.style.cssText = `
        color: white;
        text-decoration: underline;
        font-weight: 600;
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCart();
    
    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === '' && linkPage === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});