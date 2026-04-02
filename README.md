# 🏭 Warehouse Management System (WMS)

Sistem manajemen gudang modern berbasis web yang dibangun dengan **Next.js 14+**, **TypeScript**, **MySQL**, dan **Tailwind CSS**.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19+-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue?style=flat-square&logo=mysql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Fitur Utama

- 🔐 **Authentication** - Login/Register dengan JWT secure
- 📦 **Inventory Management** - Real-time stock tracking per warehouse
- 📋 **Order Management** - Purchase Order (PO) dan Sales Order (SO)
- 🚚 **Shipment Tracking** - Real-time tracking dengan history
- 🏷️ **Product Management** - CRUD dengan unique SKU
- 🏭 **Multi-Warehouse** - Support untuk multiple warehouse locations
- 📊 **Dashboard** - Analytics real-time dan monitoring
- 👥 **Role-Based Access** - Admin, Manager, Staff dengan permissions

## 🚀 Quick Start (5 menit)

```bash
# Clone & install
git clone <repo>
cd debozero-wms
npm install

# Setup database
cp .env.example .env.local
# Edit .env.local dengan MySQL settings Anda

# Create database
mysql -u root -p -e "CREATE DATABASE warehouse_db_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations & seed data
npm run db:migrate
npm run db:seed

# Start dev server
npm run dev
```

**Buka:** http://localhost:3000

**Login dengan:**
- Email: `demo@warehouse.com`
- Password: `demo123`

## 📚 Full Documentation

- [📖 Setup & Installation](./WMS_SETUP_GUIDE.md)
- [🚀 Deployment Guide](./DEPLOY_GUIDE.md) - Vercel, Railway, Docker, AWS
- [🔌 API Reference](./WMS_SETUP_GUIDE.md#api-documentation)
- [🧠 Architecture & Design](./WMS_SETUP_GUIDE.md#project-structure)

## 📦 Tech Stack

- **Frontend:** Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** MySQL 8.0+ with Prisma ORM
- **Auth:** JWT + bcryptjs
- **Validation:** Zod

## 🎯 API Endpoints

```
POST   /api/auth/register          # Register
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get profile

GET    /api/products               # List products
POST   /api/products               # Create product
PUT    /api/products/:id           # Update product
DELETE /api/products/:id           # Delete product

GET    /api/warehouses             # List warehouses
POST   /api/warehouses             # Create warehouse
PUT    /api/warehouses/:id         # Update warehouse

GET    /api/orders                 # List orders
POST   /api/orders                 # Create order
PUT    /api/orders/:id             # Update order

GET    /api/inventory              # List inventory
POST   /api/inventory              # Update inventory

GET    /api/shipments              # List shipments
POST   /api/shipments              # Create shipment
PUT    /api/shipments/:id          # Update shipment status
```

## 💻 Available Commands

```bash
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Run production build

npm run db:studio              # Visual database explorer
npm run db:migrate             # Create/apply migrations
npm run db:seed                # Seed demo data
npm run type-check             # Type checking
npm run lint                   # Linting
```

## 🚀 Deploy

### Vercel (Recommended)

```bash
vercel
# Follow prompts to connect GitHub repo
```

### Other Options
- Railway.app
- Docker + self-hosted
- AWS Amplify

[📖 See deployment guide](./DEPLOY_GUIDE.md)

## 🔒 Security Features

- JWT authentication with 7-day expiration
- bcryptjs password hashing (10 rounds)
- SQL injection prevention (Prisma)
- Role-based access control
- Audit logging

⚠️ **Production:** Change JWT_SECRET to secure random string!

## 🤝 Contributing

```bash
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

## 📝 License

MIT License

## 🆘 Support

- **Setup Issues?** → [WMS_SETUP_GUIDE.md](./WMS_SETUP_GUIDE.md#troubleshooting)
- **Deployment Help?** → [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
- **API Questions?** → [API Docs](./WMS_SETUP_GUIDE.md#api-documentation)

---

**Ready to get started?** [📖 Go to Setup Guide →](./WMS_SETUP_GUIDE.md)
