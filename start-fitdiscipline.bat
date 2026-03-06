@echo off
title FitDiscipline AI Pro
color 0A

echo.
echo  ============================================
echo    FitDiscipline AI Pro - Starting Up...
echo  ============================================
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo  [1/3] node_modules not found. Running npm install...
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo  [ERROR] npm install failed. Please check your Node.js installation.
        pause
        exit /b 1
    )
    echo.
    echo  [1/3] Dependencies installed successfully!
) else (
    echo  [1/3] node_modules found. Skipping install.
)

echo.
echo  [2/3] Starting development server...
echo.

:: Start the dev server in a new background command and capture the process
start "FitDiscipline Dev Server" /B npm run dev

echo  [3/3] Waiting for server to start...
timeout /t 4 /nobreak >nul

echo.
echo  Opening http://localhost:5173 in your browser...
start http://localhost:5173

echo.
echo  ============================================
echo    Server is running at http://localhost:5173
echo    Press Ctrl+C to stop the server.
echo  ============================================
echo.

:: Keep terminal open by waiting for the background npm process
:WAIT_LOOP
timeout /t 5 /nobreak >nul
tasklist /FI "WINDOWTITLE eq FitDiscipline Dev Server" 2>nul | find /I "node.exe" >nul
if errorlevel 1 goto END
goto WAIT_LOOP

:END
echo.
echo  Server stopped. Press any key to exit.
pause >nul
