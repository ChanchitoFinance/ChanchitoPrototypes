# Color System

## Design Tokens

All colors are centralized in `styles/design-tokens.ts` for easy modification.

### Primary Colors

```typescript
colors: {
  background: '#FDFDFD',      // Almost-white background
  textPrimary: '#111111',     // Almost-black primary text
  textSecondary: '#6A6A6A',  // Mid gray secondary text
  accent: '#CFF56A',         // Lemon-Lime Soft Neon
  accentAlt: '#66D3FF',      // Sky Blue alternative
  white: '#FFFFFF',
  black: '#000000',
}
```

## Usage Guidelines

### Background
- Use `#FDFDFD` for main page backgrounds
- Use `#FFFFFF` for card backgrounds

### Text
- Use `#111111` for primary text (headings, important content)
- Use `#6A6A6A` for secondary text (descriptions, metadata)

### Accents
- Use `#CFF56A` for primary actions and highlights
- Use `#66D3FF` for secondary actions or alternative highlights
- Accents should never exceed 5-10% of screen space

## Tailwind Configuration

Colors are configured in `tailwind.config.js`:

```javascript
colors: {
  background: '#FDFDFD',
  'text-primary': '#111111',
  'text-secondary': '#6A6A6A',
  accent: '#CFF56A',
  'accent-alt': '#66D3FF',
}
```

## CSS Variables

Also available as CSS variables in `app/globals.css`:

```css
:root {
  --background: #FDFDFD;
  --text-primary: #111111;
  --text-secondary: #6A6A6A;
  --accent: #CFF56A;
  --accent-alt: #66D3FF;
}
```

