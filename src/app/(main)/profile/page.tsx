import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
      </header>

      {/* Profile Info */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {user.username}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {user.email}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Joined {joinedDate}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex space-x-6 mt-4">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900 dark:text-gray-100">{user._count.following}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Following</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900 dark:text-gray-100">{user._count.followers}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Followers</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900 dark:text-gray-100">{user._count.posts}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Posts</span>
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
        {await renderUserPosts(user.id)}
      </div>
    </div>
  );
}

async function renderUserPosts(userId: string) {
  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: { username: true },
      },
    },
  });

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No posts yet</p>
        <p className="text-sm mt-1">Your posts will show up here.</p>
      </div>
    );
  }

  return posts.map((post) => {
    const dateStr = new Date(post.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return (
      <article
        key={post.id}
        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-900 dark:text-gray-100">{post.author.username}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">@{post.author.username}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">· {dateStr}</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      </article>
    );
  });
}
