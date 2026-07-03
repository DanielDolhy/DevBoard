"use client";

import { useOptimistic, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PostWithAuthor } from "@/types";
import { PostCard } from "./post-card";
import { TweetBox } from "./tweet-box";
import { Loader2 } from "lucide-react";

interface FeedClientProps {
  initialPosts: PostWithAuthor[];
}

export function FeedClient({ initialPosts }: FeedClientProps) {
  const router = useRouter();
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Pagination state
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialPosts.length === 20); // Sync with backend limit
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Sync initialPosts if server re-fetches (e.g., after router.refresh)
  const [prevInitial, setPrevInitial] = useState(initialPosts);
  if (initialPosts !== prevInitial) {
    setPrevInitial(initialPosts);
    const existingIds = new Set(posts.map(p => p.id));
    const newUnique = initialPosts.filter(p => !existingIds.has(p.id));
    if (newUnique.length > 0) {
      setPosts([...newUnique, ...posts]);
    }
  }

  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (state, newPost: PostWithAuthor) => [newPost, ...state]
  );

  const fetchMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore || posts.length === 0) return;

    setIsLoadingMore(true);
    try {
      const oldestPost = posts[posts.length - 1];
      const cursor = new Date(oldestPost.createdAt).toISOString();
      
      const res = await fetch(`/api/timeline?cursor=${encodeURIComponent(cursor)}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch more posts");
      
      const { data } = await res.json() as { data: PostWithAuthor[] };
      
      if (data.length < 20) {
        setHasMore(false);
      }

      setPosts((prev) => {
        // Enforce unique ID checks
        const existingIds = new Set(prev.map(p => p.id));
        const newUniquePosts = data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newUniquePosts];
      });
    } catch (err) {
      console.error(err);
      setErrorBanner("Failed to load more posts.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, posts]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [fetchMorePosts]);

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
      isFollowing: false,
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
      
      <div className="flex flex-col divide-y divide-gray-100 pb-10">
        {optimisticPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {/* Infinite Scroll trigger */}
        <div ref={observerRef} className="h-10 flex items-center justify-center pt-4">
          {isLoadingMore && <Loader2 className="w-6 h-6 animate-spin text-gray-400" />}
          {!hasMore && posts.length > 0 && (
            <p className="text-gray-500 text-sm">You have caught up!</p>
          )}
        </div>
      </div>
    </div>
  );
}
