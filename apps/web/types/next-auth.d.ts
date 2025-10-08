import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      image?: string;
      role: string;
      id: string;
      email: string;
      full_name: string;
      is_verified: boolean;
      last_login?: Date;
    };
  }

  interface User {
    id: string;
    email: string;
    full_name: string;
    profile_picture_url?: string;
    is_verified?: boolean;
    last_login?: Date;
    google_id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    is_verified?: boolean;
  }
}
