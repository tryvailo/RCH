/**
 * Enhanced Care Home Questionnaire [NEW 2024] 
 * Integrated with updated design system and modern functionality
 */

// ===== UPDATED COLOR CONSTANTS FOR CONSISTENCY =====
const QUESTIONNAIRE_COLORS = {
    primary: '#4A90E2',           // Updated primary blue
    primaryDark: '#2C5F8B',
    accent: '#E8B86D',            // Updated accent color
    accentHover: '#D4A355',
    success: '#6BBF59',           // Updated success green
    error: '#EF4444',
    warning: '#F59E0B',
    textPrimary: '#2D3748',       // Updated warm text
    textSecondary: '#4A5568',
    backgroundWarm: '#F7F5F3',    // Updated warm background
    backgroundSoft: '#FAF8F5',
    borderWarm: '#E2D7CC'         // Updated warm border
};

class CareHomeQuestionnaire {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 8;
        this.formData = {};
        this.startTime = Date.now();
        this.storageKey = 'careHomeQuestionnaire';
        this.version = '2024.1'; // Updated version
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
        this.loadSavedData();
        this.addAccessibilityFeatures();
        this.initModernStyling(); // NEW: Apply modern styling

        // Initialize sections visibility
        this.showSection(1);
        console.log('Enhanced CareHomeQuestionnaire [2024] initialized');

