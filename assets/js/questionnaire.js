/**
 * Enhanced Care Home Questionnaire [2025 UPDATE v2.1] 
 * Updated to 17 Questions: Implements new field names and removes conditional logic for patient name.
 */

// Read colors from CSS variables
const QUESTIONNAIRE_COLORS = {
    primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6B7C6E',
    primaryDark: getComputedStyle(document.documentElement).getPropertyValue('--primary-dark').trim() || '#4A5C4D',
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#C08B7A',
    accentHover: getComputedStyle(document.documentElement).getPropertyValue('--accent-hover').trim() || '#B07B6A',
    success: getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#7A9471',
    error: getComputedStyle(document.documentElement).getPropertyValue('--error').trim() || '#C47A7A',
    backgroundSoft: getComputedStyle(document.documentElement).getPropertyValue('--background-soft').trim() || '#F5F2EE'
};

class CareHomeQuestionnaire {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 5;
        this.formData = {};
        this.startTime = Date.now();
        this.storageKey = 'careHomeQuestionnaire';
        this.version = '2025.2.1'; // Updated version for 17 questions
        this.lastSaveTime = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
        this.loadSavedData();
        // Removed setupConditionalLogic() as Q5 patient name field is removed/merged
        this.showSection(1);
        this.setupPeriodicBackup();
        this.createSaveIndicator();
        console.log('Questionnaire initialized v' + this.version);
    }

    bindEvents() {
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const form = document.getElementById('questionnaire-form');

        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSection());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSection());
        if (form) form.addEventListener('submit', (e) => this.submitForm(e));

        this.setupRadioButtons();
        this.setupCheckboxes();
        this.setupKeyboardNavigation();

        const debouncedSave = this.debounce(() => this.saveFormData(), 500);
        document.addEventListener('input', debouncedSave);
        document.addEventListener('change', debouncedSave);
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Don't interfere with typing
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowRight' && this.currentSection < this.totalSections) {
                e.preventDefault();
                this.nextSection();
            } else if (e.key === 'ArrowLeft' && this.currentSection > 1) {
                e.preventDefault();
                this.prevSection();
            } else if (e.key === 'Enter' && e.target.classList.contains('modal-close')) {
                e.target.click();
            }
        });
    }

    setupRadioButtons() {
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', (e) => {
                if (e.target.type === 'radio') return;
                const input = option.querySelector('input[type="radio"]');
                if (input && !input.disabled) {
                    input.checked = true;
                    this.updateRadioSelection(input.name);
                }
            });
        });

        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => this.updateRadioSelection(input.name));
        });
    }

    setupCheckboxes() {
        document.querySelectorAll('.checkbox-option').forEach(option => {
            option.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox') return;
                const input = option.querySelector('input[type="checkbox"]');
                if (input && !input.disabled) {
                    input.checked = !input.checked;
                    this.updateCheckboxSelection(input.name);
                    this.handleExclusiveCheckbox(input);
                }
            });
        });

        document.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateCheckboxSelection(input.name);
                this.handleExclusiveCheckbox(input);
            });
        });
    }

    // Removed setupConditionalLogic()

    updateRadioSelection(name) {
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
            const option = radio.closest('.radio-option');
            if (option) {
                if (radio.checked) {
                    option.classList.add('selected');
                    option.style.background = QUESTIONNAIRE_COLORS.backgroundSoft;
                    option.style.borderColor = QUESTIONNAIRE_COLORS.accent;
                } else {
                    option.classList.remove('selected');
                    option.style.background = '';
                    option.style.borderColor = '';
                }
            }
        });
    }

    updateCheckboxSelection(name) {
        document.querySelectorAll(`input[name="${name}"]`).forEach(checkbox => {
            const option = checkbox.closest('.checkbox-option');
            if (option) {
                if (checkbox.checked) {
                    option.classList.add('selected');
                    option.style.background = QUESTIONNAIRE_COLORS.backgroundSoft;
                    option.style.borderColor = QUESTIONNAIRE_COLORS.accent;
                } else {
                    option.classList.remove('selected');
                    option.style.background = '';
                    option.style.borderColor = '';
                }
            }
        });
    }

    handleExclusiveCheckbox(input) {
        // Updated exclusive values based on new checklist options
        const exclusiveValues = ['no_serious_medical', 'no_allergies', 'no_special_requirements'];
        
        if (exclusiveValues.includes(input.value) && input.checked) {
            document.querySelectorAll(`input[name="${input.name}"]:not([value="${input.value}"])`).forEach(other => {
                other.checked = false;
                this.updateCheckboxSelection(other.name);
            });
        }
        
        // If an exclusive option is unchecked, re-enable the other options (or allow them to be checked)
        if (exclusiveValues.includes(input.value) && !input.checked) {
            // No need to explicitly re-enable, as they were never truly disabled, just unchecked
        }
        
        // Handle when a non-exclusive option is checked, unchecking the exclusive option
        if (!exclusiveValues.includes(input.value) && input.checked) {
            const exclusiveInput = document.querySelector(`input[name="${input.name}"][value="no_serious_medical"]`) ||
                                   document.querySelector(`input[name="${input.name}"][value="no_allergies"]`) ||
                                   document.querySelector(`input[name="${input.name}"][value="no_special_requirements"]`);
            
            if (exclusiveInput && exclusiveInput.checked) {
                exclusiveInput.checked = false;
                this.updateCheckboxSelection(exclusiveInput.name);
            }
        }
    }

    nextSection() {
        if (this.validateCurrentSection()) {
            if (this.currentSection < this.totalSections) {
                this.currentSection++;
                // Milestone logic remains the same
                if (this.currentSection === 3) this.showMilestone();
                this.showSection(this.currentSection);
                this.updateProgress();
                this.scrollToTop();
            }
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

    validateCurrentSection() {
        const currentSectionElement = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (!currentSectionElement) return false;

        const requiredFields = currentSectionElement.querySelectorAll('[required]');
        let isValid = true;

        currentSectionElement.querySelectorAll('.error-message').forEach(error => error.remove());

        requiredFields.forEach(field => {
            if (field.type === 'radio') {
                const radioGroup = currentSectionElement.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) {
                    this.showError(field.closest('.form-group'), 'Please select an option');
                    isValid = false;
                }
            } else if (field.type === 'checkbox') {
                const checkboxGroup = currentSectionElement.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(checkboxGroup).some(checkbox => checkbox.checked);
                if (!isChecked) {
                    // Check if the requirement is for *at least one*
                    const isGroupRequired = field.hasAttribute('required');
                    if (isGroupRequired) {
                        this.showError(field.closest('.form-group'), 'Please select at least one option');
                        isValid = false;
                    }
                }
            } else if (field.type === 'email') {
                if (!field.value.trim()) {
                    this.showError(field.closest('.form-group'), 'This field is required');
                    isValid = false;
                } else if (!this.validateEmail(field.value)) {
                    this.showError(field.closest('.form-group'), 'Please enter a valid email');
                    isValid = false;
                }
            } else if (!field.value.trim()) {
                this.showError(field.closest('.form-group'), 'This field is required');
                isValid = false;
            }
        });

        return isValid;
    }

    validateEmail(email) {
        // Enhanced email validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(email)) return false;
        
        // Additional checks
        const parts = email.split('@');
        if (parts[0].length > 64) return false; // Local part max 64 chars
        if (parts[1].length > 255) return false; // Domain max 255 chars
        
        return true;
    }

    showError(element, message) {
        if (!element) return;
        // Check if an error message already exists to avoid duplication
        if (element.querySelector('.error-message')) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = QUESTIONNAIRE_COLORS.error;
        errorDiv.style.fontSize = '14px';
        errorDiv.style.marginTop = '5px';
        element.appendChild(errorDiv);
    }

    showSection(sectionNumber) {
        document.querySelectorAll('.question-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        const currentSection = document.querySelector(`[data-section="${sectionNumber}"]`);
        if (currentSection) {
            currentSection.style.display = 'block';
            currentSection.classList.add('active');
        }

        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (prevBtn) prevBtn.style.display = this.currentSection === 1 ? 'none' : 'block';

        if (this.currentSection === this.totalSections) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'block';
        } else {
            if (nextBtn) nextBtn.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progress = (this.currentSection / this.totalSections) * 100;
        if (progressFill) progressFill.style.width = `${progress}%`;

        const currentSectionSpan = document.getElementById('current-section');
        if (currentSectionSpan) currentSectionSpan.textContent = this.currentSection;

        this.updateMotivationalMessage();
    }

    updateMotivationalMessage() {
        const motivationDiv = document.getElementById('progress-motivation');
        if (!motivationDiv) return;

        const messages = [
            { title: "Ready to begin your personalised assessment", subtitle: "Each answer creates more accurate recommendations" },
            { title: "Location and budget help us find the right homes", subtitle: "Realistic recommendations with no hidden costs" },
            { title: "Medical needs are crucial for proper matching", subtitle: "Ensuring appropriate care levels" },
            { title: "Safety information protects your wellbeing", subtitle: "Finding homes with the right support" },
            { title: "Your profile is ready for analysis", subtitle: "Timeline completes your unique requirements" }
        ];

        const message = messages[this.currentSection - 1];
        if (message) {
            motivationDiv.innerHTML = `<h4>${message.title}</h4><p>${message.subtitle}</p>`;
        }
    }

    showMilestone() {
        const modal = this.createMilestoneModal();
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
            modal.style.opacity = '1';
        }, 100);
    }

    createMilestoneModal() {
        const modal = document.createElement('div');
        modal.className = 'milestone-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'milestone-title');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-icon">🎉</div>
                <h3 id="milestone-title">Halfway There!</h3>
                <p>Your detailed profile is taking shape. Great progress!</p>
                <button class="modal-close" aria-label="Close dialog">Continue</button>
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
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        `;

        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            position: relative;
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        const icon = modal.querySelector('.modal-icon');
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 20px;
        `;

        const title = modal.querySelector('h3');
        title.style.cssText = `
            color: ${QUESTIONNAIRE_COLORS.primary};
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
            background: ${QUESTIONNAIRE_COLORS.accent};
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = QUESTIONNAIRE_COLORS.accentHover;
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = QUESTIONNAIRE_COLORS.accent;
        });

        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        return modal;
    }

    setupPeriodicBackup() {
        // Additional backup every 30 seconds
        setInterval(() => {
            const form = document.getElementById('questionnaire-form');
            if (form && this.hasChanges()) {
                this.saveFormData();
                this.showSaveIndicator();
                console.log('🔄 Periodic backup saved');
            }
        }, 30000);
    }

    hasChanges() {
        const currentTime = Date.now();
        // If more than 10 seconds since last save
        return !this.lastSaveTime || (currentTime - this.lastSaveTime) > 10000;
    }

    createSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.setAttribute('role', 'status');
        indicator.setAttribute('aria-live', 'polite');
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${QUESTIONNAIRE_COLORS.success};
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
        return indicator;
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

    saveFormData() {
        const formData = new FormData(document.getElementById('questionnaire-form'));
        const data = Object.fromEntries(formData);
        data.currentSection = this.currentSection;
        data.version = this.version;
        data.lastSaved = new Date().toISOString();
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Save failed:', error);
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                if (data.version === this.version) {
                    this.currentSection = data.currentSection || 1;
                    this.showSection(this.currentSection);
                    this.updateProgress();
                    console.log('Restored saved data from:', data.lastSaved);
                    
                    // Re-apply selections for radios/checkboxes based on loaded data
                    Object.keys(data).forEach(key => {
                        const field = document.querySelector(`[name="${key}"]`);
                        if (!field) return;

                        if (field.type === 'radio') {
                            const radio = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                            if (radio) {
                                radio.checked = true;
                                this.updateRadioSelection(key);
                            }
                        } else if (field.type === 'checkbox') {
                            // Checkboxes can have multiple values saved as a single string of comma-separated values 
                            // or an array (if saved properly), but FormData returns single values.
                            // Assuming a simple key=value pair for simplicity based on provided HTML structure.
                            const checkboxes = document.querySelectorAll(`input[name="${key}"]`);
                            checkboxes.forEach(cb => {
                                if (data[key].includes(cb.value)) {
                                    cb.checked = true;
                                }
                            });
                            this.updateCheckboxSelection(key);
                        } else {
                            field.value = data[key];
                        }
                    });
                } else {
                    console.log(`Saved data version (${data.version}) mismatch with current version (${this.version}). Discarding saved data.`);
                    localStorage.removeItem(this.storageKey);
                }
            }
        } catch (error) {
            console.warn('Load failed:', error);
        }
    }

    /**
     * Email notification system (placeholder for future backend integration)
     * TODO: Connect to backend API when ready
     */
    async sendEmailNotification(formData) {
        console.log('📧 Email function called (placeholder mode)');
        console.log('Would send to:', formData.contact_002); // email field
        
        // Prepare email data structure
        const emailPayload = {
            to: formData.contact_002,
            subject: 'Care Home Questionnaire Received',
            template: 'questionnaire-confirmation',
            data: {
                name: formData.patient_and_contact_names.split(';')[0].split(':')[1]?.trim() || 'Valued User',
                submissionId: this.generateSubmissionId(),
                timestamp: new Date().toISOString()
            }
        };
        
        // Placeholder response
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
        return `CARE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    getCsrfToken() {
        // TODO: Implement proper CSRF token retrieval when backend is ready
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    }

    async submitForm(e) {
        e.preventDefault();
        // Section 5 is the final section.
        if (!this.validateCurrentSection()) return;

        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Collect form data
            const formData = new FormData(document.getElementById('questionnaire-form'));
            // Special handling for checkboxes to store multiple values per key
            const data = {};
            for(let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (!Array.isArray(data[key])) {
                        data[key] = [data[key]];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }

            const submissionId = this.generateSubmissionId();
            
            // Additional metadata
            const payload = {
                ...data,
                submissionId,
                version: this.version,
                completionTime: Math.round((Date.now() - this.startTime) / 1000), // seconds
                timestamp: new Date().toISOString()
            };

            // Email notification (placeholder)
            const emailResult = await this.sendEmailNotification(payload);
            console.log('Email result:', emailResult);

            // Temporary: save to localStorage as backup
            localStorage.setItem('lastSubmission', JSON.stringify(payload));
            console.log('✅ Submission saved locally:', submissionId);
            
            // Clear form draft
            localStorage.removeItem(this.storageKey);
            
            // Redirect with ID (Placeholder for production redirect)
            // window.location.href = `thank-you.html?id=${submissionId}`;
            this.showSubmitError(`Assessment complete! Submission ID: ${submissionId}. Your data is processed.`);
            
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showSubmitError('Unable to submit your questionnaire. Your data is saved locally. Please try again or contact support.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showSubmitError(message) {
        // Remove any existing error messages
        document.querySelectorAll('.submit-error').forEach(el => el.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'submit-error';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.style.cssText = `
            background: ${QUESTIONNAIRE_COLORS.error};
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
        form.insertBefore(errorDiv, form.firstChild);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 8000);
        
        this.scrollToTop();
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
}

// Initialize questionnaire
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('questionnaire-form')) {
        window.careHomeQuestionnaire = new CareHomeQuestionnaire();
        console.log('✅ Care Home Questionnaire v2025.2.1 ready');
    }
});
