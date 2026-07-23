// JavaScript for Ganvin Login Page - Interactive Behaviors

document.addEventListener('DOMContentLoaded', () => {
    // Custom Toast Notification System
    function showToast(message, type = 'error') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconClass = 'fa-circle-info info';
        if (type === 'error') iconClass = 'fa-circle-exclamation error';
        if (type === 'success') iconClass = 'fa-circle-check success';
        if (type === 'info') iconClass = 'fa-circle-info info';
        
        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Trigger reflow to enable transition
        toast.offsetHeight;
        
        // Show toast
        toast.classList.add('show');
        
        // Remove toast after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3500);
    }

    // 1. Password Visibility Toggle
    const passwordInput = document.getElementById('password-input');
    const passwordToggleBtn = document.getElementById('password-toggle');
    
    if (passwordInput && passwordToggleBtn) {
        passwordToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = passwordToggleBtn.querySelector('i');
            if (icon) {
                if (type === 'text') {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                } else {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            }
        });
    }

    // 2. OTP Mode Toggle
    const otpToggle = document.getElementById('otp-toggle');
    const passwordGroup = document.getElementById('password-group');
    const otpGroup = document.getElementById('otp-group');
    const loginButton = document.getElementById('login-btn');
    const usernameLabel = document.getElementById('username-label');
    const usernameInput = document.getElementById('username-input');

    let isOtpMode = false;

    if (otpToggle && passwordGroup && otpGroup && loginButton) {
        otpToggle.addEventListener('click', (e) => {
            e.preventDefault();
            isOtpMode = !isOtpMode;

            if (isOtpMode) {
                // Switch to OTP Mode
                passwordGroup.style.display = 'none';
                otpGroup.style.display = 'flex';
                otpToggle.textContent = 'Sign in with Password';
                loginButton.textContent = 'Verify & Signin';
                usernameLabel.innerHTML = 'Mobile Number <span>*</span>';
                usernameInput.setAttribute('placeholder', 'Enter Your Mobile Number');
                usernameInput.setAttribute('type', 'tel');
                usernameInput.value = '';
                
                // Focus on first OTP input
                const firstOtpInput = otpGroup.querySelector('.otp-digit');
                if (firstOtpInput) firstOtpInput.focus();
            } else {
                // Switch to Password Mode
                passwordGroup.style.display = 'flex';
                otpGroup.style.display = 'none';
                otpToggle.textContent = 'Sign in with OTP';
                loginButton.textContent = 'Signin';
                usernameLabel.innerHTML = 'Mobile Number / Email <span>*</span>';
                usernameInput.setAttribute('placeholder', 'Enter Your Phone/Email');
                usernameInput.setAttribute('type', 'text');
                usernameInput.value = '';
            }
        });
    }

    // 3. OTP Inputs Auto-focus behavior
    const otpInputs = document.querySelectorAll('.otp-digit');
    if (otpInputs.length > 0) {
        otpInputs.forEach((input, idx) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= 0 && e.key <= 9) {
                    // Next input auto-focus
                    if (idx < otpInputs.length - 1) {
                        otpInputs[idx + 1].focus();
                    }
                } else if (e.key === 'Backspace') {
                    // Backspace auto-focus previous
                    if (idx > 0) {
                        otpInputs[idx - 1].focus();
                    }
                }
            });
            
            // Prevent non-numeric characters
            input.addEventListener('keydown', (e) => {
                if (e.key !== 'Backspace' && e.key !== 'Tab' && isNaN(Number(e.key))) {
                    e.preventDefault();
                }
            });
        });
    }

    // 4. Interactive Promo Card Slide Dots
    const promoDots = document.querySelectorAll('.promo-dot');
    const promoCaption = document.getElementById('promo-caption');
    const captions = [
        "Experience premium care for your everyday wardrobe with <span>Ganvin</span>",
        "Enjoy 60-minute express steam ironing right at your doorstep with <span>Ganvin</span>",
        "State-of-the-art dry cleaning and fabric washing designed for <span>maximum confidence</span>"
    ];

    if (promoDots.length > 0 && promoCaption) {
        promoDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Remove active class from all
                promoDots.forEach(d => d.classList.remove('active'));
                // Add active to clicked
                dot.classList.add('active');
                
                // Animate caption transition
                promoCaption.style.opacity = 0;
                promoCaption.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    promoCaption.innerHTML = captions[index];
                    promoCaption.style.opacity = 1;
                    promoCaption.style.transform = 'translateY(0)';
                }, 200);
            });
        });
        
        // CSS transitions for opacity/transform animation
        promoCaption.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    }

    // Forgot Password Click Action
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Password reset link sent to your email / phone.', 'info');
        });
    }

    // 5. Submit Event with validation feedback
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            if (!username) {
                showToast(isOtpMode ? 'Please enter your mobile number.' : 'Please enter your phone number or email.');
                usernameInput.focus();
                return;
            }

            if (isOtpMode) {
                // Check OTP inputs
                let otp = '';
                otpInputs.forEach(input => otp += input.value);
                if (otp.length < 4) {
                    showToast('Please enter the full verification OTP.');
                    otpInputs[0].focus();
                    return;
                }
                
                // Show success animation or redirect
                loginButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
                setTimeout(() => {
                    showToast('OTP verified successfully!', 'success');
                    loginButton.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verified!';
                    loginButton.style.backgroundColor = '#10b981'; // Success emerald color
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }, 1200);
            } else {
                const password = passwordInput.value;
                if (!password) {
                    showToast('Please enter your password.');
                    passwordInput.focus();
                    return;
                }

                // Show success feedback
                loginButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
                setTimeout(() => {
                    showToast('Logged in successfully!', 'success');
                    loginButton.innerHTML = '<i class="fa-solid fa-circle-check"></i> Success!';
                    loginButton.style.backgroundColor = '#10b981'; // Success emerald color
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }, 1200);
            }
        });
    }
});

