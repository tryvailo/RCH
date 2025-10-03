/**
 * Premium Care Home Questionnaire - Navigation & Validation Script
 * Optimised for 55+ audience with British English
 * Version: 1.0 | October 2025
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
    storageKey: 'rightcarehome_premium_assessment',
    storageExpiry: 24 * 60 * 60 * 1000 // 24 hours
};

// ===== MAIN QUESTIONNAIRE CLASS =====
class CareHomeQuestionnaire {
    constructor() {
        this.currentSection = 1;
        this.formData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupRadioCheckboxHandlers();
        this.loadSavedData();
        this.updateProgress();
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Navigation buttons - using event delegation
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.id === 'next-btn' || target.closest('#next-btn')) {
                e.preventDefault();
                this.nextSection();
            }
            
            if (target.id === 'prev-btn' || target.closest('#prev-btn')) {
                e.preventDefault();
                this.prevSection();
            }
        });

        // Form submission
        const form = document.getElementById('questionnaire-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }

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

    // ===== RADIO & CHECKBOX HANDLERS =====
    setupRadioCheckboxHandlers() {
        // Radio button options
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', function(e) {
                // Prevent double-triggering if clicking directly on input
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
                
                // Trigger change event
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // Also handle direct input clicks
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
                // Prevent double-triggering if clicking directly on input
                if (e.target.tagName === 'INPUT') return;
                
                const checkbox = this.querySelector('input[type="checkbox"]');
                if (!checkbox) return;
                
                checkbox.checked = !checkbox.checked;
                this.classList.toggle('selected', checkbox.checked);
                
                // Trigger change event
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // Also handle direct input clicks
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

        // Validate text inputs
        section.querySelectorAll('input[type="text"][required], input[type="email"][required], input[type="tel"][required]').forEach(input => {
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

        // Validate checkbox groups (at least one must be checked)
        const checkboxNames = new Set();
        section.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            // Only validate if the group has required attribute
            const hasRequired = section.querySelector(`input[name="${checkbox.name}"][required]`);
            if (hasRequired) {
                checkboxNames.add(checkbox.name);
            }
        });

        checkboxNames.forEach(name => {
            const checkboxes = section.querySelectorAll(`input[name="${name}"]`);
            const isChecked = Array.from(checkboxes).some(c => c.checked);
            
            if (!isChecked) {
                const firstCheckbox = checkboxes[0];
                if (firstCheckbox) {
                    this.showError(firstCheckbox, 'Please select at least one option');
                    isValid = false;
                    errors.push(name);
                }
            }
        });

        // Scroll to first error if validation fails
        if (!isValid && errors.length > 0) {
            const firstErrorField = section.querySelector(`[name="${errors[0]}"]`);
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    showError(input, message) {
        // Clear any existing error
        this.clearError(input);

        // Add error class to input
        input.classList.add('error');

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        // Insert error message
        const parent = input.closest('.radio-option, .checkbox-option') || input.parentElement;
        if (parent) {
            parent.appendChild(errorDiv);
        }
    }

    clearError(input) {
        input.classList.remove('error');
        
        const parent = input.closest('.radio-option, .checkbox-option') || input.parentElement;
        if (parent) {
            const errorMsg = parent.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    isValidPhone(phone) {
        // Basic UK phone validation
        const cleaned = phone.replace(/\s+/g, '');
        return /^(\+44|0)[1-9]\d{8,9}$/.test(cleaned);
    }

    // ===== NAVIGATION =====
    nextSection() {
        if (this.validateCurrentSection()) {
            if (this.currentSection < CONFIG.totalSections) {
                this.currentSection++;
                this.showSection(this.currentSection);
                this.updateProgress();
                this.saveFormData();
            }
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
        }

        // Update navigation buttons
        this.updateNavigationButtons();

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateNavigationButtons() {
        const prevBtns = document.querySelectorAll('#prev-btn');
        const nextBtns = document.querySelectorAll('#next-btn');

        prevBtns.forEach(btn => {
            btn.style.visibility = this.currentSection === 1 ? 'hidden' : 'visible';
        });

        nextBtns.forEach(btn => {
            if (this.currentSection === CONFIG.totalSections) {
                btn.textContent = 'Submit Assessment ✓';
                btn.type = 'submit';
            } else {
                btn.textContent = 'Next Section →';
                btn.type = 'button';
            }
        });
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

    // ===== DATA MANAGEMENT =====
    collectFormData() {
        const data = {
            timestamp: new Date().toISOString(),
            assessment_version: '1.0',
            completed_sections: this.currentSection
        };

        // Collect all form inputs
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

        // Checkboxes - collect all checked values as array
        const checkboxGroups = {};
        form.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            if (!checkboxGroups[checkbox.name]) {
                checkboxGroups[checkbox.name] = [];
            }
            checkboxGroups[checkbox.name].push(checkbox.value);
        });

        // Add checkbox data
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
                savedAt: Date.now()
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
            
            // Check if data is expired
            const now = Date.now();
            if (now - storageData.savedAt > CONFIG.storageExpiry) {
                localStorage.removeItem(CONFIG.storageKey);
                return;
            }

            // Restore form values
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

            // Restore section if saved
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

    // ===== FORM SUBMISSION =====
    async submitForm() {
        // Validate final section
        if (!this.validateCurrentSection()) {
            return;
        }

        // Collect all form data
        const formData = this.collectFormData();

        // Add metadata
        formData.user_agent = navigator.userAgent;
        formData.screen_resolution = `${window.screen.width}x${window.screen.height}`;
        formData.completed_sections = CONFIG.totalSections;

        console.log('Submitting form data:', formData);

        try {
            // Show loading state
            const submitBtn = document.querySelector('#submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            // Submit to API
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Submission successful:', result);
                
                // Clear saved data
                localStorage.removeItem(CONFIG.storageKey);
                
                // Redirect to thank you page
                window.location.href = '/thank-you.html';
            } else {
                throw new Error('Submission failed');
            }

        } catch (error) {
            console.error('Submission error:', error);
            
            // Show error message
            alert('There was an error submitting your assessment. Please try again or contact support if the problem persists.');
            
            // Reset button
            const submitBtn = document.querySelector('#submit-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Assessment ✓';
            }
        }
    }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    new CareHomeQuestionnaire();
    console.log('Premium Care Home Questionnaire initialised - 38 Questions | v1.0');
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareHomeQuestionnaire;
}