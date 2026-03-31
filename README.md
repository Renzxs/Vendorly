# Vendorly

Vendorly is a storefront-first social commerce marketplace that lets independent sellers launch branded online stores inside a shared marketplace. Buyers can discover products, follow favorite storefronts, react to new drops, chat with sellers, save their cart, and track orders, while sellers manage branding, catalog, conversations, and order activity from a dedicated dashboard.

The project is built as a Turborepo monorepo with Next.js, Convex, TypeScript, and Tailwind CSS, with realtime marketplace data powered by Convex queries and mutations.

## Tech stack

- Turborepo with npm workspaces
- Next.js App Router
- TypeScript
- Convex for realtime backend data and mutations
- Tailwind CSS

## Monorepo structure

```text
.
├── apps
│   ├── dashboard
│   │   ├── app
│   │   │   ├── api
│   │   │   │   └── auth
│   │   │   │       └── [...nextauth]
│   │   │   │           └── route.ts
│   │   │   ├── dashboard
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── actions.ts
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── page.tsx
│   │   │   └── providers.tsx
│   │   ├── lib
│   │   │   ├── auth-actions.ts
│   │   │   ├── convex.ts
│   │   │   └── current-user.ts
│   │   ├── types
│   │   │   └── next-auth.d.ts
│   │   ├── auth.ts
│   │   ├── components
│   │   │   └── dashboard-shell.tsx
│   │   ├── .env.local.example
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── web
│       ├── app
│       │   ├── store
│       │   │   └── [slug]
│       │   │       ├── loading.tsx
│       │   │       └── page.tsx
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── loading.tsx
│       │   ├── page.tsx
│       │   └── providers.tsx
│       ├── components
│       │   ├── marketplace-shell.tsx
│       │   └── storefront-shell.tsx
│       ├── .env.local.example
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── tailwind.config.ts
│       └── tsconfig.json
├── packages
│   ├── convex
│   │   ├── convex
│   │   │   ├── products.ts
│   │   │   ├── schema.ts
│   │   │   ├── seed.ts
│   │   │   ├── stores.ts
│   │   │   ├── users.ts
│   │   │   └── lib
│   │   │       └── users.ts
│   │   ├── src
│   │   │   ├── api.ts
│   │   │   ├── index.ts
│   │   │   └── provider.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui
│   │   ├── src
│   │   │   ├── components
│   │   │   │   ├── layout-switcher.tsx
│   │   │   │   ├── navbar.tsx
│   │   │   │   ├── product-card.tsx
│   │   │   │   ├── store-banner.tsx
│   │   │   │   ├── store-card.tsx
│   │   │   │   └── theme-wrapper.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── utils
│       ├── src
│       │   ├── constants.ts
│       │   ├── helpers.ts
│       │   ├── index.ts
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
├── .eslintrc.cjs
├── convex.json
├── package.json
├── tsconfig.base.json
└── turbo.json
```

## Included features

- Marketplace homepage with featured stores, product discovery, search, and store filtering
- Dynamic seller storefronts at `/store/[slug]` with branding, follow state, and chat entry points
- Product feed for marketplace drops and followed-store updates
- Buyer and seller OAuth sign-in with Google and GitHub
- Multiple stores per authenticated seller
- Store customization with theme color, banner image, logo image, layout switching, and social links
- Product creation, editing, sold-out states, and social reactions
- AI assistant on store and product pages backed by GitHub Models
- Cart, checkout, and buyer order history/tracking
- Seller dashboard for catalog management, customer conversations, and order workflows
- Realtime Convex queries and modular mutations
- Responsive shared UI components in `packages/ui`
- Loading and empty states for both buyer and seller experiences

## Convex data model

### `users`

- `authUserId`
- `email`
- `name`
- `image`

### `stores`

- `name`
- `slug`
- `description`
- `bannerImage`
- `themeColor`
- `layoutType`
- `ownerId`

### `products`

- `title`
- `description`
- `price`
- `image`
- `storeId`

## Convex functions

### Queries

- `stores.getStores`
- `stores.getStoreBySlug`
- `stores.getStoresByOwner`
- `products.getProductsByStore`
- `products.getMarketplaceProducts`
- `users.getUserByAuthUserId`
- `users.getUserByEmail`

### Mutations

- `stores.createStore`
- `stores.updateStore`
- `products.createProduct`
- `products.updateProduct`
- `seed.seedDemoData`

## Local setup

### Node version

Use Node `20.12.0+`.

Recommended with `nvm`:

```bash
nvm install 22.13.0
nvm use 22.13.0
```

1. Install dependencies:

```bash
npm install
```

2. Start Convex in a separate terminal:

```bash
npm run dev:convex
```

3. Copy the example env files and fill in the local Convex URL printed by the Convex dev server:

```bash
cp apps/web/.env.local.example apps/web/.env.local
cp apps/dashboard/.env.local.example apps/dashboard/.env.local
```

4. Configure the web app:

```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001/dashboard
```

5. Configure the dashboard app:

```bash
CONVEX_URL=your_convex_url_here
NEXT_PUBLIC_MARKETPLACE_URL=http://localhost:3000
AUTH_SECRET=generate_a_random_secret
AUTH_GITHUB_ID=your_github_oauth_app_id
AUTH_GITHUB_SECRET=your_github_oauth_app_secret
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
```

For backend integrations, add these to `packages/convex/.env.local`:

```bash
DISCORD_WEBHOOK_URL=your_discord_webhook_url
GITHUB_TOKEN=your_github_models_token
GITHUB_MODELS_MODEL=deepseek/DeepSeek-V3-0324
GITHUB_MODELS_ENDPOINT=https://models.github.ai/inference
```

For hosted deployments, set `DISCORD_WEBHOOK_URL`, `GITHUB_TOKEN`, and any optional GitHub Models overrides on the Convex deployment as well, since these integrations run from Convex rather than Vercel.

6. For local OAuth callbacks, register:

- `http://localhost:3001/api/auth/callback/github`
- `http://localhost:3001/api/auth/callback/google`

7. Start the two Next.js apps:

```bash
npm run dev
```

8. Open the apps:

- Marketplace: `http://localhost:3000`
- Dashboard: `http://localhost:3001/dashboard`

## Useful commands

```bash
npm run dev
npm run dev:web
npm run dev:dashboard
npm run dev:convex
npm run build
npm run typecheck
```

## Notes

- The dashboard is protected by Auth.js and uses the signed-in user as the store owner.
- Users can create multiple stores, and each store can have multiple products.
- The storefront and marketplace are kept in sync through Convex realtime queries.
- Use the `Seed demo marketplace` button in the dashboard to quickly populate sample data.
