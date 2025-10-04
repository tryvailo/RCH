// ===== CARE HOME REPORT CALCULATOR [2025 UPDATE] =====
// Enhanced JavaScript for Birmingham Care Cost Calculator

// Chart colors matching 2025 sage/terracotta palette
const CHART_COLORS = {
    primary: 'rgba(107, 124, 110, 0.8)',        // #6B7C6E - sage
    primaryBorder: 'rgb(107, 124, 110)',
    secondary: 'rgba(122, 148, 113, 0.8)',      // #7A9471 - success green  
    secondaryBorder: 'rgb(122, 148, 113)',
    accent: 'rgba(192, 139, 122, 0.8)',         // #C08B7A - terracotta
    accentBorder: 'rgb(192, 139, 122)',
    background: '#FAF7F3',                      // warm background
    text: '#2A2B2A'                             // dark text
};

// Care home data
const careHomes = {
    'manor_house': {
        name: 'Manor House Care Home',
        weeklyFee: 1200,
        registrationFee: 500,
        depositWeeks: 6,
        activities: 60,
        medical: 180,
        transport: 80,
        location: 'Acocks Green',
        cqcRating: 'Outstanding',
        specialties: ['Dementia Care', 'Diabetes Management']
    },
    'digby_manor': {
        name: 'Digby Manor Care Home',
        weeklyFee: 1050,
        registrationFee: 400,
        depositWeeks: 4,
        activities: 45,
        medical: 160,
        transport: 70,
        location: 'Birmingham',
        cqcRating: 'Good',
        specialties: ['General Care', 'Mobility Support']
    },
    'bishops_manor': {
        name: 'Bishops Manor Care Home',
        weeklyFee: 1150,
        registrationFee: 450,
        depositWeeks: 5,
        activities: 50,
        medical: 170,
        transport: 75,
        location: 'Birmingham',
        cqcRating: 'Good',
        specialties: ['Dementia Care', 'End of Life Care']
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
        specialties: ['Premium Care', 'Rehabilitation']
    },
    'metchley_manor': {
        name: 'Metchley Manor Care Home',
        weeklyFee: 1099,
        registrationFee: 350,
        depositWeeks: 5,
        activities: 40,
        medical: 150,
        transport: 85,
        location: 'Birmingham',
        cqcRating: 'Good',
        specialties: ['Budget Friendly', 'Social Care']
    }
};

// Scenario configurations
const scenarios = {
    optimistic: {
        inflation: 0.03,
        multiplier: 0.8,
        label: 'Conservative',
        description: '3% annual inflation'
    },
    realistic: {
        inflation: 0.05,
        multiplier: 1.0,
        label: 'Realistic',
        description: '5% annual inflation'
    },
    pessimistic: {
        inflation: 0.07,
        multiplier: 1.3,
        label: 'Cautious',
        description: '7% annual inflation'
    }
};

// Global state
let currentHome = null;
let timePeriod = 3;
let scenario = 'realistic';
let costChart = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeCalculator();
        initializeProgressBars();
        console.log('Basic Report Calculator initialized successfully');
    } catch (error) {
        console.error('Calculator initialization error:', error);
    }
});

// ===== CALCULATOR INITIALIZATION =====
function initializeCalculator() {
    const select = document.getElementById('care-home-select');
    const slider = document.getElementById('time-slider');
    const display = document.getElementById('time-display');
    const buttons = document.querySelectorAll('.scenario-btn');

    // Care home selection handler
    if (select) {
        select.addEventListener('change', function(e) {
            currentHome = e.target.value;
            const results = document.getElementById('calculator-results');

            if (currentHome && results) {
                results.style.display = 'block';
                updateCalculations();
            } else if (results) {
                results.style.display = 'none';
            }
        });
    }

    // Time period slider handler
    if (slider && display) {
        slider.addEventListener('input', function(e) {
            timePeriod = parseFloat(e.target.value);
            const yearText = timePeriod === 1 ? '1 year' : `${timePeriod} years`;
            display.textContent = yearText;

            if (currentHome) {
                updateCalculations();
            }
        });

        // Set initial display
        const yearText = timePeriod === 1 ? '1 year' : `${timePeriod} years`;
        display.textContent = yearText;
    }

    // Scenario button handlers
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            scenario = this.dataset.scenario;

            if (currentHome) {
                updateCalculations();
            }
        });
    });
}

// ===== PROGRESS BARS ANIMATION =====
function initializeProgressBars() {
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach((bar, index) => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            bar.style.transition = 'width 0.8s ease';

            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 200 + (index * 100));
        });
    }, 800);
}

