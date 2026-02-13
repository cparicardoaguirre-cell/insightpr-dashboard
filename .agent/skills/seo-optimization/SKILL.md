---
name: seo-optimization
description: SEO best practices for React SPA and Netlify-hosted applications
---

# SEO Optimization

## When to Use

Review during initial setup and before every public-facing deploy.

## HTML Head Essentials

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title — Brand Name</title>
  <meta name="description" content="Compelling 150-160 char description" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://example.com/page" />

  <!-- Open Graph (Facebook/LinkedIn) -->
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Description" />
  <meta property="og:image" content="https://example.com/og-image.jpg" />
  <meta property="og:url" content="https://example.com/page" />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Page Title" />
  <meta name="twitter:description" content="Description" />

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Business Name",
    "url": "https://example.com"
  }
  </script>
</head>
```

## React SPA SEO Checklist

- [ ] Unique `<title>` per route (use react-helmet-async or document.title)
- [ ] Unique `<meta name="description">` per route
- [ ] Single `<h1>` per page
- [ ] Logical heading hierarchy (h1 → h2 → h3)
- [ ] All images have descriptive `alt` text
- [ ] Semantic HTML: `<main>`, `<nav>`, `<article>`, `<section>`
- [ ] Internal links use `<a href>` (not `onClick` navigation)
- [ ] `lang` attribute on `<html>` element
- [ ] 404 page returns proper HTTP 404 status

## Netlify SEO Configuration

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# SPA fallback routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Prerendering for bots/crawlers (Netlify feature)
[build.processing]
  [build.processing.html]
    pretty_urls = true
```

## Netlify Prerendering for SPAs

Enable **Netlify Prerendering** in site settings to serve fully rendered HTML to search engine bots and AI crawlers — critical for React SPAs.

## Performance for SEO

- [ ] Lighthouse Performance score ≥ 90
- [ ] LCP < 2.5s (affects search ranking)
- [ ] CLS < 0.1 (affects search ranking)
- [ ] Gzip/Brotli compression enabled (Netlify default)
- [ ] Cache headers set for static assets

## Sitemap & Robots

```
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```
