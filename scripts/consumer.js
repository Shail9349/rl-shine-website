// Consumer page - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Consumer.js LOADED - Fixed Version');

    // Products data
    const products = [
        { id: 1, name: "RL Shine 500ml", description: "Perfect for small households. Lasts up to 30 washes.", price: "₹349", category: "bottle" },
        { id: 2, name: "RL Shine 1L", description: "Best value for medium households. Up to 60 washes.", price: "₹599", category: "bottle" },
        { id: 3, name: "RL Shine 2L", description: "Economical for large families. Up to 120 washes.", price: "₹999", category: "bottle" },
        { id: 4, name: "Twin Pack (2x500ml)", description: "Two 500ml bottles. Perfect for trying RL Shine.", price: "₹649", category: "pack" },
        { id: 5, name: "Family Pack (3x1L)", description: "Three 1L bottles. Great value for families.", price: "₹1,599", category: "pack" },
        { id: 6, name: "Subscribe & Save", description: "Monthly delivery with 20% discount.", price: "From ₹279/month", category: "subscribe" }
    ];

    // Fix: Safely load cart from localStorage
    let cart = [];
    try {
        const storedCart = localStorage.getItem('rlShineCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            // Make sure cart is an array
            if (!Array.isArray(cart)) {
                console.warn('Cart was not an array, resetting');
                cart = [];
            }
        }
    } catch(e) {
        console.error('Error loading cart:', e);
        cart = [];
    }
    
    console.log('Cart loaded:', cart);

    function updateCartCount() {
        const total = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        const cartSpan = document.querySelector('.cart-count');
        if (cartSpan) cartSpan.textContent = total;
        localStorage.setItem('rlShineCart', JSON.stringify(cart));
        console.log('Cart updated, total items:', total);
    }

    function addToCart(id, name, price) {
        console.log('Adding to cart:', { id, name, price });
        
        // Ensure cart is array
        if (!Array.isArray(cart)) {
            cart = [];
        }
        
        const existing = cart.find(item => item.id == id);
        if (existing) {
            existing.quantity = (existing.quantity || 0) + 1;
        } else {
            cart.push({ 
                id: id, 
                name: name, 
                price: price, 
                quantity: 1 
            });
        }
        
        updateCartCount();
        
        // Show notification
        const msg = document.createElement('div');
        msg.textContent = name + ' added to cart!';
        msg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#38a169; color:white; padding:12px 20px; border-radius:8px; z-index:9999; font-family:sans-serif;';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }

    // Display products
    const grid = document.querySelector('.products-grid');
    if (grid) {
        grid.innerHTML = '';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cssText = 'background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1); margin-bottom:20px;';
            
            card.innerHTML = `
                <div style="padding:20px;">
                    <h3 style="margin:0 0 10px 0;">${product.name}</h3>
                    <p style="color:#666; margin:0 0 10px 0;">${product.description}</p>
                    <div style="font-size:1.5rem; font-weight:bold; color:#38a169; margin:15px 0;">${product.price}</div>
                    <div style="display:flex; gap:10px;">
                        <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" style="flex:1; padding:12px; background:#f7fafc; border:2px solid #38a169; border-radius:5px; cursor:pointer; font-weight:bold;">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="buy-now-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" style="flex:1; padding:12px; background:#38a169; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">
                            Buy Now
                        </button>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        // Add event listeners
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const price = this.getAttribute('data-price');
                console.log('Add to cart clicked:', name);
                addToCart(id, name, price);
            });
        });
        
        document.querySelectorAll('.buy-now-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const price = this.getAttribute('data-price');
                console.log('Buy now clicked:', name);
                addToCart(id, name, price);
                window.location.href = 'checkout.html';
            });
        });
        
        console.log('Products displayed:', products.length);
        console.log('Buy buttons:', document.querySelectorAll('.buy-now-btn').length);
    }

    updateCartCount();
});
