# Layout & Responsive Patterns

## Why It Matters

Consistent layout structure improves maintainability and ensures pages work across devices. The project uses route groups for layout separation and responsive container patterns.

## Route Group Layout Architecture

```
src/app/
├── (public)/      → Public marketing pages (navbar + footer)
├── (auth)/        → Login, register (centered card + background)
└── (protected)/   → Authenticated pages (sidebar layout per role)
    ├── applicant/
    ├── admin/
    └── super-admin/
```

### Public Layout
Server component that passes session to navbar:
```tsx
export default async function PublicLayout({ children }) {
  const user = await getSession()
  return (
    <>
      <Navbar user={user} />
      {children}
      <Footer />
    </>
  )
}
```

### Auth Layout
Centered card layout with background image:
```tsx
export default function AuthLayout({ children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8 bg-[#1a2e1f]">
      <Image src={bgImage} alt="" fill priority className="fixed inset-0 -z-10 object-cover" />
      <div className="fixed inset-0 -z-10 bg-[#0b1c30]/45" />
      {children}
    </main>
  )
}
```

### Protected Layout
Server component with auth guard:
```tsx
export default async function ProtectedLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <>{children}</>
}
```

## Protected Route Layouts (Sidebar)

Each role layout uses `<SidebarLayout>`:
```tsx
export default function ApplicantLayout({ children }) {
  return (
    <SidebarLayout
      navItems={applicantNavItems}
      title="Applicant"
      ctaLabel="New Application"
    >
      {children}
    </SidebarLayout>
  )
}
```

## Responsive Containers

```tsx
// Page-level container
<div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">

// Section spacing
<section className="py-16 lg:py-24">

// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ht-gutter">
```

## Mobile-First Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| default | < 768px | Mobile styles |
| `sm` | ≥ 640px | Large phones |
| `md` | ≥ 768px | Tablets |
| `lg` | ≥ 1024px | Desktop |
| `xl` | ≥ 1280px | Wide desktop |

## Container Queries

Use `@container` queries for reusable components that may appear in various width containers:
```
@md/field-group:flex-row        // container query at md breakpoint
group-data-[size=sm]/card:px-3  // scoped to card size variant
```

## Responsive Patterns

1. **Stack on mobile, row on desktop**: `flex flex-col md:flex-row`
2. **Hidden navigation**: `hidden md:flex` for desktop nav, `md:hidden` for mobile hamburger
3. **Full-width on mobile, contained on desktop**: `px-4 md:px-8 lg:max-w-ht-content mx-auto`
4. **Sticky headers**: `sticky top-0 z-50`
5. **Sidebar collapsible**: use `<Sidebar collapsible="icon">` with `group-data-[collapsible=icon]:hidden`

## Common Mistakes

1. Not wrapping protected routes in `(protected)` route group
2. Using `'use client'` on layouts when server component suffices
3. Missing responsive padding on page containers
4. Hardcoding widths that overflow on mobile (`w-[360px]` without `max-w-[calc(100vw-40px)]`)
5. Not adding `<SidebarRail />` for collapse affordance
6. Missing `loading.tsx` per route segment
