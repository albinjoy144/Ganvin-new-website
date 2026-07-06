document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const submitBtn = contactForm.querySelector('.form-submit-btn');
    const initialBtnContent = submitBtn.innerHTML;

    // Contact Success Modal Elements
    const successModal = document.getElementById('contact-success-modal');
    const successModalCloseBtn = document.getElementById('contact-modal-close-btn');
    const referenceIdEl = document.getElementById('contact-reference-id');
    const inquiryTypeEl = document.getElementById('contact-inquiry-type');

    // Create error/info message element placeholder in the form
    const formMessage = document.createElement('div');
    formMessage.className = 'form-message-banner';
    formMessage.style.display = 'none';
    contactForm.insertBefore(formMessage, contactForm.firstChild);

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset previous state
        formMessage.style.display = 'none';
        formMessage.className = 'form-message-banner';
        formMessage.textContent = '';
        
        // Remove existing error highlights
        const inputs = contactForm.querySelectorAll('.form-input');
        inputs.forEach(input => input.classList.remove('input-error'));

        // Client-side validation values
        const fullName = document.getElementById('full-name').value.trim();
        const emailAddress = document.getElementById('email-address').value.trim();
        const serviceInquiry = document.getElementById('service-inquiry').value;
        const yourMessage = document.getElementById('your-message').value.trim();

        let hasError = false;

        if (!fullName) {
            highlightError('full-name');
            hasError = true;
        }
        if (!emailAddress || !validateEmail(emailAddress)) {
            highlightError('email-address');
            hasError = true;
        }
        if (!yourMessage) {
            highlightError('your-message');
            hasError = true;
        }

        if (hasError) {
            showFormMessage('Please check the highlighted fields for errors.', 'error');
            return;
        }

        // Disable button & show spinner
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin" style="margin-right: 8px;"></i> Sending...`;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: fullName,
                    email: emailAddress,
                    inquiry: serviceInquiry,
                    message: yourMessage
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Generate a random-like reference ID locally for aesthetics
                const refId = 'REF-' + Math.floor(100000 + Math.random() * 900000);
                if (referenceIdEl) referenceIdEl.textContent = refId;
                if (inquiryTypeEl) {
                    const inquiryLabels = {
                        'steam-ironing': 'Steam Ironing',
                        'dry-cleaning': 'Dry Cleaning',
                        'wash-fold': 'Wash & Fold',
                        'other': 'Other Inquiry'
                    };
                    inquiryTypeEl.textContent = inquiryLabels[serviceInquiry] || serviceInquiry;
                }

                // Show Success Modal
                if (successModal) {
                    successModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                // Reset form
                contactForm.reset();
            } else {
                showFormMessage(data.message || 'Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showFormMessage('Could not connect to the server. Please verify your connection.', 'error');
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = initialBtnContent;
        }
    });

    // Close Modal Handler
    if (successModalCloseBtn && successModal) {
        successModalCloseBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    function highlightError(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('input-error');
            
            // Remove error state on user input
            const removeError = () => {
                el.classList.remove('input-error');
                el.removeEventListener('input', removeError);
            };
            el.addEventListener('input', removeError);
        }
    }

    function showFormMessage(msg, type) {
        formMessage.textContent = msg;
        formMessage.style.display = 'block';
        if (type === 'error') {
            formMessage.classList.add('error-banner');
        } else {
            formMessage.classList.add('success-banner');
        }
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
