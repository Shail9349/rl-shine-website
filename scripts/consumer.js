// Consumer page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sample product data
    const products = [
        {
            id: 1,
            name: "RL Shine 500ml",
            description: "Perfect for small households. Lasts up to 30 washes.",
            price: "$8.99",
            category: "bottle",
            image: "images/product-1.jpg"
        },
        {
            id: 2,
            name: "RL Shine 1L",
            description: "Best value for medium households. Up to 60 washes.",
            price: "$14.99",
            category: "bottle",
            image: "images/product-2.jpg"
        },
        {
            id: 3,
            name: "RL Shine 2L",
            description: "Economical for large families. Up to 120 washes.",
            price: "$24.99",
            category: "bottle",
            image: "images/product-3.jpg"
        },
        {
            id: 4,
            name: "Twin Pack (2x500ml)",
            description: "Two 500ml bottles. Perfect for trying RL Shine.",
            price: "$15.99",
            category: "pack",
            image: "images/product-4.jpg"
        },
        {
            id: 5,
            name: "Family Pack (3x1L)",
            description: "Three 1L bottles. Great value for families.",
            price: "$39.99",
            category: "pack",
            image: "images/product-5.jpg"
        },
        {
            id: 6,
            name: "Subscribe & Save",
            description: "Monthly delivery with 20% discount.",
            price: "From $12.99/month",
            category: "subscribe",
            image: "images/product-6.jpg"
        }
    ];

    const productsGrid = document.querySelector('.products-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Display products
    function displayProducts(filter = 'all') {
        productsGrid.innerHTML = '';
        
        const filteredProducts = filter === 'all' 
            ? products 
            : products.filter(product => product.category === filter);
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-category', product.category);
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${product.price}</div>
                    <div class="product-actions">
                        <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="buy-now" data-id="${product.id}">Buy Now</button>
                    </div>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        // Add event listeners to new buttons
        addProductEventListeners();
    }

    // Filter products
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter products
            const filter = this.getAttribute('data-filter');
            displayProducts(filter);
        });
    });

    // Add event listeners to product buttons
    function addProductEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const productName = this.getAttribute('data-name');
                addToCart(productId, productName);
            });
        });

        // Buy now buttons
        document.querySelectorAll('.buy-now').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const product = products.find(p => p.id == productId);
                
                // Add to cart and redirect to checkout
                addToCart(productId, product.name);
                
                // In a real app, you would redirect to checkout
                alert(`Proceeding to checkout with ${product.name}`);
            });
        });
    }

    // Initialize products display
    displayProducts();

    // Subscription buttons
    document.querySelectorAll('.sub-option .btn-primary').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const plan = this.closest('.sub-option').querySelector('h3').textContent;
            alert(`You've selected the ${plan} subscription plan!`);
            // In a real app, you would redirect to subscription setup
        });
    });
});