# Typography System

## Font Family

**Primary Font**: Inter
- System fallback: `system-ui, sans-serif`
- Google Fonts import in `app/globals.css`

## Font Weights

- **400 (normal)**: Body text, descriptions
- **500 (medium)**: Labels, buttons, emphasis
- **600 (semibold)**: Headings, important text

## Font Sizes

Defined in `styles/design-tokens.ts`:

```typescript
fontSize: {
  xs: '12px',   // Small labels, captions
  sm: '14px',   // Secondary text
  base: '16px', // Body text (default)
  lg: '18px',   // Large body text
  xl: '20px',   // Small headings
  '2xl': '24px', // Section headings
  '3xl': '30px', // Page headings
  '4xl': '36px', // Hero headings
  '5xl': '48px', // Large hero headings
}
```

## Line Heights

- **tight (1.2)**: Headings
- **normal (1.5)**: Body text
- **relaxed (1.75)**: Long-form content

## Usage Rules

### Per Card
- Maximum 2 font sizes per card
- Use size hierarchy: larger for title, smaller for description

### Headings
- Use semibold (600) weight
- Use tight line height (1.2)

### Body Text
- Use normal (400) weight
- Use normal line height (1.5)
- Use base (16px) or lg (18px) size

### Secondary Text
- Use normal (400) weight
- Use secondary color (#6A6A6A)
- Use sm (14px) or base (16px) size

## Examples

### Card Title
```tsx
<h2 className="text-xl font-semibold text-text-primary">
  Idea Title
</h2>
```

### Card Description
```tsx
<p className="text-base text-text-secondary leading-relaxed">
  Description text
</p>
```

### Score Display
```tsx
<div className="text-3xl font-semibold text-accent">
  78
</div>
```

