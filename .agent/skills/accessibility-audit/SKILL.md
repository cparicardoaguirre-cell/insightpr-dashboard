---
name: accessibility-audit
description: WCAG 2.1 AA accessibility audit checklist for React dashboards
---

# Accessibility Audit (a11y)

## When to Use

Run before every major release and periodically during development.

## Automated Testing Setup

### ESLint Plugin (catches issues at dev time)

```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

```json
// .eslintrc
{ "extends": ["plugin:jsx-a11y/recommended"] }
```

### Vitest/Jest Integration

```bash
npm install --save-dev vitest-axe
```

```ts
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);

it('has no a11y violations', async () => {
  const { container } = render(<MyComponent />);
  expect(await axe(container)).toHaveNoViolations();
});
```

## WCAG 2.1 AA Checklist

### Perceivable

- [ ] All images have descriptive `alt` text (decorative: `alt=""`)
- [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Text resizable to 200% without breaking layout
- [ ] No info conveyed by color alone (use icons/labels too)

### Operable

- [ ] All interactive elements keyboard-accessible (Tab, Enter, Space, Esc)
- [ ] Visible focus indicators on all focusable elements
- [ ] Skip-to-content link at top of page
- [ ] Modals trap focus and close with Escape
- [ ] No keyboard traps

### Understandable

- [ ] `lang` attribute set on `<html>` element
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages are descriptive and programmatically associated
- [ ] Consistent navigation across pages

### Robust

- [ ] Valid HTML structure (no duplicate IDs)
- [ ] ARIA roles/attributes used correctly
- [ ] Single `<h1>` per page with logical heading hierarchy
- [ ] Semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`

## React-Specific Patterns

```tsx
// ✅ Good: Semantic button with aria
<button onClick={handleClick} aria-label="Close dialog">
  <CloseIcon />
</button>

// ❌ Bad: Div as button
<div onClick={handleClick}>X</div>

// ✅ Good: Form with labels
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" />

// ✅ Good: Live region for dynamic content
<div aria-live="polite" role="status">
  {loading ? 'Loading...' : `${count} results found`}
</div>
```

## Manual Testing Checklist

- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA on Windows)
- [ ] Check all states: default, hover, focus, disabled, error
- [ ] Verify mobile touch targets ≥ 44x44px
