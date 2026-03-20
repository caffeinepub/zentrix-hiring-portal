# Zentrix Hiring Portal

## Current State
Version 27 is live. All 4 branding locations (Navbar, Footer, AdminLogin, AdminDashboard) use a text-only "ZENTRIX" gold gradient span. No image tags exist.

## Requested Changes (Diff)

### Add
- Logo image `/assets/uploads/IMG-20260314-WA0060-3-1.jpg` as `<img>` tag in Navbar, Footer, AdminLogin, AdminDashboard

### Modify
- Navbar: Replace ZENTRIX text span with image logo (h-10, auto width, object-contain)
- Footer: Replace ZENTRIX text span with image logo (h-10, white filter for dark background)
- AdminLogin: Replace ZENTRIX text span with image logo (h-14, centered)
- AdminDashboard header: Replace ZENTRIX text span with image logo (h-8), remove separate "Zentrix Solutions" text next to it

### Remove
- All ZENTRIX text-logo spans from the 4 branding locations

## Implementation Plan
1. In Navbar.tsx: swap ZENTRIX span with `<img src="/assets/uploads/IMG-20260314-WA0060-3-1.jpg" alt="Zentrix Solutions" className="h-10 w-auto object-contain" />`
2. In Footer.tsx: swap ZENTRIX span with `<img src="/assets/uploads/IMG-20260314-WA0060-3-1.jpg" alt="Zentrix Solutions" className="h-10 w-auto object-contain brightness-0 invert" />`
3. In AdminLogin.tsx: swap ZENTRIX span with `<img src="/assets/uploads/IMG-20260314-WA0060-3-1.jpg" alt="Zentrix Solutions" className="h-14 w-auto object-contain mx-auto mb-6" />`
4. In AdminDashboard.tsx: swap ZENTRIX span with `<img src="/assets/uploads/IMG-20260314-WA0060-3-1.jpg" alt="Zentrix Solutions" className="h-8 w-auto object-contain brightness-0 invert" />` and remove the adjacent "Zentrix Solutions" text span
5. Validate build
