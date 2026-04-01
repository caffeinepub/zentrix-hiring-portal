# Skiltrix Academy Hiring Portal

## Current State
The app is a full-stack React + Motoko hiring portal for Skiltrix Academy. The admin panel consists of:
- `AdminLogin.tsx`: Username/password login form (usernames: `admin` or `870847`, password: `N@m88000`). Works correctly.
- `AdminDashboard.tsx`: Two-tab layout (Applications, Manage Positions) with stats cards, application table with filters/bulk actions, job position cards, modals for detail/edit. Functional but visually basic.

## Requested Changes (Diff)

### Add
- Sidebar navigation instead of top tabs (collapsible on mobile)
- Dashboard overview tab with rich stats, recent applications list, quick actions
- Better application table with avatars/initials, better status badges, row hover effects
- Kanban-style status visualization or progress bars on stats
- Better job position cards with more visual hierarchy
- Toast notifications instead of alerts for save/delete confirmations
- Better empty states with illustrations

### Modify
- Replace basic tab buttons with a proper sidebar or top nav with icons
- Stats cards: add icons, trend indicators, better visual hierarchy
- Application table: improve typography, spacing, status badges as colored pills
- Job modal and detail modal: better layout, improved form fields
- Overall color scheme: stay with indigo/violet/cyan Skiltrix palette
- Loading states: skeleton loaders instead of spinner

### Remove
- Basic flat tab buttons
- Plain `alert()` calls -- replace with inline error messages or toast

## Implementation Plan
1. Rebuild `AdminDashboard.tsx` with sidebar navigation (Dashboard overview + Applications + Positions tabs)
2. Add overview/dashboard home view with stat cards with icons, recent applications, quick action buttons
3. Improve applications table: colored status badges, applicant initials avatar, better row design
4. Improve positions management: better cards with salary range display
5. Replace alert() calls with inline error state or sonner toasts
6. Keep all existing backend logic (claimAdminWithPassword, actor calls) intact -- only UI changes
7. Keep AdminLogin.tsx as-is (it works correctly)
