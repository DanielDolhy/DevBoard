import { PostWithAuthor } from "@/types";
import { FollowButton } from "./follow-button";

export function PostCard({ post }: { post: PostWithAuthor }) {
  // Simple time formatter relative or just local string
  const dateStr = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const avatarLetter = post.author.username.charAt(0).toUpperCase();

  return (
    <article className="p-5 my-4 mx-2 sm:mx-4 glass-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
      <div className="flex space-x-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-base shadow-inner flex-shrink-0">
          {avatarLetter}
        </div>

        <div className="flex-1 min-w-0">
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

          <p className="text-gray-800 dark:text-gray-200 mt-2 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
    </article>
  );
}
