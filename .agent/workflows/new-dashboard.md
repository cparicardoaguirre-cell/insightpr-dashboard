---
description: Create a new React/Vite dashboard project from template
---

# New Dashboard Project Workflow

This workflow creates a new React/Vite dashboard project with the standard configuration used in the Antigravity workspace.

## Steps

// turbo-all

### 1. Create Vite Project

```bash
cd D:\Antigravity Workspace
npx -y create-vite@latest ./{project-name} --template react-ts
```

### 2. Install Dependencies

```bash
cd D:\Antigravity Workspace\{project-name}
npm install
npm install @radix-ui/react-switch react-markdown remark-gfm
npm install --save-dev @netlify/functions
```

### 3. Create Project Structure

Create the following directories:

- `src/components/`
- `src/context/`
- `src/locales/`
- `public/data/`
- `scripts/`
- `netlify/functions/`
- `.agent/workflows/`

### 4. Create Language Context

Create `src/context/LanguageContext.tsx` for bilingual support.

### 5. Create Base Styles

Update `src/index.css` with design tokens:

```css
:root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #12121a;
    --bg-card: rgba(18, 18, 26, 0.95);
    --text-primary: #ffffff;
    --text-secondary: #a0a0b0;
    --accent-primary: #3b82f6;
    --accent-success: #10b981;
    --accent-warning: #f59e0b;
    --accent-danger: #ef4444;
    --border-color: rgba(255, 255, 255, 0.1);
}
```

### 6. Create DashboardLayout Component

Create the main layout with sidebar navigation.

### 7. Initialize Git Repository

```bash
cd D:\Antigravity Workspace\{project-name}
git init
git add -A
git commit -m "Initial commit: Dashboard project setup"
```

### 8. Connect to GitHub

```bash
cd D:\Antigravity Workspace\{project-name}
git remote add origin https://github.com/{username}/{project-name}.git
git push -u origin main
```

### 9. Create Netlify Site

Use MCP or Netlify dashboard to create a new site and get the site ID.

### 10. Configure netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 11. Deploy Initial Version

```bash
cd D:\Antigravity Workspace\{project-name}
npm run build
```

Then use MCP to deploy.

## Post-Setup Checklist

- [ ] Project builds without errors
- [ ] Git repository connected to GitHub
- [ ] Netlify site created and deployed
- [ ] Language toggle working
- [ ] Dark theme applied
- [ ] Sample data files in public/data/
