import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { FollowButton } from "@/components/feed/follow-button";

export async function WhoToFollow() {
  const session = await getSession();

  if (!session) return null;

  // Find users that the current user is NOT already following (excluding self)
  const currentFollows = await prisma.follow.findMany({
    where: { followerId: session.userId },
    select: { followingId: true },
  });
  const followingIds = currentFollows.map((f) => f.followingId);

  const suggestions = await prisma.user.findMany({
    where: {
      id: {
        notIn: [...followingIds, session.userId],
      },
    },
    select: {
      id: true,
      username: true,
    },
    take: 3,
  });

  if (suggestions.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Who to follow</h2>
      <div className="space-y-4">
        {suggestions.map((user) => {
          const avatarLetter = user.username.charAt(0).toUpperCase();

          return (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0">
                  {avatarLetter}
                </div>

                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{user.username}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">@{user.username}</p>
                </div>
              </div>

              <FollowButton userId={user.id} initialIsFollowing={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
