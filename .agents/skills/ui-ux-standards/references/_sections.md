# UI/UX Standards Sections Index

## Priority 1 — CRITICAL

### Design Tokens (tokens-*)
| Rule | File | Summary |
|------|------|---------|
| No hardcoded colors | `design-tokens.md` | Use CSS variables + brand scale tokens |
| Typography system | `design-tokens.md` | Use `text-ht-*` classes |
| Spacing tokens | `design-tokens.md` | Use predefined spacing values |

### Accessibility (a11y-*)
| Rule | File | Summary |
|------|------|---------|
| Keyboard navigation | `accessibility.md` | Tab order, focus-visible, Escape |
| ARIA attributes | `accessibility.md` | Labels, roles, live regions |
| Color contrast | `accessibility.md` | WCAG 2.1 AA minimum 4.5:1 |
| Form accessibility | `accessibility.md` | Label association, error announcement |

## Priority 2 — HIGH

### Component Architecture (component-*)
| Rule | File | Summary |
|------|------|---------|
| shadcn/ui pattern | `component-architecture.md` | `data-slot`, CVA, cn() |
| Composition | `component-architecture.md` | Compose primitives, avoid monolithic |
| Icon usage | `component-architecture.md` | lucide-react only, aria-label on standalone |

### State Management (state-*)
| Rule | File | Summary |
|------|------|---------|
| Loading states | `states.md` | loading.tsx, Skeleton, Spinner |
| Empty states | `states.md` | List/search empty with CTA |
| Error states | `states.md` | error.tsx, inline error with retry |
| Edge cases | `states.md` | Truncation, overflow, null safety |

### Forms & Validation (forms-*)
| Rule | File | Summary |
|------|------|---------|
| Form architecture | `forms.md` | RHF + Zod + Field composition |
| Server actions | `forms.md` | Server-side Zod validation |
| Error handling | `forms.md` | Inline + toast + re-throw redirects |

## Priority 3 — MEDIUM

### Layout & Responsive (layout-*)
| Rule | File | Summary |
|------|------|---------|
| Route group layout | `layouts.md` | (public), (auth), (protected) |
| Sidebar layout | `layouts.md` | SidebarLayout with collapsible |
| Responsive patterns | `layouts.md` | Mobile-first, container queries |

### Typography (type-*)
| Rule | File | Summary |
|------|------|---------|
| Font families | `design-tokens.md` | Manrope (display), Inter (body) |
| Type scale | `design-tokens.md` | ht-display through ht-caption |

### Animation (motion-*)
| Rule | File | Summary |
|------|------|---------|
| CSS animations in globals.css | `component-architecture.md` | No inline `<style>` tags |
| Reduced motion | `accessibility.md` | `motion-safe:` / `motion-reduce:` |

## Priority 4 — LOW

### File Organization (files-*)
| Rule | File | Summary |
|------|------|---------|
| Component files | `component-architecture.md` | kebab-case.tsx |
| Barrel exports | — | index.ts for multi-component directories |
| Schema co-location | `forms.md` | src/schemas/ directory |
