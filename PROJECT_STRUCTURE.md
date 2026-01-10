# Project Structure

## Overview

This is a complete MVP starter template for a Warehouse Management System with:

- **Backend**: Go + Fiber + GORM + PostgreSQL
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL (via Docker)
- **Cache**: Redis (via Docker)

## Directory Structure

```
debozero-wms/
├── backend/                    # Go backend API
│   ├── cmd/
│   │   └── server/
│   │       └── main.go        # Application entry point
│   ├── internal/
│   │   ├── config/           # Configuration management
│   │   ├── database/         # Database connection & migrations
│   │   ├── handlers/         # HTTP handlers (controllers)
│   │   │   ├── auth_handler.go
│   │   │   ├── product_handler.go
│   │   │   └── inventory_handler.go
│   │   ├── middleware/       # Custom middleware (auth, etc.)
│   │   ├── models/           # GORM database models
│   │   │   ├── user.go
│   │   │   ├── product.go
│   │   │   ├── location.go
│   │   │   ├── inventory.go
│   │   │   └── stock_movement.go
│   │   ├── router/           # Route setup
│   │   └── services/         # Business logic layer
│   │       ├── auth_service.go
│   │       ├── product_service.go
│   │       ├── inventory_service.go
│   │       └── location_service.go
│   ├── .env.example          # Environment variables template
│   ├── .gitignore
│   ├── go.mod                # Go dependencies
│   └── README.md
│
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Home/redirect page
│   │   │   ├── globals.css
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Register page
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── products/     # Products pages
│   │   │   └── inventory/     # Inventory pages
│   │   ├── components/       # Reusable React components
│   │   ├── lib/              # Utilities
│   │   │   └── api.ts        # Axios API client
│   │   ├── services/         # API service functions
│   │   │   ├── authService.ts
│   │   │   └── productService.ts
│   │   ├── store/            # Zustand state management
│   │   │   └── authStore.ts
│   │   └── types/            # TypeScript type definitions
│   ├── .env.example
│   ├── .gitignore
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── README.md
│
├── docker-compose.yml         # Docker services (PostgreSQL, Redis)
├── Makefile                   # Development commands
├── SETUP.md                   # Detailed setup instructions
├── README.md                  # Main project documentation
└── .gitignore
```

## Features Implemented

### Backend (Go + Fiber)

✅ **Authentication**
- User registration
- JWT-based login
- Protected routes with middleware
- Role-based access control (RBAC ready)

✅ **Product Management**
- CRUD operations for products
- SKU uniqueness validation
- Search functionality
- Pagination

✅ **Inventory Management**
- Multi-location inventory tracking
- Stock adjustments
- Stock movement history
- Available quantity calculation

✅ **Database Models**
- User (with roles)
- Product (with attributes)
- Location (zones, aisles, shelves)
- Inventory (product-location mapping)
- StockMovement (audit trail)

### Frontend (Next.js)

✅ **Authentication UI**
- Login page with validation
- Registration page
- Protected routes
- Token management

✅ **Dashboard**
- Overview page
- Recent products display
- Navigation menu

✅ **Product Management**
- Product list with search
- Create product form
- Product details view

✅ **Inventory View**
- Inventory list
- Product-location mapping
- Stock levels display

## API Endpoints

### Public
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /health` - Health check

### Protected (Requires JWT)
- `GET /api/v1/auth/profile` - Get user profile
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/inventory` - List inventory
- `GET /api/v1/inventory/product/:productId` - Get inventory by product
- `POST /api/v1/inventory/adjust` - Adjust stock

## Next Steps for Development

1. **Add Location Management UI**
   - Create location CRUD pages
   - Location selection in inventory

2. **Enhance Inventory**
   - Stock adjustment UI
   - Stock movement history view
   - Low stock alerts

3. **Add Orders Module**
   - Sales orders
   - Purchase orders
   - Order fulfillment

4. **Add Receiving/Shipping**
   - Inbound receiving
   - Outbound shipping
   - Pick lists

5. **Reports & Analytics**
   - Dashboard charts
   - Inventory reports
   - Movement reports

6. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

7. **Deployment**
   - CI/CD pipeline
   - Production configuration
   - Monitoring setup

## Technology Choices

### Why Go + Fiber?
- High performance for concurrent operations
- Express-like API (familiar for web developers)
- Excellent for warehouse operations (many concurrent requests)
- Low memory footprint

### Why Next.js?
- Great developer experience
- Server-side rendering ready
- TypeScript support
- Modern React patterns

### Why PostgreSQL?
- ACID compliance (critical for inventory)
- Excellent for relational data
- Full-text search capabilities
- Proven reliability

## Development Commands

```bash
# Setup
make setup

# Start services
make docker-up
make backend
make frontend

# Or use Docker Compose directly
docker-compose up -d
```

See [SETUP.md](./SETUP.md) for detailed instructions.
