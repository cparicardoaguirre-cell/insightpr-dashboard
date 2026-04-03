---
name: nlt-style-guide
description: Design system and styling rules for the NLT PR Dashboard
---

# NLT PR Dashboard Style Guide

## Core Aesthetics

- **Theme**: Industrial / Professional / Heavy Machinery.
- **Colors**:
  - Primary: `Yellow-500` (Caterpillar/Forklift Yellow).
  - Secondary: `Slate-900` (Dark background).
  - Text: `White` / `Gray-300`.
- **Components**:
  - Cards: Dark cards with yellow top borders or accents.
  - Typography: Robust, blocky fonts (Inter/Roboto).

## Setup

Ensure Tailwind CSS is configured to extend these colors.

## NLT Brand Color Palette

| Token              | Hex / Value                    | CSS Variable           | Usage                                  |
|--------------------|--------------------------------|------------------------|----------------------------------------|
| BG Primary         | `#0f172a`                      | `--bg-primary`         | Page background (slate-900)            |
| BG Secondary       | `#1e293b`                      | `--bg-secondary`       | Cards, footer, elevated surfaces       |
| BG Card            | `#1e293b`                      | `--bg-card`            | Card backgrounds                       |
| Text Primary       | `#f8fafc`                      | `--text-primary`       | Headings, primary content (white)      |
| Text Secondary     | `#94a3b8`                      | `--text-secondary`     | Body text, labels, subtitles           |
| Accent Primary     | `#3b82f6` (Blue-500)           | `--accent-primary`     | Buttons, links, focus rings            |
| Accent Secondary   | `#f59e0b` (Amber-500)          | `--accent-secondary`   | Highlights, alerts, glossary titles    |
| Border             | `#334155`                      | `--border-color`       | Card/section borders                   |
| Glass BG           | `rgba(30,41,59,0.7)`           | `--glass-bg`           | Glassmorphism header                   |
| Glass Border       | `rgba(255,255,255,0.1)`        | `--glass-border`       | Header/glass element borders           |
| Gold Accent        | `#c5a84d`                      | --                     | Footer company name, login footer link |
| Btn Primary Hover  | `#2563eb`                      | --                     | Primary button hover state             |

## Status Indicator Colors

| Status    | Background                        | Text Color | CSS Class        | Usage                          |
|-----------|-----------------------------------|------------|------------------|--------------------------------|
| Green/OK  | `rgba(16,185,129,0.1)`            | `#34d399`  | `.status-green`  | Compliant, connected, healthy  |
| Yellow    | `rgba(245,158,11,0.1)`            | `#fbbf24`  | `.status-yellow` | Warning, pending, needs review |
| Red/Error | `rgba(239,68,68,0.1)`             | `#f87171`  | `.login-error`   | Error messages, logout hover   |
| Online    | `bg-green-500 animate-pulse`      | `text-green-700` | --          | System online indicator dot    |
| Positive  | `#dcfce7` bg / `#16a34a` text     | --         | `.fs-variance--positive` | Favorable variances  |
| Negative  | `#fee2e2` bg / `#dc2626` text     | --         | `.fs-variance--negative` | Unfavorable variances|

## Component Patterns

### Dashboard Card
```css
.card {
  background-color: var(--bg-card);        /* #1e293b */
  border: 1px solid var(--border-color);   /* #334155 */
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

### Glassmorphism Header
```css
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: var(--glass-bg);       /* rgba(30,41,59,0.7) */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### Status Badge
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
```

### Primary Button
```css
.btn-primary {
  background-color: var(--accent-primary); /* #3b82f6 */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}
.btn-primary:hover { background-color: #2563eb; }
```

### Login Card (Glassmorphism)
```css
.login-card {
  background: rgba(30,41,59,0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 3rem;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}
```

## Data Visualization Color Scheme

For Recharts / chart components used in FinancialAnalysis and IndustryAnalysis:

| Purpose            | Color     | Notes                            |
|--------------------|-----------|----------------------------------|
| Primary series     | `#3b82f6` | Blue-500, matches accent-primary |
| Secondary series   | `#f59e0b` | Amber-500, accent-secondary      |
| Tertiary series    | `#8b5cf6` | Violet-500, industry gradients   |
| Positive/Up        | `#22c55e` | Green-500, checklist icons       |
| Negative/Down      | `#ef4444` | Red-500, error/decline           |
| Grid lines         | `#334155` | Matches border-color             |
| Chart background   | `#1e293b` | Matches bg-card                  |
| Tooltip background | `rgba(30,41,59,0.95)` | Glassmorphism style   |

## Typography

- **Font**: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Scale**: h1 `2.25rem/700`, h2 `1.5rem/600`, h3 `1.125rem/600`, body `--text-secondary` with `line-height: 1.6`
- **Monospace** (financial data): `ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace`
- **Overline labels**: `0.875rem`, uppercase, `letter-spacing: 0.05em`, `color: var(--text-secondary)`

## Animation Defaults

- **Entrance**: `@keyframes fadeIn` -- `opacity 0->1`, `translateY(10px->0)`, `0.5s ease-out`
- **Card hover**: `transform: translateY(-2px)` with `transition: transform 0.2s, box-shadow 0.2s`
- **Online pulse**: `animate-pulse` on status indicator dots
- **Spinner**: `animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600`
- **All transitions**: `0.2s` default duration

## Layout

- **Container**: `max-width: 1280px; margin: 0 auto; padding: 2rem;`
- **Grid**: `.grid-cols-2` (2 columns), `.grid-cols-3` (3 columns), gap `1.5rem`
- **Responsive**: `@media (max-width: 768px)` -- footer stacks vertically, grids collapse
- **Tab navigation**: Header-based tab switching (`activeTab` state), content renders per tab
