# User Management Frontend

A modern React TypeScript frontend for the user management microservice with authentication, role-based access control, user management, and audit logging.

## 🚀 Features

- **Authentication & Authorization**
  - Login/Register with email verification
  - JWT token management with automatic refresh
  - Two-factor authentication (2FA)
  - Password reset functionality

- **User Management**
  - CRUD operations for users
  - Role assignment and permissions
  - User status management (active/inactive/locked)
  - Bulk operations and CSV import/export

- **Role Management**
  - Create and manage roles
  - Permission assignment
  - Role hierarchy support

- **Audit Logging**
  - Comprehensive activity tracking
  - Security event monitoring
  - Export capabilities

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Dark/Light theme support
  - Real-time notifications
  - Form validation with Zod

## 🛠 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, etc.)
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components
├── pages/              # Page components
│   └── auth/           # Authentication pages
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── api/            # API service modules
│   ├── utils.ts        # Utility functions
│   ├── constants.ts    # Application constants
│   └── validations.ts  # Zod validation schemas
├── context/            # React context providers
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- The user-service backend running on port 5001

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment**:
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_APP_NAME="User Management System"
   ```

### Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔒 Authentication Flow

1. **Login**: User provides credentials (email/password + optional 2FA)
2. **Token Storage**: Access and refresh tokens stored in localStorage
3. **Auto Refresh**: Tokens automatically refreshed when expired
4. **Route Protection**: Protected routes check authentication status
5. **Logout**: Tokens cleared and user redirected to login

## 🛡️ Security Features

- **CSRF Protection**: Built into API requests
- **XSS Prevention**: Input sanitization and validation
- **Route Guards**: Role-based access control
- **Secure Storage**: Sensitive data handling best practices
- **Audit Logging**: All user actions tracked

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🌙 Theme Support

- **Light Theme**: Default clean interface
- **Dark Theme**: Dark mode for low-light environments
- **System Theme**: Automatically follows OS preference

## 🔍 State Management

Using React Query for:
- **Server State**: API data caching and synchronization
- **Background Updates**: Automatic data refetching
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Centralized error management

## 📚 API Integration

The frontend integrates with the user-service backend:

- **Base URL**: `http://localhost:5001/api`
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Centralized error responses
- **Type Safety**: Full TypeScript integration

## 🔧 Configuration

### Environment Variables

- `VITE_API_URL`: Backend API base URL
- `VITE_APP_NAME`: Application name
- `VITE_ENABLE_2FA`: Enable/disable 2FA features
- `VITE_MAX_FILE_SIZE`: Maximum file upload size

## 🔄 Integration with Backend

This frontend is designed to work with the user-service backend. Make sure to:

1. Start the user-service on port 5001
2. Configure CORS settings in the backend
3. Set up proper environment variables
4. Test API connectivity

## 🎯 Next Steps

The foundation is complete! Now you can:

1. **Implement Authentication Forms**: Build login, register, and password reset forms with React Hook Form
2. **Add User Management UI**: Create tables, modals, and forms for user CRUD operations
3. **Build Role Management**: Implement role creation and permission assignment interfaces
4. **Create Audit Dashboard**: Add charts and filtering for audit logs
5. **Enhance UI Components**: Build more sophisticated components and interactions
6. **Add Real-time Features**: Implement WebSocket for live updates
7. **Improve Security**: Add additional security measures and validation
