import { Post } from "@/generated/prisma/client";

export interface PostWithAuthor extends Post {
  author: {
    username: string;
  };
  isFollowing?: boolean;
}
