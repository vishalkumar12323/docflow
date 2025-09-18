import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      image?: string;
      role: string;
      id: string;
      email: string;
      name: string;
      isVerified: boolean;
      isActive?: boolean;
      lastLoginAt?: Date;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    emailVerified?: boolean;
    isActive?: boolean;
    lastLoginAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    emailVerified?: boolean;
  }
}
