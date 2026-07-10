# Design Tokens

## Why It Matters

Hardcoded hex colors and inline values break theme consistency, prevent dark mode support, and create maintenance overhead. The project has a comprehensive CSS variable system in `globals.css` and corresponding Tailwind config tokens that must be used exclusively.

## Rule: Never hardcode brand colors

### Incorrect
```tsx
<button className="bg-[#81001C] text-white hover:bg-[#81001C]/80">
<Button className="bg-brand-primary-600 hover:bg-brand-primary-800 text-white">
```

### Correct
```tsx
<Button variant="default">
// or when you need a custom primary surface:
<div className="bg-primary text-primary-foreground">
<div className="bg-brand-primary-600 text-white">
```

## Available Token Categories

### Surface Tokens (from globals.css)
| Token | Usage |
|-------|-------|
| `bg-background` | Page background |
| `bg-card` / `bg-popover` | Elevated surfaces |
| `bg-muted` | Subtle backgrounds (hover, disabled) |
| `bg-accent` | Accent backgrounds |

### Semantic Color Tokens
| Token | Usage |
|-------|-------|
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary/helper text |
| `text-primary` / `bg-primary` | Brand red (#A6192E) |
| `text-destructive` / `bg-destructive` | Error states |
| `border-border` / `border-input` | Borders |

### Brand Scale Tokens (from tailwind.config.ts)
| Token | Value |
|-------|-------|
| `brand-primary-{50..1000}` | SRRV Red scale |
| `brand-secondary-{50..1000}` | Deep Charcoal scale |
| `brand-tertiary-{50..1000}` | Off-white scale |
| `brand-neutral-{50..1000}` | Soft Slate scale |
| `brand-goldAccent-{1,2}` | Gold accents |

### Heritage Trust (ht) Tokens
Full Material 3-style token set with light/dark pairs. Use for components that need fine-grained surface hierarchy:
```
ht-surface, ht-surface-container, ht-surface-container-high
ht-primary, ht-on-primary, ht-primary-container
ht-outline, ht-outline-variant
```

## Typography Tokens

Use the predefined `text-ht-*` classes instead of arbitrary font sizes:

| Class | Usage |
|-------|-------|
| `text-ht-display` | Hero headings (48px/56px) |
| `text-ht-headline-lg` | Section headers (32px) |
| `text-ht-headline-md` | Card titles (24px) |
| `text-ht-body-lg` | Lead body text (18px) |
| `text-ht-body-md` | Default body text (16px) |
| `text-ht-label-md` | Labels, form fields (14px) |
| `text-ht-caption` | Captions, footnotes (12px) |

Font families via CSS variables:
```
font-display  → Manrope (headings)
font-body     → Inter (body text)
```

## Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `px-ht-margin-mobile` | 20px | Page padding on mobile |
| `px-ht-margin-desktop` | 80px | Page padding on desktop |
| `gap-ht-gutter` | 24px | Between sections |
| `gap-ht-section-gap` | 120px | Between major sections |

## Shadow Tokens

| Class | Usage |
|-------|-------|
| `shadow-ht-card` | Card borders (1px outline) |
| `shadow-ht-hover` | Hover elevation |
| `shadow-ht-focus` | Focus ring |
| `shadow-ht-elevated` | Modals, dialogs |

## Common Mistakes

1. Using `bg-[#A6192E]` instead of `bg-primary` or `bg-brand-primary-500`
2. Using `text-[14px]` instead of `text-sm` or `text-ht-label-md`
3. Using `font-bold` on headings instead of `font-display` + `text-ht-headline-*`
4. Using arbitrary `px-4` or `py-3` instead of spacing tokens
5. Missing dark mode: CSS variables auto-switch; hardcoded hex values don't
