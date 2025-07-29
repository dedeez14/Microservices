# 🚀 Single Port Frontend Solution

## 📋 **Solusi untuk Menggabungkan Frontend dalam Satu Port**

### ✅ **Konfigurasi Baru:**

| Module | URL | Description |
|--------|-----|-------------|
| **Main Launcher** | [http://localhost:5173](http://localhost:5173) | Landing page dengan pilihan module |
| **Warehouse Management** | [http://localhost:5173/warehouse](http://localhost:5173/warehouse) | Inventory & warehouse operations |
| **User Management** | Opens in new tab | Authentication & user management |

### 🏗️ **Arsitektur Terintegrasi:**

```
┌─────────────────────────────────────┐
│        Port 5173 (Main)             │
│  ┌─────────────────────────────┐    │
│  │     App Launcher            │    │
│  │   (Landing Page)            │    │
│  │                             │    │
│  │  ┌─────────┐ ┌────────────┐ │    │
│  │  │ 👥 User │ │ 📦 Warehouse│ │    │
│  │  │ Module  │ │   Module    │ │    │
│  │  └─────────┘ └────────────┘ │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
          │               │
          │               └─── /warehouse/* routes
          │
          └─── Opens http://localhost:5174 (new tab)
```

### 🎯 **Fitur Utama:**

#### 1. **App Launcher (Root Path: /)**
- **Modern landing page** dengan card interface
- **Quick access buttons** untuk setiap module
- **System status indicators** (real-time)
- **Quick links** ke API Gateway, RabbitMQ, dll

#### 2. **Warehouse Module (/warehouse/*)**
- Dashboard inventory
- Transaction management
- Warehouse operations
- Reports & analytics
- **Back to Launcher** button di sidebar

#### 3. **User Module (External Tab)**
- Opens http://localhost:5174 in new tab
- Authentication & registration
- User profile management
- Role-based access control

### 🚀 **Cara Menggunakan:**

#### **Option 1: Single Command (Recommended)**
```bash
cd c:\Project\microservices
start-single-frontend.bat
```

#### **Option 2: Manual Steps**
```bash
# Terminal 1: Start user frontend (background)
cd c:\Project\microservices\user-frontend
npm run dev -- --port 5174

# Terminal 2: Start main frontend
cd c:\Project\microservices\frontend  
npm run dev
```

### 🔧 **Konfigurasi Technical:**

#### **Vite Proxy Configuration:**
```typescript
// frontend/vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:3000',
    '/user': {
      target: 'http://localhost:5174',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/user/, '')
    }
  },
}
```

#### **React Router Setup:**
```tsx
// App.tsx
<Routes>
  <Route path="/" element={<AppLauncher />} />
  <Route path="/warehouse/*" element={<WarehouseModule />} />
</Routes>
```

### 🎨 **UI/UX Benefits:**

- **✅ Single Entry Point**: Satu URL untuk akses semua module
- **✅ Consistent Branding**: Unified design language
- **✅ Easy Navigation**: Clear module separation
- **✅ Quick Access**: Direct links ke tools & status
- **✅ Responsive Design**: Works on desktop & mobile

### 📱 **Access Instructions:**

1. **Start aplikasi:**
   ```bash
   cd c:\Project\microservices
   start-single-frontend.bat
   ```

2. **Akses main application:**
   - Open browser: http://localhost:5173

3. **Pilih module:**
   - **Warehouse Management**: Click "Open Warehouse Module" 
   - **User Management**: Click "Open User Module" (new tab)

### 🔄 **Navigation Flow:**

```
http://localhost:5173 (Launcher)
       │
       ├─── Click "Warehouse" ──→ /warehouse/dashboard
       │                         │
       │                         └─── Navigate to: inventory, reports, etc
       │                         └─── "Back to Launcher" returns to /
       │
       └─── Click "User" ──→ Opens http://localhost:5174 (new tab)
```

### ⚡ **Performance & Development:**

- **Fast Development**: HMR (Hot Module Reload) on both modules
- **Independent Development**: Modules can be developed separately
- **Shared Components**: Common UI components dapat di-share
- **Optimized Build**: Each module builds independently

### 🎊 **Result:**

**✅ Single Port Solution Achieved!**
- **One main URL**: http://localhost:5173
- **Integrated experience** dengan launcher page
- **Easy module switching** tanpa kehilangan context
- **Simplified deployment** & development workflow

---

**🚀 Sekarang Anda hanya perlu mengakses satu URL untuk semua ERP modules!**
