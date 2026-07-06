import { PostWithAuthor } from "@/types";
import { FollowButton } from "./follow-button";

export function PostCard({ post }: { post: PostWithAuthor }) {
  // Simple time formatter relative or just local string
  const dateStr = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-900 dark:text-gray-100">{post.author.username}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">@{post.author.username}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">· {dateStr}</span>
            </div>
            {post.isFollowing !== undefined && (
              <FollowButton userId={post.userId} initialIsFollowing={post.isFollowing} />
            )}
          </div>
          <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
    </article>
  );
}
