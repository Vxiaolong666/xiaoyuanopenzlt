@echo off
title Start Dev Server

echo [0/3] Checking port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    set PID=%%a
    goto :killed
)
goto :start_backend

:killed
echo Port 3000 is occupied by PID %PID%. Killing...
taskkill /f /pid %PID% >nul 2>&1
echo Process killed. Waiting 1 second...
timeout /t 1 /nobreak >nul

:start_backend
echo [1/3] Starting backend...
start "Backend - pnpm start" cmd /k "cd /d "%~dp0pure-admin-backend" && pnpm start"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo [2/3] Starting frontend...
start "Frontend - pnpm dev" cmd /k "cd /d "%~dp0pure-admin-thin" && pnpm dev"

echo [3/3] Both services launched. Press any key to close this window.
pause >nul
