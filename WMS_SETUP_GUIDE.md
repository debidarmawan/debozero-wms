# Warehouse Management System (WMS)

Sistem manajemen gudang berbasis web yang dibangun dengan Next.js, TypeScript, MySQL, dan Tailwind CSS.

## Fitur

- ✅ **Autentikasi Pengguna** - Login/Register dengan JWT
- ✅ **Manajemen Inventori** - Tracking stock per warehouse
- ✅ **Manajemen Order** - Purchase Order (PO) dan Sales Order (SO)
- ✅ **Tracking Pengiriman** - Real-time shipment tracking
- ✅ **Manajemen Produk** - CRUD produk dengan SKU
- ✅ **Multi-Warehouse** - Support untuk multiple warehouse
- ✅ **Dashboard** - Real-time analytics dan monitoring
- ✅ **Role-Based Access** - Admin, Manager, Staff

## Tech Stack

- **Frontend:** Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** MySQL 8.0+
- **ORM:** Prisma  
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod

## Prerequisites

- Node.js 20+ (atau 18+ dengan beberapa adjustments)
- MySQL 8.0+
- npm atau yarn

## Setup & Installation

### 1. Clone Repository
\`\`\`bash
git clone <your-repo-url>
cd debozero-wms
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup Database

#### Create Database
\`\`\`bash
mysql -u root -p
CREATE DATABASE warehouse_db_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
\`\`\`

#### Update .env.local
Edit file `.env.local` dengan konfigurasi MySQL Anda:

\`\`\`env
# Database Connection
DATABASE_URL="mysql://username:password@localhost:3306/warehouse_db_dev"

# JWT Secret (change in production!)
JWT_SECRET="your_super_secret_jwt_key_change_in_production"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:3000"
\`\`\`

#### Run Migrations
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

### 4. Create Demo User
\`\`\`bash
npm run seed
\`\`\`

atau manual via API:
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "demo@warehouse.com",
    "password": "demo123",
    "name": "Demo User"
  }'
\`\`\`

### 5. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Server akan berjalan di: http://localhost:3000

## API Documentation

### Authentication

#### Register
\`\`\`
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
\`\`\`

#### Login
\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
\`\`\`

#### Get Profile
\`\`\`
GET /api/auth/me
Authorization: Bearer <token>
\`\`\`

### Products

#### Get All Products
\`\`\`
GET /api/products?page=1&limit=10&search=SEARCH_TERM
Authorization: Bearer <token>
\`\`\`

#### Create Product
\`\`\`
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "SKU-001",
  "name": "Product Name",
  "description": "Description",
  "price": 100.00,
  "weight": 1.5
}
\`\`\`

#### Get Product by ID
\`\`\`
GET /api/products/:id
Authorization: Bearer <token>
\`\`\`

#### Update Product
\`\`\`
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 150.00
}
\`\`\`

#### Delete Product
\`\`\`
DELETE /api/products/:id
Authorization: Bearer <token>
\`\`\`

### Warehouses

#### Get All Warehouses
\`\`\`
GET /api/warehouses?page=1&limit=10
Authorization: Bearer <token>
\`\`\`

#### Create Warehouse
\`\`\`
POST /api/warehouses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Warehouse Jakarta",
  "location": "Jl. Sudirman No. 1",
  "city": "Jakarta",
  "capacity": 10000
}
\`\`\`

### Orders

#### Get All Orders
\`\`\`
GET /api/orders?type=inbound&status=pending&warehouseId=1&page=1&limit=10
Authorization: Bearer <token>
\`\`\`

#### Create Order
\`\`\`
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderNumber": "ORD-2024-001",
  "type": "inbound",
  "warehouseId": 1,
  "details": [
    {
      "productId": 1,
      "quantity": 100,
      "unitPrice": 50.00
    }
  ]
}
\`\`\`

### Inventory

#### Get Inventory Items
\`\`\`
GET /api/inventory?warehouseId=1&page=1&limit=10
Authorization: Bearer <token>
\`\`\`

#### Update Inventory
\`\`\`
POST /api/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "warehouseId": 1,
  "quantity": 500,
  "minStock": 50
}
\`\`\`

### Shipments

#### Get All Shipments
\`\`\`
GET /api/shipments?status=pending&warehouseId=1&page=1&limit=10
Authorization: Bearer <token>
\`\`\`

#### Create Shipment
\`\`\`
POST /api/shipments
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 1,
  "warehouseId": 1,
  "trackingNumber": "TRK-001-2024",
  "carrier": "JNE"
}
\`\`\`

#### Update Shipment Status
\`\`\`
PUT /api/shipments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_transit",
  "shippedAt": "2024-03-29T10:00:00Z"
}
\`\`\`

#### Add Tracking Update
\`\`\`
POST /api/shipments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_transit",
  "location": "Jakarta",
  "notes": "Package en route"
}
\`\`\`

## Deployment ke Vercel

### Langkah 1: Prepare Repository
\`\`\`bash
git add .
git commit -m "Initial WMS setup"
git push origin main
\`\`\`

### Langkah 2: Setup Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up dengan GitHub account
3. Authorize Vercel

### Langkah 3: Import Project
1. Klik "Add New Project"
2. Pilih GitHub repository Anda
3. Klik "Import"

### Langkah 4: Configure Environment Variables
1. Di Vercel dashboard, masuk ke project settings
2. Klik "Environment Variables"
3. Tambahkan:
   - `DATABASE_URL`: Connection string MySQL (gunakan service seperti PlanetScale, Aiven, atau cloud DB)
   - `JWT_SECRET`: Generate random string untuk production
   - `NEXT_PUBLIC_API_URL`: URL production Anda

### Langkah 5: Setup Database
Jika menggunakan cloud MySQL service:

1. **PlanetScale (Recommended)**
   - Go to [planetscale.com](https://planetscale.com)
   - Create account dan new database
   - Copy connection string ke Vercel `DATABASE_URL`
   - Run migration: \`npx prisma migrate deploy\`

2. **Aiven**
   - Go to [aiven.io](https://aiven.io)
   - Create MySQL service
   - Copy connection string

3. **AWS RDS**
   - Create RDS instance
   - Update security group untuk allow Vercel IPs

### Langkah 6: Deploy
\`\`\`bash
# Auto deployment pada push ke main branch
git push origin main
\`\`\`

### Langkah 7: Run Initial Migration on Production
\`\`\`bash
# Via Vercel CLI
vercel env pull  # Pull environment variables
npx prisma migrate deploy  # Run migrations
\`\`\`

## Database Migration

### Prisma Commands

\`\`\`bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
\`\`\`

## Project Structure

\`\`\`
debozero-wms/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   ├── products/          # Product management
│   │   │   ├── warehouses/        # Warehouse management
│   │   │   ├── orders/            # Order management
│   │   │   ├── inventory/         # Inventory management
│   │   │   └── shipments/         # Shipment tracking
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/             # Main dashboard
│   │   └── layout.tsx
│   ├── components/                # React components
│   ├── lib/                       # Utility functions
│   │   ├── auth.ts               # JWT & password utilities
│   │   └── prisma.ts             # Prisma client
│   ├── types/                     # TypeScript types
│   ├── utils/                     # Helper functions
│   │   ├── response.ts           # API response helpers
│   │   └── validation.ts         # Zod schemas
│   └── middleware.ts              # JWT middleware
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── public/                        # Static assets
├── .env.local                     # Environment variables (local)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
\`\`\`

## Development Tips

### Enable Logging
Di `.env.local`, tambahkan:
\`\`\`env
# Prisma Logging
DATABASE_LOG=query,error,info
\`\`\`

### Running Seeds
Create file \`prisma/seed.ts\`:
\`\`\`typescript
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

async function main() {
  // Create demo user
  const hashedPassword = await hashPassword('demo123');
  
  await prisma.user.upsert({
    where: { email: 'demo@warehouse.com' },
    update: {},
    create: {
      email: 'demo@warehouse.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'admin',
    },
  });
}

main();
\`\`\`

### Add to package.json:
\`\`\`json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
\`\`\`

## Security

- ✅ JWT token expiration: 7 days
- ✅ Password hashing dengan bcryptjs
- ✅ Environment variables untuk secrets
- ⚠️ **IMPORTANT:** Change `JWT_SECRET` di production!
- ⚠️ Database credentials harus di environment variables
- ⚠️ Enable HTTPS di production
- ⚠️ Setup CORS properly di production

## Troubleshooting

### Port 3000 sudah digunakan
\`\`\`bash
npm run dev -- -p 3001
\`\`\`

### Database connection error
1. Check MySQL service running
2. Verify connection string di `.env.local`
3. Check firewall settings

### Migration errors
\`\`\`bash
# Reset database (only in development!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
\`\`\`

## Production Checklist

- [ ] Change `JWT_SECRET` ke random string yang kompleks
- [ ] Setup database cloud (PlanetScale/Aiven/AWS RDS)
- [ ] Enable HTTPS
- [ ] Setup error logging (e.g., Sentry)
- [ ] Setup performance monitoring
- [ ] Configure CORS untuk production domain
- [ ] Setup backup strategy untuk database
- [ ] Enable rate limiting untuk API
- [ ] Setup WAF (Web Application Firewall)
- [ ] Regular security audits

## Testing Local APIs

### Using cURL
\`\`\`bash
# Register
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"test123"}'
\`\`\`

### Using Postman/Insomnia
1. Import API routes
2. Setup Bearer token dalam Authorization header
3. Test endpoints

## Contributing

1. Create feature branch: \`git checkout -b feature/amazing-feature\`
2. Commit changes: \`git commit -m 'Add amazing feature'\`
3. Push to branch: \`git push origin feature/amazing-feature\`
4. Open a Pull Request

## License

MIT License

## Support

For issues or questions:
- Email: support@example.com
- Issues: GitHub Issues
- Documentation: [Wiki](./wiki)

---

**Build dengan ❤️ untuk warehouse management yang lebih baik**
