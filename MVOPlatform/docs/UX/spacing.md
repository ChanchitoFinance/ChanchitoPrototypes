# Spacing System

## Design Tokens

Spacing values are centralized in `styles/design-tokens.ts`:

```typescript
spacing: {
  xs: '4px',   // Tight spacing
  sm: '8px',   // Small spacing
  md: '16px',  // Medium spacing
  lg: '24px',  // Large spacing (card padding)
  xl: '32px',  // Extra large spacing
  '2xl': '48px', // Section padding
  '3xl': '64px', // Large section padding
  '4xl': '96px', // Hero section padding
}
```

## Card Spacing

### Internal Padding
- **Card padding**: 24px (lg)
- **Section padding**: 48px (2xl)

### External Spacing
- **Card gap**: 24px (lg) vertical
- **Section margin**: 48px (2xl) top/bottom

## Usage Guidelines

### Cards
- Use `p-6` (24px) for card padding
- Use `gap-6` (24px) for card content spacing
- Use `mb-6` (24px) for card bottom margin

### Sections
- Use `py-12` (48px) for section vertical padding
- Use `mb-12` (48px) for section bottom margin

### Components
- Use `gap-4` (16px) for button groups
- Use `gap-2` (8px) for tight element groups
- Use `gap-8` (32px) for loose element groups

## Tailwind Classes

All spacing uses Tailwind's spacing scale:
- `p-{size}`: Padding
- `m-{size}`: Margin
- `gap-{size}`: Gap (flexbox/grid)
- `space-y-{size}`: Vertical spacing (children)

## Examples

### Card Component
```tsx
<div className="p-6 space-y-4">
  {/* Card content */}
</div>
```

### Section Layout
```tsx
<section className="py-12 space-y-8">
  {/* Section content */}
</section>
```

### Button Group
```tsx
<div className="flex gap-4">
  <Button>Primary</Button>
  <Button variant="outline">Secondary</Button>
</div>
```

