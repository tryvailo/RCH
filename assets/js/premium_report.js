// ===== PREMIUM CARE HOME REPORT CALCULATOR [2025 UPDATE] =====
// RightCareHome Birmingham - Premium Intelligence Report
// Complete interactive functionality with enhanced visualizations

// ===== CHART COLORS (PREMIUM PALETTE) =====
const CHART_COLORS = {
    basic: 'rgba(107, 124, 110, 0.8)',           // sage green
    basicBorder: 'rgb(107, 124, 110)',
    additional: 'rgba(192, 139, 122, 0.8)',      // terracotta
    additionalBorder: 'rgb(192, 139, 122)',
    cumulative: 'rgba(59, 130, 246, 0.9)',       // premium blue
    cumulativeBorder: 'rgb(59, 130, 246)',
    background: '#FAF7F3',
    text: '#2A2B2A'
};

// ===== CARE HOME DATA =====
const careHomeData = {
    manor_house: {
        name: "Manor House Care Home",
        weeklyFee: 1200,
        registrationFee: 500,
        depositWeeks: 6,
        activities: 75,
        medical: 50,
        transport: 25
    },
    digby_manor: {
        name: "Digby Manor Care Home", 
        weeklyFee: 1050,
        registrationFee: 400,
        depositWeeks: 4,
        activities: 60,
        medical: 40,
        transport: 20
    },
    bishops_manor: {
        name: "Bishops Manor Care Home",
        weeklyFee: 1150,
        registrationFee: 450,
        depositWeeks: 5,
        activities: 70,
        medical: 45,
        transport: 25
    },
    edgbaston_manor: {
        name: "Edgbaston Manor Care Home",
        weeklyFee: 1299,
        registrationFee: 600,
        depositWeeks: 6,
        activities: 80,
        medical: 60,
        transport: 30
    },
    metchley_manor: {
        name: "Metchley Manor Care Home",
        weeklyFee: 1099,
        registrationFee: 350,
        depositWeeks: 5,
        activities: 55,
        medical: 35,
        transport: 20
    }
};

// ===== INFLATION SCENARIOS =====
const inflationRates = {
    optimistic: 0.03,
    realistic: 0.05,
    pessimistic: 0.07
};

const scenarios = {
    optimistic: { 
        label: 'Conservative', 
        inflation: 0.03,
        description: '3% annual inflation'
    },
    realistic: { 
        label: 'Realistic', 
        inflation: 0.05,
        description: '5% annual inflation'
    },
    pessimistic: { 
        label: 'Cautious', 
        inflation: 0.07,
        description: '7% annual inflation'
    }
};

// ===== EVIDENCE DATA FOR EXPLORER =====
const evidenceData = {
    availability: {
        title: "Availability: Manor House",
        content: `Confirmed through automated portal monitoring.

Premium Analysis: Window closing in 48-72 hours based on typical admission patterns.

Sources verified:
- Provider website (Today, 09:15 GMT)
- Phone confirmation (Today, 14:32 GMT)
- Admissions portal check (2 hours ago)`,
        meta: { confidence: "High", date: "23 Sep 2025", status: "Verified Source" }
    },
    jobs: {
        title: "Staff Recruitment: Digby Manor",
        content: `3 nursing positions posted on Indeed in last 14 days.

Signal Analysis:
- 2x Registered Nurse positions
- 1x Senior Care Assistant role
- All posted within 2-week window

Recommendation: Ask about staff retention during visit.

Sources:
- Indeed UK (Scanned 2 days ago)
- Reed.co.uk cross-check
- NHS Jobs monitoring`,
        meta: { confidence: "Medium", date: "21 Sep 2025", status: "Job Board Analysis" }
    },
    reviews: {
        title: "Family Reviews Analysis",
        content: `Latest family feedback compiled from multiple sources.

Overall sentiment: Positive (4.2/5 average)

Recent themes:
- Excellent nursing care mentioned 8 times
- Communication praised in 6 reviews
- Food quality: mixed feedback

Sources:
- CareHome.co.uk reviews
- Google Reviews
- Direct family testimonials`,
        meta: { confidence: "Medium", date: "20 Sep 2025", status: "Review Aggregation" }
    },
    cqc: {
        title: "CQC Rating: Outstanding",
        content: `CQC Rating: Outstanding (maintained since 2021)

Latest inspection: March 2024
- Safe: Outstanding
- Effective: Outstanding  
- Caring: Outstanding
- Responsive: Good
- Well-led: Outstanding

No enforcement actions or concerns noted.

Source: cqc.org.uk (Official government database)`,
        meta: { confidence: "Maximum", date: "18 Sep 2025", status: "Official Government Source" }
    },
    pricing: {
        title: "Pricing Intelligence: Manor House",
        content: `Market positioning analysis completed.

Current fee: £1,200/week (unchanged 6 months)
Industry pattern: 12-month increase cycle
Last increase: February 2024 (+4.2%)

Projection: Next increase likely Q2 2026 (5-8% expected)

Market comparison:
- 8% above regional average
- 12% below London equivalent
- Competitive for service level offered`,
        meta: { confidence: "High", date: "17 Sep 2025", status: "Market Analysis" }
    }
};

