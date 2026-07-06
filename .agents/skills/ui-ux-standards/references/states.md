# State Management (Loading, Empty, Error, Edge Cases)

## Why It Matters

Users must never see a blank page, unhandled error, or broken state. Every data-fetching component must handle loading, empty, error, and success states explicitly.

## Required Files per Route Group

Every route group must have these files:
```
src/app/(group)/
├── page.tsx
├── loading.tsx    ← loading skeleton
├── error.tsx      ← error boundary (client component)
└── layout.tsx
```

Root level (already created):
- `src/app/loading.tsx` — Full-page spinner
- `src/app/error.tsx` — Global error boundary with retry
- `src/app/not-found.tsx` — Custom 404 page

## Loading States

### Page-level loading
```tsx
// app/example/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
```

### Inline loading
```tsx
// For client components with data fetching
const { data, isLoading } = useQuery(...)

if (isLoading) return <Spinner />
```

### Button loading
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? <Spinner className="mr-2" /> : null}
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

### Suspense boundaries
```tsx
// For async server components
<Suspense fallback={<Skeleton className="h-40" />}>
  <AsyncComponent />
</Suspense>
```

## Empty States

### Table/list empty state
```tsx
{data.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <InboxIcon className="size-12 text-muted-foreground/50" />
    <h3 className="mt-4 text-sm font-semibold">No applications yet</h3>
    <p className="mt-1 text-sm text-muted-foreground">
      Get started by creating a new application.
    </p>
    <Button className="mt-4" onClick={...}>
      New Application
    </Button>
  </div>
)}
```

### Search empty state
```tsx
{results.length === 0 && (
  <p className="py-8 text-center text-sm text-muted-foreground">
    No results found for "{query}".
  </p>
)}
```

## Error States

### Page-level error (error.tsx)
```tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
        Try again
      </button>
    </div>
  )
}
```

### Inline error
```tsx
if (error) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
      <p className="font-medium">Failed to load data</p>
      <p className="mt-1">{error.message}</p>
      <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
        Retry
      </Button>
    </div>
  )
}
```

## Edge Cases

### Truncation
```tsx
// Single line truncation
<p className="truncate max-w-[200px]">{longText}</p>

// Multi-line truncation
<p className="line-clamp-2">{longText}</p>
```

### Overflow
```tsx
// Table container
<div className="overflow-x-auto">

// Long content
<div className="break-words">
```

### Missing data
```tsx
// Null-safe rendering
{user?.name ?? 'Unknown User'}
{items?.length ?? 0} items
```

### Long lists
```tsx
// Virtualization hint for large lists
// Use pagination component for >50 items
<Pagination totalPages={total} currentPage={page} onPageChange={setPage} />
```

## Common Mistakes

1. No `loading.tsx` — page appears blank during data fetch
2. No `error.tsx` — unhandled errors show Next.js default error screen
3. Missing empty state for lists/tables
4. Not handling null/undefined with `??` fallback
5. Not wrapping `<Spinner>` with `role="status"` and `aria-label`
6. Using `<Skeleton>` for non-loading decorative purposes
