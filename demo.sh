#!/bin/bash
# ERP Microservices Demo Script
# This script demonstrates the working warehouse microservice

echo "====================================="
echo "ERP Microservices System Demo"
echo "====================================="
echo ""

echo "1. Testing API Gateway Health..."
curl -s http://localhost:3000/health | jq .
echo ""

echo "2. Testing Warehouse Service Health (Direct)..."
curl -s http://localhost:3001/api/v1/health | jq .
echo ""

echo "3. Testing Warehouse Service Health (via API Gateway)..."
curl -s http://localhost:3000/api/warehouse/health | jq .
echo ""

echo "4. Getting All Warehouses..."
curl -s http://localhost:3000/api/warehouse/warehouses | jq .
echo ""

echo "5. Creating a new warehouse..."
curl -s -X POST http://localhost:3000/api/warehouse/warehouses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Warehouse",
    "code": "DEMO001",
    "type": "retail",
    "description": "Demo warehouse for testing",
    "location": {
      "address": "456 Demo Street",
      "city": "Bandung",
      "state": "West Java",
      "country": "Indonesia",
      "zipCode": "40123"
    },
    "capacity": {
      "totalArea": 2000,
      "usableArea": 1800,
      "unit": "sqm",
      "maxWeight": 8000,
      "weightUnit": "kg"
    },
    "contact": {
      "manager": {
        "name": "Demo Manager",
        "email": "demo@company.com",
        "phone": "+62987654321"
      }
    },
    "operatingHours": {
      "monday": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
      "tuesday": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
      "wednesday": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
      "thursday": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
      "friday": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
      "saturday": {"isOpen": true, "openTime": "10:00", "closeTime": "16:00"},
      "sunday": {"isOpen": false}
    }
  }' | jq .
echo ""

echo "6. Getting Updated Warehouse List..."
curl -s http://localhost:3000/api/warehouse/warehouses | jq .
echo ""

echo "7. Testing Warehouse Locations..."
curl -s http://localhost:3000/api/warehouse/locations | jq .
echo ""

echo "8. Testing API Documentation..."
echo "API Documentation available at: http://localhost:3000/api-docs"
echo "Warehouse Service Docs: http://localhost:3001/api-docs"
echo ""

echo "9. Container Status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "====================================="
echo "Demo Complete!"
echo "====================================="
echo ""
echo "Available endpoints:"
echo "- API Gateway: http://localhost:3000"
echo "- Warehouse Service: http://localhost:3001"
echo "- MongoDB: http://localhost:27017"
echo "- Redis: http://localhost:6379"
echo "- RabbitMQ Management: http://localhost:15672"
echo ""
echo "Key API Routes:"
echo "- GET  /api/warehouse/warehouses     - List all warehouses"
echo "- POST /api/warehouse/warehouses     - Create warehouse"
echo "- GET  /api/warehouse/warehouses/:id - Get warehouse by ID"
echo "- PUT  /api/warehouse/warehouses/:id - Update warehouse"
echo "- DELETE /api/warehouse/warehouses/:id - Delete warehouse"
echo "- GET  /api/warehouse/locations      - List all locations"
echo "- GET  /api/warehouse/inventory      - List inventory items"
echo "- POST /api/warehouse/transfers      - Create inventory transfer"
echo ""
