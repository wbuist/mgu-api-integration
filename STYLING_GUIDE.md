# MGU API Integration Plugin - Styling Guide

## Overview

This guide provides comprehensive documentation for customizing the appearance of the MGU API Integration plugin. The plugin uses a modular CSS class system that allows for extensive customization while maintaining functionality. All styling has been moved from inline styles to CSS classes for easier customization.

## Table of Contents

1. [Core Container Classes](#core-container-classes)
2. [Step Components](#step-components)
3. [Form Elements](#form-elements)
4. [Button Styles](#button-styles)
5. [Gadget Selection](#gadget-selection)
6. [Option Boxes](#option-boxes)
7. [Quote Display Components](#quote-display-components)
8. [Premium Display Components](#premium-display-components)
9. [Documents Notice](#documents-notice)
10. [Loading States](#loading-states)
11. [Error and Success Messages](#error-and-success-messages)
12. [Responsive Design](#responsive-design)
13. [Developer Recommendations](#developer-recommendations)
14. [Customization Examples](#customization-examples)
15. [Color Scheme Reference](#color-scheme-reference)
16. [Typography](#typography)

---

## Core Container Classes

### `.mgu-api-insurance-flow`
**Main container for the entire plugin**

```css
.mgu-api-insurance-flow {
    max-width: 800px;
    margin: 2em auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    font-size: 16px;
    color-scheme: light;
}
```

**Customization Options:**
- `max-width`: Control overall width
- `margin`: Center alignment and spacing
- `background`: Container background color
- `border-radius`: Corner rounding
- `box-shadow`: Drop shadow effect
- `font-size`: Base font size for the plugin
- `color-scheme: light`: Prevents dark mode dropdowns

### `.mgu-api-steps`
**Container for all step elements**

```css
.mgu-api-steps::after {
    content: "";
    display: block;
    clear: both;
}
```

**Note:** The `::after` pseudo-element ensures proper float containment for side-by-side steps on desktop.

---

## Step Components

### `.mgu-api-step`
**Individual step container**

```css
.mgu-api-step {
    margin-bottom: 2em;
    padding: 20px;
    border: 1px solid #e6e6e6;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    position: relative;
    box-sizing: border-box;
}
```

**Customization Options:**
- `margin-bottom`: Spacing between steps
- `padding`: Internal spacing
- `border`: Step border styling
- `border-radius`: Corner rounding
- `background`: Step background color
- `box-shadow`: Card shadow effect
- `box-sizing: border-box`: Prevents layout overflow

### `.mgu-api-step.is-active`
**Active step highlighting**

```css
.mgu-api-step.is-active {
    border-color: #0073aa;
    box-shadow: 0 0 0 3px rgba(0,115,170,0.12), 0 2px 8px rgba(0,0,0,0.05);
}
```

**Customization Options:**
- `border-color`: Active border color
- `box-shadow`: Active state shadow (includes focus ring effect)

### `.mgu-api-step h3`
**Step headings**

```css
.mgu-api-step h3 {
    margin-top: 0;
    color: #333;
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
}
```

**Customization Options:**
- `color`: Heading text color
- `font-size`: Heading size
- `margin`: Spacing around heading

---

## Form Elements

### `.mgu-api-form-group`
**Form field container**

```css
.mgu-api-form-group {
    margin-bottom: 1.5em;
}

.mgu-api-form-group label {
    display: block;
    margin-bottom: 0.5em;
    color: #333;
    font-weight: 600;
}
```

### `.mgu-api-select`
**Select dropdown styling**

```css
.mgu-api-select {
    width: 100%;
    padding: 12px;
    margin-bottom: 1em;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    line-height: 1.4;
    background-color: #fff;
    cursor: pointer;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg...");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 40px;
    color: #222;
    color-scheme: light;
}
```

**Customization Options:**
- `padding`: Internal spacing
- `border`: Border styling
- `border-radius`: Corner rounding
- `background-color`: Background color
- `background-image`: Custom dropdown arrow
- `font-size`: Text size
- `color-scheme: light`: Prevents dark mode dropdowns

### `.mgu-api-input`
**Text input fields**

```css
.mgu-api-form input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
}

.mgu-form-row .mgu-api-input {
    height: 44px;
}
```

**Customization Options:**
- `padding`: Internal spacing
- `border`: Border styling
- `border-radius`: Corner rounding
- `box-sizing: border-box`: Prevents layout overflow

### `.mgu-form-row` and `.mgu-form-col`
**Two-column layout for side-by-side fields**

```css
.mgu-form-row {
    display: block;
}

@media (min-width: 900px) {
    .mgu-form-row {
        display: flex;
        gap: 20px;
    }
    .mgu-form-row .mgu-form-col {
        flex: 0 0 45%;
        max-width: 45%;
    }
}
```

**Usage:** Wraps related fields (e.g., First Name/Last Name, Email/Phone) to display side-by-side on desktop, stacked on mobile.

### `.mgu-api-help-text`
**Helper text for form fields**

```css
.mgu-api-help-text {
    display: block;
    color: #5f6b76;
    font-size: 0.9em;
    margin-top: 5px;
}

.mgu-help-text-small {
    font-size: 0.9em;
    color: #666;
}
```

---

## Button Styles

### `.mgu-api-button`
**Primary button styling**

```css
.mgu-api-button {
    background: #0073aa;
    color: #fff;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: background-color 0.2s ease;
}

.mgu-api-button:hover {
    background: #005177;
}

.mgu-api-button:disabled,
.mgu-api-button.disabled {
    background-color: #ccc !important;
    color: #666 !important;
    cursor: not-allowed !important;
    opacity: 0.6;
}

.mgu-api-button.enabled {
    background-color: #007cba !important;
    color: white !important;
    cursor: pointer !important;
    opacity: 1;
}

.mgu-api-button.enabled:hover {
    background-color: #005a87 !important;
}
```

**Customization Options:**
- `background`: Button background color
- `color`: Text color
- `padding`: Internal spacing
- `border-radius`: Corner rounding
- `font-size`: Text size
- `font-weight`: Text weight

### `.mgu-api-button-secondary`
**Secondary button styling**

```css
.mgu-api-button-secondary {
    background: #6c757d;
    color: #fff;
}

.mgu-api-button-secondary:hover {
    background: #5a6268;
}
```

### `.mgu-delete-gadget-btn`
**Delete gadget button**

```css
.mgu-delete-gadget-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px 10px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s ease;
}

.mgu-delete-gadget-btn:hover {
    background: #c82333;
}

@media (max-width: 640px) {
    .mgu-delete-gadget-btn {
        position: static;
        width: 100%;
        margin-top: 10px;
    }
}
```

---

## Gadget Selection

### `.mgu-gadget-grid`
**Grid container for gadget type selection**

```css
.mgu-gadget-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-bottom: 1em;
}

@media (max-width: 640px) {
    .mgu-gadget-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

**Layout:**
- Desktop: 6 columns (all gadgets in one row)
- Mobile: 3 columns (2 rows)

### `.mgu-gadget-option`
**Individual gadget option button**

```css
.mgu-gadget-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 88px;
    padding: 12px;
    border: 2px solid transparent;
    border-radius: 8px;
    background: #f7f9fb;
    color: #222;
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease;
}

.mgu-gadget-option:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.mgu-gadget-option:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.35);
}

.mgu-gadget-option[aria-checked="true"],
.mgu-gadget-option.selected {
    border-color: #0073aa;
    background: #e7f3ff;
}
```

### `.mgu-gadget-icon`
**Gadget icon container**

```css
.mgu-gadget-icon {
    width: 32px;
    height: 32px;
    margin-bottom: 8px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}
```

### Color Variants Per Gadget Type

The plugin uses CSS custom properties for gadget-specific accent colors:

```css
.mgu-gadget--MobilePhone { --mgu-accent: #0073aa; }
.mgu-gadget--Laptop { --mgu-accent: #6f42c1; }
.mgu-gadget--Tablet { --mgu-accent: #d63384; }
.mgu-gadget--VRHeadset { --mgu-accent: #20c997; }
.mgu-gadget--Watch { --mgu-accent: #fd7e14; }
.mgu-gadget--GamesConsole { --mgu-accent: #198754; }

.mgu-gadget-option {
    border-color: color-mix(in srgb, var(--mgu-accent) 30%, transparent);
}

.mgu-gadget-option[aria-checked="true"],
.mgu-gadget-option.selected {
    border-color: var(--mgu-accent);
    background: color-mix(in srgb, var(--mgu-accent) 12%, #ffffff);
}
```

---

## Option Boxes

### `.mgu-option-box`
**Base option box styling (used for memory, premium period, etc.)**

```css
.mgu-option-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 6px;
    padding: 14px;
    border: 2px solid #e6e6e6;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, box-shadow .15s ease;
}

.mgu-option-box:hover {
    border-color: #bcd8e8;
    background: #f7fbfe;
}

.mgu-option-box.selected,
.mgu-option-box input[type="radio"]:checked {
    border-color: #0073aa;
    background: #e7f3ff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
```

### `.mgu-option-amount` and `.mgu-option-sub`
**Option box content**

```css
.mgu-option-amount { 
    font-weight: 700; 
    font-size: 1.05rem; 
    color: #0f2e46; 
}

.mgu-option-sub { 
    font-size: 0.9rem; 
    color: #444; 
}
```

### Grid Layouts for Option Groups

```css
#memory-radio-buttons,
#premium-period-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

@media (min-width: 640px) {
    #memory-radio-buttons,
    #premium-period-buttons {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 1024px) {
    #memory-radio-buttons,
    #premium-period-buttons {
        grid-template-columns: repeat(6, 1fr);
    }
}
```

**Layout:**
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 6 columns

### Loss Cover Toggle

```css
.mgu-loss-row { 
    gap: 12px; 
}

.mgu-loss-toggle {
    min-height: 88px;
    padding: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.mgu-loss-toggle label { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    line-height: 1.1; 
}

.mgu-loss-line { 
    font-weight: 700; 
}

.mgu-loss-text { 
    font-size: 0.95rem; 
}

.mgu-loss-toggle .mgu-tick {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    border: 2px solid #0073aa;
    border-radius: 4px;
    background: #ffffff;
}

.mgu-loss-toggle.selected .mgu-tick {
    background: #0073aa;
    color: #ffffff;
}

.mgu-loss-toggle.selected .mgu-tick::after {
    content: '\2713';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -55%);
    font-size: 14px;
}
```

### Marketing Toggle

```css
.mgu-marketing-toggle input[type="checkbox"] { 
    position: absolute; 
    opacity: 0; 
}

.mgu-marketing-toggle label { 
    cursor: pointer; 
}

.mgu-marketing-toggle.selected { 
    border-color: #0073aa; 
    background: #e7f3ff; 
}
```

---

## Quote Display Components

### `.mgu-quote-summary-container`
**Main quote summary container**

```css
.mgu-quote-summary-container {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    margin: 15px 0;
}
```

### `.mgu-quote-summary-title`
**Quote summary heading**

```css
.mgu-quote-summary-title {
    font-size: 1.1rem;
    margin: 0 0 8px 0;
}
```

### `.mgu-gadget-items-wrapper`
**Container for gadget items list**

```css
.mgu-gadget-items-wrapper {
    margin: 10px 0;
}
```

### `.mgu-gadget-item-detail`
**Individual gadget detail box**

```css
.mgu-gadget-item-detail {
    border: 1px solid #ddd;
    padding: 10px;
    margin: 5px 0;
    border-radius: 3px;
    background: white;
    position: relative;
}

.mgu-gadget-item-detail h5 {
    margin: 0 0 5px 0;
}

.mgu-gadget-item-detail p {
    margin: 2px 0;
}
```

### `.mgu-quote-breakdown`
**Premium breakdown section**

```css
.mgu-quote-breakdown {
    border-top: 2px solid #ddd;
    padding-top: 10px;
    margin-top: 10px;
}

.mgu-quote-breakdown p {
    margin: 5px 0;
}

.mgu-quote-breakdown-bold {
    font-weight: bold;
}
```

### Discount and Premium Styling

```css
.mgu-quote-discount-info {
    color: #666;
    font-style: italic;
}

.mgu-quote-discount-positive {
    color: #28a745;
    font-weight: bold;
}

.mgu-discount-amount {
    color: #28a745;
    font-weight: bold;
}

.mgu-quote-final-premium {
    margin: 10px 0;
    font-size: 1.2em;
    font-weight: bold;
    color: #007cba;
}
```

---

## Documents Notice

### `.mgu-documents-notice`
**Important documents notice box**

```css
.mgu-documents-notice {
    margin: 20px 0;
    padding: 15px;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-left: 4px solid #ffc107;
    border-radius: 4px;
}

.mgu-documents-notice p {
    margin: 0;
    color: #856404;
}

.mgu-documents-notice a {
    color: #0073aa;
    text-decoration: underline;
}

.mgu-documents-notice a:hover {
    color: #005a87;
    text-decoration: none;
}
```

**Location:** Appears above the "Buy Policy" button in the Review Your Quote step.

---

## Premium Display Components

### `.mgu-api-total-premium`
**Total premium display container**

```css
#total-premium-display {
    background: #ffffff;
    border: 1px solid #e6e6e6;
    border-radius: 10px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
}
```

---

## Loading States

### `.mgu-api-step.loading`
**Loading state for entire steps**

```css
.mgu-api-step.loading {
    opacity: 0.6;
    pointer-events: none;
    position: relative;
}

.mgu-api-step.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #0073aa;
    border-radius: 50%;
    animation: mgu-spin 1s linear infinite;
    z-index: 10;
}
```

### `.mgu-api-loading-spinner`
**Inline loading spinner**

```css
.mgu-api-loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #0073aa;
    border-radius: 50%;
    animation: mgu-spin 1s linear infinite;
    margin-left: 10px;
    vertical-align: middle;
}
```

### Loading Animation

```css
@keyframes mgu-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

## Error and Success Messages

### `.mgu-api-step-result`
**Message container**

```css
.mgu-api-step-result {
    margin-top: 1em;
    padding: 15px;
    border-radius: 4px;
    font-size: 16px;
    position: absolute;
    bottom: -60px;
    left: 0;
    right: 0;
    z-index: 1;
}
```

### `.mgu-api-step-result.success`
**Success message styling**

```css
.mgu-api-step-result.success {
    background: #dff0d8;
    color: #3c763d;
    border: 1px solid #d6e9c6;
}
```

### `.mgu-api-step-result.error`
**Error message styling**

```css
.mgu-api-step-result.error {
    background: #f2dede;
    color: #a94442;
    border: 1px solid #ebccd1;
}
```

---

## Responsive Design

### Mobile Optimization (< 640px)

```css
@media (max-width: 640px) {
    .mgu-api-insurance-flow {
        padding: 16px;
    }
    
    .mgu-api-button {
        width: 100%;
    }
    
    .mgu-gadget-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .mgu-delete-gadget-btn {
        position: static;
        width: 100%;
        margin-top: 10px;
    }
}
```

### Tablet Optimization (640px - 1024px)

```css
@media (min-width: 640px) {
    #memory-radio-buttons,
    #premium-period-buttons {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### Desktop Optimization (> 900px)

```css
@media (min-width: 900px) {
    .mgu-form-row {
        display: flex;
        gap: 20px;
    }
    
    .mgu-form-row .mgu-form-col {
        flex: 0 0 45%;
        max-width: 45%;
    }
    
    #step-manufacturer,
    #step-model {
        display: block;
        float: left;
        width: 47%;
        box-sizing: border-box;
    }
    
    #step-manufacturer { 
        margin-right: 6%; 
    }
    
    #step-model { 
        margin-right: 0; 
    }
    
    #step-device { 
        clear: both; 
    }
}
```

### Large Desktop (> 1024px)

```css
@media (min-width: 1024px) {
    #memory-radio-buttons,
    #premium-period-buttons {
        grid-template-columns: repeat(6, 1fr);
    }
}
```

---

## Developer Recommendations

### Overview

This section provides best practices and recommendations for developers who want to customize the plugin's appearance to match their site's design.

### 1. CSS Architecture Approach

**Recommended:** Use CSS classes rather than inline styles. All styling has been moved to the CSS file (`public/css/mgu-api-public.css`) for easier customization.

#### Do:
- Override existing classes in your theme's stylesheet
- Use CSS specificity to target specific elements
- Maintain the class structure for functionality

#### Don't:
- Modify the plugin's CSS file directly (changes will be lost on updates)
- Use inline styles in JavaScript/HTML
- Remove required classes that affect functionality

### 2. Customization Methods

#### Method 1: Theme Stylesheet Override (Recommended)

Add your customizations to your theme's `style.css` or a custom stylesheet:

```css
/* In your theme's style.css */

/* Override main container */
.mgu-api-insurance-flow {
    max-width: 1000px; /* Wider container */
    background: #f8f9fa; /* Light gray background */
}

/* Override primary button */
.mgu-api-button {
    background: #28a745; /* Green buttons */
    border-radius: 25px; /* Rounded buttons */
}

/* Override step cards */
.mgu-api-step {
    border-radius: 15px; /* More rounded corners */
    box-shadow: 0 4px 12px rgba(0,0,0,0.1); /* Stronger shadow */
}

/* Override gadget options */
.mgu-gadget-option {
    border-radius: 12px; /* More rounded gadget cards */
}
```

#### Method 2: Child Theme with Custom CSS File

Create a custom CSS file in your child theme and enqueue it with higher priority:

```php
// In functions.php of your child theme
function custom_mgu_styles() {
    wp_enqueue_style(
        'custom-mgu-styles',
        get_stylesheet_directory_uri() . '/css/custom-mgu.css',
        array('mgu-api-public-css'), // Depend on plugin stylesheet
        999 // High priority to override
    );
}
add_action('wp_enqueue_scripts', 'custom_mgu_styles');
```

#### Method 3: CSS Variables for Theming

The plugin uses CSS custom properties for gadget colors. You can extend this pattern:

```css
/* In your custom CSS */
:root {
    --mgu-primary-color: #0073aa;
    --mgu-primary-hover: #005177;
    --mgu-border-radius: 8px;
    --mgu-spacing: 20px;
}

.mgu-api-button {
    background: var(--mgu-primary-color);
    border-radius: var(--mgu-border-radius);
}

.mgu-api-button:hover {
    background: var(--mgu-primary-hover);
}
```

### 3. Key Areas for Customization

#### Brand Colors

Update primary colors throughout the plugin:

```css
/* Primary blue */
.mgu-api-button,
.mgu-api-step.is-active,
.mgu-option-box.selected,
.mgu-gadget-option.selected {
    border-color: #YOUR_COLOR;
    background: #YOUR_LIGHT_COLOR;
}

/* Links */
.mgu-documents-notice a {
    color: #YOUR_COLOR;
}
```

#### Typography

Match your site's typography:

```css
.mgu-api-insurance-flow {
    font-family: 'Your Font', sans-serif;
    font-size: 18px; /* Adjust base size */
}

.mgu-api-step h3 {
    font-family: 'Your Heading Font', serif;
    font-size: 1.5rem; /* Adjust heading size */
}
```

#### Spacing

Adjust spacing for tighter or looser layouts:

```css
.mgu-api-step {
    padding: 30px; /* More padding */
    margin-bottom: 3em; /* More spacing between steps */
}

.mgu-api-form-group {
    margin-bottom: 2em; /* More space between form fields */
}
```

#### Border Radius

Control roundedness of elements:

```css
.mgu-api-step {
    border-radius: 15px; /* More rounded */
}

.mgu-option-box {
    border-radius: 12px; /* Consistent rounding */
}

.mgu-api-button {
    border-radius: 25px; /* Pill-shaped buttons */
}
```

### 4. Component-Specific Customization

#### Customize Gadget Grid

```css
/* Change grid layout */
.mgu-gadget-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 columns on desktop */
    gap: 20px; /* More spacing */
}

/* Customize gadget cards */
.mgu-gadget-option {
    min-height: 120px; /* Taller cards */
    padding: 20px; /* More padding */
}

/* Customize gadget icons */
.mgu-gadget-icon {
    width: 48px; /* Larger icons */
    height: 48px;
}
```

#### Customize Option Boxes

```css
/* Memory and premium period options */
.mgu-option-box {
    min-height: 100px; /* Taller boxes */
    border-width: 3px; /* Thicker borders */
}

/* Selected state */
.mgu-option-box.selected {
    box-shadow: 0 4px 12px rgba(0,115,170,0.2); /* Stronger shadow */
}
```

#### Customize Quote Summary

```css
.mgu-quote-summary-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
}

.mgu-gadget-item-detail {
    background: rgba(255,255,255,0.9); /* Semi-transparent white */
    backdrop-filter: blur(10px);
}
```

### 5. Accessibility Considerations

When customizing, ensure you maintain accessibility:

```css
/* Maintain focus states */
.mgu-gadget-option:focus,
.mgu-option-box:focus {
    outline: 3px solid #YOUR_COLOR;
    outline-offset: 2px;
}

/* Ensure sufficient contrast */
.mgu-api-step h3 {
    color: #333; /* Dark enough for WCAG AA */
}

/* Maintain button states */
.mgu-api-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
```

### 6. Performance Best Practices

- **Minimize CSS Overrides:** Only override what you need to change
- **Use Efficient Selectors:** Avoid overly specific selectors
- **Leverage Existing Classes:** Build upon existing classes rather than creating new ones
- **Test Responsiveness:** Always test your customizations on mobile, tablet, and desktop

### 7. Common Customization Patterns

#### Pattern 1: Color Theme Match

```css
/* Match your site's color scheme */
.mgu-api-button {
    background: var(--your-theme-primary);
}

.mgu-api-step.is-active {
    border-color: var(--your-theme-primary);
}
```

#### Pattern 2: Minimal Design

```css
/* Remove shadows and borders for minimal look */
.mgu-api-step {
    box-shadow: none;
    border: 1px solid #e0e0e0;
}

.mgu-option-box {
    box-shadow: none;
}
```

#### Pattern 3: Bold Design

```css
/* Increase visual weight */
.mgu-api-step {
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    border: 2px solid #0073aa;
}

.mgu-api-button {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}
```

### 8. Testing Your Customizations

Before deploying customizations:

1. **Test on Multiple Browsers:** Chrome, Firefox, Safari, Edge
2. **Test Responsive Breakpoints:** Mobile (320px-640px), Tablet (641px-1024px), Desktop (1025px+)
3. **Test All Form States:** Empty, filled, validated, error states
4. **Test Loading States:** Ensure loading spinners work correctly
5. **Test Accessibility:** Keyboard navigation, screen readers, focus states
6. **Test All Steps:** Ensure all form steps display correctly

### 9. Troubleshooting Custom Styles

If your customizations aren't applying:

1. **Check CSS Specificity:** Your selectors may need higher specificity
2. **Check Load Order:** Ensure your stylesheet loads after the plugin's stylesheet
3. **Use !important Sparingly:** Only when necessary, as it makes future maintenance harder
4. **Inspect Elements:** Use browser dev tools to see which styles are being applied
5. **Clear Cache:** Browser cache and WordPress cache may need clearing

### 10. Maintaining Customizations

- **Document Your Changes:** Keep notes on what you customized and why
- **Version Control:** Store your custom CSS in version control
- **Test After Updates:** Always test after plugin updates to ensure compatibility
- **Backup Original Styles:** Keep a backup of the original plugin CSS for reference

---

## Customization Examples

### Example 1: Dark Theme

```css
.mgu-api-insurance-flow {
    background: #2c3e50;
    color: #ecf0f1;
}

.mgu-api-step {
    background: #34495e;
    border-color: #4a5f7a;
    color: #ecf0f1;
}

.mgu-api-button {
    background: #e74c3c;
}

.mgu-api-button:hover {
    background: #c0392b;
}

.mgu-option-box {
    background: #34495e;
    border-color: #4a5f7a;
    color: #ecf0f1;
}
```

### Example 2: Minimal Design

```css
.mgu-api-insurance-flow {
    box-shadow: none;
    border: 1px solid #e0e0e0;
}

.mgu-api-step {
    border: none;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 0;
    box-shadow: none;
}

.mgu-api-button {
    border-radius: 0;
    font-weight: normal;
}

.mgu-option-box {
    box-shadow: none;
}
```

### Example 3: Colorful Theme

```css
.mgu-api-insurance-flow {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.mgu-api-step {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    color: white;
}

.mgu-api-button {
    background: #ff6b6b;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}
```

---

## Color Scheme Reference

### Primary Colors
- **Primary Blue**: `#0073aa` (WordPress blue)
- **Primary Blue Hover**: `#005177`
- **Primary Blue Alt**: `#007cba`
- **Primary Blue Alt Hover**: `#005a87`
- **Success Green**: `#28a745`
- **Error Red**: `#dc3545`
- **Warning Yellow**: `#ffc107`

### Background Colors
- **Main Background**: `#fff`
- **Step Background**: `#ffffff`
- **Quote Details**: `#f5f5f5`
- **Premium Breakdown**: `#f5f5f5`
- **Gadget Grid Background**: `#f7f9fb`
- **Option Box Background**: `#fff`
- **Selected Background**: `#e7f3ff`
- **Documents Notice**: `#fff3cd`

### Border Colors
- **Default Border**: `#ddd`, `#e6e6e6`
- **Selected Border**: `#0073aa`
- **Success Border**: `#d6e9c6`
- **Error Border**: `#ebccd1`
- **Warning Border**: `#ffc107`

### Text Colors
- **Primary Text**: `#333`
- **Secondary Text**: `#666`, `#5f6b76`
- **Success Text**: `#3c763d`
- **Error Text**: `#a94442`
- **Warning Text**: `#856404`

### Gadget Type Accent Colors
- **Mobile Phone**: `#0073aa`
- **Laptop**: `#6f42c1`
- **Tablet**: `#d63384`
- **VR Headset**: `#20c997`
- **Watch**: `#fd7e14`
- **Games Console**: `#198754`

---

## Typography

### Font Sizes
- **Base**: `16px`
- **Headings (h3)**: `1.25rem` (20px)
- **Large Headings**: `1.4em` (22.4px)
- **Help Text**: `0.9em` (14.4px)
- **Small Text**: `0.9em`
- **Final Premium**: `1.2em` (19.2px)
- **Option Amount**: `1.05rem` (16.8px)
- **Option Sub**: `0.9rem` (14.4px)
- **Gadget Label**: `14px`
- **Button**: `16px`
- **Delete Button**: `0.9em`

### Font Weights
- **Normal**: `400`
- **Medium**: `500`
- **Semi-bold**: `600`
- **Bold**: `700`

### Line Heights
- **Form Elements**: `1.4`
- **Default**: `1.5`
- **Loss Toggle**: `1.1`

---

## Utility Classes

### `.mgu-visually-hidden`
**Hide elements visually while keeping them accessible**

```css
.mgu-visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}
```

**Usage:** Applied to the original `<select>` element for gadget type selection, which remains in the DOM for functionality but is visually hidden in favor of the icon grid.

### `.mgu-promo-box`
**Promotional content box**

```css
.mgu-promo-box {}
```

**Usage:** Applied to the description paragraph at the top of the form. Can be hidden via CSS if needed:
```css
.mgu-promo-box {
    display: none;
}
```

---

## Best Practices Summary

1. **Maintain Accessibility**: Ensure sufficient color contrast and focus states
2. **Test Responsiveness**: Check on various screen sizes (mobile, tablet, desktop)
3. **Preserve Functionality**: Don't modify critical positioning or display properties that affect JavaScript interactions
4. **Use Semantic Classes**: Leverage the existing class structure
5. **Test Loading States**: Ensure loading animations work correctly
6. **Validate Forms**: Maintain form validation styling
7. **Keep CSS Modular**: Override specific classes rather than rewriting entire sections
8. **Document Changes**: Keep track of your customizations
9. **Test After Updates**: Always verify customizations work after plugin updates
10. **Use CSS Variables**: Consider using CSS custom properties for easier theming

---

## Troubleshooting

### Common Issues

1. **Buttons not responding**: Check for `pointer-events: none` in loading states
2. **Form elements misaligned**: Verify `width: 100%` and `box-sizing: border-box`
3. **Loading spinners not showing**: Ensure `position: relative` on parent containers
4. **Mobile layout issues**: Test responsive breakpoints
5. **Select dropdowns appear dark**: Ensure `color-scheme: light` is set
6. **Custom styles not applying**: Check CSS specificity and load order

### Debug Tips

1. Use browser developer tools to inspect elements
2. Check for CSS conflicts with theme styles
3. Verify class names match exactly
4. Test with different content lengths
5. Check browser console for JavaScript errors
6. Verify stylesheet is loading (Network tab)
7. Test in incognito/private mode to rule out caching issues

---

## Support

For additional styling support or custom modifications, refer to the plugin documentation or contact the development team.

---

*Last updated: October 2025*
*Plugin Version: 1.0.2*
