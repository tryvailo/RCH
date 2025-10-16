/**
 * Premium Care Home Questionnaire - Enhanced Edition [FIXED v2.2]
 * Optimised for 55+ audience with British English
 * 
 * CHANGELOG:
 * v2.2 - October 2025 [MAJOR FIXES]
 * - Fixed event delegation logic (proper closest() usage)
 * - Added form submit handler to prevent double submission
 * - Implemented exclusive checkbox logic
 * - Fixed UK phone validation (proper formats)
 * - Added debounce for auto-save
 * - Fixed submitForm event parameter
 * - Improved data restoration logic
 * - Added Q38 max 3 selections validation
 * - Unified with standard questionnaire logic
 * - Enhanced validation configuration
 * - Improved accessibility (ARIA attributes)
 * - Added unit test utilities
 * 
 * v2.1 - October 2025 [FIXES]
 * - Fixed duplicate ID issue (next-btn/prev-btn)
 * - Fixed last section navigation logic
 * - Fixed progress bar initial state
 * - Improved event delegation
 * - Better error handling for section transitions
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
    },
    // NEW: Validation configuration
    validation: {
        exclusiveCheckboxValues: ['none', 'no_preference', 'not_important'],
        maxSelections: {
            q38: 3 // Premium analysis priorities
        },
        emailMaxLength: {
            localPart: 64,
            domain: 255
        },
        phoneFormats: {
            ukMobile: /^(07\d{9}|(\+44|0044)7\d{9})$/,
            ukLandline: /^(0[1-9]\d{8,9}|(\+44|0044)[1-9]\d{8,9})$/
        }
    },
    debounceDelay: 500 // ms for auto-save
};

// ===== MAIN QUESTIONNAIRE CLASS =====
class CareHomeQuestionnaire {
    constructor() {
        this.currentSection = 1;
        this.formData = {};
        this.version = '2.2';
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
        this.initializeAccessibility();
        console.log(`Premium Care Home Questionnaire v${this.version} initialised - 38 Questions`);
    }

    // ===== ACCESSIBILITY INITIALIZATION =====
    initializeAccessibility() {
        // Set initial ARIA states
        document.querySelectorAll('.question-section').forEach((section, index) => {
            const sectionNum = index + 1;
            section.setAttribute('role', 'region');
            section.setAttribute('aria-labelledby', `section-${sectionNum}-title`);
            section.setAttribute('aria-hidden', sectionNum !== this.currentSection ? 'true' : 'false');
            
            // Add ID to section title for aria-labelledby
            const title = section.querySelector('.section-title');
            if (title && !title.id) {
                title.id = `section-${sectionNum}-title`;
            }
        });

        // Add live region for progress updates
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', CONFIG.totalSections);
            progressBar.setAttribute('aria-valuenow', this.currentSection);
        }

        // Add form landmarks
        const form = document.getElementById('questionnaire-form');
        if (form) {
            form.setAttribute('aria-label', 'Premium care home assessment form');
        }
    }

    // ===== EVENT BINDING (FIXED) =====
    bindEvents() {
        const form = document.getElementById('questionnaire-form');
        
        // FIXED: Direct form submit handler to prevent double submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm(e);
            });
        }

        // FIXED: Proper event delegation for navigation buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if click is within navigation-buttons container
            const navContainer = target.closest('.navigation-buttons');
            if (!navContainer) return;
            
            // Now check for specific buttons
            const nextBtn = target.closest('.primary-btn');
            const prevBtn = target.closest('.secondary-btn');
            
            if (nextBtn) {
                e.preventDefault();
                console.log('Next button clicked, current section:', this.currentSection);
                
                // Check if we're on the last section
                if (this.currentSection === CONFIG.totalSections) {
                    this.submitForm(e);
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

        // FIXED: Add debounce for auto-save on input
        const debouncedSave = this.debounce(() => {
            this.saveFormData();
            this.showSaveIndicator();
        }, CONFIG.debounceDelay);

        // Auto-save on input with debounce
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                this.clearError(input);
                debouncedSave();
            });
        });

        // Auto-save on radio/checkbox change
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' || e.target.type === 'checkbox') {
                debouncedSave();
            }
        });
    }

    // NEW: Debounce utility
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
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
            } else if (e.key === 'Enter' && e.target.classList.contains('modal-close')) {
                e.target.click();
            }
        });
    }

    // ===== RADIO & CHECKBOX HANDLERS (ENHANCED) =====
    setupRadioCheckboxHandlers() {
        // Radio button options
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', function(e) {
                if (e.target.tagName === 'INPUT') return;
                
                const radio = this.querySelector('input[type="radio"]');
                if (!radio || radio.disabled) return;
                
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
                if (!checkbox || checkbox.disabled) return;
                
                checkbox.checked = !checkbox.checked;
                this.classList.toggle('selected', checkbox.checked);
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            });

            const checkbox = option.querySelector('input[type="checkbox"]');
            if (checkbox) {
                const questionnaire = this;
                checkbox.addEventListener('change', function() {
                    const parent = this.closest('.checkbox-option');
                    if (parent) {
                        parent.classList.toggle('selected', this.checked);
                    }
                    
                    // FIXED: Handle exclusive checkboxes
                    questionnaire.handleExclusiveCheckbox(this);
                    
                    // NEW: Handle max selections (Q38)
                    questionnaire.handleMaxSelections(this);
                }.bind(this));
            }
        });
    }

    // NEW: Handle exclusive checkbox logic
    handleExclusiveCheckbox(input) {
        const exclusiveValues = CONFIG.validation.exclusiveCheckboxValues;
        
        if (exclusiveValues.includes(input.value) && input.checked) {
            // If "none" is selected, uncheck all others
            document.querySelectorAll(`input[name="${input.name}"]:not([value="${input.value}"])`).forEach(other => {
                other.checked = false;
                const parent = other.closest('.checkbox-option');
                if (parent) parent.classList.remove('selected');
            });
        } else if (input.checked) {
            // If any other option is selected, uncheck "none"
            document.querySelectorAll(`input[name="${input.name}"]`).forEach(cb => {
                if (exclusiveValues.includes(cb.value) && cb.checked) {
                    cb.checked = false;
                    const parent = cb.closest('.checkbox-option');
                    if (parent) parent.classList.remove('selected');
                }
            });
        }
    }

    // NEW: Handle max selections validation
    handleMaxSelections(input) {
        const maxConfig = CONFIG.validation.maxSelections;
        const fieldName = input.name;
        
        if (maxConfig[fieldName]) {
            const maxAllowed = maxConfig[fieldName];
            const checked = document.querySelectorAll(`input[name="${fieldName}"]:checked`);
            
            if (checked.length > maxAllowed) {
                input.checked = false;
                const parent = input.closest('.checkbox-option');
                if (parent) parent.classList.remove('selected');
                
                this.showTemporaryMessage(
                    input.closest('.form-group'),
                    `Please select maximum ${maxAllowed} option${maxAllowed > 1 ? 's' : ''}`,
                    'warning'
                );
            }
        }
    }

    // NEW: Show temporary message
    showTemporaryMessage(element, message, type = 'info') {
        const existingMsg = element.querySelector('.temp-message');
        if (existingMsg) existingMsg.remove();
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'temp-message';
        msgDiv.textContent = message;
        msgDiv.setAttribute('role', 'alert');
        msgDiv.style.cssText = `
            color: ${type === 'warning' ? CONFIG.colors.error : CONFIG.colors.accent};
            font-size: 14px;
            margin-top: 8px;
            font-weight: 600;
            animation: fadeIn 0.3s ease;
        `;
        
        element.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.style.opacity = '0';
            msgDiv.style.transition = 'opacity 0.3s';
            setTimeout(() => msgDiv.remove(), 300);
        }, 3000);
    }

    // ===== VALIDATION (ENHANCED) =====
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

        // Validate checkbox groups (at least one required if any checkbox has required)
        const checkboxNames = new Set();
        section.querySelectorAll('input[type="checkbox"][required]').forEach(checkbox => {
            checkboxNames.add(checkbox.name);
        });

        checkboxNames.forEach(name => {
            const checkboxes = section.querySelectorAll(`input[name="${name}"]`);
            const isChecked = Array.from(checkboxes).some(cb => cb.checked);
            
            if (!isChecked) {
                const firstCheckbox = checkboxes[0];
                if (firstCheckbox) {
                    this.showError(firstCheckbox, 'Please select at least one option');
                    isValid = false;
                    errors.push(name);
                }
            }
        });

        // Scroll to first error with accessibility announcement
        if (!isValid && errors.length > 0) {
            const firstErrorField = section.querySelector(`[name="${errors[0]}"]`);
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Focus for screen readers
                setTimeout(() => {
                    const errorMsg = firstErrorField.closest('.form-group')?.querySelector('.error-message');
                    if (errorMsg) errorMsg.focus();
                }, 500);
            }
        }

        return isValid;
    }

    showError(input, message) {
        this.clearError(input);

        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = CONFIG.colors.error;
        errorDiv.style.fontSize = '16px';
        errorDiv.style.marginTop = '8px';
        errorDiv.style.fontWeight = '600';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'assertive');
        errorDiv.setAttribute('tabindex', '-1'); // Make focusable for screen readers

        const parent = input.closest('.radio-option, .checkbox-option, .form-group') || input.parentElement;
        if (parent) {
            parent.appendChild(errorDiv);
            
            // Link error to input for accessibility
            const errorId = `error-${input.name}-${Date.now()}`;
            errorDiv.id = errorId;
            input.setAttribute('aria-describedby', errorId);
        }
    }

    clearError(input) {
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        
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
        if (parts[0].length > CONFIG.validation.emailMaxLength.localPart) return false;
        if (parts[1].length > CONFIG.validation.emailMaxLength.domain) return false;
        
        return true;
    }

    // FIXED: Proper UK phone validation
    isValidPhone(phone) {
        // Remove common separators
        const cleaned = phone.replace(/[\s\-()]/g, '');
        
        const formats = CONFIG.validation.phoneFormats;
        return formats.ukMobile.test(cleaned) || formats.ukLandline.test(cleaned);
    }

    // ===== NAVIGATION (UNIFIED WITH STANDARD QUESTIONNAIRE) =====
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
            this.scrollToTop();
        }
    }

    prevSection() {
        if (this.currentSection > 1) {
            this.currentSection--;
            this.showSection(this.currentSection);
            this.updateProgress();
            this.scrollToTop();
        }
    }

    showSection(sectionNum) {
        // Hide all sections
        document.querySelectorAll('.question-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
            section.setAttribute('aria-hidden', 'true');
        });

        // Show current section
        const currentSection = document.querySelector(`[data-section="${sectionNum}"]`);
        if (currentSection) {
            currentSection.style.display = 'block';
            currentSection.classList.add('active');
            currentSection.setAttribute('aria-hidden', 'false');
        }

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateNavigationButtons() {
        // Update all navigation button sets
        const currentActiveSection = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (!currentActiveSection) return;

        const navButtons = currentActiveSection.querySelector('.navigation-buttons');
        if (!navButtons) return;

        const prevBtn = navButtons.querySelector('.secondary-btn');
        const nextBtn = navButtons.querySelector('.primary-btn');

        // Update previous button visibility
        if (prevBtn) {
            prevBtn.style.visibility = this.currentSection === 1 ? 'hidden' : 'visible';
            prevBtn.setAttribute('aria-label', `Go back to section ${this.currentSection - 1}`);
        }

        // Update next/submit button
        if (nextBtn) {
            if (this.currentSection === CONFIG.totalSections) {
                nextBtn.textContent = 'Submit Assessment ✓';
                nextBtn.setAttribute('aria-label', 'Submit premium assessment');
                nextBtn.type = 'submit'; // Ensure it's submit type
            } else {
                nextBtn.textContent = 'Next Section →';
                nextBtn.setAttribute('aria-label', `Continue to section ${this.currentSection + 1}`);
                nextBtn.type = 'button'; // Ensure it's button type
            }
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressBar = document.querySelector('.progress-bar');
        const currentSectionDisplay = document.getElementById('current-section');
        const currentQuestionDisplay = document.getElementById('current-question');

        if (progressFill) {
            const percentage = (this.currentSection / CONFIG.totalSections) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        // Update ARIA progressbar
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', this.currentSection);
            progressBar.setAttribute('aria-valuetext', 
                `Section ${this.currentSection} of ${CONFIG.totalSections}`);
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
        
        // Trap focus in modal
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const trapFocus = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        modal.addEventListener('keydown', trapFocus);
        
        setTimeout(() => {
            modal.style.opacity = '1';
            if (firstElement) firstElement.focus();
        }, 100);
    }

    createMilestoneModal() {
        const modal = document.createElement('div');
        modal.className = 'premium-milestone-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'milestone-title');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-describedby', 'milestone-description');
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-icon" aria-hidden="true">🎯</div>
                <h3 id="milestone-title">Excellent Progress!</h3>
                <p id="milestone-description">You're halfway through your premium care assessment.<br>Your detailed profile is helping us find the perfect match.</p>
                <button class="modal-close" aria-label="Continue with assessment">Continue</button>
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
        indicator.setAttribute('aria-atomic', 'true');
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

    // FIXED: Improved data restoration logic
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

            // Check version compatibility
            if (storageData.version !== this.version) {
                console.warn('Version mismatch - saved data may be incompatible');
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

            // FIXED: Improved section restoration with proper user choice handling
            if (storageData.currentSection && storageData.currentSection > 1) {
                const lastSavedDate = new Date(storageData.savedAt).toLocaleString('en-GB');
                const shouldRestore = confirm(
                    `Would you like to continue from where you left off?\n\n` +
                    `Last saved: ${lastSavedDate}\n` +
                    `Section: ${storageData.currentSection} of ${CONFIG.totalSections}`
                );
                
                if (shouldRestore) {
                    this.currentSection = storageData.currentSection;
                    this.showSection(this.currentSection);
                    this.updateProgress();
                    console.log('✓ Restored session from section', this.currentSection);
                } else {
                    // User declined - clear saved data and start fresh
                    localStorage.removeItem(CONFIG.storageKey);
                    console.log('Starting fresh assessment');
                }
            }

        } catch (e) {
            console.warn('Failed to load saved data:', e);
            // Clear corrupted data
            localStorage.removeItem(CONFIG.storageKey);
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

    // ===== FORM SUBMISSION (FIXED) =====
    async submitForm(e) {
        // FIXED: Handle event parameter
        if (e) e.preventDefault();
        
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
                submitBtn.setAttribute('aria-busy', 'true');
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
                submitBtn.removeAttribute('aria-busy');
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
        
        this.scrollToTop();
        
        // Focus for screen readers
        successDiv.focus();
        
        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = `thank-you.html?id=${submissionId}&type=premium`;
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
        
        this.scrollToTop();
        errorDiv.focus();
    }
}

// ===== UNIT TEST UTILITIES =====
// Export testing utilities for validation methods
const TestUtils = {
    /**
     * Test email validation
     * @param {string} email - Email to test
     * @returns {boolean}
     */
    testEmail: (email) => {
        const instance = new CareHomeQuestionnaire();
        return instance.isValidEmail(email);
    },
    
    /**
     * Test phone validation
     * @param {string} phone - Phone number to test
     * @returns {boolean}
     */
    testPhone: (phone) => {
        const instance = new CareHomeQuestionnaire();
        return instance.isValidPhone(phone);
    },
    
    /**
     * Test form data collection
     * @returns {object}
     */
    testCollectFormData: () => {
        const instance = new CareHomeQuestionnaire();
        return instance.collectFormData();
    },
    
    /**
     * Run all validation tests
     * @returns {object} Test results
     */
    runValidationTests: () => {
        const results = {
            email: {
                valid: [
                    'test@example.com',
                    'user.name@example.co.uk',
                    'test+tag@domain.com'
                ].map(e => ({ email: e, valid: TestUtils.testEmail(e) })),
                invalid: [
                    'invalid.email',
                    '@example.com',
                    'test@',
                    'test @example.com'
                ].map(e => ({ email: e, valid: TestUtils.testEmail(e) }))
            },
            phone: {
                valid: [
                    '07123456789',
                    '+447123456789',
                    '01234567890',
                    '020 1234 5678'
                ].map(p => ({ phone: p, valid: TestUtils.testPhone(p) })),
                invalid: [
                    '1234567',
                    '07',
                    '+44 07123456789', // Invalid: +44 followed by 0
                    'not-a-phone'
                ].map(p => ({ phone: p, valid: TestUtils.testPhone(p) }))
            }
        };
        
        console.group('🧪 Validation Test Results');
        console.log('Email Tests:', results.email);
        console.log('Phone Tests:', results.phone);
        console.groupEnd();
        
        return results;
    }
};

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    const questionnaire = new CareHomeQuestionnaire();
    
    // Expose for debugging and testing
    if (typeof window !== 'undefined') {
        window.premiumQuestionnaire = questionnaire;
        window.QuestionnaireTestUtils = TestUtils;
    }
    
    console.log('✅ Premium Care Home Questionnaire v2.2 ready - FIXED & ENHANCED version');
    console.log('🧪 Run QuestionnaireTestUtils.runValidationTests() to test validation');
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CareHomeQuestionnaire, TestUtils };
}