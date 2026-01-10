# Troubleshooting Guide

## Registration Failed Error

If you're getting "Registration Failed" error, follow these steps:

### 1. Check Backend is Running

```bash
# Check if backend is running on port 3000
curl http://localhost:3000/health

# Should return:
# {"status":"ok","service":"debozero-wms-api"}
```

If this fails, start the backend:
```bash
cd backend
go run cmd/server/main.go
```

### 2. Check Database is Running

```bash
# Check Docker containers
docker-compose ps

# Should show postgres and redis running
# If not, start them:
docker-compose up -d

# Check database logs
docker-compose logs postgres
```

### 3. Verify Database Connection

Check your `backend/.env` file:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/debozero_wms?sslmode=disable
```

Test database connection:
```bash
psql -h localhost -U postgres -d debozero_wms
# Password: postgres
```

### 4. Check Frontend API URL

Verify `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 5. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for error messages
- **Network tab**: Check if the request to `/api/v1/auth/register` is failing

Common errors:
- `ECONNREFUSED`: Backend not running
- `CORS error`: Backend CORS not configured correctly
- `404`: Wrong API URL
- `500`: Database connection issue

### 6. Check Backend Logs

Look at the backend terminal output for errors:
- Database connection errors
- Migration errors
- Request errors

### 7. Verify Ports

- **Backend**: Should be on port 3000
- **Frontend**: Should be on port 3001
- **PostgreSQL**: Should be on port 5432
- **Redis**: Should be on port 6379

### 8. Common Issues

#### Issue: "Cannot connect to server"
**Solution**: Make sure backend is running:
```bash
cd backend
go run cmd/server/main.go
```

#### Issue: "Database connection failed"
**Solution**: Start Docker services:
```bash
docker-compose up -d
```

#### Issue: "Email already exists"
**Solution**: This is expected if you already registered. Try logging in instead.

#### Issue: CORS Error
**Solution**: Check `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:3001
```

### 9. Reset Everything

If nothing works, reset:
```bash
# Stop everything
docker-compose down -v
cd backend
# Remove .env if needed
rm .env

# Restart
docker-compose up -d
cd backend
cp .env.example .env
go run cmd/server/main.go
```

### 10. Check Error Details

The improved error handling will now show:
- Network errors (backend not running)
- Server errors (database issues)
- Validation errors (invalid input)
- Business logic errors (email exists, etc.)

Look at the browser console for detailed error messages.
