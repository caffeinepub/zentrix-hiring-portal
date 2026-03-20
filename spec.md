# Zentrix Hiring Portal

## Current State
Full-stack React + Motoko hiring portal with Landing page, Application form, Track page, Admin login, and Admin dashboard. All data stored on ICP blockchain.

## Requested Changes (Diff)

### Add
- Loading state for positions fetch in LandingPage
- Better empty state for positions when loading vs truly empty

### Modify
- Navbar: Remove broken `<img>` tag, replace with gold gradient "ZENTRIX" text logo
- Footer: Remove broken `<img>` tag, replace with gold gradient "ZENTRIX" text logo
- AdminLogin: Remove broken `<img>` tag, replace with gold gradient "ZENTRIX" text logo
- AdminDashboard header: Remove broken `<img>` tag, replace with "ZENTRIX" text logo
- LandingPage: Improve overall UI - better hero, richer About cards, improved Why Join cards, better positions grid with skeleton loading
- All section cards: Better visual hierarchy, improved spacing, clearer CTAs

### Remove
- All `<img src="/assets/uploads/IMG-20260314-WA0060-3-1.jpg">` tags from all components

## Implementation Plan
1. Fix Navbar.tsx - remove img, add ZENTRIX text logo with gold gradient
2. Fix Footer.tsx - remove img, add ZENTRIX text logo with gold gradient
3. Fix AdminLogin.tsx - remove img, add ZENTRIX text logo
4. Fix AdminDashboard.tsx - remove img in header, add ZENTRIX text logo
5. Improve LandingPage.tsx - add loading state, improve all section UIs
