"use client";

import { useOptimistic, useState } from "react";
import { useRouter } from "next/navigation";
import { PostWithAuthor } from "@/types";
import { PostCard } from "./post-card";
import { TweetBox } from "./tweet-box";

interface FeedClientProps {
  initialPosts: PostWithAuthor[];
}

export function FeedClient({ initialPosts }: FeedClientProps) {
  const router = useRouter();
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    initialPosts,
    (state, newPost: PostWithAuthor) => [newPost, ...state]
  );

  const handlePostSubmit = async (content: string) => {
    setErrorBanner(null);

    // Create a temporary optimistic post
    const tempPost: PostWithAuthor = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date(),
      userId: "temp-user",
      author: {
        username: "you", // Fallback for optimistic UI
      },
    };

    // Add it to UI instantly
    addOptimisticPost(tempPost);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Failed to post");
      }

      // Tell Next.js to re-fetch Server Components (including page.tsx)
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorBanner("Failed to publish post. Please try again.");
    }
  };

  return (
    <div className="flex flex-col">
      {errorBanner && (
        <div className="bg-red-50 border-b border-red-100 p-3 text-sm text-red-600 text-center">
          {errorBanner}
        </div>
      )}
      
      <TweetBox onSubmit={handlePostSubmit} />
      
      <div className="flex flex-col divide-y divide-gray-100">
        {optimisticPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
