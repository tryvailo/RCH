// Enhanced Care Home Report JavaScript [NEW 2024]
// Updated with modern color palette and improved functionality

// ===== UPDATED COLOR CONSTANTS =====
const CHART_COLORS = {
    primary: 'rgba(74, 144, 226, 0.8)',         // Updated primary blue
    primaryBorder: 'rgb(74, 144, 226)',
    secondary: 'rgba(107, 191, 89, 0.8)',       // Updated success green  
    secondaryBorder: 'rgb(107, 191, 89)',
    accent: 'rgba(232, 184, 109, 0.8)',         // Updated accent color
    accentBorder: 'rgb(232, 184, 109)',
    background: '#F7F5F3',                      // Updated warm background
    text: '#2D3748'                             // Updated text color
};

// Enhanced care home data with 2024 market data
const careHomes = {
    'manor_house': {
        name: 'Manor House Care Home',
        weeklyFee: 1200,
        registrationFee: 500,
        depositWeeks: 6,
        activities: 60,
        medical: 180,
        transport: 80,
        // Enhanced metadata for better tracking
        location: 'Edgbaston',
        cqcRating: 'Good',
        specialties: ['Dementia Care', 'Diabetes Management'],
        lastInspection: '2024-03-15'
    },
    'digby_manor': {
        name: 'Digby Manor Care Home',
        weeklyFee: 1050,
        registrationFee: 400,
        depositWeeks: 4,
        activities: 45,
        medical: 160,
        transport: 70,
        location: 'Birmingham Central',
        cqcRating: 'Good',
        specialties: ['General Care', 'Mobility Support'],
        lastInspection: '2024-01-20'
    },
    'bishops_manor': {
        name: 'Bishops Manor Care Home',
        weeklyFee: 1150,
        registrationFee: 450,
        depositWeeks: 5,
        activities: 50,
        medical: 170,
        transport: 75,
        location: 'Selly Oak',
        cqcRating: 'Outstanding',
        specialties: ['Dementia Care', 'End of Life Care'],
        lastInspection: '2024-02-10'
    },
    'edgbaston_manor': {
        name: 'Edgbaston Manor Care Home',
        weeklyFee: 1299,
        registrationFee: 600,
        depositWeeks: 6,
        activities: 70,
        medical: 200,
        transport: 60,
        location: 'Edgbaston',
        cqcRating: 'Outstanding',
        specialties: ['Premium Care', 'Rehabilitation'],
        lastInspection: '2024-04-05'
    },
    'metchley_manor': {
        name: 'Metchley Manor Care Home',
        weeklyFee: 1099,
        registrationFee: 350,
        depositWeeks: 5,
        activities: 40,
        medical: 150,
        transport: 85,
        location: 'Harborne',
        cqcRating: 'Good',
        specialties: ['Budget Friendly', 'Social Care'],
        lastInspection: '2024-01-30'
    }
};

// Enhanced scenario configurations with 2024 market conditions
const scenarios = {
    optimistic: {
        inflation: 0.03,           // Lower inflation scenario
        multiplier: 0.8,           // Reduced additional costs
        label: 'Best Case',
        description: 'Stable economy, no major cost increases'
    },
    realistic: {
        inflation: 0.05,           // Current UK inflation target
        multiplier: 1.0,           // Standard additional costs
        label: 'Most Likely',
        description: 'Expected market conditions'
    },
    pessimistic: {
        inflation: 0.07,           // Higher inflation scenario
        multiplier: 1.3,           // Increased additional costs
        label: 'Worst Case',
        description: 'Economic uncertainty, rising care costs'
    }
};

// Global state with enhanced tracking
let currentHome = null;
let timePeriod = 3;
let scenario = 'realistic';
let costChart = null;
let calculationHistory = [];

// ===== ENHANCED INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeCalculator();
        initializeProgressBars();
        initializeTooltips();
        initializeKeyboardSupport();

        // Track page load
        if (window.CareHomeUtils) {
            window.CareHomeUtils.trackEvent('calculator_page_loaded', {
                homes_available: Object.keys(careHomes).length,
                default_scenario: scenario,
                default_period: timePeriod
            });
        }

        console.log('Enhanced Basic Report Calculator initialized successfully');

    } catch (error) {
        console.error('Calculator initialization error:', error);
        showError('Calculator failed to initialize. Please refresh the page.');
    }
});

