---
name: security-audit
description: Supabase RLS audit and web application security best practices
---

# Security Audit

## When to Use

Run after any migration, new table creation, or before production deploy.

## Supabase RLS Audit Checklist

### Table-Level Checks

- [ ] RLS enabled on **every** table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Every RLS-enabled table has at least one policy defined
- [ ] Policies exist for all CRUD operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] `INSERT` policies use `WITH CHECK` (not `USING`)
- [ ] `UPDATE` policies use both `USING` and `WITH CHECK`
- [ ] No overly permissive policies (`USING (true)` without reason)

### Performance Checks

- [ ] Columns referenced in RLS policies are indexed
- [ ] Use `(select auth.uid()) = user_id` pattern (prevents per-row re-eval)

### Security Checks

- [ ] `service_role` key NEVER in frontend code
- [ ] Anon key only used client-side with RLS protection
- [ ] Policies specify `TO authenticated` or `TO anon` explicitly
- [ ] Test with anonymous user — no unauthorized data visible
- [ ] Test with authenticated user — only own data visible

### Quick SQL Audit Query

```sql
-- Find tables WITHOUT RLS enabled
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE c.relrowsecurity = true
  );

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

## Frontend Security Checklist

- [ ] No secrets/API keys in client-side code
- [ ] Environment variables prefixed with `VITE_` are non-sensitive only
- [ ] HTTPS enforced on all endpoints
- [ ] CORS configured properly on Supabase/Netlify
- [ ] Content Security Policy (CSP) headers set
- [ ] XSS prevention: no `dangerouslySetInnerHTML` without sanitization
- [ ] Input validation on both client and server

## Supabase MCP Quick Check

```
mcp_supabase-mcp-server_get_advisors({ project_id: "...", type: "security" })
```
