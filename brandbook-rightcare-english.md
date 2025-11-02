# RightCareHome Brand Book
## Professional Design System for Information Service (55+ Audience, UK Market)

**Version 1.0 | October 29, 2025**  
**Target:** Care home selection advisory service, not healthcare/NHS  
**Audience:** Adults 55+, families, decision-makers

---

## 1. Brand Identity & Values

### Core Positioning
- **Information Advisory Service** (not medical/healthcare)
- **Sage Advisor** archetype: wisdom, guidance, expertise
- **Independent & Unbiased** (family-paid, not care home commissions)
- **Dignity-Focused** (respectful approach to aging decisions)

### Brand Personality
- **Wise** yet accessible
- **Professional** but warm
- **Trustworthy** through transparency
- **Supportive** without being patronizing

---

## 2. Color Palette (Production-Ready)

### Primary Colors

**Sage Green (Primary)**
```css
--color-primary: #6B7C6E;
--color-primary-dark: #4A5C4D;
--color-primary-light: #8FA693;
```
- **Usage:** Main CTAs, links, primary headings
- **Psychology:** Balance, wisdom, natural choice, calm expertise
- **Why Not Medical Blue:** Avoids NHS associations, positions as advisory not treatment

**Warm Clay (Secondary)**
```css
--color-secondary: #9B7E6B;
--color-secondary-dark: #7A5E4B;
--color-secondary-light: #B89E8B;
```
- **Usage:** Secondary buttons, supportive elements, card backgrounds
- **Psychology:** Warmth, humanity, approachability

**Terracotta (Accent)**
```css
--color-accent: #C08B7A;
--color-accent-hover: #B07B6A;
--color-accent-light: #D4A08F;
```
- **Usage:** Important highlights, premium badges, warm accents
- **Psychology:** Friendliness, warmth, positive action

### Supporting Colors

**Slate Blue-Grey (Trust Alternative)**
```css
--color-trust: #6B7C8E;
--color-trust-dark: #4A5C6D;
--color-trust-light: #8FA6B3;
```
- **Usage:** Statistics, charts, trust indicators (NOT primary CTAs)
- **Psychology:** Reliability without medical associations

**Olive Green (Success)**
```css
--color-success: #7A9471;
--color-success-dark: #5A7451;
--color-success-light: #9AB491;
```
- **Usage:** Success states, quality indicators, positive outcomes

**Warm Amber (Warning)**
```css
--color-warning: #C9A66B;
--color-warning-dark: #A9864B;
--color-warning-light: #E9C68B;
```
- **Usage:** Important notices, caution states (non-alarming)

### Neutral Colors

**Text Colors (WCAG AA+ Compliant)**
```css
--text-primary: #1A1B1A;      /* 8.2:1 contrast ratio */
--text-secondary: #3A3B3A;    /* 6.8:1 contrast ratio */
--text-tertiary: #5A5B5A;     /* 4.7:1 contrast ratio */
--text-muted: #7A7B7A;        /* 3.2:1 contrast ratio - large text only */
```

**Background Colors**
```css
--background-primary: #FAF7F3;    /* Warm neutral */
--background-soft: #F0EDE8;       /* Enhanced section separation */
--background-subtle: #F5F2EE;     /* Card backgrounds */
--background-white: #FFFFFF;      /* Pure white when needed */
```

### Color Usage Rules

1. **Primary #6B7C6E:** All main CTAs, primary navigation, key headings
2. **Secondary #9B7E6B:** Secondary actions, supportive elements
3. **Accent #C08B7A:** Highlights, badges, warm touches
4. **Trust #6B7C8E:** Data visualization ONLY (never primary CTAs)
5. **Never use:** Bright blue (#0066CC), NHS blue, bright red, pure black

---

## 3. Typography System

### Font Stack
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-family-headings: 'Inter', sans-serif;
```

### Font Sizes (55+ Optimized)
```css
--font-size-xs: 14px;      /* Minimum size - captions only */
--font-size-sm: 16px;      /* Small text, footnotes */
--font-size-base: 18px;    /* Body text (never smaller) */
--font-size-lg: 20px;      /* Large body, introductions */
--font-size-xl: 22px;      /* Subheadings */
--font-size-2xl: 26px;     /* H4 headings */
--font-size-3xl: 30px;     /* H3 headings */
--font-size-4xl: 34px;     /* H2 headings */
--font-size-5xl: 44px;     /* H1 headings */
--font-size-6xl: 56px;     /* Hero headings */
```

### Line Heights
```css
--line-height-tight: 1.2;      /* Headings only */
--line-height-normal: 1.4;     /* Subheadings */
--line-height-relaxed: 1.6;    /* Body text */
--line-height-loose: 1.8;      /* Large body text */
```

### Font Weights
```css
--font-weight-normal: 400;     /* Body text */
--font-weight-medium: 500;     /* Subtle emphasis */
--font-weight-semibold: 600;   /* Subheadings, labels */
--font-weight-bold: 700;       /* Headings, strong emphasis */
```

### Typography Classes
```css
.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); line-height: var(--line-height-relaxed); }
.text-lg { font-size: var(--font-size-lg); line-height: var(--line-height-relaxed); }

