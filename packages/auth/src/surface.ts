import { authSecret, checkAuthRateLimit } from "./rate-limit";
import NextAuth, { NextAuthConfig, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@bipesend/db";
import * as argon2 from "argon2";
import { authenticator } from "otplib";

export function getSurfaceAuthConfig(surface: "tenant" | "platform"): NextAuthConfig {
  return {
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
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // Sessão física controla TTL
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
            class AuthError2FA extends CredentialsSignin {
              code = "2FA_REQUIRED";
              constructor() { super("2FA_REQUIRED"); }
            }
            class AuthErrorSetup2FA extends CredentialsSignin {
              code = "2FA_SETUP_REQUIRED";
              constructor() { super("2FA_SETUP_REQUIRED"); }
            }
            class AuthErrorInvalid2FA extends CredentialsSignin {
              code = "INVALID_2FA_CODE";
              constructor() { super("INVALID_2FA_CODE"); }
            }

            if (!credentials.code) {
              throw new AuthError2FA();
            }

            const codeStr = credentials.code as string;
            
            // Check backup code first
            if (codeStr.length === 10 && user.twoFactorBackupCodes?.includes(codeStr)) {
              // Consume backup code
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  twoFactorBackupCodes: {
                    set: user.twoFactorBackupCodes.filter(c => c !== codeStr)
                  }
                }
              });
            } else {
              // Check TOTP
              if (!user.twoFactorSecret) {
                throw new AuthErrorSetup2FA();
              }
              const isCodeValid = authenticator.verify({
                token: codeStr,
                secret: user.twoFactorSecret,
              });
              if (!isCodeValid) {
                throw new AuthErrorInvalid2FA();
              }
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
        const { createSession, verifySession } = await import("./session");
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
          const sessionId = await createSession(
            account.id,
            (user as any).rememberMe === true,
            surface
          );
          token.id = account.id;
          token.surface = surface;
          token.authVersion = account.updatedAt.getTime();
          token.sessionId = sessionId;
        }
        if (typeof token.id !== "string" || token.surface !== surface || typeof token.sessionId !== "string")
          return null;

        const isSessionValid = await verifySession(token.sessionId as string, surface);
        if (!isSessionValid) return null;

        const current = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            updatedAt: true,
            isSuperadmin: true,
            twoFactorEnabled: true,
            isManagedAccount: true,
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
        
        token.isManagedAccount = current.isManagedAccount;
        
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as string;
          (session as any).sessionId = token.sessionId;
          (session.user as any).isManagedAccount = token.isManagedAccount === true;
          
          if (token.impersonatedBy) {
            (session as any).impersonatedBy = token.impersonatedBy;
          }
        }
        return session;
      },
    },
    events: {
      async signOut(message) {
        if ("token" in message && message.token?.sessionId) {
          const { revokeSession } = await import("./session");
          await revokeSession(message.token.sessionId as string, surface);
        }
      },
    },
  };
}

export function createSurfaceAuth(surface: "tenant" | "platform") {
  return NextAuth(() => getSurfaceAuthConfig(surface));
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
