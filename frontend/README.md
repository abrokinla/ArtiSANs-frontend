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

### Repositories

| Component | Repository |
|-----------|-----------|
| Frontend (this repo) | [github.com/abrokinla/ArtiSANs-frontend](https://github.com/abrokinla/ArtiSANs-frontend) |
| Backend API | [github.com/abrokinla/ArtiSANs](https://github.com/abrokinla/ArtiSANs) |

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
| `/search` | Browse Artisans | Public | Filterable artisan discovery with search |
| `/artisans/[id]` | Artisan Profile | Public | Detailed profile, reviews, and contact info |
| `/jobs` | Job Listings | Public | Browse open jobs available for bidding |
| `/jobs/[id]` | Job Detail | Authenticated | Full job view with bidding, workflow, and reviews |
| `/jobs/post` | Post a Job | Client only | Multi-field job creation form with image upload |
| `/dashboard` | Dashboard | Authenticated | Role-based dashboard with stats, active jobs, quick actions |
| `/dashboard/my-bids` | My Bids | Artisan only | List of bids the artisan has submitted |
| `/profile/edit` | Edit Profile | Authenticated | Profile editing with drag-and-drop photo upload |

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
├── public/                          # Static assets (SVG icons)
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout — Navbar, AuthProvider, footer
│   │   ├── page.tsx                 # Homepage — hero, categories, featured content
│   │   ├── globals.css              # Global CSS — Airbnb-inspired design system
│   │   ├── artisans/[id]/page.tsx   # Artisan profile detail
│   │   ├── auth/page.tsx            # Login / Register page
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # User dashboard
│   │   │   └── my-bids/page.tsx     # Artisan's submitted bids
│   │   ├── jobs/
│   │   │   ├── page.tsx             # Browse open jobs
│   │   │   ├── [id]/page.tsx        # Job detail + bid workflow
│   │   │   └── post/page.tsx        # Post a new job
│   │   ├── profile/edit/page.tsx    # Edit profile
│   │   └── search/page.tsx          # Browse & search artisans
│   ├── components/
│   │   ├── Navbar.tsx               # Role-aware navigation bar
│   │   ├── jobs/
│   │   │   ├── BidList.tsx          # Bid list with accept controls
│   │   │   └── PlaceBidForm.tsx     # Bid placement form
│   │   └── reviews/
│   │       ├── ReviewList.tsx       # Review display component
│   │       └── SubmitReviewForm.tsx # Star rating + comment form
│   ├── context/
│   │   └── AuthContext.tsx          # Auth state management
│   └── lib/
│       └── api.ts                   # API client (22 endpoints)
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
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

The frontend communicates with a **Django REST Framework** backend. Below is a summary of all API endpoints used:

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Create new account |
| POST | `/auth/login/` | Sign in, receive JWT tokens |
| POST | `/token/refresh/` | Refresh expired access token |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs/` | List all open jobs |
| POST | `/jobs/` | Create a new job |
| GET | `/jobs/:id/` | Get job details |
| GET | `/jobs/my_jobs/` | List current user's jobs |
| POST | `/jobs/upload_image/` | Upload job images |
| POST | `/jobs/:id/start_job/` | Artisan starts job |
| POST | `/jobs/:id/complete_job/` | Artisan marks complete |
| POST | `/jobs/:id/confirm_completion/` | Client confirms completion |

### Bids

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/jobs/:id/bid/` | Place a bid on a job |
| GET | `/bids/my_bids/` | List current user's bids |
| GET | `/bids/job_bids/` | List bids for a specific job |
| POST | `/bids/:id/accept/` | Client accepts a bid |

### Artisans & Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search/artisans/` | Search and filter artisans |
| GET | `/artisans/:id/profile/` | Get artisan's public profile |
| GET | `/artisans/me/` | Get current artisan's profile |
| GET/PUT | `/profiles/me/` | Get or update current user's profile |
| POST | `/profiles/upload_image/` | Upload profile picture |

### Reviews & Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews/` | Submit a review |
| GET | `/reviews/for_artisan/` | List reviews for an artisan |
| GET | `/categories/` | List all job categories |

> **Note:** Full API documentation is available in the [backend repository](https://github.com/abrokinla/ArtiSANs).

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
| Frontend Repository | [github.com/abrokinla/ArtiSANs-frontend](https://github.com/abrokinla/ArtiSANs-frontend) |
| Backend Repository | [github.com/abrokinla/ArtiSANs](https://github.com/abrokinla/ArtiSANs) |
| Live Application | [artisans-ng.abrokinla.workers.dev](https://artisans-ng.abrokinla.workers.dev) |
