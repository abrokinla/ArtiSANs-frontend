# ArtiSANs NG

<p align="center">
  <strong>Connect with Trusted Local Artisans in Nigeria</strong>
</p>

<p align="center">
  <a href="https://artisans-ng.abrokinla.workers.dev"><img src="https://img.shields.io/badge/Live%20Site-artisans--ng.abrokinla.workers.dev-blue?style=flat-square" alt="Live Site"></a>
  <img src="https://img.shields.io/badge/status-beta-yellow?style=flat-square" alt="Status: Beta">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript" alt="TypeScript 5.9">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.4-06b6d4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 3.4">
  <img src="https://img.shields.io/badge/deployment-Cloudflare%20Pages-f38020?style=flat-square&logo=cloudflare" alt="Cloudflare Pages">
  <img src="https://img.shields.io/badge/license-ISC-green?style=flat-square" alt="ISC License">
</p>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Pages & Routes](#pages--routes)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Authentication Flow](#authentication-flow)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

---

## About

ArtiSANs is a **two-sided marketplace platform** that bridges the gap between clients and skilled artisans across Nigeria. Whether you need a carpenter, electrician, plumber, painter, or any other skilled professional, ArtiSANs makes it easy to find, hire, and pay trusted local talent.

The platform manages the complete job lifecycle — from posting and bidding through to completion, payment, and reviews — creating a transparent and trustworthy ecosystem for both parties.

**Phase 1** launches in **Lagos, Nigeria** as a beta, with plans for nationwide expansion.

### Repository

[github.com/abrokinla/ArtiSANs-frontend](https://github.com/abrokinla/ArtiSANs-frontend)

### Live Site

👉 [artisans-ng.abrokinla.workers.dev](https://artisans-ng.abrokinla.workers.dev)

---

## Features

### For Clients

| Feature | Description |
|---------|-------------|
| **Artisan Discovery** | Browse and search artisans by category, location, and minimum rating |
| **Detailed Profiles** | View artisan bios, portfolios, ratings, reviews, availability, and earnings history |
| **Post Jobs** | Create detailed job requests with title, description, category, budget, priority, and up to 5 images |
| **Bidding System** | Review competitive bids from interested artisans; compare amounts and timelines |
| **Hire & Manage** | Accept bids, track job progress through completion |
| **Reviews & Ratings** | Leave star ratings and written reviews on completed jobs |

### For Artisans

| Feature | Description |
|---------|-------------|
| **Profile Management** | Showcase your bio, experience, categories, availability, portfolio images |
| **Job Discovery** | Browse open jobs filtered by your skill categories |
| **Competitive Bidding** | Place bids with custom amount, estimated timeline, and message |
| **Subscription Tiers** | Basic (free, 3 bids/mo), Pro (₦5,000/mo, 15 bids), Premium (₦15,000/mo, unlimited) |
| **Job Workflow** | Accept hired jobs, mark as complete, receive payment on client confirmation |
| **Earnings Dashboard** | Track total earnings, pending payments, and completed jobs |

### Platform-Wide

- **JWT Authentication** — Secure login and registration with role-based access control
- **Role-Based UI** — Contextual navigation, actions, and dashboards for clients vs. artisans
- **Responsive Design** — Mobile-first layout works seamlessly across all devices
- **Image Uploads** — Drag-and-drop profile pictures and job images via Cloudinary integration
- **Tab-Sync Auth** — Authentication state synchronises across open browser tabs
- **Real-Time Messaging** — In-app messaging between clients and assigned artisans with polling
- **Wallet & Payments** — Deposit (Paystack), withdrawals, escrow for job funds
- **Direct Hire** — Skip the bidding process and hire artisans directly
- **Admin Dashboard** — User management, job oversight, dispute resolution, deposit/withdrawal approval
- **Email Notifications** — Account verification, job assignment, payment confirmations via Resend
- **Dark Mode** — Full theme support with persisted preference

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js](https://nextjs.org/) 16.2.6 (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5.9.3 (strict mode) |
| **UI Library** | [React](https://react.dev/) 18.3.1 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 3.4.19 |
| **Design System** | Airbnb-inspired (custom CSS variables & design tokens) |
| **State Management** | React Context API (`AuthContext`) |
| **Auth** | JWT (access + refresh tokens) via `localStorage` |
| **API Client** | Custom fetch-based client (`lib/api.ts`) |
| **Deployment** | [Cloudflare Pages](https://pages.cloudflare.com/) via [`@opennextjs/cloudflare`](https://opennext.js.org/) |
| **Image Hosting** | [Cloudinary](https://cloudinary.com/) (via backend API) |
| **Payments** | [Paystack](https://paystack.com/) (integration-ready) |
| **Package Manager** | npm |
| **Linting** | ESLint 9 + `eslint-config-next` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                         │
│                                                             │
│   Next.js 16 App Router + React 18 + Tailwind CSS           │
│                                                             │
│   ┌─────────┐ ┌──────┐ ┌───────────┐ ┌───────────┐        │
│   │  Public  │ │ Auth │ │ Dashboard │ │   Jobs    │        │
│   │  Pages   │ │      │ │           │ │           │        │
│   └─────────┘ └──────┘ └───────────┘ └───────────┘        │
│         │          │          │              │              │
│         └──────────┴──────────┴──────────────┘              │
│                         │                                    │
│                ┌────────┴────────┐                          │
│                │  AuthContext    │                          │
│                │  (State Mgmt)   │                          │
│                └────────┬────────┘                          │
│                         │                                    │
│                ┌────────┴────────┐                          │
│                │   API Client    │                          │
│                │  (lib/api.ts)   │                          │
│                └────────┬────────┘                          │
├─────────────────────────┼───────────────────────────────────┤
│                    REST API Calls                            │
├─────────────────────────┼───────────────────────────────────┤
│         ┌───────────────┴───────────────┐                   │
│         │  Django REST API (Render)     │                   │
│         │  - Auth / Users               │                   │
│         │  - Jobs & Bids                │                   │
│         │  - Artisans & Profiles        │                   │
│         │  - Reviews & Ratings          │                   │
│         └───────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology |
|-------|-----------|
| Presentation | Next.js 16 (App Router), React 18, Tailwind CSS |
| State | React Context API (`AuthContext`) |
| API Integration | Custom fetch-based client in `lib/api.ts` |
| Backend | Django REST Framework (separate repository) |
| Deployment | Cloudflare Pages via `@opennextjs/cloudflare` adapter |
| Media | Cloudinary via backend API |

---

## Pages & Routes

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | Home | Public | Hero section, category grid, featured jobs & artisans |
| `/auth` | Login / Register | Public | Toggle form for sign-in and account creation |
| `/auth/forgot-password` | Forgot Password | Public | Request password reset email |
| `/auth/reset-password` | Reset Password | Public | Confirm password reset with token |
| `/auth/verify-email` | Verify Email | Public | Email verification after registration |
| `/search` | Browse Artisans | Public | Filterable artisan discovery with search |
| `/artisans/[id]` | Artisan Profile | Public | Detailed profile, reviews, and contact info |
| `/jobs` | Job Listings | Public | Browse open jobs available for bidding |
| `/jobs/[id]` | Job Detail | Authenticated | Full job view with bidding, workflow, and reviews |
| `/jobs/[id]/manage` | Manage Job | Authenticated | Job management with progress tracking, disputes |
| `/jobs/my-jobs` | My Jobs | Artisan only | Jobs assigned to or bid on by the artisan |
| `/jobs/post` | Post a Job | Client only | Multi-field job creation form with image upload |
| `/dashboard` | Dashboard | Authenticated | Role-based dashboard with stats, active jobs, quick actions |
| `/dashboard/my-bids` | My Bids | Artisan only | List of bids the artisan has submitted |
| `/profile/edit` | Edit Profile | Authenticated | Profile editing with drag-and-drop photo upload |
| `/profile/delete` | Delete Account | Authenticated | Request account deletion |
| `/wallet` | Wallet | Authenticated | Balance, deposits, withdrawals, transaction history |
| `/messages` | Messages | Authenticated | Conversation list with unread counts |
| `/messages/[id]` | Conversation | Authenticated | Real-time messaging with polling |
| `/direct-hire/offer` | Direct Hire | Client | Hire an artisan directly without bidding |
| `/direct-hire/offers` | My Offers | Authenticated | Sent/received direct hire offers |
| `/direct-hire/offers/[id]` | Offer Detail | Authenticated | Negotiate, counter, accept/decline offers |
| `/onboarding` | Onboarding | Artisan only | Initial profile setup after registration |
| `/contact` | Contact | Public | Submit support inquiries |
| `/terms` | Terms of Service | Public | Legal terms |
| `/privacy` | Privacy Policy | Public | Privacy policy |
| `/admin` | Admin Dashboard | Staff only | Platform overview with stats |
| `/admin/users` | Admin Users | Staff only | User list with search, filter, and delete |
| `/admin/jobs` | Admin Jobs | Staff only | All platform jobs with status filter |
| `/admin/disputes` | Admin Disputes | Staff only | Dispute resolution dashboard |
| `/admin/deposits` | Admin Deposits | Staff only | Pending deposit approvals |
| `/admin/finances` | Admin Finances | Staff only | Transaction audit and withdrawal management |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (or 20+ for Cloudflare Pages production builds)
- **npm** (included with Node.js)
- **Backend API** running locally or a remote instance URL

### Local Setup

```bash
# Clone the repository
git clone https://github.com/abrokinla/ArtiSANs-frontend.git
cd ArtiSANs-frontend/frontend

# Install dependencies
npm install

# Configure environment variables
cp .env .env.local
```

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `http://127.0.0.1:8000/api` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | No | Paystack public key for payments | — |

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app hot-reloads on file changes.

### Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `next dev` | Start development server |
| `npm run build` | `next build` | Production build |
| `npm run preview` | `opennextjs-cloudflare build && opennextjs-cloudflare preview` | Preview Cloudflare build locally |
| `npm run deploy` | `opennextjs-cloudflare build && opennextjs-cloudflare deploy` | Deploy to Cloudflare Pages |
| `npm run cf-typegen` | `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts` | Generate Cloudflare env types |

---

## Deployment

### Cloudflare Pages (Primary)

The project uses [`@opennextjs/cloudflare`](https://opennext.js.org/) to deploy Next.js as a static site on Cloudflare Pages.

```bash
# Build and deploy in one step
npm run deploy
```

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy static output to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --branch main --project-name artisans-frontend
```

### Production Environment Variables

Configure these in your Cloudflare Pages dashboard under **Settings > Environment variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Production backend URL | `https://artisans-ojzr.onrender.com/api` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack live public key | `pk_live_...` |

### Deployment Configuration

Key deployment configuration files:

- **`wrangler.toml`** — Cloudflare Pages project settings
- **`open-next.config.ts`** — OpenNext Cloudflare adapter configuration
- **`next.config.js`** — Next.js build settings (image remote patterns, strict mode)

---

## Project Structure

```
frontend/
├── public/                          # Static assets (SW, manifest, favicon, icons)
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout — providers, navbar, footer
│   │   ├── page.tsx                 # Homepage — hero, categories, featured content
│   │   ├── globals.css              # Global CSS — Airbnb-inspired design system
│   │   ├── error.tsx                # Error boundary
│   │   ├── loading.tsx              # Global loading state
│   │   ├── not-found.tsx            # 404 page
│   │   ├── admin/                   # Admin dashboard (staff only)
│   │   │   ├── layout.tsx           # Admin sidebar layout
│   │   │   ├── page.tsx             # Overview stats
│   │   │   ├── users/page.tsx       # User management with delete
│   │   │   ├── jobs/page.tsx        # All jobs oversight
│   │   │   ├── disputes/page.tsx    # Dispute resolution
│   │   │   ├── deposits/page.tsx    # Pending deposit approvals
│   │   │   └── finances/page.tsx    # Transactions & withdrawals
│   │   ├── artisans/[id]/page.tsx   # Artisan profile detail
│   │   ├── auth/
│   │   │   ├── page.tsx             # Login / Register
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   ├── contact/page.tsx         # Support form
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # Role-based user dashboard
│   │   │   └── my-bids/page.tsx     # Artisan's submitted bids
│   │   ├── direct-hire/
│   │   │   ├── offer/page.tsx       # Create direct hire offer
│   │   │   ├── offers/page.tsx      # List sent/received offers
│   │   │   └── offers/[id]/page.tsx # Offer detail & negotiation
│   │   ├── jobs/
│   │   │   ├── page.tsx             # Browse open jobs
│   │   │   ├── [id]/page.tsx        # Job detail + bid workflow
│   │   │   ├── [id]/manage/page.tsx # Job management (progress, disputes)
│   │   │   ├── my-jobs/page.tsx     # Artisan's assigned jobs
│   │   │   └── post/page.tsx        # Create a new job
│   │   ├── messages/
│   │   │   ├── page.tsx             # Conversation list
│   │   │   └── [id]/page.tsx        # Conversation with real-time polling
│   │   ├── onboarding/page.tsx      # Artisan initial profile setup
│   │   ├── privacy/page.tsx         # Privacy policy
│   │   ├── profile/
│   │   │   ├── edit/page.tsx        # Edit profile
│   │   │   └── delete/page.tsx      # Request account deletion
│   │   ├── search/page.tsx          # Browse & search artisans
│   │   ├── terms/page.tsx           # Terms of service
│   │   └── wallet/page.tsx          # Wallet, deposits, withdrawals
│   ├── components/
│   │   ├── Navbar.tsx               # Role-aware navigation bar
│   │   ├── ErrorBoundary.tsx        # React error boundary with retry
│   │   ├── ProfileCompletionBanner.tsx # Prompt to complete artisan profile
│   │   ├── ServiceWorkerRegister.tsx # Registers service worker for offline/cache
│   │   ├── PasswordStrength.tsx     # Password strength indicator
│   │   ├── ProgressSteps.tsx        # Multi-step progress indicator
│   │   ├── CategorySelect.tsx       # Category dropdown with API data
│   │   ├── LocationSelect.tsx       # State/LGA cascading dropdown
│   │   ├── messages/
│   │   │   ├── MessageInput.tsx     # Message compose input
│   │   │   ├── ChatBubble.tsx       # Individual message bubble
│   │   │   └── ConversationList.tsx # Conversation sidebar
│   │   ├── hire/
│   │   │   └── HireModal.tsx        # Direct hire modal
│   │   ├── jobs/
│   │   │   ├── BidList.tsx          # Bid list with accept controls
│   │   │   └── PlaceBidForm.tsx     # Bid placement form
│   │   └── reviews/
│   │       ├── ReviewList.tsx       # Review display component
│   │       └── SubmitReviewForm.tsx # Star rating + comment form
│   ├── context/
│   │   ├── AuthContext.tsx          # Auth state management (JWT, login/logout)
│   │   └── ThemeContext.tsx         # Light/dark theme with persistence
│   └── lib/
│       └── api.ts                   # API client (50+ endpoints)
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript strict mode config
├── open-next.config.ts              # OpenNext Cloudflare adapter config
├── wrangler.toml                    # Cloudflare Pages config
├── postcss.config.js                # PostCSS configuration (Tailwind + Autoprefixer)
├── eslint.config.mjs                # ESLint flat configuration
└── package.json
```

---

## Design System

The UI follows an **Airbnb-inspired design system** with custom CSS variables defined in `globals.css`.

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-rausch` | `#ff385c` | Primary brand color, CTAs |
| `--color-luxe` | Purple variant | Secondary / accent |
| `--color-plus` | Magenta variant | Tertiary accent |
| `--font-primary` | DM Sans | Primary typeface |

### Typography Scale

Seven-step type scale: `display` → `heading-1` → `heading-2` → `heading-3` → `heading-4` → `body` → `micro`.

### Key Components

- **Cards** — Three-layer box-shadow system for depth
- **Buttons** — Multiple variants (primary, secondary, outline, ghost)
- **Badges** — Category, status, and role badges
- **Search Bar** — Full-width with category and location filters
- **Navbar** — Responsive, role-aware navigation

### Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

---

## Authentication Flow

```
User Login / Register
        │
        ▼
Backend validates credentials
        │
        ▼
JWT issued ──────┬──────►  access token  ──►  stored in localStorage
                 │                            (15 min expiry)
                 └──────►  refresh token ──►  stored in localStorage
                                              (7 day expiry)
        │
        ▼
AuthContext updates global state
        │
        ▼
API client attaches Authorization: Bearer <token> header
        │
        ▼
On 401 response ──►  automatic token refresh via /api/token/refresh/
```

- Tokens are stored in `localStorage` and managed via the `AuthContext` React context
- Authentication state synchronizes across browser tabs using `storage` events
- Navigation is role-aware: clients and artisans see different menus and actions
- Protected routes redirect unauthenticated users to `/auth`

---

## API Overview

The frontend communicates with a **Django REST Framework** backend (hosted on Render).

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Create new account |
| POST | `/auth/login/` | Sign in, receive JWT tokens |
| POST | `/token/refresh/` | Refresh expired access token |
| POST | `/auth/password_reset/` | Request password reset email |
| POST | `/auth/password_reset_confirm/` | Confirm password reset |
| POST | `/auth/verify_email/` | Verify email address |
| POST | `/auth/send_verification/` | Resend verification email |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs/` | List open jobs (role-aware) |
| POST | `/jobs/` | Create a new job |
| GET | `/jobs/:id/` | Get job details |
| GET | `/jobs/:id/public/` | Public job detail |
| GET | `/jobs/my_jobs/` | Current user's jobs (scoped to involvement) |
| POST | `/jobs/upload_image/` | Upload job images |
| POST | `/jobs/:id/bid/` | Artisan places a bid |
| POST | `/jobs/:id/start_job/` | Artisan starts work |
| POST | `/jobs/:id/complete_job/` | Artisan marks complete |
| POST | `/jobs/:id/confirm_completion/` | Client confirms, releases payment |
| POST | `/jobs/:id/cancel_job/` | Cancel an active job |
| POST | `/jobs/:id/dispute/` | Raise a dispute |
| GET | `/jobs/:id/dispute_detail/` | Get dispute details |
| POST | `/jobs/:id/assign/` | Assign artisan (direct hire) |
| POST | `/jobs/direct_hire/` | Create job with direct hire |
| POST | `/jobs/:id/fund_escrow/` | Fund escrow for job |
| POST | `/jobs/:id/verify_escrow/` | Verify escrow payment |

### Bids

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bids/my_bids/` | Artisan's submitted bids |
| GET | `/bids/job_bids/` | Bids for a specific job |
| POST | `/bids/:id/accept/` | Client accepts a bid |

### Artisans & Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search/artisans/` | Search and filter artisans |
| GET | `/artisans/:id/public/` | Public artisan profile |
| GET | `/artisans/:id/profile/` | Full artisan profile (authenticated) |
| GET | `/artisans/me/` | Current artisan's profile |
| PATCH | `/artisans/me/` | Update artisan profile |
| POST | `/artisans/verify_nin/` | NIN identity verification |
| POST | `/artisans/boost/` | Boost profile visibility |
| POST | `/artisans/purchase_bids/` | Purchase bid credits |
| POST | `/artisans/upload_portfolio_image/` | Upload portfolio image |
| GET | `/profiles/me/` | Get current user profile |
| PATCH | `/profiles/me/` | Update user profile |
| POST | `/profiles/upload_image/` | Upload profile picture |
| POST | `/profiles/delete_account/` | Self-delete account (anonymize) |

### Reviews & Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews/` | Submit a review |
| GET | `/reviews/for_artisan/` | List reviews for an artisan |
| GET | `/categories/` | List all categories |

### Wallet & Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles/wallet/` | Get wallet balance and history |
| POST | `/profiles/deposit/` | Initiate deposit |
| POST | `/profiles/verify_deposit/` | Verify Paystack deposit |
| POST | `/profiles/report_failed_deposit/` | Report failed deposit |
| POST | `/profiles/withdraw/` | Request withdrawal |
| GET | `/profiles/bank/` | Get saved bank details |
| PUT | `/profiles/bank/` | Save bank account details |
| GET | `/profiles/banks/` | List supported banks |
| POST | `/profiles/resolve_account/` | Verify account number |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations/` | List conversations |
| GET | `/conversations/:id/` | Get conversation detail |
| GET | `/conversations/:id/messages/` | Get messages (with polling) |
| POST | `/conversations/:id/messages/` | Send a message |
| GET | `/conversations/unread/` | Get unread message count |

### Direct Hire Offers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/direct-hire/offers/` | Create an offer |
| GET | `/direct-hire/offers/` | List my offers |
| GET | `/direct-hire/offers/:id/` | Get offer detail |
| POST | `/direct-hire/offers/:id/accept/` | Accept offer |
| POST | `/direct-hire/offers/:id/decline/` | Decline offer |
| POST | `/direct-hire/offers/:id/counter/` | Counter-offer |
| POST | `/direct-hire/offers/:id/accept_counter/` | Accept counter-offer |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/locations/states/` | List all states |
| GET | `/locations/lgas/` | List LGAs for a state |

### Admin (staff only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles/admin_dashboard/` | Overview stats |
| GET | `/profiles/admin_users/` | List all users |
| POST | `/profiles/admin_delete_user/` | Batch delete users (anonymize) |
| GET | `/profiles/admin_jobs/` | List all jobs |
| GET | `/profiles/admin_disputes/` | List disputes |
| GET | `/profiles/admin_transactions/` | List transactions |
| GET | `/profiles/admin_pending_deposits/` | Pending deposit approvals |
| POST | `/profiles/admin_confirm_deposit/` | Approve deposit |
| GET | `/profiles/admin_pending_withdrawals/` | Pending withdrawal requests |
| POST | `/profiles/admin_retry_withdrawal/` | Retry failed withdrawal |
| POST | `/profiles/admin_confirm_withdrawal/` | Confirm manual withdrawal |
| POST | `/profiles/admin_refund_withdrawal/` | Refund to wallet |
| GET | `/profiles/admin_paystack_transactions/` | Paystack audit log |
| POST | `/profiles/admin_resolve_dispute/` | Resolve a dispute |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contact/` | Submit contact form |

---

## Contributing

We welcome contributions! Here's how to get started:

### Development Guidelines

1. **Code Style** — The project uses TypeScript strict mode. Run ESLint before committing.
2. **Conventional Commits** — Please use conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`).
3. **TypeScript** — All new code should be typed; avoid `any` where possible.
4. **Components** — Follow existing patterns in `src/components/` for consistency.
5. **Styling** — Use Tailwind utility classes; add custom CSS only when necessary, using the design tokens in `globals.css`.

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and commit: `git commit -m "feat: add my feature"`
4. Push to your fork: `git push origin feature/my-feature`
5. Open a Pull Request describing your changes

---

## Roadmap

- [x] User authentication (register, login, JWT)
- [x] Artisan discovery and profile pages
- [x] Job posting and browsing
- [x] Bidding system
- [x] Job workflow (start, complete, confirm)
- [x] Reviews and ratings
- [x] Dashboard with stats
- [ ] Real-time messaging between clients and artisans
- [ ] Paystack payment integration (live)
- [ ] Subscription plan management
- [ ] Admin dashboard
- [ ] Mobile app (React Native)
- [ ] Nationwide expansion beyond Lagos

---

## License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

## Contact

**Araoye Abraham** — [abrokinla@gmail.com](mailto:abrokinla@gmail.com)

| Resource | Link |
|----------|------|
| Repository | [github.com/abrokinla/ArtiSANs-frontend](https://github.com/abrokinla/ArtiSANs-frontend) |
| Live Application | [artisans-ng.abrokinla.workers.dev](https://artisans-ng.abrokinla.workers.dev) |