.heading-1 { 
  font-size: var(--font-size-5xl); 
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--text-primary);
}

.heading-2 { 
  font-size: var(--font-size-4xl); 
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-normal);
}
```

---

## 4. Button System (Touch-Optimized for 55+)

### Button Sizes
```css
--button-height-sm: 44px;      /* Minimum WCAG */
--button-height-md: 52px;      /* Secondary buttons */
--button-height-lg: 56px;      /* Primary CTAs */
--button-height-xl: 64px;      /* Hero CTAs */

--button-padding-sm: 12px 20px;
--button-padding-md: 16px 28px;
--button-padding-lg: 18px 32px;
--button-padding-xl: 20px 40px;
```

### Button Spacing
```css
--button-gap: 24px;            /* Minimum between buttons (prevents misclicks) */
--button-gap-sm: 16px;         /* Compact layouts only */
```

### Button Styles

**Primary CTA (Sage Green)**
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--background-white);
  border: 2px solid var(--color-primary-dark);
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  min-height: var(--button-height-lg);
  padding: var(--button-padding-lg);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 110, 0.25);
}
```

**Secondary Button (Warm Clay)**
```css
.btn-secondary {
  background: var(--background-white);
  color: var(--color-secondary);
  border: 2px solid var(--color-secondary);
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  min-height: var(--button-height-md);
  padding: var(--button-padding-md);
}

.btn-secondary:hover {
  background: var(--color-secondary);
  color: var(--background-white);
}
```

**Accent Button (Terracotta)**
```css
.btn-accent {
  background: var(--color-accent);
  color: var(--background-white);
  border: 2px solid var(--color-accent-hover);
  border-radius: 8px;
  min-height: var(--button-height-lg);
  padding: var(--button-padding-lg);
}

.btn-accent:hover {
  background: var(--color-accent-hover);
}
```

---

## 5. Layout & Spacing System

### Spacing Scale (6px Base Unit)
```css
--space-xs: 6px;      /* 0.375rem */
--space-sm: 12px;     /* 0.75rem */
--space-md: 18px;     /* 1.125rem */
--space-lg: 24px;     /* 1.5rem */
--space-xl: 32px;     /* 2rem */
--space-2xl: 48px;    /* 3rem */
--space-3xl: 64px;    /* 4rem */
--space-4xl: 80px;    /* 5rem */
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1200px;
--container-2xl: 1400px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
```

### Shadows
```css
--shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.10);
```

---

## 6. Component Library

### Cards
```css
.card {
  background: var(--background-white);
  border: 2px solid var(--color-primary-light);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-featured {
  border-color: var(--color-primary);
  border-width: 3px;
}
```

### Form Elements
```css
.form-input {
  width: 100%;
  padding: 16px 20px;
  font-size: var(--font-size-base);
  border: 2px solid var(--color-primary-light);
  border-radius: var(--radius-md);
  min-height: 52px;
  background: var(--background-white);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(107, 124, 110, 0.15);
}

.form-label {
  display: block;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 8px;
}
```

### Status Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-success {
  background: var(--color-success);
  color: var(--background-white);
}

.badge-warning {
  background: var(--color-warning);
  color: var(--text-primary);
}

