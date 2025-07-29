@echo off
REM ERP Microservices Demo Script for Windows
REM This script demonstrates the working warehouse microservice

echo =====================================
echo ERP Microservices System Demo
echo =====================================
echo.

echo 1. Testing API Gateway Health...
curl -s http://localhost:3000/health
echo.
echo.

echo 2. Testing Warehouse Service Health (Direct)...
curl -s http://localhost:3001/api/v1/health
echo.
echo.

echo 3. Testing Warehouse Service Health (via API Gateway)...
curl -s http://localhost:3000/api/warehouse/health
echo.
echo.

echo 4. Getting All Warehouses...
curl -s http://localhost:3000/api/warehouse/warehouses
echo.
echo.

echo 5. Testing Warehouse Locations...
curl -s http://localhost:3000/api/warehouse/locations
echo.
echo.

echo 6. Container Status...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo =====================================
echo Demo Complete!
echo =====================================
echo.
echo Available endpoints:
echo - API Gateway: http://localhost:3000
echo - Warehouse Service: http://localhost:3001
echo - MongoDB: http://localhost:27017
echo - Redis: http://localhost:6379
echo - RabbitMQ Management: http://localhost:15672
echo.
echo Key API Routes:
echo - GET  /api/warehouse/warehouses     - List all warehouses
echo - POST /api/warehouse/warehouses     - Create warehouse
echo - GET  /api/warehouse/warehouses/:id - Get warehouse by ID
echo - PUT  /api/warehouse/warehouses/:id - Update warehouse
echo - DELETE /api/warehouse/warehouses/:id - Delete warehouse
echo - GET  /api/warehouse/locations      - List all locations
echo - GET  /api/warehouse/inventory      - List inventory items
echo - POST /api/warehouse/transfers      - Create inventory transfer
echo.
echo API Documentation:
echo - API Gateway Docs: http://localhost:3000/api-docs
echo - Warehouse Service Docs: http://localhost:3001/api-docs
echo.
pause
