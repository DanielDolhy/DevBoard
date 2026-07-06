import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Validation Error", details: z.flattenError(result.error) },
        { status: 400 }
      );
    }

    const { email, name, password } = result.data;
    const username = name.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000); // basic username generation from name

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return Response.json(
        { error: "Conflict", message: "Email or username already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
      },
    });

    const token = signToken({ userId: user.id, username: user.username });
    await setSessionCookie(token);

    return Response.json(
      { message: "Registration successful", user: { id: user.id, username: user.username } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      { error: "Internal Server Error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
