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
        if (!user) return null;
        const isPasswordMatch = await bcrypt.compare(
          password,
          user.password_hash as string
        );
        if (isPasswordMatch)
          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            profile_picture_url: user.profile_picture_url,
            is_verified: user.is_verified,
            last_login: user.last_login,
          };
        return null;
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
    async signIn({ user }) {
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
        token.full_name = user.full_name;
        token.email = user.email;
        token.profile_picture_url = user?.profile_picture_url;
        token.last_login = user.last_login as Date;
        token.is_verified = user.is_verified as boolean;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          full_name: token.full_name as string,
          email: token.email as string,
          profile_picture_url: token.profile_picture_url as string,
          last_login: token.last_login as Date,
          is_verified: token.is_verified as boolean,
          // emailVerified: null,
          // image: token.profile_picture_url as string,
        };
        session.userId = token.id as string;
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
