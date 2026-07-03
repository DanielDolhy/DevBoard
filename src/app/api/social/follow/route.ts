import { z } from "zod";
import { requireSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const FollowSchema = z.object({
  following_id: z.string().uuid("following_id must be valid UUID"),
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

  const parsed = FollowSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation Error", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { following_id } = parsed.data;

  if (following_id === session.userId) {
    return Response.json(
      { error: "Bad Request", message: "Cannot follow yourself" },
      { status: 400 }
    );
  }

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId: session.userId,
        followingId: following_id,
      },
    });

    return Response.json(follow, { status: 201 });
  } catch (err: unknown) {
    // Prisma unique constraint violation = already following
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return Response.json(
        { error: "Conflict", message: "Already following this user" },
        { status: 409 }
      );
    }
    // Foreign key violation = target user not found
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2003"
    ) {
      return Response.json(
        { error: "Not Found", message: "Target user does not exist" },
        { status: 404 }
      );
    }

    console.error("POST /api/social/follow failed:", err);
    return Response.json(
      { error: "Internal Server Error", message: "Failed to follow user" },
      { status: 500 }
    );
  }
}
