# Debozero WMS - Warehouse Management System

A comprehensive warehouse management system for modern logistics operations.

## 🚀 Quick Start

```bash
# 1. Start database services
docker-compose up -d

# 2. Start backend (in backend/ directory)
cd backend
go mod download
cp .env.example .env
go run cmd/server/main.go

# 3. Start frontend (in frontend/ directory, new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:3001` and register a new account!

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 📋 Core Modules

### 1. **Inventory Management**
- Real-time stock levels
- Stock adjustments (add/remove)
- Stock valuation
- Multi-location inventory tracking
- Low stock alerts
- Cycle counting

### 2. **Receiving (Inbound)**
- Purchase order receiving
- Goods receipt notes (GRN)
- Quality inspection
- Put-away operations
- Vendor management
- Return to vendor (RTV)

### 3. **Shipping (Outbound)**
- Order fulfillment
- Pick lists generation
- Packing operations
- Shipping labels
- Carrier integration
- Delivery tracking

### 4. **Location Management**
- Warehouse zones
- Bin/shelf locations
- Location capacity
- Location optimization
- Slotting strategies

### 5. **Order Management**
- Sales orders
- Purchase orders
- Order status tracking
- Order prioritization
- Backorder management

### 6. **Stock Movements**
- Internal transfers
- Stock transfers between locations
- Replenishment
- Movement history
- Audit trail

### 7. **Product/Item Master**
- Product catalog
- SKU management
- Product attributes (dimensions, weight, etc.)
- Barcode/QR code management
- Product categories
- Variants management

### 8. **Pick & Pack Operations**
- Wave picking
- Batch picking
- Zone picking
- Packing stations
- Packing slip generation

### 9. **Reports & Analytics**
- Inventory reports
- Movement reports
- Order fulfillment reports
- Performance metrics
- Dashboard with KPIs
- Export capabilities (CSV, PDF)

### 10. **User Management & Permissions**
- Role-based access control (RBAC)
- User authentication
- Activity logging
- Audit trails
- Multi-warehouse access

### 11. **Barcode/QR Code Scanning**
- Mobile scanning support
- Label printing
- Inventory verification
- Quick receiving/shipping

### 12. **Integration Capabilities**
- E-commerce platform integration
- ERP system integration
- Shipping carrier APIs
- Accounting software integration
- API for third-party systems

## 🛠️ Recommended Tech Stack

### Frontend Stack

#### **Option 1: React Ecosystem (Recommended)**
- **Framework**: Next.js 14+ (App Router) or React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui or Material-UI
- **State Management**: Zustand or Redux Toolkit
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts or Chart.js
- **Mobile**: React Native (for warehouse operations app)

#### **Option 2: Vue Ecosystem**
- **Framework**: Nuxt 3 or Vue 3
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Pinia
- **Forms**: VeeValidate
- **Data Fetching**: VueUse or TanStack Query

### Backend Stack

#### **Option 1: Node.js Ecosystem (Recommended)**
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js or Fastify
- **Language**: TypeScript
- **ORM**: Prisma or TypeORM
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Authentication**: JWT + Passport.js or NextAuth.js
- **API**: REST API or GraphQL (Apollo Server)
- **Real-time**: Socket.io or WebSockets
- **File Storage**: AWS S3 or MinIO
- **Queue**: BullMQ (Redis-based)

#### **Option 2: Python Ecosystem**
- **Framework**: FastAPI or Django
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy (FastAPI) or Django ORM
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Authentication**: JWT or Django Auth
- **API**: REST API (FastAPI auto-docs)
- **Real-time**: WebSockets (FastAPI) or Django Channels
- **Queue**: Celery (Redis/RabbitMQ)

