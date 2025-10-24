@echo off
echo ================================================================================
echo 🚀 VM PLACEMENT OPTIMIZATION PROJECT STARTUP
echo ================================================================================
echo Starting all services...
echo ================================================================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed or not in PATH
    echo Please install Node.js (includes npm) from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Python and Node.js detected
echo.

REM Run the Python startup script
echo 🚀 Starting unified project startup...
python start_project.py

echo.
echo 👋 Project startup completed.
pause
