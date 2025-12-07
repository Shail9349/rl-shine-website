// Contact page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Close other open FAQs
            faqQuestions.forEach(q => {
                if (q !== this) {
                    q.classList.remove('active');
                    const answer = q.nextElementSibling;
                    answer.classList.remove('active');
                }
            });
            
            // Toggle current FAQ
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            answer.classList.toggle('active');
        });
    });
    
    // Form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };
            
            // Validate form
            if (validateContactForm(formData)) {
                submitContactForm(formData);
            }
        });
    }
    
    // Form validation
    function validateContactForm(data) {
        // Simple validation
        if (!data.name.trim()) {
            alert('Please enter your name');
            return false;
        }
        
        if (!data.email.trim() || !isValidEmail(data.email)) {
            alert('Please enter a valid email address');
            return false;
        }
        
        if (!data.subject) {
            alert('Please select a subject');
            return false;
        }
        
        if (!data.message.trim()) {
            alert('Please enter your message');
            return false;
        }
        
        return true;
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Submit contact form (simulated)
    function submitContactForm(formData) {
        // In production, this would send data to a server
        console.log('Contact form submitted:', formData);
        
        // Show success message
        const successMessage = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for contacting RL Shine. We've received your message about <strong>${getSubjectName(formData.subject)}</strong> and will respond within 24 hours.</p>
                <p>A confirmation email has been sent to ${formData.email}.</p>
                <button class="btn-primary" onclick="location.reload()">Send Another Message</button>
            </div>
        `;
        
        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
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
            background: #38a169;
        `;
        
        document.body.appendChild(modal);
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        
        // Close modal on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
                contactForm.reset();
            }
        });
        
        // Reset form after successful submission
        setTimeout(() => {
            contactForm.reset();
        }, 100);
    }
    
    function getSubjectName(subjectCode) {
        const subjects = {
            'general': 'General Inquiry',
            'product': 'Product Questions',
            'order': 'Order Support',
            'retail': 'Retail Partnership',
            'wholesale': 'Wholesale Partnership',
            'other': 'Other'
        };
        return subjects[subjectCode] || subjectCode;
    }
    
    // Add animation for FAQ answers
    const style = document.createElement('style');
    style.textContent = `
        .faq-answer {
            transition: max-height 0.3s ease, padding 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});