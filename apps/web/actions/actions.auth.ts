"use server";
import { prisma } from "@/database/prisma";
import bcrypt from "bcryptjs";
import z from "zod";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export async function signUp(formData: any) {
  const fullName = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  const validation = signupSchema.safeParse({
    name: fullName,
    email,
    password,
  });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { message: "USER_EXIST", error: "Email is already registered." };
  }

  // Hash password (using bcryptjs)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  try {
    await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
      },
    });
    return { message: "success", error: null };
  } catch (error) {
    return {
      message: "Unknow",
      error: "Failed to create user. Please try again.",
    };
  }
}
