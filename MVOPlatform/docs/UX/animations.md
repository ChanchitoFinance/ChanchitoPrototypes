# Animation System

## Principles

- **Micro-animations**: Subtle, purposeful motion
- **Bounceless transitions**: Smooth, professional feel
- **Emotional reward**: Animations enhance user experience without distracting

## Framer Motion

The project uses `framer-motion` for animations.

## Common Animations

### Fade In on Scroll

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

### Card Hover

```tsx
<motion.article
  whileHover={{ y: -2 }}
  className="transition-all duration-250"
>
  {/* Card content */}
</motion.article>
```

### Button Click

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Button content */}
</motion.button>
```

### Vote Animation

```tsx
<motion.div
  animate={voted ? { scale: [1, 1.2, 1] } : {}}
  transition={{ duration: 0.3 }}
>
  {/* Vote icon */}
</motion.div>
```

### Progress Bar

```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${score}%` }}
  transition={{ duration: 1, delay: index * 0.1 }}
  className="h-full bg-accent"
/>
```

## Transition Durations

Defined in `styles/design-tokens.ts`:

```typescript
transitions: {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
}
```

## Animation Guidelines

1. **Keep it subtle**: Animations should enhance, not distract
2. **Use consistent timing**: Stick to defined durations
3. **Stagger animations**: Use delays for sequential reveals
4. **Respect user preferences**: Consider `prefers-reduced-motion`

## Examples

### Staggered List Items

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
  >
    {/* Item content */}
  </motion.div>
))}
```

### Accordion/Collapse

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