// ===== CALCULATIONS =====
function updateCalculations() {
    if (!currentHome || !careHomes[currentHome]) {
        console.error('Invalid care home selected:', currentHome);
        return;
    }

    const home = careHomes[currentHome];
    const config = scenarios[scenario];
    const weeklyFee = home.weeklyFee;
    const annualBase = weeklyFee * 52;

    let totalCost = home.registrationFee;
    let yearlyData = [];

    // Calculate costs for each year
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
            total: yearlyBasic + yearlyExtra
        });

        if (year > timePeriod) break;
    }

    updateDisplay(home, weeklyFee, annualBase, totalCost, yearlyData);
}

// ===== DISPLAY UPDATE =====
function updateDisplay(home, weekly, annual, total, yearly) {
    const config = scenarios[scenario];

    try {
        // Update basic costs
        updateElement('weekly-fee', formatCurrency(weekly));
        updateElement('annual-cost', formatCurrency(annual));
        updateElement('basic-total', formatCurrency(Math.round(annual * timePeriod)));
        
        // Update one-time costs
        updateElement('registration-fee', formatCurrency(home.registrationFee));
        updateElement('deposit-fee', formatCurrency(home.weeklyFee * home.depositWeeks));

        // Calculate additional costs
        const additionalCosts = {
            activity: Math.round(home.activities * 12 * timePeriod * config.multiplier),
            medical: Math.round(home.medical * 12 * timePeriod * config.multiplier),
            transport: Math.round(home.transport * 12 * timePeriod * config.multiplier)
        };

        updateElement('activity-cost', formatCurrency(additionalCosts.activity));
        updateElement('medical-cost', formatCurrency(additionalCosts.medical));
        updateElement('transport-cost', formatCurrency(additionalCosts.transport));
        
        // Update total projected cost
        updateElement('total-projected', formatCurrency(Math.round(total)));

        // Update chart and comparison table
        updateChart(yearly);
        updateComparisonTable();

    } catch (error) {
        console.error('Display update error:', error);
    }
}

// ===== CHART UPDATE =====
function updateChart(yearlyData) {
    const canvas = document.getElementById('cost-chart');
    if (!canvas) {
        console.error('Chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (costChart) {
        costChart.destroy();
    }

    // Create new chart
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
                    borderRadius: 8
                },
                {
                    label: 'Additional Services',
                    data: yearlyData.map(d => Math.round(d.extra)),
                    backgroundColor: CHART_COLORS.secondary,
                    borderColor: CHART_COLORS.secondaryBorder,
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(42, 43, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: CHART_COLORS.primary,
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 14
                    },
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
                        font: { 
                            size: 16, 
                            weight: '600',
                            family: 'Inter, sans-serif'
                        },
                        color: CHART_COLORS.text,
                        padding: 20,
                        usePointStyle: true
                    },
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: `${careHomes[currentHome].name} - ${timePeriod} Year Cost Projection`,
                    font: { 
                        size: 18, 
                        weight: '700',
                        family: 'Inter, sans-serif'
                    },
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
                        font: { 
                            size: 14, 
                            weight: '600',
                            family: 'Inter, sans-serif'
                        },
                        color: CHART_COLORS.text
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(42, 43, 42, 0.1)',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        font: { 
                            size: 14, 
                            weight: '600',
                            family: 'Inter, sans-serif'
                        },
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

// ===== COMPARISON TABLE UPDATE =====
function updateComparisonTable() {
    const tbody = document.getElementById('comparison-tbody');
    if (!tbody) {
        console.error('Comparison table tbody not found');
        return;
    }

    // Calculate 5-year totals for all homes
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
            monthly: total / 60
        };
    });

    // Sort by total cost (cheapest first)
    comparisons.sort((a, b) => a.total - b.total);

    // Clear existing rows
    tbody.innerHTML = '';

    // Add new rows
    comparisons.forEach((home) => {
        const londonSavings = (home.total * 1.35) - home.total; // London typically 35% more expensive
        const isSelected = home.key === currentHome;

        const row = document.createElement('tr');
        if (isSelected) {
            row.style.backgroundColor = 'var(--background-soft)';
            row.style.fontWeight = 'var(--font-weight-semibold)';
        }

        row.innerHTML = `
            <td class="font-bold text-lg">${home.name}</td>
            <td class="text-center font-bold text-xl">${formatCurrency(home.weekly)}</td>
            <td class="text-center font-bold text-xl text-primary">${formatCurrency(Math.round(home.total))}</td>
            <td class="text-center font-bold text-lg">${formatCurrency(Math.round(home.monthly))}</td>
            <td class="text-center font-bold text-lg text-success">${formatCurrency(Math.round(londonSavings))}</td>
        `;

        tbody.appendChild(row);
    });
}

// ===== UTILITY FUNCTIONS =====
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`Element with id "${id}" not found`);
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

// ===== PDF DOWNLOAD =====
function downloadPDF() {
    window.print();
}

// Log successful load
console.log('Basic Report Calculator [2025] loaded successfully');
console.log('Available care homes:', Object.keys(careHomes).length);
console.log('Chart colors:', CHART_COLORS);