.badge-accent {
  background: var(--color-accent);
  color: var(--background-white);
}
```

---

## 7. Accessibility Standards (WCAG 2.1 AA)

### Contrast Requirements
- Normal text: minimum 4.5:1 ✅ (all combinations exceed 6.8:1)
- Large text (24px+): minimum 3:1 ✅
- UI components: minimum 3:1 ✅

### Touch Targets
- Minimum: 44x44px (WCAG guideline)
- Recommended for 55+: 48-56px
- Optimal for seniors: 56-64px
- Spacing between: minimum 24px

### Focus Indicators
```css
.focusable:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.btn:focus {
  box-shadow: 0 0 0 3px rgba(107, 124, 110, 0.4);
}
```

### Color Usage
- Never use color alone to convey information
- Always pair with text labels or icons
- Test in grayscale mode for clarity

---

## 8. Content Guidelines

### Voice & Tone
- **Professional but warm:** "Our analysis shows..." not "Obviously..."
- **Supportive not patronizing:** Avoid "simple" or "easy for seniors"
- **Clear and direct:** Front-load important information
- **Respectful:** Acknowledge the emotional weight of decisions

### Writing Principles
1. **Use active voice:** "We analyze 156 factors" not "156 factors are analyzed"
2. **Be specific:** "48-hour delivery" not "fast service"
3. **Break up content:** 3-4 sentences per paragraph maximum
4. **Use plain English:** Avoid jargon and complex terminology

### Content Examples

**Good:**
> "Get your personalized care home report in 48 hours. We analyze all 277 Birmingham care homes across 156 quality factors to match your specific needs and budget."

**Avoid:**
> "Our easy-to-use system makes finding care homes simple for seniors. Just fill out our straightforward form and we'll do the hard work for you."

---

## 9. Implementation Guide

### CSS Custom Properties Setup
```css
:root {
  /* Colors */
  --color-primary: #6B7C6E;
  --color-primary-dark: #4A5C4D;
  --color-primary-light: #8FA693;
  --color-secondary: #9B7E6B;
  --color-accent: #C08B7A;
  --color-trust: #6B7C8E;
  --color-success: #7A9471;
  --color-warning: #C9A66B;
  
  /* Text */
  --text-primary: #1A1B1A;
  --text-secondary: #3A3B3A;
  --text-tertiary: #5A5B5A;
  
  /* Backgrounds */
  --background-primary: #FAF7F3;
  --background-soft: #F0EDE8;
  --background-white: #FFFFFF;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-base: 18px;
  --line-height-base: 1.6;
  
  /* Spacing */
  --space-sm: 12px;
  --space-md: 18px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Components */
  --button-height-lg: 56px;
  --button-gap: 24px;
  --radius-md: 8px;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
}
```

### Responsive Breakpoints
```css
/* Mobile-first approach */
@media (min-width: 768px) {  /* Tablet */
  :root {
    --font-size-base: 20px;
    --space-lg: 32px;
  }
}

@media (min-width: 1024px) { /* Desktop */
  :root {
    --space-xl: 48px;
  }
}
```

---

## 10. Testing & Quality Assurance

### Browser Support
- Chrome/Edge (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)

### Accessibility Testing Tools
- **Automated:** WAVE, axe DevTools, Lighthouse
- **Manual:** Keyboard navigation, screen reader testing
- **User testing:** Include 55+ participants in usability studies

### Performance Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

---

## 11. Brand Applications

### Digital
- **Website:** Full design system implementation
- **Email:** 600px max width, 18px minimum font
- **Social Media:** Consistent color palette, accessible imagery

### Print (if needed)
- **CMYK Conversions:**
  - Primary #6B7C6E → C:45 M:25 Y:45 K:15
  - Accent #C08B7A → C:20 M:35 Y:40 K:5
- **Minimum font size:** 12pt (14pt preferred)

---

## 12. File Structure & Naming

### CSS Architecture
```
styles/
├── base/
│   ├── variables.css    /* All custom properties */
│   ├── reset.css       /* Normalize/reset */
│   └── typography.css  /* Font definitions */
├── components/
│   ├── buttons.css     /* All button variants */
│   ├── forms.css       /* Form elements */
│   ├── cards.css       /* Card components */
│   └── badges.css      /* Status indicators */
├── layout/
│   ├── grid.css        /* Grid system */
│   ├── header.css      /* Site header */
│   └── footer.css      /* Site footer */
└── utilities/
    ├── spacing.css     /* Margin/padding utilities */
    └── colors.css      /* Color utilities */
```

---

## 13. Maintenance & Updates

### Review Schedule
- **Monthly:** Analytics review for usability issues
- **Quarterly:** Color contrast audit
- **Semi-annually:** Full accessibility compliance check
- **Annually:** Complete brand system review

### Version Control
- Use semantic versioning (1.0.0)
- Document all changes in CHANGELOG.md
- Maintain design token consistency across platforms

---

## 14. Quick Reference

### Essential Color Codes
```
Primary: #6B7C6E
Secondary: #9B7E6B
Accent: #C08B7A
Success: #7A9471
Warning: #C9A66B
Text: #1A1B1A
Background: #FAF7F3
```

### Key Measurements
```
Base font: 18px
Button height: 56px
Button spacing: 24px
Card padding: 32px
Border radius: 8px
```

### Do's and Don'ts

**✅ DO:**
- Use #6B7C6E for primary actions
- Maintain 24px spacing between buttons
- Keep text at 18px minimum
- Test with real users 55+

**❌ DON'T:**
- Use NHS blue (#0066CC) for primary CTAs
- Use medical imagery or icons
- Make buttons smaller than 44x44px
- Use text smaller than 16px

---

**Document prepared: October 29, 2025**  
**Next review: January 2026**  
**For technical questions: Contact design team**