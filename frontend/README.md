# ArtiSANs NG — Frontend

**Connect with Trusted Local Artisans in Nigeria**

ArtiSANs is a full-stack marketplace platform that bridges the gap between clients and skilled artisans (carpenters, electricians, plumbers, painters, and more) across Nigeria. This repository contains the **Next.js frontend** — a modern, responsive single-page application built with React 18, TypeScript, and Tailwind CSS.

The backend API lives in a [separate repository](https://github.com/abrokinla/ArtiSANs).

**Live Site:** [artisans-ng.abrokinla.workers.dev](https://artisans-ng.abrokinla.workers.dev)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│             Cloudflare Pages / Local Dev         │
│                                                   │
│   Next.js 16 App Router + React 18 + Tailwind     │
│                                                   │
│   Pages: Home, Auth, Dashboard, Jobs, Search,     │
│           Artisan Profiles, Edit Profile          │
│                                                   │
├─────────────────────────────────────────────────┤
│                   REST API Calls                  │
├─────────────────────────────────────────────────┤
│         Django REST API (separate repo)           │
└─────────────────────────────────────────────────┘
```

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router) |
| UI Library | React 18.3 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 3.4 (Airbnb-inspired design system) |
| Auth | JWT (localStorage + React Context) |
| API Client | Custom fetch-based (`lib/api.ts`) |
| Deployment | Cloudflare Pages via `opennextjs-cloudflare` |
| Image Hosting | Cloudinary (via backend API) |

---

## Features

### For Clients
- **Browse Artisans** — Search by category, location, minimum rating
- **Artisan Profiles** — View bio, portfolio, ratings, availability, past reviews
- **Post Jobs** — Create detailed job requests with title, description, budget, images
- **Job Management** — Track job status from posting through completion
- **Bidding System** — Review artisan bids, accept the best offer
- **Escrow & Payments** — Release payment only after job completion confirmation
- **Reviews** — Rate and review artisans on completed jobs

### For Artisans
- **Profile Management** — Bio, experience, portfolio, availability schedule, contact info
- **Find Jobs** — Browse open jobs in your skill category
- **Bidding** — Place competitive bids with amount, timeline, and message
- **Subscription Plans** — Basic (free, 3 bids/mo), Pro (₦5,000/mo, 15 bids), Premium (₦15,000/mo, unlimited)
- **Earnings Tracking** — Dashboard with total and pending earnings
- **Job Workflow** — Start, complete jobs; receive payment on client confirmation

### General
- **JWT Authentication** — Secure login/register with role-based access
- **Role-based UI** — Different navigation and actions for clients vs artisans
- **Responsive Design** — Mobile-first, works on all devices
- **Image Upload** — Drag-and-drop profile pictures and job images via Cloudinary

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5.9.3 |
| UI Library | React 18.3.1 |
| Styling | Tailwind CSS 3.4.19 |
| Design System | Airbnb-inspired (custom CSS variables) |
| Auth | JWT via localStorage + React Context |
| Deployment | Cloudflare Pages (`opennextjs-cloudflare`) |
| Package Manager | npm |

---

## Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Home — Hero, categories, featured jobs, featured artisans | Public |
| `/auth` | Login / Register (toggle form) | Public |
| `/search` | Browse & search artisans by filters | Public |
| `/artisans/[id]` | Artisan profile detail | Public |
| `/jobs` | Browse open jobs for bidding | Public |
| `/jobs/[id]` | Job detail with bidding, workflow, reviews | Authenticated |
| `/jobs/post` | Post a new job | Client only |
| `/dashboard` | User dashboard with stats, jobs, profile summary | Authenticated |
| `/dashboard/my-bids` | Artisan's submitted bids | Artisan only |
| `/profile/edit` | Edit profile, artisan details, photo upload | Authenticated |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/abrokinla/ArtiSANs-frontend.git
cd ArtiSANs-frontend/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env .env.local
# Edit .env.local with your backend URL
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://127.0.0.1:8000/api` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key (optional) | — |

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Deployment

### Cloudflare Pages (Primary)

The project is configured for deployment to Cloudflare Pages via `opennextjs-cloudflare`:

```bash
npm run build
npm run deploy
```

### Environment Variables (Cloudflare)

Set these in your Cloudflare Pages dashboard:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Production backend URL (e.g., `https://your-backend.onrender.com/api`) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack live public key |

### Manual Wrangler Deploy

```bash
npm run build
npx wrangler pages deploy .vercel/output/static --branch main --project-name artisans-frontend
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (Navbar, AuthProvider, footer)
│   │   ├── page.tsx                  # Homepage
│   │   ├── globals.css               # Global design system (Airbnb-inspired)
│   │   ├── artisans/[id]/page.tsx    # Artisan profile detail
│   │   ├── auth/page.tsx             # Login / Register
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # User dashboard
│   │   │   └── my-bids/page.tsx      # Artisan's bids list
│   │   ├── jobs/
│   │   │   ├── page.tsx              # Job listing (for artisans)
│   │   │   ├── [id]/page.tsx         # Job detail + workflow
│   │   │   └── post/page.tsx         # Post a new job
│   │   ├── profile/edit/page.tsx     # Edit profile
│   │   └── search/page.tsx           # Search/browse artisans
│   ├── components/
│   │   ├── Navbar.tsx                # Top navigation (role-aware)
│   │   ├── jobs/
│   │   │   ├── BidList.tsx           # Bid list with accept button
│   │   │   └── PlaceBidForm.tsx      # Bid placement form
│   │   └── reviews/
│   │       ├── ReviewList.tsx        # Review display
│   │       └── SubmitReviewForm.tsx   # Star rating + comment form
│   ├── context/
│   │   └── AuthContext.tsx           # Auth state (login, logout, tokens)
│   └── lib/
│       └── api.ts                    # API client (22 endpoint functions)
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind configuration
├── wrangler.toml                     # Cloudflare Workers config
├── open-next.config.ts               # OpenNext Cloudflare adapter
├── package.json
└── tsconfig.json
```

---

## Design System

The UI uses an **Airbnb-inspired design system** with custom CSS variables defined in `app/globals.css`:

- **Colors**: Rausch (#ff385c), Luxe, Plus, with semantic tokens for text, backgrounds, borders
- **Typography**: DM Sans font family with a 7-step type scale (display → micro)
- **Components**: Cards, buttons, badges, search bar, navbar — all custom classes
- **Responsive**: Breakpoints at sm (640px), md (768px), lg (1024px), xl (1280px)

---

## Authentication Flow

1. User registers or logs in via `/auth`
2. Backend returns JWT `access` + `refresh` tokens and user data
3. Tokens and user are stored in `localStorage`
4. `AuthContext` manages state, syncs across tabs via `storage` events
5. API client attaches `Authorization: Bearer <token>` to authenticated requests
6. On 401, token refresh can be attempted via `/api/token/refresh/`

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

ISC License

---

## Contact

**Araoye Abraham** — [abrokinla@gmail.com](mailto:abrokinla@gmail.com)

Project Links:
- Frontend: [github.com/abrokinla/ArtiSANs-frontend](https://github.com/abrokinla/ArtiSANs-frontend)
- Backend: [github.com/abrokinla/ArtiSANs](https://github.com/abrokinla/ArtiSANs)