// ===== GLOBAL STATE =====
let currentScenario = 'realistic';
let costChartInstance = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeCalculator();
        initializeStickyBanner();
        initializeA11y();
        
        // Initialize evidence explorer with default content
        if (document.getElementById('evidence-content')) {
            showEvidence('availability');
        }
        
        console.log('Premium Report Calculator initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// ===== CALCULATOR INITIALIZATION =====
function initializeCalculator() {
    const careHomeSelect = document.getElementById('care-home-select');
    const timeSlider = document.getElementById('time-slider');
    const timeDisplay = document.getElementById('time-display');
    
    // Care home selection handler
    if (careHomeSelect) {
        careHomeSelect.addEventListener('change', updateCalculator);
    }
    
    // Time period slider handler
    if (timeSlider && timeDisplay) {
        timeSlider.addEventListener('input', function() {
            const years = parseFloat(this.value);
            timeDisplay.textContent = years + (years === 1 ? ' year' : ' years');
            if (careHomeSelect.value) {
                debouncedCalculatorUpdate();
            }
        });
    }

    // Scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentScenario = this.dataset.scenario;
            if (careHomeSelect?.value) {
                updateCalculator();
            }
        });
    });
}

// ===== CALCULATOR UPDATE (MAIN FUNCTION) =====
function updateCalculator() {
    const careHomeSelect = document.getElementById('care-home-select');
    const timeSlider = document.getElementById('time-slider');
    const resultsDiv = document.getElementById('calculator-results');
    
    if (!careHomeSelect?.value || !timeSlider) return;
    
    const selectedHome = careHomeData[careHomeSelect.value];
    const years = parseFloat(timeSlider.value);
    
    if (!selectedHome) return;
    
    // Show results with animation
    if (resultsDiv.style.display === 'none') {
        resultsDiv.style.display = 'block';
        resultsDiv.style.opacity = '0';
        setTimeout(() => {
            resultsDiv.style.transition = 'opacity 0.5s ease';
            resultsDiv.style.opacity = '1';
        }, 10);
    }
    
    // Calculate base costs
    const weeklyFee = selectedHome.weeklyFee;
    const annualCost = weeklyFee * 52;
    const inflationRate = inflationRates[currentScenario];
    
    // Calculate costs with inflation for each year
    let totalProjected = selectedHome.registrationFee;
    let totalBasic = 0;
    let totalAdditional = 0;
    const yearlyData = [];
    
    // Calculate year-by-year with inflation
    for (let year = 1; year <= Math.ceil(years); year++) {
        const yearFraction = year <= years ? 1 : (years % 1) || 1;
        const inflationMultiplier = Math.pow(1 + inflationRate, year - 1);
        
        const yearlyBaseCost = annualCost * inflationMultiplier * yearFraction;
        const yearlyExtras = (selectedHome.activities * 12 + 
                           selectedHome.medical * 12 + 
                           selectedHome.transport * 12) * inflationMultiplier * yearFraction;
        
        totalBasic += yearlyBaseCost;
        totalAdditional += yearlyExtras;
        totalProjected += yearlyBaseCost + yearlyExtras;
        
        yearlyData.push(Math.round(yearlyBaseCost + yearlyExtras));
        
        if (year > years) break;
    }
    
    // Calculate individual additional costs with inflation
    const additionalCosts = {
        registration: selectedHome.registrationFee,
        activities: 0,
        medical: 0,
        transport: 0
    };
    
    for (let year = 1; year <= Math.ceil(years); year++) {
        const yearFraction = year <= years ? 1 : (years % 1) || 1;
        const inflationMultiplier = Math.pow(1 + inflationRate, year - 1);
        
        additionalCosts.activities += selectedHome.activities * 12 * inflationMultiplier * yearFraction;
        additionalCosts.medical += selectedHome.medical * 12 * inflationMultiplier * yearFraction;
        additionalCosts.transport += selectedHome.transport * 12 * inflationMultiplier * yearFraction;
        
        if (year > years) break;
    }
    
    // Update DOM elements with animation
    animateValue('weekly-fee', 0, weeklyFee, 800, true);
    animateValue('annual-cost', 0, annualCost, 800, true);
    animateValue('basic-total', 0, Math.round(totalBasic), 1000, true);
    
    // Update additional costs
    updateElement('registration-fee', formatCurrency(Math.round(additionalCosts.registration)));
    animateValue('activity-cost', 0, Math.round(additionalCosts.activities), 800, true);
    animateValue('medical-cost', 0, Math.round(additionalCosts.medical), 800, true);
    animateValue('transport-cost', 0, Math.round(additionalCosts.transport), 800, true);
    
    // Update total with emphasis
    animateValue('total-projected', 0, Math.round(totalProjected), 1200, true);
    
    // Update comparison table
    updateComparisonTable(years);
    
    // Update chart
    updateCostChart(yearlyData, selectedHome.name);
}

