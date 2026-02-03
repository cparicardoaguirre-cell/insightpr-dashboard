
@echo off
TITLE InsightPR Dashboard - One-Click Publisher
CLS
ECHO ========================================================
ECHO   INSIGHT PR DASHBOARD - PUBLISHER CONTROL CENTER
ECHO ========================================================
ECHO.
ECHO 1. Starting Local Server...
ECHO 2. Connecting to NotebookLM...
ECHO 3. Extracting latest Excel data...
ECHO.

cd /d "c:\Users\cpari\.gemini\antigravity\NLT_PR_Dashboard"

:: Run the Node.js automation script
node scripts/publish_update.js

ECHO.
ECHO ========================================================
ECHO   DEPLOYING TO PRODUCTION (NETLIFY)
ECHO ========================================================
ECHO.

git add .
git commit -m "Update dashboard: code changes and financial data"
git push origin master

ECHO.
ECHO ========================================================
ECHO   SUCCESS! DASHBOARD UPDATED.
ECHO ========================================================
ECHO.
ECHO Changes should appear on https://insightpr-dashboard.netlify.app/ within 2 minutes.
ECHO.
PAUSE
