# User Service

A comprehensive user management microservice with authentication, role-based access control (RBAC), audit logging, and security features.

## Features

### Authentication & Security
- User registration and email verification
- Secure login with JWT tokens
- Password reset functionality
- Two-factor authentication (2FA) with TOTP
- Session management with refresh tokens
- Account lockout protection
- Rate limiting
- Password strength validation
- Security audit logging

### User Management
- CRUD operations for users
- User profiles with customizable fields
- Account activation/deactivation
- Admin password reset
- User statistics and analytics
- Session monitoring and revocation

### Role-Based Access Control (RBAC)
- Hierarchical role system
- Permission-based access control
- Role inheritance
- Custom permissions per role
- Role assignment and management
- System vs custom roles

### Audit & Logging
- Comprehensive audit trail
- Activity monitoring
- Security event logging
- Audit log export (JSON/CSV)
- Real-time activity tracking
- User activity analytics

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password/:token - Reset password
GET    /api/auth/verify-email/:token - Verify email
POST   /api/auth/refresh-token     - Refresh access token
POST   /api/auth/change-password   - Change password
GET    /api/auth/profile           - Get user profile
POST   /api/auth/2fa/enable        - Enable 2FA
POST   /api/auth/2fa/verify        - Verify 2FA code
POST   /api/auth/2fa/disable       - Disable 2FA
```

### User Management
```
GET    /api/users                  - List all users (admin)
POST   /api/users                  - Create user (admin)
GET    /api/users/:id              - Get user by ID
PUT    /api/users/:id              - Update user
DELETE /api/users/:id              - Delete user (admin)
PATCH  /api/users/profile          - Update own profile
POST   /api/users/:id/activate     - Activate user (admin)
POST   /api/users/:id/deactivate   - Deactivate user (admin)
POST   /api/users/:id/reset-password - Reset user password (admin)
GET    /api/users/:id/sessions     - Get user sessions
DELETE /api/users/:id/sessions/:sessionId - Revoke session
GET    /api/users/stats            - User statistics (admin)
```

### Role Management
```
GET    /api/roles                  - List roles
POST   /api/roles                  - Create role (admin)
GET    /api/roles/:id              - Get role by ID
PUT    /api/roles/:id              - Update role (admin)
DELETE /api/roles/:id              - Delete role (admin)
GET    /api/roles/hierarchy        - Get role hierarchy
GET    /api/roles/permissions      - Get available permissions
POST   /api/roles/assign           - Assign role to user (admin)
POST   /api/roles/remove           - Remove role from user (admin)
GET    /api/roles/stats            - Role statistics (admin)
```

### Audit Logs
```
GET    /api/audit                  - List audit logs (admin)
GET    /api/audit/:id              - Get audit log by ID (admin)
GET    /api/audit/stats            - Audit statistics (admin)
GET    /api/audit/filters          - Available filter options (admin)
GET    /api/audit/export           - Export audit logs (admin)
GET    /api/audit/users/:userId    - User activity logs (admin)
POST   /api/audit/cleanup          - Cleanup old logs (super admin)
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/erp_users

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=ERP System

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Two-Factor Authentication
TWO_FACTOR_SERVICE_NAME=ERP System

# Encryption (for sensitive data)
ENCRYPTION_KEY=your-32-character-encryption-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Redis (optional, for session storage)

### Installation

