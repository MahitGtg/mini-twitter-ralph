# Feature: Auth Page Routes (Sign In & Sign Up)

## Priority: HIGH (Breaks authentication flow)

## Problem
The authentication navigation is broken. The existing `SignInForm` component (line 73-74) links to `/auth/signup`:
```tsx
<Link href="/auth/signup" className="font-semibold text-sky-600">
  Create an account
</Link>
```

And `SignUpForm` (line 112-114) links to `/auth/signin`:
```tsx
<Link href="/auth/signin" className="font-semibold text-sky-600">
  Sign in
</Link>
```

**But neither of these routes exist!** The app structure shows:
- `/` (home page)
- `/profile/[username]` (profile pages)
- **No `/auth/*` routes**

When a user clicks "Create an account" from the sign-in prompt on the home page, they get a 404 error. Same for clicking "Sign in" if they somehow reach the sign-up form.

## Goal
Create the `/auth/signin` and `/auth/signup` page routes so users can navigate between sign-in and sign-up flows.

## Dependencies
- SignInForm component (exists at `src/components/auth/SignInForm.tsx`)
- SignUpForm component (exists at `src/components/auth/SignUpForm.tsx`)

## Tasks

### 1. Create Sign-In Page Route (`mini-twitter/src/app/auth/signin/page.tsx`)

```typescript
"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Redirect to home if already authenticated
  if (!isLoading && isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Sign in to Mini Twitter
          </h1>
          <p className="text-sm text-slate-600">
            Welcome back! Enter your credentials to continue.
          </p>
        </header>
        <SignInForm />
      </div>
    </div>
  );
}
```

### 2. Create Sign-Up Page Route (`mini-twitter/src/app/auth/signup/page.tsx`)

```typescript
"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Redirect to home if already authenticated
  if (!isLoading && isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="text-sm text-slate-600">
            Join Mini Twitter and start sharing your thoughts.
          </p>
        </header>
        <SignUpForm />
      </div>
    </div>
  );
}
```

### 3. Optional: Add Auth Layout (`mini-twitter/src/app/auth/layout.tsx`)

Create a shared layout for auth pages with metadata:

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Mini Twitter",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

### 4. Optional: Update Home Page Sign-In Prompt

Consider adding a "Create account" link to the home page's `SignInPrompt` component as well, so users have both options immediately visible:

```typescript
function SignInPrompt() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome to Mini Twitter
          </h1>
          <p className="text-sm text-slate-600">
            Sign in to post updates and see your personalized feed.
          </p>
        </header>
        <SignInForm />
        {/* The SignInForm already includes a link to sign up */}
      </div>
    </div>
  );
}
```

## File Structure After Implementation

```
mini-twitter/src/app/
├── auth/
│   ├── layout.tsx          # Shared auth metadata
│   ├── signin/
│   │   └── page.tsx        # Sign-in page
│   └── signup/
│       └── page.tsx        # Sign-up page
├── profile/
│   └── [username]/
│       ├── layout.tsx
│       └── page.tsx
├── favicon.ico
├── globals.css
├── layout.tsx
└── page.tsx
```

## Acceptance Criteria
- [ ] Navigating to `/auth/signin` shows the sign-in form
- [ ] Navigating to `/auth/signup` shows the sign-up form
- [ ] Clicking "Create an account" on sign-in form navigates to `/auth/signup`
- [ ] Clicking "Sign in" on sign-up form navigates to `/auth/signin`
- [ ] Already authenticated users are redirected to home from auth pages
- [ ] Both pages have proper loading states during auth check
- [ ] Pages have consistent styling with rest of the app

## Notes
- This is primarily routing/wiring work - the form components already exist and work
- The redirect logic prevents authenticated users from accessing auth pages
- The forms already handle navigation after successful auth (redirect to "/")
- Test the full flow: home → sign in link → sign up link → create account → verify redirect to home

## Completed
- Added auth routes with redirects and loading states.
- Added auth layout metadata.
