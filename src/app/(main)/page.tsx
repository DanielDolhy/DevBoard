import prisma from "@/lib/prisma";
import { FeedClient } from "@/components/feed/feed-client";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const posts = await prisma.post.findMany({
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
    take: 50,
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-gray-900">Home</h1>
      </header>

      {/* Feed Content via Client Component */}
      <FeedClient initialPosts={posts} />
    </div>
  );
}
