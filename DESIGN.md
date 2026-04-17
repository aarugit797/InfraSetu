# Design Brief

## Visual Direction
Dark glassmorphism SaaS for government construction. Premium tech, accessibility-first, Srijan-inspired. Info-dense role-based navigation (6 user types), card-based dashboards with status badges, glassmorphic containers, smooth 0.3s transitions.

## Color Palette
| Token | OKLCH | Purpose |
|-------|--------|---------|
| Primary | 0.72 0.2 290 | Indigo: CTAs, highlights, active sidebar |
| Accent | 0.7 0.2 180 | Teal: Success, approvals, data emphasis |
| Destructive | 0.65 0.19 22 | Red: Rejections, critical alerts |
| Background | 0.11 0.02 260 | Dark navy: Base surface |
| Card | 0.15 0.01 265 | Glassmorphic fill |

## Typography
- **Display**: Space Grotesk (600/700) — headlines, card titles, labels
- **Body**: Inter (400/500) — copy, descriptions, form inputs
- **Mono**: JetBrains Mono (400) — timestamps, logs, technical data

## Elevation System
| Level | Class | Use |
|-------|-------|-----|
| Base | `.glass` | Default cards, sidebar, containers |
| Elevated | `.glass-elevated` | Modals, focused cards, popovers |
| Subtle | `.glass-sm` | Badges, utility components |

All: `backdrop-blur-md`, semi-transparent (`/30-50`), gradient borders (primary→accent, 20% opacity).

## Components
- **Stat Cards**: Glass + icon badge (primary/accent/red/orange) + title/value
- **Status Badges**: Circular 3px — pending (gray), active (blue), approved (green), rejected (red), critical (orange)
- **Buttons**: Glass base, primary text, smooth hover blur/opacity shift
- **Forms**: Modal + semi-transparent backdrop, glass container
- **Loading**: Pulse animation on skeletons (all list/detail pages)
- **Toast**: Bottom-right, glass style, icon + message + close

## Zones
| Zone | Desktop | Mobile |
|------|---------|--------|
| Nav | Sidebar 240px fixed | Bottom bar 56px |
| Content | Full width − sidebar | Full screen |
| Breakpoint | 1024px+ | 320–767px |

## Motion
- Transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover: Blur + opacity shift
- Focus: 2px primary ring, 4px offset
- Load: Soft pulse 2s infinite

## Signature
1. Gradient borders on all glass (primary→accent, 135deg, 20% opacity)
2. Icon badges (primary/accent/red/orange) on stat cards
3. Role badge on sidebar footer (primary bg)
4. Consistent color status flow across all pages

## Breakpoints
- **Mobile**: 320–767px (bottom nav, full-width, stacked)
- **Tablet**: 768–1023px (sidebar, 2-col grid)
- **Desktop**: 1024px+ (full sidebar, multi-col layouts)

## Constraints
- No default shadows — glassmorphism elevation only
- All colors from design tokens (OKLCH) — no hex/arbitrary
- WCAG AA minimum (1.5:1 text contrast)
- Touch targets ≥48px mobile
- Max card width 480px
