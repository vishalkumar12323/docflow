import NextAuth, { DefaultSession, Session, User } from "next-auth";

declare module "next-auth" {
  interface Session extends Session {
    user: {
      id: string;
      email: string;
      full_name: string;
      profile_picture_url?: string;
      is_verified: boolean;
      last_login?: Date;
    } & DefaultSession["user"];
    userId?: string;
  }

  interface User extends User {
    id: string;
    email: string;
    full_name: string;
    profile_picture_url?: string;
    last_login?: Date;
    is_verified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    full_name?: string;
    profile_picture_url?: string;
    last_login?: Date;
    is_verified?: boolean;
  }
}
