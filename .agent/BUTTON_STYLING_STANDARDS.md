# AiValytics Button Styling Standards

## Overview
This document defines the standardized button styling system for the AiValytics platform. All buttons should follow these guidelines to ensure visual consistency and professional appearance across the application.

## Standard Button Specifications

### Primary Button (Dark)
**Use Case:** Main call-to-action buttons, primary actions

```tsx
<Button className="h-12 px-8 rounded-none bg-gray-900 hover:bg-black text-white text-ui-sm font-semibold uppercase tracking-wide shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
  Button Text
</Button>
```

**Specifications:**
- Height: `h-12` (48px)
- Padding: `px-8` (horizontal)
- Background: `bg-gray-900` → `hover:bg-black`
- Text Color: `text-white`
- Font Size: `text-ui-sm` (13px)
- Font Weight: `font-semibold` (600)
- Text Transform: `uppercase`
- Letter Spacing: `tracking-wide`
- Shadow: `shadow-lg` → `hover:shadow-xl`
- Hover Effect: `-translate-y-0.5`
- Transition: `duration-300`

### Secondary Button (Outline)
**Use Case:** Secondary actions, alternative options

```tsx
<Button 
  variant="outline"
  className="h-12 px-6 rounded-none border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-900 text-ui-sm font-semibold uppercase tracking-wide shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
>
  Button Text
</Button>
```

**Specifications:**
- Height: `h-12` (48px)
- Padding: `px-6` (horizontal)
- Border: `border border-gray-200` → `hover:border-gray-300`
- Background: `bg-white` → `hover:bg-gray-50`
- Text Color: `text-gray-900`
- Font Size: `text-ui-sm` (13px)
- Font Weight: `font-semibold` (600)
- Text Transform: `uppercase`
- Letter Spacing: `tracking-wide`
- Shadow: `shadow-md` → `hover:shadow-lg`
- Hover Effect: `-translate-y-0.5`
- Transition: `duration-300`

### Accent Button (With Border)
**Use Case:** Special actions, featured buttons

```tsx
<Button className="h-12 px-8 rounded-none bg-gray-900 hover:bg-black text-white text-ui-sm font-semibold uppercase tracking-wide shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl border-b-2 border-primary">
  Button Text
</Button>
```

**Specifications:**
- Same as Primary Button
- Additional: `border-b-2 border-primary` (bottom accent border)

### Icon Button
**Use Case:** Buttons with icons

```tsx
<Button className="h-12 px-6 rounded-none border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-900 text-ui-sm font-semibold uppercase tracking-wide shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2">
  <Icon className="w-4 h-4 text-primary" />
  Button Text
</Button>
```

**Specifications:**
- Same as Secondary Button
- Additional: `flex items-center justify-center gap-2`
- Icon Size: `w-4 h-4`
- Icon Gap: `gap-2`

## Size Variants

### Standard (Default)
- Height: `h-12` (48px)
- Padding: `px-6` to `px-8`

### Compact
- Height: `h-10` (40px)
- Padding: `px-5` to `px-6`
- Font Size: `text-caption` (12px)

### Large
- Height: `h-14` (56px)
- Padding: `px-10` to `px-12`
- Font Size: `text-ui` (14px)

## Color Variants

### Dark (Primary)
- Background: `bg-gray-900` → `hover:bg-black`
- Text: `text-white`

### Light (Secondary)
- Background: `bg-white` → `hover:bg-gray-50`
- Text: `text-gray-900`
- Border: `border border-gray-200` → `hover:border-gray-300`

### Accent (Primary Color)
- Background: `bg-primary` → `hover:bg-primary/90`
- Text: `text-white`

### Destructive
- Background: `bg-red-600` → `hover:bg-red-700`
- Text: `text-white`

## Animation & Transitions

### Standard Hover Effect
```css
transition-all duration-300 hover:-translate-y-0.5
```

### Shadow Progression
- Default: `shadow-md` or `shadow-lg`
- Hover: `hover:shadow-lg` or `hover:shadow-xl`

### Timing
- Duration: `duration-300` (300ms)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (default Tailwind)

## Typography Standards

