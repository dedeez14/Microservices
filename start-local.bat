@echo off
echo ========================================
echo    ERP Microservices Local Development
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js version 18 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available!
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

REM Create environment files if they don't exist
if not exist "warehouse-service\.env" (
    echo 📝 Creating warehouse-service .env file...
    copy "warehouse-service\.env.example" "warehouse-service\.env"
)

if not exist "api-gateway\.env" (
    echo 📝 Creating api-gateway .env file...
    copy "api-gateway\.env.example" "api-gateway\.env"
)

echo 📦 Installing dependencies...
echo.

REM Install warehouse service dependencies
echo Installing warehouse-service dependencies...
cd warehouse-service
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install warehouse-service dependencies
    pause
    exit /b 1
)
cd ..

REM Install API gateway dependencies
echo Installing api-gateway dependencies...
cd api-gateway
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install api-gateway dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ All dependencies installed successfully!
echo.

echo ========================================
echo    🚀 Starting Services
echo ========================================
echo.
echo ⚠️ IMPORTANT: Make sure you have MongoDB and Redis running locally:
echo   📄 MongoDB: mongod --dbpath data/db
echo   🔄 Redis: redis-server
echo.
echo Services will start in separate windows...
echo Close this window or press Ctrl+C to stop all services.
echo.

REM Start services in separate windows
echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Warehouse Service...
start "Warehouse Service" cmd /k "cd warehouse-service && npm run dev"

echo.
echo ========================================
echo    🎉 Services Started!
echo ========================================
echo.
echo 🌐 Services:
echo   📊 API Gateway:     http://localhost:3000
echo   📦 Warehouse API:   http://localhost:3001
echo.
echo 📚 Documentation:
echo   📖 API Gateway:     http://localhost:3000/api-docs
echo   📖 Warehouse:       http://localhost:3001/api-docs
echo.
echo 🔗 API Endpoints:
echo   📦 Warehouse:       http://localhost:3000/api/warehouse
echo   🏥 Health Check:    http://localhost:3000/health
echo.
echo 🛠️ Development Commands:
echo   🧪 Run tests:       npm test (in service directory)
echo   🔍 Lint code:       npm run lint (in service directory)
echo   🌱 Seed data:       npm run seed (in warehouse-service directory)
echo.

pause
