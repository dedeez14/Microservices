@echo off
echo 🔍 Testing Frontend Applications...
echo ==================================

echo.
echo 📦 Testing Warehouse Frontend (Port 5173)...
curl -s -I http://localhost:5173 | find "HTTP" >nul
if errorlevel 1 (
    echo ❌ Warehouse Frontend: Offline
) else (
    echo ✅ Warehouse Frontend: Online
)

echo.
echo 👥 Testing User Frontend (Port 5174)...
curl -s -I http://localhost:5174 | find "HTTP" >nul
if errorlevel 1 (
    echo ❌ User Frontend: Offline
) else (
    echo ✅ User Frontend: Online
)

echo.
echo 🌐 Testing Backend Services...
echo.
echo 🚪 API Gateway (Port 3000)...
curl -s http://localhost:3000/health >nul
if errorlevel 1 (
    echo ❌ API Gateway: Offline
) else (
    echo ✅ API Gateway: Online
)

echo.
echo 👤 User Service (Port 3002)...
curl -s http://localhost:3002/health >nul
if errorlevel 1 (
    echo ❌ User Service: Offline
) else (
    echo ✅ User Service: Online
)

echo.
echo 📦 Warehouse Service (Port 3001)...
curl -s http://localhost:3001/health >nul
if errorlevel 1 (
    echo ❌ Warehouse Service: Offline
) else (
    echo ✅ Warehouse Service: Online
)

echo.
echo 🎯 Quick Access URLs:
echo ➤ Warehouse Frontend: http://localhost:5173
echo ➤ User Frontend:      http://localhost:5174
echo ➤ API Gateway:        http://localhost:3000
echo ➤ System Health:      http://localhost:3000/health
echo.
pause
