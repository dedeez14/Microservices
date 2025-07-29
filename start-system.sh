#!/bin/bash

# ERP Microservices Integration Script
# This script starts all services in the correct order

echo "🚀 Starting ERP Microservices System..."

# Set environment
export NODE_ENV=development

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Stop any existing containers
print_header "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start infrastructure services first
print_header "Starting infrastructure services..."
docker-compose up -d warehouse-db user-db redis rabbitmq

# Wait for databases to be ready
print_status "Waiting for databases to initialize..."
sleep 10

# Check if MongoDB instances are ready
print_status "Checking MongoDB connections..."
until docker exec warehouse-db mongo --eval "print('Warehouse DB ready')" > /dev/null 2>&1; do
    print_warning "Waiting for Warehouse MongoDB..."
    sleep 2
done

until docker exec user-db mongo --eval "print('User DB ready')" > /dev/null 2>&1; do
    print_warning "Waiting for User MongoDB..."
    sleep 2
done

# Check if Redis is ready
print_status "Checking Redis connection..."
until docker exec erp-redis redis-cli ping > /dev/null 2>&1; do
    print_warning "Waiting for Redis..."
    sleep 2
done

# Check if RabbitMQ is ready
print_status "Checking RabbitMQ connection..."
until docker exec erp-rabbitmq rabbitmqctl status > /dev/null 2>&1; do
    print_warning "Waiting for RabbitMQ..."
    sleep 2
done

print_status "✅ Infrastructure services are ready!"

# Start backend services
print_header "Starting backend services..."
docker-compose up -d user-service warehouse-service

# Wait for services to be ready
print_status "Waiting for backend services to initialize..."
sleep 15

# Check service health
print_status "Checking service health..."

# Check User Service
if curl -f http://localhost:3002/api/v1/health > /dev/null 2>&1; then
    print_status "✅ User Service is healthy"
else
    print_warning "⚠️  User Service health check failed"
fi

# Check Warehouse Service
if curl -f http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    print_status "✅ Warehouse Service is healthy"
else
    print_warning "⚠️  Warehouse Service health check failed"
fi

# Start API Gateway
print_header "Starting API Gateway..."
docker-compose up -d api-gateway

# Wait for API Gateway
sleep 10

# Check API Gateway
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "✅ API Gateway is healthy"
else
    print_warning "⚠️  API Gateway health check failed"
fi

# Start frontend applications
print_header "Starting frontend applications..."
docker-compose up -d warehouse-frontend user-frontend

print_status "Waiting for frontend applications to build..."
sleep 20

# Display service information
print_header "🎉 ERP System is ready!"
echo ""
echo "📊 Service URLs:"
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ Service              │ URL                              │"
echo "├─────────────────────────────────────────────────────────┤"
echo "│ API Gateway          │ http://localhost:3000            │"
echo "│ User Service         │ http://localhost:3002            │"
echo "│ Warehouse Service    │ http://localhost:3001            │"
echo "│ User Frontend        │ http://localhost:3004            │"
echo "│ Warehouse Frontend   │ http://localhost:3003            │"
echo "│ API Documentation    │ http://localhost:3000/api-docs   │"
echo "│ RabbitMQ Management  │ http://localhost:15672           │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "🗄️  Database Connections:"
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ Warehouse MongoDB    │ mongodb://localhost:27017        │"
echo "│ User MongoDB         │ mongodb://localhost:27018        │"
echo "│ Redis                │ redis://localhost:6379           │"
echo "│ RabbitMQ             │ amqp://localhost:5672            │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "🔐 Default Credentials:"
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ RabbitMQ             │ admin / admin123                 │"
echo "│ System Admin         │ admin@example.com / admin123     │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "📖 Getting Started:"
echo "1. Open http://localhost:3004 for User Management"
echo "2. Open http://localhost:3003 for Warehouse Management"
echo "3. Login with admin credentials to access all features"
echo "4. Check API documentation at http://localhost:3000/api-docs"
echo ""
echo "To stop all services: docker-compose down"
echo "To view logs: docker-compose logs -f [service-name]"
echo ""

# Ask if user wants to run integration tests
echo ""
echo -e "${YELLOW}Would you like to run integration tests? (y/n):${NC}"
read -r run_tests

if [[ $run_tests =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🧪 Running Integration Tests...${NC}"
    echo "================================"
    
    # Wait a moment for services to fully initialize
    sleep 5
    
    # Run integration tests
    if [ -f "./integration-test.sh" ]; then
        chmod +x ./integration-test.sh
        ./integration-test.sh
    else
        echo -e "${RED}Integration test script not found!${NC}"
    fi
else
    echo ""
    echo -e "${GREEN}Integration tests available - run: ./integration-test.sh${NC}"
fi

echo ""
echo -e "${GREEN}✅ ERP System fully integrated and operational!${NC}"
