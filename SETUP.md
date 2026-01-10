# Setup Guide - Debozero WMS

Complete setup instructions for the Warehouse Management System.

## Prerequisites

- **Go** 1.21 or higher
- **Node.js** 18 or higher
- **Docker** and **Docker Compose** (for database)
- **PostgreSQL** 15+ (or use Docker)
- **Git**

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository (if not already done)
cd debozero-wms
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis using Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Go dependencies
go mod download

# Create .env file
cp .env.example .env

# Edit .env if needed (defaults should work for local development)
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/debozero_wms?sslmode=disable
# JWT_SECRET=your-secret-key-change-in-production-min-32-chars
# PORT=3000
# ALLOWED_ORIGINS=http://localhost:3001

# Run the backend server
go run cmd/server/main.go
```

The backend will start on `http://localhost:3000`

### 4. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create .env file
cp .env.example .env

# Edit .env if needed (default should work)
# NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Start development server
npm run dev
# or
yarn dev
```

The frontend will start on `http://localhost:3001`

### 5. Access the Application

1. Open browser: `http://localhost:3001`
2. Register a new account or login
3. Start using the WMS!

## Default Credentials

After first run, you'll need to register a new account through the registration page.

## API Endpoints

### Health Check
- `GET http://localhost:3000/health`

### Authentication
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get profile (protected)

### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Inventory
- `GET /api/v1/inventory` - List inventory
- `GET /api/v1/inventory/product/:productId` - Get inventory by product
- `POST /api/v1/inventory/adjust` - Adjust stock

## Development

### Backend Hot Reload (Optional)

Install Air for hot reload:

```bash
go install github.com/cosmtrek/air@latest
```

Create `.air.toml` in backend directory or use default:

```bash
cd backend
air
```

### Database Migrations

Migrations run automatically on backend startup. To reset the database:

```bash
# Stop backend
# Drop and recreate database
docker-compose down -v
docker-compose up -d

# Restart backend (migrations will run automatically)
```

## Troubleshooting

### Database Connection Issues

1. Verify Docker containers are running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Test connection:
   ```bash
   psql -h localhost -U postgres -d debozero_wms
   ```

### Port Already in Use

If port 3000 or 3001 is already in use:

1. Change backend port in `backend/.env`:
   ```
   PORT=3002
   ```

2. Update frontend API URL in `frontend/.env`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
   ```

### CORS Issues

Make sure `ALLOWED_ORIGINS` in backend `.env` matches your frontend URL.

## Production Deployment

1. Set strong `JWT_SECRET` (minimum 32 characters)
2. Use environment variables for all sensitive data
3. Enable SSL/TLS
4. Set up proper database backups
5. Configure production database (not Docker for production)
6. Set up monitoring and logging
7. Use reverse proxy (nginx, Caddy, etc.)

## Next Steps

- Add more modules (Orders, Receiving, Shipping)
- Implement barcode scanning
- Add reports and analytics
- Set up CI/CD
- Add unit and integration tests
