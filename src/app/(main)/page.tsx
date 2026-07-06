import prisma from "@/lib/prisma";
import { FeedClient } from "@/components/feed/feed-client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: session.userId },
    select: { followingId: true },
  });
  const followingIds = new Set(follows.map((f) => f.followingId));

  const dbFollowingIds = Array.from(followingIds);
  dbFollowingIds.push(session.userId);

  const posts = await prisma.post.findMany({
    where: { userId: { in: dbFollowingIds } },
    include: {
      author: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  const mappedPosts = posts.map(post => ({
    ...post,
    isFollowing: post.userId === session.userId ? undefined : followingIds.has(post.userId)
  }));

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Home</h1>
      </header>

      {/* Feed Content via Client Component */}
      <FeedClient initialPosts={mappedPosts} />
    </div>
  );
}
