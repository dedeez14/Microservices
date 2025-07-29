# 🏢 Modern ERP Microservices System

A comprehensive, production-ready ERP system built with modern microservices architecture, featuring user management, warehouse operations, and seamless system integration.

## 🌟 System Overview

This integrated ERP solution provides:

- **👥 User Management System**: Complete user lifecycle, authentication, RBAC, and audit trails
- **📦 Warehouse Management System**: Inventory control, transaction management, and logistics
- **🔗 Seamless Integration**: Cross-system navigation and unified user experience
- **⚡ API Gateway**: Centralized routing, authentication, and rate limiting
- **🛡️ Security First**: JWT authentication, RBAC, audit logging, and CORS protection
- **📊 System Monitoring**: Real-time health checks and status dashboard

## 🏗️ Architecture

```
Frontend Layer (React + TypeScript + Tailwind)
├── User Management Frontend (Port 3002)
└── Warehouse Management Frontend (Port 3003)
                    ↓
API Gateway (Port 3000) - Routing, Auth, CORS
├── /api/auth/* → User Service
├── /api/users/* → User Service  
├── /api/roles/* → User Service
├── /api/warehouses/* → Warehouse Service
└── /api/inventory/* → Warehouse Service
                    ↓
Backend Services (Node.js + Express + MongoDB)
├── User Service (Port 3001) - Auth, Users, Roles, Audit
└── Warehouse Service (Port 3004) - Inventory, Transactions
                    ↓
Infrastructure
├── MongoDB (27017, 27018) - Data Storage
├── Redis (6379) - Caching & Sessions  
└── RabbitMQ (5672) - Message Queue
```

## 🚀 Quick Start

### One-Command Startup

**Linux/Mac:**
```bash
./start-system.sh
```

**Windows:**
```cmd
start-system.bat
```

### Access Your ERP System

| Service | URL | Description |
|---------|-----|-------------|
| 👥 User Management | http://localhost:3002 | User admin, roles, audit |
| 📦 Warehouse Management | http://localhost:3003 | Inventory, transactions |
| ⚡ API Gateway | http://localhost:3000 | Central API endpoint |
| 📚 API Documentation | http://localhost:3000/api-docs | Swagger docs |

### Default Credentials
```
Admin: admin / admin123
User: user / user123
```

## ✨ Key Features

### 🔐 User Management
- **Authentication**: JWT with refresh tokens, 2FA support
- **Authorization**: Role-based access control (RBAC)
- **User Lifecycle**: Registration, verification, profile management
- **Audit Trail**: Complete activity logging
- **Security**: Password policies, account lockout, session management

### 📦 Warehouse Management  
- **Inventory Control**: Real-time stock tracking
- **Transaction Management**: Inbound/outbound operations
- **Multi-Warehouse**: Support for multiple locations
- **Reporting**: Analytics and operational reports
- **Integration**: Seamless connection with user system

### 🔗 System Integration
- **Cross-Navigation**: Jump between systems seamlessly
- **Shared Authentication**: Single sign-on experience
- **Status Monitoring**: Real-time health dashboard
- **Event-Driven**: Async communication via RabbitMQ
- **API Gateway**: Centralized routing and security

### 🛡️ Security & Compliance
- **JWT Authentication**: Secure token-based auth
- **RBAC**: Granular permission control
- **Audit Logging**: Complete activity tracking
- **CORS Protection**: Secure cross-origin requests
- **Rate Limiting**: API abuse prevention
- **Data Validation**: Input sanitization and validation

## 🧪 Testing & Validation

### Run Integration Tests

**Linux/Mac:**
```bash
./integration-test.sh
```

**Windows:**
```cmd
integration-test.bat
```

### Manual Health Checks
```bash
# API Gateway
curl http://localhost:3000/health

# User Service  
curl http://localhost:3001/health

# Warehouse Service
curl http://localhost:3004/health
```

### Test Authentication Flow
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

## 🔧 Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB
- Redis
- RabbitMQ

### Local Development
```bash
# Start infrastructure only
docker-compose up -d mongodb-user mongodb-warehouse redis rabbitmq

# Start services individually
cd user-service && npm run dev
cd warehouse-service && npm run dev  
cd api-gateway && npm run dev
cd user-frontend && npm run dev
cd frontend && npm run dev
```

### Project Structure
```
microservices/
├── user-service/          # User management backend
├── warehouse-service/     # Warehouse management backend  
├── api-gateway/          # Central API gateway
├── user-frontend/        # User management UI
├── frontend/            # Warehouse management UI (legacy name)
├── docker-compose.yml   # Orchestration config
├── start-system.sh     # Linux startup script
├── start-system.bat    # Windows startup script
├── integration-test.sh # Linux test script
├── integration-test.bat # Windows test script
└── INTEGRATION_GUIDE.md # Detailed integration docs
```

