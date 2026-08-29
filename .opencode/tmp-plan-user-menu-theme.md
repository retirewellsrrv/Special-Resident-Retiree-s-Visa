# UserMenu — Theme Alignment Suggestions

Grounded in actual theme usage found in the codebase (not invented styling).

## Established brand voices discovered
1. **Gold-on-charcoal premium panels** — `signup-form.tsx` L114–146: `bg-brand-secondary-500` + `text-brand-goldAccent-1`. Only place this exists; most distinctive brand moment.
2. **SRRV red for failure/destructive semantics** — `status-chip.tsx`: rejected/cancelled/failed use `brand-primary-100/800`, NOT generic red.
3. **Type system** — Manrope (`font-display`) for headings/display, Inter for body.

## Suggestion set

### 1. Charcoal + gold profile card header (signature)
- Menu header block: `bg-brand-secondary-500` charcoal, name `text-brand-goldAccent-1 font-display`, role `text-brand-goldAccent-2`
- Avatar: larger size-10, fallback echoing signup's gold badge treatment
- Full-bleed via negative margins; hairline bottom border

### 2. Brand-red logout
- Replace generic `--destructive` with SRRV scale: `text-brand-primary-600 hover:bg-brand-primary-50`
- Icon inherits color; keep disabled/pending behavior + aria-labels

### 3. Trigger + shell polish
- Trigger pill: rounded-full hit area, hover/open surfaces
- ChevronDown indicator rotating on open (ht-fast/ease tokens)
- Shell: explicit `w-56`, `rounded-xl shadow-ht-elevated`

### 4. Typography
- Name in `font-display` per type token spec

## Explicitly rejected
- Extra gold hairlines elsewhere — gold stays rare to stay premium
- Dark-mode variants — portal is light-only today

## Files touched
- `src/components/layout/user-menu.tsx`
- `src/__tests__/user-menu.test.tsx` (extend if chevron selected)

## Verification
- tsc --noEmit, full vitest run, build; visual check both portals
