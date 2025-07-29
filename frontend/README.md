# Warehouse Management System - Frontend

Frontend modern untuk sistem manajemen warehouse yang dibangun dengan teknologi terbaik 2025.

## 🚀 Teknologi yang Digunakan

### Core Technologies
- **React 18** - Library UI modern dengan concurrent features
- **TypeScript** - Type safety dan developer experience yang optimal
- **Vite** - Build tool super cepat untuk development
- **Tailwind CSS** - Utility-first CSS framework

### State Management & Data Fetching
- **TanStack React Query** - Server state management dan caching
- **Axios** - HTTP client dengan interceptors

### Form & Validation
- **React Hook Form** - Performant form library
- **Zod** - Schema validation yang type-safe

### UI/UX
- **Lucide React** - Icon library yang modern
- **React Hot Toast** - Notifikasi yang elegant
- **Custom UI Components** - Komponen yang dibuat khusus dengan Tailwind

### Routing & Navigation
- **React Router v6** - Client-side routing

## 📁 Struktur Project

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI components (Button, Card, etc.)
│   │   ├── Layout.tsx      # Main layout component
│   │   ├── CreateTransactionModal.tsx
│   │   └── TransactionFilters.tsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx   # Dashboard dengan analytics
│   │   ├── InventoryTransactions.tsx  # Halaman utama transaksi
│   │   ├── Inventory.tsx   # Manajemen inventory
│   │   ├── Warehouses.tsx  # Manajemen warehouse
│   │   └── Reports.tsx     # Laporan dan analytics
│   ├── hooks/              # Custom React hooks
│   │   └── useApi.ts       # API hooks dengan React Query
│   ├── services/           # API services
│   │   └── api.ts          # API calls dan endpoints
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Semua interface dan types
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # Axios configuration
│   │   └── utils.ts        # Helper functions
│   ├── App.tsx             # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles dan Tailwind
├── public/                 # Static assets
├── Dockerfile             # Docker configuration
├── nginx.conf             # Nginx configuration
└── package.json           # Dependencies dan scripts
```

## 🎯 Fitur Utama

### Dashboard
- Overview sistem warehouse
- Statistik transaksi bulan ini
- Ringkasan inventory terbaru
- Grafik barang masuk/keluar

### Transaksi Inventory
- **Barang Masuk (Inbound)**
  - Form pencatatan barang masuk
  - Informasi supplier dan batch
  - Otomatis update inventory
  
- **Barang Keluar (Outbound)**
  - Form pencatatan barang keluar
  - Informasi customer dan pengiriman
  - Validasi stok tersedia

- **Filter & Pencarian**
  - Filter berdasarkan jenis transaksi
  - Filter berdasarkan tanggal
  - Filter berdasarkan status
  - Pencarian berdasarkan SKU

### UI/UX Modern
- Responsive design untuk semua device
- Dark/light mode ready
- Loading states dan error handling
- Real-time notifications
- Optimistic updates

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development server (http://localhost:3000)
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🐳 Docker Deployment

Frontend sudah dikonfigurasi untuk berjalan di Docker dengan Nginx:

```bash
# Build dan jalankan dengan docker-compose
cd ../
docker-compose up -d frontend

# Frontend akan tersedia di http://localhost:3000
```

## 🔌 API Integration

Frontend terintegrasi penuh dengan backend API:

- **Base URL**: `/api/v1`
- **Auto Proxy**: Development server otomatis proxy ke `http://localhost:8080`
- **Error Handling**: Interceptors untuk handle 401, 500, dll
- **Caching**: Smart caching dengan React Query
- **Optimistic Updates**: UI update sebelum API response

### Endpoint yang Digunakan
- `GET /api/v1/inventory-transactions` - List transaksi
- `POST /api/v1/inventory-transactions/inbound` - Barang masuk
- `POST /api/v1/inventory-transactions/outbound` - Barang keluar
- `GET /api/v1/inventory-transactions/summary` - Laporan summary
- `GET /api/v1/inventory` - List inventory
- `GET /api/v1/warehouses` - List warehouse

## 🎨 Design System

### Color Palette
- **Primary**: Blue-600 (#2563eb)
- **Success**: Green-600 (#16a34a) 
- **Warning**: Yellow-600 (#ca8a04)
- **Error**: Red-600 (#dc2626)
- **Neutral**: Gray scale

### Typography
- **Font**: Inter (system font fallback)
- **Heading**: font-bold, various sizes
- **Body**: font-normal, text-sm/base
- **Captions**: text-xs, text-muted-foreground

### Components
- **Button**: 4 variants (default, outline, ghost, destructive)
- **Card**: Consistent shadow dan border-radius
- **Table**: Responsive dengan hover states
- **Modal**: Backdrop blur dengan smooth transitions
- **Badge**: Status indicators dengan color coding

## 📱 Responsive Design

- **Mobile First**: Dibangun dengan pendekatan mobile-first
- **Breakpoints**: 
  - sm: 640px
  - md: 768px  
  - lg: 1024px
  - xl: 1280px
- **Navigation**: Sidebar collapse di mobile
- **Tables**: Horizontal scroll di mobile
- **Forms**: Stack vertical di mobile

## 🔮 Roadmap & Enhancements

### Phase 2
- [ ] Form create/edit transaksi yang lengkap
- [ ] Bulk upload inventory
- [ ] Advanced filtering dan sorting
- [ ] Export data ke Excel/PDF
- [ ] Real-time notifications dengan WebSocket

### Phase 3
- [ ] PWA support (offline capability)
- [ ] Mobile app dengan React Native
- [ ] Advanced analytics dashboard
- [ ] Role-based access control
- [ ] Multi-language support

## 🤝 Best Practices yang Diimplementasi

### Code Quality
- **TypeScript strict mode**
- **ESLint configuration**
- **Consistent naming conventions**
- **Component composition patterns**

### Performance
- **Code splitting dengan Vite**
- **React Query caching**
- **Optimized bundle size**
- **Image optimization**

### Security
- **Input sanitization**
- **XSS protection**
- **CSRF protection** 
- **Secure HTTP headers**

### Accessibility
- **Semantic HTML**
- **ARIA labels**
- **Keyboard navigation**
- **Screen reader support**

---

## 🌟 Kesimpulan

Frontend ini dibangun dengan standar enterprise dan best practices 2025:

1. **Modern Tech Stack** - React 18, TypeScript, Vite
2. **Excellent DX** - Hot reload, type safety, linting
3. **Production Ready** - Docker, Nginx, optimized build
4. **Scalable Architecture** - Modular components, clean separation
5. **Beautiful UI** - Modern design dengan Tailwind CSS
6. **Great UX** - Responsive, fast, intuitive

Frontend ini siap untuk production dan dapat dengan mudah dikembangkan lebih lanjut sesuai kebutuhan bisnis.
