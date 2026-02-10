# Feature: Responsive Layout Verification & Fixes

## Summary

Verify and fix the responsive layout on small viewports (mobile devices). This addresses the unchecked item in PLAN.md under "Polish & robustness":

> - [ ] Responsive layout verified on small viewport

## Current State

The application uses Tailwind CSS with some responsive classes, but no systematic verification has been done on small viewports. Potential issues may exist in:

- Navigation/sidebar layout on mobile
- Tweet composer and feed spacing
- Profile header layout and stats
- Search page tabs and input
- Tweet detail page

## Implementation Steps

### 1. Audit all layout components with Playwright

Use playwright-cli to capture screenshots at mobile viewport (375x667 iPhone SE):

```bash
playwright-cli start
PAGE_ID=$(playwright-cli new-page)
playwright-cli -e "await page.setViewportSize({ width: 375, height: 667 })" --page $PAGE_ID
# Test each major page
playwright-cli -e "await page.goto('http://localhost:3000')" --page $PAGE_ID
playwright-cli -e "await page.screenshot({ path: '/tmp/mobile-home.png' })" --page $PAGE_ID
# ... repeat for /search, /profile/[user], /tweet/[id]
```

### 2. Fix MainLayout for mobile

File: `src/components/layout/MainLayout.tsx`

Expected fixes:
- Hide right rail on mobile (`hidden lg:block`)
- Make sidebar responsive (hamburger menu or bottom nav on mobile)
- Ensure main content takes full width on small screens

### 3. Fix Sidebar for mobile  

File: `src/components/layout/Sidebar.tsx`

Expected fixes:
- Convert to bottom navigation on mobile, or
- Add mobile hamburger menu
- Ensure touch-friendly tap targets (min 44x44px)

### 4. Fix ProfileHeader for mobile

File: `src/components/user/ProfileHeader.tsx`

Expected fixes:
- Stack avatar and info vertically on very small screens
- Ensure follow button is accessible
- Verify stats (followers/following) wrap properly

### 5. Fix TweetComposer for mobile

File: `src/components/tweets/TweetComposer.tsx`

Expected fixes:
- Full-width input on mobile
- Character count visible without horizontal scroll
- Submit button easily tappable

### 6. Fix Search page for mobile

File: `src/app/search/page.tsx`

Expected fixes:
- Tabs should be full-width or scrollable on small screens
- Search input should be full width
- Results should have proper spacing

### 7. Verify TweetCard responsive behavior

File: `src/components/tweets/TweetCard.tsx`

Expected fixes:
- Content shouldn't overflow
- Action buttons should wrap if needed
- Avatar and text properly aligned

## Files to Potentially Modify

- `src/components/layout/MainLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/user/ProfileHeader.tsx`
- `src/components/tweets/TweetComposer.tsx`
- `src/components/tweets/TweetCard.tsx`
- `src/app/search/page.tsx`
- `src/app/globals.css` (if global tweaks needed)

## Testing Checklist

Test at these viewport sizes:
- 375x667 (iPhone SE)
- 390x844 (iPhone 12/13/14)
- 428x926 (iPhone 12/13/14 Pro Max)
- 360x800 (Android medium)

For each viewport, verify:

- [ ] Home page loads correctly, feed is readable
- [ ] Can compose and post a tweet
- [ ] Can navigate to profile
- [ ] Profile header displays correctly
- [ ] Can follow/unfollow users
- [ ] Can navigate to search
- [ ] Search tabs are usable
- [ ] Can search users and tweets
- [ ] Tweet detail page is accessible
- [ ] Can like/delete tweets
- [ ] Navigation is accessible on all pages
- [ ] No horizontal overflow causing scroll
- [ ] Text is readable (not too small)
- [ ] Buttons have adequate touch targets

## Success Criteria

- [ ] All pages render without horizontal overflow at 375px width
- [ ] All interactive elements are tappable (min 44x44px touch targets)
- [ ] Navigation is accessible on mobile (either bottom nav, hamburger, or always-visible sidebar)
- [ ] All screenshots at mobile viewport show proper layout
- [ ] No broken layouts or overlapping elements

## Estimated Complexity

Medium - Requires auditing multiple components and potentially adding/modifying Tailwind responsive classes. May require restructuring sidebar navigation for mobile.

## Notes

- Added a dedicated mobile bottom nav layout in `Sidebar` and made the mobile rail sticky in `MainLayout`.
- Tuned mobile spacing and touch targets in `ProfileHeader`, `TweetComposer`, `TweetCard`, and search tabs.
- Did not run Playwright audits in this pass.
