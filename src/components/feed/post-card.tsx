import { PostWithAuthor } from "@/types";

export function PostCard({ post }: { post: PostWithAuthor }) {
  // Simple time formatter relative or just local string
  const dateStr = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900">{post.author.username}</span>
            <span className="text-gray-500 text-sm">@{post.author.username}</span>
            <span className="text-gray-500 text-sm">· {dateStr}</span>
          </div>
          <p className="text-gray-800 mt-1 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
    </article>
  );
}