        // Track initialization with modern analytics
        if (window.CareHomeUtils) {
            window.CareHomeUtils.trackEvent('questionnaire_initialized', {
                version: this.version,
                total_sections: this.totalSections,
                user_agent: navigator.userAgent,
                viewport: `${window.innerWidth}x${window.innerHeight}`
            });
        }
    }

    // NEW: Apply modern styling to questionnaire elements
    initModernStyling() {
        // Update progress bar styling
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.background = `linear-gradient(90deg, ${QUESTIONNAIRE_COLORS.primary} 0%, ${QUESTIONNAIRE_COLORS.accent} 100%)`;
            progressFill.style.borderRadius = '6px';
        }

        // Style buttons with modern colors
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                if (!this.classList.contains('selected')) {
                    this.style.background = QUESTIONNAIRE_COLORS.backgroundSoft;
                    this.style.borderColor = QUESTIONNAIRE_COLORS.accent;
                }
            });

            btn.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected')) {
                    this.style.background = '';
                    this.style.borderColor = '';
                }
            });
        });

        // Apply modern styling to navigation buttons
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (nextBtn) {
            nextBtn.style.background = `linear-gradient(135deg, ${QUESTIONNAIRE_COLORS.accent} 0%, ${QUESTIONNAIRE_COLORS.accentHover} 100%)`;
            nextBtn.style.borderColor = QUESTIONNAIRE_COLORS.accent;
        }

        if (prevBtn) {
            prevBtn.style.borderColor = QUESTIONNAIRE_COLORS.primary;
            prevBtn.style.color = QUESTIONNAIRE_COLORS.primary;
        }

        if (submitBtn) {
            submitBtn.style.background = `linear-gradient(135deg, ${QUESTIONNAIRE_COLORS.success} 0%, #059669 100%)`;
        }
    }

    addAccessibilityFeatures() {
        // Enhanced keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('rating-btn')) {
                e.target.click();
            }

            // Enhanced arrow key navigation
            if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.classList.contains('rating-btn')) {
                e.preventDefault();
                const ratingGroup = e.target.closest('.rating-group');
                if (ratingGroup) {
                    const buttons = Array.from(ratingGroup.querySelectorAll('.rating-btn'));
                    const currentIndex = buttons.indexOf(e.target);
                    let nextIndex;

                    if (e.key === 'ArrowLeft') {
                        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                    } else {
                        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                    }

                    buttons[nextIndex].focus();
                }
            }

            // Enhanced escape key handling
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal);
                }
            }
        });

        // Enhanced focus indicators
        document.querySelectorAll('input, button, select').forEach(element => {
            element.addEventListener('focus', function() {
                this.style.outline = `3px solid ${QUESTIONNAIRE_COLORS.accent}`;
                this.style.outlineOffset = '2px';
            });

            element.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }

    bindEvents() {
        // Navigation buttons
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSection());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSection());
        }

        // Enhanced form submission
        const form = document.getElementById('questionnaire-form');
        if (form) {
            form.addEventListener('submit', (e) => this.submitForm(e));
        }

        // Setup enhanced form interactions
        this.setupRadioButtons();
        this.setupCheckboxes();
        this.setupRatingButtons();
        this.setupConditionalLogic();

        // Enhanced auto-save with debouncing
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
                    this.saveFormData();

                    // Enhanced visual feedback
                    this.animateSelection(option);

                    // Screen reader announcement
                    if (window.CareHomeUtils) {
                        const label = input.nextElementSibling?.textContent || input.value;
                        window.CareHomeUtils.announceToScreenReader(`Selected: ${label}`);
                    }
                }
            });
        });

        // Handle direct input clicks
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateRadioSelection(input.name);
                this.saveFormData();
                this.animateSelection(input.closest('.radio-option'));
            });
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
                    this.saveFormData();
                    this.handleExclusiveCheckbox(input);
                    this.animateSelection(option);
                }
            });
        });

        document.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateCheckboxSelection(input.name);
                this.handleExclusiveCheckbox(input);
                this.saveFormData();
                this.animateSelection(input.closest('.checkbox-option'));
            });
        });
    }

    setupRatingButtons() {
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const name = btn.dataset.name;
                const value = btn.dataset.value;

                if (!name || !value) return;

                // Clear previous selections
                document.querySelectorAll(`[data-name="${name}"]`).forEach(b => {
                    b.classList.remove('selected');
                    b.setAttribute('aria-pressed', 'false');
                    b.style.background = '';
                    b.style.borderColor = '';
                    b.style.color = '';
                    b.style.transform = '';
                });

                // Select current with modern styling
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
                btn.style.background = `linear-gradient(135deg, ${QUESTIONNAIRE_COLORS.accent} 0%, ${QUESTIONNAIRE_COLORS.accentHover} 100%)`;
                btn.style.borderColor = QUESTIONNAIRE_COLORS.accent;
                btn.style.color = 'white';
                btn.style.transform = 'scale(1.05)';

                // Update hidden input
                const hiddenInput = document.querySelector(`input[name="${name}"]`);
                if (hiddenInput) {
                    hiddenInput.value = value;
                }

                // Enhanced screen reader announcement
                if (window.CareHomeUtils) {
                    window.CareHomeUtils.announceToScreenReader(`Selected rating: ${value} out of 5`);
                }

                this.saveFormData();
            });

            // Enhanced ARIA attributes
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('tabindex', '0');
        });
    }

    setupConditionalLogic() {
        this.setupPatientNameLogic();
        this.setupLanguageLogic();
        this.setupBudgetLogic(); // NEW: Enhanced budget logic
    }

    setupPatientNameLogic() {
        const relationshipInputs = document.querySelectorAll('input[name="contact_004"]');
        const patientNameSection = document.getElementById('patient-name-section');
        const patientNameInput = document.getElementById('contact_005');

        if (!relationshipInputs.length || !patientNameSection) return;

        const togglePatientName = () => {
            const selectedValue = document.querySelector('input[name="contact_004"]:checked')?.value;

            if (selectedValue === 'myself') {
                // Smooth fade out
                patientNameSection.style.transition = 'all 0.3s ease';
                patientNameSection.style.opacity = '0';
                patientNameSection.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    patientNameSection.style.display = 'none';
                }, 300);

                if (patientNameInput) {
                    patientNameInput.removeAttribute('required');
                    patientNameInput.value = '';
                }
            } else {
                patientNameSection.style.display = 'block';

                // Smooth fade in
                requestAnimationFrame(() => {
                    patientNameSection.style.opacity = '1';
                    patientNameSection.style.transform = 'translateY(0)';
                });

                if (patientNameInput) {
                    patientNameInput.setAttribute('required', 'required');
                }
            }
        };

        relationshipInputs.forEach(input => {
            input.addEventListener('change', togglePatientName);
        });

        togglePatientName(); // Initial check
    }

    setupLanguageLogic() {
        const languageInputs = document.querySelectorAll('input[name="culture_001"]');
        const otherLanguageSection = document.getElementById('other-language-section');
        const otherLanguageInput = document.getElementById('culture_002');

        if (!languageInputs.length || !otherLanguageSection) return;

        const toggleOtherLanguage = () => {
            const selectedValue = document.querySelector('input[name="culture_001"]:checked')?.value;

            if (selectedValue === 'other_language') {
                otherLanguageSection.style.display = 'block';
                otherLanguageSection.style.transition = 'all 0.3s ease';

                requestAnimationFrame(() => {
                    otherLanguageSection.style.opacity = '1';
                    otherLanguageSection.style.transform = 'translateY(0)';
                });

                if (otherLanguageInput) {
                    otherLanguageInput.setAttribute('required', 'required');
                    setTimeout(() => otherLanguageInput.focus(), 300);
                }
            } else {
                otherLanguageSection.style.opacity = '0';
                otherLanguageSection.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    otherLanguageSection.style.display = 'none';
                }, 300);

                if (otherLanguageInput) {
                    otherLanguageInput.removeAttribute('required');
                    otherLanguageInput.value = '';
                }
            }
        };

        languageInputs.forEach(input => {
            input.addEventListener('change', toggleOtherLanguage);
        });

        toggleOtherLanguage(); // Initial check
    }

    // NEW: Enhanced budget logic
    setupBudgetLogic() {
        const budgetInputs = document.querySelectorAll('input[name="budget_001"]');
        const budgetHelpSection = document.getElementById('budget-help-section');

        if (!budgetInputs.length) return;

        budgetInputs.forEach(input => {
            input.addEventListener('change', () => {
                const value = input.value;

                // Show budget guidance for lower ranges
                if (value === 'under_800' || value === '800_1000') {
                    this.showBudgetGuidance(value);
                }
            });
        });
    }

    showBudgetGuidance(budgetRange) {
        const guidance = {
            'under_800': 'Based on current Birmingham market rates, finding quality care under £800/week may be challenging. We'll help identify the best value options.',
            '800_1000': 'This budget range offers good options in Birmingham. Our analysis will show you the best value homes in this range.'
        };

        if (window.CareHomeUtils) {
            window.CareHomeUtils.showNotification(guidance[budgetRange], 'info', 8000);
        }
    }

    // Enhanced selection animation
    animateSelection(element) {
        if (!element) return;

        element.style.transition = 'all 0.2s ease';
        element.style.transform = 'scale(1.02)';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
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

        if (exclusiveValues.includes(input.value)) {
            if (input.checked) {
                // Uncheck all other options in the same group
                document.querySelectorAll(`input[name="${input.name}"]:not([value="${input.value}"])`).forEach(other => {
                    other.checked = false;
                    this.updateCheckboxSelection(other.name);
                });
            }
        } else {
            // If any other option is selected, uncheck exclusive options
            exclusiveValues.forEach(value => {
                const exclusiveInput = document.querySelector(`input[name="${input.name}"][value="${value}"]`);
                if (exclusiveInput && exclusiveInput.checked) {
                    exclusiveInput.checked = false;
                    this.updateCheckboxSelection(exclusiveInput.name);
                }
            });
        }
    }

    nextSection() {
        if (this.validateCurrentSection()) {
            if (this.currentSection < this.totalSections) {
                this.currentSection++;

                // Enhanced milestone celebration at 50%
                if (this.currentSection === 4) {
                    this.showEnhancedMilestone();
                }

                this.showSection(this.currentSection);
                this.updateProgress();

                if (window.CareHomeUtils) {
                    window.CareHomeUtils.scrollToTop();
                    window.CareHomeUtils.trackEvent('section_completed', {
                        section: this.currentSection - 1,
                        progress: (this.currentSection / this.totalSections) * 100
                    });
                }
            }
        }
    }

    // Enhanced milestone celebration
    showEnhancedMilestone() {
        const celebration = document.createElement('div');
        celebration.className = 'milestone-celebration-modern';

        Object.assign(celebration.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            background: `linear-gradient(135deg, ${QUESTIONNAIRE_COLORS.success} 0%, ${QUESTIONNAIRE_COLORS.primary} 100%)`,
            color: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(45, 55, 72, 0.3)',
            zIndex: '10000',
            textAlign: 'center',
            maxWidth: '400px',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)'
        });

        celebration.innerHTML = `
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎉</div>
            <h3 style="font-size: 1.5rem; font-weight: 800; margin: 0 0 0.5rem 0;">Halfway There!</h3>
            <p style="font-size: 1rem; margin: 0; opacity: 0.9;">
                Your profile is already much more detailed than any free service. 
                The AI is building a comprehensive picture of your needs.
            </p>
        `;

        document.body.appendChild(celebration);

        // Animate in
        requestAnimationFrame(() => {
            celebration.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Auto-remove after 4 seconds
        setTimeout(() => {
            celebration.style.transform = 'translate(-50%, -50%) scale(0)';
            celebration.style.opacity = '0';

            setTimeout(() => {
                if (celebration.parentNode) {
                    celebration.remove();
                }
            }, 500);
        }, 4000);
    }

    prevSection() {
        if (this.currentSection > 1) {
            this.currentSection--;
            this.showSection(this.currentSection);
            this.updateProgress();

            if (window.CareHomeUtils) {
                window.CareHomeUtils.scrollToTop();
            }
        }
    }

    validateCurrentSection() {
        const currentSectionElement = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (!currentSectionElement) {
            console.error(`Section ${this.currentSection} not found`);
            return false;
        }

        const requiredFields = currentSectionElement.querySelectorAll('[required]');
        let isValid = true;

        // Clear previous errors with animation
        currentSectionElement.querySelectorAll('.error-msg').forEach(error => {
            error.style.opacity = '0';
            setTimeout(() => error.remove(), 200);
        });

        requiredFields.forEach(field => {
            if (field.type === 'radio') {
                const radioGroup = currentSectionElement.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) {
                    this.showEnhancedError(field.closest('div'), 'Please select an option');
                    isValid = false;
                }
            } else if (field.type === 'checkbox') {
                const checkboxGroup = currentSectionElement.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(checkboxGroup).some(checkbox => checkbox.checked);
                if (!isChecked) {
                    this.showEnhancedError(field.closest('div'), 'Please select at least one option');
                    isValid = false;
                }
            } else if (field.type === 'hidden') {
                if (!field.value) {
                    const ratingContainer = field.closest('div');
                    this.showEnhancedError(ratingContainer, 'Please make a selection');
                    isValid = false;
                }
            } else if (field.type === 'email') {
                if (!field.value.trim()) {
                    this.showEnhancedError(field, 'This field is required');
                    isValid = false;
                } else if (window.CareHomeUtils && !window.CareHomeUtils.validateEmail(field.value)) {
                    this.showEnhancedError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            } else if (!field.value.trim()) {
                this.showEnhancedError(field, 'This field is required');
                isValid = false;
            }
        });

        return isValid;
    }

    // Enhanced error display
    showEnhancedError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-msg error-modern';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');

        Object.assign(errorDiv.style, {
            color: QUESTIONNAIRE_COLORS.error,
            fontSize: '0.875rem',
            fontWeight: '600',
            marginTop: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            border: `1px solid ${QUESTIONNAIRE_COLORS.error}`,
            opacity: '0',
            transform: 'translateY(-10px)',
            transition: 'all 0.3s ease'
        });

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.parentNode.appendChild(errorDiv);
        } else {
            element.appendChild(errorDiv);
        }

        // Animate in
        requestAnimationFrame(() => {
            errorDiv.style.opacity = '1';
            errorDiv.style.transform = 'translateY(0)';
        });

        // Scroll to first error if needed
        if (element.getBoundingClientRect().top < 0) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    showSection(sectionNumber) {
        // Hide all sections with fade effect
        document.querySelectorAll('.question-section').forEach(section => {
            section.classList.remove('active');
            section.style.opacity = '0';
            section.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                section.style.display = 'none';
            }, 200);
        });

        // Show current section with enhanced animation
        setTimeout(() => {
            const currentSection = document.querySelector(`[data-section="${sectionNumber}"]`);
            if (currentSection) {
                currentSection.style.display = 'block';
                currentSection.classList.add('active');

                requestAnimationFrame(() => {
                    currentSection.style.opacity = '1';
                    currentSection.style.transform = 'translateX(0)';
                });
            }
        }, 100);

        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (prevBtn) {
            prevBtn.style.display = this.currentSection === 1 ? 'none' : 'block';
        }

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

        if (progressFill) {
            progressFill.style.width = `${progress}%`;

            // Enhanced progress animation
            progressFill.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        // Update section text
        const currentSectionSpan = document.getElementById('current-section');
        if (currentSectionSpan) {
            currentSectionSpan.textContent = this.currentSection;
        }

        // Update motivational message
        this.updateMotivationalMessage(progress);
    }

    updateMotivationalMessage(progress) {
        const motivationDiv = document.getElementById('progress-motivation');
        if (!motivationDiv) return;

        const messages = [
            {
                title: "Ready to begin your personalised care home assessment",
                subtitle: "Each answer helps our AI create more accurate recommendations just for you"
            },
            {
                title: "Each answer makes your recommendations more personalised",
                subtitle: "Location preferences help us find care homes in the right area for your family"
            },
            {
                title: "Budget information ensures realistic recommendations",
                subtitle: "No hidden costs - we'll show you exactly what to expect financially"
            },
            {
                title: "Halfway there! Your profile is already far more detailed than any free service",
                subtitle: "Medical needs are crucial - this ensures we find homes with the right expertise"
            },
            {
                title: "Cultural preferences make a real difference to daily comfort",
                subtitle: "Language and religious needs often determine long-term happiness in care"
            },
            {
                title: "Comfort preferences create truly personalised matches",
                subtitle: "Activities and lifestyle choices help identify homes where you'll feel at home"
            },
            {
                title: "Family involvement shapes your care experience significantly",
                subtitle: "Visiting arrangements and family support are essential for peace of mind"
            },
            {
                title: "Your comprehensive profile is ready for AI analysis",
                subtitle: "Timeline and additional details complete your unique care home requirements"
            }
        ];

        const message = messages[this.currentSection - 1];
        if (!message) return;

        motivationDiv.innerHTML = `
            <h4 style="color: ${QUESTIONNAIRE_COLORS.textPrimary}; font-weight: 700; margin-bottom: 0.5rem;">
                ${message.title}
            </h4>
            <p style="color: ${QUESTIONNAIRE_COLORS.textSecondary}; margin: 0;">
                ${message.subtitle}
            </p>
        `;

        // Enhanced styling based on progress
        let backgroundGradient;
        if (progress >= 75) {
            backgroundGradient = `linear-gradient(135deg, rgba(107, 191, 89, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%)`;
        } else if (progress >= 50) {
            backgroundGradient = `linear-gradient(135deg, rgba(232, 184, 109, 0.1) 0%, rgba(107, 191, 89, 0.1) 100%)`;
        } else {
            backgroundGradient = `linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(232, 184, 109, 0.1) 100%)`;
        }

        Object.assign(motivationDiv.style, {
            background: backgroundGradient,
            border: `2px solid ${QUESTIONNAIRE_COLORS.borderWarm}`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'center'
        });
    }

    saveFormData() {
        const formData = new FormData(document.getElementById('questionnaire-form'));
        const data = Object.fromEntries(formData);

        // Add enhanced metadata
        data.currentSection = this.currentSection;
        data.timestamp = new Date().toISOString();
        data.version = this.version;
        data.progress = (this.currentSection / this.totalSections) * 100;

        // Save with enhanced error handling
        if (window.CareHomeUtils) {
            const saved = window.CareHomeUtils.saveToStorage(this.storageKey, data);
            if (!saved) {
                console.warn('Failed to save form data to localStorage');
            }
        }
    }

    loadSavedData() {
        let savedData = null;
        if (window.CareHomeUtils) {
            savedData = window.CareHomeUtils.loadFromStorage(this.storageKey);
        }

        if (savedData && savedData.version === this.version) {
            this.formData = savedData;
            this.currentSection = savedData.currentSection || 1;

            // Restore form values with enhanced error handling
            Object.entries(savedData).forEach(([key, value]) => {
                if (!['currentSection', 'timestamp', 'version', 'progress'].includes(key)) {
                    this.restoreFieldValue(key, value);
                }
            });

            this.showSection(this.currentSection);
            this.updateProgress();

            console.log('Enhanced form data restored from localStorage');

            if (window.CareHomeUtils) {
                window.CareHomeUtils.showNotification('Previous progress restored', 'info', 3000);
            }
        }
    }

    restoreFieldValue(name, value) {
        const field = document.querySelector(`[name="${name}"]`);
        if (!field) return;

        try {
            if (field.type === 'radio') {
                const specificField = document.querySelector(`[name="${name}"][value="${value}"]`);
                if (specificField) {
                    specificField.checked = true;
                    this.updateRadioSelection(name);
                }
            } else if (field.type === 'checkbox') {
                if (Array.isArray(value)) {
                    value.forEach(val => {
                        const checkbox = document.querySelector(`[name="${name}"][value="${val}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                            this.updateCheckboxSelection(name);
                        }
                    });
                }
            } else if (field.type === 'hidden') {
                field.value = value;
                // Update visual rating button
                const ratingBtn = document.querySelector(`[data-name="${name}"][data-value="${value}"]`);
                if (ratingBtn) {
                    ratingBtn.classList.add('selected');
                    ratingBtn.setAttribute('aria-pressed', 'true');
                    ratingBtn.style.background = `linear-gradient(135deg, ${QUESTIONNAIRE_COLORS.accent} 0%, ${QUESTIONNAIRE_COLORS.accentHover} 100%)`;
                    ratingBtn.style.color = 'white';
                }
            } else {
                field.value = value;
            }
        } catch (error) {
            console.warn(`Failed to restore field ${name}:`, error);
        }
    }

    collectAllFormData() {
        // Enhanced data collection with better structure
        const allFields = {
            contact: ['contact_001', 'contact_002', 'contact_003', 'contact_004', 'contact_005'],
            location: ['location_001', 'location_002', 'location_003', 'location_004', 'location_005'],
            budget: ['budget_001', 'budget_002', 'budget_003'],
            care: ['care_001', 'care_002', 'care_003', 'care_004', 'care_005_bathing', 'care_005_dressing', 'care_005_eating', 'care_005_toilet', 'care_005_mobility', 'care_005_medication', 'care_006'],
            culture: ['culture_001', 'culture_002', 'culture_003', 'culture_004'],
            comfort: ['comfort_001', 'comfort_002', 'comfort_003', 'comfort_004', 'comfort_005', 'comfort_006', 'comfort_007', 'comfort_008'],
            family: ['family_001', 'family_002', 'family_003', 'family_004'],
            timeline: ['timeline_001', 'timeline_002', 'timeline_003', 'timeline_004', 'timeline_005', 'timeline_006', 'timeline_007', 'timeline_008'],
            system: ['system_001', 'system_002']
        };

        const structuredData = {};
        let totalFieldsProcessed = 0;
        let filledFields = 0;

        // Process each section with enhanced error handling
        Object.entries(allFields).forEach(([sectionName, fieldNames]) => {
            structuredData[sectionName] = {};

            fieldNames.forEach(fieldName => {
                totalFieldsProcessed++;
                let value = null;

                try {
                    const field = document.querySelector(`[name="${fieldName}"]`);
                    if (field) {
                        if (field.type === 'radio') {
                            const checkedRadio = document.querySelector(`[name="${fieldName}"]:checked`);
                            value = checkedRadio ? checkedRadio.value : null;
                        } else if (field.type === 'checkbox') {
                            const checkedBoxes = document.querySelectorAll(`[name="${fieldName}"]:checked`);
                            value = Array.from(checkedBoxes).map(box => box.value);
                            if (value.length === 0) value = null;
                        } else if (field.type === 'hidden') {
                            value = field.value || null;
                        } else {
                            value = field.value.trim() || null;
                        }
                    }
                } catch (error) {
                    console.warn(`Error processing field ${fieldName}:`, error);
                    value = null;
                }

                // Count non-null values
                if (value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
                    filledFields++;
                }

                structuredData[sectionName][fieldName] = value;
            });
        });

        // Enhanced completion statistics
        structuredData._statistics = {
            total_fields: totalFieldsProcessed,
            filled_fields: filledFields,
            completion_rate: Math.round((filledFields / totalFieldsProcessed) * 100),
            sections_completed: this.totalSections,
            form_duration_minutes: Math.round((Date.now() - this.startTime) / 60000),
            version: this.version,
            browser: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        };

        console.log('Enhanced Data Collection Summary:', structuredData._statistics);
        return structuredData;
    }

    async submitForm(e) {
        e.preventDefault();

        if (!this.validateCurrentSection()) {
            return;
        }

        // Enhanced loading state
        const submitBtn = document.getElementById('submit-btn');
        let originalState = null;

        if (window.CareHomeUtils) {
            originalState = window.CareHomeUtils.showLoading(submitBtn, 'Processing Assessment...');
        }

        try {
            const allFormData = this.collectAllFormData();

            const finalData = {
                assessment_data: allFormData,
                meta: {
                    timestamp: new Date().toISOString(),
                    assessment_version: this.version,
                    user_agent: navigator.userAgent,
                    screen_resolution: `${screen.width}x${screen.height}`,
                    completed_sections: this.totalSections,
                    submission_id: window.CareHomeUtils ? 
                        window.CareHomeUtils.generateReferenceNumber() : 
                        'RCH-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                    form_duration_minutes: Math.round((Date.now() - this.startTime) / 60000),
                    total_fields: Object.keys(allFormData).length
                }
            };

            const response = await this.sendToAPI(finalData);
            console.log('Enhanced submission successful:', response);

            this.showThankYouPage();

            // Clean up storage
            if (window.CareHomeUtils) {
                window.CareHomeUtils.removeFromStorage(this.storageKey);

                // Enhanced completion tracking
                window.CareHomeUtils.trackEvent('assessment_completed', {
                    sections: this.totalSections,
                    duration_minutes: finalData.meta.form_duration_minutes,
                    completion_rate: finalData.assessment_data._statistics.completion_rate,
                    version: this.version
                });
            }

        } catch (error) {
            console.error('Enhanced submission error:', error);

            if (window.CareHomeUtils) {
                window.CareHomeUtils.hideLoading(submitBtn, originalState);
                window.CareHomeUtils.showNotification(
                    'Sorry, there was an error submitting your assessment. Please try again.', 
                    'error'
                );
            }
        }
    }

    async sendToAPI(data) {
        console.log('Enhanced assessment submission started');
        console.log('Complete data structure:', Object.keys(data));
        console.log('Data size:', new Blob([JSON.stringify(data)]).size + ' bytes');

        // Enhanced simulation with realistic processing time
        console.log('Processing comprehensive assessment data...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const response = {
            success: true,
            assessment_id: data.meta.submission_id,
            message: 'Assessment submitted successfully',
            timestamp: new Date().toISOString(),
            processing_time_ms: 3000,
            data_quality_score: 95,
            next_steps: {
                confirmation_email: 'Within 2 hours',
                expert_analysis: 'Within 24 hours',
                recommendations_delivery: 'Within 48 hours'
            }
        };

        console.log('Enhanced server response:', response);
        return response;
    }

    showThankYouPage() {
        console.log('Enhanced assessment completed, redirecting...');

        const assessmentId = Date.now().toString().slice(-6);
        localStorage.setItem('assessmentId', assessmentId);
        localStorage.setItem('assessmentCompletedAt', new Date().toISOString());

        const redirectUrl = `thank-you.html?completed=true&ref=RCH-2025-${assessmentId}&version=${this.version}`;

        // Enhanced redirect with smooth transition
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);

        console.log(`Enhanced redirect to: ${redirectUrl}`);
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Modal management
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }
}

// Initialize questionnaire when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('questionnaire-form')) {
        window.careHomeQuestionnaire = new CareHomeQuestionnaire();
    }
});

// Export for testing and external access
window.CareHomeQuestionnaire = CareHomeQuestionnaire;
window.QUESTIONNAIRE_COLORS = QUESTIONNAIRE_COLORS;

console.log('Enhanced Care Home Questionnaire [2024] loaded successfully');