/**
 * Main JavaScript - Enhanced functionality for RightCareHome [NEW 2024]
 * Modern JavaScript with updated color palette and enhanced features
 */

// ===== UPDATED COLOR CONSTANTS - 2024 PALETTE =====
const COLORS = {
    primary: '#4A90E2',
    primaryDark: '#2C5F8B', 
    primaryLight: '#6DA3E8',
    accent: '#E8B86D',
    accentHover: '#D4A355',
    success: '#6BBF59',
    successDark: '#059669',
    textPrimary: '#2D3748',
    textSecondary: '#4A5568',
    backgroundWarm: '#F7F5F3',
    backgroundSoft: '#FAF8F5',
    borderWarm: '#E2D7CC',
    error: '#EF4444',
    warning: '#F59E0B'
};

// ===== UNIVERSAL FORM VALIDATION SYSTEM =====
const FormValidation = {
    // Universal form message display function
    showFormMessage(message, type = 'error', elementId = null, duration = 5000) {
        // Remove existing messages
        this.clearFormMessages();
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;
        messageEl.setAttribute('role', 'alert');
        messageEl.setAttribute('aria-live', 'polite');
        
        // Find target container
        let targetContainer;
        if (elementId) {
            targetContainer = document.getElementById(elementId);
        } else {
            // Try to find a form message container
            targetContainer = document.querySelector('.form-message-container') || 
                            document.querySelector('form') || 
                            document.body;
        }
        
        if (targetContainer) {
            targetContainer.appendChild(messageEl);
            
            // Auto-remove after duration (except for errors)
            if (type !== 'error' && duration > 0) {
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.style.opacity = '0';
                        messageEl.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            if (messageEl.parentNode) {
                                messageEl.remove();
                            }
                        }, 300);
                    }
                }, duration);
            }
        }
        
        return messageEl;
    },
    
    // Clear all form messages
    clearFormMessages() {
        document.querySelectorAll('.form-message').forEach(msg => msg.remove());
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
    },
    
    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate UK postcode
    validatePostcode(postcode) {
        const postcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$/i;
        return postcodeRegex.test(postcode.trim());
    },
    
    // Show field error
    showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('success');
        
        let errorEl = field.parentElement.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            errorEl.setAttribute('role', 'alert');
            field.parentElement.appendChild(errorEl);
        }
        
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    },
    
    // Clear field error
    clearFieldError(field) {
        field.classList.remove('error');
        field.classList.add('success');
        
        const errorEl = field.parentElement.querySelector('.form-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }
};

// ===== ENHANCED UTILITY FUNCTIONS =====
const Utils = {
    // Enhanced fade in animation with performance improvements
    initFadeInAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Use requestAnimationFrame for smooth animations
                    requestAnimationFrame(() => {
                        entry.target.classList.add('visible');
                        // Unobserve after animation to improve performance
                        observer.unobserve(entry.target);
                    });
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    },

    // Auto-trigger animations on load with performance optimization
    triggerAnimationsOnLoad() {
        document.addEventListener('DOMContentLoaded', () => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    document.querySelectorAll('.fade-in').forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('visible');
                        }, index * 50); // Staggered animation
                    });
                }, 200);
            });
        });
    },

    // Enhanced keyboard navigation support
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            // Enhanced Enter key support for multiple elements
            if (e.key === 'Enter') {
                const target = e.target;
                if (target.classList.contains('rating-btn') || 
                    target.classList.contains('card-interactive') ||
                    target.classList.contains('btn-keyboard-accessible')) {
                    e.preventDefault();
                    target.click();
                }
            }

            // Escape key to close modals or forms
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    this.closeModal(modal);
                }
            }

            // Arrow key navigation improvements
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.handleArrowNavigation(e);
            }
        });
    },

    handleArrowNavigation(e) {
        const target = e.target;
        if (target.classList.contains('rating-btn')) {
            e.preventDefault();
            const ratingGroup = target.closest('.rating-group');
            if (ratingGroup) {
                const buttons = Array.from(ratingGroup.querySelectorAll('.rating-btn'));
                const currentIndex = buttons.indexOf(target);
                let nextIndex;

                if (e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                } else {
                    nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                }

                buttons[nextIndex]?.focus();
            }
        }
    },

    // Enhanced notification system with modern styling
    showNotification(message, type = 'success', duration = 5000) {
        // Remove existing notifications
        document.querySelectorAll('.success-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'success-notification notification-modern';

        // Apply modern color scheme
        const styles = {
            success: { bg: COLORS.success, color: 'white' },
            error: { bg: COLORS.error, color: 'white' },
            warning: { bg: COLORS.warning, color: 'white' },
            info: { bg: COLORS.primary, color: 'white' }
        };

        const style = styles[type] || styles.info;
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: style.bg,
            color: style.color,
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(45, 55, 72, 0.15)',
            zIndex: '10000',
            fontWeight: '600',
            fontSize: '16px',
            maxWidth: '400px',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${style.bg}15`
        });

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Auto-remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    // Enhanced reference number generation
    generateReferenceNumber() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        return `RCH-${year}${month}${day}-${random}`;
    },

    // Enhanced URL parameters handling
    getUrlParams() {
        return new URLSearchParams(window.location.search);
    },

    // Smooth scroll with modern API
    scrollToTop(behavior = 'smooth') {
        window.scrollTo({ 
            top: 0, 
            behavior,
            block: 'start'
        });
    },

    // Enhanced local storage with better error handling
    saveToStorage(key, data, expiration = 24 * 60 * 60 * 1000) {
        try {
            const item = {
                data: data,
                expiry: Date.now() + expiration,
                version: '2024.1' // Version for future compatibility
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    },

    loadFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const parsed = JSON.parse(item);

            // Check expiration
            if (Date.now() > parsed.expiry) {
                localStorage.removeItem(key);
                return null;
            }

            return parsed.data;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            localStorage.removeItem(key);
            return null;
        }
    },

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
            return false;
        }
    },

    // Enhanced analytics with better error handling
    trackEvent(eventName, eventData = {}) {
        try {
            // Google Analytics 4 tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    ...eventData,
                    timestamp: new Date().toISOString(),
                    page_url: window.location.href,
                    page_title: document.title
                });
            }

            // Console logging for development with structured data
            console.log('%cEvent tracked:', 'color: #4A90E2; font-weight: bold;', {
                event: eventName,
                data: eventData,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
            return false;
        }
    },

    // Enhanced form validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email?.trim?.());
    },

    validatePhone(phone) {
        if (!phone) return false;
        const cleaned = phone.replace(/\s/g, '');
        const re = /^[\+]?[\d\s\-\(\)]{7,15}$/;
        return re.test(cleaned);
    },

    // Enhanced phone number formatting
    formatPhoneNumber(phone) {
        if (!phone) return '';

        const cleaned = phone.replace(/\D/g, '');

        // UK phone number formatting
        if (cleaned.startsWith('44')) {
            return '+44 ' + cleaned.slice(2).replace(/(\d{2})(\d{4})(\d{6})/, '$1 $2 $3');
        }

        if (cleaned.startsWith('0') && cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{3})(\d{3})/, '$1 $2 $3 $4');
        }

        return phone;
    },

    // Enhanced loading state management
    showLoading(button, loadingText = 'Processing...') {
        if (!button) return null;

        const originalText = button.innerHTML;
        const originalDisabled = button.disabled;

        button.innerHTML = `
            <span class="loading-spinner"></span>
            ${loadingText}
        `;
        button.disabled = true;
        button.classList.add('loading-state');

        return { originalText, originalDisabled };
    },

    hideLoading(button, originalState) {
        if (!button || !originalState) return;

        button.innerHTML = originalState.originalText;
        button.disabled = originalState.originalDisabled;
        button.classList.remove('loading-state');
    },

    // Enhanced device detection
    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Enhanced accessibility helpers
    announceToScreenReader(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    },

    // Enhanced focus management
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        firstElement?.focus();
    },

    // Modal management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        this.trapFocus(modal);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    },

    closeModal(modal) {
        if (!modal) return;

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        // Restore body scroll
        document.body.style.overflow = '';
    },

    // Enhanced print preparation
    preparePrintView() {
        const printStyles = document.createElement('style');
        printStyles.textContent = `
            @media print {
                header, footer, .no-print { display: none !important; }
                main { padding-top: 0 !important; }
                .card { break-inside: avoid; }
                .btn { display: none !important; }
                * { 
                    color: black !important; 
                    background: white !important;
                }
                .chart-container { 
                    max-height: 300px !important;
                }
            }
        `;

        if (!document.head.querySelector('[data-print-styles]')) {
            printStyles.setAttribute('data-print-styles', 'true');
            document.head.appendChild(printStyles);
        }
    },

    // Debounce utility for performance
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle utility for performance
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ===== ENHANCED NAVIGATION HELPERS =====
const Navigation = {
    // Enhanced external links handling
    initExternalLinks() {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');

                // Add security and analytics
                link.addEventListener('click', (e) => {
                    Utils.trackEvent('external_link_click', {
                        url: link.href,
                        text: link.textContent.trim()
                    });
                });
            }
        });
    },

    // Enhanced smooth scroll with intersection observer
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    // Update URL without triggering scroll
                    history.pushState(null, '', targetId);

                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Update focus for accessibility
                    target.focus({ preventScroll: true });
                }
            });
        });
    },

    // Breadcrumb navigation
    updateBreadcrumb(items) {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (!breadcrumb) return;

        breadcrumb.innerHTML = items.map((item, index) => {
            const isLast = index === items.length - 1;
            const tag = isLast ? 'span' : 'a';
            const href = isLast ? '' : `href="${item.url}"`;

            return `
                <${tag} ${href} class="${isLast ? 'current' : 'breadcrumb-link'}">
                    ${item.text}
                </${tag}>
                ${!isLast ? '<span class="separator">→</span>' : ''}
            `;
        }).join('');
    }
};

// ===== ENHANCED PERFORMANCE HELPERS =====
const Performance = {
    // Enhanced resource preloading
    preloadResources() {
        const criticalResources = [
            { href: '/assets/css/base-55plus.css', as: 'style' },
            { href: '/assets/css/components.css', as: 'style' },
            { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap', as: 'style' },
            { href: '/assets/js/chart.min.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;

            if (resource.as === 'font') {
                link.crossOrigin = 'anonymous';
            }

            document.head.appendChild(link);
        });
    },

    // Enhanced lazy loading with modern API
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;

                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }

                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            img.removeAttribute('data-srcset');
                        }

                        img.classList.remove('lazy-loading');
                        img.classList.add('lazy-loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                img.classList.add('lazy-loading');
                imageObserver.observe(img);
            });
        }
    },

    // Connection speed optimization
    adaptToConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;

            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Disable non-essential animations
                document.documentElement.classList.add('reduced-motion');

                // Reduce image quality
                document.querySelectorAll('img').forEach(img => {
                    if (img.dataset.srcLow) {
                        img.src = img.dataset.srcLow;
                    }
                });
            }
        }
    }
};

// ===== MAIN INITIALIZATION WITH ENHANCED ERROR HANDLING =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Core initialization with performance timing
        const startTime = performance.now();

        // Initialize core utilities
        Utils.initFadeInAnimations();
        Utils.addKeyboardSupport();

        // Initialize navigation
        Navigation.initExternalLinks();
        Navigation.initSmoothScroll();

        // Performance optimizations
        Performance.preloadResources();
        Performance.lazyLoadImages();
        Performance.adaptToConnection();

        // Accessibility improvements
        Utils.preparePrintView();

        // Enhanced area selector functionality
        Utils.initAreaSelector();

        // Enhanced form handling
        Utils.initEnhancedForms();

        // Header scroll behavior with throttling
        Utils.initHeaderScrollBehavior();

        // Enhanced CTA handling
        Utils.initEnhancedCTAs();

        // FAQ functionality
        Utils.initFAQs();

        // Enhanced pricing cards
        Utils.initPricingCards();

        const endTime = performance.now();
        console.log(`%cRightCareHome initialized in ${(endTime - startTime).toFixed(2)}ms`, 
                   'color: #4A90E2; font-weight: bold;');

        // Track initialization
        Utils.trackEvent('app_initialized', {
            load_time_ms: Math.round(endTime - startTime),
            user_agent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        });

    } catch (error) {
        console.error('Initialization error:', error);

        // Fallback initialization
        Utils.showNotification('Some features may not work properly. Please refresh the page.', 'warning');
    }
});

// ===== ENHANCED COMPONENT INITIALIZERS =====
Utils.initAreaSelector = function() {
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', Utils.debounce(function() {
            const selectedArea = this.value;
            if (selectedArea === 'birmingham') {
                Utils.trackEvent('area_selected', { area: 'birmingham' });
                window.location.href = '/birmingham/';
            } else if (selectedArea && selectedArea !== '' && !this.options[this.selectedIndex].disabled) {
                Utils.trackEvent('area_selected', { area: selectedArea });
                window.location.href = `/${selectedArea}/`;
            }
        }, 300));
    });

    // Enhanced area cards with modern interaction
    document.querySelectorAll('.area-card').forEach(card => {
        const button = card.querySelector('button');
        if (button?.textContent.includes('Birmingham')) {
            const handleNavigation = Utils.debounce((e) => {
                e.preventDefault();
                card.style.transform = 'scale(0.98)';
                Utils.trackEvent('birmingham_card_click', { 
                    interaction_type: 'card_click' 
                });

                setTimeout(() => {
                    window.location.href = '/birmingham/';
                }, 150);
            }, 300);

            card.addEventListener('click', handleNavigation);
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                handleNavigation(e);
            });
        }
    });
};

Utils.initEnhancedForms = function() {
    const guideForms = document.querySelectorAll('.guide-form, form');

    // UK Postcode Validation
function validateUKPostcode(postcode) {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim().toUpperCase());
}

// Email Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// Format postcode as user types
const postcodeInput = document.getElementById('guide-postcode');
if (postcodeInput) {
    postcodeInput.addEventListener('input', function(e) {
        // Convert to uppercase
        this.value = this.value.toUpperCase();
        
        // Remove any spaces
        let value = this.value.replace(/\s/g, '');
        
        // Add space before last 3 characters if length > 3
        if (value.length > 3) {
            value = value.slice(0, -3) + ' ' + value.slice(-3);
        }
        
        this.value = value;
        
        // Clear error if field is being corrected
        if (this.classList.contains('error')) {
            this.classList.remove('error');
            document.getElementById('postcode-error').classList.add('hidden');
        }
    });
}

// Clear email error on input
const emailInput = document.getElementById('guide-email');
if (emailInput) {
    emailInput.addEventListener('input', function() {
        if (this.classList.contains('error')) {
            this.classList.remove('error');
            document.getElementById('email-error').classList.add('hidden');
        }
    });
}

// Form Submission
const guideForm = document.getElementById('guide-form');
if (guideForm) {
    guideForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const postcodeField = document.getElementById('guide-postcode');
        const emailField = document.getElementById('guide-email');
        const postcodeError = document.getElementById('postcode-error');
        const emailError = document.getElementById('email-error');
        
        const postcode = postcodeField.value.trim();
        const email = emailField.value.trim();
        
        let isValid = true;
        
        // Validate Postcode
        if (!validateUKPostcode(postcode)) {
            postcodeField.classList.add('error');
            postcodeError.classList.remove('hidden');
            isValid = false;
        } else {
            postcodeField.classList.remove('error');
            postcodeError.classList.add('hidden');
        }
        
        // Validate Email
        if (!validateEmail(email)) {
            emailField.classList.add('error');
            emailError.classList.remove('hidden');
            isValid = false;
        } else {
            emailField.classList.remove('error');
            emailError.classList.add('hidden');
        }
        
        if (!isValid) {
            return;
        }
        
        // If valid, submit the form
        const button = this.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        button.innerHTML = '⏳ Sending...';
        button.disabled = true;
        
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            // Success state - show nurture preview
            showSuccessMessage(email);
            
            console.log('Form submitted:', { postcode, email });
            
        } catch (error) {
            button.innerHTML = originalText;
            button.disabled = false;
            console.error('Form submission error:', error);
        }
    });
}
};

Utils.initHeaderScrollBehavior = function() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = Utils.throttle(() => {
        const scrollY = window.scrollY;

        // Background and shadow changes
        if (scrollY > 100) {
            header.style.background = `rgba(247, 245, 243, 0.98)`;
            header.style.boxShadow = '0 4px 32px rgba(45, 55, 72, 0.12)';
            header.classList.add('scrolled');
        } else {
            header.style.background = `rgba(247, 245, 243, 0.95)`;
            header.style.boxShadow = 'none';
            header.classList.remove('scrolled');
        }

        // Hide/show header based on scroll direction
        if (scrollY > lastScrollY && scrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollY = scrollY;
    }, 16); // ~60fps

    window.addEventListener('scroll', updateHeader, { passive: true });
};

Utils.initEnhancedCTAs = function() {
    // Primary CTA buttons with enhanced tracking
    document.querySelectorAll('.primary-cta').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const buttonText = this.textContent.trim();

            if (buttonText.includes('Report') || buttonText.includes('£119')) {
                Utils.showNotification('Redirecting to questionnaire...', 'info');
                Utils.trackEvent('cta_click', { 
                    type: 'basic_report', 
                    price: '99',
                    button_text: buttonText 
                });

                setTimeout(() => {
                    window.location.href = '/questionnaire/';
                }, 1000);

            } else if (buttonText.includes('Premium') || buttonText.includes('£149')) {
                Utils.showNotification('Redirecting to premium service...', 'info');
                Utils.trackEvent('cta_click', { 
                    type: 'premium_service', 
                    price: '149',
                    button_text: buttonText 
                });

                setTimeout(() => {
                    window.location.href = '/premium/';
                }, 1000);
            } else {
                Utils.trackEvent('cta_click', { 
                    type: 'generic',
                    button_text: buttonText 
                });
            }
        });
    });

    // Secondary CTA buttons (Free Guide) with scroll behavior
    document.querySelectorAll('.secondary-cta').forEach(button => {
        if (button.textContent.includes('Guide') || button.textContent.includes('Free')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                const guideForm = document.querySelector('.guide-form');
                if (guideForm) {
                    guideForm.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });

                    setTimeout(() => {
                        const emailInput = guideForm.querySelector('input[type="email"]');
                        if (emailInput) {
                            emailInput.focus();
                            emailInput.select();
                        }
                    }, 800);

                    Utils.trackEvent('secondary_cta_click', { 
                        type: 'free_guide_scroll' 
                    });
                }
            });
        }
    });
};

Utils.initFAQs = function() {
    document.querySelectorAll('.faq-button').forEach(button => {
        button.addEventListener('click', function() {
            const content = this.parentNode.querySelector('.faq-content');
            const icon = this.querySelector('.faq-icon');
            const isOpen = content.classList.contains('show');

            if (isOpen) {
                content.classList.remove('show');
                icon.style.transform = 'rotate(0deg)';
                this.setAttribute('aria-expanded', 'false');
            } else {
                // Close other open FAQs
                document.querySelectorAll('.faq-content.show').forEach(openContent => {
                    openContent.classList.remove('show');
                    const openButton = openContent.parentNode.querySelector('.faq-button');
                    const openIcon = openButton.querySelector('.faq-icon');
                    openIcon.style.transform = 'rotate(0deg)';
                    openButton.setAttribute('aria-expanded', 'false');
                });

                content.classList.add('show');
                icon.style.transform = 'rotate(180deg)';
                this.setAttribute('aria-expanded', 'true');

                Utils.trackEvent('faq_opened', { 
                    question: this.textContent.trim().substring(0, 50) 
                });
            }
        });

        // Initialize ARIA attributes
        button.setAttribute('aria-expanded', 'false');
    });
};

Utils.initPricingCards = function() {
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            requestAnimationFrame(() => {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 20px 40px rgba(45, 55, 72, 0.15)';
            });
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('recommended')) {
                requestAnimationFrame(() => {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 16px rgba(45, 55, 72, 0.05)';
                });
            }
        });

        // Enhanced keyboard support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const button = this.querySelector('.btn, button');
                if (button) button.click();
            }
        });
    });
};

// Enhanced form field interactions
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.form-input, .area-selector').forEach(input => {
        const container = input.parentNode;

        input.addEventListener('focus', function() {
            container.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            container.classList.remove('focused');
            container.classList.toggle('filled', this.value.trim() !== '');
        });

        // Initial state
        if (input.value.trim()) {
            container.classList.add('filled');
        }
    });
});

// Export enhanced utilities for global access
window.CareHomeUtils = Utils;
window.CareHomeNavigation = Navigation;  
window.CareHomePerformance = Performance;
window.CARE_HOME_COLORS = COLORS;

// Initialize mobile menu if present
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            const isOpen = !mobileMenu.classList.contains('hidden');

            this.setAttribute('aria-expanded', isOpen);
            mobileMenu.setAttribute('aria-hidden', !isOpen);

            const icon = this.querySelector('svg');
            if (icon) {
                icon.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
            }
        });
    }
});

console.log('%cRightCareHome Enhanced JavaScript [2024] initialized successfully', 
           'color: #4A90E2; font-weight: bold; font-size: 14px;');

// ===== ENHANCED SUCCESS MESSAGE WITH NURTURE PREVIEW =====
function showSuccessMessage(email) {
    const form = document.getElementById('guide-form');
    const formContainer = form.parentElement;
    
    formContainer.innerHTML = `
        <div class="text-center py-xl">
            <div class="text-6xl mb-md">📧</div>
            <h3 class="text-2xl font-bold mb-md text-success">
                Check Your Inbox!
            </h3>
            <p class="text-lg mb-md">
                Your free shortlist is on its way to <strong>${email}</strong>
            </p>
            
            <div class="card card-subtle p-lg mt-lg text-left max-w-md mx-auto">
                <p class="font-semibold mb-sm">📬 What to expect in next 7 days:</p>
                <ul class="space-y-sm text-sm">
                    <li>
                        <strong>Today:</strong> Free shortlist (3 strategic options)
                    </li>
                    <li>
                        <strong>Tomorrow:</strong> "How to evaluate care homes" guide
                    </li>
                    <li>
                        <strong>Day 3:</strong> Red flags to watch for during visits
                    </li>
                    <li>
                        <strong>Day 5:</strong> Hidden cost calculator
                    </li>
                    <li>
                        <strong>Day 7:</strong> 40% discount on Professional Assessment (£119 → £71)
                    </li>
                </ul>
                
                <div class="alert alert-info mt-md p-sm">
                    <p class="text-xs">
                        💡 <strong>Pro tip:</strong> 73% of families who start with free 
                        upgrade to paid within 7 days for deeper analysis.
                    </p>
                </div>
            </div>
            
            <div class="mt-xl">
                <p class="text-sm text-secondary mb-md">
                    Can't wait? Get professional assessment now:
                </p>
                <div class="flex gap-sm justify-center flex-wrap">
                    <a href="/professional-assessment/" class="btn btn-primary">
                        Standard £119
                    </a>
                    <a href="/premium-assessment/" class="btn btn-accent">
                        Premium £249
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ===== ANALYTICS TRACKING FOR CONVERSION MEASUREMENT =====
document.addEventListener('DOMContentLoaded', function() {
    // Track form field interactions
    const guideForm = document.getElementById('guide-form');
    if (guideForm) {
        guideForm.addEventListener('focus', function(e) {
            if (e.target.tagName === 'INPUT') {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_field_focus', {
                        field: e.target.name,
                        form_type: 'free_shortlist'
                    });
                }
                console.log('Form field focused:', e.target.name);
            }
        }, true);

        // Track form submission
        guideForm.addEventListener('submit', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'lead_capture', {
                    form_type: 'free_shortlist',
                    value: 0
                });
            }
            console.log('Free shortlist form submitted');
        });
    }

    // Track CTA clicks for paid assessments
    document.querySelectorAll('a[href*="questionnaire"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.closest('section');
            const ctaLocation = section?.id || 'unknown';
            const ctaText = this.textContent.trim();
            const assessmentType = this.href.includes('premium') ? 'premium' : 'standard';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'paid_assessment_click', {
                    cta_location: ctaLocation,
                    cta_text: ctaText,
                    assessment_type: assessmentType
                });
            }
            console.log('Paid assessment CTA clicked:', {
                location: ctaLocation,
                text: ctaText,
                type: assessmentType
            });
        });
    });

    // Track scroll to pricing section
    let pricingViewed = false;
    let pricingViewTime = null;
    
    function checkPricingView() {
        if (pricingViewed) return;
        
        const pricingSection = document.getElementById('pricing-plans');
        if (pricingSection) {
            const rect = pricingSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                pricingViewed = true;
                pricingViewTime = Math.round(performance.now() / 1000);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pricing_section_viewed', {
                        time_on_page: pricingViewTime
                    });
                }
                console.log('Pricing section viewed at:', pricingViewTime, 'seconds');
            }
        }
    }

    // Throttled scroll listener for pricing view tracking
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(checkPricingView, 100);
    }, { passive: true });

    // Track success story section view
    let successStoryViewed = false;
    function checkSuccessStoryView() {
        if (successStoryViewed) return;
        
        const successSection = document.querySelector('[class*="success-story"], .bg-soft');
        if (successSection) {
            const rect = successSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                successStoryViewed = true;
                const viewTime = Math.round(performance.now() / 1000);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'success_story_viewed', {
                        time_on_page: viewTime
                    });
                }
                console.log('Success story viewed at:', viewTime, 'seconds');
            }
        }
    }

    // Track FAQ interactions
    document.querySelectorAll('.faq-button').forEach(button => {
        button.addEventListener('click', function() {
            const question = this.textContent.trim();
            const isNewBridgeFAQ = question.includes('start with free') || question.includes('difference between free');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'faq_opened', {
                    question: question.substring(0, 50),
                    is_bridge_faq: isNewBridgeFAQ
                });
            }
            console.log('FAQ opened:', question.substring(0, 50));
        });
    });

    // Track "Skip to paid" link clicks
    document.querySelectorAll('a[href="/professional-assessment/"]').forEach(link => {
        if (link.textContent.includes('Skip to paid') || link.textContent.includes('Skip to paid assessment')) {
            link.addEventListener('click', function() {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'skip_to_paid_click', {
                        cta_location: 'hero_form',
                        cta_text: this.textContent.trim()
                    });
                }
                console.log('Skip to paid clicked');
            });
        }
    });

    // Track quick CTA button clicks in hero
    document.querySelectorAll('.card-subtle .btn').forEach(btn => {
        if (btn.closest('.card-subtle')) {
            btn.addEventListener('click', function() {
                const assessmentType = this.textContent.includes('Premium') ? 'premium' : 'standard';
                const price = this.textContent.includes('£249') ? '249' : '99';
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'hero_quick_cta_click', {
                        assessment_type: assessmentType,
                        price: price,
                        cta_location: 'hero_quick_card'
                    });
                }
                console.log('Hero quick CTA clicked:', assessmentType, price);
            });
        }
    });

    // Track free form success message views
    const originalShowSuccessMessage = window.showSuccessMessage;
    if (originalShowSuccessMessage) {
        window.showSuccessMessage = function(email) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'success_message_viewed', {
                    email_domain: email.split('@')[1] || 'unknown'
                });
            }
            console.log('Success message viewed for:', email);
            return originalShowSuccessMessage(email);
        };
    }

    // Track page engagement metrics
    let maxScrollDepth = 0;
    let engagementStartTime = Date.now();
    
    function trackScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        
        if (scrollPercent > maxScrollDepth) {
            maxScrollDepth = scrollPercent;
            
            // Track milestone scroll depths
            if (scrollPercent >= 25 && scrollPercent < 50) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll_depth_25', {
                        time_on_page: Math.round((Date.now() - engagementStartTime) / 1000)
                    });
                }
            } else if (scrollPercent >= 50 && scrollPercent < 75) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll_depth_50', {
                        time_on_page: Math.round((Date.now() - engagementStartTime) / 1000)
                    });
                }
            } else if (scrollPercent >= 75) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll_depth_75', {
                        time_on_page: Math.round((Date.now() - engagementStartTime) / 1000)
                    });
                }
            }
        }
    }

    // Throttled scroll depth tracking
    let scrollDepthTimeout;
    window.addEventListener('scroll', function() {
        if (scrollDepthTimeout) {
            clearTimeout(scrollDepthTimeout);
        }
        scrollDepthTimeout = setTimeout(trackScrollDepth, 250);
    }, { passive: true });

    console.log('Analytics tracking initialized for conversion measurement');
});

