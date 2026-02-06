---
description: Deploy and configure Supabase database for a project
---

# Supabase Setup Workflow

This workflow sets up and configures Supabase for a dashboard project.

## Prerequisites

- Supabase account with access token configured in MCP
- Project organization identified

## Steps

### 1. List Available Organizations

```
mcp_supabase-mcp-server_list_organizations()
```

### 2. Check Existing Projects

```
mcp_supabase-mcp-server_list_projects()
```

### 3. Get Project Details (if exists)

```
mcp_supabase-mcp-server_get_project({
  "id": "{project-id}"
})
```

### 4. Create New Project (if needed)

First get cost confirmation:

```
mcp_supabase-mcp-server_get_cost({
  "type": "project",
  "organization_id": "{org-id}"
})
```

Then confirm and create:

```
mcp_supabase-mcp-server_confirm_cost({
  "type": "project",
  "recurrence": "monthly",
  "amount": 0  // for free tier
})

mcp_supabase-mcp-server_create_project({
  "name": "project-name",
  "region": "us-east-1",
  "organization_id": "{org-id}",
  "confirm_cost_id": "{confirmation-id}"
})
```

### 5. Apply Database Schema

```
mcp_supabase-mcp-server_apply_migration({
  "project_id": "{project-id}",
  "name": "initial_schema",
  "query": "CREATE TABLE..."
})
```

### 6. Get Project Keys

```
mcp_supabase-mcp-server_get_publishable_keys({
  "project_id": "{project-id}"
})

mcp_supabase-mcp-server_get_project_url({
  "project_id": "{project-id}"
})
```

### 7. Configure Environment Variables

Add to project `.env` file:

```
VITE_SUPABASE_URL=https://{project-id}.supabase.co
VITE_SUPABASE_ANON_KEY={anon-key}
```

### 8. Install Supabase Client

```bash
cd D:\Antigravity Workspace\{project-name}
npm install @supabase/supabase-js
```

### 9. Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 10. Run Security Advisors

```
mcp_supabase-mcp-server_get_advisors({
  "project_id": "{project-id}",
  "type": "security"
})
```

## Common Tables for Financial Dashboards

### Companies Table

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    ein VARCHAR(20),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Financial Periods Table

```sql
CREATE TABLE financial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(20) CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
    is_audited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Financial Ratios Table

```sql
CREATE TABLE financial_ratios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID REFERENCES financial_periods(id),
    category VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4),
    prior_value DECIMAL(15,4),
    industry_benchmark DECIMAL(15,4),
    unit VARCHAR(20),
    status VARCHAR(20),
    interpretation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Project Reference

| Project | ID | Status |
|---------|-----|--------|
| Reyes Contractor Group | pbuqcwlmfhxbdjthoiwd | Active |
