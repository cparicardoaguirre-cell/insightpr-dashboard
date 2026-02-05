@echo off
TITLE NLT PR Dashboard - One-Click Publisher
CLS
ECHO ========================================================
ECHO   NLT PR DASHBOARD - PUBLISHER
ECHO ========================================================
ECHO.
ECHO 1. Building Application...
ECHO.

cd /d "c:\Users\cpari\.gemini\antigravity\NLT_PR_Dashboard"

:: Build
call npm run build

ECHO.
ECHO ========================================================
ECHO   DEPLOYING TO PRODUCTION (NETLIFY)
ECHO ========================================================
ECHO.

git add .
git commit -m "Automated dashboard update via Antigravity Agent"
git push origin master

ECHO.
ECHO ========================================================
ECHO   SUCCESS! NLT PR DASHBOARD UPDATED.
ECHO ========================================================
ECHO.
PAUSE
