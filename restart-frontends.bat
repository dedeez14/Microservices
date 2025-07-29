@echo off
echo 🔄 Restarting Frontend Applications...
echo =====================================

REM Kill any existing Node.js processes (be careful with this)
echo 🛑 Stopping existing frontend processes...
taskkill /f /im node.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak > nul

echo ✅ Starting fresh frontend instances...

REM Start Warehouse Frontend (Port 5173)
echo 📦 Starting Warehouse Frontend on port 5173...
start "Warehouse Frontend" cmd /k "cd /d c:\Project\microservices\frontend && npm run dev"

REM Wait a moment
timeout /t 3 /nobreak > nul

REM Start User Frontend (Port 5174) 
echo 👥 Starting User Frontend on port 5174...
start "User Frontend" cmd /k "cd /d c:\Project\microservices\user-frontend && npm run dev -- --port 5174"

echo.
echo 🎉 Frontend applications restarted!
echo.
echo 📋 Available URLs:
echo ➤ Warehouse Frontend: http://localhost:5173
echo ➤ User Frontend:      http://localhost:5174
echo.
echo ⚠️  Frontend applications will open in separate command windows.
echo.
pause
