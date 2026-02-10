# Verification Plan: Auth Page Routes (from auth-page-routes.completed.md)

## Todo under test
**Auth Page Routes (Sign In & Sign Up)** — Created the `/auth/signin` and `/auth/signup` page routes so users can navigate between sign-in and sign-up flows. Features include:
1. `/auth/signin` page rendering the `SignInForm` component
2. `/auth/signup` page rendering the `SignUpForm` component
3. Navigation links between sign-in and sign-up pages (cross-linking)
4. Authenticated user redirect — already-authenticated users visiting `/auth/*` are redirected to `/`
5. Loading state shown while auth status is being checked ("Checking your session...")
6. Shared auth layout with metadata (`title: "Authentication - Mini Twitter"`)
7. Consistent styling with the rest of the app

## Backend tests
- Run: `cd mini-twitter && npm run test:run`
- This run verifies the work from auth-page-routes.completed.md. The auth routes are primarily frontend routing, but the backend user/auth functions underpin them. Relevant test files:
  - `convex/users.test.ts` — tests getCurrentUser (auth check used by pages), getUserByUsername, updateProfile auth guard
- Run the full test suite (all `*.test.ts` files) to confirm nothing is broken.
- Do not add or run frontend unit tests (no Vitest in `src/`).

## Playwright E2E flows (all features in this todo)

Use `playwright-cli` (headless). See AGENTS.md for setup.

### Flow 1: Sign-In page renders correctly
1. Navigate to `/auth/signin`
2. Assert page contains heading "Sign in to Mini Twitter"
3. Assert page contains subheading "Welcome back! Enter your credentials to continue."
4. Assert sign-in form is visible with Email input, Password input, and "Sign in" button
5. Assert "Create an account" link is visible and points to `/auth/signup`
6. Screenshot: `verify/screenshots/signin-page-render.png`

### Flow 2: Sign-Up page renders correctly
1. Navigate to `/auth/signup`
2. Assert page contains heading "Create your account"
3. Assert page contains subheading "Join Mini Twitter and start sharing your thoughts."
4. Assert sign-up form is visible with Email, Username, Password, Confirm password inputs, and "Create account" button
5. Assert "Sign in" link is visible and points to `/auth/signin`
6. Screenshot: `verify/screenshots/signup-page-render.png`

### Flow 3: Cross-navigation between sign-in and sign-up
1. Navigate to `/auth/signin`
2. Click the "Create an account" link
3. Assert URL is now `/auth/signup`
4. Assert sign-up form heading is visible
5. Click the "Sign in" link on the sign-up page
6. Assert URL is now `/auth/signin`
7. Assert sign-in form heading is visible
8. Screenshot after each navigation: `verify/screenshots/nav-to-signup.png`, `verify/screenshots/nav-to-signin.png`

### Flow 4: Sign-up happy path — create account and verify redirect
1. Navigate to `/auth/signup`
2. Fill in Email with a unique test email (e.g. `verifytest_<timestamp>@example.com`)
3. Fill in Username with a unique username (e.g. `verifyuser_<timestamp>`)
4. Fill in Password and Confirm password with the same value (e.g. `TestPass123!`)
5. Click "Create account" button
6. Assert button text changes to "Creating account..." (submitting state)
7. Wait for redirect — assert URL becomes `/` (home page)
8. Assert user is now authenticated (e.g. home page shows authenticated content, not the sign-in prompt)
9. Screenshot: `verify/screenshots/signup-success-redirect.png`

### Flow 5: Sign-in happy path — sign in with existing account and verify redirect
1. Navigate to `/auth/signin` (sign out first if needed, or use a fresh browser context)
2. Fill in Email and Password with the credentials created in Flow 4
3. Click "Sign in" button
4. Assert button text changes to "Signing in..." (submitting state)
5. Wait for redirect — assert URL becomes `/`
6. Assert user is authenticated on home page
7. Screenshot: `verify/screenshots/signin-success-redirect.png`

### Flow 6: Sign-in edge case — wrong password
1. Navigate to `/auth/signin`
2. Fill in a valid email but an incorrect password
3. Click "Sign in"
4. Assert an error message appears (red text, e.g. "Unable to sign in." or similar)
5. Assert user is NOT redirected (still on `/auth/signin`)
6. Screenshot: `verify/screenshots/signin-wrong-password.png`

