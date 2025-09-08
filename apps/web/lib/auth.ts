import { NextAuthConfig } from "next-auth";
import KindeProvider from "next-auth/providers/kinde";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    KindeProvider({
      clientId: process.env.KINDE_CLIENT_ID!,
      clientSecret: process.env.KINDE_CLIENT_SECRET!,
      issuer: process.env.KINDE_ISSUER_URL!,
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "kinde") {
        try {
          const existingUser = await prisma.user.findUnique({ where: {} });
        } catch (error) {}
      }
      return true;
    },
  },
};
