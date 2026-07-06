import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/feed/post-card";
import { Calendar, Mail, FileText } from "lucide-react";

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

  const avatarLetter = user.username.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30 dark:bg-gray-950/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/85 dark:bg-gray-950/85 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
      </header>

      {/* Profile Info Header */}
      <div className="p-6 bg-white dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          {/* Large Gradient Avatar */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg ring-4 ring-white dark:ring-gray-850 flex-shrink-0">
            {avatarLetter}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {user.username}
            </h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">@{user.username}</p>
            
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user.email}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Joined {joinedDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 max-w-md mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 mx-auto sm:mx-0 w-full">
          <div className="flex flex-col items-center sm:items-start p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{user._count.following}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mt-0.5">Following</span>
          </div>

          <div className="flex flex-col items-center sm:items-start p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{user._count.followers}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mt-0.5">Followers</span>
          </div>

          <div className="flex flex-col items-center sm:items-start p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{user._count.posts}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mt-0.5">Posts</span>
          </div>
        </div>
      </div>

      {/* User's Posts Section */}
      <div className="py-4">
        <h3 className="px-6 text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>My Timeline</span>
        </h3>

        <div className="mt-2 divide-y divide-transparent">
          {await renderUserPosts(user.id)}
        </div>
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
      <div className="p-12 text-center text-gray-500 dark:text-gray-400 glass-card rounded-2xl m-4">
        <p className="text-lg font-semibold">No posts yet</p>
        <p className="text-sm text-gray-400 mt-1">Your posts will show up here once you publish them.</p>
      </div>
    );
  }

  return posts.map((post) => (
    <PostCard key={post.id} post={post} />
  ));
}
