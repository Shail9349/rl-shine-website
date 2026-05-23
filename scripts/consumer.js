// Consumer page - Modern Product Grid with Variants & Cart System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Consumer.js LOADED - Modern Grid Version');

    // ============================================
    // PRODUCT DATA with VARIANTS, RATINGS & BADGES
    // ============================================
    
    const products = [
        {
            id: 1,
            name: "RL Shine Fresh Scent",
            description: "Powerful cleaning with fresh lemon fragrance. Up to 30 washes.",
            basePrice: 109,
            oldPrice: 199,
            discount: 45,
            rating: 4.7,
            reviewCount: 1423,
            badge: "Bestseller",
            category: "bottle",
            variants: ["500ml", "1L", "2L"],
            defaultVariant: "500ml",
            image: "images/product-1.jpg"
        },
        {
            id: 2,
            name: "RL Shine Citrus Boost",
            description: "Removes tough grease with citrus power. Up to 60 washes.",
            basePrice: 199,
            oldPrice: 349,
            discount: 43,
            rating: 4.8,
            reviewCount: 892,
            badge: "Popular",
            category: "bottle",
            variants: ["1L", "2L", "5L"],
            defaultVariant: "1L",
            image: "images/product-2.jpg"
        },
        {
            id: 3,
            name: "RL Shine Tough Grease",
            description: "Maximum strength for heavy-duty cleaning. Up to 120 washes.",
            basePrice: 349,
            oldPrice: 599,
            discount: 42,
            rating: 4.9,
            reviewCount: 2456,
            badge: "Eco Choice",
            category: "bottle",
            variants: ["2L", "5L"],
            defaultVariant: "2L",
            image: "images/product-3.jpg"
        },
        {
            id: 4,
            name: "RL Shine Twin Pack",
            description: "Two bottles for double the value. Perfect for families.",
            basePrice: 218,
            oldPrice: 398,
            discount: 45,
            rating: 4.6,
            reviewCount: 678,
            badge: "Value Deal",
            category: "pack",
            variants: ["2x500ml", "2x1L"],
            defaultVariant: "2x500ml",
            image: "images/product-4.jpg"
        },
        {
            id: 5,
            name: "RL Shine Family Pack",
            description: "Three bottles. Best value for large households.",
            basePrice: 327,
            oldPrice: 597,
            discount: 45,
            rating: 4.8,
            reviewCount: 1102,
            badge: "Save 20%",
            category: "pack",
            variants: ["3x500ml", "3x1L"],
            defaultVariant: "3x500ml",
            image: "images/product-5.jpg"
        },
        {
            id: 6,
            name: "RL Shine Subscribe & Save",
            description: "Monthly delivery. Never run out. Cancel anytime.",
            basePrice: 149,
            oldPrice: 199,
            discount: 25,
            rating: 4.9,
            reviewCount: 567,
            badge: "Subscribe",
            category: "subscribe",
            variants: ["Monthly", "Quarterly"],
            defaultVariant: "Monthly",
            image: "images/product-6.jpg"
        }
    ];

    // Variant price mapping
    const variantPrices = {
        1: { "500ml": 109, "1L": 199, "2L": 349 },
        2: { "1L": 199, "2L": 349, "5L": 799 },
        3: { "2L": 349, "5L": 799 },
        4: { "2x500ml": 218, "2x1L": 399 },
        5: { "3x500ml": 327, "3x1L": 599 },
        6: { "Monthly": 149, "Quarterly": 399 }
    };

    const variantOldPrices = {
        1: { "500ml": 199, "1L": 349, "2L": 649 },
        2: { "1L": 349, "2L": 599, "5L": 1299 },
        3: { "2L": 599, "5L": 1399 },
        4: { "2x500ml": 398, "2x1L": 698 },
        5: { "3x500ml": 597, "3x1L": 1049 },
        6: { "Monthly": 199, "Quarterly": 499 }
    };

    // ============================================
    // CART SYSTEM
    // ============================================
    
    let cart = [];
    try {
        const storedCart = localStorage.getItem('rlShineCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            if (!Array.isArray(cart)) cart = [];
        }
    } catch(e) {
        cart = [];
    }

    // Track active variants per product
    let activeVariants = {};
    products.forEach(product => {
        activeVariants[product.id] = product.defaultVariant;
    });

    function updateCartCount() {
        const total = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        const cartSpan = document.querySelector('.cart-count');
        if (cartSpan) cartSpan.textContent = total;
        localStorage.setItem('rlShineCart', JSON.stringify(cart));
    }

    function addToCart(id, name, price, variant) {
        const existing = cart.find(item => item.id == id && item.variant === variant);
        if (existing) {
            existing.quantity = (existing.quantity || 0) + 1;
        } else {
            cart.push({ 
                id: id, 
                name: name, 
                variant: variant,
                price: `₹${price}`, 
                quantity: 1 
            });
        }
        updateCartCount();
        
        // Show notification
        const msg = document.createElement('div');
        msg.className = 'rl-notification';
        msg.innerHTML = `<i class="fas fa-check-circle"></i> ${name} (${variant}) added to cart!`;
        msg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#38a169; color:white; padding:12px 20px; border-radius:8px; z-index:9999; font-family:sans-serif; display:flex; align-items:center; gap:10px;';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }

    // ============================================
    // STAR RATING RENDERER
    // ============================================
    
    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
        if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="far fa-star"></i>';
        return starsHtml;
    }

    // ============================================
    // PRODUCT CARD RENDERER
    // ============================================
    
    function renderProductCard(product) {
        const activeVariant = activeVariants[product.id];
        const currentPrice = variantPrices[product.id][activeVariant];
        const oldPriceValue = variantOldPrices[product.id][activeVariant];
        const discountPercent = Math.round(((oldPriceValue - currentPrice) / oldPriceValue) * 100);
        
        // Build variants HTML
        const variantsHtml = product.variants.map(variant => {
            const isActive = variant === activeVariant;
            return `<span class="variant ${isActive ? 'active' : ''}" data-product-id="${product.id}" data-variant="${variant}">${variant}</span>`;
        }).join('');
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-img-wrapper">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/product-hero.png'">
                    </div>
                    <span class="product-badge">${product.badge}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="rating-row">
                        <div class="stars">${renderStars(product.rating)}</div>
                        <span class="review-count">(${product.reviewCount.toLocaleString()})</span>
                    </div>
                    <div class="price-wrapper">
                        <span class="current-price">₹${currentPrice}</span>
                        <span class="old-price">₹${oldPriceValue}</span>
                        <span class="discount">${discountPercent}% off</span>
                    </div>
                    <div class="variant-selector" data-product="${product.id}">
                        ${variantsHtml}
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${currentPrice}" data-variant="${activeVariant}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="buy-now" data-id="${product.id}" data-name="${product.name}" data-price="${currentPrice}" data-variant="${activeVariant}">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    
    function handleVariantClick(e) {
        const variantSpan = e.currentTarget;
        const productId = parseInt(variantSpan.dataset.productId);
        const selectedVariant = variantSpan.dataset.variant;
        
        if (activeVariants[productId] === selectedVariant) return;
        
        activeVariants[productId] = selectedVariant;
        
        // Re-render the specific product card
        const product = products.find(p => p.id === productId);
        const productCard = variantSpan.closest('.product-card');
        if (productCard && product) {
            const newCardHtml = renderProductCard(product);
            productCard.outerHTML = newCardHtml;
            
            // Re-attach events to new elements
            const newCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
            if (newCard) {
                attachCardEvents(newCard);
            }
        }
    }

    function attachCardEvents(card) {
        // Variant clicks
        card.querySelectorAll('.variant').forEach(v => {
            v.removeEventListener('click', handleVariantClick);
            v.addEventListener('click', handleVariantClick);
        });
        
        // Add to cart button
        const addBtn = card.querySelector('.add-to-cart');
        if (addBtn) {
            addBtn.removeEventListener('click', handleAddToCart);
            addBtn.addEventListener('click', handleAddToCart);
        }
        
        // Buy now button
        const buyBtn = card.querySelector('.buy-now');
        if (buyBtn) {
            buyBtn.removeEventListener('click', handleBuyNow);
            buyBtn.addEventListener('click', handleBuyNow);
        }
    }

    function handleAddToCart(e) {
        const btn = e.currentTarget;
        const id = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        const variant = btn.dataset.variant;
        addToCart(id, name, price, variant);
    }

    function handleBuyNow(e) {
        const btn = e.currentTarget;
        const id = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        const variant = btn.dataset.variant;
        addToCart(id, name, price, variant);
        window.location.href = 'checkout.html';
    }

    // ============================================
    // FILTER FUNCTIONALITY
    // ============================================
    
    let currentFilter = 'all';
    
    function filterProducts() {
        const filteredProducts = currentFilter === 'all' 
            ? products 
            : products.filter(p => p.category === currentFilter);
        
        const grid = document.querySelector('.products-grid');
        if (grid) {
            grid.innerHTML = '';
            filteredProducts.forEach(product => {
                grid.innerHTML += renderProductCard(product);
            });
            
            // Attach events to all cards
            document.querySelectorAll('.product-card').forEach(card => {
                attachCardEvents(card);
            });
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    const grid = document.querySelector('.products-grid');
    if (grid) {
        filterProducts();
    }
    
    // Filter button listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterProducts();
        });
    });
    
    // Subscription buttons
    document.querySelectorAll('.subscribe-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const plan = this.dataset.plan;
            alert(`✨ ${plan} subscription selected!\n\nYou'll receive RL Shine every ${plan}. Cancel anytime.`);
        });
    });
    
    updateCartCount();
    console.log('Products loaded:', products.length);
});
