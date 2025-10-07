/**
 * Premium Care Home Questionnaire - Enhanced Edition [FIXED]
 * Optimised for 55+ audience with British English
 * 
 * CHANGELOG:
 * v2.1 - October 2025 [FIXES]
 * - Fixed duplicate ID issue (next-btn/prev-btn)
 * - Fixed last section navigation logic
 * - Fixed progress bar initial state
 * - Improved event delegation
 * - Better error handling for section transitions
 * 
 * v2.0 - October 2025
 * - Email notification system
 * - Periodic backup
 * - Visual save indicator
 * - Enhanced error handling
 * - Submission ID tracking
 * - Milestone modal
 * - Keyboard navigation
 */

// ===== CONFIGURATION =====
const CONFIG = {
    totalSections: 8,
    totalQuestions: 38,
    sectionQuestions: {
        1: '1-7',
        2: '8-11',
        3: '12-19',
        4: '20-25',
        5: '26-29',
        6: '30-34',
        7: '35-37',
        8: '38'
    },
    apiEndpoint: '/api/care-home-assessment',
    emailEndpoint: '/api/send-premium-email',
    storageKey: 'rightcarehome_premium_assessment',
    storageExpiry: 24 * 60 * 60 * 1000, // 24 hours
    colors: {
        success: '#7A9471',
        error: '#C47A7A',
        accent: '#C09B6A',
        accentHover: '#A68550'
    }
};

// ===== MAIN QUESTIONNAIRE CLASS =====
class CareHomeQuestionnaire {
    constructor() {
        this.currentSection = 1;
        this.formData = {};
        this.version = '2.1';
        this.lastSaveTime = null;
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupRadioCheckboxHandlers();
        this.setupKeyboardNavigation();
        this.loadSavedData();
        this.updateProgress();
        this.setupPeriodicBackup();
        this.createSaveIndicator();
        console.log(`Premium Care Home Questionnaire v${this.version} initialised - 38 Questions`);
    }

