import { z } from "zod";
import { requireSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
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

  const { limit, cursor } = parsed.data;
  const cacheKey = `user:timeline:${session.userId}`;
  
  let cursorDate: Date | undefined = undefined;
  if (cursor) {
    cursorDate = new Date(cursor);
  }

  try {
    // 1. Attempt to fetch from Redis ZSET (sorted by timestamp score)
    let cachedPostIds: string[] = [];
    if (!cursor) {
      cachedPostIds = await redis.zrevrange(cacheKey, 0, limit - 1);
    } else {
      // If cursor exists, fetch by score
      cachedPostIds = await redis.zrevrangebyscore(
        cacheKey,
        `(${cursorDate!.getTime()}`,
        "-inf",
        "LIMIT",
        0,
        limit
      );
    }

    type TimelinePost = {
      id: string;
      userId: string;
      content: string;
      createdAt: Date;
      author: { username: string };
    };
    
    let dbPosts: TimelinePost[] = [];
    let source = "cache";

    // Get users auth user follows for mapping `isFollowing` accurately
    const follows = await prisma.follow.findMany({
      where: { followerId: session.userId },
      select: { followingId: true },
    });
    const followingIds = new Set(follows.map((f) => f.followingId));

    if (cachedPostIds.length > 0) {
      // Hydrate from DB
      const posts = await prisma.post.findMany({
        where: { id: { in: cachedPostIds } },
        include: {
          author: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" }, // Re-sort to guarantee order after IN query
      });
      dbPosts = posts;
    } else {
      // 2. Cache-Miss Fallback: Query DB
      source = "db";
      
      const dbFollowingIds = Array.from(followingIds);
      dbFollowingIds.push(session.userId);

      dbPosts = await prisma.post.findMany({
        where: { userId: { in: dbFollowingIds } },
        include: {
          author: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        ...(cursorDate ? { cursor: { id: cursorDate.toISOString() } } : {}), // Wait, cursor in Prisma needs unique fields. It's better to use `createdAt < cursorDate`
      });

      // Refetch with reliable createdAt filtering
      dbPosts = await prisma.post.findMany({
        where: { 
          userId: { in: dbFollowingIds },
          ...(cursorDate ? { createdAt: { lt: cursorDate } } : {})
        },
        include: {
          author: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      // 3. Asynchronously populate Redis cache
      if (dbPosts.length > 0 && !cursor) { 
        void (async () => {
          try {
            const pipeline = redis.pipeline();
            pipeline.del(cacheKey);
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
    }

    // Map `isFollowing`
    const mappedPosts = dbPosts.map(post => ({
      ...post,
      isFollowing: post.userId === session.userId ? false : followingIds.has(post.userId)
    }));

    return Response.json({ data: mappedPosts, source }, { status: 200 });
  } catch (err) {
    console.error("GET /api/timeline failed:", err);
    return Response.json(
      { error: "Internal Server Error", message: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
