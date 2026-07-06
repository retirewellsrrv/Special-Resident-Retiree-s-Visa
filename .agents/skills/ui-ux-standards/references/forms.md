# Forms & Validation

## Why It Matters

Forms are the primary user interaction pattern in this application (registration, login, applications, document uploads). Consistent form patterns reduce bugs and improve UX.

## Form Architecture

Every form must use:
- **react-hook-form** for form state management
- **@hookform/resolvers/zod** for schema validation
- **Zod schemas** in `src/schemas/` for all validation logic
- **`<Field>` component composition** from `@/components/ui/field`

## Pattern

### Schema (src/schemas/)
```ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
```

### Server Action (src/actions/)
```ts
'use server'
import { loginSchema, type LoginInput } from '@/schemas/auth'

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }
  // ... proceed with parsed.data
}
```

### Form Component
```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/schemas/auth'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldDescription, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    const result = await loginAction(data)
    if (!result.success) {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <FieldDescription className="text-destructive">
              {errors.email.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
```

## Field Component Composition

Use the `<Field>` system for consistent form layout:

```
<Field orientation="vertical">   // default, use for most forms
<Field orientation="horizontal"> // label + input side by side
<Field orientation="responsive"> // vertical on mobile, horizontal on desktop
```

Available field components:
- `<Field>` — wraps a single form control
- `<FieldLabel>` — label with `htmlFor`
- `<FieldContent>` — groups input + description + error
- `<FieldDescription>` — helper text or error message
- `<FieldError>` — error display with dedup
- `<FieldGroup>` — groups multiple fields
- `<FieldSet>` / `<FieldLegend>` — for checkbox/radio groups
- `<FieldSeparator>` — visual divider with optional label

## Client-Side Validation

- Use `noValidate` on `<form>` to let Zod handle validation
- Always show inline errors beneath the relevant field
- Show server errors (from server actions) via toast or field-level error
- Disable submit button during submission: `disabled={isSubmitting}`

## Error Handling

```tsx
async function onSubmit(data: FormData) {
  try {
    setServerError(null)
    const result = await serverAction(data)
    if (!result.success) {
      if (result.error === 'SPECIFIC_CASE') {
        // handle specific error
        return
      }
      setServerError(result.error)
    }
  } catch (error) {
    // Redirect errors from next/navigation must be re-thrown
    if (isRedirectError(error)) throw error
    setServerError('Something went wrong.')
  }
}
```

## Common Mistakes

1. Not wrapping `<form>` with `handleSubmit(onSubmit)`
2. Forgetting `noValidate` on the form element
3. Missing Zod schema co-location in `src/schemas/`
4. Not disabling submit button during submission
5. Catching redirect errors instead of re-throwing them
6. Not using `<Field>` component composition
7. Show server error only in toast, missing inline field-level errors