// ===== ENHANCED CALCULATOR INITIALIZATION =====
function initializeCalculator() {
    const select = document.getElementById('care-home-select');
    const slider = document.getElementById('time-slider');
    const display = document.getElementById('time-display');
    const buttons = document.querySelectorAll('.scenario-btn');

    // Enhanced care home selection
    if (select) {
        select.addEventListener('change', function(e) {
            currentHome = e.target.value;
            const results = document.getElementById('calculator-results');

            if (currentHome && results) {
                // Show results with smooth animation
                results.style.display = 'block';
                results.style.opacity = '0';
                results.style.transform = 'translateY(20px)';

                requestAnimationFrame(() => {
                    results.style.transition = 'all 0.5s ease';
                    results.style.opacity = '1';
                    results.style.transform = 'translateY(0)';
                });

                updateCalculations();

                // Track home selection
                if (window.CareHomeUtils) {
                    const homeData = careHomes[currentHome];
                    window.CareHomeUtils.trackEvent('home_selected', {
                        home_name: homeData.name,
                        weekly_fee: homeData.weeklyFee,
                        location: homeData.location,
                        cqc_rating: homeData.cqcRating
                    });
                }

            } else if (results) {
                results.style.display = 'none';
            }
        });
    }

    // Enhanced time period slider
    if (slider && display) {
        slider.addEventListener('input', function(e) {
            timePeriod = parseFloat(e.target.value);
            const yearText = timePeriod === 1 ? '1 year' : `${timePeriod} years`;
            display.textContent = yearText;

            // Update display with enhanced formatting
            display.style.fontWeight = '700';
            display.style.color = CHART_COLORS.text;

            if (currentHome) updateCalculations();

            // Track time period changes
            if (window.CareHomeUtils) {
                window.CareHomeUtils.trackEvent('time_period_changed', {
                    time_period: timePeriod,
                    home: currentHome
                });
            }
        });

        // Initialize display
        display.textContent = timePeriod === 1 ? '1 year' : `${timePeriod} years`;
    }

    // Enhanced scenario buttons with modern styling
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active state from all buttons
            buttons.forEach(b => {
                b.classList.remove('active', 'bg-primary-soft', 'border-primary-modern');
                b.classList.add('border-warm');
                b.style.background = '';
                b.style.borderColor = '';
                b.style.color = '';
            });

            // Activate selected button with modern colors
            this.classList.add('active');
            this.classList.remove('border-warm');
            this.style.background = 'rgba(74, 144, 226, 0.1)';
            this.style.borderColor = CHART_COLORS.primary;
            this.style.color = CHART_COLORS.text;
            this.style.fontWeight = '600';

            scenario = this.dataset.scenario;

            if (currentHome) updateCalculations();

            // Track scenario selection
            if (window.CareHomeUtils) {
                const scenarioData = scenarios[scenario];
                window.CareHomeUtils.trackEvent('scenario_selected', {
                    scenario: scenario,
                    label: scenarioData.label,
                    inflation_rate: scenarioData.inflation,
                    multiplier: scenarioData.multiplier
                });
            }
        });

        // Add keyboard support
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        // Add tooltips for scenarios
        btn.title = scenarios[btn.dataset.scenario]?.description || '';
    });
}

// ===== ENHANCED PROGRESS BARS =====
function initializeProgressBars() {
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach((bar, index) => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            bar.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

            setTimeout(() => {
                bar.style.width = targetWidth;

                // Add shimmer effect
                bar.style.background = `linear-gradient(90deg, ${CHART_COLORS.primary} 0%, ${CHART_COLORS.accent} 100%)`;
            }, 200 + (index * 100));
        });
    }, 800);
}

// ===== ENHANCED CALCULATIONS =====
function updateCalculations() {
    if (!currentHome || !careHomes[currentHome]) return;

    const startTime = performance.now();
    const home = careHomes[currentHome];
    const config = scenarios[scenario];
    const weeklyFee = home.weeklyFee;
    const annualBase = weeklyFee * 52;

    let totalCost = home.registrationFee;
    let yearlyData = [];

    // Enhanced calculation with detailed breakdown
    for (let year = 1; year <= Math.ceil(timePeriod); year++) {
        const inflationMultiplier = Math.pow(1 + config.inflation, year - 1);
        const yearFraction = year <= timePeriod ? 1 : (timePeriod % 1) || 1;

        const yearlyBasic = annualBase * inflationMultiplier * yearFraction;
        const yearlyExtra = ((home.activities + home.medical + home.transport) * 12) * 
                           inflationMultiplier * yearFraction * config.multiplier;

        totalCost += yearlyBasic + yearlyExtra;

        yearlyData.push({
            year: year,
            basic: yearlyBasic,
            extra: yearlyExtra,
            total: yearlyBasic + yearlyExtra,
            inflationRate: (inflationMultiplier - 1) * 100
        });

        if (year > timePeriod) break;
    }

    // Store calculation in history
    const calculation = {
        timestamp: new Date().toISOString(),
        home: currentHome,
        scenario: scenario,
        timePeriod: timePeriod,
        totalCost: totalCost,
        weeklyFee: weeklyFee,
        annualBase: annualBase
    };

    calculationHistory.push(calculation);
    if (calculationHistory.length > 10) {
        calculationHistory.shift(); // Keep last 10 calculations
    }

    updateDisplay(home, weeklyFee, annualBase, totalCost, yearlyData);

    const endTime = performance.now();
    console.log(`Calculation completed in ${(endTime - startTime).toFixed(2)}ms`);
}

