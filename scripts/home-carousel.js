// ============================================
// PROFESSIONAL AUTO-SWIPE CAROUSEL
// RL SHINE - Premium Buyer Cards
// Features: Auto-swipe (3s), Manual arrows, Dots, Pause on hover
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Carousel Elements
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-track .buyer-card');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    
    // Configuration
    let currentIndex = 0;
    let slidesPerView = 1;
    let totalSlides = slides.length;
    let autoSlideInterval;
    const AUTO_SLIDE_DELAY = 3000; // 3 seconds
    let isHovering = false;
    
    // Calculate slides per view based on screen width
    function updateSlidesPerView() {
        if (window.innerWidth >= 1024) {
            slidesPerView = 3;
        } else if (window.innerWidth >= 768) {
            slidesPerView = 2;
        } else {
            slidesPerView = 1;
        }
        updateCarousel();
    }
    
    // Calculate slide width
    function getSlideWidth() {
        if (!track || slides.length === 0) return 0;
        const trackStyle = getComputedStyle(track);
        const gap = parseInt(trackStyle.gap) || 30;
        const containerWidth = track.parentElement.clientWidth;
        const slideWidth = (containerWidth - (gap * (slidesPerView - 1))) / slidesPerView;
        return slideWidth;
    }
    
    // Update slide widths
    function updateSlideWidths() {
        const slideWidth = getSlideWidth();
        slides.forEach(slide => {
            slide.style.flex = `0 0 ${slideWidth}px`;
        });
    }
    
    // Update carousel position
    function updateCarousel() {
        if (!track || slides.length === 0) return;
        
        const slideWidth = getSlideWidth();
        const gap = 30;
        const translateX = currentIndex * (slideWidth + gap);
        track.style.transform = `translateX(-${translateX}px)`;
        
        updateDots();
        updateArrows();
    }
    
    // Update dots active state
    function updateDots() {
        const dots = document.querySelectorAll('.carousel-dot');
        const maxIndex = totalSlides - slidesPerView;
        
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Update arrows disabled state
    function updateArrows() {
        const maxIndex = totalSlides - slidesPerView;
        
        if (prevBtn) {
            if (currentIndex <= 0) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
        }
        
        if (nextBtn) {
            if (currentIndex >= maxIndex) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
    }
    
    // Go to next slide
    function nextSlide() {
        const maxIndex = totalSlides - slidesPerView;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
            resetAutoSlide();
        } else {
            // Loop back to first slide
            currentIndex = 0;
            updateCarousel();
            resetAutoSlide();
        }
    }
    
    // Go to previous slide
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
            resetAutoSlide();
        } else {
            // Loop to last slide
            currentIndex = totalSlides - slidesPerView;
            updateCarousel();
            resetAutoSlide();
        }
    }
    
    // Go to specific slide
    function goToSlide(index) {
        const maxIndex = totalSlides - slidesPerView;
        if (index >= 0 && index <= maxIndex) {
            currentIndex = index;
            updateCarousel();
            resetAutoSlide();
        }
    }
    
    // Create dots
    function createDots() {
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        const maxIndex = totalSlides - slidesPerView;
        
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    // ============================================
    // AUTO SLIDE FUNCTIONALITY
    // ============================================
    
    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        
        autoSlideInterval = setInterval(() => {
            if (!isHovering) {
                nextSlide();
            }
        }, AUTO_SLIDE_DELAY);
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }
    
    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }
    
    // Pause on hover
    function setupHoverPause() {
        const carouselContainer = document.querySelector('.buyer-carousel');
        if (!carouselContainer) return;
        
        carouselContainer.addEventListener('mouseenter', () => {
            isHovering = true;
            stopAutoSlide();
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            isHovering = false;
            startAutoSlide();
        });
    }
    
    // ============================================
    // TOUCH SWIPE SUPPORT (Mobile)
    // ============================================
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    function setupTouchSwipe() {
        const carouselWrapper = document.querySelector('.carousel-wrapper');
        if (!carouselWrapper) return;
        
        carouselWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        });
        
        carouselWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) < swipeThreshold) return;
        
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
    
    // ============================================
    // RESIZE HANDLER
    // ============================================
    
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const oldSlidesPerView = slidesPerView;
            updateSlidesPerView();
            
            if (oldSlidesPerView !== slidesPerView) {
                const maxIndex = totalSlides - slidesPerView;
                if (currentIndex > maxIndex) {
                    currentIndex = Math.max(0, maxIndex);
                }
            }
            
            updateSlideWidths();
            updateCarousel();
            createDots();
        }, 150);
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        if (slides.length === 0) return;
        
        updateSlidesPerView();
        updateSlideWidths();
        createDots();
        updateCarousel();
        startAutoSlide();
        setupHoverPause();
        setupTouchSwipe();
        
        // Event Listeners
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        window.addEventListener('resize', handleResize);
    }
    
    init();
});
