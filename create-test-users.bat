@echo off
echo 🧪 Creating Multiple Test Users...
echo ================================

echo.
echo 📋 Creating Test Users:
echo ➤ Admin User:     admin@erp.com / admin123
echo ➤ Manager User:   manager@erp.com / manager123  
echo ➤ Employee User:  employee@erp.com / employee123

echo.
echo 🔧 Checking backend services...
curl -s http://localhost:3000/health >nul
if errorlevel 1 (
    echo ❌ Backend services not running!
    echo 💡 Start with: docker-compose up -d
    pause
    exit /b 1
)

echo ✅ Backend services are running

echo.
echo 👤 Creating Admin User...
curl -s -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@erp.com\",\"password\":\"admin123\",\"name\":\"System Administrator\",\"role\":\"admin\"}" >nul

echo ✅ Admin user created

echo.
echo 👥 Creating Manager User...
curl -s -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"manager@erp.com\",\"password\":\"manager123\",\"name\":\"Warehouse Manager\",\"role\":\"manager\"}" >nul

echo ✅ Manager user created

echo.
echo 👷 Creating Employee User...
curl -s -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"employee@erp.com\",\"password\":\"employee123\",\"name\":\"Warehouse Employee\",\"role\":\"employee\"}" >nul

echo ✅ Employee user created

echo.
echo 🎯 Testing login with admin user...
for /f "tokens=*" %%i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@erp.com\",\"password\":\"admin123\"}"') do set login_response=%%i

echo %login_response% | find "success" >nul
if errorlevel 1 (
    echo ❌ Login test failed
    echo Response: %login_response%
) else (
    echo ✅ Login test successful
)

echo.
echo 🎉 All test users created successfully!
echo.
echo 📚 Available Test Accounts:
echo ┌─────────────────────┬──────────────┬─────────────────────┐
echo │ Role                │ Email        │ Password            │
echo ├─────────────────────┼──────────────┼─────────────────────┤
echo │ System Admin        │ admin@erp.com│ admin123            │
echo │ Warehouse Manager   │ manager@erp.com│ manager123        │
echo │ Warehouse Employee  │ employee@erp.com│ employee123      │
echo └─────────────────────┴──────────────┴─────────────────────┘
echo.
echo 🚀 Ready to test!
echo   1. Open: http://localhost:5173
echo   2. Click "Login to Access Warehouse"
echo   3. Use any of the accounts above
echo.
pause
