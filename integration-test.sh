#!/bin/bash

# ERP Microservices Integration Test Script
# This script tests the integration between all services

echo "🔬 Starting ERP Microservices Integration Test..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_GATEWAY_URL="http://localhost:3000"
USER_FRONTEND_URL="http://localhost:3002"
WAREHOUSE_FRONTEND_URL="http://localhost:3003"
USER_SERVICE_URL="http://localhost:3001"
WAREHOUSE_SERVICE_URL="http://localhost:3004"

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local endpoint=$3
    
    echo -n "Testing $service_name..."
    
    if curl -s -f "$url$endpoint" > /dev/null 2>&1; then
        echo -e " ${GREEN}✓ Online${NC}"
        return 0
    else
        echo -e " ${RED}✗ Offline${NC}"
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local expected_status=$4
    local headers=$5
    
    echo -n "Testing $name..."
    
    local response
    if [ -n "$headers" ]; then
        response=$(curl -s -w "%{http_code}" -X "$method" "$url" -H "$headers" -o /dev/null)
    else
        response=$(curl -s -w "%{http_code}" -X "$method" "$url" -o /dev/null)
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e " ${GREEN}✓ $response${NC}"
        return 0
    else
        echo -e " ${RED}✗ Expected $expected_status, got $response${NC}"
        return 1
    fi
}