## 📊 Monitoring & Operations

### Service Logs
```bash
# View all services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
```

### System Status
- Built-in health check endpoints
- Real-time service status dashboard
- Database connection monitoring
- Message queue status

### Performance Metrics
- Response time monitoring
- Error rate tracking
- Database query performance
- Cache hit rates

## 🚀 Production Deployment

### Environment Configuration
```bash
# Production environment files
.env.production
docker-compose.prod.yml

# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production config
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling Services
```bash
# Scale warehouse service
docker-compose up -d --scale warehouse-service=3

# Scale frontend services  
docker-compose up -d --scale user-frontend=2
```

## 📚 Documentation

- **[Integration Guide](INTEGRATION_GUIDE.md)**: Detailed system integration documentation
- **[API Documentation](http://localhost:3000/api-docs)**: Swagger API docs (when running)
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)**: Development progress and technical details

## 🛠️ Technology Stack

### Backend
- **Node.js + Express**: RESTful APIs
- **MongoDB**: Document database
- **Redis**: Caching and sessions
- **RabbitMQ**: Message queue
- **JWT**: Authentication tokens
- **Joi**: Input validation
- **Swagger**: API documentation

### Frontend  
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Query**: Data fetching
- **React Router**: Navigation
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Orchestration
- **Nginx**: Reverse proxy (production)
- **PM2**: Process management (optional)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: GitHub Issues for bug reports
- **Documentation**: Check INTEGRATION_GUIDE.md for detailed information
- **Health Checks**: Use built-in status dashboard
- **Logs**: Docker Compose logs for troubleshooting

---

**🎉 Your modern ERP system is ready for business operations!**

Built with ❤️ using modern microservices architecture and best practices.

A comprehensive, scalable ERP (Enterprise Resource Planning) system built with modern microservices architecture using Node.js, Express, MongoDB, and Docker.

## 🏗️ Architecture Overview

This ERP system follows a microservices architecture pattern with the following components:

- **API Gateway**: Centralized entry point with authentication, rate limiting, and service discovery ✅
- **Warehouse Service**: Complete warehouse and inventory management ✅
- **User Service**: User management and authentication (coming soon)
- **Order Service**: Order processing and management (coming soon)
- **Product Service**: Product catalog management (coming soon)
- **Notification Service**: Email, SMS, and push notifications (coming soon)
- **Reporting Service**: Analytics and reporting engine (coming soon)

## 🚀 Quick Start

### Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) 18+ (for local development)
- [Git](https://git-scm.com/)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd microservices

# Start all services with Docker
start-dev.bat  # Windows
# or
start-dev.sh   # Linux/macOS

# Access the services
# API Gateway: http://localhost:3000
# Warehouse Service: http://localhost:3001
# API Documentation: http://localhost:3000/api-docs
```

### Local Development

```bash
# Start MongoDB and Redis locally first
# Then run the local development script
start-local.bat  # Windows
# or
start-local.sh   # Linux/macOS
```

## 📊 Current Implementation Status

### ✅ Completed Features

#### Warehouse Service (100% Complete)
- **Warehouse Management**
  - ✅ CRUD operations for warehouses
  - ✅ Address and contact information
  - ✅ Capacity and settings management
  - ✅ Status tracking (active/inactive)

- **Location Management**
  - ✅ Hierarchical location system (zone/aisle/rack/shelf)
  - ✅ 3D coordinate tracking
  - ✅ Capacity and accessibility management
  - ✅ Location properties and metadata

- **Inventory Management**
  - ✅ Real-time inventory tracking
  - ✅ Quantity management (available/reserved/on-order)
  - ✅ Cost tracking and valuation
  - ✅ Product specifications and tracking
  - ✅ Stock level alerts (min/max/reorder points)

- **Transfer Management**
  - ✅ Inventory transfers between locations/warehouses
  - ✅ Transfer workflow (pending/approved/completed)
  - ✅ Audit trail and history tracking
  - ✅ Quantity validation and verification

#### API Gateway (100% Complete)
- **Core Features**
  - ✅ Service discovery and health monitoring
  - ✅ Request routing and load balancing
  - ✅ Authentication and authorization (JWT)
  - ✅ Rate limiting and security
  - ✅ Unified API documentation
  - ✅ Error handling and logging

- **Security**
  - ✅ CORS configuration
  - ✅ Helmet security headers
  - ✅ Input validation
  - ✅ API key authentication for service calls

- **Monitoring**
  - ✅ Health checks for all services
  - ✅ Request/response logging
  - ✅ Performance metrics
  - ✅ Circuit breaker pattern

