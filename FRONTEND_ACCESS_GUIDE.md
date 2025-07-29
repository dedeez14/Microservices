# 🌐 ERP Frontend Access Guide

## 📋 Cara Mengakses Frontend Applications

### 🎯 Available URLs:

| Service | URL | Description |
|---------|-----|-------------|
| **Warehouse Frontend** | [http://localhost:5173](http://localhost:5173) | Inventory Management UI |
| **User Frontend** | [http://localhost:5174](http://localhost:5174) | User Management & Authentication UI |
| **API Gateway** | [http://localhost:3000](http://localhost:3000) | Main API Entry Point |
| **API Gateway Health** | [http://localhost:3000/health](http://localhost:3000/health) | System Health Status |

### 🚀 Backend Services:

| Service | URL | Description |
|---------|-----|-------------|
| **User Service** | [http://localhost:3002](http://localhost:3002) | Authentication & User Management API |
| **User Service Health** | [http://localhost:3002/health](http://localhost:3002/health) | User Service Status |
| **Warehouse Service** | [http://localhost:3001](http://localhost:3001) | Inventory Management API |
| **Warehouse Service Health** | [http://localhost:3001/health](http://localhost:3001/health) | Warehouse Service Status |

### 🔧 Infrastructure Services:

| Service | URL | Description |
|---------|-----|-------------|
| **RabbitMQ Management** | [http://localhost:15672](http://localhost:15672) | Message Queue Dashboard |
| **MongoDB Warehouse** | `localhost:27017` | Warehouse Database |
| **MongoDB User** | `localhost:27018` | User Database |
| **Redis** | `localhost:6379` | Cache & Session Store |

### 📱 How to Start Frontend:

1. **Option 1: Individual Scripts (Recommended)**
   ```bash
   # Terminal 1 - Warehouse Frontend
   cd c:\Project\microservices
   start-warehouse-frontend.bat
   
   # Terminal 2 - User Frontend  
   cd c:\Project\microservices
   start-user-frontend.bat
   ```

2. **Option 2: Restart All (if having issues)**
   ```bash
   cd c:\Project\microservices
   restart-frontends.bat
   ```

3. **Option 3: Manual Start**
   ```bash
   # Terminal 1 - Warehouse Frontend
   cd c:\Project\microservices\frontend
   npm run dev
   
   # Terminal 2 - User Frontend  
   cd c:\Project\microservices\user-frontend
   npm run dev -- --port 5174
   ```

### 🔧 Troubleshooting:

#### PostCSS ES Module Error:
If you see "module is not defined in ES module scope":
- ✅ **Fixed**: postcss.config.js updated to use ES module syntax

#### Common Issues:
- **Port already in use**: Kill existing Node processes or use restart script
- **Dependencies missing**: Run `npm install` in respective frontend directories  
- **Build errors**: Try deleting `node_modules` and `package-lock.json`, then `npm install`

### 🔐 Default Login Credentials:

For testing purposes, you can create users via the API or use the registration endpoints.

**RabbitMQ Management:**
- Username: `admin`
- Password: `admin123`

### 🎨 Frontend Features:

#### Warehouse Frontend (Port 5173):
- 📦 Product Inventory Management
- 📊 Stock Level Monitoring  
- 🏭 Warehouse Operations
- 📈 Inventory Reports
- 🔄 Integration with API Gateway

#### User Frontend (Port 5174):
- 👤 User Registration & Login
- 🔐 Authentication Management
- 👥 User Profile Management
- 🛡️ Role-Based Access Control
- 📋 Audit Log Viewing
- 🔒 Two-Factor Authentication

### 🌟 Integration Points:

- Both frontends communicate through **API Gateway (Port 3000)**
- Real-time updates via **WebSocket connections**
- Cross-service communication via **RabbitMQ**
- Session management via **Redis**
- Data persistence via **MongoDB**

### 🔍 Debugging:

If frontend doesn't load:
1. Check if backend services are running: `docker-compose ps`
2. Verify API Gateway health: `curl http://localhost:3000/health`
3. Check browser console for any JavaScript errors
4. Ensure ports 5173 and 5174 are not in use by other applications

### 📞 Support:

- Frontend logs: Check browser developer console
- Backend logs: `docker-compose logs [service-name]`
- Integration tests: `integration-test.bat`
