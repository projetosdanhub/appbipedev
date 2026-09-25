import { authSecret, checkAuthRateLimit } from "./rate-limit";
import NextAuth, { NextAuthConfig, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@bipesend/db";
import * as argon2 from "argon2";
import { verifyTotp } from "./totp";

import { hashSecret } from "@bipesend/security";

export function getSurfaceAuthConfig(surface: "tenant" | "platform"): NextAuthConfig {
  const isSecure = process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "true";
  
  return {
    trustHost: true,
    secret: surface === "platform" ? platformSecret() : authSecret(),
    cookies: {
      sessionToken: {
        name: `${isSecure ? "__Secure-" : ""}bipesend.${surface}.session-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: isSecure,
        },
      },
      csrfToken: {
        name: `${isSecure ? "__Host-" : ""}bipesend.${surface}.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: isSecure,
        },
      },
      callbackUrl: {
        name: `${isSecure ? "__Secure-" : ""}bipesend.${surface}.callback-url`,
        options: {
          sameSite: "lax",
          path: "/",
          secure: isSecure,
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
          loginType: { label: "Login Type", type: "text" },
          rememberMe: { label: "Remember Me", type: "text" },
        },
        async authorize(credentials) {
          if (typeof credentials?.email !== "string") return null;
          const email = credentials.email.trim().toLowerCase();
          const loginType = (credentials?.loginType as string) || (credentials?.password ? "password" : "code");

          if (loginType === "password") {
            if (
              typeof credentials?.password !== "string" ||
              credentials.password.length > 128
            )
              return null;
            try {
              await checkAuthRateLimit(
                `login:${surface}`,
                email,
                10,
                15 * 60 * 1000,
              );
            } catch (err: any) {
              if (err?.message !== "AUTH_UNAVAILABLE" || process.env.NODE_ENV === "production") {
                throw err;
              }
            }

            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user || !user.password) return null;
            if (surface === "platform" && !user.isSuperadmin) return null;

            const isValid = await argon2.verify(
              user.password,
              credentials.password as string,
            );
            if (!isValid) return null;

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

            const rawCode = typeof credentials?.code === "string" ? credentials.code.trim().toUpperCase() : "";
            const hasValidCodeFormat = rawCode.length >= 6 && rawCode !== "UNDEFINED" && rawCode !== "NULL";

            if (!user.twoFactorEnabled) {
              if (surface === "platform") {
                // Superadmin precisa configurar 2FA obrigatoriamente
                if (!hasValidCodeFormat) {
                  throw new AuthErrorSetup2FA();
                }

                if (!user.twoFactorSecret) {
                  throw new AuthErrorSetup2FA();
                }

                const isCodeValid = verifyTotp({
                  token: rawCode,
                  secret: user.twoFactorSecret,
                });

                if (!isCodeValid) {
                  throw new AuthErrorInvalid2FA();
                }

                // Ativa 2FA no banco após validação inicial com sucesso
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    twoFactorEnabled: true,
                    emailVerified: new Date(),
                  },
                });
              }
            } else {
              // 2FA já ativado: exige código
              if (!hasValidCodeFormat) {
                throw new AuthError2FA();
              }

              // Check backup code first
              if (rawCode.length === 10 && user.twoFactorBackupCodes?.includes(rawCode)) {
                // Consume backup code
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    twoFactorBackupCodes: {
                      set: user.twoFactorBackupCodes.filter(c => c !== rawCode),
                    },
                  },
                });
              } else {
                // Check TOTP
                if (!user.twoFactorSecret) {
                  throw new AuthErrorSetup2FA();
                }
                const isCodeValid = verifyTotp({
                  token: rawCode,
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
              authVersion: user.authVersion,
            };
          }

          if (loginType === "code") {
            if (typeof credentials?.code !== "string" || !credentials.code.trim()) {
              return null;
            }
            const codeStr = (credentials.code as string).trim().toUpperCase();
            try {
              await checkAuthRateLimit(
                `login:code:${surface}`,
                email,
                10,
                15 * 60 * 1000,
              );
            } catch (err: any) {
              if (err?.message !== "AUTH_UNAVAILABLE" || process.env.NODE_ENV === "production") {
                throw err;
              }
            }

            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user) return null;
            if (surface === "platform" && !user.isSuperadmin) return null;

            let codeValid = false;

            // 1. Check email OTP verification token
            const identifier = `login-code:${email}`;
            const tokenHash = hashSecret(codeStr, authSecret(), identifier);

            const matchedOtp = await prisma.verificationToken.findFirst({
              where: {
                identifier,
                token: tokenHash,
                expires: { gt: new Date() },
              },
            });

            if (matchedOtp) {
              await prisma.verificationToken.deleteMany({
                where: { identifier },
              });
              codeValid = true;
            }

            // 2. Check 2FA backup code (10 chars uppercase hex)
            if (!codeValid && user.twoFactorEnabled && codeStr.length === 10 && user.twoFactorBackupCodes?.includes(codeStr)) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  twoFactorBackupCodes: {
                    set: user.twoFactorBackupCodes.filter(c => c !== codeStr),
                  },
                },
              });
              codeValid = true;
            }

            // 3. Check 2FA TOTP (6 digits from Authenticator App)
            if (!codeValid && user.twoFactorEnabled && user.twoFactorSecret && codeStr.length === 6) {
              const isTotpValid = verifyTotp({
                token: codeStr,
                secret: user.twoFactorSecret,
              });
              if (isTotpValid) {
                codeValid = true;
              }
            }

            if (!codeValid) {
              class AuthErrorInvalidCode extends CredentialsSignin {
                code = "INVALID_LOGIN_CODE";
                constructor() { super("INVALID_LOGIN_CODE"); }
              }
              throw new AuthErrorInvalidCode();
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              rememberMe: credentials.rememberMe === "true",
              authVersion: user.authVersion,
            };
          }

          return null;
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
            (surface === "platform" &&
              (!account.isSuperadmin || !account.twoFactorEnabled))
          )
            return null;
          const sessionId = await createSession(
            account.id,
            (user as any).rememberMe === true,
            surface
          );
          token.id = account.id;
          token.surface = surface;
          token.authVersion = account.authVersion;
          token.sessionId = sessionId;
        }
        if (typeof token.id !== "string" || token.surface !== surface || typeof token.sessionId !== "string")
          return null;

        const isSessionValid = await verifySession(token.sessionId as string, surface);
        if (!isSessionValid) return null;

        const current = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            authVersion: true,
            isSuperadmin: true,
            twoFactorEnabled: true,
            isManagedAccount: true,
          },
        });
        if (
          !current ||
          current.authVersion !== token.authVersion ||
          (surface === "platform" &&
            (!current.isSuperadmin || !current.twoFactorEnabled))
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
