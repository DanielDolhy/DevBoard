"use client";

import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ userId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);

  const toggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;
    
    // Optimistic update
    const previousState = isFollowing;
    const newState = !previousState;
    setIsFollowing(newState);
    setIsPending(true);

    const endpoint = newState ? "/api/social/follow" : "/api/social/unfollow";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: userId }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle follow");
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setIsFollowing(previousState);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={isPending}
      className={`px-3 py-1 text-sm font-semibold rounded-full border transition-colors ${
        isFollowing
          ? "border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          : "bg-black text-white border-black hover:bg-gray-800"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
