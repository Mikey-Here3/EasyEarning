import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        if (user.status === "BANNED") {
          throw new Error("Your account has been banned.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          refCode: user.refCode,
          status: user.status,
          penaltyAmount: user.penaltyAmount,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.refCode = (user as any).refCode;
        token.status = (user as any).status;
        token.penaltyAmount = (user as any).penaltyAmount;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).refCode = token.refCode as string;
        (session.user as any).status = token.status as string;
        (session.user as any).penaltyAmount = token.penaltyAmount as number;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
