document.addEventListener('DOMContentLoaded', () => {
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

    // 6. Interactive Booking Modal
    const bookingModal = document.getElementById('booking-modal');
    const openModalButtons = document.querySelectorAll('.open-booking');
    const closeModalButton = document.getElementById('close-modal');
    const modalForm = document.getElementById('booking-form');

    if (bookingModal && openModalButtons && closeModalButton) {
        openModalButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                bookingModal.classList.add('open');
                document.body.style.overflow = 'hidden'; // Lock background scroll
            });
        });

        closeModalButton.addEventListener('click', () => {
            bookingModal.classList.remove('open');
            document.body.style.overflow = ''; // Unlock background scroll
        });

        // Close on clicking outside modal content
        const modalOverlay = bookingModal.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                bookingModal.classList.remove('open');
                document.body.style.overflow = '';
            });
        }

        // Form Submit simulation
        if (modalForm) {
            modalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const service = document.getElementById('modal-service').value;
                const name = document.getElementById('modal-name').value;
                
                alert(`Thank you, ${name}! Your booking request for "${service}" has been received. Our valet agent will contact you shortly to schedule pickup.`);
                
                bookingModal.classList.remove('open');
                document.body.style.overflow = '';
                modalForm.reset();
            });
        }
    }
});
