import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { fullName } from "./userName";
import { rateLimit } from "./rate-limit";
import { RATE } from "./request-limits";
import { AuthErrorCode } from "./authErrors";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(AuthErrorCode.CREDENTIALS_REQUIRED);
        }

        const email = credentials.email.trim().toLowerCase();
        const limited = await rateLimit(
          `login:${email}`,
          RATE.login.limit,
          RATE.login.windowMs,
        );
        if (!limited.ok) {
          throw new Error(AuthErrorCode.RATE_LIMITED);
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            throw new Error(AuthErrorCode.INVALID_CREDENTIALS);
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error(AuthErrorCode.INVALID_CREDENTIALS);
          }

          if (user.status === 'PENDING') {
            throw new Error(AuthErrorCode.ACCOUNT_PENDING);
          }
          if (user.status === 'REJECTED') {
            throw new Error(AuthErrorCode.ACCOUNT_REJECTED);
          }

          return {
            id: user.id,
            email: user.email,
            name: fullName(user.firstName, user.lastName, user.name),
            role: user.role,
          };
        } catch (error) {
          if (
            error instanceof Error &&
            (Object.values(AuthErrorCode) as string[]).includes(error.message)
          ) {
            throw error
          }
          console.error("Erreur d'authentification:", error);
          throw new Error(AuthErrorCode.INVALID_CREDENTIALS);
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;
        token.roleCheckedAt = Date.now();
      }

      // Resynchronise le rôle depuis la DB (grant/revoke) — pas à chaque requête
      const checkedAt = typeof token.roleCheckedAt === 'number' ? token.roleCheckedAt : 0;
      const shouldRefreshRole =
        Boolean(token.email) &&
        (trigger === 'update' || !token.role || Date.now() - checkedAt > 5 * 60_000);

      if (shouldRefreshRole) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
        token.roleCheckedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === 'development',
};