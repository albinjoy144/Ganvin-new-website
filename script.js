function initMain() {
    // 1. Sticky Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Nav Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navDrawer    = document.querySelector('.nav-drawer');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mainHeader  = document.getElementById('main-header');

    function openNav() {
        mobileToggle.classList.add('open');
        navDrawer.classList.add('open');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        if (mainHeader)   mainHeader.classList.add('nav-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        mobileToggle.classList.remove('open');
        navDrawer.classList.remove('open');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        if (mainHeader)   mainHeader.classList.remove('nav-open');
        document.body.style.overflow = '';
    }

    if (mobileToggle && navDrawer) {
        mobileToggle.addEventListener('click', () => {
            navDrawer.classList.contains('open') ? closeNav() : openNav();
        });

        // Close on any nav link click
        navDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeNav);
        });
    }

    // Close on overlay click
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeNav);
    }


    // 3. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve once animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // 4. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const headerBtn = item.querySelector('.faq-header');
        if (headerBtn) {
            headerBtn.addEventListener('click', () => {
                // Close other items unless it's highlighted/special
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && !otherItem.classList.contains('highlighted')) {
                        otherItem.classList.remove('faq-open');
                    }
                });
                
                // Toggle faq-open class on clicked item
                item.classList.toggle('faq-open');
            });
        }
    });

    // 5. Testimonial Slider / Carousel
    const track = document.getElementById('testimonial-track');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    
    if (track && prevBtn && nextBtn) {
        let index = 0;
        const cards = track.querySelectorAll('.testimonial-card');
        const gap = 24; // 1.5rem in px
        
        function getSlideWidth() {
            if (window.innerWidth <= 992) {
                return track.offsetWidth; // 100% card width
            }
            return (track.offsetWidth - gap) / 2; // Two cards visible
        }

        function updateSlider() {
            const slideWidth = getSlideWidth();
            const maxIndex = cards.length - (window.innerWidth <= 992 ? 1 : 2);
            
            if (index < 0) index = 0;
            if (index > maxIndex) index = maxIndex;
            
            const offset = index * (slideWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        }

        nextBtn.addEventListener('click', () => {
            const maxIndex = cards.length - (window.innerWidth <= 992 ? 1 : 2);
            if (index < maxIndex) {
                index++;
                updateSlider();
            } else {
                index = 0; // wrap around
                updateSlider();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (index > 0) {
                index--;
                updateSlider();
            } else {
                index = cards.length - (window.innerWidth <= 992 ? 1 : 2); // wrap to end
                updateSlider();
            }
        });

        // Update width calculation on window resize
        window.addEventListener('resize', updateSlider);
    }

    // 6. Global Header Cart Badge Updater
    function updateGlobalHeaderCartBadge() {
        const storedCart = localStorage.getItem('ganvin_cart');
        let totalItems = 0;
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                if (parsed && parsed.items) {
                    for (const [itemId, qty] of Object.entries(parsed.items)) {
                        const q = parseInt(qty, 10);
                        if (!isNaN(q) && q > 0) {
                            const hiddenCats = parsed.hiddenCategories || [];
                            
                            // Map itemId to categoryId
                            let catId = null;
                            if (itemId === 'trial-pant' || itemId === 'trial-shirt') catId = 'trial-men';
                            else if (itemId === 'trial-saree') catId = 'trial-women';
                            else if (itemId === 'standard-shirt' || itemId === 'standard-pants') catId = 'standard-men';
                            else if (itemId === 'standard-suit') catId = 'standard-suits';

                            if (!catId || !hiddenCats.includes(catId)) {
                                totalItems += q;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error updating global cart badge", e);
            }
        }
        
        const desktopBadge = document.getElementById('cart-badge-count-desktop');
        const mobileBadge = document.getElementById('cart-badge-count-mobile');
        
        if (desktopBadge) desktopBadge.textContent = totalItems;
        if (mobileBadge) mobileBadge.textContent = totalItems;
    }
    
    updateGlobalHeaderCartBadge();
    
    window.addEventListener('storage', (e) => {
        if (e.key === 'ganvin_cart') {
            updateGlobalHeaderCartBadge();
        }
    });

    // Share helper globally
    window.updateGlobalCartBadge = updateGlobalHeaderCartBadge;

    // 7. Interactive Add To Cart Handler
    const bookingButtons = document.querySelectorAll('.open-booking');
    
    function showCartToast(message) {
        let toast = document.querySelector('.cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'cart-toast';
            document.body.appendChild(toast);
        }
        
        toast.innerHTML = `
            <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.25rem;"></i>
            <span class="cart-toast-msg">${message}</span>
            <a href="cart.html" class="cart-toast-link">View Cart ↗</a>
        `;
        
        // Trigger show animation
        setTimeout(() => toast.classList.add('active'), 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    function initCartData() {
        const stored = localStorage.getItem('ganvin_cart');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch(e) {}
        }
        return {
            items: {
                'trial-pant': 0,
                'trial-shirt': 0,
                'trial-saree': 0,
                'standard-shirt': 0,
                'standard-pants': 0,
                'standard-suit': 0
            },
            hiddenCategories: []
        };
    }

    bookingButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnText = btn.textContent.trim().toLowerCase();
            
            // Check if it's a standard trial button or book ironing
            if (btnText.includes('trial') || btnText.includes('book steam ironing')) {
                e.preventDefault();
                const cartData = initCartData();
                cartData.items['trial-pant'] = Math.max(cartData.items['trial-pant'] || 0, 1);
                cartData.items['trial-shirt'] = Math.max(cartData.items['trial-shirt'] || 0, 1);
                
                // If the categories were hidden, unhide them
                cartData.hiddenCategories = cartData.hiddenCategories.filter(cat => cat !== 'trial-men');
                
                localStorage.setItem('ganvin_cart', JSON.stringify(cartData));
                updateGlobalHeaderCartBadge();
                
                // Redirect straight to cart
                window.location.href = 'cart.html';
                return;
            }
            
            // Check if it's an "Add to Cart" or "Select Service" button in pricing-grid
            const pricingCard = btn.closest('.pricing-card');
            if (pricingCard) {
                e.preventDefault();
                const cardHeader = pricingCard.querySelector('h3');
                if (cardHeader) {
                    const cardTitle = cardHeader.textContent.trim();
                    let itemId = null;
                    let itemName = cardTitle;
                    
                    if (cardTitle.includes('Shirt')) {
                        itemId = 'standard-shirt';
                    } else if (cardTitle.includes('Trouser')) {
                        itemId = 'standard-pants';
                    } else if (cardTitle.includes('Suit')) {
                        itemId = 'standard-suit';
                    }
                    
                    if (itemId) {
                        const cartData = initCartData();
                        cartData.items[itemId] = (cartData.items[itemId] || 0) + 1;
                        
                        // Restore standard-men or standard-suits if they were hidden
                        const catId = itemId === 'standard-suit' ? 'standard-suits' : 'standard-men';
                        cartData.hiddenCategories = cartData.hiddenCategories.filter(cat => cat !== catId);
                        
                        localStorage.setItem('ganvin_cart', JSON.stringify(cartData));
                        updateGlobalHeaderCartBadge();
                        showCartToast(`Added ${itemName} to cart!`);
                    }
                }
            }
        });
    });

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
} else {
    initMain();
}

