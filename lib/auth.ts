import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { fullName } from "./userName";
import { rateLimit } from "./rate-limit";
import { RATE } from "./request-limits";

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
          throw new Error("Email et mot de passe requis");
        }

        const email = credentials.email.trim().toLowerCase();
        const limited = await rateLimit(
          `login:${email}`,
          RATE.login.limit,
          RATE.login.windowMs,
        );
        if (!limited.ok) {
          throw new Error("Trop de tentatives. Réessayez dans quelques minutes.");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            throw new Error("Email ou mot de passe incorrect");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Email ou mot de passe incorrect");
          }

          if (user.status === 'PENDING') {
            throw new Error("Votre compte est en attente de validation par l'administrateur.");
          }
          if (user.status === 'REJECTED') {
            throw new Error("Votre demande d'inscription a été refusée.");
          }

          return {
            id: user.id,
            email: user.email,
            name: fullName(user.firstName, user.lastName, user.name),
            role: user.role,
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          throw error;
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

      // Resynchronise le rôle depuis la DB pour que grant/revoke prenne effet sans reconnecter
      const checkedAt = typeof token.roleCheckedAt === 'number' ? token.roleCheckedAt : 0;
      const shouldRefreshRole =
        Boolean(token.email) &&
        (trigger === 'update' || !token.role || Date.now() - checkedAt > 30_000);

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