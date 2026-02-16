# AiValytics Typography System

## Overview
This document outlines the comprehensive typography system implemented across the entire AiValytics platform, inspired by modern professional interfaces like Prepinsta. The system uses **Inter** as the primary font family for a clean, professional, and highly readable appearance.

## Font Family
- **Primary Font**: Inter (weights: 300, 400, 500, 600, 700, 800, 900)
- **Fallback Stack**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif

## Base Settings
```css
body {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: -0.01em;
}
```

## Typography Classes

### Headings

#### H1 / .text-h1
- **Font Size**: 2.5rem (40px)
- **Font Weight**: 700 (Bold)
- **Line Height**: 1.2
- **Letter Spacing**: -0.02em
- **Usage**: Page titles, hero headings
- **Example**: "Welcome back, Admin"

#### H2 / .text-h2
- **Font Size**: 2rem (32px)
- **Font Weight**: 700 (Bold)
- **Line Height**: 1.3
- **Letter Spacing**: -0.02em
- **Usage**: Section titles
- **Example**: "System Overview"

#### H3 / .text-h3
- **Font Size**: 1.5rem (24px)
- **Font Weight**: 600 (Semi-bold)
- **Line Height**: 1.4
- **Letter Spacing**: -0.01em
- **Usage**: Subsection titles, card titles
- **Example**: "AiValytics"

#### H4 / .text-h4
- **Font Size**: 1.25rem (20px)
- **Font Weight**: 600 (Semi-bold)
- **Line Height**: 1.4
- **Letter Spacing**: -0.01em
- **Usage**: Component headings
- **Example**: "Administrative Tools"

#### H5 / .text-h5
- **Font Size**: 1.125rem (18px)
- **Font Weight**: 600 (Semi-bold)
- **Line Height**: 1.5
- **Letter Spacing**: -0.01em
- **Usage**: Small headings, modal titles
- **Example**: "Malpractice Code"

#### H6 / .text-h6
- **Font Size**: 1rem (16px)
- **Font Weight**: 600 (Semi-bold)
- **Line Height**: 1.5
- **Letter Spacing**: -0.01em
- **Usage**: Smallest headings
- **Example**: "Settings"

### Body Text

#### .text-body (Default)
- **Font Size**: 15px
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.6
- **Letter Spacing**: -0.01em
- **Usage**: Primary body text, descriptions
- **Example**: "Premium proctored assessments simulating official recruitment environments"

#### .text-body-sm
- **Font Size**: 14px
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.5
- **Letter Spacing**: -0.01em
- **Usage**: Secondary body text, smaller descriptions
- **Example**: Alert descriptions, helper text

#### .text-body-lg
- **Font Size**: 16px
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.7
- **Letter Spacing**: -0.01em
- **Usage**: Emphasized body text, introductions
- **Example**: Page introductions

### UI Text

#### .text-ui
- **Font Size**: 14px
- **Font Weight**: 500 (Medium)
- **Line Height**: 1.5
- **Letter Spacing**: -0.005em
- **Usage**: Navigation items, section labels
- **Example**: "Activity Stream", "Schedule"

#### .text-ui-sm
- **Font Size**: 13px
- **Font Weight**: 500 (Medium)
- **Line Height**: 1.4
- **Letter Spacing**: -0.005em
- **Usage**: Small UI elements, badges, labels
- **Example**: "Management Center", navigation text

#### .text-caption
- **Font Size**: 12px
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.4
- **Letter Spacing**: 0
- **Usage**: Captions, metadata, timestamps
- **Example**: "Recruitment Drive", form labels

### Specialized Elements

#### .card-title
- **Font Size**: 18px
- **Font Weight**: 600 (Semi-bold)
- **Line Height**: 1.4
- **Letter Spacing**: -0.01em
- **Usage**: Card headings
- **Example**: Test titles, feature cards

#### .card-description
- **Font Size**: 14px
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.5
- **Letter Spacing**: -0.005em
- **Color**: hsl(var(--muted-foreground))
- **Usage**: Card descriptions
- **Example**: Subtitles under card titles

## Element-Specific Styling

### Buttons
```css
button, .btn {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
}
```

### Inputs & Form Elements
```css
input, textarea, select {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.005em;
}
```

### Labels
```css
label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
}
```

### Navigation Links
```css
nav a, .nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
}
```

## Usage Guidelines

### 1. **Consistency**
Always use the predefined typography classes instead of inline font styling. This ensures consistency across the entire application.

**Good:**
```tsx
<h1 className="text-h1">Welcome</h1>
<p className="text-body">Description text</p>
```

**Bad:**
```tsx
<h1 className="text-4xl font-black">Welcome</h1>
<p className="text-lg font-medium">Description text</p>
```

### 2. **Hierarchy**
Maintain proper heading hierarchy (h1 → h2 → h3, etc.) for accessibility and SEO.

### 3. **Uppercase Text**
For uppercase text, combine typography classes with utility classes:
```tsx
<p className="text-ui-sm uppercase tracking-wider">Label Text</p>
```

### 4. **Color Variations**
Typography classes handle sizing and weight. Use Tailwind color utilities for color:
```tsx
<h2 className="text-h2 text-gray-900">Dark Heading</h2>
<p className="text-body text-gray-500">Muted Text</p>
```

## Common Patterns

### Page Header
```tsx
<div className="space-y-4">
  <p className="text-ui-sm text-primary font-semibold uppercase tracking-wider">
    Section Label
  </p>
  <h1 className="text-h1 text-gray-900 tracking-tight leading-none">
    Page Title
  </h1>
  <p className="text-body text-gray-500">
    Page description text
  </p>
</div>
```

### Card Component
```tsx
<div className="card">
  <h3 className="card-title text-gray-900">Card Title</h3>
  <p className="card-description">Card description text</p>
</div>
```

### Form Label
```tsx
<label className="text-caption text-gray-400 font-semibold uppercase tracking-wide">
  Field Name <span className="text-primary">*</span>
</label>
```

### Navigation Item
```tsx
<a className="text-ui-sm font-medium uppercase tracking-wide">
  Dashboard
</a>
```

## Responsive Considerations

The typography system is designed to work across all screen sizes. For specific responsive needs:

```tsx
<h1 className="text-h2 md:text-h1">
  Responsive Heading
</h1>
```

## Accessibility

- All typography maintains WCAG AA contrast ratios
- Line heights are optimized for readability
- Letter spacing ensures clarity at all sizes
- Semantic HTML elements (h1-h6, p, etc.) are used appropriately

## Notes on CSS Lint Warnings

The following CSS lint warnings can be safely ignored as they are part of the Tailwind CSS v4 syntax:
- `@custom-variant` - Tailwind v4 custom variant syntax
- `@theme` - Tailwind v4 theme configuration
- `@apply` - Tailwind utility application

These are intentional and required for the design system to function properly.
