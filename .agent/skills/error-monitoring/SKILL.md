---
name: error-monitoring
description: Production error handling, logging, and monitoring for Netlify + Supabase apps
---

# Error Monitoring

## When to Use

Set up at project creation. Review logs before and after every deploy.

## React Error Boundaries

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined as Error | undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    // Optional: send to external monitoring service
  }

  render() {
    if (this.state.hasError) {
      return this.state.fallback || (
        <div role="alert">
          <h2>Something went wrong</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
```

## Netlify Function Error Handling

```ts
// netlify/functions/api.ts
export default async (req: Request) => {
  try {
    const data = await fetchData();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API Error]', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

## Netlify Edge Function Error Config

```toml
# netlify.toml — graceful fallback on edge function crash
[[edge_functions]]
  path = "/api/*"
  function = "api-handler"
  on_error = "bypass"  # Options: bypass | /custom-error-page
```

## Supabase Client Error Pattern

```ts
const { data, error } = await supabase.from('table').select('*');
if (error) {
  console.error('[Supabase]', error.message, error.details);
  // Show user-friendly message, not raw error
}
```

## Production Monitoring Checklist

- [ ] Error boundaries wrap all route-level components
- [ ] All `fetch`/Supabase calls have try-catch with logging
- [ ] Netlify function logs checked post-deploy
- [ ] Supabase logs reviewed: `get_logs({ service: "api" })`
- [ ] Edge function `onError` configured in `netlify.toml`
- [ ] Console errors cleared in production build
- [ ] Global `window.onerror` handler for uncaught exceptions

## Quick Log Check via MCP

```
mcp_supabase-mcp-server_get_logs({ project_id: "...", service: "api" })
mcp_supabase-mcp-server_get_logs({ project_id: "...", service: "edge-function" })
```