// ===== ENHANCED DISPLAY UPDATE =====
function updateDisplay(home, weekly, annual, total, yearly) {
    const config = scenarios[scenario];

    try {
        // Update main figures with enhanced formatting
        updateElement('weekly-fee', formatCurrency(weekly));
        updateElement('annual-cost', formatCurrency(annual));
        updateElement('basic-total', formatCurrency(Math.round(annual * timePeriod)));
        updateElement('registration-fee', formatCurrency(home.registrationFee));
        updateElement('deposit-fee', formatCurrency(home.weeklyFee * home.depositWeeks));

        // Enhanced additional costs calculation
        const additionalCosts = {
            activity: Math.round(home.activities * 12 * timePeriod * config.multiplier),
            medical: Math.round(home.medical * 12 * timePeriod * config.multiplier),
            transport: Math.round(home.transport * 12 * timePeriod * config.multiplier)
        };

        updateElement('activity-cost', formatCurrency(additionalCosts.activity));
        updateElement('medical-cost', formatCurrency(additionalCosts.medical));
        updateElement('transport-cost', formatCurrency(additionalCosts.transport));
        updateElement('total-projected', formatCurrency(Math.round(total)));

        // Update additional info
        updateHomeInfo(home);

        // Update charts and comparison
        updateChart(yearly);
        updateComparisonTable();
        updateSavingsComparison(total);

    } catch (error) {
        console.error('Display update error:', error);
        showError('Error updating display. Please try again.');
    }
}

// ===== ENHANCED CHART FUNCTIONALITY =====
function updateChart(yearlyData) {
    const canvas = document.getElementById('cost-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (costChart) {
        costChart.destroy();
    }

    // Create enhanced chart with modern styling
    costChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yearlyData.map(d => `Year ${d.year}`),
            datasets: [
                {
                    label: 'Basic Care Costs',
                    data: yearlyData.map(d => Math.round(d.basic)),
                    backgroundColor: CHART_COLORS.primary,
                    borderColor: CHART_COLORS.primaryBorder,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                },
                {
                    label: 'Additional Services',
                    data: yearlyData.map(d => Math.round(d.extra)),
                    backgroundColor: CHART_COLORS.secondary,
                    borderColor: CHART_COLORS.secondaryBorder,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(45, 55, 72, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: CHART_COLORS.primary,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        },
                        footer: function(tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(item => {
                                total += item.parsed.y;
                            });
                            return 'Total: ' + formatCurrency(total);
                        }
                    }
                },
                legend: {
                    labels: {
                        font: { size: 14, weight: '600' },
                        color: CHART_COLORS.text,
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    },
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: `${careHomes[currentHome].name} - ${timePeriod} Year Cost Projection`,
                    font: { size: 16, weight: '700' },
                    color: CHART_COLORS.text,
                    padding: 20
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { size: 12, weight: '600' },
                        color: CHART_COLORS.text
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(45, 55, 72, 0.1)',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        font: { size: 12, weight: '600' },
                        color: CHART_COLORS.text,
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutCubic'
            }
        }
    });
}

