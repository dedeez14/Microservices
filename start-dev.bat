@echo off
echo ========================================
echo    ERP Microservices Development Setup
echo ========================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available!
    echo Please make sure Docker Compose is installed.
    pause
    exit /b 1
)

echo ✅ Docker is available
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

echo 🔧 Setting up development environment...
echo.

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start services
echo 🚀 Building and starting services...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start services!
    echo Check the error messages above and try again.
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for services to start up...
timeout /t 15 /nobreak >nul

REM Check service health
echo 🏥 Checking service health...
echo.

echo Checking API Gateway...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API Gateway is healthy
) else (
    echo ⚠️ API Gateway might still be starting up
)

echo.
echo Checking Warehouse Service...
curl -s http://localhost:3001/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Warehouse Service is healthy
) else (
    echo ⚠️ Warehouse Service might still be starting up
)

echo.
echo ========================================
echo    🎉 ERP Microservices Started!
echo ========================================
echo.
echo 🌐 Services:
echo   📊 API Gateway:     http://localhost:3000
echo   📦 Warehouse API:   http://localhost:3001
echo   🗄️  MongoDB:        localhost:27017
echo   🔄 Redis:          localhost:6379
echo   🐰 RabbitMQ:       http://localhost:15672 (admin/admin123)
echo.
echo 📚 Documentation:
echo   📖 API Gateway:     http://localhost:3000/api-docs
echo   📖 Warehouse:       http://localhost:3001/api-docs
echo.
echo 🔗 API Endpoints:
echo   📦 Warehouse:       http://localhost:3000/api/warehouse
echo   🏥 Health Check:    http://localhost:3000/health
echo.
echo ⚙️ Management:
echo   📊 View logs:       docker-compose logs -f
echo   🛑 Stop services:   docker-compose down
echo   🔄 Restart:         docker-compose restart
echo   🧹 Clean up:        docker-compose down -v
echo.

REM Offer to seed data
echo.
set /p seed="🌱 Do you want to seed sample data? (y/n): "
if /i "%seed%"=="y" (
    echo.
    echo 🌱 Seeding sample data...
    docker-compose exec warehouse-service npm run seed
    if %errorlevel% equ 0 (
        echo ✅ Sample data seeded successfully!
    ) else (
        echo ⚠️ Failed to seed data. You can try manually later with: docker-compose exec warehouse-service npm run seed
    )
)

echo.
echo Press any key to exit...
pause >nul
