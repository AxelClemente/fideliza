# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fideliza is a customer loyalty platform that connects businesses with their customers through a subscription and special offers system. Built with Next.js 15, TypeScript, and MySQL.

## Key Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
```

### Building and Deployment
```bash
npm run build        # Generates Prisma client and builds Next.js app
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Management
```bash
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Create and apply migrations in development
npx prisma migrate deploy  # Apply migrations in production
npx prisma studio    # Open Prisma Studio for database management
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.0.3 with App Router
- **Language**: TypeScript with strict mode
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with email/password and Prisma adapter
- **Payments**: Stripe for subscription management
- **Email**: Resend for transactional emails
- **File Storage**: Cloudinary for images
- **Internationalization**: next-intl (Spanish, English, French)
- **Styling**: Tailwind CSS with custom design tokens

### Directory Structure

```
/app
├── [locale]/          # Internationalized routes (es/en/fr)
│   ├── auth/         # Authentication pages
│   ├── business-dashboard/  # Business owner interface
│   └── customer-dashboard/  # Customer interface
└── api/              # API routes for all backend operations

/components/ui/       # Reusable UI components (shadcn/ui pattern)
/lib/                # Utilities and integrations
/messages/           # i18n translation files
/prisma/             # Database schema and migrations
```

### Key Features & User Flows

1. **Multi-tenant Architecture**
   - Users have roles: BUSINESS, CUSTOMER, STAFF, ADMIN
   - Business owners can create restaurants, manage places, and assign staff
   - Staff members have permissions to validate subscriptions

2. **Restaurant Management**
   - Restaurants can have multiple places (locations)
   - Each place can offer different subscription plans
   - Offers can be created with validity periods and repetition rules

3. **Subscription System**
   - Customers purchase subscriptions tied to specific places
   - Subscriptions have start/end dates and can be paused
   - QR code validation system for offer redemption
   - Validation tracking with staff member attribution

4. **Payment Integration**
   - Stripe integration for subscription payments
   - Webhook handling for payment events
   - Customer portal for subscription management

## Database Schema Key Relationships

- **User** → **Restaurant** (1:N): Business owner creates restaurants
- **Restaurant** → **Place** (1:N): Restaurant can have multiple locations
- **Place** → **Subscription** (N:N via PlaceSubscription): Places offer various subscriptions
- **Place** → **Offer** (1:N): Each place has its own offers
- **User** → **UserSubscription** (1:N): Customers purchase subscriptions
- **UserSubscription** → **SubscriptionValidation** (1:N): Track offer redemptions

## Environment Variables Required

```bash
DATABASE_URL          # MySQL connection string
NEXTAUTH_URL         # Application URL
NEXTAUTH_SECRET      # NextAuth secret key
STRIPE_SECRET_KEY    # Stripe API key
STRIPE_WEBHOOK_SECRET # Stripe webhook secret
CLOUDINARY_CLOUD_NAME # Cloudinary configuration
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY       # Email service API key
```

## Common Development Tasks

### Adding a New API Route
1. Create file in `/app/api/[resource]/route.ts`
2. Use NextAuth session for authentication: `const session = await getServerSession(authOptions)`
3. Check user permissions based on role
4. Return NextResponse with appropriate status codes

### Working with Database
1. Modify schema in `/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive-name`
3. Prisma client is auto-generated on build

### Adding New UI Components
1. Check existing components in `/components/ui/`
2. Follow shadcn/ui patterns for consistency
3. Use Tailwind classes with design tokens from `tailwind.config.ts`

### Internationalization
1. Add translations to `/messages/[locale].json`
2. Use `useTranslations` hook in components
3. Wrap dynamic content with translation keys

## Important Patterns

### Authentication Check Pattern
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Role-based Access
```typescript
if (session.user.role !== 'BUSINESS') {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Database Query with Prisma
```typescript
import { prisma } from '@/lib/db';

const result = await prisma.model.findMany({
  where: { userId: session.user.id },
  include: { relatedModel: true }
});
```