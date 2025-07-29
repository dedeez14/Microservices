@echo off
echo 🔍 Testing Single Port Frontend Solution...
echo ==========================================

echo.
echo 📋 Testing Configuration:
echo ➤ Main Frontend Port: 5173
echo ➤ Background User Service: 5174
echo ➤ Expected URLs:
echo   - Launcher:   http://localhost:5173
echo   - Warehouse:  http://localhost:5173/warehouse
echo   - User:       http://localhost:5174 (via launcher)

echo.
echo 🌐 Testing Main Frontend (Port 5173)...
curl -s -I http://localhost:5173 | find "HTTP" >nul
if errorlevel 1 (
    echo ❌ Main Frontend: Offline
    echo 💡 Run: start-single-frontend.bat
) else (
    echo ✅ Main Frontend: Online
)

echo.
echo 👥 Testing User Service (Port 5174)...
curl -s -I http://localhost:5174 | find "HTTP" >nul
if errorlevel 1 (
    echo ❌ User Service: Offline  
    echo 💡 Should start automatically with main frontend
) else (
    echo ✅ User Service: Online
)

echo.
echo 🏭 Testing Warehouse Route...
curl -s -I http://localhost:5173/warehouse | find "HTTP" >nul
if errorlevel 1 (
    echo ❌ Warehouse Route: Not responding
) else (
    echo ✅ Warehouse Route: Working
)

echo.
echo 🔧 Testing Backend Services...
curl -s http://localhost:3000/health >nul
if errorlevel 1 (
    echo ❌ API Gateway: Offline
) else (
    echo ✅ API Gateway: Online
)

echo.
echo 🎯 Testing Results:
echo ==================
echo.
echo 📱 Frontend Access URLs:
echo ➤ Main App:     http://localhost:5173
echo ➤ Launcher:     http://localhost:5173/
echo ➤ Warehouse:    http://localhost:5173/warehouse
echo ➤ System Health: http://localhost:3000/health
echo.
echo 💻 Quick Start:
echo   start-single-frontend.bat
echo.
pause
