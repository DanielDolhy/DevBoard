import { z } from "zod";
import { requireSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const UnfollowSchema = z.object({
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

  const parsed = UnfollowSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation Error", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { following_id } = parsed.data;

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.userId,
          followingId: following_id,
        },
      },
    });

    return Response.json({ unfollowed: following_id }, { status: 200 });
  } catch (err: unknown) {
    // P2025 = record not found (not following)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return Response.json(
        { error: "Not Found", message: "Follow relationship does not exist" },
        { status: 404 }
      );
    }

    console.error("POST /api/social/unfollow failed:", err);
    return Response.json(
      { error: "Internal Server Error", message: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}
