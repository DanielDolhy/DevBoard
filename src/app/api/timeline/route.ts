import { z } from "zod";
import { requireSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const CACHE_TTL = 300; // 5 minutes

export async function GET(request: Request) {
  const session = await requireSession();
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  
  if (!parsed.success) {
    return Response.json(
      { error: "Validation Error", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { limit, offset } = parsed.data;
  const cacheKey = `user:timeline:${session.userId}`;

  try {
    // 1. Attempt to fetch from Redis ZSET (sorted by timestamp score)
    // ZREVRANGEBYSCORE gives newest first. We use simple pagination via start/stop index on ZREVRANGE for offset/limit.
    const cachedPostIds = await redis.zrevrange(cacheKey, offset, offset + limit - 1);

    if (cachedPostIds.length > 0) {
      // Hydrate from DB (or could hydrate from another Redis hash in a real app)
      const posts = await prisma.post.findMany({
        where: { id: { in: cachedPostIds } },
        orderBy: { createdAt: "desc" }, // Re-sort to guarantee order after IN query
      });
      
      // Add cache hit header for debug
      return Response.json({ data: posts, source: "cache" }, { status: 200 });
    }

    // 2. Cache-Miss Fallback: Query DB
    // Get users auth user follows
    const follows = await prisma.follow.findMany({
      where: { followerId: session.userId },
      select: { followingId: true },
    });
    
    const followingIds = follows.map(f => f.followingId);
    
    // Add auth user's own posts to timeline
    followingIds.push(session.userId);

    // Query posts
    const dbPosts = await prisma.post.findMany({
      where: { userId: { in: followingIds } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // 3. Asynchronously populate Redis cache
    if (dbPosts.length > 0 && offset === 0) { // Only populate cache on base fetch to avoid caching deep offsets weirdly
      // Fire and forget
      void (async () => {
        try {
          const pipeline = redis.pipeline();
          
          // Clear existing cache for simplicity (or could ZADD incrementally)
          pipeline.del(cacheKey);
          
          // Add posts to ZSET with timestamp as score
          for (const post of dbPosts) {
            pipeline.zadd(cacheKey, post.createdAt.getTime(), post.id);
          }
          
          pipeline.expire(cacheKey, CACHE_TTL);
          await pipeline.exec();
        } catch (e) {
          console.error("Redis async populate failed:", e);
        }
      })();
    }

    return Response.json({ data: dbPosts, source: "db" }, { status: 200 });
  } catch (err) {
    console.error("GET /api/timeline failed:", err);
    return Response.json(
      { error: "Internal Server Error", message: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
