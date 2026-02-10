Refactor summary (iteration 3):
- Added getRetryableAuthError helper in authErrorUtils to remove duplicated retryable error construction.
- Updated SignInForm and SignUpForm to use the shared helper.

Files touched:
- mini-twitter/src/components/auth/authErrorUtils.ts
- mini-twitter/src/components/auth/SignInForm.tsx
- mini-twitter/src/components/auth/SignUpForm.tsx
