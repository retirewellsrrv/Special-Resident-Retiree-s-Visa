# Component Architecture

## Why It Matters

Consistent component patterns reduce bugs, improve maintainability, and ensure the design system scales. The project uses shadcn/ui with the `radix-nova` style, CVA variants, `data-slot` attributes, and composition over configuration.

## shadcn/ui Component Pattern

Every UI component must follow the shadcn/ui pattern:
1. Use `data-slot` attribute for component identification
2. Use `cva()` for variant definitions
3. Accept `className` via `cn()` utility
4. Use Radix UI primitives for interactive behavior
5. Default exports for tree-shaking

### Correct Pattern

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "base styles here data-[size=sm]:text-sm",
  {
    variants: {
      variant: { default: "...", outline: "..." },
      size: { default: "...", sm: "..." },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Card({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      data-size={size}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### Naming Conventions

- Component files: `kebab-case.tsx` (e.g., `status-chip.tsx`, `alert-dialog.tsx`)
- Component functions: `PascalCase`
- Sub-components: grouped in the same file (e.g., `Card`, `CardHeader`, `CardContent`)
- Props interface: co-located or inline with `React.ComponentProps<"div">`

## Composition over Configuration

Avoid monolithic components with 20 props. Compose smaller primitives:

### Incorrect
```tsx
<Card variant="elevated" showHeader={true} headerTitle="..." headerAction={...} footerText="..." />
```

### Correct
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardAction><Button>...</Button></CardAction>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

## Icon Usage

- Use `lucide-react` exclusively (not `react-icons`)
- Use `size-4` (16px) for inline icons, `size-[18px]` for toolbar icons, `size-5` for input icons
- Always add `aria-hidden="true"` or `aria-label` for standalone icon buttons
- Wrap icon-only buttons with `<span className="sr-only">` for screen readers

### Correct
```tsx
// Decorative icon
<Bell className="size-[18px]" aria-hidden="true" />

// Icon button
<Button variant="ghost" size="icon" aria-label="Notifications">
  <Bell className="size-[18px]" />
</Button>
```

## Interactive States

Every interactive element must handle these states:
- `:hover` — visual feedback
- `:focus-visible` — focus ring (never `:focus` alone)
- `:active` — press state (use `active:translate-y-px`)
- `:disabled` — reduced opacity, no pointer events
- `aria-invalid` — error styling for form elements

Use shadcn/ui's built-in variant system rather than custom hover/focus classes:
```tsx
<Button variant="outline">        // has hover/focus/active built in
<Button variant="destructive">    // has error styling built in
```

## Data Attribute Styling

Use data attributes for state-driven styling instead of conditional classes:
```tsx
// Component
<div data-slot="card" data-size={size} data-state={state}>

// CSS/Tailwind
group-data-[collapsible=icon]:hidden
data-[size=sm]:gap-3
data-[state=active]:bg-muted
```

## Common Mistakes

1. Using `any` for component props instead of `React.ComponentProps<"div">`
2. Missing `data-slot` attribute on components
3. Not composing sub-components (card without CardHeader/CardContent)
4. Using `react-icons` instead of `lucide-react`
5. Missing `aria-label` on icon-only buttons
6. Using `focus:` instead of `focus-visible:` for focus rings
