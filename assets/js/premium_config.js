// Tailwind CSS Configuration for Premium Report
// RightCareHome Birmingham - 2025

tailwind.config = {
    theme: {
        extend: {
            colors: {
                'premium-gold': '#D4AF37',
                'premium-navy': '#0A1628',
                'premium-blue': '#1E3A5F',
                'signal-green': '#10B981',
                'signal-amber': '#F59E0B',
                'signal-red': '#EF4444'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                '4xl': '2rem',
            }
        }
    },
    plugins: []
};
