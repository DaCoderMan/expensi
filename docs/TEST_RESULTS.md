# Manual Test Results

**Date:** 2026-02-17  
**Scope:** Post–bugfix verification (404, dark mode, auth nav, AI Insights redirect).

## Environment

- **App:** Financi AI (Next.js)
- **URL:** http://localhost:3000
- **Server:** `npm run dev`

---

## Tests Performed

### 1. 404 Page

| Step | Result |
|------|--------|
| Navigate to `/nonexistent-page` | Page loads (no server error). |
| Expected content | Custom 404 view with “Page not found”, “Back to Dashboard” link. |
| Dark mode | Uses `text-foreground`, `text-muted`, `gradient-bg` (theme-aware). |

**Verdict:** Pass. `src/app/not-found.tsx` is used for unknown routes.

---

### 2. Sign In / Sign Up in Navbar

| Step | Result |
|------|--------|
| Load site unauthenticated | Nav shows “Sign In” and “Sign Up” next to theme toggle. |
| Click “Sign In” | Navigates to `/auth/signin`. |
| Click “Sign Up” | Navigates to `/auth/register`. |

**Verdict:** Pass. Auth entry points are visible when logged out.

---

### 3. AI Insights Route

| Step | Result |
|------|--------|
| Navigate to `/ai-insights` | Redirects to `/recommendations`. |
| Nav “AI Insights” link | Points to `/ai-insights` (URL matches label). |

**Verdict:** Pass. Single canonical label and redirect behavior as intended.

---

### 4. Dark Mode (ManualEntryForm & Register)

| Area | Change |
|------|--------|
| Register page | Card uses `dark:bg-card`, inputs use `bg-background`. |
| ManualEntryForm | All form inputs/selects use `bg-background`. Preset panel and buttons use `dark:bg-gray-900/50`, `dark:bg-card`. |
| Warnings | Amount &gt; 0 hint and duplicate/amount-warning blocks use `dark:text-amber-*`, `dark:bg-amber-900/20`, `dark:border-amber-700` where needed. |

**Verdict:** Pass. No hardcoded light-only backgrounds on updated components.

---

### 5. Quick Checks (from previous fixes)

- **Add Expense 401:** Context returns “Please sign in to add expenses.” with Sign in link and dismiss.
- **Pricing Buy Now:** `confirm()` runs before opening PayPal in a new tab.
- **Presets:** Amount uses `.toFixed(2)`; Escape and click-outside close panel.
- **Expenses page:** “Add expense” link present (empty state and header) → `/import#quick-add`.
- **OFX/QFX:** Pricing copy says “OFX/QFX”; Import page already matched.

---

## Summary

| Item | Status |
|------|--------|
| 404 page | Done |
| Dark mode on new/updated components | Done |
| Sign In / Sign Up in navbar | Done |
| `/ai-insights` → `/recommendations` | Done |
| Manual test pass | Done |

**Note:** The “N Issues” badge mentioned in the earlier report was not found in the app codebase; it is likely from the browser or IDE and was not re-tested here.
