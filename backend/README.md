# Debozero WMS - Backend API

Go + Fiber backend for Warehouse Management System.

## Tech Stack

- **Framework**: Fiber v2
- **ORM**: GORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Language**: Go 1.21+

## Setup

1. **Install dependencies:**
   ```bash
   go mod download
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations:**
   Migrations run automatically on startup.

4. **Start the server:**
   ```bash
   go run cmd/server/main.go
   ```

   Or using air for hot reload:
   ```bash
   air
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get current user profile (protected)

### Products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products` - List products (with pagination & search)
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Inventory
- `GET /api/v1/inventory` - List all inventory (with pagination)
- `GET /api/v1/inventory/product/:productId` - Get inventory by product
- `GET /api/v1/inventory/product/:productId/total` - Get total stock for product
- `POST /api/v1/inventory/adjust` - Adjust stock

## Request/Response Examples

### Register
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user"
}
```

### Login
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "error": false,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

### Create Product
```json
POST /api/v1/products
Authorization: Bearer <token>
{
  "sku": "PROD-001",
  "name": "Product Name",
  "description": "Product description",
  "category": "Electronics",
  "unit": "pcs",
  "weight": 1.5,
  "barcode": "1234567890123"
}
```

### Adjust Stock
```json
POST /api/v1/inventory/adjust
Authorization: Bearer <token>
{
  "product_id": "uuid",
  "location_id": "uuid",
  "quantity": 10.0,
  "notes": "Initial stock"
}
```
