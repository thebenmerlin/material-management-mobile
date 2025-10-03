# Material Management System

A modern, mobile-first Material Management System built with Next.js 14, designed for construction sites to streamline material requisition, approval, and tracking processes.

## 🚀 Features

### Core Functionality
- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Role-Based Access**: Site Engineer, Purchase Team, and Director roles
- **Material Indent Management**: Create, approve, and track material requests
- **Order Management**: Handle vendor orders and delivery tracking
- **Receipt Upload**: Photo upload capability for material receipts
- **Real-time Analytics**: Comprehensive reporting with interactive charts
- **Export Capabilities**: JSON export for reports and data analysis

### Technical Features
- **Next.js 14 App Router**: Latest Next.js features with server components
- **TypeScript**: Type-safe development
- **TailwindCSS + shadcn/ui**: Modern, accessible UI components
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Interactive data visualization
- **Mobile PWA Ready**: Can be installed as a mobile app

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Toast Notifications**: Sonner
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running at the configured URL

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Extract the project
unzip material-management-mobile.zip
cd material-management-mobile

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your settings
NEXT_PUBLIC_API_URL=https://mock-api-w7qy.onrender.com/api
NEXT_PUBLIC_APP_NAME=Material Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 4. Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### Environment Variables for Vercel

Add these in your Vercel project settings:

```
NEXT_PUBLIC_API_URL=https://mock-api-w7qy.onrender.com/api
NEXT_PUBLIC_APP_NAME=Material Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 👥 User Roles & Permissions

### Site Engineer
- ✅ Create material indents
- ✅ View own site's indents
- ✅ Mark materials as received/damaged
- ✅ Upload receipt photos
- ❌ Cannot approve indents or create orders

### Purchase Team
- ✅ View all indents across sites
- ✅ Approve/reject indents
- ✅ Create vendor orders
- ✅ View comprehensive reports
- ❌ Cannot close indents (Director only)

### Director
- ✅ Full access to all features
- ✅ View all sites and operations
- ✅ Final approval authority
- ✅ Export and advanced analytics
- ✅ Close completed indents

## 📱 Mobile Features

### Responsive Design
- **Mobile-First**: Designed primarily for mobile devices
- **Touch-Friendly**: Large buttons and touch targets
- **Portrait/Landscape**: Works in both orientations
- **Safe Areas**: Respects device safe areas and notches

### Mobile Navigation
- **Bottom Navigation**: Easy thumb navigation
- **Role-Based Menu**: Shows relevant features only
- **Quick Actions**: Fast access to common tasks

### Camera Integration
- **Photo Capture**: Direct camera access for receipts
- **Image Preview**: Instant preview before upload
- **File Size Optimization**: Automatic compression

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Granular permissions
- **Site Isolation**: Site-specific data access
- **Secure API Communication**: Encrypted data transfer
- **Session Management**: Automatic logout on inactivity

## 📊 Analytics & Reporting

### Dashboard Analytics
- Real-time statistics
- Monthly trends
- Status distribution charts
- Site performance metrics

### Monthly Reports
- Detailed breakdowns by category
- Site-wise performance
- Cost analysis
- Processing time metrics

### Export Options
- JSON format exports
- Date range filtering
- Role-based data access

## 🎨 UI/UX Features

### Design System
- **Consistent Colors**: Primary blue with semantic colors
- **Typography**: Inter font for readability
- **Spacing**: Consistent 4px grid system
- **Shadows**: Subtle depth with material design

### Animations
- **Page Transitions**: Smooth navigation
- **Loading States**: Engaging loading indicators
- **Micro-interactions**: Button hover effects
- **List Animations**: Staggered item appearances

### Accessibility
- **Screen Reader Support**: ARIA labels and roles
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Clear focus states

## 🔧 API Integration

### Central API Layer (`lib/api.ts`)
- **Authentication**: Login/logout/token management
- **Indents**: CRUD operations for material requests
- **Orders**: Order management and tracking
- **Reports**: Analytics and data export
- **Upload**: File upload handling
- **Error Handling**: Comprehensive error management

### API Structure
```typescript
// Authentication
await authApi.login(credentials)
await authApi.logout()

// Indents
await indentsApi.createIndent(data)
await indentsApi.getIndents(filters)
await indentsApi.approveIndent(id, decision)

// Orders
await ordersApi.createOrder(data)
await ordersApi.getOrders(filters)

// Reports
await reportsApi.getMonthlyReport(month, year)
await reportsApi.exportReport(type, filters)
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Environment Variables Not Loading**
   - Ensure `.env.local` exists in project root
   - Variables must start with `NEXT_PUBLIC_` for client-side
   - Restart development server after changes

3. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings on backend
   - Ensure backend is running and accessible

4. **Mobile Layout Issues**
   - Test on actual mobile devices
   - Use browser dev tools mobile simulation
   - Check viewport meta tag in layout.tsx

### Development Tips

1. **Fast Development**
   ```bash
   # Use Turbopack for faster builds (experimental)
   npm run dev -- --turbo
   ```

2. **Type Checking**
   ```bash
   # Run TypeScript checks
   npx tsc --noEmit
   ```

3. **Linting**
   ```bash
   # Run ESLint
   npm run lint
   ```

## 📁 Project Structure

```
material-management-mobile/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # Dashboard with analytics
│   ├── indents/           # Indent management
│   ├── orders/            # Order management
│   ├── reports/           # Analytics & reporting
│   ├── upload/            # Receipt upload
│   ├── settings/          # User settings
│   ├── login/             # Authentication
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── auth-provider.tsx  # Authentication context
│   ├── header.tsx         # App header
│   └── mobile-nav.tsx     # Bottom navigation
├── lib/                   # Utilities and API
│   ├── api.ts            # Central API layer
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript config
└── next.config.js        # Next.js configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Contact your system administrator
- Review API documentation

## 🎯 Future Enhancements

- Push notifications
- Offline functionality
- Dark mode support
- Multi-language support
- Advanced filtering options
- Bulk operations
- Calendar integration
- Vendor management module

---

Built with ❤️ using Next.js 14 and modern web technologies.
