// Wholesaler page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Tier selection
    const tierSelectButtons = document.querySelectorAll('.tier-select');
    
    tierSelectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tier = this.getAttribute('data-tier');
            selectWholesaleTier(tier);
        });
    });
    
    // Form submission
    const wholesalerForm = document.getElementById('wholesalerForm');
    
    if (wholesalerForm) {
        wholesalerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                companyName: document.getElementById('companyName').value,
                businessType: document.getElementById('businessType').value,
                yearsBusiness: document.getElementById('yearsBusiness').value,
                taxId: document.getElementById('taxId').value,
                contactName: document.getElementById('contactName').value,
                contactTitle: document.getElementById('contactTitle').value,
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value,
                territory: document.getElementById('territory').value,
                annualRevenue: document.getElementById('annualRevenue').value,
                employeeCount: document.getElementById('employeeCount').value,
                currentProducts: document.getElementById('currentProducts').value,
                targetTier: document.getElementById('targetTier').value,
                additionalInfo: document.getElementById('additionalInfo').value
            };
            
            // Validate form
            if (validateWholesalerForm(formData)) {
                submitWholesalerApplication(formData);
            }
        });
    }
    
    // Form validation
    function validateWholesalerForm(data) {
        // Simple validation - in production, use more robust validation
        if (!data.companyName.trim()) {
            alert('Please enter your company name');
            return false;
        }
        
        if (!data.taxId.trim()) {
            alert('Please enter your Tax ID/Business Number');
            return false;
        }
        
        if (!data.contactEmail.trim() || !isValidEmail(data.contactEmail)) {
            alert('Please enter a valid email address');
            return false;
        }
        
        if (!data.targetTier) {
            alert('Please select a target wholesale tier');
            return false;
        }
        
        return true;
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Tier selection function
    function selectWholesaleTier(tier) {
        const tiers = {
            'silver': 'Silver Tier (500-999 cases)',
            'gold': 'Gold Tier (1,000-2,499 cases)',
            'platinum': 'Platinum Tier (2,500+ cases)'
        };
        
        // Auto-select tier in form if available
        const targetTierSelect = document.getElementById('targetTier');
        if (targetTierSelect) {
            targetTierSelect.value = tier;
            
            // Scroll to form
            document.querySelector('.wholesaler-form-section').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Show confirmation
            showNotification(`Selected ${tiers[tier]} for your application`);
        } else if (tier === 'platinum') {
            // For platinum tier, show special message
            showModal('Platinum Tier Inquiry', 'For Platinum Tier partnerships, our executive team will contact you directly to discuss custom pricing and terms.');
        } else {
            showNotification(`Interested in ${tiers[tier]}. Please complete the application form below.`);
        }
    }
    
    // Submit wholesaler application (simulated)
    function submitWholesalerApplication(formData) {
        // In production, this would send data to a server
        console.log('Wholesaler application submitted:', formData);
        
        // Show success message
        const tierName = getTierName(formData.targetTier);
        
        const successMessage = `
            <div class="success-message">
                <i class="fas fa-handshake"></i>
                <h3>Partnership Application Received!</h3>
                <p>Thank you for applying to become an RL Shine wholesaler. Our wholesale team will review your application for the <strong>${tierName}</strong> partnership.</p>
                <p>You will receive a confirmation email at ${formData.contactEmail} and a member of our team will contact you within 2 business days.</p>
                <p><small>Application ID: RLW-${Date.now().toString().slice(-6)}</small></p>
                <button class="btn-primary" onclick="location.reload()">OK</button>
            </div>
        `;
        
        // Create and show modal
        showModal('Application Submitted', successMessage, true);
        
        // Reset form after successful submission
        setTimeout(() => {
            if (wholesalerForm) {
                wholesalerForm.reset();
            }
        }, 100);
    }
    
    function getTierName(tierCode) {
        const tiers = {
            'silver': 'Silver Tier',
            'gold': 'Gold Tier',
            'platinum': 'Platinum Tier'
        };
        return tiers[tierCode] || tierCode;
    }
    
    // Show modal function
    function showModal(title, content, isHtml = false) {
        const modal = document.createElement('div');
        modal.className = 'wholesale-modal';
        
        const modalContent = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${isHtml ? content : `<p>${content}</p>`}
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
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
        
        // Style modal content
        const modalContentDiv = modal.querySelector('.modal-content');
        modalContentDiv.style.cssText = `
            background: white;
            border-radius: 15px;
            max-width: 500px;
            width: 100%;
            overflow: hidden;
            animation: modalFadeIn 0.3s ease;
        `;
        
        modal.querySelector('.modal-header').style.cssText = `
            background: #805ad5;
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        modal.querySelector('.modal-header h3').style.cssText = `
            margin: 0;
            font-size: 1.5rem;
        `;
        
        modal.querySelector('.modal-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            line-height: 1;
        `;
        
        modal.querySelector('.modal-body').style.cssText = `
            padding: 30px;
        `;
        
        if (!isHtml) {
            modal.querySelector('.modal-body p').style.cssText = `
                color: #4a5568;
                line-height: 1.6;
                margin: 0;
            `;
        } else {
            // Style HTML content
            const successDiv = modal.querySelector('.success-message');
            if (successDiv) {
                successDiv.style.cssText = `
                    text-align: center;
                `;
                
                successDiv.querySelector('i').style.cssText = `
                    color: #805ad5;
                    font-size: 3rem;
                    margin-bottom: 20px;
                `;
                
                successDiv.querySelector('h3').style.cssText = `
                    color: #1a202c;
                    margin-bottom: 15px;
                `;
                
                successDiv.querySelectorAll('p').forEach(p => {
                    p.style.cssText = `
                        color: #4a5568;
                        margin-bottom: 15px;
                        line-height: 1.6;
                    `;
                });
                
                successDiv.querySelector('.btn-primary').style.cssText = `
                    margin-top: 20px;
                    padding: 12px 30px;
                    background: #805ad5;
                `;
            }
        }
        
        document.body.appendChild(modal);
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        
        // Close button functionality
        modal.querySelector('.modal-close').addEventListener('click', function() {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        });
        
        // Close modal on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
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
            background: #805ad5;
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
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
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
});