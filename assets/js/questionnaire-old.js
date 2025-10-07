/**
 * Enhanced Care Home Questionnaire [2025 UPDATE] 
 * Integrated with updated design system
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
        this.version = '2025.1';
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
        this.loadSavedData();
        this.setupConditionalLogic();
        this.showSection(1);
        console.log('Questionnaire initialized');
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

        const debouncedSave = this.debounce(() => this.saveFormData(), 500);
        document.addEventListener('input', debouncedSave);
        document.addEventListener('change', debouncedSave);
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

    setupConditionalLogic() {
        const relationshipInputs = document.querySelectorAll('input[name="contact_004"]');
        const patientNameSection = document.getElementById('patient-name-section');
        const patientNameInput = document.getElementById('contact_005');

        if (!relationshipInputs.length || !patientNameSection) return;

        const togglePatientName = () => {
            const selectedValue = document.querySelector('input[name="contact_004"]:checked')?.value;
            
            if (selectedValue === 'myself') {
                patientNameSection.style.display = 'none';
                if (patientNameInput) {
                    patientNameInput.removeAttribute('required');
                    patientNameInput.value = '';
                }
            } else {
                patientNameSection.style.display = 'block';
                if (patientNameInput) {
                    patientNameInput.setAttribute('required', 'required');
                }
            }
        };

        relationshipInputs.forEach(input => {
            input.addEventListener('change', togglePatientName);
        });
        togglePatientName();
    }

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
        const exclusiveValues = ['none', 'no_preference', 'not_important'];
        if (exclusiveValues.includes(input.value) && input.checked) {
            document.querySelectorAll(`input[name="${input.name}"]:not([value="${input.value}"])`).forEach(other => {
                other.checked = false;
                this.updateCheckboxSelection(other.name);
            });
        }
    }

    nextSection() {
        if (this.validateCurrentSection()) {
            if (this.currentSection < this.totalSections) {
                this.currentSection++;
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
                    this.showError(field.closest('.form-group'), 'Please select at least one option');
                    isValid = false;
                }
            } else if (field.type === 'email') {
                if (!field.value.trim()) {
                    this.showError(field.closest('.form-group'), 'This field is required');
                    isValid = false;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
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

    showError(element, message) {
        if (!element) return;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
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
        alert('🎉 Halfway there! Your detailed profile is taking shape.');
    }

    saveFormData() {
        const formData = new FormData(document.getElementById('questionnaire-form'));
        const data = Object.fromEntries(formData);
        data.currentSection = this.currentSection;
        data.version = this.version;
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
                }
            }
        } catch (error) {
            console.warn('Load failed:', error);
        }
    }

    async submitForm(e) {
        e.preventDefault();
        if (!this.validateCurrentSection()) return;

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        await new Promise(resolve => setTimeout(resolve, 1000));
        localStorage.removeItem(this.storageKey);
        window.location.href = 'thank-you.html';
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('questionnaire-form')) {
        window.careHomeQuestionnaire = new CareHomeQuestionnaire();
    }
});