### Font Family
- All buttons use Inter font (inherited from body)

### Font Sizes
- Small: `text-caption` (12px)
- Standard: `text-ui-sm` (13px)
- Large: `text-ui` (14px)

### Font Weights
- Standard: `font-semibold` (600)
- Emphasis: `font-bold` (700)

### Text Transform
- Always: `uppercase`

### Letter Spacing
- Standard: `tracking-wide`
- Tight: `tracking-normal`
- Wide: `tracking-wider`

## Common Patterns

### Full Width Button
```tsx
<Button className="w-full h-12 ...">
  Button Text
</Button>
```

### Button with Link
```tsx
<Link href="/path" className="flex-1">
  <Button className="w-full h-12 ...">
    Button Text
  </Button>
</Link>
```

### Button Group
```tsx
<div className="flex flex-col sm:flex-row gap-4">
  <Link href="/path1" className="flex-1">
    <Button className="w-full h-12 ...">Button 1</Button>
  </Link>
  <Link href="/path2" className="flex-1">
    <Button className="w-full h-12 ...">Button 2</Button>
  </Link>
</div>
```

## Accessibility

### Focus States
- All buttons inherit focus styles from the Button component
- Focus ring: `focus-visible:ring-2 focus-visible:ring-primary`

### Disabled States
- Opacity: `disabled:opacity-50`
- Pointer Events: `disabled:pointer-events-none`

## Best Practices

1. **Consistency**: Always use the standardized classes
2. **Spacing**: Maintain consistent gaps between buttons (typically `gap-4`)
3. **Alignment**: Use flexbox for proper button alignment
4. **Icons**: Keep icon sizes consistent (`w-4 h-4` for standard buttons)
5. **Text**: Keep button text concise and action-oriented
6. **Contrast**: Ensure sufficient color contrast for accessibility

## Examples by Context

### Resume Simulator Page
```tsx
// Primary action
<Button className="w-full h-12 rounded-none bg-gray-900 text-white text-ui font-semibold uppercase tracking-wide shadow-lg hover:bg-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl border-b-2 border-primary">
  Initialize Builder
</Button>

// Secondary action with icon
<Button variant="outline" className="w-full h-12 rounded-none border border-gray-200 bg-white text-gray-900 text-ui font-semibold uppercase tracking-wide shadow-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2">
  <Upload className="w-4 h-4 text-primary" />
  Import Registry
</Button>
```

### Mock Tests Page
```tsx
// Test card button
<Button className="w-full h-12 rounded-none text-ui font-semibold uppercase tracking-wide shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white">
  <span>Initialize Start</span>
  <ArrowRight className="w-4 h-4" />
</Button>
```

### Dashboard Page
```tsx
// Header action button
<Button className="h-12 px-8 rounded-none bg-gray-900 hover:bg-black text-white text-ui-sm font-semibold uppercase tracking-wide shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
  New Assessment
</Button>

// Settings button
<Button variant="outline" className="h-12 px-6 rounded-none border border-gray-200 bg-white hover:bg-slate-50 hover:border-gray-300 text-gray-400 text-ui-sm font-semibold uppercase tracking-wide shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
  <Settings2 className="w-4 h-4 mr-2" />
  Interface
</Button>
```

## Migration Guide

When updating existing buttons:

1. **Height**: Change to `h-12` (standard) or `h-10` (compact) or `h-14` (large)
2. **Typography**: Use `text-ui-sm` or `text-ui` with `font-semibold`
3. **Spacing**: Use `tracking-wide` for letter spacing
4. **Shadows**: Use `shadow-lg` with `hover:shadow-xl`
5. **Transitions**: Add `transition-all duration-300`
6. **Hover**: Use `hover:-translate-y-0.5` for subtle lift effect
7. **Borders**: For outline buttons, use `border border-gray-200` with `hover:border-gray-300`

## Notes

- All buttons use `rounded-none` for sharp, modern edges
- The `border-b-2 border-primary` accent is optional for emphasis
- Icon spacing should be `gap-2` for standard buttons
- Always include proper hover states for better UX
- Maintain consistent shadow progression for depth perception
