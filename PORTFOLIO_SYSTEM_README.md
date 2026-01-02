# Portfolio Management System

This is a comprehensive portfolio management system built with Next.js, TypeScript, Tailwind CSS, and Drizzle ORM. It includes features for portfolio showcase, service booking, digital product marketplace, and payment integration.

## Features Implemented

### 1. Portfolio Management
- Portfolio projects with images, descriptions, and tech stack
- Skills matrix with proficiency levels
- Experience timeline
- Testimonials section
- Category filtering and search

### 2. Service Management
- Service catalog with pricing and features
- Service booking system
- Order management
- Service status tracking (pending, processing, completed)

### 3. Digital Product Marketplace
- Product listings with previews
- Multiple license types (personal, commercial, extended)
- Download management
- Sales tracking

### 4. Payment Integration
- Midtrans payment gateway integration
- Order and purchase tracking
- Payment status management
- Webhook handling

### 5. User Management
- Role-based access control (admin/client)
- User profiles
- Authentication with Better Auth
- Client dashboard

### 6. Admin Dashboard
- Analytics and reporting
- Content management
- Order processing
- User management

### 7. Additional Features
- Announcement system
- Notification system
- Responsive design
- Dark/light mode

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Payment**: Midtrans integration
- **UI Components**: Radix UI, Lucide React

## Database Schema

The application includes comprehensive database schemas for:
- Users and authentication
- Portfolio projects and skills
- Services and categories
- Orders and payments
- Digital products and purchases
- Announcements and notifications
- User profiles

## API Routes

All major functionality is backed by API routes:
- Portfolio projects: `/api/portfolio-projects`
- Services: `/api/services`
- Digital products: `/api/digital-products`
- Orders: `/api/orders`
- Payments: `/api/payments`
- User profiles: `/api/profile`
- Admin dashboard: `/api/admin/dashboard`

## Frontend Components

Reusable components for all major features:
- Portfolio showcase
- Skills matrix
- Services catalog
- Digital product marketplace
- Admin dashboard layout
- Service booking forms
- Purchase forms

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
3. Run database migrations: `npx drizzle-kit push`
4. Start the development server: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   └── dashboard/         # Client dashboard pages
├── components/            # Reusable UI components
│   ├── admin/             # Admin-specific components
│   ├── portfolio/         # Portfolio components
│   ├── services/          # Service components
│   ├── digital-products/  # Digital product components
│   └── skills/            # Skills components
├── db/                    # Database configuration
│   └── schema/            # Database schemas
├── lib/                   # Utility functions and services
└── test/                  # Test files
```

This portfolio management system provides a complete solution for managing a professional portfolio, booking services, selling digital products, and handling payments - all in one integrated platform.