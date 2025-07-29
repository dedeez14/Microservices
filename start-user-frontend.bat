@echo off
echo 👥 Starting User Frontend...
echo ==========================

cd /d c:\Project\microservices\user-frontend

echo 🔧 Checking dependencies...
if not exist node_modules (
    echo ⬇️  Installing dependencies...
    npm install
)

REM Check and install PostCSS dependencies if missing
npm list autoprefixer >nul 2>&1
if errorlevel 1 (
    echo 🔧 Installing PostCSS dependencies...
    npm install --save-dev autoprefixer postcss
)

echo 🚀 Starting development server on port 5174...
echo 📄 URL: http://localhost:5174
echo.
echo ⚠️  Press Ctrl+C to stop the server
echo.

npm run dev -- --port 5174