#### **Option 3: Go Ecosystem (High Performance) - Recommended**
- **Framework**: Fiber (Express-like, fast & familiar) ⭐
- **Language**: Go 1.21+
- **ORM**: GORM (most popular) or Ent (Facebook's type-safe ORM)
- **Database**: PostgreSQL 15+ (using `pgx` driver - fastest)
- **Cache**: Redis (go-redis/v9 or rueidis)
- **Authentication**: JWT (golang-jwt/jwt/v5) + bcrypt for passwords
- **API**: REST API (OpenAPI/Swagger with swaggo/swag or fiber-swagger)
- **Real-time**: Gorilla WebSocket or nhooyr.io/websocket
- **Validation**: go-playground/validator/v10 (works great with Fiber)
- **Config**: viper or envconfig
- **Logging**: zerolog or zap (structured logging) - Fiber has built-in logger
- **Queue**: Asynq (Redis-based) or RabbitMQ (streadway/amqp)
- **File Storage**: AWS SDK for Go or MinIO Go client
- **PDF Generation**: gofpdf or unidoc/unioffice
- **Email**: net/smtp or gomail
- **Testing**: testify (assertions) + go-mock (mocking)
- **Fiber Middleware**: 
  - `github.com/gofiber/fiber/v2/middleware/cors` - CORS
  - `github.com/gofiber/fiber/v2/middleware/logger` - Request logging
  - `github.com/gofiber/fiber/v2/middleware/recover` - Panic recovery
  - `github.com/gofiber/fiber/v2/middleware/jwt` - JWT authentication
  - `github.com/gofiber/fiber/v2/middleware/limiter` - Rate limiting

### Database

- **Primary DB**: PostgreSQL (for relational data, transactions)
- **Cache**: Redis (for sessions, real-time data, queues)
- **Search**: PostgreSQL Full-Text Search or Elasticsearch (for advanced search)

### DevOps & Infrastructure

- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions or GitLab CI
- **Cloud**: AWS, GCP, or Azure
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston (Node.js) or structured logging
- **Error Tracking**: Sentry

### Additional Tools

#### For Node.js:
- **Barcode Generation**: `bwip-js` or `jsbarcode`
- **PDF Generation**: `pdfkit` or `puppeteer`
- **Email**: Nodemailer or SendGrid
- **File Upload**: Multer
- **Date Handling**: date-fns or Day.js

#### For Go (Fiber):
- **Barcode Generation**: `github.com/boombuler/barcode` or `github.com/makiuchi-d/gozxing`
- **PDF Generation**: `github.com/jung-kurt/gofpdf` or `github.com/unidoc/unioffice`
- **Email**: `net/smtp` or `gopkg.in/gomail.v2`
- **File Upload**: Fiber has built-in support via `c.FormFile()` or `github.com/gofiber/fiber/v2/middleware/fileupload`
- **Date Handling**: `time` package (built-in) or `github.com/jinzhu/now`

## 📁 Recommended Project Structure

```
debozero-wms/
├── frontend/                 # Frontend application
│   ├── src/
│   │   ├── app/             # Pages/routes
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Utilities
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # State management
│   │   └── types/           # TypeScript types
│   ├── public/
│   └── package.json
├── backend/                  # Backend API
│   ├── cmd/
│   │   └── server/          # Application entry point
│   ├── internal/            # Private application code
│   │   ├── handlers/        # HTTP handlers (controllers)
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── repositories/    # Data access layer
│   │   ├── middleware/      # Auth, validation, etc.
│   │   └── utils/           # Helpers
│   ├── pkg/                 # Public library code
│   ├── migrations/          # Database migrations (if using GORM)
│   ├── config/              # Configuration files
│   ├── go.mod
│   └── go.sum
├── mobile/                   # Mobile app (optional)
├── shared/                   # Shared types/utilities
├── docker-compose.yml        # Local development setup
├── .env.example
└── README.md
```

## 🚀 Getting Started Recommendations

### Phase 1: MVP (Minimum Viable Product)
1. User authentication & authorization
2. Product/Item master
3. Basic inventory management
4. Simple receiving & shipping
5. Location management

### Phase 2: Core Features
1. Advanced picking & packing
2. Reports & analytics
3. Barcode scanning
4. Stock movements & transfers

### Phase 3: Advanced Features
1. Integration capabilities
2. Advanced analytics
3. Mobile app
4. Multi-warehouse support

## 💡 Stack Comparison & Recommendations

### Node.js vs Go for WMS Backend

#### **Node.js (Recommended for Rapid Development)**
**Pros:**
- ✅ Faster development speed (JavaScript/TypeScript ecosystem)
- ✅ Large package ecosystem (npm)
- ✅ Easy to find developers
- ✅ Can share TypeScript types with frontend
- ✅ Great for I/O-heavy operations
- ✅ Excellent real-time support (Socket.io)
- ✅ Prisma provides excellent DX for database operations

**Cons:**
- ❌ Lower performance for CPU-intensive tasks
- ❌ Higher memory consumption
- ❌ Single-threaded (though Node.js handles concurrency well)

**Best for:** Rapid MVP, teams familiar with JavaScript, when development speed is priority

#### **Go (Recommended for High Performance & Scale)**
**Pros:**
- ✅ **Excellent performance** - handles high concurrency efficiently
- ✅ **Low memory footprint** - more efficient resource usage
- ✅ **Built-in concurrency** - goroutines for parallel processing
- ✅ **Fast compilation** - quick build times
- ✅ **Strong typing** - compile-time safety
- ✅ **Great for microservices** - easy to deploy and scale
- ✅ **Excellent for background jobs** - perfect for warehouse operations
- ✅ **Single binary deployment** - easy to deploy
- ✅ **Better for CPU-intensive tasks** - inventory calculations, reports

**Cons:**
- ❌ Steeper learning curve (if team is new to Go)
- ❌ Smaller ecosystem compared to Node.js
- ❌ More verbose than JavaScript/TypeScript
- ❌ No built-in ORM as polished as Prisma
- ❌ Less rapid prototyping compared to Node.js

**Best for:** High-traffic systems, performance-critical operations, microservices architecture, teams with Go experience

### My Recommendations

#### **Option A: Node.js Stack (Rapid Development)**
**Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui  
**Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL

**Choose this if:**
- You want to move fast and iterate quickly
- Your team is familiar with JavaScript/TypeScript
- You prioritize development speed over raw performance
- You need a large ecosystem of packages

#### **Option B: Go Stack with Fiber (High Performance) - Recommended ⭐**
**Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui  
**Backend**: Go + Fiber + GORM + PostgreSQL

**Why Fiber?**
- ✅ Express-like API (familiar if you know Express.js)
- ✅ Excellent performance (built on fasthttp)
- ✅ Great middleware ecosystem
- ✅ Built-in request/response helpers
- ✅ Easy to learn and use
- ✅ Active development and community

**Choose this if:**
- You expect high traffic and need excellent performance
- You need to handle many concurrent warehouse operations
- You want lower infrastructure costs (better resource efficiency)
- You have Go + Fiber experience (faster development!)
- You're building microservices
- You need to process large reports/analytics efficiently

### Hybrid Approach (Best of Both Worlds)
- **Frontend**: Next.js + TypeScript
- **Backend API**: Go (for core WMS operations, high performance)
- **Background Jobs**: Go (for inventory processing, reports)
- **Admin Dashboard**: Node.js (if needed, for rapid UI development)

## 🚀 Quick Start with Go + Fiber Backend

Here's the recommended starter stack with Fiber:

```go
// Core Fiber packages:
- github.com/gofiber/fiber/v2                    // Web framework (Express-like)
- github.com/gofiber/fiber/v2/middleware/cors     // CORS middleware
- github.com/gofiber/fiber/v2/middleware/logger    // Request logging
- github.com/gofiber/fiber/v2/middleware/recover  // Panic recovery
- github.com/gofiber/fiber/v2/middleware/jwt      // JWT authentication
- github.com/gofiber/fiber/v2/middleware/limiter  // Rate limiting

// Database & ORM:
- gorm.io/gorm                                    // ORM
- gorm.io/driver/postgres                         // PostgreSQL driver
- github.com/jackc/pgx/v5                         // Alternative: faster PostgreSQL driver

// Cache & Queue:
- github.com/redis/go-redis/v9                    // Redis client
- github.com/hibiken/asynq                       // Background jobs (Redis-based)

// Authentication & Security:
- github.com/golang-jwt/jwt/v5                    // JWT tokens
- golang.org/x/crypto/bcrypt                      // Password hashing

// Validation & Config:
- github.com/go-playground/validator/v10          // Struct validation
- github.com/spf13/viper                          // Configuration management

// Logging:
- github.com/rs/zerolog                           // Structured logging
- github.com/gofiber/fiber/v2/middleware/logger   // Fiber logger middleware

// Real-time:
- github.com/gorilla/websocket                    // WebSocket support
- github.com/gofiber/websocket/v2                // Fiber WebSocket adapter

// Utilities:
- github.com/google/uuid                          // UUID generation
- github.com/jinzhu/now                           // Date/time utilities
```

### Fiber Project Structure Example

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/
│   ├── handlers/                # HTTP handlers (Fiber handlers)
│   │   ├── auth_handler.go
│   │   ├── inventory_handler.go
│   │   └── order_handler.go
│   ├── services/                # Business logic
│   ├── models/                  # GORM models
│   ├── repositories/            # Data access layer
│   ├── middleware/              # Custom middleware
│   │   ├── auth.go
│   │   └── validation.go
│   ├── utils/                   # Helpers
│   └── config/                  # Configuration
│       └── config.go
├── pkg/                         # Public packages
├── migrations/                  # Database migrations
├── go.mod
└── go.sum
```

### Basic Fiber Setup Example

```go
package main

import (
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
    app := fiber.New(fiber.Config{
        AppName: "Debozero WMS API",
    })

    // Middleware
    app.Use(cors.New())
    app.Use(logger.New())
    app.Use(recover.New())

    // Routes
    app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"status": "ok"})
    })

    // API routes
    api := app.Group("/api/v1")
    // Add your routes here

    app.Listen(":3000")
}
```

Would you like me to:
1. **Set up the initial Go + Fiber backend project structure** with authentication, database setup, and basic CRUD operations?
2. Create a detailed Go + Fiber implementation guide with code examples?
3. Set up both frontend (Next.js) and backend (Go + Fiber) together?
