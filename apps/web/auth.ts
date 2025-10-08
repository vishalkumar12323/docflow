import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { AuthService } from "./services/auth-service";
import bcrypt from "bcryptjs";

const authService = new AuthService();
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credential",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // @ts-ignore
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        if (!email || !password) return null;

        const user = await authService.login({ email, password });
        console.log("user:: ", user);
        if (!user) return null;
        const isPasswordMatch = await bcrypt.compare(
          password,
          user.password_hash as string
        );
        if (isPasswordMatch)
          return {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            profilePictureUrl: user.profile_picture_url,
            isVerified: user.is_verified,
            lastLogin: user.last_login,
          };
        return {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          profilePictureUrl: user.profile_picture_url,
          isVerified: user.is_verified,
          lastLogin: user.last_login,
        };
      },
    }),
    Google({
      name: "google",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      name: "github",
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        const existingUser = await authService.userById(user.id);
        if (existingUser) {
          await authService.updateLoginTimeStamp(existingUser.id);
          return true;
        }
      } catch (error) {
        console.log("signIn callback:: ", error);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.profile_picture_url = user?.profile_picture_url;
        token.last_login = user.last_login as Date;
        token.is_verified = user.is_verified as boolean;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.userId = token.id as string;
        session.user.profile_picture_url = token.profile_picture_url as string;
        session.user.last_login = token.last_login as Date;
        session.user.is_verified = token.is_verified as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET as string,
});
