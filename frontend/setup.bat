@echo off
echo 🚀 Setting up Warehouse Management System Frontend...
echo ================================================

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Check if backend is running
echo 🔍 Checking backend API...
curl -s http://localhost:8080/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is running
) else (
    echo ⚠️  Backend API is not running on localhost:8080
    echo    Please make sure to start the backend services first:
    echo    cd ../.. && docker-compose up -d
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Available commands:
echo    npm run dev      - Start development server
echo    npm run build    - Build for production
echo    npm run preview  - Preview production build
echo    npm run lint     - Run ESLint
echo.
echo 🌐 Frontend will be available at:
echo    Development: http://localhost:3000
echo    Production:  http://localhost:3000 (with Docker)
echo.
echo 🚀 Start development with:
echo    npm run dev
echo.
pause
