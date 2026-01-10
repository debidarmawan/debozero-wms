# Debozero WMS - Frontend

Next.js 14 frontend for Warehouse Management System.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Run development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   The dev server is configured to run on port 3001 (see package.json scripts).

4. **Open browser:**
   Navigate to [http://localhost:3001](http://localhost:3001)
   
   **Note**: If you need to change the port, edit `package.json` scripts or set `PORT` environment variable.

## Features

- ✅ User authentication (Login/Register)
- ✅ Dashboard with overview
- ✅ Product management (List, Create)
- ✅ Inventory management (View)
- ✅ Responsive design
- ✅ Protected routes

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── login/       # Login page
│   ├── register/    # Register page
│   ├── dashboard/   # Dashboard page
│   ├── products/    # Products pages
│   └── inventory/   # Inventory pages
├── components/      # Reusable components
├── lib/             # Utilities (API client)
├── services/        # API services
├── store/           # Zustand stores
└── types/           # TypeScript types
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api/v1)
