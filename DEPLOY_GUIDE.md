# Quick Start Setup

Panduan cepat untuk setup WMS application.

## 1. Quick Setup (5 minutes)

### Environment Setup
\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Edit dengan MySQL connection Anda
nano .env.local
\`\`\`

### Database Setup
\`\`\`bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE warehouse_db_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Update .env.local dengan:
# DATABASE_URL="mysql://root:password@localhost:3306/warehouse_db_dev"

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
\`\`\`

### Run Application
\`\`\`bash
npm run dev
# Open http://localhost:3000
\`\`\`

### Demo Login
- Email: `demo@warehouse.com`
- Password: `demo123`

---

## 2. Full Production Deployment (Vercel + PlanetScale)

### Step 1: Setup PlanetScale Database

1. Go to [planetscale.com](https://planetscale.com) dan sign up
2. Create new organization dan database
3. Buat user untuk connection:
   - Database > Passwords > New password
   - Copy MySQL connection string
4. Save connection string (format: `mysql://user:password@host/database`)

### Step 2: Setup Vercel Deployment

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy to Vercel
vercel

# Follow prompts to connect GitHub repo
\`\`\`

### Step 3: Configure Environment Variables

Di Vercel Dashboard:

1. Go to Project Settings > Environment Variables
2. Add these variables:

\`\`\`
DATABASE_URL = mysql://user:password@host/database
JWT_SECRET = (generate random: openssl rand -base64 32)
NEXT_PUBLIC_API_URL = https://yourdomain.vercel.app
NODE_ENV = production
\`\`\`

### Step 4: Deploy Database Schema

\`\`\`bash
# Pull environment
vercel env pull

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
\`\`\`

### Step 5: Verify Deployment

- Check Vercel dashboard untuk deployment status
- Visit https://yourdomain.vercel.app
- Test login dengan demo account

---

## 3. Alternative Deployment Options

### Option A: Railway.app

\`\`\`bash
# Install railway CLI
npm install -g @railway/cli

# Login
railway login

# Init project
railway init

# Add MySQL service
railway add --service mysql

# Deploy
railway up

# Get DATABASE_URL
railway variables
\`\`\`

### Option B: Docker + Self-Hosted

\`\`\`dockerfile
# Create Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

\`\`\`bash
# Build & run locally
docker build -t wms .
docker run -p 3000:3000 --env-file .env.production wms

# Or use docker-compose
docker-compose up
\`\`\`

### Option C: AWS Amplify

\`\`\`bash
# Install AWS CLI
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Initialize
amplify init

# Add API
amplify add api

# Deploy
amplify push
\`\`\`

---

## 4. Development Commands

\`\`\`bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build  
npm start

# Database management
npm run db:studio         # Visual database explorer
npm run db:migrate        # Create new migration
npm run db:migrate:deploy # Apply migrations
npm run db:reset          # Reset database (dev only!)

# Type checking
npm run type-check

# Linting
npm run lint
\`\`\`

---

## 5. Database Providers

### Recommended: PlanetScale
- ✅ MySQL compatible
- ✅ Free tier available  
- ✅ Auto backups
- ✅ Branch management

### Alternative: Aiven
- ✅ Reliable MySQL hosting
- ✅ Multiple regions
- ✅ Good performance

### Alternative: AWS RDS
- ✅ Enterprise-grade
- ✅ Auto failover
- ✅ Multi-AZ support

---

## 6. Security for Production

\`\`\`bash
# Generate secure JWT secret
openssl rand -base64 32

# Update .env.production
JWT_SECRET=<generated_secret>

# Enable HTTPS (automatic with Vercel)

# Setup database backups
# - PlanetScale: Automatic daily backups
# - AWS RDS: Enable automated backups

# Monitor logs
vercel logs <deployment>

# Check errors
vercel logs --follow
\`\`\`

---

## 7. Scaling & Optimization

### Database Optimization
\`\`\`prisma
# Enable connection pooling in DATABASE_URL
mysql://user:password@host/database?sslaccept=strict&schema=public
\`\`\`

### API Caching
\`\`\`typescript
// Add cache headers in response
response.headers.set('Cache-Control', 'public, max-age=300');
\`\`\`

### Image Optimization (if needed)
\`\`\`bash
npm install next-image-optimization
\`\`\`

---

## 8. Monitoring & Debugging

### Setup Error Tracking (Optional)

\`\`\`bash
# Add Sentry for error monitoring
npm install @sentry/nextjs

# Setup API monitoring
npm install @opentelemetry/api
\`\`\`

### View Logs

\`\`\`bash
# Vercel logs
vercel logs

# Local logs
npm run dev -- --log-level debug
\`\`\`

---

## 9. Keeping Up to Date

\`\`\`bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update Prisma
npm update prisma @prisma/client

# Generate new types after Prisma update
npm run prisma:generate
\`\`\`

---

## 10. Troubleshooting Common Issues

### Issue: Database Connection Failed
\`\`\`bash
# Check connection string format
echo $DATABASE_URL

# Test MySQL connection
mysql -u user -p -h host database
\`\`\`

### Issue: API returning 401 Unauthorized
\`\`\`
- Check JWT_SECRET matches between .env files
- Check token format in Authorization header
- Verify token expiration
\`\`\`

### Issue: Deployment failing
\`\`\`bash
# Clear cache and rebuild
vercel --prod --force

# Check build logs
vercel logs --follow
\`\`\`

---

## Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm run dev` |
| Build for prod | `npm run build` |
| View database | `npm run db:studio` |
| Create migration | `npm run db:migrate` |
| Deploy migration | `npm run db:migrate:deploy` |
| Seed demo data | `npm run db:seed` |
| Check types | `npm run type-check` |

---

**Next Steps:**
1. ✅ Setup local development
2. ✅ Test API endpoints
3. ✅ Create additional pages
4. ✅ Deploy to production
5. ✅ Setup monitoring

Untuk bantuan lebih lanjut, lihat [WMS_SETUP_GUIDE.md](./WMS_SETUP_GUIDE.md)