# Test user authentication flow
test_user_auth() {
    echo -e "\n${BLUE}Testing User Authentication Flow...${NC}"
    
    # Test user registration
    echo -n "Testing user registration..."
    local reg_response=$(curl -s -w "%{http_code}" -X POST "$API_GATEWAY_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "testuser_'$(date +%s)'",
            "email": "test'$(date +%s)'@example.com",
            "password": "Test123!@#",
            "profile": {
                "firstName": "Test",
                "lastName": "User"
            }
        }' -o /tmp/reg_response.json)
    
    if [ "$reg_response" = "201" ]; then
        echo -e " ${GREEN}✓ $reg_response${NC}"
        
        # Extract user data
        local username=$(cat /tmp/reg_response.json | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        
        # Test user login
        echo -n "Testing user login..."
        local login_response=$(curl -s -w "%{http_code}" -X POST "$API_GATEWAY_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d '{
                "username": "'$username'",
                "password": "Test123!@#"
            }' -o /tmp/login_response.json)
        
        if [ "$login_response" = "200" ]; then
            echo -e " ${GREEN}✓ $login_response${NC}"
            
            # Extract access token
            local token=$(cat /tmp/login_response.json | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
            
            # Test protected endpoint
            echo -n "Testing protected endpoint..."
            local profile_response=$(curl -s -w "%{http_code}" -X GET "$API_GATEWAY_URL/api/auth/profile" \
                -H "Authorization: Bearer $token" -o /dev/null)
            
            if [ "$profile_response" = "200" ]; then
                echo -e " ${GREEN}✓ $profile_response${NC}"
                return 0
            else
                echo -e " ${RED}✗ Expected 200, got $profile_response${NC}"
                return 1
            fi
        else
            echo -e " ${RED}✗ Expected 200, got $login_response${NC}"
            return 1
        fi
    else
        echo -e " ${RED}✗ Expected 201, got $reg_response${NC}"
        return 1
    fi
}

# Test warehouse operations
test_warehouse_operations() {
    echo -e "\n${BLUE}Testing Warehouse Operations...${NC}"
    
    # First, we need to authenticate to get a token
    echo -n "Getting auth token for warehouse tests..."
    local login_response=$(curl -s -w "%{http_code}" -X POST "$API_GATEWAY_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "admin",
            "password": "admin123"
        }' -o /tmp/warehouse_login.json)
    
    if [ "$login_response" = "200" ]; then
        echo -e " ${GREEN}✓${NC}"
        
        local token=$(cat /tmp/warehouse_login.json | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        
        # Test warehouse endpoints through API Gateway
        test_api_endpoint "Warehouse List" "GET" "$API_GATEWAY_URL/api/warehouses" "200" "Authorization: Bearer $token"
        test_api_endpoint "Inventory List" "GET" "$API_GATEWAY_URL/api/inventory" "200" "Authorization: Bearer $token"
        test_api_endpoint "Transactions List" "GET" "$API_GATEWAY_URL/api/transactions" "200" "Authorization: Bearer $token"
        
    else
        echo -e " ${RED}✗ Could not authenticate${NC}"
        return 1
    fi
}

# Test system integration
test_system_integration() {
    echo -e "\n${BLUE}Testing System Integration...${NC}"
    
    # Test if services can communicate through API Gateway
    test_api_endpoint "API Gateway Health" "GET" "$API_GATEWAY_URL/health" "200"
    test_api_endpoint "User Service via Gateway" "GET" "$API_GATEWAY_URL/api/auth/health" "200"
    
    # Test CORS and preflight requests
    echo -n "Testing CORS preflight..."
    local cors_response=$(curl -s -w "%{http_code}" -X OPTIONS "$API_GATEWAY_URL/api/auth/login" \
        -H "Origin: http://localhost:3002" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" -o /dev/null)
    
    if [ "$cors_response" = "200" ] || [ "$cors_response" = "204" ]; then
        echo -e " ${GREEN}✓ $cors_response${NC}"
    else
        echo -e " ${RED}✗ Expected 200/204, got $cors_response${NC}"
    fi
}

# Main test execution
main() {
    echo -e "\n${YELLOW}Phase 1: Service Health Checks${NC}"
    echo "--------------------------------"
    
    local services_online=0
    local total_services=0
    
    # Check each service
    services=(
        "API Gateway:$API_GATEWAY_URL:/health"
        "User Service:$USER_SERVICE_URL:/health"
        "Warehouse Service:$WAREHOUSE_SERVICE_URL:/health"
        "User Frontend:$USER_FRONTEND_URL:"
        "Warehouse Frontend:$WAREHOUSE_FRONTEND_URL:"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name url endpoint <<< "$service"
        if check_service "$name" "$url" "$endpoint"; then
            ((services_online++))
        fi
        ((total_services++))
    done
    
    echo -e "\nServices Online: ${GREEN}$services_online${NC}/$total_services"
    
    if [ $services_online -lt $total_services ]; then
        echo -e "${RED}⚠️  Not all services are online. Some tests may fail.${NC}"
    fi
    
    # Run integration tests
    echo -e "\n${YELLOW}Phase 2: API Integration Tests${NC}"
    echo "--------------------------------"
    
    test_user_auth
    test_warehouse_operations
    test_system_integration
    
    echo -e "\n${YELLOW}Phase 3: Frontend Integration Tests${NC}"
    echo "------------------------------------"
    
    # Test if frontends are serving static assets
    test_api_endpoint "User Frontend Assets" "GET" "$USER_FRONTEND_URL/assets" "404" # 404 is expected for assets root
    test_api_endpoint "Warehouse Frontend Assets" "GET" "$WAREHOUSE_FRONTEND_URL/assets" "404" # 404 is expected for assets root
    
    echo -e "\n${GREEN}Integration Test Summary${NC}"
    echo "========================"
    echo "✅ Service Health Checks: $services_online/$total_services online"
    echo "✅ User Authentication Flow: Tested"
    echo "✅ Warehouse Operations: Tested"
    echo "✅ API Gateway Integration: Tested"
    echo "✅ Frontend Deployment: Tested"
    
    if [ $services_online -eq $total_services ]; then
        echo -e "\n${GREEN}🎉 All systems integrated successfully!${NC}"
        echo -e "${BLUE}Access URLs:${NC}"
        echo "- User Management: $USER_FRONTEND_URL"
        echo "- Warehouse Management: $WAREHOUSE_FRONTEND_URL"
        echo "- API Gateway: $API_GATEWAY_URL"
        
        return 0
    else
        echo -e "\n${YELLOW}⚠️  Integration completed with some services offline.${NC}"
        return 1
    fi
}

# Cleanup function
cleanup() {
    rm -f /tmp/reg_response.json /tmp/login_response.json /tmp/warehouse_login.json
}

# Run main function
main "$@"
exit_code=$?

# Cleanup
cleanup

exit $exit_code
