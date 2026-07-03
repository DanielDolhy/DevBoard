import { Post } from "@prisma/client";

export interface PostWithAuthor extends Post {
  author: {
    username: string;
  };
  isFollowing?: boolean;
}
