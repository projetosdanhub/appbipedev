import { authSecret, checkAuthRateLimit } from "./rate-limit";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@bipesend/db";
import * as argon2 from "argon2";
import { authenticator } from "otplib";

export function createSurfaceAuth(surface: "tenant" | "platform") {
  return NextAuth(() => ({
    secret: surface === "platform" ? platformSecret() : authSecret(),
    cookies: {
      sessionToken: {
        name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}bipesend.${surface}.session-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
      csrfToken: {
        name: `bipesend.${surface}.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
      callbackUrl: {
        name: `bipesend.${surface}.callback-url`,
        options: {
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // Padrão 7 dias, mas sobrescrevemos em auth.ts
    pages: {
      signIn: "/login",
      newUser: "/register",
    },
    providers: [
      ...(surface === "tenant" &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET
        ? [
            Google({
              clientId: process.env.AUTH_GOOGLE_ID,
              clientSecret: process.env.AUTH_GOOGLE_SECRET,
              allowDangerousEmailAccountLinking: false,
            }),
          ]
        : []),
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
          code: { label: "Code", type: "text" },
          rememberMe: { label: "Remember Me", type: "text" },
        },
        async authorize(credentials) {
          if (
            typeof credentials?.email !== "string" ||
            typeof credentials?.password !== "string" ||
            credentials.password.length > 128
          )
            return null;
          const email = credentials.email.trim().toLowerCase();
          await checkAuthRateLimit(
            `login:${surface}`,
            email,
            10,
            15 * 60 * 1000,
          );

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;
          if (
            surface === "platform"
              ? !user.isSuperadmin || !user.twoFactorEnabled
              : user.isSuperadmin
          )
            return null;

          const isValid = await argon2.verify(
            user.password,
            credentials.password as string,
          );
          if (!isValid) return null;

          if (user.twoFactorEnabled) {
            if (!credentials.code) {
              throw new Error("2FA_REQUIRED");
            }
            if (!user.twoFactorSecret) {
              throw new Error("2FA_SETUP_REQUIRED");
            }
            const isCodeValid = authenticator.verify({
              token: credentials.code as string,
              secret: user.twoFactorSecret,
            });
            if (!isCodeValid) {
              throw new Error("INVALID_2FA_CODE");
            }
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            rememberMe: credentials.rememberMe === "true",
            authVersion: user.updatedAt.getTime(),
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          const account = await prisma.user.findUnique({
            where: { id: user.id },
          });
          if (
            !account ||
            (surface === "platform"
              ? !account.isSuperadmin || !account.twoFactorEnabled
              : account.isSuperadmin)
          )
            return null;
          token.id = account.id;
          token.surface = surface;
          token.authVersion = account.updatedAt.getTime();
        }
        if (typeof token.id !== "string" || token.surface !== surface)
          return null;
        const current = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            updatedAt: true,
            isSuperadmin: true,
            twoFactorEnabled: true,
          },
        });
        if (
          !current ||
          current.updatedAt.getTime() !== token.authVersion ||
          (surface === "platform"
            ? !current.isSuperadmin || !current.twoFactorEnabled
            : current.isSuperadmin)
        )
          return null;
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  }));
}
function platformSecret(): string {
  const secret = process.env.SUPERADMIN_AUTH_SECRET;
  if (
    !secret ||
    secret.length < 32 ||
    secret === process.env.AUTH_SECRET ||
    secret.includes("replace_with")
  )
    throw new Error("AUTH_UNAVAILABLE");
  return secret;
}
