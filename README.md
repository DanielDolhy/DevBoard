# DevBoard 🚀

DevBoard is a high-performance, full-stack Next.js web application designed to demonstrate robust social graph mechanics, custom caching layers, and scalable timeline generation. It features a premium, responsive glassmorphic UI with full support for light/dark system settings.

This codebase is optimized and structured to showcase modern production-grade engineering patterns for a **Full-Stack Software Engineer** candidate.

---

## 🌟 Key Features

* **High-Fidelity UI/UX:** Built with Tailwind CSS, showcasing a responsive three-column dashboard layout, custom skeleton loaders, micro-animations, and full **Dark Mode** support.
* **Dynamic Feed Client:** Supports instant optimistic updates for posting/following, integrated error boundaries, and cursor-based infinite scrolling.
* **Profile System:** Dynamic routing (`/profile`) that aggregates user statistics (follower counts, post counts) and pulls personal user timelines directly from Prisma.
* **Social Suggestion Engine:** A real-time suggestions sidebar ("Who to Follow") querying DB relations to recommend non-followed users, utilizing integrated client-side toggle mechanisms.
* **Robust Authentication Flow:** Secure session handling using JWTs stored in HTTPOnly cookies, featuring zod-validated credential forms and custom logout routes.

---

## 🛠 Tech Stack & Code Architecture

### 1. Frontend
* **Framework:** Next.js (App Router, Server & Client Component separation).
* **Styling:** Tailwind CSS (curated high-contrast color palette, interactive transitions).
* **Forms & Validation:** `react-hook-form` coupled with `@hookform/resolvers/zod` and unified validation schemas.

### 2. Backend & Data Layer
* **Database:** PostgreSQL (relational integrity, compound unique constraints, index-optimized timeline fetches).
* **ORM:** Prisma (type-safe database client and automated migrations).
* **Caching:** Redis (high-speed Sorted Sets `ZSET` for pre-computed user timelines).
* **Authentication:** Stateless JWT verification with automatic cookie management.

---

## 🚀 Local Installation Guide

Spin up the local environment using Docker Compose (PostgreSQL 16 + Redis 7):

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Default variables are pre-configured to connect to local Docker containers

# 3. Spin up PostgreSQL & Redis services
docker compose up -d

# 4. Run migrations and seed seed mock data
npx prisma migrate deploy
npm run db:seed  # or npx tsx scripts/seed.ts

# 5. Run local development server
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 📐 Architectural Decisions & Caching Strategy

### Relational Database Selection (PostgreSQL)
A relational database was selected to enforce strong integrity constraints on the social graph:
* **Compound Primary Keys:** The `Follow` model uses composite keys `[followerId, followingId]` alongside a unique constraint index to prevent duplicate relations.
* **Index Optimization:** B-Tree indexing on `(user_id, created_at DESC)` ensures quick lookups for fallback timeline operations when the cache is cold.

### In-Memory Caching (Redis ZSET)
Querying timelines in real-time under high read loads requires heavy SQL joins. To scale reads, we pre-compute timelines in Redis:
* **Sorted Sets (ZSET):** Stores post IDs mapped to epoch timestamps as scores.
* **Time Complexity:** Fetching paginated feed chunks runs at `O(log(N) + M)` complexity, bringing timeline read response times down to sub-milliseconds.

---

## ⚙️ Engineering & Quality Controls

* **Strict Linting Standards:** Configured via ESLint (`eslint.config.mjs`) to enforce readable block separation—specifically requiring clean empty lines before return, conditional (`if`), and loop statements.
* **Robust Type Safety:** Fully typed workspace using TypeScript, eliminating implicit `any` types and ensuring solid compilation boundaries.
* **Graceful Degradation:** Incorporates `react-error-boundary` with custom, dark-mode-optimized error fallback interfaces to capture and isolate component-level exceptions.

---

## 📈 Production Scalability Vectors (System Design)

The architecture is designed to transition seamlessly to a distributed microservice setup:

### 1. Transition to Event-Driven Microservices
To prevent database bottlenecks, write actions are decoupled:
* **API Gateway:** Accepts `POST /api/posts`, registers it in the transactional DB, and immediately publishes a `PostCreated` event to a message broker (e.g., **Apache Kafka** or **AWS SQS**).
* **Worker Nodes:** Background consumers ingest the event streams and update Redis caches asynchronously.

### 2. Hybrid Fan-Out Model (Celebrity Scalability)
To handle the "celebrity posting to millions of followers" bottleneck, a hybrid approach is specified:
1. **Push Model (Standard Users):** For content creators with $< 25\text{k}$ followers, background workers iterate through their follower lists and push the new post ID into their Redis ZSETs (Fan-Out on Write).
2. **Pull Model (Celebrity Accounts):** For users with $\ge 25\text{k}$ followers, we bypass the push fan-out. Instead, when a user requests their feed, the system dynamically pulls the celebrity's recent posts from their global cache and merges them with the user's personal ZSET at runtime (Fan-Out on Read).