// ===== ENHANCED COMPARISON TABLE =====
function updateComparisonTable() {
    const tbody = document.getElementById('comparison-tbody');
    if (!tbody) return;

    const comparisons = Object.keys(careHomes).map(key => {
        const home = careHomes[key];
        const config = scenarios.realistic; // Always use realistic for comparison
        const annualBase = home.weeklyFee * 52;
        const annualExtras = (home.activities + home.medical + home.transport) * 12;

        let total = home.registrationFee;
        for (let year = 1; year <= 5; year++) {
            const multiplier = Math.pow(1 + config.inflation, year - 1);
            total += (annualBase + annualExtras) * multiplier;
        }

        return {
            key: key,
            name: home.name,
            weekly: home.weeklyFee,
            total: total,
            monthly: total / 60,
            location: home.location,
            cqcRating: home.cqcRating,
            specialties: home.specialties
        };
    });

    // Sort by total cost
    comparisons.sort((a, b) => a.total - b.total);

    tbody.innerHTML = '';

    comparisons.forEach((home, index) => {
        const londonEquivalent = home.total * 1.35;
        const londonSavings = londonEquivalent - home.total;
        const isSelected = home.key === currentHome;

        const row = document.createElement('tr');
        row.className = `border-b hover:bg-warm-soft transition-all duration-300 ${
            isSelected ? 'bg-primary-soft border-primary-modern' : ''
        }`;

        if (index === 0 && !isSelected) {
            row.classList.add('bg-success-soft');
        }

        row.innerHTML = `
            <td class="py-4 px-6">
                <div class="font-semibold text-lg text-gray-900">${home.name}</div>
                <div class="text-sm text-gray-600 mt-1">
                    📍 ${home.location} • ⭐ ${home.cqcRating}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    ${home.specialties.join(', ')}
                </div>
            </td>
            <td class="py-4 px-6 text-center">
                <div class="font-bold text-xl">${formatCurrency(home.weekly)}</div>
                <div class="text-sm text-gray-600">per week</div>
            </td>
            <td class="py-4 px-6 text-center">
                <div class="font-bold text-xl text-primary-modern">${formatCurrency(Math.round(home.total))}</div>
                <div class="text-sm text-gray-600">5 years total</div>
            </td>
            <td class="py-4 px-6 text-center">
                <div class="font-semibold text-lg text-success-modern">${formatCurrency(Math.round(londonSavings))}</div>
                <div class="text-sm text-gray-600">vs London</div>
            </td>
            <td class="py-4 px-6 text-center">
                ${index === 0 ? '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">Best Value</span>' : ''}
                ${isSelected ? '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">Selected</span>' : ''}
            </td>
        `;

        // Add click handler for row selection
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            const select = document.getElementById('care-home-select');
            if (select) {
                select.value = home.key;
                select.dispatchEvent(new Event('change'));
            }
        });

        tbody.appendChild(row);
    });
}

// ===== UTILITY FUNCTIONS =====
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        // Add smooth update animation
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.05)';
        element.textContent = value;

        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function updateHomeInfo(home) {
    const infoContainer = document.getElementById('home-info');
    if (infoContainer) {
        infoContainer.innerHTML = `
            <div class="bg-warm-soft p-4 rounded-lg border border-warm-border">
                <h4 class="font-bold text-lg mb-2 text-primary-modern">${home.name}</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-semibold">Location:</span> ${home.location}
                    </div>
                    <div>
                        <span class="font-semibold">CQC Rating:</span> 
                        <span class="text-success-modern font-bold">${home.cqcRating}</span>
                    </div>
                    <div class="col-span-2">
                        <span class="font-semibold">Specialties:</span> ${home.specialties.join(', ')}
                    </div>
                </div>
            </div>
        `;
    }
}

function updateSavingsComparison(totalCost) {
    const savingsContainer = document.getElementById('savings-comparison');
    if (savingsContainer) {
        const londonCost = totalCost * 1.35;
        const savings = londonCost - totalCost;
        const percentSavings = ((savings / londonCost) * 100).toFixed(1);

        savingsContainer.innerHTML = `
            <div class="bg-success-soft p-6 rounded-xl border border-success-light">
                <h3 class="font-bold text-xl mb-4 text-success-dark">Birmingham Savings</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-success-modern">${formatCurrency(Math.round(savings))}</div>
                        <div class="text-sm text-gray-600">Total Saved</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-success-modern">${percentSavings}%</div>
                        <div class="text-sm text-gray-600">Percentage Saved</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-success-modern">${formatCurrency(Math.round(savings / (timePeriod * 12)))}</div>
                        <div class="text-sm text-gray-600">Per Month Saved</div>
                    </div>
                </div>
            </div>
        `;
    }
}

function showError(message) {
    if (window.CareHomeUtils) {
        window.CareHomeUtils.showNotification(message, 'error');
    } else {
        console.error(message);
        alert(message);
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeKeyboardSupport() {
    // Enhanced keyboard navigation for calculator
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });
}

function initializeTooltips() {
    // Initialize tooltips for complex elements
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        let tooltip = null;

        element.addEventListener('mouseenter', function() {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip-modern';
            tooltip.textContent = this.dataset.tooltip;

            Object.assign(tooltip.style, {
                position: 'absolute',
                background: CHART_COLORS.text,
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                zIndex: '1000',
                pointerEvents: 'none',
                opacity: '0',
                transition: 'opacity 0.2s ease'
            });

            document.body.appendChild(tooltip);

            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
            });
        });

        element.addEventListener('mouseleave', function() {
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.remove();
                    }
                }, 200);
            }
        });
    });
}

// Export for testing and external access
window.BasicReportCalculator = {
    careHomes,
    scenarios,
    updateCalculations,
    formatCurrency,
    calculationHistory
};

console.log('Enhanced Basic Report Calculator [2024] loaded successfully');