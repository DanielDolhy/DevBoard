"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TweetBoxProps {
  onSubmit: (content: string) => Promise<void>;
}

const MAX_CHARS = 280;

export function TweetBox({ onSubmit }: TweetBoxProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const isNearLimit = charsLeft <= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit || content.trim().length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-100 flex space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <textarea
            className="w-full resize-none outline-none text-xl placeholder:text-gray-500 bg-transparent min-h-[80px]"
            placeholder="What is happening?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
            <div className="text-sm font-medium">
              {content.length > 0 && (
                <span className={isOverLimit ? "text-red-500" : isNearLimit ? "text-orange-500" : "text-gray-400"}>
                  {charsLeft}
                </span>
              )}
            </div>
            <Button
              type="submit"
              disabled={content.trim().length === 0 || isOverLimit || isSubmitting}
              isLoading={isSubmitting}
              className="rounded-full px-5"
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
