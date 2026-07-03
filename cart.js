function initCart() {
    // 1. Define Pricing System
    const itemPrices = {
        'trial-pant': 1.00,
        'trial-shirt': 1.00,
        'trial-saree': 1.00,
        'standard-shirt': 4.50,
        'standard-pants': 6.50,
        'standard-suit': 14.00
    };

    // 2. Initialize Cart State from localStorage or Defaults
    let cart = {
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

    function loadCart() {
        const storedCart = localStorage.getItem('ganvin_cart');
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                if (parsed && parsed.items) {
                    cart = parsed;
                }
            } catch (e) {
                console.error("Failed to parse cart storage", e);
            }
        }
    }

    function saveCart() {
        localStorage.setItem('ganvin_cart', JSON.stringify(cart));
    }

    // 3. Sync UI with Cart State
    function syncUI() {
        // Sync item quantities in DOM
        for (const [itemId, qty] of Object.entries(cart.items)) {
            const qtyElement = document.getElementById(`qty-${itemId}`);
            if (qtyElement) {
                qtyElement.textContent = qty;
            }
        }

        // Sync hidden categories
        const categories = document.querySelectorAll('.cart-category-card');
        categories.forEach(cat => {
            const catId = cat.getAttribute('data-category');
            if (cart.hiddenCategories.includes(catId)) {
                cat.style.display = 'none';
            } else {
                cat.style.display = 'block';
            }
        });

        // If all categories in an accordion are hidden, show a nice empty message or keep the accordion clean
        checkAccordionEmptyStates();

        // Calculate and update totals
        calculateTotals();

        // Update header badges
        updateHeaderCartBadges();
    }

    function checkAccordionEmptyStates() {
        const panels = document.querySelectorAll('.cart-panel-content');
        panels.forEach(panel => {
            const visibleCategories = panel.querySelectorAll('.cart-category-card[style*="display: block"], .cart-category-card:not([style*="display: none"])');
            
            // If there's already an empty message, remove it first
            const existingMsg = panel.querySelector('.empty-acc-msg');
            if (existingMsg) existingMsg.remove();

            if (visibleCategories.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'empty-acc-msg text-center';
                emptyMsg.style.padding = '2rem 1rem';
                emptyMsg.style.color = 'var(--gray-muted)';
                emptyMsg.style.fontWeight = '500';
                emptyMsg.innerHTML = '<i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: var(--primary-light);"></i>All categories in this package were removed.';
                panel.appendChild(emptyMsg);
            }
        });
    }

    // 4. Calculate Subtotal, Tax, Delivery and Total
    function calculateTotals() {
        let subtotal = 0;

        // Sum up prices for visible categories/items only
        for (const [itemId, qty] of Object.entries(cart.items)) {
            // Find if item category is hidden
            const row = document.querySelector(`.cart-item-row[data-item-id="${itemId}"]`);
            if (row) {
                const catCard = row.closest('.cart-category-card');
                const catId = catCard ? catCard.getAttribute('data-category') : null;
                
                // Only count price if category is NOT hidden
                if (catId && !cart.hiddenCategories.includes(catId)) {
                    subtotal += qty * (itemPrices[itemId] || 0);
                }
            }
        }

        // Calculations
        // Tax is 18% GST if subtotal > 0
        const taxRate = 0.18;
        const tax = subtotal > 0 ? subtotal * taxRate : 0;

        // Delivery is free (0.00) on order >= 1.00 (without tax), otherwise 50.00 (if cart has items)
        let delivery = 0;
        if (subtotal > 0) {
            delivery = subtotal >= 1.00 ? 0.00 : 50.00;
        }

        const total = subtotal + tax + delivery;

        // Update Summary Elements in DOM
        const subtotalEl = document.getElementById('summary-subtotal');
        const taxEl = document.getElementById('summary-tax');
        const deliveryEl = document.getElementById('summary-delivery');
        const totalEl = document.getElementById('summary-total');

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`;
        if (deliveryEl) deliveryEl.textContent = `₹${delivery.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
    }

    // 5. Update Header Nav Badges globally
    function updateHeaderCartBadges() {
        let totalItems = 0;
        for (const [itemId, qty] of Object.entries(cart.items)) {
            // Only count if category is visible
            const row = document.querySelector(`.cart-item-row[data-item-id="${itemId}"]`);
            if (row) {
                const catCard = row.closest('.cart-category-card');
                const catId = catCard ? catCard.getAttribute('data-category') : null;
                if (!catId || !cart.hiddenCategories.includes(catId)) {
                    totalItems += qty;
                }
            } else {
                totalItems += qty; // fallback if element not on page
            }
        }

        const desktopBadge = document.getElementById('cart-badge-count-desktop');
        const mobileBadge = document.getElementById('cart-badge-count-mobile');

        if (desktopBadge) desktopBadge.textContent = totalItems;
        if (mobileBadge) mobileBadge.textContent = totalItems;
    }

    // 6. Dropdown Selection Toggles
    const dropdown = document.getElementById('service-dropdown');
    const dropdownHeader = dropdown ? dropdown.querySelector('.dropdown-header') : null;
    const dropdownContent = document.getElementById('dropdown-content');
    const dropdownButtons = document.querySelectorAll('.dropdown-list-item');
    const tabPanels = document.querySelectorAll('.cart-panel-content');
    const currentText = document.getElementById('dropdown-current-text');
    const currentIcon = document.getElementById('dropdown-current-icon');

    if (dropdownHeader && dropdownContent) {
        dropdownHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = dropdown.classList.contains('active');
            if (isActive) {
                dropdown.classList.remove('active');
                dropdownHeader.setAttribute('aria-expanded', 'false');
            } else {
                dropdown.classList.add('active');
                dropdownHeader.setAttribute('aria-expanded', 'true');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdown && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                dropdownHeader.setAttribute('aria-expanded', 'false');
            }
        });

        // Keyboard accessibility
        dropdownHeader.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                dropdownHeader.click();
            }
        });
    }

    dropdownButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const iconClass = btn.getAttribute('data-icon-class');
            const serviceName = btn.querySelector('span') ? btn.querySelector('span').textContent.trim() : btn.textContent.trim();

            // Update header text and icon
            if (currentText) currentText.textContent = serviceName;
            if (currentIcon && iconClass) {
                currentIcon.innerHTML = `<i class="${iconClass}"></i>`;
            }

            // Remove active classes
            dropdownButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(p => p.classList.remove('active'));

            // Add active classes
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const targetPanel = document.getElementById(`${targetId}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // Close dropdown
            if (dropdown) {
                dropdown.classList.remove('active');
                if (dropdownHeader) dropdownHeader.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // 7. Quantity Control Event Listeners
    const minusButtons = document.querySelectorAll('.quantity-change-btn.minus');
    const plusButtons = document.querySelectorAll('.quantity-change-btn.plus');

    minusButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-item');
            if (cart.items[itemId] > 0) {
                cart.items[itemId]--;
                saveCart();
                syncUI();
            }
        });
    });

    plusButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-item');
            cart.items[itemId] = (cart.items[itemId] || 0) + 1;
            saveCart();
            syncUI();
        });
    });

    // 8. Remove Category Event Listeners (Red Circle X)
    const removeCatButtons = document.querySelectorAll('.remove-category-btn');
    removeCatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const catId = btn.getAttribute('data-target');
            if (catId) {
                // Add to hidden categories list
                if (!cart.hiddenCategories.includes(catId)) {
                    cart.hiddenCategories.push(catId);
                }

                // Reset quantities of items inside this category to 0
                const catCard = document.getElementById(`cat-${catId}`);
                if (catCard) {
                    const rows = catCard.querySelectorAll('.cart-item-row');
                    rows.forEach(row => {
                        const itemId = row.getAttribute('data-item-id');
                        if (itemId) {
                            cart.items[itemId] = 0;
                        }
                    });
                }

                saveCart();
                syncUI();
            }
        });
    });

    // 9. Clear Cart Event Listener
    const clearCartBtn = document.getElementById('checkout-clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            // Reset quantities to 0
            for (const itemId of Object.keys(cart.items)) {
                cart.items[itemId] = 0;
            }
            // Clear hidden categories
            cart.hiddenCategories = [];

            saveCart();
            syncUI();
        });
    }

    // 10. Complete Booking Event Listener & Modal Integration
    const completeBookingBtn = document.getElementById('checkout-complete-booking-btn');
    const successModal = document.getElementById('success-modal');
    const successModalCloseBtn = document.getElementById('success-modal-close-btn');

    if (completeBookingBtn && successModal) {
        completeBookingBtn.addEventListener('click', () => {
            // Calculate total items
            let totalQty = 0;
            for (const [itemId, qty] of Object.entries(cart.items)) {
                const row = document.querySelector(`.cart-item-row[data-item-id="${itemId}"]`);
                if (row) {
                    const catCard = row.closest('.cart-category-card');
                    const catId = catCard ? catCard.getAttribute('data-category') : null;
                    if (!catId || !cart.hiddenCategories.includes(catId)) {
                        totalQty += qty;
                    }
                }
            }

            if (totalQty === 0) {
                alert("Your cart is empty! Please add items to complete your booking.");
                return;
            }

            // Calculate exact total amount
            let subtotal = 0;
            for (const [itemId, qty] of Object.entries(cart.items)) {
                const row = document.querySelector(`.cart-item-row[data-item-id="${itemId}"]`);
                if (row) {
                    const catCard = row.closest('.cart-category-card');
                    const catId = catCard ? catCard.getAttribute('data-category') : null;
                    if (catId && !cart.hiddenCategories.includes(catId)) {
                        subtotal += qty * (itemPrices[itemId] || 0);
                    }
                }
            }
            const tax = subtotal * 0.18;
            const delivery = subtotal >= 1.00 ? 0.00 : 50.00;
            const finalTotal = subtotal + tax + delivery;

            // Generate Random Order ID
            const randomId = 'GVN-2026-' + Math.floor(10000 + Math.random() * 90000);
            
            // Update modal text fields
            const receiptOrderEl = document.getElementById('receipt-order-id');
            const receiptAmountEl = document.getElementById('receipt-total-amount');

            if (receiptOrderEl) receiptOrderEl.textContent = randomId;
            if (receiptAmountEl) receiptAmountEl.textContent = `₹${finalTotal.toFixed(2)}`;

            // Display success modal
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // prevent scrolling behind modal
        });
    }

    if (successModalCloseBtn && successModal) {
        successModalCloseBtn.addEventListener('click', () => {
            // Close modal
            successModal.classList.remove('active');
            document.body.style.overflow = '';

            // Reset cart in UI and storage
            for (const itemId of Object.keys(cart.items)) {
                cart.items[itemId] = 0;
            }
            cart.hiddenCategories = [];
            saveCart();
            syncUI();

            // Optionally, redirect to home page or services section
            window.location.href = 'index.html#services';
        });
    }

    // 11. Run initial logic
    loadCart();
    syncUI();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}
