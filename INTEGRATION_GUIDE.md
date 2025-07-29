# ERP Microservices Integration Guide

## 🏗️ System Architecture

The ERP system consists of integrated microservices that work together to provide comprehensive business management functionality:

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer/Nginx                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Port 3000)                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐  │
│  │   Routing       │ │   Auth Guard    │ │ Rate Limiting │  │
│  │   Middleware    │ │   JWT Verify    │ │ & CORS        │  │
│  └─────────────────┘ └─────────────────┘ └───────────────┘  │
└─────────────┬─────────────────────┬─────────────────────────┘
              │                     │
    ┌─────────▼─────────┐ ┌─────────▼─────────┐
    │  User Service     │ │ Warehouse Service │
    │   (Port 3001)     │ │   (Port 3004)     │
    │                   │ │                   │
    │ ┌───────────────┐ │ │ ┌───────────────┐ │
    │ │ Authentication│ │ │ │   Inventory   │ │
    │ │ Authorization │ │ │ │  Management   │ │
    │ │ User CRUD     │ │ │ │  Transactions │ │
    │ │ Role RBAC     │ │ │ │  Warehouses   │ │
    │ │ Audit Logs    │ │ │ │   Reports     │ │
    │ └───────────────┘ │ │ └───────────────┘ │
    └─────────┬─────────┘ └─────────┬─────────┘
              │                     │
    ┌─────────▼─────────┐ ┌─────────▼─────────┐
    │  User Database    │ │Warehouse Database │
    │ MongoDB (27017)   │ │ MongoDB (27018)   │
    └───────────────────┘ └───────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────┬───────────────────────────────────┤