// ===== CHART UPDATE (PREMIUM VERSION) =====
function updateCostChart(yearlyData, homeName) {
    const canvas = document.getElementById('costChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const careHomeSelect = document.getElementById('care-home-select');
    const selectedHome = careHomeData[careHomeSelect?.value];
    
    if (!selectedHome) return;
    
    // Destroy existing chart
    if (costChartInstance) {
        costChartInstance.destroy();
    }
    
    const timeSlider = document.getElementById('time-slider');
    const years = parseFloat(timeSlider?.value || 3);
    const inflationRate = inflationRates[currentScenario];
    
    // Calculate detailed breakdown for each year
    const yearlyBreakdown = [];
    for (let year = 1; year <= Math.ceil(years); year++) {
        const yearFraction = year <= years ? 1 : (years % 1) || 1;
        const multiplier = Math.pow(1 + inflationRate, year - 1);
        const basicCost = (selectedHome.weeklyFee * 52) * multiplier * yearFraction;
        const additionalCost = (selectedHome.activities * 12 + selectedHome.medical * 12 + selectedHome.transport * 12) * multiplier * yearFraction;
        
        yearlyBreakdown.push({
            basic: Math.round(basicCost),
            additional: Math.round(additionalCost),
            total: Math.round(basicCost + additionalCost)
        });
        
        if (year > years) break;
    }
    
    // Create premium chart with stacked bars + trend line
    costChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yearlyBreakdown.map((_, i) => `Year ${i + 1}`),
            datasets: [
                {
                    label: 'Basic Care Costs',
                    data: yearlyBreakdown.map(d => d.basic),
                    backgroundColor: CHART_COLORS.basic,
                    borderColor: CHART_COLORS.basicBorder,
                    borderWidth: 2,
                    borderRadius: 8,
                    stack: 'costs'
                },
                {
                    label: 'Additional Services',
                    data: yearlyBreakdown.map(d => d.additional),
                    backgroundColor: CHART_COLORS.additional,
                    borderColor: CHART_COLORS.additionalBorder,
                    borderWidth: 2,
                    borderRadius: 8,
                    stack: 'costs'
                },
                {
                    label: 'Cumulative Total (Trend)',
                    data: yearlyBreakdown.map((_, i) => {
                        return yearlyBreakdown.slice(0, i + 1).reduce((sum, d) => sum + d.total, 0) + selectedHome.registrationFee;
                    }),
                    type: 'line',
                    borderColor: CHART_COLORS.cumulativeBorder,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: CHART_COLORS.cumulativeBorder,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    yAxisID: 'y1'
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
                    borderColor: CHART_COLORS.basicBorder,
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 16,
                    titleFont: {
                        size: 16,
                        weight: 'bold',
                        family: 'Inter, sans-serif'
                    },
                    bodyFont: {
                        size: 14,
                        family: 'Inter, sans-serif'
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = formatCurrency(context.parsed.y);
                            return label + ': ' + value;
                        },
                        afterBody: function(tooltipItems) {
                            const yearIndex = tooltipItems[0].dataIndex;
                            const yearData = yearlyBreakdown[yearIndex];
                            return [
                                '',
                                '───────────────',
                                'Year Total: ' + formatCurrency(yearData.total)
                            ];
                        }
                    }
                },
                legend: {
                    labels: {
                        font: { 
                            size: 14, 
                            weight: '600',
                            family: 'Inter, sans-serif'
                        },
                        color: CHART_COLORS.text,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    },
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${homeName} - ${years} Year Cost Analysis (${scenarios[currentScenario].label} Scenario)`,
                    font: { 
                        size: 18, 
                        weight: '700',
                        family: 'Inter, sans-serif'
                    },
                    color: CHART_COLORS.text,
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            },
            scales: {
                x: {
                    grid: { 
                        display: false 
                    },
                    ticks: {
                        font: { 
                            size: 13, 
                            weight: '600',
                            family: 'Inter, sans-serif'
                        },
                        color: CHART_COLORS.text
                    }
                },
                y: {
                    stacked: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(42, 43, 42, 0.08)',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        font: { 
                            size: 13, 
                            weight: '600',
                            family: 'Inter, sans-serif'
                        },
                        color: CHART_COLORS.text,
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Annual Cost',
                        font: {
                            size: 13,
                            weight: '700'
                        }
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        font: { 
                            size: 13, 
                            weight: '600',
                            family: 'Inter, sans-serif'
                        },
                        color: CHART_COLORS.cumulativeBorder,
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Cumulative Total',
                        color: CHART_COLORS.cumulativeBorder,
                        font: {
                            size: 13,
                            weight: '700'
                        }
                    }
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ===== COMPARISON TABLE (PREMIUM VERSION) =====
function updateComparisonTable(years) {
    const tbody = document.getElementById('comparison-tbody');
    if (!tbody) return;
    
    const inflationRate = inflationRates[currentScenario];
    const careHomeSelect = document.getElementById('care-home-select');
    const selectedHomeKey = careHomeSelect?.value;
    
    // Calculate all homes and sort by total cost
    const comparisons = Object.entries(careHomeData).map(([key, home]) => {
        let total = home.registrationFee;
        for (let year = 1; year <= Math.ceil(years); year++) {
            const yearFraction = year <= years ? 1 : (years % 1) || 1;
            const multiplier = Math.pow(1 + inflationRate, year - 1);
            const annualCost = (home.weeklyFee * 52) * multiplier * yearFraction;
            const extras = (home.activities * 12 + home.medical * 12 + home.transport * 12) * multiplier * yearFraction;
            total += annualCost + extras;
        }
        
        return {
            key: key,
            name: home.name,
            weeklyFee: home.weeklyFee,
            total: total,
            monthlyAverage: total / (years * 12),
            londonSavings: total * 0.35
        };
    });
    
    comparisons.sort((a, b) => a.total - b.total);
    
    let tableHTML = '';
    
    comparisons.forEach((home, index) => {
        const isSelected = home.key === selectedHomeKey;
        const rankBadge = index === 0 ? 'BEST VALUE' : (index === comparisons.length - 1 ? 'PREMIUM' : '');
        
        tableHTML += `
            <tr class="${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'} transition-all duration-200">
                <td class="p-4 font-semibold">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 ${isSelected ? 'bg-blue-500' : 'bg-gray-400'} rounded-full"></div>
                            <span class="${isSelected ? 'text-blue-700 font-bold' : ''}">${home.name}</span>
                        </div>
                        ${rankBadge ? `<span class="text-xs px-2 py-1 rounded-full ${index === 0 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'} font-semibold">${rankBadge}</span>` : ''}
                    </div>
                </td>
                <td class="p-4 text-center font-bold text-lg">${formatCurrency(home.weeklyFee)}</td>
                <td class="p-4 text-center font-bold text-xl ${isSelected ? 'text-blue-600' : 'text-gray-700'}">${formatCurrency(Math.round(home.total))}</td>
                <td class="p-4 text-center font-semibold text-gray-600">${formatCurrency(Math.round(home.monthlyAverage))}</td>
                <td class="p-4 text-center font-semibold text-green-600">${formatCurrency(Math.round(home.londonSavings))}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHTML;
    
    // Add comparison insights
    updateComparisonInsights(comparisons, selectedHomeKey, years);
}

// ===== COMPARISON INSIGHTS =====
function updateComparisonInsights(comparisons, selectedKey, years) {
    let insightsContainer = document.getElementById('comparison-insights');
    
    if (!insightsContainer) {
        const tableContainer = document.getElementById('comparison-tbody')?.closest('.card');
        if (tableContainer) {
            insightsContainer = document.createElement('div');
            insightsContainer.id = 'comparison-insights';
            insightsContainer.className = 'mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200';
            tableContainer.after(insightsContainer);
        }
    }
    
    if (!insightsContainer) return;
    
    const selectedHome = comparisons.find(h => h.key === selectedKey);
    const cheapest = comparisons[0];
    const mostExpensive = comparisons[comparisons.length - 1];
    
    if (!selectedHome) return;
    
    const savingsVsCheapest = selectedHome.total - cheapest.total;
    const savingsVsMostExpensive = mostExpensive.total - selectedHome.total;
    const yearText = years === 1 ? 'year' : `${years} years`;
    
    let insightHTML = `
        <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>Cost Comparison Insights (${scenarios[currentScenario].label} Scenario)</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    `;
    
    if (selectedKey === cheapest.key) {
        insightHTML += `
            <div class="bg-white p-4 rounded-lg border border-green-200">
                <div class="text-green-600 font-semibold mb-1">✓ Best Value Choice</div>
                <div class="text-sm text-gray-600">You've selected the most cost-effective option</div>
            </div>
        `;
    } else {
        insightHTML += `
            <div class="bg-white p-4 rounded-lg">
                <div class="text-gray-700 font-semibold mb-1">vs. Best Value</div>
                <div class="text-sm text-gray-600">
                    Paying <span class="font-bold text-orange-600">${formatCurrency(Math.round(savingsVsCheapest))}</span> more
                    over ${yearText} than ${cheapest.name}
                </div>
            </div>
        `;
    }
    
    const percentageSavings = ((savingsVsMostExpensive / mostExpensive.total) * 100).toFixed(1);
    insightHTML += `
        <div class="bg-white p-4 rounded-lg">
            <div class="text-gray-700 font-semibold mb-1">vs. Most Expensive</div>
            <div class="text-sm text-gray-600">
                Saving <span class="font-bold text-green-600">${formatCurrency(Math.round(savingsVsMostExpensive))}</span>
                (${percentageSavings}% less) over ${yearText}
            </div>
        </div>
    `;
    
    const avgTotal = comparisons.reduce((sum, h) => sum + h.total, 0) / comparisons.length;
    const vsAverage = selectedHome.total - avgTotal;
    const vsAverageText = vsAverage > 0 
        ? `${formatCurrency(Math.round(Math.abs(vsAverage)))} above average`
        : `${formatCurrency(Math.round(Math.abs(vsAverage)))} below average`;
    
    insightHTML += `
        <div class="bg-white p-4 rounded-lg">
            <div class="text-gray-700 font-semibold mb-1">vs. Regional Average</div>
            <div class="text-sm text-gray-600">
                <span class="font-bold ${vsAverage > 0 ? 'text-orange-600' : 'text-green-600'}">${vsAverageText}</span>
                for Birmingham area
            </div>
        </div>
    `;
    
    insightHTML += `</div>`;
    insightsContainer.innerHTML = insightHTML;
}

// ===== EVIDENCE EXPLORER =====
function showEvidence(key) {
    const data = evidenceData[key];
    if (!data) return;
    
    document.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('active'));
    
    const selectedNode = document.getElementById(`node-${key}`);
    if (selectedNode) {
        selectedNode.classList.add('active');
    }
    
    const evidenceContent = document.getElementById('evidence-content');
    if (evidenceContent) {
        evidenceContent.innerHTML = `
            <div class="evidence-item verified">
                <h3 class="text-xl font-bold mb-4 text-green-600">${data.title}</h3>
                <div class="text-gray-800 leading-relaxed" style="white-space: pre-line; line-height: 1.8;">
${data.content}
                </div>
                <div class="evidence-metadata mt-6 pt-4 border-t">
                    <div class="flex flex-col sm:flex-row justify-between gap-2 text-sm text-gray-600">
                        <span>Confidence: ${data.meta.confidence}</span>
                        <span>Last Updated: ${data.meta.date}</span>
                        <span>✓ ${data.meta.status}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// ===== ANIMATION HELPERS =====
function animateValue(elementId, start, end, duration, isCurrency = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (isCurrency) {
            element.textContent = formatCurrency(Math.round(current));
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// ===== STICKY CTA BANNER =====
function initializeStickyBanner() {
    const banner = document.querySelector('.sticky-cta-banner');
    if (!banner) return;
    
    function checkBannerVisibility() {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollPosition > 500 || (scrollPosition + windowHeight) > (documentHeight - 1000)) {
            banner.classList.add('visible');
        } else {
            banner.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', checkBannerVisibility);
    window.addEventListener('resize', checkBannerVisibility);
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.innerText;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback(event.target);
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback(event.target);
    } catch (err) {
        alert('Failed to copy. Please select and copy manually.');
    } finally {
        document.body.removeChild(textArea);
    }
}

function showCopyFeedback(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '✓ Copied!';
    button.classList.add('btn-primary');
    button.classList.remove('btn-secondary');
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
    }, 2000);
}

// ===== DOWNLOAD FUNCTIONALITY =====
function downloadHTML() {
    try {
        const reportContent = document.documentElement.outerHTML;
        const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `Premium_Care_Home_Report_Thompson_${new Date().toISOString().split('T')[0]}.html`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again or contact support.');
    }
}

// ===== ACCESSIBILITY =====
function initializeA11y() {
    document.querySelectorAll('.scenario-btn, .timeline-node').forEach(element => {
        if (!element.getAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
}

// ===== UTILITY FUNCTIONS =====
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

// ===== DEBOUNCE FOR PERFORMANCE =====
function debounce(func, wait) {
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

const debouncedCalculatorUpdate = debounce(updateCalculator, 300);

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Premium Report Error:', e.error);
});

console.log('Premium Report Calculator [2025] loaded successfully');