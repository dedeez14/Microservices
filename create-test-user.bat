@echo off
echo 🧪 Creating Test User for ERP System...
echo =====================================

echo.
echo 📋 Test User Configuration:
echo ➤ Email:    admin@erp.com
echo ➤ Password: admin123
echo ➤ Role:     admin
echo ➤ Name:     System Administrator

echo.
echo 🔧 Checking backend services...
curl -s http://localhost:3000/health >nul
if errorlevel 1 (
    echo ❌ Backend services not running!
    echo 💡 Please start backend services first:
    echo    docker-compose up -d
    pause
    exit /b 1
)

echo ✅ Backend services are running

echo.
echo 👤 Creating test user via API...
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@erp.com\",\"password\":\"admin123\",\"name\":\"System Administrator\",\"role\":\"admin\"}"

echo.
echo.
echo 🎯 Testing login with created user...
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@erp.com\",\"password\":\"admin123\"}"

echo.
echo.
echo ✅ Test user creation completed!
echo.
echo 📱 How to use:
echo 1. Open: http://localhost:5173
echo 2. Click "Login to Access Warehouse"
echo 3. Use credentials:
echo    Email:    admin@erp.com
echo    Password: admin123
echo.
pause
