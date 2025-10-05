import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      image?: string;
      role: string;
      id: string;
      email: string;
      fullName: string;
      isVerified: boolean;
      lastLogin?: Date;
    };
  }

  interface User {
    id: string;
    email: string;
    fullName: string;
    profilePictureUrl?: string;
    isVerified?: boolean;
    lastLogin?: Date;
    googleId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    emailVerified?: boolean;
  }
}
