---
name: Supabase Database Operations
description: Work with Supabase for database, auth, and edge functions
---

# Supabase Database Operations Skill

This skill covers Supabase integration for PostgreSQL database operations, authentication, and edge functions.

## Available Projects

| Project | ID | Region | Purpose |
|---------|----|----|---------|
| Reyes Contractor Group | `pbuqcwlmfhxbdjthoiwd` | us-east-1 | Financial dashboard backend |

## MCP Tools Available

### Read Operations

- `mcp_supabase-mcp-server_list_projects` - List all projects
- `mcp_supabase-mcp-server_get_project` - Get project details
- `mcp_supabase-mcp-server_list_tables` - List tables in schema
- `mcp_supabase-mcp-server_execute_sql` - Run SQL queries
- `mcp_supabase-mcp-server_list_migrations` - View migrations
- `mcp_supabase-mcp-server_get_logs` - Get service logs

### Write Operations

- `mcp_supabase-mcp-server_apply_migration` - Apply database migrations
- `mcp_supabase-mcp-server_deploy_edge_function` - Deploy edge functions

## Common SQL Patterns

### Create Financial Ratios Table

```sql
CREATE TABLE financial_ratios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    period_end DATE NOT NULL,
    ratio_type VARCHAR(50) NOT NULL,
    ratio_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4),
    prior_value DECIMAL(15,4),
    benchmark DECIMAL(15,4),
    status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE financial_ratios ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own company ratios"
ON financial_ratios FOR SELECT
USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));
```

### Apply Migration

```
mcp_supabase-mcp-server_apply_migration({
  "project_id": "pbuqcwlmfhxbdjthoiwd",
  "name": "create_financial_ratios",
  "query": "CREATE TABLE..."
})
```

### Query Data

```
mcp_supabase-mcp-server_execute_sql({
  "project_id": "pbuqcwlmfhxbdjthoiwd",
  "query": "SELECT * FROM financial_ratios WHERE company_id = $1"
})
```

## Edge Functions

### Deploy Edge Function

```
mcp_supabase-mcp-server_deploy_edge_function({
  "project_id": "pbuqcwlmfhxbdjthoiwd",
  "name": "sync-financial-data",
  "entrypoint_path": "index.ts",
  "verify_jwt": true,
  "files": [
    {
      "name": "index.ts",
      "content": "Deno.serve(async (req) => { ... })"
    }
  ]
})
```

### Edge Function Template

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
    const { company_id } = await req.json();
    
    // Get Supabase client
    const authHeader = req.headers.get("Authorization");
    
    // Process request
    const data = {
        status: "success",
        timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
});
```

## Client Integration (React/TypeScript)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Fetch ratios
const { data, error } = await supabase
    .from('financial_ratios')
    .select('*')
    .eq('company_id', companyId)
    .order('period_end', { ascending: false });
```

## Security Best Practices

1. **Always enable RLS** on tables with user data
2. **Use service role** only in backend/edge functions
3. **Validate JWT** in edge functions for authenticated endpoints
4. **Store secrets** in environment variables, never in code

## Monitoring

### Check Logs

```
mcp_supabase-mcp-server_get_logs({
  "project_id": "pbuqcwlmfhxbdjthoiwd",
  "service": "postgres"  // or "edge-function", "auth", "api"
})
```

### Security Advisors

```
mcp_supabase-mcp-server_get_advisors({
  "project_id": "pbuqcwlmfhxbdjthoiwd",
  "type": "security"
})
```

## Project URLs

- Dashboard: `https://supabase.com/dashboard/project/{project_id}`
- API URL: `https://{project_id}.supabase.co`
- Edge Functions: `https://{project_id}.supabase.co/functions/v1/{function_name}`
