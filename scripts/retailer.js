// Retailer page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Bulk plan selection
    const bulkSelectButtons = document.querySelectorAll('.btn-bulk-select');
    
    bulkSelectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            selectBulkPlan(plan);
        });
    });
    
    // Form submission
    const retailerForm = document.getElementById('retailerForm');
    
    if (retailerForm) {
        retailerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                storeName: document.getElementById('storeName').value,
                ownerName: document.getElementById('ownerName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                website: document.getElementById('website').value,
                monthlySales: document.getElementById('monthlySales').value,
                message: document.getElementById('message').value
            };
            
            // Validate form
            if (validateRetailerForm(formData)) {
                submitRetailerApplication(formData);
            }
        });
    }
    
    // Form validation
    function validateRetailerForm(data) {
        // Simple validation - in production, use more robust validation
        if (!data.storeName.trim()) {
            alert('Please enter your store name');
            return false;
        }
        
        if (!data.email.trim() || !isValidEmail(data.email)) {
            alert('Please enter a valid email address');
            return false;
        }
        
        if (!data.phone.trim()) {
            alert('Please enter your phone number');
            return false;
        }
        
        return true;
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Bulk plan selection function
    function selectBulkPlan(plan) {
        const plans = {
            'starter': 'Starter Pack (10 cases)',
            'growth': 'Growth Pack (50 cases)',
            'business': 'Business Pack (100 cases)'
        };
        
        // Auto-fill the message field with plan selection
        const messageField = document.getElementById('message');
        if (messageField) {
            const currentMessage = messageField.value;
            const planText = `\n\nI'm interested in the ${plans[plan]}. Please send me more information.`;
            messageField.value = currentMessage + planText;
            
            // Scroll to form
            document.querySelector('.retailer-registration').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Focus on message field
            messageField.focus();
            
            // Show confirmation
            showNotification(`Added ${plans[plan]} to your application!`);
        } else {
            // If form not on page, show modal or redirect
            showNotification(`Selected ${plans[plan]}. Please complete the application form below.`);
        }
    }
    
    // Submit retailer application (simulated)
    function submitRetailerApplication(formData) {
        // In production, this would send data to a server
        console.log('Retailer application submitted:', formData);
        
        // Show success message
        const successMessage = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Application Submitted Successfully!</h3>
                <p>Thank you for your interest in becoming an RL Shine retailer. Our team will contact you within 24 hours.</p>
                <p>A confirmation email has been sent to ${formData.email}.</p>
                <button class="btn-primary" onclick="location.reload()">OK</button>
            </div>
        `;
        
        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = successMessage;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
        `;
        
        // Style success message
        const successDiv = modal.querySelector('.success-message');
        successDiv.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 500px;
            width: 100%;
        `;
        
        successDiv.querySelector('i').style.cssText = `
            color: #38a169;
            font-size: 4rem;
            margin-bottom: 20px;
        `;
        
        successDiv.querySelector('h3').style.cssText = `
            color: #1a202c;
            margin-bottom: 15px;
        `;
        
        successDiv.querySelector('p').style.cssText = `
            color: #4a5568;
            margin-bottom: 15px;
            line-height: 1.6;
        `;
        
        successDiv.querySelector('.btn-primary').style.cssText = `
            margin-top: 20px;
            padding: 12px 30px;
        `;
        
        document.body.appendChild(modal);
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        
        // Close modal on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
                retailerForm.reset();
            }
        });
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ed8936;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});