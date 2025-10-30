# MGU API Integration Plugin - Styling Guide

## Overview

This guide provides comprehensive documentation for customizing the appearance of the MGU API Integration plugin. The plugin uses a modular CSS class system that allows for extensive customization while maintaining functionality.

## Table of Contents

1. [Core Container Classes](#core-container-classes)
2. [Step Components](#step-components)
3. [Form Elements](#form-elements)
4. [Button Styles](#button-styles)
5. [Quote Display Components](#quote-display-components)
6. [Loading States](#loading-states)
7. [Error and Success Messages](#error-and-success-messages)
8. [Premium Display Components](#premium-display-components)
9. [Responsive Design](#responsive-design)
10. [Customization Examples](#customization-examples)
11. [Color Scheme Reference](#color-scheme-reference)
12. [Typography](#typography)

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
}
```

**Customization Options:**
- `max-width`: Control overall width
- `margin`: Center alignment and spacing
- `background`: Container background color
- `border-radius`: Corner rounding
- `box-shadow`: Drop shadow effect
- `font-size`: Base font size for the plugin

### `.mgu-api-steps`
**Container for all step elements**

```css
.mgu-api-steps {
    /* No specific styles - inherits from parent */
}
```

---

## Step Components

### `.mgu-api-step`
**Individual step container**

```css
.mgu-api-step {
    margin-bottom: 2em;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
    position: relative;
}
```

**Customization Options:**
- `margin-bottom`: Spacing between steps
- `padding`: Internal spacing
- `border`: Step border styling
- `border-radius`: Corner rounding
- `background`: Step background color

### `.mgu-api-step h3`
**Step headings**

```css
.mgu-api-step h3 {
    margin-top: 0;
    color: #333;
    font-size: 1.4em;
    margin-bottom: 1em;
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
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 40px;
}
```

**Customization Options:**
- `padding`: Internal spacing
- `border`: Border styling
- `border-radius`: Corner rounding
- `background-color`: Background color
- `background-image`: Custom dropdown arrow
- `font-size`: Text size

### `.mgu-api-input`
**Text input fields**

```css
.mgu-api-form input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}
```

### `.mgu-api-radio-group`
**Radio button container**

```css
.mgu-api-radio-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
```

### `.mgu-api-radio-option`
**Individual radio button option**

```css
.mgu-api-radio-option {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.mgu-api-radio-option:hover {
    background-color: #f5f5f5;
}

.mgu-api-radio-option.selected {
    border-color: #0073aa;
    background-color: #e6f3ff;
    box-shadow: 0 0 5px rgba(0, 115, 170, 0.3);
}
```

**Customization Options:**
- `padding`: Internal spacing
- `border`: Border styling
- `border-radius`: Corner rounding
- `background-color`: Background color
- `transition`: Hover effects
- `box-shadow`: Selected state shadow

### `.mgu-api-help-text`
**Helper text for form fields**

```css
.mgu-api-help-text {
    font-size: 0.9em;
    color: #666;
    margin-top: 5px;
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
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.3s ease;
}

.mgu-api-button:hover {
    background: #005177;
}

.mgu-api-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
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
    background: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
}

.mgu-api-button-secondary:hover {
    background: #e0e0e0;
}
```

### Button States

#### `.mgu-api-button.loading`
**Loading state for buttons**

```css
.mgu-api-button.loading {
    position: relative;
    color: transparent;
}

.mgu-api-button.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border: 3px solid #fff;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: mgu-spin 1s linear infinite;
}
```

---

## Quote Display Components

### `.mgu-api-quote-details`
**Quote information container**

```css
.mgu-api-quote-details {
    margin: 1em 0;
    padding: 15px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.mgu-api-quote-details h4 {
    margin-top: 0;
    color: #333;
}

.mgu-api-quote-details p {
    margin: 0.5em 0;
    color: #666;
}
```

### `.mgu-api-quote-options`
**Container for quote options**

```css
.mgu-api-quote-options {
    margin: 1em 0;
}
```

### `.mgu-api-quote-option`
**Individual quote option**

```css
.mgu-api-quote-option {
    margin-bottom: 1.5em;
    padding: 1.5em;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
}

.mgu-api-quote-option.selected {
    border-color: #0073aa;
    box-shadow: 0 0 5px rgba(0, 115, 170, 0.3);
}
```

---

## Premium Display Components

### `.mgu-api-premium-breakdown`
**Premium calculation display**

```css
.mgu-api-premium-breakdown {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    margin: 15px 0;
}
```

### `.mgu-api-gadget-list`
**List of gadgets in quote**

```css
.mgu-api-gadget-list {
    margin: 10px 0;
}
```

### `.mgu-api-gadget-item`
**Individual gadget display**

```css
.mgu-api-gadget-item {
    border: 1px solid #ddd;
    padding: 10px;
    margin: 5px 0;
    border-radius: 3px;
    background: white;
}
```

### `.mgu-api-total-premium`
**Total premium display**

```css
.mgu-api-total-premium {
    border-top: 2px solid #ddd;
    padding-top: 10px;
    margin-top: 10px;
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

### `.mgu-api-loading-text`
**Loading text indicator**

```css
.mgu-api-loading-text {
    display: inline-block;
    color: #0073aa;
    font-size: 14px;
    margin-left: 5px;
    font-style: italic;
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

### Mobile Optimization

```css
@media (max-width: 768px) {
    .mgu-api-insurance-flow {
        margin: 1em;
        padding: 15px;
    }
    
    .mgu-api-step {
        padding: 15px;
    }
    
    .mgu-api-button {
        width: 100%;
        margin-bottom: 10px;
    }
    
    .mgu-api-radio-group {
        flex-direction: column;
    }
}
```

### Tablet Optimization

```css
@media (min-width: 769px) and (max-width: 1024px) {
    .mgu-api-insurance-flow {
        max-width: 90%;
    }
}
```

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
}

.mgu-api-button {
    background: #e74c3c;
}

.mgu-api-button:hover {
    background: #c0392b;
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
}

.mgu-api-button {
    border-radius: 0;
    font-weight: normal;
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
- **Success Green**: `#3c763d`
- **Error Red**: `#a94442`

### Background Colors
- **Main Background**: `#fff`
- **Step Background**: `#fff`
- **Quote Details**: `#f9f9f9`
- **Premium Breakdown**: `#f5f5f5`

### Border Colors
- **Default Border**: `#ddd`
- **Selected Border**: `#0073aa`
- **Success Border**: `#d6e9c6`
- **Error Border**: `#ebccd1`

### Text Colors
- **Primary Text**: `#333`
- **Secondary Text**: `#666`
- **Success Text**: `#3c763d`
- **Error Text**: `#a94442`

---

## Typography

### Font Sizes
- **Base**: `16px`
- **Headings**: `1.4em`
- **Help Text**: `0.9em`
- **Loading Text**: `14px`

### Font Weights
- **Normal**: `400`
- **Medium**: `500`
- **Bold**: `700`

### Line Heights
- **Form Elements**: `1.4`
- **Default**: `1.5`

---

## Advanced Customization

### Custom CSS Variables

You can use CSS custom properties for easier theming:

```css
:root {
    --mgu-primary-color: #0073aa;
    --mgu-primary-hover: #005177;
    --mgu-success-color: #3c763d;
    --mgu-error-color: #a94442;
    --mgu-border-color: #ddd;
    --mgu-background: #fff;
    --mgu-text-color: #333;
    --mgu-border-radius: 4px;
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

### Component-Specific Overrides

```css
/* Override specific components */
#step-quote .mgu-api-premium-breakdown {
    background: #e8f5e8;
    border: 2px solid #4caf50;
}

#step-policy .mgu-api-button {
    background: #ff9800;
    font-size: 18px;
    padding: 15px 30px;
}
```

---

## Best Practices

1. **Maintain Accessibility**: Ensure sufficient color contrast and focus states
2. **Test Responsiveness**: Check on various screen sizes
3. **Preserve Functionality**: Don't modify critical positioning or display properties
4. **Use Semantic Classes**: Leverage the existing class structure
5. **Test Loading States**: Ensure loading animations work correctly
6. **Validate Forms**: Maintain form validation styling

---

## Troubleshooting

### Common Issues

1. **Buttons not responding**: Check for `pointer-events: none` in loading states
2. **Form elements misaligned**: Verify `width: 100%` and `box-sizing: border-box`
3. **Loading spinners not showing**: Ensure `position: relative` on parent containers
4. **Mobile layout issues**: Test responsive breakpoints

### Debug Tips

1. Use browser developer tools to inspect elements
2. Check for CSS conflicts with theme styles
3. Verify class names match exactly
4. Test with different content lengths

---

## Support

For additional styling support or custom modifications, refer to the plugin documentation or contact the development team.

---

*Last updated: [Current Date]*
*Plugin Version: 1.0.0*
