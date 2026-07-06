---
name: ui-ux-standards
description: UI/UX standards, component architecture, design tokens, form patterns, layout conventions, accessibility, and state management guidelines for the SRRV Next.js application. Use this skill when building new UI components, reviewing frontend code, designing forms, or ensuring accessibility compliance.
license: MIT
metadata:
  author: SRRV Team
  version: "1.0.0"
  organization: SRRV
  date: July 2026
  abstract: Comprehensive UI/UX standards guide for the SRRV Next.js application with shadcn/ui, Tailwind CSS, and Radix primitives. Covers design token usage, component architecture with CVA variants, form patterns with React Hook Form + Zod, responsive layout conventions, state management (loading/empty/error/edge case patterns), and WCAG accessibility compliance.
---

# UI/UX Standards

Design system and component standards for the SRRV Next.js application. Built on shadcn/ui (`radix-nova` style), Tailwind CSS, Radix UI primitives, and the project's custom design token system.

## When to Apply

Reference these guidelines when:
- Building new UI components or pages
- Reviewing frontend code for consistency
- Implementing forms with validation
- Designing responsive layouts
- Ensuring accessibility compliance
- Handling loading, empty, error, and edge case states
- Applying design tokens (colors, typography, spacing)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Design Tokens | CRITICAL | `tokens-` |
| 2 | Accessibility | CRITICAL | `a11y-` |
| 3 | Component Architecture | HIGH | `component-` |
| 4 | State Management | HIGH | `state-` |
| 5 | Forms & Validation | HIGH | `forms-` |
| 6 | Layout & Responsive | MEDIUM-HIGH | `layout-` |
| 7 | Typography | MEDIUM | `type-` |
| 8 | Animation & Interaction | MEDIUM | `motion-` |
| 9 | File Organization | LOW | `files-` |

## How to Use

Read individual rule files for detailed explanations and examples:

```
references/design-tokens.md
references/component-architecture.md
references/forms.md
references/layouts.md
references/states.md
references/accessibility.md
references/_sections.md
```

Each rule file contains:
- Why it matters
- Incorrect example with explanation
- Correct example with explanation
- Project-specific notes and references

## Quick Reference

- **Design tokens**: Use CSS variables (`bg-primary`, `text-muted-foreground`) NEVER hardcoded hex
- **Components**: shadcn/ui `data-slot` + CVA variants pattern
- **Forms**: React Hook Form + Zod + `<Field>` component composition
- **Layouts**: `<SidebarLayout>` for protected routes, responsive containers
- **States**: `<Skeleton>` for loading, `<Spinner>` for actions, error boundaries per route
- **A11y**: aria-labels on icon buttons, `role` attributes, keyboard navigation, focus-visible
- **Styling**: `cn()` utility, Tailwind arbitrary values only as last resort

## References

- https://ui.shadcn.com/docs
- https://www.radix-ui.com/primitives
- https://tailwindcss.com/docs
- https://react-hook-form.com
- https://zod.dev
- https://www.w3.org/WAI/standards-guidelines/wcag/
