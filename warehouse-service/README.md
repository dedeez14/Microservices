# Warehouse Service

Modern warehouse management microservice built with Node.js, Express, and MongoDB. Part of the ERP microservices system.

## 🚀 Features

- **Warehouse Management**: Create, update, delete, and manage warehouses
- **Location Management**: Organize inventory with hierarchical location system (zones, aisles, racks, shelves)
- **Inventory Tracking**: Real-time inventory management with quantity tracking and cost calculation
- **Transfer Management**: Handle inventory transfers between locations and warehouses
- **RESTful API**: Comprehensive REST API with OpenAPI/Swagger documentation
- **Input Validation**: Robust validation using Joi schemas
- **Error Handling**: Centralized error handling with detailed logging
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis integration for performance optimization
- **Message Queue**: RabbitMQ for asynchronous operations
- **Authentication**: JWT-based authentication ready
- **Testing**: Unit and integration tests with Jest
- **Docker**: Full containerization support
- **Monitoring**: Health checks and service monitoring

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Redis (optional, for caching)
- RabbitMQ (optional, for message queuing)

## 🛠️ Installation

### Using Docker (Recommended)

```bash
# From the root microservices directory
docker-compose up warehouse-service
```

### Local Development

```bash
# Clone and navigate to warehouse service
cd warehouse-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configurations
# Start MongoDB and Redis locally

# Run the service
npm run dev
```

## 🔧 Configuration

Environment variables in `.env`:

```env
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=/api/v1

# Database
MONGODB_URI=mongodb://localhost:27017/warehouse_db

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
```

## 📚 API Documentation

Once the service is running, visit:
- Swagger UI: http://localhost:3001/api-docs
- Health Check: http://localhost:3001/api/v1/health

## 🏗️ Architecture

```
warehouse-service/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Joi validation schemas
│   ├── app.js          # Express app setup
│   └── server.js       # Entry point
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── setup.js        # Test configuration
├── scripts/
│   └── seed.js         # Data seeding script
├── Dockerfile
└── package.json
```

## 📊 Data Models

### Warehouse
- Basic warehouse information
- Address and contact details
- Capacity and settings
- Status management

### Location
- Hierarchical location system
- Coordinates and capacity
- Zone/aisle/rack/shelf organization
- Properties and accessibility

### Inventory
- Product inventory tracking
- Quantity management (available, reserved, on-order)
- Cost tracking and valuation
- Specifications and tracking information

### Transfer
- Inventory movement tracking
- Between locations and warehouses
- Status workflow management
- Audit trail

## 🔌 API Endpoints

### Warehouses
- `GET /api/v1/warehouses` - List all warehouses
- `POST /api/v1/warehouses` - Create warehouse
- `GET /api/v1/warehouses/:id` - Get warehouse by ID
- `PUT /api/v1/warehouses/:id` - Update warehouse
- `DELETE /api/v1/warehouses/:id` - Delete warehouse

### Locations
- `GET /api/v1/locations` - List all locations
- `POST /api/v1/locations` - Create location
- `GET /api/v1/locations/:id` - Get location by ID
- `PUT /api/v1/locations/:id` - Update location
- `DELETE /api/v1/locations/:id` - Delete location

### Inventory
- `GET /api/v1/inventory` - List inventory items
- `POST /api/v1/inventory` - Create inventory item
- `GET /api/v1/inventory/:id` - Get inventory item
- `PUT /api/v1/inventory/:id` - Update inventory
- `DELETE /api/v1/inventory/:id` - Delete inventory
- `POST /api/v1/inventory/:id/adjust` - Adjust quantity

### Transfers
- `GET /api/v1/transfers` - List transfers
- `POST /api/v1/transfers` - Create transfer
- `GET /api/v1/transfers/:id` - Get transfer
- `PUT /api/v1/transfers/:id` - Update transfer
- `POST /api/v1/transfers/:id/approve` - Approve transfer
- `POST /api/v1/transfers/:id/complete` - Complete transfer

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## 🌱 Seeding Data

```bash
# Seed sample data
npm run seed

# Or using Docker
docker-compose exec warehouse-service npm run seed
```

This creates:
- 3 sample warehouses (Jakarta, Bandung, Surabaya)
- Multiple storage locations
- Sample inventory items

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```http
GET /api/v1/health
```

Returns:
- Service status
- Database connectivity
- Memory usage
- Uptime

### Logging
- Winston for structured logging
- Log levels: error, warn, info, debug
- Separate error logs
- Request/response logging

## 🔒 Security

- Input validation with Joi
- SQL injection prevention (NoSQL)
- XSS protection with Helmet
- Rate limiting
- CORS configuration
- JWT authentication ready

## 🚀 Deployment

### Docker Production Build
```bash
# Build production image
docker build -t warehouse-service:latest .

# Run production container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://mongo:27017/warehouse_db \
  warehouse-service:latest
```

### Environment-specific Configuration
- Development: Full logging, no rate limiting
- Production: Optimized logging, rate limiting enabled
- Test: In-memory database, minimal logging

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
- `npm run seed` - Seed sample data

## 🐛 Troubleshooting

### Common Issues

**Service won't start**
- Check MongoDB connection
- Verify environment variables
- Check port availability

**Database connection failed**
- Ensure MongoDB is running
- Check connection string
- Verify database permissions

**Tests failing**
- Run `npm install` to ensure dependencies
- Check test database configuration
- Ensure test data is clean

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Related Services

- [API Gateway](../api-gateway/README.md) - Central API gateway
- [User Service](../user-service/README.md) - User management (coming soon)
- [Order Service](../order-service/README.md) - Order processing (coming soon)
- [Product Service](../product-service/README.md) - Product catalog (coming soon)
