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
    <div className="glass-card rounded-2xl p-5 my-4 mx-2 sm:mx-4 shadow-sm border border-gray-100 dark:border-gray-800 flex space-x-4">
      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0">
        &lt;/&gt;
      </div>

      <div className="flex-1">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <textarea
            className="w-full resize-none outline-none text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent min-h-[90px] text-gray-900 dark:text-gray-100"
            placeholder="Share what is on your mind..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm font-medium">
              {content.length > 0 && (
                <span
                  className={
                    isOverLimit
                      ? "text-red-500 font-bold"
                      : isNearLimit
                      ? "text-orange-500 font-semibold"
                      : "text-gray-400 dark:text-gray-500"
                  }
                >
                  {charsLeft} characters remaining
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={content.trim().length === 0 || isOverLimit || isSubmitting}
              isLoading={isSubmitting}
              className="rounded-full px-6"
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