#### Infrastructure (100% Complete)
- **Containerization**
  - ✅ Docker containers for all services
  - ✅ Docker Compose orchestration
  - ✅ Multi-stage builds for optimization
  - ✅ Health checks and restart policies

- **Database**
  - ✅ MongoDB with proper indexing
  - ✅ Data validation and relationships
  - ✅ Connection pooling and error handling

- **Caching & Messaging**
  - ✅ Redis integration for caching
  - ✅ RabbitMQ for message queuing
  - ✅ Session management

- **Testing**
  - ✅ Unit tests with Jest
  - ✅ Integration tests
  - ✅ Test database setup
  - ✅ Code coverage reporting

- **Documentation**
  - ✅ Comprehensive API documentation
  - ✅ Swagger/OpenAPI integration
  - ✅ Development guides
  - ✅ Deployment instructions

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Message Queue**: RabbitMQ
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi schemas
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker & Docker Compose
- **Logging**: Winston with structured logging
- **Security**: Helmet, CORS, Rate limiting

## 🌐 API Endpoints

### API Gateway (Port 3000)
```
GET  /                     # Gateway information
GET  /health              # System health check
GET  /services            # Service status (API key required)
POST /auth/login          # Authentication
GET  /api-docs            # API documentation

# Proxied Service Endpoints
GET  /api/warehouse/*     # Warehouse service endpoints
GET  /api/users/*         # User service endpoints (coming soon)
GET  /api/orders/*        # Order service endpoints (coming soon)
GET  /api/products/*      # Product service endpoints (coming soon)
```

### Warehouse Service (Port 3001)
```
# Warehouses
GET    /api/v1/warehouses           # List warehouses
POST   /api/v1/warehouses           # Create warehouse
GET    /api/v1/warehouses/:id       # Get warehouse
PUT    /api/v1/warehouses/:id       # Update warehouse
DELETE /api/v1/warehouses/:id       # Delete warehouse

# Locations
GET    /api/v1/locations            # List locations
POST   /api/v1/locations            # Create location
GET    /api/v1/locations/:id        # Get location
PUT    /api/v1/locations/:id        # Update location
DELETE /api/v1/locations/:id        # Delete location

# Inventory
GET    /api/v1/inventory            # List inventory
POST   /api/v1/inventory            # Create inventory item
GET    /api/v1/inventory/:id        # Get inventory item
PUT    /api/v1/inventory/:id        # Update inventory
DELETE /api/v1/inventory/:id        # Delete inventory
POST   /api/v1/inventory/:id/adjust # Adjust quantity

# Transfers
GET    /api/v1/transfers            # List transfers
POST   /api/v1/transfers            # Create transfer
GET    /api/v1/transfers/:id        # Get transfer
PUT    /api/v1/transfers/:id        # Update transfer
POST   /api/v1/transfers/:id/approve   # Approve transfer
POST   /api/v1/transfers/:id/complete  # Complete transfer

# Health & Info
GET    /api/v1/health              # Service health
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication for service-to-service calls
- Session management with Redis

### Security Middleware
- Helmet.js for security headers
- CORS with configurable origins
- Rate limiting per IP and endpoint
- Input validation and sanitization

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Test specific service
cd warehouse-service && npm test
cd api-gateway && npm test
```

## 🚀 Deployment

### Development
```bash
# Docker Compose for local development
docker-compose up --build

# Local development with hot reload
start-local.bat  # Windows
```

### Production
```bash
# Docker production build
docker build -t erp-service:latest .

# Docker Swarm
docker stack deploy -c docker-stack.yml erp
```

## 📚 Documentation

### API Documentation
- Gateway Docs: http://localhost:3000/api-docs
- Warehouse Docs: http://localhost:3001/api-docs
- Interactive Swagger UI with examples
- Authentication guides

### Service Documentation
- [API Gateway](api-gateway/README.md) - Complete gateway documentation
- [Warehouse Service](warehouse-service/README.md) - Complete warehouse documentation

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Write tests** for your changes
4. **Ensure all tests pass**: `npm test`
5. **Submit a pull request**

### Development Guidelines
- Follow existing code style
- Write comprehensive tests
- Update documentation
- Use conventional commit messages

## 🎯 Roadmap

### Phase 1 ✅ (Completed)
- Core warehouse management
- API Gateway implementation
- Basic authentication
- Docker containerization
- Comprehensive testing

### Phase 2 🚧 (Next)
- User management service
- Advanced authentication (OAuth, 2FA)
- Service mesh implementation
- Advanced monitoring

### Phase 3 📋 (Planned)
- Order management service
- Product catalog service
- Notification system
- Reporting and analytics

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using modern microservices architecture**
