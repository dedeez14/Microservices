@echo off
echo 🚀 Starting ERP Frontend Applications...
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is available

REM Start Warehouse Frontend (Port 5173)
echo.
echo 📦 Starting Warehouse Frontend on port 5173...
start "Warehouse Frontend" cmd /k "cd /d c:\Project\microservices\frontend && npm run dev"

REM Wait a moment
timeout /t 3 /nobreak > nul

REM Start User Frontend (Port 5174)
echo.
echo 👥 Starting User Frontend on port 5174...
start "User Frontend" cmd /k "cd /d c:\Project\microservices\user-frontend && npm run dev -- --port 5174"

echo.
echo 🎉 Frontend applications are starting...
echo.
echo 📋 Available URLs:
echo ➤ Warehouse Frontend: http://localhost:5173
echo ➤ User Frontend:      http://localhost:5174
echo ➤ API Gateway:        http://localhost:3000
echo ➤ User Service:       http://localhost:3002
echo ➤ Warehouse Service:  http://localhost:3001
echo.
echo ⚠️  Note: Frontend applications will open in separate command windows.
echo    Close those windows to stop the frontend servers.
echo.
pause
