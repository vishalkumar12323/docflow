"use server";
import z from "zod";
import { AuthService } from "@/services/auth-service";

const authService = new AuthService();
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
  const user = await authService.userByEmail(email);

  if (user) {
    return { message: "USER_EXIST", error: "Email is already registered." };
  }

  // Create user
  try {
    const data = {
      email,
      password,
      full_name: fullName,
      google_id: "",
      profile_picture_url: "",
      auth_provider: "email",
    };
    await authService.register(data);
    return { message: "success", error: null };
  } catch (error) {
    return {
      message: "Unknow",
      error: "Failed to create user. Please try again.",
    };
  }
}