│   User Frontend         │   Warehouse Frontend              │
│   (Port 3002)           │   (Port 3003)                     │
│                         │                                   │
│ ┌─────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ React + TypeScript  │ │ │ React + TypeScript              │ │
│ │ Tailwind CSS        │ │ │ Tailwind CSS                    │ │
│ │ React Query         │ │ │ React Query                     │ │
│ │ React Router        │ │ │ React Router                    │ │
│ │ React Hook Form     │ │ │ React Hook Form                 │ │
│ │ Authentication UI   │ │ │ Inventory Management UI         │ │
│ │ User Management     │ │ │ Warehouse Operations UI         │ │
│ │ Role Management     │ │ │ Transaction Management          │ │
│ │ Audit Logs UI       │ │ │ Reporting Dashboard             │ │
│ │ System Integration  │ │ │ System Integration              │ │
│ └─────────────────────┘ │ └─────────────────────────────────┘ │
└─────────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               Infrastructure Services                       │
├─────────────────────────┬───────────────────────────────────┤
│    Redis Cache          │         RabbitMQ                  │
│    (Port 6379)          │       (Port 5672)                 │
│                         │                                   │
│ ┌─────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ Session Storage     │ │ │ Message Queue                   │ │
│ │ Token Blacklist     │ │ │ Event Processing                │ │
│ │ Rate Limiting       │ │ │ Async Operations                │ │
│ │ Caching Layer       │ │ │ Inter-service Communication     │ │
│ └─────────────────────┘ │ └─────────────────────────────────┘ │
└─────────────────────────┴───────────────────────────────────┘
```

## 🔗 Service Integration Points

### 1. API Gateway Integration
- **Route Mapping**: All API calls are routed through the gateway
- **Authentication**: JWT tokens validated at gateway level
- **CORS**: Configured for frontend origins
- **Proxy Routes**:
  - `/api/auth/*` → User Service
  - `/api/users/*` → User Service  
  - `/api/roles/*` → User Service
  - `/api/audit/*` → User Service
  - `/api/warehouses/*` → Warehouse Service
  - `/api/inventory/*` → Warehouse Service
  - `/api/transactions/*` → Warehouse Service

### 2. Frontend Integration
- **Cross-System Navigation**: Both frontends can navigate to each other
- **Shared Authentication**: JWT tokens shared between systems
- **System Status Monitoring**: Real-time health checks
- **Unified User Experience**: Consistent UI/UX across modules

### 3. Database Integration
- **Separate Databases**: Each service maintains its own data
- **Event-Driven Sync**: RabbitMQ for async data synchronization
- **Referential Integrity**: User IDs referenced in warehouse operations

### 4. Authentication Flow
```
User → Frontend → API Gateway → User Service → Database
                      ↓
                JWT Token Generated
                      ↓
            Token Stored in Redis Cache
                      ↓
        Subsequent Requests Include Token
                      ↓
           Gateway Validates with Redis
```

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- MongoDB
- Redis
- RabbitMQ

### Quick Start
```bash
# Clone and navigate to project
cd microservices

# Start all services (Linux/Mac)
./start-system.sh

# Start all services (Windows)
start-system.bat

# Run integration tests (Linux/Mac)
./integration-test.sh

# Run integration tests (Windows)
integration-test.bat
```

### Manual Setup
```bash
# Start infrastructure
docker-compose up -d mongodb-user mongodb-warehouse redis rabbitmq

# Start backend services
cd user-service && npm install && npm run dev &
cd warehouse-service && npm install && npm run dev &
cd api-gateway && npm install && npm run dev &

# Start frontend services
cd user-frontend && npm install && npm run dev &
cd frontend && npm install && npm run dev &
```

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| User Frontend | http://localhost:3002 | User management interface |
| Warehouse Frontend | http://localhost:3003 | Warehouse management interface |
| API Gateway | http://localhost:3000 | Central API endpoint |
| User Service | http://localhost:3001 | User service direct access |
| Warehouse Service | http://localhost:3004 | Warehouse service direct access |

## 🔐 Authentication & Authorization

### Default Users
```javascript
// Admin User
{
  username: "admin",
  password: "admin123",
  roles: ["admin", "user", "warehouse_manager"]
}

// Regular User  
{
  username: "user",
  password: "user123",
  roles: ["user"]
}
```

### Permission Matrix
| Feature | Admin | Warehouse Manager | User |
|---------|-------|-------------------|------|
| User Management | ✅ | ❌ | ❌ |
| Role Management | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |
| Warehouse Operations | ✅ | ✅ | ❌ |
| Inventory Management | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ |
| Profile Management | ✅ | ✅ | ✅ |

## 🔄 Inter-Service Communication

### Synchronous Communication
- **HTTP/REST**: Direct API calls through gateway
- **JWT Propagation**: User context passed between services
- **Error Handling**: Centralized error responses

### Asynchronous Communication
- **RabbitMQ**: Message queue for events
- **Event Types**:
  - `user.created` - New user registration
  - `user.updated` - User profile changes
  - `user.deleted` - User account deletion
  - `role.assigned` - Role assignment changes
  - `warehouse.transaction` - Inventory changes

### Example Event Flow
```javascript
// User creates a warehouse transaction
Frontend → API Gateway → Warehouse Service
                             ↓
                    Save to Database
                             ↓
                    Publish Event to RabbitMQ
                             ↓
              Event: { type: 'warehouse.transaction', 
                      userId: 'xxx', 
                      warehouseId: 'yyy', 
                      operation: 'INBOUND' }
                             ↓
                    User Service Receives Event
                             ↓
                    Update User Activity Log
```

## 🧪 Testing Integration

### Health Check Endpoints
```bash
# API Gateway
curl http://localhost:3000/health

# User Service
curl http://localhost:3001/health

# Warehouse Service  
curl http://localhost:3004/health
```

### Authentication Test
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}'

# Access protected endpoint
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

### Cross-Service Test
```bash
# Create user via User Service
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  jq -r '.data.accessToken')

# Use same token for Warehouse Service
curl -X GET http://localhost:3000/api/warehouses \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Configuration

### Environment Variables
```bash
# User Frontend (.env.development)
VITE_API_URL=http://localhost:3000/api
VITE_WAREHOUSE_FRONTEND_URL=http://localhost:3003

# Warehouse Frontend (.env.development)  
VITE_API_URL=http://localhost:3000/api
VITE_USER_FRONTEND_URL=http://localhost:3002

# API Gateway
USER_SERVICE_URL=http://localhost:3001
WAREHOUSE_SERVICE_URL=http://localhost:3004
CORS_ORIGIN=http://localhost:3002,http://localhost:3003

# Services
MONGODB_URI=mongodb://localhost:27017/...
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your-secret-key
```

### Docker Compose Configuration
- **Networks**: All services on `erp-network`
- **Volumes**: Persistent storage for databases
- **Dependencies**: Services start in correct order
- **Health Checks**: Built-in container health monitoring

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check API Gateway CORS configuration
   curl -I -X OPTIONS http://localhost:3000/api/auth/login \
     -H "Origin: http://localhost:3002"
   ```

2. **Authentication Failures**
   ```bash
   # Verify JWT token
   curl -X GET http://localhost:3000/api/auth/verify \
     -H "Authorization: Bearer <token>"
   ```

3. **Service Connectivity**
   ```bash
   # Check service discovery
   docker-compose ps
   docker-compose logs api-gateway
   ```

4. **Database Connections**
   ```bash
   # Check MongoDB connectivity
   docker-compose logs mongodb-user
   docker-compose logs mongodb-warehouse
   ```

### Performance Optimization

1. **Enable Production Builds**
   ```bash
   # Frontend optimization
   npm run build
   
   # Serve with Nginx
   docker-compose up -d
   ```

2. **Database Indexing**
   ```javascript
   // MongoDB indexes
   db.users.createIndex({ "username": 1 }, { unique: true })
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.inventory.createIndex({ "warehouseId": 1, "productId": 1 })
   ```

3. **Redis Caching**
   ```javascript
   // Cache user sessions
   redis.setex(`session:${userId}`, 3600, sessionData)
   
   // Cache frequently accessed data
   redis.setex(`warehouse:${id}`, 300, warehouseData)
   ```

## 📊 Monitoring & Logging

### Application Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f user-service
docker-compose logs -f warehouse-service
docker-compose logs -f api-gateway
```

### Audit Trails
- User actions logged in audit collection
- API Gateway access logs
- Database operation logs
- Authentication events

### Health Monitoring
- Service health endpoints
- Database connection status
- Message queue status
- Frontend availability

## 🔄 Development Workflow

### Adding New Features
1. **Backend**: Add API endpoint to appropriate service
2. **Gateway**: Update routing if needed
3. **Frontend**: Create UI components and API integration
4. **Testing**: Add integration tests
5. **Documentation**: Update API docs and guides

### Deployment Process
1. **Build**: Create production builds
2. **Test**: Run integration test suite
3. **Deploy**: Update docker-compose and restart
4. **Verify**: Check system status dashboard

This integrated ERP system provides a solid foundation for business operations with proper separation of concerns, security, and scalability.
