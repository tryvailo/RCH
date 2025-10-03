/**
 * Enhanced Thank You Page [NEW 2024]
 * Modern functionality with updated design system integration
 */

// ===== UPDATED COLOR CONSTANTS =====
const THANK_YOU_COLORS = {
    primary: '#4A90E2',           // Updated primary blue
    success: '#6BBF59',           // Updated success green
    accent: '#E8B86D',            // Updated accent color
    textPrimary: '#2D3748',       // Updated warm text
    textSecondary: '#4A5568',
    backgroundWarm: '#F7F5F3',    // Updated warm background
    backgroundSoft: '#FAF8F5'
};

class ThankYouPage {
    constructor() {
        this.version = '2024.1';
        this.init();
    }

    init() {
        // Enhanced initialization with error handling
        try {
            this.initAnimations();
            this.generateReferenceNumber();
            this.handleURLParameters();
            this.initModernStyling();
            this.triggerAnimations();

            console.log('Enhanced ThankYouPage [2024] initialized successfully');

        } catch (error) {
            console.error('ThankYouPage initialization error:', error);
            // Fallback initialization
            this.basicInit();
        }
    }

    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target); // Unobserve after animation
                    });
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    // NEW: Apply modern styling
    initModernStyling() {
        // Style the main container
        const container = document.querySelector('.thank-you-container');
        if (container) {
            container.style.background = THANK_YOU_COLORS.backgroundWarm;
        }

        // Style success elements
        document.querySelectorAll('.success-icon').forEach(icon => {
            icon.style.color = THANK_YOU_COLORS.success;
        });

        // Style reference numbers
        document.querySelectorAll('.reference-display').forEach(ref => {
            ref.style.background = `linear-gradient(135deg, ${THANK_YOU_COLORS.primary} 0%, ${THANK_YOU_COLORS.accent} 100%)`;
            ref.style.color = 'white';
            ref.style.padding = '0.75rem 1.5rem';
            ref.style.borderRadius = '8px';
            ref.style.fontWeight = '700';
            ref.style.letterSpacing = '0.05em';
        });

        // Style action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.style.background = `linear-gradient(135deg, ${THANK_YOU_COLORS.accent} 0%, #D4A355 100%)`;
            btn.style.borderColor = THANK_YOU_COLORS.accent;
            btn.style.transition = 'all 0.3s ease';

            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px) scale(1.02)';
                this.style.boxShadow = '0 8px 25px rgba(232, 184, 109, 0.3)';
            });

            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });
    }

    generateReferenceNumber() {
        let refNumber;

        // Use enhanced reference generation if available
        if (window.CareHomeUtils) {
            refNumber = window.CareHomeUtils.generateReferenceNumber();
        } else {
            // Fallback with enhanced format
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const day = String(new Date().getDate()).padStart(2, '0');
            const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
            refNumber = `RCH-${year}${month}${day}-${random}`;
        }

        // Update all reference displays
        const refElement = document.getElementById('reference-number');
        if (refElement) {
            refElement.textContent = refNumber;

            // Enhanced styling for main reference
            refElement.style.background = `linear-gradient(135deg, ${THANK_YOU_COLORS.primary} 0%, ${THANK_YOU_COLORS.accent} 100%)`;
            refElement.style.backgroundClip = 'text';
            refElement.style.webkitBackgroundClip = 'text';
            refElement.style.color = 'transparent';
            refElement.style.fontWeight = '900';
            refElement.style.fontSize = '1.5rem';
            refElement.style.letterSpacing = '0.05em';
        }

        // Update other reference displays
        document.querySelectorAll('.reference-display').forEach(el => {
            if (el !== refElement) {
                el.textContent = refNumber;
            }
        });

        // Store reference for potential future use
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('lastReferenceNumber', refNumber);
            } catch (e) {
                console.warn('Could not store reference number:', e);
            }
        }

        return refNumber;
    }

    handleURLParameters() {
        let urlParams;

        if (window.CareHomeUtils) {
            urlParams = window.CareHomeUtils.getUrlParams();
        } else {
            urlParams = new URLSearchParams(window.location.search);
        }

        const isCompleted = urlParams.get('completed') === 'true';
        const refParam = urlParams.get('ref');
        const versionParam = urlParams.get('version');

        if (isCompleted) {
            console.log('Assessment completed successfully');

            // Enhanced completion tracking
            this.trackCompletion(refParam, versionParam);

            // Show enhanced success notification
            setTimeout(() => {
                this.showEnhancedSuccessNotification();
            }, 1500);

            // Enhanced analytics for completion
            if (typeof gtag !== 'undefined') {
                gtag('event', 'assessment_completed', {
                    'event_category': 'conversion',
                    'event_label': 'care_home_assessment_v2024',
                    'custom_parameter_1': refParam || 'unknown',
                    'custom_parameter_2': versionParam || '1.0'
                });
            }
        }

        // Handle any special parameters
        if (urlParams.get('premium') === 'true') {
            this.showPremiumBadge();
        }
    }

    trackCompletion(referenceNumber, version) {
        // Enhanced completion data
        const completionData = {
            timestamp: new Date().toISOString(),
            reference: referenceNumber || 'unknown',
            version: version || this.version,
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            completion_source: 'questionnaire',
            page_load_time: Date.now(),
            connection: navigator.connection ? navigator.connection.effectiveType : 'unknown',
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        console.log('Enhanced completion tracking:', completionData);

        // Store completion data with enhanced structure
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('lastCompletionData', JSON.stringify(completionData));
                localStorage.setItem('completionHistory', JSON.stringify([
                    ...JSON.parse(localStorage.getItem('completionHistory') || '[]').slice(-4), // Keep last 5
                    completionData
                ]));
            } catch (e) {
                console.warn('Could not store completion data:', e);
            }
        }

        // Enhanced analytics tracking
        if (window.CareHomeUtils) {
            window.CareHomeUtils.trackEvent('enhanced_assessment_completion', completionData);
        }
    }

    triggerAnimations() {
        setTimeout(() => {
            document.querySelectorAll('.fade-in').forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, index * 100); // Staggered animation
            });
        }, 300);
    }

    // Enhanced success notification
    showEnhancedSuccessNotification() {
        if (window.CareHomeUtils) {
            window.CareHomeUtils.showNotification(
                '✅ Assessment submitted successfully! Check your email for confirmation.', 
                'success',
                6000
            );
        } else {
            this.showEnhancedFallbackNotification(
                'Assessment submitted successfully! Check your email for confirmation.', 
                'success'
            );
        }
    }

    // Enhanced fallback notification with modern styling
    showEnhancedFallbackNotification(message, type = 'success') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'notification notification-modern';

        // Enhanced styling based on type
        const styles = {
            success: { 
                bg: `linear-gradient(135deg, ${THANK_YOU_COLORS.success} 0%, #059669 100%)`, 
                color: 'white',
                icon: '✅'
            },
            error: { 
                bg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', 
                color: 'white',
                icon: '❌'
            },
            info: { 
                bg: `linear-gradient(135deg, ${THANK_YOU_COLORS.primary} 0%, #2563EB 100%)`, 
                color: 'white',
                icon: 'ℹ️'
            }
        };

        const style = styles[type] || styles.info;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10000',
            background: style.bg,
            color: style.color,
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 12px 35px rgba(45, 55, 72, 0.15)',
            fontSize: '16px',
            fontWeight: '600',
            maxWidth: '420px',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        });

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.25rem;">${style.icon}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Auto-remove with enhanced timing
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, 6000);
    }

    showPremiumBadge() {
        const badge = document.createElement('div');
        badge.className = 'premium-badge';

        Object.assign(badge.style, {
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: `linear-gradient(135deg, ${THANK_YOU_COLORS.accent} 0%, #D4A355 100%)`,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '700',
            zIndex: '9999',
            boxShadow: '0 4px 16px rgba(232, 184, 109, 0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.5s ease',
            backdropFilter: 'blur(8px)'
        });

        badge.innerHTML = '⭐ Premium Assessment';
        document.body.appendChild(badge);

        setTimeout(() => {
            badge.style.transform = 'translateX(0)';
        }, 1000);
    }

    // Enhanced email reminder functionality
    setupEmailReminder() {
        const emailForm = document.getElementById('email-reminder-form');
        if (emailForm) {
            emailForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const emailInput = emailForm.querySelector('input[type="email"]');
                const submitBtn = emailForm.querySelector('button[type="submit"]');

                if (!emailInput || !submitBtn) return;

                const email = emailInput.value.trim();

                // Enhanced validation
                if (!email || !this.validateEmail(email)) {
                    this.showEnhancedFallbackNotification('Please enter a valid email address', 'error');
                    return;
                }

                // Enhanced loading state
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    submitBtn.textContent = '✓ Reminder Set!';
                    submitBtn.style.background = THANK_YOU_COLORS.success;

                    this.showEnhancedFallbackNotification('Email reminder has been set successfully!', 'success');

                    // Track email reminder
                    if (window.CareHomeUtils) {
                        window.CareHomeUtils.trackEvent('email_reminder_set', {
                            email_domain: email.split('@')[1]
                        });
                    }

                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                        emailForm.reset();
                    }, 3000);

                } catch (error) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    this.showEnhancedFallbackNotification('Sorry, there was an error. Please try again.', 'error');
                }
            });
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Basic initialization fallback
    basicInit() {
        console.log('Using basic ThankYouPage initialization');

        // Basic reference number generation
        const refNumber = 'RCH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');

        const refElement = document.getElementById('reference-number');
        if (refElement) {
            refElement.textContent = refNumber;
        }

        // Basic animations
        setTimeout(() => {
            document.querySelectorAll('.fade-in').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 500);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.thankYouPage = new ThankYouPage();
});

// Export for external access
window.ThankYouPage = ThankYouPage;
window.THANK_YOU_COLORS = THANK_YOU_COLORS;

console.log('Enhanced Thank You Page [2024] loaded successfully');