1. **Clone and navigate to user service:**
   ```bash
   cd user-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the service:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

### Docker Setup

1. **Build image:**
   ```bash
   docker build -t user-service .
   ```

2. **Run container:**
   ```bash
   docker run -p 5001:5001 --env-file .env user-service
   ```

3. **Using Docker Compose:**
   ```yaml
   version: '3.8'
   services:
     user-service:
       build: .
       ports:
         - "5001:5001"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/erp_users
       depends_on:
         - mongo
       
     mongo:
       image: mongo:5.0
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
   
   volumes:
     mongo_data:
   ```

## Security Features

### Password Security
- Minimum 8 characters with complexity requirements
- bcrypt hashing with salt rounds
- Password history to prevent reuse
- Account lockout after failed attempts
- Password expiration policies

### Token Security
- JWT with secure signing
- Refresh token rotation
- Token blacklisting on logout
- Short-lived access tokens
- Secure cookie options

### Two-Factor Authentication
- TOTP (Time-based One-Time Password)
- QR code generation for authenticator apps
- Backup codes for recovery
- Device trust management

### Rate Limiting
- Global and endpoint-specific limits
- IP-based rate limiting
- Graduated response (warnings -> blocks)
- Whitelist for trusted IPs

### Audit Trail
- All user actions logged
- Security events tracked
- Failed login attempts
- Permission changes
- Data access logging

## Role System

### Default Roles

1. **SUPER_ADMIN**
   - Full system access
   - User management
   - Role management
   - System configuration
   - Audit log access

2. **ADMIN**
   - User management
   - Role assignment
   - Content management
   - Reports access

3. **MANAGER**
   - Team management
   - Content creation
   - Reports viewing
   - Limited user access

4. **VIEWER**
   - Read-only access
   - Basic functionality
   - Own profile management

### Permission Categories

- **User Management**: create_users, read_users, update_users, delete_users, manage_users
- **Role Management**: create_roles, read_roles, update_roles, delete_roles, manage_roles  
- **Audit Access**: view_audit_logs, export_audit_logs
- **System**: manage_system_settings, backup_restore
- **Content**: create_content, update_content, delete_content

## Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  profile: {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    bio: String,
    dateOfBirth: Date,
    address: Object,
    avatar: String
  },
  roles: [ObjectId],
  permissions: [String],
  status: String (active|inactive|pending|deleted),
  emailVerified: Boolean,
  twoFactorAuth: {
    enabled: Boolean,
    secret: String,
    backupCodes: [String]
  },
  loginAttempts: Number,
  lockedUntil: Date,
  lastLoginAt: Date,
  passwordChangedAt: Date,
  refreshTokens: [Object],
  preferences: Object,
  metadata: Object
}
```

### Role Model
```javascript
{
  name: String (unique),
  description: String,
  permissions: [String],
  level: Number,
  parentRole: ObjectId,
  isSystemRole: Boolean,
  metadata: Object
}
```

### Audit Log Model
```javascript
{
  userId: ObjectId,
  username: String,
  action: String,
  category: String,
  severity: String,
  resource: String,
  method: String,
  endpoint: String,
  ipAddress: String,
  userAgent: String,
  description: String,
  metadata: Object,
  status: String,
  timestamp: Date
}
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
```

## API Documentation

Access interactive API documentation at:
- Development: http://localhost:5001/api
- Swagger UI: http://localhost:5001/docs (if enabled)

## Performance Considerations

### Database Optimization
- Indexed fields for fast queries
- Pagination for large datasets
- Aggregation pipelines for analytics
- Connection pooling

### Caching Strategy
- Redis for session storage
- In-memory caching for roles/permissions
- CDN for static assets
- Database query caching

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Audit log analytics

## Production Deployment

### Environment Setup
1. Use strong, unique secrets
2. Configure email service
3. Set up database cluster
4. Configure reverse proxy
5. Enable HTTPS
6. Set up monitoring

### Security Checklist
- [ ] Strong JWT secrets
- [ ] Email service configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Database secured
- [ ] Audit logging active
- [ ] Backup strategy in place

### Scaling Considerations
- Horizontal scaling with load balancer
- Database read replicas
- Redis cluster for sessions
- Microservice communication
- Container orchestration

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MongoDB is running
   mongodb://localhost:27017
   # Verify connection string in .env
   ```

2. **Email Not Sending**
   ```bash
   # Check email configuration
   # Verify SMTP settings
   # Test with Gmail app password
   ```

3. **JWT Token Issues**
   ```bash
   # Verify JWT_SECRET is set
   # Check token expiration
   # Ensure proper Bearer format
   ```

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow code style guidelines
4. Add tests for new features
5. Update documentation
6. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review API examples
- Contact development team

---

Built with ❤️ for modern ERP systems
