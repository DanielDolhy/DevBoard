import { z } from "zod";
import { requireSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content required")
    .max(280, "Post content max 280 characters"),
});

export async function POST(request: Request) {
  const session = await requireSession();

  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Bad Request", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = CreatePostSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation Error", issues: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.create({
      data: {
        userId: session.userId,
        content: parsed.data.content,
      },
    });

    return Response.json(post, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts failed:", err);

    return Response.json(
      { error: "Internal Server Error", message: "Failed to create post" },
      { status: 500 }
    );
  }
}
