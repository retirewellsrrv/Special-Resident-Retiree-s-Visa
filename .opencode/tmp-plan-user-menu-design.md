# UserMenu Dropdown — Design Improvement

## Goal
Upgrade the header user dropdown from "functional default" to a polished, token-driven component matching the app's design system.

## Current gaps (vs. design system)
1. Trigger uses `hover:opacity-80` — no surface feedback, no open-state affordance, no chevron.
2. Content uses default `shadow-md`; project has `shadow-ht-elevated` token for exactly this.
3. Menu header is plain text-only label; no visual anchor.
4. Generated `DropdownMenuContent` defaults `w-(--radix-dropdown-menu-trigger-width)` — fragile for this use case; must set explicit width.
5. Logout row spacing/typography default.

## Chosen direction: Option B — Profile card + refined trigger

### 1. Trigger (`user-menu.tsx`)
- Wrap cluster in a rounded-full pill: `rounded-full p-1 pr-2 sm:pr-3` so hover/focus shapes the whole cluster.
- Hover/open surfaces: `hover:bg-brand-neutral-100` + `data-[state=open]:bg-brand-neutral-100`, replacing `hover:opacity-80`.
- Add `ChevronDown size-4 text-brand-neutral-400` with `transition-transform duration-ht-fast ease-ht-ease group-data-[state=open]:rotate-180` (trigger gets `group` class).
- Keep focus-visible ring (token ring), aria-label, pending disabled state.

### 2. Content shell
- Explicit `w-56` (overrides trigger-width default).
- Elevation: `shadow-ht-elevated rounded-xl` (tokens from tailwind.config.ts).
- Keep built-in animations/ring from generated primitive.

### 3. Profile card header (full-bleed)
- Structure: negative-margin block `-mx-1 -mt-1 mb-1 px-3 py-3 bg-brand-tertiary-500 border-b border-brand-neutral-200` (matches sidebar footer aesthetic).
- Contents: `Avatar size-10` + stacked name (`text-sm font-semibold font-display text-brand-secondary-500`) and role (`text-xs text-brand-neutral-500`).
- Replace `DropdownMenuLabel` usage with a plain `div` (non-focusable) — cleaner than abusing Label.

### 4. Logout item
- `DropdownMenuItem variant="destructive"` with `gap-2 px-2 py-1.5 text-sm`.
- Icon inherits destructive color via existing data-variant styling.
- Pending: keep 'Logging out…' + disabled.

### 5. Tests (`src/__tests__/user-menu.test.tsx`)
- Existing 4 tests unchanged (roles/text assertions still hold).
- Add: chevron rotates when open (`data-[state=open]:rotate-180` class present on chevron via parent state → assert trigger has data-state=open after keyboard open).

## Files touched
- `src/components/layout/user-menu.tsx` (rewrite internals only)
- `src/__tests__/user-menu.test.tsx` (extend)

## Verification
- `pnpm tsc --noEmit`
- `pnpm vitest run`
- `pnpm build`
- Manual: dev server visual check both portals, collapsed sidebar, mobile width.

## Constraints honored
- No edits to `src/components/ui/*` (shadcn-owned).
- Tokens only — no hardcoded hex; animations use ht-* duration/ease tokens.
