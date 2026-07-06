import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations/auth";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Validation Error", details: z.flattenError(result.error) },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: "Unauthorized", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return Response.json(
        { error: "Unauthorized", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, username: user.username });
    await setSessionCookie(token);

    return Response.json(
      { message: "Login successful", user: { id: user.id, username: user.username } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      { error: "Internal Server Error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
