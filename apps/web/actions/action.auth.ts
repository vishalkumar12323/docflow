"use server";
import { prisma } from "@/database/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function signUp(formData: any) {
  const { fullName, email, password } = formData;

  // Basic validation
  if (!fullName || !email || !password) {
    return { error: "All fields are required." };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email is already registered." };
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
    // Redirect to login page
    redirect("/login");
  } catch (error) {
    return { error: "Failed to create user. Please try again." };
  }
}
