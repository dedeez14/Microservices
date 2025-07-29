@echo off
echo 🔗 Creating Integrated Frontend Setup...
echo =======================================

echo.
echo 📋 Current Frontend Setup:
echo ➤ User Frontend:      Port 5174
echo ➤ Warehouse Frontend: Port 5173
echo.
echo 🎯 New Integrated Setup:
echo ➤ Main Frontend:      Port 5173 (Single Port)
echo   ├── /user       → User Management
echo   ├── /warehouse  → Warehouse Management  
echo   └── /           → Dashboard/Landing
echo.

REM Stop existing frontend processes
echo 🛑 Stopping existing frontend processes...
taskkill /f /im node.exe 2>nul

echo.
echo 🔧 Setting up integrated routing...

REM Create integrated frontend structure
if not exist "integrated-frontend" (
    mkdir integrated-frontend
    cd integrated-frontend
    
    echo 📦 Initializing integrated frontend package...
    echo {> package.json
    echo   "name": "erp-integrated-frontend",>> package.json
    echo   "version": "1.0.0",>> package.json
    echo   "type": "module",>> package.json
    echo   "scripts": {>> package.json
    echo     "dev": "vite --port 5173 --host",>> package.json
    echo     "build": "vite build",>> package.json
    echo     "preview": "vite preview">> package.json
    echo   },>> package.json
    echo   "dependencies": {>> package.json
    echo     "react": "^18.3.1",>> package.json
    echo     "react-dom": "^18.3.1",>> package.json
    echo     "react-router-dom": "^6.26.1">> package.json
    echo   },>> package.json
    echo   "devDependencies": {>> package.json
    echo     "@vitejs/plugin-react": "^4.6.0",>> package.json
    echo     "vite": "^5.4.19">> package.json
    echo   }>> package.json
    echo }>> package.json
    
    cd ..
)

echo.
echo ✅ Integrated frontend structure ready!
echo.
echo 🚀 Next Steps:
echo 1. Run: npm install in integrated-frontend folder
echo 2. Configure routing for /user and /warehouse paths
echo 3. Start single frontend on port 5173
echo.
pause
