---
name: notebooklm-client
description: Best practices for integrating the frontend with NotebookLM via the Proxy Server
---

# NotebookLM Client Integration

## Overview

The dashboard connects to NotebookLM locally via a Proxy Server (`server/index.js`). This allows the React frontend (running on port 5173/3000) to communicate with the Python-based MCP server.

## API Endpoints

### 1. Generate Executive Summary

**POST** `/api/executive-summary/generate`

```json
{
  "language": "en" | "es",
  "regenerate": true // Force new generation
}
```

**Response**:

```json
{
  "success": true,
  "data": { "content": "..." }
}
```

### 2. Chat Query

**POST** `/api/chat`

```json
{
  "message": "What is the net income?"
}
```

## Frontend Hooks

Always handle the loading state gracefully. Code pattern:

```tsx
const [loading, setLoading] = useState(false);
const [response, setResponse] = useState('');

const askAI = async () => {
    setLoading(true);
    try {
        const res = await fetch('/api/chat', ...);
        const data = await res.json();
        setResponse(data.reply);
    } catch (e) {
        setResponse("AI Service Unavailable");
    } finally {
        setLoading(false);
    }
}
```

## Production Considerations

In production (Netlify), the **active** connection to NotebookLM might not be available (static site).

- **Fallback**: Always serve pre-generated JSON content (`/data/executive_summary_en.json`) if the live API fails.
- **Visuals**: Show a "Last Updated" timestamp so users know if the AI analysis is recent.
