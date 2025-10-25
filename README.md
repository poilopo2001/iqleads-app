# Stream Project

A Next.js application with Supabase authentication and Stripe payments integration.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Authentication and database
- **Stripe** - Payment processing

## Project Structure

```
streamproject/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── stripe/
│   │   ├── client.ts      # Stripe client for browser
│   │   └── server.ts      # Stripe server-side client
│   ├── supabase/
│   │   ├── client.ts      # Supabase client for browser
│   │   ├── server.ts      # Supabase server-side client
│   │   └── middleware.ts  # Supabase middleware helper
│   └── supabase.ts        # Original Supabase client (legacy)
├── types/
│   └── database.ts        # Database type definitions
├── supabase/              # Supabase configuration
│   ├── config.toml        # Local Supabase settings
│   └── migrations/        # Database migrations
├── middleware.ts          # Next.js middleware for auth
├── .env.local             # Environment variables (Next.js format)
└── .env                   # Original environment variables
```

## Environment Variables

The project uses two environment files:

### .env (Original Supabase/Stripe config)
Contains all the original Supabase and Stripe configuration.

### .env.local (Next.js format)
Contains environment variables formatted for Next.js:
- `NEXT_PUBLIC_*` variables are accessible in the browser
- Other variables are server-side only

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase CLI installed (for local development)
- Stripe CLI installed (for webhook testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start Supabase locally:
```bash
npm run supabase:start
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:status` - Check Supabase status

## Database Schema

The database includes:

### Tables
- **profiles** - User profiles with membership tiers
- **subscriptions** - Stripe subscription data

### Enums
- `membership_tier`: 'free' | 'pro' | 'enterprise'
- `subscription_status`: 'active' | 'canceled' | 'past_due' | 'trialing' | etc.

## Supabase Integration

### Client Components
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

### Server Components
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

### Admin Operations (Server-side only)
```typescript
import { createAdminClient } from '@/lib/supabase/server';

const supabase = createAdminClient();
```

## Stripe Integration

### Client Components
```typescript
import { getStripe } from '@/lib/stripe/client';

const stripe = await getStripe();
```

### Server Components
```typescript
import { stripe } from '@/lib/stripe/server';

const session = await stripe.checkout.sessions.create({...});
```

## Next Steps

1. **Create Authentication Pages**
   - Sign up page (`/app/auth/signup/page.tsx`)
   - Login page (`/app/auth/login/page.tsx`)
   - Password reset page (`/app/auth/reset-password/page.tsx`)

2. **Add Protected Routes**
   - Update middleware to protect routes
   - Create dashboard pages

3. **Implement Stripe Checkout**
   - Create checkout API route
   - Handle webhook events
   - Sync with Supabase subscriptions table

4. **Build User Dashboard**
   - Profile management
   - Subscription status
   - Billing history

## Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Notes

- The `.env` file is preserved from the original setup
- The `.env.local` file uses Next.js naming conventions
- Both Supabase clients (legacy and SSR) are available
- Middleware automatically refreshes auth sessions
