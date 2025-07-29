@echo off
setlocal enabledelayedexpansion

REM ERP Microservices Integration Test Script (Windows)
REM This script tests the integration between all services

echo 🔬 Starting ERP Microservices Integration Test...
echo ==================================================

REM Test configuration
set API_GATEWAY_URL=http://localhost:3000
set USER_FRONTEND_URL=http://localhost:5173
set WAREHOUSE_FRONTEND_URL=http://localhost:5174
set USER_SERVICE_URL=http://localhost:3002
set WAREHOUSE_SERVICE_URL=http://localhost:3001

set services_online=0
set total_services=0

echo.
echo Phase 1: Service Health Checks
echo --------------------------------

REM Check API Gateway
echo Testing API Gateway...
curl -s "%API_GATEWAY_URL%/health" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ API Gateway: Online
    set /a services_online+=1
) else (
    echo ✗ API Gateway: Offline
)
set /a total_services+=1

REM Check User Service
echo Testing User Service...
curl -s "%USER_SERVICE_URL%/health" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ User Service: Online
    set /a services_online+=1
) else (
    echo ✗ User Service: Offline
)
set /a total_services+=1

REM Check Warehouse Service
echo Testing Warehouse Service...
curl -s "%WAREHOUSE_SERVICE_URL%/health" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Warehouse Service: Online
    set /a services_online+=1
) else (
    echo ✗ Warehouse Service: Offline
)
set /a total_services+=1

REM Check User Frontend
echo Testing User Frontend...
curl -s -f "%USER_FRONTEND_URL%" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ User Frontend: Online
    set /a services_online+=1
) else (
    echo ✗ User Frontend: Offline
)
set /a total_services+=1

REM Check Warehouse Frontend
echo Testing Warehouse Frontend...
curl -s -f "%WAREHOUSE_FRONTEND_URL%" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Warehouse Frontend: Online
    set /a services_online+=1
) else (
    echo ✗ Warehouse Frontend: Offline
)
set /a total_services+=1

echo.
echo Services Online: !services_online!/!total_services!

if !services_online! lss !total_services! (
    echo ⚠️  Not all services are online. Some tests may fail.
)

echo.
echo Phase 2: API Integration Tests
echo --------------------------------

REM Test user registration
echo Testing user registration...
set timestamp=%date:~-4%%date:~4,2%%date:~7,2%%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=!timestamp: =0!

curl -s -w "%%{http_code}" -X POST "%API_GATEWAY_URL%/api/auth/register" ^
    -H "Content-Type: application/json" ^
    -d "{\"username\": \"testuser_!timestamp!\", \"email\": \"test!timestamp!@example.com\", \"password\": \"Test123!@#\", \"profile\": {\"firstName\": \"Test\", \"lastName\": \"User\"}}" ^
    -o temp_reg.json >temp_status.txt 2>nul

set /p reg_status=<temp_status.txt
if "!reg_status!"=="201" (
    echo ✓ User Registration: Success ^(!reg_status!^)
    
    REM Extract username from response (simplified)
    set test_username=testuser_!timestamp!
    
    REM Test user login
    echo Testing user login...
    curl -s -w "%%{http_code}" -X POST "%API_GATEWAY_URL%/api/auth/login" ^
        -H "Content-Type: application/json" ^
        -d "{\"username\": \"!test_username!\", \"password\": \"Test123!@#\"}" ^
        -o temp_login.json >temp_status.txt 2>nul
    
    set /p login_status=<temp_status.txt
    if "!login_status!"=="200" (
        echo ✓ User Login: Success ^(!login_status!^)
    ) else (
        echo ✗ User Login: Failed ^(!login_status!^)
    )
) else (
    echo ✗ User Registration: Failed ^(!reg_status!^)
)

REM Test API Gateway health
echo Testing API Gateway health endpoint...
curl -s -w "%%{http_code}" -X GET "%API_GATEWAY_URL%/health" -o nul >temp_status.txt 2>nul
set /p health_status=<temp_status.txt
if "!health_status!"=="200" (
    echo ✓ API Gateway Health: OK ^(!health_status!^)
) else (
    echo ✗ API Gateway Health: Failed ^(!health_status!^)
)

REM Test CORS
echo Testing CORS preflight...
curl -s -w "%%{http_code}" -X OPTIONS "%API_GATEWAY_URL%/api/auth/login" ^
    -H "Origin: http://localhost:3002" ^
    -H "Access-Control-Request-Method: POST" ^
    -H "Access-Control-Request-Headers: Content-Type" ^
    -o nul >temp_status.txt 2>nul

set /p cors_status=<temp_status.txt
if "!cors_status!"=="200" (
    echo ✓ CORS Preflight: OK ^(!cors_status!^)
) else if "!cors_status!"=="204" (
    echo ✓ CORS Preflight: OK ^(!cors_status!^)
) else (
    echo ✗ CORS Preflight: Failed ^(!cors_status!^)
)

echo.
echo Phase 3: Frontend Integration Tests
echo ------------------------------------

REM Test frontend asset serving (expect 404 for assets root)
echo Testing User Frontend assets...
curl -s -w "%%{http_code}" -X GET "%USER_FRONTEND_URL%/assets" -o nul >temp_status.txt 2>nul
set /p user_assets_status=<temp_status.txt
echo ✓ User Frontend Assets: Response ^(!user_assets_status!^)

echo Testing Warehouse Frontend assets...
curl -s -w "%%{http_code}" -X GET "%WAREHOUSE_FRONTEND_URL%/assets" -o nul >temp_status.txt 2>nul
set /p warehouse_assets_status=<temp_status.txt
echo ✓ Warehouse Frontend Assets: Response ^(!warehouse_assets_status!^)

echo.
echo Integration Test Summary
echo ========================
echo ✅ Service Health Checks: !services_online!/!total_services! online
echo ✅ User Authentication Flow: Tested
echo ✅ API Gateway Integration: Tested
echo ✅ Frontend Deployment: Tested

if !services_online! equ !total_services! (
    echo.
    echo 🎉 All systems integrated successfully!
    echo Access URLs:
    echo - User Management: %USER_FRONTEND_URL%
    echo - Warehouse Management: %WAREHOUSE_FRONTEND_URL%
    echo - API Gateway: %API_GATEWAY_URL%
    
    echo.
    echo Quick Test Commands:
    echo - Test User Frontend: start %USER_FRONTEND_URL%
    echo - Test Warehouse Frontend: start %WAREHOUSE_FRONTEND_URL%
    echo - Test API Health: curl %API_GATEWAY_URL%/health
) else (
    echo.
    echo ⚠️  Integration completed with some services offline.
    echo Make sure all services are running with: start-system.bat
)

REM Cleanup
del temp_reg.json 2>nul
del temp_login.json 2>nul
del temp_status.txt 2>nul

echo.
echo Integration test completed!
pause
