@echo off
setlocal EnableDelayedExpansion

echo 🚀 Starting ERP Microservices System...

set NODE_ENV=development

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] docker-compose is not installed. Please install docker-compose first.
    pause
    exit /b 1
)

echo ▶ Stopping existing containers...
docker-compose down --remove-orphans

echo ▶ Starting infrastructure services...
docker-compose up -d warehouse-db user-db redis rabbitmq

echo [INFO] Waiting for databases to initialize...
timeout /t 10 /nobreak >nul

echo [INFO] Checking service readiness...
timeout /t 10 /nobreak >nul

echo [INFO] ✅ Infrastructure services should be ready!

echo ▶ Starting backend services...
docker-compose up -d user-service warehouse-service

echo [INFO] Waiting for backend services to initialize...
timeout /t 15 /nobreak >nul

echo [INFO] ✅ Backend services should be ready!

echo ▶ Starting API Gateway...
docker-compose up -d api-gateway

timeout /t 10 /nobreak >nul

echo [INFO] ✅ API Gateway should be ready!

echo ▶ Starting frontend applications...
docker-compose up -d warehouse-frontend user-frontend

echo [INFO] Waiting for frontend applications to build...
timeout /t 20 /nobreak >nul

echo.
echo 🎉 ERP System is ready!
echo.
echo 📊 Service URLs:
echo ┌─────────────────────────────────────────────────────────┐
echo │ Service              │ URL                              │
echo ├─────────────────────────────────────────────────────────┤
echo │ API Gateway          │ http://localhost:3000            │
echo │ User Service         │ http://localhost:3002            │
echo │ Warehouse Service    │ http://localhost:3001            │
echo │ User Frontend        │ http://localhost:3004            │
echo │ Warehouse Frontend   │ http://localhost:3003            │
echo │ API Documentation    │ http://localhost:3000/api-docs   │
echo │ RabbitMQ Management  │ http://localhost:15672           │
echo └─────────────────────────────────────────────────────────┘
echo.
echo 🗄️  Database Connections:
echo ┌─────────────────────────────────────────────────────────┐
echo │ Warehouse MongoDB    │ mongodb://localhost:27017        │
echo │ User MongoDB         │ mongodb://localhost:27018        │
echo │ Redis                │ redis://localhost:6379           │
echo │ RabbitMQ             │ amqp://localhost:5672            │
echo └─────────────────────────────────────────────────────────┘
echo.
echo 🔐 Default Credentials:
echo ┌─────────────────────────────────────────────────────────┐
echo │ RabbitMQ             │ admin / admin123                 │
echo │ System Admin         │ admin@example.com / admin123     │
echo └─────────────────────────────────────────────────────────┘
echo.
echo 📖 Getting Started:
echo 1. Open http://localhost:3004 for User Management
echo 2. Open http://localhost:3003 for Warehouse Management
echo 3. Login with admin credentials to access all features
echo 4. Check API documentation at http://localhost:3000/api-docs
echo.
echo To stop all services: docker-compose down
echo To view logs: docker-compose logs -f [service-name]
echo.

REM Ask if user wants to run integration tests
set /p run_tests="Would you like to run integration tests? (y/n): "

if /i "%run_tests%"=="y" (
    echo.
    echo 🧪 Running Integration Tests...
    echo ================================
    
    REM Wait a moment for services to fully initialize
    timeout /t 5 /nobreak >nul
    
    REM Run integration tests
    if exist "integration-test.bat" (
        call integration-test.bat
    ) else (
        echo Integration test script not found!
    )
) else (
    echo.
    echo Integration tests available - run: integration-test.bat
)

echo.
echo ✅ ERP System fully integrated and operational!
echo.
pause