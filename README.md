# DevBoard

DevBoard is a high-performance Next.js full-stack application demonstrating social graph mechanics, caching layers, and scalable timeline generation.

## Local Installation Guide

Start local environment with Docker Compose (PostgreSQL 16 + Redis 7):

```bash
# 1. Clone & install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env if needed, but defaults work for local dev

# 3. Spin up infrastructure
docker compose up -d

# 4. Push schema & seed mock data
npx prisma migrate deploy
npx tsx scripts/seed.ts

# 5. Start development server
npm run dev
```

Server runs on [http://localhost:3000](http://localhost:3000).

## Architectural Decisions

**PostgreSQL + Redis** chosen for local scope. Why?

- **PostgreSQL**: Strong relational integrity. Social graphs require strict constraints (e.g., unique compound indexes on `follower_id` and `following_id` to prevent duplicate follows). Postgres handles B-Tree indexing beautifully for `(user_id, created_at DESC)`, which powers our fallback timeline queries.
- **Redis**: In-memory speed. Reading timeline from DB requires expensive JOINs or massive `IN (...)` queries. Redis Sorted Sets (ZSET) store pre-computed timeline IDs sorted by timestamp (score). `ZREVRANGE` gives `O(log(N) + M)` pagination lookup — microseconds vs milliseconds.

## Production Scalability Vector

Local architecture works for thousands of users, but fails at "celebrity scale". If an account with 50M followers posts, pushing to 50M Redis ZSETs synchronously causes immense write amplification and latency.

### Transition to Microservices
In production, synchronous API mutations are decoupled:
- **API Gateway** accepts POST `/api/posts`, saves to DB, and publishes a `PostCreated` event to **Apache Kafka** or **AWS SQS**.
- **Worker Nodes** consume the event and distribute the cache updates asynchronously, freeing the main thread instantly.

### Hybrid Fan-Out Model
To solve the celebrity bottleneck, we implement a Hybrid Fan-Out:

1. **Push Model (Standard Users):** For users with < 25k followers, the worker iterates their followers and explicitly pushes the new Post ID into their Redis ZSETs (Fan-Out on Write). Fast read, slight write cost.
2. **Pull Model (Celebrity Accounts):** For users with > 25k followers, we skip the Push. Instead, when a user loads their timeline, the system checks if they follow any celebrities. It then *pulls* the celebrity's global posts cache and merges it with the user's personal ZSET at runtime (Fan-Out on Read).

This hybrid approach balances write amplification with read latency, keeping the system scalable under massive asynchronous load.