### Flow 7: Sign-up edge case — password mismatch
1. Navigate to `/auth/signup`
2. Fill in Email, Username, Password = "TestPass123!", Confirm password = "Different456!"
3. Click "Create account"
4. Assert error message "Passwords do not match." appears
5. Assert user is NOT redirected
6. Screenshot: `verify/screenshots/signup-password-mismatch.png`

### Flow 8: Sign-up edge case — empty/missing fields
1. Navigate to `/auth/signup`
2. Attempt to submit the form without filling any fields (click "Create account")
3. Assert HTML5 validation prevents submission (required fields) or an error is shown
4. Screenshot: `verify/screenshots/signup-empty-fields.png`

### Flow 9: Authenticated user redirect from auth pages
1. Ensure a user is currently signed in (from Flow 4/5 or sign up a new user)
2. Navigate directly to `/auth/signin`
3. Assert the user is redirected to `/` (should not see the sign-in form)
4. Navigate directly to `/auth/signup`
5. Assert the user is redirected to `/` (should not see the sign-up form)
6. Screenshot: `verify/screenshots/auth-redirect-when-logged-in.png`

## Success criteria
- Backend test suite passes (`npm run test:run`)
- All 9 Playwright E2E flows pass with expected assertions
- Screenshots saved to `verify/screenshots/`
- Report written to `verify/verify-report.md`
- Failures and refactor notes go to coder. When done, mark this todo as verified.

## Out of scope
- No new product features; no frontend unit tests.

## Last run (verify-report)
- Report: verify/verify-report.md
- Todo: auth-page-routes
- Backend: PASS
- E2E: Flow 1 PASS; Flow 2 PASS; Flow 3 PASS; Flow 4 PASS; Flow 5 PASS; Flow 6 FAIL; Flow 7 PASS; Flow 8 PASS; Flow 9 PASS
- Bugs for coder: Wrong password sign-in shows raw server stack/InvalidSecret error instead of a friendly message; see `src/components/auth/SignInForm.tsx` and auth error handling.
- Refactor items (if any): none

## Fixes applied
- Updated `src/components/auth/SignInForm.tsx` to sanitize sign-in failures and show user-safe errors instead of raw backend messages.
- Wrong-credential/auth failures (including `InvalidSecret`) now show `Invalid email or password.`
- Non-credential failures now show `Unable to sign in.`
- Updated `src/components/auth/SignInForm.test.tsx` expectation to match the new safe sign-in error behavior.
- Re-ran required backend suite: `cd mini-twitter && npm run test:run` (PASS).
- Could not re-run Playwright Flow 6 in this session because local app server was not running (`http://127.0.0.1:3000` unreachable).

## Iteration 2 — Re-verification focus
The fix for Flow 6 has been applied but **not yet verified via Playwright**. This iteration must:

### Backend focus
- Re-run `cd mini-twitter && npm run test:run` to confirm the backend suite still passes after the SignInForm changes.

### Playwright re-verification (priority)
- **Ensure the local dev server is running** before attempting E2E flows. Start with `cd mini-twitter && npm run dev` (or `npm run dev:next` + `npm run dev:convex` separately). Verify `http://127.0.0.1:3000` is reachable before proceeding.
- **Re-run Flow 6 (Sign-in wrong password)** as the primary focus:
  1. Navigate to `/auth/signin`
  2. Fill in Email with a known-valid email (or any email, e.g. `wrongpasstest@example.com`) and Password with an incorrect value (e.g. `WrongPassword999!`)
  3. Click "Sign in"
  4. **Assert** the error message shown is a user-friendly string: either `Invalid email or password.` or `Unable to sign in.` — NOT a raw server stack trace or `InvalidSecret`
  5. **Assert** the user remains on `/auth/signin` (no redirect)
  6. Screenshot: `verify/screenshots/signin-wrong-password-fixed.png`
- **Re-run all 9 flows** (Flows 1-9 as described above) to confirm no regressions from the fix. The previously-passing flows (1-5, 7-9) should still pass.
- If Flow 6 now passes, update `verify/verify-report.md` with all-pass status and mark `auth-page-routes` as verified.
- If Flow 6 still fails, document the exact error message seen in the screenshot and report back with details for coder.

## Last run (verify-report)
- Report: verify/verify-report.md
- Todo: auth-page-routes
- Backend: PASS
- E2E: Flow 1 PASS; Flow 2 PASS; Flow 3 PASS; Flow 4 PASS; Flow 5 PASS; Flow 6 PASS; Flow 7 PASS; Flow 8 PASS; Flow 9 PASS
- Bugs for coder: None.
- Refactor items (if any): none

Summary: Backend and all E2E flows passed.
