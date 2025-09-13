import { z } from "zod";
import { OrgRole, OrgPlan } from "@prisma/client";

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Organization name contains invalid characters"
    ),
  plan: z.nativeEnum(OrgPlan).optional().default(OrgPlan.FREE),
});

export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(OrgRole),
});

export const updateMemberRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.nativeEnum(OrgRole),
});

export const updateOrgSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name must be less than 100 characters")
    .optional(),
  logo: z.string().url("Invalid logo URL").optional(),
  settings: z.record(z.any(), z.any()).optional(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

export const authEnvSchema = z.object({
  KINDE_CLIENT_ID: z.string().min(1, "KINDE_CLIENT_ID is required"),
  KINDE_CLIENT_SECRET: z.string().min(1, "KINDE_CLIENT_SECRET is required"),
  KINDE_ISSUER_URL: z.string().url("KINDE_ISSUER_URL must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
});

// Validate environment variables at startup
try {
  authEnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
}
