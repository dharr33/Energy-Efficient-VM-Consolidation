@echo off
echo ================================================================================
echo ⚛️  REACT FRONTEND STARTUP
echo ================================================================================
echo Starting React development server...
echo ================================================================================

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

echo ✅ Node.js and npm detected
echo.

REM Install dependencies
echo 📦 Installing React dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Start React development server
echo ⚛️  Starting React development server...
echo This may take 30-60 seconds to compile...
echo.
echo 📱 React app will be available at: http://localhost:3000
echo 🛑 Press Ctrl+C to stop the server
echo.

npm start

echo.
echo 👋 React server stopped.
pause
