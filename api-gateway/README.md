# API Gateway

Centralized API Gateway for the ERP microservices system. Provides unified access to all microservices with authentication, authorization, rate limiting, and service discovery.

## 🚀 Features

- **Unified API Access**: Single entry point for all microservices
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Service Discovery**: Automatic service registration and health monitoring
- **Load Balancing**: Request distribution across service instances
- **Rate Limiting**: Configurable rate limiting per endpoint
- **Request/Response Transformation**: Modify requests and responses as needed
- **Logging & Monitoring**: Comprehensive request logging and metrics
- **Circuit Breaker**: Fault tolerance with automatic failover
- **API Documentation**: Unified Swagger documentation
- **Security**: CORS, Helmet, input validation
- **Caching**: Redis-based response caching
- **Health Checks**: Service health monitoring and reporting

## 📋 Prerequisites

- Node.js 18+
- Redis (for caching and session storage)
- Running microservices to proxy to

## 🛠️ Installation

### Using Docker (Recommended)

```bash
# From the root microservices directory
docker-compose up api-gateway
```

### Local Development

```bash
# Navigate to API gateway
cd api-gateway

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configurations
# Start Redis locally

# Run the gateway
npm run dev
```

## 🔧 Configuration

Environment variables in `.env`:

```env
# Application
NODE_ENV=development
PORT=3000

# Service URLs
WAREHOUSE_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
PRODUCT_SERVICE_URL=http://localhost:3004

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# API Keys
VALID_API_KEYS=gateway-admin-key-123,service-monitor-key-456
```

## 📚 API Documentation

Once the gateway is running, visit:
- Swagger UI: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health
- Services Status: http://localhost:3000/services (requires API key)

## 🏗️ Architecture

```
api-gateway/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── utils/           # Utility functions (logging, service registry)
│   ├── app.js          # Express app with proxy setup
│   └── server.js       # Entry point
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── setup.js        # Test configuration
├── Dockerfile
└── package.json
```

## 🔌 Routing & Proxying

The API Gateway routes requests to appropriate microservices:

### Service Endpoints

| Route | Target Service | Authentication |
|-------|---------------|----------------|
| `/api/warehouse/*` | Warehouse Service | Optional |
| `/api/users/*` | User Service | Required |
| `/api/orders/*` | Order Service | Required |
| `/api/products/*` | Product Service | Optional |

### Gateway Endpoints

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `GET /` | Gateway info | No |
| `GET /health` | Health check | No |
| `GET /services` | Services status | API Key |
| `POST /auth/login` | Authentication | No |
| `GET /api-docs` | API documentation | No |

## 🔐 Authentication & Authorization

### JWT Authentication

```javascript
// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "user@example.com",
      "role": "admin"
    }
  }
}
```

### Using JWT Token

```bash
# Include in Authorization header
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/warehouse/warehouses
```

### API Key Authentication

For service-to-service communication:

```bash
# Include X-API-Key header
curl -H "X-API-Key: gateway-admin-key-123" \
  http://localhost:3000/services
```

## 🛡️ Security Features

### Rate Limiting
- Configurable per-IP rate limiting
- Different limits for different endpoints
- Bypass for service-to-service calls

### CORS
- Configurable allowed origins
- Support for credentials
- Preflight request handling

### Input Validation
- Request validation middleware
- Sanitization of user inputs
- Protection against injection attacks

### Headers Security
- Helmet.js for security headers
- XSS protection
- Content type validation

## 📊 Monitoring & Health Checks

### Health Check Response
```json
{
  "success": true,
  "data": {
    "gateway": {
      "status": "healthy",
      "uptime": 3600,
      "memory": {...},
      "version": "1.0.0"
    },
    "services": {
      "status": "healthy",
      "services": [
        {
          "name": "warehouse-service",
          "status": "healthy",
          "url": "http://localhost:3001",
          "lastHealthCheck": "2024-01-15T10:30:00Z"
        }
      ]
    }
  }
}
```

### Service Discovery
- Automatic service registration
- Health monitoring with configurable intervals
- Circuit breaker pattern for failed services
- Service status tracking

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking and alerting
- Performance metrics

## 🚀 Performance Features

### Caching
- Redis-based response caching
- Configurable TTL per endpoint
- Cache invalidation strategies
- Header-based cache control

### Load Balancing
- Round-robin distribution
- Health-based routing
- Retry mechanisms
- Timeout handling

### Connection Pooling
- HTTP connection reuse
- Configurable pool sizes
- Keep-alive connections

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 📈 Metrics & Analytics

### Request Metrics
- Request count and rate
- Response times
- Error rates
- Status code distribution

### Service Metrics
- Service availability
- Response times per service
- Error rates per service
- Circuit breaker statistics

### Performance Monitoring
- Memory usage
- CPU utilization
- Response time percentiles
- Throughput metrics

## 🔧 Configuration Examples

### Development Setup
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_MAX=1000
```

### Production Setup
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
RATE_LIMIT_MAX=100
REDIS_CLUSTER_ENDPOINTS=redis1:6379,redis2:6379
```

### Load Balancer Setup
```env
WAREHOUSE_SERVICE_URL=http://warehouse-lb:3001
USER_SERVICE_URL=http://user-lb:3002
SERVICE_TIMEOUT=30000
SERVICE_RETRIES=3
```

## 🚀 Deployment

### Docker Production Build
```bash
# Build production image
docker build -t api-gateway:latest .

# Run production container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e REDIS_HOST=redis \
  api-gateway:latest
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_HOST
          value: "redis-service"
```

## 🔧 Customization

### Adding New Services
1. Update `config/index.js` with new service configuration
2. Add proxy route in `app.js`
3. Update health check monitoring
4. Add to API documentation

### Custom Middleware
```javascript
// Add to src/middleware/
const customMiddleware = (req, res, next) => {
  // Custom logic
  next()
}

// Use in app.js
app.use('/api/custom', customMiddleware, proxy)
```

### Request/Response Transformation
```javascript
// In proxy configuration
onProxyReq: (proxyReq, req) => {
  // Modify outgoing request
  proxyReq.setHeader('X-Custom-Header', 'value')
},
onProxyRes: (proxyRes, req, res) => {
  // Modify incoming response
  proxyRes.headers['x-powered-by'] = 'ERP-Gateway'
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run debug` - Start with debugger
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

## 🐛 Troubleshooting

### Common Issues

**Gateway won't start**
- Check Redis connection
- Verify service URLs
- Check port availability

**Service proxy errors**
- Verify target service is running
- Check service health endpoints
- Review network connectivity

**Authentication failures**
- Verify JWT secret configuration
- Check token expiration
- Review user permissions

**Rate limiting issues**
- Check rate limit configuration
- Verify Redis connection
- Review client IP detection

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Related Services

- [Warehouse Service](../warehouse-service/README.md) - Warehouse management
- [User Service](../user-service/README.md) - User management (coming soon)
- [Order Service](../order-service/README.md) - Order processing (coming soon)
- [Product Service](../product-service/README.md) - Product catalog (coming soon)
