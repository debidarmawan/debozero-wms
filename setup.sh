#!/bin/bash

# WMS System Setup Script
# This script helps with quick setup of the Warehouse Management System

set -e

echo "🚀 Warehouse Management System - Setup Script"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

echo "✅ Dependencies installed successfully"
echo ""

# Step 2: Check for .env.local
echo "🔧 Step 2: Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "📝 Edit .env.local with your database configuration:"
    echo "   - DATABASE_URL: Your MySQL connection string"
    echo "   - JWT_SECRET: Change to a secure random value"
    echo ""
    read -p "Press enter after configuring .env.local..."
else
    echo "✅ .env.local found"
fi

echo ""

# Step 3: Database setup
echo "🗄️  Step 3: Setting up database..."
echo ""
echo "Choose an option:"
echo "1) Create new database locally (requires MySQL installed)"
echo "2) Use existing database"
echo "3) Skip (I'll setup database manually)"
echo ""
read -p "Enter choice (1-3): " db_choice

if [ "$db_choice" = "1" ]; then
    read -p "Enter database name (default: warehouse_db_dev): " db_name
    db_name=${db_name:-warehouse_db_dev}
    
    read -p "Enter MySQL username (default: root): " db_user
    db_user=${db_user:-root}
    
    echo "Creating database: $db_name"
    mysql -u "$db_user" -p -e "CREATE DATABASE IF NOT EXISTS $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "✅ Database created"
    echo ""
    echo "Update DATABASE_URL in .env.local:"
    echo "   DATABASE_URL=\"mysql://$db_user:password@localhost:3306/$db_name\""
    echo ""
fi

echo ""

# Step 4: Run migrations
echo "🗄️  Step 4: Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed"
echo ""

# Step 5: Seed database
echo "🌱 Step 5: Seeding demo data..."
read -p "Do you want to seed demo data? (y/n): " seed_choice

if [ "$seed_choice" = "y" ]; then
    npx prisma db seed
    echo "✅ Demo data seeded successfully"
else
    echo "⏭️  Skipping demo data"
fi

echo ""

# Step 6: Summary
echo "✨ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Login with demo account:"
echo "   - Email: demo@warehouse.com"
echo "   - Password: demo123"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: cat WMS_SETUP_GUIDE.md"
echo "   - Deployment Guide: cat DEPLOY_GUIDE.md"
echo ""
echo "❓ Need help?"
echo "   - Check WMS_SETUP_GUIDE.md for detailed setup instructions"
echo "   - Check DEPLOY_GUIDE.md for deployment guides"
echo ""
