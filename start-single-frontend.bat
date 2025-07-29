@echo off
echo 🚀 Starting Integrated ERP Frontend...
echo =====================================

echo.
echo 🛑 Stopping existing frontend processes...
taskkill /f /im node.exe 2>nul
echo ✅ Existing processes stopped

echo.
echo 📋 Configuration:
echo ➤ Main Frontend:     Port 5173
echo ➤ User Module:       http://localhost:5173 → http://localhost:5174
echo ➤ Warehouse Module:  http://localhost:5173/warehouse
echo ➤ App Launcher:      http://localhost:5173

echo.
echo 🔧 Starting backend user service (needed for user module)...
cd /d c:\Project\microservices\user-frontend
start /min "User Frontend Backend" cmd /k "npm run dev -- --port 5174"

echo.
echo ⏳ Waiting for services to start...
timeout /t 8 /nobreak > nul

echo.
echo 👤 Creating test users for login...
cd /d c:\Project\microservices
call create-test-users.bat

echo.
echo 🏭 Starting main warehouse frontend with integrated launcher...
cd /d c:\Project\microservices\frontend
echo 🚀 Starting development server on port 5173...
echo.
echo 📄 Access URLs:
echo ➤ Main Application: http://localhost:5173
echo ➤ Warehouse Module: http://localhost:5173/warehouse  
echo ➤ User Module:      Click link in launcher (opens in new tab)
echo.
echo ⚠️  Press Ctrl+C to stop the server
echo.

npm run dev
