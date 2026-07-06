# Accessibility Standards

## Why It Matters

Accessibility is not optional. All UI must meet WCAG 2.1 AA standards. The project uses Radix UI primitives which provide built-in ARIA attributes, but custom components must implement accessibility correctly.

## Keyboard Navigation

### Focus Management
```tsx
// All interactive elements must be reachable via Tab
<button>, <a>, <input>, <select>, <textarea>  ← natively focusable

// Custom interactive elements need tabIndex
<div role="button" tabIndex={0} onKeyDown={...} onClick={...}>
```

### Focus Ring
- Use `focus-visible:` not `focus:` for focus styles
- shadcn/ui components have `focus-visible:ring-3 focus-visible:border-ring` built in
- Never use `outline-none` without a focus-visible replacement

```tsx
// OK - shadcn/ui handles this
<Button variant="ghost">

// Custom element needs explicit focus-visible
<div
  className="focus-visible:ring-3 focus-visible:ring-ring/50 rounded-md"
  tabIndex={0}
  role="button"
>
```

### Escape to Close
```tsx
useEffect(() => {
  if (!isOpen) return
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [isOpen])
```

### Focus Trap
Modals and dialogs must trap focus:
```tsx
// Radix Dialog handles this automatically
<Dialog>
// For custom implementations, implement manual focus trapping
```

## ARIA Attributes

### Landmarks
```tsx
<header role="banner">     // or <header>
<nav role="navigation">    // or <nav>
<main role="main">          // or <main>
<footer role="contentinfo"> // or <footer>
```

### Icon Buttons
```tsx
// Icon-only button - MUST have aria-label
<Button variant="ghost" size="icon" aria-label="Notifications">
  <Bell className="size-[18px]" />
</Button>

// Decorative icon - MUST have aria-hidden
<Bell className="size-[18px]" aria-hidden="true" />
```

### Status and Alerts
```tsx
// Live region for dynamic updates
<div role="status" aria-live="polite">
  {items.length} items loaded
</div>

// Error messages
<div role="alert" data-slot="field-error">
  Email is required
</div>

// Loading
<Spinner role="status" aria-label="Loading" />
```

### Dialog/Modal
```tsx
<div role="dialog" aria-modal="true" aria-label="Confirm delete">
```

## Forms

### Label Association
```tsx
// Option 1: htmlFor
<FieldLabel htmlFor="email">Email</FieldLabel>
<Input id="email" {...register('email')} />

// Option 2: aria-label (when no visible label)
<Input aria-label="Search" {...register('search')} />
```

### Error Announcement
```tsx
// Errors must be associated with the input
<Input
  id="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
  {...register('email')}
/>
{errors.email && (
  <FieldDescription id="email-error" className="text-destructive">
    {errors.email.message}
  </FieldDescription>
)}
```

## Color and Contrast

- All text must have a contrast ratio of at least 4.5:1 against its background
- The design token system in globals.css has been calibrated for this
- When using `brand-primary-500` (#A6192E) on white, check contrast (passes at 16px+)
- For small text (<18px), use darker shades (`brand-primary-700`, `brand-primary-800`)

## Screen Reader Only Content

```tsx
// Content visible only to screen readers
<span className="sr-only">Close menu</span>

// Icon button with text for screen readers
<Button aria-label="Close">
  <X className="size-4" />
  <span className="sr-only">Close</span>
</Button>
```

## Reduced Motion

```tsx
// Respect user preferences
className="motion-safe:animate-spin"   // only animate if user allows
className="motion-reduce:transition-none"
```

## Common Mistakes

1. Icon buttons without `aria-label`
2. Missing `role="alert"` on error messages
3. Using `focus:` instead of `focus-visible:` for keyboard-only focus rings
4. Missing keyboard handler for custom interactive elements (onKeyDown for Enter/Space)
5. Not associating error messages with inputs via `aria-describedby`
6. Decorative images without `alt=""` (empty alt)
7. Missing `aria-modal="true"` on custom dialogs
8. Not implementing Escape key handling for modals/popovers
