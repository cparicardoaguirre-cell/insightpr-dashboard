---
description: Update and manage project dependencies
---

# Dependency Management Workflow

Safe workflow for updating project dependencies.

## Prerequisites

- Clean git state (no uncommitted changes)
- Project runs successfully before updates

## Steps

### 1. Check Current State

// turbo

```bash
git status
```

### 2. Backup Current Dependencies

// turbo

```bash
# Save current package-lock.json
cp package-lock.json package-lock.json.backup
```

### 3. Check for Outdated Packages

// turbo

```bash
npm outdated
```

### 4. Update Strategy

#### Safe Updates (patch/minor)

// turbo

```bash
npm update
```

#### Check for Vulnerabilities

// turbo

```bash
npm audit
```

#### Fix Vulnerabilities (when safe)

```bash
npm audit fix
```

### 5. Test After Updates

// turbo

```bash
npm run build
```

// turbo

```bash
npm run dev
```

### 6. Verify Application Works

- Check main functionality
- Verify no console errors
- Test key features

### 7. Commit if Successful

```bash
git add package.json package-lock.json
git commit -m "chore: Update dependencies"
```

### 8. Rollback if Issues

If problems occur:

```bash
# Restore backup
mv package-lock.json.backup package-lock.json
npm install
```

## Specific Package Updates

### Update Single Package

```bash
npm install package-name@latest
```

### Update to Specific Version

```bash
npm install package-name@1.2.3
```

### Major Version Upgrades

⚠️ Review changelog before major upgrades:

```bash
npm install package-name@next
```
