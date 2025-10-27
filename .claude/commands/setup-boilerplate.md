---
description: Fully automated setup for SaaS boilerplate with Supabase and Stripe
allowed-tools: Bash(*), Read, Write, Edit
---

# SaaS Boilerplate Complete Setup

You are setting up a complete SaaS boilerplate with Next.js, Supabase, and Stripe. This command will automate EVERYTHING - from local Supabase setup to creating Stripe products and prices.

## Prerequisites Check

First, verify all required tools are installed:

1. Check Node.js version (need 18+)
2. Check if Supabase CLI is installed
3. Check if Stripe CLI is installed
4. If any are missing, provide installation instructions and STOP

## Setup Steps

### Step 1: Install Dependencies

Run `npm install` to install all Node.js dependencies.

### Step 2: Run Automated Supabase Setup

Execute `node setup.js` with the following answers:
- App name: Ask the user what they want to name their app
- Stripe webhook setup: Answer "N" (we'll do this via Stripe CLI commands)

This will:
- Start Supabase local instance
- Create .env and .env.local files with Supabase credentials
- Populate all database and auth variables

### Step 3: Authenticate with Stripe

Run `stripe login` to open browser authentication. Inform the user:
- A browser window will open
- They need to authenticate with their Stripe account
- This is a one-time authentication for local development
- Wait for confirmation that login succeeded

### Step 4: Create Stripe Products and Prices

Now create the products and prices using Stripe CLI:

**Pro Product:**
```bash
stripe products create \
  --name="Pro" \
  --description="Pro tier subscription"
```
Capture the product ID (starts with `prod_`)

**Pro Monthly Price:**
```bash
stripe prices create \
  --product=<pro_product_id> \
  --unit-amount=1499 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="Pro Monthly"
```
Capture the price ID (starts with `price_`)

**Pro Yearly Price:**
```bash
stripe prices create \
  --product=<pro_product_id> \
  --unit-amount=14390 \
  --currency=usd \
  --recurring[interval]=year \
  --nickname="Pro Yearly"
```
Capture the price ID

**Enterprise Product:**
```bash
stripe products create \
  --name="Enterprise" \
  --description="Enterprise tier subscription"
```
Capture the product ID

**Enterprise Monthly Price:**
```bash
stripe prices create \
  --product=<enterprise_product_id> \
  --unit-amount=9999 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="Enterprise Monthly"
```
Capture the price ID

**Enterprise Yearly Price:**
```bash
stripe prices create \
  --product=<enterprise_product_id> \
  --unit-amount=95990 \
  --currency=usd \
  --recurring[interval]=year \
  --nickname="Enterprise Yearly"
```
Capture the price ID

### Step 5: Get Stripe API Keys

Get the Stripe test API keys:
```bash
stripe keys list
```

This will show:
- Publishable key (pk_test_...)
- Secret key (sk_test_...)

Capture both keys.

### Step 6: Update Environment Files

Read the current `.env` file and update it with ALL Stripe values:
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_PRODUCT_PRO
- STRIPE_PRODUCT_ENTERPRISE
- STRIPE_PRICE_PRO_MONTHLY
- STRIPE_PRICE_PRO_YEARLY
- STRIPE_PRICE_ENTERPRISE_MONTHLY
- STRIPE_PRICE_ENTERPRISE_YEARLY

Do the same for `.env.local` file (update the NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and server-side keys).

### Step 7: Start Stripe Webhook Listener

Start the Stripe webhook listener in the background:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-secret
```

From the output, capture the webhook signing secret (starts with `whsec_`).

Update both `.env` and `.env.local` files with:
- STRIPE_WEBHOOK_SECRET=<the_webhook_secret>

### Step 8: Verify Setup

Confirm all environment variables are set:
1. Read `.env` file and verify all Stripe variables are populated
2. Read `.env.local` file and verify all variables are populated
3. Confirm Supabase is running: `supabase status`

### Step 9: Final Instructions

Display a success message to the user with:

✅ Setup Complete! Your SaaS boilerplate is ready.

**What was configured:**
- ✓ Supabase local instance running
- ✓ Stripe test products created (Pro, Enterprise)
- ✓ Stripe prices created (monthly and yearly for each tier)
- ✓ All environment variables populated
- ✓ Webhook listener running in background

**Next Steps:**
1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Access Supabase Studio: http://127.0.0.1:54343
4. Check emails (magic links): http://127.0.0.1:54344

**Important URLs:**
- Stripe Dashboard: https://dashboard.stripe.com/test/dashboard
- Stripe Products: https://dashboard.stripe.com/test/products
- Supabase Studio: http://127.0.0.1:54343

**Your Products:**
- Pro: $14.99/month or $143.90/year
- Enterprise: $99.99/month or $959.90/year

The Stripe webhook listener is running. Keep this terminal session open while developing.

Ready to build your SaaS! 🚀

## Error Handling

If any command fails:
1. Show the exact error message
2. Provide troubleshooting steps
3. Don't continue to next steps until issue is resolved

Common issues:
- Docker not running → Start Docker Desktop
- Supabase already running → Run `supabase stop` first
- Stripe login fails → Check internet connection
- Port conflicts → Stop other services on ports 3000, 54321-54324

## Important Notes

- This sets up TEST mode Stripe (not production)
- All data is local - safe to experiment
- To deploy to production, create new Stripe products in live mode
- The webhook listener needs to stay running during development
- Supabase Studio credentials are in the .env file