    // ===== EVENT BINDING (FIXED) =====
    bindEvents() {
        // FIXED: Use class-based selectors instead of IDs to avoid conflicts
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if clicked element or parent is a button in navigation-buttons
            const nextBtn = target.closest('.navigation-buttons .primary-btn');
            const prevBtn = target.closest('.navigation-buttons .secondary-btn');
            
            if (nextBtn) {
                e.preventDefault();
                console.log('Next button clicked, current section:', this.currentSection);
                
                // Check if we're on the last section
                if (this.currentSection === CONFIG.totalSections) {
                    this.submitForm();
                } else {
                    this.nextSection();
                }
            }
            
            if (prevBtn) {
                e.preventDefault();
                console.log('Previous button clicked, current section:', this.currentSection);
                this.prevSection();
            }
        });

        // Input validation and auto-save
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                this.clearError(input);
                this.saveFormData();
            });
        });

        // Auto-save on radio/checkbox change
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' || e.target.type === 'checkbox') {
                this.saveFormData();
            }
        });
    }

    // ===== KEYBOARD NAVIGATION =====
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Don't interfere with form inputs
            if (e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'SELECT') return;
            
            if (e.key === 'ArrowRight' && this.currentSection < CONFIG.totalSections) {
                e.preventDefault();
                this.nextSection();
            } else if (e.key === 'ArrowLeft' && this.currentSection > 1) {
                e.preventDefault();
                this.prevSection();
            } else if (e.key === 'Escape') {
                // Close modal if open
                const modal = document.querySelector('.premium-milestone-modal');
                if (modal) {
                    modal.style.opacity = '0';
                    setTimeout(() => modal.remove(), 300);
                }
            }
        });
    }

    // ===== RADIO & CHECKBOX HANDLERS =====
    setupRadioCheckboxHandlers() {
        // Radio button options
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', function(e) {
                if (e.target.tagName === 'INPUT') return;
                
                const radio = this.querySelector('input[type="radio"]');
                if (!radio) return;
                
                const name = radio.name;
                
                // Remove selected from all options with same name
                document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
                    const parent = r.closest('.radio-option');
                    if (parent) parent.classList.remove('selected');
                });
                
                // Add selected to clicked option
                this.classList.add('selected');
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            });

            const radio = option.querySelector('input[type="radio"]');
            if (radio) {
                radio.addEventListener('change', function() {
                    const name = this.name;
                    document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
                        const parent = r.closest('.radio-option');
                        if (parent) parent.classList.remove('selected');
                    });
                    const parent = this.closest('.radio-option');
                    if (parent) parent.classList.add('selected');
                });
            }
        });

        // Checkbox options
        document.querySelectorAll('.checkbox-option').forEach(option => {
            option.addEventListener('click', function(e) {
                if (e.target.tagName === 'INPUT') return;
                
                const checkbox = this.querySelector('input[type="checkbox"]');
                if (!checkbox) return;
                
                checkbox.checked = !checkbox.checked;
                this.classList.toggle('selected', checkbox.checked);
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            });

            const checkbox = option.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    const parent = this.closest('.checkbox-option');
                    if (parent) {
                        parent.classList.toggle('selected', this.checked);
                    }
                });
            }
        });
    }

    // ===== VALIDATION =====
    validateCurrentSection() {
        const section = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (!section) return true;

        let isValid = true;
        const errors = [];

        // Clear previous errors
        section.querySelectorAll('.error-message').forEach(err => err.remove());
        section.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Validate text inputs
        section.querySelectorAll('input[type="text"][required], input[type="email"][required], input[type="tel"][required], textarea[required]').forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
                errors.push(input.name);
            } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
                this.showError(input, 'Please enter a valid email address');
                isValid = false;
                errors.push(input.name);
            } else if (input.type === 'tel' && !this.isValidPhone(input.value)) {
                this.showError(input, 'Please enter a valid UK phone number');
                isValid = false;
                errors.push(input.name);
            }
        });

        // Validate radio groups
        const radioNames = new Set();
        section.querySelectorAll('input[type="radio"][required]').forEach(radio => {
            radioNames.add(radio.name);
        });

        radioNames.forEach(name => {
            const radios = section.querySelectorAll(`input[name="${name}"]`);
            const isChecked = Array.from(radios).some(r => r.checked);
            
            if (!isChecked) {
                const firstRadio = radios[0];
                if (firstRadio) {
                    this.showError(firstRadio, 'Please select an option');
                    isValid = false;
                    errors.push(name);
                }
            }
        });

        // Scroll to first error
        if (!isValid && errors.length > 0) {
            const firstErrorField = section.querySelector(`[name="${errors[0]}"]`);
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    showError(input, message) {
        this.clearError(input);

        input.classList.add('error');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = CONFIG.colors.error;
        errorDiv.style.fontSize = '16px';
        errorDiv.style.marginTop = '8px';
        errorDiv.style.fontWeight = '600';
        errorDiv.setAttribute('role', 'alert');

        const parent = input.closest('.radio-option, .checkbox-option, .form-group') || input.parentElement;
        if (parent) {
            parent.appendChild(errorDiv);
        }
    }

    clearError(input) {
        input.classList.remove('error');
        
        const parent = input.closest('.radio-option, .checkbox-option, .form-group') || input.parentElement;
        if (parent) {
            const errorMsg = parent.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(email)) return false;
        
        const parts = email.split('@');
        if (parts[0].length > 64) return false;
        if (parts[1].length > 255) return false;
        
        return true;
    }

    isValidPhone(phone) {
        // UK phone validation
        const cleaned = phone.replace(/\s+/g, '');
        return /^(\+44|0)[1-9]\d{8,9}$/.test(cleaned);
    }

    // ===== NAVIGATION (FIXED) =====
    nextSection() {
        if (!this.validateCurrentSection()) {
            return;
        }

        if (this.currentSection < CONFIG.totalSections) {
            this.currentSection++;
            
            // Show milestone at section 4
            if (this.currentSection === 4) {
                this.showMilestone();
            }
            
            this.showSection(this.currentSection);
            this.updateProgress();
            this.saveFormData();
        }
    }

    prevSection() {
        if (this.currentSection > 1) {
            this.currentSection--;
            this.showSection(this.currentSection);
            this.updateProgress();
        }
    }

    showSection(sectionNum) {
        // Hide all sections
        document.querySelectorAll('.question-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show current section
        const currentSection = document.querySelector(`[data-section="${sectionNum}"]`);
        if (currentSection) {
            currentSection.classList.add('active');
            
            // Set ARIA attributes for accessibility
            currentSection.setAttribute('aria-hidden', 'false');
        }

        // Update navigation buttons
        this.updateNavigationButtons();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateNavigationButtons() {
        // FIXED: Update all navigation button sets
        const currentActiveSection = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (!currentActiveSection) return;

        const navButtons = currentActiveSection.querySelector('.navigation-buttons');
        if (!navButtons) return;

        const prevBtn = navButtons.querySelector('.secondary-btn');
        const nextBtn = navButtons.querySelector('.primary-btn');

        // Update previous button visibility
        if (prevBtn) {
            prevBtn.style.visibility = this.currentSection === 1 ? 'hidden' : 'visible';
        }

        // Update next/submit button
        if (nextBtn) {
            if (this.currentSection === CONFIG.totalSections) {
                nextBtn.textContent = 'Submit Assessment ✓';
                nextBtn.setAttribute('aria-label', 'Submit premium assessment');
            } else {
                nextBtn.textContent = 'Next Section →';
                nextBtn.setAttribute('aria-label', `Continue to section ${this.currentSection + 1}`);
            }
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const currentSectionDisplay = document.getElementById('current-section');
        const currentQuestionDisplay = document.getElementById('current-question');

        if (progressFill) {
            const percentage = (this.currentSection / CONFIG.totalSections) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        if (currentSectionDisplay) {
            currentSectionDisplay.textContent = this.currentSection;
        }

        if (currentQuestionDisplay) {
            currentQuestionDisplay.textContent = CONFIG.sectionQuestions[this.currentSection] || '';
        }
    }

    // ===== MILESTONE MODAL =====
    showMilestone() {
        const modal = this.createMilestoneModal();
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 100);
    }

    createMilestoneModal() {
        const modal = document.createElement('div');
        modal.className = 'premium-milestone-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'milestone-title');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-icon">🎯</div>
                <h3 id="milestone-title">Excellent Progress!</h3>
                <p>You're halfway through your premium care assessment.<br>Your detailed profile is helping us find the perfect match.</p>
                <button class="modal-close" aria-label="Continue assessment">Continue</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const overlay = modal.querySelector('.modal-overlay');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
        `;

        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            position: relative;
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 450px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        const icon = modal.querySelector('.modal-icon');
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 20px;
        `;

        const title = modal.querySelector('h3');
        title.style.cssText = `
            color: #5A4A6A;
            margin-bottom: 10px;
            font-size: 24px;
        `;

        const text = modal.querySelector('p');
        text.style.cssText = `
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        `;

        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.style.cssText = `
            background: ${CONFIG.colors.accent};
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = CONFIG.colors.accentHover;
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = CONFIG.colors.accent;
        });

        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        return modal;
    }

    // ===== AUTO-SAVE & BACKUP =====
    setupPeriodicBackup() {
        setInterval(() => {
            const form = document.getElementById('questionnaire-form');
            if (form && this.hasChanges()) {
                this.saveFormData();
                this.showSaveIndicator();
            }
        }, 30000);
    }

    hasChanges() {
        const currentTime = Date.now();
        return !this.lastSaveTime || (currentTime - this.lastSaveTime) > 10000;
    }

    createSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.setAttribute('role', 'status');
        indicator.setAttribute('aria-live', 'polite');
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${CONFIG.colors.success};
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 1000;
            font-size: 14px;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        `;
        document.body.appendChild(indicator);
    }

    showSaveIndicator() {
        const indicator = document.getElementById('save-indicator');
        if (!indicator) return;
        
        indicator.textContent = '✓ Saved';
        indicator.style.opacity = '1';
        
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
        
        this.lastSaveTime = Date.now();
    }

    // ===== DATA MANAGEMENT =====
    collectFormData() {
        const data = {
            timestamp: new Date().toISOString(),
            assessment_version: this.version,
            completed_sections: this.currentSection
        };

        const form = document.getElementById('questionnaire-form');
        if (!form) return data;

        // Text inputs
        form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(input => {
            if (input.value.trim()) {
                data[input.name] = input.value.trim();
            }
        });

        // Radio buttons
        form.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            data[radio.name] = radio.value;
        });

        // Checkboxes
        const checkboxGroups = {};
        form.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            if (!checkboxGroups[checkbox.name]) {
                checkboxGroups[checkbox.name] = [];
            }
            checkboxGroups[checkbox.name].push(checkbox.value);
        });

        Object.entries(checkboxGroups).forEach(([name, values]) => {
            data[name] = values;
        });

        return data;
    }

    saveFormData() {
        try {
            const data = this.collectFormData();
            const storageData = {
                data: data,
                currentSection: this.currentSection,
                savedAt: Date.now(),
                version: this.version
            };
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(storageData));
        } catch (e) {
            console.warn('Failed to save form data:', e);
        }
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (!saved) return;

            const storageData = JSON.parse(saved);
            
            // Check expiry
            const now = Date.now();
            if (now - storageData.savedAt > CONFIG.storageExpiry) {
                localStorage.removeItem(CONFIG.storageKey);
                return;
            }

            const data = storageData.data;
            
            // Restore text inputs
            Object.entries(data).forEach(([name, value]) => {
                if (typeof value === 'string') {
                    const input = document.querySelector(`[name="${name}"]`);
                    if (input && (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.tagName === 'TEXTAREA')) {
                        input.value = value;
                    }
                }
            });

            // Restore radio buttons
            Object.entries(data).forEach(([name, value]) => {
                const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
                if (radio && radio.type === 'radio') {
                    radio.checked = true;
                    const parent = radio.closest('.radio-option');
                    if (parent) parent.classList.add('selected');
                }
            });

            // Restore checkboxes
            Object.entries(data).forEach(([name, values]) => {
                if (Array.isArray(values)) {
                    values.forEach(value => {
                        const checkbox = document.querySelector(`input[name="${name}"][value="${value}"]`);
                        if (checkbox && checkbox.type === 'checkbox') {
                            checkbox.checked = true;
                            const parent = checkbox.closest('.checkbox-option');
                            if (parent) parent.classList.add('selected');
                        }
                    });
                }
            });

            // Restore section
            if (storageData.currentSection && storageData.currentSection > 1) {
                const shouldRestore = confirm('Would you like to continue from where you left off?');
                if (shouldRestore) {
                    this.currentSection = storageData.currentSection;
                    this.showSection(this.currentSection);
                    this.updateProgress();
                }
            }

        } catch (e) {
            console.warn('Failed to load saved data:', e);
        }
    }

    // ===== EMAIL NOTIFICATION =====
    async sendEmailNotification(formData) {
        console.log('📧 Premium email notification (placeholder mode)');
        
        const emailPayload = {
            to: formData.q2 || formData.email,
            subject: 'Premium Care Assessment Received',
            template: 'premium-confirmation',
            data: {
                name: formData.q1 || formData.name,
                submissionId: this.generateSubmissionId(),
                timestamp: new Date().toISOString(),
                assessment_type: 'premium',
                sections_completed: CONFIG.totalSections
            }
        };
        
        // Placeholder
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ 
                    status: 'simulated', 
                    message: 'Email would be sent in production',
                    payload: emailPayload 
                });
            }, 500);
        });
    }

    generateSubmissionId() {
        return `PREMIUM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    }

    // ===== FORM SUBMISSION =====
    async submitForm() {
        // Validate final section
        if (!this.validateCurrentSection()) {
            return;
        }

        const formData = this.collectFormData();
        const submissionId = this.generateSubmissionId();

        formData.submissionId = submissionId;
        formData.user_agent = navigator.userAgent;
        formData.screen_resolution = `${window.screen.width}x${window.screen.height}`;
        formData.completed_sections = CONFIG.totalSections;
        formData.version = this.version;
        formData.completion_time = Math.round((Date.now() - this.startTime) / 1000);

        console.log('Submitting premium assessment:', formData);

        try {
            const submitBtn = document.querySelector('.question-section.active .primary-btn');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            // Email notification
            const emailResult = await this.sendEmailNotification(formData);
            console.log('Email result:', emailResult);

            // API submission (placeholder)
            console.log('API endpoint:', CONFIG.apiEndpoint);
            console.log('Submission data:', formData);

            // Backup locally
            localStorage.setItem('lastPremiumSubmission', JSON.stringify(formData));
            localStorage.removeItem(CONFIG.storageKey);
            
            // Show success message
            this.showSuccessMessage(submissionId);

        } catch (error) {
            console.error('Submission error:', error);
            
            this.showSubmitError('Unable to submit your premium assessment. Your data is saved locally. Please try again or contact our support team.');
            
            const submitBtn = document.querySelector('.question-section.active .primary-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Assessment ✓';
            }
        }
    }

    showSuccessMessage(submissionId) {
        const successDiv = document.createElement('div');
        successDiv.className = 'submit-success';
        successDiv.setAttribute('role', 'alert');
        successDiv.setAttribute('aria-live', 'polite');
        successDiv.style.cssText = `
            background: ${CONFIG.colors.success};
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideDown 0.3s ease;
        `;
        successDiv.innerHTML = `
            <h3 style="margin-bottom: 10px; font-size: 24px;">✓ Assessment Submitted Successfully!</h3>
            <p style="margin-bottom: 5px;">Submission ID: <strong>${submissionId}</strong></p>
            <p style="font-size: 14px; opacity: 0.9;">Redirecting to confirmation page...</p>
        `;
        
        const form = document.getElementById('questionnaire-form');
        const currentSection = form ? form.querySelector('.question-section.active') : null;
        if (currentSection) {
            currentSection.insertBefore(successDiv, currentSection.firstChild);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = `/thank-you.html?id=${submissionId}&type=premium`;
        }, 3000);
    }

    showSubmitError(message) {
        document.querySelectorAll('.submit-error').forEach(el => el.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'submit-error';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'assertive');
        errorDiv.style.cssText = `
            background: ${CONFIG.colors.error};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            animation: slideDown 0.3s ease;
        `;
        errorDiv.textContent = message;
        
        const form = document.getElementById('questionnaire-form');
        const currentSection = form ? form.querySelector('.question-section.active') : null;
        if (currentSection) {
            currentSection.insertBefore(errorDiv, currentSection.firstChild);
        }
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 8000);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    new CareHomeQuestionnaire();
    console.log('✅ Premium Care Home Questionnaire v2.1 ready - FIXED version');
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareHomeQuestionnaire;
}