// ===== COMPARISON TEMPLATE DOWNLOAD FUNCTION =====
function downloadComparisonTemplate() {
    // Create comparison template content
    const templateContent = `
CARE HOME COMPARISON TEMPLATE
============================

Home 1: _________________________
Address: ________________________
Phone: _________________________

VISIT DATE: ____________________
VISIT TIME: ____________________

BASIC INFO:
- Weekly Fee: £_____________
- Availability: _____________
- Care Types: ______________
- CQC Rating: ______________

FIRST IMPRESSIONS:
- Cleanliness: ⭐⭐⭐⭐⭐
- Staff Friendliness: ⭐⭐⭐⭐⭐
- Atmosphere: ⭐⭐⭐⭐⭐

MEALTIME OBSERVATION:
- Food Quality: ⭐⭐⭐⭐⭐
- Staff Help: ⭐⭐⭐⭐⭐
- Resident Engagement: ⭐⭐⭐⭐⭐

SAFETY CHECK:
- Emergency Procedures: ⭐⭐⭐⭐⭐
- Security: ⭐⭐⭐⭐⭐
- Accessibility: ⭐⭐⭐⭐⭐

QUESTIONS TO ASK:
□ What's included in the weekly fee?
□ What additional costs might there be?
□ What's the staff-to-resident ratio?
□ How do you handle medical emergencies?
□ What activities are available?
□ Can family visit anytime?
□ What's your policy on complaints?

NOTES:
_________________________________
_________________________________
_________________________________

OVERALL RATING: ⭐⭐⭐⭐⭐
WOULD RECOMMEND: YES/NO
REASON: _________________________

====================================

Home 2: _________________________
[Repeat template above]

====================================

Home 3: _________________________
[Repeat template above]

====================================

FINAL DECISION:
Top Choice: _____________________
Reason: ________________________
Backup Choice: _________________
Reason: ________________________

Next Steps:
□ Book second visit to top choice
□ Ask for contract details
□ Discuss with family
□ Set move-in date

====================================
Generated by RightCareHome.co.uk
    `.trim();

    // Create and download file
    const blob = new Blob([templateContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'care-home-comparison-template.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Track download event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'comparison_template_downloaded', {
            page_location: window.location.href
        });
    }
    
    console.log('Comparison template downloaded');
}